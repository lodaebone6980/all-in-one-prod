import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/use-auth-store';
import { useUiStore } from '../stores/use-ui-store';

export function ProfileModal() {
  const { showProfileModal, setShowProfileModal } = useUiStore();
  const { user, logout, isAdmin } = useAuthStore();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!showProfileModal || !user) return null;

  const handleLogout = () => {
    logout();
    setShowProfileModal(false);
    toast.success('로그아웃되었습니다');
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    logout();
    setShowProfileModal(false);
    toast.success('계정이 삭제되었습니다');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={() => setShowProfileModal(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      />
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] max-w-[90vw] bg-gray-900 border border-gray-800 rounded-2xl p-6 z-50 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-white">프로필</h3>
          <button onClick={() => setShowProfileModal(false)} className="text-gray-500 hover:text-white text-lg">✕</button>
        </div>

        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-lg font-bold">
            {user.displayName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{user.displayName}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                user.role === 'admin' ? 'bg-red-600/20 text-red-400' :
                user.tier === 'enterprise' ? 'bg-emerald-600/20 text-emerald-400' :
                user.tier === 'pro' ? 'bg-blue-600/20 text-blue-400' :
                'bg-amber-600/20 text-amber-400'
              }`}>
                {user.role === 'admin' ? 'ADMIN' : user.tier.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          <div className="bg-gray-800 rounded-lg p-3 text-xs">
            <div className="flex justify-between text-gray-400"><span>역할</span><span className="text-white">{user.role}</span></div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-xs">
            <div className="flex justify-between text-gray-400"><span>요금제</span><span className="text-white">{user.tier}</span></div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-xs">
            <div className="flex justify-between text-gray-400"><span>가입일</span><span className="text-white">{new Date(user.createdAt).toLocaleDateString('ko-KR')}</span></div>
          </div>
          {isAdmin() && (
            <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-3 text-xs text-red-400">
              관리자 권한이 있습니다
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={handleLogout}
            className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-colors">
            로그아웃
          </button>
          <button onClick={handleDelete}
            className="py-2 px-4 text-xs text-red-400 hover:bg-red-950/30 rounded-lg transition-colors">
            {confirmDelete ? '정말 삭제?' : '계정 삭제'}
          </button>
        </div>
      </motion.div>
    </>
  );
}
