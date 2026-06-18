from pymongo import MongoClient
from config.settings import settings
import logging

logger = logging.getLogger(__name__)

class MemoryCollectionProxy:
    """内存集合代理（离线模式）。数据按集合名全局共享，跨请求持久化。"""
    _global_store = {}  # class-level shared store: {collection_name: [docs]}

    def __init__(self, name):
        self.name = name
        if name not in MemoryCollectionProxy._global_store:
            MemoryCollectionProxy._global_store[name] = []
        self._data = MemoryCollectionProxy._global_store[name]

    def insert_one(self, doc):
        self._data.append(doc)
        class Result:
            inserted_id = doc.get('_id', str(id(doc)))
        return Result()

    def insert_many(self, docs):
        self._data.extend(docs)
        class Result:
            inserted_ids = [d.get('_id', str(id(d))) for d in docs]
        return Result()

    def find(self, filter=None):
        if not filter:
            return list(self._data)
        return [d for d in self._data if all(d.get(k) == v for k, v in filter.items())]

    def find_one(self, filter=None):
        results = self.find(filter)
        return results[0] if results else None

    def update_one(self, filter, update, upsert=False):
        doc = self.find_one(filter)
        if doc:
            set_data = update.get('$set', {})
            doc.update(set_data)
        elif upsert:
            new_doc = {**filter, **update.get('$set', {})}
            self.insert_one(new_doc)
        class Result:
            matched_count = 1 if doc else 0
            modified_count = 1 if doc else 0
        return Result()

    def delete_one(self, filter):
        doc = self.find_one(filter)
        if doc:
            self._data.remove(doc)
        class Result:
            deleted_count = 1 if doc else 0
        return Result()

    def delete_many(self, filter=None):
        if not filter:
            count = len(self._data)
            self._data.clear()
        else:
            docs = self.find(filter)
            count = len(docs)
            for d in docs:
                self._data.remove(d)
        class Result:
            deleted_count = count
        return Result()

    def count_documents(self, filter=None):
        return len(self.find(filter))

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
        if self.db is None:
            self.connect()
            if self.offline_mode:
                return MemoryCollectionProxy(collection_name)
        return self.db[collection_name]

    def seed_memory_collection(self, collection_name, documents):
        """向内存集合注入预置数据（离线模式用）"""
        proxy = MemoryCollectionProxy(collection_name)
        proxy._data.clear()
        proxy._data.extend(documents)
        logger.info(f"Seeded {len(documents)} documents into memory collection '{collection_name}'")
        return proxy

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
