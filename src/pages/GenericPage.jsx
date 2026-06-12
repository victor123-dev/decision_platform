import React from 'react';
import {
  Database, Boxes, LineChart, Sparkles, BarChart3, Activity,
  Bot, Users, Zap, MemoryStick, Plus, Search
} from 'lucide-react';

const iconMap = {
  Database, Boxes, LineChart, Sparkles, BarChart3, Activity,
  Bot, Users, Zap, MemoryStick
};

export default function GenericPage({ title, description, icon, ...qoderProps }) {
  const Icon = iconMap[icon] || Boxes;

  const mockItems = [
    { name: `${title} - 示例 A`, status: '已发布', updated: '2024-12-01' },
    { name: `${title} - 示例 B`, status: '草稿', updated: '2024-11-28' },
    { name: `${title} - 示例 C`, status: '已发布', updated: '2024-11-25' },
    { name: `${title} - 示例 D`, status: '测试中', updated: '2024-11-20' },
  ];

  const statusBadge = (s) => {
    if (s === '已发布') return 'badge-success';
    if (s === '草稿') return 'badge-neutral';
    if (s === '测试中') return 'badge-warning';
    return 'badge-info';
  };

  return (
    <div className={["page animate-fade-in", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <div className="page-header" data-qoder-id="qel-page-header-cd439bb9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-header-cd439bb9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;page-header&quot;,&quot;loc&quot;:{&quot;line&quot;:31,&quot;column&quot;:7}}">
        <div data-qoder-id="qel-div-c8e80b36" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-c8e80b36&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:32,&quot;column&quot;:9}}">
          <h2 className="page-title" data-qoder-id="qel-page-title-74e5fc69" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-title-74e5fc69&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;page-title&quot;,&quot;loc&quot;:{&quot;line&quot;:33,&quot;column&quot;:11}}">{title}</h2>
          <p className="page-subtitle" data-qoder-id="qel-page-subtitle-366a9526" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-subtitle-366a9526&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;page-subtitle&quot;,&quot;loc&quot;:{&quot;line&quot;:34,&quot;column&quot;:11}}">{description}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }} data-qoder-id="qel-div-cde81315" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-cde81315&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:36,&quot;column&quot;:9}}">
          <button className="btn" data-qoder-id="qel-btn-4d2db384" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-4d2db384&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:37,&quot;column&quot;:11}}">
            <Search size={14}  data-qoder-id="qel-search-6f10c8db" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-search-6f10c8db&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;search&quot;,&quot;loc&quot;:{&quot;line&quot;:38,&quot;column&quot;:13}}"/>
            <span data-qoder-id="qel-span-5be7e584" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-5be7e584&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:39,&quot;column&quot;:13}}">搜索</span>
          </button>
          <button className="btn btn-primary" data-qoder-id="qel-btn-c6ecbd2a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-c6ecbd2a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:41,&quot;column&quot;:11}}">
            <Plus size={14}  data-qoder-id="qel-plus-f64a25e3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-plus-f64a25e3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;plus&quot;,&quot;loc&quot;:{&quot;line&quot;:42,&quot;column&quot;:13}}"/>
            <span data-qoder-id="qel-span-f3fa657a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-f3fa657a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:43,&quot;column&quot;:13}}">新建</span>
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }} data-qoder-id="qel-div-4244cf19" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-4244cf19&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:49,&quot;column&quot;:7}}">
        <div className="kpi-card" data-qoder-id="qel-kpi-card-d4bc4834" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kpi-card-d4bc4834&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;kpi-card&quot;,&quot;loc&quot;:{&quot;line&quot;:50,&quot;column&quot;:9}}">
          <div className="kpi-label" data-qoder-id="qel-kpi-label-11fe7119" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kpi-label-11fe7119&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;kpi-label&quot;,&quot;loc&quot;:{&quot;line&quot;:51,&quot;column&quot;:11}}">总数</div>
          <div className="kpi-value" data-qoder-id="qel-kpi-value-5e708f3d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kpi-value-5e708f3d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;kpi-value&quot;,&quot;loc&quot;:{&quot;line&quot;:52,&quot;column&quot;:11}}">4</div>
        </div>
        <div className="kpi-card" data-qoder-id="qel-kpi-card-d7bc4ced" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kpi-card-d7bc4ced&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;kpi-card&quot;,&quot;loc&quot;:{&quot;line&quot;:54,&quot;column&quot;:9}}">
          <div className="kpi-label" data-qoder-id="qel-kpi-label-1cfe826a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kpi-label-1cfe826a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;kpi-label&quot;,&quot;loc&quot;:{&quot;line&quot;:55,&quot;column&quot;:11}}">已发布</div>
          <div className="kpi-value" style={{ color: 'var(--success)' }} data-qoder-id="qel-kpi-value-4f7077a0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kpi-value-4f7077a0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;kpi-value&quot;,&quot;loc&quot;:{&quot;line&quot;:56,&quot;column&quot;:11}}">2</div>
        </div>
        <div className="kpi-card" data-qoder-id="qel-kpi-card-42c3b123" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kpi-card-42c3b123&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;kpi-card&quot;,&quot;loc&quot;:{&quot;line&quot;:58,&quot;column&quot;:9}}">
          <div className="kpi-label" data-qoder-id="qel-kpi-label-0dfc2c36" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kpi-label-0dfc2c36&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;kpi-label&quot;,&quot;loc&quot;:{&quot;line&quot;:59,&quot;column&quot;:11}}">草稿</div>
          <div className="kpi-value" style={{ color: 'var(--fg-3)' }} data-qoder-id="qel-kpi-value-c868e756" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kpi-value-c868e756&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;kpi-value&quot;,&quot;loc&quot;:{&quot;line&quot;:60,&quot;column&quot;:11}}">1</div>
        </div>
      </div>

      {/* Items list */}
      <div className="table-container" data-qoder-id="qel-table-container-cb91f179" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-container-cb91f179&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;table-container&quot;,&quot;loc&quot;:{&quot;line&quot;:65,&quot;column&quot;:7}}">
        <table className="table" data-qoder-id="qel-table-d391ce33" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-d391ce33&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;table&quot;,&quot;loc&quot;:{&quot;line&quot;:66,&quot;column&quot;:9}}">
          <thead data-qoder-id="qel-thead-0b7d6fd4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-thead-0b7d6fd4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;thead&quot;,&quot;loc&quot;:{&quot;line&quot;:67,&quot;column&quot;:11}}">
            <tr data-qoder-id="qel-tr-520e90d1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-520e90d1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:68,&quot;column&quot;:13}}">
              <th data-qoder-id="qel-th-77a92eb6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-77a92eb6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:69,&quot;column&quot;:15}}">名称</th>
              <th data-qoder-id="qel-th-82a94007" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-82a94007&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:70,&quot;column&quot;:15}}">状态</th>
              <th data-qoder-id="qel-th-81a93e74" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-81a93e74&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:71,&quot;column&quot;:15}}">更新时间</th>
              <th data-qoder-id="qel-th-f4a621e6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-f4a621e6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:72,&quot;column&quot;:15}}">操作</th>
            </tr>
          </thead>
          <tbody data-qoder-id="qel-tbody-44930b71" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tbody-44930b71&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;tbody&quot;,&quot;loc&quot;:{&quot;line&quot;:75,&quot;column&quot;:11}}">
            {mockItems.map((item, i) => (
              <tr key={i} data-qoder-id="qel-tr-4c0c48c8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-4c0c48c8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:77,&quot;column&quot;:15}}">
                <td data-qoder-id="qel-td-b611df2b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-b611df2b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:78,&quot;column&quot;:17}}">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} data-qoder-id="qel-div-47495426" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-47495426&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:79,&quot;column&quot;:19}}">
                    <Icon size={15} style={{ color: 'var(--fg-3)' }}  data-qoder-id="qel-icon-fb91abdf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-icon-fb91abdf&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;icon&quot;,&quot;loc&quot;:{&quot;line&quot;:80,&quot;column&quot;:21}}"/>
                    <span style={{ fontWeight: 500, color: 'var(--fg)' }} data-qoder-id="qel-span-5fff8cac" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-5fff8cac&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:81,&quot;column&quot;:21}}">{item.name}</span>
                  </div>
                </td>
                <td data-qoder-id="qel-td-ba11e577" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-ba11e577&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:84,&quot;column&quot;:17}}"><span className={`badge ${statusBadge(item.status)}`} data-qoder-id="qel-span-65ff961e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-65ff961e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:84,&quot;column&quot;:21}}">{item.status}</span></td>
                <td data-qoder-id="qel-td-b011d5b9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-b011d5b9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:85,&quot;column&quot;:17}}">{item.updated}</td>
                <td data-qoder-id="qel-td-3905e171" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-3905e171&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:86,&quot;column&quot;:17}}">
                  <div style={{ display: 'flex', gap: 6 }} data-qoder-id="qel-div-dc50fa7a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-dc50fa7a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:87,&quot;column&quot;:19}}">
                    <button className="btn btn-sm btn-ghost" style={{ color: 'var(--primary)' }} data-qoder-id="qel-btn-46f8bf9d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-46f8bf9d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:88,&quot;column&quot;:21}}">编辑</button>
                    <button className="btn btn-sm btn-ghost" style={{ color: 'var(--fg-3)' }} data-qoder-id="qel-btn-45f8be0a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-45f8be0a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GenericPage.jsx&quot;,&quot;componentName&quot;:&quot;GenericPage&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:89,&quot;column&quot;:21}}">删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
