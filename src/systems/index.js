/**
 * BL 인터랙티브 픽션 시스템 모듈
 * 통합 내보내기
 */

// 시스템 프롬프트 빌더
export { 
  buildSystemPrompt,
  estimateTokens,
  generatePromptPreview
} from './promptBuilder';

// AI 응답 파서
export { 
  parseAIResponse,
  formatMetaInfo,
  formatDialogues,
  formatFullResponse
} from './Responseparser';

// 게임 상태 관리
export {
  INITIAL_GAME_STATE,
  updateAffection,
  updateAffectionGong,
  updateAffectionSu,
  updateExcitement,
  getExcitementLevel,
  getRelationshipStage,
  checkPacingViolation,
  detectActionType,
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

// 엔딩 시스템
export {
  ENDING_TYPES,
  ENDING_STYLES,
  checkEndingCondition,
  shouldTriggerEnding,
  getEndingData,
  getBranchPointMessage,
  calculateEndingProgress,
  generateEndingHint
} from './Endingsystem';