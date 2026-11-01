/**
 * BL 인터랙티브 픽션 게임 상태 관리
 * 흥분도, 관계 마일스톤, 이벤트 추적
 *
 * 2026-09: 호감도(affectionGong/affectionSu) 숫자 점수 시스템을 폐지했다.
 * 이유: (1) 엔딩 시스템이 전적으로 이 점수에 기댔는데 실제로 쓰이는 엔딩이
 * 없었고, (2) 점수가 올라가도 캐릭터의 스탠스/대사/행동이 실제로 달라지지
 * 않는 게 가장 큰 문제였다 - 매 턴 추상적인 숫자를 프롬프트에 다시 설명하는
 * 방식이 LLM에게 잘 들러붙지 않았던 것으로 보인다. 대신 "관계 마일스톤"
 * (통성명함, 사귀기로 함 등 실제로 일어난 사건)을 하나의 정수 인덱스로 누적
 * 추적하고, 그 마일스톤이 호칭 시스템과 태도 변화 규칙에 그대로 쓰인다 -
 * Promptbuilder.js의 getCallingSystem/getRelationshipRules 참고.
 */

// ============================================
// 초기 상태
// ============================================

export const INITIAL_GAME_STATE = {
  excitement: 0,
  relationshipMilestoneIndex: 0,
  currentTurn: 1,
  triggeredKeywords: [],
  triggeredEvents: [],
  badChoiceCount: 0,
  currentScene: {
    time: null,
    location: null,
    charAState: null,
    charBState: null
  },
  history: []
};

// ============================================
// 흥분도 업데이트
// ============================================

// 0~100 범위로 값을 자르는 공용 헬퍼 (흥분도 등에 사용)
function clampScore(currentValue, change, min = 0, max = 100) {
  const newValue = currentValue + change;
  return Math.max(min, Math.min(max, newValue));
}

export function updateExcitement(state, change) {
  const newExcitement = clampScore(state.excitement, change, 0, 100);
  return {
    ...state,
    excitement: newExcitement
  };
}

export function getExcitementLevel(excitement) {
  if (excitement <= 20) return { level: 1, name: '평온', description: '평온한 상태' };
  if (excitement <= 40) return { level: 2, name: '긴장', description: '은근한 긴장' };
  if (excitement <= 60) return { level: 3, name: '의식', description: '서로를 의식하기 시작' };
  if (excitement <= 80) return { level: 4, name: '욕망', description: '뚜렷한 욕망' };
  if (excitement <= 95) return { level: 5, name: '절정 직전', description: '절정 직전' };
  return { level: 6, name: '완전한 흥분', description: '완전한 흥분 상태' };
}

// ============================================
// 관계 마일스톤 (호감도 점수를 대체)
// ============================================

// 마일스톤 인덱스는 절대 뒤로 가지 않는다 (관계가 깊어지는 순서를 나타내는
// 하나의 정수 포인터) - AI가 실수로 더 낮은 인덱스를 보고해도 Math.max로 방어.
export function advanceMilestone(state, newIndex) {
  if (typeof newIndex !== 'number' || Number.isNaN(newIndex)) return state;
  return {
    ...state,
    relationshipMilestoneIndex: Math.max(state.relationshipMilestoneIndex || 0, newIndex)
  };
}

// AI가 응답에 적어 보낸 마일스톤 문구(new_milestone)를, 이 스토리의 마일스톤
// 후보 목록(candidates, Promptbuilder.getMilestoneCandidates 결과)에서 찾아
// 그 위치(1부터 시작하는 인덱스)로 변환한다. 못 찾으면 null.
export function resolveMilestoneIndex(newMilestoneText, candidates) {
  if (!newMilestoneText || !Array.isArray(candidates)) return null;
  const idx = candidates.findIndex((c) => c === newMilestoneText);
  return idx === -1 ? null : idx + 1;
}

// ============================================
// 키워드 추적
// ============================================

export function trackKeyword(state, keyword, type = 'general') {
  const key = `${type}:${keyword}`;
  
  if (state.triggeredKeywords.includes(key)) {
    return state; // 이미 추적 중
  }
  
  return {
    ...state,
    triggeredKeywords: [...state.triggeredKeywords, key]
  };
}

export function trackKeywords(state, keywords, type = 'general') {
  let newState = state;
  keywords.forEach(kw => {
    newState = trackKeyword(newState, kw, type);
  });
  return newState;
}

// 텍스트에서 엔딩 관련 키워드 추출
export function extractEndingKeywords(text, endings) {
  const result = {
    true: [],
    hidden: [],
    bad: []
  };
  
  const textLower = text.toLowerCase();

  // 트루 엔딩 키워드
  if (endings?.true?.requiredKeywords) {
    endings.true.requiredKeywords.forEach(kw => {
      if (textLower.includes(kw.toLowerCase())) {
        result.true.push(kw);
      }
    });
  }

  // 히든 엔딩 키워드
  if (endings?.hidden?.requiredKeywords) {
    endings.hidden.requiredKeywords.forEach(kw => {
      if (textLower.includes(kw.toLowerCase())) {
        result.hidden.push(kw);
      }
    });
  }

  // 배드 엔딩 키워드
  if (endings?.bad?.badKeywords) {
    endings.bad.badKeywords.forEach(kw => {
      if (textLower.includes(kw.toLowerCase())) {
        result.bad.push(kw);
      }
    });
  }

  return result;
}

// ============================================
// 이벤트 추적
// ============================================

export function trackEvent(state, eventId, data = {}) {
  const event = {
    id: eventId,
    turn: state.currentTurn,
    timestamp: Date.now(),
    ...data
  };
  
  return {
    ...state,
    triggeredEvents: [...state.triggeredEvents, event]
  };
}

export function hasEventTriggered(state, eventId) {
  return state.triggeredEvents.some(e => e.id === eventId);
}

// ============================================
// 배드 선택 카운트
// ============================================

export function incrementBadChoice(state) {
  return {
    ...state,
    badChoiceCount: state.badChoiceCount + 1
  };
}

// ============================================
// 턴 증가
// ============================================

export function incrementTurn(state) {
  return {
    ...state,
    currentTurn: state.currentTurn + 1
  };
}

// ============================================
// 씬 업데이트
// ============================================

export function updateScene(state, sceneData) {
  return {
    ...state,
    currentScene: {
      ...state.currentScene,
      ...sceneData
    }
  };
}

// ============================================
// 히스토리 추가
// ============================================

export function addToHistory(state, entry) {
  return {
    ...state,
    history: [
      ...state.history,
      {
        turn: state.currentTurn,
        timestamp: Date.now(),
        ...entry
      }
    ]
  };
}

// ============================================
// 마일스톤 분기점 알림
// ============================================

// 마일스톤 인덱스가 실제로 전진했을 때만 분기 알림을 띄운다 (예전엔 호감도
// 25/50/75/90% 퍼센트 구간을 넘을 때였지만, 이제는 실제 사건 단위로 트리거됨)
export function checkBranchPoint(prevIndex, newIndex, milestoneText) {
  if (newIndex > prevIndex) {
    return {
      reached: true,
      message: `💫 관계가 새로운 단계로 접어들었습니다${milestoneText ? `: ${milestoneText}` : ''}`
    };
  }
  return { reached: false };
}

// ============================================
// 상태 요약
// ============================================

export function getStateSummary(state) {
  const excitementLevel = getExcitementLevel(state.excitement);

  return {
    turn: state.currentTurn,
    excitement: state.excitement,
    excitementLevel,
    relationshipMilestoneIndex: state.relationshipMilestoneIndex,
    badChoiceCount: state.badChoiceCount,
    keywordsCount: state.triggeredKeywords.length,
    eventsCount: state.triggeredEvents.length
  };
}

// ============================================
// 전체 상태 업데이트 (한 번에)
// ============================================

// milestoneCandidates: Promptbuilder.getMilestoneCandidates(story)의 결과 -
// AI가 돌려준 new_milestone 문구를 인덱스로 바꾸는 데 필요하다
export function applyResponseToState(state, parsedResponse, milestoneCandidates = []) {
  let newState = { ...state };

  // 1. 흥분도 업데이트
  if (parsedResponse.scores) {
    newState = updateExcitement(newState, parsedResponse.scores.excitementChange);
  }

  // 2. 관계 마일스톤 갱신
  const resolvedIndex = resolveMilestoneIndex(parsedResponse.newMilestone, milestoneCandidates);
  if (resolvedIndex !== null) {
    newState = advanceMilestone(newState, resolvedIndex);
  }

  // 3. 키워드 추적
  if (parsedResponse.triggeredKeywords && parsedResponse.triggeredKeywords.length > 0) {
    newState = trackKeywords(newState, parsedResponse.triggeredKeywords, 'ai');
  }

  // 4. 씬 업데이트
  if (parsedResponse.meta) {
    newState = updateScene(newState, parsedResponse.meta);
  }

  // 5. 턴 증가
  newState = incrementTurn(newState);

  // 6. 히스토리 추가
  newState = addToHistory(newState, {
    type: 'ai_response',
    scores: parsedResponse.scores,
    milestone: parsedResponse.newMilestone,
    keywords: parsedResponse.triggeredKeywords
  });

  return newState;
}

export default {
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
};
