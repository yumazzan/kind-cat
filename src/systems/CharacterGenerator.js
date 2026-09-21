import { keywordLibrary as lib, brightMoods, darkWords } from '../data/characterGeneratorLibrary';

const topNames = ['강태윤','윤시헌','서이준','한재하','권도진','백우진','차선율','문현오'];
const bottomNames = ['정하람','이연우','최서한','유지호','남해온','송은결','임도하','오재민'];

// crypto.getRandomValues + rejection sampling: 배열 길이가 2의 거듭제곱이 아니어도 1/N 확률을 지킨다.
export function uniformIndex(length) {
  if (!Number.isInteger(length) || length < 1) throw new Error('추첨 대상이 비어 있습니다.');
  const max = 0x100000000;
  const limit = max - (max % length);
  const box = new Uint32Array(1);
  do { window.crypto.getRandomValues(box); } while (box[0] >= limit);
  return box[0] % length;
}

const pick = (items) => items[uniformIndex(items.length)];
const pickMany = (items, count) => {
  const pool = [...new Set(items)];
  const result = [];
  while (result.length < Math.min(count, pool.length)) result.push(pool.splice(uniformIndex(pool.length), 1)[0]);
  return result;
};
const hasBatchim = (word) => {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0;
};
const josa = (word, withBatchim, withoutBatchim) => `${word}${hasBatchim(word) ? withBatchim : withoutBatchim}`;
const josaRo = (word) => {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  const tail = code >= 0 && code <= 11171 ? code % 28 : 0;
  return `${word}${tail !== 0 && tail !== 8 ? '으로' : '로'}`;
};
const cleanForTone = (items, bright) => bright ? items.filter(x => !darkWords.some(w => x.includes(w))) : items;

function synchronizedAges(relationship, topTraits, bottomTraits) {
  const topMustBeYounger = topTraits.includes('연하공') || bottomTraits.includes('연상수');
  const topMustBeOlder = topTraits.includes('연상공') || bottomTraits.includes('연하수');
  const largeGap = relationship === '나이차커플';
  const base = 24 + uniformIndex(8);
  const gap = largeGap ? 7 + uniformIndex(8) : 2 + uniformIndex(4);
  if (topMustBeYounger && !topMustBeOlder) return [base, base + gap];
  if (topMustBeOlder && !topMustBeYounger) return [base + gap, base];
  if (relationship === '연상연하') return uniformIndex(2) ? [base + gap, base] : [base, base + gap];
  return [base, base + uniformIndex(3) - 1];
}

function reconcileAgeTraits(topTraits, bottomTraits, corrections) {
  const youngerTop = topTraits.includes('연하공') || bottomTraits.includes('연상수');
  const olderTop = topTraits.includes('연상공') || bottomTraits.includes('연하수') || bottomTraits.includes('중년수');
  if (!youngerTop || !olderTop) return;
  const replaceAt = bottomTraits.findIndex(x => ['연하수','연상수','중년수'].includes(x));
  if (replaceAt >= 0) {
    const removed = bottomTraits[replaceAt];
    const safe = lib.bottomTraits.filter(x => !bottomTraits.includes(x) && !/연상수|연하수|중년수/.test(x));
    bottomTraits[replaceAt] = pick(safe);
    corrections.push(`연령 충돌: ${removed} → ${bottomTraits[replaceAt]}`);
  }
}

function compatibleTraits(source, bright, role) {
  let pool = cleanForTone(source, bright);
  const first = pick(pool);
  const conflicts = {
    동정공: ['문란공'], 문란공: ['동정공','모쏠공'], 모쏠공: ['문란공'],
    동정수: ['문란수'], 문란수: ['동정수','모쏠수'], 모쏠수: ['문란수'],
    소심수: ['군림수'], 군림수: ['소심수'], 연하공: ['연상공'], 연상공: ['연하공'],
    연하수: ['연상수','중년수'], 연상수: ['연하수'], 알파공: ['베타공'], 베타공: ['알파공'],
    알파수: ['베타수','오메가수'], 베타수: ['알파수','오메가수'], 오메가수: ['알파수','베타수']
  };
  pool = pool.filter(x => x !== first && !(conflicts[first] || []).includes(x));
  return [first, pick(pool)].map(x => x || (role === 'top' ? '다정공' : '다정수'));
}

function appearance(roleTraits) {
  const body = pick(lib.bodies);
  let looks = [...lib.looks];
  if (roleTraits.includes('장발공')) looks = looks.filter(x => !/짧은|포마드/.test(x));
  const details = pickMany([...looks, ...lib.bodyDetails], 2);
  const [height, build] = body.split('/').map(x => x.trim());
  return {
    keywords: [body, ...details],
    text: `${height}의 체격으로, ${build} 실루엣이 옷 위로도 선명하다. ${details[0]}이 첫인상을 만들고, 가까이에서는 ${details[1]}이 의외의 온도를 더한다. 움직일 때 자세와 시선이 또렷해 사람들 사이에서도 자연스럽게 눈에 띈다.`,
    charm: details[0]
  };
}

const traitSentence = (traits, name) => `${josa(name, '은', '는')} ${traits[0]}의 태도를 판단과 행동의 기준으로 삼는다. 겉으로는 ${traits[1]}의 면을 보이지만, 관계가 깊어질수록 두 성향의 간극이 가장 큰 매력과 오해의 원인이 된다.`;

const topArchetypes = ['냉혈공','강공','광공','집착공','싸이코공','능글공','개아가공','다정공','헌신공','절륜공','후회공','음란침공','너드공','찐따공','퇴폐공','쾌락공'];
const bottomArchetypes = ['까칠수','강수','츤데레수','무심수','순수수','다정수','헌신수','상처수','자낮수','허당수','아방수','유혹수','마조수','이중생활수','위장수','집착수','얀데레수','공이었수','도망수','굴림수','후회수','병약수'];
const topFallback = { 냉혈공:'냉혈공', 강공:'강공', 광공:'광공', 집착공:'집착공', 능글공:'능글공', 개아가공:'개아가공', 다정공:'다정공', 헌신공:'헌신공', 절륜공:'절륜공', 후회공:'후회공', 너드공:'너드공', 소심공:'너드공', 음침공:'음란침공', 쓰레기공:'퇴폐공', 변태공:'쾌락공', 계략공:'집착공', 무심공:'강공', 순정공:'헌신공' };
const bottomFallback = { 까칠수:'까칠수', 강수:'강수', 츤데레수:'츤데레수', 무심수:'무심수', 순진수:'순수수', 동정수:'순수수', 다정수:'다정수', 헌신수:'헌신수', 상처수:'상처수', 자낮수:'자낮수', 아방수:'아방수', 유혹수:'유혹수', 집착수:'집착수', 공이었수:'공이었수', 도망수:'도망수', 굴림수:'굴림수', 후회수:'후회수', 병약수:'병약수', 소심수:'자낮수', 계략수:'위장수', 변태수:'마조수' };
const archetypeFor = (traits, role) => {
  const allowed = role === 'top' ? topArchetypes : bottomArchetypes;
  const fallback = role === 'top' ? topFallback : bottomFallback;
  return traits.find(x => allowed.includes(x)) || traits.map(x => fallback[x]).find(Boolean) || (role === 'top' ? '다정공' : '다정수');
};
const hashTags = (archetype, traits) => [...new Set([archetype, ...traits])].slice(0, 5).map(x => `#${x}`);
const heightFrom = (appearance) => appearance.keywords[0].split('/')[0].trim().replace(' 이상','').replace(/\s/g,'');
const buildFrom = (appearance) => appearance.keywords[0].split('/')[1]?.trim() || '균형 잡힌 체형';
const patternFor = (relationship) => ({ 주종관계:'A', 선후배:'A', 혐관:'B', 배틀연애:'B', 첫사랑:'C', 친구:'C', 동거:'D', 유사근친:'E', 재회물:'F', 계약관계:'G', 스폰물:'G', 쌍방구원:'H' }[relationship] || 'C');
const speechFor = (traits, role) => {
  if (traits.some(x => /존댓말|단정|침착/.test(x))) return '감정을 크게 드러내지 않는 공손한 존댓말을 사용한다. 가까워져도 욕설은 쓰지 않으며, 단둘이 있을 때만 문장 끝이 조금 부드러워진다.';
  if (traits.some(x => /난폭|양아치|조폭|쓰레기|광/.test(x))) return '짧고 거친 반말을 사용하며 화가 나면 낮은 수위의 욕설이 섞인다. 공적인 자리에서는 필요한 만큼만 존댓말을 쓴다.';
  return `${role === 'top' ? '차분하고 주도적인' : '담백하지만 감정이 비치는'} 반말을 기본으로 한다. 초면과 공적인 자리에서는 존댓말을 쓰고, 심한 욕설은 사용하지 않는다.`;
};

export function buildStoryConfig(result) {
  const a = result.top; const b = result.bottom;
  const topType = archetypeFor(a.traits, 'top'); const bottomType = archetypeFor(b.traits, 'bottom');
  const setting = result.premise.genre === '오메가버스' ? '도심의 형질 전문 의료재단과 그 주변' : `${result.premise.mood} 분위기의 도심 업무 지구`;
  const title = `${result.premise.subjects[0]}의 온도`;
  const adultOn = result.adult.length > 0;
  return {
    title,
    description: `${result.premise.relationship}, 서로 다른 목적을 품은 두 남자가 ${result.premise.subjects.join('과 ')} 사이에서 상대를 믿는 법을 배운다.`,
    storyTags: { genre: [`#${result.premise.genre}`], mood: [`#${result.premise.mood}`], situation: [`#${result.premise.relationship}`, ...result.premise.subjects.map(x => `#${x}`)] },
    thumbnail: '', isBanner: false, badgeEnabled: true, badgeText: '🔥 지금 추천하는 스토리', keywordImages: [],
    characterA: {
      name:a.name, age:String(a.age), occupation:`${a.job} — ${b.job}인 ${b.name}의 사건 처리에 실질적인 결정권을 가진 담당자`,
      personality:`${a.traits.join(', ')}. ${a.description}`, appearance:a.appearance.text, speech:speechFor(a.traits,'top'),
      bodyDetails:{ height:heightFrom(a.appearance), build:buildFrom(a.appearance), features:a.appearance.keywords.slice(1).join(', ') },
      secret:`${a.name}은 첫 만남 전부터 ${b.name}이 ${result.premise.subjects[1]} 사건의 핵심 인물이라는 사실을 알고 있었다. 접근의 절반은 의도였지만, 자신이 상대에게 흔들리기 시작했다는 사실만은 인정하지 않는다. 결정적인 증거 하나를 숨긴 채 ${b.name}이 스스로 진실을 선택할 때까지 시험하려 한다.`,
      callingSystem:[{condition:'평소 (기본, 아직 서먹한 사이)',name:`${b.name} 씨`},{condition:'함께 첫 위기를 넘긴 뒤',name:b.name},{condition:'서로의 비밀을 하나씩 공유한 후',name:b.name.slice(1)},{condition:'서로 마음을 확인한 이후',name:'내 사람'}],
      specialCallingSituations:[{situation:'직장 등 타인이 있는 공적인 자리',name:`${b.job}님`}], honorificLevel:/존댓말|단정/.test(a.traits.join(''))?80:35,
      sexualDetails:adultOn?{genital:'성인 관계에서 자신감과 통제력이 드러나는 체형',body:`${buildFrom(a.appearance)}, 높은 체온`,scent:'마른 우디 향과 깨끗한 비누 향',special:result.premise.genre==='오메가버스'?'감정을 억누를수록 짙어지는 알파 계열 페로몬':''}:{genital:'',body:'',scent:'',special:''},
      tags:hashTags(topType,a.traits), preferredActions:['상대가 숨긴 진의를 관찰하기','위험한 순간 말없이 앞을 막아 보호하기','약속한 경계와 선택을 존중하기'], avoidedActions:['상대가 보는 앞에서 거짓 증거 만들기','동의 없이 관계를 공개하기'], visibility:{basicInfo:true,tags:true,sexualDetails:false,actions:false}, profileImages:[]
    },
    characterB: {
      name:b.name, age:String(b.age), occupation:`${b.job} — ${a.job}인 ${a.name}의 판단에 이해관계가 걸렸지만 독자적인 증거를 쥔 당사자`,
      personality:`${b.traits.join(', ')}. ${b.description}`, appearance:b.appearance.text, speech:speechFor(b.traits,'bottom'),
      bodyDetails:{height:heightFrom(b.appearance),build:buildFrom(b.appearance),features:b.appearance.keywords.slice(1).join(', ')},
      secret:`${b.name}은 ${result.premise.subjects[0]}의 진짜 발단에 자신이 연루됐다는 사실을 감추고 있다. ${a.name}이 어디까지 알고 접근했는지 모르며, 들키면 관계와 현재의 삶을 동시에 잃는다고 믿는다. 그러나 숨겨둔 기록은 마지막 위기를 뒤집을 유일한 단서이기도 하다.`,
      callingSystem:[{condition:'평소 (기본, 아직 서먹한 사이)',name:`${a.job}님`},{condition:'상대의 사적인 면을 처음 본 뒤',name:`${a.name} 씨`},{condition:'서로의 편이 되기로 선택한 후',name:a.name},{condition:'서로 마음을 확인한 이후',name:a.name.slice(1)}],
      specialCallingSituations:[{situation:'둘이 갈등 중이거나 선을 긋고 싶을 때',name:`${a.job}님`}], honorificLevel:/단정|침착|연상/.test(b.traits.join(''))?75:45,
      sexualDetails:adultOn?{hole:'긴장하면 몸에 힘이 들어가지만 신뢰가 생기면 솔직하게 반응함',reactions:'수치심보다 상대의 배려와 언어적 확인에 민감하게 반응함',nipple:'체온 변화에 민감함',genital:'',scent:'옅은 머스크와 비 냄새',special:result.premise.genre==='오메가버스'?'불안할 때만 미세하게 새는 오메가 계열 향':''}:{hole:'',reactions:'',nipple:'',genital:'',scent:'',special:''},
      tags:hashTags(bottomType,b.traits), preferredActions:['말보다 행동으로 신뢰 확인하기','위기에서 서로의 등을 맡기기','감정을 재촉하지 않는 대화'], avoidedActions:['비밀을 사람들 앞에서 폭로하기','동정하거나 선택권을 빼앗기'], visibility:{basicInfo:true,tags:true,sexualDetails:false,actions:false}, profileImages:[]
    },
    scenario:{relationship:`${a.job}인 A가 사건의 결정권을 쥐고, ${b.job}인 B는 핵심 증거와 현장 정보를 가진 상호 의존 관계`,dynamic:`사회적 결정권은 A에게 있지만 진실에 도달할 열쇠는 B가 가진 역전 구도. ${a.traits[0]}인 A와 ${b.traits[0]}인 B가 서로의 약점을 경계하다 보호하게 되는 긴장이 핵심이다.`,background:`${result.plot.contact}\n\nA는 B의 과거를 일부 조사하고 접근했지만 핵심 증거의 위치는 모른다. B는 A가 자신을 이용하려 한다고 의심하면서도 혼자서는 사건을 끝낼 수 없다. 중반부에 ${result.premise.subjects[1]}의 진상이 드러나며 A가 숨긴 조사 기록과 B가 감춘 증거가 동시에 폭로된다. 두 사람은 배신감을 해결하지 못한 채 공동의 적에게 쫓기고, 마지막에는 서로의 비밀을 공개해 각자 가진 권력을 포기해야만 상대를 구할 수 있다. ${result.plot.turn}`,location:setting,situation:result.plot.opening,time:'늦은 봄, 비가 시작되는 평일 저녁',startDate:'',narrativePattern:patternFor(result.premise.relationship),selectedEnding:''},
    endings:{true:{name:'서로가 선택한 진실',condition:'호감도 100 + 서로의 비밀을 자발적으로 고백',minAffection:100,requiredKeywords:['고백','믿어'],description:'두 사람은 숨겨온 증거를 함께 공개하고 각자의 지위보다 서로를 선택한다. 사건이 끝난 뒤에도 동등한 관계로 곁에 남는다.',reward:'두 사람의 사건 이후 일상을 다룬 특별 대화',cgImage:''},normal:{name:'보류된 대답',condition:'호감도 70-99',minAffection:70,maxAffection:99,description:'사건은 해결되지만 완전한 신뢰에는 시간이 더 필요하다. 두 사람은 헤어지지 않고 다음 약속을 잡는다.',cgImage:''},bad:{name:'남겨진 증거',condition:'호감도 70 미만 또는 동의 없이 비밀을 폭로',maxAffection:69,badKeywords:['이별','폭로'],description:'상대의 선택권을 무시한 대가로 사건은 해결되지만 관계는 돌이킬 수 없게 끝난다.',cgImage:''},hidden:{name:'처음부터 공범',condition:'두 사람의 비밀을 모두 알아내고 서로를 용서',requiredKeywords:['비밀','용서'],description:'두 사람은 사건의 공식 결말을 뒤집고, 누구의 도구도 아닌 자신들만의 세 번째 길을 택한다.',cgImage:''}},
    balanceSettings:{affectionGainMin:1,affectionGainMax:8,affectionLossMin:-3,affectionLossMax:-10,excitementGainMax:adultOn?12:6}, excitementSettings:{}, eventKeywords:{},
    images:[{id:1,threshold:20,name:'첫 만남'},{id:2,threshold:40,name:'친밀해짐'},{id:3,threshold:60,name:'설레는 순간'},{id:4,threshold:80,name:'깊어지는 관계'},{id:5,threshold:100,name:'완전한 신뢰'}]
  };
}

export function generateCharacterSet({ includeAdult = false } = {}) {
  const mood = pick(lib.moods);
  const bright = brightMoods.has(mood);
  let genre = pick(cleanForTone(lib.genres, bright));
  const relationship = pick(lib.relationships);
  const subjects = pickMany(cleanForTone(lib.subjects, bright), 2);
  const topTraits = compatibleTraits(lib.topTraits, bright, 'top');
  const bottomTraits = compatibleTraits(lib.bottomTraits, bright, 'bottom');
  const corrections = [];
  reconcileAgeTraits(topTraits, bottomTraits, corrections);

  if ([...topTraits, ...bottomTraits].some(x => /알파공|오메가수/.test(x)) && genre !== '오메가버스') {
    corrections.push(`세계관: ${genre} → 오메가버스 (형질 키워드 우선)`);
    genre = '오메가버스';
  }
  const [topAge, bottomAge] = synchronizedAges(relationship, topTraits, bottomTraits);
  if (relationship === '연상연하' || relationship === '나이차커플' || topTraits.some(x => /연상|연하/.test(x)) || bottomTraits.some(x => /연상|연하|중년/.test(x))) corrections.push(`연령: 관계·성향에 맞춰 ${topAge}세 / ${bottomAge}세로 동기화`);

  const top = { name: pick(topNames), age: topAge, job: pick(lib.jobs), traits: topTraits, gap: pick(cleanForTone(lib.personalities, bright)), appearance: appearance(topTraits) };
  const bottom = { name: pick(bottomNames), age: bottomAge, job: pick(lib.jobs), traits: bottomTraits, gap: pick(cleanForTone(lib.personalities, bright)), appearance: appearance(bottomTraits) };
  const adult = includeAdult ? pickMany(cleanForTone(lib.adult, bright), 1 + uniformIndex(2)) : [];
  const contact = `${top.job}인 ${josa(top.name, '과', '와')} ${bottom.job}인 ${josa(bottom.name, '은', '는')} ${josa(subjects[0], '과', '와')} 관련된 의뢰를 서로 다른 입장에서 맡으며 처음 충돌한다.`;
  const opening = `${josaRo(relationship)} 시작한 두 사람은 ${subjects[1]} 사건을 함께 통과하며 상대의 숨겨진 사정을 알게 된다.`;
  const conflict = `${top.traits[0]}인 ${top.name}의 선택과 ${bottom.traits[0]}인 ${bottom.name}의 신념이 정면으로 부딪힌다. ${mood}의 톤 안에서 신뢰를 지킬지 목적을 택할지가 절정의 질문이 된다.`;
  const turn = `${top.traits[1]}과 ${bottom.traits[1]}이 약점이 아니라 서로를 이해하는 단서였음이 드러난다. 두 사람은 일방적인 구원 대신 각자의 선택으로 관계를 다시 정의하며 ${bright ? '따뜻한' : '여운 있는'} 결말로 나아간다.`;

  const result = {
    premise: { genre, mood, relationship, subjects }, top: { ...top, description: traitSentence(top.traits, top.name) }, bottom: { ...bottom, description: traitSentence(bottom.traits, bottom.name) },
    plot: { contact, opening, conflict, turn }, adult,
    adultNote: adult.length ? `${adult.join(' · ')} 요소는 두 인물의 명시적 합의와 경계 확인을 전제로 관계의 긴장감에만 사용한다.` : '',
    validation: [
      `연령/관계 일치 — 공 ${topAge}세, 수 ${bottomAge}세`,
      `세계관 설정 일치 — ${genre}`,
      `성격 충돌 배제 — 직접 대립 태그 없음`,
      `톤앤매너 유지 — ${bright ? '밝은 톤 위험 키워드 제외' : `${mood} 허용 범위 적용`}`
    ],
    corrections,
    seedLabel: new Date().toLocaleString('ko-KR')
  };
  result.storyConfig = buildStoryConfig(result);
  return result;
}
