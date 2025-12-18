import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ApiKeyScreen.css';

const navigate = useNavigate();

// 로고 섹션
<div className="logo-section" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
  <img src={`${process.env.PUBLIC_URL}/cat-icon.png`} alt="CAT" className="cat-icon" />
  <img src={`${process.env.PUBLIC_URL}/kindcat-typo.png`} alt="KIND CAT" className="kindcat-typo" />
</div>

function ApiKeyScreen() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [story, setStory] = useState(null);
  

  useEffect(() => {
    loadStory();
    
    // 이미 저장된 API 키가 있으면 자동으로 채팅으로 이동
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      navigate(`/chat/${storyId}`);
    }
  }, [storyId, navigate]);

  const loadStory = () => {
    const stories = JSON.parse(localStorage.getItem('kind_cat_stories') || '[]');
    const foundStory = stories.find(s => s.id === storyId);
    if (foundStory) {
      setStory(foundStory);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      navigate(`/chat/${storyId}`);
    } else {
      alert('API 키를 입력해주세요!');
    }
  };

  if (!story) {
    return <div className="loading">스토리를 불러오는 중...</div>;
  }

  return (
    <div className="apikey-screen">
      {/* 헤더 */}
      <div className="apikey-header">
        <div className="logo-section">
          <img 
            src={`${process.env.PUBLIC_URL}/cat-icon.png`}
            alt="CAT" 
            className="cat-icon"
            onError={(e) => e.target.style.display = 'none'}
          />
          <img 
            src={`${process.env.PUBLIC_URL}/kindcat-typo.png`}
            alt="KIND CAT" 
            className="kindcat-typo"
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>
      </div>

      {/* 스토리 정보 */}
      <div className="story-preview">
        <h2>{story.title || story.storyTitle}</h2>
        <p>{story.description}</p>
      </div>

      {/* API 키 입력 폼 */}
      <form onSubmit={handleSubmit} className="apikey-form">
        <label>🔑 Google AI Studio API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="API 키를 입력하세요"
          className="apikey-input"
          required
        />
        <button type="submit" className="btn-start">스토리 시작하기</button>
        <a 
          href="https://aistudio.google.com/app/apikey" 
          target="_blank" 
          rel="noopener noreferrer"
          className="api-link"
        >
          🔗 API 키 발급받기 (무료)
        </a>
      </form>

      <div className="api-info">
        <h3>💡 API 키가 필요한 이유</h3>
        <p>이 앱은 Google의 Gemini AI를 사용하여 대화형 스토리를 생성합니다.</p>
        <p>API 키는 브라우저에만 저장되며, 서버로 전송되지 않습니다.</p>
      </div>
    </div>
  );
}

export default ApiKeyScreen;
