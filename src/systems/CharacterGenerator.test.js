import { generateCharacterSet, uniformIndex } from './CharacterGenerator';

beforeAll(() => {
  Object.defineProperty(window, 'crypto', {
    configurable: true,
    value: { getRandomValues: (buffer) => { buffer[0] = Math.floor(Math.random() * 0x100000000); return buffer; } }
  });
});

describe('CharacterGenerator', () => {
  test('uniformIndex always stays in range', () => {
    for (let i = 0; i < 500; i += 1) expect(uniformIndex(7)).toBeGreaterThanOrEqual(0);
    for (let i = 0; i < 500; i += 1) expect(uniformIndex(7)).toBeLessThan(7);
  });

  test('generated combinations satisfy hard conflicts', () => {
    for (let i = 0; i < 500; i += 1) {
      const value = generateCharacterSet({ includeAdult: true });
      const traits = [...value.top.traits, ...value.bottom.traits];
      expect(!(traits.includes('동정공') && traits.includes('문란공'))).toBe(true);
      expect(!(traits.includes('동정수') && traits.includes('문란수'))).toBe(true);
      if (traits.includes('알파공') || traits.includes('오메가수')) expect(value.premise.genre).toBe('오메가버스');
      if (value.top.traits.includes('연하공') || value.bottom.traits.includes('연상수')) expect(value.top.age).toBeLessThan(value.bottom.age);
      if (value.top.traits.includes('장발공')) expect(value.top.appearance.text).not.toMatch(/짧은|포마드/);
      if (['개그/코믹','일상','힐링물','육아물','달달물'].includes(value.premise.mood)) {
        expect(JSON.stringify(value)).not.toMatch(/피폐|가학|하드코어|능욕|고어|감금|강제|납치|폭력|굴림|쓰레기|개아가|냉혈|광기/);
      }
    }
  });

  test('story template export is complete and uses recognized archetypes', () => {
    const value = generateCharacterSet({ includeAdult: true });
    const config = value.storyConfig;
    expect(Object.keys(config)).toEqual(['title','description','storyTags','thumbnail','isBanner','badgeEnabled','badgeText','keywordImages','characterA','characterB','scenario','endings','balanceSettings','excitementSettings','eventKeywords','images']);
    expect(Object.keys(config.characterA)).toEqual(['name','age','occupation','personality','appearance','speech','bodyDetails','secret','callingSystem','specialCallingSituations','honorificLevel','sexualDetails','tags','preferredActions','avoidedActions','visibility','profileImages']);
    expect(Object.keys(config.characterB)).toEqual(['name','age','occupation','personality','appearance','speech','bodyDetails','secret','callingSystem','specialCallingSituations','honorificLevel','sexualDetails','tags','preferredActions','avoidedActions','visibility','profileImages']);
    expect(['#냉혈공','#강공','#광공','#집착공','#싸이코공','#능글공','#개아가공','#다정공','#헌신공','#절륜공','#후회공','#음란침공','#너드공','#찐따공','#퇴폐공','#쾌락공']).toContain(config.characterA.tags[0]);
    expect(['#까칠수','#강수','#츤데레수','#무심수','#순수수','#다정수','#헌신수','#상처수','#자낮수','#허당수','#아방수','#유혹수','#마조수','#이중생활수','#위장수','#집착수','#얀데레수','#공이었수','#도망수','#굴림수','#후회수','#병약수']).toContain(config.characterB.tags[0]);
    expect(config.thumbnail).toBe('');
    expect(config.keywordImages).toEqual([]);
    expect(config.characterA.profileImages).toEqual([]);
    expect(config.endings.true.cgImage).toBe('');
  });
});
