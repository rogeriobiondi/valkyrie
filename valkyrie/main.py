import os
import logging

import pyfiglet
import uvicorn

from fastapi import FastAPI

from starlette.middleware.cors import CORSMiddleware

from valkyrie.routes import filters, \
    datasources, \
    measurements, \
    charts, \
    dashboards, \
    bulk, \
    graph

from valkyrie.util import config

config = config.Config()

logging.basicConfig(level=config.LOGLEVEL)

app = FastAPI()
print(pyfiglet.figlet_format("Server"))
print("version: ", config.VERSION, "\n")
print("config: ", config.__dict__, "\n")

# add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Range", "X-Total-Count", "Content-Type", "Access-Control-Allow-Origin"]
)

app.include_router(filters.router)
app.include_router(datasources.router)
app.include_router(measurements.router)
app.include_router(charts.router)
app.include_router(dashboards.router)
app.include_router(bulk.router)
app.include_router(graph.router)

# Health check endpoint
@app.get("/health")
async def health():
    return {"status": "ok"}

# Version endpoint
@app.get("/version")
async def version():
    return {
        "version": config.VERSION
    }

# Ping endpoint
@app.get("/ping")
async def ping():
    return {"ping": "pong"}

# Run the server
if __name__ == "__main__":
    uvicorn.run(app, host=config.HOST, port=config.PORT)