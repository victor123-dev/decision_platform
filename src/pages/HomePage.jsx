import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paperclip, Mic, Send, Settings, Type, Grid3X3 } from 'lucide-react';

const apps = [
  { name: 'APS 工厂排产', code: 'APP000001' },
  { name: '订单交付承诺', code: 'APP000002' },
  { name: '物料需求计划', code: 'APP000003' },
  { name: '人员班次排班', code: 'APP000005' },
  { name: '物流配送路径优化', code: 'APP000006' },
];

export default function HomePage(qoderProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  return (
    <div className={["homepage animate-fade-in", qoderProps?.className].filter(Boolean).join(" ")} data-qoder-id="qel-homepage-86531fc9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-homepage-86531fc9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;homepage&quot;,&quot;loc&quot;:{&quot;line&quot;:18,&quot;column&quot;:5}}" style={qoderProps?.style}>
      <h1 className="homepage-greeting" data-qoder-id="qel-homepage-greeting-a40245fa" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-homepage-greeting-a40245fa&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;homepage-greeting&quot;,&quot;loc&quot;:{&quot;line&quot;:19,&quot;column&quot;:7}}">你好，林风</h1>

      <div className="homepage-section-header" data-qoder-id="qel-homepage-section-header-10493f0b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-homepage-section-header-10493f0b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;homepage-section-header&quot;,&quot;loc&quot;:{&quot;line&quot;:21,&quot;column&quot;:7}}">
        <span className="homepage-section-title" data-qoder-id="qel-homepage-section-title-bbf01d0c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-homepage-section-title-bbf01d0c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;homepage-section-title&quot;,&quot;loc&quot;:{&quot;line&quot;:22,&quot;column&quot;:9}}">应用（18）→</span>
      </div>

      <div className="homepage-app-grid" data-qoder-id="qel-homepage-app-grid-7c019d7c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-homepage-app-grid-7c019d7c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;homepage-app-grid&quot;,&quot;loc&quot;:{&quot;line&quot;:25,&quot;column&quot;:7}}">
        {apps.map((app, i) => (
          <div
            key={i}
            className="homepage-app-card"
            onClick={() => {
              if (i === 0) navigate('/w/purchasing');
            }}
           data-qoder-id="qel-homepage-app-card-bb0ef937" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-homepage-app-card-bb0ef937&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;homepage-app-card&quot;,&quot;loc&quot;:{&quot;line&quot;:27,&quot;column&quot;:11}}">
            <div className="homepage-app-card-title" data-qoder-id="qel-homepage-app-card-title-3aefd2e3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-homepage-app-card-title-3aefd2e3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;homepage-app-card-title&quot;,&quot;loc&quot;:{&quot;line&quot;:34,&quot;column&quot;:13}}">{app.name}</div>
            <div className="homepage-app-card-code" data-qoder-id="qel-homepage-app-card-code-c5868231" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-homepage-app-card-code-c5868231&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;homepage-app-card-code&quot;,&quot;loc&quot;:{&quot;line&quot;:35,&quot;column&quot;:13}}">{app.code}</div>
          </div>
        ))}
      </div>

      <div className="homepage-ai-input" data-qoder-id="qel-homepage-ai-input-3c2ae8e1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-homepage-ai-input-3c2ae8e1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;homepage-ai-input&quot;,&quot;loc&quot;:{&quot;line&quot;:40,&quot;column&quot;:7}}">
        <div className="homepage-ai-input-box" data-qoder-id="qel-homepage-ai-input-box-2e3b08a3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-homepage-ai-input-box-2e3b08a3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;homepage-ai-input-box&quot;,&quot;loc&quot;:{&quot;line&quot;:41,&quot;column&quot;:9}}">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="在此输入您的问题。例如: 向我展示上个月的销售预测"
           data-qoder-id="qel-input-b3014865" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-b3014865&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:42,&quot;column&quot;:11}}"/>
          <div className="homepage-ai-input-actions" data-qoder-id="qel-homepage-ai-input-actions-ffc4e74b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-homepage-ai-input-actions-ffc4e74b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;homepage-ai-input-actions&quot;,&quot;loc&quot;:{&quot;line&quot;:47,&quot;column&quot;:11}}">
            <button title="附件" data-qoder-id="qel-button-1b7d370b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-1b7d370b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:48,&quot;column&quot;:13}}"><Paperclip size={16}  data-qoder-id="qel-paperclip-097ae2ce" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-paperclip-097ae2ce&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;paperclip&quot;,&quot;loc&quot;:{&quot;line&quot;:48,&quot;column&quot;:32}}"/></button>
            <button title="格式" data-qoder-id="qel-button-217d407d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-217d407d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:49,&quot;column&quot;:13}}"><Type size={16}  data-qoder-id="qel-type-2f28da48" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-type-2f28da48&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;type&quot;,&quot;loc&quot;:{&quot;line&quot;:49,&quot;column&quot;:32}}"/></button>
            <button title="设置" data-qoder-id="qel-button-1f7d3d57" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-1f7d3d57&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:50,&quot;column&quot;:13}}"><Settings size={16}  data-qoder-id="qel-settings-9e8c8c1c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-settings-9e8c8c1c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;settings&quot;,&quot;loc&quot;:{&quot;line&quot;:50,&quot;column&quot;:32}}"/></button>
            <button title="语音" data-qoder-id="qel-button-157d2d99" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-157d2d99&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:51,&quot;column&quot;:13}}"><Mic size={16}  data-qoder-id="qel-mic-f260acb5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-mic-f260acb5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;mic&quot;,&quot;loc&quot;:{&quot;line&quot;:51,&quot;column&quot;:32}}"/></button>
            <button className="send-btn" title="发送" data-qoder-id="qel-send-btn-19cce4c3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-send-btn-19cce4c3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;send-btn&quot;,&quot;loc&quot;:{&quot;line&quot;:52,&quot;column&quot;:13}}"><Send size={14}  data-qoder-id="qel-send-ce2920cb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-send-ce2920cb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;send&quot;,&quot;loc&quot;:{&quot;line&quot;:52,&quot;column&quot;:53}}"/></button>
          </div>
        </div>
        <div className="homepage-tools-row" data-qoder-id="qel-homepage-tools-row-e0e6a39c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-homepage-tools-row-e0e6a39c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;homepage-tools-row&quot;,&quot;loc&quot;:{&quot;line&quot;:55,&quot;column&quot;:9}}">
          <button title="附件" data-qoder-id="qel-button-127aea49" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-127aea49&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:56,&quot;column&quot;:11}}"><Paperclip size={14}  data-qoder-id="qel-paperclip-8a77dc4a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-paperclip-8a77dc4a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;paperclip&quot;,&quot;loc&quot;:{&quot;line&quot;:56,&quot;column&quot;:30}}"/></button>
          <button title="格式" data-qoder-id="qel-button-107ae723" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-107ae723&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:57,&quot;column&quot;:11}}"><Type size={14}  data-qoder-id="qel-type-30269d44" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-type-30269d44&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;type&quot;,&quot;loc&quot;:{&quot;line&quot;:57,&quot;column&quot;:30}}"/></button>
          <button title="设置" data-qoder-id="qel-button-1e7afd2d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-1e7afd2d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:58,&quot;column&quot;:11}}"><Settings size={14}  data-qoder-id="qel-settings-1f9412f4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-settings-1f9412f4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/HomePage.jsx&quot;,&quot;componentName&quot;:&quot;HomePage&quot;,&quot;elementRole&quot;:&quot;settings&quot;,&quot;loc&quot;:{&quot;line&quot;:58,&quot;column&quot;:30}}"/></button>
        </div>
      </div>
    </div>
  );
}
