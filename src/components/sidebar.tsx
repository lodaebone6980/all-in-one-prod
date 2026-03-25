import { motion } from 'framer-motion';
import { useAppStore } from '../stores/use-app-store';
import { useUiStore } from '../stores/use-ui-store';
import { useProjectStore } from '../stores/use-project-store';
import { PIPELINE_TABS, POST_PROD_TABS, TOOLBOX_TABS, type NavTab } from '../utils/tab-config';
import type { TabId } from '../types';

export function Sidebar() {
  const { activeTab, setActiveTab } = useAppStore();
  const { toolboxOpen, setToolboxOpen } = useUiStore();
  const addProject = useProjectStore((s) => s.addProject);

  const handleNewProject = async () => {
    const name = `프로젝트 ${new Date().toLocaleDateString('ko-KR')}`;
    await addProject({ name, description: '', data: {} });
    setActiveTab('project');
  };

  return (
    <aside className="fixed top-16 left-0 bottom-0 w-44 shrink-0 border-r border-gray-700 py-3 overflow-y-auto bg-gray-900/80 z-30 flex flex-col">
      {/* New Project Button */}
      <button
        onClick={handleNewProject}
        className="flex items-center justify-center gap-2 mx-2 mb-2 px-3 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-500/10"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        새 프로젝트
      </button>

      {/* Pipeline Tabs */}
      {PIPELINE_TABS.map((tab) => (
        <TabButton key={tab.id} tab={tab} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
      ))}

      {/* Post-Production - always visible, just a label */}
      <div className="mt-2 px-3 py-1.5 text-xs text-gray-500 font-bold flex items-center gap-1">
        🎞️ 후반작업 <span className="text-[10px]">▲</span>
      </div>
      {POST_PROD_TABS.map((tab) => (
        <TabButton key={tab.id} tab={tab} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} indent />
      ))}

      {/* Toolbox - collapsible */}
      <div className="mt-3 border-t border-gray-700/50 pt-2">
        <button
          onClick={() => setToolboxOpen(!toolboxOpen)}
          className="flex items-center justify-between w-full px-3 py-1.5 text-xs text-gray-500 font-bold hover:text-gray-300 transition-colors"
        >
          <span className="flex items-center gap-1">🧰 도구모음</span>
          <motion.span animate={{ rotate: toolboxOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-[10px]">
            ▼
          </motion.span>
        </button>
        <motion.div
          initial={false}
          animate={{ height: toolboxOpen ? 'auto' : 0, opacity: toolboxOpen ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          {TOOLBOX_TABS.map((tab) => (
            <TabButton key={tab.id} tab={tab} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} indent />
          ))}
        </motion.div>
      </div>

      {/* Bottom: auto-save */}
      <div className="mt-auto pt-4 px-3 pb-2">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          자동 저장됨
        </div>
      </div>
    </aside>
  );
}

function TabButton({ tab, active, onClick, indent }: { tab: NavTab; active: boolean; onClick: () => void; indent?: boolean }) {
  return (
    <button onClick={onClick}
      className={`text-left w-full px-3 py-2 text-sm font-bold border-r-2 transition-all flex items-center gap-2 ${indent ? 'pl-5 text-[13px]' : ''} ${
        active ? 'border-r-blue-500 bg-gray-800/60 text-white' : 'border-r-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
      }`}>
      <span className="text-base">{tab.icon}</span>
      <span className="truncate">{tab.label}</span>
      {tab.badge && <span className="text-xs">{tab.badge}</span>}
    </button>
  );
}
