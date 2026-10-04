(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.WrongFloorLogic = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const SAVE_VERSION = 9;
  const REPORT_RULE_VERSION = 9;
  const PROOF_RULE_VERSION = 9;
  const CORE_INTERVIEWS = ["guxue", "liangwen", "shenman", "zhoulan"];
  const CHAPTER_REQUIREMENTS = {
    2: ["p01"], 3: ["p02"], 4: ["p03"], 5: ["p04"],
    6: ["p05", "p06"], 7: ["p07", "p08"]
  };

  const MAIN_EVIDENCE = [
    "e_lock", "e_access", "e_body", "e_water", "e_cufflink",
    "e_stream", "e_location", "e_checkin", "e_shelf", "e_plan1102", "e_fixed",
    "e_plan2012", "e_plan2019", "e_impact", "e_floor", "e_window",
    "e_pipe", "e_cardlog", "e_cuffphoto", "e_permission", "e_watch", "e_waterlab",
    "e_accountmap", "e_trainingaccess", "e_shift", "e_cardauth", "e_route", "e_cart",
    "e_hatch", "e_chain_tests", "e_chaintrial", "e_body_review", "e_doorcontact", "e_struggle"
  ];
  const SUPPLEMENTAL_EVIDENCE = ["e_dna", "e_remote_sweep", "e_message", "e_copy", "e_debt"];
  const OLD_CASE_EVIDENCE = ["e_oldfile", "e_casualty", "e_hr"];
  const CORE_EVIDENCE = MAIN_EVIDENCE;

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

  const RECONSTRUCTION_ORDER = ["water", "card", "transfer", "chain", "leave"];
  const RECONSTRUCTION_SOURCES = {
    water: "e_waterlab", card: "e_cardlog", transfer: "e_cart", chain: "e_lock", leave: "e_hatch"
  };
  const RECONSTRUCTION_SUPPORT = {
    water: { value:"water-route", evidence:["e_route"], label:"20:43 管井通行记录" },
    card: { value:"card-identity", evidence:["e_cardauth"], label:"口令与活体身份认证" },
    transfer: { value:"transfer-route", evidence:["e_route", "e_access", "e_doorcontact"], label:"服务区路径＋认证/门磁记录" },
    chain: { value:"chain-constraints", evidence:["e_chain_tests"], label:"门链替代顺序测试" },
    leave: { value:"exit-route", evidence:["e_route", "e_doorcontact", "e_chain_tests"], label:"21:49 路径＋门磁静默＋替代测试" }
  };
  const RECONSTRUCTION_EVIDENCE = {
    water: ["e_waterlab", "e_route"],
    card: ["e_cardlog", "e_cardauth"],
    transfer: ["e_cart", "e_route", "e_access", "e_doorcontact"],
    chain: ["e_lock", "e_chain_tests"],
    leave: ["e_hatch", "e_route", "e_doorcontact", "e_chain_tests"]
  };
  const DIFFERENCE_CLASS_ANSWERS = {
    socket:"fixed", drag:"night", frame:"fixed", nail:"history", pipe:"fixed",
    impact:"night", cup:"movable", curtain:"movable", lamp:"history", painting:"history"
  };
  const FACT_MARK_ANSWERS = {
    card:["person","entry"], door:["person","direction","carry"], sound:["room","fight"],
    dna:["night","alive"], cuff:["night","actor"], water:["opened","present"],
    injury:["wall","weapon"], alibi:["innocent","never"]
  };
  const EVIDENCE_PROVENANCE = {
    e_access: { stage:"raw", origins:["door-auth"], originGroup:"1102-door-system", supports:["credential-auth-time"] },
    e_body: { stage:"raw", origins:["autopsy-initial"], supports:["injury", "broad-time"] },
    e_watch: { stage:"raw", origins:["watch-device"], supports:["impact-time", "physiology"] },
    e_impact: { stage:"raw", origins:["hidden-scene"], supports:["place", "injury-shape"] },
    e_body_review: { stage:"derived", derivedFrom:["e_body", "e_watch", "e_impact"], supports:["death-window", "injury-place-link"] },
    e_doorcontact: { stage:"raw", origins:["door-contact"], originGroup:"1102-door-system", supports:["door-open-time", "front-exit-exclusion"] },
    e_struggle: { stage:"raw", origins:["forensic-contact"], supports:["active-conflict", "actor-identity"] },
    e_chaintrial: { stage:"derived", derivedFrom:["e_lock", "e_hatch", "e_route", "e_doorcontact", "e_chain_tests"], supports:["locked-exit"] }
  };

  function freshState() {
    return {
      version: SAVE_VERSION, started: false, chapter: 1, screen: "home",
      evidence: [], examined: [], solved: [], deductions: [],
      interviews: {}, interviewData: {}, mirrorFound: [], mirrorProof: [], differenceClasses: {},
      factAnswers: {}, factMarks: {}, testimonyAnswers: {}, matrixAnswers: {}, chainAnswers: {}, chainFiles: {},
      exclusionAnswers: {}, zhouConditions: [], matrixExpanded: [], matrixHintLevels: {},
      report: {}, reportAdopted: [], reportRevision: 0, verifiedReport: null, caseArchive: null,
      confrontation: {}, confrontationVersions: {}, legacyProofRecords: {}, confrontationStep: 0,
      confrontationDraft: {}, confrontationExpanded: {}, confrontationOnlySelected: false,
      reconstructionOrder: ["transfer", "water", "leave", "card", "chain"], reconstructionSources: {}, reconstructionSupport: {}, reconstructionEvidence: {},
      notebookReturn: null, legacyCaseRecord: null, legacyReconstruction: false,
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
    const sourceVersion = Math.max(0, Number(raw.version) || 0);
    const state = { ...base, ...raw };
    state.version = SAVE_VERSION;
    state.chapter = Math.max(1, Math.min(10, Number(state.chapter) || 1));
    if (sourceVersion < 9 && Number(raw.chapter) === 9) state.chapter = 10;
    if (sourceVersion < 9 && raw.screen === "chapter-9") state.screen = "chapter-10";
    ["evidence", "examined", "solved", "deductions", "mirrorFound", "mirrorProof", "pinnedEvidence", "hints", "zhouConditions", "matrixExpanded", "reportAdopted"].forEach(key => {
      state[key] = uniqueStrings(state[key]);
    });
    state.pinnedEvidence = state.pinnedEvidence.filter(id => state.evidence.includes(id)).slice(0, 3);
    ["interviews", "interviewData", "factAnswers", "factMarks", "differenceClasses", "testimonyAnswers", "matrixAnswers", "chainAnswers", "chainFiles", "exclusionAnswers", "matrixHintLevels", "report", "confrontation", "confrontationVersions", "legacyProofRecords", "confrontationDraft", "confrontationExpanded", "reconstructionSources", "reconstructionSupport", "reconstructionEvidence", "currentTheory"].forEach(key => {
      state[key] = safeObject(state[key]);
    });
    Object.keys(state.factMarks).forEach(key => state.factMarks[key] = uniqueStrings(state.factMarks[key]));
    state.factAnswers.viewedFloors = uniqueStrings(state.factAnswers.viewedFloors).filter(value => ["11","12","13","14","15"].includes(value));
    Object.keys(state.matrixHintLevels).forEach(key => state.matrixHintLevels[key] = Math.max(0,Math.min(3,Math.floor(Number(state.matrixHintLevels[key]) || 0))));
    Object.keys(state.reconstructionEvidence).forEach(key => state.reconstructionEvidence[key] = uniqueStrings(state.reconstructionEvidence[key]));
    state.reportRevision = Math.max(0, Math.floor(Number(state.reportRevision) || 0));
    state.verifiedReport = state.verifiedReport && typeof state.verifiedReport === "object" && !Array.isArray(state.verifiedReport) ? {
      answers: safeObject(state.verifiedReport.answers),
      revision: Math.max(0, Math.floor(Number(state.verifiedReport.revision) || 0)),
      ruleVersion: Math.max(0, Math.floor(Number(state.verifiedReport.ruleVersion) || 0)),
      adopted: uniqueStrings(state.verifiedReport.adopted)
    } : null;
    state.caseArchive = state.caseArchive && typeof state.caseArchive === "object" && !Array.isArray(state.caseArchive) ? state.caseArchive : null;
    Object.keys(state.interviews).forEach(id => state.interviews[id] = Math.max(0, Math.min(3, Number(state.interviews[id]) || 0)));
    Object.keys(state.confrontation).forEach(key => state.confrontation[key] = uniqueStrings(Array.isArray(state.confrontation[key]) ? state.confrontation[key] : [state.confrontation[key]]));
    Object.keys(state.confrontationVersions).forEach(key => state.confrontationVersions[key] = Math.max(0, Math.floor(Number(state.confrontationVersions[key]) || 0)));
    Object.keys(state.legacyProofRecords).forEach(key => {
      const record = safeObject(state.legacyProofRecords[key]);
      state.legacyProofRecords[key] = {
        ruleVersion: Math.max(0, Math.floor(Number(record.ruleVersion) || sourceVersion)),
        evidence: uniqueStrings(record.evidence),
        note: typeof record.note === "string" ? record.note : "按旧版规则完成；当前规则需要复核。"
      };
    });
    Object.keys(state.confrontationDraft).forEach(key => state.confrontationDraft[key] = uniqueStrings(state.confrontationDraft[key]).slice(0, 3));
    Object.keys(state.confrontationExpanded).forEach(key => state.confrontationExpanded[key] = uniqueStrings(state.confrontationExpanded[key]));
    const order = uniqueStrings(state.reconstructionOrder);
    state.reconstructionOrder = order.length === RECONSTRUCTION_ORDER.length && RECONSTRUCTION_ORDER.every(id => order.includes(id)) ? order : [...base.reconstructionOrder];
    const oldReturnChapter = sourceVersion < 9 && Number(raw.notebookReturnChapter) === 9 ? 10 : Number(raw.notebookReturnChapter);
    const returnValue = safeObject(state.notebookReturn);
    const rawReturnChapter = Number(returnValue.chapter || (Number.isInteger(oldReturnChapter) ? oldReturnChapter : 0));
    const returnChapter = sourceVersion < 9 && rawReturnChapter === 9 ? 10 : rawReturnChapter;
    state.notebookReturn = returnChapter >= 1 && returnChapter <= 10 ? {
      chapter:returnChapter,
      anchor:typeof returnValue.anchor === "string" ? returnValue.anchor.slice(0,160) : "",
      focus:typeof returnValue.focus === "string" ? returnValue.focus.slice(0,160) : "",
      scrollY:Math.max(0,Number(returnValue.scrollY) || 0)
    } : null;
    state.legacyCaseRecord = state.legacyCaseRecord && typeof state.legacyCaseRecord === "object" && !Array.isArray(state.legacyCaseRecord) ? state.legacyCaseRecord : null;
    state.legacyReconstruction = Boolean(state.legacyReconstruction);
    state.confrontationOnlySelected = Boolean(state.confrontationOnlySelected);
    state.interludeSeen = Boolean(state.interludeSeen);
    if (sourceVersion < 4 && !hasSolved(state, "p10") && validateMatrix(state.matrixAnswers).ok) {
      state.exclusionAnswers = { ...EXCLUSION_ANSWERS };
      state.zhouConditions = [...ZHOU_CONDITIONS];
    }
    if (sourceVersion < 5 && !hasSolved(state, "p12")) {
      state.solved = state.solved.filter(id => id !== "report");
      state.report.waterStart = state.report.waterStart || "";
      state.report.chainMethod = state.report.chainMethod || "";
      state.confrontation = Object.fromEntries(Object.entries(state.confrontation).filter(([key]) => ["q1","q2"].includes(key)));
      state.confrontationStep = Math.min(state.confrontationStep, 2);
    }
    if (sourceVersion < 5 && hasSolved(state, "p12")) {
      state.report.waterStart = state.report.waterStart || REPORT_ANSWERS.waterStart;
      state.report.chainMethod = state.report.chainMethod || REPORT_ANSWERS.chainMethod;
    }
    if (sourceVersion < 6 && state.evidence.includes("e_chaintrial") && !state.solved.includes("p10r")) state.solved.push("p10r");
    if (sourceVersion < 7) {
      if (["e_body", "e_watch", "e_impact"].every(id => state.evidence.includes(id)) && hasSolved(state,"p05")) {
        if (!state.evidence.includes("e_body_review")) state.evidence.push("e_body_review");
        if (!state.solved.includes("p05r")) state.solved.push("p05r");
      }
      if (state.evidence.includes("e_chaintrial")) state.legacyReconstruction = true;
      state.solved = state.solved.filter(id => id !== "p10r");
    }
    if (sourceVersion < 8 && state.evidence.includes("e_access") && !state.evidence.includes("e_doorcontact")) state.evidence.push("e_doorcontact");
    if (sourceVersion < 8 && typeof state.report.culprit === "string") {
      if (!state.report.stager) state.report.stager = state.report.culprit;
      if (state.ending && !state.report.fatalActor) state.report.fatalActor = state.report.culprit;
      delete state.report.culprit;
    }
    if (sourceVersion < 8 && state.ending) {
      if (!state.legacyCaseRecord) state.legacyCaseRecord = {
        saveVersion: sourceVersion,
        confrontation: Object.fromEntries(Object.entries(state.confrontation).map(([key,value]) => [key,[...value]])),
        note: "旧版结案证明记录按当时规则封存，不映射为新版致命冲突举证。"
      };
      if (!state.caseArchive) state.caseArchive = {
        saveVersion: sourceVersion,
        report: { ...state.report },
        confrontation: Object.fromEntries(Object.entries(state.confrontation).map(([key,value]) => [key,[...value]])),
        ending: state.ending,
        note: "该周目按旧版规则结案，报告与证明均保持只读。"
      };
      state.confrontation = {};
      state.confrontationVersions = {};
    } else if (sourceVersion < 8) {
      const total = hasSolved(state,"p11") ? 6 : 5;
      for (let step = 1; step <= total; step += 1) {
        const key = `q${step}`;
        const picks = state.confrontation[key];
        if (!picks || !picks.length) continue;
        const valid = picks.length <= 3 && picks.every(id => state.evidence.includes(id)) && validateConfrontationAnswer(step,picks).ok;
        if (valid) state.confrontationVersions[key] = PROOF_RULE_VERSION;
        else {
          state.legacyProofRecords[key] = {
            ruleVersion: sourceVersion,
            evidence: [...picks],
            note: "该轮按旧版规则完成；当前证据语义已调整，需要复核。"
          };
          if (!state.confrontationDraft[key] || !state.confrontationDraft[key].length) state.confrontationDraft[key] = picks.filter(id => state.evidence.includes(id)).slice(0,3);
          delete state.confrontation[key];
          delete state.confrontationVersions[key];
        }
      }
      state.verifiedReport = null;
      state.solved = state.solved.filter(id => id !== "report");
    }
    if (sourceVersion < 9) {
      for (const step of RECONSTRUCTION_ORDER) {
        const linked = uniqueStrings(state.reconstructionEvidence[step]);
        if (state.reconstructionSources[step]) linked.push(state.reconstructionSources[step]);
        const oldSupport = RECONSTRUCTION_SUPPORT[step];
        if (oldSupport && state.reconstructionSupport[step] === oldSupport.value) linked.push(...oldSupport.evidence);
        state.reconstructionEvidence[step] = [...new Set(linked)].filter(id => state.evidence.includes(id));
      }
      if (hasSolved(state,"p10r")) {
        for (const step of RECONSTRUCTION_ORDER) state.reconstructionEvidence[step] = [...RECONSTRUCTION_EVIDENCE[step]];
      }
      if (state.verifiedReport || hasSolved(state,"report") || state.ending) state.reportAdopted = [...REPORT_AUTO_KEYS];
      if (state.verifiedReport) {
        state.verifiedReport.ruleVersion = REPORT_RULE_VERSION;
        state.verifiedReport.adopted = [...state.reportAdopted];
      }
      if (state.ending) {
        if (!state.legacyCaseRecord) state.legacyCaseRecord = {
          saveVersion:sourceVersion,
          confrontation:Object.fromEntries(Object.entries(state.confrontation).map(([key,value]) => [key,[...value]])),
          note:"该周目按 v3.5 及更早规则结案；旧题序与证明解释保持只读。"
        };
        if (!state.caseArchive) state.caseArchive = {
          saveVersion:sourceVersion,
          report:{ ...state.report },
          confrontation:Object.fromEntries(Object.entries(state.confrontation).map(([key,value]) => [key,[...value]])),
          confrontationVersions:{ ...state.confrontationVersions },
          ending:state.ending,
          note:"该周目按旧版规则结案，报告与证明均保持只读。"
        };
      } else {
        const archived = {};
        Object.entries(state.legacyProofRecords).forEach(([key,record]) => {
          const safe = safeObject(record);
          archived[`v${Math.max(1,Number(safe.ruleVersion) || sourceVersion)}-${key}`] = {
            ruleVersion:Math.max(1,Number(safe.ruleVersion) || sourceVersion),
            evidence:uniqueStrings(safe.evidence),
            note:typeof safe.note === "string" ? safe.note : "按旧版规则完成；新版终章需要复核。"
          };
        });
        Object.entries(state.confrontation).forEach(([key,picks]) => {
          if (!uniqueStrings(picks).length) return;
          archived[`v${Math.max(1,sourceVersion)}-${key}`] = {
            ruleVersion:Math.max(1,sourceVersion),
            evidence:uniqueStrings(picks),
            note:"按 v3.5 题序完成；新版终章已压缩为核心质询，此记录只读封存。"
          };
        });
        state.legacyProofRecords = archived;
        state.confrontation = {};
        state.confrontationVersions = {};
        state.confrontationDraft = {};
        state.confrontationExpanded = {};
        state.confrontationStep = 0;
        state.confrontationOnlySelected = false;
        state.solved = state.solved.filter(id => id !== "p12");
      }
    }
    if (hasSolved(state, "p11") && Object.keys(state.chainFiles).length === 0) state.chainFiles = { ...CHAIN_FILE_ANSWERS };
    state.meta = {
      endings: uniqueStrings(state.meta && state.meta.endings),
      bestEvidence: Math.max(0, Number(state.meta && state.meta.bestEvidence) || 0)
    };
    if (CORE_INTERVIEWS.every(id => Number(state.interviews[id] || 0) >= 3) && !state.solved.includes("interviews-core")) state.solved.push("interviews-core");
    if (!state.ending) {
      state.confrontationStep = nextConfrontationStep(state);
      if (!allCurrentProofsComplete(state)) state.solved = state.solved.filter(id => id !== "p12");
      if (isCurrentReportVerified(state)) {
        if (!state.solved.includes("report")) state.solved.push("report");
      } else state.solved = state.solved.filter(id => id !== "report");
    } else if (!state.caseArchive) {
      state.caseArchive = {
        saveVersion: SAVE_VERSION,
        report: state.verifiedReport ? { ...state.verifiedReport.answers } : { ...state.report },
        confrontation: Object.fromEntries(Object.entries(state.confrontation).map(([key,value]) => [key,[...value]])),
        ending: state.ending,
        note: "结案时的报告与举证快照。"
      };
    }
    return state;
  }

  function hasSolved(state, id) { return state.solved.includes(id); }
  function coreInterviewsComplete(state) { return CORE_INTERVIEWS.every(id => Number(state.interviews[id] || 0) >= 3); }
  function keyInterviewCount(state) { return CORE_INTERVIEWS.filter(id => Number(state.interviews[id] || 0) >= 3).length; }

  function chapterUnlocked(state, chapter) {
    if (chapter <= 1) return true;
    if (chapter === 8) return hasSolved(state, "p09") && keyInterviewCount(state) >= 2;
    if (chapter === 9) return chapterUnlocked(state, 8) && hasSolved(state,"p10") && hasSolved(state,"p05r") &&
      ["e_body_review", "e_cardauth", "e_route", "e_struggle"].every(id => state.evidence.includes(id));
    if (chapter === 10) return Boolean(state.ending) || hasSolved(state,"p12") || (chapterUnlocked(state,9) &&
      (hasSolved(state,"p10r") || state.legacyReconstruction) &&
      ["e_waterlab", "e_route", "e_hatch", "e_chaintrial", "e_doorcontact"].every(id => state.evidence.includes(id)));
    return (CHAPTER_REQUIREMENTS[chapter] || []).every(id => hasSolved(state, id));
  }

  function chapterLockReason(state, chapter) {
    if (chapter < 8 || !chapterUnlocked(state,Math.max(1,chapter-1))) return "完成前一阶段的关键推理后开放。";
    if (chapter === 9) {
      if (!hasSolved(state,"p10")) return "条件交集尚未完成。";
      if (!hasSolved(state,"p05r") || !state.evidence.includes("e_body_review")) return "伤情与设备联合复核尚未完成。";
      if (!state.evidence.includes("e_struggle")) return "致命冲突行为人的接触检验尚未完成。";
      return "A047 身份或服务区路径仍有缺项。";
    }
    if (chapter === 10) {
      if (!hasSolved(state,"p10r") && !state.legacyReconstruction) return "现场复原尚未完成。";
      return "渗漏、门磁或检修通道的复原来源仍有缺项。";
    }
    return "完成前一阶段的关键推理后开放。";
  }

  function highestUnlockedChapter(state) {
    let highest = 1;
    for (let chapter = 2; chapter <= 10; chapter += 1) {
      if (chapterUnlocked(state, chapter)) highest = chapter;
      else break;
    }
    return highest;
  }

  function evidenceProgress(state) {
    const found = MAIN_EVIDENCE.filter(id => state.evidence.includes(id)).length;
    const supplementalFound = SUPPLEMENTAL_EVIDENCE.filter(id => state.evidence.includes(id)).length;
    const oldCaseFound = OLD_CASE_EVIDENCE.filter(id => state.evidence.includes(id)).length;
    return {
      found, total: MAIN_EVIDENCE.length, percent: Math.round(found / MAIN_EVIDENCE.length * 100),
      supplementalFound, supplementalTotal:SUPPLEMENTAL_EVIDENCE.length,
      oldCaseFound, oldCaseTotal:OLD_CASE_EVIDENCE.length
    };
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
    if (field === "know" && evidence.has("e_accountmap") && evidence.has("e_trainingaccess")) return "yes";
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

  function validateDimensionReadings(photo,plan) {
    const photoValue=Number(photo), planValue=Number(plan), difference=planValue-photoValue;
    const ok=photoValue >= 81 && photoValue <= 85 && planValue >= 94 && planValue <= 98 && difference >= 11 && difference <= 15;
    return { ok, photo:photoValue, plan:planValue, difference };
  }

  function validateDifferenceClasses(found,classes) {
    const discovered=uniqueStrings(found).filter(id => id in DIFFERENCE_CLASS_ANSWERS);
    const safe=safeObject(classes);
    const classified=discovered.filter(id => typeof safe[id] === "string" && safe[id]);
    const wrong=classified.filter(id => safe[id] !== DIFFERENCE_CLASS_ANSWERS[id]);
    const correct=classified.filter(id => safe[id] === DIFFERENCE_CLASS_ANSWERS[id]);
    return { ok:correct.length >= 6 && wrong.length === 0, discovered, classified, correct, wrong, missing:discovered.filter(id => !safe[id]) };
  }

  function validateFactCleanup(marks) {
    const safe=safeObject(marks), wrong=[];
    for (const [id,expected] of Object.entries(FACT_MARK_ANSWERS)) {
      const picked=uniqueStrings(safe[id]).sort(), answer=[...expected].sort();
      if (picked.length !== answer.length || picked.some((value,index) => value !== answer[index])) wrong.push(id);
    }
    return { ok:wrong.length === 0, wrong };
  }

  function validateSceneReconstruction(order, links, state) {
    const arranged = uniqueStrings(order);
    const safeLinks = safeObject(links);
    const requiredEvidence = [...new Set(Object.values(RECONSTRUCTION_EVIDENCE).flat())];
    const missingEvidence = requiredEvidence.filter(id => !state || !state.evidence.includes(id));
    if (missingEvidence.length) {
      const reason = missingEvidence.includes("e_route") ? "缺少服务区路径记录：当前只能确认工具或另一出口存在，不能形成带精确时刻的完整复原。" :
        missingEvidence.includes("e_access") ? "缺少 A047 认证日志：搬运痕迹不能单独证明 21:41 发生凭证解锁。" :
        missingEvidence.includes("e_doorcontact") ? "缺少连续门磁记录：认证成功不能证明门扇开合，也不能排除挂链后的正门离场。" :
        missingEvidence.includes("e_chain_tests") ? "门链替代顺序尚未实测：检修口痕迹不能单独证明挂链后如何离开。" :
        "现场复原仍缺直接记录或痕迹来源，先完成对应调查。";
      return { ok:false, issue:"evidence", reason, missingEvidence };
    }
    const position = Object.fromEntries(arranged.map((id,index) => [id,index]));
    if (position.leave < position.chain) return { ok:false, issue:"order", reason:"离开后无法再从室内挂上门链；这条顺序不能保留锁闭状态。" };
    if (position.transfer < position.card) return { ok:false, issue:"order", reason:"你把正门搬运放在取卡之前，现有记录尚不能解释这次开门。" };
    if (position.card < position.water) return { ok:false, issue:"order", reason:"渗漏实验把放水约束在 20:46，早于 21:19 取卡；当前顺序与时间记录冲突。" };
    if (position.chain < position.transfer) return { ok:false, issue:"order", reason:"门链若在搬运前形成，尸体便无法再经 1102 正门进入。" };
    const firstWrong = RECONSTRUCTION_ORDER.find((id,index) => arranged[index] !== id);
    if (firstWrong) return { ok:false, issue:"order", reason:"现有时间记录仍发生冲突：放水、取卡、搬运与锁闭离场的先后关系需要重新核对。" };
    for (const step of RECONSTRUCTION_ORDER) {
      const attached=uniqueStrings(safeLinks[step]);
      const expected=RECONSTRUCTION_EVIDENCE[step];
      const unrelated=attached.filter(id => !expected.includes(id));
      const missing=expected.filter(id => !attached.includes(id));
      if (unrelated.length) return { ok:false, issue:"unrelated", step, unrelated, reason:"当前步骤连接了只能回答其他问题的材料；先移除无关材料，再检查行为、时间与路径是否分别有来源。" };
      if (missing.length) {
      const reasons={
        water:"渗漏实验支持约 20:46 放水，但还需同时段管井记录说明进入路径。",
        card:"取卡日志固定时间与卡号，仍需活体认证落实是谁操作。",
        transfer:"搬运车痕迹支持使用了搬运工具，但不能单独支持 21:41 经正门进入。",
        chain:"原始门链状态要求人在室内挂链，仍需替代顺序测试排除门缝复位和前门离场。",
        leave:"这条材料支持使用了检修口，但不能确定离开时间；还需 21:49 路径记录与替代顺序测试。"
      };
        return { ok:false, issue:"support", step, supported:attached.filter(id => expected.includes(id)), missing, reason:reasons[step] };
      }
    }
    return { ok:true, issue:null, reason:"五个步骤的顺序与逐步材料连接均闭合。" };
  }

  const REPORT_ANSWERS = {
    deathPlace: "1402", deathTime: "19:16—19:18", cardUser: "周岚",
    cufflink: "两周前遗留", sound: "14层管道结构传声",
    transferReason: "伪造1102内晚间死亡", waterStart: "约20:46",
    chainMethod: "室内挂链后经浴室检修通道离开",
    stager: "周岚", fatalActor: "周岚"
  };
  const REPORT_AUTO_KEYS = ["deathPlace", "deathTime", "cardUser", "cufflink", "sound", "waterStart", "chainMethod"];

  const REPORT_REQUIREMENTS = {
    deathPlace: { category: "地点连接", solved: ["p05r"], evidence: ["e_impact", "e_body_review"] },
    deathTime: { category: "死亡区间", solved:["p05r"], evidence: ["e_body_review"] },
    cardUser: { category: "身份归属", evidence: ["e_cardlog", "e_cardauth", "e_route"] },
    cufflink: { category: "物证时间", solved: ["p09"], evidence: ["e_cufflink", "e_cuffphoto"] },
    sound: { category: "声音路径", solved: ["p08"], evidence: ["e_pipe"] },
    transferReason: { category: "置换目的", solved: ["p05", "p10"], evidence: ["e_floor", "e_waterlab"] },
    waterStart: { category: "时间顺序", evidence: ["e_waterlab"] },
    chainMethod: { category: "锁闭复原", reconstruction:true, evidence: ["e_lock", "e_hatch", "e_chaintrial", "e_route", "e_doorcontact"] },
    stager: { category: "现场置换者", solved: ["p10"], reconstruction:true, evidence: ["e_cardauth", "e_route", "e_cart", "e_chaintrial"] },
    fatalActor: { category: "致命冲突行为人", solved:["p05r"], evidence: ["e_body_review", "e_route", "e_struggle"] }
  };

  function reportRequirementSupported(state, key) {
    const rule = REPORT_REQUIREMENTS[key];
    return Boolean(state && rule && (rule.solved || []).every(id => hasSolved(state,id)) &&
      (!rule.reconstruction || hasSolved(state,"p10r") || state.legacyReconstruction) &&
      (rule.evidence || []).every(id => state.evidence.includes(id)));
  }

  function canonicalReport(report) {
    const source = safeObject(report);
    return Object.fromEntries(Object.keys(REPORT_ANSWERS).map(key => [key, typeof source[key] === "string" ? source[key] : ""]));
  }

  function prefillReport(report, state) {
    const next = canonicalReport(report);
    REPORT_AUTO_KEYS.forEach(key => {
      if (!next[key] && reportRequirementSupported(state,key)) next[key] = REPORT_ANSWERS[key];
    });
    return next;
  }

  function validateReport(report, state) {
    const answers = canonicalReport(report);
    const wrong = Object.keys(REPORT_ANSWERS).filter(key => answers[key] !== REPORT_ANSWERS[key]);
    const unsupported = state ? Object.keys(REPORT_REQUIREMENTS).filter(key => !reportRequirementSupported(state,key)) : [];
    const unadopted = state ? REPORT_AUTO_KEYS.filter(key => !state.reportAdopted.includes(key)) : [];
    const categories = [...new Set([...wrong, ...unsupported].map(key => REPORT_REQUIREMENTS[key] && REPORT_REQUIREMENTS[key].category).filter(Boolean))];
    if (unadopted.length) categories.unshift("既成事实确认");
    return { ok: wrong.length === 0 && unsupported.length === 0 && unadopted.length === 0, wrong, unsupported, unadopted, categories };
  }

  function reportsEqual(a,b) {
    const left = canonicalReport(a), right = canonicalReport(b);
    return Object.keys(REPORT_ANSWERS).every(key => left[key] === right[key]);
  }

  function isCurrentReportVerified(state) {
    if (!state || !state.verifiedReport) return false;
    const snapshot = state.verifiedReport;
    return Number(snapshot.ruleVersion) === REPORT_RULE_VERSION &&
      Number(snapshot.revision) === Number(state.reportRevision || 0) &&
      reportsEqual(snapshot.answers,state.report) &&
      REPORT_AUTO_KEYS.every(key => uniqueStrings(snapshot.adopted).includes(key) && state.reportAdopted.includes(key)) &&
      validateReport(snapshot.answers,state).ok;
  }

  function reportStatus(state) {
    if (state && state.ending) return "closed";
    if (!state || !state.verifiedReport) return "draft";
    return isCurrentReportVerified(state) ? "verified" : "modified";
  }

  function markReportEdited(state,key,value) {
    if (!state || state.ending || !(key in REPORT_ANSWERS) || state.report[key] === value) return false;
    state.report[key] = value;
    state.reportRevision = Math.max(0,Number(state.reportRevision) || 0) + 1;
    state.solved = state.solved.filter(id => id !== "report");
    return true;
  }

  function markReportAdopted(state,key,adopted=true) {
    if (!state || state.ending || !REPORT_AUTO_KEYS.includes(key)) return false;
    const current=state.reportAdopted.includes(key);
    if (current === Boolean(adopted)) return false;
    state.reportAdopted = adopted ? [...state.reportAdopted,key] : state.reportAdopted.filter(id => id !== key);
    state.reportRevision = Math.max(0,Number(state.reportRevision) || 0) + 1;
    state.solved = state.solved.filter(id => id !== "report");
    return true;
  }

  function verifyReportSnapshot(state) {
    const result = validateReport(state && state.report,state);
    if (!result.ok) return result;
    state.verifiedReport = {
      answers: canonicalReport(state.report),
      revision: Math.max(0,Number(state.reportRevision) || 0),
      ruleVersion: REPORT_RULE_VERSION,
      adopted:[...state.reportAdopted]
    };
    if (!state.solved.includes("report")) state.solved.push("report");
    return { ...result, snapshot: state.verifiedReport };
  }

  const CONFRONTATION_ROUTES = {
    q1: { category: "地点连接", relevant: ["e_impact", "e_body_review", "e_body", "e_watch"], routes: [
      { id: "review", all: ["e_impact", "e_body_review"], explanation: "1402 撞击痕固定现场形态，联合复核把该形态与后枕伤相连，因此死亡地点连接成立。" }
    ], supplements:{ e_body:"补强初检伤情基础", e_watch:"补强 19:16 冲击时间" }, components:[
      { evidence:["e_impact"], supported:"1402 存在与伤口形态吻合的撞击痕", missing:"能把撞击痕与死者伤情对应的复核" },
      { evidence:["e_body_review"], supported:"伤情与现场形态已经形成对应", missing:"固定撞击发生地点的现场物证" }
    ] },
    q2: { category: "致命冲突行为人", relevant: ["e_body_review", "e_route", "e_struggle", "e_watch", "e_impact"], routes: [{ id: "fatal-conflict", all: ["e_body_review", "e_route", "e_struggle"], explanation: "联合复核把致命撞击固定在 19:16—19:18 的 1402；服务区记录证明周岚同时处于 14F 受控区；冲突接触复核又把她连接到生前冲突及撞击瞬间，而非仅连接到之后的搬运。三者共同支持她是致命冲突行为人；主观故意仍不由这组材料单独回答。" }], supplements:{ e_watch:"补强冲击时间", e_impact:"补强撞击方向" }, components:[
      { evidence:["e_body_review"], supported:"致命撞击的时间与地点已经固定", missing:"固定致命事件时间与地点的联合复核" },
      { evidence:["e_route"], supported:"周岚在同一时段处于 14F 受控区", missing:"周岚在致命窗口内的独立通行记录" },
      { evidence:["e_struggle"], supported:"生前主动接触与撞击瞬间近距离在场已经连接", missing:"区分生前冲突与事后搬运的法医接触检验" }
    ] },
    q3: { category: "旧案联系", relevant: ["e_oldfile", "e_casualty", "e_hr"], routes: [{ id: "oldcase", all: ["e_oldfile", "e_casualty", "e_hr"], explanation: "原始卷宗固定事故责任，死亡名单与人事档案用两个来源把周屿连接到周岚。" }], components:[
      { evidence:["e_oldfile"], supported:"2014 年责任链已经由原始卷宗固定", missing:"固定旧案责任链的原始卷宗" },
      { evidence:["e_casualty"], supported:"周屿的遇难者身份已经固定", missing:"固定遇难者身份的名单" },
      { evidence:["e_hr"], supported:"周屿与周岚的亲属关系已经连接", missing:"连接周屿与周岚的人事记录" }
    ] }
  };

  function validateConfrontationAnswer(step, evidenceIds) {
    const rule = CONFRONTATION_ROUTES[`q${step}`];
    if (!rule) return { ok: false, reason: "不存在这一轮举证。" };
    const picks = uniqueStrings(evidenceIds);
    if (picks.length > 3) return { ok:false, category:rule.category, issue:"limit", supported:[], missingParts:[], reason:"每轮最多提交三条材料；先保留能直接回答当前质疑的来源。" };
    const irrelevant = picks.filter(id => !rule.relevant.includes(id));
    const supported = (rule.components || []).filter(component => component.evidence.some(id => picks.includes(id))).map(component => component.supported);
    const missingParts = (rule.components || []).filter(component => !component.evidence.some(id => picks.includes(id))).map(component => component.missing);
    if (irrelevant.length) return { ok: false, category: rule.category, issue: "irrelevant", irrelevant, supported, missingParts, reason: `${supported.length ? `已支持：${supported.join("；")}。` : "当前选择尚未支持这条质疑中的必要连接。"} 其中有材料只能回答别的问题，不能用于【${rule.category}】；请移除后再核对缺口。` };
    const route = [...rule.routes].sort((a,b)=>b.all.length-a.all.length).find(candidate => candidate.all.every(id => picks.includes(id)));
    if (route) {
      const supplements=picks.filter(id=>!route.all.includes(id));
      const supplementText=supplements.map(id=>rule.supplements && rule.supplements[id]).filter(Boolean);
      const dependencyNotes=[];
      picks.forEach(id=>{
        const model=EVIDENCE_PROVENANCE[id];
        if (model && model.stage === "derived" && (model.derivedFrom || []).some(source=>picks.includes(source))) {
          dependencyNotes.push(id === "e_body_review" ? "联合复核已经引用初检、手表与现场比对；这些材料构成一条派生链，不重复计算为额外独立来源。" : "复原结论引用了所选原始材料，不重复计算为额外独立来源。");
        }
      });
      const explanation=[route.explanation,supplementText.length ? `相关补强：${supplementText.join("；")}。` : "",...new Set(dependencyNotes)].filter(Boolean).join(" ");
      return { ok:true, category:rule.category, routeId:route.id, supplements, supported, missingParts:[], dependencyNotes:[...new Set(dependencyNotes)], explanation };
    }
    const closest = rule.routes.map(candidate => ({ ...candidate, missing: candidate.all.filter(id => !picks.includes(id)), matched: candidate.all.filter(id => picks.includes(id)).length })).sort((a,b) => b.matched - a.matched)[0];
    const supportedText = supported.length ? `已支持：${supported.join("；")}。` : "当前选择还没有建立这条质疑所需的连接。";
    const missingText = missingParts.length ? `尚缺：${missingParts.join("；")}。` : "所选材料仍未组成可验证的完整路线。";
    return { ok: false, category: rule.category, issue: "missing", missing: closest ? closest.missing : [], supported, missingParts, reason: `【${rule.category}】${supportedText} ${missingText}` };
  }

  function proofTotal(state) { return state && hasSolved(state,"p11") ? 3 : 2; }

  function validateStoredProof(state,step) {
    const key=`q${step}`, picks=state && state.confrontation && state.confrontation[key];
    if (!picks || !picks.length) return { ok:false, status:state && state.legacyProofRecords && state.legacyProofRecords[key] ? "legacy" : "missing" };
    if (Number(state.confrontationVersions && state.confrontationVersions[key]) !== PROOF_RULE_VERSION) return { ok:false, status:"legacy" };
    if (picks.length > 3 || picks.some(id => !state.evidence.includes(id))) return { ok:false, status:"review-required" };
    const result=validateConfrontationAnswer(step,picks);
    return { ...result, status:result.ok ? "current" : "review-required" };
  }

  function storedProofStatus(state,key) {
    const step=Number(String(key).replace(/^q/,""));
    const current=validateStoredProof(state,step);
    if (current.ok) return "current";
    if (state && state.legacyProofRecords && state.legacyProofRecords[`q${step}`]) return "legacy";
    return "review-required";
  }

  function allCurrentProofsComplete(state) {
    return Array.from({length:proofTotal(state)},(_,index)=>validateStoredProof(state,index+1).ok).every(Boolean);
  }

  function nextConfrontationStep(state) {
    const total=proofTotal(state);
    for (let step=1;step<=total;step+=1) if (!validateStoredProof(state,step).ok) return step-1;
    return total;
  }

  function canSubmitDisclosure(state) {
    return Boolean(state && !state.ending && hasSolved(state,"p12") && isCurrentReportVerified(state) && allCurrentProofsComplete(state));
  }

  function knowledgeComplete(state) {
    return ["p07", "p10", "p11", "p12"].every(id => hasSolved(state, id)) &&
      ["e_oldfile", "e_casualty", "e_hr"].every(id => state.evidence.includes(id));
  }

  function determineEnding(state, disclosure) {
    if (!canSubmitDisclosure(state)) return null;
    if (!knowledgeComplete(state)) return "A";
    return disclosure === "culprit-only" ? "C" : "D";
  }

  function caseResolutionState(state) {
    if (state && state.ending) return "closed";
    if (state && hasSolved(state, "p12") && !isCurrentReportVerified(state)) return "awaiting-report-review";
    if (state && hasSolved(state, "p12") && !allCurrentProofsComplete(state)) return "awaiting-proof-review";
    if (canSubmitDisclosure(state)) return "awaiting-disclosure";
    return "proving";
  }

  function reasoningRating(state) {
    const revisions=Math.max(0,Number(state && state.mistakes) || 0);
    return revisions <= 2 ? "S" : revisions <= 6 ? "A" : "B";
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
    if (id !== "B" && (!id || !canSubmitDisclosure(state))) return normalizeState(state);
    const next = normalizeState(state);
    next.ending = id;
    if (!next.meta.endings.includes(id)) next.meta.endings.push(id);
    next.meta.bestEvidence = Math.max(next.meta.bestEvidence, next.evidence.length);
    next.caseArchive = {
      saveVersion:SAVE_VERSION,
      chapterSchemaVersion:SAVE_VERSION,
      proofRuleVersion:PROOF_RULE_VERSION,
      report:next.verifiedReport ? canonicalReport(next.verifiedReport.answers) : canonicalReport(next.report),
      reportAdopted:[...next.reportAdopted],
      reportRuleVersion:next.verifiedReport ? next.verifiedReport.ruleVersion : null,
      confrontation:Object.fromEntries(Object.entries(next.confrontation).map(([key,value])=>[key,[...value]])),
      confrontationVersions:{...next.confrontationVersions},
      disclosure:id === "C" ? "culprit-only" : id === "D" ? "full" : null,
      ending:id,
      note:"结案时的报告与举证快照。"
    };
    return next;
  }

  return {
    SAVE_VERSION, REPORT_RULE_VERSION, PROOF_RULE_VERSION, CORE_EVIDENCE, MAIN_EVIDENCE, SUPPLEMENTAL_EVIDENCE, OLD_CASE_EVIDENCE, CORE_INTERVIEWS, MATRIX_ANSWERS, MATRIX_AUTO, EXCLUSION_ANSWERS, ZHOU_CONDITIONS,
    CHAIN_ANSWERS, CHAIN_FILE_ANSWERS, RECONSTRUCTION_ORDER, RECONSTRUCTION_SOURCES, RECONSTRUCTION_SUPPORT, RECONSTRUCTION_EVIDENCE, DIFFERENCE_CLASS_ANSWERS, FACT_MARK_ANSWERS, EVIDENCE_PROVENANCE,
    REPORT_ANSWERS, REPORT_AUTO_KEYS, REPORT_REQUIREMENTS, CONFRONTATION_ROUTES,
    freshState, normalizeState, coreInterviewsComplete, keyInterviewCount, chapterUnlocked, chapterLockReason, highestUnlockedChapter,
    evidenceProgress, validateEvidenceSet, validateAlibiCoverage, validateMatrix, candidateStatus, validateExclusionMatrix,
    validateResponsibilityChain, validateResponsibilityPuzzle, validateDimensionReadings, validateDifferenceClasses, validateFactCleanup, validateSceneReconstruction, canonicalReport, prefillReport, validateReport,
    reportStatus, markReportEdited, markReportAdopted, verifyReportSnapshot, isCurrentReportVerified, validateConfrontationAnswer,
    proofTotal, validateStoredProof, storedProofStatus, allCurrentProofsComplete, nextConfrontationStep, canSubmitDisclosure,
    knowledgeComplete, determineEnding, caseResolutionState, reasoningRating, evaluateTheory, recordEnding
  };
});
