import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useProjectStore } from '../../stores/use-project-store';
import type { Project } from '../../types';

export default function ProjectTab() {
  const {
    projects, selectedIds, searchQuery, loading,
    setSearchQuery, toggleSelect, selectAll, clearSelection,
    loadProjects, addProject, updateProject, deleteProjects,
  } = useProjectStore();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await addProject({ name: newName.trim(), description: newDesc.trim(), data: {} });
    setNewName('');
    setNewDesc('');
    setShowNewDialog(false);
    toast.success('프로젝트가 생성되었습니다');
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    await deleteProjects([...selectedIds]);
    toast.success(`${selectedIds.size}개 프로젝트가 삭제되었습니다`);
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) return;
    await updateProject(id, { name: editName.trim() });
    setEditingId(null);
    toast.success('이름이 변경되었습니다');
  };

  const handleExportZip = async () => {
    const data = JSON.stringify(projects, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aio-projects-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('프로젝트를 내보냈습니다');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.zip';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text) as Project[];
        for (const p of data) {
          await addProject({ name: p.name, description: p.description, data: p.data });
        }
        toast.success(`${data.length}개 프로젝트를 가져왔습니다`);
      } catch {
        toast.error('파일을 읽을 수 없습니다');
      }
    };
    input.click();
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📁</span> 프로젝트
            </h2>
            <p className="text-sm text-gray-400 mt-1">프로젝트를 생성하고 관리하세요</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleImport}
              className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
            >
              📥 가져오기
            </button>
            <button
              onClick={handleExportZip}
              className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
            >
              📤 내보내기
            </button>
            <button
              onClick={() => setShowNewDialog(true)}
              className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium"
            >
              + 새 프로젝트
            </button>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="프로젝트 검색..."
              className="w-full px-4 py-2 pl-9 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
          </div>
          {selectedIds.size > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{selectedIds.size}개 선택</span>
              <button onClick={selectAll} className="px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors">전체선택</button>
              <button onClick={clearSelection} className="px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors">선택해제</button>
              <button onClick={handleDelete} className="px-2 py-1 text-xs text-red-400 hover:text-red-300 transition-colors">삭제</button>
            </motion.div>
          )}
        </div>

        {/* Project Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <span className="text-4xl mb-3 block">📁</span>
            <p className="text-gray-400 text-sm mb-4">
              {searchQuery ? '검색 결과가 없습니다' : '프로젝트가 없습니다'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowNewDialog(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors"
              >
                첫 프로젝트 만들기
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group bg-gray-900 border rounded-xl p-4 cursor-pointer transition-all hover:border-gray-700 ${
                    selectedIds.has(project.id) ? 'border-indigo-500 bg-indigo-600/5' : 'border-gray-800'
                  }`}
                  onClick={() => toggleSelect(project.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    {editingId === project.id ? (
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRename(project.id); if (e.key === 'Escape') setEditingId(null); }}
                        onBlur={() => handleRename(project.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500 w-full"
                      />
                    ) : (
                      <h3 className="text-sm font-semibold text-white truncate flex-1">{project.name}</h3>
                    )}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingId(project.id); setEditName(project.name); }}
                        className="p-1 text-gray-500 hover:text-white rounded transition-colors text-xs"
                        title="이름 변경"
                      >✏️</button>
                    </div>
                  </div>
                  {project.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{project.description}</p>
                  )}
                  <div className="flex items-center justify-between text-[10px] text-gray-600">
                    <span>{new Date(project.createdAt).toLocaleDateString('ko-KR')}</span>
                    <span>{new Date(project.updatedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* New Project Dialog */}
      <AnimatePresence>
        {showNewDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowNewDialog(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] max-w-[90vw] bg-gray-900 border border-gray-800 rounded-xl p-6 z-50 shadow-2xl"
            >
              <h3 className="text-base font-semibold text-white mb-4">새 프로젝트</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">프로젝트 이름</label>
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
                    placeholder="프로젝트 이름을 입력하세요"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">설명 (선택)</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="프로젝트에 대한 간단한 설명"
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={() => setShowNewDialog(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >취소</button>
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                >생성</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
