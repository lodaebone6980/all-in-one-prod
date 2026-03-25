import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useChannelStore } from '../../../stores/use-channel-store';
import { getKeywordSuggestions, type KeywordSuggestion } from '../../../services/youtube-api';

export function KeywordResearch() {
  const { keywordQuery, setKeywordQuery, suggestions, setSuggestions, loading, setLoading } = useChannelStore();
  const [savedKeywords, setSavedKeywords] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!keywordQuery.trim()) return;
    setLoading(true);
    try {
      const results = await getKeywordSuggestions(keywordQuery);
      setSuggestions(results);
    } catch {
      toast.error('키워드 제안을 가져올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = (keyword: string) => {
    setSavedKeywords((prev) =>
      prev.includes(keyword) ? prev.filter((k) => k !== keyword) : [...prev, keyword]
    );
  };

  const copyKeywords = () => {
    const text = savedKeywords.length > 0 ? savedKeywords.join(', ') : suggestions.map((s) => s.keyword).join(', ');
    navigator.clipboard.writeText(text);
    toast.success('키워드를 클립보드에 복사했습니다');
  };

  const getCompetitionBadge = (comp?: string) => {
    switch (comp) {
      case 'low': return <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px]">낮음</span>;
      case 'medium': return <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 rounded text-[10px]">보통</span>;
      case 'high': return <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded text-[10px]">높음</span>;
      default: return null;
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <input
          type="text"
          value={keywordQuery}
          onChange={(e) => setKeywordQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="키워드를 입력하세요 (예: 브이로그, 먹방, 리뷰)"
          className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors font-medium shrink-0"
        >
          {loading ? '분석 중...' : '키워드 분석'}
        </button>
      </div>

      {/* Saved keywords */}
      {savedKeywords.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">저장된 키워드 ({savedKeywords.length})</span>
            <div className="flex gap-2">
              <button onClick={copyKeywords} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                복사
              </button>
              <button onClick={() => setSavedKeywords([])} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                초기화
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {savedKeywords.map((kw) => (
              <span
                key={kw}
                onClick={() => toggleSave(kw)}
                className="px-2 py-1 bg-indigo-600/20 text-indigo-300 rounded-full text-xs cursor-pointer hover:bg-indigo-600/30 transition-colors"
              >
                {kw} ×
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : suggestions.length > 0 ? (
        <div className="space-y-1.5">
          {/* Header */}
          <div className="grid grid-cols-[1fr_80px_80px_40px] gap-2 px-3 py-2 text-[10px] text-gray-500 uppercase tracking-wider">
            <span>키워드</span>
            <span className="text-center">경쟁도</span>
            <span className="text-center">기회점수</span>
            <span></span>
          </div>
          {suggestions.map((suggestion, idx) => (
            <motion.div
              key={suggestion.keyword}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`grid grid-cols-[1fr_80px_80px_40px] gap-2 items-center px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${
                savedKeywords.includes(suggestion.keyword)
                  ? 'bg-indigo-600/10 border-indigo-500/30'
                  : 'bg-gray-900 border-gray-800 hover:border-gray-700'
              }`}
              onClick={() => toggleSave(suggestion.keyword)}
            >
              <span className="text-sm text-gray-200 truncate">{suggestion.keyword}</span>
              <div className="text-center">{getCompetitionBadge(suggestion.competition)}</div>
              <div className="text-center">
                <span className={`text-sm font-semibold ${getScoreColor(suggestion.opportunityScore)}`}>
                  {suggestion.opportunityScore}
                </span>
              </div>
              <div className="text-center">
                <span className="text-xs">{savedKeywords.includes(suggestion.keyword) ? '✓' : '+'}</span>
              </div>
            </motion.div>
          ))}

          <div className="flex justify-end pt-2">
            <button onClick={copyKeywords} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-colors">
              전체 키워드 복사
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <span className="text-4xl block mb-3">🔑</span>
          <p className="text-sm text-gray-500">키워드를 입력하면 관련 키워드와 기회점수를 분석합니다</p>
          <p className="text-xs text-gray-600 mt-1">Google/YouTube 자동완성 기반 키워드 제안</p>
        </div>
      )}
    </div>
  );
}
