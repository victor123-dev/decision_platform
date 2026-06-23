import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Activity, Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/api/apiClient';
import { optimizationTestModels } from '@/data/optimizationTestModels';

const statusBadge = (s) => {
  const map = { active: 'badge-success', draft: 'badge-neutral', testing: 'badge-warning', solved: 'badge-info' };
  return map[s] || 'badge-info';
};

const statusLabel = (s) => {
  const map = { active: '已发布', draft: '草稿', testing: '测试中', solved: '已求解' };
  return map[s] || s;
};

const PAGE_SIZE = 20;

export default function OptimizationModelList() {
  const { wsId } = useParams();
  const navigate = useNavigate();

  // 分页 & 搜索状态
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusCounts, setStatusCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // 搜索时重置到第一页
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // 数据加载
  const fetchModels = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(PAGE_SIZE),
      });
      if (debouncedSearch) params.set('search', debouncedSearch);

      const data = await api.get(`/optimization/?${params.toString()}`);
      const items = data.items || [];
      
      if (items.length === 0) {
        console.log('API返回空数据，使用Mock数据');
        const mockItems = optimizationTestModels.map(m => ({
          ...m,
          problem_type: m.problemType,
          updated_at: new Date().toISOString(),
        }));
        setItems(mockItems);
        setTotal(mockItems.length);
        setTotalPages(1);
        setStatusCounts({
          active: mockItems.filter(m => m.status === 'active').length,
          draft: mockItems.filter(m => m.status === 'draft').length,
          testing: mockItems.filter(m => m.status === 'testing').length,
          solved: mockItems.filter(m => m.status === 'solved').length,
        });
      } else {
        setItems(items);
        setTotal(data.total || 0);
        setTotalPages(data.total_pages || 1);
        setStatusCounts(data.status_counts || {});
      }
    } catch (err) {
      console.error('加载优化模型列表失败:', err);
      console.log('使用Mock数据作为后备');
      const mockItems = optimizationTestModels.map(m => ({
        ...m,
        problem_type: m.problemType,
        updated_at: new Date().toISOString(),
      }));
      setItems(mockItems);
      setTotal(mockItems.length);
      setTotalPages(1);
      setStatusCounts({
        active: mockItems.filter(m => m.status === 'active').length,
        draft: mockItems.filter(m => m.status === 'draft').length,
        testing: mockItems.filter(m => m.status === 'testing').length,
        solved: mockItems.filter(m => m.status === 'solved').length,
      });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  // 删除模型
  const handleDelete = useCallback(async (model) => {
    if (!window.confirm(`确定删除模型「${model.name}」吗？`)) return;
    try {
      await api.del(`/optimization/${model.id}`);
      fetchModels(); // 刷新当前页
    } catch (err) {
      console.error('删除失败:', err);
      alert('删除失败，请重试');
    }
  }, [fetchModels]);

  // 统计信息（基于服务端 total，无需前端遍历）
  const stats = useMemo(() => ({
    total,
  }), [total]);

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">优化求解模型</h2>
          <p className="page-subtitle">线性/非线性优化求解</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="search-bar">
            <Search size={15} />
            <input
              className="input"
              placeholder="搜索模型..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 32 }}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/w/${wsId}/optimization/new`)}
          >
            <Plus size={14} />
            <span>新建</span>
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <div className="kpi-card">
          <div className="kpi-label">总数</div>
          <div className="kpi-value">{stats.total}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">已发布</div>
          <div className="kpi-value" style={{ color: 'var(--success)' }}>{statusCounts.active || 0}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">草稿</div>
          <div className="kpi-value" style={{ color: 'var(--fg-3)' }}>{statusCounts.draft || 0}</div>
        </div>
      </div>

      {/* Items list */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <div style={{ textAlign: 'center', color: 'var(--fg-3)' }}>
            <Activity size={32} className="animate-pulse" />
            <p style={{ marginTop: 12 }}>加载中...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>名称</th>
                  <th>类型</th>
                  <th>状态</th>
                  <th>更新时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {items.map((model) => (
                  <tr key={model.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Activity size={15} style={{ color: 'var(--fg-3)' }} />
                        <span style={{ fontWeight: 500, color: 'var(--fg)' }}>{model.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{model.problem_type}</span>
                    </td>
                    <td>
                      <span className={`badge ${statusBadge(model.status)}`}>{statusLabel(model.status)}</span>
                    </td>
                    <td>{model.updated_at ? new Date(model.updated_at).toLocaleString('zh-CN') : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-sm btn-ghost"
                          style={{ color: 'var(--primary)' }}
                          onClick={() => navigate(`/w/${wsId}/optimization/${model.id}`)}
                        >
                          <Pencil size={13} style={{ marginRight: 2 }} />
                          编辑
                        </button>
                        <button
                          className="btn btn-sm btn-ghost"
                          style={{ color: 'var(--danger, #ef4444)' }}
                          onClick={() => handleDelete(model)}
                        >
                          <Trash2 size={13} style={{ marginRight: 2 }} />
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, padding: '0 4px' }}>
              <span style={{ color: 'var(--fg-3)', fontSize: 13 }}>
                共 {total} 条记录
              </span>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <button
                  className="btn btn-sm btn-ghost"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  style={{ opacity: page <= 1 ? 0.4 : 1 }}
                >
                  <ChevronLeft size={14} />
                  上一页
                </button>
                <span style={{ fontSize: 13, color: 'var(--fg-2)', minWidth: 60, textAlign: 'center' }}>
                  {page} / {totalPages}
                </span>
                <button
                  className="btn btn-sm btn-ghost"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  style={{ opacity: page >= totalPages ? 0.4 : 1 }}
                >
                  下一页
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {items.length === 0 && !loading && (
            <div className="empty-state">
              <Activity size={40} />
              <p>{debouncedSearch ? '未找到匹配的优化模型' : '暂无优化模型，点击「新建」创建'}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
