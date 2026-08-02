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
  conn(id,selected){return connectionEvaluation(CONNECTIONS.find(c=>c.id===id),selected);},score(ids){return evidenceScore(ids);},qual(id){return scoreLabel(id);},prereq(id){return interviewPrerequisites(id,INTERVIEWS[id]);},
  advance(m,r=0,repair=0){advance(m,r,repair);return {safety:state.safety,pending:state.flags.pendingCrisis};},perform(loc,id){performAction(LOCATIONS.find(x=>x.id===loc),id);return state;},
  fail(id){return recordConnectionFailure(id);},locked(id){return connectionLocked(id);},review(id){return reviewLockedConnection(id);},relevant(id){return connectionRelevantClues(CONNECTIONS.find(c=>c.id===id));},add(ids){addClues(ids);},
  trust(id){return grantTrustBenefit(id,state.interviews[id]);},resolve(id,tech){resolveInterview(id,tech);return state.interviews[id];},firstEffect(id){return applyFirstQuestionEffects(id,state.interviews[id]);},questions(id){return FIRST_QUESTIONS[id];},
  misinfo(a){return misinformationSolved(a);},outcome(a){return misinformationOutcome(a);},physical(id){return physicalProofValid(id);},harm(id){return harmProofValid(id);},
  crisis(choice){resolveCrisis(choice);return state;},refresh(){return refreshAutoAttachments();},attachment(id){return connectionAttachmentValid(id);},
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

T.set({difficulty:'hard',safety:60,elapsed:0});assert.deepEqual(T.advance(15,0,12),{safety:71,pending:undefined},'repair is applied before crisis thresholds');
T.set({difficulty:'hard',safety:60,elapsed:0});assert.equal(T.advance(5).pending,'pump','real threshold crossing still triggers crisis');
T.set({difficulty:'hard',safety:60,elapsed:0,screen:'location',actions:[],clues:[],flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:0}});
const interrupted=T.perform('scene','seal');assert.equal(interrupted.screen,'crisis','action crossing threshold opens crisis');assert.equal(interrupted.flags.pendingActionResult.title,'封存现场','crisis preserves the completed action result');

T.set({difficulty:'hard',elapsed:0,safety:80});T.fail('waterSource');assert.equal(T.get().elapsed,5,'hard connection failure costs five minutes');
T.set({difficulty:'extreme',flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:5},clues:['dryCorridor']});
T.fail('waterSource');T.fail('waterSource');T.fail('waterSource');assert.equal(T.locked('waterSource'),true,'extreme locks after three failures');
T.add(['aconite']);assert.equal(T.locked('waterSource'),true,'an unrelated clue does not unlock the chain');
T.add(['waterTrace']);assert.equal(T.locked('waterSource'),false,'a relevant new clue unlocks validation');
const allWater=T.relevant('waterSource');T.set({difficulty:'extreme',elapsed:0,safety:90,clues:allWater,flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:allWater.length}});T.fail('waterSource');T.fail('waterSource');T.fail('waterSource');assert.equal(T.review('waterSource'),true,'fully exhausted chain can be reopened by reviewing');assert.equal(T.get().elapsed,15,'review costs fifteen minutes');
assert.ok(!/\d/.test(T.qual('waterTrace')),'extreme evidence labels hide exact numbers');

T.set({difficulty:'hard',safety:90,clues:[],interviews:{suwan:{attempts:0,alert:0,pressure:0,trust:1,broken:false,closed:false,originalRecorded:true,firstAnswers:['last','place']}},flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:0}});
const suwan=T.resolve('suwan','limited');assert.equal(suwan.trust,2,'Suwan limited questioning builds rapport');assert.ok(T.get().clues.includes('threatFilm'),'Suwan trust route grants the rehearsal film');
T.set({clues:[],interviews:{qiyue:{trust:0,firstAnswers:['fear','sound']}},flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:0}});T.firstEffect('qiyue');assert.equal(T.get().interviews.qiyue.trust,2,'fear question accelerates trust');assert.ok(T.get().clues.includes('gunRegistry'),'fear question visibly unlocks the trust benefit');
for(const id of ['liangsuqin','qiyue','suwan','han','baiyan','liangyin'])assert.equal(new Set(T.questions(id).map(x=>x.id)).size,4,`${id} has four distinct first-round questions`);

setClues(['springMissing','maintenanceLog','freshBrakeOil'],{interviews:{han:{closed:true}}});assert.equal(T.physical('han'),true,'three independent mechanical records prove Han without confession');assert.equal(T.harm('han'),true,'closed testimony does not block physical proof');
setClues(['winePuncture','sedativeVial','deletionIndex'],{interviews:{baiyan:{closed:true}}});assert.equal(T.physical('baiyan'),true,'Baiyan has a video-loss physical route');
T.set({clues:['drugWine','reverseFilm'],flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:2,pendingCrisis:'archive'},safety:34});const crisis=T.crisis('loseVideo');assert.ok(!crisis.clues.includes('drugWine')&&crisis.clues.includes('deletionIndex'),'archive choice replaces video with physical fallback evidence');

const routeA={timeA:'00:35',timeB:'00:38',recipientA:'qiyue',recipientB:'baiyan',inference:'qiyue',inferenceMode:'relay'};
assert.equal(T.outcome(routeA).version,'A','relationship speed can make version A leak');assert.equal(T.misinfo(routeA),true,'relay origin and mode solve the dynamic route');
const routeB={timeA:'00:40',timeB:'00:36',recipientA:'qiyue',recipientB:'liangsuqin',inference:'liangsuqin',inferenceMode:'direct'};
assert.equal(T.outcome(routeB).version,'B','another relationship route can make version B leak');assert.equal(T.misinfo({...routeB,inferenceMode:'relay'}),false,'direct versus intermediary inference matters');

setClues(['brakeDamage'],{report:{culprit:'han',cause:'poison',room:'locked',responsibility:'shot',oldcase:'accident',harms:{}}});assert.equal(T.submit(),'O','unsupported wrong suspect receives the generic accusation ending');
setClues(['brakeDamage'],{report:{culprit:'han',cause:'poison',room:'locked',responsibility:'brake',oldcase:'accident',harms:{}}});assert.equal(T.submit(),'C','supported brake theory receives Han ending');
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

console.log('v2.3 regression: all assertions passed');
