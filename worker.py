# Consume messages from kafka (confluent kafka library)
from confluent_kafka import Consumer
from confluent_kafka import KafkaException
from valkyrie.database import engine, Session, SessionLocal, execute_sql
import socket
import time
from sqlalchemy.exc import SQLAlchemyError
from valkyrie.kafka import consumer


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
        print(line)
        line = line.replace("\\ ", "%20")
        measurement = line[0: line.index(",")]
        tagset = line[line.index(",") + 1: line.index(" ")]
        fieldset = line[line.index(" ") + 1: ].split(" ")[0]
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
        print(error)
        return None

### Ingest Data
def data_ingestion(session: Session, data: dict) -> None:
    """
    Ingest the data into the database.

    Args:
        session: The database session.
        data: The data to be ingested.
    """
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
    print(sql)
    execute_sql(session, sql)
    return sql

if __name__ == '__main__':
    # consumer = Consumer(config)
    consumer.subscribe(['radar-insights'], on_assign=assignment_callback)
    try:
        while True:
            event = consumer.poll(1.0)
            if event is None:
                continue
            if event.error():
                raise KafkaException(event.error())
            else:
                val = event.value().decode('utf8')
                partition = event.partition()
                print(f'Received: {val} from partition {partition}    ')
                lines = val.split("\n")
                with SessionLocal() as session:
                    try:
                        for line in lines:
                            components = process_line(line)
                            data_ingestion(session, components)
                        session.commit()
                    except SQLAlchemyError as e:
                        session.rollback()
                        error = str(e.__dict__['orig'])
                        print(error)
                    else:
                        session.commit()
                # consumer.commit(event)
    except KeyboardInterrupt:
        print('Canceled by user.')
    finally:
        consumer.close()
