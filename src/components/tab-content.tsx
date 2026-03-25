import { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../stores/use-app-store';
import { PipelineBreadcrumb } from './pipeline-breadcrumb';
import type { TabId } from '../types';

// Lazy-loaded feature modules
const ProjectTab = lazy(() => import('../features/project/project-tab'));
const ChannelAnalysisTab = lazy(() => import('../features/channel-analysis/channel-analysis-tab'));
const ScriptWriterTab = lazy(() => import('../features/script-writer/script-writer-tab'));
const SoundStudioTab = lazy(() => import('../features/sound-studio/sound-studio-tab'));
const ImageVideoTab = lazy(() => import('../features/image-video/image-video-tab'));
const EditRoomTab = lazy(() => import('../features/edit-room/edit-room-tab'));
const ThumbnailStudioTab = lazy(() => import('../features/thumbnail-studio/thumbnail-studio-tab'));
const UploadTab = lazy(() => import('../features/upload/upload-tab'));
const CharacterTwistTab = lazy(() => import('../features/character-twist/character-twist-tab'));
const SourceImportTab = lazy(() => import('../features/source-import/source-import-tab'));
const PptMasterTab = lazy(() => import('../features/ppt-master/ppt-master-tab'));
const DetailPageTab = lazy(() => import('../features/detail-page/detail-page-tab'));
const SubtitleRemoverTab = lazy(() => import('../features/subtitle-remover/subtitle-remover-tab'));
const CompanionBannerTab = lazy(() => import('../features/companion-banner/companion-banner-tab'));
const ViewAlertTab = lazy(() => import('../features/view-alert/view-alert-tab'));

const TAB_COMPONENTS: Record<TabId, React.LazyExoticComponent<() => React.ReactElement>> = {
  'project': ProjectTab,
  'channel-analysis': ChannelAnalysisTab,
  'script-writer': ScriptWriterTab,
  'sound-studio': SoundStudioTab,
  'image-video': ImageVideoTab,
  'edit-room': EditRoomTab,
  'thumbnail-studio': ThumbnailStudioTab,
  'upload': UploadTab,
  'character-twist': CharacterTwistTab,
  'source-import': SourceImportTab,
  'ppt-master': PptMasterTab,
  'detail-page': DetailPageTab,
  'subtitle-remover': SubtitleRemoverTab,
  'companion-banner': CompanionBannerTab,
  'view-alert': ViewAlertTab,
};

function TabLoading() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-500">로딩 중...</span>
      </div>
    </div>
  );
}

export function TabContent() {
  const activeTab = useAppStore((s) => s.activeTab);
  const Component = TAB_COMPONENTS[activeTab];

  return (
    <main className="ml-[15.5rem] mt-16 flex-1 pb-12 px-8 overflow-y-auto h-[calc(100vh-4rem)]">
      <div className="pt-6">
        <PipelineBreadcrumb />
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            <Suspense fallback={<TabLoading />}>
              <Component />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
