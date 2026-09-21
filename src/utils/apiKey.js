// Gemini API 키/호출 경로 결정
//
// 예전에는 REACT_APP_GEMINI_API_KEY(운영자 키)를 빌드에 그대로 박아넣어
// 누구나 바로 이용할 수 있게 했었는데, 그 키가 배포된 공개 저장소(JS 번들)에
// 노출되어 구글의 유출 탐지에 반복적으로 걸려 자동 정지당하는 문제가 있었음.
//
// 그래서 기본 경로는 Cloudflare Worker 프록시(실제 키는 서버 측에만 존재)로
// 바꾸고, 사용자가 "자기 키"를 직접 입력한 경우에만 그 키로 구글에 직접
// 요청하도록 함(그 키는 각자 브라우저 localStorage에만 있고 공개 배포물에는
// 절대 포함되지 않으므로 안전함).

// Cloudflare Worker 프록시 주소 - 실제 배포 후 이 값을 교체해야 함
export const PROXY_URL = 'https://kindcat-gemini-proxy.kindcat.workers.dev';

// 사용자가 API 키 화면에서 직접 입력해서 저장한 "자기 키" (있으면 이걸 우선 사용).
// 없으면 null을 반환하며, 이 경우 호출부는 PROXY_URL을 통해 요청해야 함.
export function getApiKey() {
  return localStorage.getItem('gemini_api_key') || null;
}
