import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import './StoryFlow.css';

function StoryFlow() {
  const { storyId } = useParams();
  const [activeTab, setActiveTab] = useState('A');
  const [story, setStory] = useState(null);

  React.useEffect(() => {
    loadStory();
  }, [storyId]);

  const loadStory = () => {
    const stories = JSON.parse(localStorage.getItem('kind_cat_stories') || '[]');
    const foundStory = stories.find(s => s.id === storyId);
    if (foundStory) {
      setStory(foundStory);
    }
  };

  if (!story) {
    return (
      <div className="story-flow">
        <div className="loading">스토리를 불러오는 중...</div>
      </div>
    );
  }

  const currentChar = activeTab === 'A' ? story.characterA : story.characterB;

  return (
    <div className="story-flow">
      {/* 헤더 */}
      <div className="story-header">
        <div className="header-logo">
          <img 
            src={`${process.env.PUBLIC_URL}/cat-icon.png`}
            alt="CAT" 
            className="header-cat-icon"
          />
          <h1>{story.title || story.storyTitle}</h1>
        </div>
      </div>

      {/* 스토리 설명 */}
      <div className="story-description">
        <p>{story.description}</p>
        
        {/* 작품 태그 */}
        {story.storyTags && (
          <div className="story-tags-display">
            {story.storyTags.genre?.map((tag, i) => (
              <span key={i} className="tag genre-tag">{tag}</span>
            ))}
            {story.storyTags.mood?.map((tag, i) => (
              <span key={i} className="tag mood-tag">{tag}</span>
            ))}
            {story.storyTags.situation?.map((tag, i) => (
              <span key={i} className="tag situation-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* 캐릭터 탭 */}
      <div className="character-tabs">
        <button
          className={`tab ${activeTab === 'A' ? 'active' : ''}`}
          onClick={() => setActiveTab('A')}
        >
          💕 {story.characterA?.name || '강주혁'} (공)
        </button>
        <button
          className={`tab ${activeTab === 'B' ? 'active' : ''}`}
          onClick={() => setActiveTab('B')}
        >
          ❤️ {story.characterB?.name || '윤태이'} (수)
        </button>
      </div>

      {/* 캐릭터 프로필 카드 */}
      <div className="character-profile-card">
        {/* 프로필 이미지 */}
        {currentChar?.profileImages && currentChar.profileImages.length > 0 && (
          <div className="profile-images-gallery">
            {currentChar.profileImages.map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                alt={`${currentChar.name} ${idx + 1}`}
                className="profile-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ))}
          </div>
        )}

        {/* 기본 정보 (항상 표시) */}
        {currentChar?.visibility?.basicInfo !== false && (
          <div className="character-info-section">
            <h3>📋 기본 정보</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">이름</span>
                <span className="value">{currentChar.name}</span>
              </div>
              <div className="info-item">
                <span className="label">나이</span>
                <span className="value">{currentChar.age}세</span>
              </div>
              <div className="info-item">
                <span className="label">직업</span>
                <span className="value">{currentChar.occupation}</span>
              </div>
              <div className="info-item full-width">
                <span className="label">성격</span>
                <span className="value">{currentChar.personality}</span>
              </div>
              {currentChar.bodyDetails && (
                <>
                  <div className="info-item">
                    <span className="label">키</span>
                    <span className="value">{currentChar.bodyDetails.height}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">체형</span>
                    <span className="value">{currentChar.bodyDetails.build}</span>
                  </div>
                </>
              )}
              <div className="info-item full-width">
                <span className="label">외모</span>
                <span className="value">{currentChar.appearance}</span>
              </div>
              <div className="info-item full-width">
                <span className="label">말투</span>
                <span className="value">{currentChar.speech}</span>
              </div>
            </div>
          </div>
        )}

        {/* 태그 (공개 설정에 따라) */}
        {currentChar?.visibility?.tags !== false && currentChar?.tags && (
          <div className="character-info-section">
            <h3>🏷️ 태그</h3>
            <div className="character-tags">
              {currentChar.tags.map((tag, idx) => (
                <span key={idx} className="character-tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* 성적 디테일 (공개 설정에 따라) */}
        {currentChar?.visibility?.sexualDetails && currentChar?.sexualDetails && (
          <div className="character-info-section nsfw">
            <h3>🔞 성적 디테일</h3>
            <div className="info-grid">
              {currentChar.sexualDetails.hole && (
                <div className="info-item full-width">
                  <span className="label">구멍 특징</span>
                  <span className="value">{currentChar.sexualDetails.hole}</span>
                </div>
              )}
              {currentChar.sexualDetails.genital && (
                <div className="info-item full-width">
                  <span className="label">성기 특징</span>
                  <span className="value">{currentChar.sexualDetails.genital}</span>
                </div>
              )}
              {currentChar.sexualDetails.reactions && (
                <div className="info-item full-width">
                  <span className="label">특수 반응</span>
                  <span className="value">{currentChar.sexualDetails.reactions}</span>
                </div>
              )}
              {currentChar.sexualDetails.body && (
                <div className="info-item full-width">
                  <span className="label">신체 특징</span>
                  <span className="value">{currentChar.sexualDetails.body}</span>
                </div>
              )}
              {currentChar.sexualDetails.scent && (
                <div className="info-item full-width">
                  <span className="label">체향</span>
                  <span className="value">{currentChar.sexualDetails.scent}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 선호/비선호 행동 (공개 설정에 따라) */}
        {currentChar?.visibility?.actions && (
          <>
            {currentChar?.preferredActions && currentChar.preferredActions.length > 0 && (
              <div className="character-info-section">
                <h3>✅ 선호 행동</h3>
                <ul className="action-list">
                  {currentChar.preferredActions.map((action, idx) => (
                    action && <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
            )}

            {currentChar?.avoidedActions && currentChar.avoidedActions.length > 0 && (
              <div className="character-info-section">
                <h3>❌ 비선호 행동</h3>
                <ul className="action-list">
                  {currentChar.avoidedActions.map((action, idx) => (
                    action && <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {/* 스토리 시작 버튼 */}
      <div className="story-start-section">
        <button className="btn-start-story">
          🎮 스토리 시작하기
        </button>
      </div>
    </div>
  );
}

export default StoryFlow;