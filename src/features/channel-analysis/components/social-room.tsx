import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'other', label: '기타 SNS', icon: '🌐' },
];

export default function SocialRoom() {
  const [platform, setPlatform] = useState('instagram');
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [comments, setComments] = useState('');
  const [socialUrl, setSocialUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const analyze = () => {
    if (!caption.trim() && screenshots.length === 0 && !video) { toast.error('스크린샷, 영상, 또는 캡션을 입력해주세요'); return; }
    setLoading(true);
    setTimeout(() => {
      setResult(`${PLATFORMS.find((p) => p.id === platform)?.label} 콘텐츠 분석 완료\n\n스크린샷: ${screenshots.length}장\n영상: ${video ? '1개' : '없음'}\n캡션: ${caption.length}자\n\nAI 멀티모달 분석은 API 키가 필요합니다.`);
      setLoading(false);
      toast.success('소셜 콘텐츠 분석 완료');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Platform selector */}
      <div className="flex gap-2">
        {PLATFORMS.map((p) => (
          <button key={p.id} onClick={() => setPlatform(p.id)}
            className={`px-4 py-2.5 rounded-lg text-xs font-medium border transition-all ${platform === p.id ? 'border-blue-500 bg-blue-600/20 text-blue-400' : 'border-gray-700 text-gray-400 hover:text-white'}`}>
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      {platform === 'instagram' && (
        <p className="text-xs text-amber-400 bg-amber-950/30 border border-amber-500/20 rounded-lg px-3 py-2">
          Instagram은 URL 직접 접근이 불가합니다. 스크린샷과 캡션을 입력해주세요.
        </p>
      )}

      {/* Screenshots */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">스크린샷 (최대 10장)</label>
        <div onClick={() => fileRef.current?.click()}
          className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-gray-500 transition-colors">
          <p className="text-sm text-gray-400">{screenshots.length > 0 ? `${screenshots.length}장 선택됨` : '클릭하여 스크린샷 업로드'}</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => setScreenshots(Array.from(e.target.files || []).slice(0, 10))} />
      </div>

      {/* Video */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">영상 (최대 100MB)</label>
        <div onClick={() => videoRef.current?.click()}
          className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-gray-500 transition-colors">
          <p className="text-sm text-gray-400">{video ? video.name : '클릭하여 영상 업로드'}</p>
        </div>
        <input ref={videoRef} type="file" accept="video/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f && f.size <= 100 * 1024 * 1024) setVideo(f); else toast.error('100MB 이하 파일만 가능합니다'); }} />
      </div>

      {/* URL (TikTok/Other) */}
      {platform !== 'instagram' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">URL</label>
          <input type="text" value={socialUrl} onChange={(e) => setSocialUrl(e.target.value)}
            placeholder={platform === 'tiktok' ? 'TikTok 영상 URL (예: https://www.tiktok.com/@user/video/...)' : 'SNS 게시물 URL'}
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        </div>
      )}

      {/* Caption */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">캡션</label>
        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={4}
          placeholder="게시물 캡션이나 영상 대본을 붙여넣으세요..."
          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none" />
      </div>

      {/* Comments */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">주요 댓글 (선택)</label>
        <textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={3}
          placeholder="주요 댓글들을 붙여넣으세요... (선택)"
          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none" />
      </div>

      <button onClick={analyze} disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg disabled:opacity-50 transition-all">
        {loading ? '소셜 분석 중...' : '소셜 콘텐츠 분석'}
      </button>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <pre className="text-xs text-gray-300 whitespace-pre-wrap">{result}</pre>
        </motion.div>
      )}

      {!result && !loading && (
        <div className="text-center py-12">
          <span className="text-4xl block mb-3">📱</span>
          <p className="text-sm text-gray-500">Instagram, TikTok 등 소셜 콘텐츠를 AI로 분석합니다</p>
          <p className="text-xs text-gray-600 mt-1">스크린샷 + 영상 + 캡션 멀티모달 분석</p>
        </div>
      )}
    </div>
  );
}
