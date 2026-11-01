import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { hasProgress, clearProgress } from '../systems';
import './StoryFlow.css';

function StoryFlow() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [activeCharTab, setActiveCharTab] = useState('gong'); // 'gong' or 'su'
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [basicInfoExpanded, setBasicInfoExpanded] = useState(false);
  const hasSavedProgress = hasProgress(storyId);

  // 이미지 경로 처리 함수
  const getImageSrc = useCallback((imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    
    const publicUrl = process.env.PUBLIC_URL || '';
    let cleanPath = imagePath;
    
    while (cleanPath.startsWith(publicUrl) && publicUrl) {
      cleanPath = cleanPath.substring(publicUrl.length);
    }
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    
    return `${publicUrl}${cleanPath}`;
  }, []);

  // 스토리 로드
  const loadStory = useCallback(async () => {
    try {
      const docRef = doc(db, 'stories', String(storyId));
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setStory({ id: docSnap.id, ...docSnap.data() });
        setIsLoading(false);
        return;
      }
      
      const stories = JSON.parse(localStorage.getItem('kind_cat_stories') || '[]');
      const foundStory = stories.find(s => String(s.id) === String(storyId));
      
      if (foundStory) {
        setStory(foundStory);
        setIsLoading(false);
      } else {
        alert('스토리를 찾을 수 없습니다!');
        navigate('/');
      }
    } catch (error) {
      console.error('Error:', error);
      const stories = JSON.parse(localStorage.getItem('kind_cat_stories') || '[]');
      const foundStory = stories.find(s => String(s.id) === String(storyId));
      if (foundStory) {
        setStory(foundStory);
        setIsLoading(false);
      } else {
        navigate('/');
      }
    }
  }, [storyId, navigate]);

  useEffect(() => {
    loadStory();
  }, [loadStory]);

  // 탭 변경 시 이미지 인덱스 & 기본 정보 펼침 상태 리셋
  useEffect(() => {
    setCurrentImageIndex(0);
    setBasicInfoExpanded(false);
  }, [activeCharTab]);

  const handleStartStory = () => {
    // 프록시(Cloudflare Worker)를 통해 항상 이용 가능하므로 API 키 입력 화면을
    // 거칠 필요 없이 바로 채팅으로 이동. 자기 키를 직접 쓰고 싶은 사용자는
    // /apikey/:storyId 화면에 직접 접속해서 등록하면 그 키가 우선 사용됨.
    navigate(`/chat/${storyId}`);
  };

  const handleStartOver = () => {
    clearProgress(storyId);
    handleStartStory();
  };

  // 이미지 네비게이션
  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextImage = (e, maxIndex) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => Math.min(maxIndex, prev + 1));
  };

  if (isLoading) {
    return (
      <div className="story-flow-ridi">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!story) return null;

  // 현재 선택된 캐릭터
  const currentChar = activeCharTab === 'gong' ? story.characterA : story.characterB;
  const currentImages = currentChar?.profileImages || [];
  const visibility = currentChar?.visibility || {};

  // 태그 수집 (중복 제거)
  const allTags = [...new Set([
    ...(story.storyTags?.genre || []),
    ...(story.storyTags?.mood || []),
    ...(story.storyTags?.situation || []),
    ...(story.storyTags?.subject || []),
    ...(story.storyTags?.relationship || []),
  ])];

  return (
    <div className="story-flow-ridi">
      {/* 히어로 섹션 */}
      <div className="hero-section">
        <div className="hero-image-wrapper">
          {story.thumbnail ? (
            <img 
              src={getImageSrc(story.thumbnail)} 
              alt={story.title} 
              className="hero-image"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="hero-placeholder" />
          )}
          <div className="hero-gradient" />
        </div>
        
        <div className="hero-nav">
          <button className="nav-back" onClick={() => navigate('/')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="nav-title">{story.title || story.storyTitle}</h1>
          <div className="nav-spacer" />
        </div>
        
        <div className="hero-info">
          <h2 className="hero-title">{story.title || story.storyTitle}</h2>
        </div>
      </div>

      {/* 태그 섹션 */}
      {allTags.length > 0 && (
        <div className="tags-section">
          <div className="tags-scroll">
            {allTags.map((tag, i) => (
              <span key={i} className="story-tag">#{tag.replace(/^#/, '')}</span>
            ))}
          </div>
        </div>
      )}

      {/* 초기상황 섹션 */}
      <div className="section">
        <h3 className="section-title">초기상황</h3>
        <div className={`description-content ${isDescExpanded ? 'expanded' : ''}`}>
          <p>{story.description}</p>
          {story.scenario?.situation && (
            <p className="situation-text">📍 {story.scenario.situation}</p>
          )}
          {story.scenario?.relationship && (
            <p className="relation-text">💕 관계: {story.scenario.relationship}</p>
          )}
        </div>
        {((story.description?.length || 0) + (story.scenario?.situation?.length || 0) + (story.scenario?.relationship?.length || 0)) > 100 && (
          <button 
            className="btn-more" 
            onClick={() => setIsDescExpanded(!isDescExpanded)}
          >
            {isDescExpanded ? '접기' : '더보기'} 
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              style={{ transform: isDescExpanded ? 'rotate(180deg)' : 'none' }}
            >
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* 캐릭터 섹션 */}
      <div className="section">
        <h3 className="section-title">캐릭터</h3>
        
        {/* 캐릭터 탭 버튼 */}
        <div className="char-tabs">
          <button 
            className={`char-tab ${activeCharTab === 'gong' ? 'active' : ''}`}
            onClick={() => setActiveCharTab('gong')}
          >
            <span className="tab-name">{story.characterA?.name}</span>
            {story.characterA?.tags?.[0] && (
              <span className="tab-tag">#{story.characterA.tags[0].replace(/^#/, '')}</span>
            )}
          </button>
          <button 
            className={`char-tab ${activeCharTab === 'su' ? 'active' : ''}`}
            onClick={() => setActiveCharTab('su')}
          >
            <span className="tab-name">{story.characterB?.name}</span>
            {story.characterB?.tags?.[0] && (
              <span className="tab-tag">#{story.characterB.tags[0].replace(/^#/, '')}</span>
            )}
          </button>
        </div>

        {/* 큰 캐릭터 카드 (1개) */}
        <div className="character-card-large">
          {/* 이미지 영역 */}
          <div className="card-image-area">
            {currentImages.length > 0 ? (
              <>
                {/* 이미지 인디케이터 */}
                {currentImages.length > 1 && (
                  <div className="card-indicators">
                    {currentImages.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`card-indicator ${idx === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(idx)}
                      />
                    ))}
                  </div>
                )}
                
                <img 
                  src={getImageSrc(currentImages[currentImageIndex])} 
                  alt={currentChar?.name}
                  className="card-image"
                  onError={(e) => { e.target.src = `${process.env.PUBLIC_URL}/cat-icon.png`; }}
                />
                
                {/* 좌우 네비게이션 */}
                {currentImages.length > 1 && (
                  <>
                    <div className="card-nav prev" onClick={handlePrevImage} />
                    <div className="card-nav next" onClick={(e) => handleNextImage(e, currentImages.length - 1)} />
                  </>
                )}
              </>
            ) : (
              <div className="card-no-image">📷</div>
            )}
            
            <div className="card-gradient" />
            
            {/* 역할 뱃지 */}
            <span className={`card-role-badge ${activeCharTab}`}>
              {activeCharTab === 'gong' ? '공' : '수'}
            </span>
            
            {/* 이름 오버레이 */}
            <div className="card-info-overlay">
              <div className="card-name-row">
                <h3 className="card-name">{currentChar?.name}</h3>
                {currentChar?.age && <span className="card-age">{currentChar.age}</span>}
              </div>
              <p className="card-meta">
                {currentChar?.occupation}
              </p>
            </div>
          </div>

          {/* 캐릭터 정보 */}
          <div className="card-content">
            {/* 태그 */}
            {visibility.tags !== false && currentChar?.tags?.length > 0 && (
              <div className="card-tags">
                {currentChar.tags.map((tag, i) => (
                  <span key={i} className="card-tag">#{tag.replace(/^#/, '')}</span>
                ))}
              </div>
            )}

            {/* 기본 정보 */}
            {visibility.basicInfo !== false && (
              <div className={`card-section ${basicInfoExpanded ? 'expanded' : ''}`}>
                {currentChar?.personality && (
                  <div className="info-field">
                    <div className="info-label">성격</div>
                    <p className="info-value">{currentChar.personality}</p>
                  </div>
                )}
                {currentChar?.appearance && (
                  <div className="info-field">
                    <div className="info-label">외모</div>
                    <p className="info-value">{currentChar.appearance}</p>
                  </div>
                )}
                {(currentChar?.bodyDetails?.height || currentChar?.bodyDetails?.build) && (
                  <div className="info-field">
                    <div className="info-label">체형</div>
                    <p className="info-value">
                      {[currentChar?.bodyDetails?.height, currentChar?.bodyDetails?.build].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                )}
                {currentChar?.speech && (
                  <div className="info-field">
                    <div className="info-label">말투</div>
                    <p className="info-value">{currentChar.speech}</p>
                  </div>
                )}
                <button
                  type="button"
                  className="btn-more"
                  onClick={() => setBasicInfoExpanded(v => !v)}
                >
                  {basicInfoExpanded ? '접기' : '더보기'}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ transform: basicInfoExpanded ? 'rotate(180deg)' : 'none' }}
                  >
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            )}

            {/* 성적 디테일 */}
            {visibility.sexualDetails === true && currentChar?.sexualDetails && (
              <div className="card-section sensitive">
                <h4>🔞 성적 디테일</h4>
                {activeCharTab === 'gong' ? (
                  <>
                    {currentChar.sexualDetails.genital && <p><strong>성기:</strong> {currentChar.sexualDetails.genital}</p>}
                    {currentChar.sexualDetails.body && <p><strong>신체:</strong> {currentChar.sexualDetails.body}</p>}
                  </>
                ) : (
                  <>
                    {currentChar.sexualDetails.hole && <p><strong>구멍:</strong> {currentChar.sexualDetails.hole}</p>}
                    {currentChar.sexualDetails.reactions && <p><strong>반응:</strong> {currentChar.sexualDetails.reactions}</p>}
                    {currentChar.sexualDetails.nipple && <p><strong>유두:</strong> {currentChar.sexualDetails.nipple}</p>}
                    {currentChar.sexualDetails.genital && <p><strong>성기:</strong> {currentChar.sexualDetails.genital}</p>}
                  </>
                )}
                {currentChar.sexualDetails.scent && <p><strong>체향:</strong> {currentChar.sexualDetails.scent}</p>}
                {currentChar.sexualDetails.special && <p><strong>특수:</strong> {currentChar.sexualDetails.special}</p>}
              </div>
            )}

            {/* 선호/비선호 행동 */}
            {visibility.actions === true && (
              <>
                {currentChar?.preferredActions?.length > 0 && (
                  <div className="card-section">
                    <h4>✅ 선호 행동</h4>
                    <ul>
                      {currentChar.preferredActions.map((action, i) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {currentChar?.avoidedActions?.length > 0 && (
                  <div className="card-section">
                    <h4>❌ 비선호 행동</h4>
                    <ul>
                      {currentChar.avoidedActions.map((action, i) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 시작 버튼 */}
      <div className="start-section">
        <button className="btn-start" onClick={handleStartStory}>
          {hasSavedProgress ? '📖 이어하기' : '🎭 스토리 시작하기'}
        </button>
        {hasSavedProgress && (
          <button className="btn-restart-link" onClick={handleStartOver}>
            처음부터 다시 시작
          </button>
        )}
      </div>
    </div>
  );
}

export default StoryFlow;