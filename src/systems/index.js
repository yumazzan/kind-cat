/**
 * BL 인터랙티브 픽션 시스템 모듈
 * 통합 내보내기
 */

// 시스템 프롬프트 빌더
export {
  buildSystemPrompt,
  estimateTokens,
  generatePromptPreview,
  getMilestoneCandidates
} from './Promptbuilder';

// AI 응답 파서
export {
  parseAIResponse,
  formatMetaInfo,
  formatDialogues,
  formatFullResponse
} from './Responseparser';

// 게임 상태 관리 (2026-09: 호감도 점수 폐지, 관계 마일스톤 인덱스로 대체 -
// Gamestate.js 상단 주석 참고)
export {
  INITIAL_GAME_STATE,
  updateExcitement,
  getExcitementLevel,
  advanceMilestone,
  resolveMilestoneIndex,
  trackKeyword,
  trackKeywords,
  extractEndingKeywords,
  trackEvent,
  hasEventTriggered,
  incrementBadChoice,
  incrementTurn,
  updateScene,
  addToHistory,
  checkBranchPoint,
  getStateSummary,
  applyResponseToState
} from './Gamestate';

// 진행 상황 저장/불러오기
export {
  saveProgress,
  loadProgress,
  clearProgress,
  hasProgress
} from './SaveProgress';

// 엔딩 시스템(Endingsystem.js)은 2026-09부로 실제 흐름에서 더 이상 쓰이지
// 않음 (호감도 점수 기반 자동 엔딩 트리거를 폐지) - 파일은 남겨두되 barrel
// export에서는 제외함