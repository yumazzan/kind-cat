import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import './StoryFlow.css';

function StoryFlow() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [activeTab, setActiveTab] = useState('gong');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStory();
  }, [storyId]);

  const loadStory = async () => {
    console.log('🔍 Loading story with ID:', storyId, 'Type:', typeof storyId);
    
    try {
      // 1. 먼저 Firebase에서 찾기
      console.log('🔥 Checking Firebase...');
      const docRef = doc(db, 'stories', String(storyId));
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const firebaseStory = { id: docSnap.id, ...docSnap.data() };
        console.log('✅ Story found in Firebase:', firebaseStory);
        setStory(firebaseStory);
        setIsLoading(false);
        return;
      }
      
      console.log('⚠️ Not found in Firebase, checking localStorage...');
      
      // 2. Firebase에 없으면 localStorage에서 찾기
      const stories = JSON.parse(localStorage.getItem('kind_cat_stories') || '[]');
      console.log('📚 Local stories:', stories);
      
      const foundStory = stories.find(s => String(s.id) === String(storyId));
      
      if (foundStory) {
        console.log('✅ Story found in localStorage:', foundStory);
        setStory(foundStory);
        setIsLoading(false);
      } else {
        console.error('❌ Story not found anywhere with id:', storyId);
        
        // 디버깅: 사용 가능한 모든 스토리 ID 출력
        try {
          const allStoriesRef = collection(db, 'stories');
          const allStoriesSnap = await getDocs(allStoriesRef);
          console.log('📋 Available Firebase stories:', allStoriesSnap.docs.map(d => d.id));
        } catch (e) {
          console.log('Could not fetch Firebase stories list');
        }
        console.log('📋 Available localStorage IDs:', stories.map(s => s.id));
        
        setTimeout(() => {
          setIsLoading(false);
          alert('스토리를 찾을 수 없습니다!');
          navigate('/');
        }, 500);
      }
    } catch (error) {
      console.error('❌ Error loading story:', error);
      
      // Firebase 오류 시 localStorage만 확인
      try {
        const stories = JSON.parse(localStorage.getItem('kind_cat_stories') || '[]');
        const foundStory = stories.find(s => String(s.id) === String(storyId));
        
        if (foundStory) {
          console.log('✅ Fallback: Story found in localStorage:', foundStory);
          setStory(foundStory);
          setIsLoading(false);
          return;
        }
      } catch (localError) {
        console.error('LocalStorage error:', localError);
      }
      
      setIsLoading(false);
      alert('스토리 로딩 중 오류가 발생했습니다.');
      navigate('/');
    }
  };

  const handleStartStory = () => {
    const apiKey = localStorage.getItem('gemini_api_key');
    
    if (!apiKey) {
      navigate(`/apikey/${storyId}`);
    } else {
      navigate(`/chat/${storyId}`);
    }
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="story-flow">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>스토리를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 스토리 없음
  if (!story) {
    return (
      <div className="story-flow">
        <div className="error-container">
          <h2>⚠️ 스토리를 찾을 수 없습니다</h2>
          <p>스토리 ID: {storyId}</p>
          <button className="btn-back" onClick={() => navigate('/')}>
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const currentChar = activeTab === 'gong' ? story.characterA : story.characterB;
  const currentVisibility = currentChar?.visibility || {};

  return (
    <div className="story-flow">
      {/* 헤더 */}
      <div className="story-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          ← 홈
        </button>
        
        <div className="header-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img 
            src={`${process.env.PUBLIC_URL}/cat-icon.png`}
            alt="CAT" 
            className="header-cat-icon"
            onError={(e) => e.target.style.display = 'none'}
          />
          <img 
            src={`${process.env.PUBLIC_URL}/kindcat-typo.png`}
            alt="KIND CAT" 
            className="header-kindcat-typo"
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>

        <div className="header-spacer" />
      </div>

      {/* 썸네일 */}
      {story.thumbnail && (
        <div className="story-thumbnail-section">
          <img 
            src={`${process.env.PUBLIC_URL}${story.thumbnail}`}
            alt={story.title || story.storyTitle}
            className="story-detail-thumbnail"
            onError={(e) => {
              console.error('Thumbnail failed to load:', story.thumbnail);
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* 스토리 정보 */}
      <div className="story-info-section">
        <h1>{story.title || story.storyTitle}</h1>
        <p className="story-description">{story.description}</p>
        
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
          className={`tab ${activeTab === 'gong' ? 'active' : ''}`}
          onClick={() => setActiveTab('gong')}
        >
          💪 공(攻) - {story.characterA?.name}
        </button>
        <button 
          className={`tab ${activeTab === 'su' ? 'active' : ''}`}
          onClick={() => setActiveTab('su')}
        >
          💕 수(受) - {story.characterB?.name}
        </button>
      </div>

      {/* 캐릭터 정보 */}
      <div className="character-detail">
        {/* 프로필 이미지 갤러리 */}
        {currentChar?.profileImages && currentChar.profileImages.length > 0 && (
          <div className="profile-images-gallery">
            {currentChar.profileImages.map((img, idx) => (
              <img 
                key={idx} 
                src={`${process.env.PUBLIC_URL}${img}`}
                alt={`${currentChar.name} ${idx + 1}`}
                className="profile-image"
                onError={(e) => {
                  console.error('Profile image failed to load:', img);
                  e.target.style.display = 'none';
                }}
              />
            ))}
          </div>
        )}

        {/* 기본 정보 */}
        {currentVisibility.basicInfo !== false && (
          <div className="info-section">
            <h3>📋 기본 정보</h3>
            <div className="info-grid">
              <div className="info-item">
                <strong>이름:</strong> {currentChar.name}
              </div>
              {currentChar.age && (
                <div className="info-item">
                  <strong>나이:</strong> {currentChar.age}
                </div>
              )}
              {currentChar.occupation && (
                <div className="info-item">
                  <strong>직업:</strong> {currentChar.occupation}
                </div>
              )}
              {currentChar.personality && (
                <div className="info-item">
                  <strong>성격:</strong> {currentChar.personality}
                </div>
              )}
              {currentChar.appearance && (
                <div className="info-item full-width">
                  <strong>외모:</strong> {currentChar.appearance}
                </div>
              )}
              {currentChar.bodyDetails?.height && (
                <div className="info-item">
                  <strong>키:</strong> {currentChar.bodyDetails.height}
                </div>
              )}
              {currentChar.bodyDetails?.build && (
                <div className="info-item">
                  <strong>체형:</strong> {currentChar.bodyDetails.build}
                </div>
              )}
              {currentChar.speech && (
                <div className="info-item full-width">
                  <strong>말투:</strong> {currentChar.speech}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 태그 */}
        {currentVisibility.tags !== false && currentChar.tags && currentChar.tags.length > 0 && (
          <div className="info-section">
            <h3>🏷️ 태그</h3>
            <div className="character-tags">
              {currentChar.tags.map((tag, idx) => (
                <span key={idx} className="character-tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* 성적 디테일 */}
        {currentVisibility.sexualDetails === true && currentChar.sexualDetails && (
          <div className="info-section sensitive-section">
            <h3>🔞 성적 디테일 (19+)</h3>
            <div className="info-grid">
              {activeTab === 'gong' ? (
                <>
                  {currentChar.sexualDetails.genital && (
                    <div className="info-item full-width">
                      <strong>성기:</strong> {currentChar.sexualDetails.genital}
                    </div>
                  )}
                  {currentChar.sexualDetails.body && (
                    <div className="info-item full-width">
                      <strong>신체:</strong> {currentChar.sexualDetails.body}
                    </div>
                  )}
                  {currentChar.sexualDetails.scent && (
                    <div className="info-item">
                      <strong>체향:</strong> {currentChar.sexualDetails.scent}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {currentChar.sexualDetails.hole && (
                    <div className="info-item full-width">
                      <strong>구멍:</strong> {currentChar.sexualDetails.hole}
                    </div>
                  )}
                  {currentChar.sexualDetails.reactions && (
                    <div className="info-item full-width">
                      <strong>반응:</strong> {currentChar.sexualDetails.reactions}
                    </div>
                  )}
                  {currentChar.sexualDetails.nipple && (
                    <div className="info-item">
                      <strong>유두:</strong> {currentChar.sexualDetails.nipple}
                    </div>
                  )}
                  {currentChar.sexualDetails.genital && (
                    <div className="info-item">
                      <strong>성기:</strong> {currentChar.sexualDetails.genital}
                    </div>
                  )}
                  {currentChar.sexualDetails.scent && (
                    <div className="info-item">
                      <strong>체향:</strong> {currentChar.sexualDetails.scent}
                    </div>
                  )}
                </>
              )}
              {currentChar.sexualDetails.special && (
                <div className="info-item full-width">
                  <strong>특수:</strong> {currentChar.sexualDetails.special}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 선호/비선호 행동 */}
        {currentVisibility.actions === true && (
          <>
            {currentChar.preferredActions && currentChar.preferredActions.length > 0 && (
              <div className="info-section">
                <h3>✅ 선호 행동</h3>
                <ul className="action-list">
                  {currentChar.preferredActions.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
            )}

            {currentChar.avoidedActions && currentChar.avoidedActions.length > 0 && (
              <div className="info-section">
                <h3>❌ 비선호 행동</h3>
                <ul className="action-list">
                  {currentChar.avoidedActions.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {/* 시작 버튼 */}
      <div className="start-button-container">
        <button className="btn-start-story" onClick={handleStartStory}>
          🎭 스토리 시작하기
        </button>
      </div>
    </div>
  );
}

export default StoryFlow;