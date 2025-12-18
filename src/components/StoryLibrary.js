import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './StoryLibrary.css';

function StoryLibrary() {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const tags = ['#오피스', '#19금', '#병원', '#학원', '#순정', '#강공', '#연상공', '#집착공'];

  useEffect(() => {
    loadPublishedStories();
  }, []);

  const loadPublishedStories = () => {
    const allStories = JSON.parse(localStorage.getItem('kind_cat_stories') || '[]');
    const published = allStories.filter(story => story.published);
    console.log('📚 Published stories:', published);
    setStories(published);
  };

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  return (
    <div className="story-library">
      {/* 로고 섹션 */}
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

      {/* 검색 및 필터 */}
      <div className="search-section">
        <input
          type="text"
          className="search-input"
          placeholder="스토리 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 태그 필터 */}
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

      {/* 스토리 목록 */}
      <div className="story-grid">
        {filteredStories.length > 0 ? (
          filteredStories.map(story => (
            <Link 
              to={`/story/${story.id}`} 
              key={story.id} 
              className="story-card"
            >
              {/* ⭐ 썸네일 이미지 */}
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
                
                {/* 작품 태그 */}
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