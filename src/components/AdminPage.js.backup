import React, { useState, useEffect } from 'react';
import './AdminPage.css';
import { STORY_CONFIG } from '../config/storyConfig';

function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  
  // ⭐ storyConfig.js의 데이터를 기본값으로 사용
  const [storyData, setStoryData] = useState(STORY_CONFIG);
  const [activeCharacter, setActiveCharacter] = useState('A');
  const [savedStories, setSavedStories] = useState([]);

  useEffect(() => {
    loadSavedStories();
  }, []);

  const loadSavedStories = () => {
    const stories = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('story_')) {
        const story = JSON.parse(localStorage.getItem(key));
        stories.push({ id: key, ...story });
      }
    }
    setSavedStories(stories);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin1234') {
      setIsLoggedIn(true);
    } else {
      alert('비밀번호가 올바르지 않습니다.');
    }
  };

  const handleInputChange = (field, value) => {
    setStoryData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCharacterChange = (character, field, value) => {
    setStoryData(prev => ({
      ...prev,
      [character]: {
        ...prev[character],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    const storyId = `story_${Date.now()}`;
    localStorage.setItem(storyId, JSON.stringify(storyData));
    alert('스토리가 저장되었습니다!');
    loadSavedStories();
  };

  const handlePublish = () => {
    const storyId = `story_${Date.now()}`;
    const publishedData = { ...storyData, published: true };
    localStorage.setItem(storyId, JSON.stringify(publishedData));
    alert('스토리가 발행되었습니다!');
    loadSavedStories();
  };

  const handleLoadStory = (storyId) => {
    const story = JSON.parse(localStorage.getItem(storyId));
    setStoryData(story);
    alert('스토리를 불러왔습니다!');
  };

  const handleDeleteStory = (storyId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      localStorage.removeItem(storyId);
      loadSavedStories();
      alert('스토리가 삭제되었습니다.');
    }
  };

  const handleReset = () => {
    if (window.confirm('정말 초기화하시겠습니까?')) {
      setStoryData(STORY_CONFIG);
      alert('스토리가 초기화되었습니다.');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-page">
        <div className="login-screen">
          <h2>🔐 관리자 로그인</h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">로그인</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1>🐱 KIND CAT 관리자</h1>
          <button className="logout-button" onClick={() => setIsLoggedIn(false)}>
            로그아웃
          </button>
        </div>

        <div className="admin-content">
          {/* 기본 정보 */}
          <div className="admin-section">
            <h2>📚 스토리 관리</h2>
            
            <div className="input-group">
              <label>현재 작업 중인 스토리</label>
              <input
                type="text"
                value={storyData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="스토리 제목"
              />
            </div>

            <div className="input-group">
              <label>스토리 설명</label>
              <textarea
                value={storyData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="스토리 설명 입력"
              />
            </div>

            {/* 썸네일 */}
            <div className="file-path-section">
              <h4>📸 스토리 썸네일 (메인 화면 노출)</h4>
              <input
                type="text"
                placeholder="/images/stories/story-1/thumbnail.jpg"
                value={storyData.thumbnail || ''}
                onChange={(e) => handleInputChange('thumbnail', e.target.value)}
              />
              <p>💡 권장 크기: 800x1000px (4:5 비율) | 메인 화면 카드에 표시됩니다</p>
            </div>

            {/* 배경 이미지 */}
            <div className="file-path-section">
              <h4>🎨 배경 이미지 (호감도별)</h4>
              <p>호감도 점수에 따라 다른 배경 이미지가 표시됩니다. 채팅 화면 배경으로 사용됩니다.</p>
              
              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'block', color: '#ddd', marginBottom: '8px' }}>
                  0-20점 (낯선 호감도)
                </label>
                <input
                  type="text"
                  placeholder="/images/stories/story-1/bg-0.jpg"
                  value={storyData.images?.[0]?.path || ''}
                  onChange={(e) => {
                    const newImages = [...(storyData.images || [])];
                    if (!newImages[0]) newImages[0] = {};
                    newImages[0] = { ...newImages[0], threshold: 0, path: e.target.value };
                    handleInputChange('images', newImages);
                  }}
                />
              </div>

              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'block', color: '#ddd', marginBottom: '8px' }}>
                  21-40점 (친밀해짐)
                </label>
                <input
                  type="text"
                  placeholder="/images/stories/story-1/bg-20.jpg"
                  value={storyData.images?.[1]?.path || ''}
                  onChange={(e) => {
                    const newImages = [...(storyData.images || [])];
                    if (!newImages[1]) newImages[1] = {};
                    newImages[1] = { ...newImages[1], threshold: 20, path: e.target.value };
                    handleInputChange('images', newImages);
                  }}
                />
              </div>

              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'block', color: '#ddd', marginBottom: '8px' }}>
                  41-60점 (중간 호감도)
                </label>
                <input
                  type="text"
                  placeholder="/images/stories/story-1/bg-40.jpg"
                  value={storyData.images?.[2]?.path || ''}
                  onChange={(e) => {
                    const newImages = [...(storyData.images || [])];
                    if (!newImages[2]) newImages[2] = {};
                    newImages[2] = { ...newImages[2], threshold: 40, path: e.target.value };
                    handleInputChange('images', newImages);
                  }}
                />
              </div>

              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'block', color: '#ddd', marginBottom: '8px' }}>
                  61-80점 (깊어지는 관계)
                </label>
                <input
                  type="text"
                  placeholder="/images/stories/story-1/bg-60.jpg"
                  value={storyData.images?.[3]?.path || ''}
                  onChange={(e) => {
                    const newImages = [...(storyData.images || [])];
                    if (!newImages[3]) newImages[3] = {};
                    newImages[3] = { ...newImages[3], threshold: 60, path: e.target.value };
                    handleInputChange('images', newImages);
                  }}
                />
              </div>

              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'block', color: '#ddd', marginBottom: '8px' }}>
                  81-100점 (최고 호감도)
                </label>
                <input
                  type="text"
                  placeholder="/images/stories/story-1/bg-80.jpg"
                  value={storyData.images?.[4]?.path || ''}
                  onChange={(e) => {
                    const newImages = [...(storyData.images || [])];
                    if (!newImages[4]) newImages[4] = {};
                    newImages[4] = { ...newImages[4], threshold: 80, path: e.target.value };
                    handleInputChange('images', newImages);
                  }}
                />
              </div>

              <p style={{ marginTop: '15px', fontSize: '12px', color: '#888' }}>
                💡 파일을 public/images/stories/ 폴더에 업로드하고 경로를 입력하세요<br/>
                ✅ 장점: 빠른 로딩, 무제한 용량, 브라우저 캐싱
              </p>
            </div>

            {/* 키워드 이미지 */}
            <div className="file-path-section">
              <h4>🖼️ 키워드 이미지</h4>
              <p>특정 키워드가 대화에 나타날 시 → 키스 장면 시 → 키스 전용 이미지 자동 전송됩니다.</p>
              <p>예: "키스" 입력 시 → 키스 전용 이미지 표시됩니다</p>
              
              <div style={{ marginTop: '15px' }}>
                <input
                  type="text"
                  placeholder="키워드: 키스, 포옹, 울음..."
                  style={{ marginBottom: '10px' }}
                />
                <input
                  type="text"
                  placeholder="/images/stories/story-1/keywords/kiss.jpg"
                />
              </div>
            </div>
          </div>

          {/* 캐릭터 정보 */}
          <div className="admin-section">
            <h2>👥 캐릭터 설정</h2>
            
            <div className="character-tabs">
              <button
                className={`tab-button ${activeCharacter === 'A' ? 'active' : ''}`}
                onClick={() => setActiveCharacter('A')}
              >
                공 ({storyData.characterA?.name || '강주혁'})
              </button>
              <button
                className={`tab-button ${activeCharacter === 'B' ? 'active' : ''}`}
                onClick={() => setActiveCharacter('B')}
              >
                수 ({storyData.characterB?.name || '윤태이'})
              </button>
            </div>

            {activeCharacter === 'A' && (
              <div>
                <div className="input-group">
                  <label>이름</label>
                  <input
                    type="text"
                    value={storyData.characterA?.name || ''}
                    onChange={(e) => handleCharacterChange('characterA', 'name', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>나이</label>
                  <input
                    type="text"
                    value={storyData.characterA?.age || ''}
                    onChange={(e) => handleCharacterChange('characterA', 'age', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>직업</label>
                  <input
                    type="text"
                    value={storyData.characterA?.occupation || ''}
                    onChange={(e) => handleCharacterChange('characterA', 'occupation', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>성격</label>
                  <textarea
                    value={storyData.characterA?.personality || ''}
                    onChange={(e) => handleCharacterChange('characterA', 'personality', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>외모</label>
                  <textarea
                    value={storyData.characterA?.appearance || ''}
                    onChange={(e) => handleCharacterChange('characterA', 'appearance', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>말투</label>
                  <textarea
                    value={storyData.characterA?.speech || ''}
                    onChange={(e) => handleCharacterChange('characterA', 'speech', e.target.value)}
                  />
                </div>

                <div className="file-path-section">
                  <h4>📷 프로필 사진</h4>
                  <input
                    type="text"
                    placeholder="/images/stories/story-1/profile-a.jpg"
                    value={storyData.characterA?.avatar || ''}
                    onChange={(e) => handleCharacterChange('characterA', 'avatar', e.target.value)}
                  />
                </div>
              </div>
            )}

            {activeCharacter === 'B' && (
              <div>
                <div className="input-group">
                  <label>이름</label>
                  <input
                    type="text"
                    value={storyData.characterB?.name || ''}
                    onChange={(e) => handleCharacterChange('characterB', 'name', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>나이</label>
                  <input
                    type="text"
                    value={storyData.characterB?.age || ''}
                    onChange={(e) => handleCharacterChange('characterB', 'age', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>직업</label>
                  <input
                    type="text"
                    value={storyData.characterB?.occupation || ''}
                    onChange={(e) => handleCharacterChange('characterB', 'occupation', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>성격</label>
                  <textarea
                    value={storyData.characterB?.personality || ''}
                    onChange={(e) => handleCharacterChange('characterB', 'personality', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>외모</label>
                  <textarea
                    value={storyData.characterB?.appearance || ''}
                    onChange={(e) => handleCharacterChange('characterB', 'appearance', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>말투</label>
                  <textarea
                    value={storyData.characterB?.speech || ''}
                    onChange={(e) => handleCharacterChange('characterB', 'speech', e.target.value)}
                  />
                </div>

                <div className="file-path-section">
                  <h4>📷 프로필 사진</h4>
                  <input
                    type="text"
                    placeholder="/images/stories/story-1/profile-b.jpg"
                    value={storyData.characterB?.avatar || ''}
                    onChange={(e) => handleCharacterChange('characterB', 'avatar', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 저장/발행 버튼 */}
          <div className="btn-group">
            <button className="admin-btn btn-save" onClick={handleSave}>
              💾 저장
            </button>
            <button className="admin-btn btn-publish" onClick={handlePublish}>
              🚀 발행하기
            </button>
            <button className="admin-btn btn-reset" onClick={handleReset}>
              🔄 초기화
            </button>
          </div>

          {/* 저장된 스토리 목록 */}
          {savedStories.length > 0 && (
            <div className="admin-section">
              <h2>📚 저장된 스토리 목록</h2>
              <div className="story-list">
                {savedStories.map((story) => (
                  <div
                    key={story.id}
                    className={`story-card ${story.published ? 'published' : ''}`}
                  >
                    <h3>{story.title}</h3>
                    <p>{story.description?.substring(0, 100)}...</p>
                    <p style={{ fontSize: '12px', color: '#888' }}>
                      {story.published ? '✅ 발행됨' : '📝 비공개'}
                    </p>
                    <div className="story-card-actions">
                      <button
                        className="btn-load"
                        onClick={() => handleLoadStory(story.id)}
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
        </div>
      </div>
    </div>
  );
}

export default AdminPage;