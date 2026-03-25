import { useState } from 'react';
import { toast } from 'sonner';
import { useAppStore } from '../../../stores/use-app-store';

type InputSource = 'youtube' | 'file' | 'manual';

interface ChannelInfo {
  channelId: string; title: string; description: string; thumbnailUrl: string;
  subscriberCount: number; videoCount: number; viewCount: number;
}

const VIDEO_COUNTS = [5, 10, 15, 20, 30];

export default function ChannelRoom() {
  const apiKey = useAppStore((s) => s.apiKeys.youtubeDataApi);
  const [inputSource, setInputSource] = useState<InputSource>('youtube');
  const [url, setUrl] = useState('');
  const [contentFormat, setContentFormat] = useState<'롱폼' | '쇼츠'>('롱폼');
  const [contentRegion, setContentRegion] = useState<'국내' | '해외'>('국내');
  const [videoCount, setVideoCount] = useState(10);
  const [sortOrder, setSortOrder] = useState<'latest' | 'popular'>('latest');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [topicInput, setTopicInput] = useState('');

  const [manualText, setManualText] = useState('');
  const [presets] = useState<{ channelName: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem('CHANNEL_PRESETS') || '[]'); } catch { return []; }
  });

  const formatNumber = (n: number) => {
    if (n >= 1e8) return Math.floor(n / 1e8) + '억';
    if (n >= 1e4) return Math.floor(n / 1e4) + '만';
    return n.toLocaleString();
  };

  const analyze = async () => {
    if (inputSource === 'youtube' && !url.trim()) { toast.error('YouTube URL을 입력해주세요'); return; }
    if (inputSource === 'youtube' && !apiKey) { toast.error('YouTube API 키가 필요합니다. 파일이나 텍스트로 분석하려면 "파일 업로드" 또는 "직접 입력" 탭을 사용하세요.'); return; }
    setLoading(true);
    setLoadingStep('채널 정보 가져오는 중...');

    try {
      // URL parsing
      const s = url.trim();
      let channelId = '';
      const videoMatch = s.match(/(?:\?v=|youtu\.be\/|\/shorts\/)([\w-]{11})/);
      const handleMatch = s.match(/\/@?([\w.-]+)/);

      if (videoMatch) {
        const vRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoMatch[1]}&key=${apiKey}`);
        const vData = await vRes.json();
        channelId = vData.items?.[0]?.snippet?.channelId || '';
      } else if (handleMatch) {
        const sRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(handleMatch[1])}&type=channel&maxResults=1&key=${apiKey}`);
        const sData = await sRes.json();
        channelId = sData.items?.[0]?.snippet?.channelId || '';
      }

      if (!channelId) { toast.error('채널을 찾을 수 없습니다'); return; }

      const chRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`);
      const chData = await chRes.json();
      const ch = chData.items?.[0];
      if (!ch) { toast.error('채널 정보를 가져올 수 없습니다'); return; }

      setChannelInfo({
        channelId, title: ch.snippet.title, description: ch.snippet.description,
        thumbnailUrl: ch.snippet.thumbnails?.medium?.url || '',
        subscriberCount: Number(ch.statistics.subscriberCount || 0),
        videoCount: Number(ch.statistics.videoCount || 0),
        viewCount: Number(ch.statistics.viewCount || 0),
      });

      setLoadingStep(`영상 ${videoCount}개 수집 중...`);
      const order = sortOrder === 'popular' ? 'viewCount' : 'date';
      await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=${order}&maxResults=${videoCount}&key=${apiKey}`);

      setLoadingStep('AI 스타일 분석 중...');
      toast.success(`${ch.snippet.title} 채널 정보를 가져왔습니다`);
    } catch (err: any) {
      toast.error(err.message || '분석 실패');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="space-y-5">
      {/* + New Analysis button */}
      <button onClick={() => { setChannelInfo(null); setUrl(''); }}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors">
        + 새 분석
      </button>

      {/* Main card */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6 space-y-5">
        <p className="text-sm text-gray-400">
          벤치마크 채널의 URL, 파일 또는 텍스트를 입력하면 AI가 말투/구조/도입부 패턴을 역설계합니다. 분석 결과는 대본 생성 시 자동 적용됩니다.
        </p>

        <h3 className="text-lg font-bold text-white">채널 스타일 클로닝</h3>

        {/* Input Source tabs */}
        <div className="flex justify-end gap-2">
          {([
            { id: 'youtube' as InputSource, label: 'YouTube 채널', icon: '📺' },
            { id: 'file' as InputSource, label: '파일 업로드', icon: '📄' },
            { id: 'manual' as InputSource, label: '직접 입력', icon: '✏️' },
          ]).map((s) => (
            <button key={s.id} onClick={() => setInputSource(s.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
                inputSource === s.id ? 'border-blue-500 bg-blue-600/20 text-blue-300' : 'border-gray-600 text-gray-400 hover:text-white hover:border-gray-500'
              }`}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* Options row - inline */}
        <div className="flex items-center gap-3 flex-wrap text-sm">
          <span className="text-gray-400 font-bold">콘텐츠 형식</span>
          <div className="flex border border-gray-600 rounded-lg overflow-hidden">
            {(['롱폼', '쇼츠'] as const).map((f) => (
              <button key={f} onClick={() => setContentFormat(f)}
                className={`px-4 py-1.5 font-bold text-sm ${contentFormat === f ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>{f}</button>
            ))}
          </div>

          <span className="text-gray-400 font-bold">콘텐츠 지역</span>
          <div className="flex border border-gray-600 rounded-lg overflow-hidden">
            {(['국내', '해외'] as const).map((r) => (
              <button key={r} onClick={() => setContentRegion(r)}
                className={`px-4 py-1.5 font-bold text-sm ${contentRegion === r ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>{r}</button>
            ))}
          </div>
          <span className="text-xs text-gray-500">자동 감지</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap text-sm">
          <span className="text-gray-400 font-bold">분석 영상 수</span>
          {VIDEO_COUNTS.map((n) => (
            <button key={n} onClick={() => setVideoCount(n)}
              className={`px-3 py-1.5 rounded-lg font-bold text-sm border ${
                videoCount === n ? 'border-blue-500 bg-blue-600/20 text-blue-300' : 'border-gray-600 text-gray-400 hover:text-white'
              }`}>{n}개</button>
          ))}
          <div className="flex border border-gray-600 rounded-lg overflow-hidden ml-4">
            <button onClick={() => setSortOrder('latest')}
              className={`px-4 py-1.5 font-bold text-sm ${sortOrder === 'latest' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>최신순</button>
            <button onClick={() => setSortOrder('popular')}
              className={`px-4 py-1.5 font-bold text-sm ${sortOrder === 'popular' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>인기순</button>
          </div>
        </div>

        {/* URL Input + Analyze button */}
        {inputSource === 'youtube' && (
          <div>
            <div className="flex gap-3">
              <input type="text" value={url} onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && analyze()}
                placeholder="YouTube URL (채널, 영상, 쇼츠 모두 가능 — 예: @채널명, 영상/쇼츠 링크)"
                className="flex-1 px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-base text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
              <button onClick={analyze} disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-lg disabled:opacity-50 transition-all shrink-0">
                {loading ? loadingStep || '분석 중...' : '분석 시작'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              YouTube API 키가 필요합니다. 파일이나 텍스트로 분석하려면 "파일 업로드" 또는 "직접 입력" 탭을 사용하세요.
            </p>
          </div>
        )}

        {inputSource === 'file' && (
          <div className="bg-gray-900 border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-gray-500 transition-colors"
            onClick={() => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.pdf,.docx,.txt,.md'; inp.multiple = true; inp.click(); }}>
            <span className="text-3xl block mb-2">📄</span>
            <p className="text-sm text-gray-400">PDF, DOCX, TXT, MD 파일 업로드 (최대 20개, 10MB)</p>
          </div>
        )}

        {inputSource === 'manual' && (
          <textarea value={manualText} onChange={(e) => setManualText(e.target.value)} rows={6}
            placeholder="분석할 대본/텍스트를 직접 붙여넣기하세요..."
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-base text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none" />
        )}
      </div>

      {/* Channel Info Result */}
      {channelInfo && (
        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-4 mb-4">
            <img src={channelInfo.thumbnailUrl} alt="" className="w-14 h-14 rounded-full" />
            <div>
              <h3 className="text-base font-bold text-white">{channelInfo.title}</h3>
              <div className="flex gap-4 mt-1 text-sm text-gray-400">
                <span>구독자 {formatNumber(channelInfo.subscriberCount)}명</span>
                <span>영상 {formatNumber(channelInfo.videoCount)}개</span>
                <span>총 조회수 {formatNumber(channelInfo.viewCount)}</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-amber-400">
            L1-L5 스타일 DNA 분석: Evolink API 키 설정 시 전체 분석 실행 (사고회로, 문장구조, 어휘, 서사, 감정역학)
          </p>
        </div>
      )}

      {/* Topic Input Section */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white">주제 입력</h3>
        <input type="text" value={topicInput} onChange={(e) => setTopicInput(e.target.value)}
          placeholder="관심 있는 주제를 입력하세요 (예: AI 기술, 다이어트 식단, 일본 여행, 자취 꿀팁...)"
          className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-base text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        <p className="text-xs text-gray-500">
          채널 분석 없이도 사용 가능합니다. 주제만 입력하면 AI가 바이럴 가능성이 높은 영상 아이디어 10개를 추천합니다.
        </p>

        <div className="flex gap-3">
          <button className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-bold rounded-lg transition-all">
            스타일 기반 주제 추천
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-sm font-bold rounded-lg transition-all shrink-0">
            주제 10개 재추천
          </button>
        </div>
      </div>

      {/* Presets */}
      {presets.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-sm text-gray-500 shrink-0">프리셋:</span>
          {presets.map((p, i) => (
            <button key={i} onClick={() => setUrl(p.channelName)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-300 transition-colors shrink-0 border border-gray-700">
              {p.channelName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
