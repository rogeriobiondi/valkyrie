import os

from fastapi import APIRouter, Request
from valkyrie.util.kafka import producer
from valkyrie.util.config import Config
from valkyrie.util.protocol import validate_metric

config = Config()

router = APIRouter()

@router.post("/bulk")
async def bulk(request: Request):
    data = await request.body()
    data_str = data.decode('utf-8').strip("\n").strip(" ")
    lines = data_str.split("\n")
    problems = []

    for i, line in enumerate(lines, start=1):
        valid, errors = validate_metric(line)
        if not valid:
            problems.append({
                "line": i,
                "errors": errors
            })

    if problems:
        return {"problems": problems}

    producer.produce(config.KAFKA_TOPIC,
                     key=str(data_str.__hash__()),
                     value=data_str.rstrip())
    
    producer.flush()

    return {
        "lines": len(lines)
    }
