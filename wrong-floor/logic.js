(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.WrongFloorLogic = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const SAVE_VERSION = 5;
  const CORE_INTERVIEWS = ["guxue", "liangwen", "shenman", "zhoulan"];
  const CHAPTER_REQUIREMENTS = {
    2: ["p01"], 3: ["p02"], 4: ["p03"], 5: ["p04"],
    6: ["p05", "p06"], 7: ["p07", "p08"]
  };

  const CORE_EVIDENCE = [
    "e_lock", "e_access", "e_body", "e_water", "e_cufflink",
    "e_stream", "e_location", "e_checkin", "e_shelf", "e_plan1102", "e_fixed",
    "e_plan2012", "e_plan2019", "e_impact", "e_floor", "e_window",
    "e_pipe", "e_cardlog", "e_cuffphoto", "e_permission", "e_oldfile", "e_watch", "e_waterlab",
    "e_cardauth", "e_route", "e_hatch", "e_chaintrial", "e_remote_sweep"
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
  const EXCLUSION_ANSWERS = {
    xuyoa: "alibi", guxue: "permission", liangwen: "permission",
    chengyi: "permission", shenman: "permission"
  };
  const ZHOU_CONDITIONS = ["know", "permission", "blank", "card"];

  const CHAIN_ANSWERS = {
    developer: "lower", supervisor: "approve", design: "sign", contractor: "execute"
  };
  const CHAIN_FILE_ANSWERS = {
    developer: "file-a", supervisor: "file-b", design: "file-c", contractor: "file-d"
  };

  function freshState() {
    return {
      version: SAVE_VERSION, started: false, chapter: 1, screen: "home",
      evidence: [], examined: [], solved: [], deductions: [],
      interviews: {}, interviewData: {}, mirrorFound: [], mirrorProof: [],
      factAnswers: {}, testimonyAnswers: {}, matrixAnswers: {}, chainAnswers: {}, chainFiles: {},
      exclusionAnswers: {}, zhouConditions: [], matrixExpanded: [],
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
    ["evidence", "examined", "solved", "deductions", "mirrorFound", "mirrorProof", "pinnedEvidence", "hints", "zhouConditions", "matrixExpanded"].forEach(key => {
      state[key] = uniqueStrings(state[key]);
    });
    state.pinnedEvidence = state.pinnedEvidence.filter(id => state.evidence.includes(id)).slice(0, 3);
    ["interviews", "interviewData", "factAnswers", "testimonyAnswers", "matrixAnswers", "chainAnswers", "chainFiles", "exclusionAnswers", "report", "confrontation", "currentTheory"].forEach(key => {
      state[key] = safeObject(state[key]);
    });
    Object.keys(state.interviews).forEach(id => state.interviews[id] = Math.max(0, Math.min(3, Number(state.interviews[id]) || 0)));
    state.confrontationStep = Math.max(0, Math.min(5, Number(state.confrontationStep) || 0));
    Object.keys(state.confrontation).forEach(key => state.confrontation[key] = uniqueStrings(Array.isArray(state.confrontation[key]) ? state.confrontation[key] : [state.confrontation[key]]));
    state.interludeSeen = Boolean(state.interludeSeen);
    if (Number(raw.version || 0) < 4 && !hasSolved(state, "p10") && validateMatrix(state.matrixAnswers).ok) {
      state.exclusionAnswers = { ...EXCLUSION_ANSWERS };
      state.zhouConditions = [...ZHOU_CONDITIONS];
    }
    if (Number(raw.version || 0) < 5 && !hasSolved(state, "p12")) {
      state.solved = state.solved.filter(id => id !== "report");
      state.report.waterStart = state.report.waterStart || "";
      state.report.chainMethod = state.report.chainMethod || "";
      state.confrontation = Object.fromEntries(Object.entries(state.confrontation).filter(([key]) => ["q1","q2"].includes(key)));
      state.confrontationStep = Math.min(state.confrontationStep, 2);
    }
    if (Number(raw.version || 0) < 5 && hasSolved(state, "p12")) {
      state.report.waterStart = state.report.waterStart || REPORT_ANSWERS.waterStart;
      state.report.chainMethod = state.report.chainMethod || REPORT_ANSWERS.chainMethod;
      if (state.confrontation.q5 && !state.confrontation.q6) state.confrontation.q6 = state.confrontation.q5;
    }
    if (hasSolved(state, "p11") && Object.keys(state.chainFiles).length === 0) state.chainFiles = { ...CHAIN_FILE_ANSWERS };
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
    if (chapter === 9) return chapterUnlocked(state, 8) && (hasSolved(state, "p12") || (hasSolved(state, "p10") &&
      ["e_waterlab", "e_cardauth", "e_route", "e_hatch", "e_chaintrial"].every(id => state.evidence.includes(id))));
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

  function candidateStatus(state, person, field) {
    if (!state || typeof state !== "object") return "unknown";
    const evidence = new Set(uniqueStrings(state.evidence));
    if (person === "xuyoa" && (field === "blank" || field === "card") && hasSolved(state, "p02")) return "no";
    if (field === "permission" && evidence.has("e_permission")) return person === "zhoulan" ? "yes" : "no";
    if (person !== "zhoulan") return "unknown";
    if (field === "know" && evidence.has("e_accountmap")) return "yes";
    if (field === "blank" && evidence.has("e_shift") && evidence.has("e_route")) return "yes";
    if (field === "card" && evidence.has("e_cardlog") && evidence.has("e_cardauth") && evidence.has("e_route")) return "yes";
    return "unknown";
  }

  function validateExclusionMatrix(exclusions, conditions, state) {
    const wrongPeople = Object.keys(EXCLUSION_ANSWERS).filter(id => exclusions[id] !== EXCLUSION_ANSWERS[id]);
    const picked = uniqueStrings(conditions);
    const missingConditions = ZHOU_CONDITIONS.filter(id => !picked.includes(id));
    const extraConditions = picked.filter(id => !ZHOU_CONDITIONS.includes(id));
    const unsupportedPeople = state ? Object.entries(EXCLUSION_ANSWERS).filter(([id, reason]) => {
      if (reason === "alibi") return !hasSolved(state, "p02");
      if (reason === "permission") return candidateStatus(state, id, "permission") !== "no";
      return true;
    }).map(([id]) => id) : [];
    const unsupportedConditions = state ? ZHOU_CONDITIONS.filter(field => candidateStatus(state, "zhoulan", field) !== "yes") : [];
    return {
      ok: wrongPeople.length === 0 && missingConditions.length === 0 && extraConditions.length === 0 && unsupportedPeople.length === 0 && unsupportedConditions.length === 0,
      wrongPeople, missingConditions, unsupportedPeople, unsupportedConditions
    };
  }

  function validateResponsibilityChain(answers) {
    const wrong = Object.keys(CHAIN_ANSWERS).filter(key => answers[key] !== CHAIN_ANSWERS[key]);
    return { ok: wrong.length === 0, wrongCount: wrong.length };
  }

  function validateResponsibilityPuzzle(files, answers) {
    const fileWrong = Object.keys(CHAIN_FILE_ANSWERS).filter(key => files[key] !== CHAIN_FILE_ANSWERS[key]);
    const actionResult = validateResponsibilityChain(answers);
    return { ok: fileWrong.length === 0 && actionResult.ok, fileWrong, actionWrong: actionResult.wrongCount };
  }

  const REPORT_ANSWERS = {
    deathPlace: "1402", deathTime: "19:16", foundPlace: "1102", cardUser: "周岚",
    cufflink: "两周前遗留", sound: "14层管道结构传声",
    transferReason: "伪造1102内晚间死亡", waterStart: "约20:46",
    chainMethod: "室内挂链后经浴室检修通道离开", culprit: "周岚"
  };

  const REPORT_REQUIREMENTS = {
    deathPlace: { category: "地点连接", solved: ["p05"], evidence: ["e_impact", "e_watch"] },
    deathTime: { category: "时间锚点", evidence: ["e_watch"] },
    foundPlace: { category: "发现现场", evidence: ["e_lock"] },
    cardUser: { category: "身份归属", evidence: ["e_cardlog", "e_cardauth", "e_route"] },
    cufflink: { category: "物证时间", solved: ["p09"], evidence: ["e_cufflink", "e_cuffphoto"] },
    sound: { category: "声音路径", solved: ["p08"], evidence: ["e_pipe"] },
    transferReason: { category: "置换目的", solved: ["p05", "p10"], evidence: ["e_floor", "e_waterlab"] },
    waterStart: { category: "时间顺序", evidence: ["e_waterlab"] },
    chainMethod: { category: "锁闭复原", evidence: ["e_lock", "e_hatch", "e_chaintrial", "e_route"] },
    culprit: { category: "行为人", solved: ["p10"], evidence: ["e_cardauth", "e_route"] }
  };

  function validateReport(report, state) {
    const wrong = Object.keys(REPORT_ANSWERS).filter(key => report[key] !== REPORT_ANSWERS[key]);
    const unsupported = state ? Object.entries(REPORT_REQUIREMENTS).filter(([, rule]) =>
      (rule.solved || []).some(id => !hasSolved(state, id)) || (rule.evidence || []).some(id => !state.evidence.includes(id))
    ).map(([key]) => key) : [];
    const categories = [...new Set([...wrong, ...unsupported].map(key => REPORT_REQUIREMENTS[key] && REPORT_REQUIREMENTS[key].category).filter(Boolean))];
    return { ok: wrong.length === 0 && unsupported.length === 0, wrong, unsupported, categories };
  }

  const CONFRONTATION_ROUTES = {
    q1: { category: "地点连接", relevant: ["e_impact", "e_body", "e_watch"], routes: [
      { id: "autopsy", all: ["e_impact", "e_body"], explanation: "尸表固定伤情范围，1402 撞击痕固定碰撞位置；两处形态相互吻合。" },
      { id: "watch", all: ["e_impact", "e_watch"], explanation: "手表固定 19:16 的冲击时间，1402 撞击痕固定冲突地点；设备与现场形成独立闭环。" }
    ] },
    q2: { category: "搬运连接", relevant: ["e_floor", "e_cart"], routes: [{ id: "cart", all: ["e_floor", "e_cart"], explanation: "地板拖痕证明尸体离开 1402，轮距、轮宽与磨损缺口把拖痕连接到物业搬运车。" }] },
    q3: { category: "身份归属", relevant: ["e_cardlog", "e_cardauth", "e_route"], routes: [{ id: "identity", all: ["e_cardlog", "e_cardauth", "e_route"], explanation: "原始日志固定 A047 的取用，活体认证落实取卡人，连续服务区记录把卡的后续路线连接到周岚。" }] },
    q4: { category: "实施条件", relevant: ["e_permission", "e_cart", "e_route"], routes: [{ id: "capability", all: ["e_permission", "e_cart", "e_route"], explanation: "权限审计证明可进入受控区域，搬运车痕迹证明工具被使用，服务区记录固定了实际通行窗口。" }] },
    q5: { category: "锁闭复原", relevant: ["e_lock", "e_hatch", "e_chaintrial"], routes: [{ id: "chain", all: ["e_lock", "e_hatch", "e_chaintrial"], explanation: "原始门链状态要求人在室内挂链；检修口痕迹证明另一出口被使用，现场复原验证挂链后可从该通道离开。" }] },
    q6: { category: "旧案联系", relevant: ["e_oldfile", "e_casualty", "e_hr"], routes: [{ id: "oldcase", all: ["e_oldfile", "e_casualty", "e_hr"], explanation: "原始卷宗固定事故责任，死亡名单与人事档案用两个来源把周屿连接到周岚。" }] }
  };

  function validateConfrontationAnswer(step, evidenceIds) {
    const rule = CONFRONTATION_ROUTES[`q${step}`];
    if (!rule) return { ok: false, reason: "不存在这一轮举证。" };
    const picks = uniqueStrings(evidenceIds);
    const irrelevant = picks.filter(id => !rule.relevant.includes(id));
    if (irrelevant.length) return { ok: false, category: rule.category, issue: "irrelevant", reason: `【${rule.category}】中含有不能直接回答当前质疑的材料；已保留选择，请展开摘要复核。` };
    const route = rule.routes.find(candidate => candidate.all.length === picks.length && candidate.all.every(id => picks.includes(id)));
    if (route) return { ok: true, category: rule.category, routeId: route.id, explanation: route.explanation };
    const closest = rule.routes.map(candidate => ({ ...candidate, missing: candidate.all.filter(id => !picks.includes(id)), matched: candidate.all.filter(id => picks.includes(id)).length })).sort((a,b) => b.matched - a.matched)[0];
    if (closest && closest.missing.length === 0 && picks.length > closest.all.length) return { ok:false, category:rule.category, issue:"excess", reason:`【${rule.category}】混入了另一条等价路线的材料；保留一组能独立闭合的最小证据即可。` };
    return { ok: false, category: rule.category, issue: "missing", missing: closest ? closest.missing : [], reason: `【${rule.category}】还缺能完成这一连接的关键来源；已保留选择，可展开现有材料摘要继续判断。` };
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
    if (theory.method === "远程装置") {
      if (state.evidence.includes("e_remote_sweep")) conflicts.push("无线频谱、机械触发与设备日志排查均未发现远程装置");
      else missing.push("尚未完成针对无线、机械触发与远程通信痕迹的排除性调查");
    }
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
    if (theory.method === "密室后逃离") {
      if (["e_hatch", "e_chaintrial"].every(id => state.evidence.includes(id))) support.push("浴室检修口痕迹与现场复原支持挂链后的离场路径");
      else missing.push("尚缺能解释门链形成与离场路径的现场复原");
    }
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
    SAVE_VERSION, CORE_EVIDENCE, CORE_INTERVIEWS, MATRIX_ANSWERS, MATRIX_AUTO, EXCLUSION_ANSWERS, ZHOU_CONDITIONS,
    CHAIN_ANSWERS, CHAIN_FILE_ANSWERS,
    REPORT_ANSWERS, REPORT_REQUIREMENTS, CONFRONTATION_ROUTES,
    freshState, normalizeState, coreInterviewsComplete, keyInterviewCount, chapterUnlocked, highestUnlockedChapter,
    evidenceProgress, validateEvidenceSet, validateAlibiCoverage, validateMatrix, candidateStatus, validateExclusionMatrix,
    validateResponsibilityChain, validateResponsibilityPuzzle, validateReport, validateConfrontationAnswer,
    knowledgeComplete, determineEnding, evaluateTheory, recordEnding
  };
});
