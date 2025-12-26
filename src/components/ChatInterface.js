import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ChatInterface.css';

function ChatInterface() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [affection, setAffection] = useState(0);
  const [excitement, setExcitement] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStory, setIsLoadingStory] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const messagesEndRef = useRef(null);

  // 스크롤 자동 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadStory();
  }, [storyId]);

  useEffect(() => {
    if (story?.backgroundImages) {
      updateBackgroundImage();
    }
  }, [affection, story]);

  const loadStory = () => {
    console.log('🔍 Loading story for chat with ID:', storyId, 'Type:', typeof storyId);
    
    try {
      const stories = JSON.parse(localStorage.getItem('kind_cat_stories') || '[]');
      console.log('📚 All stories:', stories);
      
      // String 비교로 ID 매칭 (숫자/문자열 모두 대응)
      const foundStory = stories.find(s => String(s.id) === String(storyId));
      
      if (foundStory) {
        console.log('✅ Story loaded for chat:', foundStory);
        setStory(foundStory);
        
        // 시작 메시지
        setMessages([
          {
            role: 'system',
            content: foundStory.scenario?.situation || '두 사람이 마주쳤다.',
            type: 'narration'
          }
        ]);
        
        setIsLoadingStory(false);
      } else {
        console.error('❌ Story not found with id:', storyId);
        console.log('Available IDs:', stories.map(s => ({ id: s.id, type: typeof s.id })));
        
        // 약간의 지연 후 에러 표시
        setTimeout(() => {
          setIsLoadingStory(false);
          alert('스토리를 찾을 수 없습니다!');
          navigate('/');
        }, 500);
      }
    } catch (error) {
      console.error('❌ Error loading story:', error);
      setIsLoadingStory(false);
      alert('스토리 로딩 중 오류가 발생했습니다.');
      navigate('/');
    }
  };

  const updateBackgroundImage = () => {
    if (!story?.backgroundImages) return;

    let bgArray = [];
    if (affection <= 20) {
      bgArray = story.backgroundImages[0] || [];
    } else if (affection <= 40) {
      bgArray = story.backgroundImages[20] || [];
    } else if (affection <= 60) {
      bgArray = story.backgroundImages[40] || [];
    } else if (affection <= 80) {
      bgArray = story.backgroundImages[60] || [];
    } else {
      bgArray = story.backgroundImages[80] || [];
    }

    if (bgArray.length > 0) {
      const index = Math.floor((affection % 20) / 20 * bgArray.length);
      const selectedImage = bgArray[Math.min(index, bgArray.length - 1)];
      setBackgroundImage(selectedImage);
    }
  };

  const generateSystemPrompt = () => {
    if (!story) return '';

    const charA = story.characterA;
    const charB = story.characterB;

    const getCallingName = (callingSystem, currentAffection) => {
      if (!callingSystem) return '당신';
      if (currentAffection <= 20) return callingSystem.affection_0_20 || '당신';
      if (currentAffection <= 40) return callingSystem.affection_21_40 || '당신';
      if (currentAffection <= 60) return callingSystem.affection_41_60 || '당신';
      if (currentAffection <= 80) return callingSystem.affection_61_80 || '당신';
      return callingSystem.affection_81_100 || '당신';
    };

    const aCallsB = getCallingName(charA?.callingSystem, affection);
    const bCallsA = getCallingName(charB?.callingSystem, affection);

    return `당신은 한국 BL 인터랙티브 픽션의 AI입니다.

[캐릭터 정보]
공(攻): ${charA?.name || '캐릭터A'} (${charA?.age || '?'}세, ${charA?.occupation || '?'})
- 성격: ${charA?.personality || '?'}
- 외모: ${charA?.appearance || '?'}
- 말투: ${charA?.speech || '?'}

수(受): ${charB?.name || '캐릭터B'} (${charB?.age || '?'}세, ${charB?.occupation || '?'})
- 성격: ${charB?.personality || '?'}
- 외모: ${charB?.appearance || '?'}
- 말투: ${charB?.speech || '?'}

[캐릭터 태그]
공: ${charA?.tags?.join(', ') || '없음'}
수: ${charB?.tags?.join(', ') || '없음'}

[선호 행동]
공: ${charA?.preferredActions?.join(', ') || '없음'}
수: ${charB?.preferredActions?.join(', ') || '없음'}

[비선호 행동 - 절대 사용 금지]
공: ${charA?.avoidedActions?.join(', ') || '없음'}
수: ${charB?.avoidedActions?.join(', ') || '없음'}

[호칭 시스템 - 현재 호감도: ${affection}점]
공이 수를 부르는 호칭: ${aCallsB}
수가 공을 부르는 호칭: ${bCallsA}

[시나리오]
- 관계: ${story.scenario?.relationship || '?'}
- 장소: ${story.scenario?.location || '?'}
- 상황: ${story.scenario?.situation || '?'}
- 시간: ${story.scenario?.time || '?'}

[현재 상태]
- 호감도: ${affection}점 (0-100)
- 흥분도: ${excitement}점 (0-100)

[핵심 규칙]
1. 응답은 반드시 JSON 형식으로만 출력
2. 지문과 대사 명확히 구분
3. 캐릭터 성격과 태그 반영
4. 호감도 점진적 증가 (-10 ~ +15)
5. 선호 행동 우선, 비선호 행동 회피
6. 현재 호감도에 맞는 호칭 사용
7. 지문은 200-300자, 대사는 자연스럽게

[응답 형식]
{
  "narration": "지문 (200-300자, 감각적이고 구체적으로)",
  "dialogues": [
    {"character": "${charA?.name || '공'}", "text": "대사 (현재 호칭 사용)"},
    {"character": "${charB?.name || '수'}", "text": "대사 (현재 호칭 사용)"}
  ],
  "affection_change": -10에서 +15 사이 정수,
  "excitement_change": 0에서 +10 사이 정수,
  "choices": ["선택지1", "선택지2", "선택지3", "선택지4"]
}`;
  };

  const parseAIResponse = (responseText) => {
    try {
      // JSON 마크다운 블록 제거
      let cleaned = responseText.trim();
      cleaned = cleaned.replace(/^```json\s*/i, '');
      cleaned = cleaned.replace(/^```\s*/i, '');
      cleaned = cleaned.replace(/```\s*$/i, '');
      cleaned = cleaned.trim();

      // JSON 파싱
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (error) {
      console.error('JSON 파싱 실패:', error);
      console.log('원본 응답:', responseText);
      return null;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !story) return;

    const userMessage = { role: 'user', content: input, type: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = localStorage.getItem('gemini_api_key');
      if (!apiKey) {
        alert('API 키가 없습니다! 다시 설정해주세요.');
        navigate(`/apikey/${storyId}`);
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ 
                  text: generateSystemPrompt() + '\n\n사용자 선택: ' + input 
                }]
              }
            ],
            generationConfig: {
              temperature: 0.9,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API 응답 오류:', errorData);
        throw new Error(`API 오류: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI 응답:', data);

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('AI 응답이 없습니다.');
      }

      const aiResponse = data.candidates[0].content.parts[0].text;
      console.log('AI 텍스트:', aiResponse);

      const parsed = parseAIResponse(aiResponse);
      
      if (parsed) {
        // 호감도 업데이트
        if (typeof parsed.affection_change === 'number') {
          setAffection(prev => Math.max(0, Math.min(100, prev + parsed.affection_change)));
        }

        // 흥분도 업데이트
        if (typeof parsed.excitement_change === 'number') {
          setExcitement(prev => Math.max(0, Math.min(100, prev + parsed.excitement_change)));
        }

        const newMessages = [];

        // 지문 추가
        if (parsed.narration) {
          newMessages.push({ 
            role: 'assistant', 
            content: parsed.narration, 
            type: 'narration' 
          });
        }

        // 대사 추가
        if (parsed.dialogues && Array.isArray(parsed.dialogues)) {
          parsed.dialogues.forEach(d => {
            if (d.character && d.text) {
              newMessages.push({
                role: 'assistant',
                content: `${d.character}: "${d.text}"`,
                type: 'dialogue',
                character: d.character
              });
            }
          });
        }

        // 선택지 추가
        if (parsed.choices && Array.isArray(parsed.choices) && parsed.choices.length > 0) {
          newMessages.push({
            role: 'choices',
            content: parsed.choices,
            type: 'choices'
          });
        }

        setMessages(prev => [...prev, ...newMessages]);

      } else {
        // JSON 파싱 실패 시 원본 텍스트 표시
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: aiResponse,
          type: 'text'
        }]);
      }

    } catch (error) {
      console.error('AI 응답 오류:', error);
      alert(`AI 응답 중 오류가 발생했습니다.\n\n${error.message}\n\nAPI 키를 확인해주세요.`);
      setMessages(prev => [...prev, {
        role: 'system',
        content: '⚠️ 오류가 발생했습니다. 다시 시도해주세요.',
        type: 'error'
      }]);
    }

    setIsLoading(false);
  };

  const handleChoiceClick = (choice) => {
    setInput(choice);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 로딩 중
  if (isLoadingStory) {
    return (
      <div className="chat-interface">
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
      <div className="chat-interface">
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

  return (
    <div 
      className="chat-interface"
      style={{
        backgroundImage: backgroundImage ? `url(${process.env.PUBLIC_URL}${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* 헤더 */}
      <div className="chat-header">
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
        </div>
        
        <div className="header-info">
          <h3>{story.characterA?.name || '캐릭터'}</h3>
          <div className="affection-bar">
            <div 
              className="affection-fill" 
              style={{ width: `${affection}%` }}
            />
            <span className="affection-text">호감도 {affection}%</span>
          </div>
        </div>
      </div>

      {/* 메시지 컨테이너 */}
      <div className="messages-container">
        {messages.map((msg, idx) => {
          if (msg.type === 'choices') {
            return (
              <div key={idx} className="choices-container">
                {msg.content.map((choice, i) => (
                  <button
                    key={i}
                    className="choice-btn"
                    onClick={() => handleChoiceClick(choice)}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            );
          }

          return (
            <div key={idx} className={`message ${msg.role} ${msg.type || ''}`}>
              <p>{msg.content}</p>
            </div>
          );
        })}
        
        {isLoading && (
          <div className="message loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="선택하거나 직접 입력하세요..."
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()}>
          전송
        </button>
      </div>
    </div>
  );
}

export default ChatInterface;