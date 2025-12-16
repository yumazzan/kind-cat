import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ApiKeyScreen from './ApiKeyScreen';
import ChatInterface from './ChatInterface';

function StoryFlow() {
  const { storyId } = useParams();
  const [apiKey, setApiKey] = useState('');
  const [story, setStory] = useState(null);

  useEffect(() => {
    const savedStories = localStorage.getItem('kind_cat_stories');
    if (savedStories) {
      const stories = JSON.parse(savedStories);
      const found = stories.find(s => s.id === storyId);
      setStory(found);
    }
  }, [storyId]);

  if (!story) {
    return <div style={{color: 'white', padding: '50px', textAlign: 'center'}}>스토리를 찾을 수 없습니다.</div>;
  }

  if (!apiKey) {
    return <ApiKeyScreen onSubmit={setApiKey} story={story} />;
  }

  return <ChatInterface apiKey={apiKey} story={story} />;
}

export default StoryFlow;
