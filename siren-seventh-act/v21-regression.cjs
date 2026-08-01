const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const element = () => ({
  innerHTML: '', textContent: '', hidden: false, open: false, value: '', checked: false,
  dataset: {}, classList: { add() {}, remove() {}, toggle() {} },
  addEventListener() {}, querySelector() { return element(); }, querySelectorAll() { return []; },
  showModal() { this.open = true; }, close() { this.open = false; }, focus() {}
});
const storage = new Map();
const document = {
  querySelector: () => element(), querySelectorAll: () => [], addEventListener() {}
};
const context = {
  console, document, window: {}, navigator: { clipboard: { writeText: async () => {} } },
  localStorage: { getItem: k => storage.get(k) || null, setItem: (k,v) => storage.set(k,v), removeItem: k => storage.delete(k) },
  confirm: () => true, setTimeout: () => 0, clearTimeout() {}, Date, Math, JSON, Set
};
vm.createContext(context);
let source = fs.readFileSync(__dirname + '/game.js', 'utf8');
source += `\n;globalThis.T={
  reset(){state=freshState();},
  set(s){state=Object.assign(freshState(),s);state.flags=Object.assign({degraded:{}},s.flags||{});state.flags.degraded=Object.assign({},s.flags?.degraded||{});},
  conn(id,selected){return connectionEvaluation(CONNECTIONS.find(c=>c.id===id),selected);},
  prereq(id){return interviewPrerequisites(id,INTERVIEWS[id]);},
  refresh(){return refreshAutoAttachments();},
  attachment(id){return connectionAttachmentValid(id);},
  submit(){submitReport();return state.ending;},
  get(){return state;}
};`;
vm.runInContext(source, context, { filename: 'game.js' });
const T = context.T;

function setClues(clues, extra = {}) {
  T.set(Object.assign({ clues, interviews: {}, connectionEvidence: {}, connections: [], report: {culprit:'',cause:'',room:'',responsibility:'',oldcase:'',harms:{}} }, extra));
}

setClues(['waterTrace','tankSample','freshWaterProof']);
assert.equal(T.conn('waterSource',['waterTrace','tankSample','freshWaterProof']).solved,true,'related supporting evidence must be accepted');
setClues(['waterTrace','tankSample','freshWaterProof','aconite']);
assert.equal(T.conn('waterSource',['waterTrace','tankSample','freshWaterProof','aconite']).solved,false,'unrelated evidence must be rejected');
setClues(['waterTrace','tankSample'],{flags:{degraded:{waterTrace:true}}});
assert.equal(T.conn('waterSource',['waterTrace','tankSample']).solved,false,'degraded pair must fall below threshold');
setClues(['waterTrace','tankSample','scenePhotos'],{flags:{degraded:{waterTrace:true}}});
assert.equal(T.conn('waterSource',['waterTrace','tankSample','scenePhotos']).solved,true,'independent support must restore degraded proof');

setClues(['gunRegistry','mirrorImpact','glassPowder','talkButton']);
assert.equal(T.prereq('qiyue'),true,'Qiyue must have a no-test route');
setClues(['springMissing','maintenanceLog','freshBrakeOil','trackMisalign']);
assert.equal(T.prereq('han'),true,'Han must have a no-test route');
setClues(['channels','talkButton','propagationTrace','overrideBurn'],{interviews:{han:{broken:true}}});
assert.equal(T.prereq('liangyin'),true,'Liangyin must have a no-tape route');
setClues(['liveBullet','mirrorWound','talkButton']);
assert.equal(T.prereq('qiyue'),true,'Qiyue experimental route must remain valid');
setClues(['secondBrake','trackMisalign']);
assert.equal(T.prereq('han'),true,'Han experimental route must remain valid');
setClues(['recoveredVoice','overrideBurn','channels'],{interviews:{han:{broken:true}}});
assert.equal(T.prereq('liangyin'),true,'tape recovery route must remain valid');
setClues(['waterTrace','tankSample','freshWaterProof']);
assert.equal(T.conn('waterSource',['waterTrace','tankSample','freshWaterProof']).solved,true,'water test route must remain valid');

const allClues = [
  'waterTrace','tankSample','scenePhotos','fakePort','brassScrews','railSample',
  'channels','talkButton','knowledgeLeak','propagationTrace','overrideBurn','trackMisalign',
  'aconite','identity','gunRegistry','mirrorImpact','glassPowder','cutRope','threatFilm',
  'springMissing','maintenanceLog','freshBrakeOil','drugWine','reverseFilm','delayTape','oldCaseParts'
];
const people = ['liangsuqin','qiyue','suwan','han','baiyan','liangyin'];
const interviews = Object.fromEntries(people.map(id => [id,{broken:true,independent:id==='liangyin'?false:true}]));
const flags = {degraded:{}, ...Object.fromEntries(people.map(id => [`harm_${id}`,true]))};
const connectionEvidence = {
  waterSource:['waterTrace','tankSample','scenePhotos'], movingRoom:['fakePort','brassScrews','railSample'],
  victimAlive:['channels','talkButton','knowledgeLeak','propagationTrace'],
  rescueBlocked:['overrideBurn','trackMisalign','channels','talkButton','knowledgeLeak']
};
const report = {culprit:'liangyin',cause:'drowning',room:'moving',responsibility:'override',oldcase:'delay',harms:{liangsuqin:true,qiyue:true,suwan:true,han:true,baiyan:true}};
T.set({clues:allClues,interviews,flags,connections:Object.keys(connectionEvidence),connectionEvidence,puzzles:['oldcase','timeline'],report,attachments:[]});
assert.equal(T.attachment('waterSource'),false,'report proof must depend on generated attachments');
const attachments = T.refresh();
assert.ok(attachments.includes('waterTrace') && attachments.includes('knowledgeLeak'),'automatic report must include connected evidence');
assert.equal(T.attachment('waterSource'),true,'automatic attachment must activate report proof');
assert.equal(T.submit(),'A','full alternate route, including polluted testimony plus physical support, must reach ending A');

console.log('v2.1 regression: 15 assertions passed');
