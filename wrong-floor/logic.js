(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.WrongFloorLogic = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const SAVE_VERSION = 3;
  const CORE_INTERVIEWS = ["guxue", "liangwen", "shenman", "zhoulan"];
  const CHAPTER_REQUIREMENTS = {
    2: ["p01"], 3: ["p02"], 4: ["p03"], 5: ["p04"],
    6: ["p05", "p06"], 7: ["p07", "p08"]
  };

  const CORE_EVIDENCE = [
    "e_lock", "e_access", "e_body", "e_water", "e_cufflink",
    "e_stream", "e_location", "e_checkin", "e_shelf", "e_plan1102",
    "e_plan2012", "e_plan2019", "e_impact", "e_floor", "e_window",
    "e_pipe", "e_cardlog", "e_cuffphoto", "e_permission", "e_oldfile", "e_watch"
  ];

  const MATRIX_ANSWERS = {
    xuyoa_know: "unknown", xuyoa_permission: "no", xuyoa_blank: "no", xuyoa_card: "no",
    guxue_know: "unknown", guxue_permission: "no", guxue_blank: "unknown", guxue_card: "no",
    liangwen_know: "unknown", liangwen_permission: "no", liangwen_blank: "unknown", liangwen_card: "no",
    chengyi_know: "unknown", chengyi_permission: "no", chengyi_blank: "unknown", chengyi_card: "no",
    shenman_know: "unknown", shenman_permission: "no", shenman_blank: "unknown", shenman_card: "no",
    zhoulan_know: "yes", zhoulan_permission: "yes", zhoulan_blank: "yes", zhoulan_card: "yes"
  };
  const MATRIX_AUTO = { xuyoa_blank: "no", zhoulan_know: "yes", zhoulan_permission: "yes" };

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
      pinnedEvidence: [], currentTheory: {}, interludeSeen: false, hints: [], mistakes: 0, ending: null,
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
    Object.keys(state.confrontation).forEach(key => state.confrontation[key] = uniqueStrings(Array.isArray(state.confrontation[key]) ? state.confrontation[key] : [state.confrontation[key]]));
    state.interludeSeen = Boolean(state.interludeSeen);
    state.meta = {
      endings: uniqueStrings(state.meta && state.meta.endings),
      bestEvidence: Math.max(0, Number(state.meta && state.meta.bestEvidence) || 0)
    };
    if (CORE_INTERVIEWS.every(id => Number(state.interviews[id] || 0) >= 3) && !state.solved.includes("interviews-core")) state.solved.push("interviews-core");
    return state;
  }

  function hasSolved(state, id) { return state.solved.includes(id); }
  function coreInterviewsComplete(state) { return CORE_INTERVIEWS.every(id => Number(state.interviews[id] || 0) >= 3); }
  function keyInterviewCount(state) { return CORE_INTERVIEWS.filter(id => Number(state.interviews[id] || 0) >= 3).length; }

  function chapterUnlocked(state, chapter) {
    if (chapter <= 1) return true;
    if (chapter === 8) return hasSolved(state, "p09") && keyInterviewCount(state) >= 2;
    if (chapter === 9) return chapterUnlocked(state, 8) && hasSolved(state, "p10");
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
    const effective = { ...answers, ...MATRIX_AUTO };
    const wrong = Object.keys(MATRIX_ANSWERS).filter(key => (effective[key] || "unknown") !== MATRIX_ANSWERS[key]);
    return { ok: wrong.length === 0, wrongCount: wrong.length };
  }

  function validateResponsibilityChain(answers) {
    const wrong = Object.keys(CHAIN_ANSWERS).filter(key => answers[key] !== CHAIN_ANSWERS[key]);
    return { ok: wrong.length === 0, wrongCount: wrong.length };
  }

  const REPORT_ANSWERS = {
    deathPlace: "1402", deathTime: "19:16", foundPlace: "1102", cardUser: "周岚",
    cufflink: "两周前遗留", sound: "14层管道结构传声",
    transferReason: "伪造1102内晚间死亡", culprit: "周岚"
  };

  function validateReport(report) {
    const wrong = Object.keys(REPORT_ANSWERS).filter(key => report[key] !== REPORT_ANSWERS[key]);
    return { ok: wrong.length === 0, wrong };
  }

  const CONFRONTATION_ROUTES = {
    q1: { relevant: ["e_impact", "e_body", "e_watch"], routes: [{ all: ["e_impact", "e_body"] }, { all: ["e_impact", "e_watch"] }] },
    q2: { relevant: ["e_floor", "e_cart"], routes: [{ all: ["e_floor", "e_cart"] }] },
    q3: { relevant: ["e_cardlog", "e_accountmap", "e_shift"], routes: [{ all: ["e_cardlog", "e_accountmap", "e_shift"] }] },
    q4: { relevant: ["e_permission", "e_cardlog", "e_cart"], routes: [{ all: ["e_permission"] }, { all: ["e_cardlog", "e_cart"] }] },
    q5: { relevant: ["e_oldfile", "e_casualty", "e_hr"], routes: [{ all: ["e_oldfile", "e_casualty", "e_hr"] }] }
  };

  function validateConfrontationAnswer(step, evidenceIds) {
    const rule = CONFRONTATION_ROUTES[`q${step}`];
    return rule ? validateEvidenceSet(evidenceIds, rule.relevant, rule.routes) : { ok: false, reason: "不存在这一轮举证。" };
  }

  function knowledgeComplete(state) {
    return ["p07", "p10", "p11", "p12"].every(id => hasSolved(state, id)) &&
      ["e_oldfile", "e_casualty", "e_hr"].every(id => state.evidence.includes(id));
  }

  function determineEnding(state, disclosure) {
    if (!hasSolved(state, "p12")) return null;
    if (!knowledgeComplete(state)) return "A";
    return disclosure === "culprit-only" ? "C" : "D";
  }

  function evaluateTheory(theory, state) {
    const conflicts = [], missing = [], support = [];
    if (theory.culprit === "许遥" && hasSolved(state, "p02")) conflicts.push("论坛、直播与位置记录形成连续在场证明");
    if (theory.method === "远程装置") conflicts.push("现场没有装置、触发器或远程通信痕迹");
    if (theory.culprit === "周岚") {
      if (hasSolved(state, "p10")) support.push("账号岗位、当班表、权限与 A047 行为记录相互闭合");
      else missing.push("尚无材料把周岚与卡片、权限和搬运行为连接");
    }
    if (theory.place === "其他地点") {
      if (hasSolved(state, "p05")) support.push("隐蔽现场的撞击、血迹与搬运痕迹支持死亡发生在别处");
      else missing.push("尚未发现能支持其他死亡地点的物理来源");
    }
    if (theory.place === "1102") {
      if (hasSolved(state, "p05")) conflicts.push("1402 的撞击、血迹和搬运痕迹与 1102 死亡地点理论冲突");
      else missing.push("尸体在 1102 被发现，不能独立证明死亡也发生在那里");
    }
    if (!theory.method || theory.method === "未知") missing.push("犯罪方法尚未解释");
    return { conflicts, missing, support, canSubmitFailure: theory.culprit === "许遥" && conflicts.length > 0 };
  }

  function recordEnding(state, id) {
    const next = normalizeState(state);
    next.ending = id;
    if (!next.meta.endings.includes(id)) next.meta.endings.push(id);
    next.meta.bestEvidence = Math.max(next.meta.bestEvidence, next.evidence.length);
    return next;
  }

  return {
    SAVE_VERSION, CORE_EVIDENCE, CORE_INTERVIEWS, MATRIX_ANSWERS, MATRIX_AUTO, CHAIN_ANSWERS,
    REPORT_ANSWERS, CONFRONTATION_ROUTES,
    freshState, normalizeState, coreInterviewsComplete, keyInterviewCount, chapterUnlocked, highestUnlockedChapter,
    evidenceProgress, validateEvidenceSet, validateAlibiCoverage, validateMatrix,
    validateResponsibilityChain, validateReport, validateConfrontationAnswer,
    knowledgeComplete, determineEnding, evaluateTheory, recordEnding
  };
});
