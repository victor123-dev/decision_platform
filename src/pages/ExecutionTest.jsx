import React, { useState, useEffect } from 'react';
import { Play, Clock, ChevronRight, FlaskConical, CheckCircle2, XCircle, AlertCircle, GitCompare, History, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { api } from '@/api/apiClient';

const statusBadgeClass = (s) => {
  const map = { passed: 'badge-success', failed: 'badge-danger', running: 'badge-warning' };
  return map[s] || 'badge-neutral';
};

const statusLabel = (s) => {
  const map = { passed: '通过', failed: '失败', running: '运行中' };
  return map[s] || s;
};

const traceStatusDot = (s) => {
  const map = { success: 'green', warning: 'yellow', error: 'red', failed: 'red' };
  return map[s] || 'gray';
};

export default function ExecutionTest(qoderProps) {
  const [scenarios, setScenarios] = useState([
    { id: 's1', name: '默认场景', inputs: { amount: 5000, customer_rating: 'A' }, flowId: '', flowName: '', status: 'passed', result: null, trace: [] }
  ]);
  const [flows, setFlows] = useState([]);
  const [selectedId, setSelectedId] = useState('s1');
  const [selectedFlowId, setSelectedFlowId] = useState('');
  const [inputValues, setInputValues] = useState({ amount: 5000, customer_rating: 'A' });
  const [isRunning, setIsRunning] = useState(false);
  const [execResult, setExecResult] = useState(null);

  // New states for compare & history features
  const [activeTab, setActiveTab] = useState('single');
  const [compareIds, setCompareIds] = useState([]);
  const [compareResults, setCompareResults] = useState({});
  const [history, setHistory] = useState([]);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [compareTraceId, setCompareTraceId] = useState(null);

  useEffect(() => {
    api.get('/flows/').then(data => {
      setFlows(data);
      if (data.length > 0 && !selectedFlowId) {
        setSelectedFlowId(data[0].id);
      }
    }).catch(console.error);
  }, []);

  const selected = scenarios.find((s) => s.id === selectedId);

  // When scenario changes, reset inputs and result
  const selectScenario = (id) => {
    setSelectedId(id);
    const sc = scenarios.find((s) => s.id === id);
    if (sc) {
      setSelectedFlowId(sc.flowId);
      setInputValues({ ...sc.inputs });
      setExecResult(null);
    }
  };

  const runTest = async () => {
    if (!selectedFlowId) return;
    setIsRunning(true);
    setExecResult(null);
    try {
      const inputData = inputValues;
      const res = await api.post(`/flows/${selectedFlowId}/execute`, inputData);
      setExecResult(res);
      // Append to history
      const newRecord = {
        id: `eh-${Date.now()}`,
        scenarioId: selectedId,
        scenarioName: selected?.name || '手动测试',
        flowId: selectedFlowId,
        runAt: new Date().toLocaleString('zh-CN'),
        inputs: { ...inputValues },
        result: res,
        duration: '~800ms',
      };
      setHistory((prev) => [newRecord, ...prev]);
    } catch (err) {
      setExecResult({ status: 'error', error: err.message });
    } finally {
      setIsRunning(false);
    }
  };

  // Batch run for compare mode
  const batchRun = async () => {
    const ids = [...compareIds];
    for (const cid of ids) {
      const sc = scenarios.find((s) => s.id === cid);
      if (sc && sc.flowId) {
        try {
          const res = await api.post(`/flows/${sc.flowId}/execute`, sc.inputs);
          setCompareResults((prev) => ({ ...prev, [cid]: res }));
        } catch (err) {
          setCompareResults((prev) => ({ ...prev, [cid]: { status: 'error', error: err.message } }));
        }
      }
    }
  };

  // Toggle compare selection
  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((x) => x !== id);
        if (compareTraceId === id) {
          setCompareTraceId(next[0] || null);
        }
        return next;
      }
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  // Handle history item click: fill inputs and show result
  const handleHistoryClick = (record) => {
    const sc = scenarios.find((s) => s.id === record.scenarioId);
    if (sc) {
      setSelectedId(sc.id);
      setSelectedFlowId(sc.flowId);
    }
    setInputValues({ ...record.inputs });
    setExecResult(record.result);
  };

  // Add a history record to compare
  const addHistoryToCompare = (record) => {
    if (record.flowId !== selectedFlowId) {
      setSelectedFlowId(record.flowId);
    }
    if (!compareIds.includes(record.scenarioId)) {
      if (compareIds.length < 4) {
        setCompareIds((prev) => [...prev, record.scenarioId]);
      }
    }
  };

  // Filtered scenarios for compare mode (same flowId)
  const filteredScenarios = activeTab === 'compare'
    ? scenarios.filter((sc) => sc.flowId === selectedFlowId)
    : scenarios;

  // Compare table data helpers
  const getCompareScenarios = () => compareIds.map((id) => scenarios.find((s) => s.id === id)).filter(Boolean);

  const getAllKeys = (objects) => {
    const keySet = new Set();
    objects.forEach((obj) => {
      if (obj) Object.keys(obj).forEach((k) => keySet.add(k));
    });
    return [...keySet];
  };

  const getCellClass = (values, idx) => {
    const val = values[idx];
    const first = values[0];
    if (typeof val === 'boolean') {
      return val ? 'compare-cell-bool-true' : 'compare-cell-bool-false';
    }
    if (typeof val === 'number') {
      const nums = values.filter((v) => typeof v === 'number');
      if (nums.length < 2) return '';
      const max = Math.max(...nums);
      const min = Math.min(...nums);
      if (val === max) return 'compare-cell-highlight-high';
      if (val === min) return 'compare-cell-highlight-low';
      return '';
    }
    if (typeof val === 'string' && idx > 0 && val !== first) {
      return 'compare-cell-diff';
    }
    return '';
  };

  // Current trace data for compare mode
  const currentTraceScenario = compareTraceId
    ? scenarios.find((s) => s.id === compareTraceId)
    : null;

  const traceData = activeTab === 'compare'
    ? (currentTraceScenario?.trace || [])
    : (selected?.trace || []);

  return (
    <div style={{ ...({ display: 'flex', height: 'calc(100vh - 48px)', overflow: 'hidden' }), ...(qoderProps?.style) }} className={qoderProps?.className} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      {/* Left panel - Test scenarios list */}
      <div style={{
        width: 220,
        minWidth: 220,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '12px 14px',
          borderBottom: '1px solid var(--border)',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--fg-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>测试场景</span>
          {activeTab === 'compare' && compareIds.length > 0 && (
            <span className="compare-count-badge" style={{
              background: 'var(--primary)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 600,
              borderRadius: 8,
              padding: '1px 6px',
              minWidth: 16,
              textAlign: 'center',
            }}>
              {compareIds.length}
            </span>
          )}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 6 }}>
          {(activeTab === 'compare' ? filteredScenarios : scenarios).map((sc) => (
            <div
              key={sc.id}
              onClick={() => activeTab === 'single' ? selectScenario(sc.id) : undefined}
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--seed-radius-sm)',
                cursor: activeTab === 'single' ? 'pointer' : 'default',
                marginBottom: 2,
                background: sc.id === selectedId && activeTab === 'single'
                  ? 'color-mix(in srgb, var(--primary) 12%, transparent)'
                  : compareIds.includes(sc.id)
                    ? 'color-mix(in srgb, var(--primary) 8%, transparent)'
                    : 'transparent',
                border: sc.id === selectedId && activeTab === 'single'
                  ? '1px solid color-mix(in srgb, var(--primary) 25%, transparent)'
                  : compareIds.includes(sc.id)
                    ? '1px solid color-mix(in srgb, var(--primary) 18%, transparent)'
                    : '1px solid transparent',
                transition: 'all 0.12s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {activeTab === 'compare' && (
                  <input
                    type="checkbox"
                    className="scenario-checkbox"
                    checked={compareIds.includes(sc.id)}
                    onChange={() => toggleCompare(sc.id)}
                    style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                )}
                <div style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: sc.id === selectedId && activeTab === 'single' ? 'var(--primary-hover)' : 'var(--fg-2)',
                  marginBottom: 3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}>
                  {sc.name}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--fg-4)', marginLeft: activeTab === 'compare' ? 22 : 0 }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {sc.flowName}
                </span>
                <span className={`badge ${statusBadgeClass(sc.status)}`} style={{ fontSize: 10, padding: '1px 5px', marginLeft: 'auto' }}>
                  {statusLabel(sc.status)}
                </span>
              </div>
            </div>
          ))}
          {activeTab === 'compare' && filteredScenarios.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--fg-4)', textAlign: 'center', padding: '24px 10px' }}>
              当前决策流下无可用场景
            </div>
          )}
        </div>
      </div>

      {/* Center panel - Input / Output / Compare */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar with tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
        }}>
          <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
            <div
              className={`tab ${activeTab === 'single' ? 'active' : ''}`}
              onClick={() => setActiveTab('single')}
            >
              <FlaskConical size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
              单场景测试
            </div>
            <div
              className={`tab ${activeTab === 'compare' ? 'active' : ''}`}
              onClick={() => setActiveTab('compare')}
            >
              <GitCompare size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
              场景对比
            </div>
          </div>
          <select
            className="select"
            value={selectedFlowId}
            onChange={(e) => {
              setSelectedFlowId(e.target.value);
              setCompareIds([]);
              setCompareResults({});
              setCompareTraceId(null);
            }}
            style={{ minWidth: 180 }}
          >
            {flows.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          {activeTab === 'single' && (
            <>
              <button
                className="btn btn-primary"
                onClick={runTest}
                disabled={isRunning}
                style={{ opacity: isRunning ? 0.7 : 1 }}
              >
                <Play size={14} />
                {isRunning ? '运行中...' : '运行测试'}
              </button>
              {selected?.lastRun && (
                <div style={{ fontSize: 11, color: 'var(--fg-4)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} />
                  上次运行: {selected.lastRun}
                </div>
              )}
            </>
          )}
          {activeTab === 'compare' && (
            <>
              <button
                className="btn btn-primary"
                onClick={batchRun}
                disabled={compareIds.length < 2}
                style={{ opacity: compareIds.length < 2 ? 0.5 : 1 }}
              >
                <Play size={14} />
                批量运行
              </button>
              <span style={{ fontSize: 11, color: 'var(--fg-4)', marginLeft: 8 }}>
                已选 {compareIds.length}/4 个场景
              </span>
            </>
          )}
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {activeTab === 'single' && (
            <>
              {/* Input parameters */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)', marginBottom: 12 }}>输入参数</div>
                <div className="card">
                  {selected && Object.keys(selected.inputs).length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {Object.entries(selected.inputs).map(([key, val]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <label style={{
                            width: 180,
                            fontSize: 12,
                            color: 'var(--fg-3)',
                            fontFamily: "'JetBrains Mono', monospace",
                            flexShrink: 0,
                          }}>
                            {key}
                          </label>
                          <input
                            className="input"
                            value={inputValues[key] ?? val}
                            onChange={(e) => setInputValues({ ...inputValues, [key]: e.target.value })}
                            style={{ flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--fg-4)' }}>暂无输入参数</div>
                  )}
                </div>
              </div>

              {/* Execution result */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)', marginBottom: 12 }}>
                  执行结果
                  {execResult && (
                    <span style={{ marginLeft: 8 }}>
                      {execResult.error ? (
                        <span className="badge badge-danger">失败</span>
                      ) : (
                        <span className="badge badge-success">成功</span>
                      )}
                    </span>
                  )}
                </div>
                <div className="card">
                  {execResult ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {Object.entries(execResult).map(([key, val]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{
                            width: 140,
                            fontSize: 12,
                            color: 'var(--fg-3)',
                            fontFamily: "'JetBrains Mono', monospace",
                            flexShrink: 0,
                          }}>
                            {key}
                          </span>
                          <span style={{
                            fontSize: 13,
                            fontFamily: "'JetBrains Mono', monospace",
                            color: typeof val === 'boolean'
                              ? val ? 'var(--success)' : 'var(--danger)'
                              : key === 'error' ? 'var(--danger)' : 'var(--fg)',
                          }}>
                            {String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--fg-4)', textAlign: 'center', padding: '16px 0' }}>
                      {isRunning ? '执行中，请稍候...' : '点击"运行测试"查看执行结果'}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'compare' && (
            <>
              {compareIds.length >= 2 ? (
                <div>
                  {/* Compare table */}
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <GitCompare size={15} />
                    场景对比
                  </div>
                  <table className="compare-table" style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 12,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    <thead>
                      <tr>
                        <th style={{
                          padding: '8px 12px',
                          textAlign: 'left',
                          borderBottom: '2px solid var(--border)',
                          color: 'var(--fg-3)',
                          fontWeight: 600,
                          fontSize: 11,
                          background: 'var(--surface-2)',
                          position: 'sticky',
                          top: 0,
                          minWidth: 140,
                        }}>
                          参数/指标
                        </th>
                        {getCompareScenarios().map((sc) => (
                          <th key={sc.id} style={{
                            padding: '8px 12px',
                            textAlign: 'left',
                            borderBottom: '2px solid var(--border)',
                            color: 'var(--primary)',
                            fontWeight: 600,
                            fontSize: 11,
                            background: 'var(--surface-2)',
                            position: 'sticky',
                            top: 0,
                            minWidth: 120,
                          }}>
                            {sc.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Section 1: Input parameters */}
                      <tr>
                        <td colSpan={compareIds.length + 1} style={{
                          padding: '8px 12px 4px',
                          fontWeight: 600,
                          color: 'var(--fg-2)',
                          fontSize: 11,
                          background: 'var(--surface-2)',
                          borderBottom: '1px solid var(--border)',
                        }}>
                          输入参数
                        </td>
                      </tr>
                      {getAllKeys(getCompareScenarios().map((s) => s.inputs)).map((key) => {
                        const values = getCompareScenarios().map((s) => s.inputs[key]);
                        return (
                          <tr key={`input-${key}`}>
                            <td style={{
                              padding: '6px 12px',
                              borderBottom: '1px solid var(--border)',
                              color: 'var(--fg-3)',
                              fontWeight: 500,
                            }}>
                              {key}
                            </td>
                            {values.map((val, idx) => (
                              <td key={idx} className={getCellClass(values, idx)} style={{
                                padding: '6px 12px',
                                borderBottom: '1px solid var(--border)',
                                color: typeof val === 'boolean'
                                  ? val ? 'var(--success)' : 'var(--danger)'
                                  : 'var(--fg)',
                              }}>
                                {val !== undefined ? String(val) : '-'}
                              </td>
                            ))}
                          </tr>
                        );
                      })}

                      {/* Section 2: Output results */}
                      <tr>
                        <td colSpan={compareIds.length + 1} style={{
                          padding: '8px 12px 4px',
                          fontWeight: 600,
                          color: 'var(--fg-2)',
                          fontSize: 11,
                          background: 'var(--surface-2)',
                          borderBottom: '1px solid var(--border)',
                        }}>
                          输出结果
                        </td>
                      </tr>
                      {getAllKeys(getCompareScenarios().map((s) => compareResults[s.id] || s.result)).map((key) => {
                        const values = getCompareScenarios().map((s) => {
                          const res = compareResults[s.id] || s.result;
                          return res ? res[key] : undefined;
                        });
                        return (
                          <tr key={`output-${key}`}>
                            <td style={{
                              padding: '6px 12px',
                              borderBottom: '1px solid var(--border)',
                              color: 'var(--fg-3)',
                              fontWeight: 500,
                            }}>
                              {key}
                            </td>
                            {values.map((val, idx) => (
                              <td key={idx} className={getCellClass(values, idx)} style={{
                                padding: '6px 12px',
                                borderBottom: '1px solid var(--border)',
                                color: typeof val === 'boolean'
                                  ? val ? 'var(--success)' : 'var(--danger)'
                                  : key === 'error' ? 'var(--danger)' : 'var(--fg)',
                              }}>
                                {val !== undefined ? String(val) : '-'}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '48px 20px',
                  color: 'var(--fg-4)',
                  gap: 12,
                }}>
                  <GitCompare size={36} style={{ opacity: 0.4 }} />
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-3)' }}>场景对比模式</div>
                  <div style={{ fontSize: 12, textAlign: 'center', maxWidth: 300 }}>
                    请在左侧勾选至少 2 个场景（最多 4 个）进行对比。只显示与当前决策流相同的场景。
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right panel - Execution Trace + History */}
      <div style={{
        width: 320,
        minWidth: 320,
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Trace header with compare tabs */}
        <div style={{
          padding: activeTab === 'compare' && compareIds.length > 0 ? '0' : '12px 14px',
          borderBottom: '1px solid var(--border)',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--fg-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {activeTab === 'compare' && compareIds.length > 0 ? (
            <div style={{ display: 'flex', overflow: 'hidden' }}>
              {compareIds.map((id) => {
                const sc = scenarios.find((s) => s.id === id);
                return (
                  <div
                    key={id}
                    onClick={() => setCompareTraceId(id)}
                    style={{
                      padding: '10px 12px',
                      fontSize: 11,
                      fontWeight: compareTraceId === id ? 600 : 400,
                      color: compareTraceId === id ? 'var(--primary)' : 'var(--fg-4)',
                      cursor: 'pointer',
                      borderBottom: compareTraceId === id ? '2px solid var(--primary)' : '2px solid transparent',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: 120,
                      transition: 'all 0.12s ease',
                    }}
                  >
                    {sc?.name || id}
                  </div>
                );
              })}
            </div>
          ) : (
            '执行Trace'
          )}
        </div>

        {/* Trace content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
          {traceData && traceData.length > 0 ? (
            <div style={{ position: 'relative' }}>
              {traceData.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 4, position: 'relative' }}>
                  {/* Timeline connector */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flexShrink: 0,
                    width: 20,
                  }}>
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      marginTop: 4,
                      background: step.status === 'success' ? 'var(--success)'
                        : step.status === 'warning' ? 'var(--warning)'
                        : step.status === 'error' || step.status === 'failed' ? 'var(--danger)'
                        : 'var(--fg-4)',
                      boxShadow: step.status === 'success'
                        ? '0 0 6px color-mix(in srgb, var(--success) 50%, transparent)'
                        : step.status === 'error' || step.status === 'failed'
                        ? '0 0 6px color-mix(in srgb, var(--danger) 50%, transparent)'
                        : 'none',
                      flexShrink: 0,
                    }} />
                    {i < traceData.length - 1 && (
                      <div style={{
                        width: 1,
                        flex: 1,
                        background: 'var(--border)',
                        marginTop: 4,
                        minHeight: 20,
                      }} />
                    )}
                  </div>

                  {/* Step content */}
                  <div style={{
                    flex: 1,
                    paddingBottom: 14,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: 'var(--fg-4)', fontWeight: 600 }}>
                        #{step.step}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)' }}>
                        {step.node}
                      </span>
                      <span style={{
                        fontSize: 10,
                        color: 'var(--fg-4)',
                        marginLeft: 'auto',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        {step.duration}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <div style={{
                        fontSize: 11,
                        color: 'var(--fg-4)',
                        display: 'flex',
                        gap: 4,
                      }}>
                        <span style={{ color: 'var(--fg-3)', fontWeight: 500, flexShrink: 0 }}>输入:</span>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {step.input}
                        </span>
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: 'var(--fg-4)',
                        display: 'flex',
                        gap: 4,
                      }}>
                        <span style={{ color: 'var(--fg-3)', fontWeight: 500, flexShrink: 0 }}>输出:</span>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {step.output}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--fg-4)', textAlign: 'center', padding: '24px 0' }}>
              {activeTab === 'compare'
                ? (compareTraceId ? '该场景暂无Trace数据' : '选择场景查看Trace')
                : (selected ? '该场景暂无Trace数据' : '选择测试场景查看Trace')
              }
            </div>
          )}
        </div>

        {/* History panel */}
        <div className="history-panel" style={{
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: historyExpanded ? '50%' : 'auto',
          transition: 'max-height 0.2s ease',
        }}>
          <div
            onClick={() => setHistoryExpanded(!historyExpanded)}
            style={{
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--fg-3)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              userSelect: 'none',
            }}
          >
            <History size={13} />
            历史记录
            <span style={{
              fontSize: 10,
              fontWeight: 400,
              color: 'var(--fg-4)',
              marginLeft: 4,
            }}>
              ({history.length})
            </span>
            {historyExpanded
              ? <ChevronDown size={13} style={{ marginLeft: 'auto' }} />
              : <ChevronUp size={13} style={{ marginLeft: 'auto' }} />
            }
          </div>
          {historyExpanded && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
              {history.map((rec) => (
                <div
                  key={rec.id}
                  style={{
                    padding: '8px 10px',
                    marginBottom: 4,
                    borderRadius: 'var(--seed-radius-sm)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-2)',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                  onClick={() => handleHistoryClick(rec)}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 4,
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {rec.scenarioName}
                    </span>
                    {activeTab === 'compare' && (
                      <button
                        className="btn"
                        style={{
                          fontSize: 10,
                          padding: '2px 6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          flexShrink: 0,
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--seed-radius-sm)',
                          background: 'var(--surface)',
                          color: 'var(--fg-3)',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          addHistoryToCompare(rec);
                        }}
                      >
                        <Plus size={10} />
                        对比
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--fg-4)' }}>
                    <Clock size={10} />
                    <span>{rec.runAt}</span>
                    <span style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace" }}>{rec.duration}</span>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--fg-4)', textAlign: 'center', padding: '12px 0' }}>
                  暂无执行历史
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
