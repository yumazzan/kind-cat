/**
 * BL 인터랙티브 픽션 AI 응답 파서
 * Gemini/GPT 응답을 구조화된 데이터로 변환
 */

// ============================================
// 메인 파서 함수
// ============================================

export function parseAIResponse(responseText) {
  try {
    // 1. JSON 블록 추출
    const jsonData = extractJSON(responseText);
    
    if (!jsonData) {
      // JSON 파싱 실패 시 텍스트 응답으로 폴백
      return createFallbackResponse(responseText);
    }

    // 2. 각 필드 파싱
    return {
      success: true,
      meta: extractMetaInfo(jsonData),
      narration: jsonData.narration || '',
      dialogues: extractDialogues(jsonData),
      scores: extractScoreChanges(jsonData),
      choices: jsonData.choices || [],
      triggeredKeywords: jsonData.triggered_keywords || [],
      sceneChange: jsonData.scene_change || null,
      branchPoint: {
        isBranch: jsonData.is_branch_point || false,
        message: jsonData.branch_message || null
      },
      raw: jsonData
    };

  } catch (error) {
    console.error('AI 응답 파싱 오류:', error);
    return {
      success: false,
      error: error.message,
      rawText: responseText
    };
  }
}

// ============================================
// JSON 추출
// ============================================

function extractJSON(text) {
  // 방법 1: ```json ... ``` 블록 찾기
  const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) {
    try {
      return JSON.parse(jsonBlockMatch[1]);
    } catch (e) {
      console.warn('JSON 블록 파싱 실패, 다른 방법 시도');
    }
  }

  // 방법 2: ``` ... ``` 블록 찾기
  const codeBlockMatch = text.match(/```\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch (e) {
      console.warn('코드 블록 파싱 실패, 다른 방법 시도');
    }
  }

  // 방법 3: { ... } 전체 찾기
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      // JSON 수정 시도
      const fixed = fixMalformedJSON(jsonMatch[0]);
      if (fixed) {
        try {
          return JSON.parse(fixed);
        } catch (e2) {
          console.warn('수정된 JSON도 파싱 실패');
        }
      }
    }
  }

  return null;
}

// 잘못된 JSON 수정 시도
function fixMalformedJSON(jsonStr) {
  let fixed = jsonStr;
  
  // 후행 쉼표 제거
  fixed = fixed.replace(/,\s*}/g, '}');
  fixed = fixed.replace(/,\s*]/g, ']');
  
  // 작은따옴표 → 큰따옴표
  fixed = fixed.replace(/'/g, '"');
  
  // 줄바꿈 이스케이프
  fixed = fixed.replace(/\n/g, '\\n');
  
  return fixed;
}

// ============================================
// 메타 정보 추출
// ============================================

function extractMetaInfo(jsonData) {
  return {
    time: jsonData.time || null,
    location: jsonData.location || null,
    charAState: jsonData.char_a_state || null,
    charBState: jsonData.char_b_state || null
  };
}

// ============================================
// 대사 추출
// ============================================

function extractDialogues(jsonData) {
  const dialogues = jsonData.dialogues || [];
  
  return dialogues.map(d => ({
    speaker: d.speaker || d.character || '???',
    text: d.text || d.dialogue || ''
  }));
}

// ============================================
// 점수 변화 추출
// ============================================

function extractScoreChanges(jsonData) {
  return {
    affectionGongChange: parseScoreValue(jsonData.affection_gong_change || jsonData.affection_change || 0),
    affectionSuChange: parseScoreValue(jsonData.affection_su_change || 0),
    excitementChange: parseScoreValue(jsonData.excitement_change || 0)
  };
}

function parseScoreValue(value) {
  const num = parseInt(value, 10);
  if (isNaN(num)) return 0;
  // -15 ~ +15 범위로 제한
  return Math.max(-15, Math.min(15, num));
}

// ============================================
// 폴백 응답 생성
// ============================================

function createFallbackResponse(text) {
  // JSON 파싱 실패 시 텍스트에서 최대한 정보 추출
  
  // 대사 패턴 찾기: "이름: "대사"" 또는 "이름: 대사"
  const dialoguePattern = /([가-힣a-zA-Z]+):\s*"([^"]+)"/g;
  const dialogues = [];
  let match;
  
  while ((match = dialoguePattern.exec(text)) !== null) {
    dialogues.push({
      speaker: match[1],
      text: match[2]
    });
  }

  // 대사 제외한 나머지를 서술로
  let narration = text;
  dialogues.forEach(d => {
    narration = narration.replace(`${d.speaker}: "${d.text}"`, '');
  });
  narration = narration.trim();

  return {
    success: true,
    isFallback: true,
    meta: {
      time: null,
      location: null,
      charAState: null,
      charBState: null
    },
    narration: narration,
    dialogues: dialogues,
    scores: {
      affectionGongChange: 0,
      affectionSuChange: 0,
      excitementChange: 0
    },
    choices: [],
    triggeredKeywords: [],
    sceneChange: null,
    branchPoint: {
      isBranch: false,
      message: null
    }
  };
}

// ============================================
// 메타 정보 포맷팅 (화면 표시용)
// ============================================

export function formatMetaInfo(meta, charA, charB, gameState) {
  if (!meta.time && !meta.location) return null;

  const { affectionGong = 0, affectionSu = 0, excitement = 0 } = gameState;
  
  // 흥분도 레벨
  const excitementLevel = getExcitementLevel(excitement);
  
  // 관계 상태명
  const avgAffection = Math.floor((affectionGong + affectionSu) / 2);
  const relationshipName = getRelationshipName(avgAffection);

  let formatted = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  if (meta.time) formatted += `⏰ ${meta.time}\n`;
  if (meta.location) formatted += `📍 ${meta.location}\n`;
  
  formatted += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // 캐릭터 A 상태
  if (charA) {
    formatted += `🩶 ${charA.name || '공'} (${charA.age || '?'}세)\n`;
    if (meta.charAState) {
      if (meta.charAState.pose) formatted += `   ▫️ 상태: ${meta.charAState.pose}`;
      if (meta.charAState.expression) formatted += `, ${meta.charAState.expression}`;
      formatted += '\n';
      if (meta.charAState.clothing) formatted += `   ▫️ 복장: ${meta.charAState.clothing}\n`;
    }
    formatted += `   ▫️ 관계점수: ${relationshipName} (${affectionGong}점)\n`;
    formatted += `   ▫️ 흥분도: ${excitement}점 (레벨 ${excitementLevel.level})\n\n`;
  }

  // 캐릭터 B 상태
  if (charB) {
    formatted += `🩶 ${charB.name || '수'} (${charB.age || '?'}세)\n`;
    if (meta.charBState) {
      if (meta.charBState.pose) formatted += `   ▫️ 상태: ${meta.charBState.pose}`;
      if (meta.charBState.expression) formatted += `, ${meta.charBState.expression}`;
      formatted += '\n';
      if (meta.charBState.clothing) formatted += `   ▫️ 복장: ${meta.charBState.clothing}\n`;
    }
    formatted += `   ▫️ 관계점수: ${relationshipName} (${affectionSu}점)\n`;
    formatted += `   ▫️ 흥분도: ${excitement}점 (레벨 ${excitementLevel.level})\n`;
  }

  formatted += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  return formatted;
}

function getExcitementLevel(excitement) {
  if (excitement <= 20) return { level: 1, name: '평온' };
  if (excitement <= 40) return { level: 2, name: '긴장' };
  if (excitement <= 60) return { level: 3, name: '의식' };
  if (excitement <= 80) return { level: 4, name: '욕망' };
  if (excitement <= 95) return { level: 5, name: '절정 직전' };
  return { level: 6, name: '완전한 흥분' };
}

function getRelationshipName(avgAffection) {
  if (avgAffection <= 20) return '완전한 타인';
  if (avgAffection <= 40) return '경계하는 지인';
  if (avgAffection <= 60) return '은근한 관심';
  if (avgAffection <= 80) return '인정하기 시작';
  if (avgAffection <= 95) return '솔직한 애정';
  return '완전한 신뢰';
}

// ============================================
// 대사 포맷팅 (화면 표시용)
// ============================================

export function formatDialogues(dialogues) {
  if (!dialogues || dialogues.length === 0) return '';
  
  return dialogues.map(d => `${d.speaker}: "${d.text}"`).join('\n\n');
}

// ============================================
// 전체 응답 포맷팅
// ============================================

export function formatFullResponse(parsed, story, gameState) {
  const parts = [];

  // 1. 메타 정보
  const metaFormatted = formatMetaInfo(
    parsed.meta, 
    story.characterA, 
    story.characterB, 
    gameState
  );
  if (metaFormatted) {
    parts.push(metaFormatted);
  }

  // 2. 서술
  if (parsed.narration) {
    parts.push(parsed.narration);
  }

  // 3. 대사
  const dialoguesFormatted = formatDialogues(parsed.dialogues);
  if (dialoguesFormatted) {
    parts.push(dialoguesFormatted);
  }

  return parts.join('\n\n');
}

export default parseAIResponse;