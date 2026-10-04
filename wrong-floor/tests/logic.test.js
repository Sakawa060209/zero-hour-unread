"use strict";

const assert = require("node:assert/strict");
const Logic = require("../logic.js");

function test(name, fn) {
  try { fn(); process.stdout.write(`✓ ${name}\n`); }
  catch (error) { process.stderr.write(`✗ ${name}\n${error.stack}\n`); process.exitCode = 1; }
}

const MAIN_PROOFS = {
  q1: ["e_impact", "e_body_review"],
  q2: ["e_floor", "e_cart"],
  q3: ["e_cardlog", "e_cardauth", "e_route"],
  q4: ["e_body_review", "e_route", "e_struggle"],
  q5: ["e_lock", "e_hatch", "e_chaintrial"]
};
const OLD_CASE_PROOF = ["e_oldfile", "e_casualty", "e_hr"];

function addCurrentProof(state, step, picks) {
  const key = `q${step}`;
  state.confrontation[key] = [...picks];
  state.confrontationVersions[key] = Logic.PROOF_RULE_VERSION;
  state.confrontationStep = step;
}

function reportReadyState(options = {}) {
  const state = Logic.freshState();
  state.solved.push("p05", "p05r", "p07", "p08", "p09", "p10", "p10r");
  state.evidence.push(
    "e_impact", "e_watch", "e_body", "e_body_review", "e_lock", "e_cardlog", "e_cardauth", "e_route",
    "e_cufflink", "e_cuffphoto", "e_pipe", "e_floor", "e_waterlab", "e_hatch", "e_chaintrial",
    "e_cart", "e_doorcontact", "e_struggle"
  );
  if (options.oldCase) {
    state.solved.push("p11");
    state.evidence.push(...OLD_CASE_PROOF);
  }
  state.evidence = [...new Set(state.evidence)];
  state.report = { ...Logic.REPORT_ANSWERS };
  return state;
}

function disclosureReadyState(options = {}) {
  const state = reportReadyState(options);
  const reportResult = Logic.verifyReportSnapshot(state);
  assert.equal(reportResult.ok, true, "fixture report must be verifiable");
  Object.values(MAIN_PROOFS).forEach((picks, index) => addCurrentProof(state, index + 1, picks));
  if (options.oldCase) addCurrentProof(state, 6, OLD_CASE_PROOF);
  state.solved.push("p12");
  return state;
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
  state.evidence.push("e_chaintrial", "e_body_review", "e_doorcontact", "e_struggle");
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
  const missingDoorContact={...state,evidence:state.evidence.filter(id=>id!=="e_doorcontact")};
  const doorResult=Logic.validateSceneReconstruction(Logic.RECONSTRUCTION_ORDER,Logic.RECONSTRUCTION_SOURCES,support,missingDoorContact);
  assert.equal(doorResult.issue,"evidence");
  assert.ok(doorResult.missingEvidence.includes("e_doorcontact"));
  assert.match(doorResult.reason,/门磁记录.*认证成功不能证明门扇开合/);
});

test("report rejects contradictions and proves the stager separately from the fatal actor", () => {
  const state = reportReadyState();
  assert.equal(Logic.validateReport(Logic.REPORT_ANSWERS, state).ok, true);
  const contradiction = { ...Logic.REPORT_ANSWERS, deathPlace: "1102" };
  assert.deepEqual(Logic.validateReport(contradiction, state).wrong, ["deathPlace"]);
  const wrongStager = Logic.validateReport({ ...Logic.REPORT_ANSWERS, stager:"顾雪" },state);
  assert.deepEqual(wrongStager.wrong,["stager"]);
  assert.ok(wrongStager.categories.includes("现场置换者"));
  assert.ok(!wrongStager.categories.includes("致命冲突行为人"));
  const wrongFatalActor = Logic.validateReport({ ...Logic.REPORT_ANSWERS, fatalActor:"许遥" },state);
  assert.deepEqual(wrongFatalActor.wrong,["fatalActor"]);
  assert.ok(wrongFatalActor.categories.includes("致命冲突行为人"));
  assert.ok(!wrongFatalActor.categories.includes("现场置换者"));
  const missingChain = Logic.normalizeState({ ...state, version: Logic.SAVE_VERSION, evidence: state.evidence.filter(id => id !== "e_chaintrial") });
  const unsupported = Logic.validateReport(Logic.REPORT_ANSWERS, missingChain);
  assert.equal(unsupported.ok, false);
  assert.ok(unsupported.categories.includes("锁闭复原"));
  assert.ok(unsupported.unsupported.includes("stager"));
  const missingStruggle={...state,evidence:state.evidence.filter(id=>id!=="e_struggle")};
  const fatalUnsupported=Logic.validateReport(Logic.REPORT_ANSWERS,missingStruggle);
  assert.ok(fatalUnsupported.unsupported.includes("fatalActor"));
  assert.ok(!fatalUnsupported.unsupported.includes("stager"));
  const missingCart={...state,evidence:state.evidence.filter(id=>id!=="e_cart")};
  const stagerUnsupported=Logic.validateReport(Logic.REPORT_ANSWERS,missingCart);
  assert.ok(stagerUnsupported.unsupported.includes("stager"));
  assert.ok(!stagerUnsupported.unsupported.includes("fatalActor"));
  const prefilled=Logic.prefillReport({},state);
  assert.equal(prefilled.deathPlace,"1402");
  assert.equal(prefilled.stager,"","the identity judgment must remain player-authored");
  assert.equal(prefilled.fatalActor,"","fatal attribution must not be copied from the stager");
});

test("A, C and D endings are all reachable through natural completion states", () => {
  const mainOnly = disclosureReadyState();
  assert.equal(Logic.determineEnding(mainOnly, "full"), "A");

  const state = disclosureReadyState({oldCase:true});
  assert.equal(Logic.determineEnding(state, "full"), "D");
  assert.equal(state.interviews.xuyoa, undefined);
  assert.equal(Logic.determineEnding(state, "culprit-only"), "C");
});

test("report revisions require an explicit fresh verification even after changing an answer back", () => {
  const state=reportReadyState();
  assert.equal(Logic.reportStatus(state),"draft");
  assert.equal(Logic.verifyReportSnapshot(state).ok,true);
  assert.equal(Logic.reportStatus(state),"verified");
  assert.equal(Logic.isCurrentReportVerified(state),true);
  assert.equal(state.verifiedReport.ruleVersion,Logic.REPORT_RULE_VERSION);
  assert.equal(state.verifiedReport.revision,0);
  assert.equal(state.solved.includes("report"),true);

  assert.equal(Logic.markReportEdited(state,"fatalActor","许遥"),true);
  assert.equal(state.reportRevision,1);
  assert.equal(Logic.reportStatus(state),"modified");
  assert.equal(Logic.isCurrentReportVerified(state),false);
  assert.equal(state.solved.includes("report"),false);
  assert.equal(Logic.verifyReportSnapshot(state).ok,false);
  assert.equal(state.verifiedReport.revision,0,"a failed verification must not overwrite the last valid snapshot");

  assert.equal(Logic.markReportEdited(state,"fatalActor","周岚"),true);
  assert.equal(state.reportRevision,2);
  assert.equal(Logic.isCurrentReportVerified(state),false,"returning to the old value still requires a deliberate review");
  assert.equal(Logic.markReportEdited(state,"fatalActor","周岚"),false,"selecting the unchanged value must not create another revision");
  assert.equal(Logic.verifyReportSnapshot(state).ok,true);
  assert.equal(state.verifiedReport.revision,2);
  assert.equal(Logic.isCurrentReportVerified(state),true);
  const restored=Logic.normalizeState(state);
  assert.equal(Logic.isCurrentReportVerified(restored),true,"the verified revision must survive reload normalization");
});

test("public disclosure is guarded by the current report snapshot and immutable case archive", () => {
  const state=disclosureReadyState();
  assert.equal(Logic.canSubmitDisclosure(state),true);
  assert.equal(Logic.caseResolutionState(state),"awaiting-disclosure");
  assert.equal(Logic.markReportEdited(state,"stager","许遥"),true);
  assert.equal(state.solved.includes("p12"),true,"completed proof rounds are preserved while the report is reviewed");
  assert.equal(Logic.caseResolutionState(state),"awaiting-report-review");
  assert.equal(Logic.canSubmitDisclosure(state),false);
  assert.equal(Logic.determineEnding(state,"full"),null);
  assert.equal(Logic.recordEnding(state,"A").ending,null,"a stale report cannot be submitted through the ending API");
  Logic.markReportEdited(state,"stager","周岚");
  assert.equal(Logic.canSubmitDisclosure(state),false,"restoring the answer does not restore the public-submit guard");
  assert.equal(Logic.verifyReportSnapshot(state).ok,true);
  assert.equal(Logic.canSubmitDisclosure(state),true);
  const closed=Logic.recordEnding(state,"A");
  assert.equal(closed.ending,"A");
  assert.equal(Logic.reportStatus(closed),"closed");
  assert.deepEqual(closed.caseArchive.report,Logic.REPORT_ANSWERS);
  closed.report.stager="许遥";
  assert.equal(closed.caseArchive.report.stager,"周岚","the closed report must be a detached snapshot");
});

test("case resolution distinguishes report review, proof review, pending disclosure and closed", () => {
  const state=Logic.freshState();
  assert.equal(Logic.caseResolutionState(state),"proving");
  state.solved.push("p12");
  assert.equal(Logic.caseResolutionState(state),"awaiting-report-review");
  const proofReview=reportReadyState();
  assert.equal(Logic.verifyReportSnapshot(proofReview).ok,true);
  proofReview.solved.push("p12");
  assert.equal(Logic.caseResolutionState(proofReview),"awaiting-proof-review");
  const pending=disclosureReadyState();
  assert.equal(Logic.caseResolutionState(pending),"awaiting-disclosure");
  const closed=Logic.recordEnding(pending,"A");
  assert.equal(Logic.caseResolutionState(closed),"closed");
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
  assert.equal(Logic.validateConfrontationAnswer(4, ["e_body_review", "e_route", "e_struggle"]).ok, true);
  assert.equal(Logic.validateConfrontationAnswer(5, ["e_lock", "e_hatch", "e_chaintrial"]).ok, true);
  assert.equal(Logic.validateConfrontationAnswer(6, ["e_oldfile", "e_casualty", "e_hr"]).ok, true);
  const legacyQ4 = Logic.validateConfrontationAnswer(4, ["e_cardlog", "e_cart"]);
  assert.equal(legacyQ4.ok, false);
  assert.equal(legacyQ4.category, "致命冲突行为人");
  const padded = Logic.validateConfrontationAnswer(2, ["e_floor", "e_stream"]);
  assert.equal(padded.issue, "irrelevant");
  assert.match(padded.reason, /搬运连接/);
});

test("incomplete confrontation feedback identifies what the current picks support and what remains missing", () => {
  const identity=Logic.validateConfrontationAnswer(3,["e_cardlog","e_cardauth"]);
  assert.equal(identity.ok,false);
  assert.equal(identity.issue,"missing");
  assert.equal(identity.supported.length,2);
  assert.ok(identity.supported.some(part=>/取卡时间与账号/.test(part)));
  assert.ok(identity.supported.some(part=>/周岚本人/.test(part)));
  assert.deepEqual(identity.missingParts,["把取卡连接到后续使用的连续路径"]);
  assert.match(identity.reason,/已支持.*尚缺.*连续路径/);

  const fatal=Logic.validateConfrontationAnswer(4,["e_body_review","e_route"]);
  assert.equal(fatal.ok,false);
  assert.equal(fatal.supported.length,2);
  assert.deepEqual(fatal.missingParts,["区分生前冲突与事后搬运的法医接触检验"]);
  assert.match(fatal.reason,/事后搬运/);

  const lockedExit=Logic.validateConfrontationAnswer(5,["e_hatch"]);
  assert.deepEqual(lockedExit.supported,["浴室检修口当晚被实际使用"]);
  assert.equal(lockedExit.missingParts.length,2);
  const irrelevant=Logic.validateConfrontationAnswer(3,["e_cardlog","e_stream"]);
  assert.equal(irrelevant.issue,"irrelevant");
  assert.deepEqual(irrelevant.irrelevant,["e_stream"]);
  assert.match(irrelevant.reason,/已支持.*只能回答别的问题/);
});

test("stored Q1-Q6 proofs require current rule versions, owned evidence and at most three sources", () => {
  const state=disclosureReadyState({oldCase:true});
  for (let step=1;step<=6;step+=1) {
    assert.equal(Logic.validateStoredProof(state,step).ok,true,`q${step}`);
    assert.equal(Logic.storedProofStatus(state,`q${step}`),"current",`q${step}`);
    assert.equal(state.confrontationVersions[`q${step}`],Logic.PROOF_RULE_VERSION);
  }
  const noVersion={...state,confrontationVersions:{...state.confrontationVersions}};
  delete noVersion.confrontationVersions.q3;
  assert.equal(Logic.validateStoredProof(noVersion,3).status,"legacy");
  const missingOwned={...state,evidence:state.evidence.filter(id=>id!=="e_struggle")};
  assert.equal(Logic.validateStoredProof(missingOwned,4).status,"review-required");
  assert.equal(Logic.validateConfrontationAnswer(1,["e_impact","e_body_review","e_body","e_watch"]).issue,"limit");
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
  assert.equal(state.version, Logic.SAVE_VERSION);
  assert.deepEqual(state.confrontation,{});
  assert.deepEqual(state.legacyProofRecords.q1.evidence,["e_impact"]);
  assert.deepEqual(state.legacyProofRecords.q2.evidence,["e_floor"]);
  assert.deepEqual(state.exclusionAnswers, Logic.EXCLUSION_ANSWERS);
  assert.deepEqual(state.zhouConditions, Logic.ZHOU_CONDITIONS);
  assert.equal(state.interludeSeen, false);
  const v4 = Logic.normalizeState({ version:4, solved:["p10","report"], confrontationStep:4, confrontation:{ q1:["e_impact","e_watch"],q2:["e_floor","e_cart"],q3:["e_cardlog","e_accountmap","e_shift"],q4:["e_permission"] } });
  assert.equal(v4.solved.includes("report"),false);
  assert.equal(v4.confrontationStep,0);
  assert.deepEqual(Object.keys(v4.legacyProofRecords),["q1","q2"]);
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

test("v7 closed cases seal the old report and proof order without reopening the outcome", () => {
  const base=reportReadyState();
  const {stager:oldStager,fatalActor:oldFatalActor,...oldReportAnswers}=Logic.REPORT_ANSWERS;
  void oldStager; void oldFatalActor;
  const raw={
    ...base,version:7,ending:"A",solved:[...base.solved,"report","p12"],
    report:{...oldReportAnswers,culprit:"周岚"},confrontation:{},confrontationStep:5,
    meta:{endings:["A"],bestEvidence:base.evidence.length}
  };
  Object.entries(MAIN_PROOFS).forEach(([key,picks])=>raw.confrontation[key]=[...picks]);
  const migrated=Logic.normalizeState(raw);
  assert.equal(migrated.ending,"A");
  assert.equal(Logic.caseResolutionState(migrated),"closed");
  assert.deepEqual(migrated.confrontation,{});
  assert.deepEqual(migrated.legacyCaseRecord.confrontation.q4,MAIN_PROOFS.q4);
  assert.equal(migrated.caseArchive.saveVersion,7);
  assert.equal(migrated.caseArchive.report.stager,"周岚");
  assert.equal(migrated.caseArchive.report.fatalActor,"周岚");
  assert.equal(migrated.caseArchive.ending,"A");
  migrated.report.stager="许遥";
  assert.equal(migrated.caseArchive.report.stager,"周岚","a migrated closed report stays detached and read-only");
  const stable=Logic.normalizeState(migrated);
  assert.equal(stable.ending,"A");
  assert.deepEqual(stable.caseArchive,migrated.caseArchive);
  assert.deepEqual(stable.legacyCaseRecord,migrated.legacyCaseRecord);
});

test("v7 in-progress proofs are revalidated per round and an obsolete Q4 returns for review", () => {
  const base=reportReadyState();
  const {stager:oldStager,fatalActor:oldFatalActor,...oldReportAnswers}=Logic.REPORT_ANSWERS;
  void oldStager; void oldFatalActor;
  const oldQ4=["e_permission","e_cart","e_route"];
  const oldProofs={
    q1:[...MAIN_PROOFS.q1],q2:[...MAIN_PROOFS.q2],q3:[...MAIN_PROOFS.q3],
    q4:[...oldQ4],q5:[...MAIN_PROOFS.q5]
  };
  base.evidence.push("e_permission");
  const migrated=Logic.normalizeState({
    ...base,version:7,solved:[...base.solved,"report","p12"],confrontationStep:5,
    confrontation:oldProofs,confrontationVersions:{},report:{...oldReportAnswers,culprit:"周岚"},
    notebookReturnChapter:9
  });
  assert.equal(migrated.version,Logic.SAVE_VERSION);
  assert.equal(migrated.confrontationVersions.q1,Logic.PROOF_RULE_VERSION);
  assert.equal(migrated.confrontationVersions.q2,Logic.PROOF_RULE_VERSION);
  assert.equal(migrated.confrontationVersions.q3,Logic.PROOF_RULE_VERSION);
  assert.equal(Logic.storedProofStatus(migrated,"q4"),"legacy");
  assert.deepEqual(migrated.legacyProofRecords.q4.evidence,oldQ4);
  assert.deepEqual(migrated.confrontationDraft.q4,oldQ4);
  assert.equal(migrated.confrontationStep,3,"resume at the first proof that no longer satisfies current rules");
  assert.equal(migrated.solved.includes("p12"),false);
  assert.equal(Logic.canSubmitDisclosure(migrated),false);
  assert.equal(migrated.report.stager,"周岚");
  assert.equal(Boolean(migrated.report.fatalActor),false,"an unfinished old save must not infer the fatal actor from the stager");
  assert.equal(Logic.reportStatus(migrated),"draft");
  assert.equal(migrated.notebookReturn.chapter,9);
  assert.deepEqual(Logic.normalizeState(migrated),migrated,"in-progress migration must be idempotent");
});

test("v7 valid proof prefixes at Q1 and Q3 keep their place while awaiting a current report review", () => {
  const base=reportReadyState();
  const {stager:oldStager,fatalActor:oldFatalActor,...oldReportAnswers}=Logic.REPORT_ANSWERS;
  void oldStager; void oldFatalActor;
  const cases=[
    { count:1, expectedStep:1 },
    { count:3, expectedStep:3 }
  ];
  for (const {count,expectedStep} of cases) {
    const confrontation={};
    Object.entries(MAIN_PROOFS).slice(0,count).forEach(([key,picks])=>confrontation[key]=[...picks]);
    const migrated=Logic.normalizeState({...base,version:7,confrontation,confrontationStep:count,report:{...oldReportAnswers,culprit:"周岚"},solved:[...base.solved,"report"]});
    assert.equal(migrated.confrontationStep,expectedStep);
    assert.equal(Object.keys(migrated.confrontationVersions).length,count);
    assert.equal(Logic.reportStatus(migrated),"draft");
  }

  const pendingRaw={...base,version:7,solved:[...base.solved,"report","p12"],confrontation:{},confrontationStep:5,report:{...oldReportAnswers,culprit:"周岚"}};
  Object.entries(MAIN_PROOFS).forEach(([key,picks])=>pendingRaw.confrontation[key]=[...picks]);
  const pending=Logic.normalizeState(pendingRaw);
  assert.equal(pending.solved.includes("p12"),true,"current-valid proof rounds remain complete");
  assert.equal(Logic.caseResolutionState(pending),"awaiting-report-review");
  assert.equal(Logic.canSubmitDisclosure(pending),false);
  assert.equal(Boolean(pending.report.fatalActor),false,"public submission waits for an explicit fatal-actor judgment");
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

test("adding P11 after five completed rounds requires Q6 before a C or D ending", () => {
  const state=disclosureReadyState();
  assert.equal(Logic.proofTotal(state),5);
  assert.equal(Logic.canSubmitDisclosure(state),true);
  state.solved.push("p11");
  state.evidence.push(...OLD_CASE_PROOF);
  assert.equal(Logic.proofTotal(state),6);
  assert.equal(Logic.allCurrentProofsComplete(state),false);
  assert.equal(Logic.canSubmitDisclosure(state),false);
  assert.equal(Logic.caseResolutionState(state),"awaiting-proof-review");
  assert.equal(Logic.determineEnding(state,"full"),null);

  const reopened=Logic.normalizeState(state);
  assert.equal(reopened.solved.includes("p12"),false);
  assert.equal(reopened.confrontationStep,5,"the existing five rounds remain intact and Q6 is next");
  addCurrentProof(reopened,6,OLD_CASE_PROOF);
  reopened.solved.push("p12");
  assert.equal(Logic.allCurrentProofsComplete(reopened),true);
  assert.equal(Logic.canSubmitDisclosure(reopened),true);
  assert.equal(Logic.determineEnding(reopened,"culprit-only"),"C");
  assert.equal(Logic.determineEnding(reopened,"full"),"D");
});

if (process.exitCode) process.exit(process.exitCode);
