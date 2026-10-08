"use strict";

const assert = require("node:assert/strict");
const Logic = require("../logic.js");

function test(name, fn) {
  try { fn(); process.stdout.write(`✓ ${name}\n`); }
  catch (error) { process.stderr.write(`✗ ${name}\n${error.stack}\n`); process.exitCode = 1; }
}

const MAIN_PROOFS = {
  q1: ["e_impact", "e_body_review"],
  q2: ["e_body_review", "e_route", "e_struggle"]
};
const OLD_CASE_PROOF = ["e_oldfile", "e_casualty", "e_hr"];
const V8_PROOFS = {
  q1: ["e_impact", "e_body_review"],
  q2: ["e_floor", "e_cart"],
  q3: ["e_cardlog", "e_cardauth", "e_route"],
  q4: ["e_body_review", "e_route", "e_struggle"],
  q5: ["e_lock", "e_hatch", "e_chaintrial"]
};

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
  state.reportAdopted = [...Logic.REPORT_AUTO_KEYS];
  return state;
}

function disclosureReadyState(options = {}) {
  const state = reportReadyState(options);
  const reportResult = Logic.verifyReportSnapshot(state);
  assert.equal(reportResult.ok, true, "fixture report must be verifiable");
  addCurrentProof(state, 1, MAIN_PROOFS.q1);
  addCurrentProof(state, 2, MAIN_PROOFS.q2);
  if (options.oldCase) addCurrentProof(state, 3, OLD_CASE_PROOF);
  state.solved.push("p12");
  return state;
}

function completeReconstructionState() {
  const state = Logic.freshState();
  state.evidence = [...new Set(Object.values(Logic.RECONSTRUCTION_EVIDENCE).flat())];
  const links = Object.fromEntries(Object.entries(Logic.RECONSTRUCTION_EVIDENCE).map(([step, ids]) => [step, [...ids]]));
  return { state, links };
}

test("v3.8 constants and fresh state use the ten-chapter schema", () => {
  assert.equal(Logic.SAVE_VERSION, 11);
  assert.equal(Logic.REPORT_RULE_VERSION, 11);
  assert.equal(Logic.PROOF_RULE_VERSION, 10);
  const state = Logic.freshState();
  assert.equal(Logic.chapterUnlocked(state, 1), true);
  assert.equal(Logic.chapterUnlocked(state, 2), false);
  assert.equal(Logic.highestUnlockedChapter(state), 1);
  assert.deepEqual(state.reportAdopted, []);
  assert.deepEqual(state.reconstructionEvidence, {});
  assert.equal(state.primaryCandidate, "");
  assert.equal(state.oldCaseDiscovered, false);
  assert.deepEqual(state.responsibilityOrder, ["file-c", "file-a", "file-d", "file-b"]);
});

test("P01 core gate requires the lock, injury and carpet observations, and bathroom", () => {
  assert.equal(Logic.sceneCoreReady(["door", "body-injury", "living-carpet", "bath"]), true);
  assert.equal(Logic.sceneCoreReady(["door", "body-injury", "bath"]), false);
  assert.equal(Logic.sceneCoreReady(["door", "living-carpet", "bath"]), false);
  assert.equal(Logic.sceneCoreReady(["access", "body-injury", "living-carpet", "bath"]), false);
  assert.equal(Logic.sceneCoreReady(["door", "body", "bath"]), true, "legacy combined body observation remains compatible");
});

test("chapter eight, reconstruction chapter and final chapter have distinct gates", () => {
  const state = Logic.freshState();
  state.solved.push("p01", "p02", "p03", "p04", "p05", "p05r", "p06", "p07", "p08", "p09");
  state.interviews.guxue = 3;
  assert.equal(Logic.chapterUnlocked(state, 8), false, "one key interview is insufficient");
  state.interviews.liangwen = 3;
  assert.equal(Logic.chapterUnlocked(state, 8), true);
  assert.equal(Logic.chapterUnlocked(state, 9), false, "the suspect intersection remains required");

  state.solved.push("p10");
  state.evidence.push("e_body_review", "e_cardauth", "e_route");
  assert.equal(Logic.chapterUnlocked(state, 9), false, "fatal-conflict attribution cannot be skipped");
  assert.match(Logic.chapterLockReason(state, 9), /冲突/);
  state.evidence.push("e_struggle");
  assert.equal(Logic.chapterUnlocked(state, 9), true, "the reconstruction chapter opens before P10-R is solved");
  assert.equal(Logic.chapterUnlocked(state, 10), false);

  state.solved.push("p10r");
  state.evidence.push("e_waterlab", "e_hatch", "e_chaintrial", "e_doorcontact");
  assert.equal(Logic.chapterUnlocked(state, 10), true, "the old case is not a final-chapter gate");
  assert.equal(Logic.highestUnlockedChapter(state), 10);
});

test("P03 accepts measurement tolerance but still requires an eleven-to-fifteen centimetre gap", () => {
  assert.equal(Logic.validateDimensionReadings(83, 96).ok, true);
  assert.equal(Logic.validateDimensionReadings(81, 94).ok, true);
  assert.equal(Logic.validateDimensionReadings(85, 98).ok, true);
  assert.equal(Logic.validateDimensionReadings(80, 96).ok, false);
  assert.equal(Logic.validateDimensionReadings(83, 99).ok, false);
  assert.equal(Logic.validateDimensionReadings(85, 94).ok, false);
  assert.equal(Logic.validateDimensionEndpoints({ photoA:14, photoB:97, planA:9, planB:105 }).ok, true);
  const shifted=Logic.validateDimensionEndpoints({ photoA:24, photoB:107, planA:19, planB:115 });
  assert.equal(shifted.ok, false, "equal distances at the wrong locations must fail");
  assert.equal(shifted.wrongPoints.length, 4);
});

test("P04 requires all overlay modes and direct structure markings", () => {
  const changes=["number","door","wall-kept","pipe"];
  assert.equal(Logic.validateBlueprintComparison("2012","2019",["old","current","blend"],["door","wall","shaft"],changes).ok,true);
  assert.equal(Logic.validateBlueprintComparison("2012","2019",["old","current"],["door","wall","shaft"],changes).ok,false);
  assert.equal(Logic.validateBlueprintComparison("2012","2019",["old","current","blend"],["door"],changes).ok,false);
});

test("P05 accepts six certain correct classes and rewards explicit uncertainty separately", () => {
  const found = ["socket", "drag", "frame", "nail", "pipe", "impact", "lamp", "painting"];
  const sixCorrect = Object.fromEntries(["socket", "drag", "frame", "nail", "pipe", "lamp"].map(id => [id, Logic.DIFFERENCE_CLASS_ANSWERS[id]]));
  assert.equal(Logic.validateDifferenceClasses(found, sixCorrect).ok, true);
  assert.deepEqual(Logic.validateDifferenceClasses(found, sixCorrect).unknownCorrect, ["lamp"]);
  const fiveCorrect = { ...sixCorrect }; delete fiveCorrect.pipe;
  assert.equal(Logic.validateDifferenceClasses(found, fiveCorrect).ok, false);
  const noUncertainty = Object.fromEntries(["socket", "drag", "frame", "nail", "pipe", "impact"].map(id => [id, Logic.DIFFERENCE_CLASS_ANSWERS[id]]));
  const missingUncertain = Logic.validateDifferenceClasses(found, noUncertainty);
  assert.equal(missingUncertain.ok, true);
  assert.equal(missingUncertain.missingUncertain, true);
  assert.equal(missingUncertain.uncertaintyBonus, false);
  assert.equal(Logic.validateDifferenceClasses(found, sixCorrect).uncertaintyBonus, true);
  const wrong = { ...sixCorrect, painting: "history" };
  const result = Logic.validateDifferenceClasses(found, wrong);
  assert.equal(result.ok, false);
  assert.deepEqual(result.wrong, ["painting"]);
  assert.equal(Logic.DIFFERENCE_CLASS_ANSWERS.lamp, "unknown");
  assert.equal(Logic.DIFFERENCE_CLASS_ANSWERS.painting, "unknown");
});

test("P06 only counts explicitly recorded projections", () => {
  assert.equal(Logic.validateSightComparison([],"14").ok,false);
  assert.equal(Logic.validateSightComparison(["11","13","14"],"14").ok,true);
  assert.equal(Logic.validateSightComparison(["11","13","15"],"14").ok,false);
});

test("P07 evidence cleanup checks every unsupported interpretation fragment", () => {
  const correct = Object.fromEntries(Object.entries(Logic.FACT_MARK_ANSWERS).map(([id, marks]) => [id, [...marks]]));
  assert.equal(Logic.validateFactCleanup(correct).ok, true);
  const missing = { ...correct, card: ["person"] };
  assert.deepEqual(Logic.validateFactCleanup(missing).wrong, ["card"]);
  const padded = { ...correct, door: [...correct.door, "time"] };
  assert.deepEqual(Logic.validateFactCleanup(padded).wrong, ["door"]);
});

test("main, supplemental and old-case evidence progress are counted separately", () => {
  const state = Logic.freshState();
  state.evidence.push("e_lock", "e_remote_sweep", "e_oldfile");
  const progress = Logic.evidenceProgress(state);
  assert.equal(progress.found, 1);
  assert.equal(progress.supplementalFound, 1);
  assert.equal(progress.oldCaseFound, 1);
  assert.equal(progress.total, Logic.MAIN_EVIDENCE.length);
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
  assert.equal(Logic.validateExclusionMatrix(Logic.EXCLUSION_ANSWERS, Logic.ZHOU_CONDITIONS, state).candidateError, "missing");
  state.primaryCandidate = "zhoulan";
  assert.equal(Logic.validateExclusionMatrix(Logic.EXCLUSION_ANSWERS, Logic.ZHOU_CONDITIONS, state).ok, true);

  for (const [removed, field] of [["e_permission", "permission"], ["e_accountmap", "know"], ["e_trainingaccess", "know"], ["e_shift", "blank"], ["e_cardauth", "card"]]) {
    const reduced = Logic.normalizeState({ ...state, version: Logic.SAVE_VERSION, evidence: state.evidence.filter(id => id !== removed) });
    assert.equal(Logic.candidateStatus(reduced, "zhoulan", field), "unknown", `${removed} must downgrade ${field}`);
    assert.equal(Logic.validateExclusionMatrix(Logic.EXCLUSION_ANSWERS, Logic.ZHOU_CONDITIONS, reduced).ok, false);
  }
});

test("candidate worksheet requires player judgments and cell-specific sources", () => {
  const state=Logic.freshState();
  state.solved.push("p02");
  state.evidence.push("e_checkin","e_stream","e_location","e_permission","e_accountmap","e_trainingaccess","e_shift","e_cardlog","e_cardauth","e_route");
  const answer=Logic.buildCandidateWorksheetAnswer(state);
  assert.equal(Logic.validateCandidateWorksheet(answer.judgments,answer.sources,state).ok,true);
  const permissionCannotProveCard={...answer.sources,guxue_card:"permission"};
  assert.deepEqual(Logic.validateCandidateWorksheet(answer.judgments,permissionCannotProveCard,state).unsupportedSources,["guxue_card"]);
  const forcedCertainty={...answer.judgments,guxue_card:"no"};
  assert.deepEqual(Logic.validateCandidateWorksheet(forcedCertainty,answer.sources,state).wrongCells,["guxue_card"]);
});

test("exclusion table checks player-authored reasons and all four selected conditions", () => {
  assert.equal(Logic.validateExclusionMatrix({}, []).ok, false);
  const wrongReason = { ...Logic.EXCLUSION_ANSWERS, guxue: "time" };
  assert.deepEqual(Logic.validateExclusionMatrix(wrongReason, Logic.ZHOU_CONDITIONS).wrongPeople, ["guxue"]);
  assert.deepEqual(Logic.validateExclusionMatrix(Logic.EXCLUSION_ANSWERS, ["know", "permission"]).missingConditions, ["blank", "card"]);
  const wrongCandidate = Logic.validateExclusionMatrix(Logic.EXCLUSION_ANSWERS, Logic.ZHOU_CONDITIONS, undefined, "xuyoa");
  assert.equal(wrongCandidate.candidateError, "incorrect");
  assert.equal(wrongCandidate.ok, false);
});

test("old-case puzzle checks both document-to-actor and actor-to-action links", () => {
  assert.equal(Logic.validateResponsibilityPuzzle(Logic.CHAIN_FILE_ANSWERS, Logic.CHAIN_ANSWERS).ok, true);
  assert.equal(Logic.validateResponsibilityPuzzle(Logic.CHAIN_FILE_ANSWERS, Logic.CHAIN_ANSWERS, Logic.CHAIN_FILE_ORDER).ok, true);
  const wrongOrder = ["file-b", "file-a", "file-c", "file-d"];
  assert.deepEqual(Logic.validateResponsibilityPuzzle(Logic.CHAIN_FILE_ANSWERS, Logic.CHAIN_ANSWERS, wrongOrder).orderWrong, ["file-a", "file-b"]);
  const wrongFile = { ...Logic.CHAIN_FILE_ANSWERS, design: "file-d" };
  assert.deepEqual(Logic.validateResponsibilityPuzzle(wrongFile, Logic.CHAIN_ANSWERS).fileWrong, ["design"]);
  assert.equal(Logic.validateResponsibilityPuzzle(Logic.CHAIN_FILE_ANSWERS, { ...Logic.CHAIN_ANSWERS, design: "approve" }).actionWrong, 1);
});

test("P10-R checks chronology, core evidence and relevant supplements", () => {
  const { state, links } = completeReconstructionState();
  assert.equal(Logic.validateSceneReconstruction(Logic.RECONSTRUCTION_ORDER, links, state).ok, true);
  const leftBeforeChain = ["water", "card", "transfer", "leave", "chain"];
  assert.match(Logic.validateSceneReconstruction(leftBeforeChain, links, state).reason, /无法再从室内挂上门链/);
  const transferBeforeCard = ["water", "transfer", "card", "chain", "leave"];
  assert.match(Logic.validateSceneReconstruction(transferBeforeCard, links, state).reason, /取卡之前/);

  const missingLink = { ...links, transfer: links.transfer.filter(id => id !== "e_access") };
  const supportResult = Logic.validateSceneReconstruction(Logic.RECONSTRUCTION_ORDER, missingLink, state);
  assert.equal(supportResult.issue, "support");
  assert.ok(supportResult.missing.includes("e_access"));
  const reinforced=Object.fromEntries(Object.keys(links).map(step=>[step,[...links[step],...(Logic.RECONSTRUCTION_SUPPLEMENTS[step]||[])]]));
  state.evidence.push(...Object.values(Logic.RECONSTRUCTION_SUPPLEMENTS).flat());
  assert.equal(Logic.validateSceneReconstruction(Logic.RECONSTRUCTION_ORDER,reinforced,state).completeness,"reinforced");
  const unrelated = { ...links, water: [...links.water, "e_stream"] };
  assert.equal(Logic.validateSceneReconstruction(Logic.RECONSTRUCTION_ORDER, unrelated, state).issue, "unrelated");
  state.evidence.push("e_watch", "e_cufflink", "e_pipe", "e_struggle");
  const temptingButWrong = { ...links, transfer: [...links.transfer, "e_watch"] };
  const distractorResult = Logic.validateSceneReconstruction(Logic.RECONSTRUCTION_ORDER, temptingButWrong, state);
  assert.equal(distractorResult.issue, "unrelated");
  assert.deepEqual(distractorResult.unrelated, ["e_watch"]);
  const missingRouteState = { ...state, evidence: state.evidence.filter(id => id !== "e_route") };
  const missingRoute = Logic.validateSceneReconstruction(Logic.RECONSTRUCTION_ORDER, links, missingRouteState);
  assert.equal(missingRoute.issue, "evidence");
  assert.match(missingRoute.reason, /直接记录|痕迹来源|路径/);
});

test("report requires players to adopt every supported automatic conclusion", () => {
  const state = reportReadyState();
  state.reportAdopted = [];
  const unadopted = Logic.validateReport(Logic.REPORT_ANSWERS, state);
  assert.equal(unadopted.ok, false);
  assert.deepEqual(unadopted.unadopted, Logic.REPORT_AUTO_KEYS);
  assert.ok(unadopted.categories.includes("既成事实确认"));
  for (const key of Logic.REPORT_AUTO_KEYS) assert.equal(Logic.markReportAdopted(state, key), true);
  assert.equal(Logic.validateReport(Logic.REPORT_ANSWERS, state).ok, true);
  assert.equal(state.reportRevision, Logic.REPORT_AUTO_KEYS.length);
});

test("report rejects contradictions and proves the stager separately from the fatal actor", () => {
  const state = reportReadyState();
  assert.equal(Logic.validateReport(Logic.REPORT_ANSWERS, state).ok, true);
  const contradiction = { ...Logic.REPORT_ANSWERS, deathPlace: "1102" };
  assert.deepEqual(Logic.validateReport(contradiction, state).wrong, ["deathPlace"]);
  const wrongStager = Logic.validateReport({ ...Logic.REPORT_ANSWERS, stager: "顾雪" }, state);
  assert.deepEqual(wrongStager.wrong, ["stager"]);
  assert.ok(wrongStager.categories.includes("现场置换者"));
  assert.ok(!wrongStager.categories.includes("致命冲突行为人"));
  const wrongFatalActor = Logic.validateReport({ ...Logic.REPORT_ANSWERS, fatalActor: "许遥" }, state);
  assert.deepEqual(wrongFatalActor.wrong, ["fatalActor"]);
  assert.ok(wrongFatalActor.categories.includes("致命冲突行为人"));

  const missingChain = { ...state, evidence: state.evidence.filter(id => id !== "e_chaintrial") };
  assert.ok(Logic.validateReport(Logic.REPORT_ANSWERS, missingChain).unsupported.includes("stager"));
  const missingStruggle = { ...state, evidence: state.evidence.filter(id => id !== "e_struggle") };
  assert.ok(Logic.validateReport(Logic.REPORT_ANSWERS, missingStruggle).unsupported.includes("fatalActor"));
  const missingCart = { ...state, evidence: state.evidence.filter(id => id !== "e_cart") };
  assert.ok(Logic.validateReport(Logic.REPORT_ANSWERS, missingCart).unsupported.includes("stager"));
  const prefilled = Logic.prefillReport({}, state);
  assert.equal(prefilled.deathPlace, "1402");
  assert.equal(prefilled.stager, "");
  assert.equal(prefilled.fatalActor, "");
});

test("report edits and adoption changes invalidate a verified snapshot until explicit review", () => {
  const state = reportReadyState();
  assert.equal(Logic.verifyReportSnapshot(state).ok, true);
  assert.equal(Logic.reportStatus(state), "verified");
  assert.equal(state.verifiedReport.ruleVersion, Logic.REPORT_RULE_VERSION);
  assert.deepEqual(state.verifiedReport.adopted, Logic.REPORT_AUTO_KEYS);
  assert.equal(Logic.markReportEdited(state, "fatalActor", "许遥"), true);
  assert.equal(Logic.isCurrentReportVerified(state), false);
  assert.equal(Logic.verifyReportSnapshot(state).ok, false);
  assert.equal(Logic.markReportEdited(state, "fatalActor", "周岚"), true);
  assert.equal(Logic.isCurrentReportVerified(state), false);
  assert.equal(Logic.verifyReportSnapshot(state).ok, true);
  assert.equal(Logic.markReportAdopted(state, "deathPlace", false), true);
  assert.equal(Logic.isCurrentReportVerified(state), false);
  assert.equal(Logic.verifyReportSnapshot(state).ok, false);
  assert.equal(Logic.markReportAdopted(state, "deathPlace", true), true);
  assert.equal(Logic.verifyReportSnapshot(state).ok, true);
  assert.equal(Logic.isCurrentReportVerified(Logic.normalizeState(state)), true);
});

test("final confrontation is compressed to two main questions and one old-case question", () => {
  const place = Logic.validateConfrontationAnswer(1, MAIN_PROOFS.q1);
  const strengthened = Logic.validateConfrontationAnswer(1, [...MAIN_PROOFS.q1, "e_watch"]);
  assert.equal(place.ok, true);
  assert.equal(strengthened.ok, true);
  assert.match(strengthened.explanation, /相关补强.*手表/);
  assert.match(strengthened.explanation, /不重复计算/);
  const fatal = Logic.validateConfrontationAnswer(2, MAIN_PROOFS.q2);
  assert.equal(fatal.ok, true);
  assert.equal(fatal.category, "致命冲突行为人");
  assert.equal(Logic.validateConfrontationAnswer(3, OLD_CASE_PROOF).ok, true);
  assert.equal(Logic.validateConfrontationAnswer(4, []).ok, false);
});

test("incomplete proof feedback describes the player's supported and missing links", () => {
  const fatal = Logic.validateConfrontationAnswer(2, ["e_body_review", "e_route"]);
  assert.equal(fatal.ok, false);
  assert.equal(fatal.issue, "missing");
  assert.equal(fatal.supported.length, 2);
  assert.deepEqual(fatal.missingParts, ["区分生前冲突与事后搬运的法医接触检验"]);
  assert.match(fatal.reason, /事后搬运/);
  const irrelevant = Logic.validateConfrontationAnswer(2, ["e_body_review", "e_stream"]);
  assert.equal(irrelevant.issue, "irrelevant");
  assert.deepEqual(irrelevant.irrelevant, ["e_stream"]);
  assert.match(irrelevant.reason, /已支持.*只能回答别的问题/);
  const oldCase = Logic.validateConfrontationAnswer(3, ["e_oldfile", "e_casualty"]);
  assert.deepEqual(oldCase.missingParts, ["连接周屿与周岚的人事记录"]);
});

test("stored Q1-Q3 proofs require current versions, owned evidence and at most three sources", () => {
  const state = disclosureReadyState({ oldCase: true });
  for (let step = 1; step <= 3; step += 1) {
    assert.equal(Logic.validateStoredProof(state, step).ok, true, `q${step}`);
    assert.equal(Logic.storedProofStatus(state, `q${step}`), "current", `q${step}`);
  }
  const noVersion = { ...state, confrontationVersions: { ...state.confrontationVersions } };
  delete noVersion.confrontationVersions.q2;
  assert.equal(Logic.validateStoredProof(noVersion, 2).status, "legacy");
  const missingOwned = { ...state, evidence: state.evidence.filter(id => id !== "e_struggle") };
  assert.equal(Logic.validateStoredProof(missingOwned, 2).status, "review-required");
  assert.equal(Logic.validateConfrontationAnswer(1, ["e_impact", "e_body_review", "e_body", "e_watch"]).issue, "limit");
});

test("every current confrontation route rejects each missing required source", () => {
  for (const [key, rule] of Object.entries(Logic.CONFRONTATION_ROUTES)) {
    const step = Number(key.slice(1));
    for (const route of rule.routes) {
      for (const missing of route.all) {
        const submitted = route.all.filter(id => id !== missing);
        const result = Logic.validateConfrontationAnswer(step, submitted);
        assert.equal(result.ok, false, `${key}/${route.id} missing ${missing}`);
        assert.equal(result.category, rule.category);
      }
    }
  }
});

test("A, C and D endings remain reachable through the compressed proof flow", () => {
  const mainOnly = disclosureReadyState();
  assert.equal(Logic.proofTotal(mainOnly), 2);
  assert.equal(Logic.determineEnding(mainOnly, "full"), "A");
  const withOldCase = disclosureReadyState({ oldCase: true });
  assert.equal(Logic.proofTotal(withOldCase), 3);
  assert.equal(Logic.determineEnding(withOldCase, "culprit-only"), "C");
  assert.equal(Logic.determineEnding(withOldCase, "full"), "D");
});

test("adding P11 after two completed rounds requires the third question before C or D", () => {
  const state = disclosureReadyState();
  assert.equal(Logic.canSubmitDisclosure(state), true);
  state.solved.push("p11");
  state.evidence.push(...OLD_CASE_PROOF);
  assert.equal(Logic.proofTotal(state), 3);
  assert.equal(Logic.allCurrentProofsComplete(state), false);
  assert.equal(Logic.canSubmitDisclosure(state), false);
  assert.equal(Logic.caseResolutionState(state), "awaiting-proof-review");
  const reopened = Logic.normalizeState(state);
  assert.equal(reopened.solved.includes("p12"), false);
  assert.equal(reopened.confrontationStep, 2);
  addCurrentProof(reopened, 3, OLD_CASE_PROOF);
  reopened.solved.push("p12");
  assert.equal(Logic.canSubmitDisclosure(reopened), true);
  assert.equal(Logic.determineEnding(reopened, "full"), "D");
});

test("public disclosure is guarded by current report and proof snapshots", () => {
  const state = disclosureReadyState();
  assert.equal(Logic.caseResolutionState(state), "awaiting-disclosure");
  assert.equal(Logic.markReportEdited(state, "stager", "许遥"), true);
  assert.equal(state.solved.includes("p12"), true);
  assert.equal(Logic.caseResolutionState(state), "awaiting-report-review");
  assert.equal(Logic.determineEnding(state, "full"), null);
  Logic.markReportEdited(state, "stager", "周岚");
  assert.equal(Logic.verifyReportSnapshot(state).ok, true);
  assert.equal(Logic.canSubmitDisclosure(state), true);
  const closed = Logic.recordEnding(state, "A");
  assert.equal(closed.ending, "A");
  assert.equal(closed.caseArchive.proofRuleVersion, Logic.PROOF_RULE_VERSION);
  assert.deepEqual(closed.caseArchive.reportAdopted, Logic.REPORT_AUTO_KEYS);
  closed.report.stager = "许遥";
  assert.equal(closed.caseArchive.report.stager, "周岚");
  assert.equal(Logic.markReportAdopted(closed, "deathPlace", false), false);
});

test("case resolution distinguishes report review, proof review, disclosure and closed", () => {
  assert.equal(Logic.caseResolutionState(Logic.freshState()), "proving");
  const proofReview = reportReadyState();
  assert.equal(Logic.verifyReportSnapshot(proofReview).ok, true);
  proofReview.solved.push("p12");
  assert.equal(Logic.caseResolutionState(proofReview), "awaiting-proof-review");
  const pending = disclosureReadyState();
  assert.equal(Logic.caseResolutionState(pending), "awaiting-disclosure");
  assert.equal(Logic.caseResolutionState(Logic.recordEnding(pending, "A")), "closed");
});

test("theory checker distinguishes conflicts, missing support and existing support", () => {
  const state = Logic.freshState();
  state.solved.push("p02");
  const result = Logic.evaluateTheory({ culprit: "许遥", place: "1102", method: "远程装置" }, state);
  assert.equal(result.conflicts.length, 1);
  assert.equal(result.missing.length, 2);
  state.evidence.push("e_remote_sweep");
  assert.equal(Logic.evaluateTheory({ culprit: "许遥", place: "1102", method: "远程装置" }, state).conflicts.length, 2);
  state.solved.push("p05", "p10");
  state.evidence.push("e_hatch", "e_chaintrial");
  assert.equal(Logic.evaluateTheory({ culprit: "周岚", place: "其他地点", method: "密室后逃离" }, state).support.length, 3);
});

test("reasoning revisions use Chinese judgments and Ending B is always an erroneous closure", () => {
  assert.equal(Logic.reasoningRating({ mistakes: 0 }), "严谨");
  assert.equal(Logic.reasoningRating({ mistakes: 2 }), "严谨");
  assert.equal(Logic.reasoningRating({ mistakes: 3 }), "稳健");
  assert.equal(Logic.reasoningRating({ mistakes: 7 }), "需复核");
  assert.equal(Logic.reasoningRating({ mistakes: 0, ending: "B" }), "错误结案");
});

test("normalization repairs malformed collections and clamps to chapter ten", () => {
  const state = Logic.normalizeState({ version: 10, chapter: 99, evidence: ["e_lock", "e_lock", 7], solved: null, reportAdopted: ["deathPlace", "deathPlace", 3], primaryCandidate:"nobody", responsibilityOrder:["file-a","file-a"], meta: { endings: ["B", "B"], bestEvidence: "12" } });
  assert.equal(state.chapter, 10);
  assert.deepEqual(state.evidence, ["e_lock"]);
  assert.deepEqual(state.solved, []);
  assert.deepEqual(state.reportAdopted, ["deathPlace"]);
  assert.deepEqual(state.meta.endings, ["B"]);
  assert.equal(state.meta.bestEvidence, 12);
  assert.equal(state.primaryCandidate, "");
  assert.deepEqual(state.responsibilityOrder, ["file-c", "file-a", "file-d", "file-b"]);
});

test("sealed-record discovery stays hidden in fresh saves and migrates from real legacy progress", () => {
  assert.equal(Logic.normalizeState({ version:10 }).oldCaseDiscovered, false);
  assert.equal(Logic.normalizeState({ version:9, evidence:["e_oldfile"] }).oldCaseDiscovered, true);
  assert.equal(Logic.normalizeState({ version:9, solved:["p11"] }).oldCaseDiscovered, true);
  assert.equal(Logic.normalizeState({ version:9, ending:"D" }).oldCaseDiscovered, true);
  const explicit = Logic.normalizeState({ version:10, oldCaseDiscovered:true });
  assert.equal(explicit.oldCaseDiscovered, true);
  assert.equal(Logic.evidenceProgress(explicit).oldCaseDiscovered, true);
});

test("v3.6 progress migrates candidate, uncertainty classes, responsibility order and compatible snapshots", () => {
  const raw = disclosureReadyState({ oldCase:true });
  raw.version = 9;
  raw.primaryCandidate = "";
  raw.differenceClasses = { lamp:"history", painting:"history" };
  raw.responsibilityOrder = ["file-c","file-a","file-d","file-b"];
  raw.verifiedReport.ruleVersion = 9;
  Object.keys(raw.confrontationVersions).forEach(key => raw.confrontationVersions[key] = 9);
  const migrated = Logic.normalizeState(raw);
  assert.equal(migrated.version, 11);
  assert.equal(migrated.primaryCandidate, "zhoulan");
  assert.equal(migrated.differenceClasses.lamp, "unknown");
  assert.equal(migrated.differenceClasses.painting, "unknown");
  assert.deepEqual(migrated.responsibilityOrder, Logic.CHAIN_FILE_ORDER);
  assert.equal(migrated.verifiedReport.ruleVersion, 11);
  assert.ok(Object.values(migrated.confrontationVersions).every(version => version === 10));
  assert.equal(Logic.isCurrentReportVerified(migrated), true);
  assert.equal(Logic.allCurrentProofsComplete(migrated), true);
  assert.deepEqual(Logic.normalizeState(migrated), migrated);
});

test("v8 in-progress final saves move to chapter ten and archive every old proof", () => {
  const base = reportReadyState({ oldCase: true });
  const raw = {
    ...base,
    version: 8,
    chapter: 9,
    screen: "chapter-9",
    notebookReturn: { chapter: 9, anchor: "#current-confrontation", focus: "", scrollY: 420 },
    reportAdopted: [],
    verifiedReport: { answers: { ...Logic.REPORT_ANSWERS }, revision: 0, ruleVersion: 8 },
    solved: [...base.solved, "report", "p12"],
    confrontation: { ...V8_PROOFS, q6: [...OLD_CASE_PROOF] },
    confrontationVersions: Object.fromEntries([1, 2, 3, 4, 5, 6].map(step => [`q${step}`, 8])),
    confrontationStep: 6,
    reconstructionEvidence: {}
  };
  const migrated = Logic.normalizeState(raw);
  assert.equal(migrated.version, 11);
  assert.equal(migrated.chapter, 10);
  assert.equal(migrated.screen, "chapter-10");
  assert.equal(migrated.notebookReturn.chapter, 10);
  assert.deepEqual(migrated.confrontation, {});
  assert.deepEqual(migrated.confrontationVersions, {});
  assert.equal(migrated.solved.includes("p12"), false);
  for (let step = 1; step <= 6; step += 1) assert.deepEqual(migrated.legacyProofRecords[`v8-q${step}`].evidence, raw.confrontation[`q${step}`]);
  assert.deepEqual(migrated.reportAdopted, Logic.REPORT_AUTO_KEYS);
  assert.equal(migrated.verifiedReport.ruleVersion, 11);
  assert.equal(Logic.isCurrentReportVerified(migrated), true);
  for (const step of Logic.RECONSTRUCTION_ORDER) assert.deepEqual(migrated.reconstructionEvidence[step], Logic.RECONSTRUCTION_EVIDENCE[step]);
  assert.deepEqual(Logic.normalizeState(migrated), migrated);
});

test("v8 proof keys cannot masquerade as the semantically different v3.6 questions", () => {
  const base = reportReadyState();
  const migrated = Logic.normalizeState({
    ...base,
    version: 8,
    confrontation: { q2: ["e_floor", "e_cart"], q4: [...MAIN_PROOFS.q2] },
    confrontationVersions: { q2: 8, q4: 8 },
    confrontationStep: 4
  });
  assert.deepEqual(migrated.confrontation, {});
  assert.equal(Logic.validateStoredProof(migrated, 2).ok, false);
  assert.deepEqual(migrated.legacyProofRecords["v8-q2"].evidence, ["e_floor", "e_cart"]);
  assert.deepEqual(migrated.legacyProofRecords["v8-q4"].evidence, MAIN_PROOFS.q2);
});

test("v8 closed A, C and D cases keep immutable archives and old proof order", () => {
  for (const ending of ["A", "C", "D"]) {
    const base = reportReadyState({ oldCase: ending !== "A" });
    const oldConfrontation = { ...V8_PROOFS, ...(ending !== "A" ? { q6: [...OLD_CASE_PROOF] } : {}) };
    const archive = {
      saveVersion: 8,
      report: { ...Logic.REPORT_ANSWERS },
      reportRuleVersion: 8,
      confrontation: oldConfrontation,
      confrontationVersions: Object.fromEntries(Object.keys(oldConfrontation).map(key => [key, 8])),
      disclosure: ending === "C" ? "culprit-only" : ending === "D" ? "full" : null,
      ending,
      note: "v3.5 archive"
    };
    const migrated = Logic.normalizeState({
      ...base,
      version: 8,
      chapter: 9,
      screen: `ending-${ending}`,
      ending,
      solved: [...base.solved, "report", "p12"],
      verifiedReport: { answers: { ...Logic.REPORT_ANSWERS }, revision: 0, ruleVersion: 8 },
      confrontation: oldConfrontation,
      confrontationVersions: archive.confrontationVersions,
      caseArchive: archive,
      meta: { endings: [ending], bestEvidence: base.evidence.length }
    });
    assert.equal(migrated.ending, ending);
    assert.equal(Logic.caseResolutionState(migrated), "closed");
    assert.deepEqual(migrated.caseArchive, archive);
    assert.deepEqual(migrated.legacyCaseRecord.confrontation, oldConfrontation);
    assert.deepEqual(Logic.normalizeState(migrated).caseArchive, archive);
  }
});

test("older joint-review and reconstruction migrations remain conservative", () => {
  const incomplete = Logic.normalizeState({ version: 6, solved: ["p05"], evidence: ["e_body", "e_watch"] });
  assert.equal(incomplete.evidence.includes("e_body_review"), false);
  assert.equal(incomplete.solved.includes("p05r"), false);
  const complete = Logic.normalizeState({ version: 6, solved: ["p05"], evidence: ["e_body", "e_watch", "e_impact"] });
  assert.equal(complete.evidence.includes("e_body_review"), true);
  assert.equal(complete.solved.includes("p05r"), true);
  const reconstruction = Logic.normalizeState({ version: 6, solved: ["p10", "p10r"], evidence: ["e_chaintrial"], reconstructionOrder: ["leave", "chain", "card", "water", "transfer"] });
  assert.equal(reconstruction.legacyReconstruction, true);
  assert.equal(reconstruction.solved.includes("p10r"), false);
  assert.deepEqual(reconstruction.reconstructionOrder, ["leave", "chain", "card", "water", "transfer"]);
  assert.deepEqual(Logic.normalizeState(reconstruction), reconstruction);
});

if (process.exitCode) process.exit(process.exitCode);
