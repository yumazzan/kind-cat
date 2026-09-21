// 어드민 이미지 업로드용 GitHub Personal Access Token 저장/조회.
// Gemini API 키(apiKey.js)와 동일한 패턴 - 브라우저 localStorage에만 저장되고
// 서버로는 절대 전송되지 않음 (업로드 시 GitHub API로만 직접 전송됨).
const STORAGE_KEY = 'github_upload_pat';

export function getGithubToken() {
  return localStorage.getItem(STORAGE_KEY) || null;
}

export function setGithubToken(token) {
  if (token) {
    localStorage.setItem(STORAGE_KEY, token.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// 이 저장소 고정값 - package.json의 homepage와 실제 gh-pages 배포 브랜치 기준
export const GITHUB_REPO_OWNER = 'yumazzan';
export const GITHUB_REPO_NAME = 'kind-cat';
export const GITHUB_PAGES_BRANCH = 'gh-pages';
export const GITHUB_PAGES_BASE_URL = 'https://yumazzan.github.io/kind-cat';
