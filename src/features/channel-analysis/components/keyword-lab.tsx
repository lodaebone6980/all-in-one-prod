import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAppStore } from '../../../stores/use-app-store';

interface KeywordResult {
  keyword: string;
  searchVolume: number;
  competition: number;
  opportunityScore: number;
  trend: 'rising' | 'stable' | 'declining';
  totalResults: number;
  avgViews: number;
  channelDiversity: number;
}

interface TopVideo {
  videoId: string; title: string; channelTitle: string; channelSubscribers: number;
  thumbnail: string; duration: string; viewCount: number; likeCount: number;
  commentCount: number; publishedAt: string; engagement: number; viewToSubRatio: number;
  tags: string[];
}

interface RelatedKeyword { keyword: string; score: number; }

const LANGUAGES = [
  { id: 'ko', label: '한국어' },
  { id: 'ja', label: '日本語' },
  { id: 'en', label: 'EN' },
];
const LANG_REGION: Record<string, string> = { ko: 'KR', ja: 'JP', en: 'US' };

type InnerTab = 'related' | 'videos' | 'tags' | 'history';
type DurationFilter = 'all' | 'shorts' | 'medium' | 'long';

function scoreToColor(score: number, inverted = false): string {
  const eff = inverted ? 100 - score : score;
  return eff >= 70 ? 'text-green-400' : eff >= 40 ? 'text-yellow-400' : 'text-red-400';
}

function formatNumber(n: number): string {
  if (n >= 1e8) return Math.floor(n / 1e8) + '억';
  if (n >= 1e4) return Math.floor(n / 1e4) + '만';
  return n.toLocaleString();
}

function trendInfo(trend: string) {
  if (trend === 'rising') return { label: '상승', color: 'text-green-400', icon: '↑' };
  if (trend === 'stable') return { label: '안정', color: 'text-yellow-400', icon: '→' };
  return { label: '하락', color: 'text-red-400', icon: '↓' };
}

export default function KeywordLab() {
  const apiKey = useAppStore((s) => s.apiKeys.youtubeDataApi);
  const [keyword, setKeyword] = useState('');
  const [lang, setLang] = useState('ko');
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [result, setResult] = useState<KeywordResult | null>(null);
  const [relatedKeywords, setRelatedKeywords] = useState<RelatedKeyword[]>([]);
  const [topVideos, setTopVideos] = useState<TopVideo[]>([]);
  const [tags, setTags] = useState<{ tag: string; frequency: number }[]>([]);
  const [history, setHistory] = useState<KeywordResult[]>([]);
  const [innerTab, setInnerTab] = useState<InnerTab>('related');
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all');

  const analyze = async () => {
    if (!keyword.trim()) { toast.error('키워드를 입력해주세요'); return; }
    if (!apiKey) { toast.error('설정에서 YouTube Data API 키를 입력해주세요'); return; }

    setLoading(true);
    try {
      // Step 1: YouTube Search
      setLoadingStage('검색 중');
      const region = LANG_REGION[lang] || 'KR';
      const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&maxResults=25&relevanceLanguage=${lang}&regionCode=${region}&key=${apiKey}`);
      if (!searchRes.ok) throw new Error(`YouTube API 오류: ${searchRes.status}`);
      const searchData = await searchRes.json();
      const totalResults = Number(searchData.pageInfo?.totalResults || 0);

      // Track quota
      const prevQuota = Number(localStorage.getItem('YOUTUBE_QUOTA_USED') || '0');
      localStorage.setItem('YOUTUBE_QUOTA_USED', String(prevQuota + 101));

      const videoIds = (searchData.items || []).map((i: any) => i.id.videoId).filter(Boolean);
      if (videoIds.length === 0) { toast.error('검색 결과가 없습니다'); setLoading(false); return; }

      // Step 2: Video details
      setLoadingStage('데이터 수집');
      const videoRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=${videoIds.join(',')}&key=${apiKey}`);
      const videoData = await videoRes.json();
      const videos = videoData.items || [];

      const viewCounts = videos.map((v: any) => Number(v.statistics?.viewCount || 0));
      const avgViews = viewCounts.length ? Math.round(viewCounts.reduce((a: number, b: number) => a + b, 0) / viewCounts.length) : 0;

      // Scoring formulas matching original
      const searchVolume = Math.min(100, Math.round(Math.log10(totalResults + 1) / 7 * 100));
      const competition = Math.min(100, Math.round(Math.log10(totalResults + 1) / 7 * 50 + Math.log10(avgViews + 1) / 7 * 50));
      const opportunityScore = Math.round(searchVolume * (1 - competition / 200));

      const recentVideos = videos.filter((v: any) => {
        const pub = new Date(v.snippet.publishedAt).getTime();
        return Date.now() - pub < 7 * 86400000;
      }).length;
      const trend: 'rising' | 'stable' | 'declining' = recentVideos >= 5 ? 'rising' : recentVideos >= 2 ? 'stable' : 'declining';

      const uniqueChannels = new Set(videos.map((v: any) => v.snippet.channelId)).size;

      const kwResult: KeywordResult = { keyword, searchVolume, competition, opportunityScore, trend, totalResults, avgViews, channelDiversity: uniqueChannels };
      setResult(kwResult);
      setHistory((prev) => [kwResult, ...prev].slice(0, 20));

      // Step 3: Related keywords (Google Suggest)
      setLoadingStage('태그 분석');
      try {
        const suggestRes = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(keyword)}&hl=${lang}&ds=yt`);
        if (suggestRes.ok) {
          const suggestData = await suggestRes.json();
          const suggestions: string[] = suggestData[1] || [];
          setRelatedKeywords(suggestions.map((s, i) => ({ keyword: s, score: Math.round(100 - (i / suggestions.length) * 100) })));
        }
      } catch { /* fallback silently */ }

      // Step 4: Top videos
      const channelIds = [...new Set(videos.map((v: any) => v.snippet.channelId))].join(',');
      let channelSubs: Record<string, number> = {};
      if (channelIds) {
        const chRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelIds}&key=${apiKey}`);
        const chData = await chRes.json();
        (chData.items || []).forEach((ch: any) => { channelSubs[ch.id] = Number(ch.statistics?.subscriberCount || 0); });
      }

      setTopVideos(videos.map((v: any) => {
        const vc = Number(v.statistics?.viewCount || 0);
        const lc = Number(v.statistics?.likeCount || 0);
        const cc = Number(v.statistics?.commentCount || 0);
        const subs = channelSubs[v.snippet.channelId] || 0;
        return {
          videoId: v.id, title: v.snippet.title, channelTitle: v.snippet.channelTitle,
          channelSubscribers: subs, thumbnail: v.snippet.thumbnails?.medium?.url || '',
          duration: v.contentDetails?.duration || '', viewCount: vc, likeCount: lc,
          commentCount: cc, publishedAt: v.snippet.publishedAt,
          engagement: vc > 0 ? ((lc + cc) / vc) * 100 : 0,
          viewToSubRatio: subs > 0 ? (vc / subs) * 100 : 0,
          tags: v.snippet.tags || [],
        };
      }));

      // Step 5: Tags
      setLoadingStage('마무리 중');
      const allTags: Record<string, number> = {};
      videos.slice(0, 3).forEach((v: any) => {
        (v.snippet.tags || []).forEach((t: string) => {
          allTags[t] = (allTags[t] || 0) + 1;
        });
      });
      setTags(Object.entries(allTags).map(([tag, frequency]) => ({ tag, frequency })).sort((a, b) => b.frequency - a.frequency).slice(0, 60));

      toast.success('키워드 분석 완료!');
    } catch (err: any) {
      toast.error(err.message || '분석 실패');
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  const parseDuration = (iso: string): number => {
    const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    return m ? (Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0)) : 0;
  };

  const filteredVideos = topVideos.filter((v) => {
    const dur = parseDuration(v.duration);
    if (durationFilter === 'shorts') return dur < 240;
    if (durationFilter === 'medium') return dur >= 240 && dur <= 1200;
    if (durationFilter === 'long') return dur > 1200;
    return true;
  });

  const getSeoScore = (v: TopVideo) => {
    const kw = keyword.toLowerCase();
    const title = v.title.toLowerCase().includes(kw);
    const vtags = v.tags.some((t) => t.toLowerCase().includes(kw));
    const score = [title, vtags].filter(Boolean).length;
    return score >= 2 ? { label: 'SEO 경쟁 치열', color: 'text-red-400' } : score >= 1 ? { label: 'SEO 보통', color: 'text-yellow-400' } : { label: 'SEO 진입 용이', color: 'text-green-400' };
  };

  const exportCsv = () => {
    if (!result) return;
    const bom = '\uFEFF';
    let csv = bom + '키워드,검색량,경쟁도,기회점수,트렌드,총결과,평균조회,채널다양성\n';
    csv += `${result.keyword},${result.searchVolume},${result.competition},${result.opportunityScore},${result.trend},${result.totalResults},${result.avgViews},${result.channelDiversity}\n`;
    if (tags.length) { csv += '\n태그\n' + tags.map((t) => t.tag).join(','); }
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `keyword-${keyword}-${Date.now()}.csv`; a.click();
    toast.success('CSV 내보내기 완료');
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex gap-2">
        <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && analyze()}
          placeholder="분석할 YouTube 키워드 (예: AI 영상 편집, 여행 브이로그)"
          className="flex-1 px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-base text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        <div className="flex border border-gray-700 rounded-lg overflow-hidden">
          {LANGUAGES.map((l) => (
            <button key={l.id} onClick={() => setLang(l.id)}
              className={`px-3 py-2 text-xs transition-colors ${lang === l.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
              {l.label}
            </button>
          ))}
        </div>
        <button onClick={analyze} disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-base font-bold rounded-lg disabled:opacity-50 transition-all">
          {loading ? loadingStage || '분석 중...' : '분석'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <MetricCard label="검색량" value={String(result.searchVolume)} color={scoreToColor(result.searchVolume)} />
            <MetricCard label="경쟁도" value={String(result.competition)} color={scoreToColor(result.competition, true)} />
            <MetricCard label="기회점수" value={String(result.opportunityScore)} color={scoreToColor(result.opportunityScore)} />
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-3">
              <p className="text-[10px] text-gray-500">트렌드</p>
              <p className={`text-xl font-bold ${trendInfo(result.trend).color}`}>
                {trendInfo(result.trend).icon} {trendInfo(result.trend).label}
              </p>
            </div>
            <MetricCard label="총 검색결과" value={formatNumber(result.totalResults)} color="text-white" />
            <MetricCard label="평균 조회수" value={formatNumber(result.avgViews)} color="text-white" />
            <MetricCard label="채널 다양성" value={`${result.channelDiversity}/25`} color="text-white" />
            <MetricCard label="데이터 소스" value="실시간" color="text-blue-400" />
          </div>

          {/* Export */}
          <div className="flex gap-2 mb-4">
            <button onClick={exportCsv} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-xs text-gray-300 transition-colors">
              CSV 내보내기
            </button>
            <button onClick={() => { navigator.clipboard.writeText(JSON.stringify({ result, relatedKeywords, topVideos: topVideos.slice(0, 10), tags })); toast.success('JSON 복사됨'); }}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-xs text-gray-300 transition-colors">
              JSON 내보내기
            </button>
          </div>

          {/* Inner tabs */}
          <div className="flex items-center gap-1 mb-4 bg-gray-800/50 border border-gray-700 rounded-lg p-1 w-fit">
            {([
              { id: 'related' as InnerTab, label: '연관 키워드', count: relatedKeywords.length },
              { id: 'videos' as InnerTab, label: '상위 영상', count: filteredVideos.length },
              { id: 'tags' as InnerTab, label: '태그 클라우드', count: tags.length },
              { id: 'history' as InnerTab, label: '분석 히스토리', count: history.length },
            ]).map((tab) => (
              <button key={tab.id} onClick={() => setInnerTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${innerTab === tab.id ? 'bg-blue-600/30 text-blue-400' : 'text-gray-400 hover:text-white'}`}>
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Related Keywords */}
          {innerTab === 'related' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {relatedKeywords.map((rk) => (
                <button key={rk.keyword} onClick={() => { setKeyword(rk.keyword); analyze(); }}
                  className="flex items-center gap-2 p-2.5 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors text-left">
                  <span className="text-xs text-white truncate flex-1">{rk.keyword}</span>
                  <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden shrink-0">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${rk.score}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-500 w-6 text-right">{rk.score}</span>
                </button>
              ))}
            </div>
          )}

          {/* Top Videos */}
          {innerTab === 'videos' && (
            <div>
              <div className="flex gap-2 mb-3">
                {(['all', 'shorts', 'medium', 'long'] as DurationFilter[]).map((f) => (
                  <button key={f} onClick={() => setDurationFilter(f)}
                    className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${durationFilter === f ? 'border-blue-500 bg-blue-600/20 text-blue-400' : 'border-gray-700 text-gray-400'}`}>
                    {{ all: '전체', shorts: '쇼츠(<4분)', medium: '중간(4-20분)', long: '롱폼(>20분)' }[f]}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {filteredVideos.map((v) => {
                  const seo = getSeoScore(v);
                  const isSmallChannel = v.channelSubscribers < 50000 && v.viewToSubRatio > 5000;
                  return (
                    <div key={v.videoId} className="bg-gray-800 border border-gray-700 rounded-lg p-3 flex gap-3 hover:border-gray-600 transition-colors">
                      <div className="relative shrink-0">
                        <img src={v.thumbnail} alt="" className="w-36 h-20 rounded object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-medium text-white line-clamp-2">{v.title}</h5>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500 flex-wrap">
                          <span>{v.channelTitle}</span>
                          <span>구독자 {formatNumber(v.channelSubscribers)}</span>
                          <span>조회수 {formatNumber(v.viewCount)}</span>
                          <span>참여율 {v.engagement.toFixed(2)}%</span>
                          <span className={seo.color}>{seo.label}</span>
                          {isSmallChannel && <span className="px-1.5 py-0.5 bg-green-600/20 text-green-400 rounded">소채널 성공</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          {innerTab === 'tags' && (
            <div>
              <div className="flex justify-end mb-3">
                <button onClick={() => { navigator.clipboard.writeText(tags.map((t) => t.tag).join(', ')); toast.success('태그 복사됨'); }}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-xs text-gray-300">
                  전체 복사
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((t, i) => {
                  const maxF = tags[0]?.frequency || 1;
                  const ratio = t.frequency / maxF;
                  const size = ratio > 0.8 ? 'text-2xl' : ratio > 0.6 ? 'text-xl' : ratio > 0.4 ? 'text-lg' : ratio > 0.2 ? 'text-base' : 'text-sm';
                  const opacity = ratio > 0.5 ? 'opacity-100' : ratio > 0.25 ? 'opacity-80' : 'opacity-60';
                  const colors = ['text-blue-300', 'text-violet-300', 'text-cyan-300', 'text-emerald-300', 'text-pink-300', 'text-amber-300'];
                  return (
                    <span key={t.tag} className={`${size} ${opacity} ${colors[i % colors.length]} font-medium cursor-pointer hover:underline`}
                      onClick={() => { setKeyword(t.tag); }}>
                      {t.tag}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* History */}
          {innerTab === 'history' && (
            <div className="space-y-2">
              {history.length === 0 ? <p className="text-sm text-gray-500 text-center py-8">분석 히스토리가 없습니다</p> : (
                <>
                  <div className="flex justify-end">
                    <button onClick={() => setHistory([])} className="text-xs text-gray-500 hover:text-red-400 transition-colors">히스토리 초기화</button>
                  </div>
                  {history.map((h, idx) => {
                    const tr = trendInfo(h.trend);
                    return (
                      <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-3 flex items-center gap-4 cursor-pointer hover:border-gray-600"
                        onClick={() => { setKeyword(h.keyword); setResult(h); }}>
                        <span className="text-sm font-medium text-white">{h.keyword}</span>
                        <span className={`text-xs ${scoreToColor(h.searchVolume)}`}>검색량 {h.searchVolume}</span>
                        <span className={`text-xs ${scoreToColor(h.competition, true)}`}>경쟁도 {h.competition}</span>
                        <span className={`text-xs ${scoreToColor(h.opportunityScore)}`}>기회 {h.opportunityScore}</span>
                        <span className={`text-xs ${tr.color}`}>{tr.icon}{tr.label}</span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div className="text-center py-16">
          <span className="text-4xl block mb-3">🔍</span>
          <p className="text-sm text-gray-500">키워드를 입력하면 검색량, 경쟁도, 기회점수를 실시간 분석합니다</p>
          <p className="text-xs text-gray-600 mt-1">YouTube Data API v3 + Google Suggest 기반</p>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-600 rounded-xl p-4">
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
