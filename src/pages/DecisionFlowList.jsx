import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Plus, GitBranch, Clock, Layers, Filter } from 'lucide-react';
import { nodeTypeDefinitions } from '@/data/mockData';
import { api } from '@/api/apiClient';

// Build a color lookup from nodeTypeDefinitions
const nodeColorMap = {};
nodeTypeDefinitions.forEach((cat) => {
  cat.items.forEach((item) => {
    nodeColorMap[item.type] = item.color;
  });
});

/**
 * Mini SVG preview: renders a horizontal chain of colored dots representing node types
 */
function FlowPreview({ nodes, ...qoderProps }) {
  if (!nodes || nodes.length === 0) {
    return (
      <svg width="100%" height="28" viewBox="0 0 200 28" style={qoderProps?.style} className={qoderProps?.className} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
        <text x="100" y="18" textAnchor="middle" fill="var(--fg-4)" fontSize="11" data-qoder-id="qel-text-da303141" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-da303141&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;FlowPreview&quot;,&quot;elementRole&quot;:&quot;text&quot;,&quot;loc&quot;:{&quot;line&quot;:21,&quot;column&quot;:9}}">
          (空流程)
        </text>
      </svg>
    );
  }

  const dotRadius = 5;
  const gap = 22;
  const maxDots = Math.min(nodes.length, 8);
  const totalWidth = maxDots * gap + (maxDots - 1) * 4;
  const startX = (200 - totalWidth) / 2;

  return (
    <svg width="100%" height="28" viewBox="0 0 200 28" data-qoder-id="qel-svg-5ced5680" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-5ced5680&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;FlowPreview&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:35,&quot;column&quot;:5}}">
      {nodes.slice(0, maxDots).map((node, i) => {
        const cx = startX + i * (gap + 4) + dotRadius;
        const color = nodeColorMap[node.type] || '#94a3b8';
        return (
          <g key={node.id}>
            {i > 0 && (
              <line
                x1={startX + (i - 1) * (gap + 4) + dotRadius * 2 + 2}
                y1={14}
                x2={cx - 2}
                y2={14}
                stroke="var(--fg-4)"
                strokeWidth={1}
                strokeDasharray="3,2"
                opacity={0.5}
               data-qoder-id="qel-line-c6ae89c2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-c6ae89c2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;FlowPreview&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:42,&quot;column&quot;:15}}"/>
            )}
            <circle cx={cx} cy={14} r={dotRadius} fill={color} opacity={0.85}  data-qoder-id="qel-circle-ee80fe6b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-circle-ee80fe6b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;FlowPreview&quot;,&quot;elementRole&quot;:&quot;circle&quot;,&quot;loc&quot;:{&quot;line&quot;:53,&quot;column&quot;:13}}"/>
          </g>
        );
      })}
      {nodes.length > maxDots && (
        <text
          x={startX + maxDots * (gap + 4)}
          y={18}
          fill="var(--fg-4)"
          fontSize="10"
         data-qoder-id="qel-text-dd3035fa" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-dd3035fa&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;FlowPreview&quot;,&quot;elementRole&quot;:&quot;text&quot;,&quot;loc&quot;:{&quot;line&quot;:58,&quot;column&quot;:9}}">
          +{nodes.length - maxDots}
        </text>
      )}
    </svg>
  );
}

export default function DecisionFlowList(qoderProps) {
  const navigate = useNavigate();
  const { wsId } = useParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/flows/').then(data => { setFlows(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filteredFlows = useMemo(() => {
    return flows.filter((flow) => {
      const matchSearch =
        !search ||
        flow.name.toLowerCase().includes(search.toLowerCase()) ||
        flow.description.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === 'all' || flow.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className={["page", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      {/* Page Header */}
      <div className="page-header" data-qoder-id="qel-page-header-73a2f01a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-header-73a2f01a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;page-header&quot;,&quot;loc&quot;:{&quot;line&quot;:91,&quot;column&quot;:7}}">
        <div data-qoder-id="qel-div-bb48f472" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-bb48f472&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:92,&quot;column&quot;:9}}">
          <h2 className="page-title" data-qoder-id="qel-page-title-323a7a73" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-title-323a7a73&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;page-title&quot;,&quot;loc&quot;:{&quot;line&quot;:93,&quot;column&quot;:11}}">决策流程管理</h2>
          <p className="page-subtitle" data-qoder-id="qel-page-subtitle-edf5803a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-subtitle-edf5803a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;page-subtitle&quot;,&quot;loc&quot;:{&quot;line&quot;:94,&quot;column&quot;:11}}">
            {flows.length} 个决策流程已配置
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/w/${wsId}/decision-flows/new`)}
         data-qoder-id="qel-btn-ed5cabfd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-ed5cabfd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:98,&quot;column&quot;:9}}">
          <Plus size={14}  data-qoder-id="qel-plus-e4094a7e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-plus-e4094a7e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;plus&quot;,&quot;loc&quot;:{&quot;line&quot;:102,&quot;column&quot;:11}}"/>
          新建决策流程
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar" data-qoder-id="qel-toolbar-3613b765" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-toolbar-3613b765&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;toolbar&quot;,&quot;loc&quot;:{&quot;line&quot;:108,&quot;column&quot;:7}}">
        <div className="search-bar" data-qoder-id="qel-search-bar-e2ef57f5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-search-bar-e2ef57f5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;search-bar&quot;,&quot;loc&quot;:{&quot;line&quot;:109,&quot;column&quot;:9}}">
          <Search size={15}  data-qoder-id="qel-search-a184c353" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-search-a184c353&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;search&quot;,&quot;loc&quot;:{&quot;line&quot;:110,&quot;column&quot;:11}}"/>
          <input
            className="input"
            placeholder="搜索流程..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 32 }}
           data-qoder-id="qel-input-0b46e5b6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-0b46e5b6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:111,&quot;column&quot;:11}}"/>
        </div>
        <div style={{ position: 'relative' }} data-qoder-id="qel-div-c449029d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-c449029d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:119,&quot;column&quot;:9}}">
          <Filter
            size={13}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--fg-4)',
              pointerEvents: 'none',
            }}
           data-qoder-id="qel-filter-02d0b79d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-filter-02d0b79d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;filter&quot;,&quot;loc&quot;:{&quot;line&quot;:120,&quot;column&quot;:11}}"/>
          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ paddingLeft: 30 }}
           data-qoder-id="qel-select-e2fd50a2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-select-e2fd50a2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;select&quot;,&quot;loc&quot;:{&quot;line&quot;:131,&quot;column&quot;:11}}">
            <option value="all" data-qoder-id="qel-option-ad16de09" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-option-ad16de09&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;option&quot;,&quot;loc&quot;:{&quot;line&quot;:137,&quot;column&quot;:13}}">全部状态</option>
            <option value="active" data-qoder-id="qel-option-ac16dc76" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-option-ac16dc76&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;option&quot;,&quot;loc&quot;:{&quot;line&quot;:138,&quot;column&quot;:13}}">已激活</option>
            <option value="draft" data-qoder-id="qel-option-af16e12f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-option-af16e12f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;option&quot;,&quot;loc&quot;:{&quot;line&quot;:139,&quot;column&quot;:13}}">草稿</option>
          </select>
        </div>
      </div>

      {/* Card Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 14,
          marginTop: 8,
        }}
       data-qoder-id="qel-div-b846b122" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b846b122&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:145,&quot;column&quot;:7}}">
        {filteredFlows.map((flow) => (
          <div
            key={flow.id}
            className="card card-hover"
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10 }}
            onClick={() => navigate(`/w/${wsId}/decision-flows/${flow.id}`)}
           data-qoder-id="qel-card-197c769c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-197c769c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:154,&quot;column&quot;:11}}">
            {/* Top: name + status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 8,
              }}
             data-qoder-id="qel-div-b646adfc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b646adfc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:161,&quot;column&quot;:13}}">
              <div style={{ flex: 1, minWidth: 0 }} data-qoder-id="qel-div-bd46b901" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-bd46b901&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:169,&quot;column&quot;:15}}">
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--fg)',
                    marginBottom: 4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                 data-qoder-id="qel-div-bc46b76e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-bc46b76e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:170,&quot;column&quot;:17}}">
                  {flow.name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--fg-3)',
                    lineHeight: 1.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                 data-qoder-id="qel-div-af446460" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-af446460&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:183,&quot;column&quot;:17}}">
                  {flow.description}
                </div>
              </div>
              <span
                className={
                  flow.status === 'active'
                    ? 'badge badge-success'
                    : 'badge badge-neutral'
                }
                style={{ flexShrink: 0 }}
               data-qoder-id="qel-span-7b12043f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-7b12043f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:198,&quot;column&quot;:15}}">
                {flow.status === 'active' ? '已激活' : '草稿'}
              </span>
            </div>

            {/* Mini flow preview */}
            <div
              style={{
                background: 'var(--surface-2)',
                borderRadius: 'var(--seed-radius-sm)',
                padding: '6px 8px',
              }}
             data-qoder-id="qel-div-b1446786" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b1446786&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:211,&quot;column&quot;:13}}">
              <FlowPreview nodes={flow.nodes}  data-qoder-id="qel-flowpreview-30b7145d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flowpreview-30b7145d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;flowpreview&quot;,&quot;loc&quot;:{&quot;line&quot;:218,&quot;column&quot;:15}}"/>
            </div>

            {/* Bottom row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 6,
              }}
             data-qoder-id="qel-div-b3446aac" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b3446aac&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:222,&quot;column&quot;:13}}">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} data-qoder-id="qel-div-b4446c3f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b4446c3f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:231,&quot;column&quot;:15}}">
                <span className="badge badge-neutral" data-qoder-id="qel-badge-23c2a549" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-23c2a549&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:232,&quot;column&quot;:17}}">
                  <Layers size={10}  data-qoder-id="qel-layers-5b547801" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-layers-5b547801&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;layers&quot;,&quot;loc&quot;:{&quot;line&quot;:233,&quot;column&quot;:19}}"/>
                  {flow.nodeCount} 个节点
                </span>
                {flow.tags.map((tag) => (
                  <span
                    key={tag}
                    className="badge badge-primary"
                    style={{ fontSize: 10 }}
                   data-qoder-id="qel-badge-2dc2b507" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-2dc2b507&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:237,&quot;column&quot;:19}}">
                    {tag}
                  </span>
                ))}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  color: 'var(--fg-4)',
                }}
               data-qoder-id="qel-div-b844728b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b844728b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:246,&quot;column&quot;:15}}">
                <Clock size={10}  data-qoder-id="qel-clock-8af080e7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-clock-8af080e7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;clock&quot;,&quot;loc&quot;:{&quot;line&quot;:255,&quot;column&quot;:17}}"/>
                {flow.updatedAt}
              </div>
            </div>
          </div>
        ))}

        {filteredFlows.length === 0 && (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '48px 24px',
              color: 'var(--fg-4)',
            }}
           data-qoder-id="qel-div-b855bbac" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b855bbac&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:263,&quot;column&quot;:11}}">
            <GitBranch
              size={36}
              style={{ opacity: 0.3, marginBottom: 12 }}
             data-qoder-id="qel-gitbranch-626dbd29" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-gitbranch-626dbd29&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;gitbranch&quot;,&quot;loc&quot;:{&quot;line&quot;:271,&quot;column&quot;:13}}"/>
            <p style={{ fontSize: 13, margin: 0 }} data-qoder-id="qel-p-d8b5e05e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-d8b5e05e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DecisionFlowList.jsx&quot;,&quot;componentName&quot;:&quot;DecisionFlowList&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:275,&quot;column&quot;:13}}">未找到匹配的流程</p>
          </div>
        )}
      </div>
    </div>
  );
}
