import React, { useState, useMemo } from 'react';
import { generatePromptPreview, getMilestoneCandidates, INITIAL_GAME_STATE } from '../systems';
import { generateRandomCharacterProfile } from '../utils/randomCharacterGenerator';

// TODO: 아직 미구현 상태 (빌드를 통과시키기 위한 임시 자리표시자입니다).
// CSS(.excitement-levels-grid, .event-keywords-container 등)는 준비되어 있으니
// 추후 본격적으로 구현할 때 참고하세요.

function PlaceholderSection({ title }) {
  return (
    <div className="section-header">
      <h3>{title}</h3>
      <p className="section-description">이 섹션은 아직 준비 중입니다.</p>
    </div>
  );
}

export function ExcitementSettingsSection({ excitementSettings, setExcitementSettings }) {
  return <PlaceholderSection title="🔥 흥분도 레벨 설정" />;
}

export function EventKeywordsSection({ eventKeywords, setEventKeywords }) {
  return <PlaceholderSection title="🏷️ 이벤트 키워드 관리" />;
}

export function EndingPreviewSection({ endings, story }) {
  return <PlaceholderSection title="🎬 엔딩 프리뷰" />;
}

// ============================================================
// 게임 밸런스 설정
// ============================================================

const BALANCE_FIELDS = [
  {
    key: 'affectionGainMin',
    label: '일반 대화 - 호감도 상승 (최소)',
    default: 1,
    min: 0,
    max: 10,
    hint: '캐릭터가 무난한 대화를 할 때마다 오르는 최소 호감도'
  },
  {
    key: 'affectionGainMax',
    label: '선호 행동 - 호감도 상승 (최대)',
    default: 10,
    min: 1,
    max: 30,
    hint: '완벽한 타이밍/선택 시 한 턴에 오를 수 있는 최대 호감도'
  },
  {
    key: 'affectionLossMin',
    label: '혐오 행동 - 호감도 하락 (경미)',
    default: -3,
    min: -20,
    max: 0,
    hint: '가벼운 실수/비선호 행동 시 하락폭'
  },
  {
    key: 'affectionLossMax',
    label: '혐오 행동 - 호감도 하락 (심각)',
    default: -10,
    min: -30,
    max: 0,
    hint: '금지 행동 시도 등 심각한 실수 시 하락폭'
  },
  {
    key: 'excitementGainMax',
    label: '고수위 행동 - 흥분도 상승 (최대)',
    default: 15,
    min: 5,
    max: 40,
    hint: '한 턴에 오를 수 있는 최대 흥분도. 낮출수록 씬이 천천히 달아오름'
  }
];

export function GameBalanceSection({ balanceSettings, setBalanceSettings }) {
  const update = (key, value) => {
    setBalanceSettings({ ...balanceSettings, [key]: Number(value) });
  };

  const reset = () => setBalanceSettings({});

  return (
    <div className="admin-section">
      <h2 className="section-title">⚖️ 게임 밸런스 설정</h2>
      <p className="section-description">
        호감도/흥분도 증감폭과 최소 진행 턴수를 조절합니다. "빌드업이 너무 느리다/급발진한다" 싶으면 여기서 직접 조정하세요.
        비워두면(기본값) 무난한 기본 밸런스로 진행됩니다.
      </p>
      <div className="balance-category">
        <h4>🎚️ 증감폭 · 최소 진행 턴수</h4>
        <div className="form-grid">
          {BALANCE_FIELDS.map(field => {
            const current = balanceSettings?.[field.key] ?? field.default;
            return (
              <div key={field.key} className="form-group full-width">
                <label>{field.label}: <strong>{current}</strong></label>
                <input
                  type="range"
                  min={field.min}
                  max={field.max}
                  step="1"
                  value={current}
                  onChange={(e) => update(field.key, e.target.value)}
                  className="honorific-slider"
                />
                <p className="field-note">💡 {field.hint} (기본값 {field.default})</p>
              </div>
            );
          })}
        </div>
        <button type="button" className="btn-copy-prompt" onClick={reset} style={{ marginTop: '12px' }}>
          ↺ 전부 기본값으로 초기화
        </button>
      </div>
    </div>
  );
}

// ============================================================
// 시스템 프롬프트 미리보기
// ============================================================

export function PromptPreviewSection({ story, adminSettings }) {
  const [relationshipMilestoneIndex, setRelationshipMilestoneIndex] = useState(0);
  const [excitement, setExcitement] = useState(0);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [copied, setCopied] = useState(false);

  const milestoneCandidates = useMemo(() => getMilestoneCandidates(story), [story]);

  const previewGameState = useMemo(() => ({
    ...INITIAL_GAME_STATE,
    relationshipMilestoneIndex,
    excitement,
    currentTurn
  }), [relationshipMilestoneIndex, excitement, currentTurn]);

  const { prompt, stats } = useMemo(() => {
    try {
      return generatePromptPreview(story, previewGameState, adminSettings);
    } catch (err) {
      return { prompt: `⚠️ 프롬프트 생성 중 오류: ${err.message}`, stats: { tokens: 0, characters: 0, lines: 0 } };
    }
  }, [story, previewGameState, adminSettings]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('복사 실패: ' + err.message);
    }
  };

  return (
    <div className="admin-section">
      <h2 className="section-title">📝 시스템 프롬프트 미리보기</h2>
      <p className="section-description">
        지금 설정으로 AI에게 실제로 전달되는 시스템 프롬프트 전체를 확인합니다. 아래 슬라이더로 관계 마일스톤/흥분도/턴수를 바꿔가며
        "이 상황에서 AI가 뭘 보고 있는지"를 직접 점검할 수 있습니다.
      </p>
      <div className="balance-category">
        <h4>🎛️ 미리보기 상태 조절</h4>
        <div className="form-grid">
          <div className="form-group full-width">
            <label>
              관계 마일스톤: <strong>{relationshipMilestoneIndex === 0 ? '아직 없음' : milestoneCandidates[relationshipMilestoneIndex - 1]}</strong>
            </label>
            <input
              type="range"
              min="0"
              max={milestoneCandidates.length}
              value={relationshipMilestoneIndex}
              onChange={(e) => setRelationshipMilestoneIndex(Number(e.target.value))}
              className="honorific-slider"
            />
          </div>
          <div className="form-group full-width">
            <label>흥분도: <strong>{excitement}</strong></label>
            <input type="range" min="0" max="100" value={excitement} onChange={(e) => setExcitement(Number(e.target.value))} className="honorific-slider" />
          </div>
          <div className="form-group full-width">
            <label>현재 턴: <strong>{currentTurn}</strong></label>
            <input type="range" min="1" max="50" value={currentTurn} onChange={(e) => setCurrentTurn(Number(e.target.value))} className="honorific-slider" />
          </div>
        </div>
      </div>

      <div className="prompt-preview-actions">
        <button type="button" className="btn-copy-prompt" onClick={handleCopy}>
          {copied ? '✅ 복사됨' : '📋 전체 복사'}
        </button>
      </div>

      <div className="prompt-preview-container">
        <div className="prompt-stats">
          <span>토큰(추정): <span className="stat-value">{stats.tokens.toLocaleString()}</span></span>
          <span>글자수: <span className="stat-value">{stats.characters.toLocaleString()}</span></span>
          <span>줄 수: <span className="stat-value">{stats.lines.toLocaleString()}</span></span>
        </div>
        <pre className="prompt-preview-text">{prompt}</pre>
      </div>
    </div>
  );
}

// ============================================================
// 무작위 캐릭터 & 서사 조합 생성기
// (19금 요소는 태그로만 표기, 그래픽한 성적 묘사 문장은 생성하지 않음)
// ============================================================

// 19금 성적 가이드 필드명 -> 표시용 라벨. 공(top)은 genital/body/scent/special,
// 수(bottom)은 hole/reactions/nipple/genital/scent/special을 씀 (필드 구성이
// 서로 달라서 하나의 라벨 맵으로 공용 처리)
const SEXUAL_DETAIL_LABELS = {
  genital: '성기', body: '체취/신체', scent: '체향', special: '특수 설정',
  hole: '내부', reactions: '반응', nipple: '유두'
};

function SexualGuideList({ details }) {
  if (!details) return null;
  const entries = Object.entries(details).filter(([, v]) => v);
  if (entries.length === 0) return null;
  return (
    <div className="field-note" style={{ marginTop: '4px' }}>
      <strong>19금 성적 가이드</strong>
      <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
        {entries.map(([key, value]) => (
          <li key={key}>{SEXUAL_DETAIL_LABELS[key] || key}: {value}</li>
        ))}
      </ul>
    </div>
  );
}

function TagChips({ items, keyExtractor = (i) => i.key }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="tag-container">
      {items.map((item, idx) => (
        <span key={idx} className="tag-btn active">#{keyExtractor(item)}</span>
      ))}
    </div>
  );
}

function ProfileColumn({ label, side }) {
  return (
    <div className="form-group full-width">
      <label>{label} 프로필 - {side.name}</label>
      <p className="field-note" style={{ margin: '4px 0' }}>
        나이 <strong>{side.age}세</strong> · 직업 <strong>{side.job}</strong> · 존댓말 유지도 <strong>{side.honorificLevel}</strong>/100
      </p>
      <TagChips items={side.personality} />
      <p className="field-note" style={{ marginTop: '8px' }}><strong>외모</strong> {side.appearanceText}</p>
      <p className="field-note" style={{ marginTop: '4px' }}><strong>말투</strong> {side.speech}</p>
      {side.secret && (
        <p className="field-note" style={{ marginTop: '4px' }}><strong>비밀</strong> {side.secret}</p>
      )}
      <SexualGuideList details={side.sexualDetails} />
    </div>
  );
}

export function RandomGeneratorSection() {
  const [result, setResult] = useState(null);
  const [includeAdult, setIncludeAdult] = useState(false);
  const [copied, setCopied] = useState(false);
  const [configCopied, setConfigCopied] = useState(false);

  const handleGenerate = () => {
    setResult(generateRandomCharacterProfile({ includeAdult }));
    setCopied(false);
    setConfigCopied(false);
  };

  const resultText = useMemo(() => {
    if (!result) return '';
    const lines = [];
    lines.push(`[1. 작품 대전제 - 세계관/장르]`);
    lines.push(`- 세계관/시대: ${result.mood.key}`);
    lines.push(`- 장르: ${result.genre.key}`);
    lines.push('');
    lines.push(`[2. 인물 프로필]`);
    lines.push(`공(Top) ${result.top.name} - ${result.top.age}세 / ${result.top.job}`);
    lines.push(`  성격: ${result.top.personality.map((p) => p.key).join(', ')}`);
    lines.push(`  외모: ${result.top.appearanceText}`);
    lines.push(`  말투: ${result.top.speech}`);
    if (result.top.secret) lines.push(`  비밀: ${result.top.secret}`);
    if (result.top.sexualDetails) {
      Object.entries(result.top.sexualDetails).filter(([, v]) => v).forEach(([k, v]) => {
        lines.push(`  19금 가이드(${SEXUAL_DETAIL_LABELS[k] || k}): ${v}`);
      });
    }
    lines.push(`수(Bottom) ${result.bottom.name} - ${result.bottom.age}세 / ${result.bottom.job}`);
    lines.push(`  성격: ${result.bottom.personality.map((p) => p.key).join(', ')}`);
    lines.push(`  외모: ${result.bottom.appearanceText}`);
    lines.push(`  말투: ${result.bottom.speech}`);
    if (result.bottom.secret) lines.push(`  비밀: ${result.bottom.secret}`);
    if (result.bottom.sexualDetails) {
      Object.entries(result.bottom.sexualDetails).filter(([, v]) => v).forEach(([k, v]) => {
        lines.push(`  19금 가이드(${SEXUAL_DETAIL_LABELS[k] || k}): ${v}`);
      });
    }
    lines.push('');
    lines.push(`[3. 관계 및 서사 전개 - 소재→접점→훅 순으로 정하고, 관계 유형은 그 결과에 맞춰 마지막에 판단]`);
    lines.push(`- 소재: ${result.subjects.map((s) => s.key).join(', ')}`);
    lines.push(`- 접점: ${result.plot.contact}`);
    lines.push(`- 오프닝 훅: ${result.plot.start}`);
    lines.push(`- 관계 유형: ${result.relationship.key}`);
    if (result.plot.conflict) lines.push(`- 주요 갈등: ${result.plot.conflict}`);
    lines.push(`- 전환점: ${result.plot.turningPoint}`);
    lines.push('');
    lines.push(`[4. 19금/성인 요소]`);
    lines.push(result.adultTags.length > 0
      ? `- 수위 태그: ${result.adultTags.map((t) => t.key).join(', ')}`
      : '- 성인 요소 미포함 (체크박스를 켜면 포함됩니다).');
    return lines.join('\n');
  }, [result]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('복사 실패: ' + err.message);
    }
  };

  const handleCopyConfig = async () => {
    try {
      const jsText = `const STORY_CONFIG = ${JSON.stringify(result.storyConfig, null, 2)};`;
      await navigator.clipboard.writeText(jsText);
      setConfigCopied(true);
      setTimeout(() => setConfigCopied(false), 2000);
    } catch (err) {
      alert('복사 실패: ' + err.message);
    }
  };

  return (
    <div className="admin-section">
      <h2 className="section-title">🎲 무작위 캐릭터 & 서사 생성기</h2>
      <p className="section-description">
        키워드 라이브러리에서 완전 무작위(1/N)로 뽑아 인물과 서사를 조합합니다. 나이/세계관/외모/체형/이력 충돌은
        자동으로 예외 처리되고(예: '대형견공'인데 키가 작게 뽑히는 모순 방지), 밝은 톤(달달물/일상/힐링물/개그·코믹/육아물)이
        뽑히면 피폐·가학·하드코어 요소가 자동으로 제외됩니다. 아래 "STORY_CONFIG 복사" 버튼으로 나온 결과를
        <code>.js</code> 파일로 저장해 "📥 JSON에서 가져오기"로 바로 불러올 수 있습니다.
      </p>

      <label className="story-hide-toggle" style={{ marginBottom: '10px' }}>
        <input type="checkbox" checked={includeAdult} onChange={(e) => setIncludeAdult(e.target.checked)} />
        19금 요소 포함 (밝은 톤이 뽑히면 어차피 자동 제외됨)
      </label>

      <button type="button" className="btn-copy-prompt" onClick={handleGenerate}>
        🎲 무작위로 뽑기
      </button>

      {result && (
        <div className="prompt-preview-container" style={{ marginTop: '16px' }}>
          <div className="form-group full-width">
            <label>1. 작품 대전제 - 세계관/장르</label>
            <TagChips items={[result.mood, result.genre]} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
            <ProfileColumn label="공(Top)" side={result.top} />
            <ProfileColumn label="수(Bottom)" side={result.bottom} />
          </div>

          <div className="form-group full-width" style={{ marginTop: '12px' }}>
            <label>3. 관계 및 서사 전개 - 소재→접점→훅 순으로 정한 뒤, 관계 유형은 마지막에 판단</label>
            <TagChips items={result.subjects} />
            <p className="field-note" style={{ marginTop: '8px' }}>접점: {result.plot.contact}</p>
            <p className="field-note">오프닝 훅: {result.plot.start}</p>
            <p className="field-note">관계 유형: <strong>{result.relationship.key}</strong></p>
            {result.plot.conflict && <p className="field-note">주요 갈등: {result.plot.conflict}</p>}
            <p className="field-note">전환점: {result.plot.turningPoint}</p>
          </div>

          <div className="form-group full-width" style={{ marginTop: '12px' }}>
            <label>4. 19금/성인 요소 (태그)</label>
            {result.adultTags.length > 0
              ? <TagChips items={result.adultTags} />
              : <p className="field-note">성인 요소가 포함되지 않았습니다.</p>}
          </div>

          <div className="form-group full-width" style={{ marginTop: '12px' }}>
            <label>5. 일관성 검증 체크리스트</label>
            {result.consistency.map((line, idx) => (
              <p key={idx} className="field-note">✅ {line}</p>
            ))}
          </div>

          <div className="prompt-preview-actions" style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <button type="button" className="btn-copy-prompt" onClick={handleCopy}>
              {copied ? '✅ 복사됨' : '📋 결과 요약 복사'}
            </button>
            <button type="button" className="btn-copy-prompt" onClick={handleCopyConfig}>
              {configCopied ? '✅ 복사됨' : '🧩 STORY_CONFIG 복사 (JSON 가져오기용)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
