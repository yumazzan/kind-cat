import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiKeyScreen from './ApiKeyScreen';
import StoryScreen from './StoryScreen';

function StoryFlow() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [started, setStarted] = useState(false);

  // 스토리 로드
  useEffect(() => {
    const stories = JSON.parse(localStorage.getItem('kind_cat_stories') || '[]');
    const foundStory = stories.find(s => s.id === storyId);
    
    if (!foundStory) {
      alert('스토리를 찾을 수 없습니다!');
      navigate('/');
      return;
    }

    if (!foundStory.published) {
      alert('이 스토리는 아직 발행되지 않았습니다!');
      navigate('/');
      return;
    }

    setStory(foundStory);
  }, [storyId, navigate]);

  const handleStart = (key) => {
    setApiKey(key);
    setStarted(true);
  };

  // 로딩 중
  if (!story) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#1A1A1A', 
        color: '#FFF', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '1.2em'
      }}>
        스토리를 불러오는 중...
      </div>
    );
  }

  // API 키 입력 화면
  if (!started) {
    return <ApiKeyScreen story={story} onStart={handleStart} />;
  }

  // 채팅 화면
  return <StoryScreen story={story} apiKey={apiKey} />;
}

export default StoryFlow;