import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Brain, Activity } from 'lucide-react';
import { api } from '@/api/apiClient';

const formatBadge = (fmt) => {
  const map = { ONNX: 'badge-info', Python: 'badge-primary', PMML: 'badge-neutral' };
  return map[fmt] || 'badge-neutral';
};

const statusBadge = (s) => {
  const map = { active: 'badge-success', draft: 'badge-neutral' };
  return map[s] || 'badge-neutral';
};

const statusLabel = (s) => {
  const map = { active: '运行中', draft: '草稿' };
  return map[s] || s;
};

function SparklineBar({ data, color = 'var(--primary)' }) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 20 }} data-qoder-id="qel-div-87cabbb5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-87cabbb5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;SparklineBar&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:28,&quot;column&quot;:5}}">
      {data.map((v, i) => {
        const h = ((v - min) / range) * 14 + 6;
        return (
          <div
            key={i}
            style={{
              width: 4,
              height: h,
              borderRadius: 1,
              background: i === data.length - 1 ? color : 'color-mix(in srgb, ' + color + ' 40%, transparent)',
              transition: 'height 0.2s ease',
            }}
           data-qoder-id="qel-div-84cab6fc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-84cab6fc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;SparklineBar&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:32,&quot;column&quot;:11}}"/>
        );
      })}
    </div>
  );
}

export default function ModelList(qoderProps) {
  const navigate = useNavigate();
  const [models, setModels] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.get('/models');
        setModels(data);
      } catch (e) {
        console.error('ModelList load error:', e);
        setError(e.message || '加载失败');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = models.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.description && m.description.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className={"page " + (qoderProps?.className || '')} style={qoderProps?.style}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--fg-3)' }}>加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={"page " + (qoderProps?.className || '')} style={qoderProps?.style}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--danger)' }}>加载失败: {error}</div>
      </div>
    );
  }

  return (
    <div className={["page", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <div className="page-header" data-qoder-id="qel-page-header-ec6e7ecb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-header-ec6e7ecb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;page-header&quot;,&quot;loc&quot;:{&quot;line&quot;:59,&quot;column&quot;:7}}">
        <div data-qoder-id="qel-div-c6003ce8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-c6003ce8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:60,&quot;column&quot;:9}}">
          <h1 className="page-title" data-qoder-id="qel-page-title-4f0934f0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-title-4f0934f0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;page-title&quot;,&quot;loc&quot;:{&quot;line&quot;:61,&quot;column&quot;:11}}">模型管理</h1>
          <p className="page-subtitle" data-qoder-id="qel-page-subtitle-c6382a4c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-subtitle-c6382a4c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;page-subtitle&quot;,&quot;loc&quot;:{&quot;line&quot;:62,&quot;column&quot;:11}}">注册和管理用于决策流的机器学习模型</p>
        </div>
        <button className="btn btn-primary" data-qoder-id="qel-btn-fd48777d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-fd48777d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:64,&quot;column&quot;:9}}">
          <Plus size={14}  data-qoder-id="qel-plus-4c0f023c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-plus-4c0f023c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;plus&quot;,&quot;loc&quot;:{&quot;line&quot;:65,&quot;column&quot;:11}}"/>
          注册模型
        </button>
      </div>

      <div className="toolbar" style={{ marginBottom: 16 }} data-qoder-id="qel-toolbar-c8710f9c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-toolbar-c8710f9c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;toolbar&quot;,&quot;loc&quot;:{&quot;line&quot;:70,&quot;column&quot;:7}}">
        <div className="search-bar" data-qoder-id="qel-search-bar-e52fbd7e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-search-bar-e52fbd7e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;search-bar&quot;,&quot;loc&quot;:{&quot;line&quot;:71,&quot;column&quot;:9}}">
          <Search size={15}  data-qoder-id="qel-search-506716d2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-search-506716d2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;search&quot;,&quot;loc&quot;:{&quot;line&quot;:72,&quot;column&quot;:11}}"/>
          <input
            className="input"
            placeholder="搜索模型..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 32 }}
           data-qoder-id="qel-input-96787791" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-96787791&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:73,&quot;column&quot;:11}}"/>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }} data-qoder-id="qel-div-fe697900" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-fe697900&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:83,&quot;column&quot;:7}}">
        {filtered.map((model) => (
          <div
            key={model.id}
            className="card card-hover"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/models/${model.id}`)}
           data-qoder-id="qel-card-d45c48b8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-d45c48b8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:85,&quot;column&quot;:11}}">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }} data-qoder-id="qel-div-00697c26" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-00697c26&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:91,&quot;column&quot;:13}}">
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--seed-radius-md)',
                background: 'color-mix(in srgb, #c026d3 12%, transparent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }} data-qoder-id="qel-div-01697db9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-01697db9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:92,&quot;column&quot;:15}}">
                <Brain size={18} style={{ color: '#c026d3' }}  data-qoder-id="qel-brain-5b332480" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-brain-5b332480&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;brain&quot;,&quot;loc&quot;:{&quot;line&quot;:102,&quot;column&quot;:17}}"/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }} data-qoder-id="qel-div-0b698d77" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-0b698d77&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:104,&quot;column&quot;:15}}">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }} data-qoder-id="qel-div-947120e7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-947120e7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:105,&quot;column&quot;:17}}">
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)' }} data-qoder-id="qel-span-e35e0348" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-e35e0348&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:106,&quot;column&quot;:19}}">{model.name}</span>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }} data-qoder-id="qel-div-9671240d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9671240d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:108,&quot;column&quot;:17}}">
                  <span className={`badge ${formatBadge(model.format)}`} data-qoder-id="qel-span-e55e066e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-e55e066e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:109,&quot;column&quot;:19}}">{model.format}</span>
                  <span className="badge badge-neutral" data-qoder-id="qel-badge-6765a3f4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-6765a3f4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:110,&quot;column&quot;:19}}">{model.version}</span>
                  <span className={`badge ${statusBadge(model.status)}`} data-qoder-id="qel-span-e75e0994" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-e75e0994&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:111,&quot;column&quot;:19}}">{statusLabel(model.status)}</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: 12, color: 'var(--fg-3)', marginBottom: 12 }} data-qoder-id="qel-div-92711dc1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-92711dc1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:116,&quot;column&quot;:13}}">
              {model.description}
            </div>

            <div className="divider" style={{ margin: '0 0 12px 0' }}  data-qoder-id="qel-divider-3f273ec0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-divider-3f273ec0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;divider&quot;,&quot;loc&quot;:{&quot;line&quot;:120,&quot;column&quot;:13}}"/>

            {/* Performance metrics */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} data-qoder-id="qel-div-8c71144f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-8c71144f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:123,&quot;column&quot;:13}}">
              <div data-qoder-id="qel-div-8b7112bc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-8b7112bc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:124,&quot;column&quot;:15}}">
                <div style={{ fontSize: 11, color: 'var(--fg-4)', marginBottom: 4 }} data-qoder-id="qel-div-8e6ed8de" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-8e6ed8de&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:125,&quot;column&quot;:17}}">准确率 (Accuracy)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} data-qoder-id="qel-div-8f6eda71" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-8f6eda71&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:126,&quot;column&quot;:17}}">
                  <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg)', fontFamily: "'JetBrains Mono', monospace" }} data-qoder-id="qel-span-dc5bb9ac" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-dc5bb9ac&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:127,&quot;column&quot;:19}}">
                    {(model.accuracy * 100).toFixed(1)}%
                  </span>
                  <div style={{
                    width: 64,
                    height: 4,
                    borderRadius: 2,
                    background: 'var(--surface-3)',
                    overflow: 'hidden',
                  }} data-qoder-id="qel-div-8d6ed74b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-8d6ed74b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:130,&quot;column&quot;:19}}">
                    <div style={{
                      width: `${model.accuracy * 100}%`,
                      height: '100%',
                      borderRadius: 2,
                      background: model.accuracy >= 0.9 ? 'var(--success)' : model.accuracy >= 0.8 ? 'var(--warning)' : 'var(--danger)',
                    }}  data-qoder-id="qel-div-926edf2a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-926edf2a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:137,&quot;column&quot;:21}}"/>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }} data-qoder-id="qel-div-936ee0bd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-936ee0bd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:146,&quot;column&quot;:15}}">
                <SparklineBar data={model.sparkline}  data-qoder-id="qel-sparklinebar-660ce7a0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-sparklinebar-660ce7a0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;sparklinebar&quot;,&quot;loc&quot;:{&quot;line&quot;:147,&quot;column&quot;:17}}"/>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state" data-qoder-id="qel-empty-state-8dcafcb1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-empty-state-8dcafcb1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;empty-state&quot;,&quot;loc&quot;:{&quot;line&quot;:155,&quot;column&quot;:9}}">
          <Brain size={40}  data-qoder-id="qel-brain-e7387e12" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-brain-e7387e12&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;brain&quot;,&quot;loc&quot;:{&quot;line&quot;:156,&quot;column&quot;:11}}"/>
          <p data-qoder-id="qel-p-af65cf85" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-af65cf85&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelList.jsx&quot;,&quot;componentName&quot;:&quot;ModelList&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:157,&quot;column&quot;:11}}">未找到匹配的模型</p>
        </div>
      )}
    </div>
  );
}
