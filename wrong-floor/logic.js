(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.WrongFloorLogic = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const SAVE_VERSION = 2;
  const CORE_INTERVIEWS = ["guxue", "liangwen", "shenman", "zhoulan"];
  const CHAPTER_REQUIREMENTS = {
    2: ["p01"], 3: ["p02"], 4: ["p03"], 5: ["p04"],
    6: ["p05", "p06"], 7: ["p07", "p08"], 9: ["p10", "p11"]
  };

  const CORE_EVIDENCE = [
    "e_lock", "e_access", "e_body", "e_water", "e_cufflink",
    "e_stream", "e_location", "e_checkin", "e_shelf", "e_plan1102",
    "e_plan2012", "e_plan2019", "e_impact", "e_floor", "e_window",
    "e_pipe", "e_cardlog", "e_cuffphoto", "e_permission", "e_oldfile"
  ];

  const MATRIX_ANSWERS = {
    xuyoa_know: "no", xuyoa_permission: "no", xuyoa_blank: "no", xuyoa_card: "no",
    guxue_know: "no", guxue_permission: "no", guxue_blank: "maybe", guxue_card: "no",
    liangwen_know: "maybe", liangwen_permission: "no", liangwen_blank: "yes", liangwen_card: "no",
    chengyi_know: "no", chengyi_permission: "no", chengyi_blank: "yes", chengyi_card: "no",
    shenman_know: "no", shenman_permission: "no", shenman_blank: "yes", shenman_card: "no",
    zhoulan_know: "yes", zhoulan_permission: "yes", zhoulan_blank: "yes", zhoulan_card: "yes"
  };

  const CHAIN_ANSWERS = {
    developer: "lower", supervisor: "approve", design: "sign", contractor: "execute"
  };

  function freshState() {
    return {
      version: SAVE_VERSION, started: false, chapter: 1, screen: "home",
      evidence: [], examined: [], solved: [], deductions: [],
      interviews: {}, interviewData: {}, mirrorFound: [], mirrorProof: [],
      factAnswers: {}, testimonyAnswers: {}, matrixAnswers: {}, chainAnswers: {},
      report: {}, confrontation: {}, confrontationStep: 0,
      pinnedEvidence: [], currentTheory: {}, hints: [], mistakes: 0, ending: null,
      meta: { endings: [], bestEvidence: 0 }, updatedAt: null
    };
  }

  function uniqueStrings(value) {
    return Array.isArray(value) ? [...new Set(value.filter(x => typeof x === "string"))] : [];
  }

  function safeObject(value) { return value && typeof value === "object" && !Array.isArray(value) ? value : {}; }

  function normalizeState(raw) {
    const base = freshState();
    if (!raw || typeof raw !== "object") return base;
    const state = { ...base, ...raw };
    state.version = SAVE_VERSION;
    state.chapter = Math.max(1, Math.min(9, Number(state.chapter) || 1));
    ["evidence", "examined", "solved", "deductions", "mirrorFound", "mirrorProof", "pinnedEvidence", "hints"].forEach(key => {
      state[key] = uniqueStrings(state[key]);
    });
    state.pinnedEvidence = state.pinnedEvidence.filter(id => state.evidence.includes(id)).slice(0, 3);
    ["interviews", "interviewData", "factAnswers", "testimonyAnswers", "matrixAnswers", "chainAnswers", "report", "confrontation", "currentTheory"].forEach(key => {
      state[key] = safeObject(state[key]);
    });
    Object.keys(state.interviews).forEach(id => state.interviews[id] = Math.max(0, Math.min(3, Number(state.interviews[id]) || 0)));
    state.confrontationStep = Math.max(0, Math.min(5, Number(state.confrontationStep) || 0));
    state.meta = {
      endings: uniqueStrings(state.meta && state.meta.endings),
      bestEvidence: Math.max(0, Number(state.meta && state.meta.bestEvidence) || 0)
    };
    if (CORE_INTERVIEWS.every(id => Number(state.interviews[id] || 0) >= 3) && !state.solved.includes("interviews-core")) state.solved.push("interviews-core");
    return state;
  }

  function hasSolved(state, id) { return state.solved.includes(id); }
  function coreInterviewsComplete(state) { return CORE_INTERVIEWS.every(id => Number(state.interviews[id] || 0) >= 3); }

  function chapterUnlocked(state, chapter) {
    if (chapter <= 1) return true;
    if (chapter === 8) return hasSolved(state, "p09") && coreInterviewsComplete(state);
    if (chapter === 9) return chapterUnlocked(state, 8) && hasSolved(state, "p10") && hasSolved(state, "p11");
    return (CHAPTER_REQUIREMENTS[chapter] || []).every(id => hasSolved(state, id));
  }

  function highestUnlockedChapter(state) {
    let highest = 1;
    for (let chapter = 2; chapter <= 9; chapter += 1) {
      if (chapterUnlocked(state, chapter)) highest = chapter;
      else break;
    }
    return highest;
  }

  function evidenceProgress(state) {
    const found = CORE_EVIDENCE.filter(id => state.evidence.includes(id)).length;
    return { found, total: CORE_EVIDENCE.length, percent: Math.round(found / CORE_EVIDENCE.length * 100) };
  }

  function validateEvidenceSet(selected, relevant, routes) {
    const picks = uniqueStrings(selected);
    if (picks.some(id => !relevant.includes(id))) return { ok: false, reason: "提交中含有与这条结论无关的材料。" };
    const passed = routes.some(route => route.all.every(id => picks.includes(id)) && (!route.exact || picks.length === route.all.length));
    return passed ? { ok: true } : { ok: false, reason: "证据方向接近，但还缺少能独立支撑结论的关键来源。" };
  }

  function validateAlibiCoverage(selected) {
    return validateEvidenceSet(selected, ["e_checkin", "e_stream", "e_location"], [
      { all: ["e_checkin", "e_stream", "e_location"], exact: true }
    ]);
  }

  function validateMatrix(answers) {
    const wrong = Object.keys(MATRIX_ANSWERS).filter(key => answers[key] !== MATRIX_ANSWERS[key]);
    return { ok: wrong.length === 0, wrongCount: wrong.length };
  }

  function validateResponsibilityChain(answers) {
    const wrong = Object.keys(CHAIN_ANSWERS).filter(key => answers[key] !== CHAIN_ANSWERS[key]);
    return { ok: wrong.length === 0, wrongCount: wrong.length };
  }

  const REPORT_ANSWERS = {
    deathPlace: "1402", deathTime: "19:16", foundPlace: "1102", cardUser: "周岚",
    cufflink: "两周前遗留", sound: "14层管道结构传声",
    transferReason: "争取处理旧案资料的时间", culprit: "周岚"
  };

  function validateReport(report) {
    const wrong = Object.keys(REPORT_ANSWERS).filter(key => report[key] !== REPORT_ANSWERS[key]);
    return { ok: wrong.length === 0, wrong };
  }

  const CONFRONTATION_ANSWERS = {
    q1: "e_impact", q2: "e_floor", q3: "e_cardlog", q4: "e_permission", q5: "e_oldfile"
  };

  function validateConfrontationAnswer(step, evidenceId) {
    return CONFRONTATION_ANSWERS[`q${step}`] === evidenceId;
  }

  function knowledgeComplete(state) {
    return coreInterviewsComplete(state) && ["p07", "p10", "p11", "p12"].every(id => hasSolved(state, id)) &&
      ["e_copy", "e_message", "e_pipe", "e_oldfile"].every(id => state.evidence.includes(id));
  }

  function determineEnding(state, disclosure) {
    if (!hasSolved(state, "p12")) return null;
    if (disclosure === "culprit-only") return "C";
    return knowledgeComplete(state) ? "D" : "A";
  }

  function recordEnding(state, id) {
    const next = normalizeState(state);
    next.ending = id;
    if (!next.meta.endings.includes(id)) next.meta.endings.push(id);
    next.meta.bestEvidence = Math.max(next.meta.bestEvidence, next.evidence.length);
    return next;
  }

  return {
    SAVE_VERSION, CORE_EVIDENCE, CORE_INTERVIEWS, MATRIX_ANSWERS, CHAIN_ANSWERS,
    REPORT_ANSWERS, CONFRONTATION_ANSWERS,
    freshState, normalizeState, coreInterviewsComplete, chapterUnlocked, highestUnlockedChapter,
    evidenceProgress, validateEvidenceSet, validateAlibiCoverage, validateMatrix,
    validateResponsibilityChain, validateReport, validateConfrontationAnswer,
    knowledgeComplete, determineEnding, recordEnding
  };
});
