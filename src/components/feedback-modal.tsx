import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useUiStore } from '../stores/use-ui-store';

export function FeedbackModal() {
  const { showFeedbackModal, setShowFeedbackModal } = useUiStore();
  const [type, setType] = useState<'bug' | 'feature' | 'other'>('feature');
  const [message, setMessage] = useState('');

  if (!showFeedbackModal) return null;

  const handleSubmit = () => {
    if (!message.trim()) { toast.error('내용을 입력해주세요'); return; }
    toast.success('피드백을 보내주셔서 감사합니다!');
    setMessage('');
    setShowFeedbackModal(false);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowFeedbackModal(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] max-w-[90vw] bg-gray-900 border border-gray-800 rounded-2xl p-6 z-50 shadow-2xl">
        <div className="flex justify-between mb-4">
          <h3 className="text-base font-semibold text-white">💬 피드백</h3>
          <button onClick={() => setShowFeedbackModal(false)} className="text-gray-500 hover:text-white">✕</button>
        </div>
        <div className="flex gap-2 mb-4">
          {([['bug', '🐛 버그'], ['feature', '💡 기능 제안'], ['other', '💬 기타']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setType(id)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${type === id ? 'border-blue-500 bg-blue-600/10 text-blue-400' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
              {label}
            </button>
          ))}
        </div>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="내용을 입력해주세요..."
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none mb-4" />
        <button onClick={handleSubmit}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg font-medium transition-colors">
          피드백 보내기
        </button>
      </motion.div>
    </>
  );
}
