import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  BookOpen,
  GitBranch,
  TrendingUp,
  TrendingDown,
  Plus,
  FlaskConical,
  ArrowRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { api } from '@/api/apiClient';

// ---------------------------------------------------------------------------
// Icon map for KPI cards
// ---------------------------------------------------------------------------
const kpiIcons = [Activity, CheckCircle2, BookOpen, GitBranch];

// ---------------------------------------------------------------------------
// Custom tooltip for recharts (dark themed)
// ---------------------------------------------------------------------------
function DarkTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '10px 14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}
     data-qoder-id="qel-div-a5cbdb83" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-a5cbdb83&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;DarkTooltip&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:48,&quot;column&quot;:5}}">
      <div style={{ fontSize: 12, color: 'var(--fg-3)', marginBottom: 6 }} data-qoder-id="qel-div-a6cbdd16" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-a6cbdd16&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;DarkTooltip&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:57,&quot;column&quot;:7}}">{label}</div>
      {payload.map((entry, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: 'var(--fg-2)',
            lineHeight: 1.8,
          }}
         data-qoder-id="qel-div-a7cbdea9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-a7cbdea9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;DarkTooltip&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:59,&quot;column&quot;:9}}">
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: entry.color,
              flexShrink: 0,
            }}
           data-qoder-id="qel-span-8e3722e0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-8e3722e0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;DarkTooltip&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:70,&quot;column&quot;:11}}"/>
          <span style={{ color: 'var(--fg-3)' }} data-qoder-id="qel-span-8f372473" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-8f372473&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;DarkTooltip&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:79,&quot;column&quot;:11}}">{entry.name}:</span>
          <span style={{ fontWeight: 600, color: 'var(--fg)' }} data-qoder-id="qel-span-90372606" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-90372606&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;DarkTooltip&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:80,&quot;column&quot;:11}}">
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pie tooltip
// ---------------------------------------------------------------------------
function PieTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0];
  return (
    <div
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '10px 14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}
     data-qoder-id="qel-div-8686c8e5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-8686c8e5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;PieTooltip&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:96,&quot;column&quot;:5}}">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }} data-qoder-id="qel-div-8786ca78" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-8786ca78&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;PieTooltip&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:105,&quot;column&quot;:7}}">
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: d.payload.fill,
            flexShrink: 0,
          }}
         data-qoder-id="qel-span-f8a9be47" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-f8a9be47&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;PieTooltip&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:106,&quot;column&quot;:9}}"/>
        <span style={{ color: 'var(--fg-3)' }} data-qoder-id="qel-span-7a229d4d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-7a229d4d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;PieTooltip&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:115,&quot;column&quot;:9}}">{d.name}:</span>
        <span style={{ fontWeight: 600, color: 'var(--fg)' }} data-qoder-id="qel-span-79229bba" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-79229bba&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;PieTooltip&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:116,&quot;column&quot;:9}}">{d.value}%</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status label map
// ---------------------------------------------------------------------------
const statusLabels = {
  success: '成功',
  warning: '警告',
  failed: '失败',
};

// ---------------------------------------------------------------------------
// Dashboard Component
// ---------------------------------------------------------------------------
export default function Dashboard(qoderProps) {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState([]);
  const [executionTrendData, setExecutionTrendData] = useState([]);
  const [ruleHitRateData, setRuleHitRateData] = useState([]);
  const [topFlowsData, setTopFlowsData] = useState([]);
  const [recentExecs, setRecentExecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [k, et, rhr, tf, re] = await Promise.all([
          api.get('/dashboard/kpis'),
          api.get('/dashboard/execution-trend'),
          api.get('/dashboard/rule-hit-rate'),
          api.get('/dashboard/top-flows'),
          api.get('/dashboard/recent-executions'),
        ]);
        setKpis(k); setExecutionTrendData(et); setRuleHitRateData(rhr);
        setTopFlowsData(tf); setRecentExecs(re);
      } catch (e) {
        console.error('Dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className={"page " + (qoderProps?.className || '')} style={qoderProps?.style}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--fg-3)' }}>加载中...</div>
      </div>
    );
  }

  return (
    <div className={["page", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      {/* ---- Page Header ---- */}
      <div className="page-header" data-qoder-id="qel-page-header-4f721991" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-header-4f721991&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;page-header&quot;,&quot;loc&quot;:{&quot;line&quot;:140,&quot;column&quot;:7}}">
        <div data-qoder-id="qel-div-1b227c84" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-1b227c84&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:141,&quot;column&quot;:9}}">
          <h1 className="page-title" data-qoder-id="qel-page-title-c5401dac" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-title-c5401dac&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;page-title&quot;,&quot;loc&quot;:{&quot;line&quot;:142,&quot;column&quot;:11}}">决策看板</h1>
          <p className="page-subtitle" data-qoder-id="qel-page-subtitle-658cd094" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-subtitle-658cd094&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;page-subtitle&quot;,&quot;loc&quot;:{&quot;line&quot;:143,&quot;column&quot;:11}}">平台运行概览与关键指标监控</p>
        </div>
      </div>

      {/* ---- KPI Cards ---- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }} data-qoder-id="qel-div-1e22813d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-1e22813d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:148,&quot;column&quot;:7}}">
        {kpis.map((kpi, idx) => {
          const Icon = kpiIcons[idx];
          return (
            <div className="kpi-card" key={idx} data-qoder-id="qel-kpi-card-82600348" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kpi-card-82600348&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;kpi-card&quot;,&quot;loc&quot;:{&quot;line&quot;:152,&quot;column&quot;:13}}">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }} data-qoder-id="qel-div-10226b33" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-10226b33&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:153,&quot;column&quot;:15}}">
                <div className="kpi-label" data-qoder-id="qel-kpi-label-70ffa7a1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kpi-label-70ffa7a1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;kpi-label&quot;,&quot;loc&quot;:{&quot;line&quot;:154,&quot;column&quot;:17}}">{kpi.label}</div>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                 data-qoder-id="qel-div-8829e3e0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-8829e3e0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:155,&quot;column&quot;:17}}">
                  <Icon size={16} style={{ color: 'var(--primary)' }}  data-qoder-id="qel-icon-53f6ba3b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-icon-53f6ba3b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;icon&quot;,&quot;loc&quot;:{&quot;line&quot;:166,&quot;column&quot;:19}}"/>
                </div>
              </div>
              <div className="kpi-value" data-qoder-id="qel-kpi-value-42690bf1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kpi-value-42690bf1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;kpi-value&quot;,&quot;loc&quot;:{&quot;line&quot;:169,&quot;column&quot;:15}}">{kpi.value}</div>
              <div className={`kpi-delta ${kpi.positive ? 'positive' : 'negative'}`} data-qoder-id="qel-div-8d29ebbf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-8d29ebbf&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:170,&quot;column&quot;:15}}">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }} data-qoder-id="qel-span-d6a23268" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-d6a23268&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:171,&quot;column&quot;:17}}">
                  {kpi.positive ? <TrendingUp size={13}  data-qoder-id="qel-trendingup-2494ff11" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-trendingup-2494ff11&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;trendingup&quot;,&quot;loc&quot;:{&quot;line&quot;:172,&quot;column&quot;:35}}"/> : <TrendingDown size={13}  data-qoder-id="qel-trendingdown-2d6aec70" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-trendingdown-2d6aec70&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;trendingdown&quot;,&quot;loc&quot;:{&quot;line&quot;:172,&quot;column&quot;:62}}"/>}
                  {kpi.delta}
                </span>
                <span style={{ color: 'var(--fg-4)', marginLeft: 6, fontWeight: 400 }} data-qoder-id="qel-span-d3a22daf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-d3a22daf&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:175,&quot;column&quot;:17}}">{kpi.period}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---- Charts Row ---- */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }} data-qoder-id="qel-div-9029f078" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9029f078&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:183,&quot;column&quot;:7}}">
        {/* Execution Trend Line Chart */}
        <div className="chart-container" data-qoder-id="qel-chart-container-9ac04a35" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chart-container-9ac04a35&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;chart-container&quot;,&quot;loc&quot;:{&quot;line&quot;:185,&quot;column&quot;:9}}">
          <div className="chart-title" data-qoder-id="qel-chart-title-c6866a39" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chart-title-c6866a39&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;chart-title&quot;,&quot;loc&quot;:{&quot;line&quot;:186,&quot;column&quot;:11}}">执行趋势 (近7天)</div>
          <ResponsiveContainer width="100%" height={260} data-qoder-id="qel-responsivecontainer-7dae2780" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-responsivecontainer-7dae2780&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;responsivecontainer&quot;,&quot;loc&quot;:{&quot;line&quot;:187,&quot;column&quot;:11}}">
            <LineChart data={executionTrendData} margin={{ top: 4, right: 12, left: -8, bottom: 0 }} data-qoder-id="qel-linechart-efdb80f3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-linechart-efdb80f3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;linechart&quot;,&quot;loc&quot;:{&quot;line&quot;:188,&quot;column&quot;:13}}">
              <CartesianGrid stroke="rgba(0,0,0,0.04)" vertical={false}  data-qoder-id="qel-cartesiangrid-41a91246" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-cartesiangrid-41a91246&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;cartesiangrid&quot;,&quot;loc&quot;:{&quot;line&quot;:189,&quot;column&quot;:15}}"/>
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--fg-4)', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(0,0,0,0.06)' }}
                tickLine={false}
               data-qoder-id="qel-xaxis-5d980825" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-xaxis-5d980825&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;xaxis&quot;,&quot;loc&quot;:{&quot;line&quot;:190,&quot;column&quot;:15}}"/>
              <YAxis
                tick={{ fill: 'var(--fg-4)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
               data-qoder-id="qel-yaxis-f5eef7bc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-yaxis-f5eef7bc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;yaxis&quot;,&quot;loc&quot;:{&quot;line&quot;:196,&quot;column&quot;:15}}"/>
              <Tooltip content={<DarkTooltip />}  data-qoder-id="qel-tooltip-a121ee0b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tooltip-a121ee0b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;tooltip&quot;,&quot;loc&quot;:{&quot;line&quot;:201,&quot;column&quot;:15}}"/>
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, color: 'var(--fg-3)', paddingTop: 8 }}
               data-qoder-id="qel-legend-5946f434" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-legend-5946f434&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;legend&quot;,&quot;loc&quot;:{&quot;line&quot;:202,&quot;column&quot;:15}}"/>
              <Line
                type="monotone"
                dataKey="executions"
                name="总执行"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ r: 3, fill: '#0ea5e9', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#0ea5e9', stroke: 'var(--surface)', strokeWidth: 2 }}
               data-qoder-id="qel-line-486d7f81" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-486d7f81&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:207,&quot;column&quot;:15}}"/>
              <Line
                type="monotone"
                dataKey="success"
                name="成功"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 3, fill: '#22c55e', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#22c55e', stroke: 'var(--surface)', strokeWidth: 2 }}
               data-qoder-id="qel-line-c1617209" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-c1617209&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:216,&quot;column&quot;:15}}"/>
              <Line
                type="monotone"
                dataKey="failed"
                name="失败"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#ef4444', stroke: 'var(--surface)', strokeWidth: 2 }}
               data-qoder-id="qel-line-c0617076" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-c0617076&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:225,&quot;column&quot;:15}}"/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Rule Hit Rate Pie Chart */}
        <div className="chart-container" data-qoder-id="qel-chart-container-26b8d7d4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chart-container-26b8d7d4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;chart-container&quot;,&quot;loc&quot;:{&quot;line&quot;:239,&quot;column&quot;:9}}">
          <div className="chart-title" data-qoder-id="qel-chart-title-447a64a0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chart-title-447a64a0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;chart-title&quot;,&quot;loc&quot;:{&quot;line&quot;:240,&quot;column&quot;:11}}">规则命中率</div>
          <ResponsiveContainer width="100%" height={260} data-qoder-id="qel-responsivecontainer-05a231a5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-responsivecontainer-05a231a5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;responsivecontainer&quot;,&quot;loc&quot;:{&quot;line&quot;:241,&quot;column&quot;:11}}">
            <PieChart data-qoder-id="qel-piechart-3dd29be2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-piechart-3dd29be2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;piechart&quot;,&quot;loc&quot;:{&quot;line&quot;:242,&quot;column&quot;:13}}">
              <Pie
                data={ruleHitRateData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
               data-qoder-id="qel-pie-f056363b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-pie-f056363b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;pie&quot;,&quot;loc&quot;:{&quot;line&quot;:243,&quot;column&quot;:15}}">
                {ruleHitRateData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill}  data-qoder-id="qel-cell-1e069428" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-cell-1e069428&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;cell&quot;,&quot;loc&quot;:{&quot;line&quot;:254,&quot;column&quot;:19}}"/>
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />}  data-qoder-id="qel-tooltip-202971bd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tooltip-202971bd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;tooltip&quot;,&quot;loc&quot;:{&quot;line&quot;:257,&quot;column&quot;:15}}"/>
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, color: 'var(--fg-3)' }}
                formatter={(value) => <span style={{ color: 'var(--fg-3)' }}>{value}</span>}
               data-qoder-id="qel-legend-d243e118" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-legend-d243e118&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;legend&quot;,&quot;loc&quot;:{&quot;line&quot;:258,&quot;column&quot;:15}}"/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---- Bottom Row ---- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }} data-qoder-id="qel-div-8f2c2d7c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-8f2c2d7c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:270,&quot;column&quot;:7}}">
        {/* Top 5 Decision Flows Bar Chart */}
        <div className="chart-container" data-qoder-id="qel-chart-container-8dbbb890" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chart-container-8dbbb890&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;chart-container&quot;,&quot;loc&quot;:{&quot;line&quot;:272,&quot;column&quot;:9}}">
          <div className="chart-title" data-qoder-id="qel-chart-title-43782476" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chart-title-43782476&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;chart-title&quot;,&quot;loc&quot;:{&quot;line&quot;:273,&quot;column&quot;:11}}">Top 5 决策流</div>
          <ResponsiveContainer width="100%" height={240} data-qoder-id="qel-responsivecontainer-fe9fe809" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-responsivecontainer-fe9fe809&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;responsivecontainer&quot;,&quot;loc&quot;:{&quot;line&quot;:274,&quot;column&quot;:11}}">
            <BarChart
              data={topFlowsData}
              layout="vertical"
              margin={{ top: 4, right: 20, left: 10, bottom: 0 }}
             data-qoder-id="qel-barchart-32f8534e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-barchart-32f8534e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;barchart&quot;,&quot;loc&quot;:{&quot;line&quot;:275,&quot;column&quot;:13}}">
              <CartesianGrid stroke="rgba(0,0,0,0.04)" horizontal={false}  data-qoder-id="qel-cartesiangrid-4eada3eb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-cartesiangrid-4eada3eb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;cartesiangrid&quot;,&quot;loc&quot;:{&quot;line&quot;:280,&quot;column&quot;:15}}"/>
              <XAxis
                type="number"
                tick={{ fill: 'var(--fg-4)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
               data-qoder-id="qel-xaxis-5a88f8e2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-xaxis-5a88f8e2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;xaxis&quot;,&quot;loc&quot;:{&quot;line&quot;:281,&quot;column&quot;:15}}"/>
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fill: 'var(--fg-4)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={90}
               data-qoder-id="qel-yaxis-f6dfeec5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-yaxis-f6dfeec5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;yaxis&quot;,&quot;loc&quot;:{&quot;line&quot;:287,&quot;column&quot;:15}}"/>
              <Tooltip content={<DarkTooltip />}  data-qoder-id="qel-tooltip-1a2729b4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tooltip-1a2729b4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;tooltip&quot;,&quot;loc&quot;:{&quot;line&quot;:295,&quot;column&quot;:15}}"/>
              <Bar
                dataKey="executions"
                name="执行次数"
                fill="#0ea5e9"
                radius={[0, 4, 4, 0]}
                barSize={18}
               data-qoder-id="qel-bar-744c8cc3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-bar-744c8cc3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;bar&quot;,&quot;loc&quot;:{&quot;line&quot;:296,&quot;column&quot;:15}}"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Executions Table */}
        <div className="chart-container" style={{ padding: 0, overflow: 'hidden' }} data-qoder-id="qel-chart-container-1cb44ae8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chart-container-1cb44ae8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;chart-container&quot;,&quot;loc&quot;:{&quot;line&quot;:308,&quot;column&quot;:9}}">
          <div style={{ padding: '16px 16px 12px' }} data-qoder-id="qel-div-2033cd84" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-2033cd84&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:309,&quot;column&quot;:11}}">
            <div className="chart-title" style={{ marginBottom: 0 }} data-qoder-id="qel-chart-title-557efc91" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chart-title-557efc91&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;chart-title&quot;,&quot;loc&quot;:{&quot;line&quot;:310,&quot;column&quot;:13}}">最近执行记录</div>
          </div>
          <div style={{ overflowX: 'auto' }} data-qoder-id="qel-div-2233d0aa" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-2233d0aa&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:312,&quot;column&quot;:11}}">
            <table className="table" data-qoder-id="qel-table-082f5eff" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-082f5eff&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;table&quot;,&quot;loc&quot;:{&quot;line&quot;:313,&quot;column&quot;:13}}">
              <thead data-qoder-id="qel-thead-9f4d80f8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-thead-9f4d80f8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;thead&quot;,&quot;loc&quot;:{&quot;line&quot;:314,&quot;column&quot;:15}}">
                <tr data-qoder-id="qel-tr-e4fa733d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-e4fa733d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:315,&quot;column&quot;:17}}">
                  <th data-qoder-id="qel-th-3e9011e2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-3e9011e2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:316,&quot;column&quot;:19}}">执行ID</th>
                  <th data-qoder-id="qel-th-4190169b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-4190169b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:317,&quot;column&quot;:19}}">决策流</th>
                  <th data-qoder-id="qel-th-40901508" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-40901508&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:318,&quot;column&quot;:19}}">状态</th>
                  <th data-qoder-id="qel-th-538df45a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-538df45a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:319,&quot;column&quot;:19}}">时间</th>
                  <th data-qoder-id="qel-th-548df5ed" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-548df5ed&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:320,&quot;column&quot;:19}}">耗时</th>
                  <th data-qoder-id="qel-th-518df134" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-518df134&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:321,&quot;column&quot;:19}}">结果</th>
                </tr>
              </thead>
              <tbody data-qoder-id="qel-tbody-84ed149f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tbody-84ed149f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;tbody&quot;,&quot;loc&quot;:{&quot;line&quot;:324,&quot;column&quot;:15}}">
                {recentExecs.map((exec) => (
                  <tr key={exec.id} data-qoder-id="qel-tr-d4f81b76" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-d4f81b76&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:326,&quot;column&quot;:19}}">
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--fg-3)' }} data-qoder-id="qel-td-9d22d2f9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-9d22d2f9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:327,&quot;column&quot;:21}}">
                      {exec.id}
                    </td>
                    <td data-qoder-id="qel-td-9a22ce40" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-9a22ce40&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:330,&quot;column&quot;:21}}">{exec.flow}</td>
                    <td data-qoder-id="qel-td-9b22cfd3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-9b22cfd3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:331,&quot;column&quot;:21}}">
                      <span className={`badge badge-${exec.status}`} data-qoder-id="qel-span-d59564e2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-d59564e2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:332,&quot;column&quot;:23}}">
                        {statusLabels[exec.status]}
                      </span>
                    </td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} data-qoder-id="qel-td-a922e5dd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-a922e5dd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:336,&quot;column&quot;:21}}">
                      {exec.time}
                    </td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} data-qoder-id="qel-td-a23eb155" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-a23eb155&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:339,&quot;column&quot;:21}}">
                      {exec.duration}
                    </td>
                    <td data-qoder-id="qel-td-a13eafc2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-a13eafc2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:342,&quot;column&quot;:21}}">{exec.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ---- Quick Actions ---- */}
      <div className="chart-container" data-qoder-id="qel-chart-container-8eaeee30" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chart-container-8eaeee30&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;chart-container&quot;,&quot;loc&quot;:{&quot;line&quot;:352,&quot;column&quot;:7}}">
        <div className="chart-title" data-qoder-id="qel-chart-title-cc97bccc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chart-title-cc97bccc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;chart-title&quot;,&quot;loc&quot;:{&quot;line&quot;:353,&quot;column&quot;:9}}">快捷操作</div>
        <div style={{ display: 'flex', gap: 12 }} data-qoder-id="qel-div-111123a5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-111123a5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:354,&quot;column&quot;:9}}">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/rulesets')}
            style={{ gap: 8 }}
           data-qoder-id="qel-btn-b9e526ac" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-b9e526ac&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:355,&quot;column&quot;:11}}">
            <Plus size={15}  data-qoder-id="qel-plus-e51adecf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-plus-e51adecf&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;plus&quot;,&quot;loc&quot;:{&quot;line&quot;:360,&quot;column&quot;:13}}"/>
            新建规则集
            <ArrowRight size={13} style={{ opacity: 0.6, marginLeft: 2 }}  data-qoder-id="qel-arrowright-be5c1c9e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-arrowright-be5c1c9e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;arrowright&quot;,&quot;loc&quot;:{&quot;line&quot;:362,&quot;column&quot;:13}}"/>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/decision-flows')}
            style={{ gap: 8 }}
           data-qoder-id="qel-btn-bee52e8b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-bee52e8b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:364,&quot;column&quot;:11}}">
            <Plus size={15}  data-qoder-id="qel-plus-ea1ae6ae" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-plus-ea1ae6ae&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;plus&quot;,&quot;loc&quot;:{&quot;line&quot;:369,&quot;column&quot;:13}}"/>
            新建决策流
            <ArrowRight size={13} style={{ opacity: 0.6, marginLeft: 2 }}  data-qoder-id="qel-arrowright-bb59d94e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-arrowright-bb59d94e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;arrowright&quot;,&quot;loc&quot;:{&quot;line&quot;:371,&quot;column&quot;:13}}"/>
          </button>
          <button
            className="btn"
            onClick={() => navigate('/execution-test')}
            style={{ gap: 8 }}
           data-qoder-id="qel-btn-51e2445d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-51e2445d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:373,&quot;column&quot;:11}}">
            <FlaskConical size={15}  data-qoder-id="qel-flaskconical-3f97832e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flaskconical-3f97832e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;flaskconical&quot;,&quot;loc&quot;:{&quot;line&quot;:378,&quot;column&quot;:13}}"/>
            执行测试
            <ArrowRight size={13} style={{ opacity: 0.6, marginLeft: 2 }}  data-qoder-id="qel-arrowright-ba59d7bb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-arrowright-ba59d7bb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Dashboard.jsx&quot;,&quot;componentName&quot;:&quot;Dashboard&quot;,&quot;elementRole&quot;:&quot;arrowright&quot;,&quot;loc&quot;:{&quot;line&quot;:380,&quot;column&quot;:13}}"/>
          </button>
        </div>
      </div>
    </div>
  );
}
