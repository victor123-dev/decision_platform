import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Tag,
  FileText,
  User,
  Clock,
  Hash,
} from 'lucide-react';
import { api } from '@/api/apiClient';

const statusMap = {
  active: { className: 'badge-success', label: '活跃' },
  editing: { className: 'badge-warning', label: '编辑中' },
  draft: { className: 'badge-neutral', label: '草稿' },
};

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'active', label: '活跃' },
  { value: 'editing', label: '编辑中' },
  { value: 'draft', label: '草稿' },
];

export default function RuleSetList(qoderProps) {
  const navigate = useNavigate();
  const [ruleSetsData, setRuleSetsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  useEffect(() => {
    api.get('/rulesets/').then(data => { setRuleSetsData(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const allTags = Array.from(new Set(ruleSetsData.flatMap((rs) => rs.tags || [])));

  const filtered = useMemo(() => {
    return ruleSetsData.filter((rs) => {
      const q = searchText.toLowerCase();
      const matchesSearch =
        !q ||
        rs.name.toLowerCase().includes(q) ||
        rs.description.toLowerCase().includes(q);
      const matchesStatus = !statusFilter || rs.status === statusFilter;
      const matchesTag = !tagFilter || rs.tags.includes(tagFilter);
      return matchesSearch && matchesStatus && matchesTag;
    });
  }, [searchText, statusFilter, tagFilter]);

  return (
    <div className={["page", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      {/* Header */}
      <div className="page-header" data-qoder-id="qel-page-header-e0798981" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-header-e0798981&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;page-header&quot;,&quot;loc&quot;:{&quot;line&quot;:54,&quot;column&quot;:7}}">
        <div data-qoder-id="qel-div-ad4676ae" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ad4676ae&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:55,&quot;column&quot;:9}}">
          <h1 className="page-title" data-qoder-id="qel-page-title-ba4b5a3a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-title-ba4b5a3a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;page-title&quot;,&quot;loc&quot;:{&quot;line&quot;:56,&quot;column&quot;:11}}">规则集管理</h1>
          <p className="page-subtitle" data-qoder-id="qel-page-subtitle-c9976d4e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-subtitle-c9976d4e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;page-subtitle&quot;,&quot;loc&quot;:{&quot;line&quot;:57,&quot;column&quot;:11}}">
            管理决策规则集，配置业务规则与条件逻辑
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/rulesets/new')} data-qoder-id="qel-btn-68dc2d2f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-68dc2d2f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:61,&quot;column&quot;:9}}">
          <Plus size={15}  data-qoder-id="qel-plus-e7d02f8a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-plus-e7d02f8a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;plus&quot;,&quot;loc&quot;:{&quot;line&quot;:62,&quot;column&quot;:11}}"/>
          新建规则集
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar" data-qoder-id="qel-toolbar-0b9ab7e3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-toolbar-0b9ab7e3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;toolbar&quot;,&quot;loc&quot;:{&quot;line&quot;:68,&quot;column&quot;:7}}">
        <div className="search-bar" data-qoder-id="qel-search-bar-3bbdbc4f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-search-bar-3bbdbc4f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;search-bar&quot;,&quot;loc&quot;:{&quot;line&quot;:69,&quot;column&quot;:9}}">
          <Search size={15}  data-qoder-id="qel-search-45eabda8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-search-45eabda8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;search&quot;,&quot;loc&quot;:{&quot;line&quot;:70,&quot;column&quot;:11}}"/>
          <input
            className="input"
            placeholder="搜索规则集名称或描述..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
           data-qoder-id="qel-input-01917cc7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-01917cc7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:71,&quot;column&quot;:11}}"/>
        </div>

        <select
          className="select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
         data-qoder-id="qel-select-e079cbb2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-select-e079cbb2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;select&quot;,&quot;loc&quot;:{&quot;line&quot;:79,&quot;column&quot;:9}}">
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value} data-qoder-id="qel-option-9a471aa3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-option-9a471aa3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;option&quot;,&quot;loc&quot;:{&quot;line&quot;:85,&quot;column&quot;:13}}">
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className="select"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
         data-qoder-id="qel-select-da79c240" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-select-da79c240&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;select&quot;,&quot;loc&quot;:{&quot;line&quot;:91,&quot;column&quot;:9}}">
          <option value="" data-qoder-id="qel-option-a0472415" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-option-a0472415&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;option&quot;,&quot;loc&quot;:{&quot;line&quot;:96,&quot;column&quot;:11}}">全部标签</option>
          {allTags.map((t) => (
            <option key={t} value={t} data-qoder-id="qel-option-9d471f5c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-option-9d471f5c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;option&quot;,&quot;loc&quot;:{&quot;line&quot;:98,&quot;column&quot;:13}}">
              {t}
            </option>
          ))}
        </select>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }} data-qoder-id="qel-div-5ee835ad" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-5ee835ad&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:104,&quot;column&quot;:9}}">
          <button
            className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('table')}
            data-tooltip="表格视图"
           data-qoder-id="qel-button-e82df528" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-e82df528&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:105,&quot;column&quot;:11}}">
            <List size={14}  data-qoder-id="qel-list-df84b193" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-list-df84b193&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;list&quot;,&quot;loc&quot;:{&quot;line&quot;:110,&quot;column&quot;:13}}"/>
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'card' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('card')}
            data-tooltip="卡片视图"
           data-qoder-id="qel-button-f234c0ab" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-f234c0ab&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:112,&quot;column&quot;:11}}">
            <LayoutGrid size={14}  data-qoder-id="qel-layoutgrid-7dc8322c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-layoutgrid-7dc8322c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;layoutgrid&quot;,&quot;loc&quot;:{&quot;line&quot;:117,&quot;column&quot;:13}}"/>
          </button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="table-container" style={{ marginTop: 8 }} data-qoder-id="qel-table-container-ee1c647e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-container-ee1c647e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;table-container&quot;,&quot;loc&quot;:{&quot;line&quot;:124,&quot;column&quot;:9}}">
          <table className="table" data-qoder-id="qel-table-4d7ac49a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-4d7ac49a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;table&quot;,&quot;loc&quot;:{&quot;line&quot;:125,&quot;column&quot;:11}}">
            <thead data-qoder-id="qel-thead-19accf2f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-thead-19accf2f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;thead&quot;,&quot;loc&quot;:{&quot;line&quot;:126,&quot;column&quot;:13}}">
              <tr data-qoder-id="qel-tr-4e7f0920" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-4e7f0920&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:127,&quot;column&quot;:15}}">
                <th data-qoder-id="qel-th-73135971" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-73135971&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:128,&quot;column&quot;:17}}">名称</th>
                <th data-qoder-id="qel-th-721357de" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-721357de&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:129,&quot;column&quot;:17}}">描述</th>
                <th style={{ textAlign: 'center' }} data-qoder-id="qel-th-6d134fff" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-6d134fff&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:130,&quot;column&quot;:17}}">规则数</th>
                <th data-qoder-id="qel-th-6c134e6c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-6c134e6c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:131,&quot;column&quot;:17}}">标签</th>
                <th data-qoder-id="qel-th-6f11148e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-6f11148e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:132,&quot;column&quot;:17}}">创建者</th>
                <th data-qoder-id="qel-th-70111621" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-70111621&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:133,&quot;column&quot;:17}}">版本</th>
                <th data-qoder-id="qel-th-6d111168" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-6d111168&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:134,&quot;column&quot;:17}}">状态</th>
                <th data-qoder-id="qel-th-6e1112fb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-6e1112fb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:135,&quot;column&quot;:17}}">更新时间</th>
              </tr>
            </thead>
            <tbody data-qoder-id="qel-tbody-141866b2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tbody-141866b2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;tbody&quot;,&quot;loc&quot;:{&quot;line&quot;:138,&quot;column&quot;:13}}">
              {filtered.length === 0 ? (
                <tr data-qoder-id="qel-tr-527cd0d5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-527cd0d5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:140,&quot;column&quot;:17}}">
                  <td colSpan={8} data-qoder-id="qel-td-139df40c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-139df40c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:141,&quot;column&quot;:19}}">
                    <div className="empty-state" data-qoder-id="qel-empty-state-d83e90dd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-empty-state-d83e90dd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;empty-state&quot;,&quot;loc&quot;:{&quot;line&quot;:142,&quot;column&quot;:21}}">
                      <FileText size={40}  data-qoder-id="qel-filetext-46cfed38" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-filetext-46cfed38&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;filetext&quot;,&quot;loc&quot;:{&quot;line&quot;:143,&quot;column&quot;:23}}"/>
                      <p data-qoder-id="qel-p-384866b1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-384866b1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:144,&quot;column&quot;:23}}">没有找到匹配的规则集</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((rs) => {
                  const st = statusMap[rs.status] || statusMap.draft;
                  return (
                    <tr
                      key={rs.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/rulesets/${rs.id}`)}
                     data-qoder-id="qel-tr-4f700029" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-4f700029&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:152,&quot;column&quot;:21}}">
                      <td style={{ color: 'var(--fg)', fontWeight: 500 }} data-qoder-id="qel-td-9291f006" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-9291f006&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:157,&quot;column&quot;:23}}">
                        {rs.name}
                      </td>
                      <td data-qoder-id="qel-td-9191ee73" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-9191ee73&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:160,&quot;column&quot;:23}}">{rs.description}</td>
                      <td style={{ textAlign: 'center' }} data-qoder-id="qel-td-9091ece0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-9091ece0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:161,&quot;column&quot;:23}}">
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'var(--surface-3)',
                            borderRadius: 'var(--seed-radius-sm)',
                            padding: '2px 10px',
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--fg-2)',
                            minWidth: 32,
                          }}
                         data-qoder-id="qel-span-1f23ebed" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-1f23ebed&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:162,&quot;column&quot;:25}}">
                          {rs.ruleCount}
                        </span>
                      </td>
                      <td data-qoder-id="qel-td-9691f652" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-9691f652&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:179,&quot;column&quot;:23}}">
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }} data-qoder-id="qel-div-cff42083" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-cff42083&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:180,&quot;column&quot;:25}}">
                          {rs.tags.map((tag) => (
                            <span key={tag} className="badge badge-info" data-qoder-id="qel-badge-4a7457eb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-4a7457eb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:182,&quot;column&quot;:29}}">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td data-qoder-id="qel-td-9b91fe31" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-9b91fe31&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:188,&quot;column&quot;:23}}">
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }} data-qoder-id="qel-span-1223d776" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-1223d776&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:189,&quot;column&quot;:25}}">
                          <User size={13} style={{ color: 'var(--fg-4)' }}  data-qoder-id="qel-user-5de99e06" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-user-5de99e06&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;user&quot;,&quot;loc&quot;:{&quot;line&quot;:190,&quot;column&quot;:27}}"/>
                          {rs.creator}
                        </span>
                      </td>
                      <td data-qoder-id="qel-td-8e8fab23" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-8e8fab23&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:194,&quot;column&quot;:23}}">
                        <code
                          style={{
                            fontSize: 12,
                            color: 'var(--fg-3)',
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                         data-qoder-id="qel-code-2626ee70" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-code-2626ee70&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;code&quot;,&quot;loc&quot;:{&quot;line&quot;:195,&quot;column&quot;:25}}">
                          {rs.version}
                        </code>
                      </td>
                      <td data-qoder-id="qel-td-908fae49" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-908fae49&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:205,&quot;column&quot;:23}}">
                        <span className={`badge ${st.className}`} data-qoder-id="qel-span-9920da64" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-9920da64&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:206,&quot;column&quot;:25}}">{st.label}</span>
                      </td>
                      <td data-qoder-id="qel-td-928fb16f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-928fb16f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:208,&quot;column&quot;:23}}">
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            color: 'var(--fg-3)',
                            fontSize: 12,
                          }}
                         data-qoder-id="qel-span-9b20dd8a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-9b20dd8a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:209,&quot;column&quot;:25}}">
                          <Clock size={12}  data-qoder-id="qel-clock-25d4d4d1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-clock-25d4d4d1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;clock&quot;,&quot;loc&quot;:{&quot;line&quot;:218,&quot;column&quot;:27}}"/>
                          {rs.updatedAt}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Card View */}
      {viewMode === 'card' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 12,
            marginTop: 8,
          }}
         data-qoder-id="qel-div-d7f1ee84" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-d7f1ee84&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:233,&quot;column&quot;:9}}">
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }} data-qoder-id="qel-empty-state-ce4d8ba9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-empty-state-ce4d8ba9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;empty-state&quot;,&quot;loc&quot;:{&quot;line&quot;:242,&quot;column&quot;:13}}">
              <FileText size={40}  data-qoder-id="qel-filetext-dcdc124d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-filetext-dcdc124d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;filetext&quot;,&quot;loc&quot;:{&quot;line&quot;:243,&quot;column&quot;:15}}"/>
              <p data-qoder-id="qel-p-bc40e7b8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-bc40e7b8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:244,&quot;column&quot;:15}}">没有找到匹配的规则集</p>
            </div>
          ) : (
            filtered.map((rs) => {
              const st = statusMap[rs.status] || statusMap.draft;
              return (
                <div
                  key={rs.id}
                  className="card card-hover"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/rulesets/${rs.id}`)}
                 data-qoder-id="qel-card-f22bc842" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-f22bc842&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:250,&quot;column&quot;:17}}">
                  {/* Card header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: 10,
                    }}
                   data-qoder-id="qel-div-62f9851a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-62f9851a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:257,&quot;column&quot;:19}}">
                    <div style={{ flex: 1, minWidth: 0 }} data-qoder-id="qel-div-5df97d3b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-5df97d3b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:265,&quot;column&quot;:21}}">
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: 'var(--fg)',
                          marginBottom: 4,
                        }}
                       data-qoder-id="qel-div-5cf97ba8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-5cf97ba8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:266,&quot;column&quot;:23}}">
                        {rs.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--fg-3)' }} data-qoder-id="qel-div-5ff98061" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-5ff98061&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:276,&quot;column&quot;:23}}">
                        {rs.description}
                      </div>
                    </div>
                    <span
                      className={`badge ${st.className}`}
                      style={{ flexShrink: 0, marginLeft: 8 }}
                     data-qoder-id="qel-span-0c284b32" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-0c284b32&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:280,&quot;column&quot;:21}}">
                      {st.label}
                    </span>
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }} data-qoder-id="qel-div-59f976ef" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-59f976ef&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:289,&quot;column&quot;:19}}">
                    {rs.tags.map((tag) => (
                      <span key={tag} className="badge badge-info" data-qoder-id="qel-badge-3c6fc4b3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-3c6fc4b3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:291,&quot;column&quot;:23}}">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      fontSize: 12,
                      color: 'var(--fg-3)',
                    }}
                   data-qoder-id="qel-div-dbf671fe" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-dbf671fe&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:298,&quot;column&quot;:19}}">
                    <span
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                     data-qoder-id="qel-span-22262f3d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-22262f3d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:307,&quot;column&quot;:21}}">
                      <Hash size={12}  data-qoder-id="qel-hash-491ca5a0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-hash-491ca5a0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;hash&quot;,&quot;loc&quot;:{&quot;line&quot;:310,&quot;column&quot;:23}}"/>
                      {rs.ruleCount} 条规则
                    </span>
                    <span
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                     data-qoder-id="qel-span-20262c17" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-20262c17&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:313,&quot;column&quot;:21}}">
                      <User size={12}  data-qoder-id="qel-user-ede47088" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-user-ede47088&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;user&quot;,&quot;loc&quot;:{&quot;line&quot;:316,&quot;column&quot;:23}}"/>
                      {rs.creator}
                    </span>
                    <code
                      style={{
                        fontSize: 11,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: 'var(--fg-4)',
                      }}
                     data-qoder-id="qel-code-b921c5ab" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-code-b921c5ab&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;code&quot;,&quot;loc&quot;:{&quot;line&quot;:319,&quot;column&quot;:21}}">
                      {rs.version}
                    </code>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        marginLeft: 'auto',
                      }}
                     data-qoder-id="qel-span-1b262438" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-1b262438&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:328,&quot;column&quot;:21}}">
                      <Clock size={12}  data-qoder-id="qel-clock-95da024f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-clock-95da024f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetList.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetList&quot;,&quot;elementRole&quot;:&quot;clock&quot;,&quot;loc&quot;:{&quot;line&quot;:336,&quot;column&quot;:23}}"/>
                      {rs.updatedAt}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
