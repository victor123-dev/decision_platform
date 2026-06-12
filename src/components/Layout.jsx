import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ListChecks, GitBranch, Table2,
  Brain, Rocket, Search, Bell, User,
  ChevronDown, Database, Bot, Users, Zap,
  MemoryStick, Settings, BarChart3, Sparkles,
  LineChart, Star, Boxes, Activity,
  Mail, Grid3X3, CircleHelp, Wrench, X, Home,
  ChevronLeft, ChevronRight, GripVertical
} from 'lucide-react';
import { decisionFlows } from '@/data/mockData';

const navSections = [
  {
    label: '数据', key: 'data',
    items: [
      { to: 'datasets', label: '数据集', icon: Database },
      { to: 'ontology', label: '本体模型', icon: Boxes },
      { to: 'calc-models', label: '计算模型', icon: LineChart },
    ]
  },
  {
    label: '数据科学', key: 'datascience',
    items: [
      { to: 'automl', label: '自动机器学习', icon: Sparkles },
      { to: 'models', label: '机器学习模型', icon: Brain },
      { to: 'forecast', label: '智能预测模型', icon: BarChart3 },
      { to: 'optimization', label: '优化求解模型', icon: Activity },
    ]
  },
  {
    label: '智能体', key: 'agents',
    items: [
      { to: 'agents', label: '智能体', icon: Bot },
      { to: 'agent-teams', label: '智能体团队', icon: Users },
      { to: 'skills', label: '技能', icon: Zap },
      { to: 'memory', label: '记忆', icon: MemoryStick },
    ]
  },
  {
    label: '自动化', key: 'automation',
    items: [
      { to: 'decision-flows', label: '决策逻辑', icon: GitBranch },
      { to: 'rulesets', label: '规则集', icon: ListChecks },
      { to: 'lookup-tables', label: '交互界面', icon: Table2 },
    ]
  },
];

const appSwitcherItems = [
  { label: '应用', icon: Wrench },
  { label: '信箱', icon: Mail },
  { label: '工作空间', icon: Grid3X3, route: '/workspace' },
  { label: '决策控制室', icon: Activity },
  { label: '管理后台', icon: Settings },
];

const workspaceNames = {
  purchasing: '采购员工作空间',
  planning: '计划员工作空间',
};

// List pages that should NOT create a tab — only show page content
const LIST_PATHS = new Set([
  'datasets', 'ontology', 'calc-models',
  'automl', 'models', 'forecast', 'optimization',
  'agents', 'agent-teams', 'skills', 'memory',
  'decision-flows', 'rulesets', 'lookup-tables',
  'code-files', 'variables', 'execution-test', 'publish',
]);

// Look up a decision flow's display name from mockData
function getDecisionFlowName(id) {
  const flow = decisionFlows.find(f => f.id === id);
  return flow ? flow.name : null;
}

export default function Layout(qoderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const isWorkspace = path.startsWith('/w/');
  const isPlatform = path === '/';
  const isWorkspaceList = path === '/workspace';

  const wsMatch = path.match(/^\/w\/([^/]+)/);
  const wsId = wsMatch ? wsMatch[1] : null;
  const wsName = wsId ? (workspaceNames[wsId] || wsId) : '';

  const featureMatch = path.match(/^\/w\/[^/]+\/(.+)/);
  const activeFeature = featureMatch ? featureMatch[1] : null;

  const [sidebarTab, setSidebarTab] = useState('功能设计');
  const [collapsedSections, setCollapsedSections] = useState({ data: false });
  const [showAppsMenu, setShowAppsMenu] = useState(false);
  const appsRef = useRef(null);
  const [featureTabs, setFeatureTabs] = useState([]);
  const [isStarred, setIsStarred] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isDragging, setIsDragging] = useState(false);
  const sidebarRef = useRef(null);
  const minSidebarWidth = 64;
  const maxSidebarWidth = 360;

  useEffect(() => {
    const handleClick = (e) => {
      if (appsRef.current && !appsRef.current.contains(e.target)) {
        setShowAppsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && sidebarRef.current) {
        const newWidth = e.clientX - sidebarRef.current.getBoundingClientRect().left;
        const clampedWidth = Math.min(Math.max(newWidth, minSidebarWidth), maxSidebarWidth);
        setSidebarWidth(clampedWidth);
        if (clampedWidth <= 72 && !sidebarCollapsed) {
          setSidebarCollapsed(true);
        } else if (clampedWidth > 72 && sidebarCollapsed) {
          setSidebarCollapsed(false);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, sidebarCollapsed]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
    if (sidebarCollapsed) {
      setSidebarWidth(240);
    } else {
      setSidebarWidth(64);
    }
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (activeFeature && isWorkspace) {
      // Skip tab creation for list pages — only detail pages get tabs
      if (LIST_PATHS.has(activeFeature)) return;

      setFeatureTabs(prev => {
        const exists = prev.find(t => t.key === activeFeature);
        if (exists) return prev;
        const tabInfo = getTabInfo(activeFeature);
        return [...prev, { key: activeFeature, ...tabInfo }];
      });
    }
  }, [activeFeature, isWorkspace]);

  // Build tab display info: label + optional icon type
  const getTabInfo = (key) => {
    // Decision flow detail: decision-flows/:id
    if (key.startsWith('decision-flows/')) {
      const id = key.split('/')[1] || '';
      const flowName = getDecisionFlowName(id);
      return {
        label: flowName || '新增',
        iconType: 'gitbranch',
      };
    }
    // Other detail pages (models/:id, rulesets/:id, etc.)
    const parts = key.split('/');
    if (parts.length === 2) {
      const basePath = parts[0];
      for (const s of navSections) {
        for (const item of s.items) {
          if (item.to === basePath) {
            return { label: item.label, iconType: null };
          }
        }
      }
    }
    // Fallback
    return { label: key, iconType: null };
  };

  const findFeatureLabel = (key) => {
    const info = getTabInfo(key);
    return info.label;
  };

  const closeFeatureTab = (key) => {
    setFeatureTabs(prev => prev.filter(t => t.key !== key));
    if (activeFeature === key) navigate(`/w/${wsId}`);
  };

  const closeAllFeatureTabs = () => {
    setFeatureTabs([]);
    navigate(`/w/${wsId}`);
  };

  const toggleSection = (key) => {
    setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const showSidebarTabs = isWorkspace && !activeFeature;

  return (
    <div style={{ ...({ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }), ...(qoderProps?.style) }} className={qoderProps?.className} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      {/* ===== Top Bar ===== */}
      <div className="top-bar" data-qoder-id="qel-top-bar-56f4070d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-top-bar-56f4070d&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;top-bar&quot;,&quot;loc&quot;:{&quot;line&quot;:130,&quot;column&quot;:7}}">
        <div className="top-bar-left" data-qoder-id="qel-top-bar-left-b44683b6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-top-bar-left-b44683b6&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;top-bar-left&quot;,&quot;loc&quot;:{&quot;line&quot;:131,&quot;column&quot;:9}}">
          <div
            className="top-bar-logo"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/')}
           data-qoder-id="qel-top-bar-logo-99af8265" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-top-bar-logo-99af8265&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;top-bar-logo&quot;,&quot;loc&quot;:{&quot;line&quot;:132,&quot;column&quot;:11}}">
            DP
          </div>
          <span
            className="top-bar-product"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/')}
           data-qoder-id="qel-top-bar-product-49a6dd07" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-top-bar-product-49a6dd07&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;top-bar-product&quot;,&quot;loc&quot;:{&quot;line&quot;:139,&quot;column&quot;:11}}">
            决策平台
          </span>
          {isWorkspace && (
            <>
              <span className="top-bar-separator" data-qoder-id="qel-top-bar-separator-0d04292a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-top-bar-separator-0d04292a&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;top-bar-separator&quot;,&quot;loc&quot;:{&quot;line&quot;:148,&quot;column&quot;:15}}">/</span>
              <div className="top-bar-workspace-wrap" style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }} data-qoder-id="qel-top-bar-workspace-wrap-68f51e5b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-top-bar-workspace-wrap-68f51e5b&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;top-bar-workspace-wrap&quot;,&quot;loc&quot;:{&quot;line&quot;:149,&quot;column&quot;:15}}">
                <span className="top-bar-workspace" data-qoder-id="qel-top-bar-workspace-6b8e8a5a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-top-bar-workspace-6b8e8a5a&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;top-bar-workspace&quot;,&quot;loc&quot;:{&quot;line&quot;:150,&quot;column&quot;:17}}">{wsName}</span>
                <button
                  className={`top-bar-star ${isStarred ? 'active' : ''}`}
                  onClick={() => setIsStarred(!isStarred)}
                  style={isStarred ? { display: 'flex' } : {}}
                 data-qoder-id="qel-button-18277e3c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-18277e3c&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:151,&quot;column&quot;:17}}">
                  <Star size={14} fill={isStarred ? '#f59e0b' : 'none'}  data-qoder-id="qel-star-178e0130" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-star-178e0130&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;star&quot;,&quot;loc&quot;:{&quot;line&quot;:156,&quot;column&quot;:19}}"/>
                </button>
              </div>
            </>
          )}
        </div>
        <div className="top-bar-right" ref={appsRef} data-qoder-id="qel-top-bar-right-55a84ce2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-top-bar-right-55a84ce2&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;top-bar-right&quot;,&quot;loc&quot;:{&quot;line&quot;:162,&quot;column&quot;:9}}">
          <button className="top-bar-icon-btn" title="搜索" data-qoder-id="qel-top-bar-icon-btn-e90aecc4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-top-bar-icon-btn-e90aecc4&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;top-bar-icon-btn&quot;,&quot;loc&quot;:{&quot;line&quot;:163,&quot;column&quot;:11}}"><Search size={16}  data-qoder-id="qel-search-6aafff1d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-search-6aafff1d&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;search&quot;,&quot;loc&quot;:{&quot;line&quot;:163,&quot;column&quot;:59}}"/></button>
          <button className="top-bar-icon-btn" title="通知" data-qoder-id="qel-top-bar-icon-btn-e70ae99e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-top-bar-icon-btn-e70ae99e&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;top-bar-icon-btn&quot;,&quot;loc&quot;:{&quot;line&quot;:164,&quot;column&quot;:11}}">
            <Bell size={16}  data-qoder-id="qel-bell-8ee9e98d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-bell-8ee9e98d&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;bell&quot;,&quot;loc&quot;:{&quot;line&quot;:165,&quot;column&quot;:13}}"/>
            <span className="notif-dot"  data-qoder-id="qel-notif-dot-922fe344" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-notif-dot-922fe344&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;notif-dot&quot;,&quot;loc&quot;:{&quot;line&quot;:166,&quot;column&quot;:13}}"/>
          </button>
          <button
            className="top-bar-icon-btn"
            title="应用切换"
            onClick={() => setShowAppsMenu(!showAppsMenu)}
            style={showAppsMenu ? { background: 'var(--surface-2)' } : {}}
           data-qoder-id="qel-top-bar-icon-btn-e60ae80b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-top-bar-icon-btn-e60ae80b&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;top-bar-icon-btn&quot;,&quot;loc&quot;:{&quot;line&quot;:168,&quot;column&quot;:11}}">
            <Grid3X3 size={16}  data-qoder-id="qel-grid3x3-33e5d088" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-grid3x3-33e5d088&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;grid3x3&quot;,&quot;loc&quot;:{&quot;line&quot;:174,&quot;column&quot;:13}}"/>
          </button>
          <button className="top-bar-icon-btn" title="帮助" data-qoder-id="qel-top-bar-icon-btn-e40ae4e5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-top-bar-icon-btn-e40ae4e5&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;top-bar-icon-btn&quot;,&quot;loc&quot;:{&quot;line&quot;:176,&quot;column&quot;:11}}"><CircleHelp size={16}  data-qoder-id="qel-circlehelp-d82a28d9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-circlehelp-d82a28d9&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;circlehelp&quot;,&quot;loc&quot;:{&quot;line&quot;:176,&quot;column&quot;:59}}"/></button>
          <button className="top-bar-icon-btn" title="用户" data-qoder-id="qel-top-bar-icon-btn-e408a64e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-top-bar-icon-btn-e408a64e&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;top-bar-icon-btn&quot;,&quot;loc&quot;:{&quot;line&quot;:177,&quot;column&quot;:11}}"><User size={16}  data-qoder-id="qel-user-d255795f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-user-d255795f&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;user&quot;,&quot;loc&quot;:{&quot;line&quot;:177,&quot;column&quot;:59}}"/></button>
          {showAppsMenu && (
            <div className="app-switcher-dropdown" data-qoder-id="qel-app-switcher-dropdown-28d249b0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-app-switcher-dropdown-28d249b0&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;app-switcher-dropdown&quot;,&quot;loc&quot;:{&quot;line&quot;:179,&quot;column&quot;:13}}">
              {appSwitcherItems.map(item => (
                <button
                  key={item.label}
                  className="app-switcher-item"
                  onClick={() => { setShowAppsMenu(false); if (item.route) navigate(item.route); }}
                 data-qoder-id="qel-app-switcher-item-e9db3bcc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-app-switcher-item-e9db3bcc&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;app-switcher-item&quot;,&quot;loc&quot;:{&quot;line&quot;:181,&quot;column&quot;:17}}">
                  <item.icon size={16}  data-qoder-id="qel-item-icon-65adc87f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-item-icon-65adc87f&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;item-icon&quot;,&quot;loc&quot;:{&quot;line&quot;:186,&quot;column&quot;:19}}"/>
                  <span data-qoder-id="qel-span-540d6085" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-540d6085&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:187,&quot;column&quot;:19}}">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== Tab Bar ===== */}
      <div className="tab-bar-area" data-qoder-id="qel-tab-bar-area-713d957e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tab-bar-area-713d957e&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;tab-bar-area&quot;,&quot;loc&quot;:{&quot;line&quot;:196,&quot;column&quot;:7}}">
        {/* Primary tab row */}
        <div className="tab-bar" data-qoder-id="qel-tab-bar-791b4c0b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tab-bar-791b4c0b&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;tab-bar&quot;,&quot;loc&quot;:{&quot;line&quot;:198,&quot;column&quot;:9}}">
          <button
            className={`tab-bar-item ${!activeFeature && !isWorkspaceList ? 'active' : ''}`}
            onClick={() => { if (isWorkspace) navigate(`/w/${wsId}`); else navigate('/'); }}
           data-qoder-id="qel-button-0b47385c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-0b47385c&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:199,&quot;column&quot;:11}}">
            <Home size={14}  data-qoder-id="qel-home-229a93a8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-home-229a93a8&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;home&quot;,&quot;loc&quot;:{&quot;line&quot;:203,&quot;column&quot;:13}}"/>
            主页
          </button>

          {isWorkspace && featureTabs.map(tab => (
            <div key={tab.key} style={{ display: 'contents' }} data-qoder-id="qel-react-fragment-35c1288c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-react-fragment-35c1288c&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;react-fragment&quot;,&quot;loc&quot;:{&quot;line&quot;:208,&quot;column&quot;:13}}">
            <div className="tab-bar-divider"  data-qoder-id="qel-tab-bar-divider-b25b30ea" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tab-bar-divider-b25b30ea&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;tab-bar-divider&quot;,&quot;loc&quot;:{&quot;line&quot;:237,&quot;column&quot;:13}}"/>
            <button
              className={`tab-bar-item ${activeFeature === tab.key ? 'active' : ''}`}
              onClick={() => navigate(`/w/${wsId}/${tab.key}`)}
             data-qoder-id="qel-button-93443cdd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-93443cdd&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:238,&quot;column&quot;:13}}">
              {tab.iconType === 'gitbranch' && <GitBranch size={13} style={{ color: 'var(--primary)', flexShrink: 0 }}  data-qoder-id="qel-gitbranch-c7e484e6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-gitbranch-c7e484e6&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;gitbranch&quot;,&quot;loc&quot;:{&quot;line&quot;:259,&quot;column&quot;:48}}"/>}
              {tab.label}
              <span className="tab-close" onClick={(e) => { e.stopPropagation(); closeFeatureTab(tab.key); }} data-qoder-id="qel-tab-close-4c67b99c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tab-close-4c67b99c&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;tab-close&quot;,&quot;loc&quot;:{&quot;line&quot;:243,&quot;column&quot;:15}}">
                <X size={10}  data-qoder-id="qel-x-c641dc03" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-x-c641dc03&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;x&quot;,&quot;loc&quot;:{&quot;line&quot;:244,&quot;column&quot;:17}}"/>
              </span>
            </button>
          </div>
        ))}
        {isWorkspace && featureTabs.length > 0 && (
          <>
            <div className="tab-bar-divider"  data-qoder-id="qel-tab-bar-divider-b05b2dc4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tab-bar-divider-b05b2dc4&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;tab-bar-divider&quot;,&quot;loc&quot;:{&quot;line&quot;:232,&quot;column&quot;:13}}"/>
            <button
              className="tab-bar-item tab-close-all"
              title="关闭全部标签页"
              onClick={closeAllFeatureTabs}
              style={{ marginLeft: 'auto', color: 'var(--fg-2)', fontSize: 12, gap: 3, padding: '2px 8px' }}
             data-qoder-id="qel-tab-bar-item-26f3c928" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tab-bar-item-26f3c928&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;tab-bar-item&quot;,&quot;loc&quot;:{&quot;line&quot;:233,&quot;column&quot;:13}}">
              <X size={12}  data-qoder-id="qel-x-d341f07a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-x-d341f07a&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;x&quot;,&quot;loc&quot;:{&quot;line&quot;:239,&quot;column&quot;:15}}"/>
              全部关闭
            </button>
          </>
        )}
        </div>

        {/* Sub-tab row: 功能设计 / 应用配置 (only on workspace homepage) */}
        {showSidebarTabs && (
          <div className="sub-tab-bar" data-qoder-id="qel-sub-tab-bar-e4919175" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-sub-tab-bar-e4919175&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;sub-tab-bar&quot;,&quot;loc&quot;:{&quot;line&quot;:225,&quot;column&quot;:11}}">
            <button
              className={`sub-tab-item ${sidebarTab === '功能设计' ? 'active' : ''}`}
              onClick={() => setSidebarTab('功能设计')}
             data-qoder-id="qel-button-914439b7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-914439b7&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:226,&quot;column&quot;:13}}">
              功能设计
            </button>
            <button
              className={`sub-tab-item ${sidebarTab === '应用配置' ? 'active' : ''}`}
              onClick={() => setSidebarTab('应用配置')}
             data-qoder-id="qel-button-86442866" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-86442866&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:232,&quot;column&quot;:13}}">
              应用配置
            </button>
          </div>
        )}
      </div>

      {/* ===== Content Area ===== */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }} data-qoder-id="qel-div-fd0d7a4e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-fd0d7a4e&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:252,&quot;column&quot;:7}}">
        {isWorkspace && (
          <div className="sidebar-wrapper" data-qoder-id="qel-sidebar-wrapper-0a1b2c3d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-sidebar-wrapper-0a1b2c3d&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;sidebar-wrapper&quot;,&quot;loc&quot;:{&quot;line&quot;:254,&quot;column&quot;:11}}">
            <aside
              ref={sidebarRef}
              className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}
              style={{ width: sidebarWidth, minWidth: sidebarWidth }}
              data-qoder-id="qel-sidebar-9c584d9d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-sidebar-9c584d9d&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;sidebar&quot;,&quot;loc&quot;:{&quot;line&quot;:255,&quot;column&quot;:13}}">
              <nav className="sidebar-nav" data-qoder-id="qel-sidebar-nav-993a3c86" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-sidebar-nav-993a3c86&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;sidebar-nav&quot;,&quot;loc&quot;:{&quot;line&quot;:256,&quot;column&quot;:15}}">
                <div className="sidebar-home-row" data-qoder-id="qel-sidebar-home-row-cd1e2f3g" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-sidebar-home-row-cd1e2f3g&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;sidebar-home-row&quot;,&quot;loc&quot;:{&quot;line&quot;:257,&quot;column&quot;:17}}">
                  <button
                    className="sidebar-link sidebar-home-btn"
                    onClick={() => navigate(`/w/${wsId}`)}
                    style={{
                      paddingLeft: sidebarCollapsed ? undefined : 16,
                      border: 'none',
                      background: !activeFeature ? '#eff6ff' : 'none',
                      color: !activeFeature ? 'var(--primary)' : 'var(--fg-2)',
                      fontWeight: !activeFeature ? 500 : 400,
                    }}
                    title={sidebarCollapsed ? '主页' : undefined}
                   data-qoder-id="qel-sidebar-link-e0c686db" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-sidebar-link-e0c686db&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;sidebar-link&quot;,&quot;loc&quot;:{&quot;line&quot;:258,&quot;column&quot;:19}}">
                    <LayoutDashboard size={15}  data-qoder-id="qel-layoutdashboard-8e2b5807" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-layoutdashboard-8e2b5807&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;layoutdashboard&quot;,&quot;loc&quot;:{&quot;line&quot;:269,&quot;column&quot;:21}}"/>
                    {!sidebarCollapsed && <span data-qoder-id="qel-span-d712abec" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-d712abec&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:270,&quot;column&quot;:21}}">主页</span>}
                  </button>
                  <button
                    className="sidebar-toggle-btn"
                    onClick={toggleSidebar}
                    title={sidebarCollapsed ? '展开菜单' : '收起菜单'}
                    data-qoder-id="qel-sidebar-toggle-btn-4d5e6f7g" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-sidebar-toggle-btn-4d5e6f7g&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;sidebar-toggle-btn&quot;,&quot;loc&quot;:{&quot;line&quot;:272,&quot;column&quot;:19}}">
                    {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                  </button>
                </div>

                {navSections.map(section => (
                  <div className="sidebar-section" key={section.key} data-qoder-id="qel-sidebar-section-4a49b256" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-sidebar-section-4a49b256&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;sidebar-section&quot;,&quot;loc&quot;:{&quot;line&quot;:273,&quot;column&quot;:19}}">
                    <div
                      className={`sidebar-section-header ${collapsedSections[section.key] ? 'collapsed' : ''}`}
                      onClick={() => toggleSection(section.key)}
                      title={sidebarCollapsed ? section.label : undefined}
                     data-qoder-id="qel-div-fa00a9a2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-fa00a9a2&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:274,&quot;column&quot;:21}}">
                      {!sidebarCollapsed && (
                        <>
                          <span data-qoder-id="qel-span-d412a733" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-d412a733&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:278,&quot;column&quot;:23}}">{section.label}</span>
                          <ChevronDown size={14}  data-qoder-id="qel-chevrondown-e63e2b2c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chevrondown-e63e2b2c&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;chevrondown&quot;,&quot;loc&quot;:{&quot;line&quot;:279,&quot;column&quot;:23}}"/>
                        </>
                      )}
                    </div>
                    {!collapsedSections[section.key] && section.items.map(item => {
                      const isActive = activeFeature === item.to;
                      return (
                        <button
                          key={item.to}
                          className={`sidebar-link ${isActive ? 'active' : ''}`}
                          onClick={() => navigate(`/w/${wsId}/${item.to}`)}
                          style={{ border: 'none', width: '100%', textAlign: 'left' }}
                          title={sidebarCollapsed ? item.label : undefined}
                         data-qoder-id="qel-button-08382919" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-08382919&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:284,&quot;column&quot;:25}}">
                          <item.icon size={15}  data-qoder-id="qel-item-icon-6dbcdfa1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-item-icon-6dbcdfa1&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;item-icon&quot;,&quot;loc&quot;:{&quot;line&quot;:290,&quot;column&quot;:27}}"/>
                          {!sidebarCollapsed && <span data-qoder-id="qel-span-d410689c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-d410689c&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:291,&quot;column&quot;:27}}">{item.label}</span>}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </nav>

                            <div style={{ padding: '8px 0', borderTop: '1px solid var(--border)' }} data-qoder-id="qel-div-f1fe5e73" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f1fe5e73&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:300,&quot;column&quot;:15}}">
                <button
                  className={`sidebar-link ${activeFeature === 'publish' ? 'active' : ''}`}
                  onClick={() => navigate(`/w/${wsId}/publish`)}
                  style={{ paddingLeft: sidebarCollapsed ? undefined : 16, border: 'none', width: '100%', textAlign: 'left' }}
                  title={sidebarCollapsed ? '发布管理' : undefined}
                 data-qoder-id="qel-button-0f35f587" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-0f35f587&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:309,&quot;column&quot;:17}}">
                  <Rocket size={15}  data-qoder-id="qel-rocket-3bff7e56" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-rocket-3bff7e56&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;rocket&quot;,&quot;loc&quot;:{&quot;line&quot;:314,&quot;column&quot;:19}}"/>
                  {!sidebarCollapsed && <span data-qoder-id="qel-span-d3106709" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-d3106709&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:315,&quot;column&quot;:19}}">发布管理</span>}
                </button>
              </div>
            </aside>

            <div
              className={`sidebar-resizer ${isDragging ? 'dragging' : ''}`}
              onMouseDown={() => setIsDragging(true)}
              data-qoder-id="qel-sidebar-resizer-8h9i0j1k" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-sidebar-resizer-8h9i0j1k&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;sidebar-resizer&quot;,&quot;loc&quot;:{&quot;line&quot;:321,&quot;column&quot;:11}}">
              <GripVertical size={14} />
            </div>
          </div>
        )}

        <main style={{ flex: 1, overflow: 'auto', background: (isPlatform || isWorkspaceList) ? 'var(--bg)' : 'var(--surface-2)' }} data-qoder-id="qel-main-a4ca39a6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-main-a4ca39a6&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;main&quot;,&quot;loc&quot;:{&quot;line&quot;:319,&quot;column&quot;:9}}">
          <Outlet  data-qoder-id="qel-outlet-33a61315" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-outlet-33a61315&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/Layout.jsx&quot;,&quot;componentName&quot;:&quot;Layout&quot;,&quot;elementRole&quot;:&quot;outlet&quot;,&quot;loc&quot;:{&quot;line&quot;:320,&quot;column&quot;:11}}"/>
        </main>
      </div>
    </div>
  );
}
