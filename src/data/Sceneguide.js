/**
 * 19씬 창의적 다양화 시스템
 * 장소, 도구, 환경 변수, 조합 규칙 정의
 * 
 * 핵심 원칙:
 * 1. 장소는 매번 다르게
 * 2. 도구는 창의적으로 조합 (0~3개)
 * 3. 환경 요소 최소 2가지 포함
 * 4. 예측 불가능하게
 */

// ============================================================
// 장소 데이터베이스
// ============================================================

export const LOCATIONS = {
  // A. 사적 공간 (안전도 ★★★★★)
  private: {
    safetyLevel: 5,
    locations: [
      { id: 'bedroom', name: '침실', features: ['푹신한 침대', '어둠', '완전한 프라이버시'] },
      { id: 'bathroom', name: '욕실/샤워실', features: ['물소리', '습한 공기', '미끄러운 타일'] },
      { id: 'living_room', name: '거실/소파', features: ['넓은 공간', '푹신한 쿠션', '창문 빛'] },
      { id: 'kitchen', name: '주방', features: ['차가운 대리석', '얼음/음식 접근', '날카로운 물건'] },
      { id: 'study', name: '서재', features: ['책냄새', '가죽 의자', '정적'] },
      { id: 'balcony_home', name: '발코니(자택)', features: ['야외 공기', '도시 소음', '들킬 위험'] },
      { id: 'dressing_room', name: '드레스룸', features: ['거울', '좁은 공간', '옷 향기'] },
      { id: 'basement', name: '지하실', features: ['냉기', '울림', '격리'] },
      { id: 'attic', name: '다락방', features: ['먼지', '은밀함', '좁은 공간'] },
      { id: 'home_gym', name: '홈짐', features: ['운동 기구', '땀 냄새', '거울'] },
      { id: 'home_theater', name: '홈 시어터', features: ['어둠', '영화 소리', '푹신한 좌석'] },
      { id: 'bathtub', name: '욕조 안', features: ['따뜻한 물', '거품', '좁은 공간'] },
      { id: 'private_sauna', name: '개인 사우나', features: ['뜨거움', '땀', '수증기'] },
      { id: 'pool_villa', name: '풀빌라 수영장', features: ['물', '야외', '밤하늘'] }
    ]
  },

  // B. 반사적 공간 (안전도 ★★★☆☆)
  semiPrivate: {
    safetyLevel: 3,
    locations: [
      { id: 'office', name: '사무실', features: ['책상', '형광등', '창밖 야경'] },
      { id: 'conference_room', name: '회의실', features: ['긴 테이블', '블라인드', '유리벽'] },
      { id: 'ceo_office', name: '사장실', features: ['권력', '가죽 소파', '도시 전경'] },
      { id: 'secretary_room', name: '비서실', features: ['붙어있는 공간', '언제든 들어올 수'] },
      { id: 'locker_room', name: '탈의실', features: ['락커', '좁은 벤치', '샤워 소리'] },
      { id: 'storage', name: '창고/물품보관실', features: ['어둠', '먼지', '선반'] },
      { id: 'car_sedan', name: '차량(세단)', features: ['좁음', '가죽 시트', '창문'] },
      { id: 'car_suv', name: '차량(SUV)', features: ['뒷좌석 넓음', '뒷문 프라이버시'] },
      { id: 'car_limo', name: '리무진', features: ['칸막이', '미니바', '넓은 공간'] },
      { id: 'hotel_room', name: '호텔방', features: ['청결', '익명성', '룸서비스 가능'] },
      { id: 'motel', name: '모텔', features: ['은밀함', '다양한 테마', '미러'] },
      { id: 'love_hotel', name: '러브호텔', features: ['각종 기구', '테마룸', '완벽한 방음'] },
      { id: 'pension', name: '펜션', features: ['자연', '바베큐', '프라이빗'] },
      { id: 'backstage', name: '백스테이지', features: ['공연 소음', '어둠', '긴장감'] },
      { id: 'makeup_room', name: '분장실', features: ['조명', '거울', '의상'] },
      { id: 'practice_room', name: '연습실', features: ['거울벽', '바닥', '음악'] },
      { id: 'studio', name: '스튜디오', features: ['조명 장비', '넓은 공간', '소음 차단'] },
      { id: 'fitting_room', name: '피팅룸', features: ['거울', '좁음', '커튼 하나'] },
      { id: 'infirmary', name: '의무실/보건실', features: ['침대', '커튼', '약품 냄새'] },
      { id: 'private_ward', name: '개인 병실', features: ['병원 냄새', '간호사 순찰', 'IV 스탠드'] },
      { id: 'vip_lounge', name: 'VIP 라운지', features: ['프라이빗', '고급', '서비스'] },
      { id: 'club_vip', name: '클럽 VIP룸', features: ['음악', '어둠', '소파'] },
      { id: 'bar_private', name: '바 개인실', features: ['술', '조명', '프라이버시'] }
    ]
  },

  // C. 공공/위험 공간 (안전도 ★☆☆☆☆)
  public: {
    safetyLevel: 1,
    locations: [
      { id: 'restroom_stall', name: '화장실 칸', features: ['좁음', '발소리', '문 틈'] },
      { id: 'elevator', name: '엘리베이터', features: ['밀착', '카메라', '언제 열릴지'] },
      { id: 'emergency_stairs', name: '비상계단', features: ['울림', '차가움', '발소리'] },
      { id: 'corridor_night', name: '복도(늦은 밤)', features: ['형광등', '발소리', '문 소리'] },
      { id: 'parking_lot', name: '주차장', features: ['차 사이', 'CCTV', '발소리 울림'] },
      { id: 'rooftop', name: '옥상', features: ['바람', '도시 전경', '문 하나'] },
      { id: 'park_bench', name: '공원 벤치 뒤', features: ['수풀', '어둠', '산책객'] },
      { id: 'alley', name: '골목길', features: ['벽', '어둠', '가로등'] },
      { id: 'building_back', name: '건물 뒷편', features: ['쓰레기통', '어둠', '은밀'] },
      { id: 'library_stacks', name: '도서관 서가 사이', features: ['정적', '책냄새', '발소리'] },
      { id: 'classroom_after', name: '강의실(방과후)', features: ['책상', '칠판', '복도 소리'] },
      { id: 'gym_storage', name: '체육관 창고', features: ['매트', '기구', '땀냄새'] },
      { id: 'pool_locker', name: '수영장 탈의실', features: ['물기', '타일', '락커'] },
      { id: 'gym_shower', name: '헬스장 샤워실', features: ['물소리', '수증기', '타인'] },
      { id: 'cinema_back', name: '영화관 맨 뒷자리', features: ['어둠', '영화 소리', '사람들'] },
      { id: 'karaoke', name: '노래방', features: ['음악', '마이크', '소파'] },
      { id: 'pc_cafe', name: 'PC방 커플석', features: ['파티션', '키보드 소리', '조명'] },
      { id: 'convenience_store', name: '편의점 화장실', features: ['좁음', '형광등', '손님'] },
      { id: 'club_corner', name: '클럽 구석', features: ['음악', '사람들', '어둠'] },
      { id: 'bar_restroom', name: '술집 화장실', features: ['취기', '좁음', '문 두드림'] }
    ]
  },

  // D. 특수/판타지 공간
  special: {
    safetyLevel: 'variable',
    locations: [
      { id: 'yacht', name: '요트 선실', features: ['흔들림', '바다', '고립'] },
      { id: 'cruise', name: '크루즈 선실', features: ['럭셔리', '파도', '밤바다'] },
      { id: 'camping_car', name: '캠핑카', features: ['좁음', '자연', '완전한 프라이버시'] },
      { id: 'tent', name: '텐트 안', features: ['얇은 천', '자연 소리', '땅바닥'] },
      { id: 'mountain_cabin', name: '산장/별장', features: ['고립', '자연', '벽난로'] },
      { id: 'onsen', name: '온천/료칸', features: ['뜨거운 물', '다다미', '일본식'] },
      { id: 'train_cabin', name: '기차 개인실', features: ['흔들림', '창밖 풍경', '좁음'] },
      { id: 'airplane', name: '비행기 화장실/일등석', features: ['매우 좁음', '고도', '승무원'] },
      { id: 'lab', name: '대학 연구실', features: ['실험 기구', '야간', '정적'] },
      { id: 'hospital_duty', name: '병원 당직실', features: ['좁은 침대', '호출 가능', '피로'] },
      { id: 'tatami_room', name: '술집 다다미방', features: ['좌식', '취기', '미닫이문'] },
      { id: 'rooftop_night', name: '빌딩 옥상(밤)', features: ['도시 야경', '바람', '별'] },
      { id: 'construction', name: '공사장/빈 건물', features: ['위험', '먼지', '야생적'] },
      { id: 'jjimjilbang', name: '찜질방 수면실', features: ['어둠', '사람들', '체온'] },
      { id: 'spa', name: '스파/마사지샵', features: ['오일', '음악', '향기'] },
      { id: 'music_room', name: '학교 음악실', features: ['피아노', '방음', '방과후'] },
      { id: 'art_room', name: '학교 미술실', features: ['이젤', '물감 냄새', '모델'] },
      { id: 'staff_room', name: '교무실(야근)', features: ['책상', '야간', '권위'] }
    ]
  }
};

// ============================================================
// 장소별 필수 특성
// ============================================================

export const LOCATION_PROPERTIES = {
  materials: {
    cold: ['타일', '대리석', '금속', '유리', '콘크리트'],
    soft: ['침대', '소파', '쿠션', '카펫', '매트'],
    rough: ['벽면', '나무', '콘크리트', '벽돌'],
    slippery: ['유리', '타일(물기)', '오일', '얼음']
  },
  sounds: {
    echo: ['화장실', '계단', '지하실', '주차장'],
    creaking: ['침대', '나무 바닥', '의자'],
    footsteps: ['복도', '계단', '타일'],
    muffled: ['카펫', '방음실', '차량']
  },
  temperature: {
    hot: ['샤워실', '사우나', '여름 옥상', '난방 방'],
    cold: ['지하실', '대리석', '겨울 옥상', '냉동실'],
    variable: ['욕조(물 온도)', '야외', '차량(에어컨)']
  },
  riskLevel: {
    safe: ['자택', '호텔', '러브호텔'],
    moderate: ['사무실(야간)', '차량', 'VIP룸'],
    dangerous: ['화장실', '공공장소', '엘리베이터']
  }
};

// ============================================================
// 도구 데이터베이스
// ============================================================

export const TOOLS = {
  // A. 속박/구속 도구군
  bondage: {
    bdsm: [
      { id: 'leather_cuffs', name: '가죽 수갑', desc: '손목이나 발목을 감싸는 부드러운 가죽 구속구' },
      { id: 'metal_cuffs', name: '금속 수갑', desc: '차가운 금속이 딸깍 소리와 함께 채워지는' },
      { id: 'ankle_cuffs', name: '족쇄', desc: '발목을 고정하는 무거운 구속구' },
      { id: 'spreader_bar', name: '스프레더 바', desc: '금속 막대 양 끝에 고정 장치가 달려 다리를 벌린 채 고정하는' },
      { id: 'bondage_rope', name: '본디지 로프', desc: '부드럽지만 단단한 로프로 복잡한 패턴을 그리며 묶는' },
      { id: 'bondage_tape', name: '본디지 테이프', desc: '피부에 붙지 않고 자기끼리만 붙는 특수 테이프' },
      { id: 'chain', name: '체인', desc: '금속 고리가 연결된 차가운 사슬' },
      { id: 'collar_leash', name: '목줄과 목걸이', desc: '목에 두르는 가죽 목걸이와 거기 연결된 줄' }
    ],
    everyday: [
      { id: 'necktie', name: '넥타이', desc: '비단 넥타이의 부드러움이 손목을 감싸는' },
      { id: 'belt', name: '벨트', desc: '가죽 벨트가 단단히 조여지는' },
      { id: 'scarf', name: '스카프', desc: '부드러운 천이 시야를 가리거나 손목을 묶는' },
      { id: 'stockings', name: '스타킹', desc: '얇고 질긴 천이 살을 조이는' },
      { id: 'shirt', name: '셔츠', desc: '찢어진 셔츠 조각으로 묶는' },
      { id: 'cable', name: '전선/케이블', desc: '단단한 선이 피부에 자국을 남기며' },
      { id: 'curtain_tie', name: '커튼 끈', desc: '장식용 끈이 본래 용도와 다르게' },
      { id: 'ribbon', name: '리본', desc: '예쁜 리본이 아이러니하게도' }
    ]
  },

  // B. 감각 차단/증폭 도구군
  sensory: {
    bdsm: [
      { id: 'leather_blindfold', name: '가죽 안대', desc: '두꺼운 가죽이 완전히 시야를 차단하는' },
      { id: 'eye_mask', name: '아이 마스크', desc: '부드러운 천으로 된 안대' },
      { id: 'ball_gag', name: '볼 개그', desc: '입 안 깊숙이 공 모양의 재갈을 물리자 말을 할 수 없는' },
      { id: 'ring_gag', name: '링 개그', desc: '입을 벌린 채 고정하는 링 형태의 재갈, 침이 흘러내리는' },
      { id: 'bit_gag', name: '비트 개그', desc: '말의 재갈처럼 생긴 막대를 입에 무는' },
      { id: 'leather_hood', name: '가죽 후드', desc: '머리 전체를 덮는 가죽 마스크' },
      { id: 'earplugs', name: '귀마개', desc: '소리마저 차단되어 촉각만 남는' }
    ],
    everyday: [
      { id: 'handkerchief', name: '손수건', desc: '부드러운 천이 입이나 눈을 가리는' },
      { id: 'towel', name: '수건', desc: '푹신한 수건이 시야를 막는' },
      { id: 'pillow', name: '베개', desc: '얼굴을 묻거나 소리를 막는' },
      { id: 'earphone', name: '이어폰', desc: '음악이 다른 모든 소리를 덮는' },
      { id: 'muffler', name: '목도리', desc: '부드러운 울이 감각을 둔하게' },
      { id: 'mask', name: '마스크', desc: '숨이 갇히는 느낌' }
    ]
  },

  // C. 성적 자극/쾌락 도구군 (BL 특화)
  stimulation: {
    insertion: [
      { id: 'dildo', name: '딜도', desc: '다양한 크기와 형태의 삽입 도구' },
      { id: 'anal_plug', name: '애널 플러그', desc: '안에 넣고 고정되는 마개 형태' },
      { id: 'anal_beads', name: '애널 비즈', desc: '구슬이 연결된 형태, 하나씩 들어가고 나오는' },
      { id: 'prostate_massager', name: '전립선 자극기', desc: '전립선을 정확히 겨냥하는 곡선 형태' },
      { id: 'stretcher', name: '확장기', desc: '점진적으로 늘리는 도구' },
      { id: 'double_ended', name: '더블 엔디드', desc: '양쪽 끝이 있어 둘이 함께 사용 가능한' },
      { id: 'vibrating_dildo', name: '진동 딜도', desc: '진동과 함께 삽입되는' },
      { id: 'tail_plug', name: '테일 플러그', desc: '꼬리처럼 보송한 털이 달린 플러그' }
    ],
    vibration: [
      { id: 'vibrator', name: '바이브레이터', desc: '진동으로 자극하는 외부용 기구' },
      { id: 'anal_vibe', name: '애널 바이브', desc: '진동과 함께 내부를 자극하는' },
      { id: 'prostate_vibe', name: '진동 전립선 마사지기', desc: '전립선에 진동을 전달하는' },
      { id: 'remote_vibe', name: '무선 리모컨 바이브', desc: '원격 조종이 가능한, 공공장소에서도' },
      { id: 'wearable_vibe', name: '웨어러블 바이브', desc: '착용한 채 움직일 수 있는' }
    ],
    restriction: [
      { id: 'cock_ring', name: '콕링', desc: '뿌리를 조여 더 단단하게, 오래 유지하게' },
      { id: 'chastity', name: '순결 장치', desc: '금속이나 플라스틱으로 된 케이지' },
      { id: 'ball_stretcher', name: '볼 스트레처', desc: '무게감으로 잡아당기는' }
    ],
    impact: [
      { id: 'flogger', name: '플로거', desc: '여러 줄의 가죽이 달린 채찍' },
      { id: 'paddle', name: '패들', desc: '평평한 판으로 때리는' },
      { id: 'crop', name: '크롭', desc: '승마용 채찍, 끝이 넓은' },
      { id: 'cane', name: '케인', desc: '가는 막대, 날카로운 통증' }
    ],
    sensation: [
      { id: 'nipple_clamps', name: '니플 클램프', desc: '유두를 집는 집게' },
      { id: 'nipple_chain', name: '니플 체인', desc: '양쪽 유두를 연결하는 사슬' },
      { id: 'feather', name: '깃털 티클러', desc: '간지러운 자극을 주는 부드러운 깃털' },
      { id: 'pinwheel', name: '핀 휠', desc: '뾰족한 바퀴가 피부 위를 구르는' },
      { id: 'wax_candle', name: '왁스 캔들', desc: '뜨거운 왁스가 피부 위에 떨어지는' }
    ]
  },

  // D. 온도 자극 도구군
  temperature: {
    cold: [
      { id: 'ice_cube', name: '얼음', desc: '차가운 얼음이 피부 위에서 녹는' },
      { id: 'ice_water', name: '얼음물', desc: '차가운 물이 끼얹어지는' },
      { id: 'cold_can', name: '차가운 캔', desc: '냉장고에서 막 꺼낸' },
      { id: 'cold_metal', name: '차가운 금속', desc: '냉기가 스며드는 금속 물건' }
    ],
    hot: [
      { id: 'hot_water', name: '뜨거운 물', desc: '따뜻한 물이 피부를 적시는' },
      { id: 'warm_towel', name: '따뜻한 타월', desc: '온기가 스며드는 수건' },
      { id: 'wax', name: '촛불/왁스', desc: '뜨거운 왁스가 떨어지고 굳는' },
      { id: 'heat_pack', name: '온열 팩', desc: '지속적인 온기' }
    ]
  },

  // E. 일상 물건 창의 활용
  everyday: {
    office: [
      { id: 'pen', name: '펜/만년필', desc: '피부 위를 긁는 차가운 금속 끝' },
      { id: 'ruler', name: '자', desc: '측정하듯, 혹은 가볍게 때리는' },
      { id: 'scissors', name: '가위', desc: '위협적인 차가움, 옷을 자르는' },
      { id: 'clip', name: '클립/집게', desc: '작은 금속이 살을 꼬집는' },
      { id: 'book', name: '책', desc: '무게감으로 누르거나 가리는' }
    ],
    fashion: [
      { id: 'tie_gag', name: '넥타이(재갈용)', desc: '입 안에 물리는 비단' },
      { id: 'belt_impact', name: '벨트(타격용)', desc: '접어서 때리는 가죽' },
      { id: 'torn_shirt', name: '셔츠(찢기)', desc: '천이 찢기는 소리' },
      { id: 'stocking_bind', name: '스타킹(묶기)', desc: '질긴 나일론이 조이는' },
      { id: 'gloves', name: '장갑', desc: '감각이 다른 손길' },
      { id: 'watch', name: '시계', desc: '시간을 재며, 혹은 손목을 묶으며' },
      { id: 'shoes', name: '구두/부츠', desc: '밟거나 핥게 하는' }
    ],
    beauty: [
      { id: 'lipstick', name: '립스틱', desc: '피부에 표시를 남기는' },
      { id: 'perfume', name: '향수', desc: '강렬한 향이 감각을 자극' },
      { id: 'lotion', name: '로션/오일', desc: '미끄러운 손길' },
      { id: 'toothbrush_handle', name: '칫솔(손잡이)', desc: '일상 물건의 의외의 용도' },
      { id: 'electric_toothbrush', name: '전동 칫솔', desc: '진동을 이용한 자극' },
      { id: 'razor', name: '면도기', desc: '긴장감을 주는 날카로움' },
      { id: 'hairbrush', name: '헤어브러시', desc: '손잡이로 때리거나 빗 부분으로 간지럽히는' }
    ],
    food: [
      { id: 'ice_cream', name: '아이스크림', desc: '차가움과 달콤함이 녹아드는' },
      { id: 'chocolate', name: '초콜릿/꿀', desc: '끈적한 단맛이 피부에' },
      { id: 'strawberry', name: '딸기/과일', desc: '과즙이 흐르는' },
      { id: 'whipped_cream', name: '휘핑크림', desc: '거품이 피부를 덮는' },
      { id: 'candy', name: '사탕/젤리', desc: '입에 물리거나 핥게 하는' },
      { id: 'alcohol', name: '술', desc: '마시고 피부에 흘리고' },
      { id: 'spicy', name: '매운 소스', desc: '자극적인 열감' },
      { id: 'carbonated', name: '탄산음료', desc: '톡 쏘는 느낌' }
    ],
    bathroom: [
      { id: 'showerhead', name: '샤워기', desc: '물 압력을 조절하며 자극하는' },
      { id: 'soap', name: '비누', desc: '미끄러운 거품' },
      { id: 'bath_foam', name: '바디워시', desc: '거품과 향기' },
      { id: 'wet_towel', name: '젖은 수건', desc: '묶거나 닦거나' },
      { id: 'mirror', name: '거울', desc: '자신의 모습을 보게 하는' }
    ],
    electronics: [
      { id: 'smartphone', name: '스마트폰', desc: '녹음/촬영/타이머로 긴장감' },
      { id: 'laptop', name: '노트북', desc: '화상 통화로 보여주기' },
      { id: 'massager', name: '마사지기', desc: '진동을 이용한' },
      { id: 'hairdryer', name: '드라이기', desc: '온풍으로 자극' },
      { id: 'fan', name: '선풍기', desc: '시원한 바람이 땀을 식히는' }
    ]
  },

  // F. 윤활제 및 보조 용품
  lubricants: [
    { id: 'water_based', name: '수성 윤활제', desc: '가장 일반적이고 안전한' },
    { id: 'silicone_based', name: '실리콘 윤활제', desc: '오래 지속되는' },
    { id: 'warming', name: '온감 윤활제', desc: '따뜻한 느낌을 주는' },
    { id: 'cooling', name: '쿨링 윤활제', desc: '시원한 자극을 주는' },
    { id: 'thick', name: '끈적한 타입', desc: '농도가 높은' },
    { id: 'thin', name: '묽은 타입', desc: '자연스러운 느낌의' }
  ]
};

// ============================================================
// 환경 변수
// ============================================================

export const ENVIRONMENT = {
  // 시간대
  timeOfDay: [
    { id: 'dawn', name: '새벽(04-07시)', effect: '정적, 몽롱함, 아무도 없음' },
    { id: 'morning', name: '오전(08-11시)', effect: '햇살, 일상의 시작' },
    { id: 'noon', name: '점심(12-14시)', effect: '한낮의 배덕감' },
    { id: 'afternoon', name: '오후(15-17시)', effect: '나른함, 햇살 기움' },
    { id: 'evening', name: '저녁(18-20시)', effect: '석양, 전환의 시간' },
    { id: 'night', name: '밤(21-23시)', effect: '어둠, 본능의 시작' },
    { id: 'midnight', name: '한밤중(00-03시)', effect: '깊은 밤, 이성 약화' }
  ],

  // 조명
  lighting: [
    { id: 'dark', name: '어둠', effect: '시각 감소 → 촉각 증가' },
    { id: 'bright', name: '밝음', effect: '모든 게 보이는 부끄러움' },
    { id: 'dim', name: '희미한 빛', effect: '분위기, 윤곽만 보이는' },
    { id: 'tv_light', name: 'TV 빛', effect: '깜빡이는 푸른 빛' },
    { id: 'phone_light', name: '휴대폰 불빛', effect: '얼굴만 비추는' },
    { id: 'neon', name: '네온사인', effect: '색색의 빛이 번갈아' },
    { id: 'sunlight', name: '햇살', effect: '따스하고 노출적인' },
    { id: 'moonlight', name: '달빛', effect: '창백하고 몽환적인' },
    { id: 'candle', name: '촛불', effect: '흔들리는 따스한 빛' }
  ],

  // 온도/날씨
  weather: [
    { id: 'hot', name: '무더위', effect: '땀, 끈적임, 숨 가쁨' },
    { id: 'cold', name: '추위', effect: '체온 나누기, 떨림, 밀착' },
    { id: 'rain', name: '비', effect: '빗소리가 신음 감춤' },
    { id: 'snow', name: '눈', effect: '정적, 하얀 풍경' },
    { id: 'wind', name: '바람', effect: '피부에 닿는 공기' },
    { id: 'humid', name: '습함', effect: '끈적임, 땀' },
    { id: 'dry', name: '건조함', effect: '정전기, 까끌까끌' }
  ],

  // 소음 환경
  soundscape: [
    { id: 'silence', name: '완전 정적', effect: '신음이 크게 → 억누름' },
    { id: 'rain_sound', name: '빗소리', effect: '자연스러운 마스킹' },
    { id: 'wind_sound', name: '바람소리', effect: '야외의 해방감' },
    { id: 'water_sound', name: '물소리', effect: '욕실의 자연스러움' },
    { id: 'footsteps', name: '복도 발소리', effect: '긴장감, 들킬 위험' },
    { id: 'car_sound', name: '차 소리', effect: '도시의 익명성' },
    { id: 'music', name: '음악', effect: '신음을 가려줌' },
    { id: 'voices', name: '사람들 목소리', effect: '주변 인기척의 스릴' }
  ]
};

// ============================================================
// 조합 생성 시스템
// ============================================================

export const COMBINATION_RULES = {
  // 조합 공식
  formula: '[속박 0-1] + [감각 0-1] + [자극 0-1] + [환경활용 0-1]',
  maxToolsPerScene: 3,
  
  // 반복 방지 규칙
  repeatPreventionGap: 5, // 같은 조합은 최소 5회 간격
  
  // 캐릭터 성향별 도구 강도
  intensityByCharacter: {
    'intense_tsundere': { style: '강제적, 거친', tools: ['bondage', 'impact'] },
    'gentle_devoted': { style: '부드럽고 합의적', tools: ['sensation', 'temperature'] },
    'playful_seductive': { style: '장난스럽고 실험적', tools: ['everyday', 'vibration'] },
    'cold_formerTop': { style: '지배적, 계획적', tools: ['bondage', 'restriction'] }
  }
};

// ============================================================
// 씬 다양화 체크리스트
// ============================================================

export const SCENE_CHECKLIST = [
  '이전 씬과 다른 장소인가?',
  '이전 씬과 다른 시간대인가?',
  '도구를 0~3개 범위에서 선택했는가?',
  '선택한 도구가 최근 3회에 없는가?',
  '환경 요소 2가지 이상 포함했는가?',
  '장소의 물리적 특성을 활용했는가?',
  '도구의 재질/온도를 묘사했는가?',
  '예측 가능한 패턴을 피했는가?'
];

// ============================================================
// 유틸리티 함수
// ============================================================

/**
 * 랜덤 장소 선택 (이전 장소 제외)
 */
export function getRandomLocation(excludeIds = [], safetyPreference = null) {
  const allLocations = [];
  
  Object.entries(LOCATIONS).forEach(([category, data]) => {
    if (safetyPreference === null || 
        (safetyPreference === 'safe' && data.safetyLevel >= 4) ||
        (safetyPreference === 'risky' && data.safetyLevel <= 2) ||
        safetyPreference === 'any') {
      data.locations.forEach(loc => {
        if (!excludeIds.includes(loc.id)) {
          allLocations.push({ ...loc, category, safetyLevel: data.safetyLevel });
        }
      });
    }
  });
  
  return allLocations[Math.floor(Math.random() * allLocations.length)];
}

/**
 * 장소에 맞는 도구 추천
 */
export function getToolsForLocation(locationId) {
  const locationToolMap = {
    // 사무실 계열
    office: ['necktie', 'belt', 'pen', 'ruler', 'clip'],
    ceo_office: ['necktie', 'belt', 'leather_cuffs', 'pen'],
    conference_room: ['necktie', 'belt', 'book'],
    
    // 욕실 계열
    bathroom: ['showerhead', 'soap', 'ice_cube', 'towel', 'wet_towel'],
    bathtub: ['ice_cube', 'warm_towel', 'soap', 'candle'],
    
    // 주방 계열
    kitchen: ['ice_cube', 'chocolate', 'whipped_cream', 'cold_metal'],
    
    // 침실 계열
    bedroom: ['bondage_rope', 'blindfold', 'vibrator', 'ice_cube', 'feather'],
    
    // 차량 계열
    car_sedan: ['necktie', 'belt', 'scarf'],
    car_suv: ['necktie', 'belt', 'remote_vibe'],
    
    // 공공장소
    restroom_stall: ['scarf', 'handkerchief'],
    elevator: [],
    
    // 호텔/러브호텔
    love_hotel: ['leather_cuffs', 'bondage_rope', 'vibrator', 'anal_plug', 'nipple_clamps']
  };
  
  return locationToolMap[locationId] || [];
}

/**
 * 도구 조합 생성
 */
export function generateToolCombination(characterTypes, excludeToolIds = [], maxTools = 3) {
  const combination = [];
  const categories = ['bondage', 'sensory', 'stimulation', 'temperature', 'everyday'];
  
  // 캐릭터 성향에 따른 도구 선호도
  const intensity = COMBINATION_RULES.intensityByCharacter[characterTypes] || 
    { style: 'balanced', tools: categories };
  
  // 랜덤으로 0~maxTools개 선택
  const numTools = Math.floor(Math.random() * (maxTools + 1));
  
  for (let i = 0; i < numTools; i++) {
    const category = intensity.tools[Math.floor(Math.random() * intensity.tools.length)];
    const toolCategory = TOOLS[category];
    
    if (toolCategory) {
      // 카테고리 내에서 서브카테고리 랜덤 선택
      const subCategories = Object.keys(toolCategory);
      const subCat = subCategories[Math.floor(Math.random() * subCategories.length)];
      const tools = toolCategory[subCat];
      
      if (Array.isArray(tools)) {
        const tool = tools[Math.floor(Math.random() * tools.length)];
        if (!excludeToolIds.includes(tool.id) && !combination.find(t => t.id === tool.id)) {
          combination.push(tool);
        }
      }
    }
  }
  
  return combination;
}

/**
 * 환경 설정 생성 (최소 2가지)
 */
export function generateEnvironment(previousEnvironment = {}) {
  const result = {};
  
  // 시간대 선택 (이전과 다르게)
  const times = ENVIRONMENT.timeOfDay.filter(t => t.id !== previousEnvironment.timeOfDay);
  result.timeOfDay = times[Math.floor(Math.random() * times.length)];
  
  // 조명 선택
  const lights = ENVIRONMENT.lighting;
  result.lighting = lights[Math.floor(Math.random() * lights.length)];
  
  // 날씨/온도 (50% 확률로 포함)
  if (Math.random() > 0.5) {
    const weather = ENVIRONMENT.weather;
    result.weather = weather[Math.floor(Math.random() * weather.length)];
  }
  
  // 소리 환경 (50% 확률로 포함)
  if (Math.random() > 0.5) {
    const sounds = ENVIRONMENT.soundscape;
    result.soundscape = sounds[Math.floor(Math.random() * sounds.length)];
  }
  
  return result;
}

/**
 * 씬 검증 (체크리스트 기반)
 */
export function validateScene(scene, previousScenes = []) {
  const issues = [];
  
  // 장소 중복 체크
  if (previousScenes.length > 0) {
    const lastLocation = previousScenes[previousScenes.length - 1]?.location?.id;
    if (scene.location?.id === lastLocation) {
      issues.push('이전 씬과 같은 장소');
    }
  }
  
  // 도구 개수 체크
  if (scene.tools && scene.tools.length > 3) {
    issues.push('도구가 3개 초과');
  }
  
  // 환경 요소 체크
  const envCount = Object.keys(scene.environment || {}).length;
  if (envCount < 2) {
    issues.push('환경 요소 2개 미만');
  }
  
  // 최근 도구 중복 체크
  const recentToolIds = previousScenes.slice(-3)
    .flatMap(s => s.tools?.map(t => t.id) || []);
  
  const duplicateTools = scene.tools?.filter(t => recentToolIds.includes(t.id)) || [];
  if (duplicateTools.length > 0) {
    issues.push(`최근 사용 도구 중복: ${duplicateTools.map(t => t.name).join(', ')}`);
  }
  
  return {
    valid: issues.length === 0,
    issues,
    checklist: SCENE_CHECKLIST.map(item => ({
      item,
      passed: !issues.some(issue => issue.includes(item.substring(0, 10)))
    }))
  };
}

/**
 * 완전한 씬 설정 생성
 */
export function generateSceneSetup(options = {}) {
  const {
    characterTypes = 'balanced',
    previousScenes = [],
    safetyPreference = 'any'
  } = options;
  
  // 이전 장소들 제외
  const excludeLocations = previousScenes.slice(-3).map(s => s.location?.id).filter(Boolean);
  
  // 이전 도구들 제외
  const excludeTools = previousScenes.slice(-3)
    .flatMap(s => s.tools?.map(t => t.id) || []);
  
  // 이전 환경
  const previousEnv = previousScenes[previousScenes.length - 1]?.environment || {};
  
  const scene = {
    location: getRandomLocation(excludeLocations, safetyPreference),
    tools: generateToolCombination(characterTypes, excludeTools),
    environment: generateEnvironment(previousEnv)
  };
  
  // 장소에 맞는 추천 도구 추가 (없으면)
  if (scene.tools.length === 0) {
    const recommendedToolIds = getToolsForLocation(scene.location.id);
    if (recommendedToolIds.length > 0) {
      // 첫 번째 추천 도구 추가 (간단하게)
      const toolId = recommendedToolIds[0];
      // 실제 도구 객체 찾기는 복잡하므로 ID만 반환
      scene.recommendedTools = recommendedToolIds;
    }
  }
  
  // 검증
  scene.validation = validateScene(scene, previousScenes);
  
  return scene;
}

export default {
  LOCATIONS,
  LOCATION_PROPERTIES,
  TOOLS,
  ENVIRONMENT,
  COMBINATION_RULES,
  SCENE_CHECKLIST,
  getRandomLocation,
  getToolsForLocation,
  generateToolCombination,
  generateEnvironment,
  validateScene,
  generateSceneSetup
};