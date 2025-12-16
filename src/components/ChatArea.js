import React, { useState, useRef, useEffect } from 'react';
import './ChatArea.css';

function ChatArea({ storyConfig, messages, currentBackground, loading, cooldownRemaining, onUserAction }) {
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim() || loading || cooldownRemaining > 0) return;
    
    const message = userInput;
    setUserInput("");
    onUserAction(message);
  };

  const handleChoiceClick = (choice) => {
    if (loading || cooldownRemaining > 0) return;
    onUserAction(choice);
  };

  return (
    <div className="chat-area">
      <div 
        className="chat-background" 
        style={{backgroundImage: currentBackground ? `url(${currentBackground})` : 'none'}}
      />
      
      <div className="chat-header">
        <div className="chat-title">
          {storyConfig.characterA.name} × {storyConfig.characterB.name}
        </div>
        <div className="scene-info">{storyConfig.scenario.location}</div>
      </div>
      
      <div className="messages-container">
        {messages.map((msg, idx) => {
          if (msg.type === "system") {
            return (
              <div key={idx} className="system-message">
                {msg.content}
              </div>
            );
          }
          
          if (msg.type === "user") {
            return (
              <div key={idx} className="user-action">
                👤 {msg.content}
              </div>
            );
          }
          
          if (msg.type === "story") {
            return (
              <div key={idx} className="story-block">
                {msg.narration && (
                  <div className="narration">{msg.narration}</div>
                )}
                
                {msg.dialogues?.map((dialogue, dIdx) => {
                  const character = dialogue.character === storyConfig.characterA.name 
                    ? storyConfig.characterA 
                    : storyConfig.characterB;
                  
                  return (
                    <div key={dIdx} className="dialogue-wrapper">
                      <div className="character-avatar">
                        <img src={character.avatar} alt={character.name} />
                      </div>
                      <div className="dialogue-content">
                        <div className="character-name">{character.name}</div>
                        <div className="dialogue-bubble">"{dialogue.text}"</div>
                      </div>
                    </div>
                  );
                })}
                
                {msg.choices?.length > 0 && (
                  <div className="choice-grid">
                    {msg.choices.map((choice, cIdx) => (
                      <button 
                        key={cIdx} 
                        className="choice-btn" 
                        onClick={() => handleChoiceClick(choice)} 
                        disabled={loading || cooldownRemaining > 0}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return null;
        })}
        
        {loading && (
          <div className="loading-indicator">
            스토리를 생성하는 중...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-area">
        {cooldownRemaining > 0 && (
          <div className="cooldown-notice">
            ⏰ {cooldownRemaining}초 후 다음 행동 가능 (과부하 방지)
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <input 
              type="text" 
              className="text-input" 
              placeholder="다음 행동을 입력하세요" 
              value={userInput} 
              onChange={(e) => setUserInput(e.target.value)} 
              disabled={loading || cooldownRemaining > 0} 
            />
            <button 
              type="submit" 
              className="send-btn" 
              disabled={loading || !userInput.trim() || cooldownRemaining > 0}
            >
              ▶
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatArea;
