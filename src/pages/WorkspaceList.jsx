import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Star } from 'lucide-react';

const workspaces = [
  { id: 'planning', name: '计划员工作空间', creator: '张三', time: '2026-06-01 09:00:00' },
  { id: 'purchasing', name: '采购员工作空间', creator: '李四', time: '2026-06-01 09:00:00', fav: true },
  { id: 'materials', name: '物料管理员工作空间', creator: '王五', time: '2026-06-01 09:00:00' },
  { id: 'production', name: '生产管理员工作空间', creator: '赵六', time: '2026-06-01 09:00:00' },
  { id: 'accounting', name: '总账会计工作空间', creator: '葛七', time: '2026-06-01 09:00:00' },
  { id: 'cost', name: '成本会计工作空间', creator: '吴八', time: '2026-06-01 09:00:00' },
];

export default function WorkspaceList(qoderProps) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('全部');
  const [searchTerm, setSearchTerm] = useState('');
  const [favs, setFavs] = useState({ purchasing: true });

  const toggleFav = (id, e) => {
    e.stopPropagation();
    setFavs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = workspaces.filter(ws => {
    if (searchTerm && !ws.name.includes(searchTerm)) return false;
    if (activeFilter === '收藏' && !favs[ws.id]) return false;
    return true;
  });

  return (
    <div className={["workspace-list-page animate-fade-in", qoderProps?.className].filter(Boolean).join(" ")} data-qoder-id="qel-workspace-list-page-2841bb77" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-workspace-list-page-2841bb77&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceList.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceList&quot;,&quot;elementRole&quot;:&quot;workspace-list-page&quot;,&quot;loc&quot;:{&quot;line&quot;:32,&quot;column&quot;:5}}" style={qoderProps?.style}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }} data-qoder-id="qel-div-bc6a5f39" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-bc6a5f39&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceList.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:33,&quot;column&quot;:7}}">
        <div style={{ position: 'relative' }} data-qoder-id="qel-div-bb6a5da6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-bb6a5da6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceList.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:34,&quot;column&quot;:9}}">
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-4)' }}  data-qoder-id="qel-search-b966ea3f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-search-b966ea3f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceList.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceList&quot;,&quot;elementRole&quot;:&quot;search&quot;,&quot;loc&quot;:{&quot;line&quot;:35,&quot;column&quot;:11}}"/>
          <input
            className="input"
            placeholder="搜索"
            style={{ paddingLeft: 32, width: 240, borderRadius: 20 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
           data-qoder-id="qel-input-024fec38" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-024fec38&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceList.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceList&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:36,&quot;column&quot;:11}}"/>
        </div>
        <button className="btn btn-primary" onClick={() => alert('新建工作空间')} data-qoder-id="qel-btn-6944d5a7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-6944d5a7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceList.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceList&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:44,&quot;column&quot;:9}}">
          <Plus size={14}  data-qoder-id="qel-plus-ab1c13a2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-plus-ab1c13a2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceList.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceList&quot;,&quot;elementRole&quot;:&quot;plus&quot;,&quot;loc&quot;:{&quot;line&quot;:45,&quot;column&quot;:11}}"/>
          新增
        </button>
      </div>

      <div className="workspace-list-filters" data-qoder-id="qel-workspace-list-filters-d7cd67ee" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-workspace-list-filters-d7cd67ee&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceList.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceList&quot;,&quot;elementRole&quot;:&quot;workspace-list-filters&quot;,&quot;loc&quot;:{&quot;line&quot;:50,&quot;column&quot;:7}}">
        <div className="workspace-list-tabs" data-qoder-id="qel-workspace-list-tabs-c7a07294" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-workspace-list-tabs-c7a07294&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceList.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceList&quot;,&quot;elementRole&quot;:&quot;workspace-list-tabs&quot;,&quot;loc&quot;:{&quot;line&quot;:51,&quot;column&quot;:9}}">
          {['全部', '常用', '收藏'].map(f => (
            <button
              key={f}
              className={`workspace-list-tab ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
             data-qoder-id="qel-button-117704f8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-117704f8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceList.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceList&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:53,&quot;column&quot;:13}}">
              {f}
            </button>
          ))}
        </div>
      </div>

      <table className="workspace-table" data-qoder-id="qel-workspace-table-d495adb3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-workspace-table-d495adb3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceList.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceList&quot;,&quot;elementRole&quot;:&quot;workspace-table&quot;,&quot;loc&quot;:{&quot;line&quot;:64,&quot;column&quot;:7}}">
        <thead data-qoder-id="qel-thead-4c3d7656" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-thead-4c3d7656&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceList.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceList&quot;,&quot;elementRole&quot;:&quot;thead&quot;,&quot;loc&quot;:{&quot;line&quot;:65,&quot;column&quot;:9}}">
          <tr data-qoder-id="qel-tr-f1aa2d45" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-f1aa2d45&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceList.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceList&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:66,&quot;column&quot;:11}}">
            <th data-qoder-id="qel-th-b7b8b318" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-b7b8b318&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceList.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceList&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:67,&quot;column&quot;:13}}">空间名称</th>
            <th data-qoder-id="qel-th-b8b8b4ab" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-b8b8b4ab&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceList.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceList&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:68,&quot;column&quot;:13}}">创建人</th>
            <th data-qoder-id="qel-th-b9b8b63e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-b9b8b63e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceList.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceList&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:69,&quot;column&quot;:13}}">创建时间</th>
          </tr>
        </thead>
        <tbody data-qoder-id="qel-tbody-4182cea9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tbody-4182cea9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceList.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceList&quot;,&quot;elementRole&quot;:&quot;tbody&quot;,&quot;loc&quot;:{&quot;line&quot;:72,&quot;column&quot;:9}}">
          {filtered.map(ws => (
            <tr key={ws.id} onClick={() => navigate(`/w/${ws.id}`)} data-qoder-id="qel-tr-f6aa3524" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-f6aa3524&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceList.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceList&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:74,&quot;column&quot;:13}}">
              <td data-qoder-id="qel-td-94fac4c7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-94fac4c7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceList.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceList&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:75,&quot;column&quot;:15}}">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} data-qoder-id="qel-div-a4739b2b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-a4739b2b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceList.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:76,&quot;column&quot;:17}}">
                  <span className="ws-name" data-qoder-id="qel-ws-name-26e2dd20" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-ws-name-26e2dd20&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceList.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceList&quot;,&quot;elementRole&quot;:&quot;ws-name&quot;,&quot;loc&quot;:{&quot;line&quot;:77,&quot;column&quot;:19}}">{ws.name}</span>
                  <span
                    className={`ws-fav ${favs[ws.id] ? 'active' : ''}`}
                    onClick={(e) => toggleFav(ws.id, e)}
                   data-qoder-id="qel-span-8a0b7fe5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-8a0b7fe5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceList.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceList&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:78,&quot;column&quot;:19}}">
                    <Star size={13} fill={favs[ws.id] ? '#f59e0b' : 'none'}  data-qoder-id="qel-star-c794890a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-star-c794890a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceList.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceList&quot;,&quot;elementRole&quot;:&quot;star&quot;,&quot;loc&quot;:{&quot;line&quot;:82,&quot;column&quot;:21}}"/>
                  </span>
                </div>
              </td>
              <td data-qoder-id="qel-td-9a01886b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-9a01886b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceList.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceList&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:86,&quot;column&quot;:15}}">{ws.creator}</td>
              <td data-qoder-id="qel-td-990186d8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-990186d8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/WorkspaceList.jsx&quot;,&quot;componentName&quot;:&quot;WorkspaceList&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:87,&quot;column&quot;:15}}">{ws.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
