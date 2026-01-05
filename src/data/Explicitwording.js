/**
 * BL 인터랙티브 픽션 고수위 워딩 시스템 (SDA Mode)
 * 신체 부위, 체액, 행위 묘사, 의성어, 캐릭터별 워딩 제한
 */

// ============================================================
// I. 신체 부위 워딩 (Explicit Body Terms)
// ============================================================

export const BODY_TERMS = {
  // 남성 성기
  maleGenitals: {
    standard: ['성기', '물건', '그곳'],
    explicit: ['좆', '자지', '거시기'],
    descriptive: ['불끈 선', '단단하게 선', '발기한', '뜨겁게 달아오른'],
    size: ['굵은', '두꺼운', '묵직한', '팽창한']
  },

  // 삽입 부위
  insertionPoints: {
    standard: ['뒤', '안쪽', '입구'],
    explicit: ['뒷구멍', '구멍', '씹구멍', '뒷보지'],
    descriptive: ['뻑뻑한 입구', '조여드는', '뜨거운 내벽', '촉촉한 안쪽']
  },

  // 민감 부위
  sensitiveAreas: {
    chest: ['유두', '젖꼭지', '가슴'],
    neck: ['목덜미', '쇄골', '귀 뒤'],
    waist: ['허리', '옆구리', '엉덩이'],
    thigh: ['허벅지 안쪽', '사타구니', '샅']
  },

  // 상태 묘사
  stateDescriptors: {
    aroused: ['발기한', '서 있는', '젖은', '축축해진', '벌어진'],
    after: ['헐어진', '벌겋게 부은', '축 처진', '진물이 흐르는']
  }
};

// ============================================================
// II. 체액 및 더러움 묘사 (Fluids)
// ============================================================

export const FLUID_TERMS = {
  // 남성 체액
  male: {
    standard: ['정액', '액체'],
    explicit: ['좆물', '정액', '쿠퍼액', '선액'],
    ejaculation: ['싸다', '쏟다', '뿌리다', '쏟아내다']
  },

  // 상태 묘사
  descriptors: {
    wet: ['질척', '질퍽', '흥건하게', '번들거리는', '미끌거리는'],
    mixed: ['범벅이 된', '뒤섞인', '끈적이는'],
    dripping: ['질질 흘러', '흘러내리는', '타고 흐르는', '뚝뚝 떨어지는']
  },

  // 위치/경로
  locations: {
    internal: ['안을 채우며', '깊숙이', '뱃속까지'],
    external: ['허벅지를 타고', '시트를 적시며', '턱을 타고'],
    overflow: ['넘쳐흐르는', '흘러넘치는', '삐져나온']
  },

  // 실금/극한
  extreme: {
    loss: ['오줌', '분수', '질질 싸는'],
    description: ['참지 못하고', '통제를 잃고', '흘려버리며']
  }
};

// ============================================================
// III. 행위 묘사 동사 (Action Verbs)
// ============================================================

export const ACTION_VERBS = {
  // 삽입 관련 (공 시점)
  insertion: {
    gentle: [
      '천천히 파고들다', 
      '부드럽게 밀어넣다', 
      '조심스럽게 진입하다',
      '서서히 채우다'
    ],
    moderate: [
      '밀어넣다', 
      '비집고 들어가다', 
      '뭉근하게 비비다',
      '꽉 채우다'
    ],
    rough: [
      '쑤셔 박다', 
      '비집고 밀어넣다', 
      '찢어놓을 듯', 
      '헐어 문드러질 만큼',
      '거칠게 들이받다',
      '난폭하게 휘젓다'
    ]
  },

  // 소유/지배 (공 시점)
  possession: {
    standard: ['채우다', '가득 채우다', '점령하다'],
    explicit: ['길들이다', '유린하다', '능욕하다', '정복하다'],
    obsessive: ['각인시키다', '새기다', '소유하다', '자신의 것으로 만들다']
  },

  // 마찰/움직임
  movement: {
    slow: ['느리게 움직이다', '천천히 빼다', '뭉근하게 비비다'],
    fast: ['격렬하게 움직이다', '빠르게 들이받다', '미친 듯이 허리를 흔들다'],
    rhythm: ['리듬을 타다', '박자를 맞추다', '일정하게 찧다']
  },

  // 절정 관련
  climax: {
    buildup: ['터질 것 같다', '참기 위해 이를 악물다', '한계에 다다르다'],
    release: ['쏟아내다', '터뜨리다', '분출하다', '싸버리다'],
    denial: ['틀어막다', '억누르다', '참아내다', '가장자리에서 멈추다']
  },

  // 수의 반응 동사
  suReaction: {
    pain: ['찢어지다', '갈라지다', '쥐어짜이다'],
    pleasure: ['녹아내리다', '휘감기다', '조여들다', '빨아들이다'],
    submission: ['받아들이다', '몸을 열다', '내어주다']
  }
};

// ============================================================
// IV. 의성어/의태어 DB (Onomatopoeia)
// ============================================================

export const ONOMATOPOEIA = {
  // 타격/마찰음
  impact: {
    slap: ['철썩', '찰싹', '착', '탁'],
    thrust: ['퍽', '퍽퍽', '쿵', '탕'],
    friction: ['찌걱', '질퍽', '촤악', '츄릅']
  },

  // 체액/젖음
  wet: {
    squelch: ['질척', '질퍽', '쭈욱', '촉촉'],
    drip: ['뚝', '뚝뚝', '주르륵', '줄줄'],
    suck: ['츄릅', '쩝', '쪽', '홀짝']
  },

  // 호흡/신음
  breath: {
    gasp: ['헉', '헐떡', '허억', '흐읍'],
    sigh: ['후우', '하아', '휴', '흐음'],
    moan: ['아앙', '으응', '하응', '으으']
  },

  // 신체 반응
  body: {
    shiver: ['파르르', '부들부들', '덜덜', '와들와들'],
    twitch: ['움찔', '흠칫', '찌릿', '쿡'],
    heartbeat: ['두근두근', '쿵쾅쿵쾅', '벌렁벌렁', '콩닥콩닥']
  },

  // 접촉음
  contact: {
    kiss: ['쪽', '츄', '음', '쫍'],
    touch: ['스윽', '쓱', '살살', '어루만지듯'],
    grab: ['꽉', '움켜', '세게', '단단히']
  },

  // 장신구/도구
  accessory: {
    bell: ['딸랑', '짤랑', '찰랑'],
    chain: ['철컹', '찰칵', '달그락'],
    leather: ['착', '찰싹', '휘이익']
  }
};

// ============================================================
// V. 감각 극대화 워딩 (Sensory Amplification)
// ============================================================

export const SENSORY_WORDING = {
  // 공통/범용
  common: {
    atmosphere: ['축축', '눅눅', '비릿한', '어둠', '침묵'],
    sound: ['퍽퍽', '질척한 소리', '철썩', '딸랑'],
    state: ['엉망으로 젖은', '들러붙는', '달아오른'],
    connection: ['얽히는', '숨결', '떨리는']
  },

  // 공(Top) 전용
  gongOnly: {
    entry: ['뻑뻑한 입구', '뭉근하게 비볐다', '비집고', '천천히 파고들었다'],
    possession: ['길들여', '채우다', '음미했다', '유린하다', '능욕하다'],
    preClimax: ['터질 것 같았다', '참기 위해 잘근 씹어야 했다']
  },

  // 수(Bottom) 전용
  suOnly: {
    pain: ['찢어지는', '활처럼 휘었다', '비명조차', '밭은 숨'],
    collapse: ['초점을 잃은', '바들거린다', '이성을 잃고'],
    submission: ['주인', '님', '하읏']
  },

  // 쾌감 묘사
  pleasure: {
    trembling: ['바들거린다', '파르르', '활처럼 휘었다'],
    exhaustion: ['탈진한 듯', '힘이 빠져', '녹아내리듯'],
    sensitivity: ['움찔거렸다', '민감하게', '작은 자극에도'],
    vocal: ['울음 같은 교성', '목 쉰 신음', '절규']
  }
};

// ============================================================
// VI. 캐릭터별 워딩 제한 시스템
// ============================================================

export const CHARACTER_WORDING_RULES = {
  // ===== 공(Top) 유형별 =====
  gong: {
    // 순정공/헌신공 - 애착형, 욕설 금지
    devoted: {
      allowed: {
        endearments: ['내꺼', '내 사람', '평생', '영원히'],
        praise: ['예뻐', '착해', '잘해', '대단해'],
        pleading: ['제발', '부탁이야', '나만 봐']
      },
      forbidden: ['씨발', '개새끼', '걸레', '창녀', '잡것'],
      tone: '모든 행위를 사랑으로 포장하는 헌신적 어조',
      moanStyle: 'gentle'
    },

    // 개아가공/광공 - 최고수위 자유
    intense: {
      allowed: {
        degradation: ['걸레', '좆물받이', '창녀', '잡것'],
        profanity: ['씨발', '존나', '개같이'],
        possession: ['내꺼', '내 것', '소유물']
      },
      forbidden: [], // 제한 없음
      tone: '가학적 감정을 직접적으로 드러냄',
      moanStyle: 'intense'
    },

    // 다정공/능글공 - 유혹적 애칭
    gentle: {
      allowed: {
        endearments: ['이쁜이', '애기', '자기', '여보', '공주님', '내 새끼'],
        teasing: ['귀엽네', '어쩌나', '이거 봐'],
        playful: ['응?', '그래?', '정말?']
      },
      forbidden: ['걸레', '창녀', '좆물받이'], // 폭력적 욕설 제한
      tone: '여유롭고 유쾌, 놀리는 듯한 톤',
      moanStyle: 'playful'
    },

    // 까칠공/무심공 - 냉담, 감정 최소화
    cold: {
      allowed: {
        commands: ['해', '멈춰', '움직여', '가만히'],
        dismissive: ['쓸데없어', '얌전히', '허락 없이'],
        physical: ['더', '빨리', '제대로']
      },
      forbidden: ['사랑해', '좋아해', '귀여워'], // 감정 표현 제한
      tone: '냉담하고 사무적인 명령, 감정 표현 최소화',
      moanStyle: 'cold'
    },

    // 재벌공 - 품위 + 소유욕
    chaebol: {
      allowed: {
        possessive: ['내 것', '내 소유', '나만의'],
        commands: ['무릎 꿇어', '고개 들어', '대답해'],
        degradation: ['천한', '분수', '주제']
      },
      forbidden: ['씨발', '존나'], // 저급한 욕설 제한, 고급스러운 비하만
      tone: '품위를 유지하며 소유욕 표출',
      moanStyle: 'cold'
    }
  },

  // ===== 수(Bottom) 유형별 =====
  su: {
    // 유혹수/능글수 - 도발, 자기비하 금지
    seductive: {
      allowed: {
        provocation: ['더 해봐', '간지러운데', '그것밖에 안 돼?', '별로인데'],
        invitation: ['여기', '더', '빨리', '세게'],
        teasing: ['약하네', '이거야?', '실망인데']
      },
      forbidden: ['죄송해요', '미안해요', '제가 잘못'], // 자기비하/굴복 금지
      tone: '공을 역으로 자극하고 도발',
      moanStyle: 'seductive'
    },

    // 다정수/순진수 - 순응, 반항 금지
    devoted: {
      allowed: {
        compliance: ['괜찮아요', '좋아해요', '사랑해요', '더 해줘요'],
        pleading: ['제발', '살살', '아파요'],
        emotional: ['행복해', '기뻐', '너무 좋아']
      },
      forbidden: ['싫어', '하지 마', '꺼져', '미친놈'], // 반항 금지
      tone: '순응하며 애정을 표현',
      moanStyle: 'devoted'
    },

    // 까칠수/무심수 - 반항, 복종 금지
    tsundere: {
      allowed: {
        resistance: ['미친놈', '비켜', '네가 뭔데', '손 치워'],
        deflection: ['그만해', '상관없어', '알아서 해'],
        reluctant: ['...좋아', '알았어', '시끄러워']
      },
      forbidden: ['주인님', '감사합니다', '시키는 대로'], // 복종 금지
      tone: '반항적, 이성적 방어 지속',
      moanStyle: 'tsundere'
    },

    // 상처수/자낮수 - 자기비하, 사과
    wounded: {
      allowed: {
        apology: ['미안해요', '죄송해요', '제가 잘못했어요'],
        selfBlame: ['더러워요', '이상해요', '왜 이러는지 모르겠어요'],
        pleading: ['그만해줘요', '제발', '아파요']
      },
      forbidden: ['좋아', '더 해줘', '기분 좋아'], // 솔직한 쾌감 표현 제한
      tone: '울먹이며 사과, 자기혐오',
      moanStyle: 'wounded'
    },

    // 공이었수 - 굴욕, 자존심 충돌
    formerTop: {
      allowed: {
        pride: ['내가 왜', '말도 안 돼', '이럴 수가'],
        cursing: ['씨발', '미친', '젠장'],
        denial: ['아니야', '그만', '인정 안 해']
      },
      forbidden: ['주인님', '시키는 대로'], // 완전 굴복 금지 (고조 전까지)
      tone: '과거의 자존심과 현재의 충돌',
      moanStyle: 'formerTop'
    }
  }
};

// ============================================================
// VII. 문장 리듬 패턴 (Sentence Rhythm)
// ============================================================

export const SENTENCE_RHYTHM = {
  // 긴박감 - 짧은 문장 연속
  tension: {
    description: '긴장이 고조될 때 문장을 짧게 끊음',
    structure: '단문. 단문. 단문.',
    examples: [
      '숨이 막혔다. 눈앞이 하얘졌다. 몸이 굳었다.',
      '들어왔다. 깊게. 더 깊게.',
      '아팠다. 그런데 좋았다. 미칠 것 같았다.'
    ]
  },

  // 나른함 - 긴 문장 연결
  relaxed: {
    description: '여유롭거나 애정 어린 장면',
    structure: '~하며, ~하고, ~했다.',
    examples: [
      '그의 품에 안긴 채, 나른하게 눈을 감으며, 온기를 느꼈다.',
      '손끝이 머리카락을 쓸어내리고, 이마에 입술이 닿았으며, 나지막한 목소리가 귓가를 스쳤다.'
    ]
  },

  // 반복과 변주 - 강조
  repetition: {
    description: '같은 구조를 반복하며 강도 높임',
    structure: '[패턴] + [패턴 변주] + [클라이맥스]',
    examples: [
      '좋았다. 너무 좋았다. 미칠 듯이 좋았다.',
      '더. 더 깊이. 더 깊이, 더 세게.',
      '안 돼. 안 돼, 안 돼, 안 돼...'
    ]
  },

  // 불규칙 - 절정 직전
  irregular: {
    description: '절정 직전 호흡이 흐트러지는 느낌',
    structure: '짧은 문장 - 긴 문장 - 끊김',
    examples: [
      '하아, 아... 거기, 그러니까... 으으, 안 돼!',
      '머리가. 뜨겁다. 온몸이 녹아내리는 것처럼, 그런데 멈출 수가—'
    ]
  }
};

// ============================================================
// VIII. 시간/속도 조절 (Tempo Control)
// ============================================================

export const TEMPO_CONTROL = {
  // 느린 진행
  slow: {
    verbs: ['천천히', '서서히', '느리게', '조심스럽게'],
    phrases: [
      '한 걸음 내디딜 때마다',
      '마치 인형처럼 삐걱이는 걸음으로',
      '손을 뻗어 → 쓸어내리는가 싶더니 → 움켜쥐었다',
      '시간이 늘어지는 것처럼'
    ]
  },

  // 빠른 진행
  fast: {
    verbs: ['순간', '순식간에', '단숨에', '일순'],
    phrases: [
      '다음 순간',
      '눈앞이 하얗게 번쩍였다',
      '미처 반응할 틈도 없이',
      '숨 쉴 새도 없이'
    ]
  },

  // 시간 왜곡
  distortion: {
    slow: [
      '그 순간이 영겁처럼 느껴졌다',
      '시간이 멈춘 듯',
      '영원처럼 긴 몇 초'
    ],
    fast: [
      '몇 초인지 몇 분인지 알 수 없었다',
      '정신을 차려보니',
      '어느새'
    ]
  }
};

// ============================================================
// IX. 극한 상황 템플릿 (Extreme Scene Templates)
// ============================================================

export const EXTREME_TEMPLATES = {
  // 협박/거래 제안
  negotiation: {
    opener: [
      '말해봐. 네가 원하는 게 뭔지.',
      '들어는 줄게. 물론, 결정은 내가 하지만.',
      '선택해. 시간 없어.'
    ],
    atmosphere: '이미 답을 알고 있는 자의 잔인함',
    structure: '[제안] → [거짓 선택지] → [진짜 의도 드러내기]'
  },

  // 역전/반전
  reversal: {
    transition: [
      '방금 전까지의 [상태]는 온데간데없이',
      '[행동]은 얼음물과 같았다',
      '[감정]이 순식간에 차갑게 식어버렸다'
    ],
    shock: [
      '믿을 수 없다는 듯 눈이 커졌다',
      '얼어붙은 듯 움직임이 멈췄다'
    ]
  },

  // 애프터케어
  aftercare: {
    gentle: [
      '부드럽게 쓸어내리며',
      '지극히 신사적인 제스처',
      '손등에 가볍게 입을 맞췄다',
      '온화한 어조로'
    ],
    contrast: '방금 전의 격렬함과 대비되는 다정함'
  },

  // 절정 직전 긴박감
  edging: {
    sensations: [
      '절정의 문턱에서 멈춰선 감각',
      '온몸의 피가 거꾸로 솟는 듯한',
      '터져 나오려던 쾌락을 강제로 틀어막았다'
    ],
    reactions: [
      '발버둥 쳤다',
      '애원하듯 몸을 비틀었다',
      '목이 터져라 비명을 질렀다'
    ]
  }
};

// ============================================================
// X. 유틸리티 함수
// ============================================================

/**
 * 캐릭터 유형에 따른 허용 워딩 가져오기
 */
export function getAllowedWording(role, type) {
  const rules = CHARACTER_WORDING_RULES[role]?.[type];
  if (!rules) return null;
  return {
    allowed: rules.allowed,
    forbidden: rules.forbidden,
    tone: rules.tone,
    moanStyle: rules.moanStyle
  };
}

/**
 * 워딩 사용 가능 여부 체크
 */
export function isWordingAllowed(role, type, word) {
  const rules = CHARACTER_WORDING_RULES[role]?.[type];
  if (!rules) return true;
  return !rules.forbidden.includes(word);
}

/**
 * 랜덤 의성어 가져오기
 */
export function getRandomOnomatopoeia(category, subcategory) {
  const sounds = ONOMATOPOEIA[category]?.[subcategory];
  if (!sounds) return null;
  return sounds[Math.floor(Math.random() * sounds.length)];
}

/**
 * 랜덤 행위 동사 가져오기
 */
export function getRandomActionVerb(category, intensity = 'moderate') {
  const verbs = ACTION_VERBS[category]?.[intensity];
  if (!verbs) return null;
  return verbs[Math.floor(Math.random() * verbs.length)];
}

/**
 * 흥분도에 따른 동사 강도 결정
 */
export function getVerbIntensityByExcitement(excitement) {
  if (excitement < 30) return 'gentle';
  if (excitement < 70) return 'moderate';
  return 'rough';
}

/**
 * 캐릭터 조합별 워딩 가이드 생성
 */
export function generateWordingGuide(gongType, suType) {
  const gongRules = CHARACTER_WORDING_RULES.gong[gongType];
  const suRules = CHARACTER_WORDING_RULES.su[suType];
  
  return {
    gong: {
      type: gongType,
      allowedCategories: Object.keys(gongRules?.allowed || {}),
      forbidden: gongRules?.forbidden || [],
      tone: gongRules?.tone || '',
      moanStyle: gongRules?.moanStyle || 'default'
    },
    su: {
      type: suType,
      allowedCategories: Object.keys(suRules?.allowed || {}),
      forbidden: suRules?.forbidden || [],
      tone: suRules?.tone || '',
      moanStyle: suRules?.moanStyle || 'default'
    },
    dynamicNote: generateDynamicNote(gongType, suType)
  };
}

/**
 * 캐릭터 조합별 다이나믹 노트 생성
 */
function generateDynamicNote(gongType, suType) {
  const dynamics = {
    'intense-tsundere': '강렬한 충돌과 점진적 굴복. 수의 반항이 공의 가학성을 자극.',
    'intense-devoted': '일방적 지배. 수의 순응이 공의 소유욕을 더 자극.',
    'gentle-tsundere': '밀당의 향연. 수의 반항이 공의 놀리기를 유발.',
    'gentle-devoted': '달콤한 조화. 상호 애정 표현이 자유로움.',
    'cold-seductive': '온도 차이의 묘미. 수의 도발이 공의 냉담함을 깨뜨림.',
    'devoted-wounded': '보호와 치유. 공의 헌신이 수의 상처를 감싸안음.'
  };
  
  const key = `${gongType}-${suType}`;
  return dynamics[key] || '캐릭터 간 독특한 케미스트리 발생.';
}

/**
 * 문장 리듬 추천
 */
export function recommendRhythm(sceneType, excitement) {
  if (sceneType === 'intimate' && excitement > 80) {
    return SENTENCE_RHYTHM.irregular;
  }
  if (sceneType === 'intimate' && excitement > 50) {
    return SENTENCE_RHYTHM.tension;
  }
  if (sceneType === 'aftercare') {
    return SENTENCE_RHYTHM.relaxed;
  }
  return SENTENCE_RHYTHM.tension;
}

// ============================================================
// 기본 내보내기
// ============================================================

export default {
  BODY_TERMS,
  FLUID_TERMS,
  ACTION_VERBS,
  ONOMATOPOEIA,
  SENSORY_WORDING,
  CHARACTER_WORDING_RULES,
  SENTENCE_RHYTHM,
  TEMPO_CONTROL,
  EXTREME_TEMPLATES,
  getAllowedWording,
  isWordingAllowed,
  getRandomOnomatopoeia,
  getRandomActionVerb,
  getVerbIntensityByExcitement,
  generateWordingGuide,
  recommendRhythm
};