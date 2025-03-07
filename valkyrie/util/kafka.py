import os
import socket
import logging

from confluent_kafka import Producer, Consumer
from valkyrie.util.config import Config

config = Config()
logging.basicConfig(level=config.LOGLEVEL)

# Get bootstrap.servers from environment variable. Default is localhost:29092
kafka_config = {
    'bootstrap.servers': config.KAFKA_BOOTSTRAP_SERVERS,
    'client.id': socket.gethostname()
}

producer_config = kafka_config.copy()
consumer_config = kafka_config.copy()
consumer_config['group.id'] = config.KAFKA_GROUP_ID
consumer_config['session.timeout.ms'] = config.KAFKA_SESSION_TIMEOUT_MS
consumer_config['enable.auto.commit'] = config.KAFKA_ENABLE_AUTO_COMMIT
consumer_config['auto.offset.reset'] = config.KAFKA_AUTO_OFFSET_RESET

producer = Producer(producer_config)
consumer = Consumer(consumer_config)