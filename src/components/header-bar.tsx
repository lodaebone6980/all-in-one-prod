import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuthStore } from '../stores/use-auth-store';
import { useUiStore } from '../stores/use-ui-store';
import { useCostStore } from '../stores/use-cost-store';

export function HeaderBar() {
  const { user, trialDaysLeft, isTrialExpired } = useAuthStore();
  const ui = useUiStore();
  const cost = useCostStore();
  const [showCostDetail, setShowCostDetail] = useState(false);

  const totalKrw = cost.totalUsd() * cost.exchangeRate;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 z-40 flex items-center px-6 gap-4">
      {/* Logo */}
      <h1
        className="text-lg font-bold cursor-pointer select-none"
        onClick={() => {}}
      >
        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          All In One Production
        </span>
        <span className="text-sm text-gray-400 ml-1 font-medium">v5.0</span>
      </h1>

      {/* Spacer */}
      <div className="ml-auto flex items-center gap-3">
        {/* Cost Tracker */}
        <div
          className="relative"
          onMouseEnter={() => setShowCostDetail(true)}
          onMouseLeave={() => setShowCostDetail(false)}
        >
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md bg-black/40 border-emerald-500/30 text-sm">
            <span className="animate-pulse">💸</span>
            <span className="hidden sm:inline-block text-gray-400 text-xs">실시간 제작 비용 :</span>
            <span className="text-emerald-400 font-mono font-bold text-sm">
              ￦{Math.round(totalKrw).toLocaleString()}
            </span>
            <span className="hidden md:inline-block text-[10px] text-emerald-600">✓ 자동 저장됨</span>
          </button>

          {/* Cost detail dropdown */}
          <AnimatePresence>
            {showCostDetail && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute right-0 top-full mt-2 w-64 bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-2xl z-50"
              >
                <h4 className="text-xs font-medium text-white mb-3">비용 상세</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>환율</span><span>$1 = ￦{cost.exchangeRate.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>USD 합계</span><span className="text-emerald-400">${cost.totalUsd().toFixed(4)}</span>
                  </div>
                  <div className="border-t border-gray-800 my-2" />
                  <div className="flex justify-between text-gray-400">
                    <span>🖼️ 이미지 생성</span><span>{cost.counts.image}회</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>🎬 영상 생성</span><span>{cost.counts.video}회</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>🔍 AI 분석</span><span>{cost.counts.analysis}회</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>🎙️ TTS</span><span>{cost.counts.tts}회</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>🎶 음악</span><span>{cost.counts.music}회</span>
                  </div>
                  <div className="border-t border-gray-800 my-2" />
                  <div className="flex justify-between text-gray-300 font-medium">
                    <span>총 API 호출</span><span>{cost.totalCalls()}회</span>
                  </div>
                </div>
                <button
                  onDoubleClick={() => cost.reset()}
                  className="mt-3 w-full text-[10px] text-gray-500 hover:text-red-400 transition-colors"
                >
                  더블클릭으로 초기화
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Trial badge */}
        {user && user.tier === 'trial' && !isTrialExpired() && (
          <button
            onClick={() => ui.setShowTrialGuide(true)}
            className="px-3 py-1.5 bg-amber-600/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-medium hover:bg-amber-600/30 transition-colors"
          >
            체험판 {trialDaysLeft()}일 남음
          </button>
        )}
        {user && user.tier === 'trial' && isTrialExpired() && (
          <span className="px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium">
            체험 기간 만료
          </span>
        )}

        {/* API Settings */}
        <button
          onClick={() => ui.setShowApiSettings(true)}
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-xs text-gray-300 transition-colors"
        >
          ⚙️ API 설정
        </button>

        {/* Feedback */}
        <button
          onClick={() => ui.setShowFeedbackModal(true)}
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-xs text-gray-300 transition-colors"
        >
          💬 피드백
        </button>

        {/* User / Login */}
        {user ? (
          <button
            onClick={() => ui.setShowProfileModal(true)}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-xs text-gray-300 transition-colors"
          >
            👤 {user.displayName}
          </button>
        ) : (
          <button
            onClick={() => ui.setShowAuthModal(true)}
            className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs rounded-lg transition-all font-medium shadow-lg shadow-blue-500/20"
          >
            로그인 / 회원가입
          </button>
        )}

        {/* Help */}
        <button
          onClick={() => ui.setShowHelpGuide(true)}
          className="px-2 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-xs text-gray-300 transition-colors"
        >
          ❓
        </button>
      </div>
    </header>
  );
}
