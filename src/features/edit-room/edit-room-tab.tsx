import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useEditStore, type EditScene, type SubtitleStyle } from '../../stores/use-edit-store';

const TRANSITIONS = [
  { id: 'none', label: '없음' },
  { id: 'fade', label: '페이드' },
  { id: 'dissolve', label: '디졸브' },
  { id: 'wipe-left', label: '와이프 좌' },
  { id: 'wipe-right', label: '와이프 우' },
  { id: 'zoom', label: '줌' },
  { id: 'slide-up', label: '슬라이드 업' },
  { id: 'glitch', label: '글리치' },
];

const EFFECTS = [
  { id: 'none', label: '없음' },
  { id: 'blur', label: '블러' },
  { id: 'vignette', label: '비네팅' },
  { id: 'grain', label: '필름 그레인' },
  { id: 'sepia', label: '세피아' },
  { id: 'bw', label: '흑백' },
  { id: 'sharpen', label: '샤프닝' },
  { id: 'glow', label: '글로우' },
];

export default function EditRoomTab() {
  const store = useEditStore();
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const totalDuration = store.scenes.reduce((a, s) => a + s.duration, 0);
  const selectedScene = store.scenes.find((s) => s.id === store.selectedSceneId);

  const handleAddDemoScenes = () => {
    const demoScenes: Omit<EditScene, 'id' | 'order'>[] = [
      { narration: '안녕하세요, 오늘의 영상을 시작하겠습니다.', visualDescription: '인트로 화면', duration: 5, audioOffset: 0, panZoom: 'zoom-in', effect: 'none', transition: 'fade', subtitle: '안녕하세요, 오늘의 영상을 시작하겠습니다.', subtitleStyle: store.globalSubtitleStyle },
      { narration: '첫 번째 주제를 알아보겠습니다.', visualDescription: '메인 콘텐츠 A', duration: 8, audioOffset: 0, panZoom: 'pan-right', effect: 'none', transition: 'dissolve', subtitle: '첫 번째 주제를 알아보겠습니다.', subtitleStyle: store.globalSubtitleStyle },
      { narration: '이 부분이 핵심입니다!', visualDescription: '하이라이트 장면', duration: 6, audioOffset: 0, panZoom: 'ken-burns', effect: 'glow', transition: 'zoom', subtitle: '이 부분이 핵심입니다!', subtitleStyle: store.globalSubtitleStyle },
      { narration: '다음으로 넘어가볼까요.', visualDescription: '메인 콘텐츠 B', duration: 7, audioOffset: 0, panZoom: 'none', effect: 'none', transition: 'wipe-left', subtitle: '다음으로 넘어가볼까요.', subtitleStyle: store.globalSubtitleStyle },
      { narration: '오늘 영상은 여기까지입니다. 구독과 좋아요 부탁드립니다!', visualDescription: '아웃트로', duration: 5, audioOffset: 0, panZoom: 'zoom-out', effect: 'vignette', transition: 'fade', subtitle: '구독과 좋아요 부탁드립니다!', subtitleStyle: store.globalSubtitleStyle },
    ];
    demoScenes.forEach((s) => store.addScene(s));
    toast.success('데모 씬 5개가 추가되었습니다');
  };

  const handleExportSrt = () => {
    let srt = '';
    let startMs = 0;
    store.scenes.forEach((scene, idx) => {
      const endMs = startMs + scene.duration * 1000;
      srt += `${idx + 1}\n${formatSrtTime(startMs)} --> ${formatSrtTime(endMs)}\n${scene.subtitle}\n\n`;
      startMs = endMs;
    });
    const blob = new Blob([srt], { type: 'text/srt' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subtitles-${Date.now()}.srt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('SRT 파일을 내보냈습니다');
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) {
      store.reorderScene(dragIdx, idx);
      setDragIdx(idx);
    }
  };
  const handleDragEnd = () => setDragIdx(null);

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="p-4 pb-0 flex-shrink-0">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>✂️</span> 편집실
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {store.scenes.length}씬 | {totalDuration}초 ({Math.floor(totalDuration / 60)}:{String(totalDuration % 60).padStart(2, '0')})
              </p>
            </div>
            <div className="flex items-center gap-2">
              {store.scenes.length === 0 && (
                <button onClick={handleAddDemoScenes} className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">
                  데모 씬 추가
                </button>
              )}
              <button onClick={handleExportSrt} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
                SRT 내보내기
              </button>
              <select
                value={store.exportFormat}
                onChange={(e) => store.setExportFormat(e.target.value as any)}
                className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-200"
              >
                <option value="mp4">MP4 렌더링</option>
                <option value="premiere">Premiere XML</option>
                <option value="davinci">DaVinci EDL</option>
                <option value="srt">SRT 자막</option>
              </select>
            </div>
          </div>

          {/* Sub tabs */}
          <div className="flex items-center gap-1 mb-4 bg-gray-900 border border-gray-800 rounded-lg p-1 w-fit">
            {[
              { id: 'timeline' as const, label: '타임라인', icon: '📐' },
              { id: 'effects' as const, label: '이펙트', icon: '✨' },
              { id: 'subtitles' as const, label: '자막', icon: '💬' },
              { id: 'transition' as const, label: '트랜지션', icon: '🔄' },
              { id: 'edit-point' as const, label: '편집포인트', icon: '📍' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => store.setSubTab(tab.id)}
                className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  store.subTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {store.subTab === tab.id && (
                  <motion.div layoutId="editSubTab" className="absolute inset-0 bg-indigo-600/30 rounded-md" transition={{ type: 'spring', stiffness: 350, damping: 30 }} />
                )}
                <span className="relative flex items-center gap-1.5"><span>{tab.icon}</span>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {store.scenes.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">✂️</span>
            <p className="text-sm text-gray-500 mb-2">편집할 씬이 없습니다</p>
            <p className="text-xs text-gray-600 mb-4">대본작성 탭에서 대본을 생성하거나 데모 씬을 추가하세요</p>
            <button onClick={handleAddDemoScenes} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors">
              데모 씬 추가
            </button>
          </div>
        ) : (
          <>
            {/* Timeline */}
            {store.subTab === 'timeline' && (
              <div className="space-y-2">
                {/* Timeline bar */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => store.setPlaying(!store.playing)}
                      className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center text-sm transition-colors"
                    >
                      {store.playing ? '⏸' : '▶'}
                    </button>
                    <span className="text-xs text-gray-400 font-mono">
                      {formatTime(store.currentTime)} / {formatTime(totalDuration)}
                    </span>
                  </div>
                  {/* Visual timeline */}
                  <div className="flex h-8 rounded overflow-hidden gap-px">
                    {store.scenes.map((scene) => (
                      <div
                        key={scene.id}
                        onClick={() => store.setSelectedSceneId(scene.id)}
                        className={`h-full flex items-center justify-center text-[10px] font-medium cursor-pointer transition-all ${
                          store.selectedSceneId === scene.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        style={{ flex: scene.duration }}
                      >
                        {scene.duration >= 3 && `S${scene.order + 1}`}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scene cards (draggable) */}
                {store.scenes.map((scene, idx) => (
                  <div
                    key={scene.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    onClick={() => store.setSelectedSceneId(scene.id)}
                    className={`bg-gray-900 border rounded-xl p-3 flex gap-3 cursor-pointer transition-all ${
                      store.selectedSceneId === scene.id
                        ? 'border-indigo-500 bg-indigo-600/5'
                        : 'border-gray-800 hover:border-gray-700'
                    } ${dragIdx === idx ? 'opacity-50' : ''}`}
                  >
                    {/* Drag handle & number */}
                    <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                      <span className="text-gray-600 cursor-grab text-xs">⋮⋮</span>
                      <span className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                        {scene.order + 1}
                      </span>
                    </div>

                    {/* Scene thumbnail */}
                    <div className="w-24 h-14 bg-gray-800 rounded flex items-center justify-center text-xs text-gray-600 shrink-0">
                      {scene.imageUrl ? (
                        <img src={scene.imageUrl} alt="" className="w-full h-full object-cover rounded" />
                      ) : '🖼️'}
                    </div>

                    {/* Scene info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white line-clamp-1">{scene.narration || '(나레이션 없음)'}</p>
                      <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{scene.visualDescription}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500">
                        <span>{scene.duration}초</span>
                        {scene.panZoom !== 'none' && <span className="text-blue-400">{scene.panZoom}</span>}
                        {scene.effect !== 'none' && <span className="text-purple-400">{scene.effect}</span>}
                        {scene.transition !== 'none' && <span className="text-emerald-400">{scene.transition}</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); store.splitScene(scene.id, Math.floor(scene.duration / 2)); toast.success('씬을 분할했습니다'); }}
                        className="px-2 py-1 text-[10px] text-gray-500 hover:text-white hover:bg-gray-800 rounded transition-colors"
                        title="분할"
                      >✂️</button>
                      <button
                        onClick={(e) => { e.stopPropagation(); store.removeScene(scene.id); toast.success('씬을 삭제했습니다'); }}
                        className="px-2 py-1 text-[10px] text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded transition-colors"
                        title="삭제"
                      >🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Effects */}
            {store.subTab === 'effects' && (
              <div className="space-y-4">
                {selectedScene ? (
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-white mb-3">씬 {selectedScene.order + 1} 이펙트</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {EFFECTS.map((effect) => (
                        <button
                          key={effect.id}
                          onClick={() => store.updateScene(selectedScene.id, { effect: effect.id })}
                          className={`p-2.5 rounded-lg border text-center transition-all ${
                            selectedScene.effect === effect.id
                              ? 'border-purple-500 bg-purple-600/10 text-purple-300'
                              : 'border-gray-700 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          <span className="text-xs">{effect.label}</span>
                        </button>
                      ))}
                    </div>

                    <h4 className="text-sm font-medium text-white mt-4 mb-3">팬/줌</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {['none', 'zoom-in', 'zoom-out', 'pan-left', 'pan-right', 'pan-up', 'pan-down', 'ken-burns'].map((pz) => (
                        <button
                          key={pz}
                          onClick={() => store.updateScene(selectedScene.id, { panZoom: pz })}
                          className={`p-2 rounded-lg border text-center transition-all ${
                            selectedScene.panZoom === pz
                              ? 'border-blue-500 bg-blue-600/10 text-blue-300'
                              : 'border-gray-700 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          <span className="text-[10px]">{pz}</span>
                        </button>
                      ))}
                    </div>

                    <h4 className="text-sm font-medium text-white mt-4 mb-2">재생 시간</h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={selectedScene.duration}
                        onChange={(e) => store.updateScene(selectedScene.id, { duration: Math.max(1, Number(e.target.value)) })}
                        min={1} max={60}
                        className="w-20 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-xs text-gray-500">초</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-sm text-gray-500 py-8">타임라인에서 씬을 선택하세요</p>
                )}
              </div>
            )}

            {/* Subtitles */}
            {store.subTab === 'subtitles' && (
              <div className="space-y-4">
                {/* Global style */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-white mb-3">글로벌 자막 스타일</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">글꼴 크기</label>
                      <input type="number" value={store.globalSubtitleStyle.fontSize} onChange={(e) => store.setGlobalSubtitleStyle({ fontSize: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">글자 색상</label>
                      <input type="color" value={store.globalSubtitleStyle.color} onChange={(e) => store.setGlobalSubtitleStyle({ color: e.target.value })}
                        className="w-full h-8 bg-gray-800 border border-gray-700 rounded cursor-pointer" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">위치</label>
                      <select value={store.globalSubtitleStyle.position} onChange={(e) => store.setGlobalSubtitleStyle({ position: e.target.value as any })}
                        className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-white focus:outline-none">
                        <option value="top">상단</option>
                        <option value="center">중앙</option>
                        <option value="bottom">하단</option>
                      </select>
                    </div>
                    <div className="flex items-end gap-2">
                      <button onClick={() => store.setGlobalSubtitleStyle({ bold: !store.globalSubtitleStyle.bold })}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${store.globalSubtitleStyle.bold ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}>B</button>
                      <button onClick={() => store.setGlobalSubtitleStyle({ italic: !store.globalSubtitleStyle.italic })}
                        className={`px-3 py-1.5 rounded text-xs italic transition-colors ${store.globalSubtitleStyle.italic ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}>I</button>
                      <button onClick={() => store.setGlobalSubtitleStyle({ outline: !store.globalSubtitleStyle.outline })}
                        className={`px-3 py-1.5 rounded text-xs transition-colors ${store.globalSubtitleStyle.outline ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}>O</button>
                    </div>
                  </div>
                </div>

                {/* Per-scene subtitles */}
                <div className="space-y-2">
                  {store.scenes.map((scene) => (
                    <div key={scene.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex gap-3 items-start">
                      <span className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">
                        {scene.order + 1}
                      </span>
                      <div className="flex-1">
                        <textarea
                          value={scene.subtitle}
                          onChange={(e) => store.updateScene(scene.id, { subtitle: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                          placeholder="자막 텍스트..."
                        />
                        <p className="text-[10px] text-gray-600 mt-1">{scene.duration}초</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transitions */}
            {store.subTab === 'transition' && (
              <div className="space-y-2">
                {store.scenes.map((scene) => (
                  <div key={scene.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {scene.order + 1}
                    </span>
                    <span className="text-xs text-gray-300 flex-1 truncate">{scene.narration || '(나레이션 없음)'}</span>
                    <select
                      value={scene.transition}
                      onChange={(e) => store.updateScene(scene.id, { transition: e.target.value })}
                      className="px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {TRANSITIONS.map((t) => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {/* Edit Points */}
            {store.subTab === 'edit-point' && (
              <div className="text-center py-12">
                <span className="text-4xl block mb-3">📍</span>
                <p className="text-sm text-gray-500">AI 편집포인트 매칭이 곧 추가됩니다</p>
                <p className="text-xs text-gray-600 mt-1">소스 영상과 대본을 매칭하여 최적의 편집점을 찾습니다</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatSrtTime(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const msPart = ms % 1000;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(msPart).padStart(3, '0')}`;
}
