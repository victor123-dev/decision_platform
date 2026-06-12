# 决策智能平台后端服务

## 项目结构

```
backend/
├── app/
│   ├── main.py              # 主应用入口
│   ├── database/            # 数据库模块
│   │   ├── neo4j_client.py  # Neo4j图数据库客户端
│   │   ├── mongodb_client.py # MongoDB客户端
│   │   ├── sqlite_client.py  # SQLite客户端
│   │   └── sqlite_models.py  # SQLite模型定义
│   └── routers/             # API路由
│       ├── ontology.py      # 本体模型API
│       ├── optimization.py  # 优化求解API
│       ├── decision_flow.py # 决策流程API
│       └── ai_modeling.py   # AI辅助建模API
├── config/
│   └── settings.py          # 配置管理
├── scripts/
│   ├── init_db.py           # 数据库初始化脚本
│   └── init_flows.py        # 决策流程初始化脚本
├── .env                     # 环境变量配置
├── requirements.txt         # 依赖清单
└── start.sh                 # 启动脚本
```

## 快速开始

### 环境要求
- Python 3.10+
- Neo4j 5.x (可选)
- MongoDB 5.x (可选)

### 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 配置环境变量

编辑 `.env` 文件配置数据库连接：

```env
# Neo4j配置
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# MongoDB配置
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB=decision_db

# LLM配置（可选）
LLM_API_KEY=your-api-key
```

### 初始化数据库

```bash
python scripts/init_db.py
```

### 启动服务

```bash
bash start.sh
```

或使用 uvicorn 直接启动：

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## API接口

### 健康检查
```
GET /health
```

### 本体模型
```
GET /api/v1/ontology/
POST /api/v1/ontology/
GET /api/v1/ontology/{id}
PUT /api/v1/ontology/{id}
DELETE /api/v1/ontology/{id}
```

### 优化求解模型
```
GET /api/v1/optimization/
POST /api/v1/optimization/
POST /api/v1/optimization/{id}/solve
```

### 决策流程
```
GET /api/v1/flows/
POST /api/v1/flows/
POST /api/v1/flows/{id}/execute
```

### AI辅助建模
```
POST /api/v1/ai/generate-model
POST /api/v1/ai/tune-parameters
POST /api/v1/ai/validate-model
```

## 数据库架构

### Neo4j (本体模型数据)
- Ontology: 本体模型节点
- ObjectType: 对象类型节点
- ActionType: 动作类型节点
- LinkType: 链接类型节点

### SQLite (实例数据)
- ontology_instances: 本体实例
- execution_records: 执行记录
- rule_sets: 规则集
- rules: 规则
- global_variables: 全局变量

### MongoDB (Action数据)
- actions: 动作定义

## 决策案例

系统包含以下预定义决策案例：

1. **信用评分决策流** (flow-001): 完整的个人信贷信用评分流程
2. **反欺诈交易监控流** (flow-002): 实时交易风控流程
3. **自动订单审核流** (flow-003): 采购订单自动审批流程
4. **库存智能补货流** (flow-004): 基于优化模型的库存补货决策
5. **供应商评估决策流** (flow-005): 供应商综合评估流程

## 许可证

MIT License
