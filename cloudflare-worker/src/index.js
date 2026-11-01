/**
 * KIND CAT - Gemini API 프록시 (Cloudflare Worker)
 * ============================================================
 * 클라이언트(브라우저)는 이 Worker를 호출하고, 실제 Gemini API 키는
 * 여기(env.GEMINI_API_KEY, Cloudflare Secret)에서만 붙여서 구글로 전달함.
 * 이렇게 하면 배포된 사이트의 JS 코드 어디에도 실제 키가 등장하지 않아서,
 * 구글의 "공개 저장소 유출 감지"에 걸려 키가 자동 정지되는 문제가 원천적으로
 * 사라짐 (지금까지는 키가 클라이언트 번들에 그대로 박혀서 반복적으로 정지당함).
 *
 * 클라이언트 호출 형태:
 *   POST https://<이 worker 주소>/generate?model=gemini-flash-lite-latest
 *   body: Gemini generateContent API와 동일한 JSON
 *
 * 응답: 구글 Gemini API 응답을 그대로 전달 (상태 코드 포함)
 */

// 이 프록시를 호출할 수 있는 origin 목록 (우리 사이트 + 로컬 개발 서버만 허용)
const ALLOWED_ORIGINS = [
  'https://yumazzan.github.io',
  'http://localhost:3000'
];

function corsHeaders(origin) {
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin);

    // 프리플라이트 요청
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: { message: 'POST만 지원합니다' } }), {
        status: 405,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    if (!env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: { message: '서버에 GEMINI_API_KEY가 설정되지 않았습니다' } }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    try {
      const url = new URL(request.url);
      const model = url.searchParams.get('model') || 'gemini-flash-lite-latest';
      const body = await request.text();

      const googleRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body
        }
      );

      const responseBody = await googleRes.text();
      return new Response(responseBody, {
        status: googleRes.status,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: { message: '프록시 오류: ' + err.message } }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }
  }
};
