(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.WrongFloorLogic = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const SAVE_VERSION = 1;
  const CHAPTER_REQUIREMENTS = {
    2: ["p01"],
    3: ["p02"],
    4: ["p03"],
    5: ["p04"],
    6: ["p05", "p06"],
    7: ["p07", "p08"],
    8: ["p09"],
    9: ["p10", "p11"]
  };

  const CORE_EVIDENCE = [
    "e_lock", "e_access", "e_body", "e_water", "e_cufflink",
    "e_stream", "e_location", "e_checkin", "e_shelf", "e_plan1102",
    "e_plan2012", "e_plan2019", "e_impact", "e_floor", "e_window",
    "e_pipe", "e_cardlog", "e_cuffphoto", "e_permission", "e_oldfile"
  ];

  function freshState() {
    return {
      version: SAVE_VERSION,
      started: false,
      chapter: 1,
      screen: "home",
      evidence: [],
      examined: [],
      solved: [],
      deductions: [],
      interviews: {},
      timelineOrder: ["speech", "location", "exit", "photo", "qa", "checkin"],
      mirrorFound: [],
      factAnswers: {},
      testimonyAnswers: {},
      report: {},
      confrontation: {},
      hints: [],
      mistakes: 0,
      ending: null,
      meta: { endings: [], bestEvidence: 0 },
      updatedAt: null
    };
  }

  function uniqueStrings(value) {
    return Array.isArray(value) ? [...new Set(value.filter(x => typeof x === "string"))] : [];
  }

  function normalizeState(raw) {
    const base = freshState();
    if (!raw || typeof raw !== "object") return base;
    const state = { ...base, ...raw };
    state.version = SAVE_VERSION;
    state.chapter = Math.max(1, Math.min(9, Number(state.chapter) || 1));
    ["evidence", "examined", "solved", "deductions", "mirrorFound", "hints"].forEach(key => {
      state[key] = uniqueStrings(state[key]);
    });
    state.interviews = state.interviews && typeof state.interviews === "object" ? state.interviews : {};
    state.factAnswers = state.factAnswers && typeof state.factAnswers === "object" ? state.factAnswers : {};
    state.testimonyAnswers = state.testimonyAnswers && typeof state.testimonyAnswers === "object" ? state.testimonyAnswers : {};
    state.report = state.report && typeof state.report === "object" ? state.report : {};
    state.confrontation = state.confrontation && typeof state.confrontation === "object" ? state.confrontation : {};
    state.timelineOrder = uniqueStrings(state.timelineOrder);
    if (state.timelineOrder.length !== 6) state.timelineOrder = base.timelineOrder;
    state.meta = {
      endings: uniqueStrings(state.meta && state.meta.endings),
      bestEvidence: Math.max(0, Number(state.meta && state.meta.bestEvidence) || 0)
    };
    return state;
  }

  function hasSolved(state, id) { return state.solved.includes(id); }

  function chapterUnlocked(state, chapter) {
    if (chapter <= 1) return true;
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
    const passed = routes.some(route => {
      if (!route.all.every(id => picks.includes(id))) return false;
      if (route.exact && picks.length !== route.all.length) return false;
      return true;
    });
    return passed ? { ok: true } : { ok: false, reason: "证据方向接近，但还缺少能独立支撑结论的关键来源。" };
  }

  function validateTimeline(order) {
    const expected = ["location", "photo", "checkin", "speech", "qa", "exit"];
    return Array.isArray(order) && order.length === expected.length && expected.every((id, index) => order[index] === id);
  }

  const REPORT_ANSWERS = {
    deathPlace: "1402",
    deathTime: "19:16",
    foundPlace: "1102",
    cardUser: "周岚",
    cufflink: "两周前遗留",
    sound: "14层管道结构传声",
    transferReason: "争取处理旧案资料的时间",
    culprit: "周岚"
  };

  function validateReport(report) {
    const wrong = Object.keys(REPORT_ANSWERS).filter(key => report[key] !== REPORT_ANSWERS[key]);
    return { ok: wrong.length === 0, wrong };
  }

  const CONFRONTATION_ANSWERS = {
    q1: "e_shelf",
    q2: "d_mirror",
    q3: "e_cardlog",
    q4: "e_permission",
    q5: "e_oldfile"
  };

  function validateConfrontation(answers) {
    return Object.keys(CONFRONTATION_ANSWERS).every(key => answers[key] === CONFRONTATION_ANSWERS[key]);
  }

  function determineEnding(state, disclosure) {
    if (!hasSolved(state, "p12")) return null;
    if (disclosure === "culprit-only") return "C";
    const allThirdRounds = ["xuyoa", "guxue", "liangwen", "chengyi", "shenman", "zhoulan"]
      .every(id => Number(state.interviews[id] || 0) >= 3);
    const complete = evidenceProgress(state).found === CORE_EVIDENCE.length;
    return complete && allThirdRounds && hasSolved(state, "p11") ? "D" : "A";
  }

  function recordEnding(state, id) {
    const next = normalizeState(state);
    next.ending = id;
    if (!next.meta.endings.includes(id)) next.meta.endings.push(id);
    next.meta.bestEvidence = Math.max(next.meta.bestEvidence, next.evidence.length);
    return next;
  }

  return {
    SAVE_VERSION,
    CORE_EVIDENCE,
    REPORT_ANSWERS,
    CONFRONTATION_ANSWERS,
    freshState,
    normalizeState,
    chapterUnlocked,
    highestUnlockedChapter,
    evidenceProgress,
    validateEvidenceSet,
    validateTimeline,
    validateReport,
    validateConfrontation,
    determineEnding,
    recordEnding
  };
});
