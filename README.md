# KIND CAT - BL Interactive Fiction 🐱

완전한 React 프로젝트입니다!

---

## 🚀 빠른 시작

### 1. 프로젝트 열기
```bash
# VS Code에서
File → Open Folder → kind-cat-complete 선택
```

### 2. 패키지 설치
```bash
# VS Code 터미널에서 (Ctrl + ` 또는 Terminal → New Terminal)
npm install
```

**예상 시간:** 2-3분

### 3. 실행
```bash
npm start
```

자동으로 브라우저가 열립니다! → `http://localhost:3000`

---

## 📂 프로젝트 구조

```
kind-cat-complete/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ApiKeyScreen.js     ✅ API 키 입력 화면
│   │   ├── ApiKeyScreen.css
│   │   ├── StoryScreen.js      ✅ 메인 스토리 화면
│   │   ├── StoryScreen.css
│   │   ├── Sidebar.js          ✅ 사이드바 (캐릭터, 상태, 갤러리)
│   │   ├── Sidebar.css
│   │   ├── ChatArea.js         ✅ 채팅 영역
│   │   └── ChatArea.css
│   ├── config/
│   │   └── storyConfig.js      🔧 스토리 설정 (관리자 수정)
│   ├── utils/
│   │   └── aiService.js        ✅ AI API 호출 로직
│   ├── App.js                  ✅ 메인 앱
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

---

## 🔧 스토리 커스터마이징

### 새로운 스토리 만들기

`src/config/storyConfig.js` 파일만 수정하세요:

```javascript
export const STORY_CONFIG = {
  title: "당신의 스토리 제목",
  description: "스토리 설명",
  
  characterA: {
    name: "캐릭터 이름",
    age: "나이",
    // ...
  },
  
  // 이미지 URL도 여기서 수정
  images: [
    { id: 1, threshold: 20, url: "이미지 URL" },
    // ...
  ]
};
```

---

## ✨ 주요 기능

### ✅ 완성된 기능
- API 키 입력 화면
- 스토리 진행 시스템
- 호감도/흥분도 관리
- 배경 이미지 자동 변경 (투명도 30%)
- 대사/지문 명확 구분
- 과부하 방지 (6초 쿨다운)
- 응답 캐싱 시스템
- 자동 재시도 로직

### 🎨 UI 특징
- #3f3f3f 깔끔한 대화 배경
- 흰색 텍스트
- 테두리 없는 카카오톡 스타일
- 캐릭터 프로필 사진
- 선택지 시스템
- 반응형 디자인

---

## 🐛 문제 해결

### "npm: command not found"
→ Node.js 설치 필요: https://nodejs.org/

### "포트 3000 사용 중"
```bash
PORT=3001 npm start
```

### "패키지 설치 실패"
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### "화면이 깨짐"
→ 브라우저 새로고침 (Cmd + Shift + R)

---

## 📝 개발 팁

### 파일 수정 후 자동 새로고침
저장하면 자동으로 브라우저가 업데이트됩니다.

### 에러 확인
브라우저 개발자 도구 (F12) → Console 탭

### 빌드 테스트
```bash
npm run build
# build/ 폴더에 최적화된 파일 생성
```

---

## 🌐 다음 단계: 배포

### Firebase Hosting 준비
```bash
npm install -g firebase-tools
firebase login
firebase init
npm run build
firebase deploy
```

---

## 💡 FAQ

**Q: 다른 스토리는 어떻게 만드나요?**
A: `storyConfig.js`를 복사해서 다른 설정으로 변경하세요!

**Q: 실제 캐릭터 이미지는 어떻게 추가하나요?**
A: `storyConfig.js`의 `avatar`와 `images` URL을 실제 이미지 링크로 변경하세요.

**Q: API 키를 매번 입력해야 하나요?**
A: 네, 보안상 매번 입력이 필요합니다. (다음 버전에서 저장 기능 추가 예정)

---

## 🎯 개발 로드맵

- [x] 기본 UI/UX
- [x] AI 대화 시스템
- [x] 호감도 시스템
- [x] 이미지 해금
- [ ] Firebase 연동
- [ ] 관리자 대시보드
- [ ] 이미지 업로드 기능
- [ ] 사용자 인증
- [ ] 결제 시스템

---

**즐거운 개발 되세요! 🚀**
