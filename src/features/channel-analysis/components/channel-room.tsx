import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAppStore } from '../../../stores/use-app-store';

type InputSource = 'youtube' | 'file' | 'manual';
type ContentFormat = '롱폼' | '쇼츠';
type ContentRegion = '국내' | '해외';

interface ChannelInfo {
  channelId: string; title: string; description: string; thumbnailUrl: string;
  subscriberCount: number; videoCount: number; viewCount: number;
}

interface ChannelPreset {
  channelName: string; savedAt: number; contentRegion: string;
}

const VIDEO_COUNTS = [5, 10, 15, 20, 30];

export default function ChannelRoom() {
  const apiKey = useAppStore((s) => s.apiKeys.youtubeDataApi);
  const [inputSource, setInputSource] = useState<InputSource>('youtube');
  const [url, setUrl] = useState('');
  const [contentFormat, setContentFormat] = useState<ContentFormat>('롱폼');
  const [contentRegion, setContentRegion] = useState<ContentRegion>('국내');
  const [videoCount, setVideoCount] = useState(10);
  const [sortOrder, setSortOrder] = useState<'latest' | 'popular'>('latest');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [presets, setPresets] = useState<ChannelPreset[]>(() => {
    try { return JSON.parse(localStorage.getItem('CHANNEL_PRESETS') || '[]'); } catch { return []; }
  });

  // Manual/file input states
  const [manualText, setManualText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const formatNumber = (n: number) => {
    if (n >= 1e8) return Math.floor(n / 1e8) + '억';
    if (n >= 1e4) return Math.floor(n / 1e4) + '만';
    return n.toLocaleString();
  };

  const extractChannelIdentifier = (input: string) => {
    const s = input.trim();
    if (s.startsWith('@')) return { type: 'handle', value: s };
    if (/^UC[\w-]{22}$/.test(s)) return { type: 'id', value: s };
    const shortMatch = s.match(/\/shorts\/([\w-]{11})/);
    if (shortMatch) return { type: 'shorts', value: shortMatch[1] };
    const videoMatch = s.match(/(?:\?v=|youtu\.be\/)([\w-]{11})/);
    if (videoMatch) return { type: 'video', value: videoMatch[1] };
    const liveMatch = s.match(/\/live\/([\w-]{11})/);
    if (liveMatch) return { type: 'video', value: liveMatch[1] };
    const channelIdMatch = s.match(/\/channel\/(UC[\w-]{22})/);
    if (channelIdMatch) return { type: 'id', value: channelIdMatch[1] };
    const handleMatch = s.match(/\/@([\w.-]+)/);
    if (handleMatch) return { type: 'handle', value: '@' + handleMatch[1] };
    return null;
  };

  const analyze = async () => {
    if (inputSource === 'youtube' && !url.trim()) { toast.error('YouTube URL을 입력해주세요'); return; }
    if (inputSource === 'youtube' && !apiKey) { toast.error('YouTube Data API 키를 설정해주세요'); return; }

    setLoading(true);
    try {
      if (inputSource === 'youtube') {
        const ident = extractChannelIdentifier(url);
        if (!ident) { toast.error('올바른 YouTube URL 형식이 아닙니다'); setLoading(false); return; }

        // Resolve to channel ID
        setLoadingStep('채널 정보 가져오는 중...');
        let channelId = '';
        if (ident.type === 'id') {
          channelId = ident.value;
        } else if (ident.type === 'video' || ident.type === 'shorts') {
          const vRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${ident.value}&key=${apiKey}`);
          const vData = await vRes.json();
          channelId = vData.items?.[0]?.snippet?.channelId || '';
        } else if (ident.type === 'handle') {
          const handle = ident.value.replace('@', '');
          const sRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(handle)}&type=channel&maxResults=1&key=${apiKey}`);
          const sData = await sRes.json();
          channelId = sData.items?.[0]?.snippet?.channelId || '';
        }

        if (!channelId) { toast.error('채널을 찾을 수 없습니다'); setLoading(false); return; }

        // Get channel details
        const chRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`);
        const chData = await chRes.json();
        const ch = chData.items?.[0];
        if (!ch) { toast.error('채널 정보를 가져올 수 없습니다'); setLoading(false); return; }

        const info: ChannelInfo = {
          channelId, title: ch.snippet.title, description: ch.snippet.description,
          thumbnailUrl: ch.snippet.thumbnails?.medium?.url || '',
          subscriberCount: Number(ch.statistics.subscriberCount || 0),
          videoCount: Number(ch.statistics.videoCount || 0),
          viewCount: Number(ch.statistics.viewCount || 0),
        };
        setChannelInfo(info);

        // Fetch videos
        setLoadingStep(`영상 ${videoCount}개 수집 중...`);
        const order = sortOrder === 'popular' ? 'viewCount' : 'date';
        const vListRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=${order}&maxResults=${videoCount}&key=${apiKey}`);
        const vListData = await vListRes.json();
        const videoIds = (vListData.items || []).map((i: any) => i.id.videoId).filter(Boolean);

        setLoadingStep('AI 스타일 분석 중...');
        // Placeholder for L1-L5 analysis (requires Evolink/Gemini API)
        setAnalysisResult({
          videosCollected: videoIds.length,
          channelName: info.title,
          status: 'AI 스타일 분석은 Evolink API 키가 필요합니다. 설정에서 API 키를 입력해주세요.',
        });

        toast.success(`${info.title} 채널 분석 완료 (영상 ${videoIds.length}개 수집)`);
      } else if (inputSource === 'manual') {
        setLoadingStep('텍스트 분석 중...');
        setAnalysisResult({ status: '직접 입력 텍스트 분석은 AI API 키가 필요합니다.' });
        toast.success('텍스트가 입력되었습니다');
      }
    } catch (err: any) {
      toast.error(err.message || '분석 실패');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const savePreset = () => {
    if (!channelInfo) return;
    const preset: ChannelPreset = { channelName: channelInfo.title, savedAt: Date.now(), contentRegion };
    const updated = [preset, ...presets.filter((p) => p.channelName !== channelInfo.title)];
    setPresets(updated);
    localStorage.setItem('CHANNEL_PRESETS', JSON.stringify(updated));
    toast.success('프리셋에 저장했습니다');
  };

  return (
    <div className="space-y-6">
      {/* Input Source */}
      <div className="flex gap-2">
        {([
          { id: 'youtube' as InputSource, label: 'YouTube 채널', icon: '📺' },
          { id: 'file' as InputSource, label: '파일 업로드', icon: '📄' },
          { id: 'manual' as InputSource, label: '직접 입력', icon: '✏️' },
        ]).map((s) => (
          <button key={s.id} onClick={() => setInputSource(s.id)}
            className={`px-4 py-2.5 rounded-lg text-xs font-medium border transition-all ${inputSource === s.id ? 'border-blue-500 bg-blue-600/20 text-blue-400' : 'border-gray-700 text-gray-400 hover:text-white'}`}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* YouTube Input */}
      {inputSource === 'youtube' && (
        <div className="space-y-4">
          <input type="text" value={url} onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && analyze()}
            placeholder="YouTube URL (채널, 영상, 쇼츠 모두 가능 — 예: @채널명, 영상/쇼츠 링크)"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />

          {/* Options row */}
          <div className="flex items-center gap-3 flex-wrap text-xs">
            {/* Format */}
            <div className="flex border border-gray-700 rounded-lg overflow-hidden">
              {(['롱폼', '쇼츠'] as ContentFormat[]).map((f) => (
                <button key={f} onClick={() => setContentFormat(f)}
                  className={`px-3 py-1.5 transition-colors ${contentFormat === f ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>{f}</button>
              ))}
            </div>
            {/* Region */}
            <div className="flex border border-gray-700 rounded-lg overflow-hidden">
              {(['국내', '해외'] as ContentRegion[]).map((r) => (
                <button key={r} onClick={() => setContentRegion(r)}
                  className={`px-3 py-1.5 transition-colors ${contentRegion === r ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>{r}</button>
              ))}
            </div>
            {/* Video count */}
            <span className="text-gray-500">영상 수:</span>
            {VIDEO_COUNTS.map((n) => (
              <button key={n} onClick={() => setVideoCount(n)}
                className={`px-2 py-1 rounded border transition-colors ${videoCount === n ? 'border-blue-500 text-blue-400' : 'border-gray-700 text-gray-500'}`}>{n}</button>
            ))}
            {/* Sort */}
            <div className="flex border border-gray-700 rounded-lg overflow-hidden">
              <button onClick={() => setSortOrder('latest')} className={`px-3 py-1.5 transition-colors ${sortOrder === 'latest' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>최신순</button>
              <button onClick={() => setSortOrder('popular')} className={`px-3 py-1.5 transition-colors ${sortOrder === 'popular' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>인기순</button>
            </div>
          </div>

          {/* Presets */}
          {presets.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs text-gray-500 shrink-0">프리셋:</span>
              {presets.map((p) => (
                <button key={p.channelName} onClick={() => setUrl(p.channelName)}
                  className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-gray-300 transition-colors shrink-0">
                  {p.channelName}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* File Input */}
      {inputSource === 'file' && (
        <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-gray-500 transition-colors"
          onClick={() => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.pdf,.docx,.txt,.md'; inp.multiple = true;
            inp.onchange = (e) => setUploadedFiles(Array.from((e.target as HTMLInputElement).files || [])); inp.click(); }}>
          <span className="text-3xl block mb-2">📄</span>
          <p className="text-sm text-gray-400">{uploadedFiles.length > 0 ? `${uploadedFiles.length}개 파일 선택됨` : 'PDF, DOCX, TXT, MD 파일 업로드 (최대 20개, 10MB)'}</p>
        </div>
      )}

      {/* Manual Input */}
      {inputSource === 'manual' && (
        <textarea value={manualText} onChange={(e) => setManualText(e.target.value)} rows={8}
          placeholder="분석할 대본/텍스트를 직접 붙여넣기하세요..."
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none" />
      )}

      {/* Analyze button */}
      <button onClick={analyze} disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg disabled:opacity-50 transition-all">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {loadingStep}
          </span>
        ) : '채널 스타일 분석 시작'}
      </button>

      {/* Channel Info */}
      {channelInfo && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <img src={channelInfo.thumbnailUrl} alt="" className="w-16 h-16 rounded-full" />
            <div className="flex-1">
              <h3 className="text-base font-bold text-white">{channelInfo.title}</h3>
              <div className="flex gap-3 mt-1 text-xs text-gray-400">
                <span>구독자 {formatNumber(channelInfo.subscriberCount)}명</span>
                <span>영상 {formatNumber(channelInfo.videoCount)}개</span>
                <span>총 조회수 {formatNumber(channelInfo.viewCount)}</span>
              </div>
            </div>
            <button onClick={savePreset} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-xs text-gray-300 rounded-lg transition-colors">
              ★ 프리셋 저장
            </button>
          </div>
        </motion.div>
      )}

      {/* Analysis Result */}
      {analysisResult && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <h4 className="text-sm font-medium text-white mb-2">분석 결과</h4>
          {analysisResult.videosCollected && (
            <p className="text-xs text-gray-400 mb-2">수집된 영상: {analysisResult.videosCollected}개</p>
          )}
          <p className="text-xs text-gray-500">{analysisResult.status}</p>
          <p className="text-xs text-amber-400 mt-3">
            L1-L5 스타일 DNA 분석: Evolink API 키 설정 후 전체 분석이 실행됩니다 (사고회로, 문장구조, 시각포맷, 어휘, 서사구조, 감정역학, 청자설정, 금기사항)
          </p>
        </motion.div>
      )}

      {/* Empty state */}
      {!channelInfo && !analysisResult && !loading && (
        <div className="text-center py-12">
          <span className="text-4xl block mb-3">📊</span>
          <p className="text-sm text-gray-500">YouTube 채널의 스타일을 AI로 역설계합니다</p>
          <p className="text-xs text-gray-600 mt-1">채널 URL을 입력하면 L1-L5 스타일 DNA 분석이 시작됩니다</p>
        </div>
      )}
    </div>
  );
}
