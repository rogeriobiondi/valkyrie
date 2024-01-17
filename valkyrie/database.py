from sqlalchemy import create_engine
from sqlalchemy import MetaData
from sqlalchemy.orm.session import Session
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Table, Column, String, Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

DATABASE_URL = "timescaledb://postgresql:secret@localhost/postgresql"
engine = create_engine(DATABASE_URL)
metadata = MetaData(schema="public")
metadata.bind = engine
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) 
Base = declarative_base()

datasource = Table(
    "datasources",
    metadata,
    Column("name", String, primary_key=True, index=True),
    Column("query", JSONB)
)

dashboard = Table(
    "dashboards",
    metadata,
    Column("name", String, primary_key=True, index=True),
    Column("datasource", String),
    Column("categories", Integer),
    Column("config", JSONB)
)

def execute_dml(sql: str):
    """
    Executes a Data Manipulation Language (DML) SQL statement.

    Args:
        sql (str): The SQL statement to execute.

    Raises:
        SQLAlchemyError: If an error occurs during execution.

    """
    with engine.begin() as conn:
        try:
            conn.exec_driver_sql(sql)
        except exc.SQLAlchemyError as e:
            print(type(e))

def execute_sql(session, sql: str):
    """
    Executes a SQL statement within a session.

    Args:
        session (Session): The SQLAlchemy session to use.
        sql (str): The SQL statement to execute.

    Raises:
        SQLAlchemyError: If an error occurs during execution.

    """
    try:
        statement = text(sql)
        session.execute(statement)
    except SQLAlchemyError as e:
        raise e

# Initialize database

metadata.create_all(engine)

with engine.connect() as conn:
    # Configure tablefunc extension
    conn.execute(text("CREATE EXTENSION IF NOT EXISTS tablefunc;"))  
    # Skipscan index for field_name column
    # conn.execute(text('CREATE INDEX "skipscan_field_name_idx" on metrics (line_hash, field_name, timestamp desc);'))
