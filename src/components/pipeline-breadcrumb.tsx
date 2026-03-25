import { useAppStore } from '../stores/use-app-store';
import { PIPELINE_STEPS, isPipelineTab } from '../utils/tab-config';
import type { TabId } from '../types';

export function PipelineBreadcrumb() {
  const { activeTab, setActiveTab } = useAppStore();

  if (!isPipelineTab(activeTab)) return null;

  const currentIdx = PIPELINE_STEPS.findIndex((s) => s.id === activeTab);

  return (
    <div className="mb-6 flex items-center gap-1 overflow-x-auto pb-2">
      {PIPELINE_STEPS.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isActive = idx === currentIdx;
        const isFuture = idx > currentIdx;

        return (
          <div key={step.id} className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setActiveTab(step.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : isCompleted
                  ? 'text-green-400/80 hover:text-green-300'
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {isCompleted && <span className="text-green-400">✓</span>}
              <span>{step.label}</span>
            </button>
            {idx < PIPELINE_STEPS.length - 1 && (
              <div className={`h-px w-6 max-w-[40px] ${
                isCompleted ? 'bg-green-500/50' : isActive ? 'bg-blue-500/50' : 'bg-gray-700'
              }`} />
            )}
          </div>
        );
      })}

      {/* Back button */}
      {currentIdx > 0 && (
        <button
          onClick={() => setActiveTab(PIPELINE_STEPS[currentIdx - 1].id)}
          className="ml-4 text-xs text-gray-500 hover:text-gray-300 transition-colors shrink-0"
        >
          ← 이전 단계: {PIPELINE_STEPS[currentIdx - 1].label}
        </button>
      )}
    </div>
  );
}
