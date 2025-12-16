import React, { useState } from 'react';
import './ChatInterface.css';

function ChatInterface({ apiKey, story }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [affection, setAffection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `당신은 BL 소설의 캐릭터입니다. 
캐릭터: ${story.characterA.name}, ${story.characterA.age}세, ${story.characterA.occupation}

사용자 메시지: ${input}

자연스럽고 몰입감 있게 대답하세요.`
            }]
          }]
        })
      });

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '응답을 받을 수 없습니다.';
      
      setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);
      setAffection(prev => Math.min(100, prev + 5));
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'API 오류가 발생했습니다.' }]);
    }

    setIsLoading(false);
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="character-info">
          <h2>{story.characterA.name}</h2>
          <p>❤️ 호감도: {affection}/100</p>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        {isLoading && <div className="message assistant"><div className="message-content">입력 중...</div></div>}
      </div>

      <div className="chat-input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="메시지를 입력하세요..."
          disabled={isLoading}
        />
        <button onClick={sendMessage} disabled={isLoading}>전송</button>
      </div>
    </div>
  );
}

export default ChatInterface;