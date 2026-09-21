import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import './StoryLibrary.css';

const MAX_FILTER_TAGS = 8;

function StoryLibrary() {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 태그 필터 칩 - 하드코딩 대신 실제 발행된 작품들의 태그(장르/분위기/상황/소재/
  // 관계/성인)를 전부 집계해서 가장 많이 겹치는 순으로 자동 노출
  const tags = useMemo(() => {
    const counts = {};
    stories.forEach((story) => {
      const categories = story.storyTags || {};
      Object.values(categories).forEach((tagArray) => {
        (tagArray || []).forEach((tag) => {
          counts[tag] = (counts[tag] || 0) + 1;
        });
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_FILTER_TAGS)
      .map(([tag]) => tag);
  }, [stories]);

  // 히어로 배너에 노출할 스토리들 - 어드민에서 "홈 배너로 노출"을 켠 스토리들을
  // 전부 캐러셀로 보여줌(옆 슬라이드가 살짝 보이도록), 하나도 없으면 기존처럼
  // 표시 순서상 맨 위 스토리 하나로 대체
  const bannerStories = useMemo(() => {
    const marked = stories.filter((s) => s.isBanner);
    return marked.length > 0 ? marked : (stories[0] ? [stories[0]] : []);
  }, [stories]);

  // 실제 캐러셀에 렌더링할 슬라이드 목록 - 배너가 2개 이상이면 맨 앞에 "마지막 배너의
  // 복제본", 맨 뒤에 "첫 배너의 복제본"을 하나씩 덧붙임. 그러면 첫 배너가 정중앙에 있을 때
  // 왼쪽에 마지막 배너가(진짜처럼) 살짝 보이고, 마지막 배너가 정중앙일 때 오른쪽에 첫
  // 배너가 살짝 보임 - 실제로 순환하는 캐러셀처럼 보이게 하는 트릭
  const carouselSlides = useMemo(() => {
    if (bannerStories.length <= 1) {
      return bannerStories.map((story) => ({ story, key: story.id, isClone: false }));
    }
    const first = bannerStories[0];
    const last = bannerStories[bannerStories.length - 1];
    return [
      { story: last, key: `clone-lead-${last.id}`, isClone: true },
      ...bannerStories.map((story) => ({ story, key: story.id, isClone: false })),
      { story: first, key: `clone-trail-${first.id}`, isClone: true },
    ];
  }, [bannerStories]);

  // 캐러셀 가운데 강조 효과 - 스크롤 위치를 기준으로 각 배너가 중앙에서
  // 얼마나 떨어져 있는지 계산해서 실시간으로 크기/투명도를 부드럽게 조절
  const bannerTrackRef = useRef(null);
  const [bannerCardStyles, setBannerCardStyles] = useState({});
  const [bannerContentStyles, setBannerContentStyles] = useState({});

  const updateBannerFocus = useCallback(() => {
    const track = bannerTrackRef.current;
    if (!track) return;
    // offsetLeft/offsetWidth는 CSS transform(scale)의 영향을 받지 않는 "레이아웃상" 값이라
    // 이전에 적용된 scale 때문에 거리 계산이 틀어지는 문제가 없음. track.scrollLeft와
    // 같은 좌표계를 쓰기 위해 .hero-carousel-track 자체를 offsetParent로 고정해둠(CSS 참고)
    const scrollCenter = track.scrollLeft + track.clientWidth / 2;
    const cardStyles = {};
    const contentStyles = {};
    Array.from(track.children).forEach((child) => {
      const key = child.dataset.carouselKey;
      if (!key) return;
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const dist = Math.abs(childCenter - scrollCenter);
      const factor = Math.min(dist / (child.offsetWidth * 0.6), 1); // 0 = 정중앙, 1 = 완전히 옆으로 밀려남
      cardStyles[key] = {
        transform: `scale(${1 - factor * 0.15})`,
        opacity: 1 - factor * 0.22, // 옆 카드가 너무 흐려져서 안 보이지 않도록 최소 밝기를 넉넉히 남겨둠
      };
      contentStyles[key] = {
        opacity: Math.max(0, 1 - factor * 2.2),
      };
    });
    setBannerCardStyles(cardStyles);
    setBannerContentStyles(contentStyles);
  }, []);

  // 스크롤이 멈췄을 때 지금 정중앙에 있는 카드가 (맨 앞/맨 뒤의) 복제본이면, 화면엔
  // 전혀 티 안 나게(복제본과 진짜가 똑같이 생겼으므로) 실제 카드 위치로 스크롤을 순간
  // 이동시킴. 이렇게 하면 계속 같은 방향으로 넘겨도 마지막 다음엔 처음이, 처음 이전엔
  // 마지막이 끊김 없이 계속 이어지는 것처럼 보임 (끝없이 순환하는 캐러셀)
  const scrollSettleTimer = useRef(null);
  const handleBannerScroll = useCallback(() => {
    updateBannerFocus();
    if (scrollSettleTimer.current) clearTimeout(scrollSettleTimer.current);
    scrollSettleTimer.current = setTimeout(() => {
      const track = bannerTrackRef.current;
      if (!track || bannerStories.length <= 1) return;
      const scrollCenter = track.scrollLeft + track.clientWidth / 2;
      let closest = null;
      let closestDist = Infinity;
      Array.from(track.children).forEach((child) => {
        if (!child.dataset.carouselKey) return;
        const center = child.offsetLeft + child.offsetWidth / 2;
        const dist = Math.abs(center - scrollCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closest = child;
        }
      });
      if (!closest) return;
      const key = closest.dataset.carouselKey;
      const isLeadClone = key.startsWith('clone-lead-');
      const isTrailClone = key.startsWith('clone-trail-');
      if (!isLeadClone && !isTrailClone) return;
      const targetKey = isLeadClone
        ? bannerStories[bannerStories.length - 1].id
        : bannerStories[0].id;
      const targetEl = Array.from(track.children).find((el) => el.dataset.carouselKey === targetKey);
      if (!targetEl) return;
      track.scrollLeft = targetEl.offsetLeft + targetEl.offsetWidth / 2 - track.clientWidth / 2;
      updateBannerFocus();
    }, 150);
  }, [bannerStories, updateBannerFocus]);

  useEffect(() => {
    return () => {
      if (scrollSettleTimer.current) clearTimeout(scrollSettleTimer.current);
    };
  }, []);

  useEffect(() => {
    const track = bannerTrackRef.current;
    // 뒤로가기(bfcache) 등으로 브라우저가 이전 스크롤 위치를 되살려주는 경우가 있어서,
    // 항상 "진짜 첫 번째 배너"가 정중앙에서 시작하도록 강제로 고정 (복제본이 앞에 있을
    // 수 있으므로 실제 첫 배너 카드를 찾아서 그 위치로 스크롤). 일부 브라우저는 이 리셋을
    // 우리 effect보다 늦게 적용하기도 해서 한 번 더 재확인
    const resetToFirst = () => {
      if (!track) return;
      const firstRealKey = bannerStories[0]?.id;
      const firstReal = firstRealKey
        ? Array.from(track.children).find((el) => el.dataset.carouselKey === firstRealKey)
        : null;
      if (firstReal) {
        track.scrollLeft = firstReal.offsetLeft + firstReal.offsetWidth / 2 - track.clientWidth / 2;
      } else {
        track.scrollLeft = 0;
      }
      updateBannerFocus();
    };
    resetToFirst();
    const retryTimer = setTimeout(resetToFirst, 60);
    window.addEventListener('resize', updateBannerFocus);
    return () => {
      clearTimeout(retryTimer);
      window.removeEventListener('resize', updateBannerFocus);
    };
  }, [bannerStories, carouselSlides, updateBannerFocus]);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      console.log('📡 Firebase 연결 시도...');
      const storiesRef = collection(db, 'stories');
      const snapshot = await getDocs(storiesRef);
      
      console.log('📚 Firestore 응답:', snapshot.size, '개 문서');
      
      if (!snapshot.empty) {
        const storiesArray = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(story => story.published === true && story.hidden !== true)
          .sort((a, b) => {
            // 어드민에서 직접 지정한 순서(displayOrder)가 있으면 그걸 최우선으로 사용
            // (작을수록 먼저 표시), 없는 스토리는 최신 발행/저장순으로 뒤에 배치
            const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : Infinity;
            const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : Infinity;
            if (orderA !== orderB) return orderA - orderB;
            return new Date(b.publishedAt || b.savedAt) - new Date(a.publishedAt || a.savedAt);
          });

        console.log('✅ 발행된 스토리:', storiesArray.length, '개');
        setStories(storiesArray);
      } else {
        console.log('⚠️ Firestore에 데이터 없음');
        setStories([]);
      }
    } catch (err) {
      console.error('❌ Firebase 오류:', err);
      setError(err.message);
      
      // localStorage fallback
      try {
        const localStories = JSON.parse(localStorage.getItem('kind_cat_stories') || '[]');
        const publishedStories = localStories.filter(s => s.published === true && s.hidden !== true);
        if (publishedStories.length > 0) {
          console.log('📦 localStorage에서 로드:', publishedStories.length, '개');
          setStories(publishedStories);
        }
      } catch (e) {
        console.error('localStorage 오류:', e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.storyTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 ||
                       selectedTags.some(tag =>
                         Object.values(story.storyTags || {}).some(tagArray => tagArray?.includes(tag))
                       );
    return matchesSearch && matchesTags;
  });

  const handleTagToggle = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // 로딩 화면
  // 로딩 화면 - 주석처리
// if (isLoading) {
//   return (
//     <div className="story-library">
//       <div className="loading-container">
//         <div className="loading-spinner"></div>
//         <p>로딩 중...</p>
//       </div>
//     </div>
//   );
// }

  return (
    <div className="story-library">
      <div className="library-header">
        <div 
          className="logo-section" 
          onClick={() => navigate('/')} 
          style={{ cursor: 'pointer' }}
        >
          <img 
            src={`${process.env.PUBLIC_URL}/cat-icon.png`}
            alt="CAT" 
            className="cat-icon"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <img 
            src={`${process.env.PUBLIC_URL}/kindcat-typo.png`}
            alt="KIND CAT" 
            className="kindcat-typo"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
        <p className="tagline"></p>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="error-banner">
          <p>⚠️ Firebase 연결 오류: {error}</p>
          <button onClick={loadStories}>다시 시도</button>
        </div>
      )}

      {/* 히어로 배너 캐러셀 - 어드민에서 "홈 배너로 노출"로 지정한 스토리들을
          옆 슬라이드가 살짝 보이도록 가로 스크롤로 노출 (지정된 게 없으면 맨 위 순서 스토리 하나) */}
      {bannerStories.length > 0 && (
        <div className="hero-carousel">
          <div
            className="hero-carousel-track"
            ref={bannerTrackRef}
            onScroll={handleBannerScroll}
          >
            {/* 좌우 여백을 container padding이 아니라 이 스페이서로 만든 이유:
                container padding %는 부모 너비 기준, flex-basis %는 (패딩을 뺀) 컨텐츠
                박스 너비 기준이라 서로 기준이 달라 첫 배너가 정중앙에 오지 않는 버그가
                있었음. 스페이서를 쓰면 모든 flex-basis %가 같은 기준(트랙 자체 너비)을
                쓰게 되어 정확히 맞아떨어짐 */}
            <div className="hero-carousel-spacer" aria-hidden="true" />
            {carouselSlides.map(({ story, key, isClone }) => (
              <Link
                to={`/story/${story.id}`}
                key={key}
                data-carousel-key={key}
                className={`hero-banner${isClone ? ' hero-banner-clone' : ''}`}
                style={bannerCardStyles[key]}
                tabIndex={isClone ? -1 : undefined}
                aria-hidden={isClone ? true : undefined}
              >
                {story.thumbnail && (
                  <img
                    src={story.thumbnail.startsWith('http') ? story.thumbnail : `${process.env.PUBLIC_URL}${story.thumbnail.replace(/^\/kind-cat/, '')}`}
                    alt={story.title || story.storyTitle}
                    className="hero-banner-image"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <div className="hero-banner-gradient" />
                <div className="hero-banner-content" style={bannerContentStyles[key]}>
                  {story.badgeEnabled !== false && (
                    <span className="hero-banner-badge">{story.badgeText || '🔥 지금 추천하는 스토리'}</span>
                  )}
                  <h2 className="hero-banner-title">{story.title || story.storyTitle}</h2>
                  <p className="hero-banner-desc">{story.description}</p>
                  {story.storyTags && (
                    <div className="hero-banner-tags">
                      {story.storyTags.genre?.slice(0, 2).map((tag, i) => (
                        <span key={i} className="tag genre">{tag}</span>
                      ))}
                      {story.storyTags.mood?.slice(0, 1).map((tag, i) => (
                        <span key={i} className="tag mood">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
            <div className="hero-carousel-spacer" aria-hidden="true" />
          </div>
          {bannerStories.length > 1 && (
            <>
              <div className="hero-carousel-edge left" />
              <div className="hero-carousel-edge right" />
            </>
          )}
        </div>
      )}

      <div className="search-section">
        <input
          type="text"
          className="search-input"
          placeholder="스토리 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="tag-filters">
        {tags.map(tag => (
          <button
            key={tag}
            className={`tag-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
            onClick={() => handleTagToggle(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="story-grid">
        {filteredStories.length > 0 ? (
          filteredStories.map(story => (
            <Link
              to={`/story/${story.id}`}
              key={story.id}
              className="story-card"
            >
              {story.thumbnail && (
                <img
                  src={story.thumbnail.startsWith('http') ? story.thumbnail : `${process.env.PUBLIC_URL}${story.thumbnail.replace(/^\/kind-cat/, '')}`}
                  alt={story.title || story.storyTitle}
                  className="story-card-image"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <div className="story-card-gradient" />
              <div className="story-card-overlay">
                <h3>{story.title || story.storyTitle}</h3>
                {story.description && (
                  <p className="story-card-desc">{story.description}</p>
                )}
                {story.storyTags && (
                  <div className="story-card-tags">
                    {story.storyTags.genre?.slice(0, 1).map((tag, i) => (
                      <span key={i} className="tag genre">{tag}</span>
                    ))}
                    {story.storyTags.mood?.slice(0, 1).map((tag, i) => (
                      <span key={i} className="tag mood">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))
        ) : (
          <div className="no-stories">
            <p>발행된 스토리가 없습니다.</p>
            <button 
              className="btn-go-admin" 
              onClick={() => navigate('/admin')}
            >
              관리자 페이지로 이동
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default StoryLibrary;
