import {
  ExcitementSettingsSection,
  EventKeywordsSection,
  EndingPreviewSection,
  PromptPreviewSection,
  GameBalanceSection,
  RandomGeneratorSection
} from './AdminPageExtensions';

import React, { useState, useEffect } from 'react';
import './AdminPage.css';
import ImageCropModal from './ImageCropModal';
import { STORY_CONFIG } from '../config/storyConfig';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  getGithubToken,
  setGithubToken,
  GITHUB_REPO_OWNER,
  GITHUB_REPO_NAME,
  GITHUB_PAGES_BRANCH,
  GITHUB_PAGES_BASE_URL
} from '../utils/githubToken';

// 업로드 전 이미지 리사이즈 - 원본을 그대로 올리면 업로드가 느리고
// Storage 용량도 낭비되므로, 화면에 필요한 크기(최대 1200px)를 넘으면
// 캔버스로 축소 + JPEG 재인코딩. 이미 작으면 원본 그대로 사용
function resizeImageFile(file, maxDimension = 1200, quality = 0.85) {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width <= maxDimension && height <= maxDimension) {
        resolve(file);
        return;
      }

      const scale = maxDimension / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }));
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

// File -> base64 (data: 접두어 제거한 순수 base64 문자열)
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 파일명에서 GitHub API 경로에 안전하지 않은 문자(한글/공백/특수문자 등) 제거
function sanitizeFileName(name) {
  const dotIdx = name.lastIndexOf('.');
  const ext = dotIdx !== -1 ? name.slice(dotIdx) : '';
  const base = (dotIdx !== -1 ? name.slice(0, dotIdx) : name)
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 40);
  return (base || 'image') + (ext.match(/^\.[a-zA-Z0-9]+$/) ? ext : '.jpg');
}

// 토큰이 아직 없으면(최초 1회) 브라우저 프롬프트로 딱 한 번만 물어보고 저장.
// 어드민 화면에 상시 노출되는 설정 섹션 대신, 정말 필요한 순간에만 물어봄.
function ensureGithubToken() {
  let token = getGithubToken();
  if (token) return token;

  token = window.prompt(
    '이미지 업로드에 쓸 GitHub Personal Access Token을 붙여넣어주세요.\n' +
    '(맥 "킨드캣 업로드" 폴더용으로 이미 만든 토큰이 있다면 그걸 그대로 써도 됩니다)\n' +
    '이 브라우저에만 저장되며, 다음부터는 다시 묻지 않습니다.'
  );
  if (token && token.trim()) {
    token = token.trim();
    setGithubToken(token);
    return token;
  }
  return null;
}

// 로컬 파일을 GitHub의 gh-pages 배포 브랜치에 직접 커밋하고, 배포된 이미지의
// 실제 URL을 반환 (Firebase Storage 대신 사용 - 이 프로젝트의 Storage 버킷이
// 활성화된 적이 없어 전부 실패하던 문제의 대체 경로. GitHub Pages는 push 후
// 약 30초~1분 내에 자동 반영됨).
async function uploadImageFile(file, folder) {
  const token = ensureGithubToken();
  if (!token) {
    throw new Error('GitHub 토큰이 없어 업로드를 진행할 수 없습니다.');
  }

  const resized = await resizeImageFile(file);
  const base64Content = await fileToBase64(resized);
  const path = `images/uploads/${folder}/${Date.now()}_${sanitizeFileName(resized.name)}`;

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `이미지 업로드: ${path}`,
        content: base64Content,
        branch: GITHUB_PAGES_BRANCH
      })
    }
  );

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    if (res.status === 401) {
      setGithubToken(null); // 잘못된 토큰은 지워서 다음 업로드 시 다시 물어보게 함
      throw new Error('GitHub 토큰이 유효하지 않습니다 (401). 다시 업로드를 시도하면 토큰을 다시 입력할 수 있습니다.');
    }
    if (res.status === 404) {
      throw new Error('저장소를 찾을 수 없습니다 (404). 토큰에 이 저장소 쓰기 권한이 있는지 확인해주세요.');
    }
    throw new Error(`GitHub 업로드 실패 (${res.status}): ${errBody.message || '알 수 없는 오류'}`);
  }

  return `${GITHUB_PAGES_BASE_URL}/${path}`;
}

// .js/.mjs 스토리 템플릿에서 "const STORY_CONFIG = { ... };" 객체 리터럴 부분만
// 정확히 잘라낸다. 파일 맨 위 안내 주석에 "const STORY_CONFIG = {...}" 같은 문구가
// 예시로 들어있을 수 있으므로, 텍스트를 앞에서부터 훑으며 문자열/주석 내부는
// 건너뛰고 실제 중괄호 깊이를 세어 "STORY_CONFIG = {"가 나오는 지점 중 마지막
// 것부터 짝이 맞는 "}"까지 찾는다 (주석 속 언급에 낚이지 않도록).
function extractStoryConfigLiteral(content) {
  const marker = 'STORY_CONFIG';
  let searchFrom = 0;
  let lastBraceStart = -1;

  while (true) {
    const idx = content.indexOf(marker, searchFrom);
    if (idx === -1) break;
    const after = content.slice(idx + marker.length).match(/^\s*=\s*\{/);
    if (after) {
      lastBraceStart = idx + marker.length + after[0].length - 1; // '{' 위치
    }
    searchFrom = idx + marker.length;
  }

  if (lastBraceStart === -1) return null;

  let depth = 0;
  let inString = null; // ', ", ` 중 현재 열려있는 문자열 종류
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = lastBraceStart; i < content.length; i++) {
    const ch = content[i];
    const prev = content[i - 1];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (prev === '*' && ch === '/') inBlockComment = false;
      continue;
    }
    if (inString) {
      if (ch === inString && prev !== '\\') inString = null;
      continue;
    }

    if (ch === '/' && content[i + 1] === '/') { inLineComment = true; continue; }
    if (ch === '/' && content[i + 1] === '*') { inBlockComment = true; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { inString = ch; continue; }

    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return content.slice(lastBraceStart, i + 1);
      }
    }
  }

  return null; // 짝이 맞는 닫는 중괄호를 못 찾음
}

// 구버전 호칭 시스템({affection_0_20: '...', ...})을 신버전 배열 형태로 변환
// ([{condition, name}, ...] - 관계 진전 순서대로 나열, 호감도 점수가 아니라
// 상황/이벤트 기준으로 AI가 판단함) - 기존 스토리 불러올 때 한 번만 적용
function migrateCallingSystem(callingSystem) {
  if (Array.isArray(callingSystem)) return callingSystem;
  if (callingSystem && typeof callingSystem === 'object') {
    const tiers = [
      ['affection_0_20', '평소 (기본, 아직 서먹한 사이)'],
      ['affection_21_40', '조금씩 가까워지기 시작했을 때'],
      ['affection_41_60', '어느 정도 편해진 사이가 됐을 때'],
      ['affection_61_80', '가까운 사이가 된 후'],
      ['affection_81_100', '서로 마음을 확인한 이후']
    ];
    const migrated = tiers
      .filter(([key]) => callingSystem[key])
      .map(([key, condition]) => ({ condition, name: callingSystem[key] }));
    if (migrated.length > 0) return migrated;
  }
  return [];
}

// 존댓말 유지도 슬라이더(0~100) 값을 사람이 읽을 라벨로 변환
function honorificLevelLabel(value) {
  const v = value ?? 50;
  if (v <= 20) return '반말로 매우 빠르게';
  if (v <= 40) return '반말로 빠르게';
  if (v <= 60) return '기본 (자연스럽게)';
  if (v <= 80) return '존댓말 오래 유지';
  return '거의 항상 존댓말';
}

// Firebase Storage 등 절대 URL은 그대로, 상대 경로는 public/ 기준으로 변환
function resolveImageSrc(path) {
  if (!path) return path;
  if (/^https?:\/\//.test(path)) return path;
  return `${process.env.PUBLIC_URL}${path}`;
}

function AdminPage({ onSaveConfig }) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [appSettings, setAppSettings] = useState({
    primaryColor: '#FF69B4',
    fontFamily: 'Noto Sans KR',
    fontSize: 16
  });

  // 캐릭터 A (공)
  const [charA, setCharA] = useState({
    ...STORY_CONFIG.characterA,
    secret: STORY_CONFIG.characterA?.secret || '',
    tags: STORY_CONFIG.characterA?.tags || [],
    preferredActions: STORY_CONFIG.characterA?.preferredActions || [],
    avoidedActions: STORY_CONFIG.characterA?.avoidedActions || [],
    callingSystem: migrateCallingSystem(STORY_CONFIG.characterA?.callingSystem),
    bodyDetails: STORY_CONFIG.characterA?.bodyDetails || {},
    sexualDetails: STORY_CONFIG.characterA?.sexualDetails || {},
    visibility: STORY_CONFIG.characterA?.visibility || {
      basicInfo: true,
      sexualDetails: false,
      tags: true,
      actions: false
    }
  });

  // 캐릭터 B (수)
  const [charB, setCharB] = useState({
    ...STORY_CONFIG.characterB,
    secret: STORY_CONFIG.characterB?.secret || '',
    tags: STORY_CONFIG.characterB?.tags || [],
    preferredActions: STORY_CONFIG.characterB?.preferredActions || [],
    avoidedActions: STORY_CONFIG.characterB?.avoidedActions || [],
    callingSystem: migrateCallingSystem(STORY_CONFIG.characterB?.callingSystem),
    bodyDetails: STORY_CONFIG.characterB?.bodyDetails || {},
    sexualDetails: STORY_CONFIG.characterB?.sexualDetails || {},
    visibility: STORY_CONFIG.characterB?.visibility || {
      basicInfo: true,
      sexualDetails: false,
      tags: true,
      actions: false
    }
  });

  // 시나리오
  const [scenario, setScenario] = useState({
    title: STORY_CONFIG.title || '윤간호사 울리기',
    description: STORY_CONFIG.description || '윤간호사의 약점을 찾아서 울려보세요',
    relationship: STORY_CONFIG.scenario?.relationship || '상사와 부하',
    dynamic: STORY_CONFIG.scenario?.dynamic || '',
    background: STORY_CONFIG.scenario?.background || '',
    startDate: STORY_CONFIG.scenario?.startDate || '',
    location: STORY_CONFIG.scenario?.location || '직장(병원)',
    situation: STORY_CONFIG.scenario?.situation || '복도에서 마주침',
    time: STORY_CONFIG.scenario?.time || '오후 3시',
    narrativePattern: STORY_CONFIG.scenario?.narrativePattern || 'A',
    selectedEnding: STORY_CONFIG.scenario?.selectedEnding || '',
    storyTags: {
      genre: ['#로맨스', '#오피스'],
      mood: ['#달달', '#긴장감'],
      situation: ['#첫만남', '#짝사랑'],
      subject: [],
      relationship: [],
      adult: []
    }
  });

  // 엔딩 시스템
  const [endings, setEndings] = useState({
    true: {
      name: '트루 엔딩',
      condition: '호감도 100 + 핵심 이벤트 성공',
      minAffection: 100,
      requiredKeywords: [],
      description: '',
      reward: '',
      cgImage: ''
    },
    normal: {
      name: '노멀 엔딩',
      condition: '호감도 70-99',
      minAffection: 70,
      maxAffection: 99,
      description: '',
      cgImage: ''
    },
    bad: {
      name: '배드 엔딩',
      condition: '호감도 70 미만 또는 치명적 선택',
      maxAffection: 69,
      badKeywords: [],
      description: '',
      cgImage: ''
    },
    hidden: {
      name: '히든 엔딩',
      condition: '특수 조건 달성',
      requiredKeywords: [],
      description: '',
      cgImage: ''
    }
  });
const [excitementSettings, setExcitementSettings] = useState({});
const [eventKeywords, setEventKeywords] = useState({});
const [balanceSettings, setBalanceSettings] = useState({});

  // 이미지 (기본 5단계)
  const [images, setImages] = useState([
    { id: 1, threshold: 20, name: '첫 만남', file: null, preview: null },
    { id: 2, threshold: 40, name: '친밀해짐', file: null, preview: null },
    { id: 3, threshold: 60, name: '설레는 순간', file: null, preview: null },
    { id: 4, threshold: 80, name: '깊어지는 관계', file: null, preview: null },
    { id: 5, threshold: 100, name: '완전한 신뢰', file: null, preview: null }
  ]);

  // 다중 배경 이미지 (호감도별 배열)
  const [backgroundImages, setBackgroundImages] = useState({
    0: [],
    20: [],
    40: [],
    60: [],
    80: []
  });

  // 프로필 이미지 (여러 장)
  const [profileImagesA, setProfileImagesA] = useState([]);
  const [profileImagesB, setProfileImagesB] = useState([]);

  // 프로필 이미지 - "경로 직접 추가" 입력창에 입력 중인 값
  const [newProfilePathA, setNewProfilePathA] = useState('');
  const [newProfilePathB, setNewProfilePathB] = useState('');

  const AVAILABLE_FONTS = [
    'Malgun Gothic',
    'Noto Sans KR',
    'Nanum Gothic',
    'Nanum Myeongjo',
    'Black Han Sans',
    'Do Hyeon',
    'Jua',
    'Sunflower',
    '커스텀 (직접 입력)'
  ];

  // 서사 패턴 옵션
  const NARRATIVE_PATTERNS = {
    A: { 
      name: '권력/지위 격차', 
      description: '상사-부하, 재벌-평민 등 사회적 위치 차이',
      endings: ['지위 극복', '비밀 유지', '파탄'] 
    },
    B: { 
      name: '적대 관계', 
      description: '라이벌, 원수, 경쟁자 등 갈등 관계',
      endings: ['화해', '어색한 관계', '이별'] 
    },
    C: { 
      name: '운명적 만남', 
      description: '우연한 만남, 첫눈에 반함, 소울메이트',
      endings: ['운명 이루기', '스쳐 지나감', '엇갈림'] 
    },
    D: { 
      name: '강제 동거', 
      description: '계약 동거, 룸메이트, 가족 사정',
      endings: ['진짜 연인', '계약 종료 이별', '계속 동거'] 
    },
    E: { 
      name: '금기 관계', 
      description: '나이 차, 스승-제자, 형제 등 금지된 사랑',
      endings: ['금기 깨고 함께', '금기 지켜 이별', '숨긴 채 지속'] 
    },
    F: { 
      name: '과거 인연', 
      description: '첫사랑 재회, 헤어진 연인, 잊힌 기억',
      endings: ['재결합', '과거 못 이김', '새로운 시작'] 
    },
    G: { 
      name: '계약/거래', 
      description: '계약 연애, 거래 관계, 이해 관계',
      endings: ['진심 전환', '계약대로 끝', '복수'] 
    },
    H: { 
      name: '구원/보호', 
      description: '상처 치유, 보호 본능, 서로 구원',
      endings: ['서로 구원', '구원 실패', '의존 관계'] 
    }
  };

  const COMMON_TAGS_GONG = [
    '#냉혈공', '#재벌공', '#강공', '#광공', '#집착공',
    '#절륜공', '#능글공', '#다정공', '#헌신공', '#연상공',
    '#후회공', '#음란침공', '#너드공', '#퇴폐공',
    '#무심공', '#츤데레공', '#능욕공', '#계략공', '#까칠공', '#상처공', '#대형견공',
    '#미남공', '#미인공', '#능력공', '#평범공', '#수인공', '#문란공', '#황제공',
    '#동정공', '#알파공', '#인싸공', '#순진공', '#소심공', '#장발공', '#연하공', '#존댓말공'
  ];

  const COMMON_TAGS_SU = [
    '#까칠수', '#강수', '#무심수', '#순수수', '#다정수', '#헌신수', '#유혹수',
    '#상처수', '#자낮수', '#공이었수', '#츤데레', '#연상수',
    '#허당수', '#마조수', '#이중생활수', '#집착수', '#도망수', '#굴림수', '#후회수', '#병약수',
    '#군림수', '#철벽수', '#능욕수', '#갈대수', '#적극수',
    '#미인수', '#능력수', '#단정수', '#명랑수', '#미남수', '#임신수', '#동정수',
    '#순정수', '#귀족수', '#중년수', '#안경수', '#귀염수', '#오메가수', '#평범수', '#처연수'
  ];

  const STORY_TAG_OPTIONS = {
    genre: [
      '#로맨스', '#오피스', '#학원', '#판타지', '#현대물',
      '#시대물', '#SF', '#스릴러', '#코미디', '#19금',
      '#개그코믹', '#일상', '#옴니버스', '#드라마', '#오메가버스',
      '#돔섭버스', '#가이드버스', '#스포츠', '#성비단'
    ],
    mood: [
      '#달달', '#긴장감', '#애절', '#유쾌', '#어둡',
      '#몽환적', '#현실적', '#센슈얼', '#순애', '#집착',
      '#리맨물', '#재회물', '#연예계', '#동양풍', '#피폐물',
      '#시리어스', '#힐링물', '#서양풍', '#육아물', '#환생물',
      '#이세계물', '#회귀물', '#키잡물', '#고어물'
    ],
    situation: [
      '#첫만남', '#재회', '#짝사랑', '#양편사랑', '#삼각관계',
      '#금지된사랑', '#계약연애', '#동거', '#출장', '#비밀연애'
    ],
    // 소재 (트로프) - 장르/분위기와는 다른 축, 이야기에 들어가는 구체적 소재 요소
    subject: [
      '#친구연인', '#인외존재', '#첫사랑', '#연애결혼', '#트라우마',
      '#복수', '#초능력', '#동물', '#기억상실', '#우정',
      '#인큐버스', '#죽음살인', '#음식', '#영혼바뀜', '#전쟁',
      '#게임', '#하렘역하렘', '#다공일수', '#수인', '#유사근친',
      '#역키잡', '#스폰물', '#귀신유령', '#질투', '#장발'
    ],
    // 관계 - 두 사람이 맺고 있는 관계 구조
    relationship: [
      '#친구', '#계약관계', '#주종관계', '#선후배', '#연상연하',
      '#배틀연애', '#나이차커플', '#사제관계', '#다각관계', '#애증관계',
      '#부부', '#리버스', '#쌍방구원', '#오해착각', '#혐관', '#세같살'
    ],
    // 성인 소재 - 19금 씬의 구체적 성향/연출
    adult: [
      '#하드코어', '#유혹', '#원나잇', '#고수위', '#SM',
      '#능욕', '#감금강제', '#변태', '#BDSM', '#후방주의',
      '#섹스파트너', '#성인용품', '#첫경험', '#페티쉬', '#조교',
      '#3P', '#화류계', '#납치', '#거유', '#마사지',
      '#섹스가이드', '#TS물', '#노출증', '#여친몰래', '#남친몰래', '#촉수'
    ]
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin1234') {
      setIsAuthenticated(true);
    } else {
      alert('비밀번호가 틀렸습니다!');
    }
  };

  // 프로필 이미지 추가 (공) - 파일 업로드
  const handleAddProfileImageA = (file) => {
    if (!file) return;
    requestCrop(file, 1, async (croppedFile) => {
      try {
        const url = await uploadImageFile(croppedFile, 'profile-a');
        setProfileImagesA(prev => [...prev, url]);
      } catch (err) {
        alert('이미지 업로드 실패: ' + err.message);
      }
    });
  };

  // 프로필 이미지 추가 (공) - 경로/URL 직접 입력
  const handleAddProfileImagePathA = () => {
    const path = newProfilePathA.trim();
    if (!path) return;
    setProfileImagesA(prev => [...prev, path]);
    setNewProfilePathA('');
  };

  // 프로필 이미지 추가 (수) - 파일 업로드
  const handleAddProfileImageB = (file) => {
    if (!file) return;
    requestCrop(file, 1, async (croppedFile) => {
      try {
        const url = await uploadImageFile(croppedFile, 'profile-b');
        setProfileImagesB(prev => [...prev, url]);
      } catch (err) {
        alert('이미지 업로드 실패: ' + err.message);
      }
    });
  };

  // 프로필 이미지 추가 (수) - 경로/URL 직접 입력
  const handleAddProfileImagePathB = () => {
    const path = newProfilePathB.trim();
    if (!path) return;
    setProfileImagesB(prev => [...prev, path]);
    setNewProfilePathB('');
  };

  // 키워드 이미지 추가
  const [newKeyword, setNewKeyword] = useState('');
  const [newKeywordPath, setNewKeywordPath] = useState('');
  const [keywordImageList, setKeywordImageList] = useState([]);

  const handleAddKeywordImage = () => {
    if (newKeyword.trim() && newKeywordPath.trim()) {
      setKeywordImageList([
        ...keywordImageList,
        { 
          keyword: newKeyword.trim(), 
          imagePath: newKeywordPath.trim() 
        }
      ]);
      setNewKeyword('');
      setNewKeywordPath('');
    } else {
      alert('키워드와 이미지 경로를 모두 입력해주세요!');
    }
  };

  // 키워드 이미지 수정
  const handleUpdateKeywordImage = (index, field, value) => {
    const updated = [...keywordImageList];
    updated[index][field] = value;
    setKeywordImageList(updated);
  };

  // 키워드 이미지 삭제
  const handleRemoveKeywordImage = (index) => {
    setKeywordImageList(keywordImageList.filter((_, i) => i !== index));
  };

  const handleTagToggle = (character, tag) => {
    if (character === 'A') {
      const tags = charA.tags.includes(tag)
        ? charA.tags.filter(t => t !== tag)
        : [...charA.tags, tag];
      setCharA({ ...charA, tags });
    } else {
      const tags = charB.tags.includes(tag)
        ? charB.tags.filter(t => t !== tag)
        : [...charB.tags, tag];
      setCharB({ ...charB, tags });
    }
  };

  const handleAddCustomTag = (character) => {
    const tag = prompt('새 태그 입력 (예: #집착공)');
    if (tag && tag.startsWith('#')) {
      if (character === 'A') {
        if (!charA.tags.includes(tag)) {
          setCharA({ ...charA, tags: [...charA.tags, tag] });
        } else {
          alert('이미 추가된 태그입니다!');
        }
      } else {
        if (!charB.tags.includes(tag)) {
          setCharB({ ...charB, tags: [...charB.tags, tag] });
        } else {
          alert('이미 추가된 태그입니다!');
        }
      }
    } else if (tag) {
      alert('태그는 #으로 시작해야 합니다!');
    }
  };

  // 작품 태그 토글
  const handleStoryTagToggle = (category, tag) => {
    const currentTags = scenario.storyTags[category];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    setScenario({
      ...scenario,
      storyTags: {
        ...scenario.storyTags,
        [category]: newTags
      }
    });
  };

  // 작품 태그 커스텀 추가
  const handleAddStoryTag = (category) => {
    const tag = prompt(`새 ${category === 'genre' ? '장르' : category === 'mood' ? '분위기' : '상황'} 태그 입력 (예: #판타지)`);
    
    if (tag && tag.startsWith('#')) {
      if (!scenario.storyTags[category].includes(tag)) {
        setScenario({
          ...scenario,
          storyTags: {
            ...scenario.storyTags,
            [category]: [...scenario.storyTags[category], tag]
          }
        });
      } else {
        alert('이미 추가된 태그입니다!');
      }
    } else if (tag) {
      alert('태그는 #으로 시작해야 합니다!');
    }
  };

  const handleArrayInput = (character, field, index, value) => {
    if (character === 'A') {
      const newArray = [...charA[field]];
      if (value === '') {
        newArray.splice(index, 1);
      } else {
        newArray[index] = value;
      }
      setCharA({ ...charA, [field]: newArray });
    } else {
      const newArray = [...charB[field]];
      if (value === '') {
        newArray.splice(index, 1);
      } else {
        newArray[index] = value;
      }
      setCharB({ ...charB, [field]: newArray });
    }
  };

  const handleAddArrayItem = (character, field) => {
    if (character === 'A') {
      setCharA({ ...charA, [field]: [...charA[field], ''] });
    } else {
      setCharB({ ...charB, [field]: [...charB[field], ''] });
    }
  };

  // 저장된 스토리 목록 관리
  const [savedStories, setSavedStories] = useState([]);
  const [currentStoryId, setCurrentStoryId] = useState(null);
  const [storyTitle, setStoryTitle] = useState('윤간호사 울리기');
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isEndingSectionOpen, setIsEndingSectionOpen] = useState(false);

  // 어드민이 점점 복잡해져서 좌측 햄버거 메뉴로 "홈 설정"(스토리 목록/순서/배너)과
  // "스토리 설정"(캐릭터·시나리오 등 개별 스토리 편집)을 분리해서 보여줌
  const [adminView, setAdminView] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 홈 배너의 "🔥 지금 추천하는 스토리" 뱃지 - 스토리마다 따로 켜고 끄거나
  // 문구/이모지를 바꿀 수 있음 (각 스토리 문서의 badgeEnabled/badgeText 필드).
  // 텍스트 입력창은 타이핑 중간에 매번 Firestore에 쓰지 않도록 로컬 임시값을
  // 따로 들고 있다가, 포커스를 벗어날 때(onBlur) 한 번만 저장함
  const [badgeTextDrafts, setBadgeTextDrafts] = useState({});

  const handleToggleStoryBadge = async (storyId) => {
    const story = savedStories.find(s => s.id === storyId);
    const nextValue = !(story?.badgeEnabled !== false); // 기본값 true 취급 후 반전
    try {
      await setDoc(doc(db, 'stories', storyId), { badgeEnabled: nextValue }, { merge: true });
      const updatedStories = savedStories.map(s =>
        s.id === storyId ? { ...s, badgeEnabled: nextValue } : s
      );
      localStorage.setItem('kind_cat_stories', JSON.stringify(updatedStories));
      setSavedStories(updatedStories);
    } catch (error) {
      console.error('❌ 추천 배지 설정 저장 실패:', error);
      alert('추천 배지 설정 저장 중 오류가 발생했습니다: ' + error.message);
    }
  };

  const handleSaveStoryBadgeText = async (storyId, text) => {
    try {
      await setDoc(doc(db, 'stories', storyId), { badgeText: text }, { merge: true });
      const updatedStories = savedStories.map(s =>
        s.id === storyId ? { ...s, badgeText: text } : s
      );
      localStorage.setItem('kind_cat_stories', JSON.stringify(updatedStories));
      setSavedStories(updatedStories);
      setBadgeTextDrafts(prev => {
        const next = { ...prev };
        delete next[storyId];
        return next;
      });
    } catch (error) {
      console.error('❌ 추천 배지 문구 저장 실패:', error);
      alert('추천 배지 문구 저장 중 오류가 발생했습니다: ' + error.message);
    }
  };

  // 이미지 업로드 전 크롭 모달 - 어떤 업로드 버튼에서 열렸는지와 완료 후 콜백을 담아둠
  const [cropRequest, setCropRequest] = useState(null);
  const requestCrop = (file, aspect, onCropped) => {
    if (!file) return;
    setCropRequest({ file, aspect, onCropped });
  };
  const [imageFiles, setImageFiles] = useState({
    thumbnail: '',
    profileA: '',
    profileB: '',
    backgrounds: {
      0: '',
      20: '',
      40: '',
      60: '',
      80: ''
    },
    keywordImages: []
  });

  useEffect(() => {
    const loadStories = async () => {
      const localStories = JSON.parse(localStorage.getItem('kind_cat_stories') || '[]');
      
      try {
        const { collection, onSnapshot } = await import('firebase/firestore');
        const storiesRef = collection(db, 'stories');
        
        const unsubscribe = onSnapshot(storiesRef, (snapshot) => {
          if (!snapshot.empty) {
            const firestoreStories = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));

            const mergedStories = [...firestoreStories];
            localStories.forEach(localStory => {
              const existsInFirestore = firestoreStories.find(fs => fs.id === localStory.id);
              if (!existsInFirestore) {
                mergedStories.push(localStory);
              }
            });

            console.log('📚 불러온 스토리:', mergedStories);
            setSavedStories(mergedStories);
          } else {
            console.log('📦 로컬 스토리만 사용');
            setSavedStories(localStories);
          }
        }, (error) => {
          console.error('❌ Firestore 읽기 오류, 로컬만 사용:', error);
          setSavedStories(localStories);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('❌ Firestore 연결 실패, 로컬만 사용:', error);
        setSavedStories(localStories);
      }
    };

    loadStories();
  }, []);

  // 파일 경로 직접 입력
  const handleImagePathChange = (type, value, affectionLevel = null) => {
    if (type === 'background' && affectionLevel !== null) {
      setImageFiles({
        ...imageFiles,
        backgrounds: {
          ...imageFiles.backgrounds,
          [affectionLevel]: value
        }
      });
    } else {
      setImageFiles({
        ...imageFiles,
        [type]: value
      });
    }
  };

  // 썸네일 업로드
  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    requestCrop(file, 4 / 5, processThumbnailUpload);
  };

  const processThumbnailUpload = async (file) => {
    const reader = new FileReader();
    reader.onload = (ev) => setThumbnailPreview(ev.target.result);
    reader.readAsDataURL(file);

    setIsUploadingThumbnail(true);
    try {
      const url = await uploadImageFile(file, 'thumbnails');
      handleImagePathChange('thumbnail', url);
    } catch (err) {
      alert('썸네일 업로드 실패: ' + err.message);
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  // JSON 파일에서 불러오기
  const handleImportFromJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.mjs,.js';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          const isJsSource = file.name.endsWith('.mjs') || file.name.endsWith('.js');
          let data;

          if (isJsSource) {
            // .js/.mjs 템플릿은 순수 JSON이 아니라 JS 객체 리터럴(작은따옴표,
            // 주석, 트레일링 콤마 등 허용)이므로 JSON.parse가 아니라 실제로
            // 평가해서 읽어들인다. 파일은 어드민 로그인 후 본인이 직접 고른
            // 로컬 파일이므로(외부에서 주입되는 값이 아님) Function 평가가 안전함.
            const literal = extractStoryConfigLiteral(content);
            if (!literal) {
              throw new Error('STORY_CONFIG 객체를 찾지 못했습니다. "const STORY_CONFIG = { ... };" 형태인지 확인해주세요.');
            }
            // eslint-disable-next-line no-new-func
            data = new Function(`"use strict"; return (${literal});`)();
          } else {
            data = JSON.parse(content);
          }
          
          // 새 스토리 ID 생성
          const newStoryId = Date.now().toString();
          
          // 상태 업데이트
          setCurrentStoryId(newStoryId);
          setStoryTitle(data.title || '가져온 스토리');
          setThumbnailPreview(data.thumbnail || null);
          
          setScenario({
            title: data.title,
            description: data.description,
            storyTags: {
              genre: ['#로맨스'],
              mood: ['#달달'],
              situation: ['#첫만남'],
              subject: [],
              relationship: [],
              adult: [],
              ...(data.storyTags || {})
            },
            relationship: data.scenario?.relationship || '',
            dynamic: data.scenario?.dynamic || '',
            background: data.scenario?.background || '',
            location: data.scenario?.location || '',
            situation: data.scenario?.situation || '',
            time: data.scenario?.time || '',
            narrativePattern: data.scenario?.narrativePattern || 'A',
            selectedEnding: data.scenario?.selectedEnding || ''
          });
          
          setCharA(data.characterA);
          setCharB(data.characterB);
          setImages(data.images || []);

          if (data.endings) setEndings(data.endings);
          setExcitementSettings(data.excitementSettings || {});
          setEventKeywords(data.eventKeywords || {});
          setBalanceSettings(data.balanceSettings || {});

          const bgImages = data.backgroundImages || {};
          setBackgroundImages({
            0: Array.isArray(bgImages[0]) ? bgImages[0] : [],
            20: Array.isArray(bgImages[20]) ? bgImages[20] : [],
            40: Array.isArray(bgImages[40]) ? bgImages[40] : [],
            60: Array.isArray(bgImages[60]) ? bgImages[60] : [],
            80: Array.isArray(bgImages[80]) ? bgImages[80] : []
          });
          
          setProfileImagesA(data.characterA?.profileImages || []);
          setProfileImagesB(data.characterB?.profileImages || []);
          setKeywordImageList(data.keywordImages || []);

          setAdminView('story');
          alert('✅ JSON 파일에서 스토리를 성공적으로 불러왔습니다!');
        } catch (error) {
          console.error('JSON 파싱 오류:', error);
          alert('❌ 파일을 읽는 중 오류가 발생했습니다: ' + error.message);
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };

  // 설정 저장
  const handleSaveConfig = async () => {
    if (isUploadingThumbnail) {
      alert('⏳ 썸네일 업로드가 아직 끝나지 않았습니다. 잠시 후 다시 저장해주세요.');
      return;
    }
    const storyId = currentStoryId || Date.now().toString();
    
    const config = {
      id: storyId,
      storyTitle: storyTitle,
      savedAt: new Date().toISOString(),
      published: savedStories.find(s => s.id === storyId)?.published || false,
      publishedAt: savedStories.find(s => s.id === storyId)?.publishedAt || null,
      // thumbnailPreview는 파일 선택 직후 미리보기용 base64라 용량이 커서
      // Firestore 1MB 필드 제한을 넘길 수 있음 - 절대 저장값으로 쓰지 말 것.
      // 실제 저장값은 Storage 업로드가 끝난 뒤 채워지는 imageFiles.thumbnail(URL)만 사용
      thumbnail: imageFiles.thumbnail || (thumbnailPreview && !thumbnailPreview.startsWith('data:') ? thumbnailPreview : null),
      backgroundImages: backgroundImages,
      keywordImages: keywordImageList,
      appSettings,
      title: scenario.title,
      description: scenario.description,
      storyTags: scenario.storyTags,
      characterA: {
        ...charA,
        avatar: null,
        avatarPreview: imageFiles.profileA || charA.avatarPreview,
        profileImages: profileImagesA
      },
      characterB: {
        ...charB,
        avatar: null,
        avatarPreview: imageFiles.profileB || charB.avatarPreview,
        profileImages: profileImagesB
      },
      scenario: {
        relationship: scenario.relationship,
        dynamic: scenario.dynamic || '',
        background: scenario.background || '',
        startDate: scenario.startDate || '',
        location: scenario.location,
        situation: scenario.situation,
        time: scenario.time,
        narrativePattern: scenario.narrativePattern || 'A',
        selectedEnding: scenario.selectedEnding || ''
      },
      endings: endings,
      images: images.map(img => ({
        id: img.id,
        threshold: img.threshold,
        name: img.name
      })),
       excitementSettings: excitementSettings,
  eventKeywords: eventKeywords,
  balanceSettings: balanceSettings,

    };

    try {
      // Firebase에 저장
      await setDoc(doc(db, 'stories', storyId), config);
      console.log('✅ Firebase 저장 성공:', storyId);

      // localStorage에도 백업
      const existingIndex = savedStories.findIndex(s => s.id === storyId);
      let updatedStories;
      
      if (existingIndex >= 0) {
        updatedStories = [...savedStories];
        updatedStories[existingIndex] = {
          ...config,
          published: updatedStories[existingIndex].published,
          publishedAt: updatedStories[existingIndex].publishedAt
        };
      } else {
        updatedStories = [...savedStories, config];
      }
      
      localStorage.setItem('kind_cat_stories', JSON.stringify(updatedStories));
      setSavedStories(updatedStories);
      setCurrentStoryId(storyId);
      localStorage.setItem('kind_cat_active_story', storyId);
      
      alert(`✅ "${storyTitle}" 스토리가 저장되었습니다! (Firebase + 로컬)`);
    } catch (error) {
      console.error('❌ Firebase 저장 실패:', error);
      alert('저장 중 오류가 발생했습니다: ' + error.message);
    }
  };

  // 스토리 발행
  const handlePublishStory = async () => {// 기존 state 아래에 추가

    if (!currentStoryId) {
      alert('⚠️ 먼저 스토리를 저장해주세요!');
      return;
    }

    const story = savedStories.find(s => s.id === currentStoryId);
    if (!story) {
      alert('⚠️ 스토리를 찾을 수 없습니다!');
      return;
    }

    if (!window.confirm(`📢 "${storyTitle}" 스토리를 발행하시겠습니까?\n\n발행하면 메인 화면에 공개됩니다!`)) {
      return;
    }



    try {
      // Firebase에 발행 상태 업데이트
      await setDoc(doc(db, 'stories', currentStoryId), {
        published: true,
        publishedAt: new Date().toISOString()
      }, { merge: true });

      // localStorage도 업데이트
      const updatedStories = savedStories.map(s => 
        s.id === currentStoryId 
          ? { ...s, published: true, publishedAt: new Date().toISOString() }
          : s
      );

      localStorage.setItem('kind_cat_stories', JSON.stringify(updatedStories));
      setSavedStories(updatedStories);

      alert(`✅ "${storyTitle}" 스토리가 발행되었습니다!\n\n메인 화면에서 확인할 수 있습니다.`);
    } catch (error) {
      console.error('❌ 발행 실패:', error);
      alert('발행 중 오류가 발생했습니다: ' + error.message);
    }
  };

  // 발행 취소
  const handleUnpublishStory = async () => {
    if (!currentStoryId) return;

    if (!window.confirm(`"${storyTitle}" 스토리의 발행을 취소하시겠습니까?\n\n메인 화면에서 숨겨집니다.`)) {
      return;
    }

    try {
      // Firebase 업데이트
      await setDoc(doc(db, 'stories', currentStoryId), {
        published: false,
        publishedAt: null
      }, { merge: true });

      // localStorage 업데이트
      const updatedStories = savedStories.map(s => 
        s.id === currentStoryId 
          ? { ...s, published: false, publishedAt: null }
          : s
      );

      localStorage.setItem('kind_cat_stories', JSON.stringify(updatedStories));
      setSavedStories(updatedStories);

      alert(`✅ "${storyTitle}" 스토리의 발행이 취소되었습니다!`);
    } catch (error) {
      console.error('❌ 발행 취소 실패:', error);
      alert('발행 취소 중 오류가 발생했습니다: ' + error.message);
    }
  };

  // 스토리 로드
  const handleLoadStory = (storyId) => {
    const story = savedStories.find(s => s.id === storyId);
    if (!story) return;

    setAdminView('story'); // 불러오면 바로 편집할 수 있게 스토리 설정 화면으로 전환
    setCurrentStoryId(story.id);
    setStoryTitle(story.storyTitle);
    setThumbnailPreview(story.thumbnail || null);
    setImageFiles(prev => ({ ...prev, thumbnail: story.thumbnail || '' }));
    setAppSettings(story.appSettings || {
      primaryColor: '#FF69B4',
      fontFamily: 'Noto Sans KR',
      fontSize: 16
    });
    setScenario({
      title: story.title,
      description: story.description,
      storyTags: {
        genre: [],
        mood: [],
        situation: [],
        subject: [],
        relationship: [],
        adult: [],
        ...(story.storyTags || {})
      },
      relationship: story.scenario.relationship,
      dynamic: story.scenario.dynamic || '',
      background: story.scenario.background || '',
      startDate: story.scenario.startDate || '',
      location: story.scenario.location,
      situation: story.scenario.situation,
      time: story.scenario.time,
      narrativePattern: story.scenario.narrativePattern || 'A',
      selectedEnding: story.scenario.selectedEnding || ''
    });
    
    // 엔딩 불러오기
    if (story.endings) {
      setEndings(story.endings);
    }
    setCharA({ ...story.characterA, callingSystem: migrateCallingSystem(story.characterA.callingSystem) });
    setCharB({ ...story.characterB, callingSystem: migrateCallingSystem(story.characterB.callingSystem) });
    setImages(story.images);

    if (story.excitementSettings) {
  setExcitementSettings(story.excitementSettings);
}
if (story.eventKeywords) {
  setEventKeywords(story.eventKeywords);
}
if (story.balanceSettings) {
  setBalanceSettings(story.balanceSettings);
}
    
    const bgImages = story.backgroundImages || {};
    setBackgroundImages({
      0: Array.isArray(bgImages[0]) ? bgImages[0] : [],
      20: Array.isArray(bgImages[20]) ? bgImages[20] : [],
      40: Array.isArray(bgImages[40]) ? bgImages[40] : [],
      60: Array.isArray(bgImages[60]) ? bgImages[60] : [],
      80: Array.isArray(bgImages[80]) ? bgImages[80] : []
    });
    
    setProfileImagesA(story.characterA.profileImages || []);
    setProfileImagesB(story.characterB.profileImages || []);
    setKeywordImageList(story.keywordImages || []);
    
    localStorage.setItem('kind_cat_active_story', storyId);
    
    alert(`✅ "${story.storyTitle}" 스토리를 불러왔습니다!`);
  };

  // 새 스토리 생성
  const handleNewStory = () => {
    if (!window.confirm('현재 작업 중인 내용이 저장되지 않았을 수 있습니다. 새 스토리를 만드시겠습니까?')) {
      return;
    }

    setAdminView('story');
    setCurrentStoryId(null);
    setStoryTitle('새 스토리');
    
    alert('✅ 새 스토리가 생성되었습니다!');
  };

  // 스토리 삭제
  const handleDeleteStory = async (storyId) => {
    const story = savedStories.find(s => s.id === storyId);
    if (!window.confirm(`"${story?.storyTitle}" 스토리를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      // Firebase에서 삭제
      await deleteDoc(doc(db, 'stories', storyId));
      
      // localStorage에서도 삭제
      const updatedStories = savedStories.filter(s => s.id !== storyId);
      localStorage.setItem('kind_cat_stories', JSON.stringify(updatedStories));
      setSavedStories(updatedStories);
      
      if (currentStoryId === storyId) {
        setCurrentStoryId(null);
        localStorage.removeItem('kind_cat_active_story');
      }
      
      alert('✅ 스토리가 삭제되었습니다!');
    } catch (error) {
      console.error('❌ 삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다: ' + error.message);
    }
  };

  // 메인 화면 노출 여부 토글 (삭제하지 않고 숨기기만)
  // 메인 화면(스토리 목록)에 표시되는 순서를 관리자가 직접 지정.
  // 처음 사용 시엔 현재 순서(최신 저장순)를 기준으로 0,1,2...를 일괄 부여하고,
  // 그 이후엔 이 숫자로만 정렬함 (작을수록 먼저 표시).
  const getOrderedSavedStories = () => {
    return [...savedStories].sort((a, b) => {
      const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : Infinity;
      const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : Infinity;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.savedAt) - new Date(a.savedAt);
    });
  };

  const handleMoveStory = async (storyId, direction) => {
    const currentOrder = getOrderedSavedStories();
    const idx = currentOrder.findIndex(s => s.id === storyId);
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (idx === -1 || targetIdx < 0 || targetIdx >= currentOrder.length) return;

    const reordered = [...currentOrder];
    [reordered[idx], reordered[targetIdx]] = [reordered[targetIdx], reordered[idx]];

    try {
      await Promise.all(
        reordered.map((s, i) => setDoc(doc(db, 'stories', s.id), { displayOrder: i }, { merge: true }))
      );
      const updatedStories = savedStories.map(s => {
        const i = reordered.findIndex(r => r.id === s.id);
        return { ...s, displayOrder: i };
      });
      localStorage.setItem('kind_cat_stories', JSON.stringify(updatedStories));
      setSavedStories(updatedStories);
    } catch (error) {
      console.error('❌ 순서 변경 실패:', error);
      alert('순서 변경 중 오류가 발생했습니다: ' + error.message);
    }
  };

  const handleToggleHidden = async (storyId) => {
    const story = savedStories.find(s => s.id === storyId);
    const nextHidden = !story?.hidden;

    try {
      await setDoc(doc(db, 'stories', storyId), { hidden: nextHidden }, { merge: true });

      const updatedStories = savedStories.map(s =>
        s.id === storyId ? { ...s, hidden: nextHidden } : s
      );
      localStorage.setItem('kind_cat_stories', JSON.stringify(updatedStories));
      setSavedStories(updatedStories);
    } catch (error) {
      console.error('❌ 숨기기 토글 실패:', error);
      alert('숨기기 설정 중 오류가 발생했습니다: ' + error.message);
    }
  };

  // 메인 화면 히어로 배너로 노출할 스토리 지정 - 여러 개 켜두면 홈 화면에서
  // 캐러셀(옆 슬라이드가 살짝 보이는 형태)로 노출됨. 단순 토글이라 몇 개든 동시에 켤 수 있음
  const handleToggleBanner = async (storyId) => {
    const story = savedStories.find(s => s.id === storyId);
    const nextValue = !story?.isBanner;

    try {
      await setDoc(doc(db, 'stories', storyId), { isBanner: nextValue }, { merge: true });

      const updatedStories = savedStories.map(s =>
        s.id === storyId ? { ...s, isBanner: nextValue } : s
      );
      localStorage.setItem('kind_cat_stories', JSON.stringify(updatedStories));
      setSavedStories(updatedStories);
    } catch (error) {
      console.error('❌ 배너 설정 실패:', error);
      alert('배너 설정 중 오류가 발생했습니다: ' + error.message);
    }
  };

  // 다운로드 기능 (백업용)
  const handleDownloadConfig = () => {
    const config = {
      appSettings,
      title: scenario.title,
      description: scenario.description,
      characterA: charA,
      characterB: charB,
      scenario: {
        relationship: scenario.relationship,
        dynamic: scenario.dynamic,
        background: scenario.background || '',
        startDate: scenario.startDate || '',
        location: scenario.location,
        situation: scenario.situation,
        time: scenario.time
      },
      images: images.map(img => ({
        id: img.id,
        threshold: img.threshold,
        name: img.name,
        preview: img.preview
      })),
      backgroundImages: backgroundImages,
      keywordImages: keywordImageList
    };

    const configText = `export const STORY_CONFIG = ${JSON.stringify(config, null, 2)};

export const SYSTEM_PROMPT = \`당신은 한국 BL 인터랙티브 픽션의 AI입니다.

[캐릭터 태그]
공: ${charA.tags.join(', ')}
수: ${charB.tags.join(', ')}

[선호 행동]
공: ${charA.preferredActions.join(', ')}
수: ${charB.preferredActions.join(', ')}

[비선호 행동 - 절대 사용 금지]
공: ${charA.avoidedActions.join(', ')}
수: ${charB.avoidedActions.join(', ')}

[핵심 규칙]
1. 응답은 반드시 JSON 형식
2. 지문과 대사 명확히 구분
3. 캐릭터 성격과 태그 반영
4. 호감도 점진적 증가
5. 선호 행동 우선, 비선호 행동 회피

[응답 형식]
{
  "narration": "지문 (200-300자)",
  "dialogues": [
    {"character": "${charA.name}", "text": "대사"},
    {"character": "${charB.name}", "text": "대사"}
  ],
  "affection_change": -10~+15,
  "excitement_change": 0~+10,
  "choices": ["선택1", "선택2", "선택3", "선택4"]
}\`;`;

    const blob = new Blob([configText], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'storyConfig.js';
    a.click();
    URL.revokeObjectURL(url);

    alert('✅ 설정 파일 다운로드 완료!');
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-container">
          <div className="admin-logo-section">
            <img 
              src={`${process.env.PUBLIC_URL}/cat-icon.png`}
              alt="CAT" 
              className="admin-cat-icon"
            />
            <h1 className="admin-title">🔐 관리자 로그인</h1>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              className="login-input"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="login-btn">로그인</button>
          </form>
          <p className="login-hint">힌트: admin1234</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-left">
          <button
            type="button"
            className="hamburger-btn"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="메뉴 열기"
          >
            ☰
          </button>
          <div className="admin-logo-section">
            <img
              src={`${process.env.PUBLIC_URL}/cat-icon.png`}
              alt="CAT"
              className="admin-cat-icon"
            />
            <h1>🎨 KIND CAT 관리자</h1>
          </div>
        </div>
        {/* 스크롤 안 내려도 바로 쓸 수 있게 저장/발행/백업을 상단(고정) 헤더로 이동 */}
        <div className="admin-header-actions">
          <button className="btn-save-primary btn-header-action" onClick={handleSaveConfig}>
            💾 저장
          </button>
          {currentStoryId && (
            savedStories.find(s => s.id === currentStoryId)?.published ? (
              <button className="btn-unpublish btn-header-action" onClick={handleUnpublishStory}>
                📴 발행 취소
              </button>
            ) : (
              <button className="btn-publish btn-header-action" onClick={handlePublishStory}>
                🚀 발행하기
              </button>
            )
          )}
          <button className="btn-download btn-header-action" onClick={handleDownloadConfig}>
            📥 백업
          </button>
        </div>
      </div>

      {/* 좌측 햄버거 메뉴 - 홈 설정 / 스토리 설정 전환 */}
      {isSidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}>
          <div className="admin-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="admin-sidebar-header">
              <span>메뉴</span>
              <button type="button" className="admin-sidebar-close" onClick={() => setIsSidebarOpen(false)}>✕</button>
            </div>
            <button
              type="button"
              className={`admin-sidebar-item ${adminView === 'home' ? 'active' : ''}`}
              onClick={() => { setAdminView('home'); setIsSidebarOpen(false); }}
            >
              🏠 홈 설정
              <span className="admin-sidebar-item-desc">스토리 목록 · 순서 · 배너</span>
            </button>
            <button
              type="button"
              className={`admin-sidebar-item ${adminView === 'story' ? 'active' : ''}`}
              onClick={() => { setAdminView('story'); setIsSidebarOpen(false); }}
            >
              📖 스토리 설정
              <span className="admin-sidebar-item-desc">캐릭터 · 시나리오 · 엔딩 등 편집</span>
            </button>
            <button
              type="button"
              className={`admin-sidebar-item ${adminView === 'generator' ? 'active' : ''}`}
              onClick={() => { setAdminView('generator'); setIsSidebarOpen(false); }}
            >
              🎲 캐릭터 생성기
              <span className="admin-sidebar-item-desc">무작위 캐릭터/서사 조합 뽑기</span>
            </button>
          </div>
        </div>
      )}

      <div className="admin-content">
        {adminView === 'home' && (
        <>
        {/* JSON/JS 템플릿 가져오기 - 스토리 설정 탭까지 안 가도 홈 화면에서 바로 가져올 수 있게 노출 */}
        <div className="admin-section">
          <div className="story-actions">
            <button className="btn-import-json" onClick={handleImportFromJSON}>
              📥 JSON에서 가져오기
            </button>
          </div>
        </div>

        {/* 저장된 스토리 목록 */}
        {savedStories.length > 0 && (
          <div className="admin-section">
            <h2 className="section-title">💾 저장된 스토리 목록 ({savedStories.length}개)</h2>
            <p className="section-description">
              ▲▼ 버튼으로 메인 화면(스토리 목록)에 표시되는 순서를 직접 정할 수 있습니다. 위에 있을수록 먼저 보여집니다.
            </p>
            <div className="stories-grid">
              {getOrderedSavedStories()
                .map((story, idx, arr) => (
                  <div
                    key={story.id}
                    className={`story-card ${currentStoryId === story.id ? 'active' : ''}`}
                  >
                    <div className="story-card-header">
                      <div className="story-order-controls">
                        <button
                          type="button"
                          className="btn-move-story"
                          onClick={() => handleMoveStory(story.id, 'up')}
                          disabled={idx === 0}
                          title="위로"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          className="btn-move-story"
                          onClick={() => handleMoveStory(story.id, 'down')}
                          disabled={idx === arr.length - 1}
                          title="아래로"
                        >
                          ▼
                        </button>
                      </div>
                      <h4>{story.storyTitle}</h4>
                      {currentStoryId === story.id && <span className="current-badge">현재</span>}
                      {story.published && <span className="published-badge">발행됨</span>}
                      {story.hidden && <span className="hidden-badge">숨김</span>}
                    </div>
                    <p className="story-desc">{story.description}</p>
                    <p className="story-meta">
                      {new Date(story.savedAt).toLocaleString('ko-KR')}
                    </p>
                    <div className="story-card-actions">
                      <button
                        className="btn-load"
                        onClick={() => handleLoadStory(story.id)}
                        disabled={currentStoryId === story.id}
                      >
                        📂 불러오기
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteStory(story.id)}
                      >
                        🗑️ 삭제
                      </button>
                    </div>
                    <label className="story-hide-toggle">
                      <input
                        type="checkbox"
                        checked={!!story.hidden}
                        onChange={() => handleToggleHidden(story.id)}
                      />
                      메인 화면에서 숨기기{story.hidden ? ' (숨김 중)' : ''}
                    </label>
                    <label className="story-hide-toggle">
                      <input
                        type="checkbox"
                        checked={!!story.isBanner}
                        onChange={() => handleToggleBanner(story.id)}
                      />
                      🎬 홈 배너로 노출{story.isBanner ? ' (배너 중)' : ''}
                    </label>
                    {story.isBanner && (
                      <div className="story-badge-settings">
                        <label className="story-hide-toggle">
                          <input
                            type="checkbox"
                            checked={story.badgeEnabled !== false}
                            onChange={() => handleToggleStoryBadge(story.id)}
                          />
                          🏷️ 추천 배지 노출{story.badgeEnabled === false ? ' (숨김)' : ''}
                        </label>
                        <input
                          type="text"
                          className="story-badge-text-input"
                          value={badgeTextDrafts[story.id] ?? (story.badgeText || '🔥 지금 추천하는 스토리')}
                          onChange={(e) => setBadgeTextDrafts(prev => ({ ...prev, [story.id]: e.target.value }))}
                          onBlur={(e) => handleSaveStoryBadgeText(story.id, e.target.value)}
                          placeholder="🔥 지금 추천하는 스토리"
                          disabled={story.badgeEnabled === false}
                        />
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
        </>
        )}

        {adminView === 'story' && (
        <>
        {/* 스토리 관리 */}
        <div className="admin-section">
          <h2 className="section-title">📚 스토리 관리</h2>
          
          <div className="story-manager">
            <div className="current-story-info">
              <label>현재 작업 중인 스토리</label>
              <input 
                type="text" 
                value={storyTitle} 
                onChange={(e) => setStoryTitle(e.target.value)}
                placeholder="스토리 제목을 입력하세요"
                className="story-title-input"
              />
              {currentStoryId && <span className="story-id-badge">ID: {currentStoryId.slice(0, 8)}</span>}
            </div>

            {/* 스토리 액션 버튼들 */}
            <div className="story-actions">
              <button className="btn-new-story" onClick={handleNewStory}>
                ➕ 새 스토리 만들기
              </button>
              <button className="btn-import-json" onClick={handleImportFromJSON}>
                📥 JSON에서 가져오기
              </button>
            </div>

            <div className="thumbnail-upload-section">
              <label>📸 스토리 썸네일 (메인 화면 노출)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="file-input"
              />
              {isUploadingThumbnail && <p className="thumbnail-note">⏳ 업로드 중...</p>}
              {thumbnailPreview && (
                <div className="thumbnail-preview-container">
                  <img src={thumbnailPreview} alt="썸네일 미리보기" className="thumbnail-preview" />
                  <button
                    className="btn-remove-thumbnail"
                    onClick={() => {
                      setThumbnailPreview(null);
                      handleImagePathChange('thumbnail', '');
                    }}
                  >
                    ✕ 제거
                  </button>
                </div>
              )}
              <p className="thumbnail-note">
                💡 권장 크기: 800x1000px (4:5 비율) | 메인 화면 카드에 표시됩니다
              </p>
              
              <div className="file-path-input-section">
                <label>🗂️ 또는 파일 경로 직접 입력 (권장)</label>
                <input
                  type="text"
                  placeholder="/images/stories/story-1/thumbnail.jpg"
                  value={imageFiles.thumbnail}
                  onChange={(e) => handleImagePathChange('thumbnail', e.target.value)}
                  className="path-input"
                />
                <p className="path-note">
                  💾 파일을 <code>public/images/stories/</code> 폴더에 업로드하고 경로를 입력하세요<br/>
                  ✅ 장점: 빠른 로딩, 무제한 용량, 브라우저 캐싱
                </p>
              </div>
            </div>


            {/* 키워드 이미지 */}
            <div className="keyword-images-section">
              <h3 className="subsection-title">🖼️ 상황 이미지</h3>
              <p className="section-description">
                두 가지 방식으로 자동 트리거됩니다:<br/>
                1) <strong>키워드</strong>: 플레이어 입력에 그 단어가 포함되면 이미지 전송 (예: "키스" 입력 시 → 키스 장면 이미지)<br/>
                2) <strong>호감도 자동 적용</strong>: "호감도 20 이상"처럼 입력하면, 플레이어가 아무것도 안 쳐도 평균 호감도가 그 숫자를 넘는 순간 배경이 자동으로 바뀝니다 (기존 "배경 이미지(호감도별)"와 캐릭터별 "특별 상황 이미지"가 이 기능 하나로 통합됐습니다)
              </p>

              <div className="keyword-add-form">
                <div className="keyword-input-row">
                  <div className="keyword-input-col">
                    <label>키워드 / 상황</label>
                    <input
                      type="text"
                      placeholder="키스, 포옹, 울음... 또는 호감도 20 이상"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      className="keyword-text-input"
                    />
                  </div>
                  <div className="keyword-input-col">
                    <label>이미지</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        e.target.value = '';
                        requestCrop(file, 1, async (croppedFile) => {
                          try {
                            const url = await uploadImageFile(croppedFile, 'keyword-images');
                            setNewKeywordPath(url);
                          } catch (err) {
                            alert('이미지 업로드 실패: ' + err.message);
                          }
                        });
                      }}
                      className="keyword-path-input"
                    />
                    <input
                      type="text"
                      placeholder="🗂️ 또는 경로/URL 직접 입력 (빠름)"
                      value={newKeywordPath}
                      onChange={(e) => setNewKeywordPath(e.target.value)}
                      className="path-input keyword-path-text-input"
                    />
                    {newKeywordPath && (
                      <img src={newKeywordPath} alt="미리보기" className="keyword-preview" />
                    )}
                  </div>
                  <button
                    className="btn-add-keyword"
                    onClick={handleAddKeywordImage}
                  >
                    ➕ 추가
                  </button>
                </div>
              </div>

              {keywordImageList.length > 0 && (
                <div className="keyword-image-list">
                  {keywordImageList.map((item, index) => (
                    <div key={index} className="keyword-image-item">
                      <div className="keyword-item-content">
                        <div className="keyword-item-inputs">
                          <div className="keyword-edit-col">
                            <label>키워드 / 상황 (예: 키스, 또는 호감도 20 이상)</label>
                            <input
                              type="text"
                              value={item.keyword}
                              onChange={(e) => handleUpdateKeywordImage(index, 'keyword', e.target.value)}
                              className="keyword-edit-input"
                            />
                          </div>
                          <div className="keyword-edit-col">
                            <label>이미지 경로 (채팅에 1회 전송)</label>
                            <input
                              type="text"
                              value={item.imagePath}
                              onChange={(e) => handleUpdateKeywordImage(index, 'imagePath', e.target.value)}
                              className="keyword-edit-input"
                            />
                          </div>
                          <div className="keyword-edit-col">
                            <label>배경 이미지 경로 (선택 - 비우면 위 이미지를 배경으로도 사용)</label>
                            <input
                              type="text"
                              value={item.backgroundPath || ''}
                              onChange={(e) => handleUpdateKeywordImage(index, 'backgroundPath', e.target.value)}
                              placeholder="비워두면 이미지 경로와 동일하게 배경도 변경됨"
                              className="keyword-edit-input"
                            />
                          </div>
                        </div>
                        {item.imagePath && (
                          <div className="keyword-preview-container">
                            <img
                              src={resolveImageSrc(item.imagePath)}
                              alt={item.keyword}
                              className="keyword-preview"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <button 
                        className="btn-remove-keyword" 
                        onClick={() => handleRemoveKeywordImage(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="keyword-examples">
                <strong>💡 키워드 예시:</strong>
                <div className="examples-grid">
                  <span>키스, 포옹, 울음, 미소</span>
                  <span>침대, 소파, 사무실, 병원</span>
                  <span>선물, 꽃, 반지, 목걸이</span>
                  <span>비, 눈, 석양, 바다</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 스토리 정보 */}
        <div className="admin-section">
          <h2 className="section-title">📖 스토리 정보</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>제목</label>
              <input
                type="text"
                value={scenario.title}
                onChange={(e) => setScenario({ ...scenario, title: e.target.value })}
              />
            </div>
            <div className="form-group full-width">
              <label>설명</label>
              <textarea
                value={scenario.description}
                onChange={(e) => setScenario({ ...scenario, description: e.target.value })}
              />
            </div>
          </div>

          {/* 작품 태그 */}
          <h3 className="subsection-title" style={{marginTop: '30px'}}>🏷️ 작품 태그</h3>
          
          <div className="story-tags-section">
            <h4 className="tag-category-title">장르</h4>
            <div className="tag-container">
              {STORY_TAG_OPTIONS.genre.map(tag => (
                <button
                  key={tag}
                  className={`tag-btn ${scenario.storyTags.genre.includes(tag) ? 'active' : ''}`}
                  onClick={() => handleStoryTagToggle('genre', tag)}
                >
                  {tag}
                </button>
              ))}
              {scenario.storyTags.genre
                .filter(tag => !STORY_TAG_OPTIONS.genre.includes(tag))
                .map(tag => (
                  <button
                    key={tag}
                    className="tag-btn active custom-tag"
                    onClick={() => handleStoryTagToggle('genre', tag)}
                    title="커스텀 태그 (클릭하여 제거)"
                  >
                    {tag} ✕
                  </button>
                ))}
              <button className="tag-btn add-tag" onClick={() => handleAddStoryTag('genre')}>
                + 추가
              </button>
            </div>

            <h4 className="tag-category-title">분위기</h4>
            <div className="tag-container">
              {STORY_TAG_OPTIONS.mood.map(tag => (
                <button
                  key={tag}
                  className={`tag-btn ${scenario.storyTags.mood.includes(tag) ? 'active' : ''}`}
                  onClick={() => handleStoryTagToggle('mood', tag)}
                >
                  {tag}
                </button>
              ))}
              {scenario.storyTags.mood
                .filter(tag => !STORY_TAG_OPTIONS.mood.includes(tag))
                .map(tag => (
                  <button
                    key={tag}
                    className="tag-btn active custom-tag"
                    onClick={() => handleStoryTagToggle('mood', tag)}
                    title="커스텀 태그 (클릭하여 제거)"
                  >
                    {tag} ✕
                  </button>
                ))}
              <button className="tag-btn add-tag" onClick={() => handleAddStoryTag('mood')}>
                + 추가
              </button>
            </div>

            <h4 className="tag-category-title">상황</h4>
            <div className="tag-container">
              {STORY_TAG_OPTIONS.situation.map(tag => (
                <button
                  key={tag}
                  className={`tag-btn ${scenario.storyTags.situation.includes(tag) ? 'active' : ''}`}
                  onClick={() => handleStoryTagToggle('situation', tag)}
                >
                  {tag}
                </button>
              ))}
              {scenario.storyTags.situation
                .filter(tag => !STORY_TAG_OPTIONS.situation.includes(tag))
                .map(tag => (
                  <button
                    key={tag}
                    className="tag-btn active custom-tag"
                    onClick={() => handleStoryTagToggle('situation', tag)}
                    title="커스텀 태그 (클릭하여 제거)"
                  >
                    {tag} ✕
                  </button>
                ))}
              <button className="tag-btn add-tag" onClick={() => handleAddStoryTag('situation')}>
                + 추가
              </button>
            </div>

            <h4 className="tag-category-title">소재</h4>
            <div className="tag-container">
              {STORY_TAG_OPTIONS.subject.map(tag => (
                <button
                  key={tag}
                  className={`tag-btn ${scenario.storyTags.subject.includes(tag) ? 'active' : ''}`}
                  onClick={() => handleStoryTagToggle('subject', tag)}
                >
                  {tag}
                </button>
              ))}
              {scenario.storyTags.subject
                .filter(tag => !STORY_TAG_OPTIONS.subject.includes(tag))
                .map(tag => (
                  <button
                    key={tag}
                    className="tag-btn active custom-tag"
                    onClick={() => handleStoryTagToggle('subject', tag)}
                    title="커스텀 태그 (클릭하여 제거)"
                  >
                    {tag} ✕
                  </button>
                ))}
              <button className="tag-btn add-tag" onClick={() => handleAddStoryTag('subject')}>
                + 추가
              </button>
            </div>

            <h4 className="tag-category-title">관계</h4>
            <div className="tag-container">
              {STORY_TAG_OPTIONS.relationship.map(tag => (
                <button
                  key={tag}
                  className={`tag-btn ${scenario.storyTags.relationship.includes(tag) ? 'active' : ''}`}
                  onClick={() => handleStoryTagToggle('relationship', tag)}
                >
                  {tag}
                </button>
              ))}
              {scenario.storyTags.relationship
                .filter(tag => !STORY_TAG_OPTIONS.relationship.includes(tag))
                .map(tag => (
                  <button
                    key={tag}
                    className="tag-btn active custom-tag"
                    onClick={() => handleStoryTagToggle('relationship', tag)}
                    title="커스텀 태그 (클릭하여 제거)"
                  >
                    {tag} ✕
                  </button>
                ))}
              <button className="tag-btn add-tag" onClick={() => handleAddStoryTag('relationship')}>
                + 추가
              </button>
            </div>

            <h4 className="tag-category-title">🔞 성인 소재</h4>
            <div className="tag-container">
              {STORY_TAG_OPTIONS.adult.map(tag => (
                <button
                  key={tag}
                  className={`tag-btn ${scenario.storyTags.adult.includes(tag) ? 'active' : ''}`}
                  onClick={() => handleStoryTagToggle('adult', tag)}
                >
                  {tag}
                </button>
              ))}
              {scenario.storyTags.adult
                .filter(tag => !STORY_TAG_OPTIONS.adult.includes(tag))
                .map(tag => (
                  <button
                    key={tag}
                    className="tag-btn active custom-tag"
                    onClick={() => handleStoryTagToggle('adult', tag)}
                    title="커스텀 태그 (클릭하여 제거)"
                  >
                    {tag} ✕
                  </button>
                ))}
              <button className="tag-btn add-tag" onClick={() => handleAddStoryTag('adult')}>
                + 추가
              </button>
            </div>
          </div>
        </div>

        {/* 캐릭터 A (공) */}
        <div className="admin-section">
          <h2 className="section-title">🔺 공(攻) 캐릭터</h2>
          
          {/* 프로필 사진 (여러 장) */}
          <div className="avatar-upload-section">
            <label className="avatar-label">📸 캐릭터 프로필 사진 (여러 장 가능)</label>
            
            <div className="multi-image-list">
              {profileImagesA.map((img, idx) => (
                <div key={idx} className="image-item">
                  <span className="image-number">{idx + 1}.</span>
                  <input
                    type="text"
                    value={img}
                    onChange={(e) => {
                      const updated = [...profileImagesA];
                      updated[idx] = e.target.value;
                      setProfileImagesA(updated);
                    }}
                    placeholder="프로필 이미지 경로"
                    className="path-input"
                  />
                  <button
                    className="btn-remove-image"
                    onClick={() => setProfileImagesA(profileImagesA.filter((_, i) => i !== idx))}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            
            <label className="btn-add-image">
              ➕ 프로필 이미지 추가
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => { handleAddProfileImageA(e.target.files[0]); e.target.value = ''; }}
              />
            </label>
            <div className="quick-path-add">
              <input
                type="text"
                value={newProfilePathA}
                onChange={(e) => setNewProfilePathA(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddProfileImagePathA(); } }}
                placeholder="🗂️ 또는 경로/URL 붙여넣고 추가 (빠름)"
                className="path-input"
              />
              <button type="button" className="btn-add-path" onClick={handleAddProfileImagePathA}>추가</button>
            </div>

            <p className="avatar-note">
              💡 권장 크기: 정사각형 (500x500px) | 여러 표정, 포즈 추가 가능
            </p>
          </div>

          <h3 className="subsection-title">기본 정보</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>이름 *</label>
              <input type="text" value={charA.name} onChange={(e) => setCharA({ ...charA, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>나이</label>
              <input type="text" value={charA.age} onChange={(e) => setCharA({ ...charA, age: e.target.value })} />
            </div>
            <div className="form-group">
              <label>직업</label>
              <input type="text" value={charA.occupation} onChange={(e) => setCharA({ ...charA, occupation: e.target.value })} />
            </div>
            <div className="form-group">
              <label>성격</label>
              <input type="text" value={charA.personality} onChange={(e) => setCharA({ ...charA, personality: e.target.value })} />
            </div>
            <div className="form-group full-width">
              <label>외모</label>
              <textarea value={charA.appearance} onChange={(e) => setCharA({ ...charA, appearance: e.target.value })} rows="3" />
            </div>
            
            <div className="form-group">
              <label>키</label>
              <input type="text" value={charA.bodyDetails?.height || ''} onChange={(e) => setCharA({ ...charA, bodyDetails: { ...charA.bodyDetails, height: e.target.value }})} placeholder="예: 188cm" />
            </div>
            <div className="form-group">
              <label>체형</label>
              <input type="text" value={charA.bodyDetails?.build || ''} onChange={(e) => setCharA({ ...charA, bodyDetails: { ...charA.bodyDetails, build: e.target.value }})} placeholder="예: 거대한 근육질" />
            </div>
            <div className="form-group full-width">
              <label>부위별 특징</label>
              <input type="text" value={charA.bodyDetails?.features || ''} onChange={(e) => setCharA({ ...charA, bodyDetails: { ...charA.bodyDetails, features: e.target.value }})} placeholder="예: 떡 벌어진 어깨, 탄탄한 가슴 근육" />
            </div>
            
            <div className="form-group full-width">
              <label>말투</label>
              <textarea value={charA.speech} onChange={(e) => setCharA({ ...charA, speech: e.target.value })} rows="2" />
            </div>
            <div className="form-group full-width">
              <label>존댓말 유지도: {honorificLevelLabel(charA.honorificLevel)}</label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={charA.honorificLevel ?? 50}
                onChange={(e) => setCharA({ ...charA, honorificLevel: Number(e.target.value) })}
                className="honorific-slider"
              />
              <div className="honorific-slider-labels">
                <span>반말로 빨리</span>
                <span>존댓말 오래 유지</span>
              </div>
              <p className="field-note">💡 관계가 진전돼도 존댓말이 안 풀리면 슬라이더를 왼쪽(반말로 빨리)으로 옮겨보세요.</p>
            </div>
            <div className="form-group full-width">
              <label>🔒 숨겨진 설정/비밀 (AI만 참고 — 플레이어에게 절대 노출되지 않음)</label>
              <textarea
                value={charA.secret || ''}
                onChange={(e) => setCharA({ ...charA, secret: e.target.value })}
                rows="3"
                placeholder="예: 상대방의 약점을 알고 있지만 티 내지 않음, 숨긴 과거, 상대는 모르는 진실 등"
              />
              <p className="field-note">💡 성격/말투와 달리 이 내용은 스토리 화면에 절대 표시되지 않고, AI 프롬프트에만 전달됩니다.</p>
            </div>
          </div>

          <h3 className="subsection-title">💕 호칭 시스템 (공 → 수)</h3>
          <div className="calling-system-note">
            <p>호감도 점수가 아니라 <strong>상황·이벤트·관계 진전</strong>에 따라 공이 수를 부르는 호칭이 바뀝니다. 관계가 깊어지는 순서대로 나열하세요 - AI가 실제 서사 진행을 보고 각 단계 전환 시점을 판단합니다.</p>
          </div>
          <div className="calling-stage-list">
            {(charA.callingSystem || []).map((stage, idx) => (
              <div key={idx} className="calling-stage-row">
                <input
                  type="text"
                  value={stage.condition || ''}
                  onChange={(e) => {
                    const updated = [...charA.callingSystem];
                    updated[idx] = { ...updated[idx], condition: e.target.value };
                    setCharA({ ...charA, callingSystem: updated });
                  }}
                  placeholder="상황/이벤트 (예: 고백 이후)"
                  className="calling-stage-condition"
                />
                <input
                  type="text"
                  value={stage.name || ''}
                  onChange={(e) => {
                    const updated = [...charA.callingSystem];
                    updated[idx] = { ...updated[idx], name: e.target.value };
                    setCharA({ ...charA, callingSystem: updated });
                  }}
                  placeholder="호칭 (예: 자기)"
                  className="calling-stage-name"
                />
                <button
                  type="button"
                  className="btn-remove-calling-stage"
                  onClick={() => setCharA({ ...charA, callingSystem: charA.callingSystem.filter((_, i) => i !== idx) })}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-add-calling-stage"
              onClick={() => setCharA({ ...charA, callingSystem: [...(charA.callingSystem || []), { condition: '', name: '' }] })}
            >
              + 단계 추가
            </button>
          </div>
          <div className="calling-system-note">
            <p>🎯 <strong>특별 상황 예외</strong> - 평소 단계별 호칭과 무관하게, 특정 상황에서만 다른 호칭을 쓰게 하고 싶으면 추가하세요 (예: "직장 등 공적인 자리" → "윤태이 씨", "남들 앞에서 방송 중일 때" → "이경씨" 등 스토리마다 자유롭게).</p>
          </div>
          <div className="calling-stage-list">
            {(charA.specialCallingSituations || []).map((stage, idx) => (
              <div key={idx} className="calling-stage-row">
                <input
                  type="text"
                  value={stage.situation || ''}
                  onChange={(e) => {
                    const updated = [...charA.specialCallingSituations];
                    updated[idx] = { ...updated[idx], situation: e.target.value };
                    setCharA({ ...charA, specialCallingSituations: updated });
                  }}
                  placeholder="특별 상황 (예: 직장 등 공적인 자리)"
                  className="calling-stage-condition"
                />
                <input
                  type="text"
                  value={stage.name || ''}
                  onChange={(e) => {
                    const updated = [...charA.specialCallingSituations];
                    updated[idx] = { ...updated[idx], name: e.target.value };
                    setCharA({ ...charA, specialCallingSituations: updated });
                  }}
                  placeholder="이 상황에서의 호칭 (예: 윤태이 씨)"
                  className="calling-stage-name"
                />
                <button
                  type="button"
                  className="btn-remove-calling-stage"
                  onClick={() => setCharA({ ...charA, specialCallingSituations: charA.specialCallingSituations.filter((_, i) => i !== idx) })}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-add-calling-stage"
              onClick={() => setCharA({ ...charA, specialCallingSituations: [...(charA.specialCallingSituations || []), { situation: '', name: '' }] })}
            >
              + 특별 상황 추가
            </button>
          </div>


          <h3 className="subsection-title">🔞 성적 디테일</h3>
          
          <div className="sexual-detail-guide">
            <p className="guide-text">
              💡 <strong>공(攻) 작성 가이드</strong>: 
              성기 특징 → 신체 특징 → 체향 순서로 작성 권장
            </p>
          </div>

          <div className="form-grid">
            <div className="form-group full-width">
              <label>성기 특징</label>
              <textarea 
                value={charA.sexualDetails?.genital || ''} 
                onChange={(e) => setCharA({ ...charA, sexualDetails: { ...charA.sexualDetails, genital: e.target.value }})}
                placeholder="예: 굵고 압도적인 형태, 선명한 핏줄"
                rows="2"
              />
            </div>
            <div className="form-group full-width">
              <label>신체 특징</label>
              <textarea 
                value={charA.sexualDetails?.body || ''} 
                onChange={(e) => setCharA({ ...charA, sexualDetails: { ...charA.sexualDetails, body: e.target.value }})}
                placeholder="예: 탄탄한 근육, 뜨거운 체온"
                rows="2"
              />
            </div>
            <div className="form-group full-width">
              <label>체향</label>
              <input 
                type="text" 
                value={charA.sexualDetails?.scent || ''} 
                onChange={(e) => setCharA({ ...charA, sexualDetails: { ...charA.sexualDetails, scent: e.target.value }})}
                placeholder="예: 진한 사향/머스크"
              />
            </div>
            <div className="form-group full-width">
              <label>기타 특수 설정</label>
              <textarea 
                value={charA.sexualDetails?.special || ''} 
                onChange={(e) => setCharA({ ...charA, sexualDetails: { ...charA.sexualDetails, special: e.target.value }})}
                placeholder="예: 알파 페로몬 분비, 교미 본능"
                rows="2"
              />
            </div>
          </div>

          <h3 className="subsection-title">🏷️ 태그 ({charA.tags?.length || 0}개 선택)</h3>
          <div className="tag-container">
            {COMMON_TAGS_GONG.map(tag => (
              <button
                key={tag}
                className={`tag-btn ${charA.tags?.includes(tag) ? 'active' : ''}`}
                onClick={() => handleTagToggle('A', tag)}
              >
                {tag}
              </button>
            ))}
            
            {charA.tags
              ?.filter(tag => !COMMON_TAGS_GONG.includes(tag))
              .map(tag => (
                <button
                  key={tag}
                  className="tag-btn active custom-tag"
                  onClick={() => handleTagToggle('A', tag)}
                  title="커스텀 태그 (클릭하여 제거)"
                >
                  {tag} ✕
                </button>
              ))}
            
            <button className="tag-btn add-tag" onClick={() => handleAddCustomTag('A')}>
              + 커스텀 태그 추가
            </button>
          </div>

          <h3 className="subsection-title">👁️ 유저 공개 설정</h3>
          <div className="visibility-controls">
            <div className="visibility-item">
              <div className="visibility-header">
                <label>📋 기본 정보 (이름, 나이, 직업, 외모)</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={charA.visibility?.basicInfo !== false}
                    onChange={(e) => setCharA({
                      ...charA,
                      visibility: { ...charA.visibility, basicInfo: e.target.checked }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="visibility-item">
              <div className="visibility-header">
                <label>🏷️ 태그</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={charA.visibility?.tags !== false}
                    onChange={(e) => setCharA({
                      ...charA,
                      visibility: { ...charA.visibility, tags: e.target.checked }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="visibility-item">
              <div className="visibility-header">
                <label>🔞 성적 디테일</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={charA.visibility?.sexualDetails === true}
                    onChange={(e) => setCharA({
                      ...charA,
                      visibility: { ...charA.visibility, sexualDetails: e.target.checked }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <p className="visibility-note">⚠️ 19금 콘텐츠 - 신중하게 공개하세요</p>
            </div>

            <div className="visibility-item">
              <div className="visibility-header">
                <label>✅ 선호/비선호 행동</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={charA.visibility?.actions === true}
                    onChange={(e) => setCharA({
                      ...charA,
                      visibility: { ...charA.visibility, actions: e.target.checked }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <h3 className="subsection-title">✅ 선호 행동</h3>
          <div className="action-list">
            {charA.preferredActions?.map((action, idx) => (
              <input
                key={idx}
                type="text"
                value={action}
                onChange={(e) => handleArrayInput('A', 'preferredActions', idx, e.target.value)}
                placeholder="예: 목 잡기"
                className="action-input"
              />
            ))}
            <button className="btn-add-action" onClick={() => handleAddArrayItem('A', 'preferredActions')}>
              + 행동 추가
            </button>
          </div>

          <h3 className="subsection-title">❌ 비선호 행동</h3>
          <div className="action-list">
            {charA.avoidedActions?.map((action, idx) => (
              <input
                key={idx}
                type="text"
                value={action}
                onChange={(e) => handleArrayInput('A', 'avoidedActions', idx, e.target.value)}
                placeholder="예: 애교"
                className="action-input"
              />
            ))}
            <button className="btn-add-action" onClick={() => handleAddArrayItem('A', 'avoidedActions')}>
              + 행동 추가
            </button>
          </div>
        </div>

        {/* 캐릭터 B (수) */}
        <div className="admin-section">
          <h2 className="section-title">🔻 수(受) 캐릭터</h2>
          
          {/* 프로필 사진 */}
          <div className="avatar-upload-section">
            <label className="avatar-label">📸 캐릭터 프로필 사진 (여러 장 가능)</label>
            
            <div className="multi-image-list">
              {profileImagesB.map((img, idx) => (
                <div key={idx} className="image-item">
                  <span className="image-number">{idx + 1}.</span>
                  <input
                    type="text"
                    value={img}
                    onChange={(e) => {
                      const updated = [...profileImagesB];
                      updated[idx] = e.target.value;
                      setProfileImagesB(updated);
                    }}
                    placeholder="프로필 이미지 경로"
                    className="path-input"
                  />
                  <button
                    className="btn-remove-image"
                    onClick={() => setProfileImagesB(profileImagesB.filter((_, i) => i !== idx))}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            
            <label className="btn-add-image">
              ➕ 프로필 이미지 추가
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => { handleAddProfileImageB(e.target.files[0]); e.target.value = ''; }}
              />
            </label>
            <div className="quick-path-add">
              <input
                type="text"
                value={newProfilePathB}
                onChange={(e) => setNewProfilePathB(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddProfileImagePathB(); } }}
                placeholder="🗂️ 또는 경로/URL 붙여넣고 추가 (빠름)"
                className="path-input"
              />
              <button type="button" className="btn-add-path" onClick={handleAddProfileImagePathB}>추가</button>
            </div>
          </div>

          <h3 className="subsection-title">기본 정보</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>이름 *</label>
              <input type="text" value={charB.name} onChange={(e) => setCharB({ ...charB, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>나이</label>
              <input type="text" value={charB.age} onChange={(e) => setCharB({ ...charB, age: e.target.value })} />
            </div>
            <div className="form-group">
              <label>직업</label>
              <input type="text" value={charB.occupation} onChange={(e) => setCharB({ ...charB, occupation: e.target.value })} />
            </div>
            <div className="form-group">
              <label>성격</label>
              <input type="text" value={charB.personality} onChange={(e) => setCharB({ ...charB, personality: e.target.value })} />
            </div>
            <div className="form-group full-width">
              <label>외모</label>
              <textarea value={charB.appearance} onChange={(e) => setCharB({ ...charB, appearance: e.target.value })} rows="3" />
            </div>
            
            <div className="form-group">
              <label>키</label>
              <input type="text" value={charB.bodyDetails?.height || ''} onChange={(e) => setCharB({ ...charB, bodyDetails: { ...charB.bodyDetails, height: e.target.value }})} />
            </div>
            <div className="form-group">
              <label>체형</label>
              <input type="text" value={charB.bodyDetails?.build || ''} onChange={(e) => setCharB({ ...charB, bodyDetails: { ...charB.bodyDetails, build: e.target.value }})} />
            </div>
            <div className="form-group full-width">
              <label>부위별 특징</label>
              <input type="text" value={charB.bodyDetails?.features || ''} onChange={(e) => setCharB({ ...charB, bodyDetails: { ...charB.bodyDetails, features: e.target.value }})} />
            </div>
            
            <div className="form-group full-width">
              <label>말투</label>
              <textarea value={charB.speech} onChange={(e) => setCharB({ ...charB, speech: e.target.value })} rows="2" />
            </div>
            <div className="form-group full-width">
              <label>존댓말 유지도: {honorificLevelLabel(charB.honorificLevel)}</label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={charB.honorificLevel ?? 50}
                onChange={(e) => setCharB({ ...charB, honorificLevel: Number(e.target.value) })}
                className="honorific-slider"
              />
              <div className="honorific-slider-labels">
                <span>반말로 빨리</span>
                <span>존댓말 오래 유지</span>
              </div>
              <p className="field-note">💡 관계가 진전돼도 존댓말이 안 풀리면 슬라이더를 왼쪽(반말로 빨리)으로 옮겨보세요.</p>
            </div>
            <div className="form-group full-width">
              <label>🔒 숨겨진 설정/비밀 (AI만 참고 — 플레이어에게 절대 노출되지 않음)</label>
              <textarea
                value={charB.secret || ''}
                onChange={(e) => setCharB({ ...charB, secret: e.target.value })}
                rows="3"
                placeholder="예: 숨기고 있는 신분/과거, 상대가 이미 알고 있다는 걸 모르는 사실 등"
              />
              <p className="field-note">💡 성격/말투와 달리 이 내용은 스토리 화면에 절대 표시되지 않고, AI 프롬프트에만 전달됩니다.</p>
            </div>
          </div>

          <h3 className="subsection-title">💕 호칭 시스템 (수 → 공)</h3>
          <div className="calling-system-note">
            <p>호감도 점수가 아니라 <strong>상황·이벤트·관계 진전</strong>에 따라 수가 공을 부르는 호칭이 바뀝니다. 관계가 깊어지는 순서대로 나열하세요.</p>
          </div>
          <div className="calling-stage-list">
            {(charB.callingSystem || []).map((stage, idx) => (
              <div key={idx} className="calling-stage-row">
                <input
                  type="text"
                  value={stage.condition || ''}
                  onChange={(e) => {
                    const updated = [...charB.callingSystem];
                    updated[idx] = { ...updated[idx], condition: e.target.value };
                    setCharB({ ...charB, callingSystem: updated });
                  }}
                  placeholder="상황/이벤트 (예: 서로 마음 확인 이후)"
                  className="calling-stage-condition"
                />
                <input
                  type="text"
                  value={stage.name || ''}
                  onChange={(e) => {
                    const updated = [...charB.callingSystem];
                    updated[idx] = { ...updated[idx], name: e.target.value };
                    setCharB({ ...charB, callingSystem: updated });
                  }}
                  placeholder="호칭 (예: 자기야)"
                  className="calling-stage-name"
                />
                <button
                  type="button"
                  className="btn-remove-calling-stage"
                  onClick={() => setCharB({ ...charB, callingSystem: charB.callingSystem.filter((_, i) => i !== idx) })}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-add-calling-stage"
              onClick={() => setCharB({ ...charB, callingSystem: [...(charB.callingSystem || []), { condition: '', name: '' }] })}
            >
              + 단계 추가
            </button>
          </div>
          <div className="calling-system-note">
            <p>🎯 <strong>특별 상황 예외</strong> - 평소 단계별 호칭과 무관하게, 특정 상황에서만 다른 호칭을 쓰게 하고 싶으면 추가하세요.</p>
          </div>
          <div className="calling-stage-list">
            {(charB.specialCallingSituations || []).map((stage, idx) => (
              <div key={idx} className="calling-stage-row">
                <input
                  type="text"
                  value={stage.situation || ''}
                  onChange={(e) => {
                    const updated = [...charB.specialCallingSituations];
                    updated[idx] = { ...updated[idx], situation: e.target.value };
                    setCharB({ ...charB, specialCallingSituations: updated });
                  }}
                  placeholder="특별 상황 (예: 직장 등 공적인 자리)"
                  className="calling-stage-condition"
                />
                <input
                  type="text"
                  value={stage.name || ''}
                  onChange={(e) => {
                    const updated = [...charB.specialCallingSituations];
                    updated[idx] = { ...updated[idx], name: e.target.value };
                    setCharB({ ...charB, specialCallingSituations: updated });
                  }}
                  placeholder="이 상황에서의 호칭 (예: 과장님)"
                  className="calling-stage-name"
                />
                <button
                  type="button"
                  className="btn-remove-calling-stage"
                  onClick={() => setCharB({ ...charB, specialCallingSituations: charB.specialCallingSituations.filter((_, i) => i !== idx) })}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-add-calling-stage"
              onClick={() => setCharB({ ...charB, specialCallingSituations: [...(charB.specialCallingSituations || []), { situation: '', name: '' }] })}
            >
              + 특별 상황 추가
            </button>
          </div>


          <h3 className="subsection-title">🔞 성적 디테일</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>구멍 특징</label>
              <textarea value={charB.sexualDetails?.hole || ''} onChange={(e) => setCharB({ ...charB, sexualDetails: { ...charB.sexualDetails, hole: e.target.value }})} rows="3" />
            </div>
            <div className="form-group full-width">
              <label>특수 반응</label>
              <textarea value={charB.sexualDetails?.reactions || ''} onChange={(e) => setCharB({ ...charB, sexualDetails: { ...charB.sexualDetails, reactions: e.target.value }})} rows="2" />
            </div>
            <div className="form-group full-width">
              <label>유두</label>
              <input type="text" value={charB.sexualDetails?.nipple || ''} onChange={(e) => setCharB({ ...charB, sexualDetails: { ...charB.sexualDetails, nipple: e.target.value }})} />
            </div>
            <div className="form-group full-width">
              <label>성기</label>
              <input type="text" value={charB.sexualDetails?.genital || ''} onChange={(e) => setCharB({ ...charB, sexualDetails: { ...charB.sexualDetails, genital: e.target.value }})} />
            </div>
            <div className="form-group full-width">
              <label>체향</label>
              <input type="text" value={charB.sexualDetails?.scent || ''} onChange={(e) => setCharB({ ...charB, sexualDetails: { ...charB.sexualDetails, scent: e.target.value }})} />
            </div>
            <div className="form-group full-width">
              <label>기타 특수 설정</label>
              <textarea value={charB.sexualDetails?.special || ''} onChange={(e) => setCharB({ ...charB, sexualDetails: { ...charB.sexualDetails, special: e.target.value }})} rows="2" />
            </div>
          </div>

          <h3 className="subsection-title">🏷️ 태그 ({charB.tags?.length || 0}개 선택)</h3>
          <div className="tag-container">
            {COMMON_TAGS_SU.map(tag => (
              <button
                key={tag}
                className={`tag-btn ${charB.tags?.includes(tag) ? 'active' : ''}`}
                onClick={() => handleTagToggle('B', tag)}
              >
                {tag}
              </button>
            ))}
            
            {charB.tags
              ?.filter(tag => !COMMON_TAGS_SU.includes(tag))
              .map(tag => (
                <button
                  key={tag}
                  className="tag-btn active custom-tag"
                  onClick={() => handleTagToggle('B', tag)}
                  title="커스텀 태그 (클릭하여 제거)"
                >
                  {tag} ✕
                </button>
              ))}
            
            <button className="tag-btn add-tag" onClick={() => handleAddCustomTag('B')}>
              + 커스텀 태그 추가
            </button>
          </div>

          {/* 공개 설정 (수) */}
          <h3 className="subsection-title">👁️ 유저 공개 설정</h3>
          <div className="visibility-controls">
            <div className="visibility-item">
              <div className="visibility-header">
                <label>📋 기본 정보</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={charB.visibility?.basicInfo !== false}
                    onChange={(e) => setCharB({
                      ...charB,
                      visibility: { ...charB.visibility, basicInfo: e.target.checked }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="visibility-item">
              <div className="visibility-header">
                <label>🏷️ 태그</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={charB.visibility?.tags !== false}
                    onChange={(e) => setCharB({
                      ...charB,
                      visibility: { ...charB.visibility, tags: e.target.checked }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="visibility-item">
              <div className="visibility-header">
                <label>🔞 성적 디테일</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={charB.visibility?.sexualDetails === true}
                    onChange={(e) => setCharB({
                      ...charB,
                      visibility: { ...charB.visibility, sexualDetails: e.target.checked }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <p className="visibility-note">⚠️ 19금 콘텐츠</p>
            </div>

            <div className="visibility-item">
              <div className="visibility-header">
                <label>✅ 선호/비선호 행동</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={charB.visibility?.actions === true}
                    onChange={(e) => setCharB({
                      ...charB,
                      visibility: { ...charB.visibility, actions: e.target.checked }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <h3 className="subsection-title">✅ 선호 행동</h3>
          <div className="action-list">
            {charB.preferredActions?.map((action, idx) => (
              <input
                key={idx}
                type="text"
                value={action}
                onChange={(e) => handleArrayInput('B', 'preferredActions', idx, e.target.value)}
                className="action-input"
              />
            ))}
            <button className="btn-add-action" onClick={() => handleAddArrayItem('B', 'preferredActions')}>
              + 행동 추가
            </button>
          </div>

          <h3 className="subsection-title">❌ 비선호 행동</h3>
          <div className="action-list">
            {charB.avoidedActions?.map((action, idx) => (
              <input
                key={idx}
                type="text"
                value={action}
                onChange={(e) => handleArrayInput('B', 'avoidedActions', idx, e.target.value)}
                className="action-input"
              />
            ))}
            <button className="btn-add-action" onClick={() => handleAddArrayItem('B', 'avoidedActions')}>
              + 행동 추가
            </button>
          </div>
        </div>

        {/* 시나리오 설정 */}
        <div className="admin-section">
          <h2 className="section-title">🎬 시나리오 설정</h2>
          
          {/* 서사 패턴 선택 */}
          <h3 className="subsection-title">📖 서사 패턴</h3>
          <p className="section-description">
            스토리의 기본 구조와 가능한 엔딩 방향을 설정합니다. AI가 이 패턴을 참고하여 서사를 전개합니다.
          </p>
          
          <div className="narrative-pattern-grid">
            {Object.entries(NARRATIVE_PATTERNS).map(([key, pattern]) => (
              <div 
                key={key}
                className={`narrative-pattern-card ${scenario.narrativePattern === key ? 'active' : ''}`}
                onClick={() => setScenario({ 
                  ...scenario, 
                  narrativePattern: key,
                  selectedEnding: '' // 패턴 변경 시 엔딩 초기화
                })}
              >
                <div className="pattern-header">
                  <span className="pattern-key">{key}</span>
                  <span className="pattern-name">{pattern.name}</span>
                </div>
                <p className="pattern-description">{pattern.description}</p>
                <div className="pattern-endings">
                  {pattern.endings.map((ending, idx) => (
                    <span key={idx} className="ending-chip">{ending}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 선택된 패턴의 엔딩 선택 */}
          {scenario.narrativePattern && NARRATIVE_PATTERNS[scenario.narrativePattern] && (
            <div className="ending-selection">
              <h4 className="ending-title">
                🎯 목표 엔딩 선택 (선택사항)
              </h4>
              <p className="ending-note">
                특정 엔딩으로 유도하고 싶다면 선택하세요. 선택하지 않으면 유저 선택에 따라 자유롭게 진행됩니다.
              </p>
              <div className="ending-options">
                <button
                  className={`ending-btn ${scenario.selectedEnding === '' ? 'active' : ''}`}
                  onClick={() => setScenario({ ...scenario, selectedEnding: '' })}
                >
                  🎲 자유 진행
                </button>
                {NARRATIVE_PATTERNS[scenario.narrativePattern].endings.map((ending, idx) => (
                  <button
                    key={idx}
                    className={`ending-btn ${scenario.selectedEnding === ending ? 'active' : ''}`}
                    onClick={() => setScenario({ ...scenario, selectedEnding: ending })}
                  >
                    {idx === 0 ? '💕' : idx === 1 ? '💔' : '🔄'} {ending}
                  </button>
                ))}
              </div>
            </div>
          )}

          <h3 className="subsection-title" style={{marginTop: '30px'}}>🎭 기본 설정</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>두 사람의 관계</label>
              <input type="text" value={scenario.relationship} onChange={(e) => setScenario({ ...scenario, relationship: e.target.value })} />
            </div>
            <div className="form-group full-width">
              <label>🎲 관계 다이나믹 (선택)</label>
              <textarea
                value={scenario.dynamic || ''}
                onChange={(e) => setScenario({ ...scenario, dynamic: e.target.value })}
                rows="3"
                placeholder="이 커플 조합이 왜 흥미로운지 - 체격/지위/성격의 역전이나 대비, 핵심 갈등, 케미 포인트. 예: 체격은 수가 우세하지만 사회적 권력은 공이 쥐고 있는 역전 구도. 통제하려는 완벽주의자와 충동적인 쾌락주의자의 주도권 싸움이 핵심."
              />
              <p className="field-note">💡 "왜 이 둘의 조합이 흥미로운가"를 적어두면 AI가 매 턴 그 긴장/케미를 일관되게 활용합니다. 성격/외모 설명과 달리 관계 자체의 역학에 집중해서 쓰세요.</p>
            </div>
            <div className="form-group full-width">
              <label>📜 시나리오 배경 (상세, 선택)</label>
              <textarea
                value={scenario.background || ''}
                onChange={(e) => setScenario({ ...scenario, background: e.target.value })}
                rows="6"
                placeholder="두 사람이 지금 이 관계에 이르게 된 경위, 함정/사건의 전말, 앞으로 이야기가 어떻게 전개될지 등 - '관계 다이나믹'보다 더 길고 구체적인 배경 서사나 플롯을 적는 곳입니다. AI만 참고하며, 플레이어에게 그대로 설명하듯 노출되지 않습니다."
              />
              <p className="field-note">💡 위 '관계 다이나믹'이 두 사람 조합의 긴장 요약이라면, 여긴 그 긴장이 생겨난 구체적인 사건·경위·향후 전개 방향을 자유롭게 서술하는 곳입니다.</p>
            </div>
            <div className="form-group">
              <label>시작 날짜 (선택)</label>
              <input
                type="text"
                value={scenario.startDate || ''}
                onChange={(e) => setScenario({ ...scenario, startDate: e.target.value })}
                placeholder="예: 2026년 3월 15일 월요일"
              />
              <p className="field-note">💡 비워두면 AI가 날짜를 특정하지 않고 진행합니다. 채워두면 그 날짜를 기준으로 이야기가 진행되며 시간이 자연스럽게 흐릅니다.</p>
            </div>
            <div className="form-group">
              <label>시작 시간</label>
              <input
                type="text"
                value={scenario.time}
                onChange={(e) => setScenario({ ...scenario, time: e.target.value })}
                placeholder="예: 오후 3시 (반드시 오전/오후 표기)"
              />
            </div>
            <div className="form-group">
              <label>첫 만남 장소</label>
              <input type="text" value={scenario.location} onChange={(e) => setScenario({ ...scenario, location: e.target.value })} />
            </div>
            <div className="form-group">
              <label>첫 만남 상황</label>
              <textarea value={scenario.situation} onChange={(e) => setScenario({ ...scenario, situation: e.target.value })} />
            </div>
          </div>
        </div>

        {/* 엔딩 시스템 설정 */}
        <div className="admin-section">
          <h2
            className="section-title"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => setIsEndingSectionOpen(v => !v)}
          >
            🏆 엔딩 시스템
            <span style={{ fontSize: '13px', color: '#888' }}>{isEndingSectionOpen ? '▲ 접기' : '▼ 펼치기'}</span>
          </h2>
          {isEndingSectionOpen && (
          <>
          <p className="section-description">
            4가지 엔딩을 설정합니다. 호감도와 특정 키워드/선택에 따라 엔딩이 결정됩니다.
          </p>

          {/* 트루 엔딩 */}
          <div className="ending-config-card true-ending">
            <div className="ending-config-header">
              <span className="ending-icon">💕</span>
              <h3>트루 엔딩</h3>
              <span className="ending-condition-badge">호감도 100 필요</span>
            </div>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>엔딩 조건 설명</label>
                <input 
                  type="text" 
                  value={endings.true.condition}
                  onChange={(e) => setEndings({...endings, true: {...endings.true, condition: e.target.value}})}
                  placeholder="예: 호감도 100 + 고백 이벤트 성공"
                />
              </div>
              <div className="form-group full-width">
                <label>필수 키워드 (쉼표로 구분)</label>
                <input 
                  type="text" 
                  value={endings.true.requiredKeywords?.join(', ') || ''}
                  onChange={(e) => setEndings({...endings, true: {...endings.true, requiredKeywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)}})}
                  placeholder="예: 고백, 사랑해, 함께"
                />
                <p className="input-note">이 키워드들이 대화에 모두 등장해야 트루 엔딩 가능</p>
              </div>
              <div className="form-group full-width">
                <label>엔딩 내용</label>
                <textarea 
                  value={endings.true.description}
                  onChange={(e) => setEndings({...endings, true: {...endings.true, description: e.target.value}})}
                  placeholder="트루 엔딩의 구체적인 결말 내용..."
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>보상/특전</label>
                <input 
                  type="text" 
                  value={endings.true.reward || ''}
                  onChange={(e) => setEndings({...endings, true: {...endings.true, reward: e.target.value}})}
                  placeholder="예: 특별 에필로그, 후일담"
                />
              </div>
              <div className="form-group">
                <label>엔딩 CG 이미지 경로</label>
                <input 
                  type="text" 
                  value={endings.true.cgImage || ''}
                  onChange={(e) => setEndings({...endings, true: {...endings.true, cgImage: e.target.value}})}
                  placeholder="/images/endings/true.jpg"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    e.target.value = '';
                    requestCrop(file, 9 / 16, async (croppedFile) => {
                      try {
                        const url = await uploadImageFile(croppedFile, 'endings-true');
                        setEndings(prev => ({ ...prev, true: { ...prev.true, cgImage: url } }));
                      } catch (err) {
                        alert('이미지 업로드 실패: ' + err.message);
                      }
                    });
                  }}
                />
              </div>
            </div>
          </div>

          {/* 노멀 엔딩 */}
          <div className="ending-config-card normal-ending">
            <div className="ending-config-header">
              <span className="ending-icon">😊</span>
              <h3>노멀 엔딩</h3>
              <span className="ending-condition-badge">호감도 70-99</span>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>최소 호감도</label>
                <input 
                  type="number" 
                  value={endings.normal.minAffection}
                  onChange={(e) => setEndings({...endings, normal: {...endings.normal, minAffection: parseInt(e.target.value)}})}
                />
              </div>
              <div className="form-group">
                <label>최대 호감도</label>
                <input 
                  type="number" 
                  value={endings.normal.maxAffection}
                  onChange={(e) => setEndings({...endings, normal: {...endings.normal, maxAffection: parseInt(e.target.value)}})}
                />
              </div>
              <div className="form-group full-width">
                <label>엔딩 내용</label>
                <textarea 
                  value={endings.normal.description}
                  onChange={(e) => setEndings({...endings, normal: {...endings.normal, description: e.target.value}})}
                  placeholder="노멀 엔딩의 결말 내용... (좋지만 아쉬운 결말)"
                  rows="3"
                />
              </div>
              <div className="form-group full-width">
                <label>엔딩 CG 이미지 경로</label>
                <input 
                  type="text" 
                  value={endings.normal.cgImage || ''}
                  onChange={(e) => setEndings({...endings, normal: {...endings.normal, cgImage: e.target.value}})}
                  placeholder="/images/endings/normal.jpg"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    e.target.value = '';
                    requestCrop(file, 9 / 16, async (croppedFile) => {
                      try {
                        const url = await uploadImageFile(croppedFile, 'endings-normal');
                        setEndings(prev => ({ ...prev, normal: { ...prev.normal, cgImage: url } }));
                      } catch (err) {
                        alert('이미지 업로드 실패: ' + err.message);
                      }
                    });
                  }}
                />
              </div>
            </div>
          </div>

          {/* 배드 엔딩 */}
          <div className="ending-config-card bad-ending">
            <div className="ending-config-header">
              <span className="ending-icon">💔</span>
              <h3>배드 엔딩</h3>
              <span className="ending-condition-badge">호감도 70 미만</span>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>최대 호감도 (이하면 배드)</label>
                <input 
                  type="number" 
                  value={endings.bad.maxAffection}
                  onChange={(e) => setEndings({...endings, bad: {...endings.bad, maxAffection: parseInt(e.target.value)}})}
                />
              </div>
              <div className="form-group">
                <label>즉시 배드 키워드 (쉼표로 구분)</label>
                <input 
                  type="text" 
                  value={endings.bad.badKeywords?.join(', ') || ''}
                  onChange={(e) => setEndings({...endings, bad: {...endings.bad, badKeywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)}})}
                  placeholder="예: 이별, 떠나, 끝내자"
                />
                <p className="input-note">이 키워드가 등장하면 호감도와 관계없이 배드 엔딩 루트</p>
              </div>
              <div className="form-group full-width">
                <label>엔딩 내용</label>
                <textarea 
                  value={endings.bad.description}
                  onChange={(e) => setEndings({...endings, bad: {...endings.bad, description: e.target.value}})}
                  placeholder="배드 엔딩의 결말 내용... (비극적 결말)"
                  rows="3"
                />
              </div>
              <div className="form-group full-width">
                <label>엔딩 CG 이미지 경로</label>
                <input 
                  type="text" 
                  value={endings.bad.cgImage || ''}
                  onChange={(e) => setEndings({...endings, bad: {...endings.bad, cgImage: e.target.value}})}
                  placeholder="/images/endings/bad.jpg"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    e.target.value = '';
                    requestCrop(file, 9 / 16, async (croppedFile) => {
                      try {
                        const url = await uploadImageFile(croppedFile, 'endings-bad');
                        setEndings(prev => ({ ...prev, bad: { ...prev.bad, cgImage: url } }));
                      } catch (err) {
                        alert('이미지 업로드 실패: ' + err.message);
                      }
                    });
                  }}
                />
              </div>
            </div>
          </div>

          {/* 히든 엔딩 */}
          <div className="ending-config-card hidden-ending">
            <div className="ending-config-header">
              <span className="ending-icon">🔮</span>
              <h3>히든 엔딩</h3>
              <span className="ending-condition-badge">특수 조건</span>
            </div>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>히든 조건 키워드 조합 (쉼표로 구분)</label>
                <input 
                  type="text" 
                  value={endings.hidden.requiredKeywords?.join(', ') || ''}
                  onChange={(e) => setEndings({...endings, hidden: {...endings.hidden, requiredKeywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)}})}
                  placeholder="예: 비밀, 과거, 용서"
                />
                <p className="input-note">이 키워드들이 특정 순서/조합으로 등장하면 히든 엔딩</p>
              </div>
              <div className="form-group full-width">
                <label>조건 설명 (내부 메모)</label>
                <input 
                  type="text" 
                  value={endings.hidden.condition}
                  onChange={(e) => setEndings({...endings, hidden: {...endings.hidden, condition: e.target.value}})}
                  placeholder="예: 3회 이상 거절 후 마지막에 수락"
                />
              </div>
              <div className="form-group full-width">
                <label>엔딩 내용</label>
                <textarea 
                  value={endings.hidden.description}
                  onChange={(e) => setEndings({...endings, hidden: {...endings.hidden, description: e.target.value}})}
                  placeholder="히든 엔딩의 결말 내용... (의외의 반전)"
                  rows="3"
                />
              </div>
              <div className="form-group full-width">
                <label>엔딩 CG 이미지 경로</label>
                <input 
                  type="text" 
                  value={endings.hidden.cgImage || ''}
                  onChange={(e) => setEndings({...endings, hidden: {...endings.hidden, cgImage: e.target.value}})}
                  placeholder="/images/endings/hidden.jpg"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    e.target.value = '';
                    requestCrop(file, 9 / 16, async (croppedFile) => {
                      try {
                        const url = await uploadImageFile(croppedFile, 'endings-hidden');
                        setEndings(prev => ({ ...prev, hidden: { ...prev.hidden, cgImage: url } }));
                      } catch (err) {
                        alert('이미지 업로드 실패: ' + err.message);
                      }
                    });
                  }}
                />
              </div>
            </div>
          </div>
          </>
          )}
        </div>

        {/* 엔딩 시스템 설정 섹션 다음에 추가 */}

{/* 엔딩 프리뷰 */}
<EndingPreviewSection 
  endings={endings} 
  story={{ characterA: charA, characterB: charB }} 
/>

{/* 흥분도 레벨 설정 */}
<ExcitementSettingsSection 
  excitementSettings={excitementSettings}
  setExcitementSettings={setExcitementSettings}
/>

{/* 이벤트 키워드 관리 */}
<EventKeywordsSection 
  eventKeywords={eventKeywords}
  setEventKeywords={setEventKeywords}
/>

{/* 게임 밸런스 설정 */}
<GameBalanceSection 
  balanceSettings={balanceSettings}
  setBalanceSettings={setBalanceSettings}
/>

{/* 시스템 프롬프트 미리보기 */}
<PromptPreviewSection
  story={{
    title: scenario.title,
    description: scenario.description,
    storyTags: scenario.storyTags,
    characterA: charA,
    characterB: charB,
    scenario,
    endings
  }}
  adminSettings={{ excitementSettings, eventKeywords, balanceSettings }}
/>
        </>
        )}

        {adminView === 'generator' && (
        <>
        <RandomGeneratorSection />
        </>
        )}

        {/* 저장/발행/백업은 상단 고정 헤더로 이동함 (스크롤 안 내려도 되게) */}
        <div className="admin-actions admin-actions-bottom">
          <button className="logout-btn" onClick={() => setIsAuthenticated(false)}>
            로그아웃
          </button>
        </div>
      </div>

      {cropRequest && (
        <ImageCropModal
          file={cropRequest.file}
          aspect={cropRequest.aspect}
          onConfirm={(croppedFile) => {
            const onCropped = cropRequest.onCropped;
            setCropRequest(null);
            onCropped(croppedFile);
          }}
          onCancel={() => setCropRequest(null)}
        />
      )}
    </div>
  );
}

export default AdminPage;