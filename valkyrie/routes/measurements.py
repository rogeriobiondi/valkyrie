import logging

from fastapi import APIRouter
from valkyrie.util.database import SessionLocal, measurement, execute_dml
from valkyrie.util.config import Config
from valkyrie.models import Measurement
from sqlalchemy import insert
from fastapi import HTTPException
from fastapi.responses import JSONResponse

config = Config()
logging.basicConfig(level=config.LOGLEVEL)

router = APIRouter()

@router.delete("/measurements/{name}")
def delete_measurement(name: str):
    sql = f"DROP TABLE IF EXISTS {name};"
    execute_dml(sql)
    with SessionLocal() as session:        
        delete_stmt = measurement.delete().where(measurement.columns.name == name)
        session.execute(delete_stmt)
        session.commit()
        return {"result": "success"}

@router.post("/measurements")
def create_measurement(o: Measurement):
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
    with SessionLocal() as session:        
        # Check if the object is being created correctly.
        # If it already exists, return a message with code HTTP 409 - Conflict
        # If it is created successfully,
        # return the object back to the client and HTTP Code 201
        result = session.execute(measurement.select().where(measurement.columns.name == o.name))
        if result.fetchone():
            raise HTTPException(status_code=409, detail="Measurement already exists")
        insert_stmt = insert(measurement).values(name=o.name, config=o.model_dump())
        session.execute(insert_stmt)
        session.commit()
        return JSONResponse(status_code=201, content=o.model_dump())
    
@router.get("/measurements")
def get_measurements():
    with SessionLocal() as session:
        result = session.execute(measurement.select())
        ret = []
        for row in result:
            ret.append(dict(row[1]))
        return ret
    
@router.get("/measurements/{name}")
def get_measurement(name: str):
    with SessionLocal() as session:
        result = session.execute(measurement.select().where(measurement.columns.name == name))
        data = result.fetchone()
        if data:
            return dict(data[1])
        else:
            # return fastapi http 404 error
            raise HTTPException(status_code=404, detail="Measurement not found")

            
@router.get("/measurements/{name}/fields")
def get_measurement_fields(name: str):
    with SessionLocal() as session:
        result = session.execute(measurement.select().where(measurement.columns.name == name))
        for row in result:
            return row.config['fields']
        return []
