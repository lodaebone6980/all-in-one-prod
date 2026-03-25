import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/use-auth-store';
import { useUiStore } from '../stores/use-ui-store';

type AuthTab = 'login' | 'signup';

export function AuthModal() {
  const { showAuthModal, setShowAuthModal } = useUiStore();
  const { setUser, setToken } = useAuthStore();
  const [tab, setTab] = useState<AuthTab>('login');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);

  // Signup form
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) { toast.error('이메일과 비밀번호를 입력해주세요'); return; }
    setLoading(true);
    // Demo login - admin check
    setTimeout(() => {
      const isAdmin = loginEmail === 'admin@admin.com' && loginPassword === 'admin';
      setUser({
        id: crypto.randomUUID(),
        email: loginEmail,
        displayName: isAdmin ? '관리자' : loginEmail.split('@')[0],
        role: isAdmin ? 'admin' : 'user',
        tier: isAdmin ? 'enterprise' : 'trial',
        trialExpiresAt: isAdmin ? undefined : Date.now() + 7 * 86400000,
        createdAt: Date.now(),
      });
      setToken('demo-token-' + crypto.randomUUID());
      setLoading(false);
      setShowAuthModal(false);
      toast.success(isAdmin ? '관리자로 로그인했습니다' : '로그인 성공!');
    }, 800);
  };

  const handleSignup = async () => {
    if (!signupName || !signupEmail || !signupPassword) { toast.error('모든 필드를 입력해주세요'); return; }
    if (signupPassword !== signupConfirm) { toast.error('비밀번호가 일치하지 않습니다'); return; }
    if (signupPassword.length < 8) { toast.error('비밀번호는 8자 이상이어야 합니다'); return; }
    if (!inviteCode.trim()) { toast.error('초대 코드를 입력해주세요'); return; }
    setLoading(true);
    setTimeout(() => {
      setUser({
        id: crypto.randomUUID(),
        email: signupEmail,
        displayName: signupName,
        role: 'user',
        tier: 'trial',
        trialExpiresAt: Date.now() + 7 * 86400000,
        createdAt: Date.now(),
      });
      setToken('demo-token-' + crypto.randomUUID());
      setLoading(false);
      setShowAuthModal(false);
      toast.success('회원가입 완료! 7일 체험판이 시작됩니다');
    }, 800);
  };

  if (!showAuthModal) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowAuthModal(false)}
        className="absolute inset-0 bg-gray-950/90 backdrop-blur-sm"
      />

      {/* Close */}
      <button onClick={() => setShowAuthModal(false)} className="fixed top-6 right-6 z-[251] p-2 text-gray-500 hover:text-white transition-colors text-xl">
        ✕
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-[251] w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl mx-4"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-xl font-bold mb-3 shadow-lg shadow-blue-500/20">
            AI
          </div>
          <h2 className="text-lg font-bold text-white">All-in-One Production</h2>
          <p className="text-xs text-gray-500 mt-1">AI 기반 영상 제작 파이프라인</p>
        </div>

        {/* Tab toggle */}
        <div className="flex bg-gray-800 rounded-xl p-1 border border-gray-700 mb-6">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'login' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            로그인
          </button>
          <button
            onClick={() => setTab('signup')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'signup' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            회원가입
          </button>
        </div>

        {/* Login Form */}
        {tab === 'login' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">이메일</label>
              <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="email@example.com"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">비밀번호</label>
              <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="비밀번호"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                <input type="checkbox" checked={keepLoggedIn} onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  className="accent-blue-600" />
                로그인 상태 유지 (30일)
              </label>
              <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">비밀번호를 잊으셨나요?</button>
            </div>
            <button onClick={handleLogin} disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-lg font-medium transition-colors">
              {loading ? '로그인 중...' : '로그인'}
            </button>

            {/* Social login divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-700" />
              <span className="text-xs text-gray-500">또는</span>
              <div className="flex-1 h-px bg-gray-700" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-colors" style={{ background: '#FEE500', color: '#000' }}>
                카카오 로그인
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium text-white transition-colors" style={{ background: '#03C75A' }}>
                네이버 로그인
              </button>
            </div>

            <p className="text-center text-[10px] text-gray-600 mt-2">
              Admin: admin@admin.com / admin
            </p>
          </div>
        )}

        {/* Signup Form */}
        {tab === 'signup' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">이름 (실명)</label>
              <input type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)}
                placeholder="이름" className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">이메일</label>
              <input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="email@example.com" className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">비밀번호 (8자 이상)</label>
              <input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="비밀번호" className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">비밀번호 확인</label>
              <input type="password" value={signupConfirm} onChange={(e) => setSignupConfirm(e.target.value)}
                placeholder="비밀번호 확인" className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-amber-400 mb-1">초대 코드 (필수)</label>
              <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="초대 코드 입력"
                className="w-full px-4 py-2.5 bg-amber-950/30 border border-amber-500/30 rounded-lg text-sm text-amber-200 placeholder-amber-700 focus:outline-none focus:border-amber-400 font-mono tracking-wider transition-colors" />
              <p className="text-[10px] text-amber-600 mt-1">구매 시 제공받은 초대 코드를 입력해주세요</p>
            </div>
            <button onClick={handleSignup} disabled={loading}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm rounded-lg font-medium transition-colors">
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
