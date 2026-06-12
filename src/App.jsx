import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';

import HomePage from '@/pages/HomePage';
import WorkspaceList from '@/pages/WorkspaceList';
import WorkspaceHome from '@/pages/WorkspaceHome';
import Dashboard from '@/pages/Dashboard';
import RuleSetList from '@/pages/RuleSetList';
import RuleSetEditor from '@/pages/RuleSetEditor';
import DecisionFlowList from '@/pages/DecisionFlowList';
import DecisionFlowEditor from '@/pages/DecisionFlowEditor';
import LookupTableList from '@/pages/LookupTableList';
import LookupTableEditor from '@/pages/LookupTableEditor';
import CodeFileList from '@/pages/CodeFileList';
import CodeFileEditor from '@/pages/CodeFileEditor';
import ModelList from '@/pages/ModelList';
import ModelDetail from '@/pages/ModelDetail';
import GlobalVariables from '@/pages/GlobalVariables';
import PublishManagement from '@/pages/PublishManagement';
import GenericPage from '@/pages/GenericPage';
import OntologyList from '@/pages/OntologyList';
import OntologyDetail from '@/pages/OntologyDetail';
import OptimizationModelEditor from '@/pages/OptimizationModelEditor';
import OptimizationModelList from '@/pages/OptimizationModelList';

export default function App() {
  return (
    <BrowserRouter data-qoder-id="qel-browserrouter-9d9a9667" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-browserrouter-9d9a9667&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;browserrouter&quot;,&quot;loc&quot;:{&quot;line&quot;:25,&quot;column&quot;:5}}">
      <Routes data-qoder-id="qel-routes-8f4163fa" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-routes-8f4163fa&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;routes&quot;,&quot;loc&quot;:{&quot;line&quot;:26,&quot;column&quot;:7}}">
        <Route element={<Layout  data-qoder-id="qel-layout-a9e18950" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-layout-a9e18950&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;layout&quot;,&quot;loc&quot;:{&quot;line&quot;:27,&quot;column&quot;:25}}"/>} data-qoder-id="qel-route-e0df725d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-e0df725d&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:27,&quot;column&quot;:9}}">
          {/* Platform level */}
          <Route path="/" element={<HomePage />}  data-qoder-id="qel-route-dadf68eb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-dadf68eb&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:29,&quot;column&quot;:11}}"/>
          <Route path="/workspace" element={<WorkspaceList />}  data-qoder-id="qel-route-dbdf6a7e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-dbdf6a7e&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:30,&quot;column&quot;:11}}"/>

          {/* Workspace level — homepage */}
          <Route path="/w/:wsId" element={<WorkspaceHome />}  data-qoder-id="qel-route-dcdf6c11" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-dcdf6c11&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:33,&quot;column&quot;:11}}"/>

          {/* Workspace level — features */}
          <Route path="/w/:wsId/datasets" element={<GenericPage title="数据集" description="管理和维护平台数据集" icon="Database" />}  data-qoder-id="qel-route-d5df610c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-d5df610c&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:36,&quot;column&quot;:11}}"/>
          <Route path="/w/:wsId/ontology" element={<OntologyList />} />
          <Route path="/w/:wsId/ontology/:id" element={<OntologyDetail />} />
          <Route path="/w/:wsId/calc-models" element={<GenericPage title="计算模型" description="配置和管理计算模型" icon="LineChart" />}  data-qoder-id="qel-route-e0bbc805" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-e0bbc805&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:38,&quot;column&quot;:11}}"/>
          <Route path="/w/:wsId/automl" element={<GenericPage title="自动机器学习" description="自动化模型训练与选择" icon="Sparkles" />}  data-qoder-id="qel-route-dfbbc672" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-dfbbc672&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:39,&quot;column&quot;:11}}"/>
          <Route path="/w/:wsId/models" element={<ModelList />}  data-qoder-id="qel-route-debbc4df" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-debbc4df&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:40,&quot;column&quot;:11}}"/>
          <Route path="/w/:wsId/models/:id" element={<ModelDetail />}  data-qoder-id="qel-route-ddbbc34c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-ddbbc34c&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:41,&quot;column&quot;:11}}"/>
          <Route path="/w/:wsId/forecast" element={<GenericPage title="智能预测模型" description="时间序列与趋势预测" icon="BarChart3" />}  data-qoder-id="qel-route-dcbbc1b9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-dcbbc1b9&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:42,&quot;column&quot;:11}}"/>
          <Route path="/w/:wsId/optimization" element={<OptimizationModelList />} />
          <Route path="/w/:wsId/optimization/:id" element={<OptimizationModelEditor />} />
          <Route path="/w/:wsId/agents" element={<GenericPage title="智能体" description="管理智能决策代理" icon="Bot" />}  data-qoder-id="qel-route-dabbbe93" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-dabbbe93&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:44,&quot;column&quot;:11}}"/>
          <Route path="/w/:wsId/agent-teams" element={<GenericPage title="智能体团队" description="配置智能体协作团队" icon="Users" />}  data-qoder-id="qel-route-d9bbbd00" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-d9bbbd00&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:45,&quot;column&quot;:11}}"/>
          <Route path="/w/:wsId/skills" element={<GenericPage title="技能" description="智能体技能库管理" icon="Zap" />}  data-qoder-id="qel-route-e8bbd49d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-e8bbd49d&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:46,&quot;column&quot;:11}}"/>
          <Route path="/w/:wsId/memory" element={<GenericPage title="记忆" description="智能体记忆与上下文管理" icon="MemoryStick" />}  data-qoder-id="qel-route-e7bbd30a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-e7bbd30a&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:47,&quot;column&quot;:11}}"/>
          <Route path="/w/:wsId/decision-flows" element={<DecisionFlowList />}  data-qoder-id="qel-route-66bed98e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-66bed98e&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:48,&quot;column&quot;:11}}"/>
          <Route path="/w/:wsId/decision-flows/:id" element={<DecisionFlowEditor />}  data-qoder-id="qel-route-67bedb21" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-67bedb21&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:49,&quot;column&quot;:11}}"/>
          <Route path="/w/:wsId/rulesets" element={<RuleSetList />}  data-qoder-id="qel-route-64bed668" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-64bed668&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:50,&quot;column&quot;:11}}"/>
          <Route path="/w/:wsId/rulesets/:id" element={<RuleSetEditor />}  data-qoder-id="qel-route-65bed7fb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-65bed7fb&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:51,&quot;column&quot;:11}}"/>
          <Route path="/w/:wsId/lookup-tables" element={<LookupTableList />}  data-qoder-id="qel-route-6abedfda" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-6abedfda&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:52,&quot;column&quot;:11}}"/>
          <Route path="/w/:wsId/lookup-tables/:id" element={<LookupTableEditor />}  data-qoder-id="qel-route-6bbee16d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-6bbee16d&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:53,&quot;column&quot;:11}}"/>
          <Route path="/w/:wsId/code-files" element={<CodeFileList />}  data-qoder-id="qel-route-68bedcb4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-68bedcb4&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:54,&quot;column&quot;:11}}"/>
          <Route path="/w/:wsId/code-files/:id" element={<CodeFileEditor />}  data-qoder-id="qel-route-69bede47" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-69bede47&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:55,&quot;column&quot;:11}}"/>
                    <Route path="/w/:wsId/variables" element={<GlobalVariables />}  data-qoder-id="qel-route-5ebeccf6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-5ebeccf6&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:56,&quot;column&quot;:11}}"/>
          <Route path="/w/:wsId/publish" element={<PublishManagement />}  data-qoder-id="qel-route-6cc12197" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-6cc12197&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:58,&quot;column&quot;:11}}"/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
