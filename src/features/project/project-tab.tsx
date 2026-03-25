import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useProjectStore } from '../../stores/use-project-store';
import { useAppStore } from '../../stores/use-app-store';
import type { Project } from '../../types';

type SortKey = 'date' | 'name' | 'progress';
type ViewMode = 'grid' | 'list';
type CardSize = 'sm' | 'md' | 'lg';

const QUOTES = [
  '아이디어는 실행할 때 비로소 가치를 갖습니다',
  '콘텐츠의 차이는 디테일에서 결정됩니다',
  '좋은 영상은 좋은 대본에서 시작됩니다',
  '매일 1%씩 성장하면 1년 후 37배가 됩니다',
  '시작이 반이다 — 오늘 첫 프로젝트를 만들어보세요',
];

const PIPELINE_STEPS = [
  { key: 'channelAnalysis', icon: '🔍', label: '분석' },
  { key: 'scriptWriting', icon: '✍️', label: '대본' },
  { key: 'soundStudio', icon: '🎵', label: '사운드' },
  { key: 'imageVideo', icon: '🎬', label: '영상' },
  { key: 'editRoom', icon: '✂️', label: '편집' },
  { key: 'upload', icon: '📤', label: '업로드' },
];

const PER_PAGE = 20;

export default function ProjectTab() {
  const { projects, selectedIds, searchQuery, loading, setSearchQuery, toggleSelect, selectAll, clearSelection, loadProjects, addProject, deleteProjects } = useProjectStore();
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [cardSize, setCardSize] = useState<CardSize>('md');
  const [page, setPage] = useState(0);
  const [quoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const filtered = useMemo(() => {
    let list = projects;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    list = [...list].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      return b.updatedAt - a.updatedAt; // date (default) & progress
    });
    return list;
  }, [projects, searchQuery, sortKey]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const handleCreate = async () => {
    const name = newName.trim() || `새 프로젝트 ${projects.length + 1}`;
    await addProject({ name, description: '', data: {} });
    setNewName('');
    setShowNewDialog(false);
    toast.success('프로젝트가 생성되었습니다');
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    await deleteProjects([...selectedIds]);
    toast.success(`${selectedIds.size}개 프로젝트가 삭제되었습니다`);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.html,.zip,.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text) as Project[];
        for (const p of data) await addProject({ name: p.name, description: p.description, data: p.data });
        toast.success(`${data.length}개 프로젝트를 가져왔습니다`);
      } catch { toast.error('파일을 읽을 수 없습니다'); }
    };
    input.click();
  };

  const handleExportSelected = () => {
    const selected = projects.filter((p) => selectedIds.has(p.id));
    if (selected.length === 0) return;
    const blob = new Blob([JSON.stringify(selected, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `projects-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`${selected.length}개 프로젝트를 내보냈습니다`);
  };

  const gridCols = cardSize === 'sm' ? 'grid-cols-3 sm:grid-cols-4 xl:grid-cols-6' :
    cardSize === 'md' ? 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4' :
    'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3';

  const relativeTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return '방금 전';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
    return `${Math.floor(diff / 86400000)}일 전`;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Title + Quote */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">모든 프로젝트</h1>
        <p className="text-sm italic text-gray-300 mt-1">{QUOTES[quoteIdx]}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="px-2 py-0.5 bg-green-600/20 text-green-400 rounded text-xs font-medium">콘텐츠</span>
          <span className="text-xs text-gray-500">총 {projects.length}개의 프로젝트</span>
        </div>
      </div>

      {/* Search + Actions */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="프로젝트 검색..." className="max-w-md flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        <button onClick={handleImport} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-xs text-gray-300 transition-colors">
          📥 불러오기
        </button>
        <button onClick={() => setShowNewDialog(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors font-medium">
          + 새 프로젝트 만들기
        </button>
      </div>

      {/* Sort / Bulk / View / Size */}
      <div className="flex items-center gap-2 mb-4 flex-wrap text-xs">
        {/* Sort */}
        {(['date', 'name', 'progress'] as SortKey[]).map((k) => (
          <button key={k} onClick={() => setSortKey(k)}
            className={`px-2.5 py-1.5 rounded-lg border transition-colors ${sortKey === k ? 'border-blue-500 bg-blue-600/20 text-blue-400' : 'border-gray-700 text-gray-400 hover:text-white'}`}>
            {{ date: '수정일', name: '이름', progress: '진행도' }[k]}
          </button>
        ))}

        <span className="w-px h-5 bg-gray-700 mx-1" />

        {/* Bulk */}
        <button onClick={selectedIds.size === projects.length ? clearSelection : selectAll}
          className="px-2.5 py-1.5 border border-gray-700 text-gray-400 rounded-lg hover:text-white transition-colors">
          {selectedIds.size === projects.length ? '전체 해제' : '전체 선택'}
        </button>
        <button onClick={handleExportSelected} disabled={selectedIds.size === 0}
          className="px-2.5 py-1.5 border border-gray-700 text-gray-400 rounded-lg hover:text-white disabled:opacity-30 transition-colors">
          📦 선택 내보내기 ({selectedIds.size})
        </button>
        <button onClick={handleDelete} disabled={selectedIds.size === 0}
          className="px-2.5 py-1.5 border border-gray-700 text-red-400 rounded-lg hover:text-red-300 disabled:opacity-30 transition-colors">
          🗑️ 선택 삭제 ({selectedIds.size})
        </button>

        <span className="w-px h-5 bg-gray-700 mx-1" />

        {/* View mode */}
        <button onClick={() => setViewMode('grid')}
          className={`px-2 py-1.5 rounded border transition-colors ${viewMode === 'grid' ? 'border-blue-500 text-blue-400' : 'border-gray-700 text-gray-500'}`}>
          ▦
        </button>
        <button onClick={() => setViewMode('list')}
          className={`px-2 py-1.5 rounded border transition-colors ${viewMode === 'list' ? 'border-blue-500 text-blue-400' : 'border-gray-700 text-gray-500'}`}>
          ☰
        </button>

        {/* Card size */}
        <span className="text-gray-500 ml-2">Size:</span>
        {(['sm', 'md', 'lg'] as CardSize[]).map((s) => (
          <button key={s} onClick={() => setCardSize(s)}
            className={`px-2 py-1 rounded border transition-colors ${cardSize === s ? 'border-blue-500 text-blue-400' : 'border-gray-700 text-gray-500'}`}>
            {{ sm: '소', md: '중', lg: '대' }[s]}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-2">프로젝트가 없습니다</p>
          <p className="text-sm mb-3">새 프로젝트를 만들어 시작하세요</p>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 max-w-md mx-auto text-left text-xs text-gray-400 space-y-1">
            <p className="text-sm text-gray-300 font-medium mb-2">이 앱으로 할 수 있는 것:</p>
            <p>1. 채널분석: YouTube 채널 스타일을 AI로 역설계합니다</p>
            <p>2. 대본작성: AI가 영상 대본을 자동 생성합니다</p>
            <p>3. 장면/이미지: 대본을 장면으로 분할하고 이미지를 생성합니다</p>
            <p>4. 사운드: 나레이션(TTS)과 BGM을 만듭니다</p>
            <p>5. 편집실: 이미지 효과, 자막, 타임라인을 편집합니다</p>
            <p>6. 업로드: 완성된 영상을 YouTube에 바로 업로드합니다</p>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className={`grid ${gridCols} gap-3`}>
          <AnimatePresence mode="popLayout">
            {paged.map((project) => (
              <motion.div key={project.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className={`group bg-gray-800 rounded-xl border overflow-hidden cursor-pointer transition-all hover:border-gray-600 ${selectedIds.has(project.id) ? 'border-blue-500 ring-1 ring-blue-500/30' : 'border-gray-700'}`}
                onClick={() => toggleSelect(project.id)}
                onDoubleClick={() => setActiveTab('script-writer')}>
                {/* Header bar */}
                <div className="px-2 py-1.5 bg-gray-900/60 border-b border-gray-700/50 flex items-center gap-1.5 text-[10px] text-gray-500">
                  <span className="px-1.5 py-0.5 bg-gray-700/50 rounded">대본</span>
                  <span className="px-1.5 py-0.5 bg-gray-700/50 rounded">가로</span>
                  <span className="ml-auto">{(project.data as any)?.sceneCount || 0}컷</span>
                  <input type="checkbox" checked={selectedIds.has(project.id)} onChange={() => {}} className="ml-1 accent-blue-500" onClick={(e) => e.stopPropagation()} />
                </div>
                {/* Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 relative flex items-center justify-center">
                  <div className="flex gap-1.5 text-xs text-gray-600">
                    {PIPELINE_STEPS.map((s) => (<span key={s.key} title={s.label}>{s.icon}</span>))}
                  </div>
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900/50">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500" style={{ width: '0%' }} />
                  </div>
                </div>
                {/* Info */}
                <div className="p-3">
                  <h3 className="text-sm font-bold text-white truncate mb-1">{project.name}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <span>{relativeTime(project.updatedAt)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="space-y-2">
          {paged.map((project) => (
            <div key={project.id} onClick={() => toggleSelect(project.id)}
              className={`flex items-center gap-4 bg-gray-800 rounded-lg border px-4 py-3 cursor-pointer transition-all hover:border-gray-600 ${selectedIds.has(project.id) ? 'border-blue-500' : 'border-gray-700'}`}>
              <input type="checkbox" checked={selectedIds.has(project.id)} onChange={() => {}} className="accent-blue-500" />
              <div className="w-20 h-12 rounded bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-[10px] text-gray-600">
                {PIPELINE_STEPS.map((s) => s.icon).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{project.name}</h3>
                <span className="text-[11px] text-gray-500">{relativeTime(project.updatedAt)}</span>
              </div>
              <span className="text-blue-400 font-bold text-sm">0%</span>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
            className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-400 disabled:opacity-30">이전</button>
          <span className="text-xs text-gray-500">Page {page + 1} / {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
            className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-400 disabled:opacity-30">다음</button>
        </div>
      )}

      {/* New Project Modal */}
      <AnimatePresence>
        {showNewDialog && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowNewDialog(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] max-w-[90vw] bg-gray-900 border border-gray-800 rounded-xl p-6 z-50 shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-1">새 프로젝트</h2>
              <p className="text-sm text-gray-400 mb-4">프로젝트 이름을 입력하세요</p>
              <label className="block text-xs text-gray-400 mb-1">프로젝트 이름</label>
              <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder={`새 프로젝트 ${projects.length + 1}`}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-4" />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowNewDialog(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">취소</button>
                <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg font-medium">+ 생성하기</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
