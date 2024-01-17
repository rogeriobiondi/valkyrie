from confluent_kafka import Producer, Consumer
import socket
import os

# Get bootstrap.servers from environment variable. Default is localhost:29092
config = {
    'bootstrap.servers': os.environ.get('BOOTSTRAP_SERVERS', 'localhost:29092'),
    'client.id': socket.gethostname()
}

producer_config = config.copy()
consumer_config = config.copy()
consumer_config['group.id'] = "radar-insights"
consumer_config['session.timeout.ms'] = 6000
consumer_config['enable.auto.commit'] = True
consumer_config['auto.offset.reset'] = 'earliest'

producer = Producer(producer_config)
consumer = Consumer(consumer_config)