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

class Dashboard(BaseModel):
    name: str
    datasource: str
    categories: int
    filters: list[str] | None = None
    config: Optional[dict] = { "width": 500, "height": 400 }
    
class Attribute(BaseModel):
    name: str
    type: Literal["varchar", "float", "integer", "bool"]

class Config(BaseModel):
    measurement: str
    dimensions: list[Attribute]
    fields: list[Attribute]
