import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, FileCode, Clock, Hash, FileText, GitBranch, History } from 'lucide-react';
import { api } from '@/api/apiClient';

const placeholderCode = `# 代码文件内容暂未加载
# 请在编辑器中打开查看

def placeholder():
    """占位函数"""
    pass`;

const versionHistory = [
  { version: 'v1.3', date: '2026-06-01', author: '张工', note: '优化评分逻辑' },
  { version: 'v1.2', date: '2026-05-20', author: '张工', note: '添加风险等级判断' },
  { version: 'v1.1', date: '2026-05-10', author: '李工', note: '修复边界条件' },
  { version: 'v1.0', date: '2026-04-28', author: '张工', note: '初始版本' },
];

export default function CodeFileEditor(qoderProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [relatedFlows, setRelatedFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editedCode, setEditedCode] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const f = await api.get(`/code-files/${id}`);
        setFile(f);
        setEditedCode(f.code || placeholderCode);
        const flows = await api.get('/flows');
        setRelatedFlows(flows.filter((flow) =>
          flow.nodes?.some((node) => node.data?.config?.fileId === f.id)
        ));
      } catch (err) {
        console.error('加载代码文件失败:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleSave = async () => {
    try {
      await api.put(`/code-files/${id}`, { code: editedCode });
      setFile({ ...file, code: editedCode });
    } catch (err) {
      console.error('保存代码文件失败:', err);
    }
  };

  if (loading) {
    return (
      <div className={["page", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--fg-3)' }}>加载中...</div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className={["page", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
        <div className="empty-state" data-qoder-id="qel-empty-state-e902ca0d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-empty-state-e902ca0d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;empty-state&quot;,&quot;loc&quot;:{&quot;line&quot;:28,&quot;column&quot;:9}}">
          <p data-qoder-id="qel-p-8ad377c4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-8ad377c4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:29,&quot;column&quot;:11}}">未找到该代码文件</p>
          <button className="btn btn-ghost" onClick={() => navigate('/code-files')} data-qoder-id="qel-btn-e076b11b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-e076b11b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:30,&quot;column&quot;:11}}">返回</button>
        </div>
      </div>
    );
  }

  const code = editedCode;
  const codeLines = code.split('\n');

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 48px)' }} data-qoder-id="qel-div-7de7e77a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-7de7e77a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:45,&quot;column&quot;:5}}">
      {/* Main code editor area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} data-qoder-id="qel-div-7ce7e5e7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-7ce7e5e7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:47,&quot;column&quot;:7}}">
        {/* Top bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
        }} data-qoder-id="qel-div-7be7e454" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-7be7e454&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:49,&quot;column&quot;:9}}">
          <button className="btn btn-ghost" style={{ padding: '6px 8px' }} onClick={() => navigate('/code-files')} data-qoder-id="qel-btn-dc76aacf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-dc76aacf&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:57,&quot;column&quot;:11}}">
            <ArrowLeft size={16}  data-qoder-id="qel-arrowleft-5c3b0922" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-arrowleft-5c3b0922&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;arrowleft&quot;,&quot;loc&quot;:{&quot;line&quot;:58,&quot;column&quot;:13}}"/>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }} data-qoder-id="qel-div-0607623a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-0607623a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:60,&quot;column&quot;:11}}">
            <FileCode size={18} style={{ color: '#3572A5' }}  data-qoder-id="qel-filecode-2dc407e3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-filecode-2dc407e3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;filecode&quot;,&quot;loc&quot;:{&quot;line&quot;:61,&quot;column&quot;:13}}"/>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)' }} data-qoder-id="qel-span-7d36f6c0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-7d36f6c0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:62,&quot;column&quot;:13}}">{file.name}</span>
            <span className="badge badge-primary" data-qoder-id="qel-badge-3c3fd6ec" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-3c3fd6ec&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:63,&quot;column&quot;:13}}">{file.language}</span>
          </div>
          <button className="btn btn-primary" onClick={handleSave} data-qoder-id="qel-btn-f3e04fa0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-f3e04fa0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:65,&quot;column&quot;:11}}">
            <Save size={14}  data-qoder-id="qel-save-b0698ba7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-save-b0698ba7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;save&quot;,&quot;loc&quot;:{&quot;line&quot;:66,&quot;column&quot;:13}}"/>
            保存
          </button>
        </div>

        {/* Code display with line numbers */}
        <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg)', padding: 0 }} data-qoder-id="qel-div-000758c8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-000758c8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:72,&quot;column&quot;:9}}">
          <div style={{
            display: 'flex',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            lineHeight: 1.7,
            minHeight: '100%',
          }} data-qoder-id="qel-div-01075a5b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-01075a5b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:73,&quot;column&quot;:11}}">
            {/* Line numbers */}
            <div style={{
              padding: '16px 0',
              textAlign: 'right',
              userSelect: 'none',
              minWidth: 52,
              borderRight: '1px solid var(--border-subtle)',
              background: 'var(--surface)',
            }} data-qoder-id="qel-div-fe0755a2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-fe0755a2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:81,&quot;column&quot;:13}}">
              {codeLines.map((_, i) => (
                <div
                  key={i}
                  style={{
                    padding: '0 12px',
                    color: 'var(--fg-4)',
                    fontSize: 12,
                  }}
                 data-qoder-id="qel-div-ff075735" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ff075735&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:90,&quot;column&quot;:17}}">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code content */}
            <div style={{ flex: 1, padding: '16px 20px', overflowX: 'auto' }} data-qoder-id="qel-div-00051a31" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-00051a31&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:104,&quot;column&quot;:13}}">
              {codeLines.map((line, i) => (
                <div key={i} style={{ whiteSpace: 'pre', color: 'var(--fg-2)', minHeight: '1.7em' }} data-qoder-id="qel-div-ff05189e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ff05189e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:106,&quot;column&quot;:17}}">
                  {highlightPythonLine(line)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right info panel */}
      <div style={{
        width: 260,
        minWidth: 260,
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
        overflowY: 'auto',
      }} data-qoder-id="qel-div-fe05170b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-fe05170b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:116,&quot;column&quot;:7}}">
        {/* File info */}
        <div className="prop-section" data-qoder-id="qel-prop-section-4a06d830" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-4a06d830&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;prop-section&quot;,&quot;loc&quot;:{&quot;line&quot;:124,&quot;column&quot;:9}}">
          <div className="prop-section-title" data-qoder-id="qel-prop-section-title-64a6a6b0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-title-64a6a6b0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;prop-section-title&quot;,&quot;loc&quot;:{&quot;line&quot;:125,&quot;column&quot;:11}}">文件信息</div>
          <div className="prop-row" data-qoder-id="qel-prop-row-b184374b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-b184374b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:126,&quot;column&quot;:11}}">
            <div className="prop-label" data-qoder-id="qel-prop-label-aa66ff34" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-aa66ff34&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:127,&quot;column&quot;:13}}">文件名</div>
            <div className="prop-value" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} data-qoder-id="qel-prop-value-913a1b46" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-value-913a1b46&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;prop-value&quot;,&quot;loc&quot;:{&quot;line&quot;:128,&quot;column&quot;:13}}">
              {file.name}
            </div>
          </div>
          <div className="prop-row" data-qoder-id="qel-prop-row-ac842f6c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-ac842f6c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:132,&quot;column&quot;:11}}">
            <div className="prop-label" data-qoder-id="qel-prop-label-a166f109" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-a166f109&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:133,&quot;column&quot;:13}}">大小</div>
            <div className="prop-value" data-qoder-id="qel-prop-value-8e37d7f6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-value-8e37d7f6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;prop-value&quot;,&quot;loc&quot;:{&quot;line&quot;:134,&quot;column&quot;:13}}">{file.size}</div>
          </div>
          <div className="prop-row" data-qoder-id="qel-prop-row-b986827a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-b986827a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:136,&quot;column&quot;:11}}">
            <div className="prop-label" data-qoder-id="qel-prop-label-b069473d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-b069473d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:137,&quot;column&quot;:13}}">行数</div>
            <div className="prop-value" data-qoder-id="qel-prop-value-8d37d663" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-value-8d37d663&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;prop-value&quot;,&quot;loc&quot;:{&quot;line&quot;:138,&quot;column&quot;:13}}">{file.lines}</div>
          </div>
          <div className="prop-row" data-qoder-id="qel-prop-row-b6867dc1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-b6867dc1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:140,&quot;column&quot;:11}}">
            <div className="prop-label" data-qoder-id="qel-prop-label-a9693c38" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-a9693c38&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:141,&quot;column&quot;:13}}">语言</div>
            <div className="prop-value" data-qoder-id="qel-prop-value-9037db1c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-value-9037db1c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;prop-value&quot;,&quot;loc&quot;:{&quot;line&quot;:142,&quot;column&quot;:13}}">
              <span className="badge badge-primary" data-qoder-id="qel-badge-484466fe" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-484466fe&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:143,&quot;column&quot;:15}}">{file.language}</span>
            </div>
          </div>
          <div className="prop-row" style={{ marginBottom: 0 }} data-qoder-id="qel-prop-row-b2867775" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-b2867775&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:146,&quot;column&quot;:11}}">
            <div className="prop-label" data-qoder-id="qel-prop-label-a56935ec" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-a56935ec&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:147,&quot;column&quot;:13}}">更新时间</div>
            <div className="prop-value" data-qoder-id="qel-prop-value-902b0f29" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-value-902b0f29&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;prop-value&quot;,&quot;loc&quot;:{&quot;line&quot;:148,&quot;column&quot;:13}}">{file.updatedAt}</div>
          </div>
        </div>

        {/* Related flows */}
        <div className="prop-section" data-qoder-id="qel-prop-section-5015ec2c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-5015ec2c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;prop-section&quot;,&quot;loc&quot;:{&quot;line&quot;:153,&quot;column&quot;:9}}">
          <div className="prop-section-title" data-qoder-id="qel-prop-section-title-faa182a4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-title-faa182a4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;prop-section-title&quot;,&quot;loc&quot;:{&quot;line&quot;:154,&quot;column&quot;:11}}">
            <GitBranch size={12} style={{ marginRight: 4, verticalAlign: -1 }}  data-qoder-id="qel-gitbranch-df8b001e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-gitbranch-df8b001e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;gitbranch&quot;,&quot;loc&quot;:{&quot;line&quot;:155,&quot;column&quot;:13}}"/>
            关联的决策流
          </div>
          {relatedFlows.length > 0 ? (
            relatedFlows.map((flow) => (
              <div
                key={flow.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 8px',
                  borderRadius: 'var(--seed-radius-sm)',
                  fontSize: 12,
                  color: 'var(--fg-2)',
                  cursor: 'pointer',
                  marginBottom: 4,
                  background: 'rgba(0,0,0,0.02)',
                  border: '1px solid var(--border-subtle)',
                }}
                onClick={() => navigate(`/decision-flows/${flow.id}`)}
               data-qoder-id="qel-div-001424bb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-001424bb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:160,&quot;column&quot;:15}}">
                <GitBranch size={13} style={{ color: 'var(--fg-3)' }}  data-qoder-id="qel-gitbranch-e18b0344" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-gitbranch-e18b0344&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;gitbranch&quot;,&quot;loc&quot;:{&quot;line&quot;:177,&quot;column&quot;:17}}"/>
                {flow.name}
              </div>
            ))
          ) : (
            <div style={{ fontSize: 12, color: 'var(--fg-4)', padding: '4px 0' }} data-qoder-id="qel-div-021427e1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-021427e1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:182,&quot;column&quot;:13}}">暂无关联决策流</div>
          )}
        </div>

        {/* Version history */}
        <div className="prop-section" style={{ borderBottom: 'none' }} data-qoder-id="qel-prop-section-4e15e906" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-4e15e906&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;prop-section&quot;,&quot;loc&quot;:{&quot;line&quot;:187,&quot;column&quot;:9}}">
          <div className="prop-section-title" data-qoder-id="qel-prop-section-title-f4a17932" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-title-f4a17932&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;prop-section-title&quot;,&quot;loc&quot;:{&quot;line&quot;:188,&quot;column&quot;:11}}">
            <History size={12} style={{ marginRight: 4, verticalAlign: -1 }}  data-qoder-id="qel-history-76f7a058" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-history-76f7a058&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;history&quot;,&quot;loc&quot;:{&quot;line&quot;:189,&quot;column&quot;:13}}"/>
            版本历史
          </div>
          {versionHistory.map((v, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: 10,
              marginBottom: 10,
              fontSize: 12,
            }} data-qoder-id="qel-div-7e11197e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-7e11197e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:193,&quot;column&quot;:13}}">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }} data-qoder-id="qel-div-7f111b11" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-7f111b11&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:199,&quot;column&quot;:15}}">
                <div style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: i === 0 ? 'var(--primary)' : 'var(--fg-4)',
                  marginTop: 4,
                }}  data-qoder-id="qel-div-7c111658" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-7c111658&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:200,&quot;column&quot;:17}}"/>
                {i < versionHistory.length - 1 && (
                  <div style={{ width: 1, flex: 1, background: 'var(--border)', marginTop: 4 }}  data-qoder-id="qel-div-7d1117eb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-7d1117eb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:208,&quot;column&quot;:19}}"/>
                )}
              </div>
              <div style={{ flex: 1 }} data-qoder-id="qel-div-82111fca" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-82111fca&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:211,&quot;column&quot;:15}}">
                <div style={{ color: 'var(--fg-2)', fontWeight: 500 }} data-qoder-id="qel-div-8311215d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-8311215d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:212,&quot;column&quot;:17}}">
                  {v.version}
                  <span style={{ color: 'var(--fg-4)', fontWeight: 400, marginLeft: 6 }} data-qoder-id="qel-span-012d3930" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-012d3930&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:214,&quot;column&quot;:19}}">{v.author}</span>
                </div>
                <div style={{ color: 'var(--fg-4)', fontSize: 11, marginTop: 1 }} data-qoder-id="qel-div-81111e37" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-81111e37&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:216,&quot;column&quot;:17}}">{v.date}</div>
                <div style={{ color: 'var(--fg-3)', fontSize: 11, marginTop: 2 }} data-qoder-id="qel-div-76110ce6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-76110ce6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;CodeFileEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:217,&quot;column&quot;:17}}">{v.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Minimal Python syntax highlighting using inline styles.
 * Returns an array of spans for one line of code.
 */
function highlightPythonLine(line) {
  const keywords = ['def', 'return', 'if', 'elif', 'else', 'import', 'from', 'class', 'for', 'while', 'in', 'not', 'and', 'or', 'True', 'False', 'None', 'pass', 'with', 'as', 'try', 'except', 'finally', 'raise', 'yield', 'lambda', 'global', 'nonlocal', 'assert', 'del', 'break', 'continue'];
  const builtins = ['round', 'max', 'min', 'len', 'range', 'print', 'int', 'float', 'str', 'list', 'dict', 'set', 'tuple', 'type', 'isinstance'];

  // Handle comments
  const commentIdx = line.indexOf('#');
  if (commentIdx !== -1) {
    const before = line.slice(0, commentIdx);
    const comment = line.slice(commentIdx);
    return [
      ...tokenize(before, keywords, builtins),
      <span key="comment" style={{ color: 'var(--fg-4)', fontStyle: 'italic' }} data-qoder-id="qel-span-0f1fee0f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-0f1fee0f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:242,&quot;column&quot;:7}}">{comment}</span>,
    ];
  }

  return tokenize(line, keywords, builtins);
}

function tokenize(text, keywords, builtins) {
  const parts = [];
  // Simple tokenization: split by word boundaries
  const regex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\w+\b|[^\w\s]+|\s+)/g;
  let match;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    const token = match[0];
    if (/^["']/.test(token)) {
      parts.push(<span key={i++} style={{ color: '#16a34a' }} data-qoder-id="qel-span-8827684f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-8827684f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:258,&quot;column&quot;:18}}">{token}</span>);
    } else if (keywords.includes(token)) {
      parts.push(<span key={i++} style={{ color: '#7c3aed' }} data-qoder-id="qel-span-872766bc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-872766bc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:260,&quot;column&quot;:18}}">{token}</span>);
    } else if (builtins.includes(token)) {
      parts.push(<span key={i++} style={{ color: '#2563eb' }} data-qoder-id="qel-span-8a276b75" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-8a276b75&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:262,&quot;column&quot;:18}}">{token}</span>);
    } else if (/^\d+(\.\d+)?$/.test(token)) {
      parts.push(<span key={i++} style={{ color: '#c2410c' }} data-qoder-id="qel-span-892769e2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-892769e2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:264,&quot;column&quot;:18}}">{token}</span>);
    } else if (/^\w+$/.test(token) && text[match.index + token.length] === '(') {
      parts.push(<span key={i++} style={{ color: '#2563eb' }} data-qoder-id="qel-span-84276203" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-84276203&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:266,&quot;column&quot;:18}}">{token}</span>);
    } else {
      parts.push(<span key={i++} style={{ color: 'var(--fg-2)' }} data-qoder-id="qel-span-83276070" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-83276070&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CodeFileEditor.jsx&quot;,&quot;componentName&quot;:&quot;Unknown&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:268,&quot;column&quot;:18}}">{token}</span>);
    }
  }
  return parts;
}
