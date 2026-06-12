# 决策智能平台后端开发 - 产品需求文档

## Overview
- **Summary**: 完善项目后端功能，重点开发【本体模型】【逻辑编排】【优化求解模型】三个核心模块，构建前后端分离且可实际运行的完整系统。
- **Purpose**: 为前端提供稳定、高效的后端服务支持，实现决策逻辑编排、优化求解和本体管理能力。
- **Target Users**: 企业级决策管理人员、业务分析师、开发人员

## Goals
- 构建完整的后端服务架构，支持三个核心模块
- 实现多数据库架构（Neo4j + SQLite + MongoDB）
- 集成AI辅助建模能力（DeerFlow + Qwen）
- 集成HiGHS优化求解器
- 提供完整的API接口和文档

## Non-Goals (Out of Scope)
- 不开发新的前端页面或大功能扩展
- 不修改现有的前端核心逻辑
- 不涉及外部部署环境配置（如云服务器）

## Background & Context
当前项目仅包含前端React应用，使用mock数据模拟后端接口。需要构建真实的后端服务，支持：
1. 本体模型的存储和管理（图数据库）
2. 决策流程的编排和执行
3. 优化模型的定义和求解

## Functional Requirements
- **FR-1**: 本体模型管理 - 支持业务对象类型、动作类型、链接类型的CRUD操作
- **FR-2**: 决策流程编排 - 支持流程节点定义、连接关系、条件分支
- **FR-3**: 优化求解模型 - 支持线性/非线性优化问题定义和求解
- **FR-4**: AI辅助建模 - 支持基于LLM的模型自动生成和参数调优
- **FR-5**: 规则引擎 - 支持业务规则的定义和执行
- **FR-6**: 决策案例管理 - 支持案例的创建、运行和结果验证

## Non-Functional Requirements
- **NFR-1**: 性能 - 接口响应时间 < 500ms，求解器执行超时可配置
- **NFR-2**: 数据隔离 - 保留现有示例数据，确保新增数据不影响原有数据
- **NFR-3**: 错误处理 - 统一的错误处理机制和日志记录
- **NFR-4**: API文档 - 提供完整的API文档和测试用例

## Constraints
- **Technical**: 
  - 使用Python FastAPI框架
  - Neo4j图数据库存储本体模型
  - SQLite存储实例数据
  - MongoDB存储Action数据
- **Dependencies**:
  - DeerFlow框架（AI辅助建模）
  - Qwen 3.7B LLM模型
  - HiGHS求解器

## Assumptions
- Neo4j、MongoDB服务已配置可用
- Python环境已配置
- 前端应用已存在，只需适配后端接口

## Acceptance Criteria

### AC-1: 本体模型模块可用
- **Given**: 系统已启动
- **When**: 调用本体模型CRUD接口
- **Then**: 成功创建、查询、更新、删除本体数据
- **Verification**: `programmatic`

### AC-2: 决策流程执行
- **Given**: 决策流程已定义
- **When**: 触发流程执行
- **Then**: 流程按定义的节点和分支正确执行
- **Verification**: `programmatic`

### AC-3: 优化求解功能
- **Given**: 优化模型已定义
- **When**: 调用求解接口
- **Then**: 返回正确的优化结果
- **Verification**: `programmatic`

### AC-4: AI辅助建模
- **Given**: 提供业务描述
- **When**: 调用AI建模接口
- **Then**: 自动生成优化模型定义
- **Verification**: `human-judgment`

### AC-5: 决策案例运行
- **Given**: 决策案例已配置
- **When**: 执行决策案例
- **Then**: 案例成功运行并输出预期结果
- **Verification**: `programmatic`

### AC-6: 数据隔离
- **Given**: 存在原有示例数据
- **When**: 新增/修改数据
- **Then**: 原有示例数据保持不变
- **Verification**: `programmatic`

## Open Questions
- [ ] Neo4j和MongoDB的具体连接配置
- [ ] HiGHS求解器的安装方式
- [ ] DeerFlow框架的集成方式
