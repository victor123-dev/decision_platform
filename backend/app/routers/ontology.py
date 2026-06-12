from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.database.neo4j_client import neo4j_client
from app.database.mongodb_client import mongodb_client
from app.database import get_db
from app.database.sqlite_models import OntologyInstance
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter()

PROTECTED_ONTOLOGY_IDS = ["ont-supply-chain-control-tower"]

class ObjectType(BaseModel):
    id: str = Field(description="对象类型唯一标识")
    name: str = Field(description="对象类型名称")
    display_name: str = Field(description="显示名称")
    description: str = Field(description="描述")
    properties: List[Dict[str, Any]] = Field(default_factory=list, description="属性列表")

class ActionType(BaseModel):
    id: str = Field(description="动作类型唯一标识")
    name: str = Field(description="动作类型名称")
    display_name: str = Field(description="显示名称")
    description: str = Field(description="描述")
    target_model_id: Optional[str] = Field(None, description="目标模型ID")
    input_schema: Dict[str, Any] = Field(default_factory=dict, description="输入参数schema")
    output_schema: Dict[str, Any] = Field(default_factory=dict, description="输出参数schema")

class LinkType(BaseModel):
    id: str = Field(description="链接类型唯一标识")
    name: str = Field(description="链接类型名称")
    display_name: str = Field(description="显示名称")
    description: str = Field(description="描述")
    source: str = Field(description="源节点类型")
    target: str = Field(description="目标节点类型")

class OntologyModel(BaseModel):
    id: str = Field(description="本体模型唯一标识")
    name: str = Field(description="本体模型名称")
    description: str = Field(description="描述")
    status: str = Field(description="状态")
    creator: str = Field(description="创建者")
    updated_at: str = Field(description="更新时间")
    object_types: List[ObjectType] = Field(default_factory=list)
    action_types: List[ActionType] = Field(default_factory=list)
    link_types: List[LinkType] = Field(default_factory=list)

@router.get("/", response_model=List[OntologyModel], tags=["本体模型"])
async def list_ontologies():
    try:
        query = """
            MATCH (o:Ontology)
            RETURN o.id as id, o.name as name, o.description as description, 
                   o.status as status, o.creator as creator, o.updatedAt as updated_at
        """
        results = neo4j_client.execute_query(query)
        ontologies = []
        for record in results:
            ont_id = record.get('id')
            if ont_id:
                try:
                    # 获取包含子元素的完整本体详情
                    full_ont = await get_ontology(ont_id)
                    ontologies.append(full_ont)
                except Exception as e:
                    logger.warning(f"Error fetching details for ontology {ont_id}: {e}")
                    # 详情获取失败时返回基础信息（子元素为空）
                    ontologies.append(OntologyModel(
                        id=ont_id,
                        name=record.get('name', ''),
                        description=record.get('description', ''),
                        status=record.get('status', ''),
                        creator=record.get('creator', ''),
                        updated_at=record.get('updated_at', ''),
                    ))
        return ontologies
    except Exception as e:
        logger.error(f"Error listing ontologies: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{ontology_id}", response_model=OntologyModel, tags=["本体模型"])
async def get_ontology(ontology_id: str):
    try:
        query = """
            MATCH (o:Ontology {id: $ontology_id})
            OPTIONAL MATCH (o)-[:HAS_OBJECT_TYPE]->(ot:ObjectType)
            OPTIONAL MATCH (o)-[:HAS_ACTION_TYPE]->(at:ActionType)
            OPTIONAL MATCH (o)-[:HAS_LINK_TYPE]->(lt:LinkType)
            RETURN o.id as id, o.name as name, o.description as description,
                   o.status as status, o.creator as creator, o.updatedAt as updated_at,
                   collect(DISTINCT ot) as object_types,
                   collect(DISTINCT at) as action_types,
                   collect(DISTINCT lt) as link_types
        """
        results = neo4j_client.execute_query(query, {"ontology_id": ontology_id})
        if not results:
            raise HTTPException(status_code=404, detail="Ontology not found")
        return results[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting ontology {ontology_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=OntologyModel, status_code=status.HTTP_201_CREATED, tags=["本体模型"])
async def create_ontology(ontology: OntologyModel):
    try:
        query = """
            CREATE (o:Ontology {
                id: $id, 
                name: $name, 
                description: $description,
                status: $status,
                creator: $creator,
                updatedAt: $updated_at
            })
            RETURN o.id as id, o.name as name, o.description as description,
                   o.status as status, o.creator as creator, o.updatedAt as updated_at
        """
        params = ontology.model_dump()
        results = neo4j_client.execute_write_query(query, params)
        return ontology
    except Exception as e:
        if "offline" in str(e).lower():
            raise HTTPException(status_code=503, detail="Service temporarily unavailable: Neo4j is offline")
        logger.error(f"Error creating ontology: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{ontology_id}", response_model=OntologyModel, tags=["本体模型"])
async def update_ontology(ontology_id: str, ontology: OntologyModel):
    try:
        query = """
            MATCH (o:Ontology {id: $ontology_id})
            SET o.name = $name, o.description = $description,
                o.status = $status, o.creator = $creator, o.updatedAt = $updated_at
            RETURN o.id as id, o.name as name, o.description as description,
                   o.status as status, o.creator as creator, o.updatedAt as updated_at
        """
        params = {**ontology.model_dump(), "ontology_id": ontology_id}
        results = neo4j_client.execute_write_query(query, params)
        return ontology
    except Exception as e:
        if "offline" in str(e).lower():
            raise HTTPException(status_code=503, detail="Service temporarily unavailable: Neo4j is offline")
        logger.error(f"Error updating ontology {ontology_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{ontology_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["本体模型"])
async def delete_ontology(ontology_id: str):
    if ontology_id in PROTECTED_ONTOLOGY_IDS:
        raise HTTPException(status_code=403, detail="Protected ontology cannot be deleted")
    
    try:
        query = """
            MATCH (o:Ontology {id: $ontology_id})
            DETACH DELETE o
        """
        neo4j_client.execute_write_query(query, {"ontology_id": ontology_id})
    except Exception as e:
        if "offline" in str(e).lower():
            raise HTTPException(status_code=503, detail="Service temporarily unavailable: Neo4j is offline")
        logger.error(f"Error deleting ontology {ontology_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{ontology_id}/object-types", tags=["本体模型"])
async def add_object_type(ontology_id: str, object_type: ObjectType):
    if ontology_id in PROTECTED_ONTOLOGY_IDS:
        raise HTTPException(status_code=403, detail="Protected ontology cannot be modified")
    
    try:
        query = """
            MATCH (o:Ontology {id: $ontology_id})
            MERGE (ot:ObjectType {id: $ot_id})
            SET ot.name = $name, ot.displayName = $display_name, 
                ot.description = $description, ot.properties = $properties
            MERGE (o)-[:HAS_OBJECT_TYPE]->(ot)
            RETURN ot
        """
        params = {
            "ontology_id": ontology_id,
            "ot_id": object_type.id,
            "name": object_type.name,
            "display_name": object_type.display_name,
            "description": object_type.description,
            "properties": object_type.properties
        }
        neo4j_client.execute_write_query(query, params)
        return object_type
    except Exception as e:
        if "offline" in str(e).lower():
            raise HTTPException(status_code=503, detail="Service temporarily unavailable: Neo4j is offline")
        logger.error(f"Error adding object type to ontology {ontology_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{ontology_id}/object-types", response_model=List[ObjectType], tags=["本体模型"])
async def get_object_types(ontology_id: str):
    try:
        query = """
            MATCH (o:Ontology {id: $ontology_id})-[:HAS_OBJECT_TYPE]->(ot:ObjectType)
            RETURN ot.id as id, ot.name as name, ot.displayName as display_name,
                   ot.description as description, ot.properties as properties
        """
        results = neo4j_client.execute_query(query, {"ontology_id": ontology_id})
        return results
    except Exception as e:
        logger.error(f"Error getting object types for ontology {ontology_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{ontology_id}/action-types", tags=["本体模型"])
async def add_action_type(ontology_id: str, action_type: ActionType):
    if ontology_id in PROTECTED_ONTOLOGY_IDS:
        raise HTTPException(status_code=403, detail="Protected ontology cannot be modified")
    
    try:
        query = """
            MATCH (o:Ontology {id: $ontology_id})
            MERGE (at:ActionType {id: $at_id})
            SET at.name = $name, at.displayName = $display_name, 
                at.description = $description, at.targetModelId = $target_model_id,
                at.inputSchema = $input_schema, at.outputSchema = $output_schema
            MERGE (o)-[:HAS_ACTION_TYPE]->(at)
            RETURN at
        """
        params = {
            "ontology_id": ontology_id,
            "at_id": action_type.id,
            "name": action_type.name,
            "display_name": action_type.display_name,
            "description": action_type.description,
            "target_model_id": action_type.target_model_id,
            "input_schema": action_type.input_schema,
            "output_schema": action_type.output_schema
        }
        neo4j_client.execute_write_query(query, params)
        
        # MongoDB写入（非关键路径，离线时降级处理）
        try:
            actions_collection = mongodb_client.get_collection("actions")
            actions_collection.insert_one({
                "_id": action_type.id,
                "ontology_id": ontology_id,
                "name": action_type.name,
                "display_name": action_type.display_name,
                "description": action_type.description,
                "target_model_id": action_type.target_model_id,
                "input_schema": action_type.input_schema,
                "output_schema": action_type.output_schema
            })
        except Exception as mongo_err:
            logger.warning(f"MongoDB write failed (non-critical): {mongo_err}")
        
        return action_type
    except Exception as e:
        if "offline" in str(e).lower():
            raise HTTPException(status_code=503, detail="Service temporarily unavailable: Neo4j is offline")
        logger.error(f"Error adding action type to ontology {ontology_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{ontology_id}/action-types", response_model=List[ActionType], tags=["本体模型"])
async def get_action_types(ontology_id: str):
    try:
        query = """
            MATCH (o:Ontology {id: $ontology_id})-[:HAS_ACTION_TYPE]->(at:ActionType)
            RETURN at.id as id, at.name as name, at.displayName as display_name,
                   at.description as description, at.targetModelId as target_model_id,
                   at.inputSchema as input_schema, at.outputSchema as output_schema
        """
        results = neo4j_client.execute_query(query, {"ontology_id": ontology_id})
        return results
    except Exception as e:
        logger.error(f"Error getting action types for ontology {ontology_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{ontology_id}/link-types", tags=["本体模型"])
async def add_link_type(ontology_id: str, link_type: LinkType):
    if ontology_id in PROTECTED_ONTOLOGY_IDS:
        raise HTTPException(status_code=403, detail="Protected ontology cannot be modified")
    
    try:
        query = """
            MATCH (o:Ontology {id: $ontology_id})
            MERGE (lt:LinkType {id: $lt_id})
            SET lt.name = $name, lt.displayName = $display_name, 
                lt.description = $description, lt.source = $source, lt.target = $target
            MERGE (o)-[:HAS_LINK_TYPE]->(lt)
            RETURN lt
        """
        params = {
            "ontology_id": ontology_id,
            "lt_id": link_type.id,
            "name": link_type.name,
            "display_name": link_type.display_name,
            "description": link_type.description,
            "source": link_type.source,
            "target": link_type.target
        }
        neo4j_client.execute_write_query(query, params)
        return link_type
    except Exception as e:
        if "offline" in str(e).lower():
            raise HTTPException(status_code=503, detail="Service temporarily unavailable: Neo4j is offline")
        logger.error(f"Error adding link type to ontology {ontology_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{ontology_id}/link-types", response_model=List[LinkType], tags=["本体模型"])
async def get_link_types(ontology_id: str):
    try:
        query = """
            MATCH (o:Ontology {id: $ontology_id})-[:HAS_LINK_TYPE]->(lt:LinkType)
            RETURN lt.id as id, lt.name as name, lt.displayName as display_name,
                   lt.description as description, lt.source as source, lt.target as target
        """
        results = neo4j_client.execute_query(query, {"ontology_id": ontology_id})
        return results
    except Exception as e:
        logger.error(f"Error getting link types for ontology {ontology_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class InstanceCreateRequest(BaseModel):
    object_type_id: str = Field(description="对象类型ID")
    properties: Dict[str, Any] = Field(default_factory=dict, description="实例属性")

class InstanceResponse(BaseModel):
    id: str = Field(description="实例ID")
    ontology_id: str = Field(description="本体ID")
    object_type_id: str = Field(description="对象类型ID")
    properties: Dict[str, Any] = Field(description="实例属性")
    created_at: str = Field(description="创建时间")

@router.post("/{ontology_id}/instances", response_model=InstanceResponse, tags=["本体模型"])
async def create_instance(ontology_id: str, request: InstanceCreateRequest):
    try:
        db = next(get_db())
        instance_id = f"inst-{ontology_id}-{len(db.query(OntologyInstance).all()) + 1}"
        
        instance = OntologyInstance(
            id=instance_id,
            ontology_id=ontology_id,
            object_type_id=request.object_type_id,
            properties=json.dumps(request.properties)
        )
        
        db.add(instance)
        db.commit()
        db.refresh(instance)
        
        return InstanceResponse(
            id=instance.id,
            ontology_id=instance.ontology_id,
            object_type_id=instance.object_type_id,
            properties=json.loads(instance.properties),
            created_at=str(instance.created_at)
        )
    except Exception as e:
        logger.error(f"Error creating instance for ontology {ontology_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{ontology_id}/instances", response_model=List[InstanceResponse], tags=["本体模型"])
async def get_instances(ontology_id: str, object_type_id: Optional[str] = None):
    try:
        db = next(get_db())
        query = db.query(OntologyInstance).filter(OntologyInstance.ontology_id == ontology_id)
        
        if object_type_id:
            query = query.filter(OntologyInstance.object_type_id == object_type_id)
        
        instances = query.all()
        
        return [
            InstanceResponse(
                id=inst.id,
                ontology_id=inst.ontology_id,
                object_type_id=inst.object_type_id,
                properties=json.loads(inst.properties),
                created_at=str(inst.created_at)
            )
            for inst in instances
        ]
    except Exception as e:
        logger.error(f"Error getting instances for ontology {ontology_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
