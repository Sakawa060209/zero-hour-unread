const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const element = () => ({
  innerHTML:'',textContent:'',hidden:false,open:false,value:'',checked:false,dataset:{},
  classList:{add(){},remove(){},toggle(){}},addEventListener(){},querySelector(){return element();},querySelectorAll(){return [];},
  showModal(){this.open=true;},close(){this.open=false;},focus(){}
});
const storage = new Map();
const document = {querySelector:()=>element(),querySelectorAll:()=>[],addEventListener(){}};
const context = {
  console,document,window:{scrollTo(){}},navigator:{clipboard:{writeText:async()=>{}}},
  localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},
  confirm:()=>true,setTimeout:()=>0,clearTimeout(){},Date,Math,JSON,Set
};
vm.createContext(context);
let source = fs.readFileSync(__dirname + '/game.js','utf8');
source += `\n;globalThis.T={
  set(s,m={}){meta=Object.assign(JSON.parse(JSON.stringify(DEFAULT_META)),m);meta.endings=[...(m.endings||[])];meta.previews=[...(m.previews||[])];state=Object.assign(freshState(),s);state.report=Object.assign(freshState().report,s.report||{});state.report.harms=Object.assign({},s.report?.harms||{});state.flags=Object.assign({degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:0},s.flags||{});state.flags.degraded=Object.assign({},s.flags?.degraded||{});state.flags.connectionAttempts=Object.assign({},s.flags?.connectionAttempts||{});state.flags.connectionLocks=Object.assign({},s.flags?.connectionLocks||{});},
  startSafety(d){return startingSafety(d);},wearRate(){return stormWearRate();},exposureRate(){return lowSafetyExposureRate();},
  conn(id,selected){return connectionEvaluation(CONNECTIONS.find(c=>c.id===id),selected);},score(ids){return evidenceScore(ids);},qual(id){return scoreLabel(id);},prereq(id){return interviewPrerequisites(id,INTERVIEWS[id]);},
  advance(m,r=0,repair=0){advance(m,r,repair);return {safety:state.safety,pending:state.flags.pendingCrisis};},perform(loc,id){performAction(LOCATIONS.find(x=>x.id===loc),id);return state;},
  available(loc,id){return actionAvailable(LOCATIONS.find(x=>x.id===loc).actions.find(x=>x.id===id));},origins(){return Object.keys(CLUES).filter(id=>!CLUE_ORIGINS[id]);},origin(id){return clueOrigin(id);},
  fail(id){return recordConnectionFailure(id);},locked(id){return connectionLocked(id);},review(id){return reviewLockedConnection(id);},relevant(id){return connectionRelevantClues(CONNECTIONS.find(c=>c.id===id));},add(ids){addClues(ids);},
  trust(id){return grantTrustBenefit(id,state.interviews[id]);},resolve(id,tech){resolveInterview(id,tech);return state.interviews[id];},firstEffect(id){return applyFirstQuestionEffects(id,state.interviews[id]);},questions(id){return FIRST_QUESTIONS[id];},
  misinfo(a){return misinformationSolved(a);},outcome(a){return misinformationOutcome(a);},observation(a){return misinformationObservation(misinformationOutcome(a));},physical(id){return physicalProofValid(id);},harm(id){return harmProofValid(id);},
  crisis(choice){resolveCrisis(choice);return state;},refresh(){return refreshAutoAttachments();},attachment(id){return connectionAttachmentValid(id);},
  derived(id){return derivedTestimonyScore(id);},description(id){return clueDescription(id);},salvage(ids){resolveVideoSalvage(ids);return state;},
  confrontReady(){return confrontationReady();},confrontRequirements(){return confrontationRequirements();},completeConfront(){completeConfrontation();return state;},counterLabel(id,required){return confrontationConnectionLabel(CONNECTIONS.find(c=>c.id===id),required);},metrics(){return endingMetrics();},styles(){return investigationStyles();},syncDisclosure(){const secrets=Object.entries(SECRET_CONFIG).filter(([,v])=>v.unlocked());syncReportDisclosure(secrets);return state.disclosure;},
  submit(){submitReport();return state.ending;},unlock(id){unlockEnding(id);},preview(id){previewEnding(id);},meta(){return meta;},get(){return state;}
};`;
vm.runInContext(source,context,{filename:'game.js'});
const T=context.T;

function setClues(clues,extra={},meta={}){
  T.set(Object.assign({clues,interviews:{},connectionEvidence:{},connections:[],report:{culprit:'',cause:'',room:'',responsibility:'',oldcase:'',harms:{}}},extra),meta);
}

setClues(['waterTrace','tankSample','freshWaterProof']);
assert.equal(T.conn('waterSource',['waterTrace','tankSample','freshWaterProof']).solved,true,'related supporting evidence is accepted');
setClues(['waterTrace','tankSample','freshWaterProof','aconite']);
assert.equal(T.conn('waterSource',['waterTrace','tankSample','freshWaterProof','aconite']).solved,false,'unrelated evidence is rejected');
setClues(['waterTrace','scenePhotos','tankSample'],{flags:{degraded:{waterTrace:true,scenePhotos:true}}});
assert.equal(T.score(['waterTrace','scenePhotos','tankSample']),3,'two degraded records from one source count once');
assert.equal(T.conn('waterSource',['waterTrace','scenePhotos','tankSample']).solved,false,'same-source degraded evidence cannot self-repair');
setClues(['waterTrace','scenePhotos','tankSample','freshWaterProof'],{flags:{degraded:{waterTrace:true,scenePhotos:true}}});
assert.equal(T.conn('waterSource',['waterTrace','scenePhotos','tankSample','freshWaterProof']).solved,true,'independent laboratory evidence repairs degraded proof');

setClues(['gunRegistry','mirrorImpact','glassPowder','talkButton']);assert.equal(T.prereq('qiyue'),true,'Qiyue has a no-test route');
setClues(['springMissing','maintenanceLog','freshBrakeOil','trackMisalign']);assert.equal(T.prereq('han'),true,'Han has a no-test route');
setClues(['channels','talkButton','propagationTrace','overrideBurn'],{interviews:{han:{broken:true}}});assert.equal(T.prereq('liangyin'),true,'Liangyin has a no-tape route');

assert.equal(T.startSafety('normal'),90,'normal mode receives twelve extra starting safety points');
assert.equal(T.startSafety('hard'),78,'hard mode keeps the original starting safety');
T.set({difficulty:'normal',safety:90,elapsed:0});for(let i=0;i<7;i++)T.advance(5);assert.equal(T.get().safety,90,'short normal-mode actions do not each consume safety');T.advance(5);assert.equal(T.get().safety,89,'normal storm wear is charged only after the cumulative 36-minute window');
T.set({difficulty:'normal',safety:90,elapsed:0});T.advance(40);assert.equal(T.get().safety,89,'split and continuous investigation time have equal storm cost');
T.set({difficulty:'normal',safety:90,elapsed:0,flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:0,deckSecured:true}});T.advance(500,17);assert.equal(T.get().safety,60,'a thorough 500-minute normal route with every major investigation risk remains playable');
T.set({difficulty:'hard',safety:60,elapsed:0});assert.deepEqual(T.advance(15,0,12),{safety:72,pending:undefined},'repair is applied before crisis thresholds');
T.set({difficulty:'hard',safety:60,elapsed:17});assert.equal(T.advance(5).pending,'pump','real cumulative threshold crossing still triggers crisis');
T.set({difficulty:'hard',safety:60,elapsed:17,screen:'location',actions:[],clues:[],flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:0}});
const interrupted=T.perform('scene','seal');assert.equal(interrupted.screen,'crisis','action crossing threshold opens crisis');assert.equal(interrupted.flags.pendingActionResult.title,'封存现场','crisis preserves the completed action result');

T.set({difficulty:'hard',safety:39,elapsed:0,flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:0}});T.advance(10);assert.equal(T.get().safety,39,'danger-zone safety is no longer charged on every short action');for(let i=0;i<4;i++)T.advance(10);assert.equal(T.get().safety,36,'danger-zone accidents use cumulative exposure time');
T.set({difficulty:'hard',safety:80,elapsed:239,flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:0}});T.advance(1);assert.equal(T.get().safety,76,'an unsecured deck receives one delayed storm penalty');T.advance(1);assert.equal(T.get().safety,76,'the delayed storm penalty cannot repeat on every action');

T.set({difficulty:'hard',elapsed:0,safety:80});T.fail('waterSource');assert.equal(T.get().elapsed,5,'hard connection failure costs five minutes');
T.set({difficulty:'extreme',flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:5},clues:['dryCorridor']});
T.fail('waterSource');T.fail('waterSource');T.fail('waterSource');assert.equal(T.locked('waterSource'),true,'extreme locks after three failures');
T.add(['aconite']);assert.equal(T.locked('waterSource'),true,'an unrelated clue does not unlock the chain');
T.add(['waterTrace']);assert.equal(T.locked('waterSource'),false,'a relevant new clue unlocks validation');
const allWater=T.relevant('waterSource');T.set({difficulty:'extreme',elapsed:0,safety:90,clues:allWater,flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:allWater.length}});T.fail('waterSource');T.fail('waterSource');T.fail('waterSource');assert.equal(T.review('waterSource'),true,'fully exhausted chain can be reopened by reviewing');assert.equal(T.get().elapsed,15,'review costs fifteen minutes');
assert.ok(!/\d/.test(T.qual('waterTrace')),'extreme evidence labels hide exact numbers');

T.set({difficulty:'hard',safety:90,clues:[],interviews:{suwan:{attempts:0,alert:0,pressure:0,trust:1.5,broken:false,closed:false,originalRecorded:true,firstAnswers:['fear','place']}},flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:0}});
const suwan=T.resolve('suwan','limited');assert.equal(suwan.trust,2,'Suwan limited questioning builds rapport');assert.ok(T.get().clues.includes('threatFilm'),'Suwan trust route grants the rehearsal film');
T.set({clues:[],interviews:{qiyue:{attempts:0,alert:0,pressure:0,trust:0,broken:false,closed:false,originalRecorded:true,firstAnswers:['fear','sound']}},flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:0}});T.firstEffect('qiyue');assert.equal(T.get().interviews.qiyue.trust,1.5,'fear question accelerates but does not complete trust');assert.ok(!T.get().clues.includes('gunRegistry'),'fear question does not grant the reward by itself');T.resolve('qiyue','open');assert.equal(T.get().interviews.qiyue.trust,2,'one gentle follow-up completes the fear route');assert.ok(T.get().clues.includes('gunRegistry'),'completed trust grants the dedicated clue');
for(const id of ['liangsuqin','qiyue','suwan','han','baiyan','liangyin'])assert.equal(new Set(T.questions(id).map(x=>x.id)).size,4,`${id} has four distinct first-round questions`);

T.set({clues:[],interviews:{suwan:{originalRecorded:true,independent:false,firstAnswers:['sound','fear']},han:{originalRecorded:true,independent:false,firstAnswers:['sound','last']}},flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:0}});T.firstEffect('suwan');assert.ok(T.get().clues.includes('soundComparison'),'two matching answers create a derived testimony clue');assert.equal(T.derived('soundComparison'),.5,'two polluted statements remain weak after derivation');assert.ok(T.description('soundComparison').includes('苏晚')&&T.description('soundComparison').includes('韩九章')&&T.description('soundComparison').includes('受污染'),'casebook keeps witnesses and pollution status');
T.set({clues:[],interviews:{suwan:{originalRecorded:true,independent:true,firstAnswers:['sound','fear']},han:{originalRecorded:true,independent:false,firstAnswers:['sound','last']}},flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:0}});T.firstEffect('suwan');assert.equal(T.derived('soundComparison'),1,'one independent statement gives limited proof');
T.set({clues:[],interviews:{suwan:{originalRecorded:true,independent:true,firstAnswers:['sound','fear']},han:{originalRecorded:true,independent:true,firstAnswers:['sound','last']}},flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:0}});T.firstEffect('suwan');assert.equal(T.derived('soundComparison'),2,'two independent statements give full proof');

setClues(['springMissing','maintenanceLog','freshBrakeOil'],{interviews:{han:{closed:true}}});assert.equal(T.physical('han'),true,'three independent mechanical records prove Han without confession');assert.equal(T.harm('han'),true,'closed testimony does not block physical proof');
setClues(['winePuncture','sedativeVial','deletionIndex'],{interviews:{baiyan:{closed:true}}});assert.equal(T.physical('baiyan'),true,'Baiyan has a video-loss physical route');
setClues(['gunRegistry','mirrorImpact','glassPowder'],{interviews:{qiyue:{closed:true}}});assert.equal(T.physical('qiyue'),true,'Qiyue physical proof uses three independent sources');
setClues(['aconite','needleThread','identity'],{interviews:{liangsuqin:{closed:true}}});assert.equal(T.physical('liangsuqin'),false,'Liang motive evidence cannot replace behavior evidence');
setClues(['aconite','needleThread','gloveAconite'],{interviews:{liangsuqin:{closed:true}}});assert.equal(T.physical('liangsuqin'),true,'Liang glove residue completes the behavior-only route');
setClues(['cutRope','riggingKnife','threatFilm'],{interviews:{suwan:{closed:true}}});assert.equal(T.physical('suwan'),false,'Suwan threat motive cannot replace behavior evidence');
setClues(['cutRope','riggingKnife','ropeFibers'],{interviews:{suwan:{closed:true}}});assert.equal(T.physical('suwan'),true,'Suwan rope fibers complete the behavior-only route');
T.set({clues:['drugWine','reverseFilm'],elapsed:0,flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:2,pendingCrisis:'archive'},safety:34});const crisis=T.crisis('loseVideo');assert.ok(!crisis.clues.includes('drugWine')&&!crisis.clues.includes('deletionIndex'),'archive choice does not grant free fallback evidence');assert.equal(crisis.flags.videoSalvageAvailable,true,'video loss opens a paid salvage opportunity');T.salvage(['bottle','index']);assert.equal(T.get().elapsed,15,'salvage costs fifteen minutes');assert.ok(T.get().clues.includes('winePuncture')&&T.get().clues.includes('deletionIndex'),'selected salvage bundles grant only their evidence');assert.ok(!T.get().clues.includes('threatFilm'),'unselected rehearsal evidence remains lost');

T.set({clues:[],actions:[],flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:0,pendingCrisis:'archive'}});T.crisis('loseLoad');assert.equal(T.available('machine','load'),false,'lost load tape cannot be reacquired');T.perform('machine','load');assert.ok(!T.get().clues.includes('loadTape'),'blocked load action cannot restore the clue');
T.set({clues:[],actions:[],flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:0,pendingCrisis:'archive'}});T.crisis('loseOld');assert.equal(T.available('archive','1978'),false,'lost old tape cannot be repaired later');
T.set({clues:[],actions:[],flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:0,pendingCrisis:'archive'}});T.crisis('loseVideo');assert.equal(T.available('quarters','wine'),false,'lost formal video cannot be reacquired through the old action');assert.equal(T.available('quarters','film'),false,'lost mirror film remains unavailable');
T.set({clues:[],actions:[],flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:0,pendingCrisis:'track'}});T.crisis('close');assert.equal(T.available('theater','bullet'),false,'closing the stage permanently blocks the bullet');
T.set({clues:[],actions:[],flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:0,waterSamplesLost:true}});assert.equal(T.available('scene','seal'),false,'sacrificed water-scene originals cannot be resealed');assert.equal(T.available('deck','samples'),false,'sacrificed water samples cannot be recollected');

assert.deepEqual(T.origins(),[],'every clue has an explicit origin category');assert.equal(T.origin('handprints'),'scene','handprints are scene evidence');assert.equal(T.origin('lockManual'),'record','lock manual is documentary evidence');

const routeA={timeA:'00:35',timeB:'00:38',delivery:'a-first',recipientA:'qiyue',recipientB:'baiyan',inference:'qiyue',inferenceMode:'relay'};
assert.equal(T.outcome(routeA).version,'A','relationship speed can make version A leak');assert.equal(T.misinfo(routeA),true,'relay origin and mode solve the dynamic route');
assert.equal(T.outcome({...routeA,timeA:'23:11',timeB:'05:49'}).version,'A','changing false-time content does not alter propagation speed');
assert.ok(!T.observation(routeA).includes('版本 A')&&!T.observation(routeA).includes('使用了版本'),'observation shows dialogue without revealing the version answer');
const routeB={timeA:'00:40',timeB:'00:36',delivery:'simultaneous',recipientA:'qiyue',recipientB:'liangsuqin',inference:'liangsuqin',inferenceMode:'direct'};
assert.equal(T.outcome(routeB).version,'B','another relationship route can make version B leak');assert.equal(T.misinfo({...routeB,inferenceMode:'relay'}),false,'direct versus intermediary inference matters');

T.set({clues:['channels','overrideBurn','springMissing','maintenanceLog','freshBrakeOil'],connections:['victimAlive'],interviews:{liangyin:{cornered:true},han:{closed:true}},flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:5}});assert.equal(T.confrontReady(),false,'final confrontation stays locked without the rescue connection');assert.equal(T.confrontRequirements()[0][1],'嫌疑人的普通证词退路已封锁','locked gate does not reveal the culprit name');
T.set({clues:['channels','overrideBurn','springMissing','maintenanceLog','freshBrakeOil'],connections:['victimAlive','rescueBlocked'],interviews:{liangyin:{cornered:true},han:{closed:true}},flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:5,confrontation:{support:1}}});assert.equal(T.confrontReady(),true,'two final chains and recovery proof unlock confrontation');const confronted=T.completeConfront();assert.equal(confronted.interviews.liangyin.broken,true,'successful confrontation formally breaks Liangyin testimony');assert.ok(confronted.clues.includes('knowledgeLeak'),'successful confrontation creates knowledge leakage');T.refresh();assert.ok(confronted.attachments.includes('knowledgeLeak'),'knowledge leakage is sealed as an automatic attachment');
assert.equal(T.score(['knowledgeLeak']),2,'final knowledge leakage is always an independent confrontation statement');
T.set({difficulty:'hard'});assert.ok(!T.counterLabel('rescueBlocked','rescueBlocked').includes('对应反证'),'hard confrontation hides the correct marker');T.set({difficulty:'normal'});assert.ok(T.counterLabel('rescueBlocked','rescueBlocked').includes('对应反证'),'normal confrontation keeps the guidance marker');T.set({difficulty:'extreme'});assert.ok(T.counterLabel('rescueBlocked','rescueBlocked').startsWith('结论摘要：'),'extreme confrontation shows a conclusion summary');
T.set({screen:'confrontation',difficulty:'hard',elapsed:17,safety:15,clues:[],interviews:{liangyin:{cornered:true,independent:false}},flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:0,confrontation:{support:-1}}});const crisisAfterConfront=T.completeConfront();assert.equal(crisisAfterConfront.screen,'crisis','confrontation threshold crossing enters crisis before report');assert.equal(crisisAfterConfront.flags.pendingCrisis,'track','confrontation time can trigger the track crisis');assert.equal(crisisAfterConfront.flags.returnAfterCrisis,'report','crisis remembers the report destination');T.crisis('close');assert.equal(T.get().screen,'report','resolved confrontation crisis returns to the report');

T.set({clues:['identity','plagiarism','threatFilm'],disclosure:[],flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:3,mandatoryDisclosure:'identity',reportDisclosureMode:'sealed'}});assert.deepEqual(T.syncDisclosure(),['identity'],'sealed report keeps only the public confrontation secret');T.get().flags.reportDisclosureMode='limited';T.get().disclosure=['identity','plagiarism'];assert.deepEqual(T.syncDisclosure().sort(),['identity','plagiarism'].sort(),'limited report can add selected secrets');T.get().flags.reportDisclosureMode='full';assert.equal(T.syncDisclosure().length,3,'full report publishes every discovered secret');

T.set({elapsed:307,errors:4,hints:2,clues:['springMissing','maintenanceLog','freshBrakeOil'],interviews:{han:{closed:true,independent:false},suwan:{independent:true}}});assert.deepEqual(T.metrics(),{polluted:1,physical:1},'ending metrics separate pollution and pure physical proof');
T.set({errors:0,hints:1,clues:['springMissing','maintenanceLog','freshBrakeOil','winePuncture','sedativeVial','deletionIndex','gunRegistry','mirrorImpact','glassPowder'],interviews:{han:{trustBenefit:true},suwan:{trustBenefit:true},qiyue:{trustBenefit:true}}});const styles=T.styles();assert.ok(styles.includes('冷静复原者')&&styles.includes('倾听者')&&styles.includes('物证主义者'),'ending styles reflect error, trust, and physical-proof play');

setClues(['brakeDamage'],{report:{culprit:'han',cause:'poison',room:'locked',responsibility:'shot',oldcase:'accident',harms:{}}});assert.equal(T.submit(),'O','unsupported wrong suspect receives the generic accusation ending');
setClues(['brakeDamage'],{report:{culprit:'han',cause:'poison',room:'locked',responsibility:'brake',oldcase:'accident',harms:{}}});assert.equal(T.submit(),'O','a brake clue alone does not validate a mismatched Han theory');
setClues(['brakeDamage'],{report:{culprit:'han',cause:'drowning',room:'moving',responsibility:'brake',oldcase:'accident',harms:{}}});assert.equal(T.submit(),'C','the complete supported brake theory receives Han ending');
setClues(['liveBullet'],{replayMode:true,report:{culprit:'qiyue',cause:'bullet',room:'locked',responsibility:'shot',oldcase:'accident',harms:{}}},{endings:['M'],endingDates:{M:new Date().toISOString()},firstEnding:'M'});assert.equal(T.submit(),'D','replay can display an alternate ending');assert.ok(!T.meta().endings.includes('D')&&T.meta().previews.includes('D'),'replay only records a preview seat');

const allClues=['waterTrace','tankSample','scenePhotos','fakePort','brassScrews','railSample','channels','talkButton','knowledgeLeak','propagationTrace','overrideBurn','trackMisalign','aconite','identity','gunRegistry','mirrorImpact','glassPowder','cutRope','threatFilm','springMissing','maintenanceLog','freshBrakeOil','drugWine','reverseFilm','delayTape','oldCaseParts'];
const people=['liangsuqin','qiyue','suwan','han','baiyan','liangyin'];
const interviews=Object.fromEntries(people.map(id=>[id,{broken:true,independent:id==='liangyin'?false:true}]));
const flags={degraded:{},connectionAttempts:{},connectionLocks:{},...Object.fromEntries(people.map(id=>[`harm_${id}`,true]))};
const connectionEvidence={waterSource:['waterTrace','tankSample','scenePhotos'],movingRoom:['fakePort','brassScrews','railSample'],victimAlive:['channels','talkButton','knowledgeLeak','propagationTrace'],rescueBlocked:['overrideBurn','trackMisalign','channels','talkButton','knowledgeLeak']};
const report={culprit:'liangyin',cause:'drowning',room:'moving',responsibility:'override',oldcase:'delay',harms:{liangsuqin:true,qiyue:true,suwan:true,han:true,baiyan:true}};
T.set({safety:62,clues:allClues,interviews,flags,connections:Object.keys(connectionEvidence),connectionEvidence,puzzles:['oldcase'],report,attachments:[]});assert.equal(T.submit(),'N','complete proof without fixed timeline receives the dedicated ending');
T.set({safety:57,difficulty:'extreme',clues:allClues,interviews,flags,connections:Object.keys(connectionEvidence),connectionEvidence,puzzles:['oldcase','timeline'],report,attachments:[]});assert.equal(T.submit(),'A','fixed timeline still reaches ending A');assert.equal(T.meta().bestCompleteSafety,57,'complete ending tracks its own best safety');assert.equal(T.meta().bestExtremeCompleteSafety,57,'extreme complete ending tracks its own best safety');
T.set({safety:0,difficulty:'hard',disclosure:[]});T.unlock('M');assert.ok(T.meta().endings.includes('M'),'evacuation ending is stored in the official gallery');

console.log('v2.6 regression: all assertions passed');
