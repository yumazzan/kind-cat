import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getApiKey } from '../utils/apiKey';
import './ApiKeyScreen.css';

function ApiKeyScreen() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [story, setStory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 스토리 로드 (Firebase + localStorage)
  const loadStory = useCallback(async () => {
    try {
      // 1. Firebase에서 먼저 찾기
      const docRef = doc(db, 'stories', String(storyId));
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setStory({ id: docSnap.id, ...docSnap.data() });
        setIsLoading(false);
        return;
      }
      
      // 2. localStorage에서 찾기
      const stories = JSON.parse(localStorage.getItem('kind_cat_stories') || '[]');
      const foundStory = stories.find(s => String(s.id) === String(storyId));
      
      if (foundStory) {
        setStory(foundStory);
        setIsLoading(false);
        return;
      }
      
      // 3. 못 찾음
      setIsLoading(false);
      alert('스토리를 찾을 수 없습니다! 메인 화면으로 이동합니다.');
      navigate('/');
      
    } catch (error) {
      console.error('Error loading story:', error);
      
      // Firebase 에러 시 localStorage fallback
      const stories = JSON.parse(localStorage.getItem('kind_cat_stories') || '[]');
      const foundStory = stories.find(s => String(s.id) === String(storyId));
      
      if (foundStory) {
        setStory(foundStory);
      } else {
        alert('스토리를 찾을 수 없습니다! 메인 화면으로 이동합니다.');
        navigate('/');
      }
      setIsLoading(false);
    }
  }, [storyId, navigate]);

  useEffect(() => {
    loadStory();

    // 이미 사용 가능한 키(직접 저장했거나, 운영자가 심어둔 기본 키)가 있으면
    // 이 화면을 거칠 필요 없이 바로 채팅으로 이동
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    } else if (getApiKey()) {
      navigate(`/chat/${storyId}`);
    }
  }, [loadStory, navigate, storyId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      alert('API 키를 입력해주세요!');
      return;
    }

    // API 키 저장
    localStorage.setItem('gemini_api_key', apiKey.trim());
    
    // 채팅 화면으로 이동
    navigate(`/chat/${storyId}`);
  };

  const handleSkip = () => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      navigate(`/chat/${storyId}`);
    } else {
      alert('저장된 API 키가 없습니다. API 키를 입력해주세요!');
    }
  };

  if (isLoading) {
    return (
      <div className="apikey-screen">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="apikey-screen">
      <div className="apikey-container">
        <div className="apikey-header">
          <img 
            src={`${process.env.PUBLIC_URL}/cat-icon.png`}
            alt="CAT" 
            className="cat-icon"
            onError={(e) => e.target.style.display = 'none'}
          />
          <h1>API 키 설정</h1>
          <p>Gemini API 키를 입력해주세요</p>
        </div>

        {story && (
          <div className="story-preview">
            <h3>📖 {story.title || story.storyTitle}</h3>
            <p>{story.description?.substring(0, 100)}...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="apikey-form">
          <div className="input-group">
            <label htmlFor="apiKey">Gemini API Key</label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              autoComplete="off"
            />
          </div>

          <div className="help-text">
            <p>🔑 API 키는 브라우저에 로컬 저장됩니다.</p>
            <p>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                👉 Gemini API 키 발급받기
              </a>
            </p>
          </div>

          <div className="button-group">
            <button type="submit" className="btn-primary">
              🎭 스토리 시작하기
            </button>
            
            {localStorage.getItem('gemini_api_key') && (
              <button type="button" className="btn-secondary" onClick={handleSkip}>
                저장된 키로 계속하기
              </button>
            )}
          </div>
        </form>

        <button className="btn-back" onClick={() => navigate(`/story/${storyId}`)}>
          ← 스토리로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default ApiKeyScreen;