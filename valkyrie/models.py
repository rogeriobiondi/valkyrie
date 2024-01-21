from pydantic import BaseModel
from typing import Optional,  List, Literal

class FilterOp(BaseModel):
    field: str
    op: str
    value: str

class OrderOp(BaseModel):
    field: str
    order: Literal["asc", "desc"]

class SelectField(BaseModel):
    expression: str
    alias: Optional[str] = None

class Query(BaseModel):
    measurement: str
    fields: list[SelectField]
    filters: list[FilterOp] | None = None
    group: Optional[list[str]] = None,
    order: Optional[list[OrderOp]] = None,
    window: str

class DataSource(BaseModel):
    name: str
    query: Query

class Chart(BaseModel):
    name: str
    datasource: str
    categories: int
    config: Optional[dict] = { "width": 500, "height": 400 }

class DashboardConfig(BaseModel):
    title: str
    filters: list[str] | None = None
    charts: list[str] | None = None

class Dashboard(BaseModel):
    name: str
    config: DashboardConfig

class Filter(BaseModel):
    name: str    
    datasource: str
    dimension: str
    order: str | None = "asc"

class Attribute(BaseModel):
    name: str
    type: Literal["varchar", "float", "integer", "bool"]

class Measurement(BaseModel):
    name: str
    dimensions: list[Attribute]
    fields: list[Attribute]
