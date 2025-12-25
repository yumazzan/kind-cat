import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import './StoryLibrary.css';

function StoryLibrary() {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const tags = ['#오피스', '#19금', '#병원', '#학원', '#순정', '#강공', '#연상공', '#집착공'];

  useEffect(() => {
    // Firebase 실시간 리스너
    const storiesRef = ref(database, 'stories');
    
    const unsubscribe = onValue(storiesRef, (snapshot) => {
      const data = snapshot.val();
      console.log('📡 Firebase 데이터:', data);
      
      if (data) {
        // 임시 테스트용으로 이렇게 변경
const storiesArray = Object.values(data)
  // .filter(story => story.published === true)  // 주석처리
  .sort((a, b) => new Date(b.publishedAt || b.savedAt) - new Date(a.publishedAt || a.savedAt));

console.log('📚 모든 스토리 (필터 없음):', storiesArray);
        console.log('📚 발행된 스토리:', storiesArray);
        setStories(storiesArray);
      } else {
        console.log('⚠️ Firebase에 데이터 없음');
        setStories([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('❌ Firebase 읽기 오류:', error);
      setLoading(false);
    });

    // 컴포넌트 언마운트 시 리스너 해제
    return () => unsubscribe();
  }, []);

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.storyTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => 
                         story.storyTags?.genre?.includes(tag) ||
                         story.storyTags?.mood?.includes(tag) ||
                         story.storyTags?.situation?.includes(tag)
                       );
    return matchesSearch && matchesTags;
  });

  const handleTagToggle = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  if (loading) {
    return (
      <div className="story-library">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>스토리를 불러오는 중...</p>
        </div>
      </div>
    );
  }

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
              console.error('Cat icon failed to load');
              e.target.style.display = 'none';
            }}
          />
          <img 
            src={`${process.env.PUBLIC_URL}/kindcat-typo.png`}
            alt="KIND CAT" 
            className="kindcat-typo"
            onError={(e) => {
              console.error('Kindcat typo failed to load');
              e.target.style.display = 'none';
            }}
          />
        </div>
        <p className="tagline">BL Interactive Fiction</p>
      </div>

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
                <div className="story-thumbnail-container">
                  <img 
                    src={`${process.env.PUBLIC_URL}${story.thumbnail}`}
                    alt={story.title || story.storyTitle}
                    className="story-thumbnail"
                    onError={(e) => {
                      console.error('Thumbnail failed to load:', story.thumbnail);
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="story-info">
                <h3>{story.title || story.storyTitle}</h3>
                <p>{story.description}</p>
                
                {story.storyTags && (
                  <div className="story-card-tags">
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