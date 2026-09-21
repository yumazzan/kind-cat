export const MAX_INPUT_LENGTH = 10000;
export const MAX_HISTORY_LENGTH = 24000;

export function buildRecentHistoryText(messages, maxEntries = 28) {
  const entries = messages.filter(m => ['user', 'dialogue', 'scene'].includes(m.type)).slice(-maxEntries);
  const lines = entries.map(m => {
    if (m.type === 'user') return `[플레이어 입력 - ${m.speaker || '상황'}] ${m.content}`;
    if (m.type === 'scene') return `[장면: ${m.time || ''} / ${m.location || ''}]`;
    return `${m.character}: "${m.content}"`;
  });
  // 최근 맥락을 우선하고, 저장된 메시지 원본은 변경하지 않는다.
  return lines.join('\n').slice(-MAX_HISTORY_LENGTH);
}

export function getResponseText(data) {
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.filter(part => !part.thought && typeof part.text === 'string').map(part => part.text).join('');
  if (text?.trim()) return text;
  if (candidate?.finishReason === 'MAX_TOKENS') {
    throw new Error('AI 응답 길이 한도를 초과했습니다. 입력을 줄여 다시 시도해 주세요.');
  }
  throw new Error('AI가 응답을 생성하지 못했습니다. 입력을 수정해 다시 시도해 주세요.');
}
