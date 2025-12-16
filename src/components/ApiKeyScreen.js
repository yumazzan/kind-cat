import React, { useState } from 'react';
import './ApiKeyScreen.css';

function ApiKeyScreen({ onSubmit, story }) {
  const [key, setKey] = useState('');
  const [activeTab, setActiveTab] = useState('A');

  const handleSubmit = () => {
    if (key.trim()) {
      onSubmit(key.trim());
    }
  };

  const character = activeTab === 'A' ? story.characterA : story.characterB;

  return (
    <div className="apikey-screen">
      <div className="apikey-container">
        <div className="logo-section">
          <img src="/cat-icon.png" alt="KIND CAT" className="logo-icon" />
          <h1>KIND CAT</h1>
          <p className="subtitle">BL Interactive Fiction</p>
        </div>

        <div className="story-preview">
          <h2>{story.storyTitle}</h2>
          <p>{story.description}</p>
        </div>

        <div className="character-tabs">
          <button 
            className={`tab ${activeTab === 'A' ? 'active' : ''}`}
            onClick={() => setActiveTab('A')}
          >
            ❤️ {story.characterA.name} (공)
          </button>
          <button 
            className={`tab ${activeTab === 'B' ? 'active' : ''}`}
            onClick={() => setActiveTab('B')}
          >
            ❤️ {story.characterB.name} (수)
          </button>
        </div>

        {character.profileImage && (
          <img src={character.profileImage} alt={character.name} className="character-profile" />
        )}

        <div className="character-info">
          <h3>{character.name}</h3>
          <p>{character.age}세 · {character.occupation}</p>
        </div>

        <input
          type="password"
          placeholder="Gemini API 키 (AIza...)"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="api-input"
        />

        <button onClick={handleSubmit} className="start-button">
          스토리 시작하기
        </button>

        <p className="api-help">
          🔑 API 키 발급:
          <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
            Google AI Studio
          </a>에서 무료 발급
          <br />
          (gemini-2.0-flash 모델 사용)
        </p>
      </div>
    </div>
  );
}

export default ApiKeyScreen;
