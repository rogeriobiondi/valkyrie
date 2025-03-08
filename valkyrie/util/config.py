import os
from valkyrie.util.singleton import singleton

@singleton
class Config:

    # Construtor
    # Load from environment variables if they exist
    def __init__(self):
        self.VERSION = '0.0.1 alpha'
        self.HOST = os.getenv('HOST', 'localhost')
        self.PORT = os.getenv('PORT', 8000)
        self.LOGLEVEL = os.getenv('LOGLEVEL', 'DEBUG')
        self.KAFKA_BOOTSTRAP_SERVERS = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:29092')
        self.KAFKA_GROUP_ID = os.getenv('KAFKA_GROUP_ID', 'valkyrie')
        self.KAFKA_SESSION_TIMEOUT_MS = os.getenv('KAFKA_SESSION_TIMEOUT_MS', '6000')
        self.KAFKA_ENABLE_AUTO_COMMIT = os.getenv('KAFKA_ENABLE_AUTO_COMMIT', 'True').lower() == 'true'
        self.KAFKA_AUTO_OFFSET_RESET = os.getenv('KAFKA_AUTO_OFFSET_RESET', 'earliest')
        self.KAFKA_TOPIC = os.getenv('KAFKA_TOPIC', 'valkyrie')
        self.KAFKA_POLL_TIMEOUT = os.getenv('KAFKA_POLL_TIMEOUT', 1.0)
 