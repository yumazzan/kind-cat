/**
 * BL 신음 표현 데이터베이스
 * 캐릭터 유형별, 흥분도별 신음 패턴 정의
 * 
 * 핵심 원칙:
 * 1. 캐릭터 = 신음의 기본 톤
 * 2. 흥분도 = 신음의 강도
 * 3. 상황 = 신음의 변주
 * 4. 점진적 증가 필수
 * 5. 자연스러움 > 자극성
 */

// ============================================================
// 공(攻) 신음 패턴
// ============================================================

export const GONG_MOANS = {
  // 강공/광공 유형
  intense: {
    levels: {
      // 10-30%: 초반 - 여유
      low: {
        moans: ['흠...', '...크.', '하...'],
        description: '거의 소리 내지 않음, 낮은 한숨 정도',
        pattern: '1음절'
      },
      // 40-60%: 중반 - 억제된 긴장
      mid: {
        moans: ['으윽...', '흐음...', '...츠.', '하아...'],
        description: '이를 악물거나 숨을 참는 듯한 표현',
        pattern: '2음절'
      },
      // 70-90%: 고조 - 통제력 흔들림
      high: {
        moans: ['크윽...!', '시, 씨발...', '흐읏...', '으아...'],
        description: '욕설과 섞이기 시작, 단절된 호흡',
        pattern: '3음절 + 반복'
      },
      // 95-100%: 절정
      peak: {
        moans: ['크으읏...!', '으으윽! 씨, 씨발...!', '아, 악...!'],
        description: '거칠고 폭발적, 통제 불능',
        pattern: '불규칙 + 폭발'
      }
    }
  },

  // 능글공/개아가공 유형
  playful: {
    levels: {
      low: {
        moans: ['음~', '후훗...', '아하...'],
        description: '장난스러운 웃음 섞임',
        pattern: '1음절 + 웃음'
      },
      mid: {
        moans: ['으음...?', '하아... 이건 좀...', '음, 음...'],
        description: '여전히 여유 있지만 숨소리 섞임',
        pattern: '2음절'
      },
      high: {
        moans: ['하, 하아... 아...', '으윽, 잠깐...', '아, 아아...'],
        description: '놀란 듯한 톤, 예상 밖의 쾌감에 당황',
        pattern: '3음절'
      },
      peak: {
        moans: ['아, 아아악...!', '하아앙...!', '으아, 안 돼... 아!'],
        description: '평소 이미지 붕괴, 예상 밖으로 격렬',
        pattern: '불규칙'
      }
    }
  },

  // 냉혈공/재벌공 유형
  cold: {
    levels: {
      low: {
        moans: ['...', '흠.'],
        description: '거의 무음',
        pattern: '무음~1음절'
      },
      mid: {
        moans: ['...하.', '으음.', '...츠.'],
        description: '최대한 소리 억제, 찰나의 한숨',
        pattern: '1음절'
      },
      high: {
        moans: ['으... 윽.', '하아... 씨...', '크...'],
        description: '억눌린 신음, 끝까지 품위 유지 시도',
        pattern: '2음절 억제'
      },
      peak: {
        moans: ['크으윽...!', '하... 아...', '으으...'],
        description: '짧고 낮게, 절대 비명 지르지 않음',
        pattern: '2음절 억제'
      }
    }
  },

  // 다정공/헌신공 유형
  gentle: {
    levels: {
      low: {
        moans: ['음...', '후우...', '아...'],
        description: '부드러운 한숨',
        pattern: '1음절'
      },
      mid: {
        moans: ['하아... 너...', '으음... 이런...', '아, 아...'],
        description: '상대 이름 부르기 시작',
        pattern: '2음절 + 호칭'
      },
      high: {
        moans: ['하아, 하아... 너무...', '아, 아... [이름]아...', '으윽... 미안... 아...'],
        description: '사과하듯, 상대 배려하는 말 섞임',
        pattern: '3음절 + 호칭'
      },
      peak: {
        moans: ['아, 아아... 사랑해...!', '하아앙... [이름]아...!', '으으... 미안해, 아...!'],
        description: '감정 표현 폭발, 애정 어린 신음',
        pattern: '감정 폭발'
      }
    }
  }
};

// ============================================================
// 수(受) 신음 패턴
// ============================================================

export const SU_MOANS = {
  // 강수/까칠수 유형
  tsundere: {
    levels: {
      // 10-30%: 초반 - 저항
      low: {
        moans: ['으윽... 닥쳐.', '아, 아프다고...!', '츠... 그만해.'],
        description: '화난 듯, 거부 의사 명확',
        pattern: '저항 + 1음절'
      },
      // 40-60%: 중반 - 동요
      mid: {
        moans: ['으으... 씨발...', '하... 잠깐만...', '아... 이, 이건...'],
        description: '욕설로 저항하지만 힘이 빠짐',
        pattern: '욕설 + 2음절'
      },
      // 70-90%: 고조 - 굴복 시작
      high: {
        moans: ['아, 아아... 씨발, 좋아...', '으으윽...! 하아...', '아앙... 싫어... 좋아...'],
        description: '모순된 말, 자존심과 쾌감의 충돌',
        pattern: '모순 표현'
      },
      // 95-100%: 절정 - 완전 굴복
      peak: {
        moans: ['아아악...! 가, 간다...!', '하아아앙...! 씨발, 씨발...!', '으아아... 좋아, 좋아...!'],
        description: '완전히 이성 상실, 솔직한 쾌감 표현',
        pattern: '완전 굴복'
      }
    }
  },

  // 다정수/헌신수 유형
  devoted: {
    levels: {
      low: {
        moans: ['으응...', '아... 괜찮아...', '음...'],
        description: '참는 듯, 상대 배려',
        pattern: '1음절 + 배려'
      },
      mid: {
        moans: ['하아... 좋아...', '으음... 기분 좋아...', '아... 더...'],
        description: '순응적, 긍정적 피드백',
        pattern: '긍정 피드백'
      },
      high: {
        moans: ['하아앙... 너무 좋아...', '아, 아아... 사랑해...', '으응... [이름]아...!'],
        description: '애정 표현 증가',
        pattern: '애정 + 호칭'
      },
      peak: {
        moans: ['아아앙...! 사랑해, 사랑해...!', '하아아... 행복해...!', '으응... 너무... 아아...!'],
        description: '감정과 쾌감의 완전한 융합',
        pattern: '감정 융합'
      }
    }
  },

  // 상처수/자낮수 유형
  wounded: {
    levels: {
      low: {
        moans: ['으으...', '아... 미안해...', '...흑.'],
        description: '울먹이는 듯, 사과하는 듯',
        pattern: '울음 + 사과'
      },
      mid: {
        moans: ['으흑... 이상해...', '아... 아파... 좋아...', '흐읍... 미안...'],
        description: '고통과 쾌감 구분 못함',
        pattern: '혼란'
      },
      high: {
        moans: ['으으흑... 이상해... 좋아...', '아앙... 미안, 미안해...', '하아... 너무... 흐윽...'],
        description: '울음 섞인 신음, 계속 사과',
        pattern: '울음 + 사과'
      },
      peak: {
        moans: ['으아아... 미안해... 좋아...!', '흐아앙... 죄송해...!', '아아악... 이상해... 아...!'],
        description: '울면서 절정, 자기혐오와 쾌감 공존',
        pattern: '울음 절정'
      }
    }
  },

  // 유혹수 유형
  seductive: {
    levels: {
      low: {
        moans: ['음~ 좋아...', '하아... 더 해줘...', '아응...'],
        description: '의도적으로 음란하게',
        pattern: '유혹적'
      },
      mid: {
        moans: ['아아... 여기 좋아...', '음~ 거기... 더...', '하응... 박아줘...'],
        description: '적극적 유도, 노골적 표현',
        pattern: '노골적 요구'
      },
      high: {
        moans: ['아앙... 좋아, 좋아...!', '하아... 더 세게...!', '으응... 거기... 거기...!'],
        description: '명령조로 변화',
        pattern: '명령조'
      },
      peak: {
        moans: ['아아악...! 싸, 싸...!', '하아아... 더! 더!!', '으아... 가, 간다...!'],
        description: '완전히 본능적, 절규에 가까움',
        pattern: '절규'
      }
    }
  },

  // 공이었수 유형
  formerTop: {
    levels: {
      // 10-30%: 초반 - 거부/저항
      low: {
        moans: ['으윽... 그만...', '츠... 내가 왜...', '하... 이건 아니야...'],
        description: '과거 지배자였던 자존심',
        pattern: '자존심 저항'
      },
      // 40-60%: 중반 - 굴욕감
      mid: {
        moans: ['으으... 씨발... 이럴 수가...', '아... 이건... 말도 안 돼...', '하아... 미친...'],
        description: '수치심과 불신, 욕설 증가',
        pattern: '굴욕 + 욕설'
      },
      // 70-90%: 고조 - 자아 붕괴
      high: {
        moans: ['으으윽... 씨발, 좋아... 아...', '하아... 이건... 너무...!', '아앙... 안 돼... 좋아...!'],
        description: '과거의 자신과 현재의 충돌',
        pattern: '자아 충돌'
      },
      // 95-100%: 절정 - 완전 굴복
      peak: {
        moans: ['아아악...! 좋아...! 좋아...!', '하아아... 더... 씨발... 더...!', '으아아... 미쳤어... 아...!'],
        description: '모든 자존심 포기, 본능만 남음',
        pattern: '완전 굴복'
      }
    }
  },

  // 연상수/아저씨수 유형
  older: {
    levels: {
      low: {
        moans: ['음... 천천히...', '하아... 어휴...', '크흠...'],
        description: '여유 있는 듯, 약간 귀찮은 듯',
        pattern: '여유'
      },
      mid: {
        moans: ['으음... 이건 좀...', '하아... 예상 밖인데...', '아... 잠깐...'],
        description: '놀라는 듯, 통제력 흔들림',
        pattern: '동요'
      },
      high: {
        moans: ['하, 하아... 이건...', '으으윽... 야...', '아... 너 진짜...'],
        description: '존댓말 무너짐, 반말 나옴',
        pattern: '언어 붕괴'
      },
      peak: {
        moans: ['아, 아아...! 씨발...!', '하아악... 미쳤어...!', '으으... 더... 더...!'],
        description: '품위 완전 붕괴, 격렬한 신음',
        pattern: '품위 붕괴'
      }
    }
  },

  // 순수수 유형
  innocent: {
    levels: {
      low: {
        moans: ['으응...?', '이, 이게 뭐야...?', '아...?'],
        description: '당황, 어리둥절',
        pattern: '물음표'
      },
      mid: {
        moans: ['으음... 이상해...', '아... 왜 이래...?', '하아... 뭐야 이건...'],
        description: '이상한 느낌에 혼란',
        pattern: '혼란'
      },
      high: {
        moans: ['아, 아아... 이상해... 좋아...', '으응... 더... 해줘...', '하아앙... 뭐야...!'],
        description: '빠르게 빠져듦',
        pattern: '빠른 적응'
      },
      peak: {
        moans: ['아아앙...! 좋아...!', '하아아... 더...!', '으응... 아아...!'],
        description: '본능적 반응, 순수한 쾌감',
        pattern: '순수 쾌감'
      }
    }
  }
};

// ============================================================
// 상황별 신음 변주
// ============================================================

export const SITUATIONAL_MOANS = {
  // 고통 섞인 쾌감
  painPleasure: {
    gong: ['크윽... 씨발... 조여...', '으윽... 꽉...'],
    su: ['아파... 하지만... 좋아...', '으윽... 아파... 더...']
  },

  // 예상 밖의 자극
  unexpected: {
    gong: ['으윽...? 뭐야, 이건...', '하...?'],
    su: ['아...! 어, 어떻게...!', '으응...?!']
  },

  // 참으려 할 때
  holding: {
    gong: ['으... ...안 돼.', '크... 참아...'],
    su: ['흐읍... ...으으...', '아... 안 돼...']
  },

  // 포기하는 순간
  surrender: {
    gong: ['하... 씨발. 아...', '으... 됐어...'],
    su: ['으으... 아아...', '하아... 더 이상...']
  },

  // 절정 직전
  edging: {
    holding: [
      '으, 으윽... 안 돼... 참아야...',
      '크으... 아직... 아직...'
    ],
    surrender: [
      '아... 안 돼... 가, 간다...!',
      '으아... 더 이상... 아아...!'
    ]
  }
};

// ============================================================
// 호흡 패턴
// ============================================================

export const BREATHING_PATTERNS = {
  // 짧은 호흡 (긴장/흥분)
  short: ['하, 하, 하... 아...', '흐, 흐읍... 으...'],
  
  // 긴 호흡 (절정 후/이완)
  long: ['하아아아...', '으으으음...'],
  
  // 불규칙한 호흡 (절정 직전)
  irregular: ['하, 아... 흐, 윽... 아아...!', '으, 으으... 하... 아악...!']
};

// ============================================================
// 신음 + 말 조합 패턴
// ============================================================

export const MOAN_SPEECH_COMBOS = {
  // 신음 → 말 → 신음
  sandwich: [
    '아... 너무 좋아... 으음...',
    '하아... 더 해줘... 아...'
  ],
  
  // 말 중간에 신음 끼어들기
  interrupted: [
    '나... 으으... 진짜... 아... 좋아...',
    '이거... 하아... 미쳤어... 으음...'
  ],
  
  // 신음으로 말 대신하기
  nonverbal: {
    question: '좋아?',
    answer: '으으음... 아... (고개 끄덕)'
  }
};

// ============================================================
// 금지 패턴
// ============================================================

export const FORBIDDEN_PATTERNS = {
  // 일본식 신음 - 절대 금지
  japanese: ['히잉~', '앗~', '냐앙~', '야앙~', '~다냥'],
  
  // 과도하게 긴 신음
  tooLong: ['아아아아아아아앙~~~~~'],
  
  // 캐릭터 무시 예시
  characterMismatch: {
    cold: ['하아앙~', '아응~'], // 냉혈공에게 부적합
    intense: ['음...', '후훗...'] // 강공에게 부적합
  }
};

// ============================================================
// 유틸리티 함수
// ============================================================

/**
 * 캐릭터 유형과 흥분도에 맞는 신음 가져오기
 * @param {string} role - 'gong' 또는 'su'
 * @param {string} type - 캐릭터 유형 ID
 * @param {number} excitement - 흥분도 (0-100)
 * @returns {object} - { moan, description }
 */
export function getMoan(role, type, excitement) {
  const moans = role === 'gong' ? GONG_MOANS : SU_MOANS;
  const characterMoans = moans[type] || moans[Object.keys(moans)[0]];
  
  let level;
  if (excitement <= 30) level = 'low';
  else if (excitement <= 60) level = 'mid';
  else if (excitement <= 90) level = 'high';
  else level = 'peak';
  
  const levelData = characterMoans.levels[level];
  const moan = levelData.moans[Math.floor(Math.random() * levelData.moans.length)];
  
  return {
    moan,
    description: levelData.description,
    pattern: levelData.pattern,
    level
  };
}

/**
 * 흥분도 레벨 이름 가져오기
 */
export function getExcitementLevelName(excitement) {
  if (excitement <= 20) return '평온';
  if (excitement <= 40) return '은근한 긴장';
  if (excitement <= 60) return '의식하기 시작';
  if (excitement <= 80) return '뚜렷한 욕망';
  if (excitement <= 95) return '절정 직전';
  return '완전한 흥분';
}

/**
 * 신음 검증 (금지 패턴 체크)
 */
export function validateMoan(moan) {
  // 일본식 패턴 체크
  for (const pattern of FORBIDDEN_PATTERNS.japanese) {
    if (moan.includes(pattern.replace('~', ''))) {
      return { valid: false, reason: '일본식 신음 금지' };
    }
  }
  
  // 너무 긴 모음 반복 체크
  if (/(.)\1{5,}/.test(moan)) {
    return { valid: false, reason: '과도하게 긴 신음' };
  }
  
  return { valid: true };
}

/**
 * 상황에 맞는 신음 가져오기
 */
export function getSituationalMoan(situation, role = 'su') {
  const situationalData = SITUATIONAL_MOANS[situation];
  if (!situationalData) return null;
  
  const moans = situationalData[role] || situationalData;
  if (Array.isArray(moans)) {
    return moans[Math.floor(Math.random() * moans.length)];
  }
  return moans;
}

export default {
  GONG_MOANS,
  SU_MOANS,
  SITUATIONAL_MOANS,
  BREATHING_PATTERNS,
  MOAN_SPEECH_COMBOS,
  FORBIDDEN_PATTERNS,
  getMoan,
  getExcitementLevelName,
  validateMoan,
  getSituationalMoan
};