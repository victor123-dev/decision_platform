import React, { useState, useEffect } from 'react';
import { Plus, Rocket, Clock, Activity, StopCircle, PlayCircle } from 'lucide-react';
import { api } from '@/api/apiClient';

const statusDotClass = (s) => {
  const map = { active: 'green', deploying: 'yellow', stopped: 'gray' };
  return map[s] || 'gray';
};

const statusLabel = (s) => {
  const map = { active: '运行中', deploying: '部署中', stopped: '已停止' };
  return map[s] || s;
};

const envLabel = (e) => {
  const map = { production: 'Production', staging: 'Staging', development: 'Development' };
  return map[e] || e;
};

const historyStatusBadge = (s) => {
  const map = { success: 'badge-success', failed: 'badge-danger' };
  return map[s] || 'badge-neutral';
};

const historyStatusLabel = (s) => {
  const map = { success: '成功', failed: '失败' };
  return map[s] || s;
};

export default function PublishManagement(qoderProps) {
  const [activeTab, setActiveTab] = useState('全部');
  const [targets, setTargets] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = ['全部', 'Production', 'Staging', 'Development'];

  const loadData = async () => {
    try {
      const [t, h] = await Promise.all([
        api.get('/publish/targets'),
        api.get('/publish/history'),
      ]);
      setTargets(t);
      setHistory(h);
    } catch (err) {
      console.error('加载发布数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = targets.filter((t) => {
    if (activeTab === '全部') return true;
    return t.env === activeTab.toLowerCase();
  });

  const toggleStatus = async (id) => {
    const target = targets.find((t) => t.id === id);
    if (!target) return;
    const action = target.status === 'active' ? 'stop' : 'start';
    try {
      await api.post(`/publish/targets/${id}/control`, { action });
      await loadData();
    } catch (err) {
      console.error('切换状态失败:', err);
    }
  };

  return (
    <div className={["page", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <div className="page-header" data-qoder-id="qel-page-header-124fadc5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-header-124fadc5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;page-header&quot;,&quot;loc&quot;:{&quot;line&quot;:53,&quot;column&quot;:7}}">
        <div data-qoder-id="qel-div-84a38972" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-84a38972&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:54,&quot;column&quot;:9}}">
          <h1 className="page-title" data-qoder-id="qel-page-title-87cc9fae" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-title-87cc9fae&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;page-title&quot;,&quot;loc&quot;:{&quot;line&quot;:55,&quot;column&quot;:11}}">发布管理</h1>
          <p className="page-subtitle" data-qoder-id="qel-page-subtitle-b112761a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-subtitle-b112761a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;page-subtitle&quot;,&quot;loc&quot;:{&quot;line&quot;:56,&quot;column&quot;:11}}">管理决策流的部署、发布和运行状态</p>
        </div>
        <button className="btn btn-primary" data-qoder-id="qel-btn-1986040b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-1986040b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:58,&quot;column&quot;:9}}">
          <Plus size={14}  data-qoder-id="qel-plus-141f7526" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-plus-141f7526&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;plus&quot;,&quot;loc&quot;:{&quot;line&quot;:59,&quot;column&quot;:11}}"/>
          新建发布
        </button>
      </div>

      {/* Environment tabs */}
      <div className="tabs" data-qoder-id="qel-tabs-7e58a5f0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tabs-7e58a5f0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;tabs&quot;,&quot;loc&quot;:{&quot;line&quot;:65,&quot;column&quot;:7}}">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
           data-qoder-id="qel-button-4d79192c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-4d79192c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:67,&quot;column&quot;:11}}">
            {tab}
          </button>
        ))}
      </div>

      {/* Active deployments */}
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)', marginBottom: 12 }} data-qoder-id="qel-div-236cb534" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-236cb534&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:78,&quot;column&quot;:7}}">
        <Rocket size={15} style={{ marginRight: 6, verticalAlign: -2 }}  data-qoder-id="qel-rocket-d75b7c3b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-rocket-d75b7c3b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;rocket&quot;,&quot;loc&quot;:{&quot;line&quot;:79,&quot;column&quot;:9}}"/>
        活跃部署
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--fg-3)' }}>加载中...</div>
      ) : (
      <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12, marginBottom: 28 }} data-qoder-id="qel-div-256cb85a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-256cb85a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:83,&quot;column&quot;:7}}">
        {filtered.map((target) => (
          <div key={target.id} className="card card-hover" data-qoder-id="qel-card-18c715d2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-18c715d2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:85,&quot;column&quot;:11}}">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }} data-qoder-id="qel-div-1f6caee8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-1f6caee8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:86,&quot;column&quot;:13}}">
              <span className={`status-dot ${statusDotClass(target.status)}`}  data-qoder-id="qel-span-d84ad7e7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-d84ad7e7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:87,&quot;column&quot;:15}}"/>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)', flex: 1 }} data-qoder-id="qel-span-d94ad97a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-d94ad97a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:88,&quot;column&quot;:15}}">
                {statusLabel(target.status)}
              </span>
              <span className="badge badge-neutral" data-qoder-id="qel-badge-721810aa" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-721810aa&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:91,&quot;column&quot;:15}}">{envLabel(target.env)}</span>
            </div>

            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              color: 'var(--primary-hover)',
              padding: '6px 10px',
              background: 'rgba(0,0,0,0.02)',
              borderRadius: 'var(--seed-radius-sm)',
              border: '1px solid var(--border-subtle)',
              marginBottom: 10,
            }} data-qoder-id="qel-div-1b6ca89c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-1b6ca89c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:94,&quot;column&quot;:13}}">
              {target.endpoint}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }} data-qoder-id="qel-div-1c6caa2f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-1c6caa2f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:107,&quot;column&quot;:13}}">
              <span className="badge badge-info" data-qoder-id="qel-badge-db106730" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-db106730&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:108,&quot;column&quot;:15}}">{target.type}</span>
              <span className="badge badge-neutral" data-qoder-id="qel-badge-dc1068c3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-dc1068c3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:109,&quot;column&quot;:15}}">{target.version}</span>
            </div>

            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--fg-3)', marginBottom: 12 }} data-qoder-id="qel-div-97742795" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-97742795&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:112,&quot;column&quot;:13}}">
              {target.deployedAt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} data-qoder-id="qel-div-96742602" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-96742602&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:114,&quot;column&quot;:17}}">
                  <Clock size={12}  data-qoder-id="qel-clock-3be1c3cb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-clock-3be1c3cb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;clock&quot;,&quot;loc&quot;:{&quot;line&quot;:115,&quot;column&quot;:19}}"/>
                  部署于 {target.deployedAt}
                </div>
              )}
              {target.status === 'active' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }} data-qoder-id="qel-div-90741c90" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-90741c90&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:120,&quot;column&quot;:17}}">
                  <Activity size={12}  data-qoder-id="qel-activity-c40b3583" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-activity-c40b3583&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;activity&quot;,&quot;loc&quot;:{&quot;line&quot;:121,&quot;column&quot;:19}}"/>
                  24h 调用: {target.calls24h.toLocaleString()}
                </div>
              )}
            </div>

            <div className="divider" style={{ margin: '0 0 10px 0' }}  data-qoder-id="qel-divider-a3b3ce18" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-divider-a3b3ce18&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;divider&quot;,&quot;loc&quot;:{&quot;line&quot;:127,&quot;column&quot;:13}}"/>

            <div style={{ display: 'flex', gap: 8 }} data-qoder-id="qel-div-9d743107" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9d743107&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:129,&quot;column&quot;:13}}">
              {target.status === 'active' ? (
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => toggleStatus(target.id)}
                 data-qoder-id="qel-btn-e8026b2a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-e8026b2a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:131,&quot;column&quot;:17}}">
                  <StopCircle size={13}  data-qoder-id="qel-stopcircle-ccd866f6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-stopcircle-ccd866f6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;stopcircle&quot;,&quot;loc&quot;:{&quot;line&quot;:135,&quot;column&quot;:19}}"/>
                  停止
                </button>
              ) : target.status === 'stopped' ? (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => toggleStatus(target.id)}
                 data-qoder-id="qel-btn-dc0019af" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-dc0019af&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:139,&quot;column&quot;:17}}">
                  <PlayCircle size={13}  data-qoder-id="qel-playcircle-b0fca6fc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-playcircle-b0fca6fc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;playcircle&quot;,&quot;loc&quot;:{&quot;line&quot;:143,&quot;column&quot;:19}}"/>
                  启动
                </button>
              ) : (
                <button className="btn btn-sm" disabled style={{ opacity: 0.5 }} data-qoder-id="qel-btn-de001cd5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-de001cd5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:147,&quot;column&quot;:17}}">
                  <Clock size={13}  data-qoder-id="qel-clock-3ddf885a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-clock-3ddf885a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;clock&quot;,&quot;loc&quot;:{&quot;line&quot;:148,&quot;column&quot;:19}}"/>
                  部署中...
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="empty-state" style={{ padding: '24px 0 32px' }} data-qoder-id="qel-empty-state-5ede18f3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-empty-state-5ede18f3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;empty-state&quot;,&quot;loc&quot;:{&quot;line&quot;:158,&quot;column&quot;:9}}">
          <Rocket size={32}  data-qoder-id="qel-rocket-dc600148" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-rocket-dc600148&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;rocket&quot;,&quot;loc&quot;:{&quot;line&quot;:159,&quot;column&quot;:11}}"/>
          <p data-qoder-id="qel-p-ff112bd3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-ff112bd3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:160,&quot;column&quot;:11}}">当前环境暂无部署</p>
        </div>
      )}

      {/* Publish history */}
      </>
      )}
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)', marginBottom: 12 }} data-qoder-id="qel-div-17711f7e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-17711f7e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:165,&quot;column&quot;:7}}">
        <Clock size={15} style={{ marginRight: 6, verticalAlign: -2 }}  data-qoder-id="qel-clock-32df7709" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-clock-32df7709&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;clock&quot;,&quot;loc&quot;:{&quot;line&quot;:166,&quot;column&quot;:9}}"/>
        发布历史
      </div>

      <div className="table-container" data-qoder-id="qel-table-container-1f03801a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-container-1f03801a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;table-container&quot;,&quot;loc&quot;:{&quot;line&quot;:170,&quot;column&quot;:7}}">
        <table className="table" data-qoder-id="qel-table-f35a1752" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-f35a1752&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;table&quot;,&quot;loc&quot;:{&quot;line&quot;:171,&quot;column&quot;:9}}">
          <thead data-qoder-id="qel-thead-1d001343" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-thead-1d001343&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;thead&quot;,&quot;loc&quot;:{&quot;line&quot;:172,&quot;column&quot;:11}}">
            <tr data-qoder-id="qel-tr-062bb074" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-062bb074&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:173,&quot;column&quot;:13}}">
              <th data-qoder-id="qel-th-69f70349" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-69f70349&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:174,&quot;column&quot;:15}}">操作</th>
              <th data-qoder-id="qel-th-68f701b6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-68f701b6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:175,&quot;column&quot;:15}}">决策流</th>
              <th data-qoder-id="qel-th-67f70023" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-67f70023&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:176,&quot;column&quot;:15}}">版本</th>
              <th data-qoder-id="qel-th-66f6fe90" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-66f6fe90&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:177,&quot;column&quot;:15}}">环境</th>
              <th data-qoder-id="qel-th-75f7162d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-75f7162d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:178,&quot;column&quot;:15}}">操作人</th>
              <th data-qoder-id="qel-th-74f7149a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-74f7149a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:179,&quot;column&quot;:15}}">时间</th>
              <th data-qoder-id="qel-th-e7f3f80c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-e7f3f80c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:180,&quot;column&quot;:15}}">状态</th>
            </tr>
          </thead>
          <tbody data-qoder-id="qel-tbody-268e52f7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tbody-268e52f7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;tbody&quot;,&quot;loc&quot;:{&quot;line&quot;:183,&quot;column&quot;:11}}">
            {history.map((h) => (
              <tr key={h.id} data-qoder-id="qel-tr-8528a6ca" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-8528a6ca&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:185,&quot;column&quot;:15}}">
                <td style={{ fontWeight: 500, color: 'var(--fg)' }} data-qoder-id="qel-td-ea9f9bfd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-ea9f9bfd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:186,&quot;column&quot;:17}}">{h.action}</td>
                <td data-qoder-id="qel-td-e39f90f8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-e39f90f8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:187,&quot;column&quot;:17}}">{h.flow}</td>
                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} data-qoder-id="qel-td-e49f928b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-e49f928b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:188,&quot;column&quot;:17}}">{h.version}</td>
                <td data-qoder-id="qel-td-e59f941e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-e59f941e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:189,&quot;column&quot;:17}}">
                  <span className="badge badge-neutral" data-qoder-id="qel-badge-e221bb56" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-e221bb56&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:190,&quot;column&quot;:19}}">{envLabel(h.env)}</span>
                </td>
                <td style={{ color: 'var(--fg-3)' }} data-qoder-id="qel-td-df9f8aac" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-df9f8aac&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:192,&quot;column&quot;:17}}">{h.user}</td>
                <td style={{ color: 'var(--fg-3)', fontSize: 12 }} data-qoder-id="qel-td-e09f8c3f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-e09f8c3f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:193,&quot;column&quot;:17}}">{h.time}</td>
                <td data-qoder-id="qel-td-59a7067f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-59a7067f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:194,&quot;column&quot;:17}}">
                  <span className={`badge ${historyStatusBadge(h.status)}`} data-qoder-id="qel-span-dc5c2754" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-dc5c2754&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/PublishManagement.jsx&quot;,&quot;componentName&quot;:&quot;PublishManagement&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:195,&quot;column&quot;:19}}">
                    {historyStatusLabel(h.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
