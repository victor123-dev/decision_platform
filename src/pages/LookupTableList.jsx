import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Table2, Columns, Rows3, Clock } from 'lucide-react';
import { api } from '@/api/apiClient';

export default function LookupTableList(qoderProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/lookup-tables/').then(data => { setTables(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = tables.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={["page", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <div className="page-header" data-qoder-id="qel-page-header-85a23aa9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-header-85a23aa9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;page-header&quot;,&quot;loc&quot;:{&quot;line&quot;:17,&quot;column&quot;:7}}">
        <div data-qoder-id="qel-div-04319986" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-04319986&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:18,&quot;column&quot;:9}}">
          <h1 className="page-title" data-qoder-id="qel-page-title-e177ff72" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-title-e177ff72&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;page-title&quot;,&quot;loc&quot;:{&quot;line&quot;:19,&quot;column&quot;:11}}">Lookup表管理</h1>
          <p className="page-subtitle" data-qoder-id="qel-page-subtitle-fc40dc76" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-subtitle-fc40dc76&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;page-subtitle&quot;,&quot;loc&quot;:{&quot;line&quot;:20,&quot;column&quot;:11}}">管理决策流中使用的查找表和配置数据</p>
        </div>
        <button className="btn btn-primary" data-qoder-id="qel-btn-900cd207" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-900cd207&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:22,&quot;column&quot;:9}}">
          <Plus size={14}  data-qoder-id="qel-plus-b5a08d42" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-plus-b5a08d42&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;plus&quot;,&quot;loc&quot;:{&quot;line&quot;:23,&quot;column&quot;:11}}"/>
          新建Lookup表
        </button>
      </div>

      <div className="toolbar" style={{ marginBottom: 16 }} data-qoder-id="qel-toolbar-e784c9eb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-toolbar-e784c9eb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;toolbar&quot;,&quot;loc&quot;:{&quot;line&quot;:28,&quot;column&quot;:7}}">
        <div className="search-bar" data-qoder-id="qel-search-bar-3d147017" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-search-bar-3d147017&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;search-bar&quot;,&quot;loc&quot;:{&quot;line&quot;:29,&quot;column&quot;:9}}">
          <Search size={15}  data-qoder-id="qel-search-3bed3810" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-search-3bed3810&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;search&quot;,&quot;loc&quot;:{&quot;line&quot;:30,&quot;column&quot;:11}}"/>
          <input
            className="input"
            placeholder="搜索Lookup表..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 32 }}
           data-qoder-id="qel-input-107d4c4f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-107d4c4f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:31,&quot;column&quot;:11}}"/>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }} data-qoder-id="qel-div-c60fa316" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-c60fa316&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:41,&quot;column&quot;:7}}">
        {filtered.map((table) => (
          <div
            key={table.id}
            className="card card-hover"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/lookup-tables/${table.id}`)}
           data-qoder-id="qel-card-1bd59dce" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-1bd59dce&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:43,&quot;column&quot;:11}}">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }} data-qoder-id="qel-div-c80fa63c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-c80fa63c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:49,&quot;column&quot;:13}}">
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--seed-radius-md)',
                background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }} data-qoder-id="qel-div-c90fa7cf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-c90fa7cf&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:50,&quot;column&quot;:15}}">
                <Table2 size={18} style={{ color: 'var(--primary)' }}  data-qoder-id="qel-table2-d0ffb4f6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table2-d0ffb4f6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;table2&quot;,&quot;loc&quot;:{&quot;line&quot;:60,&quot;column&quot;:17}}"/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }} data-qoder-id="qel-div-cb0faaf5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-cb0faaf5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:62,&quot;column&quot;:15}}">
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)', marginBottom: 2 }} data-qoder-id="qel-div-cc0fac88" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-cc0fac88&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:63,&quot;column&quot;:17}}">
                  {table.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--fg-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} data-qoder-id="qel-div-cd0fae1b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-cd0fae1b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:66,&quot;column&quot;:17}}">
                  {table.description}
                </div>
              </div>
            </div>

            <div className="divider" style={{ margin: '0 0 10px 0' }}  data-qoder-id="qel-divider-42ec5829" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-divider-42ec5829&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;divider&quot;,&quot;loc&quot;:{&quot;line&quot;:72,&quot;column&quot;:13}}"/>

            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--fg-3)' }} data-qoder-id="qel-div-55173ff8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-55173ff8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:74,&quot;column&quot;:13}}">
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} data-qoder-id="qel-div-581744b1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-581744b1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:75,&quot;column&quot;:15}}">
                <Rows3 size={13}  data-qoder-id="qel-rows3-a44fe3f2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-rows3-a44fe3f2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;rows3&quot;,&quot;loc&quot;:{&quot;line&quot;:76,&quot;column&quot;:17}}"/>
                <span data-qoder-id="qel-span-fa6443d3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-fa6443d3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:77,&quot;column&quot;:17}}">{table.entryCount} 条</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} data-qoder-id="qel-div-59174644" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-59174644&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:79,&quot;column&quot;:15}}">
                <Columns size={13}  data-qoder-id="qel-columns-abcddc11" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-columns-abcddc11&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;columns&quot;,&quot;loc&quot;:{&quot;line&quot;:80,&quot;column&quot;:17}}"/>
                <span data-qoder-id="qel-span-fb644566" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-fb644566&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:81,&quot;column&quot;:17}}">{table.columnCount} 列</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }} data-qoder-id="qel-div-4e1734f3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-4e1734f3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:83,&quot;column&quot;:15}}">
                <Clock size={13}  data-qoder-id="qel-clock-17c40da8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-clock-17c40da8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;clock&quot;,&quot;loc&quot;:{&quot;line&quot;:84,&quot;column&quot;:17}}"/>
                <span data-qoder-id="qel-span-f8620216" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-f8620216&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:85,&quot;column&quot;:17}}">{table.updatedAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state" data-qoder-id="qel-empty-state-be50efb3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-empty-state-be50efb3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;empty-state&quot;,&quot;loc&quot;:{&quot;line&quot;:93,&quot;column&quot;:9}}">
          <Table2 size={40}  data-qoder-id="qel-table2-dd044508" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table2-dd044508&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;table2&quot;,&quot;loc&quot;:{&quot;line&quot;:94,&quot;column&quot;:11}}"/>
          <p data-qoder-id="qel-p-b55c7abb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-b55c7abb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LookupTableList.jsx&quot;,&quot;componentName&quot;:&quot;LookupTableList&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:95,&quot;column&quot;:11}}">未找到匹配的Lookup表</p>
        </div>
      )}
    </div>
  );
}
