import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Database, Brain, Bot, GitBranch, Plus, ArrowRight,
  FileText, CheckCircle2, Clock, AlertCircle, Rocket,
  Sparkles, Activity, ListChecks, TrendingUp, Layers
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Mock workspace data — structure is generic, content varies by wsId
// ---------------------------------------------------------------------------
const workspaceData = {
  purchasing: {
    name: '采购员工作空间',
    appCode: 'APP000002',
    status: '设计中',
    progress: 68,
    lastModified: '2026-06-03 14:30',
    modules: {
      data: {
        label: '数据', icon: Database, color: '#2563eb',
        items: [
          { name: '采购订单数据集', status: '已发布' },
          { name: '供应商主数据', status: '已发布' },
          { name: '物料价格本体', status: '草稿' },
        ],
        total: 5,
      },
      datascience: {
        label: '数据科学', icon: Brain, color: '#c026d3',
        items: [
          { name: '供应商风险评分模型', status: '训练中', accuracy: '92%' },
          { name: '采购价格预测', status: '已发布', accuracy: '88%' },
        ],
        total: 3,
      },
      agents: {
        label: '智能体', icon: Bot, color: '#ea580c',
        items: [
          { name: '采购助手 Agent', status: '测试中' },
          { name: '供应商谈判 Agent', status: '草稿' },
        ],
        total: 2,
      },
      automation: {
        label: '自动化', icon: GitBranch, color: '#16a34a',
        items: [
          { name: '采购审批决策流', status: '已发布' },
          { name: '物料风险处理推荐流程', status: '设计中' },
          { name: '供应商准入规则集', status: '已发布' },
          { name: '价格比对交互界面', status: '草稿' },
        ],
        total: 7,
      },
    },
    recentChanges: [
      { action: '更新', target: '采购审批决策流', user: '李四', time: '10 分钟前' },
      { action: '创建', target: '供应商风险评分模型', user: '李四', time: '2 小时前' },
      { action: '发布', target: '供应商准入规则集', user: '李四', time: '昨天' },
      { action: '更新', target: '采购订单数据集', user: '李四', time: '2 天前' },
    ],
  },
};

// Default data for any other workspace
const defaultWorkspace = (wsId) => ({
  name: `${wsId} 工作空间`,
  appCode: 'APP-NEW',
  status: '新建',
  progress: 0,
  lastModified: '-',
  modules: {
    data: { label: '数据', icon: Database, color: '#2563eb', items: [], total: 0 },
    datascience: { label: '数据科学', icon: Brain, color: '#c026d3', items: [], total: 0 },
    agents: { label: '智能体', icon: Bot, color: '#ea580c', items: [], total: 0 },
    automation: { label: '自动化', icon: GitBranch, color: '#16a34a', items: [], total: 0 },
  },
  recentChanges: [],
});

const statusBadge = (s) => {
  const map = {
    '已发布': { cls: 'badge-success', icon: CheckCircle2 },
    '训练中': { cls: 'badge-warning', icon: Activity },
    '测试中': { cls: 'badge-info', icon: AlertCircle },
    '设计中': { cls: 'badge-info', icon: Layers },
    '草稿': { cls: 'badge-neutral', icon: FileText },
  };
  return map[s] || { cls: 'badge-neutral', icon: FileText };
};

const moduleRouteMap = {
  data: 'datasets',
  datascience: 'models',
  agents: 'agents',
  automation: 'decision-flows',
};

// ---------------------------------------------------------------------------
export default function WorkspaceHome(qoderProps) {
  const { wsId } = useParams();
  const navigate = useNavigate();
  const ws = workspaceData[wsId] || defaultWorkspace(wsId);

  const moduleEntries = Object.entries(ws.modules);
  const totalItems = moduleEntries.reduce((sum, [, m]) => sum + m.total, 0);

  return (
    <div className={["page animate-fade-in", qoderProps?.className].filter(Boolean).join(" ")} style={{ ...({ maxWidth: 1080, margin: '0 auto' }), ...(qoderProps?.style) }} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      {/* ---- Status banner ---- */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--seed-radius-lg)',
        padding: '20px 24px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }} data-qoder-id="qel-div-aa6b8209" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-aa6b8209&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:111,&quot;column&quot;:7}}">
        <div data-qoder-id="qel-div-a96b8076" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-a96b8076&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:121,&quot;column&quot;:9}}">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }} data-qoder-id="qel-div-ac6b852f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ac6b852f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:122,&quot;column&quot;:11}}">
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg)', margin: 0 }} data-qoder-id="qel-h2-16a07bc0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h2-16a07bc0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;h2&quot;,&quot;loc&quot;:{&quot;line&quot;:123,&quot;column&quot;:13}}">
              {ws.name}
            </h2>
            <span className="badge badge-info" data-qoder-id="qel-badge-c8e2bf60" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-c8e2bf60&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:126,&quot;column&quot;:13}}">{ws.status}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--fg-3)' }} data-qoder-id="qel-div-ad6b86c2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ad6b86c2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:128,&quot;column&quot;:11}}">
            应用编码：{ws.appCode} · 共 {totalItems} 项资产 · 最近修改：{ws.lastModified}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }} data-qoder-id="qel-div-b06b8b7b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b06b8b7b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:132,&quot;column&quot;:9}}">
          {/* Progress */}
          <div style={{ textAlign: 'center' }} data-qoder-id="qel-div-af6b89e8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-af6b89e8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:134,&quot;column&quot;:11}}">
            <div style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 4 }} data-qoder-id="qel-div-ee365e20" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ee365e20&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:135,&quot;column&quot;:13}}">设计进度</div>
            <div style={{
              width: 120,
              height: 6,
              borderRadius: 3,
              background: 'var(--surface-3)',
              overflow: 'hidden',
            }} data-qoder-id="qel-div-ef365fb3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ef365fb3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:136,&quot;column&quot;:13}}">
              <div style={{
                width: `${ws.progress}%`,
                height: '100%',
                borderRadius: 3,
                background: ws.progress >= 80 ? 'var(--success)' : 'var(--primary)',
                transition: 'width 0.4s ease',
              }}  data-qoder-id="qel-div-f0366146" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f0366146&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:143,&quot;column&quot;:15}}"/>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', marginTop: 4 }} data-qoder-id="qel-div-f13662d9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f13662d9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:151,&quot;column&quot;:13}}">
              {ws.progress}%
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/w/${wsId}/publish`)}
            style={{ gap: 6 }}
           data-qoder-id="qel-btn-8f67dd9e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-8f67dd9e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:155,&quot;column&quot;:11}}">
            <Rocket size={14}  data-qoder-id="qel-rocket-6a61dbeb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-rocket-6a61dbeb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;rocket&quot;,&quot;loc&quot;:{&quot;line&quot;:160,&quot;column&quot;:13}}"/>
            发布应用
          </button>
        </div>
      </div>

      {/* ---- Module summary cards (2×2 grid) ---- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 16,
        marginBottom: 24,
      }} data-qoder-id="qel-div-f4366792" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f4366792&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:167,&quot;column&quot;:7}}">
        {moduleEntries.map(([key, mod]) => {
          const Icon = mod.icon;
          return (
            <div
              key={key}
              className="card card-hover"
              style={{ cursor: 'pointer', padding: '18px 20px' }}
              onClick={() => navigate(`/w/${wsId}/${moduleRouteMap[key]}`)}
             data-qoder-id="qel-card-fd570f6a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-fd570f6a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:176,&quot;column&quot;:13}}">
              {/* Card header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }} data-qoder-id="qel-div-f6366ab8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f6366ab8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:183,&quot;column&quot;:15}}">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} data-qoder-id="qel-div-f7366c4b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f7366c4b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:184,&quot;column&quot;:17}}">
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--seed-radius-sm)',
                    background: `color-mix(in srgb, ${mod.color} 10%, transparent)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }} data-qoder-id="qel-div-803dffbb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-803dffbb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:185,&quot;column&quot;:19}}">
                    <Icon size={16} style={{ color: mod.color }}  data-qoder-id="qel-icon-ed129ab6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-icon-ed129ab6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;icon&quot;,&quot;loc&quot;:{&quot;line&quot;:194,&quot;column&quot;:21}}"/>
                  </div>
                  <div data-qoder-id="qel-div-823e02e1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-823e02e1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:196,&quot;column&quot;:19}}">
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }} data-qoder-id="qel-div-813e014e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-813e014e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:197,&quot;column&quot;:21}}">{mod.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--fg-3)' }} data-qoder-id="qel-div-843e0607" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-843e0607&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:198,&quot;column&quot;:21}}">{mod.total} 项</div>
                  </div>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--fg-4)' }}  data-qoder-id="qel-arrowright-dca3fae6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-arrowright-dca3fae6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;arrowright&quot;,&quot;loc&quot;:{&quot;line&quot;:201,&quot;column&quot;:17}}"/>
              </div>

              {/* Items preview */}
              {mod.items.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} data-qoder-id="qel-div-863e092d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-863e092d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:206,&quot;column&quot;:17}}">
                  {mod.items.slice(0, 3).map((item, i) => {
                    const badge = statusBadge(item.status);
                    return (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 0',
                      }} data-qoder-id="qel-div-853e079a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-853e079a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:210,&quot;column&quot;:23}}">
                        <span style={{ fontSize: 12, color: 'var(--fg-2)' }} data-qoder-id="qel-span-39c2fbe7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-39c2fbe7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:216,&quot;column&quot;:25}}">{item.name}</span>
                        <span className={`badge ${badge.cls}`} style={{ fontSize: 10 }} data-qoder-id="qel-span-38c2fa54" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-38c2fa54&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:217,&quot;column&quot;:25}}">{item.status}</span>
                      </div>
                    );
                  })}
                  {mod.total > 3 && (
                    <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }} data-qoder-id="qel-div-fa3aee32" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-fa3aee32&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:222,&quot;column&quot;:21}}">
                      +{mod.total - 3} 更多...
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--fg-4)', padding: '8px 0' }} data-qoder-id="qel-div-fb3aefc5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-fb3aefc5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:228,&quot;column&quot;:17}}">
                  暂无资产，点击开始创建
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ---- Bottom row: Recent changes + Quick actions ---- */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }} data-qoder-id="qel-div-f83aeb0c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f83aeb0c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:238,&quot;column&quot;:7}}">
        {/* Recent changes */}
        <div className="card" style={{ padding: '16px 20px' }} data-qoder-id="qel-card-6951a940" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-6951a940&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:240,&quot;column&quot;:9}}">
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 12 }} data-qoder-id="qel-div-f63ae7e6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f63ae7e6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:241,&quot;column&quot;:11}}">
            最近变更
          </div>
          {ws.recentChanges.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }} data-qoder-id="qel-div-f73ae979" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f73ae979&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:245,&quot;column&quot;:13}}">
              {ws.recentChanges.map((change, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 0',
                  borderBottom: i < ws.recentChanges.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }} data-qoder-id="qel-div-f43ae4c0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f43ae4c0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:247,&quot;column&quot;:17}}">
                  <Clock size={13} style={{ color: 'var(--fg-4)', flexShrink: 0 }}  data-qoder-id="qel-clock-f67ce5cb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-clock-f67ce5cb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;clock&quot;,&quot;loc&quot;:{&quot;line&quot;:254,&quot;column&quot;:19}}"/>
                  <span style={{ fontSize: 12, color: 'var(--fg-3)', flexShrink: 0, width: 70 }} data-qoder-id="qel-span-33c0b3de" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-33c0b3de&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:255,&quot;column&quot;:19}}">{change.time}</span>
                  <span style={{ fontSize: 12, color: 'var(--fg-2)' }} data-qoder-id="qel-span-34c0b571" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-34c0b571&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:256,&quot;column&quot;:19}}">
                    {change.action}了 <span style={{ fontWeight: 500, color: 'var(--fg)' }} data-qoder-id="qel-span-2db3de79" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-2db3de79&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:257,&quot;column&quot;:38}}">{change.target}</span>
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--fg-4)', marginLeft: 'auto' }} data-qoder-id="qel-span-2cb3dce6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-2cb3dce6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:259,&quot;column&quot;:19}}">{change.user}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--fg-4)', padding: '12px 0' }} data-qoder-id="qel-div-8a428ca7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-8a428ca7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:264,&quot;column&quot;:13}}">暂无变更记录</div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card" style={{ padding: '16px 20px' }} data-qoder-id="qel-card-695e7533" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-695e7533&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:269,&quot;column&quot;:9}}">
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 12 }} data-qoder-id="qel-div-88428981" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-88428981&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:270,&quot;column&quot;:11}}">
            快速创建
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} data-qoder-id="qel-div-874287ee" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-874287ee&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:273,&quot;column&quot;:11}}">
            {[
              { label: '新建决策流', icon: GitBranch, route: 'decision-flows', color: '#16a34a' },
              { label: '新建规则集', icon: ListChecks, route: 'rulesets', color: '#2563eb' },
              { label: '新建模型', icon: Brain, route: 'models', color: '#c026d3' },
              { label: '新建智能体', icon: Bot, route: 'agents', color: '#ea580c' },
            ].map(action => (
              <button
                key={action.route}
                className="btn"
                style={{ justifyContent: 'flex-start', gap: 8, padding: '8px 12px' }}
                onClick={() => navigate(`/w/${wsId}/${action.route}`)}
               data-qoder-id="qel-btn-0f73e011" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-0f73e011&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:280,&quot;column&quot;:15}}">
                <action.icon size={14} style={{ color: action.color }}  data-qoder-id="qel-action-icon-95441d5b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-action-icon-95441d5b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;action-icon&quot;,&quot;loc&quot;:{&quot;line&quot;:286,&quot;column&quot;:17}}"/>
                <span data-qoder-id="qel-span-35b3eb11" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-35b3eb11&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:287,&quot;column&quot;:17}}">{action.label}</span>
                <Plus size={12} style={{ marginLeft: 'auto', color: 'var(--fg-4)' }}  data-qoder-id="qel-plus-bd72a192" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-plus-bd72a192&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceHome.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceHome&quot;,&quot;elementRole&quot;:&quot;plus&quot;,&quot;loc&quot;:{&quot;line&quot;:288,&quot;column&quot;:17}}"/>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
