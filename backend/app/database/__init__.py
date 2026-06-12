from .neo4j_client import neo4j_client
from .mongodb_client import mongodb_client
from .sqlite_client import get_db, Base, engine

__all__ = ["neo4j_client", "mongodb_client", "get_db", "Base", "engine"]

def init_databases():
    from app.database.sqlite_client import Base, engine
    Base.metadata.create_all(bind=engine)
    print("SQLite tables created")
    
    try:
        neo4j_client.connect()
        print("Neo4j connected")
    except Exception as e:
        print(f"Neo4j connection failed (may not be running): {e}")
    
    try:
        mongodb_client.connect()
        print("MongoDB connected")
    except Exception as e:
        print(f"MongoDB connection failed (may not be running): {e}")
