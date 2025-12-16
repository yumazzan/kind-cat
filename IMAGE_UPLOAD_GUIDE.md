# 📸 KIND CAT 이미지 업로드 가이드

## 📁 이미지 파일 구조
```
public/
└── images/
    └── stories/
        └── story-1/              # 스토리 ID별 폴더
            ├── thumbnail.jpg     # 썸네일 (4:5 비율)
            ├── profile-a.jpg     # 공 프로필
            ├── profile-b.jpg     # 수 프로필
            ├── bg-0.jpg          # 호감도 0 배경
            ├── bg-20.jpg         # 호감도 20 배경
            ├── bg-40.jpg         # 호감도 40 배경
            ├── bg-60.jpg         # 호감도 60 배경
            ├── bg-80.jpg         # 호감도 80 배경
            └── keywords/         # 키워드 이미지 폴더
                ├── kiss.jpg
                ├── hug.jpg
                └── ...
```

## 🎨 이미지 사양

### 썸네일
- **비율**: 4:5 (800x1000px 권장)
- **용량**: 500KB 이하
- **형식**: JPG, PNG

### 프로필 사진
- **크기**: 600x600px 이상
- **용량**: 300KB 이하
- **형식**: JPG, PNG

### 배경 이미지
- **크기**: 1920x1080px 권장
- **용량**: 1MB 이하
- **형식**: JPG

### 키워드 이미지
- **크기**: 800x600px 이상
- **용량**: 500KB 이하
- **형식**: JPG, PNG

## 📤 업로드 방법

### 방법 1: 로컬 개발 (권장)
```bash
# 1. public/images/stories/ 폴더로 이동
cd /Users/a1/kind-cat-complete/public/images/stories

# 2. 스토리 폴더 생성
mkdir story-1
mkdir story-1/keywords

# 3. 이미지 파일 복사
cp ~/Downloads/thumbnail.jpg story-1/
cp ~/Downloads/profile-a.jpg story-1/
cp ~/Downloads/profile-b.jpg story-1/
cp ~/Downloads/bg-0.jpg story-1/
# ... (나머지 파일들)

# 4. Git 커밋 및 배포
git add public/images/
git commit -m "Add story images"
git push origin main
npm run deploy
```

### 방법 2: GitHub 직접 업로드

1. **GitHub 저장소 접속**
```
   https://github.com/yumazzan/kind-cat
```

2. **public/images/stories/ 폴더로 이동**

3. **"Add file" → "Upload files" 클릭**

4. **이미지 드래그 앤 드롭**

5. **Commit changes**

## 🖼️ Admin 페이지에서 경로 입력

### 썸네일
```
/images/stories/story-1/thumbnail.jpg
```

### 프로필 사진 (공)
```
/images/stories/story-1/profile-a.jpg
```

### 프로필 사진 (수)
```
/images/stories/story-1/profile-b.jpg
```

### 배경 이미지
```
/images/stories/story-1/bg-0.jpg
/images/stories/story-1/bg-20.jpg
/images/stories/story-1/bg-40.jpg
/images/stories/story-1/bg-60.jpg
/images/stories/story-1/bg-80.jpg
```

### 키워드 이미지
```
키워드: 키스
경로: /images/stories/story-1/keywords/kiss.jpg

키워드: 포옹
경로: /images/stories/story-1/keywords/hug.jpg
```

## ⚠️ 주의사항

1. **경로는 항상 `/`로 시작**
2. **파일명은 영문 소문자 + 하이픈 권장** (예: kiss-scene.jpg)
3. **한글 파일명 사용 금지**
4. **공백 대신 하이픈 사용** (예: first-meeting.jpg)
5. **이미지 최적화 필수** (TinyPNG 사용 권장)

## 🔧 이미지 최적화 도구

- **TinyPNG**: https://tinypng.com/
- **Squoosh**: https://squoosh.app/
- **ImageOptim**: https://imageoptim.com/ (Mac)

## 📝 예시
```javascript
// Admin 페이지 입력 예시
{
  "thumbnail": "/images/stories/story-1/thumbnail.jpg",
  "characterA": {
    "avatar": "/images/stories/story-1/profile-a.jpg"
  },
  "characterB": {
    "avatar": "/images/stories/story-1/profile-b.jpg"
  },
  "backgroundImages": {
    "0": "/images/stories/story-1/bg-0.jpg",
    "20": "/images/stories/story-1/bg-20.jpg",
    "40": "/images/stories/story-1/bg-40.jpg",
    "60": "/images/stories/story-1/bg-60.jpg",
    "80": "/images/stories/story-1/bg-80.jpg"
  },
  "keywordImages": [
    {
      "keyword": "키스",
      "path": "/images/stories/story-1/keywords/kiss.jpg"
    }
  ]
}
```

## 🚀 빠른 시작
```bash
# 1단계: 폴더 생성
mkdir -p public/images/stories/story-1/keywords

# 2단계: 이미지 복사 (예시)
cp ~/Downloads/my-thumbnail.jpg public/images/stories/story-1/thumbnail.jpg

# 3단계: 배포
git add . && git commit -m "Add images" && git push && npm run deploy
```

끝! 🎉
