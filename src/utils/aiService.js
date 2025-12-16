import { SYSTEM_PROMPT } from '../config/storyConfig';

// 응답 캐시
const cache = new Map();
const MAX_CACHE_SIZE = 20;

function generateCacheKey(context, userMessage) {
  return `${context.affectionScore}_${context.turnCount}_${userMessage.substring(0, 50)}`;
}

export async function generateAIResponse(apiKey, userMessage, context, retryCount = 0) {
  const { storyConfig, affectionScore, excitementLevel, turnCount, conversationHistory } = context;
  
  // 캐시 확인
  const cacheKey = generateCacheKey(context, userMessage);
  if (cache.has(cacheKey)) {
    console.log('✅ 캐시 사용');
    return cache.get(cacheKey);
  }

  // 대화 히스토리 (최근 3턴)
  const recentHistory = conversationHistory.slice(-3);
  const historyText = recentHistory.map(h => 
    `사용자: ${h.user}\nAI: ${h.ai}`
  ).join('\n\n');

  const prompt = `
캐릭터 설정:
공: ${storyConfig.characterA.name} (${storyConfig.characterA.age}세) - ${storyConfig.characterA.personality}
수: ${storyConfig.characterB.name} (${storyConfig.characterB.age}세) - ${storyConfig.characterB.personality}
관계: ${storyConfig.scenario.relationship}
장소: ${storyConfig.scenario.location}

현재 상태:
- 호감도: ${affectionScore}/100
- 흥분도: ${excitementLevel}%
- 턴: ${turnCount}

${historyText ? '최근 대화:\n' + historyText + '\n\n' : ''}

사용자 행동: ${userMessage}

${SYSTEM_PROMPT}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    // 과부하 시 재시도
    if (response.status === 503 || response.status === 429) {
      if (retryCount < 3) {
        const waitTime = (retryCount + 1) * 3000;
        console.log(`⏳ ${waitTime/1000}초 후 재시도... (${retryCount + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return generateAIResponse(apiKey, userMessage, context, retryCount + 1);
      }
      throw new Error('서버가 과부하 상태입니다. 잠시 후 다시 시도해주세요.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]) {
      throw new Error('AI 응답이 비어있습니다.');
    }

    let text = data.candidates[0].content.parts[0].text;
    let result;

    try {
      // JSON 파싱
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        narration: text.substring(0, 300),
        dialogues: [],
        affection_change: 0,
        excitement_change: 0,
        choices: ["계속하기"]
      };
    } catch (e) {
      console.error('JSON 파싱 실패:', e);
      result = {
        narration: text.substring(0, 300),
        dialogues: [],
        affection_change: 0,
        excitement_change: 0,
        choices: ["계속하기"]
      };
    }

    // 캐시 저장
    if (cache.size >= MAX_CACHE_SIZE) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    cache.set(cacheKey, result);

    return result;

  } catch (error) {
    console.error('AI 서비스 오류:', error);
    throw error;
  }
}
