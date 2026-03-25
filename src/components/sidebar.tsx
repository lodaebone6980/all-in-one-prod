import { motion } from 'framer-motion';
import { useAppStore } from '../stores/use-app-store';
import { useUiStore } from '../stores/use-ui-store';
import { useProjectStore } from '../stores/use-project-store';
import { PIPELINE_TABS, POST_PROD_TABS, TOOLBOX_TABS, getActiveColorClasses, type NavTab } from '../utils/tab-config';
import type { TabId } from '../types';

export function Sidebar() {
  const { activeTab, setActiveTab } = useAppStore();
  const { postProdOpen, setPostProdOpen, toolboxOpen, setToolboxOpen } = useUiStore();
  const addProject = useProjectStore((s) => s.addProject);

  const handleNewProject = async () => {
    const name = `프로젝트 ${new Date().toLocaleDateString('ko-KR')}`;
    await addProject({ name, description: '', data: {} });
    setActiveTab('project');
  };

  return (
    <aside className="fixed top-16 left-0 bottom-0 w-[15.5rem] bg-gray-950 border-r border-gray-800 z-30 flex flex-col py-3 px-3 gap-1 overflow-y-auto">
      {/* New Project Button */}
      <button
        onClick={handleNewProject}
        className="flex items-center justify-center gap-2 px-4 py-2.5 mb-1 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-500/10"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        새 프로젝트
      </button>

      {/* Pipeline Tabs */}
      {PIPELINE_TABS.map((tab) => (
        <TabButton key={tab.id} tab={tab} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} size="main" />
      ))}

      {/* Post-Production Accordion */}
      <div className="mt-3">
        <button
          onClick={() => setPostProdOpen(!postProdOpen)}
          className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-400 hover:text-gray-200 transition-colors"
        >
          <span className="flex items-center gap-2">🎞️ 후반작업</span>
          <motion.span animate={{ rotate: postProdOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-xs">
            ▼
          </motion.span>
        </button>
        <motion.div
          initial={false}
          animate={{ height: postProdOpen ? 'auto' : 0, opacity: postProdOpen ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden pl-3"
        >
          <div className="space-y-0.5">
            {POST_PROD_TABS.map((tab) => (
              <TabButton key={tab.id} tab={tab} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} size="sub" />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Toolbox Accordion */}
      <div className="mt-4 pt-3 border-t-2 border-dashed border-gray-600/40">
        <button
          onClick={() => setToolboxOpen(!toolboxOpen)}
          className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-400 hover:text-gray-200 transition-colors"
        >
          <span className="flex items-center gap-2">🧰 도구모음</span>
          <motion.span animate={{ rotate: toolboxOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-xs">
            ▼
          </motion.span>
        </button>
        <motion.div
          initial={false}
          animate={{ height: toolboxOpen ? 'auto' : 0, opacity: toolboxOpen ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden pl-3"
        >
          <div className="space-y-0.5">
            {TOOLBOX_TABS.map((tab) => (
              <TabButton key={tab.id} tab={tab} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} size="sub" />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom: auto-save */}
      <div className="mt-auto pt-4 px-2">
        <div className="flex items-center gap-2 text-[10px] text-gray-600">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          자동 저장됨 {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </aside>
  );
}

function TabButton({ tab, active, onClick, size }: { tab: NavTab; active: boolean; onClick: () => void; size: 'main' | 'sub' }) {
  const baseClass = size === 'main'
    ? 'flex items-center gap-3 w-full px-4 py-3.5 rounded-lg text-base font-semibold transition-all'
    : 'flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-all';

  return (
    <button onClick={onClick} className={`${baseClass} ${getActiveColorClasses(tab.activeColor, active)} ${!active ? 'border border-transparent' : ''}`}>
      <span>{tab.icon}</span>
      <span className="truncate">{tab.label}</span>
      {tab.badge && <span className="text-xs">{tab.badge}</span>}
    </button>
  );
}
