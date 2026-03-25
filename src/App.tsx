import { Toaster } from 'sonner';
import { HeaderBar } from './components/header-bar';
import { Sidebar } from './components/sidebar';
import { TabContent } from './components/tab-content';
import { SettingsPanel } from './components/settings-panel';
import { AuthModal } from './components/auth-modal';
import { ProfileModal } from './components/profile-modal';
import { FeedbackModal } from './components/feedback-modal';
import { useUiStore } from './stores/use-ui-store';

export default function App() {
  const { showApiSettings } = useUiStore();

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-blue-500/30 relative">
      <HeaderBar />
      <Sidebar />
      <TabContent />

      {/* Modals */}
      {showApiSettings && <SettingsPanel />}
      <AuthModal />
      <ProfileModal />
      <FeedbackModal />

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
