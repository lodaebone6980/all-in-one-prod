import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAppStore } from '../../stores/use-app-store';

export default function DetailPageTab() {
  const { apiKeys, setApiKey } = useAppStore();
  const [productUrl, setProductUrl] = useState('');
  const [productName, setProductName] = useState('');
  const [scriptType, setScriptType] = useState<'review' | 'unboxing' | 'comparison'>('review');
  const [generating, setGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');

  const handleGenerate = () => {
    if (!productName.trim()) { toast.error('상품명을 입력해주세요'); return; }
    setGenerating(true);
    setTimeout(() => {
      setGeneratedScript(`[인트로] 안녕하세요! 오늘은 ${productName}을 리뷰해보겠습니다.\n\n[본론] 이 제품의 가장 큰 장점은...\n\n[결론] 구매를 고민하시는 분들께 추천드립니다!\n\n📌 댓글로 구매 링크 보내드려요!`);
      setAffiliateLink(`https://link.coupang.com/a/${crypto.randomUUID().slice(0, 8)}`);
      setGenerating(false);
      toast.success('쇼핑 콘텐츠 대본이 생성되었습니다');
    }, 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">쇼핑콘텐츠</h1>
          <p className="text-sm text-gray-400 mt-1">상세페이지 · 썸네일 · 숏폼 · 쇼핑 채널</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">상품명</label>
              <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="리뷰할 상품명을 입력하세요"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">상품 URL (선택)</label>
              <input type="text" value={productUrl} onChange={(e) => setProductUrl(e.target.value)} placeholder="쿠팡 상품 URL"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">콘텐츠 유형</label>
              <div className="flex gap-2">
                {[
                  { id: 'review' as const, label: '리뷰', icon: '⭐' },
                  { id: 'unboxing' as const, label: '언박싱', icon: '📦' },
                  { id: 'comparison' as const, label: '비교', icon: '⚖️' },
                ].map((t) => (
                  <button key={t.id} onClick={() => setScriptType(t.id)}
                    className={`flex-1 p-3 rounded-xl border text-center transition-all ${scriptType === t.id ? 'border-indigo-500 bg-indigo-600/10' : 'border-gray-800 bg-gray-900 hover:border-gray-700'}`}>
                    <span className="text-xl block">{t.icon}</span>
                    <span className="text-xs text-gray-300 mt-1 block">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {generatedScript && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white">생성된 대본</h4>
                  <button onClick={() => { navigator.clipboard.writeText(generatedScript); toast.success('복사됨'); }}
                    className="text-xs text-indigo-400 hover:text-indigo-300">복사</button>
                </div>
                <pre className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">{generatedScript}</pre>
                {affiliateLink && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                    <p className="text-[10px] text-emerald-400 mb-1">어필리에이트 링크</p>
                    <p className="text-xs text-white font-mono break-all">{affiliateLink}</p>
                  </div>
                )}
              </div>
            )}

            <button onClick={handleGenerate} disabled={generating || !productName.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-sm rounded-lg transition-all font-medium">
              {generating ? '생성 중...' : '🛒 쇼핑 콘텐츠 생성'}
            </button>
          </div>

          {/* Coupang settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300">쿠팡 파트너스 설정</h3>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Access Key</label>
              <input type="password" value={apiKeys.coupangAccessKey} onChange={(e) => setApiKey('coupangAccessKey', e.target.value)}
                placeholder="Access Key" className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Secret Key</label>
              <input type="password" value={apiKeys.coupangSecretKey} onChange={(e) => setApiKey('coupangSecretKey', e.target.value)}
                placeholder="Secret Key" className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
              <p className="text-[10px] text-gray-500">쇼핑 숏폼 가이드라인</p>
              <ul className="text-[10px] text-gray-400 mt-1 space-y-0.5 list-disc list-inside">
                <li>15-60초 이내</li>
                <li>상품 장점 3개 이상</li>
                <li>CTA: "댓글로 구매 링크 보내드려요!"</li>
                <li>해시태그 5-10개</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
