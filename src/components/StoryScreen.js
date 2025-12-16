import React, { useState, useEffect, useRef } from 'react';
import './StoryScreen.css';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import { generateAIResponse } from '../utils/aiService';

function StoryScreen({ storyConfig, apiKey }) {
  const [messages, setMessages] = useState([]);
  const [affectionScore, setAffectionScore] = useState(0);
  const [excitementLevel, setExcitementLevel] = useState(0);
  const [turnCount, setTurnCount] = useState(0);
  const [unlockedImages, setUnlockedImages] = useState([]);
  const [currentBackground, setCurrentBackground] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const conversationHistory = useRef([]);

  // 초기 스토리 시작
  useEffect(() => {
    initializeStory();
    // eslint-disable-next-line
  }, []);

  // 이미지 해금
  useEffect(() => {
    const newUnlocks = [];
    storyConfig.images.forEach(img => {
      if (img.url && affectionScore >= img.threshold && !unlockedImages.includes(img.id)) {
        newUnlocks.push(img.id);
      }
    });
    
    if (newUnlocks.length > 0) {
      setUnlockedImages([...unlockedImages, ...newUnlocks]);
      const latestUnlocked = storyConfig.images.find(img => newUnlocks.includes(img.id));
      if (latestUnlocked?.url) {
        setCurrentBackground(latestUnlocked.url);
        setMessages(prev => [...prev, {
          type: "system",
          content: `🎉 새로운 장면 해금! "${latestUnlocked.name}"`
        }]);
      }
    }
    // eslint-disable-next-line
  }, [affectionScore]);

  // 쿨다운 타이머
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setTimeout(() => {
        setCooldownRemaining(cooldownRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownRemaining]);

  const initializeStory = async () => {
    const initialMsg = {
      type: "system",
      content: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ ${storyConfig.scenario.time}
📍 ${storyConfig.scenario.location}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔺 ${storyConfig.characterA.name} (${storyConfig.characterA.age}세)
   ${storyConfig.characterA.occupation}

🔻 ${storyConfig.characterB.name} (${storyConfig.characterB.age}세)
   ${storyConfig.characterB.occupation}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    };
    
    setMessages([initialMsg]);
    await handleAIResponse("스토리를 시작해주세요.");
  };

  const handleAIResponse = async (userMessage) => {
    // 쿨다운 체크
    const now = Date.now();
    const MIN_INTERVAL = 6000;
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_INTERVAL) {
      const remainingSeconds = Math.ceil((MIN_INTERVAL - timeSinceLastRequest) / 1000);
      setCooldownRemaining(remainingSeconds);
      return;
    }

    setLoading(true);
    setLastRequestTime(now);

    try {
      const context = {
        storyConfig,
        affectionScore,
        excitementLevel,
        turnCount,
        conversationHistory: conversationHistory.current
      };

      const result = await generateAIResponse(apiKey, userMessage, context);

      if (result) {
        setAffectionScore(prev => Math.max(0, Math.min(100, prev + (result.affection_change || 0))));
        setExcitementLevel(prev => Math.max(0, Math.min(100, prev + (result.excitement_change || 0))));
        setTurnCount(prev => prev + 1);

        conversationHistory.current.push({
          user: userMessage,
          ai: result.narration
        });

        setMessages(prev => [...prev, {
          type: "story",
          narration: result.narration,
          dialogues: result.dialogues || [],
          choices: result.choices || []
        }]);
      }
    } catch (error) {
      console.error("Error:", error);
      alert(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (action) => {
    setMessages(prev => [...prev, { type: "user", content: action }]);
    await handleAIResponse(action);
  };

  return (
    <div className="story-screen">
      <Sidebar 
        storyConfig={storyConfig}
        affectionScore={affectionScore}
        excitementLevel={excitementLevel}
        turnCount={turnCount}
        unlockedImages={unlockedImages}
      />
      <ChatArea 
        storyConfig={storyConfig}
        messages={messages}
        currentBackground={currentBackground}
        loading={loading}
        cooldownRemaining={cooldownRemaining}
        onUserAction={handleUserAction}
      />
    </div>
  );
}

export default StoryScreen;
