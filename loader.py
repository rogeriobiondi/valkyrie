import os
import time
import logging

from confluent_kafka import Consumer
from confluent_kafka import KafkaException
from valkyrie.database import engine, Session, SessionLocal, execute_sql
from sqlalchemy.exc import SQLAlchemyError
from valkyrie.kafka import consumer

# Read logging level from environment variable
logging.basicConfig(level=os.environ.get("LOGLEVEL", "DEBUG"))

def assignment_callback(consumer, partitions):
    """
    Callback function called when partitions are assigned to the consumer.

    Args:
        consumer: The Kafka consumer instance.
        partitions: The list of partitions assigned to the consumer.
    """
    for p in partitions:
        print(f'Assigned to {p.topic}, partition {p.partition}\n')

###
###     DECODE DATA
###
def process_line(line: str) -> dict:
    """
    Process a line of data and decode it into a dictionary.

    Args:
        line: The line of data to be processed.

    Returns:
        A dictionary containing the decoded data.
    """
    try:
        line = line.replace("\\ ", "%20")
        logging.debug(f"Processing line: {line}")
        measurement = line[0: line.index(",")]
        logging.debug(f"Measurement: {measurement}")
        tagset = line[line.index(",") + 1: line.index(" ")]
        logging.debug(f"Tagset: {tagset}")
        fieldset = line[line.index(" ") + 1: ].split(" ")[0]
        logging.debug(f"Fieldset: {fieldset}")
        try:
            timestamp = line[line.index(" ") + 1: ].split(" ")[1]
        except IndexError:
            timestamp = time.time()
        # decode tagset
        dimdict = []
        components_tagset = tagset.split(",")
        for component in components_tagset:
            component = component.split("=")
            dimdict.append({ "key": component[0], "value": component[1].replace("%20", " ") })
        # decode fieldset
        fieldsetdict = []
        components_fieldset = fieldset.split(",")
        for component in components_fieldset:
            component = component.split("=")
            if len(component) < 2:
                # Throw a ValueError Exception
                raise ValueError(f"Invalid fieldset: {fieldset}")
            logging.debug(f"loader.py: {component}")
            logging.debug(f"loader.py: {component[0]}")
            logging.debug(f"loader.py: {component[1]}")
            fieldsetdict.append({ "key": component[0], "value": component[1] })      
        data = {
            "measurement": measurement,
            "line_hash": line.__hash__(),
            "dimensions": dimdict,
            "fields": fieldsetdict,
            "timestamp": int(timestamp)
        }
        return data
    except ValueError as error:
        logging.error(error)
        return None

### Ingest Data
def data_ingestion(session: Session, data: dict) -> None:
    """
    Ingest the data into the database.

    Args:
        session: The database session.
        data: The data to be ingested.
    """
    if data is None or not 'measurement' in data:
        raise ValueError("Invalid data")
        return None
    sql = f"insert into {data['measurement']} ( "
    for dim in data['dimensions']:
        sql += f"{dim['key']}, "
    for field in data['fields']:
        sql += f"{field['key']}, "
    sql += "timestamp ) values ( "
    for dim in data['dimensions']:
        if not dim["value"].isnumeric():
            sql += f"'{dim['value']}', "
        else:
            sql += f"{dim['value']}, "
    for field in data['fields']:
        if not field["value"].isnumeric():
            sql += f"'{field['value']}', "
        else:
            sql += f"{field['value']}, "
    sql += f" to_timestamp({data['timestamp']}) );"
    logging.debug(sql)
    execute_sql(session, sql)
    return sql
    
if __name__ == '__main__':
    # consumer = Consumer(config)
    consumer.subscribe(['valkyrie'], on_assign=assignment_callback)
    try:
        while True:
            event = consumer.poll(1.0)
            if event is None:
                continue
            if event.error():
                logging.error(event)
                raise KafkaException(event.error())
            else:
                val = event.value().decode('utf8')
                partition = event.partition()
                logging.debug(f'Received from partition {partition}: {val}')
                lines = val.split("\n")
                logging.debug(f"lines: {lines}")
                with SessionLocal() as session:
                    try:
                        for line in lines:
                            components = process_line(line)
                            logging.debug(components)
                            data_ingestion(session, components)
                        session.commit()
                    except SQLAlchemyError as e:
                        session.rollback()
                        error = str(e.__dict__['orig'])
                        logging.error(error)
                        print(error)
                    else:
                        session.commit()
                # consumer.commit(event)
    except KeyboardInterrupt:
        print('Canceled by user.')
    finally:
        consumer.close()
