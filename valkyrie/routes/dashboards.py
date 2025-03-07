from fastapi import APIRouter, HTTPException
import sqlalchemy
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, insert, select, text

from valkyrie.util.database import SessionLocal, dashboard
from valkyrie.models import Dashboard
import logging

router = APIRouter()

@router.get("/dashboards/{name}")
async def get_dashboard(name: str):
    with SessionLocal() as session:
        o = session.query(dashboard).filter(dashboard.columns.name == name).one()._asdict()
        logging.debug(o)
        return o

@router.post("/dashboards")
async def create_dashboard(o: Dashboard):
    with SessionLocal() as session: 
        exists = session.query(dashboard).filter(dashboard.columns.name == o.name).one_or_none()
        if exists != None:
            update_stmt = dashboard.update().where(dashboard.columns.name == o.name).values(config=o.config.dict())
            session.execute(update_stmt)
            session.commit()
            return o
        else:
            insert_stmt = insert(dashboard).values(name=o.name, config=o.config.dict())
            session.execute(insert_stmt)
            session.commit()
            return o

@router.get("/dashboards")
async def get_dashboards():
    with SessionLocal() as session:
        o = session.query(dashboard).all()
        ret = []
        for i in o:
            ret.append(i._asdict())
        return ret

@router.delete("/dashboards/{name}")
async def delete_dashboard(name: str):
    with SessionLocal() as session:
        try:
            o = session.query(dashboard).filter(dashboard.columns.name == name).one()._asdict()
            delete_stmt = dashboard.delete().where(dashboard.columns.name == name)
            session.execute(delete_stmt)
            session.commit()
            return {"result": "success"}
        except sqlalchemy.exc.NoResultFound:
            raise HTTPException(status_code=404, detail=f"Dashboard '{name}' not found")
