/**
 * BL 인터랙티브 픽션 게임 상태 관리
 * 호감도, 흥분도, 이벤트 추적
 */

// ============================================
// 초기 상태
// ============================================

export const INITIAL_GAME_STATE = {
  affectionGong: 0,
  affectionSu: 0,
  excitement: 0,
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
// 호감도 업데이트
// ============================================

export function updateAffection(currentValue, change, min = 0, max = 100) {
  const newValue = currentValue + change;
  return Math.max(min, Math.min(max, newValue));
}

export function updateAffectionGong(state, change) {
  return {
    ...state,
    affectionGong: updateAffection(state.affectionGong, change)
  };
}

export function updateAffectionSu(state, change) {
  return {
    ...state,
    affectionSu: updateAffection(state.affectionSu, change)
  };
}

// ============================================
// 흥분도 업데이트
// ============================================

export function updateExcitement(state, change) {
  const newExcitement = updateAffection(state.excitement, change, 0, 100);
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
// 관계 단계
// ============================================

export function getRelationshipStage(avgAffection) {
  if (avgAffection <= 20) {
    return {
      stage: 1,
      name: '완전한 타인',
      allowedActions: ['대화'],
      forbiddenActions: ['모든 신체 접촉', '사적인 질문'],
      skinshipPenalty: -8
    };
  }
  if (avgAffection <= 40) {
    return {
      stage: 2,
      name: '경계하는 지인',
      allowedActions: ['짧은 대화', '우연한 스킨십'],
      forbiddenActions: ['의도적 터치', '개인적 질문'],
      skinshipPenalty: -5
    };
  }
  if (avgAffection <= 60) {
    return {
      stage: 3,
      name: '은근한 관심',
      allowedActions: ['어깨 터치', '짧은 포옹', '가벼운 터치', '개인적 대화'],
      forbiddenActions: ['키스', '고백'],
      skinshipPenalty: -7
    };
  }
  if (avgAffection <= 80) {
    return {
      stage: 4,
      name: '인정하기 시작',
      allowedActions: ['손잡기', '이마 키스', '안아주기', '팔짱', '머리 쓰다듬기'],
      forbiddenActions: ['격렬한 스킨십'],
      skinshipPenalty: 0
    };
  }
  if (avgAffection <= 95) {
    return {
      stage: 5,
      name: '솔직한 애정',
      allowedActions: ['키스', '깊은 스킨십', '애정 표현'],
      forbiddenActions: [],
      skinshipPenalty: 0
    };
  }
  return {
    stage: 6,
    name: '완전한 신뢰',
    allowedActions: ['모든 친밀 행동', '고수위 씬'],
    forbiddenActions: [],
    skinshipPenalty: 0
  };
}

// ============================================
// 페이싱 위반 체크
// ============================================

const ACTION_REQUIREMENTS = {
  // 스킨십 단계별 요구 호감도
  'hand_hold': 40,       // 손잡기
  'shoulder_touch': 30,  // 어깨 터치
  'hug': 50,             // 포옹
  'forehead_kiss': 60,   // 이마 키스
  'kiss': 70,            // 키스
  'deep_kiss': 75,       // 깊은 키스
  'confession': 65,      // 고백
  'adult_light': 80,     // 가벼운 성적 접촉
  'adult_heavy': 90,     // 깊은 성적 접촉
  'adult_full': 95       // 고수위 씬
};

export function checkPacingViolation(action, state) {
  const { affectionGong, affectionSu } = state;
  const avgAffection = Math.floor((affectionGong + affectionSu) / 2);
  
  const required = ACTION_REQUIREMENTS[action];
  
  if (required === undefined) {
    // 정의되지 않은 행동은 허용
    return { violation: false };
  }
  
  if (avgAffection < required) {
    return {
      violation: true,
      action,
      required,
      current: avgAffection,
      message: `이 행동은 호감도 ${required}점 이상 필요합니다. (현재: ${avgAffection}점)`,
      penaltyRange: [-5, -10]
    };
  }
  
  return { violation: false };
}

// 행동 키워드로 액션 타입 추출
export function detectActionType(userInput) {
  const input = userInput.toLowerCase();
  
  const actionKeywords = {
    'hand_hold': ['손잡', '손을 잡', '손 잡'],
    'shoulder_touch': ['어깨', '팔 터치', '팔을 터치'],
    'hug': ['안아', '포옹', '껴안', '안기'],
    'forehead_kiss': ['이마 키스', '이마에 키스', '이마에 입맞'],
    'kiss': ['키스', '입맞춤', '입술'],
    'deep_kiss': ['깊은 키스', '혀를', '딥키스'],
    'confession': ['고백', '좋아해', '사랑해'],
    'adult_light': ['만지', '쓰다듬', '어루만'],
    'adult_heavy': ['벗기', '옷을', '애무'],
    'adult_full': ['삽입', '박아', '넣어']
  };

  for (const [action, keywords] of Object.entries(actionKeywords)) {
    if (keywords.some(kw => input.includes(kw))) {
      return action;
    }
  }
  
  return null;
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
// 분기점 체크
// ============================================

export function checkBranchPoint(prevAvg, currentAvg) {
  const branchPoints = [25, 50, 75, 90];
  
  for (const point of branchPoints) {
    if (prevAvg < point && currentAvg >= point) {
      return {
        reached: true,
        point,
        message: getBranchMessage(point)
      };
    }
  }
  
  return { reached: false };
}

function getBranchMessage(point) {
  const messages = {
    25: '💫 첫 번째 분기점 도달! 관계가 움직이기 시작합니다.',
    50: '💕 두 번째 분기점! 서로를 의식하기 시작합니다.',
    75: '❤️ 세 번째 분기점! 감정이 깊어지고 있습니다.',
    90: '🔥 최종 분기점! 엔딩이 결정됩니다.'
  };
  return messages[point];
}

// ============================================
// 상태 요약
// ============================================

export function getStateSummary(state) {
  const avgAffection = Math.floor((state.affectionGong + state.affectionSu) / 2);
  const relationshipStage = getRelationshipStage(avgAffection);
  const excitementLevel = getExcitementLevel(state.excitement);
  
  let endingPath = '미정';
  if (avgAffection >= 90 && state.badChoiceCount <= 1) {
    endingPath = '트루 엔딩 루트';
  } else if (avgAffection >= 70) {
    endingPath = '굿/노멀 엔딩 루트';
  } else if (avgAffection >= 50) {
    endingPath = '노멀 엔딩 루트';
  } else if (avgAffection < 50 || state.badChoiceCount >= 4) {
    endingPath = '배드 엔딩 위험';
  }

  return {
    turn: state.currentTurn,
    affectionGong: state.affectionGong,
    affectionSu: state.affectionSu,
    avgAffection,
    excitement: state.excitement,
    excitementLevel,
    relationshipStage,
    badChoiceCount: state.badChoiceCount,
    endingPath,
    keywordsCount: state.triggeredKeywords.length,
    eventsCount: state.triggeredEvents.length
  };
}

// ============================================
// 전체 상태 업데이트 (한 번에)
// ============================================

export function applyResponseToState(state, parsedResponse, endings) {
  let newState = { ...state };
  
  // 1. 호감도 업데이트
  if (parsedResponse.scores) {
    newState.affectionGong = updateAffection(
      newState.affectionGong, 
      parsedResponse.scores.affectionGongChange
    );
    newState.affectionSu = updateAffection(
      newState.affectionSu, 
      parsedResponse.scores.affectionSuChange
    );
    newState.excitement = updateAffection(
      newState.excitement, 
      parsedResponse.scores.excitementChange
    );
  }
  
  // 2. 키워드 추적
  if (parsedResponse.triggeredKeywords && parsedResponse.triggeredKeywords.length > 0) {
    newState = trackKeywords(newState, parsedResponse.triggeredKeywords, 'ai');
  }
  
  // 3. 씬 업데이트
  if (parsedResponse.meta) {
    newState = updateScene(newState, parsedResponse.meta);
  }
  
  // 4. 턴 증가
  newState = incrementTurn(newState);
  
  // 5. 히스토리 추가
  newState = addToHistory(newState, {
    type: 'ai_response',
    scores: parsedResponse.scores,
    keywords: parsedResponse.triggeredKeywords
  });
  
  return newState;
}

export default {
  INITIAL_GAME_STATE,
  updateAffection,
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
};
