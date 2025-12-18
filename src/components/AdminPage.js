import React, { useState, useEffect } from 'react';
import './AdminPage.css';
import { STORY_CONFIG } from '../config/storyConfig';

function AdminPage({ onSaveConfig }) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // 앱 설정
  const [appSettings, setAppSettings] = useState({
    icon: null,
    iconPreview: '🐱',
    fontFamily: 'Malgun Gothic',
    customFont: ''
  });

  // 캐릭터 A (공)
  const [charA, setCharA] = useState({
    ...STORY_CONFIG.characterA,
    tags: STORY_CONFIG.characterA?.tags || [],
    preferredActions: STORY_CONFIG.characterA?.preferredActions || [],
    avoidedActions: STORY_CONFIG.characterA?.avoidedActions || [],
    callingSystem: STORY_CONFIG.characterA?.callingSystem || {},
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
    tags: STORY_CONFIG.characterB?.tags || [],
    preferredActions: STORY_CONFIG.characterB?.preferredActions || [],
    avoidedActions: STORY_CONFIG.characterB?.avoidedActions || [],
    callingSystem: STORY_CONFIG.characterB?.callingSystem || {},
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
    location: STORY_CONFIG.scenario?.location || '직장(병원)',
    situation: STORY_CONFIG.scenario?.situation || '복도에서 마주침',
    time: STORY_CONFIG.scenario?.time || '오후 3시',
    narrativePattern: 'A',
    storyTags: {
      genre: ['#로맨스', '#오피스'],
      mood: ['#달달', '#긴장감'],
      situation: ['#첫만남', '#짝사랑']
    }
  });

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
    0: [],    // 0-20점: 여러 장 가능
    20: [],   // 21-40점
    40: [],   // 41-60점
    60: [],   // 61-80점
    80: []    // 81-100점
  });

  // 프로필 이미지 (여러 장)
  const [profileImagesA, setProfileImagesA] = useState([]);
  const [profileImagesB, setProfileImagesB] = useState([]);

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

  const COMMON_TAGS_GONG = [
    '#냉혈공', '#재벌공', '#강공', '#광공', '#집착공',
    '#절륜공', '#능글공', '#다정공', '#헌신공', '#연상공'
  ];

  const COMMON_TAGS_SU = [
    '#까칠수', '#순수수', '#다정수', '#헌신수', '#유혹수',
    '#상처수', '#자낮수', '#공이었수', '#츤데레', '#연상수'
  ];

  const STORY_TAG_OPTIONS = {
    genre: [
      '#로맨스', '#오피스', '#학원', '#판타지', '#현대물',
      '#시대물', '#SF', '#스릴러', '#코미디', '#19금'
    ],
    mood: [
      '#달달', '#긴장감', '#애절', '#유쾌', '#어둡',
      '#몽환적', '#현실적', '#센슈얼', '#순애', '#집착'
    ],
    situation: [
      '#첫만남', '#재회', '#짝사랑', '#양편사랑', '#삼각관계',
      '#금지된사랑', '#계약연애', '#동거', '#출장', '#비밀연애'
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

  // 배경 이미지 추가 (다중)
  const handleAddBackgroundImage = (affectionLevel) => {
    const path = prompt('이미지 경로 입력 (예: /images/stories/story-1/bg-0-1.jpg):');
    if (path && path.trim()) {
      setBackgroundImages({
        ...backgroundImages,
        [affectionLevel]: [...backgroundImages[affectionLevel], path.trim()]
      });
    }
  };

  // 배경 이미지 수정
  const handleUpdateBackgroundImage = (affectionLevel, index, value) => {
    const updated = [...backgroundImages[affectionLevel]];
    updated[index] = value;
    setBackgroundImages({
      ...backgroundImages,
      [affectionLevel]: updated
    });
  };

  // 배경 이미지 삭제
  const handleRemoveBackgroundImage = (affectionLevel, index) => {
    setBackgroundImages({
      ...backgroundImages,
      [affectionLevel]: backgroundImages[affectionLevel].filter((_, i) => i !== index)
    });
  };

  // 프로필 이미지 추가 (공)
  const handleAddProfileImageA = () => {
    const path = prompt('프로필 이미지 경로 입력:');
    if (path && path.trim()) {
      setProfileImagesA([...profileImagesA, path.trim()]);
    }
  };

  // 프로필 이미지 추가 (수)
  const handleAddProfileImageB = () => {
    const path = prompt('프로필 이미지 경로 입력:');
    if (path && path.trim()) {
      setProfileImagesB([...profileImagesB, path.trim()]);
    }
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

  // 컴포넌트 마운트 시 저장된 스토리 목록 로드
  useEffect(() => {
    const stories = JSON.parse(localStorage.getItem('kind_cat_stories') || '[]');
    setSavedStories(stories);
  }, []);

  // 썸네일 업로드
  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

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

  // 설정 저장
  const handleSaveConfig = () => {
    const storyId = currentStoryId || Date.now().toString();
    
    const config = {
      id: storyId,
      storyTitle: storyTitle,
      savedAt: new Date().toISOString(),
      published: savedStories.find(s => s.id === storyId)?.published || false,
      publishedAt: savedStories.find(s => s.id === storyId)?.publishedAt || null,
      thumbnail: imageFiles.thumbnail || thumbnailPreview,
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
        location: scenario.location,
        situation: scenario.situation,
        time: scenario.time,
        narrativePattern: scenario.narrativePattern || 'A'
      },
      images: images.map(img => ({
        id: img.id,
        threshold: img.threshold,
        name: img.name
      })),
      backgroundImages: backgroundImages,
      keywordImages: keywordImageList
    };

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
    
    alert(`✅ "${storyTitle}" 스토리가 저장되었습니다!`);
  };

  // 스토리 발행
  const handlePublishStory = () => {
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

    const updatedStories = savedStories.map(s => 
      s.id === currentStoryId 
        ? { ...s, published: true, publishedAt: new Date().toISOString() }
        : s
    );

    localStorage.setItem('kind_cat_stories', JSON.stringify(updatedStories));
    setSavedStories(updatedStories);

    alert(`✅ "${storyTitle}" 스토리가 발행되었습니다!\n\n메인 화면에서 확인할 수 있습니다.`);
  };

  // 발행 취소
  const handleUnpublishStory = () => {
    if (!currentStoryId) return;

    if (!window.confirm(`"${storyTitle}" 스토리의 발행을 취소하시겠습니까?\n\n메인 화면에서 숨겨집니다.`)) {
      return;
    }

    const updatedStories = savedStories.map(s => 
      s.id === currentStoryId 
        ? { ...s, published: false, publishedAt: null }
        : s
    );

    localStorage.setItem('kind_cat_stories', JSON.stringify(updatedStories));
    setSavedStories(updatedStories);

    alert(`✅ "${storyTitle}" 스토리의 발행이 취소되었습니다!`);
  };

  // 스토리 로드
  const handleLoadStory = (storyId) => {
    const story = savedStories.find(s => s.id === storyId);
    if (!story) return;
    
    setCurrentStoryId(story.id);
    setStoryTitle(story.storyTitle);
    setThumbnailPreview(story.thumbnail || null);
    setAppSettings(story.appSettings);
    setScenario({
      title: story.title,
      description: story.description,
      storyTags: story.storyTags,
      relationship: story.scenario.relationship,
      location: story.scenario.location,
      situation: story.scenario.situation,
      time: story.scenario.time,
      narrativePattern: story.scenario.narrativePattern || 'A'
    });
    setCharA(story.characterA);
    setCharB(story.characterB);
    setImages(story.images);
    setBackgroundImages(story.backgroundImages || {0: [], 20: [], 40: [], 60: [], 80: []});
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
    
    setCurrentStoryId(null);
    setStoryTitle('새 스토리');
    
    alert('✅ 새 스토리가 생성되었습니다!');
  };

  // 스토리 삭제
  const handleDeleteStory = (storyId) => {
    const story = savedStories.find(s => s.id === storyId);
    if (!window.confirm(`"${story?.storyTitle}" 스토리를 삭제하시겠습니까?`)) {
      return;
    }
    
    const updatedStories = savedStories.filter(s => s.id !== storyId);
    localStorage.setItem('kind_cat_stories', JSON.stringify(updatedStories));
    setSavedStories(updatedStories);
    
    if (currentStoryId === storyId) {
      setCurrentStoryId(null);
      localStorage.removeItem('kind_cat_active_story');
    }
    
    alert('✅ 스토리가 삭제되었습니다!');
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
        <div className="admin-logo-section">
          <img 
            src={`${process.env.PUBLIC_URL}/cat-icon.png`}
            alt="CAT" 
            className="admin-cat-icon"
          />
          <h1>🎨 KIND CAT 관리자</h1>
        </div>
        <button className="logout-btn" onClick={() => setIsAuthenticated(false)}>
          로그아웃
        </button>
      </div>

      <div className="admin-content">
        {/* ⭐ 저장된 스토리 목록을 맨 위로 */}
        {savedStories.length > 0 && (
          <div className="admin-section">
            <h2 className="section-title">💾 저장된 스토리 목록 ({savedStories.length}개)</h2>
            <div className="stories-grid">
              {[...savedStories]
                .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
                .map(story => (
                  <div 
                    key={story.id} 
                    className={`story-card ${currentStoryId === story.id ? 'active' : ''}`}
                  >
                    <div className="story-card-header">
                      <h4>{story.storyTitle}</h4>
                      {currentStoryId === story.id && <span className="current-badge">현재</span>}
                      {story.published && <span className="published-badge">발행됨</span>}
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
                  </div>
                ))}
            </div>
          </div>
        )}

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

            <div className="thumbnail-upload-section">
              <label>📸 스토리 썸네일 (메인 화면 노출)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="file-input"
              />
              {thumbnailPreview && (
                <div className="thumbnail-preview-container">
                  <img src={thumbnailPreview} alt="썸네일 미리보기" className="thumbnail-preview" />
                  <button 
                    className="btn-remove-thumbnail" 
                    onClick={() => setThumbnailPreview(null)}
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

            {/* 배경 이미지 (호감도별) - 다중 업로드 */}
            <div className="background-images-section">
              <h3 className="subsection-title">🎨 배경 이미지 (호감도별)</h3>
              <p className="section-description">
                호감도 점수에 따라 다른 배경 이미지가 표시됩니다. 여러 장 추가 가능!
              </p>
              
              {/* 0-20점 */}
              <div className="affection-bg-group">
                <h4>0-20점 (낯선 호감도)</h4>
                <div className="multi-image-list">
                  {backgroundImages[0].map((img, idx) => (
                    <div key={idx} className="image-item">
                      <span className="image-number">{idx + 1}.</span>
                      <input
                        type="text"
                        value={img}
                        onChange={(e) => handleUpdateBackgroundImage(0, idx, e.target.value)}
                        placeholder={`약 ${Math.floor(idx * (20 / Math.max(backgroundImages[0].length - 1, 1)))}점에 표시`}
                        className="path-input"
                      />
                      <button
                        className="btn-remove-image"
                        onClick={() => handleRemoveBackgroundImage(0, idx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button className="btn-add-image" onClick={() => handleAddBackgroundImage(0)}>
                  ➕ 이미지 추가 (0-20점)
                </button>
              </div>

              {/* 21-40점 */}
              <div className="affection-bg-group">
                <h4>21-40점 (친밀해짐)</h4>
                <div className="multi-image-list">
                  {backgroundImages[20].map((img, idx) => (
                    <div key={idx} className="image-item">
                      <span className="image-number">{idx + 1}.</span>
                      <input
                        type="text"
                        value={img}
                        onChange={(e) => handleUpdateBackgroundImage(20, idx, e.target.value)}
                        placeholder={`약 ${21 + Math.floor(idx * (19 / Math.max(backgroundImages[20].length - 1, 1)))}점에 표시`}
                        className="path-input"
                      />
                      <button
                        className="btn-remove-image"
                        onClick={() => handleRemoveBackgroundImage(20, idx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button className="btn-add-image" onClick={() => handleAddBackgroundImage(20)}>
                  ➕ 이미지 추가 (21-40점)
                </button>
              </div>

              {/* 41-60점 */}
              <div className="affection-bg-group">
                <h4>41-60점 (중간 호감도)</h4>
                <div className="multi-image-list">
                  {backgroundImages[40].map((img, idx) => (
                    <div key={idx} className="image-item">
                      <span className="image-number">{idx + 1}.</span>
                      <input
                        type="text"
                        value={img}
                        onChange={(e) => handleUpdateBackgroundImage(40, idx, e.target.value)}
                        placeholder={`약 ${41 + Math.floor(idx * (19 / Math.max(backgroundImages[40].length - 1, 1)))}점에 표시`}
                        className="path-input"
                      />
                      <button
                        className="btn-remove-image"
                        onClick={() => handleRemoveBackgroundImage(40, idx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button className="btn-add-image" onClick={() => handleAddBackgroundImage(40)}>
                  ➕ 이미지 추가 (41-60점)
                </button>
              </div>

              {/* 61-80점 */}
              <div className="affection-bg-group">
                <h4>61-80점 (깊어지는 관계)</h4>
                <div className="multi-image-list">
                  {backgroundImages[60].map((img, idx) => (
                    <div key={idx} className="image-item">
                      <span className="image-number">{idx + 1}.</span>
                      <input
                        type="text"
                        value={img}
                        onChange={(e) => handleUpdateBackgroundImage(60, idx, e.target.value)}
                        placeholder={`약 ${61 + Math.floor(idx * (19 / Math.max(backgroundImages[60].length - 1, 1)))}점에 표시`}
                        className="path-input"
                      />
                      <button
                        className="btn-remove-image"
                        onClick={() => handleRemoveBackgroundImage(60, idx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button className="btn-add-image" onClick={() => handleAddBackgroundImage(60)}>
                  ➕ 이미지 추가 (61-80점)
                </button>
              </div>

              {/* 81-100점 */}
              <div className="affection-bg-group">
                <h4>81-100점 (최고 호감도)</h4>
                <div className="multi-image-list">
                  {backgroundImages[80].map((img, idx) => (
                    <div key={idx} className="image-item">
                      <span className="image-number">{idx + 1}.</span>
                      <input
                        type="text"
                        value={img}
                        onChange={(e) => handleUpdateBackgroundImage(80, idx, e.target.value)}
                        placeholder={`약 ${81 + Math.floor(idx * (19 / Math.max(backgroundImages[80].length - 1, 1)))}점에 표시`}
                        className="path-input"
                      />
                      <button
                        className="btn-remove-image"
                        onClick={() => handleRemoveBackgroundImage(80, idx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button className="btn-add-image" onClick={() => handleAddBackgroundImage(80)}>
                  ➕ 이미지 추가 (81-100점)
                </button>
              </div>

              <p className="bg-note">
                💡 예시: 0-20점에 3장 추가 시 → 약 0점, 10점, 20점에 각각 다른 이미지 표시<br/>
                ✨ 많이 넣을수록 더 자연스러운 변화!
              </p>
            </div>

            {/* 키워드 이미지 */}
            <div className="keyword-images-section">
              <h3 className="subsection-title">🖼️ 키워드 이미지</h3>
              <p className="section-description">
                특정 키워드가 대화에 나타나면 자동으로 이미지를 전송합니다.<br/>
                예: "키스" 입력 시 → 키스 장면 이미지 표시
              </p>

              <div className="keyword-add-form">
                <div className="keyword-input-row">
                  <div className="keyword-input-col">
                    <label>키워드</label>
                    <input
                      type="text"
                      placeholder="키스, 포옹, 울음..."
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      className="keyword-text-input"
                    />
                  </div>
                  <div className="keyword-input-col">
                    <label>이미지 경로</label>
                    <input
                      type="text"
                      placeholder="/images/stories/story-1/keywords/kiss.jpg"
                      value={newKeywordPath}
                      onChange={(e) => setNewKeywordPath(e.target.value)}
                      className="keyword-path-input"
                    />
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
                            <label>키워드</label>
                            <input
                              type="text"
                              value={item.keyword}
                              onChange={(e) => handleUpdateKeywordImage(index, 'keyword', e.target.value)}
                              className="keyword-edit-input"
                            />
                          </div>
                          <div className="keyword-edit-col">
                            <label>이미지 경로</label>
                            <input
                              type="text"
                              value={item.imagePath}
                              onChange={(e) => handleUpdateKeywordImage(index, 'imagePath', e.target.value)}
                              className="keyword-edit-input"
                            />
                          </div>
                        </div>
                        {item.imagePath && (
                          <div className="keyword-preview-container">
                            <img 
                              src={`${process.env.PUBLIC_URL}${item.imagePath}`}
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

            <div className="story-actions">
              <button className="btn-new-story" onClick={handleNewStory}>
                ➕ 새 스토리 만들기
              </button>
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
            
            <button className="btn-add-image" onClick={handleAddProfileImageA}>
              ➕ 프로필 이미지 추가
            </button>
            
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
          </div>

          <h3 className="subsection-title">💕 호칭 시스템 (공 → 수)</h3>
          <div className="calling-system-note">
            <p>관계 점수(호감도)에 따라 공이 수를 부르는 호칭이 변화합니다</p>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>0-20점 (타인)</label>
              <input type="text" value={charA.callingSystem?.affection_0_20 || ''} onChange={(e) => setCharA({ ...charA, callingSystem: { ...charA.callingSystem, affection_0_20: e.target.value }})} placeholder="예: 윤태이 씨" />
            </div>
            <div className="form-group">
              <label>21-40점 (경계)</label>
              <input type="text" value={charA.callingSystem?.affection_21_40 || ''} onChange={(e) => setCharA({ ...charA, callingSystem: { ...charA.callingSystem, affection_21_40: e.target.value }})} placeholder="예: 태이 씨" />
            </div>
            <div className="form-group">
              <label>41-60점 (관심)</label>
              <input type="text" value={charA.callingSystem?.affection_41_60 || ''} onChange={(e) => setCharA({ ...charA, callingSystem: { ...charA.callingSystem, affection_41_60: e.target.value }})} placeholder="예: 태이" />
            </div>
            <div className="form-group">
              <label>61-80점 (호감)</label>
              <input type="text" value={charA.callingSystem?.affection_61_80 || ''} onChange={(e) => setCharA({ ...charA, callingSystem: { ...charA.callingSystem, affection_61_80: e.target.value }})} placeholder="예: 너" />
            </div>
            <div className="form-group">
              <label>81-100점 (애정/신뢰)</label>
              <input type="text" value={charA.callingSystem?.affection_81_100 || ''} onChange={(e) => setCharA({ ...charA, callingSystem: { ...charA.callingSystem, affection_81_100: e.target.value }})} placeholder="예: 내 거, 자기" />
            </div>
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

          {/* ⭐ 태그 개선: 커스텀 태그 표시 + 개수 표시 */}
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
            
            {/* 커스텀 태그 표시 */}
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

          {/* ⭐ 공개 설정 토글 개선 */}
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

        {/* 캐릭터 B (수) - 동일한 구조 */}
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
            
            <button className="btn-add-image" onClick={handleAddProfileImageB}>
              ➕ 프로필 이미지 추가
            </button>
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
          </div>

          <h3 className="subsection-title">💕 호칭 시스템 (수 → 공)</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>0-20점</label>
              <input type="text" value={charB.callingSystem?.affection_0_20 || ''} onChange={(e) => setCharB({ ...charB, callingSystem: { ...charB.callingSystem, affection_0_20: e.target.value }})} />
            </div>
            <div className="form-group">
              <label>21-40점</label>
              <input type="text" value={charB.callingSystem?.affection_21_40 || ''} onChange={(e) => setCharB({ ...charB, callingSystem: { ...charB.callingSystem, affection_21_40: e.target.value }})} />
            </div>
            <div className="form-group">
              <label>41-60점</label>
              <input type="text" value={charB.callingSystem?.affection_41_60 || ''} onChange={(e) => setCharB({ ...charB, callingSystem: { ...charB.callingSystem, affection_41_60: e.target.value }})} />
            </div>
            <div className="form-group">
              <label>61-80점</label>
              <input type="text" value={charB.callingSystem?.affection_61_80 || ''} onChange={(e) => setCharB({ ...charB, callingSystem: { ...charB.callingSystem, affection_61_80: e.target.value }})} />
            </div>
            <div className="form-group">
              <label>81-100점</label>
              <input type="text" value={charB.callingSystem?.affection_81_100 || ''} onChange={(e) => setCharB({ ...charB, callingSystem: { ...charB.callingSystem, affection_81_100: e.target.value }})} />
            </div>
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
          <div className="form-grid">
            <div className="form-group">
              <label>두 사람의 관계</label>
              <input type="text" value={scenario.relationship} onChange={(e) => setScenario({ ...scenario, relationship: e.target.value })} />
            </div>
            <div className="form-group">
              <label>시작 시간</label>
              <input type="text" value={scenario.time} onChange={(e) => setScenario({ ...scenario, time: e.target.value })} />
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

        {/* 저장 버튼 */}
        <div className="admin-actions">
          <button className="btn-save-primary" onClick={handleSaveConfig}>
            💾 저장 (임시 저장)
          </button>
          
          {currentStoryId && (
            savedStories.find(s => s.id === currentStoryId)?.published ? (
              <button className="btn-unpublish" onClick={handleUnpublishStory}>
                📴 발행 취소
              </button>
            ) : (
              <button className="btn-publish" onClick={handlePublishStory}>
                🚀 발행하기 (메인 공개)
              </button>
            )
          )}
          
          <button className="btn-download" onClick={handleDownloadConfig}>
            📥 백업 파일 다운로드
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;