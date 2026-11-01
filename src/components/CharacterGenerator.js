import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { generateCharacterSet } from '../systems/CharacterGenerator';
import './CharacterGenerator.css';

const Tags = ({ items }) => <div className="cg-tags">{items.map(item => <span key={item}>#{item}</span>)}</div>;

function CharacterCard({ role, data }) {
  return (
    <article className={`cg-person ${role}`}>
      <div className="cg-person-head"><span>{role === 'top' ? 'TOP' : 'BOTTOM'}</span><h3>{data.name}</h3><b>{data.age}세</b></div>
      <p className="cg-job">{data.job}</p>
      <Tags items={data.traits} />
      <dl>
        <div><dt>반전 / 갭모에</dt><dd>{data.gap}</dd></div>
        <div><dt>성격</dt><dd>{data.description}</dd></div>
        <div><dt>외모 & 체형</dt><dd>{data.appearance.text}</dd></div>
        <div><dt>매력 포인트</dt><dd>{data.appearance.charm}</dd></div>
      </dl>
    </article>
  );
}

function CharacterGenerator() {
  const [includeAdult, setIncludeAdult] = useState(false);
  const [result, setResult] = useState(() => generateCharacterSet());
  const [copied, setCopied] = useState(false);
  const [configCopied, setConfigCopied] = useState(false);
  const resultRef = useRef(null);

  const regenerate = () => {
    setResult(generateCharacterSet({ includeAdult }));
    setCopied(false);
    setConfigCopied(false);
    window.requestAnimationFrame(() => resultRef.current?.focus());
  };

  useEffect(() => { setResult(generateCharacterSet({ includeAdult })); }, [includeAdult]);

  const asText = () => `🎲 무작위 캐릭터 & 서사 조합\n\n[1. 작품 대전제]\n메인 장르 / 세계관: ${result.premise.genre}\n작품 분위기: ${result.premise.mood}\n주요 관계성: ${result.premise.relationship}\n핵심 서사 소재: ${result.premise.subjects.join(', ')}\n\n[2. 인물 프로필]\n공: ${result.top.name} / ${result.top.age}세 / ${result.top.job}\n성격: ${result.top.traits.join(', ')} / 반전: ${result.top.gap}\n${result.top.description}\n외모: ${result.top.appearance.text}\n\n수: ${result.bottom.name} / ${result.bottom.age}세 / ${result.bottom.job}\n성격: ${result.bottom.traits.join(', ')} / 반전: ${result.bottom.gap}\n${result.bottom.description}\n외모: ${result.bottom.appearance.text}\n\n[3. 관계 및 서사]\n직업 및 접점: ${result.plot.contact}\n첫 만남: ${result.plot.opening}\n주요 갈등: ${result.plot.conflict}\n전환점 / 구원: ${result.plot.turn}${result.adult.length ? `\n\n[4. 성인 요소]\n${result.adult.join(', ')}\n${result.adultNote}` : ''}\n\n[5. 일관성 검증]\n${result.validation.map(x => `[x] ${x}`).join('\n')}`;

  const copyResult = async () => { await navigator.clipboard.writeText(asText()); setCopied(true); };
  const copyConfig = async () => {
    await navigator.clipboard.writeText(`const STORY_CONFIG = ${JSON.stringify(result.storyConfig, null, 2)};`);
    setConfigCopied(true);
  };

  return (
    <main className="cg-page">
      <nav className="cg-nav"><Link to="/">← 스토리 보관함</Link><span>KIND CAT / STORY LAB</span></nav>
      <header className="cg-hero">
        <div><p className="cg-kicker">BIAS-ZERO CHARACTER DRAW</p><h1>우연을 뽑고,<br/><i>개연성</i>을 남긴다.</h1></div>
        <div className="cg-control-card">
          <p>문서 라이브러리 기반 조건부 추첨</p>
          <label><input type="checkbox" checked={includeAdult} onChange={e => setIncludeAdult(e.target.checked)} /><span>성인 요소 포함</span></label>
          <button onClick={regenerate}><span aria-hidden="true">✦</span> 새 조합 추첨</button>
          <small>각 후보는 동일 확률로 추첨되며 충돌 항목만 제외됩니다.</small>
        </div>
      </header>

      <section className="cg-result" ref={resultRef} tabIndex="-1" aria-live="polite">
        <div className="cg-section-title"><span>01</span><div><p>WORLD & ATMOSPHERE</p><h2>작품 대전제</h2></div><time>{result.seedLabel}</time></div>
        <div className="cg-premise">
          <div><small>세계관</small><strong>{result.premise.genre}</strong></div>
          <div><small>분위기</small><strong>{result.premise.mood}</strong></div>
          <div><small>관계</small><strong>{result.premise.relationship}</strong></div>
        </div>
        <Tags items={result.premise.subjects} />

        <div className="cg-section-title"><span>02</span><div><p>TOP & BOTTOM</p><h2>인물 프로필</h2></div></div>
        <div className="cg-people"><CharacterCard role="top" data={result.top}/><CharacterCard role="bottom" data={result.bottom}/></div>

        <div className="cg-section-title"><span>03</span><div><p>PLOT & DYNAMIC</p><h2>관계 및 서사 전개</h2></div></div>
        <ol className="cg-plot">
          <li><b>직업 및 접점</b><p>{result.plot.contact}</p></li>
          <li><b>첫 만남 / 관계의 시작</b><p>{result.plot.opening}</p></li>
          <li><b>주요 갈등 요인</b><p>{result.plot.conflict}</p></li>
          <li><b>관계의 전환점 / 구원</b><p>{result.plot.turn}</p></li>
        </ol>

        {result.adult.length > 0 && <><div className="cg-section-title"><span>04</span><div><p>ADULT CONTENT</p><h2>성인 요소</h2></div></div><div className="cg-adult"><Tags items={result.adult}/><p>{result.adultNote}</p></div></>}

        <div className="cg-checks"><div><p>CONSISTENCY CHECK</p><h2>충돌 검증 완료</h2></div><ul>{result.validation.map(x => <li key={x}>✓ {x}</li>)}</ul>{result.corrections.length > 0 && <details><summary>자동 보정 {result.corrections.length}건</summary>{result.corrections.map(x => <p key={x}>{x}</p>)}</details>}</div>

        <div className="cg-section-title"><span>05</span><div><p>APP BLUEPRINT</p><h2>앱 등록용 상세 설정</h2></div></div>
        <div className="cg-blueprint">
          <div className="cg-blueprint-intro"><strong>{result.storyConfig.title}</strong><p>{result.storyConfig.description}</p></div>
          <details open><summary>숨겨진 비밀과 반전</summary><div className="cg-secret-grid"><p><b>{result.top.name}</b>{result.storyConfig.characterA.secret}</p><p><b>{result.bottom.name}</b>{result.storyConfig.characterB.secret}</p></div></details>
          <details><summary>말투 · 호칭 변화 · 행동 성향</summary><div className="cg-secret-grid"><div><b>{result.top.name}</b><p>{result.storyConfig.characterA.speech}</p><p>선호: {result.storyConfig.characterA.preferredActions.join(' · ')}</p></div><div><b>{result.bottom.name}</b><p>{result.storyConfig.characterB.speech}</p><p>선호: {result.storyConfig.characterB.preferredActions.join(' · ')}</p></div></div></details>
          <details open><summary>시나리오의 함정과 전체 전개</summary><p>{result.storyConfig.scenario.background}</p></details>
          <details><summary>4종 엔딩 설계</summary><div className="cg-ending-grid">{Object.entries(result.storyConfig.endings).map(([key,value])=><div key={key}><small>{key.toUpperCase()}</small><b>{value.name}</b><p>{value.description}</p></div>)}</div></details>
          <div className="cg-config-note"><span>이미지 필드</span><b>전부 빈 값으로 유지됨</b><span>아키타입 태그</span><b>{result.storyConfig.characterA.tags[0]} · {result.storyConfig.characterB.tags[0]}</b></div>
        </div>
        <div className="cg-actions"><button className="secondary" onClick={copyResult}>{copied ? '기획서 복사됨 ✓' : '기획서 텍스트 복사'}</button><button className="config" onClick={copyConfig}>{configCopied ? 'STORY_CONFIG 복사됨 ✓' : 'STORY_CONFIG 코드 복사'}</button><button onClick={regenerate}>다시 추첨</button></div>
      </section>
    </main>
  );
}

export default CharacterGenerator;
