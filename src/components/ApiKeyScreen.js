import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ApiKeyScreen.css';

function ApiKeyScreen() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [story, setStory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStory();
  }, [storyId]);

  useEffect(() => {
    // API 키가 이미 있으면 채팅으로 바로 이동
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey && story) {
      console.log('API key exists, redirecting to chat...');
      navigate(`/chat/${storyId}`);
    }
  }, [story, storyId, navigate]);

  const loadStory = () => {
    try {
      const stories = JSON.parse(localStorage.getItem('kind_cat_stories') || '[]');
      console.log('All stories:', stories);
      console.log('Looking for storyId:', storyId);
      
      const foundStory = stories.find(s => s.id === storyId);
      
      if (foundStory) {
        console.log('Story found:', foundStory);
        setStory(foundStory);
      } else {
        console.error('Story not found with id:', storyId);
        alert('스토리를 찾을 수 없습니다! 메인 화면으로 이동합니다.');
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading story:', error);
      alert('스토리 로딩 중 오류가 발생했습니다.');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      console.log('API key saved, navigating to chat...');
      navigate(`/chat/${storyId}`);
    } else {
      alert('API 키를 입력해주세요!');
    }
  };

  if (isLoading) {
    return (
      <div className="apikey-screen">
        <div className="loading">스토리를 불러오는 중...</div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="apikey-screen">
        <div className="loading">스토리를 찾을 수 없습니다...</div>
      </div>
    );
  }

  return (
    <div className="apikey-screen">
      <div className="apikey-header">
        <div className="logo-section" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
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

      <div className="story-preview">
        <h2>{story.title || story.storyTitle}</h2>
        <p>{story.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="apikey-form">
        <label htmlFor="apikey-input">🔑 Google AI Studio API Key</label>
        <input
          id="apikey-input"
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