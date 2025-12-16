import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ApiKeyScreen.css';

function ApiKeyScreen({ story, onStart }) {
  const [apiKey, setApiKey] = useState('');
  const [activeCharacter, setActiveCharacter] = useState('A'); // A 또는 B

  // story가 없으면 로딩 표시
  if (!story) {
    return (
      <div className="api-screen">
        <div className="api-container">
          <div className="loading-text">스토리를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  const handleStart = () => {
    if (!apiKey.trim()) {
      alert("API 키를 입력해주세요!");
      return;
    }
    onStart(apiKey);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleStart();
    }
  };

  // 모든 태그 합치기
  const allTags = story.storyTags ? 
    [...(story.storyTags.genre || []), ...(story.storyTags.mood || []), ...(story.storyTags.situation || [])] 
    : [];

  // 현재 활성 캐릭터
  const currentChar = activeCharacter === 'A' ? story.characterA : story.characterB;
  const currentRole = activeCharacter === 'A' ? '공' : '수';
  const currentIcon = activeCharacter === 'A' ? '🔺' : '🔻';

  return (
    <div className="story-detail-screen">
      {/* 상단 고정 헤더 */}
      <div className="fixed-header">
        <Link to="/" className="back-button">← 뒤로</Link>
        <div className="header-logo">
          <img src="/cat-icon.png" alt="KIND CAT" className="app-icon-small" />
          <img src="/kindcat-typo.png" alt="KIND CAT" className="app-typo-small" />
        </div>
      </div>

      {/* 스크롤 가능한 컨텐츠 */}
      <div className="story-detail-content">
        {/* 메인 썸네일 */}
        <div className="story-main-thumbnail">
          {story.thumbnail ? (
            <img src={story.thumbnail} alt={story.storyTitle} />
          ) : (
            <div className="thumbnail-placeholder-main">
              <span className="placeholder-icon-main">📖</span>
            </div>
          )}
          <div className="thumbnail-overlay">
            <h1 className="story-overlay-title">{story.storyTitle}</h1>
          </div>
        </div>

        {/* 스토리 설명 */}
        <div className="story-intro-section">
          <p className="story-description">{story.description}</p>
          {allTags.length > 0 && (
            <div className="story-tags">
              {allTags.map((tag, idx) => (
                <span key={idx} className="story-tag">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* 캐릭터 프로필 슬라이더 */}
        <div className="character-slider-section">
          <h2 className="section-title">등장인물</h2>
          
          {/* 캐릭터 선택 버튼 */}
          <div className="character-tabs">
            <button 
              className={`character-tab ${activeCharacter === 'A' ? 'active top' : ''}`}
              onClick={() => setActiveCharacter('A')}
            >
              <span className="tab-icon">❤️</span>
              <span className="tab-name">{story.characterA.name}</span>
              <span className="tab-role top-role">공</span>
            </button>
            <button 
              className={`character-tab ${activeCharacter === 'B' ? 'active bottom' : ''}`}
              onClick={() => setActiveCharacter('B')}
            >
              <span className="tab-icon">❤️</span>
              <span className="tab-name">{story.characterB.name}</span>
              <span className="tab-role bottom-role">수</span>
            </button>
          </div>

          {/* 캐릭터 프로필 카드 */}
          <div className="character-profile-card">
            {/* 프로필 사진 */}
            <div className="character-avatar-container">
              <div className="character-avatar">
                {currentChar.avatarPreview ? (
                  <img src={currentChar.avatarPreview} alt={currentChar.name} />
                ) : (
                  <div className="avatar-placeholder">
                    <span className="avatar-icon">{currentIcon}</span>
                  </div>
                )}
              </div>
              {/* 이름을 프로필 사진 아래에 표시 */}
              <h3 className="character-name-under-avatar">{currentChar.name}</h3>
              <div className="character-badges-under-avatar">
                <span className="character-age-badge">{currentChar.age}세</span>
                <span className={`character-role-badge ${activeCharacter === 'A' ? 'top' : 'bottom'}`}>
                  {currentRole}
                </span>
              </div>
            </div>

            {/* 캐릭터 정보 */}
            <div className="character-info-detail">

              <p className="character-occupation">{currentChar.occupation}</p>
              <p className="character-personality">
                <strong>성격:</strong> {currentChar.personality}
              </p>

              {currentChar.appearance && (
                <p className="character-appearance">
                  <strong>외모:</strong> {currentChar.appearance}
                </p>
              )}

              {currentChar.bodyDetails && (
                <div className="character-body">
                  <strong>체형:</strong> {currentChar.bodyDetails.height} / {currentChar.bodyDetails.build}
                </div>
              )}

              {currentChar.tags && currentChar.tags.length > 0 && (
                <div className="character-tags-detail">
                  {currentChar.tags.map((tag, idx) => (
                    <span key={idx} className="char-tag-detail">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 시나리오 시작 상황 */}
        <div className="scenario-section">
          <h2 className="section-title">스토리 시작</h2>
          <div className="scenario-box">
            <div className="scenario-meta">
              <span className="scenario-item">📍 {story.scenario.location}</span>
              <span className="scenario-item">⏰ {story.scenario.time}</span>
              <span className="scenario-item">💑 {story.scenario.relationship}</span>
            </div>
            <div className="scenario-situation">
              <p className="situation-text">{story.scenario.situation}</p>
            </div>
          </div>
        </div>

        {/* API 키 입력 */}
        <div className="api-input-section">
          <h2 className="section-title">스토리 시작하기</h2>
          <input
            type="password"
            className="api-input-field"
            placeholder="Gemini API 키 입력 (AIza...)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="btn-start-story" onClick={handleStart}>
            💌 스토리 시작하기
          </button>
          <div className="api-help">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              🔑 API 키 발급받기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApiKeyScreen;