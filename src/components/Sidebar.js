import React from 'react';
import './Sidebar.css';

function Sidebar({ storyConfig, affectionScore, excitementLevel, turnCount, unlockedImages }) {
  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <div className="section-title">Characters</div>
        <div className="character-card">
          <h3>🔺 {storyConfig.characterA.name}</h3>
          <p>{storyConfig.characterA.age}세</p>
          <p>{storyConfig.characterA.occupation}</p>
        </div>
        <div className="character-card character-b">
          <h3>🔻 {storyConfig.characterB.name}</h3>
          <p>{storyConfig.characterB.age}세</p>
          <p>{storyConfig.characterB.occupation}</p>
        </div>
      </div>
      
      <div className="sidebar-section">
        <div className="section-title">Status</div>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">진행 턴</div>
            <div className="stat-value">{turnCount}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">흥분도</div>
            <div className="stat-value">{excitementLevel}%</div>
          </div>
        </div>
        <div className="affection-meter">
          <div className="stat-label">호감도</div>
          <div className="affection-bar">
            <div className="affection-fill" style={{width: `${Math.max(affectionScore, 10)}%`}}>
              {affectionScore}/100
            </div>
          </div>
        </div>
      </div>
      
      <div className="sidebar-section">
        <div className="section-title">Gallery</div>
        <div className="gallery-grid">
          {storyConfig.images.map(img => {
            const isUnlocked = unlockedImages.includes(img.id);
            return (
              <div key={img.id} className={`image-slot ${isUnlocked ? 'unlocked' : 'locked'}`}>
                {isUnlocked && img.url ? (
                  <img src={img.url} alt={img.name} />
                ) : (
                  <>
                    <div className="lock-icon">🔒</div>
                    <div className="unlock-text">{img.threshold}점</div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
