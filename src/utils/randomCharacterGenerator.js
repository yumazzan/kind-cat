/**
 * 무작위 캐릭터 & 서사 조합 생성기
 * "무작위 캐릭터 & 서사 조합 템플릿" 문서의 5단계 추첨 파이프라인 + 충돌 예외 규칙을 구현.
 *
 * 범위: 성인 요소(19금)는 태그로만 다루고, 그래픽한 성적 묘사 문장은 생성하지 않는다.
 *
 * story-template.js의 STORY_CONFIG 구조를 그대로 채워서 반환하므로(`result.storyConfig`),
 * 결과를 복사해 어드민의 "📥 JSON에서 가져오기"로 바로 불러올 수 있다.
 */
import {
  GENRES, SUBJECTS, MOODS, TOP_KEYWORDS, BOTTOM_KEYWORDS,
  RELATIONSHIPS, ADULT_TAGS, JOBS, BODY_HEIGHTS, BODY_FEATURES,
  APPEARANCE_FEATURES, TOP_CONFLICTS, BOTTOM_CONFLICTS,
  HEIGHT_CONSTRAINTS, FORCED_APPEARANCE_BY_TAG, CHARACTER_NAMES, WESTERN_CHARACTER_NAMES,
  SPEECH_FORMAL, SPEECH_MIXED, SPEECH_CASUAL,
  SECRET_HOOKS, SEX_GENITAL_TOP, SEX_BODY_TOP, SEX_SPECIAL_TOP,
  SEX_HOLE_BOTTOM, SEX_REACTIONS_BOTTOM, SEX_NIPPLE_BOTTOM, SEX_GENITAL_BOTTOM,
  SEX_SPECIAL_BOTTOM, SEX_SCENT, CALLING_PATTERNS, RELATIONSHIP_TO_PATTERN,
  STORY_LOCATIONS, STORY_TIMES, SUBJECT_NARRATIVE_HOOKS, RELATIONSHIP_KIND,
  ORIGIN_ONLY_SUBJECTS, PERIOD_JOBS, PERIOD_MOODS, WESTERN_PERIOD_JOBS, WESTERN_MOOD,
  SCHOOL_JOBS, SCHOOL_GENRE, GENRE_RELATIONSHIP_EXCLUDE, GENRE_SUBJECT_EXCLUDE,
  RELATIONSHIP_NARRATIVE_HOOKS, NON_JOB_CONTACT_HOOKS, ISEKAI_MOODS, ISEKAI_ORIGIN_CLAUSES
} from '../data/RandomGeneratorKeywords';
// 말투 "뉴안스"는 존댓말 여부와는 별개의 축이라, 실제 채팅에서 쓰는 것과 똑같은
// 유형별 말투 데이터(Charactertraits.js)를 그대로 가져와 미리보기에도 반영함 -
// 이렇게 해야 생성기 미리보기와 실제 채팅 출력이 서로 다른 말투로 어긋나지 않음
import { findGongType, findSuType } from '../data/Charactertraits';

const NARRATIVE_PATTERN_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
// '주요 갈등'을 매번 강제로 붙이지 않고 가끔만 등장하는 선택 요소로 두기 위한
// 확률. 후킹/초기 상황(contact, start)은 이 확률과 무관하게 항상 우선 생성됨.
const CONFLICT_CHANCE = 0.45;

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 받침 유무에 따라 조사(과/와, 을/를, 이/가) 중 알맞은 것을 고른다
function particleFor(word, [withBatchim, withoutBatchim]) {
  const lastChar = word.charCodeAt(word.length - 1);
  const hasBatchim = lastChar >= 0xac00 && lastChar <= 0xd7a3 && (lastChar - 0xac00) % 28 !== 0;
  return hasBatchim ? withBatchim : withoutBatchim;
}

function pickN(arr, n) {
  const pool = [...arr];
  const result = [];
  while (result.length < n && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

// 성격 2개(메인 성향 1개 + 반전/갭모에 성향 1개) 추첨, 직접 대립 속성은 배제
function pickPersonalityPair(pool, conflicts) {
  const main = pick(pool);
  const excludedKeys = [main.key, ...(conflicts[main.key] || [])];
  const rest = pool.filter((k) => !excludedKeys.includes(k.key));
  const twist = pick(rest.length > 0 ? rest : pool);
  return [main, twist];
}

// 장발 태그 추첨 시 숏컷 계열 외모 키워드를 풀에서 제외하고, 성격/설정 태그가
// 특정 외모(장발/안경 등)를 명시하는 경우 그 특징이 실제로 포함되도록 강제함.
// (예: '장발공'인데 외모 묘사에 장발 언급이 전혀 없는 모순 방지)
function pickAppearanceFeatures(excludeLongHairConflict, forcedKeys = []) {
  let pool = APPEARANCE_FEATURES;
  if (excludeLongHairConflict) {
    pool = pool.filter((f) => f.hair !== 'short');
  }
  const forced = pool.filter((f) => forcedKeys.includes(f.key));
  const rest = pool.filter((f) => !forcedKeys.includes(f.key));
  const remaining = Math.max(0, 2 - forced.length);
  return [...forced, ...pickN(rest, remaining)];
}

function forcedFeatureKeysFor(mainKey, twistKey) {
  return [mainKey, twistKey]
    .map((key) => FORCED_APPEARANCE_BY_TAG[key])
    .filter(Boolean);
}

// 체형을 명시하는 태그(대형견/떡대/키작 등)가 뽑혀 있으면 신장 후보를 그
// 설정과 모순되지 않는 범위로 제한한다 (예: '대형견공'인데 170cm 이하로
// 뽑히는 것을 방지). 여러 제약이 겹치면 교집합, 교집합이 비면 첫 제약을 사용.
function pickConsistentHeight(tagKeys) {
  const matchedConstraints = tagKeys
    .map((key) => HEIGHT_CONSTRAINTS[key])
    .filter(Boolean);

  if (matchedConstraints.length === 0) {
    return pick(BODY_HEIGHTS);
  }

  let allowedKeys = matchedConstraints[0];
  for (let i = 1; i < matchedConstraints.length; i++) {
    const intersection = allowedKeys.filter((k) => matchedConstraints[i].includes(k));
    if (intersection.length > 0) allowedKeys = intersection;
  }

  const allowedHeights = BODY_HEIGHTS.filter((h) => allowedKeys.includes(h.key));
  return pick(allowedHeights.length > 0 ? allowedHeights : BODY_HEIGHTS);
}

// 신장 구간(bucket) 안에서 구체적인 숫자 하나를 뽑는다 (예: '185cm~189cm'
// 구간이면 그 안에서 187 같은 정수 하나). 체형 일관성 검사(HEIGHT_CONSTRAINTS)는
// 여전히 구간 단위(height.key)로 이뤄지므로, 이 숫자는 순수하게 "표시용"이다.
function rollHeightCm(height) {
  const min = height.min ?? 170;
  const max = height.max ?? min;
  return min + Math.floor(Math.random() * (max - min + 1));
}

function describeAppearance(heightCm, build, features, faceFeatures) {
  const sentences = [];
  sentences.push(`${heightCm}cm의 키에 ${build} 체형을 지녔다.`);
  sentences.push(`${faceFeatures.map((f) => f.key).join(', ')}이 눈길을 끄는 인상.`);
  sentences.push(`${features.join(', ')}이 은근한 매력 포인트다.`);
  return sentences.join(' ');
}

// 직업별로 현실적인 나이대 안에서만 뽑음 (예: 22세 '드라마 PD'처럼 경력이 안
// 맞는 조합 방지). maxAge가 없으면 minAge+15까지의 폭을 기본으로 사용.
// ageCap이 주어지면(예: 학원물 장르) 그 상한을 넘지 않는 범위로 한 번 더
// 제한한다 - '왕세자'(minAge 15~maxAge 30)처럼 직업 자체의 나이 폭이 넓은
// 경우에도 학원물에서 40대가 뽑히는 모순을 막기 위함.
function pickAgeForJob(job, ageCap) {
  const min = job.minAge ?? 20;
  let max = job.maxAge ?? (min + 15);
  if (ageCap) max = Math.max(min, Math.min(max, ageCap));
  return min + Math.floor(Math.random() * (max - min + 1));
}

// 나이 동기화: 관계 키워드(연상/연하)에 따라 공/수 나이 대소 관계를 강제하되,
// 각자의 직업이 허용하는 나이대(job.minAge~maxAge, ageCap 있으면 그 이하)는
// 절대 벗어나지 않음 - 그 범위 안에서 순서가 맞는 조합이 나올 때까지 다시
// 뽑고, 몇 번을 시도해도 안 맞으면(예: 고등학생이 '연상'이어야 하는 경우처럼
// 원천적으로 불가능한 조합) 나이대를 깨느니 차라리 순서를 강제하지 않고
// 마지막으로 뽑힌 값을 그대로 둠
function syncAges(jobTop, jobBottom, topAgeRole, bottomAgeRole, ageCap) {
  const topShouldBeOlder = topAgeRole === 'older' || bottomAgeRole === 'younger';
  const topShouldBeYounger = topAgeRole === 'younger' || bottomAgeRole === 'older';

  let ageTop = pickAgeForJob(jobTop, ageCap);
  let ageBottom = pickAgeForJob(jobBottom, ageCap);

  if (topShouldBeOlder || topShouldBeYounger) {
    for (let attempt = 0; attempt < 8; attempt++) {
      const satisfied = topShouldBeOlder ? ageTop > ageBottom : ageTop < ageBottom;
      if (satisfied) break;
      ageTop = pickAgeForJob(jobTop, ageCap);
      ageBottom = pickAgeForJob(jobBottom, ageCap);
    }
  }
  return { ageTop, ageBottom };
}

// '서양풍'이 뽑히면 한글 이름 대신 서양식 이름 풀에서 고름 (한글 이름을 쓰면
// 로판/서양 중세 판타지 분위기에서 몰입이 깨짐)
function pickDistinctNames(isWesternMood) {
  const pool = isWesternMood ? WESTERN_CHARACTER_NAMES : CHARACTER_NAMES;
  const [nameTop, nameBottom] = pickN(pool, 2);
  return { nameTop, nameBottom };
}

// 존댓말 유지 정도(honorificLevel)를 태그에서 대략 추정 - 순수한 랜덤보다
// 성격과 어울리게 하기 위한 가벼운 보정
function computeHonorificLevel(mainKey, twistKey) {
  let base = 40 + Math.floor(Math.random() * 40); // 40~79 기본 분포
  const formalHints = ['존댓말공', '냉혈공', '냉혈수', '까칠수', '단정수', '귀족수'];
  const casualHints = ['능글공', '능글수', '난폭공', '양아치공', '초딩공', '직진공', '직진수'];
  if (formalHints.includes(mainKey) || formalHints.includes(twistKey)) base += 15;
  if (casualHints.includes(mainKey) || casualHints.includes(twistKey)) base -= 20;
  return Math.max(0, Math.min(100, base));
}

// 존댓말 유지 정도(격식)와 말투 "뉴안스"(캐릭터 태그에서 오는 태도/어투)는 서로
// 다른 축이라 각각 따로 합성함. 뉴안스 쪽은 실제 채팅에서 쓰는 것과 동일한
// Charactertraits.js의 유형 데이터를 그대로 참조하므로, 여기서 미리 보는 말투와
// 실제 대화에서 캐릭터가 쓰는 말투가 서로 다르게 어긋나지 않음.
function composeSpeech(honorificLevel, mainKey, twistKey, isTop) {
  const formalityClause = honorificLevel >= 70
    ? pick(SPEECH_FORMAL)
    : honorificLevel >= 40
      ? pick(SPEECH_MIXED)
      : pick(SPEECH_CASUAL);

  const tagsForLookup = [`#${mainKey}`, `#${twistKey}`];
  const type = isTop ? findGongType(tagsForLookup) : findSuType(tagsForLookup);
  const nuance = type?.speechPattern?.style;

  return nuance ? `${formalityClause} 태도 면에서는 ${nuance}.` : formalityClause;
}

function composePersonalityText(main, twist) {
  return `${main.desc} ${twist.desc}`;
}

// "비밀"이 매번 강제로 붙으면 매 캐릭터마다 억지로 끼워 넣은 반전처럼 느껴지기
// 쉬워서, 필수 요소가 아니라 가끔 흥미로운 반전으로 등장하는 선택적 요소로
// 바꿨다. 후킹(오프닝 훅)과 초기 상황(접점/관계의 시작)은 여전히 항상 나오는
// 핵심 요소이고, 비밀은 그 위에 이따금 얹히는 양념에 가깝다.
const SECRET_CHANCE = 0.4;

function composeSecret(opponentJob) {
  if (Math.random() >= SECRET_CHANCE) return '';
  const template = pick(SECRET_HOOKS);
  return template.replace('{opponent}', opponentJob);
}

function buildSexualDetailsTop() {
  return {
    genital: pick(SEX_GENITAL_TOP),
    body: pick(SEX_BODY_TOP),
    scent: pick(SEX_SCENT),
    special: pick(SEX_SPECIAL_TOP)
  };
}

function buildSexualDetailsBottom() {
  return {
    hole: pick(SEX_HOLE_BOTTOM),
    reactions: pick(SEX_REACTIONS_BOTTOM),
    nipple: pick(SEX_NIPPLE_BOTTOM),
    genital: pick(SEX_GENITAL_BOTTOM),
    scent: pick(SEX_SCENT),
    special: pick(SEX_SPECIAL_BOTTOM)
  };
}

// 성격 태그(주+반전) + 배경/외모 태그 1~2개를 더 뽑아 3~5개짜리 #태그 배열 구성
function buildTagsArray(main, twist, pool, conflicts) {
  const picked = [main.key, twist.key];
  const excluded = new Set([...picked, ...(conflicts[main.key] || []), ...(conflicts[twist.key] || [])]);
  const extraPool = pool.filter((k) => !excluded.has(k.key));
  const extraCount = 1 + Math.round(Math.random()); // 1~2개 추가
  const extras = pickN(extraPool, extraCount).map((k) => k.key);
  return [...picked, ...extras].map((k) => `#${k}`);
}

function buildCallingSystem(relationshipKey, role) {
  const pattern = CALLING_PATTERNS[relationshipKey] || CALLING_PATTERNS.default;
  const names = pattern[role];
  const conditions = [
    '평소 (기본, 아직 서먹한 사이)',
    '조금씩 가까워지기 시작했을 때',
    '가까운 사이가 된 후',
    '서로 마음을 확인한 이후'
  ];
  return conditions.map((condition, i) => ({ condition, name: names[i] }));
}

function pickNarrativePattern(relationshipKey) {
  return RELATIONSHIP_TO_PATTERN[relationshipKey] || pick(NARRATIVE_PATTERN_LETTERS);
}

// 5단계(오프닝 훅)를 "[세계관]에서 [직업]인 A가 [관계유형]으로 [직업]인 B와
// 얽히게 된 계기는 (훅)이다" 라는 로그라인 형태로 조립한다. 세계관(mood)·
// 직업(jobTop/jobBottom)·관계유형을 훅 문장 안에 항상 강제로 인용하게 하면,
// 그냥 "그렇게 됐대요" 식이 아니라 인과관계가 있는 시작처럼 읽힌다. 이 순서
// (세계관→장르→관계→직업→훅)는 "전체 랜덤" 버튼의 내부 추첨 순서와도 동일해야
// 하는데, 소재·관계·직업을 독립적으로 뽑은 뒤 나중에 이어붙이면(예전 방식)
// '귀신/유령'을 계기로 '배틀연애' 관계가 시작된다 같은 모순이 생기기 때문이다.
function buildPlot({ mood, jobTop, jobBottom, relationship, subjects, topTwist, bottomTwist }) {
  // 접점(두 사람이 어떻게 얽히는가)이 매번 "직업이 다르다/같다"로만 만들어지면
  // 억지스럽고, 실제 작품에서도 직업이 서사에 크게 작용하지 않는 경우가 많다.
  // 같은 직업이면 그 자체로 의미 있는 접점이라 그대로 쓰고, 직업이 다를 때만
  // 절반의 확률로 직업 기반 문장 대신 비-직업 접점(NON_JOB_CONTACT_HOOKS) 중
  // 하나를 섞어 써서 "접점 = 직업 차이"라는 공식에서 벗어나게 한다.
  const useJobContact = jobTop === jobBottom || Math.random() < 0.5;
  const baseContact = jobTop === jobBottom
    ? `'${mood.key}' 배경, 같은 '${jobTop}'로 일하며 매일 마주치는 사이다.`
    : useJobContact
      ? `'${mood.key}' 배경, '${jobTop}'${particleFor(jobTop, ['과', '와'])} '${jobBottom}'이라는 서로 다른 위치가 예상 밖의 접점을 만든다.`
      : `'${mood.key}' 배경, ${pick(NON_JOB_CONTACT_HOOKS)}`;

  // '이세계물'/'환생물'은 현대 직업 풀을 그대로 쓰기 때문에("요양 보호사"가
  // 판타지 세계에 그대로 등장하는 식), 왜 현대 직업을 가진 사람이 이 세계에
  // 있는지를 설명하는 출신(차원이동자/전생자)을 접점 문장에 자동으로 덧붙인다.
  const isekaiClause = ISEKAI_MOODS.includes(mood.key) ? ISEKAI_ORIGIN_CLAUSES[mood.key] : '';
  const contact = isekaiClause ? `${baseContact} ${isekaiClause}` : baseContact;

  // 소재(subject)와 관계(relationship)는 서로 독립적으로 뽑히기 때문에, 그냥
  // "'X'를 계기로 'Y' 관계가 시작된다"처럼 기계적으로 이어붙이면 ('귀신/유령'을
  // 계기로 '배틀연애' 관계가 시작된다 같은) 인과관계가 말이 안 되는 조합이 나옴.
  // 소재별로 미리 준비한 완결된 상황 문장(hook)을 먼저 서술하고, 관계 유형은
  // "그 과정에서 'X' 관계로 발전한다"는 기계적인 한 문장 대신, 관계 유형마다
  // 고유한 질감을 담은 문구(RELATIONSHIP_NARRATIVE_HOOKS)로 이어 붙인다 -
  // 태그 이름만 바뀌고 서사는 다 똑같이 두루뭉술해지는 문제를 막기 위함.
  // 관계 유형도 둘로 나뉨: '부부'/'주종관계'처럼 이야기가 시작될 때 이미
  // 확정돼 있는 관계(established)는 관계 자체를 먼저 기정사실로 선언하고,
  // emerging(삼각관계/애증관계 등)은 훅 뒤에 바로 그 질감이 이어지게 한다.
  const subjectKey = subjects[0]?.key || '우연';
  const hook = SUBJECT_NARRATIVE_HOOKS[subjectKey] || `'${subjectKey}' 소재가 두 사람의 접점에 자연스럽게 얽혀든다.`;
  const relKind = RELATIONSHIP_KIND[relationship.key] || 'emerging';
  const relFlavor = RELATIONSHIP_NARRATIVE_HOOKS[relationship.key]
    || `그 과정에서 '${relationship.key}' 관계로 서서히 발전한다.`;
  const start = relKind === 'established'
    ? `두 사람은 이미 '${relationship.key}' 사이다. ${hook} ${relFlavor}`
    : `${hook} ${relFlavor}`;

  // '주요 갈등'도 비밀과 같은 이유로 필수 요소에서 선택 요소로 바꿨다. 훅과
  // 초기 상황(contact/start)만으로도 이미 이야기가 성립하므로, 갈등 문장은
  // 매번 강제로 덧붙이지 않고 가끔 등장하는 심화 요소로 둔다.
  const conflict = Math.random() < CONFLICT_CHANCE
    ? `공의 '${topTwist.key}' 성향과 수의 '${bottomTwist.key}' 성향이 부딪히며, `
      + `'${subjects[1]?.key || subjects[0]?.key}' 소재가 두 사람 사이의 핵심 갈등으로 떠오른다.`
    : '';

  const turningPoint = mood.bright
    ? '갈등보다는 서로를 알아가는 과정에서 자연스럽게 가까워지며 관계가 무르익는다.'
    : '거듭된 충돌 끝에 서로의 진심을 마주하게 되면서 관계의 전환점을 맞는다.';

  return { contact, start, conflict, turningPoint };
}

function buildEndings({ nameTop, nameBottom, relationship }) {
  return {
    true: {
      name: '트루 엔딩',
      condition: '호감도 100 + 핵심 이벤트 성공',
      minAffection: 100,
      requiredKeywords: ['고백', '사랑해'],
      description: `${nameTop}과 ${nameBottom}이 서로의 진심을 완전히 확인하고, '${relationship.key}'을 넘어선 진짜 관계로 나아간다.`,
      reward: '',
      cgImage: ''
    },
    normal: {
      name: '노멀 엔딩',
      condition: '호감도 70-99',
      minAffection: 70,
      maxAffection: 99,
      description: '완전히 마음을 놓지는 못했지만, 둘 사이에 분명한 온도 변화가 남는다.',
      cgImage: ''
    },
    bad: {
      name: '배드 엔딩',
      condition: '호감도 70 미만 또는 치명적 선택',
      maxAffection: 69,
      badKeywords: ['이별', '떠나'],
      description: '결국 서로에게 다가가지 못한 채, 관계는 어긋난 채로 끝난다.',
      cgImage: ''
    },
    hidden: {
      name: '히든 엔딩',
      condition: '특수 조건 달성',
      requiredKeywords: ['비밀', '용서'],
      description: '숨겨왔던 비밀이 드러나고, 그 이후에도 관계를 놓지 않기로 하며 맞는 특별한 결말.',
      cgImage: ''
    }
  };
}

export function generateRandomCharacterProfile({ includeAdult = false } = {}) {
  // "전체 랜덤" 버튼도 결국 하나의 이야기를 쓰는 것과 같아서, 추첨 순서 자체가
  // 넓은 제약 → 좁은 제약 → 개인 → 오프닝 훅 순으로 진행되어야 각 단계가 앞
  // 단계의 결과를 전제로 깔고 가게 되어 인과관계가 성립한다. 소재·관계·직업을
  // 서로 독립적으로 뽑은 뒤 나중에 이어붙이던 예전 방식이 "동양풍인데 22세
  // 드라마 PD", "'귀신/유령'을 계기로 '배틀연애' 관계가 시작된다" 같은
  // 짜집기 문제의 원인이었다.

  // 1단계: 세계관/시대 - 가장 먼저, 가장 바꾸기 어려운 것부터 정한다. 이후
  // 모든 선택(직업 풀, 신분 구조, 말이 되는 사건)이 이 틀 안에서만 나온다.
  const mood = pick(MOODS);
  const isBright = !!mood.bright;

  // 2단계: 장르/톤 - 세계관 안에서 "결"을 정한다. 오메가버스 여부도 여기서
  // 미리 확정해서, 알파/베타/오메가 형질 태그 자체를 그 결과에 맞춰 걸러낸다.
  // (예전 방식은 태그를 먼저 뽑고 알파/오메가 태그가 나오면 장르를 뒤늦게
  // 오메가버스로 덮어썼는데, 이러면 장르 선택이 사실상 무시되는 셈이라
  // 인과관계가 거꾸로였다.)
  const genre = pick(GENRES);
  const isOmegaverse = genre.key === '오메가버스';
  const isSchoolGenre = genre.key === SCHOOL_GENRE;

  // 밝은 톤이면 피폐/가학/하드코어 계열 자동 제외. 오메가버스 장르가 아니면
  // 알파/베타/오메가 형질 태그는 애초에 후보에서 제외
  let topPool = isBright ? TOP_KEYWORDS.filter((k) => !k.dark) : TOP_KEYWORDS;
  let bottomPool = isBright ? BOTTOM_KEYWORDS.filter((k) => !k.dark) : BOTTOM_KEYWORDS;
  if (!isOmegaverse) {
    topPool = topPool.filter((k) => k.worldview !== 'omegaverse');
    bottomPool = bottomPool.filter((k) => k.worldview !== 'omegaverse');
  }
  const adultPool = isBright ? [] : ADULT_TAGS;

  // 3단계: 인물 정보 - 직업/나이/이름/성격/외모. 관계 유형·소재보다 먼저
  // "이 두 사람이 어떤 사람인지"를 확정해야, 뒤이어 나올 훅(4단계)과 관계
  // 유형(5단계)을 이 인물들에게 실제로 맞는 것만 골라서 붙일 수 있다 (예전
  // 순서는 관계·소재를 인물보다 먼저 뽑아서, "둘 다 수인 태그인데 소재는
  // '한쪽이 인간이 아닌 존재라는 게 드러난다'"처럼 인물 설정과 훅이 서로
  // 모순되는 조합이 나올 수 있었다).
  const isWesternMood = mood.key === WESTERN_MOOD;
  const isPeriodMood = PERIOD_MOODS.includes(mood.key);
  const moodJobPool = isWesternMood ? WESTERN_PERIOD_JOBS : isPeriodMood ? PERIOD_JOBS : JOBS;
  // '학원/캠퍼스' 나이 상한 - 이 나이를 넘는 직업은 후보에서 제외하고, 남은
  // 직업의 나이 추첨도 이 상한을 넘지 않도록 syncAges에 그대로 전달한다.
  const SCHOOL_AGE_CAP = 24;
  let jobPool = moodJobPool;
  if (isSchoolGenre) {
    if (moodJobPool === JOBS) {
      // 현대물이면 학생 신분 위주로 새로 구성된 전용 풀(SCHOOL_JOBS)을 쓴다.
      jobPool = SCHOOL_JOBS;
    } else {
      // 사극/서양풍이면 그 세계관의 직업 풀은 유지한 채, 그중 어린 나이에도
      // 말이 되는 직업(minAge가 낮은 것)만 남긴다.
      const young = moodJobPool.filter((j) => (j.minAge ?? 20) <= 20);
      jobPool = young.length > 0 ? young : moodJobPool;
    }
  }
  const jobTopObj = pick(jobPool);
  const jobBottomObj = pick(jobPool);
  const jobTop = jobTopObj.key;
  const jobBottom = jobBottomObj.key;

  // 이름 - '서양풍'이면 서양식 이름 풀 사용
  const { nameTop, nameBottom } = pickDistinctNames(isWesternMood);

  // 성격(핵심 2개: 메인+반전) + 외모 - 오메가버스 풀 제한은 2단계에서 이미
  // 끝났으므로 여기서는 순수하게 태그만 추첨한다
  const [topMain, topTwist] = pickPersonalityPair(topPool, TOP_CONFLICTS);
  const [bottomMain, bottomTwist] = pickPersonalityPair(bottomPool, BOTTOM_CONFLICTS);

  // 외모 충돌 방지: 장발공 추첨 시 숏컷 계열 외모 키워드 블라인드
  const topHasLongHair = topMain.hair === 'long' || topTwist.hair === 'long';
  const bottomHasLongHair = bottomMain.hair === 'long' || bottomTwist.hair === 'long';

  // 체형 일관성: 대형견/떡대/키작 등 체형을 명시하는 태그가 있으면 그에 맞는 신장 구간만
  // 후보로 남기고, 그 구간 안에서 표시용 구체적 키(cm)를 하나 뽑는다
  const topHeight = pickConsistentHeight([topMain.key, topTwist.key]);
  const bottomHeight = pickConsistentHeight([bottomMain.key, bottomTwist.key]);
  const topHeightCm = rollHeightCm(topHeight);
  const bottomHeightCm = rollHeightCm(bottomHeight);
  const topFeatures = pickN(BODY_FEATURES, 2);
  const bottomFeatures = pickN(BODY_FEATURES, 2);
  const topFace = pickAppearanceFeatures(topHasLongHair, forcedFeatureKeysFor(topMain.key, topTwist.key));
  const bottomFace = pickAppearanceFeatures(bottomHasLongHair, forcedFeatureKeysFor(bottomMain.key, bottomTwist.key));

  // 나이 동기화 - 연상연하 조건은 관계 유형이 아니라 성격 태그(ageRole)에서
  // 오므로, 관계 유형을 아직 안 뽑은 이 시점에도 계산할 수 있다
  const { ageTop, ageBottom } = syncAges(
    jobTopObj, jobBottomObj,
    topMain.ageRole || topTwist.ageRole, bottomMain.ageRole || bottomTwist.ageRole,
    isSchoolGenre ? SCHOOL_AGE_CAP : undefined
  );

  // 4단계: 후킹요소(소재) - 인물이 정해졌으니, 그 인물들과 모순되지 않는
  // 소재만 후보로 남긴다. 장르와 세계관 전제가 충돌하는 소재 제외(예: 'SF' +
  // '귀신/유령')에 더해, 두 사람 모두(또는 한쪽)에게 이미 '특수설정' 카테고리
  // 태그(수인/알파/오메가 등)가 있으면 '인외존재'는 제외한다 - '인외존재'는
  // "사실 인간이 아니었다는 게 드러난다"는 반전 전제인데, 애초에 수인/오메가
  // 태그로 "이미 인간이 아님"이 확정돼 있으면 반전이 성립하지 않는다 (예:
  // 공/수 둘 다 '수인' 태그인데 소재가 '인외존재'로 뽑혀 "한쪽이 인간이
  // 아니라는 게 드러난다"고 서술되는 모순 방지).
  const subjectExcluded = GENRE_SUBJECT_EXCLUDE[genre.key] || [];
  const hasSpecialSetting = [topMain, topTwist, bottomMain, bottomTwist]
    .some((t) => t.category === '특수설정');
  const subjectPool = SUBJECTS
    .filter((s) => !subjectExcluded.includes(s.key))
    .filter((s) => !hasSpecialSetting || s.key !== '인외존재');
  const subjects = pickN(subjectPool, 2);

  // 5단계: 관계 유형 - 소재가 이미 정해졌으니, 그 소재와 어울리는 관계만
  // 고른다. '짝사랑'/'첫사랑'처럼 "지금 막 감정이 시작되는" 기원형 소재가
  // 뽑혔다면 '부부'/'사제관계'처럼 이미 확정된(established) 관계는 후보에서
  // 뺀다(이미 맺어진 사이인데 "지금부터 감정이 싹튼다"는 모순이라서). 장르와
  // 안 어울리는 관계 유형도 계속 제외한다 (예: 학원물+'부부')
  const subjectHasOriginOnly = subjects.some((s) => ORIGIN_ONLY_SUBJECTS.includes(s.key));
  const relationshipExcluded = GENRE_RELATIONSHIP_EXCLUDE[genre.key] || [];
  let relationshipPool = RELATIONSHIPS.filter((r) => !relationshipExcluded.includes(r.key));
  if (subjectHasOriginOnly) {
    relationshipPool = relationshipPool.filter((r) => (RELATIONSHIP_KIND[r.key] || 'emerging') !== 'established');
  }
  const relationship = pick(relationshipPool.length > 0 ? relationshipPool : RELATIONSHIPS);

  // 6단계: 성인 요소 (태그만 — 문장으로 확장하지 않음). 캐릭터별 19금 성적
  // 가이드 특징(sexualDetails)도 19금 체크박스가 켜져 있을 때만 만들고, 꺼져
  // 있으면 아예 만들지 않는다 - 미리보기와 STORY_CONFIG가 같은 값을 쓰도록
  // 여기서 한 번만 생성해 재사용한다.
  const wantsAdult = includeAdult && adultPool.length > 0;
  const adultTags = wantsAdult ? pickN(adultPool, 1 + Math.round(Math.random())) : [];
  const topSexualDetails = wantsAdult ? buildSexualDetailsTop() : null;
  const bottomSexualDetails = wantsAdult ? buildSexualDetailsBottom() : null;

  const plot = buildPlot({ jobTop, jobBottom, relationship, subjects, mood, topTwist, bottomTwist });

  const topAppearanceText = describeAppearance(topHeightCm, topHeight.build, topFeatures, topFace);
  const bottomAppearanceText = describeAppearance(bottomHeightCm, bottomHeight.build, bottomFeatures, bottomFace);

  const topHonorific = computeHonorificLevel(topMain.key, topTwist.key);
  const bottomHonorific = computeHonorificLevel(bottomMain.key, bottomTwist.key);

  // ------- 화면 표시용(요약) 결과 -------
  const top = {
    name: nameTop,
    job: jobTop,
    age: ageTop,
    personality: [topMain, topTwist],
    appearanceText: topAppearanceText,
    speech: composeSpeech(topHonorific, topMain.key, topTwist.key, true),
    secret: composeSecret(jobBottom),
    honorificLevel: topHonorific,
    sexualDetails: topSexualDetails
  };
  const bottom = {
    name: nameBottom,
    job: jobBottom,
    age: ageBottom,
    personality: [bottomMain, bottomTwist],
    appearanceText: bottomAppearanceText,
    speech: composeSpeech(bottomHonorific, bottomMain.key, bottomTwist.key, false),
    secret: composeSecret(jobTop),
    honorificLevel: bottomHonorific,
    sexualDetails: bottomSexualDetails
  };

  // ------- STORY_CONFIG 형태(가져오기용) -------
  const narrativePattern = pickNarrativePattern(relationship.key);
  const location = pick(STORY_LOCATIONS);
  const time = pick(STORY_TIMES);

  const storyConfig = {
    title: `${relationship.key}, ${jobTop}${particleFor(jobTop, ['과', '와'])} ${jobBottom}`,
    description: `${plot.contact} ${plot.start}`,
    storyTags: {
      genre: [`#${genre.key}`],
      mood: [`#${mood.key}`],
      situation: subjects.map((s) => `#${s.key}`)
    },
    thumbnail: '',
    isBanner: false,
    badgeEnabled: true,
    badgeText: '🔥 지금 추천하는 스토리',
    keywordImages: [],
    characterA: {
      name: nameTop,
      age: String(ageTop),
      occupation: jobTop,
      personality: composePersonalityText(topMain, topTwist),
      appearance: topAppearanceText,
      speech: top.speech,
      bodyDetails: {
        height: `${topHeightCm}cm`,
        build: topHeight.build,
        features: [...topFeatures].join(', ')
      },
      secret: top.secret,
      callingSystem: buildCallingSystem(relationship.key, 'a'),
      specialCallingSituations: [],
      honorificLevel: topHonorific,
      sexualDetails: topSexualDetails || {},
      tags: buildTagsArray(topMain, topTwist, TOP_KEYWORDS, TOP_CONFLICTS),
      preferredActions: [],
      avoidedActions: [],
      visibility: { basicInfo: true, tags: true, sexualDetails: wantsAdult, actions: false },
      profileImages: []
    },
    characterB: {
      name: nameBottom,
      age: String(ageBottom),
      occupation: jobBottom,
      personality: composePersonalityText(bottomMain, bottomTwist),
      appearance: bottomAppearanceText,
      speech: bottom.speech,
      bodyDetails: {
        height: `${bottomHeightCm}cm`,
        build: bottomHeight.build,
        features: [...bottomFeatures].join(', ')
      },
      secret: bottom.secret,
      callingSystem: buildCallingSystem(relationship.key, 'b'),
      specialCallingSituations: [],
      honorificLevel: bottomHonorific,
      sexualDetails: bottomSexualDetails || {},
      tags: buildTagsArray(bottomMain, bottomTwist, BOTTOM_KEYWORDS, BOTTOM_CONFLICTS),
      preferredActions: [],
      avoidedActions: [],
      visibility: { basicInfo: true, tags: true, sexualDetails: wantsAdult, actions: false },
      profileImages: []
    },
    scenario: {
      relationship: `${relationship.key} - ${plot.contact}`,
      dynamic: plot.conflict,
      background: [plot.start, plot.conflict, plot.turningPoint].filter(Boolean).join(' '),
      location,
      situation: plot.start,
      time,
      startDate: '',
      narrativePattern,
      selectedEnding: ''
    },
    endings: buildEndings({ nameTop, nameBottom, relationship }),
    balanceSettings: {},
    excitementSettings: {},
    eventKeywords: {},
    images: [
      { id: 1, threshold: 20, name: '첫 만남' },
      { id: 2, threshold: 40, name: '친밀해짐' },
      { id: 3, threshold: 60, name: '설레는 순간' },
      { id: 4, threshold: 80, name: '깊어지는 관계' },
      { id: 5, threshold: 100, name: '완전한 신뢰' }
    ]
  };

  return {
    genre,
    mood,
    relationship,
    subjects,
    top,
    bottom,
    adultTags,
    plot,
    storyConfig,
    // 일관성 검증 체크리스트 - 알고리즘이 강제하는 규칙이므로 항상 충족됨.
    // 순서 자체도 세계관→장르→관계→직업→훅 파이프라인을 따름(뒤 단계가 항상
    // 앞 단계 결과를 전제로 좁혀진 풀에서만 뽑히므로, 뽑고 나서 나중에
    // 끼워맞추는 예외 처리가 필요 없음)
    consistency: [
      `세계관 우선 결정: '${mood.key}' 세계관이 먼저 정해진 뒤에만 직업/관계/훅이 그 틀 안에서 뽑힘`,
      `장르-오메가버스 일치: '${genre.key}' 장르가 아니면 알파/베타/오메가 형질 태그가 애초에 후보에서 제외됨 (뽑고 나서 장르를 덮어쓰지 않음)`,
      isSchoolGenre
        ? `장르-나이 일치: '학원/캠퍼스' 장르라 직업이 학생 신분 풀로 제한되어 나이가 자연히 낮게 뽑힘`
        : '연령/관계 일치: 연상연하 조건에 맞춰 나이가 직업별 현실적 범위 안에서 자동 동기화됨',
      '성격 충돌 배제: 동정/문란, 소심/군림 등 대립 속성 중복 배제됨',
      '체형 일치: 대형견/떡대/키작 등 체형 태그와 신장 범위가 서로 모순되지 않게 제한됨',
      `톤앤매너 유지: '${mood.key}' 분위기에 맞춰 ${isBright ? '피폐/가학 요소가 제외됨' : '수위 요소가 허용됨'}`
    ]
  };
}
