import json
import pytest
import logging
import requests

from valkyrie.util.config import Config
from valkyrie.models import Measurement, Dimension, Field

config = Config()
logging.basicConfig(level=config.LOGLEVEL)

def test_create_measurement():
    """
    The server should return a 201 status code
    if the measurement is created successfully.
    """
    # create a measurement
    measurement = Measurement(
        
        name="test_measurement",
        dimensions=[
            Dimension(name="dimension1", type="integer"),
            Dimension(name="dimension2", type="varchar")
        ],
        fields=[
            Field(name="field1", type="integer"),
            Field(name="field2", type="integer")
        ]
    )
    model_dump = measurement.model_dump()
    response = requests.post(
        f"http://{config.HOST}:{config.PORT}/measurements",
        json=model_dump)
    logging.debug("response: ", response.json())
    # check the status code
    assert response.status_code == 201
    assert response.json()["name"] == "test_measurement"
    assert len(response.json()["dimensions"]) == 2
    assert response.json()["dimensions"][0]["name"] == "dimension1"
    assert response.json()["dimensions"][0]["type"] == "integer"
    assert len(response.json()["fields"]) == 2
    assert response.json()["fields"][0]["name"] == "field1"
    assert response.json()["fields"][0]["type"] == "integer"

def test_recreate_measurement():
    """
    If the measurement already exists, 
    the server should return a 409 status code.
    """
    # create a measurement
    measurement = Measurement(
        name="test_measurement",
        dimensions=[
            Dimension(name="dimension1", type="integer"),
            Dimension(name="dimension2", type="varchar")
        ],
        fields=[
            Field(name="field1", type="integer"),
            Field(name="field2", type="integer")
        ]
    )
    model_dump = measurement.model_dump()
    response = requests.post(
        f"http://{config.HOST}:{config.PORT}/measurements",
        json=model_dump)
    # check the status code
    assert response.status_code == 409
    assert response.json() == {"detail": "Measurement already exists"}

def test_get_measurements():
    """
    The server should return a 200 status code 
    if the measurements are retrieved successfully.
    """
    # call the endpoint using requests library - TestClient is broken...
    response = requests.get(f"http://{config.HOST}:{config.PORT}/measurements")
    # check the status code
    assert response.status_code == 200
    assert len(response.json()) > 0


def test_delete_measurement():
    """
    Test if the delete method is working fine
    """
    # delete the measurement
    response = requests.delete(f"http://{config.HOST}:{config.PORT}/measurements/test_measurement")
    # check the status code
    assert response.status_code == 200
    assert response.json() == {"result": "success"}