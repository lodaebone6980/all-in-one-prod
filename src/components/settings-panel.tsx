import { motion } from 'framer-motion';
import { useAppStore } from '../stores/use-app-store';
import { useUiStore } from '../stores/use-ui-store';
import type { ApiKeys } from '../types';

const API_KEY_FIELDS: { key: keyof ApiKeys; label: string; placeholder: string }[] = [
  { key: 'evolink', label: 'Evolink AI', placeholder: 'evolink-xxxxxxxx' },
  { key: 'gemini', label: 'Google Gemini', placeholder: 'AIzaSy...' },
  { key: 'kieAi', label: 'Kie AI', placeholder: 'kie-xxxxxxxx' },
  { key: 'xAi', label: 'X AI (Grok)', placeholder: 'xai-xxxxxxxx' },
  { key: 'typecast', label: 'Typecast', placeholder: 'typecast-xxxxxxxx' },
  { key: 'youtubeDataApi', label: 'YouTube Data API', placeholder: 'AIzaSy...' },
  { key: 'cloudinary', label: 'Cloudinary', placeholder: 'cloudinary://...' },
  { key: 'removeBg', label: 'Remove.bg', placeholder: 'xxxxxxxx' },
  { key: 'apimart', label: 'Apimart', placeholder: 'apimart-xxxxxxxx' },
  { key: 'coupangAccessKey', label: 'Coupang Access Key', placeholder: 'access-key' },
  { key: 'coupangSecretKey', label: 'Coupang Secret Key', placeholder: 'secret-key' },
];

export function SettingsPanel() {
  const { apiKeys, setApiKey } = useAppStore();
  const { setShowApiSettings } = useUiStore();

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowApiSettings(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="fixed right-0 top-0 h-full w-[420px] max-w-full bg-gray-900 border-l border-gray-800 z-50 flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-base font-semibold text-white">⚙️ API 설정</h2>
          <button onClick={() => setShowApiSettings(false)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors text-lg">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <section>
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <span>🔑</span> API 키 관리
            </h3>
            <div className="space-y-3">
              {API_KEY_FIELDS.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs text-gray-400 mb-1">{label}</label>
                  <input
                    type="password"
                    value={apiKeys[key]}
                    onChange={(e) => setApiKey(key, e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              ))}
            </div>
          </section>
          <section className="pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500 text-center">All In One Production v5.0</p>
          </section>
        </div>
      </motion.div>
    </>
  );
}
