import logging

from datetime import datetime
from fastapi import APIRouter, HTTPException, Request, Body
from sqlalchemy import create_engine, insert, select, text

from valkyrie.util.config import Config
from valkyrie.util.database import engine, SessionLocal, measurement, datasource, chart, dashboard, filter, execute_dml
from valkyrie.models import Query, DataSource, Chart, Measurement, Dashboard, Filter
from valkyrie.models import Filter

config = Config()

logging.basicConfig(level=config.LOGLEVEL)

router = APIRouter()

@router.get("/graph/{name}")
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

@router.post("/pivot")
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

@router.post("/data")
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
