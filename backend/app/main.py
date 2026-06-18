from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from config.settings import settings
import logging
import uuid

logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="决策智能平台 API",
    description="决策智能平台后端服务，提供本体模型、优化求解和决策流程管理能力",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def request_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    logger.info(f"Request [{request_id}] {request.method} {request.url}")
    try:
        response = await call_next(request)
        logger.info(f"Response [{request_id}] {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Error [{request_id}] {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": "Internal Server Error", "request_id": request_id}
        )

@app.on_event("startup")
def on_startup():
    from app.database.sqlite_client import engine, Base
    from app.database import sqlite_models  # 确保所有模型都被导入
    Base.metadata.create_all(bind=engine)

    # 自动初始化映射集预置数据
    try:
        from scripts.init_mapping_presets import init_presets
        init_presets()
    except Exception as e:
        logger.warning(f"映射集预置数据初始化跳过: {e}")

@app.get("/health", tags=["健康检查"])
async def health_check():
    return {"status": "healthy", "service": "decision-platform-api"}

@app.get("/health/details", tags=["健康检查"])
async def health_check_details():
    from app.database.sqlite_client import engine
    from app.database.neo4j_client import neo4j_client
    from app.database.mongodb_client import mongodb_client
    from app.deerflow import get_agent
    
    checks = {
        "service": "decision-platform-api",
        "status": "healthy",
        "components": {}
    }
    
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            checks["components"]["sqlite"] = {"status": "healthy"}
    except Exception as e:
        checks["components"]["sqlite"] = {"status": "unhealthy", "error": str(e)[:100]}
        checks["status"] = "degraded"
    
    try:
        checks["components"]["neo4j"] = neo4j_client.health_check()
        if checks["components"]["neo4j"]["status"] != "healthy":
            checks["status"] = "degraded"
    except Exception as e:
        checks["components"]["neo4j"] = {"status": "unhealthy", "error": str(e)[:100]}
        checks["status"] = "degraded"
    
    try:
        checks["components"]["mongodb"] = mongodb_client.health_check()
        if checks["components"]["mongodb"]["status"] != "healthy":
            checks["status"] = "degraded"
    except Exception as e:
        checks["components"]["mongodb"] = {"status": "unhealthy", "error": str(e)[:100]}
        checks["status"] = "degraded"
    
    try:
        agent = get_agent()
        checks["components"]["ai_agent"] = {
            "status": "healthy",
            "llm_configured": bool(settings.llm_api_key),
            "current_step": agent.state.current_step,
            "message_count": len(agent.state.messages)
        }
    except Exception as e:
        checks["components"]["ai_agent"] = {"status": "unhealthy", "error": str(e)[:100]}
        checks["status"] = "degraded"
    
    return checks

@app.get("/", tags=["根路径"])
async def root():
    return {"message": "决策智能平台 API", "version": "1.0.0"}

from app.routers import ontology, optimization, decision_flow, ai_modeling, rule_set, lookup_table, mapping_sets
app.include_router(ontology.router, prefix="/api/v1/ontology", tags=["本体模型"])
app.include_router(optimization.router, prefix="/api/v1/optimization", tags=["优化求解模型"])
app.include_router(decision_flow.router, prefix="/api/v1/flows", tags=["决策流程"])
app.include_router(ai_modeling.router, prefix="/api/v1/ai", tags=["AI辅助建模"])
app.include_router(rule_set.router, prefix="/api/v1/rulesets", tags=["规则集"])
app.include_router(lookup_table.router, prefix="/api/v1/lookup-tables", tags=["查找表"])
app.include_router(mapping_sets.router, prefix="/api/v1/mapping-sets", tags=["映射集合"])

from app.routers import model, global_variable, code_file, dashboard, publish, optimization_dsl
app.include_router(model.router, prefix="/api/v1/models", tags=["AI模型"])
app.include_router(global_variable.router, prefix="/api/v1/variables", tags=["全局变量"])
app.include_router(code_file.router, prefix="/api/v1/code-files", tags=["代码文件"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["仪表板"])
app.include_router(publish.router, prefix="/api/v1/publish", tags=["发布管理"])
app.include_router(optimization_dsl.router, prefix="/api/v1/optimization-dsl", tags=["OO-DSL优化建模"])
