import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAppStore } from '../../stores/use-app-store';
import { useImageStore } from '../../stores/use-image-store';
import {
  IMAGE_MODELS, VIDEO_ENGINES, STYLE_CATEGORIES, getAllStyles,
  generateImageNanoBanana, PAN_ZOOM_PRESETS, ASPECT_RATIOS as AR_LIST,
  type AspectRatio, type VisualStyle,
} from '../../services/image-api';

const ASPECT_RATIOS: { id: AspectRatio; label: string; icon: string }[] = [
  { id: '16:9', label: '16:9', icon: '🖥️' },
  { id: '9:16', label: '9:16', icon: '📱' },
  { id: '1:1', label: '1:1', icon: '⬜' },
];

export default function ImageVideoTab() {
  const apiKeys = useAppStore((s) => s.apiKeys);
  const store = useImageStore();
  const [showStyleBrowser, setShowStyleBrowser] = useState(false);

  const allStyles = useMemo(() => getAllStyles(), []);

  const filteredStyles = useMemo(() => {
    let styles = store.styleCategory
      ? STYLE_CATEGORIES.find((c) => c.name === store.styleCategory)?.styles || []
      : allStyles;
    if (store.styleSearch) {
      const q = store.styleSearch.toLowerCase();
      styles = styles.filter((s) => s.nameKo.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    }
    return styles;
  }, [allStyles, store.styleCategory, store.styleSearch]);

  const handleGenerateImage = async () => {
    if (!store.imagePrompt.trim()) { toast.error('프롬프트를 입력해주세요'); return; }
    store.setGenerating(true);
    try {
      const results = await generateImage(
        {
          prompt: store.imagePrompt,
          negativePrompt: store.negativePrompt || undefined,
          engine: store.imageEngine,
          style: store.imageStyle || undefined,
          aspectRatio: store.imageAspect,
          count: store.imageCount,
        },
        apiKeys as unknown as Record<string, string>
      );
      store.addImages(results);
      const totalCost = results.reduce((a, r) => a + r.cost, 0);
      toast.success(`${results.length}장 생성 완료! ($${totalCost.toFixed(3)})`);
    } catch (err: any) {
      toast.error(err.message || '이미지 생성 실패');
    } finally {
      store.setGenerating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🎬</span> 이미지/영상
          </h2>
          <p className="text-sm text-gray-400 mt-1">AI로 이미지와 영상을 생성하세요</p>
        </div>

        {/* Sub tabs */}
        <div className="flex items-center gap-1 mb-6 bg-gray-900 border border-gray-800 rounded-lg p-1 w-fit">
          {[
            { id: 'image' as const, label: '이미지 생성', icon: '🖼️' },
            { id: 'video' as const, label: '영상 생성', icon: '🎥' },
            { id: 'batch' as const, label: '배치 생성', icon: '📦' },
            { id: 'gallery' as const, label: '갤러리', icon: '🗂️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => store.setSubTab(tab.id)}
              className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                store.subTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {store.subTab === tab.id && (
                <motion.div layoutId="imageSubTab" className="absolute inset-0 bg-indigo-600/30 rounded-md" transition={{ type: 'spring', stiffness: 350, damping: 30 }} />
              )}
              <span className="relative flex items-center gap-1.5"><span>{tab.icon}</span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Image Generation */}
        {store.subTab === 'image' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            <div className="space-y-4">
              {/* Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">프롬프트</label>
                <textarea
                  value={store.imagePrompt}
                  onChange={(e) => store.setImagePrompt(e.target.value)}
                  placeholder="생성할 이미지를 설명하세요..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Negative prompt */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">네거티브 프롬프트 (선택)</label>
                <input
                  type="text"
                  value={store.negativePrompt}
                  onChange={(e) => store.setNegativePrompt(e.target.value)}
                  placeholder="제외할 요소..."
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Selected style */}
              {store.imageStyle && (
                <div className="flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/30 rounded-lg px-3 py-2">
                  <span className="text-xs text-indigo-300">스타일: {store.imageStyle.nameKo}</span>
                  <button onClick={() => store.setImageStyle(null)} className="text-xs text-gray-500 hover:text-white ml-auto">✕</button>
                </div>
              )}

              {/* Style browser toggle */}
              <button
                onClick={() => setShowStyleBrowser(!showStyleBrowser)}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-300 hover:border-gray-700 transition-colors flex items-center justify-between"
              >
                <span>🎨 비주얼 스타일 ({allStyles.length}개)</span>
                <span>{showStyleBrowser ? '▲' : '▼'}</span>
              </button>

              {/* Style Browser */}
              <AnimatePresence>
                {showStyleBrowser && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={store.styleSearch}
                          onChange={(e) => store.setStyleSearch(e.target.value)}
                          placeholder="스타일 검색..."
                          className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                        />
                        <select
                          value={store.styleCategory}
                          onChange={(e) => store.setStyleCategory(e.target.value)}
                          className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white focus:outline-none"
                        >
                          <option value="">전체 카테고리</option>
                          {STYLE_CATEGORIES.map((c) => (
                            <option key={c.name} value={c.name}>{c.name} ({c.styles.length})</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[300px] overflow-y-auto">
                        {filteredStyles.map((style) => (
                          <button
                            key={style.id}
                            onClick={() => { store.setImageStyle(style); setShowStyleBrowser(false); }}
                            className={`p-2 rounded-lg border text-left transition-all ${
                              store.imageStyle?.id === style.id
                                ? 'border-indigo-500 bg-indigo-600/10'
                                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                            }`}
                          >
                            <p className="text-xs font-medium text-white truncate">{style.nameKo}</p>
                            <p className="text-[10px] text-gray-500 truncate">{style.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generated images gallery */}
              {store.images.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-3">생성된 이미지 ({store.images.length})</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {store.images.map((img) => (
                      <div key={img.id} className="group relative rounded-lg overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors">
                        <img src={img.url} alt={img.prompt} className="w-full aspect-video object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                          <p className="text-[10px] text-white line-clamp-2">{img.prompt}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-gray-400">{img.style || img.engine}</span>
                            <button
                              onClick={() => store.removeImage(img.id)}
                              className="text-[10px] text-red-400 hover:text-red-300"
                            >삭제</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right sidebar - Settings */}
            <div className="space-y-4">
              {/* Engine */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">이미지 엔진</label>
                <div className="space-y-1.5">
                  {IMAGE_MODELS.map((engine) => (
                    <button
                      key={engine.id}
                      onClick={() => store.setImageEngine(engine.id)}
                      className={`w-full p-2.5 rounded-lg border text-left transition-all ${
                        store.imageEngine === engine.id
                          ? 'border-indigo-500 bg-indigo-600/10'
                          : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white">{engine.label}</span>
                        <span className="text-[10px] text-emerald-400">
                          {engine.cost === 0 ? '무료' : `$${engine.cost}`}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">{engine.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect ratio */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">비율</label>
                <div className="flex gap-2">
                  {ASPECT_RATIOS.map((ar) => (
                    <button
                      key={ar.id}
                      onClick={() => store.setImageAspect(ar.id)}
                      className={`flex-1 py-2 rounded-lg border text-center transition-all ${
                        store.imageAspect === ar.id
                          ? 'border-indigo-500 bg-indigo-600/10 text-indigo-300'
                          : 'border-gray-800 text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <span className="text-sm block">{ar.icon}</span>
                      <span className="text-[10px]">{ar.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Count */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">생성 수: {store.imageCount}장</label>
                <input
                  type="range"
                  min={1} max={4} value={store.imageCount}
                  onChange={(e) => store.setImageCount(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              {/* Cost estimate */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                <p className="text-[10px] text-gray-500">예상 비용</p>
                <p className="text-base font-bold text-white">
                  ${(IMAGE_MODELS.find((e) => e.id === store.imageEngine)?.cost || 0) * store.imageCount > 0
                    ? ((IMAGE_MODELS.find((e) => e.id === store.imageEngine)?.cost || 0) * store.imageCount).toFixed(3)
                    : '무료'}
                </p>
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerateImage}
                disabled={store.generating || !store.imagePrompt.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-sm rounded-lg transition-all font-medium"
              >
                {store.generating ? '생성 중...' : '🖼️ 이미지 생성'}
              </button>
            </div>
          </div>
        )}

        {/* Video Generation */}
        {store.subTab === 'video' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">영상 프롬프트</label>
                <textarea
                  value={store.videoPrompt}
                  onChange={(e) => store.setVideoPrompt(e.target.value)}
                  placeholder="생성할 영상을 설명하세요..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Pan/Zoom presets */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">팬/줌 프리셋</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {PAN_ZOOM_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      className="p-2 rounded-lg border border-gray-800 bg-gray-900 hover:border-gray-700 text-center transition-all"
                    >
                      <p className="text-xs text-white">{preset.label}</p>
                      <p className="text-[10px] text-gray-500">{preset.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generated videos */}
              {store.videos.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-3">생성된 영상 ({store.videos.length})</h4>
                  <div className="space-y-2">
                    {store.videos.map((vid) => (
                      <div key={vid.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex gap-3">
                        <div className="w-32 h-18 bg-gray-800 rounded flex items-center justify-center text-2xl">🎬</div>
                        <div className="flex-1">
                          <p className="text-xs text-white line-clamp-2">{vid.prompt}</p>
                          <p className="text-[10px] text-gray-500 mt-1">{vid.engine} | {vid.duration}s | ${vid.cost.toFixed(3)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">영상 엔진</label>
                <div className="space-y-1.5">
                  {VIDEO_ENGINES.map((engine) => (
                    <button
                      key={engine.id}
                      onClick={() => store.setVideoEngine(engine.id)}
                      className={`w-full p-2.5 rounded-lg border text-left transition-all ${
                        store.videoEngine === engine.id
                          ? 'border-indigo-500 bg-indigo-600/10'
                          : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white">{engine.label}</span>
                        <span className="text-[10px] text-emerald-400">${engine.cost}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">{engine.description} | ~{engine.maxDuration}s | {engine.maxResolution}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">비율</label>
                <div className="flex gap-2">
                  {ASPECT_RATIOS.map((ar) => (
                    <button
                      key={ar.id}
                      onClick={() => store.setVideoAspect(ar.id)}
                      className={`flex-1 py-2 rounded-lg border text-center transition-all ${
                        store.videoAspect === ar.id
                          ? 'border-indigo-500 bg-indigo-600/10 text-indigo-300'
                          : 'border-gray-800 text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <span className="text-[10px]">{ar.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">길이: {store.videoDuration}초</label>
                <input
                  type="range" min={2} max={8} value={store.videoDuration}
                  onChange={(e) => store.setVideoDuration(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <button
                disabled={store.generating || !store.videoPrompt.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-sm rounded-lg transition-all font-medium"
              >
                {store.generating ? '생성 중...' : '🎥 영상 생성'}
              </button>
            </div>
          </div>
        )}

        {/* Batch */}
        {store.subTab === 'batch' && (
          <div className="text-center py-12">
            <span className="text-4xl block mb-3">📦</span>
            <p className="text-sm text-gray-500">대본의 씬별로 이미지를 일괄 생성합니다</p>
            <p className="text-xs text-gray-600 mt-1">대본작성 탭에서 대본을 먼저 생성해주세요</p>
          </div>
        )}

        {/* Gallery */}
        {store.subTab === 'gallery' && (
          <div>
            {store.images.length === 0 && store.videos.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl block mb-3">🗂️</span>
                <p className="text-sm text-gray-500">생성된 이미지와 영상이 여기에 표시됩니다</p>
              </div>
            ) : (
              <div className="space-y-6">
                {store.images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">이미지 ({store.images.length})</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {store.images.map((img) => (
                        <div key={img.id} className="rounded-lg overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer">
                          <img src={img.url} alt="" className="w-full aspect-square object-cover" />
                          <div className="p-2 bg-gray-900">
                            <p className="text-[10px] text-gray-400 truncate">{img.style || img.engine}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
