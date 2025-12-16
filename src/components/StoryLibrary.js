import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StoryLibrary.css';

function StoryLibrary() {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    const savedStories = localStorage.getItem('kind_cat_stories');
    if (savedStories) {
      const parsed = JSON.parse(savedStories);
      const published = parsed.filter(s => s.isPublished);
      setStories(published);
    }
  }, []);

  const allTags = ['#오피스', '#19금', '#병원', '#학원', '#순정', '#강공', '#연상공', '#집착공'];

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.storyTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => story.tags && story.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="story-library">
      <div className="library-header">
        <div className="logo-section">
          <img src="/cat-icon.png" alt="KIND CAT" className="logo-icon" />
          <img src="/kindcat-typo.png" alt="KIND CAT" className="logo-typo" />
        </div>
        <p className="subtitle">BL Interactive Fiction</p>
        
        <input
          type="text"
          placeholder="스토리 검색..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div className="tag-filter">
          {allTags.map(tag => (
            <button
              key={tag}
              className={`tag-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="story-grid">
        {filteredStories.length === 0 ? (
          <p className="no-stories">발행된 스토리가 없습니다.</p>
        ) : (
          filteredStories.map(story => (
            <div 
              key={story.id} 
              className="story-card"
              onClick={() => navigate(`/story/${story.id}`)}
            >
              {story.thumbnailImage && (
                <img 
                  src={story.thumbnailImage} 
                  alt={story.storyTitle}
                  className="story-thumbnail"
                />
              )}
              <div className="story-info">
                <h3>{story.storyTitle}</h3>
                <p>{story.description}</p>
                {story.tags && (
                  <div className="story-tags">
                    {story.tags.map(tag => (
                      <span key={tag} className="story-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default StoryLibrary;
