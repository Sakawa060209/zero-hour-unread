"use strict";

const STORAGE_KEY = "siren-seventh-act-save-v1";

const CLUES = {
  dryCorridor:{t:"干燥走廊",d:"门外走廊毫无积水，水不可能由走廊灌入。",chain:"死因",stage:2},
  waterTrace:{t:"无盐水迹",d:"地毯与镜面残水几乎没有盐分，来源不是海水。",chain:"死因",stage:2},
  foam:{t:"口鼻泡沫",d:"泡沫形态符合生前溺水，而非死后浸泡。",chain:"死因",stage:3},
  cable:{t:"被咬断的电线",d:"纤维嵌入口腔，进水时死者仍能呼吸和活动。",chain:"死因",stage:4},
  handprints:{t:"递升的血手印",d:"两组血手印随水位升高，证明死者曾持续站起。",chain:"死因",stage:4},
  tankSample:{t:"暴雨水槽样本",d:"细石英、防滑粉与现场残水、细沙完全一致。",chain:"死因",stage:4},
  freshWaterProof:{t:"淡水比对报告",d:"海水、厨房蒸馏水与暴雨水三组样本完成排除比对。",chain:"死因",stage:5},
  sixBulbs:{t:"六枚镜前灯",d:"现场只有六灯；真正固定化妆室有七灯。",chain:"密室",stage:2},
  fakePort:{t:"溶化的假舷窗",d:"窗外海景是画在木板上的布景，颜料遇水流淌。",chain:"密室",stage:3},
  brassScrews:{t:"家具固定螺钉",d:"地毯下有固定布景家具的黄铜螺钉。",chain:"密室",stage:3},
  thresholdGrease:{t:"门槛黑色油脂",d:"成分尚不明的高黏度机械油。",chain:"密室",stage:1},
  railSample:{t:"升降轨道油样",d:"与门槛油脂的稠度和金属屑组成一致。",chain:"密室",stage:4},
  sandMatch:{t:"水槽细沙匹配",d:"衣柜底沙粒来自人工暴雨水槽，而非海滩。",chain:"密室",stage:4},
  shipPlan:{t:"船体结构图",d:"标有北向箭头，是三层图纸之一。",chain:"密室",stage:2},
  stagePlan:{t:"舞台调度图",d:"红色中心点标记了旋转舞台轴心。",chain:"密室",stage:2},
  lightPlan:{t:"旧灯光位置图",d:"第七聚光灯的位置与另两图存在特殊对应。",chain:"密室",stage:2},
  lockManual:{t:"布景舱安全锁说明",d:"模块移动时自动闭锁；进水短路后无法解除。",chain:"密室",stage:5},
  threeKeys:{t:"三把“7”号钥匙",d:"门钥匙、仓库钥匙与手动制动钥匙混在一起。",chain:"密室",stage:2},
  aconite:{t:"面具夹层乌头残留",d:"剂量会致麻木和心律异常，但不足以立即致死。",chain:"加害",stage:4},
  drugWine:{t:"镇静药与换瓶录像",d:"白砚更换酒瓶；死者只饮用了少量。",chain:"加害",stage:4},
  cutRope:{t:"威亚新切口",d:"旧磨损间存在整齐的新切割纤维。",chain:"加害",stage:3},
  backupRope:{t:"备用威亚绳",d:"韩九章发现破坏后临时加装，坠落被限制在一米半。",chain:"加害",stage:4},
  liveBullet:{t:"外圈检修道弹头",d:"真弹击穿镜墙后卡在外圈，没有进入人体。",chain:"加害",stage:4},
  mirrorWound:{t:"镜片伤口方向",d:"腹部创缘含玻璃粉，不是枪创。",chain:"加害",stage:4},
  brakeDamage:{t:"主制动人为磨削",d:"所谓金属疲劳下藏着新鲜的锉削纹。",chain:"加害",stage:3},
  secondBrake:{t:"第二制动新弹簧",d:"韩九章先破坏主制动，后来又恢复副制动。",chain:"加害",stage:4},
  channels:{t:"独立监听声道",d:"舱内通话没有损坏，只被切换到梁音的耳机。",chain:"存活",stage:4},
  cueTape:{t:"双声道提示磁带",d:"右声道藏有低八度的内部通话备份。",chain:"存活",stage:2},
  recoveredVoice:{t:"求救录音",d:"“梁音……停止旋转……我还在里面……”",chain:"存活",stage:5},
  talkButton:{t:"带血的通话按钮",d:"按钮必须持续按住，求救不可能是预录台词。",chain:"存活",stage:4},
  overrideBurn:{t:"紧急覆盖触点烧蚀",d:"触点被持续按住约三秒，不是误触。",chain:"指令",stage:4},
  motorLog:{t:"舞台电机电流记录",d:"警报后仍出现一次完整旋转负载。",chain:"指令",stage:3},
  loadTape:{t:"发电机负载纸带",d:"校正时间差后，旋转发生于进水警报之后。",chain:"指令",stage:4},
  trackMisalign:{t:"应急轨道错位",d:"旋转让配重轨道横移，舱体从可救变为无法拉回。",chain:"指令",stage:5},
  penHabit:{t:"确认指令前的钢笔声",d:"三段彩排均显示梁音按笔后才确认不可撤销指令。",chain:"指令",stage:3},
  knowledgeLeak:{t:"梁音的知识泄漏",d:"她纠正了从未公开的完整求救用词。",chain:"指令",stage:5},
  identity:{t:"双胞胎身份文件",d:"祁越与梁音是阮明珠和祁重楼的双胞胎。",chain:"旧案",stage:4},
  threatFilm:{t:"受胁迫排练录像",d:"祁重楼以1978年事故威胁苏晚配合暧昧宣传。",chain:"旧案",stage:4},
  reverseFilm:{t:"镜像删除录像",d:"扣子、反字与左手持剑证明画面方向被反转。",chain:"加害",stage:4},
  delayTape:{t:"1978年后台录音",d:"阮明珠呼救后，祁重楼命令演出继续九十秒。",chain:"旧案",stage:5},
  oldCaseParts:{t:"旧案三重过失",d:"安全销拆除、焰火提前、后台门移动共同制造灾难。",chain:"旧案",stage:4},
  plagiarism:{t:"未署名剧本",d:"祁重楼的代表作建立在白砚未署名文本上。",chain:"旧案",stage:3},
  scenePhotos:{t:"现场封存照片",d:"水线、灯具、门锁与尸体姿态均已在变化前固定。",chain:"死因",stage:5}
};

const PEOPLE = {
  liangsuqin:{name:"梁素琴",age:51,role:"前妻 · 王后",glyph:"后",desc:"息影女演员。她看梁音时不像看外甥女。",protect:"梁音"},
  qiyue:{name:"祁越",age:22,role:"儿子 · 王子",glyph:"子",desc:"公开承认的独子。确信那发子弹击中了父亲。",protect:"苏晚"},
  liangyin:{name:"梁音",age:22,role:"提示员 · 控制室",glyph:"音",desc:"负责所有旋转与调度。几乎只说字面真话。",protect:"祁越"},
  suwan:{name:"苏晚",age:23,role:"未婚妻 · 海妖",glyph:"妖",desc:"新任女主角，被迫与导演制造暧昧宣传。",protect:"韩九章"},
  han:{name:"韩九章",age:50,role:"总机械师 · 共犯",glyph:"械",desc:"熟悉每一套制动，也熟悉1978年的升降井。",protect:"苏晚与梁音"},
  baiyan:{name:"白砚",age:48,role:"制片人 · 纵火者",glyph:"砚",desc:"昔日编剧，擅长把事实剪成更动人的故事。",protect:"梁素琴"}
};

const LOCATIONS = [
  {id:"scene",title:"第七化妆室",teaser:"潮湿的密室，干燥的走廊，以及少了一盏的灯。",icon:"水",actions:[
    {id:"seal",title:"封存现场",sub:"在水迹蒸发前记录尸体与房间",m:5,clues:["scenePhotos","dryCorridor","waterTrace"],text:"闪光灯照亮两组递升血手印。初步试纸显示残水几乎不含盐；你封存水线、门锁、灯具与尸体姿态。"},
    {id:"body",title:"检查尸体与通话器",sub:"口鼻、伤口、手指与断线",m:10,clues:["foam","cable","talkButton"],text:"祁重楼咬断了电线；通话按钮上有他仍在流血时留下的指纹。"},
    {id:"room",title:"比对房间陈设",sub:"灯、窗、地毯与衣柜",m:10,clues:["sixBulbs","fakePort","thresholdGrease"],text:"窗不是窗。六枚灯也不是维修疏漏：这里像化妆室，却更像精心复制的布景。"},
    {id:"water",title:"精查水线",sub:"需要先提出“淡水来源”假说",m:10,requiresHyp:"freshwater",clues:["waterTrace","handprints"],text:"三条水线记录了上升、倾斜与排水。第二组手印比第一组更高。"},
    {id:"floor",title:"拆查地板固定结构",sub:"需要先提出“房间移动”假说",m:10,requiresHyp:"moving",clues:["brassScrews"],text:"地毯下的黄铜螺钉把桌椅钉在地板上——固定房间没有这种必要。"},
    {id:"key",title:"检查门锁与钥匙",sub:"收集三把都写着“7”的钥匙",m:5,clues:["threeKeys"],text:"三把钥匙齿形完全不同。其中一把的磨损不像门锁造成。"}
  ]},
  {id:"theater",title:"中央剧场",teaser:"毒面具、断威亚、真子弹和碎裂镜墙。",icon:"幕",actions:[
    {id:"mask",title:"拆开银色面具",sub:"检查重缝的内衬",m:10,clues:["aconite"],text:"香料掩盖了乌头气味。残留量能使人迟缓，却不能解释淡水与肺部泡沫。"},
    {id:"wire",title:"放大检查威亚",sub:"区分磨损与新切口",m:10,clues:["cutRope","backupRope"],text:"主绳被割断；旁边却有韩九章临时加上的备用绳。一次谋杀又被另一个秘密抵消。"},
    {id:"bullet",title:"旋转舞台寻找弹头",sub:"进入外圈检修道并重建弹道",m:20,s:-4,clues:["liveBullet","mirrorWound"],text:"弹头没有进入人体。祁重楼的血来自飞散镜片，而非枪伤。"},
    {id:"habit",title:"观看下午彩排",sub:"观察控制员的确认习惯",m:10,clues:["penHabit"],text:"每次不可撤销指令前，梁音都会按一下钢笔。三段彩排，无一例外。"}
  ]},
  {id:"control",title:"舞台控制室",teaser:"三个声道、一个烧蚀开关与被覆盖的时间。",icon:"控",actions:[
    {id:"channel",title:"拆查通话器",sub:"测试三个独立声道",m:10,clues:["channels"],text:"第三声道没有坏。它被切进了控制员耳机，外放扬声器当然只剩音乐。"},
    {id:"switch",title:"检查紧急覆盖",sub:"观察开关内部触点",m:10,clues:["overrideBurn"],text:"报警本会暂停自动程序。继续旋转必须按住这里三秒，烧蚀证明有人这样做了。"},
    {id:"logs",title:"抄录电机记录",sub:"保存尚未覆盖的电流曲线",m:10,clues:["motorLog","stagePlan"],text:"00:33进水警报之后，电机仍完成一次旋转负载。"},
    {id:"tape",title:"取走提示磁带",sub:"左右声道速度异常",m:5,clues:["cueTape"],text:"左声道是音乐与提示，右声道像有一团低沉的人声。需要修复机器后分离播放。"}
  ]},
  {id:"machine",title:"下层机械区",teaser:"布景井、暴雨水槽、配重轨道与失灵排水泵。",icon:"轨",actions:[
    {id:"brake",title:"拆下两套制动片",sub:"区分破坏与中止",m:15,s:-3,clues:["brakeDamage","secondBrake"],text:"主制动被人为磨坏，但第二制动换上了韩九章零件箱里的新弹簧。"},
    {id:"rail",title:"比对轨道油脂",sub:"取样并追踪门槛残留",m:10,clues:["railSample"],text:"门槛油脂混着同样的铜屑。那扇门曾沿这套轨道移动。"},
    {id:"track",title:"复原应急配重",sub:"需要“房间移动”假说",m:20,s:-4,requiresHyp:"moving",clues:["trackMisalign"],text:"不旋转时配重可以拉回舱体；旋转后轨道横移十七厘米，救援路径被彻底切断。"},
    {id:"tank",title:"采集暴雨水槽",sub:"比对水样与底沙",m:10,clues:["tankSample","sandMatch"],text:"水槽使用淡水。槽底细沙与衣柜中残留一致。"},
    {id:"load",title:"读取发电机纸带",sub:"校正系统时间差",m:10,clues:["loadTape"],text:"负载纸带慢了四十七秒。校正后，旋转确定发生在警报之后。"},
    {id:"pump",title:"抢修排水泵",sub:"牺牲调查时间换取船体安全",m:20,repair:18,text:"你更换保险片并重新引水。船体倾斜减缓，更多物证得以保全。"}
  ]},
  {id:"archive",title:"档案与船长室",teaser:"三层图纸、双胞胎文件与二十二年前的九十秒。",icon:"档",actions:[
    {id:"plans",title:"翻查船体结构图",sub:"寻找三个“七号房”",m:10,clues:["shipPlan"],text:"船体图只画固定房间，但北向箭头附近留有一块不自然的空白。"},
    {id:"script",title:"拆开旧剧本封面",sub:"寻找第七聚光灯图",m:10,clues:["lightPlan","plagiarism"],text:"封面夹层藏着灯光图和白砚的原稿。祁重楼的署名盖住了另一个名字。"},
    {id:"identity",title:"核对出生与遗嘱文件",sub:"比对日期、地点与伪造痕迹",m:15,clues:["identity"],text:"祁越和梁音同日同地出生，都是阮明珠的孩子；祁重楼是生父。"},
    {id:"1978",title:"修复后台录音索引",sub:"重新听见被抹去的九十秒",m:20,clues:["delayTape","oldCaseParts"],text:"呼救已经传到后台。祁重楼说：先不要停，等这一幕结束——整整九十秒。"}
  ]},
  {id:"quarters",title:"客舱与剪辑室",teaser:"被藏起的药、受胁迫录像和左右颠倒的证词。",icon:"像",actions:[
    {id:"wine",title:"复原换酒录像",sub:"倒放剪辑机废片",m:15,clues:["drugWine"],text:"白砚换了酒瓶，再把药藏进梁素琴旧戏服。祁重楼只抿了一口。"},
    {id:"film",title:"校正镜像录像",sub:"扣子、反字与左手剑",m:15,clues:["reverseFilm"],text:"所谓从右侧进入其实发生在左侧。镜墙反射制造了虚假的行踪。"},
    {id:"threat",title:"查看未剪排练带",sub:"辨认自愿与胁迫",m:10,clues:["threatFilm"],text:"祁重楼用韩九章拆安全销的旧案，逼苏晚扮演他的“新缪斯”。"}
  ]},
  {id:"deck",title:"上层甲板与厨房",teaser:"取样、隔离嫌疑人，或先救下正在倾斜的船。",icon:"风",actions:[
    {id:"samples",title:"完成三组水样比对",sub:"现场、海水、蒸馏水与暴雨水",m:20,requiresAll:["waterTrace","tankSample"],clues:["freshWaterProof"],text:"试纸与蒸发结晶给出一致结果：现场是人工暴雨系统的淡水。"},
    {id:"isolate",title:"分开六名嫌疑人",sub:"阻止证词继续互相污染",m:10,flag:"isolated",text:"你把六人分别安排在上下层不同房间，并给了每人不同版本的错误时间。"},
    {id:"stabilize",title:"固定救生艇与舱门",sub:"降低风暴造成的持续损耗",m:15,repair:12,flag:"deckSecured",text:"松脱物被绑牢，水密门关闭。安全不是结局，却决定有多少真相能抵达陆地。"}
  ]}
];

const HYPOTHESES = [
  {id:"freshwater",title:"水并非从海里来",need:["dryCorridor","waterTrace"],result:"开放现场水线精查与水样来源验证。"},
  {id:"moving",title:"房间本身移动过",need:["sixBulbs","fakePort","thresholdGrease"],result:"开放地板固定结构与应急轨道复原。"},
  {id:"alive",title:"进水时死者仍清醒",need:["cable","handprints","talkButton"],result:"可以把伤害行为与直接死因分离。"},
  {id:"attempts",title:"多次加害彼此独立",needAny:["aconite","drugWine","cutRope","liveBullet","brakeDamage"],count:3,result:"五次真实加害不是同一条谋杀链。"},
  {id:"override",title:"自动程序被人工覆盖",need:["overrideBurn","motorLog","loadTape"],result:"可以追问警报后的主动旋转。"},
  {id:"oldcase",title:"1978年死于延迟救援",need:["delayTape","oldCaseParts"],result:"旧案的最终决定者不是制造坠落的人。"}
];

const INTERVIEWS = {
  liangsuqin:{claim:"“面具是我准备的。乌头会让心脏停下——不必再查别人。”",correct:"transfer",requires:["aconite","identity"],result:"她承认涂药，也承认苏晚擦掉过一部分。她的认罪在替梁音截断调查。",evidence:"梁素琴的加害已确认。",options:{open:"开放询问",contradict:"剂量质证",transfer:"转移对象：梁音"}},
  qiyue:{claim:"“我把真弹装进去，也亲眼看见他的血。我杀了他。”",correct:"contradict",requires:["liveBullet","mirrorWound","talkButton"],result:"弹头与通话按钮解除他的错误罪恶感。他交代曾看见苏晚处理威亚。",evidence:"祁越的加害已确认。",options:{open:"开放询问",contradict:"弹道与伤口质证",silence:"沉默施压"}},
  suwan:{claim:"“那根绳只是老化。我和祁重楼的关系，也轮不到侦探审判。”",correct:"transfer",requires:["cutRope","threatFilm"],result:"你证明她受胁迫而非主动炒作。她承认割绳，并要求不要把罪推给韩九章。",evidence:"苏晚的加害已确认。",options:{limited:"限定追问",contradict:"直接指控名誉",transfer:"转移对象：韩九章"}},
  han:{claim:"“主制动、第二制动、配重轨道是一套故障。外行不要拆开讲。”",correct:"technical",requires:["secondBrake","trackMisalign"],result:"他终于承认：若舞台没有继续旋转，他能把布景舱拉回。",evidence:"韩九章的破坏与中止已确认。",options:{open:"开放询问",technical:"区分四套机械",pressure:"以旧案施压"}},
  baiyan:{claim:"“六只手共同写完了一场谋杀。寻找最后一只手，只是俗套。”",correct:"contradict",requires:["drugWine","reverseFilm"],result:"你拒绝他的集体叙事。他交出删除索引，并承认下药只是想嫁祸梁素琴。",evidence:"白砚的下药与删片已确认。",options:{open:"让他完整叙事",contradict:"换瓶与镜像质证",pressure:"公开盗稿秘密"}},
  liangyin:{claim:"“下降程序早已写入。停止键当时没有亮。通话器中一直有音乐。”",correct:"false",requires:["recoveredVoice","overrideBurn","channels"],result:"你故意把求救说成“停下升降”。她脱口纠正：“他说的是停止旋转。”",evidence:"梁音听见求救并了解具体内容。",options:{open:"逐字询问",false:"错误前提诱导",pressure:"以身世施压"}}
};

const PUZZLES = [
  {id:"blueprint",title:"三层图纸",desc:"对齐三个标记，找到安全锁档案。",requires:["shipPlan","stagePlan","lightPlan"]},
  {id:"tape",title:"提示磁带",desc:"修复速度、分离声道并还原求救。",requires:["cueTape","channels"]},
  {id:"keys",title:"三个七号房",desc:"辨认三把“7”号钥匙的真正用途。",requires:["threeKeys"]},
  {id:"water",title:"水位时间",desc:"排列水线形成的三个阶段。",requires:["handprints","tankSample"]},
  {id:"timeline",title:"第七幕时间线",desc:"重建从下药到溺亡的十四个节点。",requires:[]},
  {id:"oldcase",title:"1978年的九十秒",desc:"区分制造危险与决定死亡。",requires:["delayTape","oldCaseParts"]}
];

const TIMELINE = [
  ["drug","白砚在红酒中加入镇静药"],["poison","梁素琴在面具内涂乌头"],["wire","苏晚切断主威亚"],["brake","韩九章破坏主制动"],["restore","韩九章恢复第二制动"],["bullet","祁越更换真子弹"],["fall","祁重楼坠落受伤"],["shot","枪击与镜墙破裂"],["lower","布景舱异常下降"],["call","祁重楼通过通话器求救"],["rotate","梁音确认继续旋转"],["track","应急配重轨道错位"],["drown","祁重楼溺亡"],["return","布景舱返回中层"]
];

const DEFAULT_STATE = {
  screen:"cover",resumeScreen:"prologue",investigator:"",difficulty:"normal",prologue:0,
  elapsed:0,safety:78,clues:[],visited:[],actions:[],hypotheses:[],interviews:{},puzzles:[],flags:{},errors:0,hints:0,
  report:{culprit:"",cause:"",room:"",responsibility:"",oldcase:"",harms:{}},attachments:[],disclosure:[],ending:null,startedAt:Date.now()
};

let state=loadState();
let notebookTab="clues";
let toastTimer;
let audioCtx, rainNode;

const app=document.querySelector("#app");
const topbar=document.querySelector("#topbar");
const chapterLabel=document.querySelector("#chapterLabel");
const timeLabel=document.querySelector("#timeLabel");
const clueCount=document.querySelector("#clueCount");
const notebook=document.querySelector("#notebook");
const notebookBody=document.querySelector("#notebookBody");

function freshState(){return JSON.parse(JSON.stringify(DEFAULT_STATE));}
function loadState(){try{const x=JSON.parse(localStorage.getItem(STORAGE_KEY));return x?Object.assign(freshState(),x):freshState();}catch{return freshState();}}
function saveState(message="进度已保存"){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));if(message)toast(message);}
function escapeHTML(v){return String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));}
function has(id){return state.clues.includes(id);}
function hasAll(ids=[]){return ids.every(has);}
function addClues(ids=[]){ids.forEach(id=>{if(CLUES[id]&&!has(id))state.clues.push(id);});}
function toast(text){const el=document.querySelector("#toast");el.textContent=text;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2600);}
function clock(){let total=54+state.elapsed,h=Math.floor(total/60)%24,m=total%60;return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;}
function safetyBand(){return state.safety>=70?"稳定":state.safety>=40?"受损":state.safety>0?"濒临沉没":"弃船程序";}
function difficultyFactor(){return {normal:.7,hard:1,extreme:1.35}[state.difficulty]||1;}
function advance(minutes,safetyLoss){
  state.elapsed+=minutes;
  const passive=Math.ceil(minutes/18*difficultyFactor());
  state.safety=Math.max(0,Math.min(100,state.safety-passive-(safetyLoss||0)));
  if(state.elapsed>=80&&!state.flags.isolated)state.flags.contaminated=true;
  if(state.elapsed>=150&&!state.flags.deckSecured)state.safety=Math.max(0,state.safety-2);
  if(state.safety===0)state.flags.evacuation=true;
}
function chapterName(){
  if(state.screen==="cover")return "标题";
  if(["prologue","discovery"].includes(state.screen))return "序章 · 没有观众的首演";
  const evidence=state.clues.length;
  if(evidence<10)return "第一章 · 被水淹没的密室";
  if(state.hypotheses.length<3)return "第二章 · 六种杀人方法";
  if(!state.puzzles.includes("blueprint"))return "第三章 · 三个七号房";
  if(Object.keys(state.interviews).length<5)return "第四章 · 每个人都在保护凶手";
  if(!state.puzzles.includes("oldcase"))return "第五章 · 二十二年前的九十秒";
  if(!state.puzzles.includes("tape")||!state.interviews.liangyin)return "第六章 · 第七幕";
  return "终章 · 案件报告";
}
function setScreen(screen){state.screen=screen;saveState("");render();window.scrollTo(0,0);}

function sideFile(){
  const chains=["死因","密室","加害","存活","指令","旧案"].map(name=>[name,Object.values(CLUES).filter(c=>c.chain===name).length,state.clues.filter(id=>CLUES[id]?.chain===name).length]);
  return `<aside class="side-file"><p class="eyebrow">SHIP STATUS</p><h3>${clock()} · ${safetyBand()}</h3><div class="meter"><div class="meter-label"><span>船体安全</span><b>${state.safety}%</b></div><div class="meter-track"><div class="meter-fill ${state.safety<40?'danger-fill':''}" style="width:${state.safety}%"></div></div></div>${chains.map(([n,total,g])=>`<div class="side-stat"><span>${n}</span><strong>${g}/${total}</strong></div>`).join("")}<div class="side-stat"><span>证词状态</span><strong>${state.flags.contaminated&&!state.flags.isolated?"已传播":"可追溯"}</strong></div></aside>`;
}

function render(){
  topbar.hidden=state.screen==="cover";
  chapterLabel.textContent=chapterName();timeLabel.textContent=clock();clueCount.textContent=state.clues.length;
  const map={cover:renderCover,prologue:renderPrologue,discovery:renderDiscovery,hub:renderHub,location:renderLocation,hypotheses:renderHypotheses,interviews:renderInterviews,interview:renderInterview,puzzles:renderPuzzles,puzzle:renderPuzzle,report:renderReport,ending:renderEnding};
  (map[state.screen]||renderCover)();
  app.focus({preventScroll:true});
}

function renderCover(){
  const hasSave=!!localStorage.getItem(STORAGE_KEY)&&state.resumeScreen!=="prologue";
  app.innerHTML=`<section class="cover"><div class="cover-inner"><div class="cover-seal"><span>VII</span></div><p class="eyebrow">A LOCKED ROOM AT SEA · 2000</p><h1>塞壬号</h1><p class="subtitle">第 七 幕 没 有 掌 声</p><div class="cover-quote">“不要问谁进入过房间。<br>先问房间去过哪里。”</div><form class="intake" id="startForm"><input id="nameInput" maxlength="12" placeholder="侦探署名（可留空）" value="${escapeHTML(state.investigator)}"><button class="btn" type="submit">登船调查</button></form><div class="difficulty-select" aria-label="难度选择">${[["normal","普通"],["hard","困难"],["extreme","极难"]].map(([id,n])=>`<button type="button" class="option-pill ${state.difficulty===id?'active':''}" data-difficulty="${id}">${n}</button>`).join("")}</div>${hasSave?`<button class="btn secondary" id="continueBtn">继续 ${chapterName()}</button>`:""}<p class="continue-note">约 90–150 分钟 · 自动存档 · 建议开启声音</p></div></section>`;
  document.querySelectorAll("[data-difficulty]").forEach(el=>el.addEventListener("click",()=>{state.difficulty=el.dataset.difficulty;saveState("");render();}));
  document.querySelector("#startForm").addEventListener("submit",e=>{e.preventDefault();const name=document.querySelector("#nameInput").value.trim();state=freshState();state.investigator=name||"受邀侦探";state.difficulty=document.querySelector("[data-difficulty].active")?.dataset.difficulty||"normal";state.screen="prologue";state.resumeScreen="prologue";saveState("");render();});
  document.querySelector("#continueBtn")?.addEventListener("click",()=>{state.screen=state.resumeScreen||"hub";render();});
}

function renderPrologue(){
  const pages=[
    ["2000年9月17日 · 22:18",`<p>风暴把“塞壬号”从陆地的无线电里抹去。旧邮轮中央，三层剧场正等待《第七幕》二十二年来唯一一次复演。</p><p>祁重楼在晚宴上宣布：午夜之后，他会公开阮明珠真正爱的人、她留下的两个孩子，以及1978年究竟是谁决定不去救她。</p><p class="quote">“六个人里，只有一个能继承这艘船、剧团与全部版权。”</p>`,`接受他的录音带`],
    ["23:39 · 开演前四分钟",`<p>角色卡只有六个词：妻子、儿子、女儿、情人、共犯、纵火者。</p><div class="mini-cast">${Object.values(PEOPLE).map(p=>`<span><b>${p.name}</b>${p.role}</span>`).join("")}</div><p>每个人都看过别人的卡，却没有人肯解释自己的那一张。</p>`,`记下六人的原始态度`],
    ["00:54 · 第七幕之后",`<p>第七化妆室的门在第三次撞击后向内弹开。房间灯火通明，地毯仍在向外渗水，门外走廊却完全干燥。</p><p>祁重楼倒在化妆台与房门之间。右手抓着被咬断的电线，左手按在内部通话器上。</p><p class="quote">只有梁音站在最后面。她说：“第七幕结束了。”</p>`,`进入没有掌声的第七幕`]
  ];
  const p=pages[state.prologue]||pages[0];
  app.innerHTML=`<section class="screen narrow"><div class="progress-strip">${[0,1,2].map(i=>`<span class="${i<=state.prologue?'done':''}"></span>`).join("")}<span></span></div><div class="story-panel" data-time="${p[0]}"><div class="story-text">${p[1]}</div><button class="btn story-next" id="prologueNext">${p[2]} <span>→</span></button></div></section>`;
  document.querySelector("#prologueNext").addEventListener("click",()=>{if(state.prologue<2){state.prologue++;saveState("");render();}else setScreen("discovery");});
}

function renderDiscovery(){
  app.innerHTML=`<section class="screen"><div class="chapter-head"><div><p class="eyebrow">CHAPTER 01 · THE IMPOSSIBLE ROOM</p><h2>被水淹没的密室</h2><p class="chapter-summary">先固定会变化的东西。错误顺序不会立即失败，但水迹、药物和机械记录都在消失。</p></div><div class="chapter-no">00:54</div></div><div class="story-panel" data-time="现场"><div class="story-text"><p>镜面有三条水线。衣柜底部粘着浅灰细沙。假海景已被泡得模糊。</p><p>祁越看见父亲腹部的血，脸色瞬间变白；梁素琴盯着他耳后的红斑；韩九章摸了摸门槛下的黑色油脂；白砚则看向仍在转动的摄影机。</p><p class="quote">这不是一具尸体和一扇锁住的门。是至少六种互相遮蔽的事实。</p></div><button class="btn" id="beginCase">封锁现场，开始调查</button></div></section>`;
  document.querySelector("#beginCase").addEventListener("click",()=>{addClues(["dryCorridor"]);state.resumeScreen="hub";setScreen("hub");});
}

function renderHub(){
  const interviews=Object.keys(state.interviews).length, solved=state.puzzles.length;
  app.innerHTML=`<section class="screen"><div class="chapter-head"><div><p class="eyebrow">INVESTIGATION DECK · ${clock()}</p><h2>今晚，房间去过哪里？</h2><p class="chapter-summary">调查、假说、审讯与复原会互相解锁。五次加害都是真的，但“制造危险”不等于“决定死亡”。</p></div><div class="chapter-no">${state.safety}</div></div>${state.safety<40?`<div class="ship-warning"><b>船体安全 ${state.safety}%</b><span>排水泵与水密舱门需要处理。主结论仍可成立，但证物正在流失。</span></div>`:""}<div class="case-layout"><div><div class="hub-tools"><button class="hub-tool" data-hub="hypotheses"><b>${state.hypotheses.length}/6</b><span>提出假说</span><small>用已知痕迹开启二次调查</small></button><button class="hub-tool" data-hub="interviews"><b>${interviews}/6</b><span>审讯嫌疑人</span><small>${state.flags.contaminated&&!state.flags.isolated?'证词已经开始传播':'记录原始证词并突破保护谎言'}</small></button><button class="hub-tool" data-hub="puzzles"><b>${solved}/6</b><span>复原与实验</span><small>图纸、磁带、钥匙与时间线</small></button><button class="hub-tool report-tool" data-hub="report"><b>VII</b><span>提交案件报告</span><small>可随时结案；证据不足也会形成结局</small></button></div><h3 class="section-label">可调查区域</h3><div class="location-grid">${LOCATIONS.map((loc,i)=>{const done=loc.actions.filter(a=>state.actions.includes(`${loc.id}:${a.id}`)).length;return `<button class="location-card ${done===loc.actions.length?'done':''}" data-location="${loc.id}"><span class="card-index">DECK · ${String(i+1).padStart(2,"0")} · ${done}/${loc.actions.length}</span><h3>${loc.title}</h3><p>${loc.teaser}</p><span class="card-icon">${loc.icon}</span></button>`;}).join("")}</div></div>${sideFile()}</div></section>`;
  document.querySelectorAll("[data-location]").forEach(el=>el.addEventListener("click",()=>{state.flags.activeLocation=el.dataset.location;setScreen("location");}));
  document.querySelectorAll("[data-hub]").forEach(el=>el.addEventListener("click",()=>setScreen(el.dataset.hub)));
}

function actionAvailable(a){if(a.requiresHyp&&!state.hypotheses.includes(a.requiresHyp))return false;if(a.requiresAll&&!hasAll(a.requiresAll))return false;return true;}
function renderLocation(){
  const loc=LOCATIONS.find(x=>x.id===state.flags.activeLocation)||LOCATIONS[0];
  app.innerHTML=`<section class="screen"><button class="btn secondary small" id="backHub">← 返回调查甲板</button><div class="chapter-head local-head"><div><p class="eyebrow">FIELD INVESTIGATION · ${clock()}</p><h2>${loc.title}</h2><p class="chapter-summary">${loc.teaser}</p></div><div class="chapter-no">${loc.icon}</div></div><div class="case-layout"><div><div id="actionReveal"></div><div class="action-list">${loc.actions.map(a=>{const key=`${loc.id}:${a.id}`,done=state.actions.includes(key),ok=actionAvailable(a);return `<button class="action-card ${done?'done':''}" data-action="${a.id}" ${done||!ok?'disabled':''}><span class="action-time">${a.repair?`+${a.repair} 安全`:`${a.m} 分钟`}</span><div><b>${a.title}</b><small>${done?'已完成':ok?a.sub:`尚未满足：${a.sub}`}</small></div><span>${done?'✓':'→'}</span></button>`;}).join("")}</div></div>${sideFile()}</div></section>`;
  document.querySelector("#backHub").addEventListener("click",()=>setScreen("hub"));
  document.querySelectorAll("[data-action]").forEach(el=>el.addEventListener("click",()=>performAction(loc,el.dataset.action)));
}

function performAction(loc,id){
  const a=loc.actions.find(x=>x.id===id);if(!a||!actionAvailable(a))return;
  const key=`${loc.id}:${a.id}`;if(state.actions.includes(key))return;
  state.actions.push(key);advance(a.m||0,a.s||0);if(a.repair)state.safety=Math.min(100,state.safety+a.repair);addClues(a.clues);if(a.flag)state.flags[a.flag]=true;
  saveState("");render();const reveal=document.querySelector("#actionReveal");if(reveal)reveal.innerHTML=`<div class="reveal"><p class="eyebrow">ACTION COMPLETE · ${clock()}</p><h3>${a.title}</h3><p>${a.text}</p>${(a.clues||[]).map(c=>`<span class="evidence-tag">＋ ${CLUES[c].t}</span>`).join("")}</div>`;
  if(state.safety<40)toast("风暴警告：船体安全已进入危险区");
}

function hypothesisReady(h){if(h.need&&!hasAll(h.need))return false;if(h.needAny)return h.needAny.filter(has).length>=h.count;return true;}
function renderHypotheses(){
  app.innerHTML=`<section class="screen narrow"><button class="btn secondary small" id="backHub">← 返回调查甲板</button><div class="chapter-head local-head"><div><p class="eyebrow">WORKING HYPOTHESES</p><h2>让痕迹成为调查理由</h2><p class="chapter-summary">假说不是结论。它只允许你去做此前没有理由进行的拆查、实验与追问。</p></div><div class="chapter-no">${state.hypotheses.length}/6</div></div><div class="deduction-list">${HYPOTHESES.map((h,i)=>{const done=state.hypotheses.includes(h.id),ready=hypothesisReady(h);const need=h.need||h.needAny;return `<div class="deduction ${done?'done':''}"><h3><span>HYPOTHESIS 0${i+1}</span>${h.title}</h3><p class="muted">所需线索：${need.map(id=>`${has(id)?'●':'○'} ${CLUES[id].t}`).join("　")}</p>${done?`<p>${h.result}</p>`:`<button class="btn small" data-hypothesis="${h.id}" ${!ready?'disabled':''}>${ready?'提出并记录':'证据尚不足'}</button>`}</div>`;}).join("")}</div></section>`;
  document.querySelector("#backHub").addEventListener("click",()=>setScreen("hub"));
  document.querySelectorAll("[data-hypothesis]").forEach(el=>el.addEventListener("click",()=>{state.hypotheses.push(el.dataset.hypothesis);advance(5);saveState("");render();toast("假说已记录，新的精查方式可能已开放");}));
}

function interviewPollution(id){return state.flags.contaminated&&!state.flags.isolated&&id!=="qiyue";}
function renderInterviews(){
  app.innerHTML=`<section class="screen"><button class="btn secondary small" id="backHub">← 返回调查甲板</button><div class="chapter-head local-head"><div><p class="eyebrow">TESTIMONY ROOM · ${clock()}</p><h2>每个人都在保护凶手</h2><p class="chapter-summary">错误证词可能是谎言、隐瞒、保护、误判或知识泄漏。高压力不等于更多真话。</p></div><div class="chapter-no">${Object.keys(state.interviews).length}/6</div></div>${state.flags.contaminated&&!state.flags.isolated?`<div class="ship-warning testimony-warning"><b>证词已传播</b><span>除祁越的第一份口供外，新增“听见”“看见”不再自动算独立证明。仍可在甲板隔离众人。</span></div>`:""}<div class="suspect-grid">${Object.entries(PEOPLE).map(([id,p])=>`<button class="suspect-card ${state.interviews[id]?.broken?'done':''}" data-person="${id}"><span class="card-index">${p.age}岁 · ${p.role}</span><h3>${p.name}</h3><p>${state.interviews[id]?.broken?INTERVIEWS[id].result:p.desc}</p><div class="suspect-meta"><span>保护：${p.protect}</span>${interviewPollution(id)?"<span>传播后证词</span>":"<span>原始证词</span>"}</div></button>`).join("")}</div></section>`;
  document.querySelector("#backHub").addEventListener("click",()=>setScreen("hub"));
  document.querySelectorAll("[data-person]").forEach(el=>el.addEventListener("click",()=>{state.flags.activePerson=el.dataset.person;setScreen("interview");}));
}

function renderInterview(){
  const id=state.flags.activePerson,p=PEOPLE[id],cfg=INTERVIEWS[id],rec=state.interviews[id]||{attempts:0,alert:0,pressure:0,broken:false};state.interviews[id]=rec;
  const req=cfg.requires.map(x=>`${has(x)?'●':'○'} ${CLUES[x].t}`).join("　");
  app.innerHTML=`<section class="screen narrow"><button class="btn secondary small" id="backInterviews">← 返回审讯列表</button><div class="dialogue" style="margin-top:28px"><div class="speaker"><div class="portrait">${p.glyph}</div><div class="speech"><b>${p.name} · ${rec.broken?'被证据修正后的证词':interviewPollution(id)?'传播后证词':'原始证词'}</b><p>${rec.broken?cfg.result:cfg.claim}</p></div></div>${rec.broken?`<div class="reveal"><p class="eyebrow">TESTIMONY BROKEN</p><h3>${cfg.evidence}</h3><p>${cfg.result}</p></div>`:`<div class="puzzle-board"><p class="puzzle-instruction">选择审讯方式。证据条件：${req}</p><div class="approach-grid">${Object.entries(cfg.options).map(([key,label])=>`<button class="approach" data-technique="${key}"><b>${label}</b><small>${techniqueHelp(key)}</small></button>`).join("")}</div><div class="interview-meters"><span>警觉 ${rec.alert}/3</span><span>压力 ${rec.pressure}/3</span><span>尝试 ${rec.attempts}</span></div></div>`}</div></section>`;
  document.querySelector("#backInterviews").addEventListener("click",()=>setScreen("interviews"));
  document.querySelectorAll("[data-technique]").forEach(el=>el.addEventListener("click",()=>resolveInterview(id,el.dataset.technique)));
}
function techniqueHelp(k){return {open:"不给时间与证据，让对方自由叙述。",contradict:"同时出示可以互相验证的物证。",transfer:"声称对方保护的人即将承担罪名。",silence:"回答后不继续追问。",limited:"限定地点、时段和具体动作。",technical:"区分主制动、第二制动、配重与旋转轨道。",pressure:"提高压力，可能得到虚假认罪。",false:"故意说错求救内容，观察是否纠正。"}[k]||"观察对方如何改变叙事。";}
function resolveInterview(id,tech){
  const cfg=INTERVIEWS[id],rec=state.interviews[id];rec.attempts++;advance(15);if(tech==="pressure")rec.pressure++;else rec.alert++;
  if(tech===cfg.correct&&hasAll(cfg.requires)){rec.broken=true;rec.status="corrected";if(id==="liangyin")addClues(["knowledgeLeak"]);state.flags[`harm_${id}`]=true;saveState("");render();toast("证词已由物证修正");return;}
  state.errors++;saveState("");render();
  if(id==="liangsuqin"&&rec.pressure>=2)toast("她开始完整认罪——但她的死因解释不了房间里的水");
  else if(tech===cfg.correct)toast("方法正确，但你还没有足够物证阻止她改口");
  else toast(rec.alert>=3?"警觉过高：对方开始按你出示的线索修补证词":"这次回答增加了压力，却没有突破保护对象");
}

function puzzleReady(p){return hasAll(p.requires);}
function renderPuzzles(){
  app.innerHTML=`<section class="screen"><button class="btn secondary small" id="backHub">← 返回调查甲板</button><div class="chapter-head local-head"><div><p class="eyebrow">RECONSTRUCTION TABLE</p><h2>实验、复原与交叉比对</h2><p class="chapter-summary">正确答案只是推论；完成物理复原，推论才能进入最终报告。</p></div><div class="chapter-no">${state.puzzles.length}/6</div></div><div class="location-grid">${PUZZLES.map((p,i)=>{const done=state.puzzles.includes(p.id),ready=puzzleReady(p);return `<button class="location-card ${done?'done':''}" data-puzzle="${p.id}" ${!ready?'disabled':''}><span class="card-index">EXPERIMENT · 0${i+1}</span><h3>${p.title}</h3><p>${done?'复原完成，可作为独立证据。':ready?p.desc:`缺少：${p.requires.filter(x=>!has(x)).map(x=>CLUES[x].t).join("、")}`}</p><span class="card-icon">${i+1}</span></button>`;}).join("")}</div></section>`;
  document.querySelector("#backHub").addEventListener("click",()=>setScreen("hub"));
  document.querySelectorAll("[data-puzzle]").forEach(el=>el.addEventListener("click",()=>{state.flags.activePuzzle=el.dataset.puzzle;setScreen("puzzle");}));
}

function completePuzzle(id,clues=[]){if(!state.puzzles.includes(id))state.puzzles.push(id);addClues(clues);advance(id==="timeline"?25:20,id==="timeline"?3:1);delete state.flags.puzzleAnswers;saveState("");setScreen("puzzles");toast("复原完成，证据链已更新");}
function renderPuzzle(){
  const id=state.flags.activePuzzle;if(state.puzzles.includes(id)){setScreen("puzzles");return;}
  const head=`<button class="btn secondary small" id="backPuzzles">← 返回复原桌</button>`;
  if(id==="blueprint")renderSelectPuzzle(head,"三层图纸","分别选择正确对齐标记。空白区域会给出档案柜坐标。",[
    ["船体图基准",[["north","北向箭头"],["bow","船首线"],["water","水线"]]],["灯光图基准",[["seven","第七聚光灯"],["one","第一聚光灯"],["curtain","幕线"]]],["舞台图基准",[["red","红色中心点"],["door","演员入口"],["pit","乐池"]]]],["north","seven","red"],()=>completePuzzle("blueprint",["lockManual"]));
  else if(id==="tape")renderSelectPuzzle(head,"提示磁带速度谜题","还原低八度右声道，不要把设备问题误判为人为变声。",[
    ["机械",[["wheel","修复速度轮"],["rewind","直接倒放"],["splice","剪开磁带"]]],["输出",[["right","单独输出右声道"],["left","只听左声道"],["mono","混合为单声道"]]],["速度",[["half","半速播放"],["normal","正常播放"],["double","双倍播放"]]]],["wheel","right","half"],()=>completePuzzle("tape",["recoveredVoice"]));
  else if(id==="keys")renderSelectPuzzle(head,"三个七号房","把三把钥匙与真正用途对应。",[
    ["细齿黄铜钥匙",[["fixed","固定化妆室"],["prop","道具仓"],["brake","手动制动"]]],["短柄钢钥匙",[["prop","道具仓"],["fixed","固定化妆室"],["brake","手动制动"]]],["三角孔钥匙",[["brake","手动制动"],["fixed","固定化妆室"],["prop","道具仓"]]]],["fixed","prop","brake"],()=>completePuzzle("keys"));
  else if(id==="water")renderSequence(head,"水位时间谜题","按三条水线形成的先后顺序排列。",[["fill","水槽进水：水平水线持续升高"],["tilt","舞台旋转：舱体倾斜形成斜水线"],["drain","舱体回升：排水停顿形成第三线"]],["fill","tilt","drain"],()=>completePuzzle("water"));
  else if(id==="timeline")renderSequence(head,"第七幕时间线","从下药到房间返回中层，排列十四个关键节点。",TIMELINE,TIMELINE.map(x=>x[0]),()=>completePuzzle("timeline"));
  else renderSequence(head,"1978年的九十秒","先排列三次制造危险，再指出哪一个决定让死亡不可逆。",[["pin","韩九章拆除二级安全销"],["fire","白砚提前触发焰火"],["door","梁素琴移动后台门"],["delay","祁重楼听见呼救后命令继续九十秒"]],["pin","fire","door","delay"],()=>completePuzzle("oldcase"));
}

function renderSelectPuzzle(head,title,instruction,groups,answers,onDone){
  const picked=state.flags.puzzleAnswers||[];state.flags.puzzleAnswers=picked;
  app.innerHTML=`<section class="screen narrow">${head}<div class="puzzle-board" style="margin-top:24px"><p class="eyebrow">MECHANICAL RECONSTRUCTION</p><h2>${title}</h2><p class="puzzle-instruction">${instruction}</p>${groups.map((g,i)=>`<div class="deduction"><h3><span>0${i+1}</span>${g[0]}</h3><div class="option-row">${g[1].map(([v,l])=>`<button class="option-pill ${picked[i]===v?'active':''}" data-pick-index="${i}" data-pick-value="${v}">${l}</button>`).join("")}</div></div>`).join("")}<div class="puzzle-actions"><button class="btn" id="checkPuzzle" ${picked.filter(Boolean).length<answers.length?'disabled':''}>验证复原</button><button class="btn secondary" id="hintPuzzle">观察物理标记</button></div></div></section>`;
  bindPuzzleBack();document.querySelectorAll("[data-pick-index]").forEach(el=>el.addEventListener("click",()=>{picked[+el.dataset.pickIndex]=el.dataset.pickValue;saveState("");render();}));
  document.querySelector("#hintPuzzle").addEventListener("click",()=>{state.hints++;saveState("");toast("不要按图纸标题对齐；寻找三个在不同系统里都不会改变的基准");});
  document.querySelector("#checkPuzzle").addEventListener("click",()=>{if(answers.every((x,i)=>picked[i]===x))onDone();else{state.errors++;saveState("");toast("组合不能解释全部标记，再检查方向与机械用途");}});
}
function renderSequence(head,title,instruction,events,correct,onDone){
  const selected=state.flags.puzzleAnswers||[];state.flags.puzzleAnswers=selected;const scrambled=[...events].sort((a,b)=>((a[0].charCodeAt(0)*7)%13)-((b[0].charCodeAt(0)*7)%13));
  app.innerHTML=`<section class="screen narrow">${head}<div class="puzzle-board" style="margin-top:24px"><p class="eyebrow">RECONSTRUCTION</p><h2>${title}</h2><p class="puzzle-instruction">${instruction}</p><div class="sequence">${selected.map((id,i)=>`<button class="event-card" data-remove="${id}" data-order="${i+1}">${events.find(x=>x[0]===id)[1]}</button>`).join("")}</div><div class="card-bank">${scrambled.map(e=>`<button class="event-card ${selected.includes(e[0])?'selected':''}" data-add="${e[0]}">${e[1]}</button>`).join("")}</div><div class="puzzle-actions"><button class="btn" id="checkPuzzle" ${selected.length!==events.length?'disabled':''}>验证顺序</button><button class="btn secondary" id="hintPuzzle">获得提示</button></div></div></section>`;
  bindPuzzleBack();document.querySelectorAll("[data-add]").forEach(el=>el.addEventListener("click",()=>{if(!selected.includes(el.dataset.add))selected.push(el.dataset.add);saveState("");render();}));document.querySelectorAll("[data-remove]").forEach(el=>el.addEventListener("click",()=>{state.flags.puzzleAnswers=selected.filter(x=>x!==el.dataset.remove);saveState("");render();}));
  document.querySelector("#hintPuzzle").addEventListener("click",()=>{state.hints++;saveState("");toast(idHint(state.flags.activePuzzle));});
  document.querySelector("#checkPuzzle").addEventListener("click",()=>{if(correct.every((x,i)=>selected[i]===x))onDone();else{state.errors++;saveState("");toast("顺序仍有断裂：区分演出前准备、受伤、进水、求救和回升");}});
}
function idHint(id){return id==="water"?"倾斜水线只能出现在水平上升之后，排水停顿一定最后发生":id==="oldcase"?"前三项制造灾难，最后一项才决定不救":"镇静药最早；求救发生在进水后、旋转前；溺亡早于房间回升";}
function bindPuzzleBack(){document.querySelector("#backPuzzles").addEventListener("click",()=>{delete state.flags.puzzleAnswers;setScreen("puzzles");});}

const REPORT_OPTIONS={
  culprit:[["liangyin","梁音"],["han","韩九章"],["qiyue","祁越"],["liangsuqin","梁素琴"],["collective","六人共同"],["accident","设备事故"]],
  cause:[["drowning","淡水溺亡"],["poison","乌头中毒"],["bullet","枪伤失血"],["fall","坠落内伤"],["sedative","镇静药过量"]],
  room:[["moving","第七号布景舱下降后回升"],["locked","凶手离开后用线反锁"],["flood","暴雨经通风口灌入"],["fake","尸体被事后搬入"]],
  responsibility:[["override","警报后主动覆盖并旋转，阻断救援"],["brake","破坏主制动导致下降"],["shot","更换真弹造成流血"],["group","所有危险累积，无最后决定者"]],
  oldcase:[["delay","祁重楼听见呼救后延迟九十秒"],["han","韩九章拆除安全销"],["baiyan","白砚提前焰火"],["accident","无法预见的设备事故"]]
};
const HARM_LABELS={liangsuqin:"面具乌头",qiyue:"更换真弹",suwan:"割断威亚",han:"破坏主制动后恢复副制动",baiyan:"镇静药并删除录像",liangyin:"紧急覆盖与旋转"};

function renderReport(){
  const r=state.report;
  app.innerHTML=`<section class="screen"><button class="btn secondary small" id="backHub">← 暂不结案</button><div class="chapter-head local-head"><div><p class="eyebrow">FINAL CASE REPORT · ${clock()}</p><h2>提交完整案件报告</h2><p class="chapter-summary">主结局由结论与证据充分度决定。私人秘密只修正后日谈，不会替错误推理开脱。</p></div><div class="chapter-no">VII</div></div><div class="report-grid"><div class="report-main">${reportField("culprit","最终责任人",REPORT_OPTIONS.culprit,r.culprit)}${reportField("cause","直接死因",REPORT_OPTIONS.cause,r.cause)}${reportField("room","密室原理",REPORT_OPTIONS.room,r.room)}${reportField("responsibility","使死亡不可逆的决定",REPORT_OPTIONS.responsibility,r.responsibility)}${reportField("oldcase","1978年最终责任",REPORT_OPTIONS.oldcase,r.oldcase)}<div class="deduction"><h3><span>REPORT 06</span>六人的加害行为</h3><p class="muted">勾选你已能用证据解释的行为；不要把“可能致命”混同“直接杀人”。</p><div class="harm-list">${Object.entries(HARM_LABELS).map(([id,label])=>`<label><input type="checkbox" data-harm="${id}" ${r.harms[id]?'checked':''}><span><b>${PEOPLE[id].name}</b>${label}</span></label>`).join("")}</div></div><div class="deduction"><h3><span>REPORT 07</span>证据附件</h3><p class="muted">最多附八项。核心结论至少需要死因、存活、人工覆盖和救援失效四种不同证明。</p><div class="attachment-grid">${state.clues.filter(id=>CLUES[id].stage>=4).map(id=>`<button class="option-pill ${state.attachments.includes(id)?'active':''}" data-attachment="${id}">${CLUES[id].t}</button>`).join("")||"<p class='muted'>尚无达到证据等级的线索。</p>"}</div></div><div class="deduction"><h3><span>EPILOGUE</span>私人秘密公开范围</h3><div class="option-row">${[["identity","双胞胎身份"],["relationship","梁素琴与白砚关系"],["threat","苏晚受胁迫"],["plagiarism","盗用白砚作品"],["letters","阮明珠私人信件"]].map(([id,l])=>`<button class="option-pill ${state.disclosure.includes(id)?'active':''}" data-disclosure="${id}">${l}</button>`).join("")}</div></div><button class="btn danger report-submit" id="submitReport" ${![r.culprit,r.cause,r.room,r.responsibility,r.oldcase].every(Boolean)?'disabled':''}>封存并宣读案件报告</button></div>${sideFile()}</div></section>`;
  document.querySelector("#backHub").addEventListener("click",()=>setScreen("hub"));
  document.querySelectorAll("[data-report]").forEach(el=>el.addEventListener("click",()=>{r[el.dataset.report]=el.dataset.value;saveState("");render();}));
  document.querySelectorAll("[data-harm]").forEach(el=>el.addEventListener("change",()=>{r.harms[el.dataset.harm]=el.checked;saveState("");}));
  document.querySelectorAll("[data-attachment]").forEach(el=>el.addEventListener("click",()=>{const id=el.dataset.attachment;if(state.attachments.includes(id))state.attachments=state.attachments.filter(x=>x!==id);else if(state.attachments.length<8)state.attachments.push(id);else return toast("证据附件最多八项，请删去较弱的一项");saveState("");render();}));
  document.querySelectorAll("[data-disclosure]").forEach(el=>el.addEventListener("click",()=>{const id=el.dataset.disclosure;state.disclosure=state.disclosure.includes(id)?state.disclosure.filter(x=>x!==id):[...state.disclosure,id];saveState("");render();}));
  document.querySelector("#submitReport").addEventListener("click",submitReport);
}
function reportField(id,label,options,value){return `<div class="deduction"><h3><span>REPORT</span>${label}</h3><div class="option-row">${options.map(([v,l])=>`<button class="option-pill ${value===v?'active':''}" data-report="${id}" data-value="${v}">${l}</button>`).join("")}</div></div>`;}

function submitReport(){
  const r=state.report,harmCount=Object.values(r.harms).filter(Boolean).length;
  const coreAttachments=["freshWaterProof","recoveredVoice","overrideBurn","trackMisalign"].filter(x=>state.attachments.includes(x)).length;
  let type;
  if(r.culprit==="han")type="C";else if(r.culprit==="qiyue")type="D";else if(r.culprit==="liangsuqin")type="E";else if(r.culprit==="collective")type="F";else if(r.culprit==="accident")type="G";
  else if(r.culprit==="liangyin"){
    const core=r.cause==="drowning"&&r.room==="moving"&&r.responsibility==="override";
    if(!core||coreAttachments<3)type="B";
    else if(r.oldcase!=="delay"||!state.puzzles.includes("oldcase"))type="H";
    else if(harmCount>=4&&coreAttachments===4&&state.puzzles.includes("timeline"))type="A";
    else type="B";
  }else type="G";
  state.ending=type;state.screen="ending";state.resumeScreen="ending";saveState("");render();
}

const ENDINGS={
  A:{rank:"A",title:"最后的谢幕",lead:"完整破案",copy:["你没有把六次加害揉成一个方便的集体罪名。镇静药、乌头、断绳、真弹与主制动破坏制造了危险；梁音却是在确认祁重楼仍然活着之后，主动按住覆盖开关，让舞台继续旋转。","韩九章承认，不旋转时应急配重可以拉回布景舱。求救录音、开关烧蚀、校时记录和错位轨道闭合了证据链。梁音无法再躲进字面真话里。","1978年的后台录音也被重新封存：祁重楼没有制造最初坠落，却命令所有人等待九十秒。二十二年前与今晚，真正的罪都发生在有人有能力停下，却决定让演出继续的时刻。"]},
  B:{rank:"B",title:"无人作证",lead:"真相正确，证据不足",copy:["你的结论指向梁音，淡水与移动布景舱也基本成立。但证据附件无法同时证明她听见求救、主动覆盖以及旋转阻断了救援。","官方只能把死亡写成多人的舞台破坏共同造成的事故。你知道最后是谁按下确认键，却没能把推理变成可以成立的证明。"]},
  C:{rank:"C",title:"房间坠落之后",lead:"错误指认韩九章",copy:["韩九章承认破坏主制动，也承认让布景舱坠入水槽。他没有说自己后来恢复了第二制动。","你查清是谁让房间掉下去，却没有查清是谁不让它回来。韩九章替苏晚和梁音承担了机械责任。"]},
  D:{rank:"D",title:"没有击中的子弹",lead:"错误指认祁越",copy:["祁越完整认罪。他相信血来自自己射出的真弹，梁音没有纠正。","后续尸检没有在体内找到弹头。你抓住了一个真正想杀人的人，却没有找到决定死亡的人。"]},
  E:{rank:"E",title:"王后的面具",lead:"错误指认梁素琴",copy:["梁素琴用近乎宽慰的神情承担毒杀罪名。乌头能解释耳后红斑和迟缓，却解释不了淡水、房间移动与警报后的旋转。","她的认罪成功把调查挡在梁音之前。"]},
  F:{rank:"C",title:"六个人的手",lead:"集体责任",copy:["媒体把案件写成六人合谋：每个人都碰过机器，每个人都想让祁重楼死。","你找到了每一只移动过道具的手，却没有找到最后按下确认键的人。梁音的主动指令消失在集体罪责里。"]},
  G:{rank:"D",title:"导演的遗作",lead:"事故结论",copy:["死亡被认定为设备老化与违规复演造成的事故。那些确实存在的加害行为，也因彼此遮蔽而没有形成可靠结论。","祁重楼提前拍摄的影像被剪成遗作上映。公众仍把他视为伟大导演——他最后一次操纵获得成功。"]},
  H:{rank:"B",title:"第二次谢幕",lead:"新案已解，旧案未明",copy:["梁音因警报后的主动覆盖接受调查，塞壬号的移动密室也被完整复原。","但祁重楼仍被公众视为1978年事故的受害者。梁音在审判中说：你证明了我为什么有罪，却没有证明他为什么站在这里。"]}
};

function renderEnding(){
  const e=ENDINGS[state.ending]||ENDINGS.G;
  const disclosure=state.disclosure.length<=1?"密封报告保护了大部分私人身份。":state.disclosure.length<=3?"旧案与犯罪动机有限公开，幸存者仍保有部分私人生活。":"全部秘密进入公共档案，真相最完整，幸存者的关系也被彻底撕开。";
  const ship=state.safety>=70?"塞壬号被拖回港口，原始物证完整抵达陆地。":state.safety>=40?"剧场永久报废，部分机械记录被水毁，幸存者证词变得更加重要。":state.safety>0?"对质后众人紧急撤离，塞壬号沉入海中；你的复制磁带与笔记成为主要证物。":"弃船警报吞没了最后的对质。你只能在救生艇上选择先保存证物，还是先救援受困者。";
  app.innerHTML=`<section class="ending"><div class="ending-mark">${e.rank}</div><p class="eyebrow">CASE CLOSED · ${clock()}</p><h1>${e.title}</h1><p class="ending-subtitle">${e.lead}</p><div class="ending-copy">${e.copy.map(x=>`<p>${x}</p>`).join("")}<hr><p><b>秘密公开：</b>${disclosure}</p><p><b>船体后日谈：</b>${ship}</p></div><div class="ending-stats"><div><b>${state.clues.length}</b><small>线索</small></div><div><b>${state.hypotheses.length}</b><small>假说</small></div><div><b>${Object.keys(state.interviews).filter(id=>state.interviews[id].broken).length}</b><small>证词突破</small></div><div><b>${state.safety}</b><small>安全度</small></div></div><div class="cover-actions"><button class="btn" id="returnCase">返回结案前</button><button class="btn secondary" id="shareEnding">复制结局摘要</button><button class="btn secondary" id="newGame">重新登船</button></div></section>`;
  document.querySelector("#returnCase").addEventListener("click",()=>{state.ending=null;setScreen("report");});
  document.querySelector("#shareEnding").addEventListener("click",async()=>{const text=`我在《塞壬号：第七幕没有掌声》中达成「${e.title}」：${e.lead}。船体安全 ${state.safety}%。`;try{await navigator.clipboard.writeText(text);toast("结局摘要已复制");}catch{toast(text);}});
  document.querySelector("#newGame").addEventListener("click",()=>{if(confirm("重新开始会覆盖当前自动存档，确定吗？")){state=freshState();localStorage.removeItem(STORAGE_KEY);render();}});
}

function renderNotebook(){
  document.querySelectorAll("[data-notebook-tab]").forEach(x=>x.classList.toggle("active",x.dataset.notebookTab===notebookTab));
  if(notebookTab==="clues")notebookBody.innerHTML=state.clues.length?state.clues.map((id,i)=>`<div class="note-item"><span class="num">${String(i+1).padStart(2,"0")}</span><div><b>${CLUES[id].t}</b><p>${CLUES[id].d}</p><span class="note-stage">${["","痕迹","信息","关联","解释","证据"][CLUES[id].stage]} · ${CLUES[id].chain}</span></div></div>`).join(""):`<div class="empty-note">案卷还是空的。<br>先封存现场。</div>`;
  else if(notebookTab==="chains")notebookBody.innerHTML=["死因","密室","加害","存活","指令","旧案"].map(name=>{const all=Object.keys(CLUES).filter(id=>CLUES[id].chain===name),got=all.filter(has);return `<div class="chain-note"><b>${name}</b><span>${got.length}/${all.length}</span><div class="meter-track"><div class="meter-fill" style="width:${Math.round(got.length/all.length*100)}%"></div></div><p>${got.filter(id=>CLUES[id].stage>=4).map(id=>CLUES[id].t).join(" · ")||"尚无可用于最终报告的证据"}</p></div>`;}).join("");
  else if(notebookTab==="people")notebookBody.innerHTML=Object.entries(PEOPLE).map(([id,p],i)=>`<div class="note-item"><span class="num">0${i+1}</span><div><b>${p.name} · ${p.role}</b><p>${p.desc}<br>保护对象：${p.protect}<br>${state.interviews[id]?.broken?"证词已被物证修正":interviewPollution(id)?"传播后证词，独立性受损":"原始证词可追溯"}</p></div></div>`).join("");
  else notebookBody.innerHTML=TIMELINE.map((e,i)=>`<div class="note-item"><span class="num">${String(i+1).padStart(2,"0")}</span><div><b>${state.puzzles.includes("timeline")?e[1]:i<4?e[1]:"时间尚待重建"}</b><p>${state.puzzles.includes("timeline")?"已由物证、记录与证词交叉确认":"完成第七幕时间线复原后固定"}</p></div></div>`).join("");
}

function toggleAudio(){
  const btn=document.querySelector("#soundBtn");if(audioCtx){audioCtx.close();audioCtx=null;btn.textContent="♬";toast("环境音已关闭");return;}
  audioCtx=new (window.AudioContext||window.webkitAudioContext)();const bufferSize=2*audioCtx.sampleRate,buffer=audioCtx.createBuffer(1,bufferSize,audioCtx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<bufferSize;i++)data[i]=(Math.random()*2-1)*.22;rainNode=audioCtx.createBufferSource();rainNode.buffer=buffer;rainNode.loop=true;const filter=audioCtx.createBiquadFilter();filter.type="lowpass";filter.frequency.value=680;const gain=audioCtx.createGain();gain.gain.value=.035;rainNode.connect(filter).connect(gain).connect(audioCtx.destination);rainNode.start();btn.textContent="◼";toast("风暴环境音已开启");
}

document.querySelector("#clueBtn").addEventListener("click",()=>{renderNotebook();notebook.showModal();});
document.querySelector("#closeNotebook").addEventListener("click",()=>notebook.close());
document.querySelectorAll("[data-notebook-tab]").forEach(el=>el.addEventListener("click",()=>{notebookTab=el.dataset.notebookTab;renderNotebook();}));
document.querySelector("#saveBtn").addEventListener("click",()=>saveState());
document.querySelector("#soundBtn").addEventListener("click",toggleAudio);
const pauseMenu=document.querySelector("#pauseMenu");
document.querySelector("#homeBtn").addEventListener("click",()=>{document.querySelector("#pauseChapter").textContent=`${chapterName()} · ${clock()} · 船体安全 ${state.safety}%`;pauseMenu.showModal();});
document.querySelector("#resumeBtn").addEventListener("click",()=>pauseMenu.close());
document.querySelector("#pauseClueBtn").addEventListener("click",()=>{pauseMenu.close();renderNotebook();notebook.showModal();});
document.querySelector("#pauseSaveBtn").addEventListener("click",()=>saveState());
document.querySelector("#titleBtn").addEventListener("click",()=>{state.resumeScreen=state.screen;state.screen="cover";pauseMenu.close();saveState("");render();});
document.querySelector("#restartBtn").addEventListener("click",()=>{if(confirm("重新开始会覆盖当前自动存档，确定吗？")){state=freshState();localStorage.removeItem(STORAGE_KEY);pauseMenu.close();render();}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&notebook.open)notebook.close();if(e.key.toLowerCase()==="n"&&!notebook.open&&!pauseMenu.open&&state.screen!=="cover"){renderNotebook();notebook.showModal();}});

render();
