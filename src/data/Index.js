/**
 * BL 인터랙티브 픽션 데이터 모듈 인덱스
 * 
 * 사용법:
 * import { GONG_TYPES, getMoan, getDialogue } from './data';
 * 
 * 또는 개별 import:
 * import { findGongType, findSuType } from './data/characterTraits';
 * import { getMoan, GONG_MOANS } from './data/moanExpressions';
 */

// ============================================================
// 캐릭터 특성
// ============================================================
export {
  GONG_TYPES,
  SU_TYPES,
  findGongType,
  findSuType,
  getSampleDialogue,
  getExcitementResponse
} from './characterTraits';

// ============================================================
// 신음 표현
// ============================================================
export {
  GONG_MOANS,
  SU_MOANS,
  SITUATIONAL_MOANS,
  BREATHING_PATTERNS,
  MOAN_SPEECH_COMBOS,
  FORBIDDEN_PATTERNS as FORBIDDEN_MOAN_PATTERNS,
  getMoan,
  getExcitementLevelName,
  validateMoan,
  getSituationalMoan
} from './moanExpressions';

// ============================================================
// 대사 패턴
// ============================================================
export {
  DIALOGUE_PRINCIPLES,
  GONG_DIALOGUES,
  SU_DIALOGUES,
  SITUATIONAL_DIALOGUES,
  PUSH_PULL_PATTERNS,
  getDialogue,
  getSituationalDialogue,
  generateDialogueGuide
} from './dialoguePatterns';

// ============================================================
// 작문 가이드라인
// ============================================================
export {
  NARRATION_PRINCIPLES,
  PHYSICAL_DESCRIPTIONS,
  SENSORY_TECHNIQUES,
  PSYCHOLOGICAL_PATTERNS,
  PROFANITY_STRATEGY,
  EXTREME_SITUATIONS,
  ACTION_BREAKDOWN,
  FORBIDDEN_PATTERNS,
  WRITING_CHECKLIST,
  CORE_PRINCIPLES,
  TEMPLATES,
  convertEmotionToPhysical,
  getRandomGaze,
  getRandomContact,
  checkForbiddenPatterns
} from './writingGuidelines';

// ============================================================
// 통합 헬퍼 함수
// ============================================================

import { findGongType, findSuType, getExcitementResponse as getCharExcitementResponse } from './characterTraits';
import { getMoan as getMoanExpression, getExcitementLevelName } from './moanExpressions';
import { getDialogue as getCharDialogue, generateDialogueGuide } from './dialoguePatterns';
import { checkForbiddenPatterns } from './writingGuidelines';

/**
 * 캐릭터 태그로 전체 프로필 생성
 * @param {string[]} gongTags - 공 캐릭터 태그 배열
 * @param {string[]} suTags - 수 캐릭터 태그 배열
 * @returns {object} - 완전한 캐릭터 프로필
 */
export function generateCharacterProfiles(gongTags, suTags) {
  const gongType = findGongType(gongTags);
  const suType = findSuType(suTags);
  
  return {
    gong: {
      type: gongType,
      dialogueGuide: generateDialogueGuide(gongType.id, suType.id).gong
    },
    su: {
      type: suType,
      dialogueGuide: generateDialogueGuide(gongType.id, suType.id).su
    }
  };
}

/**
 * 현재 상태에 맞는 캐릭터 반응 생성
 * @param {string} role - 'gong' 또는 'su'
 * @param {string[]} tags - 캐릭터 태그 배열
 * @param {number} excitement - 흥분도 (0-100)
 * @param {string} situation - 상황 ('normal', 'intimate', etc.)
 * @returns {object} - { moan, dialogue, response }
 */
export function getCharacterReaction(role, tags, excitement, situation = 'normal') {
  const characterType = role === 'gong' ? findGongType(tags) : findSuType(tags);
  
  return {
    moan: getMoanExpression(role, characterType.id, excitement),
    dialogue: getCharDialogue(role, characterType.id, situation),
    excitementResponse: getCharExcitementResponse(characterType, excitement),
    levelName: getExcitementLevelName(excitement)
  };
}

/**
 * 텍스트 품질 검사
 * @param {string} text - 검사할 텍스트
 * @returns {object} - { valid: boolean, issues: array }
 */
export function validateText(text) {
  const issues = checkForbiddenPatterns(text);
  
  return {
    valid: issues.length === 0,
    issues,
    suggestions: issues.map(issue => {
      switch (issue.type) {
        case 'emotion':
          return `"${issue.word}" → 신체 반응으로 대체`;
        case 'japanese':
          return `"${issue.word}" → 한국어 자연스러운 표현으로 대체`;
        case 'meta':
          return `"${issue.word}" → 게임 시스템 용어 삭제`;
        default:
          return `"${issue.word}" 수정 필요`;
      }
    })
  };
}

/**
 * 시스템 프롬프트용 캐릭터 가이드 생성
 */
export function generatePromptGuide(gongTags, suTags, excitement = 0) {
  const profiles = generateCharacterProfiles(gongTags, suTags);
  
  return {
    gong: {
      type: profiles.gong.type.id,
      personality: profiles.gong.type.personality,
      speechPatterns: profiles.gong.type.speechPattern.examples.slice(0, 3),
      currentMoanLevel: getMoanExpression('gong', profiles.gong.type.id, excitement)
    },
    su: {
      type: profiles.su.type.id,
      personality: profiles.su.type.personality,
      speechPatterns: profiles.su.type.speechPattern.examples.slice(0, 3),
      currentMoanLevel: getMoanExpression('su', profiles.su.type.id, excitement)
    },
    excitementLevel: getExcitementLevelName(excitement)
  };
}

/**
 * BL 인터랙티브 픽션 데이터 모듈 인덱스
 * 
 * 사용법:
 * import { GONG_TYPES, getMoan, getDialogue } from './data';
 * 
 * 또는 개별 import:
 * import { findGongType, findSuType } from './data/characterTraits';
 * import { getMoan, GONG_MOANS } from './data/moanExpressions';
 */

// ============================================================
// 캐릭터 특성
// ============================================================
export {
  GONG_TYPES,
  SU_TYPES,
  findGongType,
  findSuType,
  getSampleDialogue,
  getExcitementResponse
} from './characterTraits';

// ============================================================
// 신음 표현
// ============================================================
export {
  GONG_MOANS,
  SU_MOANS,
  SITUATIONAL_MOANS,
  BREATHING_PATTERNS,
  MOAN_SPEECH_COMBOS,
  FORBIDDEN_PATTERNS as FORBIDDEN_MOAN_PATTERNS,
  getMoan,
  getExcitementLevelName,
  validateMoan,
  getSituationalMoan
} from './moanExpressions';

// ============================================================
// 대사 패턴
// ============================================================
export {
  DIALOGUE_PRINCIPLES,
  GONG_DIALOGUES,
  SU_DIALOGUES,
  SITUATIONAL_DIALOGUES,
  PUSH_PULL_PATTERNS,
  getDialogue,
  getSituationalDialogue,
  generateDialogueGuide
} from './dialoguePatterns';

// ============================================================
// 작문 가이드라인
// ============================================================
export {
  NARRATION_PRINCIPLES,
  PHYSICAL_DESCRIPTIONS,
  SENSORY_TECHNIQUES,
  PSYCHOLOGICAL_PATTERNS,
  PROFANITY_STRATEGY,
  EXTREME_SITUATIONS,
  ACTION_BREAKDOWN,
  FORBIDDEN_PATTERNS,
  WRITING_CHECKLIST,
  CORE_PRINCIPLES,
  TEMPLATES,
  convertEmotionToPhysical,
  getRandomGaze,
  getRandomContact,
  checkForbiddenPatterns
} from './writingGuidelines';

// ============================================================
// 19씬 창의적 다양화 시스템
// ============================================================
export {
  LOCATIONS,
  LOCATION_PROPERTIES,
  TOOLS,
  ENVIRONMENT,
  COMBINATION_RULES,
  SCENE_CHECKLIST,
  getRandomLocation,
  getToolsForLocation,
  generateToolCombination,
  generateEnvironment,
  validateScene,
  generateSceneSetup
} from './sceneGuide';

// ============================================================
// 통합 헬퍼 함수
// ============================================================

import { findGongType, findSuType, getExcitementResponse as getCharExcitementResponse } from './characterTraits';
import { getMoan as getMoanExpression, getExcitementLevelName } from './moanExpressions';
import { getDialogue as getCharDialogue, generateDialogueGuide } from './dialoguePatterns';
import { checkForbiddenPatterns } from './writingGuidelines';

/**
 * 캐릭터 태그로 전체 프로필 생성
 * @param {string[]} gongTags - 공 캐릭터 태그 배열
 * @param {string[]} suTags - 수 캐릭터 태그 배열
 * @returns {object} - 완전한 캐릭터 프로필
 */
export function generateCharacterProfiles(gongTags, suTags) {
  const gongType = findGongType(gongTags);
  const suType = findSuType(suTags);
  
  return {
    gong: {
      type: gongType,
      dialogueGuide: generateDialogueGuide(gongType.id, suType.id).gong
    },
    su: {
      type: suType,
      dialogueGuide: generateDialogueGuide(gongType.id, suType.id).su
    }
  };
}

/**
 * 현재 상태에 맞는 캐릭터 반응 생성
 * @param {string} role - 'gong' 또는 'su'
 * @param {string[]} tags - 캐릭터 태그 배열
 * @param {number} excitement - 흥분도 (0-100)
 * @param {string} situation - 상황 ('normal', 'intimate', etc.)
 * @returns {object} - { moan, dialogue, response }
 */
export function getCharacterReaction(role, tags, excitement, situation = 'normal') {
  const characterType = role === 'gong' ? findGongType(tags) : findSuType(tags);
  
  return {
    moan: getMoanExpression(role, characterType.id, excitement),
    dialogue: getCharDialogue(role, characterType.id, situation),
    excitementResponse: getCharExcitementResponse(characterType, excitement),
    levelName: getExcitementLevelName(excitement)
  };
}

/**
 * 텍스트 품질 검사
 * @param {string} text - 검사할 텍스트
 * @returns {object} - { valid: boolean, issues: array }
 */
export function validateText(text) {
  const issues = checkForbiddenPatterns(text);
  
  return {
    valid: issues.length === 0,
    issues,
    suggestions: issues.map(issue => {
      switch (issue.type) {
        case 'emotion':
          return `"${issue.word}" → 신체 반응으로 대체`;
        case 'japanese':
          return `"${issue.word}" → 한국어 자연스러운 표현으로 대체`;
        case 'meta':
          return `"${issue.word}" → 게임 시스템 용어 삭제`;
        default:
          return `"${issue.word}" 수정 필요`;
      }
    })
  };
}

/**
 * 시스템 프롬프트용 캐릭터 가이드 생성
 */
export function generatePromptGuide(gongTags, suTags, excitement = 0) {
  const profiles = generateCharacterProfiles(gongTags, suTags);
  
  return {
    gong: {
      type: profiles.gong.type.id,
      personality: profiles.gong.type.personality,
      speechPatterns: profiles.gong.type.speechPattern.examples.slice(0, 3),
      currentMoanLevel: getMoanExpression('gong', profiles.gong.type.id, excitement)
    },
    su: {
      type: profiles.su.type.id,
      personality: profiles.su.type.personality,
      speechPatterns: profiles.su.type.speechPattern.examples.slice(0, 3),
      currentMoanLevel: getMoanExpression('su', profiles.su.type.id, excitement)
    },
    excitementLevel: getExcitementLevelName(excitement)
  };
}