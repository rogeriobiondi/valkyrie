from fastapi import APIRouter, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, insert, select, text

from valkyrie.routes.graph import pivot_data
from valkyrie.util.database import SessionLocal, datasource
from valkyrie.models import DataSource
import logging
import sqlalchemy

router = APIRouter()

@router.post("/datasources")
async def create_datasource(ds: DataSource, request: Request):
    logging.debug(ds)
    dados = await pivot_data(query=ds.query, request=request)
    if dados:
        with SessionLocal() as session:        
            ds_exists = session.query(datasource).filter(datasource.columns.name == ds.name).one_or_none()
            if ds_exists != None:
                update_stmt = datasource.update().where(datasource.columns.name == ds.name).values(query=ds.query.dict())
                session.execute(update_stmt)
                session.commit()            
                return dados
            else:
                insert_stmt = insert(datasource).values(name=ds.name, query=ds.query.dict())
                session.execute(insert_stmt)
                session.commit()
                return dados

@router.get("/datasources")
async def get_datasources():
    with SessionLocal() as session:
        o = session.query(datasource).all()
        logging.debug(o)
        ret = []
        for item in o:
            ret.append(item._asdict())
        return ret

@router.get("/datasources/{name}")
async def get_datasource(name: str):
    with SessionLocal() as session:
        o = session.query(datasource).filter(datasource.columns.name == name).one()._asdict()
        logging.debug(o)
        return o
    
@router.delete("/datasources/{name}")
async def delete_datasource(name: str):
    with SessionLocal() as session:
        try:
            o = session.query(datasource).filter(datasource.columns.name == name).one()._asdict()
            logging.debug(o)
            delete_stmt = datasource.delete().where(datasource.columns.name == name)
            session.execute(delete_stmt)
            session.commit()
            return {"result": "success"}
        except sqlalchemy.exc.NoResultFound:
            raise HTTPException(status_code=404, detail=f"Datasource '{name}' not found")