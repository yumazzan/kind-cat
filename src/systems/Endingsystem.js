/**
 * BL 인터랙티브 픽션 엔딩 시스템
 * 엔딩 조건 체크 및 판정
 */

// ============================================
// 엔딩 타입 정의
// ============================================

export const ENDING_TYPES = {
  TRUE: 'true',       // 트루 엔딩 (호감도 100 + 조건)
  GOOD: 'good',       // 굿 엔딩 (호감도 81-99)
  NORMAL: 'normal',   // 노멀 엔딩 (호감도 61-80)
  BAD: 'bad',         // 배드 엔딩 (호감도 60 이하)
  WORST: 'worst',     // 워스트 엔딩 (특수 조건)
  HIDDEN: 'hidden'    // 히든 엔딩 (특수 키워드 조합)
};

export const ENDING_STYLES = {
  true: { 
    bg: 'linear-gradient(135deg, #E8749B, #C9395A)', 
    icon: '💕', 
    label: 'TRUE ENDING',
    color: '#E8749B'
  },
  good: { 
    bg: 'linear-gradient(135deg, #81C784, #4CAF50)', 
    icon: '💚', 
    label: 'GOOD ENDING',
    color: '#81C784'
  },
  normal: { 
    bg: 'linear-gradient(135deg, #FFD54F, #FFC107)', 
    icon: '💛', 
    label: 'NORMAL ENDING',
    color: '#FFD54F'
  },
  bad: { 
    bg: 'linear-gradient(135deg, #ff7043, #ff5722)', 
    icon: '💔', 
    label: 'BAD ENDING',
    color: '#ff7043'
  },
  worst: { 
    bg: 'linear-gradient(135deg, #424242, #212121)', 
    icon: '⚫', 
    label: 'WORST ENDING',
    color: '#616161'
  },
  hidden: { 
    bg: 'linear-gradient(135deg, #BA68C8, #9C27B0)', 
    icon: '🔮', 
    label: 'HIDDEN ENDING',
    color: '#BA68C8'
  }
};

// ============================================
// 메인 엔딩 판정 함수
// ============================================

export function checkEndingCondition(gameState, story) {
  const { 
    affectionGong = 0, 
    affectionSu = 0, 
    triggeredKeywords = [],
    badChoiceCount = 0 
  } = gameState;
  
  const avgAffection = Math.floor((affectionGong + affectionSu) / 2);
  const endings = story.endings || {};

  // 1. 워스트 엔딩 체크 (최우선)
  const worstCheck = checkWorstEnding(gameState);
  if (worstCheck.triggered) {
    return { 
      type: ENDING_TYPES.WORST, 
      trigger: worstCheck.reason,
      canTrigger: true,
      priority: 0
    };
  }

  // 2. 즉시 배드 키워드 체크
  const badKeywordTriggered = checkBadKeywords(triggeredKeywords, endings);
  if (badKeywordTriggered) {
    return { 
      type: ENDING_TYPES.BAD, 
      trigger: 'bad_keyword',
      keyword: badKeywordTriggered,
      canTrigger: true,
      priority: 1
    };
  }

  // 3. 히든 엔딩 체크
  const hiddenCheck = checkHiddenEnding(triggeredKeywords, endings);
  if (hiddenCheck.achieved) {
    return { 
      type: ENDING_TYPES.HIDDEN, 
      trigger: 'hidden_keywords',
      canTrigger: true,
      priority: 2
    };
  }

  // 4. 트루 엔딩 체크 (호감도 100 + 조건)
  if (avgAffection >= 100) {
    const trueCheck = checkTrueEnding(triggeredKeywords, endings, badChoiceCount);
    if (trueCheck.achieved) {
      return { 
        type: ENDING_TYPES.TRUE, 
        trigger: 'full_conditions',
        canTrigger: true,
        priority: 3
      };
    }
    // 트루 조건 미달 → 굿 엔딩
    return { 
      type: ENDING_TYPES.GOOD, 
      trigger: 'affection_high_no_true',
      canTrigger: true,
      priority: 4
    };
  }

  // 5. 굿 엔딩 (호감도 81-99)
  if (avgAffection >= 81) {
    return { 
      type: ENDING_TYPES.GOOD, 
      trigger: 'affection',
      canTrigger: true,
      priority: 4
    };
  }

  // 6. 노멀 엔딩 (호감도 61-80)
  if (avgAffection >= 61) {
    return { 
      type: ENDING_TYPES.NORMAL, 
      trigger: 'affection',
      canTrigger: true,
      priority: 5
    };
  }

  // 7. 배드 엔딩 (호감도 60 이하 또는 혐오 행동 과다)
  if (avgAffection < 61 || badChoiceCount >= 6) {
    return { 
      type: ENDING_TYPES.BAD, 
      trigger: avgAffection < 61 ? 'affection_low' : 'bad_choices',
      canTrigger: true,
      priority: 6
    };
  }

  // 아직 엔딩 조건 미충족
  return { 
    type: null, 
    canTrigger: false 
  };
}

// ============================================
// 개별 엔딩 조건 체크
// ============================================

function checkWorstEnding(gameState) {
  const { affectionGong, affectionSu, badChoiceCount } = gameState;
  
  // 호감도 0 이하
  if (affectionGong <= 0 || affectionSu <= 0) {
    return { triggered: true, reason: 'affection_zero' };
  }
  
  // 혐오 행동 연속 3회 (구현 시 추가 로직 필요)
  if (badChoiceCount >= 10) {
    return { triggered: true, reason: 'extreme_bad_choices' };
  }
  
  return { triggered: false };
}

function checkBadKeywords(triggeredKeywords, endings) {
  const badKeywords = endings?.bad?.badKeywords || [];
  
  for (const kw of badKeywords) {
    // bad:키워드 형식으로 저장되어 있는지 확인
    if (triggeredKeywords.includes(`bad:${kw}`)) {
      return kw;
    }
    // 일반 키워드로 저장되어 있는지도 확인
    if (triggeredKeywords.includes(kw)) {
      return kw;
    }
  }
  
  return null;
}

function checkHiddenEnding(triggeredKeywords, endings) {
  const hiddenKeywords = endings?.hidden?.requiredKeywords || [];
  
  if (hiddenKeywords.length === 0) {
    return { achieved: false };
  }
  
  const allMet = hiddenKeywords.every(kw => {
    return triggeredKeywords.includes(`hidden:${kw}`) || 
           triggeredKeywords.includes(kw);
  });
  
  return { 
    achieved: allMet,
    required: hiddenKeywords,
    triggered: triggeredKeywords.filter(k => 
      hiddenKeywords.some(hk => k.includes(hk))
    )
  };
}

function checkTrueEnding(triggeredKeywords, endings, badChoiceCount) {
  // 혐오 행동 1회 초과면 트루 불가
  if (badChoiceCount > 1) {
    return { 
      achieved: false, 
      reason: 'too_many_bad_choices',
      badChoiceCount 
    };
  }
  
  const trueKeywords = endings?.true?.requiredKeywords || [];
  
  // 필수 키워드가 없으면 호감도만으로 달성
  if (trueKeywords.length === 0) {
    return { achieved: true };
  }
  
  const allMet = trueKeywords.every(kw => {
    return triggeredKeywords.includes(`true:${kw}`) || 
           triggeredKeywords.includes(kw);
  });
  
  return { 
    achieved: allMet,
    required: trueKeywords,
    triggered: triggeredKeywords.filter(k => 
      trueKeywords.some(tk => k.includes(tk))
    )
  };
}

// ============================================
// 엔딩 트리거 여부 판단
// ============================================

export function shouldTriggerEnding(gameState, story) {
  const { affectionGong, affectionSu, currentTurn } = gameState;
  const avgAffection = Math.floor((affectionGong + affectionSu) / 2);
  
  // 최소 턴 수 체크 (너무 빠른 엔딩 방지)
  const minTurns = story.minTurnsForEnding || 10;
  if (currentTurn < minTurns) {
    return { should: false, reason: 'too_early' };
  }
  
  // 엔딩 조건 체크
  const endingCheck = checkEndingCondition(gameState, story);
  
  // 배드/워스트는 즉시 트리거
  if (endingCheck.type === ENDING_TYPES.BAD || 
      endingCheck.type === ENDING_TYPES.WORST) {
    if (endingCheck.trigger === 'bad_keyword' || 
        endingCheck.trigger === 'affection_zero') {
      return { should: true, ending: endingCheck };
    }
  }
  
  // 히든은 즉시 트리거
  if (endingCheck.type === ENDING_TYPES.HIDDEN) {
    return { should: true, ending: endingCheck };
  }
  
  // 그 외는 수동 트리거 또는 특정 이벤트에서
  return { 
    should: false, 
    canManualTrigger: endingCheck.canTrigger,
    ending: endingCheck 
  };
}

// ============================================
// 엔딩 데이터 가져오기
// ============================================

export function getEndingData(endingType, story) {
  const endings = story.endings || {};
  const endingConfig = endings[endingType] || {};
  const style = ENDING_STYLES[endingType] || ENDING_STYLES.normal;
  
  return {
    type: endingType,
    name: endingConfig.name || getDefaultEndingName(endingType),
    description: endingConfig.description || '',
    condition: endingConfig.condition || '',
    cgImage: endingConfig.cgImage || null,
    reward: endingConfig.reward || null,
    style
  };
}

function getDefaultEndingName(type) {
  const names = {
    true: '트루 엔딩',
    good: '굿 엔딩',
    normal: '노멀 엔딩',
    bad: '배드 엔딩',
    worst: '워스트 엔딩',
    hidden: '히든 엔딩'
  };
  return names[type] || '엔딩';
}

// ============================================
// 분기점 메시지
// ============================================

export function getBranchPointMessage(avgAffection, prevAvg) {
  const branchPoints = [
    { point: 25, message: '💫 첫 번째 분기점 도달! 관계가 움직이기 시작합니다.' },
    { point: 50, message: '💕 두 번째 분기점! 서로를 의식하기 시작합니다.' },
    { point: 75, message: '❤️ 세 번째 분기점! 감정이 깊어지고 있습니다.' },
    { point: 90, message: '🔥 최종 분기점! 엔딩이 결정됩니다.' }
  ];
  
  for (const { point, message } of branchPoints) {
    if (prevAvg < point && avgAffection >= point) {
      return { reached: true, point, message };
    }
  }
  
  return { reached: false };
}

// ============================================
// 엔딩 진행도 계산
// ============================================

export function calculateEndingProgress(gameState, story) {
  const { 
    affectionGong, 
    affectionSu, 
    triggeredKeywords,
    badChoiceCount 
  } = gameState;
  
  const avgAffection = Math.floor((affectionGong + affectionSu) / 2);
  const endings = story.endings || {};
  
  // 트루 엔딩 진행도
  const trueKeywords = endings.true?.requiredKeywords || [];
  const trueKeywordsTriggered = trueKeywords.filter(kw => 
    triggeredKeywords.some(tk => tk.includes(kw))
  );
  const trueProgress = {
    affection: Math.min(avgAffection, 100),
    keywords: trueKeywords.length > 0 
      ? Math.floor((trueKeywordsTriggered.length / trueKeywords.length) * 100)
      : 100,
    badChoices: badChoiceCount <= 1,
    overall: 0
  };
  trueProgress.overall = Math.floor(
    (trueProgress.affection * 0.5) + 
    (trueProgress.keywords * 0.3) + 
    (trueProgress.badChoices ? 20 : 0)
  );
  
  // 히든 엔딩 진행도
  const hiddenKeywords = endings.hidden?.requiredKeywords || [];
  const hiddenKeywordsTriggered = hiddenKeywords.filter(kw => 
    triggeredKeywords.some(tk => tk.includes(kw))
  );
  const hiddenProgress = hiddenKeywords.length > 0
    ? Math.floor((hiddenKeywordsTriggered.length / hiddenKeywords.length) * 100)
    : 0;
  
  // 현재 경로 판단
  let currentPath = 'unknown';
  if (avgAffection >= 90 && badChoiceCount <= 1) {
    currentPath = 'true';
  } else if (avgAffection >= 70) {
    currentPath = 'good';
  } else if (avgAffection >= 50) {
    currentPath = 'normal';
  } else {
    currentPath = 'bad';
  }
  
  return {
    currentPath,
    avgAffection,
    trueProgress,
    hiddenProgress,
    badChoiceCount,
    canReachTrue: avgAffection >= 80 && badChoiceCount <= 1,
    canReachGood: avgAffection >= 60,
    isInDanger: avgAffection < 40 || badChoiceCount >= 4
  };
}

// ============================================
// 엔딩 힌트 생성
// ============================================

export function generateEndingHint(gameState, story) {
  const progress = calculateEndingProgress(gameState, story);
  const hints = [];
  
  if (progress.currentPath === 'bad') {
    hints.push('⚠️ 현재 배드 엔딩 루트입니다. 호감도를 올려보세요.');
  }
  
  if (progress.isInDanger) {
    hints.push('💔 관계가 위험합니다. 캐릭터가 좋아하는 행동을 해보세요.');
  }
  
  if (progress.canReachTrue && progress.trueProgress.keywords < 100) {
    const remaining = 100 - progress.trueProgress.keywords;
    hints.push(`💕 트루 엔딩까지 키워드 ${remaining}% 남았습니다.`);
  }
  
  if (progress.hiddenProgress > 0 && progress.hiddenProgress < 100) {
    hints.push(`🔮 히든 엔딩 단서를 발견했습니다... (${progress.hiddenProgress}%)`);
  }
  
  if (progress.badChoiceCount >= 2) {
    hints.push(`⚡ 실수 횟수: ${progress.badChoiceCount}회. 트루 엔딩에는 1회 이하가 필요합니다.`);
  }
  
  return hints;
}

export default {
  ENDING_TYPES,
  ENDING_STYLES,
  checkEndingCondition,
  shouldTriggerEnding,
  getEndingData,
  getBranchPointMessage,
  calculateEndingProgress,
  generateEndingHint
};