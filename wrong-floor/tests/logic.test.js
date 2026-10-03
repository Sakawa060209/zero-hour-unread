"use strict";

const assert = require("node:assert/strict");
const Logic = require("../logic.js");

function test(name, fn) {
  try { fn(); process.stdout.write(`✓ ${name}\n`); }
  catch (error) { process.stderr.write(`✗ ${name}\n${error.stack}\n`); process.exitCode = 1; }
}

test("fresh state starts with only chapter one open", () => {
  const state = Logic.freshState();
  assert.equal(Logic.chapterUnlocked(state, 1), true);
  assert.equal(Logic.chapterUnlocked(state, 2), false);
  assert.equal(Logic.highestUnlockedChapter(state), 1);
});

test("chapter gates require the complete reconstruction rather than P10 alone", () => {
  const state = Logic.freshState();
  state.solved.push("p01", "p02", "p03");
  assert.equal(Logic.highestUnlockedChapter(state), 4);
  assert.equal(Logic.chapterUnlocked(state, 5), false);
  state.solved.push("p09", "p10");
  state.interviews.guxue = 3;
  assert.equal(Logic.chapterUnlocked(state, 8), false, "one key interview is insufficient");
  state.interviews.liangwen = 3;
  assert.equal(Logic.chapterUnlocked(state, 8), true, "two key interviews open the permission investigation");
  assert.equal(Logic.chapterUnlocked(state, 9), false, "P10 alone cannot explain the staged discovery or locked door");
  state.evidence.push("e_waterlab", "e_cardauth", "e_route", "e_hatch");
  assert.equal(Logic.chapterUnlocked(state, 9), false, "missing the chain reenactment keeps the report locked");
  state.evidence.push("e_chaintrial", "e_body_review");
  state.solved.push("p10r");
  assert.equal(Logic.chapterUnlocked(state, 9), false, "the joint review must be completed, not merely present");
  state.solved.push("p05r");
  assert.equal(Logic.chapterUnlocked(state, 9), true, "identity, timing and locked-exit reconstruction open the report without optional P11");
});

test("evidence validation rejects unrelated padding", () => {
  const route = [{ all: ["e_cufflink", "e_cuffphoto"], exact: true }];
  assert.equal(Logic.validateEvidenceSet(["e_cufflink", "e_cuffphoto"], ["e_cufflink", "e_cuffphoto"], route).ok, true);
  const padded = Logic.validateEvidenceSet(["e_cufflink", "e_cuffphoto", "e_stream"], ["e_cufflink", "e_cuffphoto"], route);
  assert.equal(padded.ok, false);
  assert.match(padded.reason, /无关/);
});

test("alibi coverage requires three independent overlapping sources", () => {
  assert.equal(Logic.validateAlibiCoverage(["e_checkin", "e_stream", "e_location"]).ok, true);
  assert.equal(Logic.validateAlibiCoverage(["e_checkin", "e_stream"]).ok, false);
  assert.match(Logic.validateAlibiCoverage(["e_checkin", "e_stream", "e_location", "e_cuffphoto"]).reason, /无关/);
});

test("candidate cells derive from their own evidence and permission never proves card contact", () => {
  const state = Logic.freshState();
  state.solved.push("p02");
  state.evidence.push("e_permission");
  assert.equal(Logic.candidateStatus(state, "guxue", "permission"), "no");
  assert.equal(Logic.candidateStatus(state, "guxue", "card"), "unknown");
  assert.equal(Logic.candidateStatus(state, "zhoulan", "permission"), "yes");
  assert.equal(Logic.candidateStatus(state, "zhoulan", "know"), "unknown");
  assert.equal(Logic.candidateStatus(state, "zhoulan", "blank"), "unknown");
  assert.equal(Logic.candidateStatus(state, "zhoulan", "card"), "unknown");

  state.evidence.push("e_accountmap", "e_trainingaccess", "e_shift", "e_cardlog", "e_cardauth", "e_route");
  for (const field of Logic.ZHOU_CONDITIONS) assert.equal(Logic.candidateStatus(state, "zhoulan", field), "yes", field);
  assert.equal(Logic.validateExclusionMatrix(Logic.EXCLUSION_ANSWERS, Logic.ZHOU_CONDITIONS, state).ok, true);

  for (const [removed, field] of [["e_permission","permission"],["e_accountmap","know"],["e_trainingaccess","know"],["e_shift","blank"],["e_cardauth","card"]]) {
    const reduced = Logic.normalizeState({ ...state, version: Logic.SAVE_VERSION, evidence: state.evidence.filter(id => id !== removed) });
    assert.equal(Logic.candidateStatus(reduced, "zhoulan", field), "unknown", `${removed} must downgrade ${field}`);
    assert.equal(Logic.validateExclusionMatrix(Logic.EXCLUSION_ANSWERS, Logic.ZHOU_CONDITIONS, reduced).ok, false);
  }
});

test("exclusion table still checks player-authored reasons and selected conditions", () => {
  assert.equal(Logic.validateExclusionMatrix({}, []).ok, false);
  const wrongReason = { ...Logic.EXCLUSION_ANSWERS, guxue: "time" };
  assert.deepEqual(Logic.validateExclusionMatrix(wrongReason, Logic.ZHOU_CONDITIONS).wrongPeople, ["guxue"]);
  assert.deepEqual(Logic.validateExclusionMatrix(Logic.EXCLUSION_ANSWERS, ["know", "permission"]).missingConditions, ["blank", "card"]);
});

test("old-case puzzle checks both document-to-actor and actor-to-action links", () => {
  assert.equal(Logic.validateResponsibilityPuzzle(Logic.CHAIN_FILE_ANSWERS, Logic.CHAIN_ANSWERS).ok, true);
  const wrongFile = { ...Logic.CHAIN_FILE_ANSWERS, design: "file-d" };
  assert.deepEqual(Logic.validateResponsibilityPuzzle(wrongFile, Logic.CHAIN_ANSWERS).fileWrong, ["design"]);
  assert.equal(Logic.validateResponsibilityPuzzle(Logic.CHAIN_FILE_ANSWERS, { ...Logic.CHAIN_ANSWERS, design: "approve" }).actionWrong, 1);
});

test("scene reconstruction checks chronology, locked exit and per-step sources", () => {
  const state=Logic.freshState();
  const support=Object.fromEntries(Object.entries(Logic.RECONSTRUCTION_SUPPORT).map(([id,rule])=>[id,rule.value]));
  state.evidence.push(...Object.values(Logic.RECONSTRUCTION_SOURCES),...Object.values(Logic.RECONSTRUCTION_SUPPORT).flatMap(rule=>rule.evidence));
  state.evidence=[...new Set(state.evidence)];
  assert.equal(Logic.validateSceneReconstruction(Logic.RECONSTRUCTION_ORDER,Logic.RECONSTRUCTION_SOURCES,support,state).ok,true);
  const leftBeforeChain=["water","card","transfer","leave","chain"];
  assert.match(Logic.validateSceneReconstruction(leftBeforeChain,Logic.RECONSTRUCTION_SOURCES,support,state).reason,/无法再从室内挂上门链/);
  const transferBeforeCard=["water","transfer","card","chain","leave"];
  assert.match(Logic.validateSceneReconstruction(transferBeforeCard,Logic.RECONSTRUCTION_SOURCES,support,state).reason,/取卡之前/);
  const wrongSource={...Logic.RECONSTRUCTION_SOURCES,leave:"e_lock"};
  assert.equal(Logic.validateSceneReconstruction(Logic.RECONSTRUCTION_ORDER,wrongSource,support,state).issue,"source");
  const wrongSupport={...support,transfer:"exit-route"};
  assert.match(Logic.validateSceneReconstruction(Logic.RECONSTRUCTION_ORDER,Logic.RECONSTRUCTION_SOURCES,wrongSupport,state).reason,/不能单独支持 21:41/);
  const missingRoute={...state,evidence:state.evidence.filter(id=>id!=="e_route")};
  const result=Logic.validateSceneReconstruction(Logic.RECONSTRUCTION_ORDER,Logic.RECONSTRUCTION_SOURCES,support,missingRoute);
  assert.equal(result.issue,"evidence");
  assert.match(result.reason,/不能形成带精确时刻/);
});

test("report rejects contradictions and correct answers without reconstruction evidence", () => {
  const state = Logic.freshState();
  state.solved.push("p05", "p05r", "p08", "p09", "p10");
  state.evidence.push("e_impact","e_watch","e_body","e_body_review","e_lock","e_cardlog","e_cardauth","e_route","e_cufflink","e_cuffphoto","e_pipe","e_floor","e_waterlab","e_hatch","e_chaintrial");
  assert.equal(Logic.validateReport(Logic.REPORT_ANSWERS, state).ok, true);
  const contradiction = { ...Logic.REPORT_ANSWERS, deathPlace: "1102" };
  assert.deepEqual(Logic.validateReport(contradiction, state).wrong, ["deathPlace"]);
  const missingChain = Logic.normalizeState({ ...state, version: Logic.SAVE_VERSION, evidence: state.evidence.filter(id => id !== "e_chaintrial") });
  const unsupported = Logic.validateReport(Logic.REPORT_ANSWERS, missingChain);
  assert.equal(unsupported.ok, false);
  assert.ok(unsupported.categories.includes("锁闭复原"));
});

test("A, C and D endings are all reachable through natural completion states", () => {
  const mainOnly = Logic.freshState();
  mainOnly.solved.push("p07", "p10", "p12");
  mainOnly.interviews.guxue = 3;
  mainOnly.interviews.liangwen = 3;
  assert.equal(Logic.determineEnding(mainOnly, "full"), "A");

  const state = Logic.freshState();
  state.solved.push("p07", "p10", "p11", "p12");
  state.evidence.push("e_oldfile", "e_casualty", "e_hr");
  assert.equal(Logic.determineEnding(state, "full"), "D");
  assert.equal(state.interviews.xuyoa, undefined);
  assert.equal(Logic.determineEnding(state, "culprit-only"), "C");
});

test("case resolution distinguishes proving, pending disclosure and closed", () => {
  const state=Logic.freshState();
  assert.equal(Logic.caseResolutionState(state),"proving");
  state.solved.push("p12");
  assert.equal(Logic.caseResolutionState(state),"awaiting-disclosure");
  state.ending="A";
  assert.equal(Logic.caseResolutionState(state),"closed");
});

test("final confrontation reports categories and explains the route actually submitted", () => {
  const minimum = Logic.validateConfrontationAnswer(1, ["e_impact", "e_body_review"]);
  const strengthened = Logic.validateConfrontationAnswer(1, ["e_impact", "e_body_review", "e_watch"]);
  assert.equal(minimum.ok, true);
  assert.equal(strengthened.ok, true, "a relevant strengthening source must not invalidate a sound proof");
  assert.match(minimum.explanation, /联合复核/);
  assert.doesNotMatch(minimum.explanation, /相关补强/);
  assert.match(strengthened.explanation, /相关补强.*手表/);
  assert.match(strengthened.explanation, /不重复计算/);
  assert.equal(strengthened.supplements.includes("e_watch"),true);
  assert.equal(Logic.validateConfrontationAnswer(2, ["e_floor", "e_cart"]).ok, true);
  assert.equal(Logic.validateConfrontationAnswer(3, ["e_cardlog", "e_cardauth", "e_route"]).ok, true);
  assert.equal(Logic.validateConfrontationAnswer(4, ["e_permission", "e_cart", "e_route"]).ok, true);
  assert.equal(Logic.validateConfrontationAnswer(5, ["e_lock", "e_hatch", "e_chaintrial"]).ok, true);
  assert.equal(Logic.validateConfrontationAnswer(6, ["e_oldfile", "e_casualty", "e_hr"]).ok, true);
  const legacyQ4 = Logic.validateConfrontationAnswer(4, ["e_cardlog", "e_cart"]);
  assert.equal(legacyQ4.ok, false);
  assert.equal(legacyQ4.category, "实施条件");
  const padded = Logic.validateConfrontationAnswer(2, ["e_floor", "e_stream"]);
  assert.equal(padded.issue, "irrelevant");
  assert.match(padded.reason, /搬运连接/);
});

test("every confrontation route rejects each missing item", () => {
  for (const [key, rule] of Object.entries(Logic.CONFRONTATION_ROUTES)) {
    const step=Number(key.slice(1));
    for (const route of rule.routes) {
      for (const missing of route.all) {
        const submitted=route.all.filter(id=>id!==missing);
        const result=Logic.validateConfrontationAnswer(step,submitted);
        const equivalent=rule.routes.some(candidate=>candidate.all.length===submitted.length && candidate.all.every(id=>submitted.includes(id)));
        assert.equal(result.ok,equivalent,`${key}/${route.id} missing ${missing} should pass only through an explicit equivalent route`);
        if (!equivalent) assert.equal(result.category,rule.category);
      }
    }
  }
});

test("theory checker distinguishes conflicts, missing support and existing support", () => {
  const state = Logic.freshState();
  state.solved.push("p02");
  const result = Logic.evaluateTheory({ culprit: "许遥", place: "1102", method: "远程装置" }, state);
  assert.equal(result.conflicts.length, 1, "remote device is not disproved before an exclusionary sweep");
  assert.equal(result.missing.length, 2);
  assert.equal(result.canSubmitFailure, true);
  state.evidence.push("e_remote_sweep");
  const swept = Logic.evaluateTheory({ culprit: "许遥", place: "1102", method: "远程装置" }, state);
  assert.equal(swept.conflicts.length, 2);
  const unfinished = Logic.evaluateTheory({ culprit: "周岚", place: "其他地点", method: "未知" }, state);
  assert.equal(unfinished.conflicts.length, 0);
  assert.equal(unfinished.missing.length, 3);
  state.solved.push("p05", "p10");
  state.evidence.push("e_hatch", "e_chaintrial");
  const supported = Logic.evaluateTheory({ culprit: "周岚", place: "其他地点", method: "密室后逃离" }, state);
  assert.equal(supported.support.length, 3);
});

test("normalization preserves meta records and repairs malformed collections", () => {
  const state = Logic.normalizeState({ chapter: 99, evidence: ["e_lock", "e_lock", 7], solved: null, meta: { endings: ["B", "B"], bestEvidence: "12" } });
  assert.equal(state.chapter, 9);
  assert.deepEqual(state.evidence, ["e_lock"]);
  assert.deepEqual(state.solved, []);
  assert.deepEqual(state.meta.endings, ["B"]);
  assert.equal(state.meta.bestEvidence, 12);
  assert.deepEqual(state.pinnedEvidence, []);
  assert.deepEqual(state.matrixAnswers, {});
});

test("v2/v3 saves migrate matrix work and v4 in-progress finals reopen new reconstruction", () => {
  const state = Logic.normalizeState({ version: 3, matrixAnswers: Logic.MATRIX_ANSWERS, confrontation: { q1: "e_impact", q2: ["e_floor", "e_floor"] } });
  assert.equal(state.version, 7);
  assert.deepEqual(state.confrontation.q1, ["e_impact"]);
  assert.deepEqual(state.confrontation.q2, ["e_floor"]);
  assert.deepEqual(state.exclusionAnswers, Logic.EXCLUSION_ANSWERS);
  assert.deepEqual(state.zhouConditions, Logic.ZHOU_CONDITIONS);
  assert.equal(state.interludeSeen, false);
  const v4 = Logic.normalizeState({ version:4, solved:["p10","report"], confrontationStep:4, confrontation:{ q1:["e_impact","e_watch"],q2:["e_floor","e_cart"],q3:["e_cardlog","e_accountmap","e_shift"],q4:["e_permission"] } });
  assert.equal(v4.solved.includes("report"),false);
  assert.equal(v4.confrontationStep,2);
  assert.deepEqual(Object.keys(v4.confrontation),["q1","q2"]);
});

test("v4 closed A/C/D proofs stay in a legacy archive without Q5 to Q6 remapping", () => {
  for (const ending of ["A","C","D"]) {
    const oldQ5=["e_oldfile","e_casualty","e_hr"];
    const migrated=Logic.normalizeState({version:4,ending,solved:["p12"],evidence:["e_chaintrial"],confrontationStep:5,confrontation:{q1:["e_impact","e_watch"],q5:oldQ5},meta:{endings:[ending]}});
    assert.equal(migrated.ending,ending);
    assert.equal(Logic.caseResolutionState(migrated),"closed");
    assert.deepEqual(migrated.confrontation,{});
    assert.deepEqual(migrated.legacyCaseRecord.confrontation.q5,oldQ5);
    assert.equal(migrated.legacyCaseRecord.confrontation.q6,undefined);
    assert.equal(migrated.solved.includes("p10r"),false);
    assert.equal(migrated.legacyReconstruction,true);
  }
});

test("v5 pending disclosure and final drafts survive normalization", () => {
  const pending=Logic.normalizeState({version:5,solved:["p11","p12"],ending:null,confrontationStep:6,confrontation:{q1:["legacy-1"],q2:["legacy-2"],q3:["legacy-3"],q4:["legacy-4"],q5:["legacy-5"],q6:["legacy-6"]},confrontationDraft:{q3:["e_cardlog","e_cardauth"]},confrontationExpanded:{q3:["e_cardlog"]},report:{deathPlace:"1402"},notebookReturnChapter:9});
  assert.equal(Logic.caseResolutionState(pending),"awaiting-disclosure");
  assert.equal(pending.confrontationStep,6);
  assert.equal(Object.keys(pending.confrontation).length,6);
  assert.deepEqual(pending.confrontationDraft.q3,["e_cardlog","e_cardauth"]);
  assert.deepEqual(pending.confrontationExpanded.q3,["e_cardlog"]);
  assert.equal(pending.report.deathPlace,"1402");
  assert.equal(pending.notebookReturn.chapter,9);
});

test("v6 joint-review migration only restores conclusions with every prerequisite", () => {
  const incomplete=Logic.normalizeState({version:6,solved:["p05"],evidence:["e_body","e_watch"]});
  assert.equal(incomplete.evidence.includes("e_body_review"),false);
  assert.equal(incomplete.solved.includes("p05r"),false);
  const complete=Logic.normalizeState({version:6,solved:["p05"],evidence:["e_body","e_watch","e_impact"]});
  assert.equal(complete.evidence.includes("e_body_review"),true);
  assert.equal(complete.solved.includes("p05r"),true);
});

test("legacy reconstruction stays playable and normalization is idempotent", () => {
  const migrated=Logic.normalizeState({version:6,solved:["p10","p10r"],evidence:["e_chaintrial"],reconstructionOrder:["leave","chain","card","water","transfer"]});
  assert.equal(migrated.legacyReconstruction,true);
  assert.equal(migrated.solved.includes("p10r"),false);
  assert.deepEqual(migrated.reconstructionOrder,["leave","chain","card","water","transfer"]);
  assert.deepEqual(Logic.normalizeState(migrated),migrated);
});

test("six proof rounds remain six for optional-old-case runs", () => {
  const state=Logic.normalizeState({version:Logic.SAVE_VERSION,solved:["p11"],confrontationStep:99});
  assert.equal(state.confrontationStep,6);
  const mainOnly=Logic.normalizeState({version:Logic.SAVE_VERSION,solved:[],confrontationStep:99});
  assert.equal(mainOnly.confrontationStep,5);
});

if (process.exitCode) process.exit(process.exitCode);
