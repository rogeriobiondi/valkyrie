from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, insert, select, text

from valkyrie.util.database import SessionLocal, chart
from valkyrie.models import Chart
import logging
import sqlalchemy

router = APIRouter()

@router.post("/charts")
async def post_chart(o: Chart):
    with SessionLocal() as session: 
        chart_exists = session.query(chart).filter(chart.columns.name == o.name).one_or_none()
        if chart_exists != None:
            update_stmt = chart.update().where(chart.columns.name == o.name).values(datasource=o.datasource, categories=o.categories, config=o.config)
            session.execute(update_stmt)
            session.commit()
            return o
        else:
            insert_stmt = insert(chart).values(name=o.name, datasource=o.datasource, categories=o.categories, config=o.config)        
            session.execute(insert_stmt)
            session.commit()
            return o

@router.get("/charts/{name}")
async def get_chart(name: str):
    with SessionLocal() as session:
        o = session.query(chart).filter(chart.columns.name == name).one()._asdict()
        logging.debug(o)
        return o
    
@router.delete("/charts/{name}")
async def delete_chart(name: str):
    with SessionLocal() as session:
        try:
            o = session.query(chart).filter(chart.columns.name == name).one()._asdict()
            logging.debug(o)
            delete_stmt = chart.delete().where(chart.columns.name == name)
            session.execute(delete_stmt)
            session.commit()
            return {"result": "success"}
        except sqlalchemy.exc.NoResultFound:
            raise HTTPException(status_code=404, detail=f"Chart '{name}' not found")
        
@router.get("/charts")
async def get_charts():
    with SessionLocal() as session:
        o = session.query(chart).all()
        ret = []
        for i in o:
            ret.append(i._asdict())
        return ret

@router.get("/charts/{name}")
async def get_chart(name: str):
    with SessionLocal() as session:
        o = session.query(chart).filter(chart.columns.name == name).one()._asdict()
        logging.debug(o)
        return o

@router.delete("/charts/{name}")
async def delete_chart(name: str):
    with SessionLocal() as session:
        try:
            o = session.query(chart).filter(chart.columns.name == name).one()._asdict()
            logging.debug(o)
            delete_stmt = chart.delete().where(chart.columns.name == name)
            session.execute(delete_stmt)
            session.commit()
            return {"result": "success"}
        except sqlalchemy.exc.NoResultFound:
            raise HTTPException(status_code=404, detail=f"Chart '{name}' not found")