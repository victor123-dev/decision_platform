import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Download, Search, Plus, Trash2 } from 'lucide-react';
import { api } from '@/api/apiClient';

const typeBadge = (type) => {
  const map = { string: 'badge-info', number: 'badge-primary', date: 'badge-neutral' };
  return map[type] || 'badge-neutral';
};

export default function LookupTableEditor(qoderProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [table, setTable] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && id !== 'new') {
      api.get(`/lookup-tables/${id}`).then(data => { setTable(data); setLoading(false); }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id]);

  const [rows, setRows] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [search, setSearch] = useState('');

  // Sync rows when table data loads
  useEffect(() => {
    if (table?.rows) setRows([...table.rows]);
  }, [table]);

  const handleSave = async () => {
    try {
      await api.put(`/lookup-tables/${id}`, { ...table, rows });
      alert('保存成功');
    } catch (err) {
      alert('保存失败: ' + err.message);
    }
  };

  if (loading) {
    return <div className="page" style={{ textAlign: 'center', padding: 48, color: 'var(--fg-4)' }}>加载中...</div>;
  }

  if (!table) {
    return (
      <div className={["page", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
        <div className="empty-state" data-qoder-id="qel-empty-state-451a00bf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-empty-state-451a00bf&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;empty-state&quot;,&quot;loc&quot;:{&quot;line&quot;:24,&quot;column&quot;:9}}">
          <p data-qoder-id="qel-p-0c7f52ae" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-0c7f52ae&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:25,&quot;column&quot;:11}}">未找到该Lookup表</p>
          <button className="btn btn-ghost" onClick={() => navigate('/lookup-tables')} data-qoder-id="qel-btn-e63d6ea9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-e63d6ea9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:26,&quot;column&quot;:11}}">返回</button>
        </div>
      </div>
    );
  }

  const columns = table.columns || [];

  const startEdit = (rowIdx, colName) => {
    setEditingCell({ rowIdx, colName });
    setEditValue(String(rows[rowIdx]?.[colName] ?? ''));
  };

  const saveEdit = () => {
    if (!editingCell) return;
    const { rowIdx, colName } = editingCell;
    const newRows = [...rows];
    newRows[rowIdx] = { ...newRows[rowIdx], [colName]: editValue };
    setRows(newRows);
    setEditingCell(null);
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const addRow = () => {
    const emptyRow = {};
    columns.forEach((col) => { emptyRow[col.name] = ''; });
    setRows([...rows, emptyRow]);
  };

  const deleteRow = (idx) => {
    setRows(rows.filter((_, i) => i !== idx));
  };

  const filteredRows = search
    ? rows.filter((row) =>
        Object.values(row).some((v) =>
          String(v).toLowerCase().includes(search.toLowerCase())
        )
      )
    : rows;

  return (
    <div className="page" data-qoder-id="qel-page-74f03738" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-74f03738&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;page&quot;,&quot;loc&quot;:{&quot;line&quot;:72,&quot;column&quot;:5}}">
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }} data-qoder-id="qel-div-b8f39cd1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b8f39cd1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:74,&quot;column&quot;:7}}">
        <button className="btn btn-ghost" style={{ padding: '6px 8px' }} onClick={() => navigate('/lookup-tables')} data-qoder-id="qel-btn-e33d69f0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-e33d69f0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:75,&quot;column&quot;:9}}">
          <ArrowLeft size={16}  data-qoder-id="qel-arrowleft-7849d323" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-arrowleft-7849d323&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;arrowleft&quot;,&quot;loc&quot;:{&quot;line&quot;:76,&quot;column&quot;:11}}"/>
        </button>
        <div style={{ flex: 1 }} data-qoder-id="qel-div-b1f391cc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b1f391cc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:78,&quot;column&quot;:9}}">
          <h1 className="page-title" style={{ marginBottom: 0 }} data-qoder-id="qel-page-title-12021a8f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-title-12021a8f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;page-title&quot;,&quot;loc&quot;:{&quot;line&quot;:79,&quot;column&quot;:11}}">{table.name}</h1>
          <p className="page-subtitle" data-qoder-id="qel-page-subtitle-e4791225" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-subtitle-e4791225&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;page-subtitle&quot;,&quot;loc&quot;:{&quot;line&quot;:80,&quot;column&quot;:11}}">{table.description}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }} data-qoder-id="qel-div-10824162" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-10824162&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:82,&quot;column&quot;:9}}">
          <button className="btn" data-qoder-id="qel-btn-7cbc8883" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-7cbc8883&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:83,&quot;column&quot;:11}}"><Upload size={14}  data-qoder-id="qel-upload-efdd2bfe" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-upload-efdd2bfe&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;upload&quot;,&quot;loc&quot;:{&quot;line&quot;:83,&quot;column&quot;:35}}"/>导入 CSV</button>
          <button className="btn" data-qoder-id="qel-btn-82bc91f5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-82bc91f5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:84,&quot;column&quot;:11}}"><Download size={14}  data-qoder-id="qel-download-05afc34a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-download-05afc34a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;download&quot;,&quot;loc&quot;:{&quot;line&quot;:84,&quot;column&quot;:35}}"/>导出 CSV</button>
          <button className="btn btn-primary" onClick={handleSave} data-qoder-id="qel-btn-80bc8ecf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-80bc8ecf&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:85,&quot;column&quot;:11}}"><Save size={14}  data-qoder-id="qel-save-20d1ae9a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-save-20d1ae9a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;save&quot;,&quot;loc&quot;:{&quot;line&quot;:85,&quot;column&quot;:47}}"/>保存</button>
        </div>
      </div>

      {/* Search within table */}
      <div className="toolbar" style={{ marginBottom: 12 }} data-qoder-id="qel-toolbar-df0251d7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-toolbar-df0251d7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;toolbar&quot;,&quot;loc&quot;:{&quot;line&quot;:90,&quot;column&quot;:7}}">
        <div className="search-bar" data-qoder-id="qel-search-bar-4f306e2a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-search-bar-4f306e2a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;search-bar&quot;,&quot;loc&quot;:{&quot;line&quot;:91,&quot;column&quot;:9}}">
          <Search size={15}  data-qoder-id="qel-search-113c99e4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-search-113c99e4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;search&quot;,&quot;loc&quot;:{&quot;line&quot;:92,&quot;column&quot;:11}}"/>
          <input
            className="input"
            placeholder="在表中搜索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 32 }}
           data-qoder-id="qel-input-a4d2bee9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-a4d2bee9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:93,&quot;column&quot;:11}}"/>
        </div>
        <button className="btn btn-sm" onClick={addRow} style={{ marginLeft: 'auto' }} data-qoder-id="qel-btn-94ba6fb4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-94ba6fb4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:101,&quot;column&quot;:9}}">
          <Plus size={13}  data-qoder-id="qel-plus-447cd1eb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-plus-447cd1eb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;plus&quot;,&quot;loc&quot;:{&quot;line&quot;:102,&quot;column&quot;:11}}"/>添加行
        </button>
      </div>

      {/* Table */}
      {columns.length > 0 ? (
        <div className="table-container" data-qoder-id="qel-table-container-86c83e4b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-container-86c83e4b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;table-container&quot;,&quot;loc&quot;:{&quot;line&quot;:108,&quot;column&quot;:9}}">
          <table className="table" data-qoder-id="qel-table-c3701b6d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-c3701b6d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;table&quot;,&quot;loc&quot;:{&quot;line&quot;:109,&quot;column&quot;:11}}">
            <thead data-qoder-id="qel-thead-772d14ee" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-thead-772d14ee&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;thead&quot;,&quot;loc&quot;:{&quot;line&quot;:110,&quot;column&quot;:13}}">
              <tr data-qoder-id="qel-tr-9538179b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-9538179b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:111,&quot;column&quot;:15}}">
                {columns.map((col) => (
                  <th key={col.name} data-qoder-id="qel-th-a3f3a4a0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-a3f3a4a0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:113,&quot;column&quot;:19}}">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} data-qoder-id="qel-div-9a8797ce" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9a8797ce&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:114,&quot;column&quot;:21}}">
                      {col.label || col.name}
                      <span className={`badge ${typeBadge(col.type)}`} data-qoder-id="qel-span-1efecf15" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-1efecf15&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:116,&quot;column&quot;:23}}">{col.type}</span>
                    </div>
                  </th>
                ))}
                <th style={{ width: 60, textAlign: 'center' }} data-qoder-id="qel-th-a4f1679c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-a4f1679c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:120,&quot;column&quot;:17}}">操作</th>
              </tr>
            </thead>
            <tbody data-qoder-id="qel-tbody-042b3c47" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tbody-042b3c47&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;tbody&quot;,&quot;loc&quot;:{&quot;line&quot;:123,&quot;column&quot;:13}}">
              {filteredRows.map((row, rowIdx) => (
                <tr key={rowIdx} data-qoder-id="qel-tr-a335ef0e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-a335ef0e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:125,&quot;column&quot;:17}}">
                  {columns.map((col) => (
                    <td
                      key={col.name}
                      onDoubleClick={() => startEdit(rowIdx, col.name)}
                      style={{ cursor: 'pointer', minHeight: 36 }}
                     data-qoder-id="qel-td-b3adf741" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-b3adf741&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:127,&quot;column&quot;:21}}">
                      {editingCell?.rowIdx === rowIdx && editingCell?.colName === col.name ? (
                        <input
                          className="input"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          autoFocus
                          style={{ padding: '3px 8px', fontSize: 12, margin: '-4px 0' }}
                         data-qoder-id="qel-input-b6d09ca8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-b6d09ca8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:133,&quot;column&quot;:25}}"/>
                      ) : (
                        <span style={{ fontFamily: col.type === 'number' ? "'JetBrains Mono', monospace" : 'inherit' }} data-qoder-id="qel-span-18fec5a3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-18fec5a3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:146,&quot;column&quot;:25}}">
                          {row[col.name] !== undefined ? String(row[col.name]) : '-'}
                        </span>
                      )}
                    </td>
                  ))}
                  <td style={{ textAlign: 'center' }} data-qoder-id="qel-td-aeadef62" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-aeadef62&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:152,&quot;column&quot;:19}}">
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--danger)', padding: '3px 6px' }}
                      onClick={() => deleteRow(rowIdx)}
                     data-qoder-id="qel-btn-0ab757df" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-0ab757df&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:153,&quot;column&quot;:21}}">
                      <Trash2 size={13}  data-qoder-id="qel-trash2-78f80ca1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-trash2-78f80ca1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;trash2&quot;,&quot;loc&quot;:{&quot;line&quot;:158,&quot;column&quot;:23}}"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state" data-qoder-id="qel-empty-state-49ea4f78" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-empty-state-49ea4f78&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;empty-state&quot;,&quot;loc&quot;:{&quot;line&quot;:167,&quot;column&quot;:9}}">
          <p data-qoder-id="qel-p-ba767acf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-ba767acf&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:168,&quot;column&quot;:11}}">该Lookup表暂无列定义数据</p>
        </div>
      )}

      {/* Row count footer */}
      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--fg-4)', display: 'flex', alignItems: 'center', gap: 8 }} data-qoder-id="qel-div-997aca48" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-997aca48&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:173,&quot;column&quot;:7}}">
        <span data-qoder-id="qel-span-2c059f51" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-2c059f51&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:174,&quot;column&quot;:9}}">共 {rows.length} 行</span>
        {search && <span data-qoder-id="qel-span-2b059dbe" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-2b059dbe&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableEditor.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:175,&quot;column&quot;:20}}">(筛选显示 {filteredRows.length} 行)</span>}
      </div>
    </div>
  );
}
