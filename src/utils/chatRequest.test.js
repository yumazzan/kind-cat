import { buildRecentHistoryText, MAX_HISTORY_LENGTH, getResponseText } from './chatRequest';

test('긴 대화 이력은 최신 내용을 유지하며 크기를 제한하고 원본을 보존한다', () => {
  const messages = [{ type: 'user', content: '가'.repeat(50000) }, { type: 'dialogue', character: 'A', content: '최신 대화' }];
  const history = buildRecentHistoryText(messages);
  expect(history.length).toBe(MAX_HISTORY_LENGTH);
  expect(history.endsWith('A: "최신 대화"')).toBe(true);
  expect(messages[0].content.length).toBe(50000);
});

test('응답 누락 및 토큰 한도를 읽기 쉬운 오류로 처리한다', () => {
  expect(() => getResponseText({})).toThrow('응답을 생성하지 못했습니다');
  expect(() => getResponseText({ candidates: [{ finishReason: 'MAX_TOKENS' }] })).toThrow('길이 한도');
});

test('여러 텍스트 파트를 합치고 사고 파트는 제외한다', () => {
  expect(getResponseText({ candidates: [{ content: { parts: [{ text: '숨김', thought: true }, { text: '첫째' }, { text: '둘째' }] } }] })).toBe('첫째둘째');
});
