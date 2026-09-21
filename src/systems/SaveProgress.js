/**
 * 스토리별 대화 진행 상황 저장/불러오기 (localStorage 기반)
 */

const STORAGE_PREFIX = 'kind_cat_progress_';

export function saveProgress(storyId, data) {
  const payload = { ...data, savedAt: Date.now() };
  try {
    localStorage.setItem(STORAGE_PREFIX + storyId, JSON.stringify(payload));
    return true;
  } catch (e) {
    // 저장 공간 초과 시, 오래된 메시지를 잘라내고 최근 대화만이라도 저장 시도
    // (대화가 길어질수록 messages 배열이 커져 localStorage 5~10MB 한도를
    // 넘기면서 이어하기 시 진행 상황이 통째로 사라지는 문제의 원인이었음)
    if (data.messages?.length > 60) {
      try {
        const trimmed = { ...payload, messages: data.messages.slice(-60) };
        localStorage.setItem(STORAGE_PREFIX + storyId, JSON.stringify(trimmed));
        console.warn('저장 공간 초과로 최근 60개 메시지만 저장했습니다.');
        return true;
      } catch (e2) {
        console.error('진행 상황 저장 실패 (축소 저장도 실패):', e2);
        return false;
      }
    }
    console.error('진행 상황 저장 실패:', e);
    return false;
  }
}

export function loadProgress(storyId) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + storyId);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('진행 상황 불러오기 실패:', e);
    return null;
  }
}

export function clearProgress(storyId) {
  localStorage.removeItem(STORAGE_PREFIX + storyId);
}

export function hasProgress(storyId) {
  return !!localStorage.getItem(STORAGE_PREFIX + storyId);
}
