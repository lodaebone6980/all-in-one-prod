import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const CHARACTER_TYPES = [
  { id: 'robot', label: '로봇', icon: '🤖' },
  { id: 'dog-furry', label: '개 퍼리', icon: '🐕' },
  { id: 'cat-furry', label: '고양이 퍼리', icon: '🐱' },
  { id: 'wolf', label: '늑대인간', icon: '🐺' },
  { id: 'dragon', label: '드래곤 인간', icon: '🐉' },
  { id: 'bear', label: '곰 인형', icon: '🧸' },
  { id: 'bjd', label: '구체관절', icon: '🎎' },
  { id: 'mermaid', label: '인어', icon: '🧜' },
  { id: 'vampire', label: '뱀파이어', icon: '🧛' },
  { id: 'mummy', label: '미라', icon: '🧟' },
  { id: 'nendoroid', label: '넨도로이드', icon: '🎀' },
  { id: 'figure', label: '피규어', icon: '🏆' },
  { id: 'plastic-toy', label: '플라스틱 토이', icon: '🧩' },
  { id: 'water', label: '물 원소', icon: '💧' },
  { id: 'fire', label: '불 원소', icon: '🔥' },
  { id: 'light', label: '빛 원소', icon: '✨' },
];

export default function CharacterTwistTab() {
  const [selectedType, setSelectedType] = useState('robot');
  const [description, setDescription] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<{ id: string; type: string }[]>([]);

  const handleGenerate = () => {
    if (!description.trim()) { toast.error('캐릭터 설명을 입력해주세요'); return; }
    setGenerating(true);
    setTimeout(() => {
      setResults((prev) => [{ id: crypto.randomUUID(), type: selectedType }, ...prev]);
      setGenerating(false);
      toast.success('캐릭터 변환 완료!');
    }, 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><span>🌀</span> 캐릭터 비틀기</h2>
          <p className="text-sm text-gray-400 mt-1">캐릭터를 다양한 형태로 변환하고 리믹스하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">캐릭터 설명</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="변환할 캐릭터를 설명하세요 (예: 갈색 머리, 파란 눈의 10대 소녀)"
                rows={3} className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">레퍼런스 이미지 URL (선택)</label>
              <input type="text" value={referenceUrl} onChange={(e) => setReferenceUrl(e.target.value)}
                placeholder="캐릭터 레퍼런스 이미지 URL" className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500" />
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">변환 결과 ({results.length})</h4>
                <div className="grid grid-cols-3 gap-3">
                  {results.map((r) => (
                    <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors">
                      <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
                        <span className="text-4xl">{CHARACTER_TYPES.find((t) => t.id === r.type)?.icon || '🌀'}</span>
                      </div>
                      <div className="p-2 text-center">
                        <span className="text-[10px] text-gray-500">{CHARACTER_TYPES.find((t) => t.id === r.type)?.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Character type selector */}
          <div className="space-y-4">
            <label className="block text-xs text-gray-400">변환 유형</label>
            <div className="grid grid-cols-2 gap-1.5 max-h-[500px] overflow-y-auto pr-1">
              {CHARACTER_TYPES.map((type) => (
                <button key={type.id} onClick={() => setSelectedType(type.id)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    selectedType === type.id ? 'border-indigo-500 bg-indigo-600/10' : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                  }`}>
                  <span className="text-xl block">{type.icon}</span>
                  <span className="text-[10px] text-gray-400">{type.label}</span>
                </button>
              ))}
            </div>
            <button onClick={handleGenerate} disabled={generating || !description.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-sm rounded-lg transition-all font-medium">
              {generating ? '변환 중...' : '🌀 캐릭터 변환'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
