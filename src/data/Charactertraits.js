/**
 * BL 캐릭터 특성 데이터베이스
 * 공(攻)/수(受) 태그별 성격, 행동 패턴, 대사 스타일 정의
 */

// ============================================================
// 공(攻) 캐릭터 유형
// ============================================================

export const GONG_TYPES = {
  // 냉혈공/재벌공
  cold: {
    id: 'cold',
    names: ['#냉혈공', '#재벌공'],
    personality: {
      core: '차갑고 무표정, 감정 표현 억제',
      hidden: '내면에 숨겨진 집착과 소유욕',
      weakness: '수에게만 보이는 균열'
    },
    speechPattern: {
      style: '짧고 단정적, 명령조',
      endings: ['~해.', '~하지 마.', '...'],
      examples: [
        '됐어.',
        '닥쳐.',
        '...네가 정하는 게 아니야.',
        '한 번만 더 그러면.'
      ]
    },
    behaviorPatterns: {
      preferred: ['소유욕 표현', '차가운 배려', '묵묵한 보호', '질투'],
      avoided: ['애교', '장난', '수다', '감정 폭발']
    },
    excitementResponse: {
      low: '무표정 유지, 한숨',
      mid: '찰나의 표정 변화, 억제',
      high: '통제력 흔들림, 짧은 신음',
      peak: '폭발적이지만 여전히 억제'
    },
    moanBase: ['...', '흠.', '으음.', '크윽...']
  },

  // 강공/광공
  intense: {
    id: 'intense',
    names: ['#강공', '#광공', '#집착공'],
    personality: {
      core: '강렬하고 지배적, 폭발적 감정',
      hidden: '수에 대한 맹목적 집착',
      weakness: '수가 다치거나 떠날 때 무너짐'
    },
    speechPattern: {
      style: '거칠고 직접적, 욕설 섞임',
      endings: ['~해.', '씨발.', '~거야.'],
      examples: [
        '씨발, 어딜 가려고.',
        '네가 뭔데 나한테 이래.',
        '도망치지 마.',
        '너는 내 거야.'
      ]
    },
    behaviorPatterns: {
      preferred: ['벽밀', '목 잡기', '거친 키스', '속박', '마킹'],
      avoided: ['부드러운 대화', '기다림', '포기']
    },
    excitementResponse: {
      low: '여유, 낮은 한숨',
      mid: '이 악물기, 참는 신음',
      high: '욕설 섞인 거친 숨',
      peak: '통제 불능, 폭발적'
    },
    moanBase: ['흠...', '크.', '으윽...', '크으읏...!']
  },

  // 능글공/개아가공
  playful: {
    id: 'playful',
    names: ['#능글공', '#개아가공'],
    personality: {
      core: '장난스럽고 여유로움, 놀리기 좋아함',
      hidden: '놀리는 척하면서 진심',
      weakness: '수가 진심으로 받아들일 때 당황'
    },
    speechPattern: {
      style: '장난스럽고 느긋함, 물음표 많음',
      endings: ['~야?', '~지?', '후훗.', '음~'],
      examples: [
        '왜~ 부끄러워?',
        '귀엽네.',
        '그렇게 좋아?',
        '후훗, 솔직하네.'
      ]
    },
    behaviorPatterns: {
      preferred: ['놀리기', '느긋한 리드', '귓속말', '애무'],
      avoided: ['진지한 분위기', '강압', '화내기']
    },
    excitementResponse: {
      low: '웃음 섞인 여유',
      mid: '놀란 듯, 당황',
      high: '이미지 붕괴 시작',
      peak: '평소와 완전 다른 격렬함'
    },
    moanBase: ['음~', '후훗...', '으음...?', '아, 아아악...!']
  },

  // 다정공/헌신공
  gentle: {
    id: 'gentle',
    names: ['#다정공', '#헌신공'],
    personality: {
      core: '따뜻하고 배려심 깊음, 수 중심',
      hidden: '수를 위해서라면 무엇이든',
      weakness: '수가 거부할 때 상처받음'
    },
    speechPattern: {
      style: '부드럽고 걱정스러운 톤',
      endings: ['~해줄까?', '괜찮아?', '~니까.'],
      examples: [
        '아파? 천천히 할게.',
        '미안해, 너무 급했지?',
        '사랑해.',
        '네가 원하는 대로 해.'
      ]
    },
    behaviorPatterns: {
      preferred: ['쓰다듬기', '안아주기', '이마 키스', '눈 맞춤'],
      avoided: ['거친 행동', '강압', '무시']
    },
    excitementResponse: {
      low: '부드러운 한숨',
      mid: '상대 이름 부르기',
      high: '미안하다는 말 섞임',
      peak: '감정 표현 폭발, 애정 어린 신음'
    },
    moanBase: ['음...', '하아... 너...', '아... 사랑해...']
  },

  // 절륜공
  virile: {
    id: 'virile',
    names: ['#절륜공'],
    personality: {
      core: '압도적 체력과 지구력',
      hidden: '수를 완전히 지배하고 싶은 욕망',
      weakness: '수가 지쳐 쓰러질 때 죄책감'
    },
    speechPattern: {
      style: '낮고 위압적, 명령조',
      endings: ['~해.', '버텨.', '아직이야.'],
      examples: [
        '아직 멀었어.',
        '더 버텨봐.',
        '이 정도로 끝날 것 같아?',
        '좋아, 한 번 더.'
      ]
    },
    behaviorPatterns: {
      preferred: ['연속', '장시간', '다양한 체위', '조르기'],
      avoided: ['빠른 종료', '포기', '약한 모습']
    },
    excitementResponse: {
      low: '여유로운 미소',
      mid: '집중하는 표정',
      high: '땀, 거친 숨',
      peak: '폭발적이지만 곧바로 다시 시작'
    },
    moanBase: ['흠...', '하...', '크윽...', '으윽...!']
  }
};

// ============================================================
// 수(受) 캐릭터 유형
// ============================================================

export const SU_TYPES = {
  // 까칠수/강수
  tsundere: {
    id: 'tsundere',
    names: ['#까칠수', '#강수', '#츤데레'],
    personality: {
      core: '겉으로는 차갑고 반항적',
      hidden: '속으로는 좋아하면서 인정 못함',
      weakness: '진심이 드러날 때 수치심'
    },
    speechPattern: {
      style: '거칠고 반항적, 욕설',
      endings: ['~거든.', '씨발.', '닥쳐.'],
      examples: [
        '손 치워.',
        '누가 좋다고 했어.',
        '씨발... 그만해.',
        '아, 아프다고!'
      ]
    },
    behaviorPatterns: {
      preferred: ['밀어내기', '욕설', '반항', '결국 굴복'],
      avoided: ['순순히 따르기', '애교', '먼저 다가가기']
    },
    excitementResponse: {
      low: '저항, 거부',
      mid: '욕설로 저항하지만 힘 빠짐',
      high: '모순된 말 (싫어... 좋아...)',
      peak: '완전 굴복, 솔직한 쾌감 표현'
    },
    moanBase: ['으윽... 닥쳐.', '씨발...', '아앙... 싫어... 좋아...']
  },

  // 다정수/헌신수
  devoted: {
    id: 'devoted',
    names: ['#다정수', '#헌신수'],
    personality: {
      core: '순응적이고 헌신적',
      hidden: '공을 기쁘게 하고 싶은 마음',
      weakness: '자기 감정보다 공 우선'
    },
    speechPattern: {
      style: '부드럽고 순종적',
      endings: ['~해줄게.', '괜찮아.', '사랑해.'],
      examples: [
        '아... 괜찮아, 더 해도 돼.',
        '좋아... 기분 좋아.',
        '사랑해, 사랑해.',
        '행복해...'
      ]
    },
    behaviorPatterns: {
      preferred: ['받아들이기', '안기', '눈 맞춤', '이름 부르기'],
      avoided: ['거부', '밀어내기', '화내기']
    },
    excitementResponse: {
      low: '참는 듯, 상대 배려',
      mid: '순응적 긍정 피드백',
      high: '애정 표현 증가',
      peak: '감정과 쾌감의 융합'
    },
    moanBase: ['으응...', '하아... 좋아...', '아아앙...! 사랑해...!']
  },

  // 상처수/자낮수
  wounded: {
    id: 'wounded',
    names: ['#상처수', '#자낮수'],
    personality: {
      core: '자존감 낮고 상처받기 쉬움',
      hidden: '사랑받고 싶지만 자격 없다 생각',
      weakness: '칭찬에 울음, 거부에 무너짐'
    },
    speechPattern: {
      style: '소심하고 사과 많음',
      endings: ['미안해...', '죄송해...', '...'],
      examples: [
        '아... 미안해...',
        '내가 이래도 돼...?',
        '흑... 이상해...',
        '죄송해... 좋아...'
      ]
    },
    behaviorPatterns: {
      preferred: ['사과하기', '울기', '움츠러들기', '매달리기'],
      avoided: ['요구하기', '거부하기', '화내기']
    },
    excitementResponse: {
      low: '울먹임, 사과',
      mid: '고통과 쾌감 혼란',
      high: '울음 섞인 신음, 계속 사과',
      peak: '울면서 절정, 자기혐오와 쾌감 공존'
    },
    moanBase: ['으으... 미안해...', '흑...', '아앙... 죄송해...!']
  },

  // 유혹수
  seductive: {
    id: 'seductive',
    names: ['#유혹수'],
    personality: {
      core: '적극적이고 도발적',
      hidden: '공을 자극해서 원하는 것 얻기',
      weakness: '예상 밖의 강도에 무너짐'
    },
    speechPattern: {
      style: '노골적이고 유혹적',
      endings: ['~해줘.', '~좋아.', '더...'],
      examples: [
        '음~ 좋아...',
        '여기... 더 해줘.',
        '박아줘...',
        '거기... 거기...!'
      ]
    },
    behaviorPatterns: {
      preferred: ['유혹', '도발', '적극적 요구', '선 넘기'],
      avoided: ['수동적 대기', '거부', '수줍어하기']
    },
    excitementResponse: {
      low: '의도적으로 음란하게',
      mid: '적극적 유도, 노골적',
      high: '명령조로 변화',
      peak: '완전히 본능적, 절규'
    },
    moanBase: ['음~ 좋아...', '하응... 박아줘...', '아아악...! 더! 더!!']
  },

  // 공이었수
  formerTop: {
    id: 'formerTop',
    names: ['#공이었수'],
    personality: {
      core: '과거 지배자였던 자존심',
      hidden: '수 역할에 대한 수치심과 쾌감',
      weakness: '좋다고 인정하는 순간'
    },
    speechPattern: {
      style: '저항적에서 굴복으로 변화',
      endings: ['...그만.', '씨발...', '안 돼... 좋아...'],
      examples: [
        '으윽... 그만...',
        '내가 왜...',
        '씨발... 이럴 수가...',
        '좋아...! 좋아...!'
      ]
    },
    behaviorPatterns: {
      preferred: ['저항', '굴욕감 표현', '결국 무너지기'],
      avoided: ['처음부터 순응', '애교', '요구하기']
    },
    excitementResponse: {
      low: '거부, 저항',
      mid: '굴욕감, 욕설 증가',
      high: '자아 붕괴, 과거와 현재 충돌',
      peak: '모든 자존심 포기, 본능만 남음'
    },
    moanBase: ['으윽... 그만...', '씨발... 이럴 수가...', '아아악...! 좋아...!']
  },

  // 연상수/아저씨수
  older: {
    id: 'older',
    names: ['#연상수', '#아저씨수'],
    personality: {
      core: '처음엔 여유, 나중에 무너짐',
      hidden: '연하에게 지배당하는 수치심',
      weakness: '품위 유지 실패할 때'
    },
    speechPattern: {
      style: '존댓말에서 반말로 붕괴',
      endings: ['~요.', '어휴...', '야...', '씨발...!'],
      examples: [
        '음... 천천히...',
        '어휴... 이건 좀...',
        '야... 너 진짜...',
        '아, 아아...! 씨발...!'
      ]
    },
    behaviorPatterns: {
      preferred: ['여유 부리기', '점점 무너지기', '품위 붕괴'],
      avoided: ['처음부터 순응', '애교']
    },
    excitementResponse: {
      low: '여유, 약간 귀찮은 듯',
      mid: '놀람, 통제력 흔들림',
      high: '존댓말 무너짐, 반말',
      peak: '품위 완전 붕괴, 격렬'
    },
    moanBase: ['크흠...', '하아... 이건 좀...', '아, 아아...! 미쳤어...!']
  },

  // 순수수
  innocent: {
    id: 'innocent',
    names: ['#순수수'],
    personality: {
      core: '경험 없고 순수함',
      hidden: '모든 것이 처음, 빠른 학습',
      weakness: '너무 빠르게 타락'
    },
    speechPattern: {
      style: '당황하고 어리둥절',
      endings: ['...?', '이게 뭐야...', '어떻게...'],
      examples: [
        '이, 이게 뭐야...?',
        '왜 이런 느낌이...?',
        '으응... 이상해...',
        '더... 더 해줘...'
      ]
    },
    behaviorPatterns: {
      preferred: ['당황하기', '질문하기', '빠르게 적응'],
      avoided: ['거부', '도망', '화내기']
    },
    excitementResponse: {
      low: '당황, 어리둥절',
      mid: '이상한 느낌에 혼란',
      high: '빠르게 빠져듦',
      peak: '본능적 반응, 순수한 쾌감'
    },
    moanBase: ['으응...?', '이상해...', '아아... 좋아...!']
  }
};

// ============================================================
// 유틸리티 함수
// ============================================================

/**
 * 태그로 공 유형 찾기
 */
export function findGongType(tags) {
  if (!tags || !Array.isArray(tags)) return GONG_TYPES.gentle;
  
  for (const type of Object.values(GONG_TYPES)) {
    if (type.names.some(name => tags.includes(name))) {
      return type;
    }
  }
  return GONG_TYPES.gentle; // 기본값
}

/**
 * 태그로 수 유형 찾기
 */
export function findSuType(tags) {
  if (!tags || !Array.isArray(tags)) return SU_TYPES.devoted;
  
  for (const type of Object.values(SU_TYPES)) {
    if (type.names.some(name => tags.includes(name))) {
      return type;
    }
  }
  return SU_TYPES.devoted; // 기본값
}

/**
 * 캐릭터 유형에 맞는 대사 예시 가져오기
 */
export function getSampleDialogue(characterType, situation = 'normal') {
  const examples = characterType.speechPattern.examples;
  return examples[Math.floor(Math.random() * examples.length)];
}

/**
 * 흥분도에 따른 반응 가져오기
 */
export function getExcitementResponse(characterType, excitementLevel) {
  const response = characterType.excitementResponse;
  
  if (excitementLevel <= 30) return response.low;
  if (excitementLevel <= 60) return response.mid;
  if (excitementLevel <= 90) return response.high;
  return response.peak;
}

export default {
  GONG_TYPES,
  SU_TYPES,
  findGongType,
  findSuType,
  getSampleDialogue,
  getExcitementResponse
};