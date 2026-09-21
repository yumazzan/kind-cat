import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// 시스템 모듈 import
import { buildSystemPrompt, estimateTokens, getMilestoneCandidates } from '../systems';
import {
  parseAIResponse
} from '../systems';
import {
  INITIAL_GAME_STATE,
  getExcitementLevel,
  resolveMilestoneIndex,
  checkBranchPoint
} from '../systems';
import { saveProgress, loadProgress, clearProgress } from '../systems';
import { getApiKey, PROXY_URL } from '../utils/apiKey';

import { MAX_INPUT_LENGTH, buildRecentHistoryText, getResponseText } from '../utils/chatRequest';

import './ChatInterface.css';

// AI가 가끔 "호감도 60 이상일 때 가능한 행동입니다" 같은 게임 시스템 용어를
// 지문/대사/선택지에 그대로 흘려보내는 경우가 있음 (Writingguidelines.js에
// 이미 금지 규칙이 있지만 프롬프트 지시만으로는 100% 막히지 않음). 프롬프트
// 지시에만 의존하지 않고, 화면에 보여주기 직전에 한 번 더 걸러내는 안전망.
const META_LEAK_WORDS = ['호감도', '흥분도', '선택지', '플레이어'];
function hasMetaLeak(text) {
  if (!text) return false;
  return META_LEAK_WORDS.some((w) => text.includes(w));
}

function ChatInterface() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  
  // 기본 state
  const [story, setStory] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStory, setIsLoadingStory] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [userPerspective, setUserPerspective] = useState('A'); // 사용자가 연기하는 캐릭터 (A: 공, B: 수)
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(null);

  // 게임 상태 (통합) - 2026-09: 호감도 점수를 폐지하고 관계 마일스톤 인덱스로
  // 대체함 (Gamestate.js 상단 주석 참고)
  const [gameState, setGameState] = useState({
    excitement: 0,
    relationshipMilestoneIndex: 0,
    currentTurn: 1,
    triggeredKeywords: [],
    triggeredEvents: [],
    badChoiceCount: 0,
    currentScene: {
      time: null,
      location: null,
      charAState: null,
      charBState: null
    }
  });

  // AdminPage 설정 (스토리에서 로드)
  const [adminSettings, setAdminSettings] = useState({
    excitementSettings: {},
    eventKeywords: {},
    balanceSettings: {}
  });

  // 분기점 알림
  const [branchNotification, setBranchNotification] = useState(null);

  // 캐릭터 프로필 카드 / 이미지 원본 팝업
  const [profileModalSide, setProfileModalSide] = useState(null); // 'a' | 'b' | null
  const [lightboxImage, setLightboxImage] = useState(null); // 원본으로 볼 이미지 src | null

  // 진행 상황 저장 실패 경고 (localStorage 용량 초과 등)
  const [saveWarning, setSaveWarning] = useState(false);

  const messagesEndRef = useRef(null);

  // 편의를 위한 개별 값 추출
  const { excitement, relationshipMilestoneIndex } = gameState;

  // 이 스토리의 관계 마일스톤 후보 목록 (호칭 시스템의 condition을 그대로 재사용 -
  // Promptbuilder.getMilestoneCandidates 참고). AI가 돌려준 new_milestone 문구를
  // 인덱스로 바꾸거나, 다음 마일스톤 이름을 표시할 때 이 목록을 씀.
  const milestoneCandidates = story ? getMilestoneCandidates(story) : [];
  const currentMilestoneLabel = relationshipMilestoneIndex > 0
    ? milestoneCandidates[relationshipMilestoneIndex - 1]
    : null;
  // 기존 "호감도 N 이상" 상황 이미지(story.keywordImages)와의 호환을 위해,
  // 마일스톤 진행도를 0~100 스케일의 합성값으로도 계산해둔다 (관계 진행도
  // 퍼센트로 취급 - AI가 직접 보고하는 점수가 아니라 마일스톤 개수 기반)
  const avgAffection = milestoneCandidates.length > 0
    ? Math.round((relationshipMilestoneIndex / milestoneCandidates.length) * 100)
    : 0;

  // ============================================
  // 유틸리티 함수
  // ============================================

  // 대사 안의 따옴표 제거 (AI가 대사를 "..."로 감싸서 출력하는 습관 방지)
  const stripQuotes = (text) => {
    if (!text) return text;
    return text.replace(/["“”]/g, '').trim();
  };

  // 이미지 경로 처리
  const getImageSrc = useCallback((imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    
    const publicUrl = process.env.PUBLIC_URL || '';
    let cleanPath = imagePath;
    
    while (cleanPath.startsWith(publicUrl) && publicUrl) {
      cleanPath = cleanPath.substring(publicUrl.length);
    }
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    
    return `${publicUrl}${cleanPath}`;
  }, []);

  // 화자 이름으로 공(a)/수(b) 판별
  const getSide = useCallback((speakerName) => {
    if (story?.characterB?.name && speakerName === story.characterB.name) return 'b';
    return 'a';
  }, [story]);

  // AI가 직전 맥락(지시/약속/질문 등)을 잊지 않도록 최근 대화 흐름을 텍스트로 요약
  // 지문(narration) 전문은 일부러 제외 - AI가 자기 이전 응답의 감각 묘사(형광등/냄새 등)를
  // 그대로 다시 베끼는 반복 패턴을 만들어내는 원인이라 사실 관계(대사/입력/장면)만 남김


  // 입력에 이동을 암시하는 표현이 있는지 감지 - 감지되면 이번 턴에 한해
  // location 필드를 강제로 갱신하도록 프롬프트에 강한 지시를 추가
  const MOVEMENT_KEYWORDS = [
    '따라와', '따라오', '따라가', '들어가', '들어와', '노크', '문을 열', '문을 닫',
    '이동하', '걷는다', '걸어', '자리를 옮기', '차에 타', '엘리베이터', '계단',
    '데려가', '끌고 가', '끌려', '자리를 피하', '나가', '나간다'
  ];
  const detectMovementHint = useCallback((text) => {
    if (!text) return null;
    return MOVEMENT_KEYWORDS.find(k => text.includes(k)) || null;
  }, []);

  // 평범한 일상/업무 대화인지 감지 - 감지되면 이번 턴만 "긴장감 없이 평범하게"
  // 지시를 강하게 추가 (프롬프트 전체에 저항/긴장 규칙이 많아 일반 규칙만으로는
  // 잘 안 지켜져서, 이동 감지와 같은 방식으로 턴 단위 강제 지시를 사용)
  const CASUAL_KEYWORDS = [
    '인사', '안녕', '점심', '식사', '커피', '날씨', '고생', '수고', '회진',
    '차트 확인', '스케줄 확인', '보고한다', '물어본다', '잘 지냈'
  ];
  const ESCALATION_KEYWORDS = [
    '잡아', '끌어', '밀어붙', '키스', '만지', '스킨십', '넥타이', '벽으로',
    '억제제', '페로몬', '가슴', '허리', '입술', '신음', '문을 잠', '노크',
    '침대', '옷을', '벗'
  ];
  const detectCasualHint = useCallback((text) => {
    if (!text) return null;
    if (ESCALATION_KEYWORDS.some(k => text.includes(k))) return null;
    return CASUAL_KEYWORDS.find(k => text.includes(k)) || null;
  }, []);

  // 스크롤 자동 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 진행 상황 자동 저장 (스토리 로딩 완료 후에만)
  useEffect(() => {
    if (isLoadingStory || !story) return;
    const ok = saveProgress(storyId, { messages, gameState, userPerspective, backgroundImage });
    setSaveWarning(!ok);
  }, [messages, gameState, userPerspective, backgroundImage, isLoadingStory, story, storyId]);

  // ============================================
  // 스토리 로드
  // ============================================

  const loadStory = useCallback(async () => {
    console.log('🔍 Loading story for chat with ID:', storyId);
    
    try {
      // 1. Firebase에서 먼저 찾기
      const docRef = doc(db, 'stories', String(storyId));
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const foundStory = { id: docSnap.id, ...docSnap.data() };
        console.log('✅ Story found in Firebase:', foundStory.title);
        initializeStory(foundStory);
        return;
      }
      
      // 2. localStorage에서 찾기
      const stories = JSON.parse(localStorage.getItem('kind_cat_stories') || '[]');
      const foundStory = stories.find(s => String(s.id) === String(storyId));
      
      if (foundStory) {
        console.log('✅ Story found in localStorage:', foundStory.title);
        initializeStory(foundStory);
        return;
      }
      
      // 3. 못 찾음
      console.error('❌ Story not found:', storyId);
      setIsLoadingStory(false);
      alert('스토리를 찾을 수 없습니다!');
      navigate('/');
      
    } catch (error) {
      console.error('❌ Error loading story:', error);
      
      // Firebase 에러 시 localStorage fallback
      try {
        const stories = JSON.parse(localStorage.getItem('kind_cat_stories') || '[]');
        const foundStory = stories.find(s => String(s.id) === String(storyId));
        
        if (foundStory) {
          console.log('✅ Fallback to localStorage:', foundStory.title);
          initializeStory(foundStory);
          return;
        }
      } catch (e) {
        console.error('localStorage error:', e);
      }
      
      setIsLoadingStory(false);
      alert('스토리 로딩 중 오류가 발생했습니다.');
      navigate('/');
    }
  }, [storyId, navigate]);

  // 스토리 초기화
  const initializeStory = (foundStory) => {
    setStory(foundStory);

    // AdminPage 설정 로드
    setAdminSettings({
      excitementSettings: foundStory.excitementSettings || {},
      eventKeywords: foundStory.eventKeywords || {},
      balanceSettings: foundStory.balanceSettings || {}
    });

    // 저장된 진행 상황이 있으면 이어서 불러오기
    const saved = loadProgress(storyId);
    if (saved) {
      setGameState(saved.gameState);
      setMessages(saved.messages);
      setUserPerspective(saved.userPerspective || 'A');
      setBackgroundImage(saved.backgroundImage || null);
      setIsLoadingStory(false);
      return;
    }

    // 게임 상태 초기화
    setGameState({
      ...INITIAL_GAME_STATE,
      currentScene: {
        time: foundStory.scenario?.time || null,
        location: foundStory.scenario?.location || null,
        charAState: null,
        charBState: null
      }
    });

    // 시작 메시지
    setMessages([
      {
        role: 'system',
        content: foundStory.scenario?.situation || '두 사람이 마주쳤다.',
        type: 'narration'
      }
    ]);

    setIsLoadingStory(false);
  };

  useEffect(() => {
    loadStory();
  }, [loadStory]);

  // ============================================
  // 배경 이미지 업데이트
  // ============================================

  // "호감도 20 이상", "호감도 20점 이상" 같은 문구에서 숫자만 뽑아냄.
  // 이 패턴에 해당하는 상황 이미지는 플레이어가 입력을 안 쳐도 호감도가
  // 그 기준을 넘는 순간 자동으로 배경에 반영됨 (기존 "호감도별 배경" 기능을
  // 대체 - 이제는 이 통합된 상황 이미지 목록 하나로 관리)
  const parseAffectionThreshold = (text) => {
    if (!text) return null;
    const match = text.match(/호감도\s*(\d+)\s*(?:점)?\s*이상/);
    return match ? parseInt(match[1], 10) : null;
  };

  const updateBackgroundImage = useCallback((keyword = null) => {
    if (!story) return;

    // 1. 플레이어가 입력한 문구와 일치하는 상황 이미지 (우선)
    if (keyword && story.keywordImages) {
      const keywordImage = story.keywordImages.find(ki =>
        ki.keyword && parseAffectionThreshold(ki.keyword) === null &&
        keyword.toLowerCase().includes(ki.keyword.toLowerCase())
      );
      if (keywordImage?.imagePath) {
        console.log('🖼️ 상황 이미지/배경 변경:', keyword);
        // 배경 전용 이미지가 따로 설정되어 있으면 그걸 배경으로, 없으면 채팅에 보낸
        // 이벤트 이미지를 그대로 배경으로도 사용
        const bgTarget = keywordImage.backgroundPath || keywordImage.imagePath;
        // 배경이 실제로 바뀔 때만 채팅창에 이미지 전송 메시지를 1회 표시
        // (backgroundImage를 의존성에 넣지 않기 위해 함수형 업데이트로 이전 값을 확인)
        setBackgroundImage(prevBg => {
          if (bgTarget !== prevBg) {
            setMessages(prevMsgs => [...prevMsgs, { role: 'system', type: 'image', content: keywordImage.imagePath }]);
          }
          return bgTarget;
        });
        return;
      }
    }

    // 2. 호감도 기준 자동 적용 ("호감도 N 이상"으로 등록된 상황 이미지 중
    // 지금 평균 호감도 이상을 만족하는 것 중 가장 높은 기준값 그룹에서 선택)
    if (story.keywordImages) {
      const affectionEntries = story.keywordImages
        .map(ki => ({ ...ki, threshold: parseAffectionThreshold(ki.keyword) }))
        .filter(ki => ki.threshold !== null && ki.threshold <= avgAffection && ki.imagePath);

      if (affectionEntries.length > 0) {
        const maxThreshold = Math.max(...affectionEntries.map(ki => ki.threshold));
        const candidates = affectionEntries.filter(ki => ki.threshold === maxThreshold);
        // 같은 기준값에 여러 장 등록돼 있으면 호감도 값에 따라 결정적으로 순환 선택
        // (매 렌더마다 랜덤이면 배경이 계속 깜빡이므로 고정된 규칙으로 고름)
        const picked = candidates[avgAffection % candidates.length];
        const bgTarget = picked.backgroundPath || picked.imagePath;

        setBackgroundImage(prevBg => {
          if (prevBg && bgTarget !== prevBg) {
            setMessages(prevMsgs => [...prevMsgs, { role: 'system', type: 'image', content: picked.imagePath }]);
          }
          return bgTarget;
        });
      }
    }
    // NOTE: backgroundImage(현재 배경)를 의존성에서 의도적으로 제외함 -
    // 포함하면 배경이 바뀔 때마다 이 함수 참조가 바뀌고, 아래 useEffect가
    // 재실행되며 keyword 없이 다시 호출되어 호감도 기반 배경으로 즉시
    // 되돌아가버리는 문제(키워드 배경이 반영되자마자 원복되는 버그)가 있었음
  }, [story, avgAffection]);

  useEffect(() => {
    if (story?.keywordImages) {
      updateBackgroundImage();
    }
  }, [avgAffection, story, updateBackgroundImage]);

  // ============================================
  // 키워드 체크
  // ============================================

  // 사용자 입력에서 키워드 체크 (상황 이미지 텍스트 매칭만 - "호감도 N 이상"은
  // 관계 마일스톤 진행 시점에 자동 체크됨, updateBackgroundImage 참고)
  const checkKeywordInInput = (text) => {
    if (!story) return;

    if (story.keywordImages) {
      for (const ki of story.keywordImages) {
        if (ki.keyword && parseAffectionThreshold(ki.keyword) === null && text.toLowerCase().includes(ki.keyword.toLowerCase())) {
          updateBackgroundImage(ki.keyword);
          break;
        }
      }
    }
  };

  // ============================================
  // 게임 상태 업데이트
  // ============================================

  const updateGameState = (parsed) => {
    // 밸런스 설정에서 제한값 가져오기
    const { excitementGainMax = 15 } = adminSettings.balanceSettings || {};

    let excitementChange = parsed.scores?.excitementChange || parsed.excitement_change || 0;
    excitementChange = Math.max(-20, Math.min(excitementGainMax, excitementChange));

    // 관계 마일스톤 갱신 - AI가 돌려준 new_milestone 문구를 이 스토리의 후보
    // 목록(milestoneCandidates)에서 찾아 인덱스로 변환. 못 찾으면 그대로 유지
    // (뒤로 가지 않음, advanceMilestone/resolveMilestoneIndex와 동일한 규칙)
    const newMilestoneText = parsed.newMilestone || parsed.new_milestone || null;
    const foundIndex = resolveMilestoneIndex(newMilestoneText, milestoneCandidates);
    const newMilestoneIndex = foundIndex !== null
      ? Math.max(relationshipMilestoneIndex, foundIndex)
      : relationshipMilestoneIndex;

    setGameState(prev => {
      const newExcitement = Math.max(0, Math.min(100, prev.excitement + excitementChange));

      // 트리거된 키워드 업데이트
      const newKeywords = [...prev.triggeredKeywords];
      if (parsed.triggered_keywords) {
        parsed.triggered_keywords.forEach(kw => {
          if (!newKeywords.includes(kw)) {
            newKeywords.push(kw);
          }
        });
      }

      return {
        ...prev,
        excitement: newExcitement,
        relationshipMilestoneIndex: Math.max(prev.relationshipMilestoneIndex, newMilestoneIndex),
        currentTurn: prev.currentTurn + 1,
        triggeredKeywords: newKeywords,
        currentScene: parsed.meta ? {
          time: parsed.meta.time || parsed.time || prev.currentScene.time,
          location: parsed.meta.location || parsed.location || prev.currentScene.location,
          // char_a_state/char_b_state는 AI가 이번 턴에 빠뜨릴 수 있음(응답이 잘렸거나 필드 생략) -
          // 이 경우 이전 턴의 자세로 폴백하지 않으면 다음 턴 프롬프트에서 "정해진 자세 없음"으로
          // 리셋되어 포즈/자세 연속성이 끊긴다. time/location과 동일하게 이전 값으로 폴백할 것.
          charAState: parsed.meta.charAState || parsed.meta.char_a_state || parsed.char_a_state || prev.currentScene.charAState,
          charBState: parsed.meta.charBState || parsed.meta.char_b_state || parsed.char_b_state || prev.currentScene.charBState
        } : prev.currentScene
      };
    });

    // 분기점 체크 - 마일스톤이 실제로 전진했을 때만 알림
    if (newMilestoneIndex > relationshipMilestoneIndex) {
      const milestoneText = milestoneCandidates[newMilestoneIndex - 1];
      const branchCheck = checkBranchPoint(relationshipMilestoneIndex, newMilestoneIndex, milestoneText);
      if (branchCheck.reached) {
        setBranchNotification(branchCheck.message);
        setTimeout(() => setBranchNotification(null), 4000);
      }
    }

    // 이벤트 키워드 체크
    checkEventKeywords(parsed);
  };
  
  // 이벤트 키워드 체크 함수
  const checkEventKeywords = (parsed) => {
    const { eventKeywords = {} } = adminSettings;
    const responseText = JSON.stringify(parsed).toLowerCase();
    
    // 분기점 키워드 체크
    if (eventKeywords.branchPoints) {
      eventKeywords.branchPoints.forEach(bp => {
        if (bp.enabled !== false && responseText.includes(bp.keyword?.toLowerCase())) {
          setBranchNotification(`🔀 ${bp.effect || '중요한 분기점에 도달했습니다!'}`);
          setTimeout(() => setBranchNotification(null), 4000);
        }
      });
    }
    
    // 특별 이벤트 키워드 체크
    if (eventKeywords.specialEvents) {
      eventKeywords.specialEvents.forEach(se => {
        if (se.enabled !== false && responseText.includes(se.keyword?.toLowerCase())) {
          setMessages(prev => [...prev, {
            role: 'system',
            content: `✨ ${se.effect || '특별한 이벤트가 발생했습니다!'}`,
            type: 'event'
          }]);
        }
      });
    }
  };

  // ============================================
  // AI 응답 처리
  // ============================================

  const processAIResponse = (aiResponse) => {
    // 시스템 모듈의 파서 사용
    const parsed = parseAIResponse(aiResponse);
    
    if (parsed.success) {
      // 게임 상태 업데이트
      updateGameState(parsed.isFallback ? { scores: {} } : parsed);

      const newMessages = [];

      // 메타 정보 → 장면 카드 (실제로 시간/장소가 바뀌었을 때만, 시간·장소만 표시)
      if (parsed.meta && (parsed.meta.time || parsed.meta.location)) {
        const newTime = parsed.meta.time || parsed.time || gameState.currentScene.time || '현재';
        const newLocation = parsed.meta.location || parsed.location || gameState.currentScene.location || '알 수 없음';

        const prevScene = gameState.currentScene;
        const sceneChanged =
          prevScene.time !== newTime ||
          prevScene.location !== newLocation;

        if (sceneChanged) {
          newMessages.push({
            role: 'assistant',
            type: 'scene',
            time: newTime,
            location: newLocation
          });
        }
      }

      // 캐릭터별 자세/의상 변화 - 몰입감을 해치지 않도록 별도 카드로 묶어서 보여주지 않고,
      // 실제로 바뀐 경우에만 그 캐릭터의 대사에 짧게 붙임 (의상은 이름 옆 캡션, 행동은 말풍선 아래)
      const prevCharAState = gameState.currentScene.charAState || {};
      const prevCharBState = gameState.currentScene.charBState || {};
      const newCharAState = parsed.meta?.charAState || parsed.char_a_state || {};
      const newCharBState = parsed.meta?.charBState || parsed.char_b_state || {};
      const stateChangeA = {
        pose: newCharAState.pose && newCharAState.pose !== prevCharAState.pose ? newCharAState.pose : null,
        clothing: newCharAState.clothing && newCharAState.clothing !== prevCharAState.clothing ? newCharAState.clothing : null
      };
      const stateChangeB = {
        pose: newCharBState.pose && newCharBState.pose !== prevCharBState.pose ? newCharBState.pose : null,
        clothing: newCharBState.clothing && newCharBState.clothing !== prevCharBState.clothing ? newCharBState.clothing : null
      };
      let stateNoteShownA = false;
      let stateNoteShownB = false;

      // 서술/대사 - beats 배열이 있으면 실제 장면 순서 그대로 렌더링(서술↔대사 교차 가능),
      // 없으면(구버전 응답 등) narration 전체 → dialogues 순서로 렌더링
      const beats = parsed.raw?.beats;
      if (Array.isArray(beats) && beats.length > 0) {
        beats.forEach(beat => {
          if (beat.type === 'narration' && beat.text && !hasMetaLeak(beat.text)) {
            newMessages.push({
              role: 'assistant',
              content: beat.text,
              type: 'narration'
            });
          } else if (beat.type === 'dialogue' && beat.speaker && beat.text && !hasMetaLeak(beat.text)) {
            const side = getSide(beat.speaker);
            const msg = {
              role: 'assistant',
              type: 'dialogue',
              character: beat.speaker,
              content: stripQuotes(beat.text),
              side
            };
            if (side === 'a' && !stateNoteShownA && (stateChangeA.pose || stateChangeA.clothing)) {
              if (stateChangeA.pose) msg.actionNote = stateChangeA.pose;
              if (stateChangeA.clothing) msg.clothingNote = stateChangeA.clothing;
              stateNoteShownA = true;
            } else if (side === 'b' && !stateNoteShownB && (stateChangeB.pose || stateChangeB.clothing)) {
              if (stateChangeB.pose) msg.actionNote = stateChangeB.pose;
              if (stateChangeB.clothing) msg.clothingNote = stateChangeB.clothing;
              stateNoteShownB = true;
            }
            newMessages.push(msg);
          }
        });
      } else {
        // 서술
        if (parsed.narration && !hasMetaLeak(parsed.narration)) {
          newMessages.push({
            role: 'assistant',
            content: parsed.narration,
            type: 'narration'
          });
        }

        // 대사
        if (parsed.dialogues && parsed.dialogues.length > 0) {
          parsed.dialogues.forEach(d => {
            if (d.speaker && d.text && !hasMetaLeak(d.text)) {
              newMessages.push({
                role: 'assistant',
                type: 'dialogue',
                character: d.speaker,
                content: stripQuotes(d.text),
                side: getSide(d.speaker)
              });
            }
          });
        }
      }

      // 선택지 (호감도/흥분도 같은 메타 용어가 섞인 선택지는 제외)
      const choices = (parsed.choices || parsed.raw?.choices || []).filter((c) => !hasMetaLeak(c));
      if (choices.length > 0) {
        newMessages.push({
          role: 'choices',
          content: choices,
          type: 'choices'
        });
      }

      setMessages(prev => [...prev, ...newMessages]);

    } else {
      // 파싱 실패 시 원본 텍스트 표시
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiResponse,
        type: 'text'
      }]);
    }
  };

  // ============================================
  // 메시지 전송
  // ============================================

  const handleSend = async () => {
    if (!input.trim() || isLoading || !story || input.length > MAX_INPUT_LENGTH) return;

    // 사용자가 연기 중인 캐릭터 시점 (A/B) 또는 캐릭터 미지정 상황 입력(N)
    const isNarrationMode = userPerspective === 'N';
    const speakerName = userPerspective === 'A'
      ? (story.characterA?.name || '공')
      : userPerspective === 'B'
        ? (story.characterB?.name || '수')
        : null;
    const otherName = userPerspective === 'A'
      ? (story.characterB?.name || '수')
      : (story.characterA?.name || '공');

    const userMessage = { role: 'user', content: input, type: 'user', speaker: speakerName };
    setMessages(prev => [...prev, userMessage]);

    // 키워드 체크
    checkKeywordInInput(input);

    setInput('');
    setSelectedChoiceIndex(null);
    setIsLoading(true);

    try {
      // 사용자가 자기 키를 직접 등록한 경우에만 구글에 직접 요청(그 키 사용).
      // 없으면 Cloudflare Worker 프록시를 거침 - 실제 키는 서버 측에만 있어서
      // 클라이언트 번들에 노출되지 않음 (예전 방식은 반복적으로 "유출"로
      // 탐지되어 자동 정지당했음)
      const customApiKey = getApiKey();
      const requestUrl = customApiKey
        ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${customApiKey}`
        : `${PROXY_URL}?model=gemini-flash-lite-latest`;

      // 시스템 프롬프트 생성 (모듈 사용 + AdminPage 설정 반영 + 최근 대화 흐름 + 이동 감지)
      const recentHistory = buildRecentHistoryText(messages);
      const movementHint = detectMovementHint(input);
      const casualHint = detectCasualHint(input);
      const systemPrompt = buildSystemPrompt(story, gameState, adminSettings, recentHistory, movementHint, casualHint);

      // 사용자 시점을 명시해서 전달
      const perspectiveInput = isNarrationMode
        ? `\n\n[사용자 입력: 상황/지문 (특정 캐릭터 지정 없음)] 아래는 캐릭터의 대사가 아니라, 사용자가 이야기에 끼워넣고 싶은 새로운 상황이나 사건입니다. 이 내용을 narration으로 자연스럽게 이야기에 반영해서 전개하고, 두 캐릭터(${story.characterA?.name || '공'}, ${story.characterB?.name || '수'})가 각자의 성격에 맞게 이 상황에 반응하는 행동과 대사를 이어가세요.\n상황: ${input}`
        : `\n\n[사용자 시점: ${speakerName}] 사용자는 지금 ${speakerName} 역할로 다음 행동/대사를 선택했습니다: "${input}"\n이 내용을 narration과 dialogues를 통해 ${speakerName}가 실제로 이 행동을 하거나 말하는 장면으로 자연스럽게 풀어서 묘사하세요 (입력 문구를 그대로 반복하지 말고, 이야기 톤에 맞게 대사/행동으로 표현). 그 다음 ${otherName}이 자신의 성격에 맞게 스스로 판단해서 취하는 행동을 이어가세요 - 말로만 항의/반응하고 몸은 가만히 있는 수동적인 묘사에 그치지 말고, 실제로 밀어내거나 피하거나 되받아치는 등 캐릭터 성격에 맞는 능동적인 신체 행동을 대사와 함께 포함할 것.`;

      // 디버그 로그
      console.log('📝 System prompt generated:', {
        tokens: estimateTokens(systemPrompt),
        hasExcitementSettings: !!adminSettings.excitementSettings,
        hasEventKeywords: !!adminSettings.eventKeywords,
        hasBalanceSettings: !!adminSettings.balanceSettings
      });

      const response = await fetch(
        requestUrl,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: systemPrompt + perspectiveInput }]
              }
            ],
            generationConfig: {
              temperature: 0.9,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 4096
            }
          })
        }
      );

      // 429 에러 시 재시도
      if (response.status === 429) {
        setMessages(prev => [...prev, {
          role: 'system',
          content: '⏳ API 요청 한도 초과... 10초 후 자동 재시도합니다.',
          type: 'info'
        }]);
        
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        const retryResponse = await fetch(
          requestUrl,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: systemPrompt + perspectiveInput }] }],
              generationConfig: { temperature: 0.9, topK: 40, topP: 0.95, maxOutputTokens: 4096 }
            })
          }
        );
        
        if (!retryResponse.ok) {
          let retryDetail = '';
          try {
            const errBody = await retryResponse.json();
            retryDetail = errBody?.error?.message || errBody?.error?.status || '';
          } catch {
            // 응답이 JSON이 아닌 경우 무시
          }
          throw new Error(`재시도 실패: ${retryResponse.status}${retryDetail ? ` - ${retryDetail}` : ''}`);
        }
        
        const retryData = await retryResponse.json();
        processAIResponse(getResponseText(retryData));
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        let detail = '';
        try {
          const errBody = await response.json();
          detail = errBody?.error?.message || errBody?.error?.status || '';
        } catch {
          // 응답이 JSON이 아닌 경우 무시하고 상태 코드만 표시
        }
        throw new Error(`API 오류: ${response.status}${detail ? ` - ${detail}` : ''}`);
      }

      const data = await response.json();

      processAIResponse(getResponseText(data));

    } catch (error) {
      console.error('AI 응답 오류:', error);
      setInput(userMessage.content);
      setMessages(prev => [...prev, {
        role: 'system',
        content: `⚠️ 오류가 발생했습니다: ${error.message}`,
        type: 'error'
      }]);
    }

    setIsLoading(false);
  };

  const handleChoiceClick = (choice, index) => {
    setInput(choice);
    setSelectedChoiceIndex(index);
  };

  // 게임 재시작
  const handleRestart = () => {
    clearProgress(storyId);
    setGameState({
      ...INITIAL_GAME_STATE,
      currentScene: {
        time: story?.scenario?.time || null,
        location: story?.scenario?.location || null,
        charAState: null,
        charBState: null
      }
    });
    setMessages([{
      role: 'system',
      content: story?.scenario?.situation || '두 사람이 마주쳤다.',
      type: 'narration'
    }]);
  };

  // ============================================
  // 렌더링
  // ============================================

  // 로딩 중
  if (isLoadingStory) {
    return (
      <div className="chat-interface">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>스토리를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 스토리 없음
  if (!story) {
    return (
      <div className="chat-interface">
        <div className="error-container">
          <h2>⚠️ 스토리를 찾을 수 없습니다</h2>
          <p>스토리 ID: {storyId}</p>
          <button className="btn-back" onClick={() => navigate('/')}>
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 메인 UI
  const excitementInfo = getExcitementLevel(excitement);
  const charA = story.characterA || {};
  const charB = story.characterB || {};
  const charAAvatar = getImageSrc(charA.profileImages?.[0] || charA.avatarPreview);
  const charBAvatar = getImageSrc(charB.profileImages?.[0] || charB.avatarPreview);

  return (
    <div className="chat-interface">
      <div
        className="chat-bg-layer"
        style={{
          backgroundImage: backgroundImage ? `url(${getImageSrc(backgroundImage)})` : 'none'
        }}
      />
      <div className="chat-bg-overlay" />

      <div className="chat-shell">
        {/* 저장 공간 부족 경고 */}
        {saveWarning && (
          <div className="save-warning">
            ⚠️ 기기 저장 공간이 부족해 최근 대화만 저장되고 있어요. 브라우저 데이터를 정리하면 해결됩니다.
          </div>
        )}

        {/* 분기점 알림 */}
        {branchNotification && (
          <div className="branch-notification">
            {branchNotification}
          </div>
        )}

        {/* 상단 고정 영역: 헤더 + 최근 발화 (하나의 배경으로 통합) */}
        <div className="chat-top-fixed">
          {/* 헤더 */}
          <div className="chat-header">
            <button className="btn-back" onClick={() => navigate('/')}>
              &lt;
            </button>

            <div className="title">{story.title || story.storyTitle}</div>

            <div className="header-badges">
              <span className="header-badge">🔥 Lv.{excitementInfo.level}</span>
              {/* 호감도 숫자/게이지 대신, 지금까지 확정된 관계 마일스톤만 짧게 표시
                  (게임 점수처럼 보이지 않으면서도 관계가 진전됐다는 느낌은 남도록) */}
              {currentMilestoneLabel && (
                <span className="header-badge">💫 {currentMilestoneLabel}</span>
              )}
            </div>

            <button
              className="btn-back"
              title="처음부터 다시하기"
              onClick={() => {
                if (window.confirm('지금까지의 대화가 사라지고 처음부터 다시 시작합니다. 계속할까요?')) {
                  handleRestart();
                }
              }}
            >
              🔄
            </button>
          </div>
        </div>

        {/* 채팅 로그 */}
        <div className="chat-log">
          {messages.map((msg, idx) => {
            if (msg.type === 'choices') {
              return (
                <div key={idx} className="choices-list">
                  {msg.content.map((choice, i) => (
                    <button
                      key={i}
                      className={`choice-btn ${selectedChoiceIndex === i ? 'selected' : ''}`}
                      onClick={() => handleChoiceClick(choice, i)}
                    >
                      {typeof choice === 'string' ? choice : String(choice ?? '')}
                    </button>
                  ))}
                </div>
              );
            }

            if (msg.type === 'narration') {
              const narrationText = typeof msg.content === 'string' ? msg.content : String(msg.content ?? '');
              const sentences = narrationText.split(/(?<=[.!?」』])\s+/).filter(Boolean);
              return (
                <div key={idx} className="msg-narration">
                  {sentences.map((s, i) => <p key={i}>{s}</p>)}
                </div>
              );
            }

            if (msg.type === 'dialogue') {
              const avatar = msg.side === 'b' ? charBAvatar : charAAvatar;
              return (
                <div key={idx} className={`msg-character side-${msg.side}`}>
                  <div className="char-header">
                    <button
                      type="button"
                      className="avatar"
                      onClick={() => setProfileModalSide(msg.side === 'b' ? 'b' : 'a')}
                      aria-label={`${msg.character} 프로필 보기`}
                    >
                      {avatar && <img src={avatar} alt={msg.character} />}
                    </button>
                    <div className="name-caption-row">
                      <div className="name">{msg.character}</div>
                      {msg.clothingNote && <div className="char-caption">{msg.clothingNote}</div>}
                    </div>
                  </div>
                  <div className="bubble">{msg.content}</div>
                  {msg.actionNote && (
                    <div className="char-action-note">
                      <span className="action-arrow">↳</span> {msg.actionNote}
                    </div>
                  )}
                </div>
              );
            }

            if (msg.type === 'scene') {
              return (
                <div key={idx} className="scene-card">
                  <div className="scene-meta-row">
                    <span>⏰ {msg.time}</span>
                    <span className="scene-meta-divider" />
                    <span>📍 {msg.location}</span>
                  </div>
                </div>
              );
            }

            if (msg.role === 'user') {
              return (
                <div key={idx} className="msg-player">
                  {msg.speaker && <div className="name">{msg.speaker}</div>}
                  <div className="bubble">{msg.content}</div>
                </div>
              );
            }

            if (msg.type === 'image') {
              const src = getImageSrc(msg.content);
              return (
                <div key={idx} className="msg-image">
                  <img
                    src={src}
                    alt=""
                    onClick={() => setLightboxImage(src)}
                    style={{ cursor: 'zoom-in' }}
                  />
                </div>
              );
            }

            return (
              <div key={idx} className={`msg-system ${msg.type || ''}`}>
                {msg.content}
              </div>
            );
          })}

          {isLoading && (
            <div className="msg-loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 시점 선택 */}
        <div className="pov-row">
          <span className="pov-label">내 시점</span>
          <button
            className={`pov-btn side-a ${userPerspective === 'A' ? 'active' : ''}`}
            onClick={() => setUserPerspective('A')}
          >
            {charA.name || '공'}
          </button>
          <button
            className={`pov-btn side-b ${userPerspective === 'B' ? 'active' : ''}`}
            onClick={() => setUserPerspective('B')}
          >
            {charB.name || '수'}
          </button>
          <button
            className={`pov-btn ${userPerspective === 'N' ? 'active' : ''}`}
            onClick={() => setUserPerspective('N')}
            title="특정 캐릭터 없이 상황/사건을 입력합니다"
          >
            상황
          </button>
        </div>

        {/* 입력 영역 */}
        <div className="input-bar">
          <div className="input-row">
            <input
              type="text"
              value={input}
              aria-describedby="chat-input-length"
              aria-invalid={input.length > MAX_INPUT_LENGTH}
              onChange={(e) => setInput(e.target.value)}
              placeholder={userPerspective === 'N' ? '상황/사건을 입력하세요 (예: 갑자기 응급환자가 발생했다)' : '선택하거나 직접 입력하세요...'}
              disabled={isLoading}
            />

            <button className="send-btn" onClick={handleSend} disabled={isLoading || !input.trim() || input.length > MAX_INPUT_LENGTH}>
              ➤
            </button>
          </div>
          <div id="chat-input-length" role={input.length > MAX_INPUT_LENGTH ? 'alert' : undefined}>
            {input.length.toLocaleString()} / {MAX_INPUT_LENGTH.toLocaleString()}자
            {input.length > MAX_INPUT_LENGTH && ' — 내용을 줄여 주세요. 입력한 글은 유지됩니다.'}
          </div>
        </div>
      </div>

      {/* 캐릭터 프로필 카드 */}
      {profileModalSide && (() => {
        const c = profileModalSide === 'b' ? charB : charA;
        const avatar = profileModalSide === 'b' ? charBAvatar : charAAvatar;
        const visibility = c.visibility || {};
        return (
          <div className="profile-modal-overlay" onClick={() => setProfileModalSide(null)}>
            <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
              <button className="profile-modal-close" onClick={() => setProfileModalSide(null)}>✕</button>

              {avatar && (
                <img
                  className="profile-modal-avatar"
                  src={avatar}
                  alt={c.name}
                  onClick={() => setLightboxImage(avatar)}
                />
              )}

              <div className="profile-modal-name-row">
                <h2 className="profile-modal-name">{c.name}</h2>
                {c.age && <span className="profile-modal-age">{c.age}세</span>}
              </div>
              {c.occupation && <p className="profile-modal-occupation">{c.occupation}</p>}

              {visibility.tags !== false && c.tags?.length > 0 && (
                <div className="profile-modal-tags">
                  {c.tags.map((tag, i) => (
                    <span key={i} className="profile-modal-tag">#{tag.replace(/^#/, '')}</span>
                  ))}
                </div>
              )}

              {visibility.basicInfo !== false && (
                <div className="profile-modal-section">
                  {c.personality && <p><strong>성격</strong> {c.personality}</p>}
                  {c.appearance && <p><strong>외모</strong> {c.appearance}</p>}
                  {c.bodyDetails?.height && <p><strong>체형</strong> {c.bodyDetails.height}{c.bodyDetails.build ? ` · ${c.bodyDetails.build}` : ''}</p>}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* 이미지 원본 팝업 */}
      {lightboxImage && (
        <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
          <img className="lightbox-image" src={lightboxImage} alt="" />
        </div>
      )}
    </div>
  );
}

export default ChatInterface;