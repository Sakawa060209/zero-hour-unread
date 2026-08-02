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
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
  confirm:()=>true,setTimeout:()=>0,clearTimeout(){},Date,Math,JSON,Set
};
vm.createContext(context);
let source = fs.readFileSync(__dirname + '/game.js','utf8');
source += `\n;globalThis.T={
  set(s){meta=JSON.parse(JSON.stringify(DEFAULT_META));state=Object.assign(freshState(),s);state.report=Object.assign(freshState().report,s.report||{});state.report.harms=Object.assign({},s.report?.harms||{});state.flags=Object.assign({degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:0},s.flags||{});state.flags.degraded=Object.assign({},s.flags?.degraded||{});state.flags.connectionAttempts=Object.assign({},s.flags?.connectionAttempts||{});state.flags.connectionLocks=Object.assign({},s.flags?.connectionLocks||{});},
  conn(id,selected){return connectionEvaluation(CONNECTIONS.find(c=>c.id===id),selected);},
  score(ids){return evidenceScore(ids);},qual(id){return scoreLabel(id);},prereq(id){return interviewPrerequisites(id,INTERVIEWS[id]);},
  advance(m,r=0,repair=0){advance(m,r,repair);return {safety:state.safety,pending:state.flags.pendingCrisis};},
  perform(loc,id){performAction(LOCATIONS.find(x=>x.id===loc),id);return state;},
  fail(id){return recordConnectionFailure(id);},locked(id){return connectionLocked(id);},add(ids){addClues(ids);},
  trust(id){return grantTrustBenefit(id,state.interviews[id]);},questions(id){return FIRST_QUESTIONS[id];},misinfo(a){return misinformationSolved(a);},
  refresh(){return refreshAutoAttachments();},attachment(id){return connectionAttachmentValid(id);},
  submit(){submitReport();return state.ending;},unlock(id){unlockEnding(id);},meta(){return meta;},get(){return state;}
};`;
vm.runInContext(source,context,{filename:'game.js'});
const T=context.T;

function setClues(clues,extra={}){
  T.set(Object.assign({clues,interviews:{},connectionEvidence:{},connections:[],report:{culprit:'',cause:'',room:'',responsibility:'',oldcase:'',harms:{}}},extra));
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

T.set({difficulty:'hard',safety:60,elapsed:0});
assert.deepEqual(T.advance(15,0,12),{safety:71,pending:undefined},'repair is applied before crisis thresholds');
T.set({difficulty:'hard',safety:60,elapsed:0});
assert.equal(T.advance(5).pending,'pump','real threshold crossing still triggers crisis');
T.set({difficulty:'hard',safety:60,elapsed:0,screen:'location',actions:[],clues:[],flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:0}});
const interrupted=T.perform('scene','seal');
assert.equal(interrupted.screen,'crisis','action crossing threshold opens crisis');
assert.equal(interrupted.flags.pendingActionResult.title,'封存现场','crisis preserves the completed action result');

T.set({difficulty:'hard',elapsed:0,safety:80});T.fail('waterSource');assert.equal(T.get().elapsed,5,'hard connection failure costs five minutes');
T.set({difficulty:'extreme',flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:5},clues:['dryCorridor']});
T.fail('waterSource');T.fail('waterSource');T.fail('waterSource');assert.equal(T.locked('waterSource'),true,'extreme locks after three failures');
T.add(['waterTrace']);assert.equal(T.locked('waterSource'),false,'a newly discovered clue unlocks validation');
assert.ok(!/\d/.test(T.qual('waterTrace')),'extreme evidence labels hide exact numbers');

T.set({clues:[],interviews:{qiyue:{trust:2,broken:false}},flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:0}});
assert.ok(T.trust('qiyue').includes('枪柜')&&T.get().clues.includes('gunRegistry')&&T.get().interviews.qiyue.trustShield,'trust grants a clue and alert shield');
for(const id of ['liangsuqin','qiyue','suwan','han','baiyan','liangyin'])assert.equal(new Set(T.questions(id).map(x=>x.id)).size,4,`${id} has four distinct first-round questions`);
assert.equal(T.misinfo({timeA:'00:35',timeB:'00:38',recipientA:'qiyue',recipientB:'baiyan',inference:'baiyan'}),true,'correct propagation inference succeeds');
assert.equal(T.misinfo({timeA:'00:35',timeB:'00:38',recipientA:'qiyue',recipientB:'baiyan',inference:'qiyue'}),false,'wrong propagation inference fails');

const allClues=['waterTrace','tankSample','scenePhotos','fakePort','brassScrews','railSample','channels','talkButton','knowledgeLeak','propagationTrace','overrideBurn','trackMisalign','aconite','identity','gunRegistry','mirrorImpact','glassPowder','cutRope','threatFilm','springMissing','maintenanceLog','freshBrakeOil','drugWine','reverseFilm','delayTape','oldCaseParts'];
const people=['liangsuqin','qiyue','suwan','han','baiyan','liangyin'];
const interviews=Object.fromEntries(people.map(id=>[id,{broken:true,independent:id==='liangyin'?false:true}]));
const flags={degraded:{},connectionAttempts:{},connectionLocks:{},...Object.fromEntries(people.map(id=>[`harm_${id}`,true]))};
const connectionEvidence={waterSource:['waterTrace','tankSample','scenePhotos'],movingRoom:['fakePort','brassScrews','railSample'],victimAlive:['channels','talkButton','knowledgeLeak','propagationTrace'],rescueBlocked:['overrideBurn','trackMisalign','channels','talkButton','knowledgeLeak']};
const report={culprit:'liangyin',cause:'drowning',room:'moving',responsibility:'override',oldcase:'delay',harms:{liangsuqin:true,qiyue:true,suwan:true,han:true,baiyan:true}};
T.set({clues:allClues,interviews,flags,connections:Object.keys(connectionEvidence),connectionEvidence,puzzles:['oldcase'],report,attachments:[]});
assert.equal(T.submit(),'N','complete proof without fixed timeline receives the dedicated ending');
T.set({clues:allClues,interviews,flags,connections:Object.keys(connectionEvidence),connectionEvidence,puzzles:['oldcase','timeline'],report,attachments:[]});
assert.equal(T.submit(),'A','fixed timeline still reaches ending A');
T.set({safety:0,difficulty:'hard',disclosure:[]});T.unlock('M');assert.ok(T.meta().endings.includes('M'),'evacuation ending is stored in the gallery');

console.log('v2.2 regression: all assertions passed');
