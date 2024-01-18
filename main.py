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

from valkyrie.database import engine, SessionLocal, datasource, dashboard, execute_dml
from valkyrie.models import Query, DataSource, Dashboard, Config, Attribute, FilterOp, OrderOp, SelectField
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


@app.delete("/measurement/{measurement}")
def delete(measurement: str):
    sql = f"DROP TABLE IF EXISTS {measurement};"
    execute_dml(sql) 
    return {
        "result": "sucess"
    }

@app.post("/measurement")
def config(config: Config):
    sql = f"CREATE TABLE IF NOT EXISTS {config.measurement} ( "
    for dim in config.dimensions:
        sql += f"{dim.name} {dim.type}, "
    for field in config.fields:
        sql += f"{field.name} {field.type}, "
    sql += "timestamp timestamp );\n"
    sql += f"SELECT create_hypertable('{config.measurement}', 'timestamp');\n"
    for dim in config.dimensions:
        sql += f"CREATE INDEX IF NOT EXISTS {config.measurement}_dim_{dim.name}_idx ON {config.measurement} ({dim.name});\n"
    execute_dml(sql)
    return {
        "result": "sucess"
    }

@app.get("/domains/{dashboard_name}/{domain}")
async def domains(dashboard_name: str, domain: str):
    with SessionLocal() as session:
        dash = session\
                .query(dashboard)\
                .filter(dashboard.columns.name == dashboard_name)\
                .one()._asdict()
        ds = session.query(datasource).filter(datasource.columns.name == dash['datasource']).one()._asdict()        
    print(ds)
    # query dashboard table    
    with engine.connect() as conn:
        sql = f"select distinct " + domain + " as values from " + ds["query"]["measurement"] + " order by values"
        sql = text(sql)
        rs = conn.execute(sql)
        ret = []
        for row in rs:
            ret.append(row[0])
        return ret

@app.get("/graph/{name}")
async def graph(name: str, request: Request): 
    params = dict(request.query_params)
    logging.debug(params)
    # query dashboard table    
    with SessionLocal() as session:
        # get dashboard data
        dash = session.query(dashboard).filter(dashboard.columns.name == name).one()._asdict()
        ds = session.query(datasource).filter(datasource.columns.name == dash['datasource']).one()._asdict()        
        logging.debug(ds)
        pyds = DataSource(**ds)
        data = await get_pivot(pyds.query, request)
    return {
        "dashboard": dash,
        "datasource": ds,
        "data": data
    }

###
### Bulk Load API
###
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

###
### Data API
###
@app.post("/datasource")
async def get_datasource(ds: DataSource, request: Request):
    logging.debug(ds)
    # testar o datasource
    dados = await get_pivot(query = ds.query, request = request)
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

@app.post("/dashboard")
async def get_dashboard(dash: Dashboard):
    with SessionLocal() as session: 
        # check if the dashboard already exists
        dash_exists = session.query(dashboard).filter(dashboard.columns.name == dash.name).one_or_none()
        if dash_exists != None:
            # update dashboard
            update_stmt = dashboard.update().where(dashboard.columns.name == dash.name).values(
                datasource = dash.datasource, 
                categories = dash.categories,
                config = dash.config
            )
            session.execute(update_stmt)
            session.commit()
            return dash
        else:
            insert_stmt = insert(dashboard).values(
                name = dash.name, 
                datasource = dash.datasource, 
                categories = dash.categories,
                config = dash.config
            )        
            session.execute(insert_stmt)
            session.commit()
            return dash

@app.post("/pivot")
async def get_pivot(query: Query, request: Request):
    data = await get_data(query, request)
    logging.debug("pivot", data)
    # if no data found, return http 404 not found    
    if len(data) == 0:
        # return http 404
        raise HTTPException(status_code = 404, detail = "No data found")
    # pivot data
    pivot_data = [list(r) for r in zip(*data[::-1])]
    return_data = []
    for idx, serie in enumerate(query.fields):
        return_data.append({
            "name": serie.alias,
            "data": pivot_data[idx]
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
