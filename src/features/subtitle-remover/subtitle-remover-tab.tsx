import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function SubtitleRemoverTab() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [mode, setMode] = useState<'subtitle' | 'watermark'>('subtitle');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  };

  const handleProcess = () => {
    if (!file) { toast.error('파일을 선택해주세요'); return; }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      toast.success(`${mode === 'subtitle' ? '자막' : '워터마크'} 제거가 완료되었습니다`);
    }, 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><span>🧹</span> 자막/워터마크 제거</h2>
          <p className="text-sm text-gray-400 mt-1">AI로 영상의 자막과 워터마크를 깔끔하게 제거하세요 (Kie AI)</p>
        </div>

        {/* Mode selector */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setMode('subtitle')}
            className={`flex-1 p-4 rounded-xl border text-center transition-all ${mode === 'subtitle' ? 'border-indigo-500 bg-indigo-600/10' : 'border-gray-800 bg-gray-900 hover:border-gray-700'}`}>
            <span className="text-2xl block">💬</span>
            <span className="text-sm font-medium text-white mt-1 block">자막 제거</span>
            <span className="text-[10px] text-gray-500">하드코딩된 자막 제거</span>
          </button>
          <button onClick={() => setMode('watermark')}
            className={`flex-1 p-4 rounded-xl border text-center transition-all ${mode === 'watermark' ? 'border-indigo-500 bg-indigo-600/10' : 'border-gray-800 bg-gray-900 hover:border-gray-700'}`}>
            <span className="text-2xl block">💧</span>
            <span className="text-sm font-medium text-white mt-1 block">워터마크 제거</span>
            <span className="text-[10px] text-gray-500">로고/워터마크 제거</span>
          </button>
        </div>

        {/* File upload */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          className="bg-gray-900 border-2 border-dashed border-gray-700 rounded-xl p-12 text-center hover:border-gray-600 transition-colors cursor-pointer mb-6"
        >
          {preview ? (
            <img src={preview} alt="" className="max-h-[300px] mx-auto rounded-lg mb-3" />
          ) : (
            <span className="text-4xl block mb-3">📁</span>
          )}
          <p className="text-sm text-gray-400">{file ? file.name : '이미지 또는 영상 파일을 드래그하거나 클릭'}</p>
          <p className="text-[10px] text-gray-600 mt-1">PNG, JPG, MP4, MOV 지원</p>
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>

        {/* Process */}
        <button onClick={handleProcess} disabled={processing || !file}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-sm rounded-lg transition-all font-medium">
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              AI 처리 중...
            </span>
          ) : (
            `🧹 ${mode === 'subtitle' ? '자막' : '워터마크'} 제거`
          )}
        </button>
      </motion.div>
    </div>
  );
}
