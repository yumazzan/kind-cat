import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './StoryDetail.css';

function StoryDetail() {
  const { storyId } = useParams();
  const navigate = useNavigate();

  // 스토리 로드
  const stories = JSON.parse(localStorage.getItem('kind_cat_stories') || '[]');
  const story = stories.find(s => s.id === storyId);

  if (!story) {
    return (
      <div className="story-detail-error">
        <h2>스토리를 찾을 수 없습니다</h2>
        <button onClick={() => navigate('/')}>돌아가기</button>
      </div>
    );
  }

  return (
    <div className="story-detail">
      <h1>{story.storyTitle}</h1>
      <p>{story.description}</p>
    </div>
  );
}

export default StoryDetail;
