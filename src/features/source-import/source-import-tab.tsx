import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ImportedSource {
  id: string;
  name: string;
  type: 'image' | 'script' | 'audio' | 'video';
  url?: string;
  content?: string;
  size: number;
  addedAt: number;
}

export default function SourceImportTab() {
  const [sources, setSources] = useState<ImportedSource[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    const newSources: ImportedSource[] = [];
    Array.from(files).forEach((file) => {
      let type: ImportedSource['type'] = 'image';
      if (file.type.startsWith('audio/')) type = 'audio';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.name.endsWith('.txt') || file.name.endsWith('.json') || file.name.endsWith('.srt')) type = 'script';

      newSources.push({
        id: crypto.randomUUID(),
        name: file.name,
        type,
        url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        size: file.size,
        addedAt: Date.now(),
      });
    });
    setSources((prev) => [...newSources, ...prev]);
    toast.success(`${newSources.length}개 파일을 가져왔습니다`);
  };

  const handleRemove = (id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
  };

  const typeIcon = (type: ImportedSource['type']) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'script': return '📝';
      case 'audio': return '🎵';
      case 'video': return '🎬';
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><span>📸</span> 소스 임포트</h2>
          <p className="text-sm text-gray-400 mt-1">외부 이미지, 스크립트, 오디오, 영상을 프로젝트에 가져오세요</p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileRef.current?.click()}
          className={`bg-gray-900 border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all mb-6 ${
            dragOver ? 'border-indigo-500 bg-indigo-600/5' : 'border-gray-700 hover:border-gray-600'
          }`}
        >
          <span className="text-4xl block mb-3">📁</span>
          <p className="text-sm text-gray-400">파일을 드래그하거나 클릭하여 가져오기</p>
          <p className="text-[10px] text-gray-600 mt-1">이미지, 스크립트(TXT/JSON/SRT), 오디오, 영상 지원</p>
          <input ref={fileRef} type="file" multiple className="hidden"
            onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }} />
        </div>

        {/* Imported sources */}
        {sources.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">가져온 소스가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300">가져온 소스 ({sources.length})</h4>
              <button onClick={() => { setSources([]); toast.success('모든 소스를 삭제했습니다'); }}
                className="text-xs text-gray-500 hover:text-red-400 transition-colors">전체 삭제</button>
            </div>
            <AnimatePresence>
              {sources.map((source) => (
                <motion.div key={source.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex items-center gap-3 hover:border-gray-700 transition-colors group">
                  {source.url ? (
                    <img src={source.url} alt="" className="w-12 h-12 rounded object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center text-xl shrink-0">{typeIcon(source.type)}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{source.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-500">{source.type}</span>
                      <span className="text-[10px] text-gray-600">{formatSize(source.size)}</span>
                    </div>
                  </div>
                  <button onClick={() => handleRemove(source.id)}
                    className="text-xs text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">✕</button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
