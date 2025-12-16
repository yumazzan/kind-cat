import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './StoryLibrary.css';

function StoryLibrary() {
  const [publishedStories, setPublishedStories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const navigate = useNavigate();

  // 발행된 스토리 로드
  useEffect(() => {
    const stories = JSON.parse(localStorage.getItem('kind_cat_stories') || '[]');
    const published = stories.filter(story => story.published);
    setPublishedStories(published);
  }, []);

  // 모든 태그 추출
  const getAllTags = () => {
    const tagsSet = new Set();
    publishedStories.forEach(story => {
      if (story.storyTags) {
        Object.values(story.storyTags).forEach(tagArray => {
          tagArray.forEach(tag => tagsSet.add(tag));
        });
      }
    });
    return Array.from(tagsSet);
  };

  // 태그 토글
  const handleTagClick = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // 필터링된 스토리
  const filteredStories = publishedStories.filter(story => {
    // 검색어 필터
    const matchesSearch = searchTerm === '' || 
      story.storyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 태그 필터
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => {
        if (!story.storyTags) return false;
        return Object.values(story.storyTags).some(tagArray => 
          tagArray.includes(tag)
        );
      });
    
    return matchesSearch && matchesTags;
  });

  // 스토리 클릭
  const handleStoryClick = (story) => {
    navigate(`/story/${story.id}`);
  };

  const allTags = getAllTags();

  return (
    <div className="library-container">
      {/* 헤더 */}
      <div className="library-header">
        <div className="header-content">
          <div className="library-logo">
            <img src="/cat-icon.png" alt="KIND CAT" className="logo-icon" />
            <img src="/kindcat-typo.png" alt="KIND CAT" className="logo-typo" />
          </div>
          <Link to="/admin" className="admin-link">
            🔧 관리자
          </Link>
        </div>

        {/* 검색 */}
        <div className="search-container">
          <input
            type="text"
            placeholder="스토리 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        {allTags.length > 0 && (
          <div className="tag-filter">
            {allTags.map(tag => (
              <button
                key={tag}
                className={`tag-filter-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 스토리 그리드 */}
      <div className="stories-container">
        {filteredStories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h2>발행된 스토리가 없습니다</h2>
            <p>관리자 페이지에서 스토리를 만들고 발행해주세요!</p>
            <Link to="/admin" className="btn-create-story">
              ➕ 스토리 만들기
            </Link>
          </div>
        ) : (
          <div className="story-grid">
            {filteredStories.map(story => (
              <div
                key={story.id}
                className="story-card"
                onClick={() => handleStoryClick(story)}
              >
                <div className="story-thumbnail">
                  {story.thumbnail ? (
                    <img src={story.thumbnail} alt={story.storyTitle} />
                  ) : (
                    <div className="thumbnail-placeholder">
                      <span className="placeholder-icon">📖</span>
                    </div>
                  )}
                </div>
                <div className="story-info">
                  <h3 className="story-title">{story.storyTitle}</h3>
                  <p className="story-description">{story.description}</p>
                  {story.storyTags && (
                    <div className="story-tags">
                      {Object.values(story.storyTags).flat().slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="story-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StoryLibrary;