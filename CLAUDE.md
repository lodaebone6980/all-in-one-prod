# All-In-One Production v5.0

## Project Overview
한국어 기반 AI 영상 제작 올인원 플랫폼. 기획/분석 -> 대본작성 -> 이미지/영상 생성 -> 편집 -> 업로드까지 전체 콘텐츠 제작 파이프라인을 커버한다.

## Tech Stack
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3
- **State Management**: Zustand
- **Animation**: Framer Motion
- **Notifications**: Sonner (toast)
- **Font**: Pretendard (Korean-optimized)
- **Storage**: IndexedDB (Dexie.js), localStorage
- **Deploy**: Cloudflare Pages
- **Theme**: Dark mode (gray-900 base)

## Project Structure
```
src/
  components/       # 공통 UI 컴포넌트
  features/         # 탭별 기능 모듈 (lazy-loaded)
    project/        # 프로젝트 관리
    channel-analysis/ # 채널/영상 분석
    script-writer/  # 대본작성 (AI)
    sound-studio/   # 사운드 스튜디오 (TTS)
    image-video/    # 이미지/영상 생성 (AI)
    edit-room/      # 편집실
    thumbnail-studio/ # 썸네일 스튜디오
    upload/         # 멀티플랫폼 업로드
    character-twist/ # 캐릭터 비틀기
    source-import/  # 소스 임포트
    ppt-master/     # PPT 마스터
    detail-page/    # 쇼핑콘텐츠
    subtitle-remover/ # 자막/워터마크 제거
    companion-banner/ # 컴패니언 배너
    view-alert/     # 조회수 알림
  stores/           # Zustand stores
  services/         # API 서비스 레이어
  hooks/            # 커스텀 React hooks
  utils/            # 유틸리티 함수
  types/            # TypeScript 타입 정의
  styles/           # 글로벌 스타일
  assets/           # 정적 자산
```

## Coding Conventions
- 한국어 UI, 영어 코드
- 컴포넌트: PascalCase, 파일: kebab-case
- Zustand store는 `use[Name]Store` 네이밍
- 각 feature는 lazy-loaded (React.lazy + Suspense)
- API 키는 설정 패널에서 관리, 코드에 하드코딩 금지
- 모든 API 호출은 services/ 레이어를 통해
- 비용 추적: USD 기준 실시간 계산

## Key Commands
```bash
npm run dev       # 개발 서버
npm run build     # 프로덕션 빌드
npm run preview   # 빌드 미리보기
```

## Implementation Priority
1. Phase 1: 프로젝트 구조 + 네비게이션 + 설정
2. Phase 2: 프로젝트 관리 + 채널분석
3. Phase 3: 대본작성 (AI) + 사운드 스튜디오
4. Phase 4: 이미지/영상 생성 + 편집실
5. Phase 5: 썸네일 + 업로드 + 나머지 기능
