// uploadStory.mjs - Firestore에 스토리 직접 업로드
// 사용법: node uploadStory.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyBkO_LBcOMF2VOMywDKAP28yW7uiOvMPAs",
  authDomain: "yuma-f4924-3ccfd.firebaseapp.com",
  projectId: "yuma-f4924-3ccfd",
  storageBucket: "yuma-f4924-3ccfd.firebasestorage.app",
  messagingSenderId: "918394185102",
  appId: "1:918394185102:web:86181765bc32450c3f0df",
  measurementId: "G-K5R5RV2K60"
};

// storyConfig 데이터
const STORY_CONFIG = {
  "appSettings": {
    "icon": null,
    "iconPreview": "🐱",
    "fontFamily": "Malgun Gothic",
    "customFont": ""
  },
  "title": "윤간호사 울리기",
  "description": "윤간호사의 약점을 찾아서 울려보세요\n보상 : 간호사 코스튬🏥❤️",
  "characterA": {
    "name": "강주혁",
    "age": "35",
    "role": "공",
    "personality": "냉혈함, 완벽주의/강박적, 집착적",
    "occupation": "외과 의사 (병원장 아들)",
    "appearance": "깊은 아이홀과 짙은 흑발, 푸른 눈동자, 날카로운 턱선. 188cm의 압도적 키와 거대한 근육질 체형, 떡 벌어진 어깨와 탄탄한 가슴 근육. 깔끔하게 넘긴 흑발, 혈관이 도드라진 팔뚝",
    "bodyDetails": {
      "height": "188cm",
      "build": "거대한 근육질",
      "features": "떡 벌어진 어깨, 탄탄한 가슴 근육, 혈관이 도드라진 팔뚝, 넓은 손"
    },
    "speech": "짧고 단정적이며 권위적. 감정을 숨긴 채 관찰하듯 말하며 통제적인 명령조",
    "callingSystem": {
      "affection_0_20": "윤간호사",
      "affection_21_40": "윤간호사,윤태이",
      "affection_41_60": "윤태이,태이,윤간호사",
      "affection_61_80": "윤태이,태이",
      "affection_81_100": "내꺼,태이"
    },
    "avatar": null,
    "avatarPreview": null,
    "sexualDetails": {
      "genital": "굵고 압도적인 형태, 뜨거운 체온, 탄탄한 근육",
      "body": "거대한 근육질, 넓은 손, 강한 악력",
      "scent": "진한 사향/머스크",
      "special": "알파 페로몬 분비, 교미 본능, 매듭 형성"
    },
    "tags": [
      "#알파공",
      "#냉혈공",
      "#떡대공",
      "#연상공",
      "#집착공"
    ],
    "preferredActions": [
      "수치심을 유발하는 지시",
      "발정기 중 태이의 신음",
      "유두나 목덜미에 흔적 남기기",
      "정신적인 압박",
      "수술복을 입고 유희",
      "완벽했던 태이가 흐트러질 때",
      "본인에게 의존"
    ],
    "avoidedActions": [
      "태이가 필사적으로 거부하는 것",
      "감정적인 호소",
      "통제가 안됨",
      "윤태이가 반응을 안함",
      "대답을 안하거나 피함",
      "윤태이가 흥분을 참음"
    ],
    "visibility": {
      "basicInfo": true,
      "sexualDetails": false,
      "tags": true,
      "actions": false
    },
    "profileImages": [
      "/kind-cat/images/stories/story-1/top-1.jpg",
      "/kind-cat/images/stories/story-1/top-2.jpg",
      "/kind-cat/images/stories/story-1/top-3.jpg"
    ]
  },
  "characterB": {
    "name": "윤태이",
    "age": "24",
    "role": "수",
    "personality": "경계심 강함, 완벽주의/강박적, 내향적/사회성 결여",
    "occupation": "신입 간호사",
    "appearance": "정돈된 금발과 깨끗한 피부, 인형 같은 얼굴. 짙은 쌍꺼풀과 둥근 눈매지만 감정을 숨긴 가는 눈매. 하얀 피부는 쉽게 붉어지는 민감 체질",
    "bodyDetails": {
      "height": "178cm",
      "build": "슬림탄탄 체형, 얇지만 탄탄한 허리와 잘록한 허리. ",
      "features": "잘록한 허리, 밀크빛 하얀 피부, 쉽게 붉어지는 민감 체질"
    },
    "speech": "사무적이고 공손한 존댓말. 감정을 드러내지 않기 위해 절제되고 딱딱함",
    "callingSystem": {
      "affection_0_20": "과장님",
      "affection_21_40": "과장님",
      "affection_41_60": "과장님",
      "affection_61_80": "과장님,주인님",
      "affection_81_100": "형,과장님,주인님"
    },
    "avatar": null,
    "avatarPreview": null,
    "sexualDetails": {
      "hole": "쪼이는 힘 매우 강함, 슬릭 과다 분비, 깊은 곳만 민감,쉽게 젖음.",
      "reactions": "수치심=흥분, 쉽게 붉어지는 피부, 발작적 경련, 눈물 흘림",
      "nipple": "도드라지는 유두 극도 민감 (옷에 쓸려도 반응)",
      "genital": "평균 크기",
      "scent": "달콤한 코코넛/복숭아",
      "body": "",
      "special": "오메가 발정기, 슬릭 과다 분비, 달콤한 오메가 페로몬 (코코넛/복숭아 향), 임신 가능"
    },
    "tags": [
      "#오메가수",
      "#까칠수",
      "#미인수",
      "#강수"
    ],
    "preferredActions": [
      "자신이 통제할 수 없는 쾌감",
      "억제제 풀리고 페로몬 충족",
      "은밀한 부위 노출",
      "특정 부위 섬세한 자극",
      "본인을 압도적으로 통제 및 지배함",
      "저항하다 굴복",
      ""
    ],
    "avoidedActions": [
      "공적인 부분 침해 빛 방헤",
      "병원 내 사적 접촉",
      "과거 상처 들추기",
      "의지와 무관한 신체 반응 노출",
      "본인을 협박",
      "비밀을 들키거나 다른 사람에게 누출"
    ],
    "visibility": {
      "basicInfo": true,
      "sexualDetails": false,
      "tags": true,
      "actions": false
    },
    "profileImages": [
      "/kind-cat/images/stories/story-1/bg-20/bg-10.jpeg"
    ]
  },
  "scenario": {
    "relationship": "상사와 부하",
    "location": "직장(병원)",
    "situation": "복도에서 마주침",
    "time": "오후 3시"
  },
  "images": [
    {
      "id": 1,
      "threshold": 20,
      "name": "첫 만남"
    },
    {
      "id": 2,
      "threshold": 40,
      "name": "친밀해짐"
    },
    {
      "id": 3,
      "threshold": 60,
      "name": "설레는 순간"
    },
    {
      "id": 4,
      "threshold": 80,
      "name": "깊어지는 관계"
    },
    {
      "id": 5,
      "threshold": 100,
      "name": "완전한 신뢰"
    }
  ],
  "backgroundImages": {
    "0": [
      "/kind-cat/images/stories/story-1/bg-20/bg-11.jpeg",
      "/kind-cat/images/stories/story-1/bg-20/bg-12.png"
    ],
    "20": [
      "/kind-cat/images/stories/story-1/bg-20/bg-11.jpeg",
      "/kind-cat/images/stories/story-1/bg-20/bg-13.jpeg"
    ],
    "40": [
      "/kind-cat/images/stories/story-1/bg-40/bg-31.jpeg",
      "/kind-cat/images/stories/story-1/bg-40/bg-30.png",
      "/kind-cat/images/stories/story-1/bg-46.jpeg",
      "/kind-cat/images/stories/story-1/bg-45.png"
    ],
    "60": [
      "/kind-cat/images/stories/story-1/bg-60/bg-66.png",
      "/kind-cat/images/stories/story-1/bg-60/bg-65.jpeg"
    ],
    "80": [
      "/kind-cat/images/stories/story-1/bg-80/bg-73.png",
      "/kind-cat/images/stories/story-1/bg-80/bg-72.jpeg",
      "/kind-cat/images/stories/story-1/bg-80/bg-71.png",
      "/kind-cat/images/stories/story-1/bg-80/bg-70.jpeg"
    ]
  },
  "keywordImages": [
    {
      "keyword": "청진기",
      "imagePath": "/kind-cat/images/stories/story-1/tag-1.png"
    }
  ]
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 스토리 업로드 함수
async function uploadStory() {
  try {
    console.log('📤 스토리 업로드 시작...');
    
    const storyId = '1766756848131'; // 고유 ID
    
    const storyData = {
      id: storyId,
      storyTitle: STORY_CONFIG.title,
      title: STORY_CONFIG.title,
      description: STORY_CONFIG.description,
      savedAt: new Date().toISOString(),
      published: true, // ⭐ 바로 발행!
      publishedAt: new Date().toISOString(),
      thumbnail: "/kind-cat/images/stories/story-1/thum.jpg",
      
      // storyTags 추가
      storyTags: {
        genre: ['#병원', '#19금', '#오피스'],
        mood: ['#강공', '#집착공'],
        situation: ['#연상공', '#알파공']
      },
      
      appSettings: STORY_CONFIG.appSettings,
      characterA: STORY_CONFIG.characterA,
      characterB: STORY_CONFIG.characterB,
      scenario: STORY_CONFIG.scenario,
      images: STORY_CONFIG.images,
      backgroundImages: STORY_CONFIG.backgroundImages,
      keywordImages: STORY_CONFIG.keywordImages
    };

    // Firestore에 저장
    await setDoc(doc(db, 'stories', storyId), storyData);
    
    console.log('✅ 스토리 업로드 성공!');
    console.log('📝 스토리 ID:', storyId);
    console.log('📚 제목:', storyData.storyTitle);
    console.log('🚀 발행 상태:', storyData.published ? '발행됨' : '미발행');
    console.log('🌐 확인: https://yumazzan.github.io/kind-cat/');
    console.log('');
    console.log('💡 메인 페이지에서 스토리가 보일 거예요!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ 업로드 실패:', error);
    console.error('에러 상세:', error.message);
    process.exit(1);
  }
}

// 실행
uploadStory();
