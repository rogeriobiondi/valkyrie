from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, insert, select, text

from valkyrie.util.database import SessionLocal, filter, datasource, engine
from valkyrie.models import Filter
import logging
import sqlalchemy

router = APIRouter()

@router.post("/filters")
async def create_filter(o: Filter):
    with SessionLocal() as session: 
        exists = session.query(filter).filter(filter.columns.name == o.name).one_or_none()
        if exists != None:
            update_stmt = filter.update().where(filter.columns.name == o.name).values(datasource=o.datasource, dimension=o.dimension, order=o.order)
            session.execute(update_stmt)
            session.commit()
            return o
        else:
            insert_stmt = insert(filter).values(name=o.name, datasource=o.datasource, dimension=o.dimension, order=o.order)
            session.execute(insert_stmt)
            session.commit()
            return o

@router.put("/filters/{name}")
async def update_filter(name: str, o: Filter):
    with SessionLocal() as session:
        exists = session.query
        exists = session.query(filter
        ).filter(filter.columns.name == name).one_or_none()
        if exists == None:
            raise HTTPException(status_code=404, detail=f"Filter '{name}' not found")
        update_stmt = filter.update().where(filter.columns.name == name).values(datasource=o.datasource, dimension=o.dimension, order=o.order)
        session.execute(update_stmt)
        session.commit()
        return o

@router.get("/filters/{name}")
async def get_filter(name: str):
    with SessionLocal() as session:
        o = session.query(filter).filter(filter.columns.name == name).one()._asdict()
        logging.debug(o)
        return o

@router.delete("/filters/{name}")
async def delete_filter(name: str):
    with SessionLocal() as session:
        try:
            o = session.query(filter).filter(filter.columns.name == name).one()._asdict()
            logging.debug(o)
            delete_stmt = filter.delete().where(filter.columns.name == name)
            session.execute(delete_stmt)
            session.commit()
            return {"result": "success"}
        except sqlalchemy.exc.NoResultFound:
            raise HTTPException(status_code=404, detail=f"Filter '{name}' not found")

@router.get("/filters")
async def get_filters():
    with SessionLocal() as session:
        o = session.query(filter).all()
        ret = []
        for i in o:
            ret.append(i._asdict())
        return ret

@router.get("/filters/data/{name}")
async def domains(name: str):
    with SessionLocal() as session:
        o = session.query(filter).filter(filter.columns.name == name).one()._asdict()
        ds = session.query(datasource).filter(datasource.columns.name == o['datasource']).one()._asdict()
    with engine.connect() as conn:
        sql = f"select distinct " + o["dimension"] + " as values from " + ds["query"]["measurement"] + " order by values " + o["order"]
        sql = text(sql)
        rs = conn.execute(sql)
        ret = []
        for row in rs:
            ret.append(row[0])
        return {"dimension": o["dimension"], "data": ret}