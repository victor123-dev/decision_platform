# n8n 授权许可、可扩展性与决策逻辑单实例集成调研

> 调研对象：n8n 自动化工作流平台  
> 当前系统模块：`src/pages/DecisionFlowList.jsx`、`src/pages/DecisionFlowEditor.jsx`、`src/data/mockData.js` 中的“决策逻辑 / Decision Flow”  
> 结论日期：2026-06-10

## 1. 结论摘要

| 调研项 | 结论 | 说明 |
| --- | --- | --- |
| 是否免费使用 | **有条件免费** | n8n 可自托管，社区版本通常可免费用于个人、非商业或内部业务场景，但受许可证限制。 |
| 是否严格意义 FOSS / OSI 开源 | **否，不建议表述为标准“免费开源软件”** | 官方仓库 `LICENSE.md` 显示主代码采用 **Sustainable Use License 1.0**，该许可证允许使用、复制、分发、提供和准备衍生作品，但限制用途；包含 `.ee.` 文件或 `.ee` 目录的企业版代码需有效企业许可。该许可证不是常见 OSI 批准许可证（如 MIT、Apache-2.0、GPL）。 |
| 是否支持扩展与定制 | **支持** | 支持自托管、REST API、Webhook、节点/凭证扩展、自定义节点包、社区节点、源代码级二次开发和插件化集成。 |
| 是否满足“免费开源且支持改造”的双条件 | **取决于对“开源”的定义；若按严格 FOSS/OSI 标准，则不满足** | 若业务只要求“源码可见、可自托管、可在内部业务中免费使用并可改造”，n8n 可作为候选；若合规要求必须是 OSI 开源，则不应进入集成实施。 |
| 本系统集成建议 | **建议先做单实例、旁路式、可回滚 PoC** | 仅选 `flow-003 自动订单审核流` 作为试点，将其执行引擎切换为 n8n Webhook，其余 `flow-001`、`flow-002`、`flow-004` 保持现状。上线前需法务确认 Sustainable Use License 的业务适用性。 |

## 2. n8n 授权许可模式核验

### 2.1 官方许可证关键信息

经读取 n8n 官方 GitHub 仓库 `LICENSE.md`，可见：

1. 主代码（除特殊企业版文件外）采用 **Sustainable Use License 1.0**。
2. 文件名包含 `.ee.` 或目录名包含 `.ee` 的源码 **不在 Sustainable Use License 授权范围内**，使用这些企业版源码需要有效 n8n Enterprise License。
3. Sustainable Use License 授予非独占、免版税、全球范围的许可，可使用、复制、分发、提供和准备衍生作品，但存在用途限制。
4. 限制条款明确：只能为自身内部业务目的、非商业或个人用途使用/修改；向他人分发或提供时只能免费且限非商业目的。

### 2.2 对“免费开源”的判断

因此，n8n 更准确的定位是：

- **source-available / 源码可用**；
- **社区版可自托管且通常可免费用于内部业务自动化**；
- **不是标准 OSI/FOSS 意义上的开源许可项目**；
- **企业版能力与企业版源码受商业许可证约束**。

如果现有系统的采购/合规要求写明“必须为 OSI 批准的免费开源软件”，则 n8n **不满足条件**。如果要求是“可免费自托管、源码可审计、可在内部业务中定制改造”，则 n8n **基本满足，但需法务复核具体业务边界**。

## 3. n8n 可扩展性与定制化能力评估

### 3.1 工作流与外部系统集成能力

n8n 适合作为自动化编排与轻量业务流程执行层，常用集成方式包括：

- **Webhook Trigger**：由现有系统调用 n8n 暴露的 Webhook，触发工作流执行。
- **HTTP Request 节点**：n8n 调用现有系统 API、外部服务、模型服务、规则服务。
- **Code 节点**：在工作流内部执行 JS/TS 逻辑，适合轻量数据转换、条件判断、字段映射。
- **IF / Switch / Merge / Execute Workflow 节点**：支持分支、合并、子流程复用。
- **REST API**：可通过 n8n API 管理工作流、执行记录、凭据、标签等。
- **队列与 Worker 模式**：可基于 Redis/队列部署，提升生产环境并发和可靠性。

### 3.2 二次开发与功能改造能力

n8n 支持多层次扩展：

1. **配置级扩展**：通过 UI 编排节点、参数、凭据和分支，不改源码。
2. **节点级扩展**：开发自定义节点和自定义凭据，封装企业内部 API、规则服务、模型服务。
3. **工作流级扩展**：通过子工作流、模板、环境变量、Webhook 输入输出约定实现领域化流程。
4. **源码级改造**：可基于源码调整 UI、后端能力、节点行为，但必须遵守 Sustainable Use License 与企业版代码限制。
5. **运维级扩展**：支持 Docker、自托管、环境变量配置、数据库持久化、队列模式、日志和监控接入。

### 3.3 适配本系统“决策逻辑”的能力

本系统当前“决策逻辑”以 `decisionFlows` 静态模拟数据为核心：

- `flow-001 信用评分决策流`：已发布，包含征信数据、规则集、ML 模型、条件分支。
- `flow-002 反欺诈交易监控流`：已发布，包含反欺诈规则、条件分支、模型和人工审核子流程。
- `flow-003 自动订单审核流`：草稿，包含订单规则、自动/人工分支。
- `flow-004 库存智能补货流`：已发布但节点为空。

从风险控制角度，最适合试点的是 **`flow-003 自动订单审核流`**：

- 状态为 `draft`，对生产影响较低；
- 业务链路清晰，节点少，容易映射到 n8n；
- 与规则集 `rs-003 订单自动审核规则` 已有关联；
- 可用明确输入输出验证集成效果。

## 4. 集成前置判断

### 4.1 若采用严格 FOSS 标准

如果“免费开源”被定义为：代码必须使用 OSI 批准许可证，且允许不受内部/外部商业用途限制的自由使用、修改和分发，则：

> **n8n 不满足该条件，因此不应继续实施正式集成。**

此时建议改为评估 Apache-2.0/MIT/GPL 等标准开源许可的替代方案，或将 n8n 作为商业/源码可用组件走软件引入审批。

### 4.2 若接受 Source-Available + 内部业务免费使用

如果业务与法务确认 Sustainable Use License 允许当前使用场景，且系统仅将 n8n 用于自身内部业务流程编排，则可进入单实例 PoC。

## 5. 单一逻辑实例集成实施方案

### 5.1 集成目标

仅将 **`flow-003 自动订单审核流`** 接入 n8n 执行，验证 n8n 对决策流程编排、外部触发、执行结果回传和审计记录的支持能力。

### 5.2 不变范围

以下逻辑实例保持原有功能和运行状态不变：

- `flow-001 信用评分决策流`
- `flow-002 反欺诈交易监控流`
- `flow-004 库存智能补货流`

不改动其节点定义、状态、执行入口、展示逻辑和测试数据。

### 5.3 建议架构

```text
现有系统【决策逻辑】
        |
        | 仅 flow-003 命中特性开关 / executionBackend = "n8n"
        v
Decision Execution Adapter
        |
        | HTTP POST /webhook/order-review-decision
        v
n8n Workflow: 自动订单审核流
        |
        | 规则判断 / 数据转换 / 自动或人工路径
        v
统一响应结构返回现有系统
```

### 5.4 单实例改造边界

在 `src/data/mockData.js` 的 `flow-003` 增加集成元数据即可完成前端层面的试点标识：

```js
integration: {
  backend: 'n8n',
  mode: 'pilot',
  webhookPath: '/webhook/order-review-decision',
  workflowName: '自动订单审核流 - n8n PoC',
}
```

其他 flow 不增加该字段，或显式保持 `backend: 'native'`。

后端/执行层按 `flowId` 路由：

```js
if (flow.id === 'flow-003' && flow.integration?.backend === 'n8n') {
  return n8nClient.execute(flow.integration.webhookPath, payload);
}

return nativeDecisionEngine.execute(flow, payload);
```

### 5.5 n8n 工作流设计

工作流名称：`自动订单审核流 - n8n PoC`

建议节点：

1. **Webhook Trigger**
   - Method: `POST`
   - Path: `/order-review-decision`
   - 输入：订单金额、供应商等级、剩余预算、7 日重复订单数等。

2. **Set / Code 数据标准化节点**
   - 将现有系统输入映射为规则变量：
     - `order_amount`
     - `supplier_tier`
     - `remaining_budget`
     - `duplicate_orders_7d`

3. **Code 规则判断节点**
   - 初期直接复刻 `rs-003` 中的核心规则：
     - 小额自动审批：`order_amount < 5000`
     - 优选供应商放行：`supplier_tier == "gold"`
     - 预算检查：`order_amount <= remaining_budget`
     - 重复订单检测：`duplicate_orders_7d > 0`

4. **IF 节点**
   - 条件：`auto_approve === true && budget_ok === true && flag !== "duplicate"`

5. **自动审批分支**
   - 返回：`decision = "approved"`、`route = "auto"`、`reason = "满足自动审批条件"`

6. **人工复核分支**
   - 返回：`decision = "manual_review"`、`route = "manual"`、`reason = "预算不足或存在重复订单等风险"`

7. **Respond to Webhook**
   - 统一响应：

```json
{
  "flowId": "flow-003",
  "engine": "n8n",
  "decision": "approved",
  "route": "auto",
  "reason": "满足自动审批条件",
  "traceId": "...",
  "executedAt": "..."
}
```

### 5.6 环境与配置

建议新增运行时配置：

```env
N8N_BASE_URL=http://localhost:5678
N8N_WEBHOOK_ORDER_REVIEW=/webhook/order-review-decision
N8N_API_KEY=***
DECISION_FLOW_003_BACKEND=n8n
```

安全要求：

- Webhook 不应裸露公网；
- 使用反向代理、IP 白名单或签名 Header；
- 敏感凭据仅放在 n8n Credentials 或安全配置中心；
- 不把生产密钥写入前端代码或 mockData。

### 5.7 验证用例

| 用例 | 输入 | 期望结果 |
| --- | --- | --- |
| 小额金牌供应商订单 | `order_amount=3000, supplier_tier=gold, remaining_budget=10000, duplicate_orders_7d=0` | 自动审批，`decision=approved` |
| 超预算订单 | `order_amount=8000, supplier_tier=gold, remaining_budget=5000, duplicate_orders_7d=0` | 转人工，`decision=manual_review` |
| 重复订单 | `order_amount=3000, supplier_tier=gold, remaining_budget=10000, duplicate_orders_7d=1` | 转人工，原因包含重复订单 |
| 非优选大额供应商 | `order_amount=9000, supplier_tier=silver, remaining_budget=12000, duplicate_orders_7d=0` | 转人工或按业务规则输出待审 |

### 5.8 成功标准

1. `flow-003` 的测试请求可成功触发 n8n Webhook。
2. n8n 返回统一响应结构，现有系统可识别 `engine=n8n`。
3. `flow-001`、`flow-002`、`flow-004` 不受影响，仍走原执行路径。
4. 可在 n8n 查看 `flow-003` 执行历史和错误日志。
5. 可通过配置开关将 `flow-003` 回退到原生执行路径。

### 5.9 回滚方案

- 将 `DECISION_FLOW_003_BACKEND` 从 `n8n` 改回 `native`；
- 或移除/禁用 `flow-003.integration` 配置；
- 保留 n8n 工作流但停止 Webhook 激活；
- 清理测试凭据和临时访问规则。

## 6. 风险与约束

1. **许可证风险**：n8n 不是标准 OSI 开源项目，正式引入前必须完成法务/采购合规确认。
2. **企业版边界**：不得使用或复制 `.ee` 企业版源码，除非已购买并获得授权。
3. **执行一致性风险**：现有规则引擎和 n8n 工作流可能出现规则表达差异，需要以测试用例固化行为。
4. **可观测性风险**：必须记录 traceId、flowId、engine、入参摘要、出参和错误信息。
5. **安全风险**：Webhook 暴露面、凭据管理、调用签名和网络隔离需要纳入集成设计。

## 7. 最终建议

- 若组织要求“严格免费开源 / OSI 许可证”：**不建议集成 n8n**，应更换候选方案。
- 若组织接受“源码可用、社区版可自托管、内部业务免费使用”的授权模式：可按本方案仅对 `flow-003 自动订单审核流` 做 PoC，且必须保留功能开关与回滚路径。
- 不建议一次性替换整个“决策逻辑”模块；应先验证单实例效果，再评估是否扩展到更多流程。