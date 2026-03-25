import { toast } from 'sonner';

export default function StoryboardPanel() {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
        <span className="text-4xl block mb-3">🎬</span>
        <h3 className="text-base font-semibold text-white mb-2">스토리보드</h3>
        <p className="text-sm text-gray-500 mb-4">대본작성 탭에서 대본을 생성하고 단락 나누기를 실행하면 장면이 여기에 표시됩니다.</p>
        <div className="flex flex-wrap gap-2 justify-center">
          <button className="px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 text-orange-300 text-xs rounded-lg transition-colors">
            AI 프롬프트 생성
          </button>
          <button className="px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 text-orange-300 text-xs rounded-lg transition-colors">
            이미지 일괄 생성
          </button>
          <button className="px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 text-orange-300 text-xs rounded-lg transition-colors">
            영상 일괄 생성
          </button>
        </div>
        <p className="text-[10px] text-gray-600 mt-4">배치 생성 중에도 완료된 장면은 바로 확인할 수 있어요</p>
      </div>
    </div>
  );
}
