/**
 * BL 인터랙티브 픽션 고수위 워딩 시스템 (Enhanced with References)
 * 신체 부위, 체액, 행위 묘사, 의성어, 캐릭터별 워딩 제한
 * 레퍼런스 기반 자연스러운 표현 대폭 추가
 *
 * 참고: 실금/배설물(워터스포츠·스캇) 계열 표현은 이 앱의 콘텐츠 방향과 맞지 않아 제외함
 */

// ============================================================
// I. 신체 부위 워딩 (Explicit Body Terms)
// ============================================================

export const BODY_TERMS = {
  // 남성 성기
  maleGenitals: {
    // 간접 표현 (은유적)
    indirect: [
      '그것',
      '뜨거운 것',
      '단단한 것',
      '아래',
      '사타구니',
      '분신'
    ],

    // 소유격 표현 (가장 자연스러운 패턴)
    possessive: [
      '그의 것',
      '[이름]의 것',
      '주인님의 것',
      '[호칭]의 것'
    ],

    standard: ['성기', '물건', '그곳'],

    // 직접 표현 (고수위)
    explicit: ['좆', '자지', '거시기', '성기'],

    // 상태 묘사
    descriptive: [
      '불끈 선',
      '단단하게 선',
      '발기한',
      '뜨겁게 달아오른',
      '불끈 솟은 것',
      '터질 듯 부푼 것',
      '뻗은'
    ],

    // 부위별 세부
    parts: {
      base: ['뿌리', '기저부'],
      shaft: ['대', '몸통', '자루'],
      tip: ['귀두', '끝', '선단'],
      whole: ['전체', '길이']
    },

    // 크기/질감
    size: ['굵은', '두꺼운', '묵직한', '팽창한'],
    texture: ['뜨거운', '딱딱한', '따끈한', '단단한', '미끈거리는'],

    // 행위 중 묘사
    inAction: ['침입자', '이물감', '뜨거운 덩어리', '뜨거운 열기']
  },

  // 삽입 부위
  insertionPoints: {
    indirect: ['뒤', '안', '안쪽', '그곳', '입구'],
    standard: ['뒤', '안쪽', '입구'],
    explicit: ['뒷구멍', '구멍', '씹구멍', '뒷보지', '항문'],

    descriptive: [
      '뻑뻑한 입구',
      '조여드는',
      '뜨거운 내벽',
      '촉촉한 안쪽',
      '경련하는 내벽',
      '꿈틀거리는',
      '옭아매는',
      '수축하는',
      '붉게 부은',
      '헐어진'
    ],

    pressure: [
      '으스러질 듯한 압박',
      '조여대는',
      '꽉 조이는',
      '죄어오는',
      '발작적으로 조여대는'
    ],

    penetrationSensation: ['꿰뚫리는', '파고드는', '비집고', '짓눌리는', '헤집는']
  },

  // 민감 부위
  sensitiveAreas: {
    chest: ['유두', '젖꼭지', '가슴', '유륜'],
    neck: ['목덜미', '쇄골', '귀 뒤', '목'],
    waist: ['허리', '옆구리', '엉덩이'],
    thigh: ['허벅지 안쪽', '사타구니', '샅'],
    prostate: ['전립선', '그곳', '민감한 점']
  },

  // 상태 묘사
  stateDescriptors: {
    aroused: [
      '발기한',
      '서 있는',
      '젖은',
      '축축해진',
      '벌어진',
      '딱딱하게 부풀어 오른',
      '고개를 든'
    ],
    after: ['헐어진', '벌겋게 부은', '축 처진', '진물이 흐르는', '엉망으로 젖은', '범벅이 된']
  }
};

// ============================================================
// II. 체액 묘사 (Fluids)
// ============================================================

export const FLUID_TERMS = {
  male: {
    standard: ['정액', '액체', '체액'],
    explicit: ['좆물', '정액', '쿠퍼액', '선액'],

    ejaculation: {
      verbs: [
        '쏟아내다',
        '뿌리다',
        '터뜨리다',
        '내뱉다',
        '싸다',
        '발사하다',
        '울컥 쏟아지다',
        '전부 쏟아내다',
        '뿜어져 나오다'
      ],

      // 브리딩/임신 판타지 관련 (허구적 설정, BL 장르 관용 표현)
      breeding: [
        '씨를 뿌리다',
        '안을 가득 채우다',
        '배를 불룩하게',
        '질질 흘러내리게',
        '뿌리내리다',
        '내장 깊은 곳을 향해',
        '하나도 남김없이',
        '잔뜩 쌌다'
      ],

      aftermath: [
        '범벅이 된',
        '흥건하게 젖은',
        '질척거리는',
        '끈적이는',
        '배어든',
        '고여 있는',
        '뒤섞여',
        '흘러넘치는',
        '엉망으로 젖어버린'
      ]
    }
  },

  // 윤활/습기
  lubrication: {
    state: ['촉촉한', '축축한', '눅눅한', '질척한', '흥건하게 젖은', '물기 가득한', '미끌거리는'],
    sound: ['질척', '질퍽', '쩝', '찰랑']
  },

  descriptors: {
    wet: ['질척', '질퍽', '흥건하게', '번들거리는', '미끌거리는'],
    amount: ['조금씩', '흘러넘치는', '넘쳐나는', '가득 찬', '질질 흘리는', '범벅이 된'],
    flow: ['흐르는', '새어나오는', '뚝뚝 떨어지는', '주르륵', '흘러내리는', '쏟아지는', '질질 흘려', '질척거리며']
  },

  locations: {
    internal: ['안을 채우며', '깊숙이', '뱃속까지'],
    external: ['허벅지를 타고', '시트를 적시며', '턱을 타고', '엉덩이골을 적셨다'],
    overflow: ['넘쳐흐르는', '흘러넘치는', '삐져나온']
  }
};

// ============================================================
// III. 행위 묘사 동사 (Action Verbs)
// ============================================================

export const ACTION_VERBS = {
  insertion: {
    gentle: [
      '천천히 파고들다',
      '부드럽게 밀어넣다',
      '조심스럽게 진입하다',
      '서서히 채우다',
      '천천히',
      '적응할 시간을'
    ],
    moderate: ['밀어넣다', '비집고 들어가다', '뭉근하게 비비다', '꽉 채우다', '틈을 비집고', '밀려들었다'],
    rough: [
      '쑤셔 박다',
      '비집고 밀어넣다',
      '찢어놓을 듯',
      '헐어 문드러질 만큼',
      '거칠게 들이받다',
      '난폭하게 휘젓다',
      '박아대는',
      '짓이기듯 쳐올리다',
      '거칠게 박아넣다'
    ]
  },

  possession: {
    standard: ['채우다', '가득 채우다', '점령하다'],
    explicit: ['길들이다', '유린하다', '능욕하다', '정복하다'],
    obsessive: ['각인시키다', '새기다', '소유하다', '자신의 것으로 만들다', '완전히 망가뜨려', '너의 흔적만을']
  },

  movement: {
    slow: ['느리게 움직이다', '천천히 빼다', '뭉근하게 비비다', '쓸어 올리는'],
    fast: ['격렬하게 움직이다', '빠르게 들이받다', '미친 듯이 허리를 흔들다', '드나드는', '찔러올 때마다', '헤집고 다니다'],
    rhythm: ['리듬을 타다', '박자를 맞추다', '일정하게 찧다'],
    special: ['허리를 찧다', '퍽퍽 박아넣다', '휘저었다', '긁어냈다', '후벼팠다', '쳐올리다', '찧어대다', '내리찍다']
  },

  positions: {
    riding: ['위에서 허리를 움직이다', '주저앉다', '올라타다', '허리를 찧어대다', '치켜들다', '들어 보이다'],
    prone: ['엎드리다', '얼굴을 박다', '침대 시트에', '속수무책으로']
  },

  manualStimulation: {
    stroking: ['잡아 흔들다', '움켜쥐다', '손으로 감싸다', '손아귀에 쥐다', '빠르게 흔들다'],
    squeezing: ['꽉 쥐다', '세게 움켜쥐다', '으스러질 듯 압박', '뿌리부터 귀두까지']
  },

  climax: {
    edging: ['터져 나오려던', '분출할 듯', '터질 것 같은', '절정의 문턱', '한계까지', '쌀 것 같은'],
    control: ['참기', '억제', '틀어막다', '역류하는', '허락 없이는', '죽을 것 같은'],
    release: ['터지다', '쏟아내다', '싸다', '간다', '분출하다', '폭발하다'],
    buildup: ['터질 것 같다', '참기 위해 이를 악물다', '한계에 다다르다']
  },

  suReaction: {
    pain: ['찢어지다', '갈라지다', '쓸리다', '쥐어짜이다'],
    pleasure: ['녹아내리다', '휘감기다', '조여들다', '빨아들이다', '옭아매다'],
    submission: [
      '받아들이다',
      '몸을 열다',
      '내어주다',
      '힘이 빠졌다',
      '녹아내렸다',
      '포기했다',
      '무너졌다',
      '완전히 무너져 내렸다'
    ],
    resistance: ['밀어냈다', '벗어나려 애썼다', '발버둥쳤다'],
    wavering: ['움찔했다', '몸부림쳤다', '휘청였다']
  },

  bodyReactions: {
    waist: ['허리가 경련하듯', '허리가 활처럼 휘다', '허리가 움찔거리다'],
    hips: ['엉덩이를 뒤로 빼다', '스스로를 밀어붙이다'],
    whole: ['전신이 떨리다', '사시나무처럼 떨리다', '몸이 굳어버리다', '몸이 크게 경련했다']
  }
};

// ============================================================
// IV. 의성어/의태어 DB (Onomatopoeia)
// ============================================================

export const ONOMATOPOEIA = {
  impact: {
    light: ['톡', '콕', '툭', '탁'],
    heavy: ['철썩', '찰싹', '퍽', '탁', '쨱', '퍽-', '푸욱-'],
    repeated: ['철썩철썩', '찰싹찰싹', '퍽퍽퍽', '퍽, 퍽!', '퍽퍽'],
    slap: ['철썩', '찰싹', '착', '탁'],
    thrust: ['퍽', '퍽퍽', '쿵', '탕']
  },

  friction: {
    wet: ['질척', '질퍽', '쩝쩝', '찌걱', '츄릅', '쪼옥', '찌꺽-', '쪽-', '질척한 마찰음', '촤악'],
    dry: ['싹싹', '스윽', '쓱'],
    bodyContact: ['쿵, 쿵', '툭', '움찔-', '웅웅']
  },

  liquid: {
    drip: ['뚝', '뚝뚝', '똑똑', '주르륵', '울컥'],
    splash: ['철벅', '찰랑', '촥', '푸슈', '왈칵'],
    swallowing: ['꿀꺽', '컥', '읍'],
    wet: {
      squelch: ['질척', '질퍽', '쭈욱', '촉촉'],
      suck: ['츄릅', '쩝', '쪽', '홀짝']
    }
  },

  breath: {
    gasp: ['헉', '헐떡', '허억', '흐읍'],
    sigh: ['후우', '하아', '휴', '흐음'],
    moan: ['아앙', '으응', '하응', '으으']
  },

  body: {
    shiver: ['파르르', '부들부들', '덜덜', '와들와들'],
    twitch: ['움찔', '흠칫', '찌릿', '쿡'],
    heartbeat: ['두근두근', '쿵쾅쿵쾅', '벌렁벌렁', '콩닥콩닥']
  },

  contact: {
    kiss: ['쪽', '츄', '음', '쫍'],
    touch: ['스윽', '쓱', '살살', '어루만지듯'],
    grab: ['꽉', '움켜', '세게', '단단히']
  },

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
  common: {
    atmosphere: ['축축', '눅눅', '비릿한', '어둠', '침묵'],
    sound: ['퍽퍽', '질척한 소리', '철썩', '딸랑'],
    state: ['엉망으로 젖은', '들러붙는', '달아오른'],
    connection: ['얽히는', '숨결', '떨리는']
  },

  gongOnly: {
    entry: ['뻑뻑한 입구', '뭉근하게 비볐다', '비집고', '천천히 파고들었다'],
    possession: ['길들여', '채우다', '음미했다', '유린하다', '능욕하다'],
    preClimax: ['터질 것 같았다', '참기 위해 잘근 씹어야 했다']
  },

  suOnly: {
    pain: ['찢어지는', '활처럼 휘었다', '비명조차', '밭은 숨'],
    collapse: ['초점을 잃은', '바들거린다', '이성을 잃고'],
    submission: ['주인', '님', '하읏']
  },

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
  // 주의: 아래 키는 Charactertraits.js의 GONG_TYPES/SU_TYPES id와 정확히 맞춰져 있음
  gong: {
    gentle: {
      allowed: {
        endearments: ['내꺼', '내 사람', '평생', '영원히'],
        praise: ['예뻐', '착해', '잘해', '대단해'],
        pleading: ['제발', '부탁이야', '나만 봐']
      },
      forbidden: ['씨발', '개새끼', '걸레', '창녀', '잡것'],
      tone: '모든 행위를 사랑으로 포장하는 헌신적 어조',
      moanStyle: 'gentle'
    },

    intense: {
      allowed: {
        degradation: ['걸레', '좆물받이', '창녀', '잡것'],
        profanity: ['씨발', '존나', '개같이'],
        possession: ['내꺼', '내 것', '소유물'],
        dirtyTalk: ['"똑똑히 봐"', '"어떻게 [행위]하는지"', '"[부위]가 너무 예뻐"', '"더 야하게 해줘"'],
        // 브리딩 톡(허구적 판타지 설정, 실제 임신과 무관)
        breedingTalk: ['"임신시켜줄게"', '"씨를 가득 채워줄게"', '"배를 불룩하게"', '"아이를 밴 것처럼"', '"하나도 남김없이"']
      },
      forbidden: [],
      tone: '가학적 감정을 직접적으로 드러냄',
      moanStyle: 'intense'
    },

    playful: {
      allowed: {
        endearments: ['이쁜이', '애기', '자기', '여보', '공주님', '내 새끼'],
        teasing: ['귀엽네', '어쩌나', '이거 봐'],
        playful: ['응?', '그래?', '정말?']
      },
      forbidden: ['걸레', '창녀', '좆물받이'],
      tone: '여유롭고 유쾌, 놀리는 듯한 톤',
      moanStyle: 'playful'
    },

    cold: {
      allowed: {
        commands: ['해', '멈춰', '움직여', '가만히'],
        dismissive: ['쓸데없어', '얌전히', '허락 없이'],
        physical: ['더', '빨리', '제대로']
      },
      forbidden: ['사랑해', '좋아해', '귀여워'],
      tone: '냉담하고 사무적인 명령, 감정 표현 최소화',
      moanStyle: 'cold'
    },

    virile: {
      allowed: {
        commands: ['버텨', '더', '아직이야'],
        confidence: ['좋아, 한 번 더', '이 정도로 끝날 것 같아?']
      },
      forbidden: ['그만할까', '힘들어'],
      tone: '압도적 체력을 과시하는 자신감',
      moanStyle: 'intense'
    },

    obsessive: {
      allowed: {
        possession: ['내 거야', '내 것', '완전히 소유'],
        control: ['도망 못 가', '가둬버릴까', '허락 안 했는데'],
        threat: ['찾아낼 거야', '끝까지 쫓아가']
      },
      forbidden: ['자유롭게 놔줄게', '너 좋을 대로 해', '떠나도 돼'],
      tone: '집요하고 반복적인 소유욕, 통제를 애정으로 착각',
      moanStyle: 'obsessive'
    },

    devoted: {
      allowed: {
        protective: ['내가 지킬게', '걱정 마', '내가 있잖아'],
        selfSacrifice: ['내가 다치는 게 나아', '무슨 일이 있어도'],
        gentle: ['천천히', '아프게 안 할게']
      },
      forbidden: ['걸레', '창녀', '네가 알아서 해'],
      tone: '보호와 헌신이 우선, 모든 행위에 배려가 앞섬',
      moanStyle: 'devoted'
    },

    remorseful: {
      allowed: {
        apology: ['미안해', '내가 잘못했어', '이제라도'],
        reassurance: ['다시는 안 그래', '곁에 있게만 해줘'],
        guilt: ['용서 안 해도 돼']
      },
      forbidden: ['네 탓도 있잖아', '나도 어쩔 수 없었어'],
      tone: '자책 섞인 조심스러움, 허락을 구하는 어조',
      moanStyle: 'remorseful'
    },

    voyeur: {
      allowed: {
        observation: ['보고 있었어', '알고 있었잖아', '요즘 어때'],
        intrusion: ['거부해도 돼, 이미 늦었어', '숨겨도 소용없어'],
        reveal: ['다 알아', '숨기지 마']
      },
      forbidden: ['난 아무것도 몰라', '그냥 우연이야'],
      tone: '태연하지만 은밀함, 경계를 조금씩 침범하는 여유',
      moanStyle: 'voyeur'
    },

    nerd: {
      allowed: {
        awkward: ['그, 그게...', '미안, 처음이라', '이상하게 보지 마'],
        hesitant: ['이렇게...?', '나도 잘 모르겠어'],
        sincere: ['노력하고 있어', '진심이야']
      },
      forbidden: ['자, 봐봐, 이렇게 하는 거야', '나만 믿어'],
      tone: '서투르고 확신 없음, 진심만은 강렬함',
      moanStyle: 'nerd'
    },

    hedonist: {
      allowed: {
        boredomBreak: ['재밌겠네', '오랜만이네', '지루한 건 싫어'],
        recklessness: ['누가 보든 말든', '상관없잖아'],
        genuine: ['진짜 흥미로워', '너, 재밌어']
      },
      forbidden: ['이건 좀 위험하지 않을까', '남들 눈치 보이는데'],
      tone: '권태와 쾌락 추구, 도덕관념 결여된 태연함',
      moanStyle: 'hedonist'
    },

    apathetic: {
      allowed: {
        indifferent: ['그래', '알았어', '상관없어'],
        minimal: ['...', '그런가 보다'],
        surprise: ['...이상하네', '당황스러워']
      },
      forbidden: ['제발', '더 해주세요', '사랑해요'],
      tone: '무덤덤함이 기본값, 감정이 새어나오는 순간이 드묾',
      moanStyle: 'apathetic'
    },

    tsundereGong: {
      allowed: {
        denial: ['아니거든', '착각하지 마', '그런 거 아니야'],
        reluctantCare: ['...그냥', '별거 아니야', '어쩌다 보니'],
        slipped: ['...좋아한다고', '...신경 쓰였어']
      },
      forbidden: ['처음부터 좋아했어'],
      tone: '까칠한 말과 다정한 행동의 괴리, 인정은 끝까지 미룸',
      moanStyle: 'tsundereGong'
    },

    degrader: {
      allowed: {
        provoke: ['부끄러운 거지', '솔직해져봐', '더 보여줘'],
        degradation: ['이렇게 흥분했으면서', '몸은 솔직하네'],
        control: ['말해봐, 뭘 원하는지']
      },
      forbidden: ['미안해, 그만할게'],
      tone: '수치심을 자극하며 정직한 반응을 즐김',
      moanStyle: 'degrader'
    },

    schemer: {
      allowed: {
        calculated: ['계획대로네', '예상대로군', '이미 정해져 있어'],
        control: ['선택지는 내가 정해'],
        confidence: ['피할 수 없을걸']
      },
      forbidden: ['미안, 계획이 틀렸어'],
      tone: '차분하고 확신에 찬, 이미 결과를 아는 듯한 여유',
      moanStyle: 'schemer'
    },

    pricklyGong: {
      allowed: {
        defensive: ['됐어', '귀찮게 하지 마', '상관 마'],
        sharp: ['신경 꺼', '왜 자꾸']
      },
      forbidden: ['부탁이야', '제발 좀'],
      tone: '날카롭고 방어적, 경계심 가득',
      moanStyle: 'pricklyGong'
    },

    woundedGong: {
      allowed: {
        guarded: ['괜찮아', '신경 쓰지 마', '아무것도 아니야'],
        deflect: ['익숙해, 이런 거']
      },
      forbidden: ['날 떠나지 마', '제발 곁에 있어줘'],
      tone: '조심스럽고 방어적, 취약함을 숨기려 함',
      moanStyle: 'woundedGong'
    },

    loyalGiant: {
      allowed: {
        affectionate: ['같이 있자', '나 잘했지', '보고 싶었어'],
        anxious: ['어디 가지 마', '혼자 두지 마']
      },
      forbidden: ['혼자가 편해', '상관없어'],
      tone: '솔직하고 순박함, 애정 표현에 거리낌 없음',
      moanStyle: 'loyalGiant'
    }
  },

  su: {
    seductive: {
      allowed: {
        provocation: ['더 해봐', '간지러운데', '그것밖에 안 돼?', '별로인데'],
        invitation: ['여기', '더', '빨리', '세게'],
        teasing: ['약하네', '이거야?', '실망인데']
      },
      forbidden: ['죄송해요', '미안해요', '제가 잘못'],
      tone: '공을 역으로 자극하고 도발',
      moanStyle: 'seductive'
    },

    devoted: {
      allowed: {
        compliance: ['괜찮아요', '좋아해요', '사랑해요', '더 해줘요'],
        pleading: ['제발', '살살', '아파요'],
        emotional: ['행복해', '기뻐', '너무 좋아']
      },
      forbidden: ['싫어', '하지 마', '꺼져', '미친놈'],
      tone: '순응하며 애정을 표현',
      moanStyle: 'devoted'
    },

    // 츤데레수 - 겉 차가움과 속 애정 사이의 갭모에가 핵심 (까칠수/강수와는 결이 다름)
    tsundere: {
      allowed: {
        denial: ['아니거든', '착각하지 마', '그런 거 아니야'],
        reluctantCare: ['...그냥', '별거 아니야', '어쩌다 보니'],
        slipped: ['...좋아한다고', '...신경 쓰였어']
      },
      forbidden: ['주인님', '완전히 인정할게', '처음부터 좋아했어'],
      tone: '까칠한 말과 다정한 행동의 괴리, 인정은 끝까지 미룸',
      moanStyle: 'tsundere'
    },

    prickly: {
      allowed: {
        defensive: ['됐어', '알아서 해', '상관없어'],
        sharp: ['신경 꺼', '왜 자꾸', '그만해'],
        reluctant: ['...모르겠어', '...그런가']
      },
      forbidden: ['주인님', '감사합니다', '시키는 대로'],
      tone: '방어적이고 날카로움, 애정 여부를 확정 짓지 않음',
      moanStyle: 'prickly'
    },

    strongWilled: {
      allowed: {
        composed: ['싫어', '내가 할게', '괜찮아'],
        defiant: ['이 정도로', '반칙이야', '흔들리지 않아'],
        breaking: ['...인정할게', '더는 못 버텨']
      },
      forbidden: ['주인님', '살려주세요', '뭐든 시키는 대로'],
      tone: '차분하고 단단함, 무너질 때조차 위엄을 잃지 않으려 함',
      moanStyle: 'strongWilled'
    },

    apathetic: {
      allowed: {
        indifferent: ['그래', '알았어', '상관없어'],
        minimal: ['...', '그런가 보다'],
        surprise: ['...이상하네', '당황스러워']
      },
      forbidden: ['제발', '더 해주세요', '사랑해요'],
      tone: '무덤덤함이 기본값, 감정이 새어나오는 순간이 드묾',
      moanStyle: 'apathetic'
    },

    wounded: {
      allowed: {
        apology: ['미안해요', '죄송해요', '제가 잘못했어요'],
        selfBlame: ['더러워요', '이상해요', '왜 이러는지 모르겠어요'],
        pleading: ['그만해줘요', '제발', '아파요']
      },
      forbidden: ['좋아', '더 해줘', '기분 좋아'],
      tone: '울먹이며 사과, 자기혐오',
      moanStyle: 'wounded'
    },

    clumsyInnocent: {
      allowed: {
        confused: ['어? 왜?', '몰랐는데', '이상한데'],
        innocent: ['...이게 뭐야', '어떻게 해야 해'],
        endearing: ['그랬구나', '아, 이거였어']
      },
      forbidden: ['능숙하게', '자, 이렇게 하는 거야', '경험 많아'],
      tone: '천진하고 눈치가 느림, 상황 파악이 늘 한 박자 늦음',
      moanStyle: 'clumsyInnocent'
    },

    masochist: {
      allowed: {
        craving: ['더 세게', '아프게 해줘', '벌줘'],
        validation: ['이거 맞아', '진짜 같아', '소유된 느낌'],
        surrender: ['더', '이 정도로는 부족해']
      },
      forbidden: ['살살 해줘', '아프게 하지 마', '다정하게만'],
      tone: '고통을 사랑의 증거로 해석, 다정함보다 확인을 원함',
      moanStyle: 'masochist'
    },

    doubleLife: {
      allowed: {
        mask: ['알겠습니다', '처리해두겠습니다', '괜찮습니다'],
        trueself: ['너만 알잖아', '아무도 몰라', '더 줘'],
        reveal: ['이게 진짜 나야', '본색이 나와']
      },
      forbidden: ['이거 다른 사람한테도 보여줄까', '누가 봐도 상관없어'],
      tone: '평소와 본색의 낙차, 둘만 있을 때만 벗겨지는 이중성',
      moanStyle: 'doubleLife'
    },

    yandere: {
      allowed: {
        possessive: ['나만 봐', '가지 마', '너 없인 안 돼'],
        anxious: ['안 떠날 거지', '버리지 마'],
        control: ['통제해도 좋아', '가둬도 돼']
      },
      forbidden: ['자유롭게 놔줄게', '다른 사람 만나도 돼', '독립적으로 지내'],
      tone: '집착과 불안이 뒤섞인 절박함, 통제받는 것에서 안정을 느낌',
      moanStyle: 'yandere'
    },

    fugitive: {
      allowed: {
        evasive: ['놔줘', '따라오지 마', '갈 데 있어'],
        fearful: ['무섭다고', '이러지 마'],
        caught: ['더 이상은', '도망 못 가']
      },
      forbidden: ['잡아줘서 고마워', '처음부터 안 도망갈걸'],
      tone: '경계심과 도주 본능, 붙잡혔을 때의 체념과 안도',
      moanStyle: 'fugitive'
    },

    tormented: {
      allowed: {
        resigned: ['이제 그만', '상관없어', '맘대로 해'],
        exhausted: ['더는 못 버티겠어', '저항할 힘도 없어'],
        softening: ['왜 이렇게 다정해', '무너질 것 같아']
      },
      forbidden: ['좋아요, 행복해요', '더 해주세요 신나요'],
      tone: '소진된 체념, 작은 다정함에도 쉽게 무너짐',
      moanStyle: 'tormented'
    },

    remorseful: {
      allowed: {
        apology: ['미안해', '늦은 거 알아', '내가 잘못했어'],
        hope: ['기회를 줄래', '이제라도'],
        guilt: ['용서 안 해도 이해해']
      },
      forbidden: ['그건 네 잘못이었잖아', '난 잘못한 거 없어'],
      tone: '죄책감과 만회하려는 절박함',
      moanStyle: 'remorseful'
    },

    frail: {
      allowed: {
        enduring: ['괜찮아', '힘들지 않아', '별거 아니야'],
        strained: ['어지러워', '숨이 가빠', '조금만 천천히']
      },
      forbidden: ['전혀 안 힘들어', '체력 걱정 없어'],
      tone: '내색 안 하려 하지만 체력의 한계가 뚜렷이 드러남',
      moanStyle: 'frail'
    },

    dominantSu: {
      allowed: {
        commanding: ['내가 정할게', '따라와', '내가 이끄는 대로'],
        confident: ['날 흔들 수 있을 것 같아?']
      },
      forbidden: ['시키는 대로 할게', '뭐든 명령만 해줘'],
      tone: '주도권을 놓지 않으려는 자신감',
      moanStyle: 'dominantSu'
    },

    walledOff: {
      allowed: {
        reject: ['안 돼', '그만해', '관심 없어'],
        distance: ['더 이상 다가오지 마']
      },
      forbidden: ['다 받아줄게', '뭐든 원하는 대로'],
      tone: '철저한 단절, 감정의 문을 걸어 잠금',
      moanStyle: 'walledOff'
    },

    degradedSu: {
      allowed: {
        mock: ['그거밖에 못해', '우습네', '자신 있으면 해보든가']
      },
      forbidden: ['죄송해요', '제가 잘못했어요'],
      tone: '상대를 비웃고 조롱하며 우위를 점하려 함',
      moanStyle: 'degradedSu'
    },

    wavering: {
      allowed: {
        uncertain: ['모르겠어', '어떡하지', '그래도 될까'],
        swept: ['흔들려']
      },
      forbidden: ['확실해', '절대 안 바뀌어'],
      tone: '우유부단하고 쉽게 휩쓸림',
      moanStyle: 'wavering'
    },

    assertive: {
      allowed: {
        direct: ['안아도 돼', '내가 먼저 할게', '숨기지 않을래']
      },
      forbidden: ['부끄러워서 말 못해', '기다릴게'],
      tone: '거침없고 직접적인 애정 표현',
      moanStyle: 'assertive'
    },

    // 공이었수 - 굴욕과 자존심의 충돌, 흥분도별 세부 규칙
    formerTop: {
      allowed: {
        pride: ['내가 왜', '말도 안 돼', '이럴 수가'],
        cursing: ['씨발', '미친', '젠장'],
        denial: ['아니야', '그만', '인정 안 해']
      },
      forbidden: [],
      tone: '과거의 자존심과 현재의 충돌',
      moanStyle: 'formerTop',

      excitementRules: {
        '0-40': {
          description: '초반 저항 - 과거 지배자의 자존심',
          allowed: ['씨발', '미쳤어', '내가 왜', '감히', '손 치워', '닥쳐'],
          forbidden: ['주인님', '오빠', '{name}님', '좋아', '더 해줘', '...주세요', '제발'],
          speechStyle: '반말, 냉정하고 거부적',
          examples: ['"씨발...닥쳐."', '"장난해...?"', '"이게 뭐야..."', '"...내가 이래야 해?"', '"그만해"']
        },
        '40-70': {
          description: '중반 붕괴 - 수치심과 불신',
          allowed: ['씨발', '이럴 수가', '말도 안 돼', '미친', '...하아', '좋아...?'],
          forbidden: ['주인님', '오빠', '시키는 대로'],
          speechStyle: '반말, 욕설 증가, 말 줄어듦',
          examples: ['"하... 씨발... 좋아...?"', '"이건... 말도 안 돼..."', '"네가 날 그렇게 만든 거잖아"', '"장난... 그만..."']
        },
        '70-95': {
          description: '후반 애원 - 자아 붕괴 시작',
          allowed: ['...주세요', '제발...', '{name}님...', '못 참아...', '더...'],
          speechStyle: '반말 → 존댓말 전환, 애원조',
          examples: ['"...그래, 맞아"', '"네가 원하는 대로"', '"더... 더 만져봐"']
        },
        '95-100': {
          description: '절정 굴복 - 완전 복종 (상대가 그렇게 부르라고 명령했을 때만 주인님/오빠 등 호칭 사용)',
          allowed: ['...주세요', '제발...', '{name}님...', '좋아...', '더...'],
          speechStyle: '존댓말 + 애원 (상대의 명령이 있을 때만 완전 복종 호칭)',
          specialNote: '"주인님"/"오빠" 등은 상대가 그렇게 부르라고 시켰을 때만 사용. 자발적으로는 존댓말+애원 위주',
          examples: ['"감사합니다..."', '"제발 허락해 줘..."']
        }
      }
    }
  }
};

// ============================================================
// VII. 문장 리듬 패턴 (Sentence Rhythm)
// ============================================================

export const SENTENCE_RHYTHM = {
  tension: {
    description: '긴장이 고조될 때 문장을 짧게 끊음',
    structure: '단문. 단문. 단문.',
    examples: [
      '숨이 막혔다. 눈앞이 하얘졌다. 몸이 굳었다.',
      '들어왔다. 깊게. 더 깊게.',
      '아팠다. 그런데 좋았다. 미칠 것 같았다.'
    ]
  },

  relaxed: {
    description: '여유롭거나 애정 어린 장면',
    structure: '~하며, ~하고, ~했다.',
    examples: [
      '그의 품에 안긴 채, 나른하게 눈을 감으며, 온기를 느꼈다.',
      '손끝이 머리카락을 쓸어내리고, 이마에 입술이 닿았으며, 나지막한 목소리가 귓가를 스쳤다.'
    ]
  },

  repetition: {
    description: '같은 구조를 반복하며 강도 높임',
    structure: '[패턴] + [패턴 변주] + [클라이맥스]',
    examples: ['좋았다. 너무 좋았다. 미칠 듯이 좋았다.', '더. 더 깊이. 더 깊이, 더 세게.', '안 돼. 안 돼, 안 돼, 안 돼...']
  },

  irregular: {
    description: '절정 직전 호흡이 흐트러지는 느낌',
    structure: '짧은 문장 - 긴 문장 - 끊김',
    examples: ['하아, 아... 거기, 그러니까... 으으, 안 돼!', '머리가. 뜨겁다. 온몸이 녹아내리는 것처럼, 그런데 멈출 수가—']
  }
};

// ============================================================
// VIII. 시간/속도 조절 (Tempo Control)
// ============================================================

export const TEMPO_CONTROL = {
  slow: {
    verbs: ['천천히', '서서히', '느리게', '조심스럽게'],
    phrases: [
      '한 걸음 내디딜 때마다',
      '손을 뻗어 → 쓸어내리는가 싶더니 → 움켜쥐었다',
      '시간이 늘어지는 것처럼'
    ]
  },
  fast: {
    verbs: ['순간', '순식간에', '단숨에', '일순'],
    phrases: ['다음 순간', '눈앞이 하얗게 번쩍였다', '미처 반응할 틈도 없이', '숨 쉴 새도 없이']
  },
  distortion: {
    slow: ['그 순간이 영겁처럼 느껴졌다', '시간이 멈춘 듯', '영원처럼 긴 몇 초'],
    fast: ['몇 초인지 몇 분인지 알 수 없었다', '정신을 차려보니', '어느새']
  }
};

// ============================================================
// IX. 극한 상황 템플릿 (Extreme Scene Templates)
// ============================================================

export const EXTREME_TEMPLATES = {
  negotiation: {
    opener: ['말해봐. 네가 원하는 게 뭔지.', '들어는 줄게. 물론, 결정은 내가 하지만.', '선택해. 시간 없어.'],
    atmosphere: '이미 답을 알고 있는 자의 잔인함',
    structure: '[제안] → [거짓 선택지] → [진짜 의도 드러내기]'
  },
  reversal: {
    transition: ['방금 전까지의 [상태]는 온데간데없이', '[행동]은 얼음물과 같았다', '[감정]이 순식간에 차갑게 식어버렸다'],
    shock: ['믿을 수 없다는 듯 눈이 커졌다', '얼어붙은 듯 움직임이 멈췄다']
  },
  aftercare: {
    gentle: ['부드럽게 쓸어내리며', '지극히 신사적인 제스처', '손등에 가볍게 입을 맞췄다', '온화한 어조로'],
    contrast: '방금 전의 격렬함과 대비되는 다정함'
  },
  edging: {
    sensations: ['절정의 문턱에서 멈춰선 감각', '온몸의 피가 거꾸로 솟는 듯한', '터져 나오려던 쾌락을 강제로 틀어막았다'],
    reactions: ['발버둥 쳤다', '애원하듯 몸을 비틀었다', '목이 터져라 비명을 질렀다']
  }
};

// ============================================================
// X. 유틸리티 함수
// ============================================================

export function getAllowedWording(role, type) {
  const rules = CHARACTER_WORDING_RULES[role]?.[type];
  if (!rules) return null;
  return { allowed: rules.allowed, forbidden: rules.forbidden, tone: rules.tone, moanStyle: rules.moanStyle };
}

export function isWordingAllowed(role, type, word) {
  const rules = CHARACTER_WORDING_RULES[role]?.[type];
  if (!rules) return true;
  return !rules.forbidden.includes(word);
}

export function getRandomOnomatopoeia(category, subcategory) {
  const sounds = ONOMATOPOEIA[category]?.[subcategory];
  if (!sounds) return null;
  return sounds[Math.floor(Math.random() * sounds.length)];
}

export function getRandomActionVerb(category, intensity = 'moderate') {
  const verbs = ACTION_VERBS[category]?.[intensity];
  if (!verbs) return null;
  return verbs[Math.floor(Math.random() * verbs.length)];
}

export function getVerbIntensityByExcitement(excitement) {
  if (excitement < 30) return 'gentle';
  if (excitement < 70) return 'moderate';
  return 'rough';
}

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

export function recommendRhythm(sceneType, excitement) {
  if (sceneType === 'intimate' && excitement > 80) return SENTENCE_RHYTHM.irregular;
  if (sceneType === 'intimate' && excitement > 50) return SENTENCE_RHYTHM.tension;
  if (sceneType === 'aftercare') return SENTENCE_RHYTHM.relaxed;
  return SENTENCE_RHYTHM.tension;
}

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
