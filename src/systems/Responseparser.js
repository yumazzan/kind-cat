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
      newMilestone: jsonData.new_milestone || null,
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
  const candidates = [];

  // 방법 1: ```json ... ``` 블록 (정상적으로 닫힌 경우)
  const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) candidates.push(jsonBlockMatch[1]);

  // 방법 2: ``` ... ``` 블록
  const codeBlockMatch = text.match(/```\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) candidates.push(codeBlockMatch[1]);

  // 방법 3: 마지막 { ... } 전체
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) candidates.push(jsonMatch[0]);

  // 방법 4: 응답이 잘려서 닫는 ``` 가 없는 경우 - 열린 펜스 이후 전체를 후보로
  const openFenceMatch = text.match(/```json\s*([\s\S]*)$/);
  if (openFenceMatch) candidates.push(openFenceMatch[1]);

  // 방법 5: 첫 '{' 부터 끝까지 (닫는 '}' 조차 없이 잘린 경우 대비)
  const firstBrace = text.indexOf('{');
  if (firstBrace !== -1) candidates.push(text.slice(firstBrace));

  for (const candidate of candidates) {
    const parsed = tryParseJSON(candidate);
    if (parsed) return parsed;
  }

  // 완전한 파싱이 전부 실패 - 응답이 중간에 잘렸을 가능성이 높으므로
  // 완결된 필드/배열 원소만이라도 최대한 복구 시도
  for (const candidate of candidates) {
    const salvaged = salvagePartialJSON(candidate);
    if (salvaged) return salvaged;
  }

  return null;
}

function tryParseJSON(raw) {
  if (!raw) return null;
  const sanitized = sanitizeControlChars(raw);
  const attempts = [raw, sanitized, fixTrailingCommas(sanitized)];
  for (const attempt of attempts) {
    try {
      return JSON.parse(attempt);
    } catch (e) {
      // 다음 시도로 넘어감
    }
  }
  return null;
}

function fixTrailingCommas(str) {
  return str.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
}

// 문자열 리터럴 "내부"의 raw 개행/탭 등 제어문자만 안전하게 이스케이프.
// 예전 로직처럼 작은따옴표를 전부 큰따옴표로 바꾸는 식의 전면 치환은
// 대사에 포함된 정상적인 작은따옴표까지 깨뜨려 오히려 파싱을 실패시켰기 때문에 사용하지 않음.
function sanitizeControlChars(str) {
  let result = '';
  let inString = false;
  let escapeNext = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escapeNext) {
      result += ch;
      escapeNext = false;
      continue;
    }
    if (ch === '\\' && inString) {
      result += ch;
      escapeNext = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      result += ch;
      continue;
    }
    if (inString && (ch === '\n' || ch === '\r' || ch === '\t')) {
      result += ch === '\n' ? '\\n' : ch === '\r' ? '\\r' : '\\t';
      continue;
    }
    result += ch;
  }
  return result;
}

// 응답이 중간에 잘렸을 때, 완결된 필드/배열 원소만이라도 복구해서
// "raw JSON 텍스트가 그대로 화면에 노출되는" 최악의 상황을 피한다.
function salvagePartialJSON(raw) {
  if (!raw) return null;
  const sanitized = sanitizeControlChars(raw);
  const result = {};

  ['time', 'location'].forEach(field => {
    const m = sanitized.match(new RegExp(`"${field}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
    if (m) result[field] = m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
  });

  ['char_a_state', 'char_b_state'].forEach(field => {
    const idx = sanitized.indexOf(`"${field}"`);
    if (idx === -1) return;
    const braceStart = sanitized.indexOf('{', idx);
    if (braceStart === -1) return;
    const objStr = extractBalanced(sanitized, braceStart, '{', '}');
    if (objStr) {
      try { result[field] = JSON.parse(objStr); } catch (e) { /* 이 필드는 포기 */ }
    }
  });

  // beats 배열: 앞에서부터 완결된 원소만 순서대로 수집하고, 처음 잘린 원소에서 중단
  const beatsIdx = sanitized.indexOf('"beats"');
  if (beatsIdx !== -1) {
    const arrStart = sanitized.indexOf('[', beatsIdx);
    if (arrStart !== -1) {
      const beats = [];
      let cursor = arrStart + 1;
      while (cursor < sanitized.length) {
        const closeBeforeObj = sanitized.indexOf(']', cursor);
        const objStart = sanitized.indexOf('{', cursor);
        if (objStart === -1 || (closeBeforeObj !== -1 && closeBeforeObj < objStart)) break;
        const objStr = extractBalanced(sanitized, objStart, '{', '}');
        if (!objStr) break; // 닫는 괄호를 못 찾음 = 여기서 잘림, 이후 폐기
        try {
          beats.push(JSON.parse(objStr));
        } catch (e) {
          break;
        }
        cursor = objStart + objStr.length;
      }
      if (beats.length > 0) result.beats = beats;
    }
  }

  const choicesIdx = sanitized.indexOf('"choices"');
  if (choicesIdx !== -1) {
    const arrStart = sanitized.indexOf('[', choicesIdx);
    if (arrStart !== -1) {
      const arrStr = extractBalanced(sanitized, arrStart, '[', ']');
      if (arrStr) {
        try { result.choices = JSON.parse(arrStr); } catch (e) { /* 잘렸으면 포기, 기본값(빈 배열) 사용 */ }
      }
    }
  }

  // beats나 time/location 중 뭐라도 복구됐을 때만 유효한 결과로 취급
  if ((result.beats && result.beats.length > 0) || result.time || result.location) {
    return result;
  }
  return null;
}

// start 위치의 openCh 로부터 짝이 맞는 closeCh 까지의 부분 문자열을 반환.
// 문자열 리터럴 내부의 괄호는 무시(카운트하지 않음). 짝을 못 찾으면(=중간에 잘림) null.
function extractBalanced(str, start, openCh, closeCh) {
  let depth = 0;
  let inString = false;
  let escapeNext = false;
  for (let i = start; i < str.length; i++) {
    const ch = str[i];
    if (escapeNext) { escapeNext = false; continue; }
    if (ch === '\\' && inString) { escapeNext = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === openCh) depth++;
    else if (ch === closeCh) {
      depth--;
      if (depth === 0) return str.slice(start, i + 1);
    }
  }
  return null;
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
      excitementChange: 0
    },
    newMilestone: null,
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