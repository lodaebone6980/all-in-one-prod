import { useState } from 'react';
import { toast } from 'sonner';
import { STYLE_CATEGORIES, getAllStyles, IMAGE_MODELS, ASPECT_RATIOS, type VisualStyle } from '../../services/image-api';

export default function SetupPanel() {
  const [selectedStyle, setSelectedStyle] = useState<VisualStyle | null>(null);
  const [atmosphere, setAtmosphere] = useState('');
  const [imageModel, setImageModel] = useState('model_pro_cost');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [styleSearch, setStyleSearch] = useState('');
  const [googleSearch, setGoogleSearch] = useState(false);

  const allStyles = getAllStyles();
  const filteredStyles = styleSearch
    ? allStyles.filter((s) => s.nameKo.includes(styleSearch) || s.name.toLowerCase().includes(styleSearch.toLowerCase()))
    : null;

  return (
    <div className="space-y-6">
      {/* Image Model */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">이미지 모델</label>
        <div className="space-y-2">
          {IMAGE_MODELS.map((m) => (
            <button key={m.id} onClick={() => setImageModel(m.id)}
              className={`w-full p-3 rounded-lg border text-left transition-all ${imageModel === m.id ? 'border-orange-500 bg-orange-600/10' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
              <p className="text-sm font-medium text-white">{m.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">화면 비율</label>
        <div className="flex gap-2">
          {ASPECT_RATIOS.map((ar) => (
            <button key={ar.id} onClick={() => setAspectRatio(ar.id)}
              className={`flex-1 py-2.5 rounded-lg border text-center text-sm transition-all ${aspectRatio === ar.id ? 'border-orange-500 bg-orange-600/10 text-orange-400' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
              {ar.label}
            </button>
          ))}
        </div>
      </div>

      {/* Google Search Reference */}
      <div className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg p-3">
        <div>
          <p className="text-sm text-white">Google 레퍼런스 검색</p>
          <p className="text-[10px] text-gray-500">AI가 이미지 생성 시 실시간 웹 검색 결과를 참조</p>
        </div>
        <button onClick={() => setGoogleSearch(!googleSearch)}
          className={`w-12 h-6 rounded-full transition-colors ${googleSearch ? 'bg-orange-500' : 'bg-gray-600'}`}>
          <div className={`w-5 h-5 rounded-full bg-white transition-transform ${googleSearch ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      </div>
      {googleSearch && (
        <p className="text-[10px] text-amber-400">⚠ 활성화 시 이미지 생성 속도가 약 10~20초 정도 더 소요</p>
      )}

      {/* Atmosphere / Style */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">비주얼 스타일</label>
        <input type="text" value={atmosphere} onChange={(e) => setAtmosphere(e.target.value)}
          placeholder="스타일 버튼을 클릭하거나, 원하는 분위기를 직접 묘사하세요. (예: 90년대 홍콩 영화 느낌, 거친 질감, 흑백 톤)"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500" />

        {selectedStyle && (
          <div className="flex items-center gap-2 mt-2 bg-orange-600/10 border border-orange-500/30 rounded-lg px-3 py-2">
            <span className="text-xs text-orange-300">적용됨: {selectedStyle.nameKo}</span>
            <button onClick={() => setSelectedStyle(null)} className="text-xs text-gray-500 hover:text-white ml-auto">✕</button>
          </div>
        )}
      </div>

      {/* Style Picker */}
      <div>
        <input type="text" value={styleSearch} onChange={(e) => setStyleSearch(e.target.value)}
          placeholder="스타일 검색..." className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 mb-3" />

        {filteredStyles ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[300px] overflow-y-auto">
            {filteredStyles.map((s) => (
              <button key={s.id} onClick={() => { setSelectedStyle(s); setAtmosphere(s.prompt); toast.success(`${s.nameKo} 스타일 적용`); }}
                className={`p-2.5 rounded-lg border text-left transition-all ${selectedStyle?.id === s.id ? 'border-orange-500 bg-orange-600/10' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                <p className="text-xs font-medium text-white truncate">{s.nameKo}</p>
                <p className="text-[10px] text-gray-500 truncate">{s.name}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {STYLE_CATEGORIES.map((cat) => (
              <div key={cat.name}>
                <button onClick={() => setExpandedCategory(expandedCategory === cat.name ? null : cat.name)}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white hover:border-gray-600 transition-colors">
                  <span>{cat.name} ({cat.styles.length})</span>
                  <span className="text-gray-500">{expandedCategory === cat.name ? '▲' : '▼'}</span>
                </button>
                {expandedCategory === cat.name && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2 pl-2">
                    {cat.styles.map((s) => (
                      <button key={s.id} onClick={() => { setSelectedStyle(s); setAtmosphere(s.prompt); toast.success(`${s.nameKo} 스타일 적용`); }}
                        className={`p-2 rounded-lg border text-left transition-all ${selectedStyle?.id === s.id ? 'border-orange-500 bg-orange-600/10' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                        <p className="text-xs font-medium text-white truncate">{s.nameKo}</p>
                        <p className="text-[10px] text-gray-500 truncate">{s.name}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Style preview */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <p className="text-xs text-gray-400 mb-2">⚠ 스타일 적용 우선순위 안내</p>
        <p className="text-[10px] text-gray-500">캐릭터 이미지 &gt; 레퍼런스 이미지 &gt; 비주얼 스타일 순으로 적용됩니다.</p>
        <button className="mt-3 px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 text-orange-300 text-xs rounded-lg transition-colors">
          🎨 스타일 프리뷰 (2컷 테스트)
        </button>
      </div>
    </div>
  );
}
