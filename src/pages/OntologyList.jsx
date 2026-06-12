import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Plus, Boxes, X } from 'lucide-react';
import { api } from '@/api/apiClient';

const statusLabel = (s) => {
  const map = { active: '已发布', draft: '草稿' };
  return map[s] || s;
};

const statusBadge = (s) => {
  const map = { active: 'badge-success', draft: 'badge-neutral' };
  return map[s] || 'badge-neutral';
};

export default function OntologyList() {
  const navigate = useNavigate();
  const { wsId } = useParams();
  const [ontologies, setOntologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // 将后端 snake_case 字段映射为前端 camelCase
  const mapOntology = (ont) => ({
    ...ont,
    objectTypes: ont.object_types || ont.objectTypes || [],
    actionTypes: ont.action_types || ont.actionTypes || [],
    linkTypes: ont.link_types || ont.linkTypes || [],
    updatedAt: ont.updated_at || ont.updatedAt || '',
  });

  useEffect(() => {
    loadOntologies();
  }, []);

  const loadOntologies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get('/ontology/');
      setOntologies((data || []).map(mapOntology));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = ontologies.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">本体模型</h1>
            <p className="page-subtitle">定义和管理业务本体结构</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--fg-3)' }}>加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">本体模型</h1>
            <p className="page-subtitle">定义和管理业务本体结构</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--danger, #ef4444)' }}>
          <p>加载失败: {error}</p>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={loadOntologies}>重试</button>
        </div>
      </div>
    );
  }

  const handleCreate = async () => {
    try {
      const newOnt = await api.post('/ontology/', {
        id: `ont-${Date.now()}`,
        name: newName,
        description: newDesc || '',
        status: 'draft',
        creator: '',
        updated_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
      });
      setOntologies(prev => [mapOntology(newOnt), ...prev]);
      setShowModal(false);
      setNewName('');
      setNewDesc('');
      navigate(`/w/${wsId}/ontology/${newOnt.id}`);
    } catch (err) {
      alert('创建失败: ' + err.message);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">本体模型</h1>
          <p className="page-subtitle">定义和管理业务本体结构</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={14} />
          新建本体
        </button>
      </div>

      <div className="toolbar" style={{ marginBottom: 16 }}>
        <div className="search-bar">
          <Search size={15} />
          <input
            className="input"
            placeholder="搜索本体名称或描述..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 32 }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {filtered.map((ont) => (
          <div
            key={ont.id}
            className="card card-hover"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/w/${wsId}/ontology/${ont.id}`)}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--seed-radius-md)',
                background: 'color-mix(in srgb, #2563eb 12%, transparent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Boxes size={18} style={{ color: '#2563eb' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)' }}>{ont.name}</span>
                  <span className={`badge ${statusBadge(ont.status)}`}>{statusLabel(ont.status)}</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: 12, color: 'var(--fg-3)', marginBottom: 12 }}>
              {ont.description}
            </div>

            <div className="divider" style={{ margin: '0 0 12px 0' }} />

            <div style={{ fontSize: 11, color: 'var(--fg-4)', marginBottom: 8, display: 'flex', gap: 8 }}>
              <span>对象类型 {ont.objectTypes?.length || 0}</span>
              <span>|</span>
              <span>动作类型 {ont.actionTypes?.length || 0}</span>
              <span>|</span>
              <span>链接类型 {ont.linkTypes?.length || 0}</span>
            </div>

            <div style={{ fontSize: 11, color: 'var(--fg-4)' }}>
              更新于 {ont.updatedAt} · {ont.creator}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <Boxes size={40} />
          <p>未找到匹配的本体模型</p>
        </div>
      )}

      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'var(--surface, #fff)',
            borderRadius: 12,
            padding: 24,
            width: 480,
            maxWidth: '90vw',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg)', margin: 0 }}>新建本体</h2>
              <button
                onClick={() => { setShowModal(false); setNewName(''); setNewDesc(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--fg)', marginBottom: 6 }}>
                本体名称 <span style={{ color: 'var(--danger, #ef4444)' }}>*</span>
              </label>
              <input
                className="input"
                placeholder="输入本体名称"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--fg)', marginBottom: 6 }}>
                描述
              </label>
              <textarea
                className="input"
                placeholder="描述本体用途"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                className="btn"
                onClick={() => { setShowModal(false); setNewName(''); setNewDesc(''); }}
              >
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={!newName.trim()}
              >
                确认创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
