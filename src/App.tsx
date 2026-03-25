import { Toaster } from 'sonner';
import { Sidebar } from './components/sidebar';
import { TabContent } from './components/tab-content';
import { SettingsPanel } from './components/settings-panel';

export default function App() {
  return (
    <div className="h-screen w-screen flex bg-gray-950 text-gray-100 overflow-hidden">
      <Sidebar />
      <TabContent />
      <SettingsPanel />
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#1f2937',
            border: '1px solid #374151',
            color: '#e5e7eb',
          },
        }}
      />
    </div>
  );
}
