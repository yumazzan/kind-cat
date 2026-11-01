#!/usr/bin/env node
/**
 * KIND CAT 이미지 자동 업로더
 * ============================================================
 * ~/Desktop/킨드캣 업로드 폴더를 감시하다가 이미지 파일이 새로 생기면
 * 자동으로 GitHub Pages 배포 브랜치(gh-pages)에 커밋하고, 실제 사용
 * 가능한 URL을 클립보드에 복사 + 맥 알림으로 알려줍니다.
 *
 * 처리된 원본 파일은 같은 폴더 안의 "완료" 하위 폴더로 옮겨져서 재업로드되지 않습니다.
 *
 * 필요한 것: ~/.kindcat-upload-token 파일에 GitHub Personal Access Token 한 줄
 * (어드민 "🔧 이미지 업로드 설정"에 등록한 것과 같은 토큰을 그대로 써도 됩니다)
 *
 * 자동 시작: ~/Library/LaunchAgents/com.kindcat.uploader.plist 로 로그인 시 자동 실행됨
 * 로그 확인: ~/Library/Logs/kindcat-uploader.log
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const WATCH_DIR = path.join(os.homedir(), 'Desktop', '킨드캣 업로드');
const DONE_DIR = path.join(WATCH_DIR, '완료');
const TOKEN_FILE = path.join(os.homedir(), '.kindcat-upload-token');

const REPO_OWNER = 'yumazzan';
const REPO_NAME = 'kind-cat';
const BRANCH = 'gh-pages';
const BASE_URL = 'https://yumazzan.github.io/kind-cat';

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
const MAX_BYTES = 20 * 1024 * 1024; // 20MB - 이보다 크면 건드리지 않고 알림만

function ensureDirs() {
  fs.mkdirSync(WATCH_DIR, { recursive: true });
  fs.mkdirSync(DONE_DIR, { recursive: true });
}

function readToken() {
  try {
    return fs.readFileSync(TOKEN_FILE, 'utf8').trim();
  } catch {
    return null;
  }
}

function notify(title, message) {
  try {
    const esc = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    execFileSync('osascript', ['-e', `display notification "${esc(message)}" with title "${esc(title)}"`]);
  } catch (e) {
    console.error('알림 실패:', e.message);
  }
}

function copyToClipboard(text) {
  try {
    execFileSync('pbcopy', { input: text });
  } catch (e) {
    console.error('클립보드 복사 실패:', e.message);
  }
}

function sanitizeFileName(name) {
  const ext = path.extname(name).toLowerCase();
  const base = path.basename(name, path.extname(name)).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
  return (base || 'image') + (IMAGE_EXT.has(ext) ? ext : '.jpg');
}

// 드래그&드롭/복사 도중 파일이 아직 다 안 써진 상태에서 건드리지 않도록,
// 파일 크기가 두 번 연속 같을 때까지 잠깐 대기
async function waitForStableFile(filePath, tries = 12) {
  let lastSize = -1;
  for (let i = 0; i < tries; i++) {
    if (!fs.existsSync(filePath)) return false;
    const stat = fs.statSync(filePath);
    if (stat.size === lastSize && stat.size > 0) return true;
    lastSize = stat.size;
    await new Promise((r) => setTimeout(r, 500));
  }
  return fs.existsSync(filePath);
}

let warnedNoToken = false;

async function uploadFile(filePath) {
  const token = readToken();
  if (!token) {
    if (!warnedNoToken) {
      notify('킨드캣 업로더', `토큰이 없습니다. ${TOKEN_FILE} 파일을 만들어주세요.`);
      warnedNoToken = true;
    }
    return;
  }
  warnedNoToken = false;

  const stat = fs.statSync(filePath);
  if (stat.size > MAX_BYTES) {
    notify('킨드캣 업로더', `${path.basename(filePath)}가 너무 큽니다 (20MB 초과). 건너뜁니다.`);
    return;
  }

  const fileName = sanitizeFileName(path.basename(filePath));
  const remotePath = `images/uploads/mac-drop/${Date.now()}_${fileName}`;
  const content = fs.readFileSync(filePath).toString('base64');

  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${remotePath}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Mac 폴더 자동 업로드: ${remotePath}`,
        content,
        branch: BRANCH
      })
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error('업로드 실패:', res.status, body);
    notify('킨드캣 업로더 - 실패 ❌', `${path.basename(filePath)} 업로드 실패 (${res.status}). 토큰을 확인해주세요.`);
    return;
  }

  const url = `${BASE_URL}/${remotePath}`;
  copyToClipboard(url);
  notify('킨드캣 업로더 - 완료 ✅', `${path.basename(filePath)} 업로드됨. URL이 클립보드에 복사됐어요.`);
  console.log('업로드 완료:', url);

  const dest = path.join(DONE_DIR, path.basename(filePath));
  try {
    fs.renameSync(filePath, dest);
  } catch (e) {
    console.error('완료 폴더로 이동 실패:', e.message);
  }
}

const processing = new Set();

function handleNewFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!IMAGE_EXT.has(ext)) return;
  if (processing.has(filePath)) return;
  processing.add(filePath);

  waitForStableFile(filePath)
    .then((stillThere) => {
      if (!stillThere) return;
      return uploadFile(filePath);
    })
    .catch((err) => {
      console.error('처리 실패:', err.message);
      notify('킨드캣 업로더 - 오류', err.message);
    })
    .finally(() => processing.delete(filePath));
}

ensureDirs();
console.log('킨드캣 이미지 업로더 감시 시작:', WATCH_DIR);

// fs.watch(FSEvents)가 일부 환경(샌드박스/권한 제약)에서 이벤트를 안 보내는
// 경우가 있어, 더 확실하게 동작하는 폴링 방식으로 감시 (2초 간격)
const POLL_INTERVAL_MS = 2000;
setInterval(() => {
  let entries;
  try {
    entries = fs.readdirSync(WATCH_DIR);
  } catch (e) {
    console.error('폴더 읽기 실패:', e.message);
    return;
  }
  for (const name of entries) {
    if (name === '완료' || name.startsWith('.')) continue;
    const filePath = path.join(WATCH_DIR, name);
    let stat;
    try {
      stat = fs.statSync(filePath);
    } catch {
      continue;
    }
    if (stat.isDirectory()) continue;
    handleNewFile(filePath);
  }
}, POLL_INTERVAL_MS);
