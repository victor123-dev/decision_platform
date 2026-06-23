import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ArrowLeft, Save, Play, ZoomIn, ZoomOut, Maximize, Expand, Minimize2,
  Undo2, Redo2, ChevronDown, ChevronRight,
  Play as PlayIcon, PlayCircle, Square, ListChecks, Brain, Code,
  GitBranch, GitMerge, RefreshCw, Workflow, Globe,
  ArrowRightLeft, FileText, Settings, Clock, Hash,
  Variable, ArrowDownUp, AlertTriangle, Timer,
  Zap, Webhook, Database, Table, Download, Upload,
  Route, Sparkles, TrendingUp, Target, Network, Cpu,
  FlaskConical, BarChart3, LineChart, Bot, Users, Activity,
  Wrench, MessageSquare, UserCheck, Layout, Bell,
  Mail, Plug, Send, Radio, GraduationCap, Monitor, Boxes,
  BookOpen, FolderSync, ClipboardList, X,
  Calculator, Grid3x3, TreePine,
} from 'lucide-react';
import { nodeTypeDefinitions, nodePropertyDefinitions } from '@/data/mockData';
import { api } from '@/api/apiClient';
import ExecutionTest from '@/pages/ExecutionTest';

// ============================================================================
// Constants & Helpers
// ============================================================================

const nodeColorMap = {};
nodeTypeDefinitions.forEach((cat) => {
  cat.items.forEach((item) => {
    nodeColorMap[item.type] = item.color;
  });
});

const iconComponents = {
  Play: PlayIcon,
  PlayCircle,
  Square,
  ListChecks,
  Brain,
  Code,
  GitBranch,
  GitMerge,
  RefreshCw,
  Workflow,
  Globe,
  ArrowRightLeft,
  FileText,
  Zap,
  Webhook,
  Clock,
  Database,
  Table,
  Download,
  Upload,
  Route,
  Sparkles,
  TrendingUp,
  Target,
  Network,
  Cpu,
  FlaskConical,
  BarChart3,
  LineChart,
  Bot,
  Users,
  Activity,
  Wrench,
  MessageSquare,
  UserCheck,
  Layout,
  Bell,
  Mail,
  Plug,
  Send,
  Boxes,
  Radio,
  Settings,
  AlertTriangle,
  GraduationCap,
  Monitor,
  BookOpen,
  FolderSync,
  ClipboardList,
  Minimize2,
  Expand,
  Calculator,
  Grid3x3,
  TreePine,
  Variable,
  Hash,
};

const nodeDefMap = {};
nodeTypeDefinitions.forEach((cat) => {
  cat.items.forEach((item) => {
    nodeDefMap[item.type] = item;
  });
});

const inputParams = [
  { name: 'applicant_id', type: 'string', source: 'flow.input' },
  { name: 'credit_data', type: 'object', source: 'prev.output' },
  { name: 'score', type: 'number', source: 'prev.output' },
];

const outputParams = [
  { name: 'result', type: 'object', target: 'next.input' },
  { name: 'status', type: 'string', target: 'flow.output' },
];

const globalVars = [
  { name: 'risk_threshold', value: '0.6' },
  { name: 'max_loan_amount', value: '500000' },
  { name: 'blacklist_version', value: 'v2026.06' },
];

let nodeCounter = 100;

// ============================================================================
// Custom Node Components
// ============================================================================

function CircleNode({ data, selected, type: nodeType }) {
  const c = nodeColorMap[nodeType] || nodeColorMap.interface || '#3b82f6';
  const def = nodeDefMap[nodeType];
  const IconComp = def ? iconComponents[def.icon] : iconComponents.PlayCircle;
  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: `color-mix(in srgb, ${c} 12%, var(--surface))`,
        border: `2px solid color-mix(in srgb, ${c} 60%, transparent)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: selected ? `0 0 0 2px ${c}` : 'none',
        transition: 'box-shadow 0.15s ease',
      }}
     data-qoder-id="qel-div-circle-node" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-circle-node&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;CircleNode&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:125,&quot;column&quot;:5}}">
      {IconComp && <IconComp size={18} style={{ color: c, marginLeft: 2 }}  data-qoder-id="qel-iconcomp-circle" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-iconcomp-circle&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;CircleNode&quot;,&quot;elementRole&quot;:&quot;iconcomp&quot;,&quot;loc&quot;:{&quot;line&quot;:138,&quot;column&quot;:7}}"/>}
      <Handle type="source" position={Position.Right} style={{ background: c }}  data-qoder-id="qel-handle-circle" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-handle-circle&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;CircleNode&quot;,&quot;elementRole&quot;:&quot;handle&quot;,&quot;loc&quot;:{&quot;line&quot;:139,&quot;column&quot;:7}}"/>
    </div>
  );
}

function RectNodeShell({ type, data, selected, subtitle, ...qoderProps }) {
  const c = nodeColorMap[type] || '#94a3b8';
  const def = nodeDefMap[type];
  const IconComp = def ? iconComponents[def.icon] : null;

  return (
    <div
      className={[(`flow-node${selected ? ' selected' : ''}`), qoderProps?.className].filter(Boolean).join(" ")}
      style={{ ...({
        background: `color-mix(in srgb, ${c} 10%, var(--surface))`,
        border: `1.5px solid color-mix(in srgb, ${c} 60%, transparent)`,
        borderRadius: 'var(--seed-radius-md)',
        minWidth: 160,
        boxShadow: selected ? `0 0 0 2px color-mix(in srgb, ${c} 50%, transparent)` : 'none',
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
      }), ...(qoderProps?.style) }}
     data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <div className="flow-node-header" style={{ color: c }} data-qoder-id="qel-flow-node-header-b2122c42" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-node-header-b2122c42&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;RectNodeShell&quot;,&quot;elementRole&quot;:&quot;flow-node-header&quot;,&quot;loc&quot;:{&quot;line&quot;:158,&quot;column&quot;:7}}">
        {IconComp && <IconComp size={14}  data-qoder-id="qel-iconcomp-29039723" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-iconcomp-29039723&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;RectNodeShell&quot;,&quot;elementRole&quot;:&quot;iconcomp&quot;,&quot;loc&quot;:{&quot;line&quot;:159,&quot;column&quot;:22}}"/>}
        <span style={{ fontWeight: 500, fontSize: 12 }} data-qoder-id="qel-span-f209a155" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-f209a155&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;RectNodeShell&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:160,&quot;column&quot;:9}}">{data.label || type}</span>
      </div>
      {subtitle && (
        <div className="flow-node-body" style={{ color: 'var(--fg-3)' }} data-qoder-id="qel-flow-node-body-341b1a53" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-node-body-341b1a53&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;RectNodeShell&quot;,&quot;elementRole&quot;:&quot;flow-node-body&quot;,&quot;loc&quot;:{&quot;line&quot;:163,&quot;column&quot;:9}}">
          {subtitle}
        </div>
      )}
    </div>
  );
}

// Generic rect node that works for any rect-shaped node type
function GenericRectNode({ type }) {
  return function RectNodeComponent({ data, selected }) {
    const c = nodeColorMap[type] || '#94a3b8';
    const def = nodeDefMap[type];
    const subtitle = def ? (def.subtitle || null) : null;
    return (
      <div style={{ position: 'relative' }} data-qoder-id="qel-div-eeb1dc96" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-eeb1dc96&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;GenericRectNode&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:213,&quot;column&quot;:7}}">
        <Handle type="target" position={Position.Left} style={{ background: c }}  data-qoder-id="qel-handle-249f04d5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-handle-249f04d5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;GenericRectNode&quot;,&quot;elementRole&quot;:&quot;handle&quot;,&quot;loc&quot;:{&quot;line&quot;:214,&quot;column&quot;:9}}"/>
        <RectNodeShell type={type} data={data} selected={selected} subtitle={subtitle}  data-qoder-id="qel-rectnodeshell-3a263ef0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-rectnodeshell-3a263ef0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;GenericRectNode&quot;,&quot;elementRole&quot;:&quot;rectnodeshell&quot;,&quot;loc&quot;:{&quot;line&quot;:215,&quot;column&quot;:9}}"/>
        <Handle type="source" position={Position.Right} style={{ background: c }}  data-qoder-id="qel-handle-1e9efb63" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-handle-1e9efb63&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;GenericRectNode&quot;,&quot;elementRole&quot;:&quot;handle&quot;,&quot;loc&quot;:{&quot;line&quot;:216,&quot;column&quot;:9}}"/>
      </div>
    );
  };
}

// Subtitles for specific node types (shown on canvas)
const nodeSubtitles = {
  interface: '流程入口',
  script: 'Python / JS',
  if: '条件判断',
  filter: '条件过滤',
  switch: '规则 / 表达式',
  merge: '追加 / 组合 / SQL',
  loop_items: '分批处理',
  compare_data: '变更检测',
  stop_error: '终止 / 报错',
  while: '条件循环',
  do_while: '后置条件循环',
  http_request: 'HTTP接口请求',
  code: '代码执行',
  manual_trigger: '手动启动',
  schedule_trigger: '定时调度',
  webhook: 'Webhook回调',
  no_op: '占位符',
  edit_fields: '字段赋值',
  item_lists: '列表操作',
  date_time: '日期处理',
  aggregate: '字段聚合',
  sort: '排序',
  remove_duplicates: '去重',
  limit: '限制数量',
  split_out: '数组拆分',
  summarize: '分组汇总',
  ui_screen: 'UI 模板',
  notification: '邮件 / 推送',
  stream: '消息流处理',
  asynchronous: '异步任务',
  wait: '定时 / 事件',
  ml_model: '机器学习推理',
  forecast_model: '时序预测',
  optimization_model: '优化求解',
  rules: '规则引擎',
  subprocess: '子流程引用',
  agent_team: '大模型智能体',
  object_access: '本体对象',
  action: '触发事件 / 调用',
  assignment: '变量赋值',
  simple_scorecard: '基础评分',
  complex_scorecard: '多维加权评分',
  decision_table: '条件-动作规则表',
  cross_decision_table: '多维交叉查表',
  decision_tree: '树形决策',
};

// Apply subtitles to node definitions
Object.keys(nodeSubtitles).forEach((key) => {
  if (nodeDefMap[key]) {
    nodeDefMap[key].subtitle = nodeSubtitles[key];
  }
});

function BranchNode({ data, selected }) {
  const c = nodeColorMap.if || nodeColorMap.branch || '#eab308';
  const IconComp = iconComponents.GitBranch;
  return (
    <div style={{ position: 'relative', width: 140, height: 110 }} data-qoder-id="qel-div-171105c6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-171105c6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;BranchNode&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:208,&quot;column&quot;:5}}">
      <Handle type="target" position={Position.Left} id="target" style={{ background: c, top: '50%' }}  data-qoder-id="qel-target-46b9eac8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-target-46b9eac8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;BranchNode&quot;,&quot;elementRole&quot;:&quot;target&quot;,&quot;loc&quot;:{&quot;line&quot;:209,&quot;column&quot;:7}}"/>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 76,
          height: 76,
          transform: 'translate(-50%, -50%) rotate(45deg)',
          background: `color-mix(in srgb, ${c} 10%, var(--surface))`,
          border: `1.5px solid color-mix(in srgb, ${c} 60%, transparent)`,
          borderRadius: 6,
          boxShadow: selected ? `0 0 0 2px color-mix(in srgb, ${c} 50%, transparent)` : 'none',
          transition: 'box-shadow 0.15s ease',
        }}
       data-qoder-id="qel-div-151102a0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-151102a0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;BranchNode&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:210,&quot;column&quot;:7}}"/>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          pointerEvents: 'none',
        }}
       data-qoder-id="qel-div-16110433" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-16110433&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;BranchNode&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:225,&quot;column&quot;:7}}">
        <IconComp size={16} style={{ color: c }}  data-qoder-id="qel-iconcomp-fa6effda" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-iconcomp-fa6effda&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;BranchNode&quot;,&quot;elementRole&quot;:&quot;iconcomp&quot;,&quot;loc&quot;:{&quot;line&quot;:238,&quot;column&quot;:9}}"/>
        <span style={{ fontSize: 10, fontWeight: 500, color: c, whiteSpace: 'nowrap' }} data-qoder-id="qel-span-6f75cbb1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-6f75cbb1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;BranchNode&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:239,&quot;column&quot;:9}}">
          {data.label || '分支'}
        </span>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="yes"
        style={{ background: '#22c55e', top: '30%', right: -4 }}
       data-qoder-id="qel-yes-885991a0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-yes-885991a0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;BranchNode&quot;,&quot;elementRole&quot;:&quot;yes&quot;,&quot;loc&quot;:{&quot;line&quot;:243,&quot;column&quot;:7}}"/>
      <span
        style={{
          position: 'absolute',
          right: -22,
          top: '25%',
          fontSize: 9,
          color: '#22c55e',
          fontWeight: 500,
        }}
       data-qoder-id="qel-span-6b7803fc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-6b7803fc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;BranchNode&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:249,&quot;column&quot;:7}}">
        Y
      </span>
      <Handle
        type="source"
        position={Position.Right}
        id="no"
        style={{ background: '#ef4444', top: '70%', right: -4 }}
       data-qoder-id="qel-no-a602469a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-no-a602469a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;BranchNode&quot;,&quot;elementRole&quot;:&quot;no&quot;,&quot;loc&quot;:{&quot;line&quot;:261,&quot;column&quot;:7}}"/>
      <span
        style={{
          position: 'absolute',
          right: -22,
          top: '65%',
          fontSize: 9,
          color: '#ef4444',
          fontWeight: 500,
        }}
       data-qoder-id="qel-span-6d780722" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-6d780722&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;BranchNode&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:267,&quot;column&quot;:7}}">
        N
      </span>
    </div>
  );
}

function ParallelNode({ data, selected }) {
  const c = nodeColorMap.asynchronous || nodeColorMap.parallel || '#06b6d4';
  const IconComp = iconComponents.GitMerge;
  return (
    <div style={{ position: 'relative', width: 140, height: 110 }} data-qoder-id="qel-div-0037005e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-0037005e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;ParallelNode&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:287,&quot;column&quot;:5}}">
      <Handle type="target" position={Position.Left} id="target" style={{ background: c, top: '50%' }}  data-qoder-id="qel-target-a8474db0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-target-a8474db0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;ParallelNode&quot;,&quot;elementRole&quot;:&quot;target&quot;,&quot;loc&quot;:{&quot;line&quot;:288,&quot;column&quot;:7}}"/>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 76,
          height: 76,
          transform: 'translate(-50%, -50%) rotate(45deg)',
          background: `color-mix(in srgb, ${c} 10%, var(--surface))`,
          border: `1.5px solid color-mix(in srgb, ${c} 60%, transparent)`,
          borderRadius: 6,
          boxShadow: selected ? `0 0 0 2px color-mix(in srgb, ${c} 50%, transparent)` : 'none',
          transition: 'box-shadow 0.15s ease',
        }}
       data-qoder-id="qel-div-fe36fd38" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-fe36fd38&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;ParallelNode&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:289,&quot;column&quot;:7}}"/>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          pointerEvents: 'none',
        }}
       data-qoder-id="qel-div-ff36fecb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ff36fecb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;ParallelNode&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:304,&quot;column&quot;:7}}">
        <IconComp size={16} style={{ color: c }}  data-qoder-id="qel-iconcomp-36704ce6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-iconcomp-36704ce6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;ParallelNode&quot;,&quot;elementRole&quot;:&quot;iconcomp&quot;,&quot;loc&quot;:{&quot;line&quot;:317,&quot;column&quot;:9}}"/>
        <span style={{ fontSize: 10, fontWeight: 500, color: c, whiteSpace: 'nowrap' }} data-qoder-id="qel-span-3c2da219" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-3c2da219&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;ParallelNode&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:318,&quot;column&quot;:9}}">
          {data.label || '并行'}
        </span>
      </div>
      <Handle type="source" position={Position.Right} id="a" style={{ background: c, top: '30%', right: -4 }}  data-qoder-id="qel-a-f029f27c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-a-f029f27c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;ParallelNode&quot;,&quot;elementRole&quot;:&quot;a&quot;,&quot;loc&quot;:{&quot;line&quot;:322,&quot;column&quot;:7}}"/>
      <Handle type="source" position={Position.Right} id="b" style={{ background: c, top: '70%', right: -4 }}  data-qoder-id="qel-b-e1c2a30c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-b-e1c2a30c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;ParallelNode&quot;,&quot;elementRole&quot;:&quot;b&quot;,&quot;loc&quot;:{&quot;line&quot;:323,&quot;column&quot;:7}}"/>
    </div>
  );
}

function LoopNode({ data, selected }) {
  const c = nodeColorMap.while || nodeColorMap.loop || '#eab308';
  const IconComp = iconComponents.RefreshCw;
  return (
    <div style={{ position: 'relative', width: 140, height: 120 }} data-qoder-id="qel-div-5336c678" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-5336c678&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;LoopNode&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:332,&quot;column&quot;:5}}">
      <Handle type="target" position={Position.Left} id="target" style={{ background: c, top: '50%' }}  data-qoder-id="qel-target-ba1b93f2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-target-ba1b93f2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;LoopNode&quot;,&quot;elementRole&quot;:&quot;target&quot;,&quot;loc&quot;:{&quot;line&quot;:333,&quot;column&quot;:7}}"/>
      <div
        style={{
          position: 'absolute',
          top: '45%',
          left: '50%',
          width: 76,
          height: 76,
          transform: 'translate(-50%, -50%) rotate(45deg)',
          background: `color-mix(in srgb, ${c} 10%, var(--surface))`,
          border: `1.5px solid color-mix(in srgb, ${c} 60%, transparent)`,
          borderRadius: 6,
          boxShadow: selected ? `0 0 0 2px color-mix(in srgb, ${c} 50%, transparent)` : 'none',
          transition: 'box-shadow 0.15s ease',
        }}
       data-qoder-id="qel-div-5936cfea" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-5936cfea&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;LoopNode&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:334,&quot;column&quot;:7}}"/>
      <div
        style={{
          position: 'absolute',
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          pointerEvents: 'none',
        }}
       data-qoder-id="qel-div-5a36d17d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-5a36d17d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;LoopNode&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:349,&quot;column&quot;:7}}">
        <IconComp size={16} style={{ color: c }}  data-qoder-id="qel-iconcomp-d497604c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-iconcomp-d497604c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;LoopNode&quot;,&quot;elementRole&quot;:&quot;iconcomp&quot;,&quot;loc&quot;:{&quot;line&quot;:362,&quot;column&quot;:9}}"/>
        <span style={{ fontSize: 10, fontWeight: 500, color: c, whiteSpace: 'nowrap' }} data-qoder-id="qel-span-bff45d63" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-bff45d63&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;LoopNode&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:363,&quot;column&quot;:9}}">
          {data.label || '循环'}
        </span>
      </div>
      <Handle type="source" position={Position.Right} id="body" style={{ background: c, top: '45%', right: -4 }}  data-qoder-id="qel-body-9c4dcf08" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-body-9c4dcf08&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;LoopNode&quot;,&quot;elementRole&quot;:&quot;body&quot;,&quot;loc&quot;:{&quot;line&quot;:367,&quot;column&quot;:7}}"/>
      <Handle type="source" position={Position.Bottom} id="done" style={{ background: c, bottom: -4, left: '50%' }}  data-qoder-id="qel-done-37c7da97" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-done-37c7da97&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;LoopNode&quot;,&quot;elementRole&quot;:&quot;done&quot;,&quot;loc&quot;:{&quot;line&quot;:368,&quot;column&quot;:7}}"/>
    </div>
  );
}

// Generate nodeTypes map dynamically: circle/diamond shapes get custom components,
// all rect types use GenericRectNode
const nodeTypes = {
  interface: CircleNode,
  manual_trigger: CircleNode,
  schedule_trigger: CircleNode,
  if: BranchNode,
  switch: BranchNode,
  while: LoopNode,
  do_while: LoopNode,
  loop_items: LoopNode,
};

// Add all rect-shaped node types dynamically
nodeTypeDefinitions.forEach((cat) => {
  cat.items.forEach((item) => {
    if (item.shape === 'rect' && !nodeTypes[item.type]) {
      nodeTypes[item.type] = GenericRectNode({ type: item.type });
    }
  });
});

// ============================================================================
// Main Editor Component
// ============================================================================

export default function DecisionFlowEditor(qoderProps) {
  const navigate = useNavigate();
  const { id, wsId } = useParams();

  // Load flow data from API
  const [flowData, setFlowData] = useState(null);
  const [flowLoading, setFlowLoading] = useState(id && id !== 'new');

  useEffect(() => {
    if (id && id !== 'new') {
      api.get(`/flows/${id}`).then(data => {
        setFlowData(data);
        setFlowLoading(false);
      }).catch(() => setFlowLoading(false));
    } else {
      setFlowLoading(false);
    }
  }, [id]);

  // Flow-level state
  const [flowName, setFlowName] = useState('未命名流程');
  const [flowDescription, setFlowDescription] = useState('');

  // Sync state when flowData loads
  useEffect(() => {
    if (flowData) {
      setFlowName(flowData.name || '未命名流程');
      setFlowDescription(flowData.description || '');
    }
  }, [flowData]);

  // Flow blocks state (ordered vertical chain between Input and Output)
  const [flowBlocks, setFlowBlocks] = useState([]);

  useEffect(() => {
    if (flowData?.nodes) {
      setFlowBlocks(
        flowData.nodes
          .filter((n) => n.type !== 'end')
          .map((n) => ({
            id: n.id,
            type: n.type,
            label: n.data?.label || n.type,
            config: n.data?.config || {},
            fixed: n.type === 'start' || n.type === 'interface',
          }))
      );
    }
  }, [flowData]);

  // Picker state
  const [pickerState, setPickerState] = useState({ visible: false, afterId: null });
  const [pickerCats, setPickerCats] = useState(() => {
    const m = {};
    nodeTypeDefinitions.forEach((c) => { m[c.category] = true; });
    return m;
  });

  // Test mode state
  const [testMode, setTestMode] = useState(false);

  // Input params (editable)
  const [flowInputParams, setFlowInputParams] = useState([
    { name: 'applicant_id', type: 'string', required: true },
    { name: 'credit_data', type: 'object', required: true },
    { name: 'score', type: 'number', required: false },
  ]);

  const [flowOutputParams] = useState([
    { name: 'decision', type: 'string' },
    { name: 'score', type: 'number' },
  ]);

  // Node/Edge state from flow data
  const initialNodes = useMemo(
    () =>
      (flowData?.nodes || []).map((n) => ({
        ...n,
        selected: false,
      })),
    [flowData]
  );
  const initialEdges = useMemo(
    () =>
      (flowData?.edges || []).map((e) => ({
        ...e,
        animated: true,
        style: { stroke: 'var(--fg-4)', strokeDasharray: '5 3', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
      })),
    [flowData]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // ReactFlow instance ref (for zoom/fitView controls)
  const rfInstanceRef = useRef(null);
  const containerRef = useRef(null);

  // Undo/Redo history
  const historyRef = useRef({ past: [], future: [] });

  const pushHistory = useCallback(() => {
    historyRef.current.past.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });
    // Keep max 50 snapshots
    if (historyRef.current.past.length > 50) historyRef.current.past.shift();
    historyRef.current.future = [];
  }, [nodes, edges]);

  const handleUndo = useCallback(() => {
    if (historyRef.current.past.length === 0) return;
    const prev = historyRef.current.past.pop();
    historyRef.current.future.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });
    setNodes(prev.nodes);
    setEdges(prev.edges);
  }, [nodes, edges, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    if (historyRef.current.future.length === 0) return;
    const next = historyRef.current.future.pop();
    historyRef.current.past.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });
    setNodes(next.nodes);
    setEdges(next.edges);
  }, [nodes, edges, setNodes, setEdges]);

  const handleSave = async () => {
    try {
      const flowPayload = {
        id: id === 'new' ? `flow-${Date.now()}` : id,
        name: flowName,
        description: flowDescription,
        status: 'draft',
        nodes: flowBlocks.map(b => ({
          id: b.id, type: b.type,
          position: { x: 0, y: 0 },
          data: { label: b.label, config: b.config }
        })),
        edges: [],
        node_count: flowBlocks.length,
      };
      if (id === 'new') {
        const result = await api.post('/flows/', flowPayload);
        navigate(`/w/${wsId}/decision-flow/${result.id}`, { replace: true });
      } else {
        await api.put(`/flows/${id}`, flowPayload);
      }
      alert('保存成功');
    } catch (err) {
      alert('保存失败: ' + err.message);
    }
  };

  const handleZoomIn = useCallback(() => {
    rfInstanceRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    rfInstanceRef.current?.zoomOut();
  }, []);

  const handleFitView = useCallback(() => {
    rfInstanceRef.current?.fitView({ padding: 0.2 });
  }, []);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    // If already in CSS fullscreen mode, exit
    if (isFullscreen) {
      el.style.position = '';
      el.style.top = '';
      el.style.left = '';
      el.style.right = '';
      el.style.bottom = '';
      el.style.zIndex = '';
      el.style.background = '';
      setIsFullscreen(false);
      // Re-fit view after exiting fullscreen
      setTimeout(() => rfInstanceRef.current?.fitView({ padding: 0.2 }), 100);
      return;
    }

    // Try native Fullscreen API first
    if (el.requestFullscreen) {
      el.requestFullscreen().then(() => {
        const onExit = () => {
          setIsFullscreen(false);
          document.removeEventListener('fullscreenchange', onExit);
        };
        document.addEventListener('fullscreenchange', onExit);
      }).catch(() => {
        // Fallback to CSS fullscreen (for iframe contexts)
        el.style.position = 'fixed';
        el.style.top = '0';
        el.style.left = '0';
        el.style.right = '0';
        el.style.bottom = '0';
        el.style.zIndex = '99999';
        el.style.background = 'var(--bg)';
        setIsFullscreen(true);
        setTimeout(() => rfInstanceRef.current?.fitView({ padding: 0.2 }), 100);
      });
    } else {
      // No Fullscreen API available — use CSS fullscreen
      el.style.position = 'fixed';
      el.style.top = '0';
      el.style.left = '0';
      el.style.right = '0';
      el.style.bottom = '0';
      el.style.zIndex = '99999';
      el.style.background = 'var(--bg)';
      setIsFullscreen(true);
      setTimeout(() => rfInstanceRef.current?.fitView({ padding: 0.2 }), 100);
    }
  }, [isFullscreen]);

  // Selection state
  const [selectedNode, setSelectedNode] = useState(null);

  // API-driven data for node property panels
  const [optModels, setOptModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [apiOntologies, setApiOntologies] = useState([]);
  const [loadingOntologies, setLoadingOntologies] = useState(false);

  // Fetch optimization models from API
  useEffect(() => {
    let cancelled = false;
    async function fetchModels() {
      setLoadingModels(true);
      try {
        const data = await api.get('/optimization/');
        if (!cancelled) setOptModels(data || []);
      } catch (err) {
        console.warn('Failed to load optimization models:', err);
      } finally {
        if (!cancelled) setLoadingModels(false);
      }
    }
    fetchModels();
    return () => { cancelled = true; };
  }, []);

  // Fetch ontologies from API (for object_access / action nodes)
  useEffect(() => {
    let cancelled = false;
    async function fetchOntologies() {
      setLoadingOntologies(true);
      try {
        const data = await api.get('/ontology/');
        if (!cancelled) setApiOntologies(data || []);
      } catch (err) {
        console.warn('Failed to load ontologies:', err);
      } finally {
        if (!cancelled) setLoadingOntologies(false);
      }
    }
    fetchOntologies();
    return () => { cancelled = true; };
  }, []);

  // Component panel collapsible categories
  const [expandedCats, setExpandedCats] = useState(() => {
    const init = {};
    nodeTypeDefinitions.forEach((cat) => {
      init[cat.category] = true;
    });
    return init;
  });

  // Handlers
  const onConnect = useCallback(
    (params) => {
      pushHistory();
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: {
              stroke: 'var(--fg-4)',
              strokeDasharray: '5 3',
              strokeWidth: 1.5,
            },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
          },
          eds
        )
      );
    },
    [setEdges, pushHistory]
  );

  const handleNodeClick = useCallback((_event, node) => {
    setSelectedNode(node);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleAddNode = useCallback(
    (type) => {
      pushHistory();
      nodeCounter += 1;
      const def = nodeDefMap[type];
      const newNode = {
        id: `node-${nodeCounter}`,
        type,
        position: { x: 200 + Math.random() * 300, y: 100 + Math.random() * 250 },
        data: {
          label: def ? def.label : type,
          config: {},
        },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes, pushHistory]
  );

  const toggleCat = useCallback((cat) => {
    setExpandedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }, []);

  const handleNodeLabelChange = useCallback(
    (newLabel) => {
      if (!selectedNode) return;
      // Update flowBlocks (new vertical layout)
      setFlowBlocks((prev) =>
        prev.map((b) => (b.id === selectedNode.id ? { ...b, label: newLabel } : b))
      );
      // Also update legacy React Flow nodes for backward compat
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedNode.id
            ? { ...n, data: { ...n.data, label: newLabel } }
            : n
        )
      );
      setSelectedNode((prev) =>
        prev ? { ...prev, data: { ...prev.data, label: newLabel } } : null
      );
    },
    [selectedNode, setNodes]
  );

  // =========================================================================
  // Flow Block Handlers (vertical flow layout)
  // =========================================================================

  const handleAddBlock = useCallback((type, afterId) => {
    pushHistory();
    nodeCounter += 1;
    const def = nodeDefMap[type];
    const newBlock = {
      id: `node-${nodeCounter}`,
      type,
      label: def ? def.label : type,
      config: {},
    };
    setFlowBlocks((prev) => {
      if (afterId === null) return [newBlock, ...prev];
      const idx = prev.findIndex((b) => b.id === afterId);
      if (idx === -1) return [...prev, newBlock];
      const next = [...prev];
      next.splice(idx + 1, 0, newBlock);
      return next;
    });
    setPickerState({ visible: false, afterId: null });
  }, [pushHistory]);

  const handleRemoveBlock = useCallback((blockId) => {
    pushHistory();
    setFlowBlocks((prev) => prev.filter((b) => b.id !== blockId));
    if (selectedNode && selectedNode.id === blockId) setSelectedNode(null);
  }, [pushHistory, selectedNode]);

  const handleBlockClick = useCallback((block) => {
    setSelectedNode({ id: block.id, type: block.type, data: { label: block.label, config: block.config } });
  }, []);

  const handleBlockLabelChange = useCallback((blockId, newLabel) => {
    setFlowBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, label: newLabel } : b))
    );
    setSelectedNode((prev) =>
      prev && prev.id === blockId ? { ...prev, data: { ...prev.data, label: newLabel } } : prev
    );
  }, []);

  const handleAddInputParam = useCallback(() => {
    setFlowInputParams((prev) => [...prev, { name: `param_${prev.length + 1}`, type: 'string', required: false }]);
  }, []);

  const handleRemoveInputParam = useCallback((idx) => {
    setFlowInputParams((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleInputParamChange = useCallback((idx, field, value) => {
    setFlowInputParams((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
    );
  }, []);

  // =========================================================================
  // RENDER: Block Picker Popover
  // =========================================================================

  const renderBlockPicker = () => {
    if (!pickerState.visible) return null;
    return (
      <div className="flow-block-picker" data-qoder-id="qel-flow-block-picker-fc599e0d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-block-picker-fc599e0d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-block-picker&quot;,&quot;loc&quot;:{&quot;line&quot;:762,&quot;column&quot;:7}}">
        <div className="flow-block-picker-header" data-qoder-id="qel-flow-block-picker-header-2b045e12" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-block-picker-header-2b045e12&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-block-picker-header&quot;,&quot;loc&quot;:{&quot;line&quot;:763,&quot;column&quot;:9}}">添加流程块</div>
        {nodeTypeDefinitions.map((cat) => (
          <div key={cat.category} data-qoder-id="qel-div-a6381e8d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-a6381e8d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:765,&quot;column&quot;:11}}">
            <button
              className="flow-block-picker-cat"
              onClick={() => setPickerCats((prev) => ({ ...prev, [cat.category]: !prev[cat.category] }))}
             data-qoder-id="qel-flow-block-picker-cat-f0afb5c4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-block-picker-cat-f0afb5c4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-block-picker-cat&quot;,&quot;loc&quot;:{&quot;line&quot;:766,&quot;column&quot;:13}}">
              {pickerCats[cat.category] ? <ChevronDown size={10}  data-qoder-id="qel-chevrondown-911276b7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chevrondown-911276b7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;chevrondown&quot;,&quot;loc&quot;:{&quot;line&quot;:770,&quot;column&quot;:43}}"/> : <ChevronRight size={10}  data-qoder-id="qel-chevronright-7a5adf52" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chevronright-7a5adf52&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;chevronright&quot;,&quot;loc&quot;:{&quot;line&quot;:770,&quot;column&quot;:71}}"/>}
              <span data-qoder-id="qel-span-91e7c045" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-91e7c045&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:771,&quot;column&quot;:15}}">{cat.category}</span>
            </button>
            {pickerCats[cat.category] && (
              <div className="flow-block-picker-items" data-qoder-id="qel-flow-block-picker-items-810fe1af" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-block-picker-items-810fe1af&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-block-picker-items&quot;,&quot;loc&quot;:{&quot;line&quot;:774,&quot;column&quot;:15}}">
                {cat.items.map((item) => {
                  const IconComp = iconComponents[item.icon];
                  return (
                    <div
                      key={item.type}
                      className="flow-block-picker-item"
                      onClick={() => handleAddBlock(item.type, pickerState.afterId)}
                     data-qoder-id="qel-flow-block-picker-item-2cf811f4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-block-picker-item-2cf811f4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-block-picker-item&quot;,&quot;loc&quot;:{&quot;line&quot;:778,&quot;column&quot;:21}}">
                      {IconComp && <IconComp size={13} style={{ color: item.color }}  data-qoder-id="qel-iconcomp-18272537" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-iconcomp-18272537&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;iconcomp&quot;,&quot;loc&quot;:{&quot;line&quot;:783,&quot;column&quot;:36}}"/>}
                      <span data-qoder-id="qel-span-95e587fa" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-95e587fa&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:784,&quot;column&quot;:23}}">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // =========================================================================
  // RENDER: Input Panel (fixed top)
  // =========================================================================

  const renderInputPanel = () => (
    <div className="flow-io-panel flow-input-panel" onClick={(e) => e.stopPropagation()} data-qoder-id="qel-flow-io-panel-ff39dbdc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-io-panel-ff39dbdc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-io-panel&quot;,&quot;loc&quot;:{&quot;line&quot;:801,&quot;column&quot;:5}}">
      <div className="flow-io-panel-header" data-qoder-id="qel-flow-io-panel-header-b3523bd3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-io-panel-header-b3523bd3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-io-panel-header&quot;,&quot;loc&quot;:{&quot;line&quot;:802,&quot;column&quot;:7}}">
        <div className="flow-io-badge input" data-qoder-id="qel-flow-io-badge-a75814f5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-io-badge-a75814f5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-io-badge&quot;,&quot;loc&quot;:{&quot;line&quot;:803,&quot;column&quot;:9}}">
          <ArrowDownUp size={11}  data-qoder-id="qel-arrowdownup-110fbf16" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-arrowdownup-110fbf16&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;arrowdownup&quot;,&quot;loc&quot;:{&quot;line&quot;:804,&quot;column&quot;:11}}"/>
          <span data-qoder-id="qel-span-92e58341" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-92e58341&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:805,&quot;column&quot;:11}}">输入</span>
        </div>
        <span className="flow-io-desc" data-qoder-id="qel-flow-io-desc-40464d85" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-io-desc-40464d85&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-io-desc&quot;,&quot;loc&quot;:{&quot;line&quot;:807,&quot;column&quot;:9}}">定义流程的输入参数</span>
      </div>
      <div className="flow-io-table" data-qoder-id="qel-flow-io-table-a133a744" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-io-table-a133a744&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-io-table&quot;,&quot;loc&quot;:{&quot;line&quot;:809,&quot;column&quot;:7}}">
        <div className="flow-io-table-header" data-qoder-id="qel-flow-io-table-header-999967e2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-io-table-header-999967e2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-io-table-header&quot;,&quot;loc&quot;:{&quot;line&quot;:810,&quot;column&quot;:9}}">
          <span style={{ flex: 2 }} data-qoder-id="qel-span-04ecf27c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-04ecf27c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:811,&quot;column&quot;:11}}">变量名</span>
          <span style={{ flex: 1 }} data-qoder-id="qel-span-07ecf735" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-07ecf735&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:812,&quot;column&quot;:11}}">类型</span>
          <span style={{ width: 52, textAlign: 'center' }} data-qoder-id="qel-span-06ecf5a2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-06ecf5a2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:813,&quot;column&quot;:11}}">必填</span>
          <span style={{ width: 28 }}  data-qoder-id="qel-span-01ecedc3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-01ecedc3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:814,&quot;column&quot;:11}}"/>
        </div>
        {flowInputParams.map((p, idx) => (
          <div key={idx} className="flow-io-table-row" data-qoder-id="qel-flow-io-table-row-e464bb14" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-io-table-row-e464bb14&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-io-table-row&quot;,&quot;loc&quot;:{&quot;line&quot;:817,&quot;column&quot;:11}}">
            <span style={{ flex: 2 }} data-qoder-id="qel-span-03ecf0e9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-03ecf0e9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:818,&quot;column&quot;:13}}">
              <input
                className="flow-io-inline-input"
                value={p.name}
                onChange={(e) => handleInputParamChange(idx, 'name', e.target.value)}
               data-qoder-id="qel-flow-io-inline-input-300617be" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-io-inline-input-300617be&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-io-inline-input&quot;,&quot;loc&quot;:{&quot;line&quot;:819,&quot;column&quot;:15}}"/>
            </span>
            <span style={{ flex: 1 }} data-qoder-id="qel-span-0ded00a7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-0ded00a7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:825,&quot;column&quot;:13}}">
              <select
                className="flow-io-inline-select"
                value={p.type}
                onChange={(e) => handleInputParamChange(idx, 'type', e.target.value)}
               data-qoder-id="qel-flow-io-inline-select-1c294fa8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-io-inline-select-1c294fa8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-io-inline-select&quot;,&quot;loc&quot;:{&quot;line&quot;:826,&quot;column&quot;:15}}">
                <option value="string" data-qoder-id="qel-option-a1e47f4c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-option-a1e47f4c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;option&quot;,&quot;loc&quot;:{&quot;line&quot;:831,&quot;column&quot;:17}}">"" String</option>
                <option value="number" data-qoder-id="qel-option-a2e480df" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-option-a2e480df&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;option&quot;,&quot;loc&quot;:{&quot;line&quot;:832,&quot;column&quot;:17}}">123 Number</option>
                <option value="boolean" data-qoder-id="qel-option-a3e48272" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-option-a3e48272&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;option&quot;,&quot;loc&quot;:{&quot;line&quot;:833,&quot;column&quot;:17}}">☐ Boolean</option>
                <option value="object" data-qoder-id="qel-option-a4e48405" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-option-a4e48405&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;option&quot;,&quot;loc&quot;:{&quot;line&quot;:834,&quot;column&quot;:17}}">{}  Object</option>
                <option value="array" data-qoder-id="qel-option-9de47900" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-option-9de47900&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;option&quot;,&quot;loc&quot;:{&quot;line&quot;:835,&quot;column&quot;:17}}">[] Array</option>
                <option value="date" data-qoder-id="qel-option-9ee47a93" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-option-9ee47a93&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;option&quot;,&quot;loc&quot;:{&quot;line&quot;:836,&quot;column&quot;:17}}">📅 Date</option>
              </select>
            </span>
            <span style={{ width: 52, textAlign: 'center' }} data-qoder-id="qel-span-01eaaf2c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-01eaaf2c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:839,&quot;column&quot;:13}}">
              <label className="flow-io-toggle" data-qoder-id="qel-flow-io-toggle-7e6fece1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-io-toggle-7e6fece1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-io-toggle&quot;,&quot;loc&quot;:{&quot;line&quot;:840,&quot;column&quot;:15}}">
                <input
                  type="checkbox"
                  checked={p.required}
                  onChange={(e) => handleInputParamChange(idx, 'required', e.target.checked)}
                 data-qoder-id="qel-input-66ab9f06" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-66ab9f06&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:841,&quot;column&quot;:17}}"/>
                <span className="flow-io-toggle-track"  data-qoder-id="qel-flow-io-toggle-track-75a5debd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-io-toggle-track-75a5debd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-io-toggle-track&quot;,&quot;loc&quot;:{&quot;line&quot;:846,&quot;column&quot;:17}}"/>
              </label>
            </span>
            <span style={{ width: 28, textAlign: 'center' }} data-qoder-id="qel-span-91f24da1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-91f24da1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:849,&quot;column&quot;:13}}">
              <button
                className="flow-io-remove-btn"
                onClick={() => handleRemoveInputParam(idx)}
                title="移除"
               data-qoder-id="qel-flow-io-remove-btn-68abcaf3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-io-remove-btn-68abcaf3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-io-remove-btn&quot;,&quot;loc&quot;:{&quot;line&quot;:850,&quot;column&quot;:15}}">×</button>
            </span>
          </div>
        ))}
      </div>
      <button className="flow-io-add-btn" onClick={handleAddInputParam} data-qoder-id="qel-flow-io-add-btn-ac6827a1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-io-add-btn-ac6827a1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-io-add-btn&quot;,&quot;loc&quot;:{&quot;line&quot;:859,&quot;column&quot;:7}}">
        + 添加输入参数
      </button>
    </div>
  );

  // =========================================================================
  // RENDER: Output Panel (fixed bottom)
  // =========================================================================

  const renderOutputPanel = () => (
    <div className="flow-io-panel flow-output-panel" onClick={(e) => e.stopPropagation()} data-qoder-id="qel-flow-io-panel-f7197b99" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-io-panel-f7197b99&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-io-panel&quot;,&quot;loc&quot;:{&quot;line&quot;:870,&quot;column&quot;:5}}">
      <div className="flow-io-panel-header" data-qoder-id="qel-flow-io-panel-header-4559dd6e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-io-panel-header-4559dd6e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-io-panel-header&quot;,&quot;loc&quot;:{&quot;line&quot;:871,&quot;column&quot;:7}}">
        <div className="flow-io-badge output" data-qoder-id="qel-flow-io-badge-a364da9c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-io-badge-a364da9c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-io-badge&quot;,&quot;loc&quot;:{&quot;line&quot;:872,&quot;column&quot;:9}}">
          <ArrowDownUp size={11}  data-qoder-id="qel-arrowdownup-92f4b53f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-arrowdownup-92f4b53f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;arrowdownup&quot;,&quot;loc&quot;:{&quot;line&quot;:873,&quot;column&quot;:11}}"/>
          <span data-qoder-id="qel-span-92f24f34" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-92f24f34&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:874,&quot;column&quot;:11}}">输出</span>
        </div>
        <span className="flow-io-desc" data-qoder-id="qel-flow-io-desc-b24dbcc0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-io-desc-b24dbcc0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-io-desc&quot;,&quot;loc&quot;:{&quot;line&quot;:876,&quot;column&quot;:9}}">流程执行后返回的输出值</span>
      </div>
      <div className="flow-io-table" data-qoder-id="qel-flow-io-table-253b32d5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-io-table-253b32d5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-io-table&quot;,&quot;loc&quot;:{&quot;line&quot;:878,&quot;column&quot;:7}}">
        {flowOutputParams.map((p, idx) => (
          <div key={idx} className="flow-io-table-row" style={{ padding: '6px 10px' }} data-qoder-id="qel-flow-io-table-row-577b366c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-io-table-row-577b366c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-io-table-row&quot;,&quot;loc&quot;:{&quot;line&quot;:880,&quot;column&quot;:11}}">
            <span style={{ flex: 2, fontFamily: "'JetBrains Mono', monospace", color: '#16a34a', fontSize: 12 }} data-qoder-id="qel-span-0cef3dab" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-0cef3dab&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:881,&quot;column&quot;:13}}">{p.name}</span>
            <span style={{ flex: 1 }} data-qoder-id="qel-span-0def3f3e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-0def3f3e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:882,&quot;column&quot;:13}}">
              <span className="flow-io-type-badge" data-qoder-id="qel-flow-io-type-badge-02ab13c1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-io-type-badge-02ab13c1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-io-type-badge&quot;,&quot;loc&quot;:{&quot;line&quot;:883,&quot;column&quot;:15}}">{p.type}</span>
            </span>
          </div>
        ))}
      </div>
      <button className="flow-io-add-btn" onClick={() => {}} data-qoder-id="qel-flow-io-add-btn-20650ca6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-io-add-btn-20650ca6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-io-add-btn&quot;,&quot;loc&quot;:{&quot;line&quot;:888,&quot;column&quot;:7}}">
        + 添加输出参数
      </button>
    </div>
  );

  // =========================================================================
  // RENDER: Flow Block Card
  // =========================================================================

  const renderFlowBlock = (block, index) => {
    const def = nodeDefMap[block.type];
    const color = def ? def.color : '#94a3b8';
    const IconComp = def ? iconComponents[def.icon] : null;
    const isSelected = selectedNode && selectedNode.id === block.id;
    const subtitle = nodeSubtitles[block.type] || '';

    return (
      <div
        key={block.id}
        className={`flow-block-card${isSelected ? ' selected' : ''}`}
        style={{
          borderColor: isSelected ? color : 'var(--border)',
          boxShadow: isSelected ? `0 0 0 1px ${color}33, 0 1px 3px rgba(0,0,0,0.06)` : '0 1px 2px rgba(0,0,0,0.04)',
        }}
        onClick={(e) => { e.stopPropagation(); handleBlockClick(block); }}
       data-qoder-id="qel-div-212c143b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-212c143b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:906,&quot;column&quot;:7}}">
        <div className="flow-block-card-color" style={{ background: color }}  data-qoder-id="qel-flow-block-card-color-6013d54e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-block-card-color-6013d54e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-block-card-color&quot;,&quot;loc&quot;:{&quot;line&quot;:915,&quot;column&quot;:9}}"/>
        <div className="flow-block-card-content" data-qoder-id="qel-flow-block-card-content-38b4ca7f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-block-card-content-38b4ca7f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-block-card-content&quot;,&quot;loc&quot;:{&quot;line&quot;:916,&quot;column&quot;:9}}">
          <div className="flow-block-card-header" data-qoder-id="qel-flow-block-card-header-c648183e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-block-card-header-c648183e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-block-card-header&quot;,&quot;loc&quot;:{&quot;line&quot;:917,&quot;column&quot;:11}}">
            <div className="flow-block-card-icon" style={{ color }} data-qoder-id="qel-flow-block-card-icon-916584c5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-block-card-icon-916584c5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-block-card-icon&quot;,&quot;loc&quot;:{&quot;line&quot;:918,&quot;column&quot;:13}}">
              {IconComp && <IconComp size={15}  data-qoder-id="qel-iconcomp-4b029990" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-iconcomp-4b029990&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;iconcomp&quot;,&quot;loc&quot;:{&quot;line&quot;:919,&quot;column&quot;:28}}"/>}
            </div>
            <span className="flow-block-card-label" data-qoder-id="qel-flow-block-card-label-133c173b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-block-card-label-133c173b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-block-card-label&quot;,&quot;loc&quot;:{&quot;line&quot;:921,&quot;column&quot;:13}}">{block.label}</span>
            {subtitle && <span className="flow-block-card-subtitle" data-qoder-id="qel-flow-block-card-subtitle-50980542" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-block-card-subtitle-50980542&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-block-card-subtitle&quot;,&quot;loc&quot;:{&quot;line&quot;:922,&quot;column&quot;:26}}">{subtitle}</span>}
            <div style={{ flex: 1 }}  data-qoder-id="qel-div-2f02015d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-2f02015d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:923,&quot;column&quot;:13}}"/>
            <span className="flow-block-card-type" data-qoder-id="qel-flow-block-card-type-853caa54" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-block-card-type-853caa54&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-block-card-type&quot;,&quot;loc&quot;:{&quot;line&quot;:924,&quot;column&quot;:13}}">{def ? def.label : block.type}</span>
            {block.fixed ? (
              <span className="flow-block-card-fixed-badge" data-qoder-id="qel-flow-block-card-fixed-badge-e251d639" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-block-card-fixed-badge-e251d639&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-block-card-fixed-badge&quot;,&quot;loc&quot;:{&quot;line&quot;:937,&quot;column&quot;:15}}">固定</span>
            ) : (
              <button
                className="flow-block-card-delete"
                onClick={(e) => { e.stopPropagation(); handleRemoveBlock(block.id); }}
                title="删除"
               data-qoder-id="qel-flow-block-card-delete-76d6ec0c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-block-card-delete-76d6ec0c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-block-card-delete&quot;,&quot;loc&quot;:{&quot;line&quot;:925,&quot;column&quot;:13}}">×</button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // RENDER: Add Button between blocks
  // =========================================================================

  const renderAddButton = (afterId) => {
    const isActive = pickerState.visible && pickerState.afterId === afterId;
    return (
      <div className="flow-add-node-wrapper" onClick={(e) => e.stopPropagation()} data-qoder-id="qel-flow-add-node-wrapper-39947dbe" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-add-node-wrapper-39947dbe&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-add-node-wrapper&quot;,&quot;loc&quot;:{&quot;line&quot;:943,&quot;column&quot;:7}}">
        <div className="flow-add-node-line"  data-qoder-id="qel-flow-add-node-line-8d74301c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-add-node-line-8d74301c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-add-node-line&quot;,&quot;loc&quot;:{&quot;line&quot;:944,&quot;column&quot;:9}}"/>
        <button
          className={`flow-add-node-btn${isActive ? ' active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setPickerState(isActive ? { visible: false, afterId: null } : { visible: true, afterId });
          }}
          title="添加流程块"
         data-qoder-id="qel-button-cb7f38b4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-cb7f38b4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:945,&quot;column&quot;:9}}">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" data-qoder-id="qel-svg-45409553" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-45409553&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:953,&quot;column&quot;:11}}">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" data-qoder-id="qel-path-e8b5d8e3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-e8b5d8e3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:954,&quot;column&quot;:13}}"/>
          </svg>
        </button>
        <div className="flow-add-node-line"  data-qoder-id="qel-flow-add-node-line-07711e93" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-add-node-line-07711e93&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-add-node-line&quot;,&quot;loc&quot;:{&quot;line&quot;:957,&quot;column&quot;:9}}"/>
        {isActive && renderBlockPicker()}
      </div>
    );
  };

  const renderComponentPanel = () => (
    <div className="flow-component-panel" data-qoder-id="qel-flow-component-panel-ec50235b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-component-panel-ec50235b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-component-panel&quot;,&quot;loc&quot;:{&quot;line&quot;:563,&quot;column&quot;:5}}">
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--fg-2)',
          padding: '4px 2px 12px',
          letterSpacing: '-0.01em',
        }}
       data-qoder-id="qel-div-133d4752" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-133d4752&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:564,&quot;column&quot;:7}}">
        节点
      </div>

      {nodeTypeDefinitions.map((cat) => (
        <div key={cat.category} style={{ marginBottom: 6 }} data-qoder-id="qel-div-163d4c0b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-163d4c0b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:577,&quot;column&quot;:9}}">
          <button
            onClick={() => toggleCat(cat.category)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              width: '100%',
              background: 'none',
              border: 'none',
              padding: '4px 2px',
              cursor: 'pointer',
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--fg-4)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
           data-qoder-id="qel-button-c3c4ce90" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-c3c4ce90&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:578,&quot;column&quot;:11}}">
            {expandedCats[cat.category] ? (
              <ChevronDown size={10}  data-qoder-id="qel-chevrondown-1515851a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chevrondown-1515851a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;chevrondown&quot;,&quot;loc&quot;:{&quot;line&quot;:597,&quot;column&quot;:15}}"/>
            ) : (
              <ChevronRight size={10}  data-qoder-id="qel-chevronright-045369cb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chevronright-045369cb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;chevronright&quot;,&quot;loc&quot;:{&quot;line&quot;:599,&quot;column&quot;:15}}"/>
            )}
            {cat.category}
          </button>

          {expandedCats[cat.category] &&
            cat.items.map((item) => (
              <div
                key={item.type}
                className="palette-item"
                onClick={() => handleAddNode(item.type)}
               data-qoder-id="qel-palette-item-d8b0287a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-palette-item-d8b0287a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;palette-item&quot;,&quot;loc&quot;:{&quot;line&quot;:606,&quot;column&quot;:15}}">
                {(() => {
                  const IconComp = iconComponents[item.icon];
                  return IconComp ? (
                    <IconComp
                      size={14}
                      style={{ color: item.color, flexShrink: 0 }}
                     data-qoder-id="qel-iconcomp-942a2702" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-iconcomp-942a2702&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;iconcomp&quot;,&quot;loc&quot;:{&quot;line&quot;:620,&quot;column&quot;:21}}"/>
                  ) : (
                    <div
                      className="palette-dot"
                      style={{ background: item.color }}
                     data-qoder-id="qel-palette-dot-f500c9ae" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-palette-dot-f500c9ae&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;palette-dot&quot;,&quot;loc&quot;:{&quot;line&quot;:625,&quot;column&quot;:21}}"/>
                  );
                })()}
                <span data-qoder-id="qel-span-03eab252" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-03eab252&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:615,&quot;column&quot;:17}}">{item.label}</span>
              </div>
            ))}
        </div>
      ))}
    </div>
  );

  // =========================================================================
  // RENDER: Canvas Toolbar
  // =========================================================================

  const renderToolbar = () => (
    <div className="flow-toolbar" data-qoder-id="qel-flow-toolbar-c700a422" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-toolbar-c700a422&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-toolbar&quot;,&quot;loc&quot;:{&quot;line&quot;:628,&quot;column&quot;:5}}">
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => navigate('/decision-flows')}
        style={{ padding: '4px 6px' }}
       data-qoder-id="qel-btn-492aa8f2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-492aa8f2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:629,&quot;column&quot;:7}}">
        <ArrowLeft size={14}  data-qoder-id="qel-arrowleft-034c4b97" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-arrowleft-034c4b97&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;arrowleft&quot;,&quot;loc&quot;:{&quot;line&quot;:634,&quot;column&quot;:9}}"/>
      </button>

      <div
        style={{
          width: 1,
          height: 20,
          background: 'var(--border)',
          margin: '0 2px',
        }}
       data-qoder-id="qel-div-a03a53b2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-a03a53b2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:637,&quot;column&quot;:7}}"/>

      <input
        className="input"
        value={flowName}
        onChange={(e) => setFlowName(e.target.value)}
        style={{
          width: 200,
          fontSize: 13,
          fontWeight: 500,
          padding: '4px 8px',
          background: 'transparent',
          border: '1px solid transparent',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--primary)';
          e.target.style.background = 'rgba(0,0,0,0.02)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'transparent';
          e.target.style.background = 'transparent';
        }}
       data-qoder-id="qel-input-67aba099" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-67aba099&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:646,&quot;column&quot;:7}}"/>

      <div
        style={{
          width: 1,
          height: 20,
          background: 'var(--border)',
          margin: '0 2px',
        }}
       data-qoder-id="qel-div-2a2e60fd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-2a2e60fd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:668,&quot;column&quot;:7}}"/>

      <button className="btn btn-primary btn-sm" onClick={handleSave} data-qoder-id="qel-btn-dc506134" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-dc506134&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:677,&quot;column&quot;:7}}">
        <Save size={12}  data-qoder-id="qel-save-d9d813f9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-save-d9d813f9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;save&quot;,&quot;loc&quot;:{&quot;line&quot;:678,&quot;column&quot;:9}}"/>
        保存
      </button>
      <button
        className={`btn btn-sm ${testMode ? 'btn-primary' : ''}`}
        onClick={() => setTestMode(!testMode)}
      >
        <Play size={12}/>
        {testMode ? '退出测试' : '测试'}
      </button>

      <div style={{ flex: 1 }}  data-qoder-id="qel-div-252e591e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-252e591e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:686,&quot;column&quot;:7}}"/>

      <button className="btn btn-ghost btn-sm" style={{ padding: '4px 6px' }} onClick={handleZoomOut} title="缩小" data-qoder-id="qel-btn-c62dac50" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-c62dac50&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:765,&quot;column&quot;:7}}">
        <ZoomOut size={14}  data-qoder-id="qel-zoomout-82e2b927" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-zoomout-82e2b927&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;zoomout&quot;,&quot;loc&quot;:{&quot;line&quot;:766,&quot;column&quot;:9}}"/>
      </button>
      <button className="btn btn-ghost btn-sm" style={{ padding: '4px 6px' }} onClick={handleZoomIn} title="放大" data-qoder-id="qel-btn-cc2db5c2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-cc2db5c2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:768,&quot;column&quot;:7}}">
        <ZoomIn size={14}  data-qoder-id="qel-zoomin-5ebc26b9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-zoomin-5ebc26b9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;zoomin&quot;,&quot;loc&quot;:{&quot;line&quot;:769,&quot;column&quot;:9}}"/>
      </button>
      <button className="btn btn-ghost btn-sm" style={{ padding: '4px 6px' }} onClick={handleFullscreen} title={isFullscreen ? "退出全屏" : "全屏"} data-qoder-id="qel-btn-ca2db29c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-ca2db29c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:818,&quot;column&quot;:7}}">
        {isFullscreen ? <Minimize2 size={14}  data-qoder-id="qel-minimize2-91065cd7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-minimize2-91065cd7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;minimize2&quot;,&quot;loc&quot;:{&quot;line&quot;:819,&quot;column&quot;:25}}"/> : <Maximize size={14}  data-qoder-id="qel-maximize-5c5b496c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-maximize-5c5b496c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;maximize&quot;,&quot;loc&quot;:{&quot;line&quot;:819,&quot;column&quot;:51}}"/>}
      </button>

      <div
        style={{
          width: 1,
          height: 20,
          background: 'var(--border)',
          margin: '0 2px',
        }}
       data-qoder-id="qel-div-262c1c1a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-262c1c1a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:698,&quot;column&quot;:7}}"/>

      <button
        className="btn btn-ghost btn-sm"
        style={{ padding: '4px 6px' }}
        onClick={handleUndo}
        title="撤销"
       data-qoder-id="qel-btn-452aa2a6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-452aa2a6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:787,&quot;column&quot;:7}}">
        <Undo2 size={14}  data-qoder-id="qel-undo2-717ebc7b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-undo2-717ebc7b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;undo2&quot;,&quot;loc&quot;:{&quot;line&quot;:793,&quot;column&quot;:9}}"/>
      </button>
      <button
        className="btn btn-ghost btn-sm"
        style={{ padding: '4px 6px' }}
        onClick={handleRedo}
        title="重做"
       data-qoder-id="qel-btn-472aa5cc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-472aa5cc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:795,&quot;column&quot;:7}}">
        <Redo2 size={14}  data-qoder-id="qel-redo2-e3ab4be5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-redo2-e3ab4be5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;redo2&quot;,&quot;loc&quot;:{&quot;line&quot;:801,&quot;column&quot;:9}}"/>
      </button>
    </div>
  );

  // =========================================================================
  // RENDER: Right Property Panel
  // =========================================================================

  const renderPropertyPanel = () => {
    if (selectedNode) {
      return renderNodeProperties();
    }
    return renderFlowProperties();
  };

  const renderFlowProperties = () => (
    <div className="flow-property-panel" data-qoder-id="qel-flow-property-panel-f2567a87" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-property-panel-f2567a87&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-property-panel&quot;,&quot;loc&quot;:{&quot;line&quot;:736,&quot;column&quot;:5}}">
      <div className="prop-section" data-qoder-id="qel-prop-section-e93c65c4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-e93c65c4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-section&quot;,&quot;loc&quot;:{&quot;line&quot;:737,&quot;column&quot;:7}}">
        <div className="prop-section-title" data-qoder-id="qel-prop-section-title-adfd6e4e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-title-adfd6e4e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-section-title&quot;,&quot;loc&quot;:{&quot;line&quot;:738,&quot;column&quot;:9}}">流程属性</div>
        <div className="prop-row" data-qoder-id="qel-prop-row-8ce858df" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-8ce858df&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:739,&quot;column&quot;:9}}">
          <div className="prop-label" data-qoder-id="qel-prop-label-04887c7e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-04887c7e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:740,&quot;column&quot;:11}}">名称</div>
          <div className="prop-value" data-qoder-id="qel-prop-value-f7b90318" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-value-f7b90318&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-value&quot;,&quot;loc&quot;:{&quot;line&quot;:741,&quot;column&quot;:11}}">{flowName}</div>
        </div>
        <div className="prop-row" data-qoder-id="qel-prop-row-8de85a72" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-8de85a72&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:743,&quot;column&quot;:9}}">
          <div className="prop-label" data-qoder-id="qel-prop-label-0988845d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-0988845d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:744,&quot;column&quot;:11}}">描述</div>
          <div className="prop-value" style={{ fontSize: 12 }} data-qoder-id="qel-prop-value-feb90e1d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-value-feb90e1d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-value&quot;,&quot;loc&quot;:{&quot;line&quot;:745,&quot;column&quot;:11}}">
            {flowDescription || flowData?.description || '暂无描述'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16 }} data-qoder-id="qel-div-2a01f97e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-2a01f97e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:749,&quot;column&quot;:9}}">
          <div className="prop-row" style={{ flex: 1 }} data-qoder-id="qel-prop-row-89e85426" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-89e85426&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:750,&quot;column&quot;:11}}">
            <div className="prop-label" data-qoder-id="qel-prop-label-fd887179" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-fd887179&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:751,&quot;column&quot;:13}}">节点</div>
            <div className="prop-value" data-qoder-id="qel-prop-value-f2b8fb39" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-value-f2b8fb39&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-value&quot;,&quot;loc&quot;:{&quot;line&quot;:752,&quot;column&quot;:13}}">
              <span className="badge badge-neutral" data-qoder-id="qel-badge-4ad9bb30" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-4ad9bb30&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:753,&quot;column&quot;:15}}">
                <Hash size={10}  data-qoder-id="qel-hash-a3f267e2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-hash-a3f267e2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;hash&quot;,&quot;loc&quot;:{&quot;line&quot;:754,&quot;column&quot;:17}}"/>
                {flowBlocks.length}
              </span>
            </div>
          </div>
          <div className="prop-row" style={{ flex: 1 }} data-qoder-id="qel-prop-row-84e60db0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-84e60db0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:759,&quot;column&quot;:11}}">
            <div className="prop-label" data-qoder-id="qel-prop-label-02863ac1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-02863ac1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:760,&quot;column&quot;:13}}">连线</div>
            <div className="prop-value" data-qoder-id="qel-prop-value-7bbc117b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-value-7bbc117b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-value&quot;,&quot;loc&quot;:{&quot;line&quot;:761,&quot;column&quot;:13}}">
              <span className="badge badge-neutral" data-qoder-id="qel-badge-4fd9c30f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-4fd9c30f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:762,&quot;column&quot;:15}}">
                <ArrowDownUp size={10}  data-qoder-id="qel-arrowdownup-5a860d87" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-arrowdownup-5a860d87&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;arrowdownup&quot;,&quot;loc&quot;:{&quot;line&quot;:763,&quot;column&quot;:17}}"/>
                {Math.max(0, flowBlocks.length - 1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="prop-section" data-qoder-id="qel-prop-section-352e4f80" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-352e4f80&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-section&quot;,&quot;loc&quot;:{&quot;line&quot;:771,&quot;column&quot;:7}}">
        <div className="prop-section-title" data-qoder-id="qel-prop-section-title-42c72b52" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-title-42c72b52&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-section-title&quot;,&quot;loc&quot;:{&quot;line&quot;:772,&quot;column&quot;:9}}">全局变量</div>
        {globalVars.map((v) => (
          <div
            key={v.name}
            className="prop-row"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
           data-qoder-id="qel-prop-row-8fe61f01" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-8fe61f01&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:774,&quot;column&quot;:11}}">
            <span
              style={{
                fontSize: 12,
                color: 'var(--fg-3)',
                fontFamily: "'JetBrains Mono', monospace",
              }}
             data-qoder-id="qel-span-06ba5a92" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-06ba5a92&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:783,&quot;column&quot;:13}}">
              <Variable
                size={10}
                style={{ marginRight: 4, verticalAlign: 'middle' }}
               data-qoder-id="qel-variable-9be501b1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-variable-9be501b1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;variable&quot;,&quot;loc&quot;:{&quot;line&quot;:790,&quot;column&quot;:15}}"/>
              {v.name}
            </span>
            <span
              style={{
                fontSize: 11,
                color: 'var(--fg-4)',
                fontFamily: "'JetBrains Mono', monospace",
              }}
             data-qoder-id="qel-span-04ba576c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-04ba576c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:796,&quot;column&quot;:13}}">
              {v.value}
            </span>
          </div>
        ))}
      </div>

      <div className="prop-section" data-qoder-id="qel-prop-section-c1316a7b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-c1316a7b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-section&quot;,&quot;loc&quot;:{&quot;line&quot;:809,&quot;column&quot;:7}}">
        <div className="prop-section-title" data-qoder-id="qel-prop-section-title-48c4f62d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-title-48c4f62d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-section-title&quot;,&quot;loc&quot;:{&quot;line&quot;:810,&quot;column&quot;:9}}">输入参数</div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--fg-3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
         data-qoder-id="qel-div-9d072bb5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9d072bb5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:811,&quot;column&quot;:9}}">
          <div style={{ display: 'flex', gap: 8 }} data-qoder-id="qel-div-9a0726fc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9a0726fc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:820,&quot;column&quot;:11}}">
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--primary)',
                flex: 1,
              }}
             data-qoder-id="qel-span-01ba52b3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-01ba52b3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:821,&quot;column&quot;:13}}">
              applicant_id
            </span>
            <span className="badge badge-neutral" style={{ fontSize: 10 }} data-qoder-id="qel-badge-d4e15033" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-d4e15033&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:830,&quot;column&quot;:13}}">
              string
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }} data-qoder-id="qel-div-a1073201" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-a1073201&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:834,&quot;column&quot;:11}}">
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--primary)',
                flex: 1,
              }}
             data-qoder-id="qel-span-0cbca29b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-0cbca29b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:835,&quot;column&quot;:13}}">
              amount
            </span>
            <span className="badge badge-neutral" style={{ fontSize: 10 }} data-qoder-id="qel-badge-d7df1655" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-d7df1655&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:844,&quot;column&quot;:13}}">
              number
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }} data-qoder-id="qel-div-a0096f05" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-a0096f05&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:848,&quot;column&quot;:11}}">
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--primary)',
                flex: 1,
              }}
             data-qoder-id="qel-span-0dbca42e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-0dbca42e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:849,&quot;column&quot;:13}}">
              credit_data
            </span>
            <span className="badge badge-neutral" style={{ fontSize: 10 }} data-qoder-id="qel-badge-d2df0e76" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-d2df0e76&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:858,&quot;column&quot;:13}}">
              object
            </span>
          </div>
        </div>
      </div>

      <div className="prop-section" data-qoder-id="qel-prop-section-c333ac38" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-c333ac38&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-section&quot;,&quot;loc&quot;:{&quot;line&quot;:865,&quot;column&quot;:7}}">
        <div className="prop-section-title" data-qoder-id="qel-prop-section-title-c4c1e7ca" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-title-c4c1e7ca&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-section-title&quot;,&quot;loc&quot;:{&quot;line&quot;:866,&quot;column&quot;:9}}">输出参数</div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--fg-3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
         data-qoder-id="qel-div-9b096726" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9b096726&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:867,&quot;column&quot;:9}}">
          <div style={{ display: 'flex', gap: 8 }} data-qoder-id="qel-div-a6097877" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-a6097877&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:876,&quot;column&quot;:11}}">
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: '#16a34a',
                flex: 1,
              }}
             data-qoder-id="qel-span-03bc9470" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-03bc9470&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:877,&quot;column&quot;:13}}">
              decision
            </span>
            <span className="badge badge-neutral" style={{ fontSize: 10 }} data-qoder-id="qel-badge-e8e5ecdd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-e8e5ecdd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:886,&quot;column&quot;:13}}">
              string
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }} data-qoder-id="qel-div-94f81493" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-94f81493&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:890,&quot;column&quot;:11}}">
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: '#16a34a',
                flex: 1,
              }}
             data-qoder-id="qel-span-14beedca" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-14beedca&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:891,&quot;column&quot;:13}}">
              score
            </span>
            <span className="badge badge-neutral" style={{ fontSize: 10 }} data-qoder-id="qel-badge-e5e5e824" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-e5e5e824&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:900,&quot;column&quot;:13}}">
              number
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNodeProperties = () => {
    const node = selectedNode;
    const def = nodeDefMap[node.type];
    const color = def ? def.color : '#94a3b8';
    const propDef = nodePropertyDefinitions[node.type];

    const renderField = (field) => {
      if (field.type === 'boolean') {
        return (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12 }}>
            <input
              type="checkbox"
              defaultChecked={field.defaultValue === true}
              style={{ width: 16, height: 16, accentColor: color, cursor: 'pointer' }}
            />
            <span style={{ color: 'var(--fg-3)' }}>{field.defaultValue ? '已启用' : '未启用'}</span>
          </label>
        );
      }
      // --- optimization_model: model_ref uses API-loaded models ---
      if (node.type === 'optimization_model' && field.key === 'model_ref') {
        if (loadingModels) {
          return <span style={{ fontSize: 12, color: 'var(--fg-4)' }}>加载模型列表...</span>;
        }
        const currentVal = node.data?.config?.modelId || '';
        return (
          <select
            className="select"
            value={currentVal}
            onChange={(e) => {
              const modelId = e.target.value;
              const selectedModel = optModels.find(m => m.id === modelId);
              // Update the node config with selected modelId
              setSelectedNode(prev => prev ? {
                ...prev,
                data: { ...prev.data, config: { ...prev.data.config, modelId, modelName: selectedModel?.name || '' } }
              } : null);
              setFlowBlocks(prev => prev.map(b =>
                b.id === node.id ? { ...b, config: { ...b.config, modelId, modelName: selectedModel?.name || '' } } : b
              ));
            }}
            style={{ width: '100%', fontSize: 12 }}
          >
            <option value="">-- 请选择优化模型 --</option>
            {optModels.map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.problem_type})</option>
            ))}
          </select>
        );
      }
      // --- object_access: ontology_ref and object_type use API data ---
      if (node.type === 'object_access' && field.key === 'ontology_ref') {
        if (loadingOntologies) {
          return <span style={{ fontSize: 12, color: 'var(--fg-4)' }}>加载本体列表...</span>;
        }
        const currentVal = node.data?.config?.ontologyId || '';
        return (
          <select
            className="select"
            value={currentVal}
            onChange={(e) => {
              const ontologyId = e.target.value;
              setSelectedNode(prev => prev ? {
                ...prev,
                data: { ...prev.data, config: { ...prev.data.config, ontologyId, objectTypeId: '' } }
              } : null);
              setFlowBlocks(prev => prev.map(b =>
                b.id === node.id ? { ...b, config: { ...b.config, ontologyId, objectTypeId: '' } } : b
              ));
            }}
            style={{ width: '100%', fontSize: 12 }}
          >
            <option value="">-- 请选择本体 --</option>
            {apiOntologies.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        );
      }
      if (node.type === 'object_access' && field.key === 'object_type') {
        const selectedOntId = node.data?.config?.ontologyId || '';
        const ont = apiOntologies.find(o => o.id === selectedOntId);
        const objectTypes = ont?.object_types || [];
        const currentVal = node.data?.config?.objectTypeId || '';
        return (
          <select
            className="select"
            value={currentVal}
            onChange={(e) => {
              const objectTypeId = e.target.value;
              setSelectedNode(prev => prev ? {
                ...prev,
                data: { ...prev.data, config: { ...prev.data.config, objectTypeId } }
              } : null);
              setFlowBlocks(prev => prev.map(b =>
                b.id === node.id ? { ...b, config: { ...b.config, objectTypeId } } : b
              ));
            }}
            style={{ width: '100%', fontSize: 12 }}
          >
            <option value="">-- 请选择对象类型 --</option>
            {objectTypes.map(ot => (
              <option key={ot.id} value={ot.id}>{ot.display_name || ot.name}</option>
            ))}
          </select>
        );
      }
      // --- action: action_type and action_target use API data ---
      if (node.type === 'action' && field.key === 'action_type') {
        const selectedOntId = node.data?.config?.ontologyId || '';
        const ont = apiOntologies.find(o => o.id === selectedOntId);
        const actionTypes = ont?.action_types || [];
        const currentVal = node.data?.config?.actionTypeId || '';
        return (
          <select
            className="select"
            value={currentVal}
            onChange={(e) => {
              const actionTypeId = e.target.value;
              setSelectedNode(prev => prev ? {
                ...prev,
                data: { ...prev.data, config: { ...prev.data.config, actionTypeId } }
              } : null);
              setFlowBlocks(prev => prev.map(b =>
                b.id === node.id ? { ...b, config: { ...b.config, actionTypeId } } : b
              ));
            }}
            style={{ width: '100%', fontSize: 12 }}
          >
            <option value="">-- 请选择行动类型 --</option>
            {actionTypes.map(at => (
              <option key={at.id} value={at.id}>{at.display_name || at.name}</option>
            ))}
          </select>
        );
      }
      if (node.type === 'action' && field.key === 'action_target') {
        if (loadingOntologies) {
          return <span style={{ fontSize: 12, color: 'var(--fg-4)' }}>加载本体列表...</span>;
        }
        const currentVal = node.data?.config?.ontologyId || '';
        return (
          <select
            className="select"
            value={currentVal}
            onChange={(e) => {
              const ontologyId = e.target.value;
              setSelectedNode(prev => prev ? {
                ...prev,
                data: { ...prev.data, config: { ...prev.data.config, ontologyId, actionTypeId: '' } }
              } : null);
              setFlowBlocks(prev => prev.map(b =>
                b.id === node.id ? { ...b, config: { ...b.config, ontologyId, actionTypeId: '' } } : b
              ));
            }}
            style={{ width: '100%', fontSize: 12 }}
          >
            <option value="">-- 请选择目标本体 --</option>
            {apiOntologies.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        );
      }
      if (field.type === 'select') {
        return (
          <select className="select" defaultValue={field.defaultValue || ''} style={{ width: '100%', fontSize: 12 }}>
            {field.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      }
      if (field.type === 'textarea') {
        return (
          <textarea
            className="input"
            placeholder={field.placeholder || ''}
            rows={3}
            style={{ fontSize: 12, padding: '5px 8px', resize: 'vertical', fontFamily: "'JetBrains Mono', monospace" }}
            defaultValue=""
           data-qoder-id="qel-input-b8ed6794" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-b8ed6794&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:954,&quot;column&quot;:11}}"/>
        );
      }
      if (field.type === 'number') {
        return (
          <input
            className="input"
            type="number"
            defaultValue={field.defaultValue || 0}
            style={{ fontSize: 12, padding: '5px 8px', width: '100%' }}
           data-qoder-id="qel-input-d78c82e7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-d78c82e7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:965,&quot;column&quot;:11}}"/>
        );
      }
      return (
        <input
          className="input"
          placeholder={field.placeholder || ''}
          defaultValue=""
          style={{ fontSize: 12, padding: '5px 8px' }}
         data-qoder-id="qel-input-d48c7e2e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-d48c7e2e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:974,&quot;column&quot;:9}}"/>
      );
    };

    return (
      <div className="flow-property-panel" data-qoder-id="qel-flow-property-panel-43f3502f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-property-panel-43f3502f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-property-panel&quot;,&quot;loc&quot;:{&quot;line&quot;:984,&quot;column&quot;:7}}">
        {/* Header */}
        <div
          className="prop-section"
          style={{ borderBottom: `2px solid color-mix(in srgb, ${color} 30%, transparent)` }}
         data-qoder-id="qel-prop-section-c4316f34" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-c4316f34&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-section&quot;,&quot;loc&quot;:{&quot;line&quot;:986,&quot;column&quot;:9}}">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }} data-qoder-id="qel-div-9b07288f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9b07288f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:990,&quot;column&quot;:11}}">
            <div className="prop-section-title" style={{ marginBottom: 0 }} data-qoder-id="qel-prop-section-title-3cc4e349" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-title-3cc4e349&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-section-title&quot;,&quot;loc&quot;:{&quot;line&quot;:991,&quot;column&quot;:13}}">节点属性</div>
            <span
              className="badge"
              style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
             data-qoder-id="qel-badge-d3e14ea0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-d3e14ea0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:992,&quot;column&quot;:13}}">
              {def ? def.label : node.type}
            </span>
          </div>
        </div>

        {/* Name & Description */}
        <div className="prop-section" data-qoder-id="qel-prop-section-c833b417" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-c833b417&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-section&quot;,&quot;loc&quot;:{&quot;line&quot;:1002,&quot;column&quot;:9}}">
          <div className="prop-row" data-qoder-id="qel-prop-row-1be0eb37" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-1be0eb37&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:1003,&quot;column&quot;:11}}">
            <div className="prop-label" data-qoder-id="qel-prop-label-898b8c74" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-898b8c74&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:1004,&quot;column&quot;:13}}">名称</div>
            <input
              className="input"
              value={node.data?.label || ''}
              onChange={(e) => handleNodeLabelChange(e.target.value)}
              style={{ fontSize: 12, padding: '5px 8px' }}
             data-qoder-id="qel-input-3f8f6536" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-3f8f6536&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:1005,&quot;column&quot;:13}}"/>
          </div>
          <div className="prop-row" data-qoder-id="qel-prop-row-16e0e358" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-16e0e358&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:1012,&quot;column&quot;:11}}">
            <div className="prop-label" data-qoder-id="qel-prop-label-888b8ae1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-888b8ae1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:1013,&quot;column&quot;:13}}">描述</div>
            <textarea
              className="input"
              placeholder="输入节点描述..."
              rows={2}
              style={{ fontSize: 12, padding: '5px 8px', resize: 'vertical', fontFamily: 'inherit' }}
              defaultValue=""
             data-qoder-id="qel-input-26f05355" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-26f05355&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:1014,&quot;column&quot;:13}}"/>
          </div>
        </div>

        {/* Dynamic sections from nodePropertyDefinitions */}
        {propDef && propDef.sections.map((section, sIdx) => (
          <div className="prop-section" key={sIdx} data-qoder-id="qel-prop-section-c533af5e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-c533af5e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-section&quot;,&quot;loc&quot;:{&quot;line&quot;:1026,&quot;column&quot;:11}}">
            <div className="prop-section-title" data-qoder-id="qel-prop-section-title-b6c1d1c0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-title-b6c1d1c0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-section-title&quot;,&quot;loc&quot;:{&quot;line&quot;:1027,&quot;column&quot;:13}}">{section.title}</div>
            {section.fields.map((field) => (
              <div className="prop-row" key={field.key} data-qoder-id="qel-prop-row-13e0de9f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-13e0de9f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:1029,&quot;column&quot;:15}}">
                <div className="prop-label" data-qoder-id="qel-prop-label-fd92fed5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-fd92fed5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:1030,&quot;column&quot;:17}}">{field.label}</div>
                {renderField(field)}
              </div>
            ))}
          </div>
        ))}

        {/* Input Mapping */}
        <div className="prop-section" data-qoder-id="qel-prop-section-bf225ccb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-bf225ccb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-section&quot;,&quot;loc&quot;:{&quot;line&quot;:1038,&quot;column&quot;:9}}">
          <div className="prop-section-title" data-qoder-id="qel-prop-section-title-cad33a5d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-title-cad33a5d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-section-title&quot;,&quot;loc&quot;:{&quot;line&quot;:1039,&quot;column&quot;:11}}">输入映射</div>
          <div style={{ fontSize: 11, border: '1px solid var(--border-subtle)', borderRadius: 'var(--seed-radius-sm)', overflow: 'hidden' }} data-qoder-id="qel-div-96f817b9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-96f817b9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:1040,&quot;column&quot;:11}}">
            <div style={{ display: 'flex', background: 'var(--surface-2)', padding: '4px 8px', fontWeight: 500, color: 'var(--fg-4)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }} data-qoder-id="qel-div-97f8194c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-97f8194c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:1041,&quot;column&quot;:13}}">
              <span style={{ flex: 1 }} data-qoder-id="qel-span-0fbee5eb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-0fbee5eb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:1042,&quot;column&quot;:15}}">参数</span>
              <span style={{ flex: 1 }} data-qoder-id="qel-span-10bee77e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-10bee77e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:1043,&quot;column&quot;:15}}">类型</span>
              <span style={{ flex: 1 }} data-qoder-id="qel-span-11bee911" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-11bee911&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:1044,&quot;column&quot;:15}}">来源</span>
            </div>
            {inputParams.map((p) => (
              <div key={p.name} style={{ display: 'flex', padding: '4px 8px', borderTop: '1px solid var(--border-subtle)', color: 'var(--fg-3)', fontFamily: "'JetBrains Mono', monospace" }} data-qoder-id="qel-div-9bf81f98" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9bf81f98&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:1047,&quot;column&quot;:15}}">
                <span style={{ flex: 1, color: 'var(--fg-2)' }} data-qoder-id="qel-span-0bbedf9f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-0bbedf9f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:1048,&quot;column&quot;:17}}">{p.name}</span>
                <span style={{ flex: 1 }} data-qoder-id="qel-span-98c1fc2d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-98c1fc2d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:1049,&quot;column&quot;:17}}">{p.type}</span>
                <span style={{ flex: 1, color: 'var(--fg-4)' }} data-qoder-id="qel-span-97c1fa9a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-97c1fa9a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:1050,&quot;column&quot;:17}}">{p.source}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Output Mapping */}
        <div className="prop-section" data-qoder-id="qel-prop-section-c224a01b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-c224a01b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-section&quot;,&quot;loc&quot;:{&quot;line&quot;:1057,&quot;column&quot;:9}}">
          <div className="prop-section-title" data-qoder-id="qel-prop-section-title-c1d0ed9b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-title-c1d0ed9b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-section-title&quot;,&quot;loc&quot;:{&quot;line&quot;:1058,&quot;column&quot;:11}}">输出映射</div>
          <div style={{ fontSize: 11, border: '1px solid var(--border-subtle)', borderRadius: 'var(--seed-radius-sm)', overflow: 'hidden' }} data-qoder-id="qel-div-1dfb2ad5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-1dfb2ad5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:1059,&quot;column&quot;:11}}">
            <div style={{ display: 'flex', background: 'var(--surface-2)', padding: '4px 8px', fontWeight: 500, color: 'var(--fg-4)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }} data-qoder-id="qel-div-1cfb2942" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-1cfb2942&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:1060,&quot;column&quot;:13}}">
              <span style={{ flex: 1 }} data-qoder-id="qel-span-92c1f2bb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-92c1f2bb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:1061,&quot;column&quot;:15}}">参数</span>
              <span style={{ flex: 1 }} data-qoder-id="qel-span-91c1f128" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-91c1f128&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:1062,&quot;column&quot;:15}}">类型</span>
              <span style={{ flex: 1 }} data-qoder-id="qel-span-90c1ef95" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-90c1ef95&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:1063,&quot;column&quot;:15}}">目标</span>
            </div>
            {outputParams.map((p) => (
              <div key={p.name} style={{ display: 'flex', padding: '4px 8px', borderTop: '1px solid var(--border-subtle)', color: 'var(--fg-3)', fontFamily: "'JetBrains Mono', monospace" }} data-qoder-id="qel-div-20fb2f8e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-20fb2f8e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:1066,&quot;column&quot;:15}}">
                <span style={{ flex: 1, color: 'var(--fg-2)' }} data-qoder-id="qel-span-7ec411d6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-7ec411d6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:1067,&quot;column&quot;:17}}">{p.name}</span>
                <span style={{ flex: 1 }} data-qoder-id="qel-span-7fc41369" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-7fc41369&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:1068,&quot;column&quot;:17}}">{p.type}</span>
                <span style={{ flex: 1, color: 'var(--fg-4)' }} data-qoder-id="qel-span-7cc40eb0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-7cc40eb0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:1069,&quot;column&quot;:17}}">{p.target}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Execution Config */}
        <div className="prop-section" data-qoder-id="qel-prop-section-c926e9b7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-c926e9b7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-section&quot;,&quot;loc&quot;:{&quot;line&quot;:1076,&quot;column&quot;:9}}">
          <div className="prop-section-title" data-qoder-id="qel-prop-section-title-b8cea0d9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-title-b8cea0d9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-section-title&quot;,&quot;loc&quot;:{&quot;line&quot;:1077,&quot;column&quot;:11}}">
            <Timer size={10} style={{ marginRight: 4, verticalAlign: 'middle', display: 'inline' }}  data-qoder-id="qel-timer-1081aecd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-timer-1081aecd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;timer&quot;,&quot;loc&quot;:{&quot;line&quot;:1078,&quot;column&quot;:13}}"/>
            执行配置
          </div>
          <div className="prop-row" data-qoder-id="qel-prop-row-0ada14af" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-0ada14af&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:1081,&quot;column&quot;:11}}">
            <div className="prop-label" data-qoder-id="qel-prop-label-06978a2e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-06978a2e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:1082,&quot;column&quot;:13}}">超时时间 (ms)</div>
            <input className="input" type="number" defaultValue={5000} style={{ fontSize: 12, padding: '5px 8px', width: '100%' }}  data-qoder-id="qel-input-48962f26" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-48962f26&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:1083,&quot;column&quot;:13}}"/>
          </div>
          <div className="prop-row" data-qoder-id="qel-prop-row-0fda1c8e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-0fda1c8e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:1085,&quot;column&quot;:11}}">
            <div className="prop-label" data-qoder-id="qel-prop-label-039546de" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-039546de&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:1086,&quot;column&quot;:13}}">重试次数</div>
            <input className="input" type="number" defaultValue={0} min={0} max={5} style={{ fontSize: 12, padding: '5px 8px', width: '100%' }}  data-qoder-id="qel-input-d5994bb4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-d5994bb4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:1087,&quot;column&quot;:13}}"/>
          </div>
          <div className="prop-row" data-qoder-id="qel-prop-row-84d70326" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-84d70326&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:1089,&quot;column&quot;:11}}">
            <div className="prop-label" data-qoder-id="qel-prop-label-0295454b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-0295454b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:1090,&quot;column&quot;:13}}">错误处理</div>
            <select className="select" defaultValue="continue" style={{ width: '100%', fontSize: 12 }} data-qoder-id="qel-select-c49213f3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-select-c49213f3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;select&quot;,&quot;loc&quot;:{&quot;line&quot;:1091,&quot;column&quot;:13}}">
              <option value="continue" data-qoder-id="qel-option-fec83a8a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-option-fec83a8a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;option&quot;,&quot;loc&quot;:{&quot;line&quot;:1092,&quot;column&quot;:15}}">继续执行</option>
              <option value="stop" data-qoder-id="qel-option-fdc838f7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-option-fdc838f7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;option&quot;,&quot;loc&quot;:{&quot;line&quot;:1093,&quot;column&quot;:15}}">停止执行</option>
              <option value="fallback" data-qoder-id="qel-option-fcc83764" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-option-fcc83764&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;option&quot;,&quot;loc&quot;:{&quot;line&quot;:1094,&quot;column&quot;:15}}">使用降级方案</option>
              <option value="retry" data-qoder-id="qel-option-f3c82939" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-option-f3c82939&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;option&quot;,&quot;loc&quot;:{&quot;line&quot;:1095,&quot;column&quot;:15}}">重试后停止</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // RENDER: Status Bar
  // =========================================================================

  const renderStatusBar = () => (
    <div className="flow-statusbar" data-qoder-id="qel-flow-statusbar-538de34d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flow-statusbar-538de34d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;flow-statusbar&quot;,&quot;loc&quot;:{&quot;line&quot;:1243,&quot;column&quot;:5}}">
      <span data-qoder-id="qel-span-49bd6645" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-49bd6645&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:1244,&quot;column&quot;:7}}">节点: {flowBlocks.length}</span>
      <span data-qoder-id="qel-span-48bd64b2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-48bd64b2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:1245,&quot;column&quot;:7}}">连线: {Math.max(0, flowBlocks.length - 1)}</span>
      <div
        style={{
          width: 1,
          height: 14,
          background: 'var(--border)',
        }}
       data-qoder-id="qel-div-ed0a4bdf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ed0a4bdf&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:1246,&quot;column&quot;:7}}"/>
      <span data-qoder-id="qel-span-4abd67d8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-4abd67d8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:1253,&quot;column&quot;:7}}">缩放: 100%</span>
      <div
        style={{
          width: 1,
          height: 14,
          background: 'var(--border)',
        }}
       data-qoder-id="qel-div-ef08106e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ef08106e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:1254,&quot;column&quot;:7}}"/>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }} data-qoder-id="qel-span-5ebb48bd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-5ebb48bd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:1261,&quot;column&quot;:7}}">
        <Save size={10}  data-qoder-id="qel-save-e7185ab6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-save-e7185ab6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;save&quot;,&quot;loc&quot;:{&quot;line&quot;:1262,&quot;column&quot;:9}}"/>
        已保存
      </span>
      <div style={{ flex: 1 }}  data-qoder-id="qel-div-ee080edb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ee080edb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:1265,&quot;column&quot;:7}}"/>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }} data-qoder-id="qel-span-59bb40de" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-59bb40de&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:1266,&quot;column&quot;:7}}">
        <span
          className="status-dot green"
          style={{ width: 6, height: 6 }}
         data-qoder-id="qel-status-dot-7424f619" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-status-dot-7424f619&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowEditor.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowEditor&quot;,&quot;elementRole&quot;:&quot;status-dot&quot;,&quot;loc&quot;:{&quot;line&quot;:1267,&quot;column&quot;:9}}"/>
        验证通过
      </span>
    </div>
  );

  // =========================================================================
  // MAIN RENDER
  // =========================================================================

  return (
    <div ref={containerRef} className={["flow-canvas-wrapper", qoderProps?.className].filter(Boolean).join(" ")} style={{ ...({ height: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column', position: 'relative' }), ...(qoderProps?.style) }} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      {/* Toolbar spans full width */}
      {renderToolbar()}

      {/* Content row: flow canvas + property panel */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Center: Vertical Flow Canvas */}
        <div className="flow-canvas-area" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Scrollable flow area */}
          <div className="flow-vertical-canvas" onClick={handlePaneClick}>
            {/* Fixed Input Panel */}
            {renderInputPanel()}

            {/* Connector or Add button before first block */}
            {flowBlocks.length > 0 && flowBlocks[0].fixed ? (
              <div className="flow-add-node-wrapper" onClick={(e) => e.stopPropagation()}>
                <div className="flow-add-node-line"/>
                <div className="flow-add-node-dot"/>
                <div className="flow-add-node-line"/>
              </div>
            ) : (
              renderAddButton(null)
            )}

            {/* Flow Blocks Chain */}
            {flowBlocks.map((block, idx) => (
              <div key={block.id} className="flow-block-wrapper">
                {renderFlowBlock(block, idx)}
                {renderAddButton(block.id)}
              </div>
            ))}

            {/* Empty state */}
            {flowBlocks.length === 0 && (
              <div className="flow-empty-state">
                <Workflow size={24}/>
                <span>点击上方 "+" 按钮添加第一个流程块</span>
              </div>
            )}

            {/* Fixed Output Panel */}
            {renderOutputPanel()}
          </div>

          {/* Status Bar */}
          {renderStatusBar()}
        </div>

        {/* Right: Property Panel */}
        {renderPropertyPanel()}
      </div>

      {/* Test mode overlay drawer */}
      {testMode && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Top 5% overlay backdrop */}
          <div
            onClick={() => setTestMode(false)}
            style={{
              flex: '0 0 5%',
              background: 'rgba(0,0,0,0.3)',
              cursor: 'pointer',
            }}
          />
          {/* Bottom 95% test panel */}
          <div style={{
            flex: '0 0 95%',
            background: 'var(--surface, #fff)',
            borderRadius: '12px 12px 0 0',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <button
              onClick={() => setTestMode(false)}
              style={{
                position: 'absolute', top: 8, right: 12, zIndex: 10,
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 4, borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--fg-3)',
              }}
              title="关闭测试面板"
            >
              <X size={18}/>
            </button>
            <ExecutionTest style={{ height: '100%' }} />
          </div>
        </div>
      )}
    </div>
  );
}
