import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPage.css';

function AdminPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stories, setStories] = useState([]);
  const [currentStory, setCurrentStory] = useState({
    id: Date.now().toString(),
    storyTitle: '',
    description: '',
    tags: [],
    thumbnailImage: '',
    characterA: { name: '', age: '', role: '공', occupation: '', personality: '', appearance: '', profileImage: '' },
    characterB: { name: '', age: '', role: '수', occupation: '', personality: '', appearance: '', profileImage: '' },
    backgroundImages: { 0: '', 20: '', 40: '', 60: '', 80: '' },
    keywordImages: [],
    isPublished: false
  });

  useEffect(() => {
    const savedStories = localStorage.getItem('kind_cat_stories');
    if (savedStories) {
      setStories(JSON.parse(savedStories));
    }
  }, []);

  const handleLogin = () => {
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
  };

  const saveStory = () => {
    const updated = stories.filter(s => s.id !== currentStory.id);
    const newStories = [...updated, currentStory];
    setStories(newStories);
    localStorage.setItem('kind_cat_stories', JSON.stringify(newStories));
    alert('저장되었습니다!');
  };

  const publishStory = (storyId) => {
    const updated = stories.map(s => 
      s.id === storyId ? { ...s, isPublished: !s.isPublished } : s
    );
    setStories(updated);
    localStorage.setItem('kind_cat_stories', JSON.stringify(updated));
  };

  const deleteStory = (storyId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      const filtered = stories.filter(s => s.id !== storyId);
      setStories(filtered);
      localStorage.setItem('kind_cat_stories', JSON.stringify(filtered));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-box">
          <h2>KIND CAT Admin</h2>
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={handleLogin}>로그인</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>KIND CAT Admin</h1>
        <button onClick={() => navigate('/')}>메인으로</button>
      </div>

      <div className="admin-content">
        <div className="story-editor">
          <h2>📚 스토리 편집</h2>
          
          <div className="form-group">
            <label>스토리 제목</label>
            <input
              value={currentStory.storyTitle}
              onChange={(e) => setCurrentStory({...currentStory, storyTitle: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>설명</label>
            <textarea
              value={currentStory.description}
              onChange={(e) => setCurrentStory({...currentStory, description: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>태그 (쉼표로 구분)</label>
            <input
              placeholder="#오피스, #19금, #병원"
              value={currentStory.tags.join(', ')}
              onChange={(e) => setCurrentStory({...currentStory, tags: e.target.value.split(',').map(t => t.trim())})}
            />
          </div>

          <div className="form-group">
            <label>썸네일 이미지 경로</label>
            <input
              placeholder="/images/stories/story-1/thumbnail.jpg"
              value={currentStory.thumbnailImage}
              onChange={(e) => setCurrentStory({...currentStory, thumbnailImage: e.target.value})}
            />
          </div>

          <h3>🔺 공 캐릭터</h3>
          <div className="form-group">
            <label>이름</label>
            <input
              value={currentStory.characterA.name}
              onChange={(e) => setCurrentStory({...currentStory, characterA: {...currentStory.characterA, name: e.target.value}})}
            />
          </div>
          <div className="form-group">
            <label>나이</label>
            <input
              value={currentStory.characterA.age}
              onChange={(e) => setCurrentStory({...currentStory, characterA: {...currentStory.characterA, age: e.target.value}})}
            />
          </div>
          <div className="form-group">
            <label>직업</label>
            <input
              value={currentStory.characterA.occupation}
              onChange={(e) => setCurrentStory({...currentStory, characterA: {...currentStory.characterA, occupation: e.target.value}})}
            />
          </div>
          <div className="form-group">
            <label>프로필 이미지 경로</label>
            <input
              placeholder="/images/stories/story-1/profile-a.jpg"
              value={currentStory.characterA.profileImage}
              onChange={(e) => setCurrentStory({...currentStory, characterA: {...currentStory.characterA, profileImage: e.target.value}})}
            />
          </div>

          <h3>🔻 수 캐릭터</h3>
          <div className="form-group">
            <label>이름</label>
            <input
              value={currentStory.characterB.name}
              onChange={(e) => setCurrentStory({...currentStory, characterB: {...currentStory.characterB, name: e.target.value}})}
            />
          </div>
          <div className="form-group">
            <label>나이</label>
            <input
              value={currentStory.characterB.age}
              onChange={(e) => setCurrentStory({...currentStory, characterB: {...currentStory.characterB, age: e.target.value}})}
            />
          </div>
          <div className="form-group">
            <label>직업</label>
            <input
              value={currentStory.characterB.occupation}
              onChange={(e) => setCurrentStory({...currentStory, characterB: {...currentStory.characterB, occupation: e.target.value}})}
            />
          </div>
          <div className="form-group">
            <label>프로필 이미지 경로</label>
            <input
              placeholder="/images/stories/story-1/profile-b.jpg"
              value={currentStory.characterB.profileImage}
              onChange={(e) => setCurrentStory({...currentStory, characterB: {...currentStory.characterB, profileImage: e.target.value}})}
            />
          </div>

          <button onClick={saveStory} className="save-btn">💾 저장</button>
        </div>

        <div className="story-list">
          <h2>📋 스토리 목록</h2>
          {stories.map(story => (
            <div key={story.id} className="story-item">
              <h3>{story.storyTitle}</h3>
              <div className="story-actions">
                <button onClick={() => setCurrentStory(story)}>편집</button>
                <button onClick={() => publishStory(story.id)}>
                  {story.isPublished ? '발행 취소' : '발행'}
                </button>
                <button onClick={() => deleteStory(story.id)}>삭제</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
