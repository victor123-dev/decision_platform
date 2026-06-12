import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Brain, GitBranch, History, Activity } from 'lucide-react';
import { api } from '@/api/apiClient';

const formatBadge = (fmt) => {
  const map = { ONNX: 'badge-info', Python: 'badge-primary', PMML: 'badge-neutral' };
  return map[fmt] || 'badge-neutral';
};

const statusBadge = (s) => {
  const map = { active: 'badge-success', draft: 'badge-neutral', archived: 'badge-neutral' };
  return map[s] || 'badge-neutral';
};

const statusLabel = (s) => {
  const map = { active: '运行中', draft: '草稿', archived: '已归档' };
  return map[s] || s;
};

export default function ModelDetail(qoderProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [model, setModel] = useState(null);
  const [relatedFlows, setRelatedFlows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModel = async () => {
      setLoading(true);
      try {
        const m = await api.get(`/models/${id}`);
        setModel(m);
        const flows = await api.get('/flows');
        setRelatedFlows(flows.filter((flow) =>
          flow.nodes?.some((node) => node.data?.config?.modelId === m.id)
        ));
      } catch (e) {
        console.error('ModelDetail load error:', e);
        setModel(null);
      } finally {
        setLoading(false);
      }
    };
    loadModel();
  }, [id]);

  if (loading) {
    return (
      <div className="page" style={qoderProps?.style}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--fg-3)' }}>加载中...</div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className={"page " + (qoderProps?.className || '')} style={qoderProps?.style}>
        <div className="empty-state">
          <p>未找到该模型</p>
          <button className="btn btn-ghost" onClick={() => navigate('/models')}>返回</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page" data-qoder-id="qel-page-aeaebde4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-aeaebde4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;page&quot;,&quot;loc&quot;:{&quot;line&quot;:43,&quot;column&quot;:5}}">
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }} data-qoder-id="qel-div-06e4c7f5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-06e4c7f5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:45,&quot;column&quot;:7}}">
        <button className="btn btn-ghost" style={{ padding: '6px 8px' }} onClick={() => navigate('/models')} data-qoder-id="qel-btn-027186e4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-027186e4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:46,&quot;column&quot;:9}}">
          <ArrowLeft size={16}  data-qoder-id="qel-arrowleft-7cc18dcf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-arrowleft-7cc18dcf&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;arrowleft&quot;,&quot;loc&quot;:{&quot;line&quot;:47,&quot;column&quot;:11}}"/>
        </button>
        <div style={{ flex: 1 }} data-qoder-id="qel-div-07e4c988" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-07e4c988&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:49,&quot;column&quot;:9}}">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} data-qoder-id="qel-div-95152240" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-95152240&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:50,&quot;column&quot;:11}}">
            <h1 className="page-title" style={{ marginBottom: 0 }} data-qoder-id="qel-page-title-bed421a8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-title-bed421a8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;page-title&quot;,&quot;loc&quot;:{&quot;line&quot;:51,&quot;column&quot;:13}}">{model.name}</h1>
            <span className="badge badge-neutral" data-qoder-id="qel-badge-2d434c15" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-2d434c15&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:52,&quot;column&quot;:13}}">{model.version}</span>
            <span className={`badge ${statusBadge(model.status)}`} data-qoder-id="qel-span-709a286d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-709a286d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:53,&quot;column&quot;:13}}">{statusLabel(model.status)}</span>
          </div>
          <p className="page-subtitle" data-qoder-id="qel-page-subtitle-cae85512" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-subtitle-cae85512&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;page-subtitle&quot;,&quot;loc&quot;:{&quot;line&quot;:55,&quot;column&quot;:11}}">{model.description}</p>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }} data-qoder-id="qel-div-9a152a1f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9a152a1f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:60,&quot;column&quot;:7}}">
        <div className="kpi-card" data-qoder-id="qel-kpi-card-6886813a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kpi-card-6886813a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;kpi-card&quot;,&quot;loc&quot;:{&quot;line&quot;:61,&quot;column&quot;:9}}">
          <div className="kpi-label" data-qoder-id="qel-kpi-label-a085ce53" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kpi-label-a085ce53&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;kpi-label&quot;,&quot;loc&quot;:{&quot;line&quot;:62,&quot;column&quot;:11}}">格式</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }} data-qoder-id="qel-div-9d152ed8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9d152ed8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:63,&quot;column&quot;:11}}">
            <span className={`badge ${formatBadge(model.format)}`} style={{ fontSize: 13, padding: '3px 10px' }} data-qoder-id="qel-span-669a18af" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-669a18af&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:64,&quot;column&quot;:13}}">
              {model.format}
            </span>
          </div>
        </div>
        <div className="kpi-card" data-qoder-id="qel-kpi-card-d48de703" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kpi-card-d48de703&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;kpi-card&quot;,&quot;loc&quot;:{&quot;line&quot;:69,&quot;column&quot;:9}}">
          <div className="kpi-label" data-qoder-id="qel-kpi-label-9e838c96" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kpi-label-9e838c96&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;kpi-label&quot;,&quot;loc&quot;:{&quot;line&quot;:70,&quot;column&quot;:11}}">准确率 (Accuracy)</div>
          <div className="kpi-value" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--success)' }} data-qoder-id="qel-kpi-value-e4c4cdb6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kpi-value-e4c4cdb6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;kpi-value&quot;,&quot;loc&quot;:{&quot;line&quot;:71,&quot;column&quot;:11}}">
            {(model.accuracy * 100).toFixed(1)}%
          </div>
          <div className="kpi-delta positive" data-qoder-id="qel-kpi-delta-fa740784" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kpi-delta-fa740784&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;kpi-delta&quot;,&quot;loc&quot;:{&quot;line&quot;:74,&quot;column&quot;:11}}">
            <Activity size={12} style={{ marginRight: 3, verticalAlign: -1 }}  data-qoder-id="qel-activity-7b4ad8bd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-activity-7b4ad8bd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;activity&quot;,&quot;loc&quot;:{&quot;line&quot;:75,&quot;column&quot;:13}}"/>
            趋势上升
          </div>
        </div>
        <div className="kpi-card" data-qoder-id="qel-kpi-card-d78debbc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kpi-card-d78debbc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;kpi-card&quot;,&quot;loc&quot;:{&quot;line&quot;:79,&quot;column&quot;:9}}">
          <div className="kpi-label" data-qoder-id="qel-kpi-label-a183914f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kpi-label-a183914f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;kpi-label&quot;,&quot;loc&quot;:{&quot;line&quot;:80,&quot;column&quot;:11}}">召回率 (Recall)</div>
          <div className="kpi-value" style={{ fontFamily: "'JetBrains Mono', monospace" }} data-qoder-id="qel-kpi-value-e9c4d595" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kpi-value-e9c4d595&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;kpi-value&quot;,&quot;loc&quot;:{&quot;line&quot;:81,&quot;column&quot;:11}}">
            {(model.recall * 100).toFixed(1)}%
          </div>
        </div>
        <div className="kpi-card" data-qoder-id="qel-kpi-card-dc8df39b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kpi-card-dc8df39b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;kpi-card&quot;,&quot;loc&quot;:{&quot;line&quot;:85,&quot;column&quot;:9}}">
          <div className="kpi-label" data-qoder-id="qel-kpi-label-a683992e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kpi-label-a683992e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;kpi-label&quot;,&quot;loc&quot;:{&quot;line&quot;:86,&quot;column&quot;:11}}">F1 分数</div>
          <div className="kpi-value" style={{ fontFamily: "'JetBrains Mono', monospace" }} data-qoder-id="qel-kpi-value-e8c71299" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kpi-value-e8c71299&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;kpi-value&quot;,&quot;loc&quot;:{&quot;line&quot;:87,&quot;column&quot;:11}}">
            {(model.f1 * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Input / Output Parameters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }} data-qoder-id="qel-div-221a7d65" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-221a7d65&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:94,&quot;column&quot;:7}}">
        {/* Input parameters */}
        <div className="card" data-qoder-id="qel-card-d3b90af3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-d3b90af3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:96,&quot;column&quot;:9}}">
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)', marginBottom: 12 }} data-qoder-id="qel-div-201a7a3f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-201a7a3f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:97,&quot;column&quot;:11}}">输入参数</div>
          {model.inputs && model.inputs.length > 0 ? (
            <div className="table-container" data-qoder-id="qel-table-container-ce785d75" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-container-ce785d75&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;table-container&quot;,&quot;loc&quot;:{&quot;line&quot;:99,&quot;column&quot;:13}}">
              <table className="table" data-qoder-id="qel-table-1b97ad35" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-1b97ad35&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;table&quot;,&quot;loc&quot;:{&quot;line&quot;:100,&quot;column&quot;:15}}">
                <thead data-qoder-id="qel-thead-91e0dd00" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-thead-91e0dd00&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;thead&quot;,&quot;loc&quot;:{&quot;line&quot;:101,&quot;column&quot;:17}}">
                  <tr data-qoder-id="qel-tr-b3150807" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-b3150807&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:102,&quot;column&quot;:19}}">
                    <th data-qoder-id="qel-th-e4e3685e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-e4e3685e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:103,&quot;column&quot;:21}}">参数名</th>
                    <th data-qoder-id="qel-th-e5e369f1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-e5e369f1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:104,&quot;column&quot;:21}}">类型</th>
                  </tr>
                </thead>
                <tbody data-qoder-id="qel-tbody-72aaa371" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tbody-72aaa371&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;tbody&quot;,&quot;loc&quot;:{&quot;line&quot;:107,&quot;column&quot;:17}}">
                  {model.inputs.map((p, i) => (
                    <tr key={i} data-qoder-id="qel-tr-b10838ee" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-b10838ee&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:109,&quot;column&quot;:21}}">
                      <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} data-qoder-id="qel-td-468a11ab" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-468a11ab&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:110,&quot;column&quot;:23}}">{p.name}</td>
                      <td data-qoder-id="qel-td-458a1018" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-458a1018&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:111,&quot;column&quot;:23}}">
                        <span className="badge badge-info" data-qoder-id="qel-badge-293679d6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-293679d6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:112,&quot;column&quot;:25}}">{p.type}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--fg-4)', padding: '8px 0' }} data-qoder-id="qel-div-ae22158e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ae22158e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:120,&quot;column&quot;:13}}">暂无输入参数定义</div>
          )}
        </div>

        {/* Output parameters */}
        <div className="card" data-qoder-id="qel-card-55c5108c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-55c5108c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:125,&quot;column&quot;:9}}">
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)', marginBottom: 12 }} data-qoder-id="qel-div-ac221268" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ac221268&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:126,&quot;column&quot;:11}}">输出参数</div>
          {model.outputs && model.outputs.length > 0 ? (
            <div className="table-container" data-qoder-id="qel-table-container-d0852c8e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-container-d0852c8e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;table-container&quot;,&quot;loc&quot;:{&quot;line&quot;:128,&quot;column&quot;:13}}">
              <table className="table" data-qoder-id="qel-table-9f8bb10e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-9f8bb10e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;table&quot;,&quot;loc&quot;:{&quot;line&quot;:129,&quot;column&quot;:15}}">
                <thead data-qoder-id="qel-thead-23e64004" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-thead-23e64004&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;thead&quot;,&quot;loc&quot;:{&quot;line&quot;:130,&quot;column&quot;:17}}">
                  <tr data-qoder-id="qel-tr-ad05f40b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-ad05f40b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:131,&quot;column&quot;:19}}">
                    <th data-qoder-id="qel-th-dad44e16" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-dad44e16&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:132,&quot;column&quot;:21}}">参数名</th>
                    <th data-qoder-id="qel-th-dbd44fa9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-dbd44fa9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:133,&quot;column&quot;:21}}">类型</th>
                  </tr>
                </thead>
                <tbody data-qoder-id="qel-tbody-70a861b4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tbody-70a861b4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;tbody&quot;,&quot;loc&quot;:{&quot;line&quot;:136,&quot;column&quot;:17}}">
                  {model.outputs.map((p, i) => (
                    <tr key={i} data-qoder-id="qel-tr-b105fa57" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-b105fa57&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:138,&quot;column&quot;:21}}">
                      <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} data-qoder-id="qel-td-4887d63a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-4887d63a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:139,&quot;column&quot;:23}}">{p.name}</td>
                      <td data-qoder-id="qel-td-4987d7cd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-4987d7cd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:140,&quot;column&quot;:23}}">
                        <span className="badge badge-info" data-qoder-id="qel-badge-2b38bb93" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-2b38bb93&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:141,&quot;column&quot;:25}}">{p.type}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--fg-4)', padding: '8px 0' }} data-qoder-id="qel-div-261f00df" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-261f00df&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:149,&quot;column&quot;:13}}">暂无输出参数定义</div>
          )}
        </div>
      </div>

      {/* Version history */}
      <div className="card" style={{ marginBottom: 24 }} data-qoder-id="qel-card-67c0afb4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-67c0afb4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:155,&quot;column&quot;:7}}">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: 'var(--fg)', marginBottom: 14 }} data-qoder-id="qel-div-9e26798c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9e26798c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:156,&quot;column&quot;:9}}">
          <History size={15}  data-qoder-id="qel-history-0e268859" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-history-0e268859&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;history&quot;,&quot;loc&quot;:{&quot;line&quot;:157,&quot;column&quot;:11}}"/>
          版本历史
        </div>
        {model.versions && model.versions.length > 0 ? (
          <div style={{ position: 'relative', paddingLeft: 20 }} data-qoder-id="qel-div-a0267cb2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-a0267cb2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:161,&quot;column&quot;:11}}">
            {/* Vertical line */}
            <div style={{
              position: 'absolute',
              left: 3,
              top: 6,
              bottom: 6,
              width: 1,
              background: 'var(--border)',
            }}  data-qoder-id="qel-div-9b2674d3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9b2674d3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:163,&quot;column&quot;:13}}"/>
            {model.versions.map((v, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16, position: 'relative' }} data-qoder-id="qel-div-9a267340" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9a267340&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:172,&quot;column&quot;:15}}">
                {/* Dot */}
                <div style={{
                  position: 'absolute',
                  left: -20,
                  top: 5,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: v.status === 'active' ? 'var(--success)' : 'var(--fg-4)',
                  boxShadow: v.status === 'active' ? '0 0 6px color-mix(in srgb, var(--success) 50%, transparent)' : 'none',
                }}  data-qoder-id="qel-div-9d2677f9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9d2677f9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:174,&quot;column&quot;:17}}"/>
                <div style={{ flex: 1 }} data-qoder-id="qel-div-9c267666" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9c267666&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:184,&quot;column&quot;:17}}">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }} data-qoder-id="qel-div-a72687b7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-a72687b7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:185,&quot;column&quot;:19}}">
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)' }} data-qoder-id="qel-span-de970400" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-de970400&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:186,&quot;column&quot;:21}}">{v.version}</span>
                    <span className={`badge ${statusBadge(v.status)}`} data-qoder-id="qel-span-e194ca22" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-e194ca22&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:187,&quot;column&quot;:21}}">{statusLabel(v.status)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--fg-3)' }} data-qoder-id="qel-div-9a2434a9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9a2434a9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:189,&quot;column&quot;:19}}">
                    <span data-qoder-id="qel-span-df94c6fc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-df94c6fc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:190,&quot;column&quot;:21}}">{v.date}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }} data-qoder-id="qel-span-e094c88f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-e094c88f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:191,&quot;column&quot;:21}}">
                      Accuracy: {(v.accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--fg-4)' }} data-qoder-id="qel-div-9d243962" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9d243962&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:200,&quot;column&quot;:11}}">暂无版本记录</div>
        )}
      </div>

      {/* Related flows */}
      <div className="card" data-qoder-id="qel-card-68c2efde" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-68c2efde&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:205,&quot;column&quot;:7}}">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: 'var(--fg)', marginBottom: 14 }} data-qoder-id="qel-div-9b24363c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9b24363c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:206,&quot;column&quot;:9}}">
          <GitBranch size={15}  data-qoder-id="qel-gitbranch-a8ee8d0b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-gitbranch-a8ee8d0b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;gitbranch&quot;,&quot;loc&quot;:{&quot;line&quot;:207,&quot;column&quot;:11}}"/>
          关联决策流
        </div>
        {relatedFlows.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} data-qoder-id="qel-div-a1243fae" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-a1243fae&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:211,&quot;column&quot;:11}}">
            {relatedFlows.map((flow) => (
              <div
                key={flow.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 'var(--seed-radius-sm)',
                  background: 'rgba(0,0,0,0.02)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onClick={() => navigate(`/decision-flows/${flow.id}`)}
               data-qoder-id="qel-div-a2244141" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-a2244141&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:213,&quot;column&quot;:15}}">
                <GitBranch size={14} style={{ color: 'var(--fg-3)' }}  data-qoder-id="qel-gitbranch-afe1cc1d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-gitbranch-afe1cc1d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;gitbranch&quot;,&quot;loc&quot;:{&quot;line&quot;:228,&quot;column&quot;:17}}"/>
                <span style={{ fontSize: 13, color: 'var(--fg-2)' }} data-qoder-id="qel-span-62afd8b2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-62afd8b2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:229,&quot;column&quot;:17}}">{flow.name}</span>
                <span className="badge badge-neutral" style={{ marginLeft: 'auto' }} data-qoder-id="qel-badge-33549ea8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-33549ea8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:230,&quot;column&quot;:17}}">{flow.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--fg-4)' }} data-qoder-id="qel-div-282bcff8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-282bcff8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/ModelDetail.jsx&quot;,&quot;componentName&quot;:&quot;ModelDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:235,&quot;column&quot;:11}}">暂无关联决策流</div>
        )}
      </div>
    </div>
  );
}
