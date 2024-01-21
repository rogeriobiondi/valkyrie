from types import NoneType
from fastapi import FastAPI, Request, Body
from fastapi.responses import HTMLResponse
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Table, Column, Integer, Float, String, MetaData, DateTime, insert, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm.session import Session

from datetime import datetime
import sqlalchemy
import logging
import os
from sqlalchemy import exc
from sqlalchemy.dialects.postgresql import JSONB 

from valkyrie.database import engine, SessionLocal, measurement, datasource, chart, dashboard, filter, execute_dml
from valkyrie.models import Query, DataSource, Chart, Measurement, Dashboard, Filter
from valkyrie.kafka import producer
from valkyrie.ws import html, broadcast

from fastapi import HTTPException
from fastapi import WebSocket

LOG_LEVEL = os.environ.get("LOG_LEVEL", "DEBUG")
logging.basicConfig(level=LOG_LEVEL)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
    expose_headers = [ "Content-Range", "X-Total-Count", "Content-Type", "Access-Control-Allow-Origin" ]
)

# TODO implementar mensagens push para atualização dos clientes
# @app.get("/")
# async def get():
#     return HTMLResponse(html) 

# @app.websocket("/ws/{client_id}")
# async def websocket_endpoint(websocket: WebSocket, client_id: int):
#     await broadcast(websocket, client_id)


@app.delete("/measurements/{name}")
def delete_measurement(name: str):
    # Remove a tabela de métrica
    sql = f"DROP TABLE IF EXISTS {name};"
    execute_dml(sql)
    # Remove os dados da tabela measurement
    with SessionLocal() as session:        
        delete_stmt = measurement.delete().where(measurement.columns.name == name)
        session.execute(delete_stmt)
        session.commit()
        return {
            "result": "sucess"
        }

@app.post("/measurements")
def create_measurement(o: Measurement):
    # Cria a tabela de métrica
    sql = f"CREATE TABLE IF NOT EXISTS {o.name} ( "
    for dim in o.dimensions:
        sql += f"{dim.name} {dim.type}, "
    for field in o.fields:
        sql += f"{field.name} {field.type}, "
    sql += "timestamp timestamp );\n"
    sql += f"SELECT create_hypertable('{o.name}', 'timestamp');\n"
    for dim in o.dimensions:
        sql += f"CREATE INDEX IF NOT EXISTS {o.name}_dim_{dim.name}_idx ON {o.name} ({dim.name});\n"
    execute_dml(sql)
    # Guarda dados da métrica
    with SessionLocal() as session:        
        insert_stmt = insert(measurement)\
            .values(name = o.name, config = o.dict())
        session.execute(insert_stmt)
        session.commit()
        return o
    
@app.post("/bulk")
async def bulk(request: Request):
    # convert fastapi request.body() to string
    data = await request.body()
    data_str = data.decode('utf-8')        
    producer.produce('radar-insights', 
                     key=str(data_str.__hash__), 
                     value=data_str.rstrip())
    producer.flush()
    lines = data_str.split("\n")
    return {
        "lines": len(lines)
    }

@app.post("/datasources")
async def create_datasource(ds: DataSource, request: Request):
    logging.debug(ds)
    # testar o datasource
    dados = await pivot_data(query = ds.query, request = request)
    if dados:
        # check if the datasource already exists
        with SessionLocal() as session:        
            ds_exists = session.query(datasource).filter(datasource.columns.name == ds.name).one_or_none()
            if ds_exists != None:
                # update datasource
                update_stmt = datasource.update().where(datasource.columns.name == ds.name).values(query = ds.query.dict())
                session.execute(update_stmt)
                session.commit()            
                return dados
            else:
                insert_stmt = insert(datasource).values(name = ds.name, query = ds.query.dict())
                session.execute(insert_stmt)
                session.commit()
                return dados
            
@app.get("/dashboards/{name}")
async def get_dashboard(name: str):
    with SessionLocal() as session:
        # get dashboard data
        o = session.query(dashboard).filter(dashboard.columns.name == name).one()._asdict()
        logging.debug(o)
        return o
    
@app.post("/filters")
async def create_filter(o: Filter):
    with SessionLocal() as session: 
        # check if the filter already exists
        exists = session.query(filter)\
                        .filter(filter.columns.name == o.name)\
                        .one_or_none()
        if exists != None:
            # update filter
            update_stmt = filter.update()\
                .where(filter.columns.name == o.name)\
                .values(datasource = o.datasource, dimension = o.dimension, order = o.order)
            session.execute(update_stmt)
            session.commit()
            return o
        else:
            insert_stmt = insert(filter)\
                    .values(name = o.name, datasource = o.datasource, dimension = o.dimension, order = o.order)
            session.execute(insert_stmt)
            session.commit()
            return o

@app.get("/filters/{name}")
async def get_filter(name: str):
    with SessionLocal() as session:
        # get filter data
        o = session.query(filter)\
            .filter(filter.columns.name == name)\
            .one()\
            ._asdict()
        logging.debug(o)
        return o
    
@app.delete("/filters/{name}")
async def delete_filter(name: str):
    with SessionLocal() as session:
        # get filter data
        try:
            o = session.query(filter)\
                .filter(filter.columns.name == name)\
                .one()\
                ._asdict()
            logging.debug(o)
            delete_stmt = filter.delete().where(filter.columns.name == name)
            session.execute(delete_stmt)
            session.commit()
            # return 200 OK
            return {
                "result": "sucess"
            }
        except sqlalchemy.exc.NoResultFound:
            raise HTTPException(status_code = 404, detail = f"Filter '{name}' not found")
        
@app.get("/filters/data/{name}")
async def domains(name: str):
    with SessionLocal() as session:
        o = session\
                .query(filter)\
                .filter(filter.columns.name == name)\
                .one()._asdict()
        ds = session.query(datasource).filter(datasource.columns.name == o['datasource']).one()._asdict()
    # query dashboard table    
    with engine.connect() as conn:
        sql = f"select distinct " + o["dimension"] + " as values from " + ds["query"]["measurement"] + " order by values " + o["order"]
        sql = text(sql)
        rs = conn.execute(sql)
        ret = []
        for row in rs:
            ret.append(row[0])

        return {
            "dimension": o["dimension"],
            "data": ret
        }

@app.post("/charts")
async def post_chart(o: Chart):
    with SessionLocal() as session: 
        # check if the dashboard already exists
        chart_exists = session.query(chart).filter(chart.columns.name == o.name).one_or_none()
        if chart_exists != None:
            # update dashboard
            update_stmt = chart.update().where(chart.columns.name == o.name).values(
                datasource = o.datasource, 
                categories = o.categories,
                config = o.config
            )
            session.execute(update_stmt)
            session.commit()
            return o
        else:
            insert_stmt = insert(chart).values(
                name = o.name, 
                datasource = o.datasource, 
                categories = o.categories,
                config = o.config
            )        
            session.execute(insert_stmt)
            session.commit()
            return o

@app.get("/charts/{name}")
async def get_chart(name: str):
    with SessionLocal() as session:
        # get dashboard data
        o = session\
                .query(chart)\
                .filter(chart.columns.name == name)\
                .one()\
                ._asdict()
        logging.debug(o)
        return o
    
@app.delete("/charts/{name}")
async def delete_chart(name: str):
    with SessionLocal() as session:
        # get dashboard data
        try:
            o = session\
                    .query(chart)\
                    .filter(chart.columns.name == name)\
                    .one()\
                    ._asdict()
            logging.debug(o)
            delete_stmt = chart.delete().where(chart.columns.name == name)
            session.execute(delete_stmt)
            session.commit()
            # return 200 OK
            return {
                "result": "sucess"
            }
        except sqlalchemy.exc.NoResultFound:
            raise HTTPException(status_code = 404, detail = f"Chart '{name}' not found")

@app.post("/dashboards")
async def create_dashboard(o: Dashboard):
    with SessionLocal() as session: 
        # check if the dashboard already exists
        exists = session.query(dashboard)\
                                    .filter(dashboard.columns.name == o.name)\
                                    .one_or_none()
        if exists != None:
            # update dashboard
            update_stmt = dashboard.update()\
                .where(dashboard.columns.name == o.name)\
                .values(config = o.config.dict())
            session.execute(update_stmt)
            session.commit()
            return o
        else:
            insert_stmt = insert(dashboard)\
                                .values(name = o.name, config = o.config.dict())
            session.execute(insert_stmt)
            session.commit()
            return o
    





@app.get("/graph/{name}")
async def graph(name: str, request: Request): 
    params = dict(request.query_params)
    logging.debug(params)
    
    # query dashboard table    
    with SessionLocal() as session:
        # get dashboard data
        o = session.query(chart)\
            .filter(chart.columns.name == name)\
            .one()\
            ._asdict()
        ds = session.query(datasource)\
            .filter(datasource.columns.name == o['datasource'])\
            .one()\
            ._asdict()        
        logging.debug(ds)
        pyds = DataSource(**ds)
        pivoted_data = await pivot_data(pyds.query, request)
    return {
        "chart": o,
        "datasource": ds,
        "data": pivoted_data
    }

@app.post("/pivot")
async def pivot_data(query: Query, request: Request):
    data = await get_data(query, request)
    # if no data found, return http 404 not found    
    if len(data) == 0:
        # return http 404
        raise HTTPException(status_code = 404, detail = "No data found")
    # pivot data
    pivoted_data = [list(r) for r in zip(*data[::-1])]
    return_data = []
    for idx, serie in enumerate(query.fields):
        return_data.append({
            "name": serie.alias,
            "data": pivoted_data[idx]
        })
    return return_data

@app.post("/data")
async def get_data(query: Query, request: Request):
    # logging.debug(query)
    params = dict(request.query_params)
    logging.debug(params)
    logging.debug(type(params))
    with engine.connect() as conn:
        sql = "select "
        for field in query.fields:
            if field.alias == None:
                sql += f"{field.expression},"
            sql += f"{field.expression} as {field.alias},"
        sql = sql[:-1]
        sql += f" from {query.measurement} where 1=1 "
        if query.filters:
            for filter in query.filters:
                # Todos os parâmetros de filtro devem ser precedidos por $
                if filter.value[0] == '$':                    
                    par = filter.value[1:]
                    # Parâmetros não informados são ignorados na query
                    if par not in params:
                        continue
                    filter.value = params[filter.value[1:]]
                if filter.op == 'eq':                    
                    sql += f"and {filter.field} = '{filter.value}' "
                elif filter.op == 'gt':
                    sql += f"and {filter.field} > {filter.value} "
                elif filter.op == 'lt':
                    sql += f"and {filter.field} < {filter.value} "
                else:
                    sql += f"and {filter.field} {filter.op} {filter.value} "                
        if query.window:
            sql += f"and timestamp > now() - interval '{query.window}' "
        if query.group != (None,):
            sql += f" group by "
            for group in query.group:
                sql += f"{group},"
            sql = sql[:-1]
        if query.order != (None,):
            sql += f" order by "
            for order in query.order:
                sql += f"{order.field} {order.order},"
            sql = sql[:-1]
        # logging.debug(sql)
        sql = text(sql)
        logging.debug(sql)
        rs = conn.execute(sql)
        ret = []
        for row in rs:
            linha = []
            for i in range(len(row)):
                attribute = row[i]
                if type(row[i]) == datetime:
                    attribute = row[i].isoformat()
                linha.append(attribute)            
            ret.append(linha)
        return ret
