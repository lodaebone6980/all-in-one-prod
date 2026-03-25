import { motion } from 'framer-motion';
import { useAppStore } from '../stores/use-app-store';
import { TAB_LIST } from '../utils/tab-config';
import type { TabId } from '../types';

export function Sidebar() {
  const { activeTab, setActiveTab, sidebarCollapsed, setSidebarCollapsed, setSettingsOpen } = useAppStore();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 220 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-full bg-gray-900 border-r border-gray-800 flex flex-col shrink-0 overflow-hidden"
    >
      {/* Header */}
      <div className="p-3 flex items-center gap-2 border-b border-gray-800 min-h-[52px]">
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 min-w-0"
          >
            <h1 className="text-sm font-bold text-white truncate">All In One</h1>
            <p className="text-[10px] text-gray-500">Production v5.0</p>
          </motion.div>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors shrink-0"
          title={sidebarCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d={sidebarCollapsed ? 'M6 3l5 5-5 5' : 'M10 3L5 8l5 5'}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {TAB_LIST.map((tab) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            icon={tab.icon}
            label={tab.label}
            active={activeTab === tab.id}
            collapsed={sidebarCollapsed}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </nav>

      {/* Settings button */}
      <div className="p-2 border-t border-gray-800">
        <button
          onClick={() => setSettingsOpen(true)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
        >
          <span className="text-base">⚙️</span>
          {!sidebarCollapsed && <span className="text-xs">설정</span>}
        </button>
      </div>
    </motion.aside>
  );
}

function TabButton({
  id,
  icon,
  label,
  active,
  collapsed,
  onClick,
}: {
  id: TabId;
  icon: string;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-150 group relative ${
        active
          ? 'bg-indigo-600/20 text-indigo-300 shadow-sm'
          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
      } ${collapsed ? 'justify-center px-2' : ''}`}
      title={collapsed ? label : undefined}
    >
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-500 rounded-r-full"
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}
      <span className="text-base shrink-0">{icon}</span>
      {!collapsed && (
        <span className="text-xs font-medium truncate">{label}</span>
      )}
    </button>
  );
}
