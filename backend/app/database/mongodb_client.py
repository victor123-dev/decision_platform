from pymongo import MongoClient
from config.settings import settings
import logging

logger = logging.getLogger(__name__)

class MemoryCollectionProxy:
    def __init__(self, name):
        self.name = name
        self._data = []
    def insert_one(self, doc):
        self._data.append(doc)
        class Result:
            inserted_id = doc.get('_id', str(id(doc)))
        return Result()
    def find(self, filter=None):
        if not filter:
            return self._data
        return [d for d in self._data if all(d.get(k) == v for k, v in filter.items())]
    def find_one(self, filter=None):
        results = self.find(filter)
        return results[0] if results else None

class MongoDBClient:
    def __init__(self):
        self.client = None
        self.db = None
        self.offline_mode = False
    
    def connect(self):
        try:
            self.client = MongoClient(settings.mongodb_uri)
            self.db = self.client[settings.mongodb_db]
            # Verify connection
            self.client.admin.command('ping')
            logger.info("Successfully connected to MongoDB")
            self.offline_mode = False
        except Exception as e:
            logger.warning(f"MongoDB connection failed, switching to offline mode: {e}")
            self.offline_mode = True
    
    def close(self):
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed")
    
    def get_collection(self, collection_name):
        if self.offline_mode:
            return MemoryCollectionProxy(collection_name)
        if not self.db:
            self.connect()
            if self.offline_mode:
                return MemoryCollectionProxy(collection_name)
        return self.db[collection_name]

    def health_check(self):
        if self.offline_mode:
            return {"status": "degraded", "message": "Running in offline mode with memory storage"}
        try:
            if not self.client:
                self.connect()
            if self.client:
                self.client.admin.command('ping')
                return {"status": "healthy"}
            else:
                return {"status": "degraded", "message": "Client not initialized"}
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)[:100]}


mongodb_client = MongoDBClient()
