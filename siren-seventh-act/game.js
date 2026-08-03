"use strict";

const STORAGE_KEY = "siren-seventh-act-save-v9";
const LEGACY_V8_STORAGE_KEY = "siren-seventh-act-save-v8";
const LEGACY_V7_STORAGE_KEY = "siren-seventh-act-save-v7";
const LEGACY_V6_STORAGE_KEY = "siren-seventh-act-save-v6";
const LEGACY_V5_STORAGE_KEY = "siren-seventh-act-save-v5";
const LEGACY_V4_STORAGE_KEY = "siren-seventh-act-save-v4";
const LEGACY_STORAGE_KEY = "siren-seventh-act-save-v2";
const LEGACY_V3_STORAGE_KEY = "siren-seventh-act-save-v3";
const META_STORAGE_KEY = "siren-seventh-act-meta";

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
  gunRegistry:{t:"枪柜弹药编号",d:"舞台枪少了一发空包弹，却多出一枚与祁越领取记录相邻的实弹编号。",chain:"加害",stage:4},
  mirrorImpact:{t:"镜墙撞击点",d:"弹孔与反射裂纹指向外圈检修道，射线没有穿过死者站位。",chain:"加害",stage:4},
  glassPowder:{t:"伤口玻璃粉",d:"创缘内只有镜面镀银玻璃粉，没有弹头金属或火药灼伤。",chain:"加害",stage:4},
  brakeDamage:{t:"主制动人为磨削",d:"所谓金属疲劳下藏着新鲜的锉削纹。",chain:"加害",stage:3},
  secondBrake:{t:"第二制动新弹簧",d:"韩九章先破坏主制动，后来又恢复副制动。",chain:"加害",stage:4},
  springMissing:{t:"零件箱缺失弹簧",d:"韩九章的封签零件箱少了一枚与副制动规格相同的新弹簧。",chain:"加害",stage:4},
  maintenanceLog:{t:"副制动维修记录",d:"演出前二十分钟，副制动测试从失效改为通过，签名栏却被撕去。",chain:"加害",stage:4},
  freshBrakeOil:{t:"第二制动表面新油",d:"副制动轴套上是尚未氧化的装配油，证明它刚被拆装恢复。",chain:"加害",stage:4},
  recoverySketch:{t:"应急回收手绘路线",d:"韩九章标出了不旋转时仍可拉回布景舱的配重路线和隐藏手轮。",chain:"指令",stage:4},
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
  propagationTrace:{t:"错误时间传播追踪",d:"两版错误时间被分别投放，梁音复述了只交给其中一人的版本。",chain:"存活",stage:4},
  identity:{t:"双胞胎身份文件",d:"祁越与梁音是阮明珠和祁重楼的双胞胎。",chain:"旧案",stage:4},
  threatFilm:{t:"受胁迫排练录像",d:"祁重楼以1978年事故威胁苏晚配合暧昧宣传。",chain:"旧案",stage:4},
  reverseFilm:{t:"镜像删除录像",d:"扣子、反字与左手持剑证明画面方向被反转。",chain:"加害",stage:4},
  delayTape:{t:"1978年后台录音",d:"阮明珠呼救后，祁重楼命令演出继续九十秒。",chain:"旧案",stage:5},
  oldCaseParts:{t:"旧案三重过失",d:"安全销拆除、焰火提前、后台门移动共同制造灾难。",chain:"旧案",stage:4},
  plagiarism:{t:"未署名剧本",d:"祁重楼的代表作建立在白砚未署名文本上。",chain:"旧案",stage:3},
  scenePhotos:{t:"现场封存照片",d:"水线、灯具、门锁与尸体姿态均已在变化前固定。",chain:"死因",stage:5},
  relationshipEvidence:{t:"往来汇款与合照",d:"白砚与梁素琴维持了十余年的秘密关系。",chain:"旧案",stage:4},
  mingzhuLetters:{t:"阮明珠的私人信件",d:"她准备离开祁重楼，并明确写下双胞胎的生父身份。",chain:"旧案",stage:4},
  needleThread:{t:"面具夹层缝线与指纹",d:"重缝针脚内侧留下梁素琴的指纹与她惯用的银灰丝线。",chain:"加害",stage:4},
  winePuncture:{t:"酒瓶软木塞针孔",d:"针孔角度证明药物在晚宴换瓶后被注入，而不是酒庄污染。",chain:"加害",stage:4},
  sedativeVial:{t:"镇静剂药瓶来源",d:"空药瓶批号指向白砚私人制片医药箱的领用记录。",chain:"加害",stage:4},
  deletionIndex:{t:"剪辑机删除索引",d:"正式影像虽已损失，删除扇区仍保留白砚账号与换瓶片段的时间戳。",chain:"加害",stage:4},
  costumeCache:{t:"旧戏服藏药位置",d:"药瓶纤维与梁素琴旧戏服暗袋吻合，暗袋外侧却留下白砚的蜡封。",chain:"加害",stage:4},
  riggingKnife:{t:"索具刀刃口微痕",d:"苏晚索具刀的缺口与断绳切面微痕逐点吻合。",chain:"加害",stage:4},
  gloveAconite:{t:"手套内侧乌头残留",d:"梁素琴演出手套内侧检出与面具夹层相同配比的乌头油膏。",chain:"加害",stage:4},
  ropeFibers:{t:"手套中的威亚纤维",d:"苏晚换装手套缝隙中嵌有主威亚的新鲜切割纤维。",chain:"加害",stage:4},
  relativeTimeline:{t:"相对时间问询表",d:"两名嫌疑人的最后见面回答固定了若干事件的相对先后。",chain:"加害",stage:3},
  locationMatrix:{t:"人物位置核验表",d:"两份独立位置回答排除了一组不可能同时成立的控制室行踪。",chain:"密室",stage:3},
  soundComparison:{t:"异常声音交叉证言",d:"两名被隔离者分别描述警报后的电机与轨道声，形成独立证言来源。",chain:"存活",stage:3}
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
    {id:"body",title:"检查尸体与通话器",sub:"口鼻、伤口、手指与断线",m:10,clues:["foam","cable","talkButton","glassPowder"],text:"祁重楼咬断了电线；通话按钮上有他仍在流血时留下的指纹。腹部创缘只有镜墙玻璃粉，没有弹头金属。"},
    {id:"room",title:"比对房间陈设",sub:"灯、窗、地毯与衣柜",m:10,clues:["sixBulbs","fakePort","thresholdGrease"],text:"窗不是窗。六枚灯也不是维修疏漏：这里像化妆室，却更像精心复制的布景。"},
    {id:"water",title:"精查水线",sub:"需要先提出“淡水来源”假说",m:10,requiresHyp:"freshwater",clues:["waterTrace","handprints"],text:"三条水线记录了上升、倾斜与排水。第二组手印比第一组更高。"},
    {id:"floor",title:"拆查地板固定结构",sub:"需要先提出“房间移动”假说",m:10,requiresHyp:"moving",clues:["brassScrews"],text:"地毯下的黄铜螺钉把桌椅钉在地板上——固定房间没有这种必要。"},
    {id:"key",title:"检查门锁与钥匙",sub:"收集三把都写着“7”的钥匙",m:5,clues:["threeKeys"],text:"三把钥匙齿形完全不同。其中一把的磨损不像门锁造成。"}
  ]},
  {id:"theater",title:"中央剧场",teaser:"毒面具、断威亚、真子弹和碎裂镜墙。",icon:"幕",actions:[
    {id:"mask",title:"拆开银色面具",sub:"检查重缝内衬与演出手套",m:10,clues:["aconite","needleThread","gloveAconite"],text:"香料掩盖了乌头气味。夹层针脚留下梁素琴的指纹与惯用丝线，她的演出手套内侧也有相同配比残留；剂量仍不足以直接致死。"},
    {id:"wire",title:"放大检查威亚",sub:"区分磨损与新切口",m:10,clues:["cutRope","backupRope"],text:"主绳被割断；旁边却有韩九章临时加上的备用绳。一次谋杀又被另一个秘密抵消。"},
    {id:"bullet",title:"旋转舞台寻找弹头",sub:"进入外圈检修道并重建弹道",m:20,risk:4,experiment:true,clues:["liveBullet","mirrorWound"],text:"弹头没有进入人体。祁重楼的血来自飞散镜片，而非枪伤。"},
    {id:"ammo",title:"核对枪柜与镜墙撞击点",sub:"用领取编号和几何射线替代弹道复原",m:15,clues:["gunRegistry","mirrorImpact"],text:"弹药编号证明祁越换入实弹；镜墙撞击点却让射线绕开死者站位。结合伤口玻璃粉，可以在不拆舞台的情况下排除枪伤。"},
    {id:"habit",title:"观看下午彩排",sub:"观察控制员的确认习惯",m:10,clues:["penHabit"],text:"每次不可撤销指令前，梁音都会按一下钢笔。三段彩排，无一例外。"}
  ]},
  {id:"control",title:"舞台控制室",teaser:"三个声道、一个烧蚀开关与被覆盖的时间。",icon:"控",actions:[
    {id:"channel",title:"拆查通话器",sub:"测试三个独立声道",m:10,clues:["channels"],text:"第三声道没有坏。它被切进了控制员耳机，外放扬声器当然只剩音乐。"},
    {id:"switch",title:"检查紧急覆盖",sub:"观察开关内部触点",m:10,clues:["overrideBurn"],text:"报警本会暂停自动程序。继续旋转必须按住这里三秒，烧蚀证明有人这样做了。"},
    {id:"logs",title:"抄录电机记录",sub:"保存尚未覆盖的电流曲线",m:10,clues:["motorLog","stagePlan"],text:"00:33进水警报之后，电机仍完成一次旋转负载。"},
    {id:"tape",title:"取走提示磁带",sub:"左右声道速度异常",m:5,clues:["cueTape"],text:"左声道是音乐与提示，右声道像有一团低沉的人声。需要修复机器后分离播放。"}
  ]},
  {id:"machine",title:"下层机械区",teaser:"布景井、暴雨水槽、配重轨道与失灵排水泵。",icon:"轨",actions:[
    {id:"brake",title:"拆下两套制动片",sub:"区分破坏与中止",m:15,risk:3,experiment:true,clues:["brakeDamage","secondBrake"],text:"主制动被人为磨坏，但第二制动换上了韩九章零件箱里的新弹簧。"},
    {id:"maintenance",title:"核对零件箱与维修记录",sub:"以库存、签字页和装配油追查副制动",m:15,clues:["springMissing","maintenanceLog","freshBrakeOil"],text:"零件箱少了一枚副制动弹簧，维修记录在演出前改为通过，轴套上还有新油。三处独立记录证明副制动曾被恢复。"},
    {id:"rail",title:"比对轨道油脂",sub:"取样并追踪门槛残留",m:10,clues:["railSample"],text:"门槛油脂混着同样的铜屑。那扇门曾沿这套轨道移动。"},
    {id:"track",title:"复原应急配重",sub:"需要“房间移动”假说",m:20,risk:4,requiresHyp:"moving",clues:["trackMisalign"],text:"不旋转时配重可以拉回舱体；旋转后轨道横移十七厘米，救援路径被彻底切断。"},
    {id:"tank",title:"采集暴雨水槽",sub:"比对水样与底沙",m:10,clues:["tankSample","sandMatch"],text:"水槽使用淡水。槽底细沙与衣柜中残留一致。"},
    {id:"load",title:"读取发电机纸带",sub:"校正系统时间差",m:10,clues:["loadTape"],text:"负载纸带慢了四十七秒。校正后，旋转确定发生在警报之后。"},
    {id:"pump",title:"抢修排水泵",sub:"牺牲调查时间换取船体安全",m:20,repair:18,text:"你更换保险片并重新引水。船体倾斜减缓，更多物证得以保全。"}
  ]},
  {id:"archive",title:"档案与船长室",teaser:"三层图纸、双胞胎文件与二十二年前的九十秒。",icon:"档",actions:[
    {id:"plans",title:"翻查船体结构图",sub:"寻找三个“七号房”",m:10,clues:["shipPlan"],text:"船体图只画固定房间，但北向箭头附近留有一块不自然的空白。"},
    {id:"script",title:"拆开旧剧本封面",sub:"寻找第七聚光灯图",m:10,clues:["lightPlan","plagiarism"],text:"封面夹层藏着灯光图和白砚的原稿。祁重楼的署名盖住了另一个名字。"},
    {id:"identity",title:"核对出生与遗嘱文件",sub:"比对日期、地点与伪造痕迹",m:15,clues:["identity"],text:"祁越和梁音同日同地出生，都是阮明珠的孩子；祁重楼是生父。"},
    {id:"1978",title:"修复后台录音索引",sub:"重新听见被抹去的九十秒",m:20,clues:["delayTape","oldCaseParts"],text:"呼救已经传到后台。祁重楼说：先不要停，等这一幕结束——整整九十秒。"},
    {id:"letters",title:"开启阮明珠的密封信匣",sub:"需要先核对双胞胎身份",m:10,requiresAll:["identity"],clues:["mingzhuLetters"],text:"信里没有遗产线索，只有她准备离开祁重楼、保护两个孩子的决定。"}
  ]},
  {id:"quarters",title:"客舱与剪辑室",teaser:"被藏起的药、受胁迫录像和左右颠倒的证词。",icon:"像",actions:[
    {id:"wine",title:"复原换酒录像",sub:"倒放废片并检查酒瓶与药箱",m:15,clues:["drugWine","winePuncture","sedativeVial","costumeCache"],text:"白砚换了酒瓶，再把药藏进梁素琴旧戏服。针孔、药瓶批号和暗袋蜡封为录像损失后的独立替代证据。祁重楼只抿了一口。"},
    {id:"film",title:"校正镜像录像",sub:"扣子、反字与左手剑",m:15,clues:["reverseFilm","deletionIndex"],text:"所谓从右侧进入其实发生在左侧。镜墙反射制造了虚假的行踪；剪辑机删除索引保留了操作者与时间戳。"},
    {id:"threat",title:"查看未剪排练带",sub:"分开检查动机与索具物证",m:10,clues:["threatFilm","riggingKnife","ropeFibers"],text:"排练带解释苏晚受胁迫的动机；索具刀缺口与断绳微痕吻合，她的手套中还有新鲜威亚纤维。行为证明与动机证明分别封存。"},
    {id:"relationship",title:"比对暗格汇款与旧合照",sub:"确认谁在替梁素琴藏药",m:10,requiresAll:["drugWine"],clues:["relationshipEvidence"],text:"白砚与梁素琴的关系不是临时同盟。汇款、合照与藏药位置把十余年往来固定下来。"}
    ,{id:"salvage",title:"抢救录像室残余物证",sub:"正式录像毁损后，从三组残余中抢救两组",m:15,requiresFlag:"videoSalvageAvailable",visibleFlag:"videoSalvageAvailable",clues:[],text:"你只能在水淹没剪辑台前抢出两组残余物证。"}
  ]},
  {id:"deck",title:"上层甲板与厨房",teaser:"取样、隔离嫌疑人，或先救下正在倾斜的船。",icon:"风",actions:[
    {id:"samples",title:"完成三组水样比对",sub:"现场、海水、蒸馏水与暴雨水",m:20,experiment:true,requiresAll:["waterTrace","tankSample"],clues:["freshWaterProof"],text:"试纸与蒸发结晶给出一致结果：现场是人工暴雨系统的淡水。"},
    {id:"isolate",title:"分开六名嫌疑人",sub:"阻止证词继续互相污染",m:10,flag:"isolated",text:"你把六人分别安排在上下层不同房间，之后记录的口供可以保持独立。"},
    {id:"seed",title:"准备错误时间追踪",sub:"隔离后设计两版错误时间",m:5,requiresFlag:"isolated",flag:"misinformationPrepared",text:"你决定用两个互不相同的错误时间追踪信息传播。具体时间、接收人和泄漏来源仍需在复原桌上完成。"},
    {id:"stabilize",title:"固定救生艇与舱门",sub:"降低风暴造成的持续损耗",m:15,repair:12,flag:"deckSecured",text:"松脱物被绑牢，水密门关闭。安全不是结局，却决定有多少真相能抵达陆地。"}
  ]}
];

const HYPOTHESES = [
  {id:"freshwater",title:"水并非从海里来",need:["dryCorridor","waterTrace"],result:"开放现场水线精查与水样来源验证。"},
  {id:"moving",title:"房间本身移动过",need:["sixBulbs","fakePort","thresholdGrease"],result:"开放地板固定结构与应急轨道复原。"},
  {id:"alive",title:"进水时死者仍清醒",need:["cable","handprints","talkButton"],result:"可以把伤害行为与直接死因分离。"},
  {id:"attempts",title:"多次加害彼此独立",needAny:["aconite","drugWine","cutRope","liveBullet","gunRegistry","brakeDamage","maintenanceLog"],count:3,result:"五次真实加害不是同一条谋杀链。"},
  {id:"override",title:"自动程序被人工覆盖",need:["overrideBurn","motorLog","loadTape"],result:"可以追问警报后的主动旋转。"},
  {id:"oldcase",title:"1978年死于延迟救援",need:["delayTape","oldCaseParts"],result:"旧案的最终决定者不是制造坠落的人。"}
];

const CONNECTIONS = [
  {id:"waterSource",question:"现场水迹来自哪里？",title:"水来自舞台系统",max:4,threshold:4,paths:[
    {required:["waterTrace","tankSample"],optional:["freshWaterProof","scenePhotos"]},
    {required:["scenePhotos","tankSample"],optional:["waterTrace","freshWaterProof"]}
  ],conflicting:[],result:"无盐水迹与暴雨水槽成分相合，海水来源被排除。"},
  {id:"movingRoom",question:"发现尸体的房间是否固定？",title:"现场是移动布景舱",max:5,threshold:6,paths:[
    {required:["fakePort","brassScrews","railSample"],optional:["lockManual","sandMatch","sixBulbs","thresholdGrease","locationMatrix"]},
    {required:["lockManual","sandMatch","sixBulbs"],optional:["fakePort","brassScrews","railSample","thresholdGrease","locationMatrix"]}
  ],conflicting:[],result:"陈设差异、固定结构和机械残留共同证明房间移动。"},
  {id:"victimAlive",question:"布景舱进水时，死者状态如何？",title:"旋转发生时死者仍活着",max:5,threshold:4,paths:[
    {required:["recoveredVoice","talkButton"],optional:["cable","handprints","channels","knowledgeLeak","propagationTrace","soundComparison"]},
    {required:["cable","handprints","talkButton"],optional:["recoveredVoice","channels","knowledgeLeak","propagationTrace","soundComparison"]},
    {required:["channels","talkButton","knowledgeLeak"],optional:["propagationTrace","recoveredVoice","cable","handprints","soundComparison"]}
  ],conflicting:[],result:"实时通话、活体挣扎或知识泄漏证明旋转发生时死者仍在求救。"},
  {id:"rescueBlocked",question:"警报出现后，救援为何失效？",title:"人工旋转主动阻断救援",max:6,threshold:8,paths:[
    {required:["overrideBurn","loadTape","trackMisalign"],optional:["knowledgeLeak","recoveredVoice","motorLog","channels","propagationTrace","talkButton","soundComparison"]},
    {required:["overrideBurn","trackMisalign","channels","talkButton"],optional:["knowledgeLeak","propagationTrace","recoveredVoice","motorLog","loadTape","soundComparison"]}
  ],conflicting:[],result:"警报后人工覆盖、轨道错位与知情证据闭合最终责任链。"}
];

const INTERVIEWS = {
  liangsuqin:{claim:"“面具是我准备的。乌头会让心脏停下——不必再查别人。”",correct:"transfer",requires:["aconite","identity"],result:"她承认涂药，也承认苏晚擦掉过一部分。她的认罪在替梁音截断调查。",evidence:"梁素琴的加害已确认。",options:{open:"开放询问",contradict:"剂量质证",transfer:"转移对象：梁音"}},
  qiyue:{claim:"“我把真弹装进去，也亲眼看见他的血。我杀了他。”",correct:"contradict",requires:["liveBullet","mirrorWound","talkButton"],alternatives:[["gunRegistry","mirrorImpact","glassPowder","talkButton"]],result:"弹头或枪柜编号证明他确实换弹；弹道与玻璃粉却排除枪伤。他交代曾看见苏晚处理威亚。",evidence:"祁越的加害已确认。",options:{open:"开放询问",contradict:"弹道与伤口质证",silence:"沉默施压"}},
  suwan:{claim:"“那根绳只是老化。我和祁重楼的关系，也轮不到侦探审判。”",correct:"transfer",requires:["cutRope","threatFilm"],result:"你证明她受胁迫而非主动炒作。她承认割绳，并要求不要把罪推给韩九章。",evidence:"苏晚的加害已确认。",options:{limited:"限定追问",contradict:"直接指控名誉",transfer:"转移对象：韩九章"}},
  han:{claim:"“主制动、第二制动、配重轨道是一套故障。外行不要拆开讲。”",correct:"technical",requires:["secondBrake","trackMisalign"],alternatives:[["springMissing","maintenanceLog","freshBrakeOil","trackMisalign"],["recoverySketch","maintenanceLog","trackMisalign"]],result:"拆检、维修记录或他亲手画出的回收路线都证明副制动曾恢复。他终于承认：若舞台没有继续旋转，他能把布景舱拉回。",evidence:"韩九章的破坏与中止已确认。",options:{open:"开放询问",technical:"区分四套机械",pressure:"以旧案施压"}},
  baiyan:{claim:"“六只手共同写完了一场谋杀。寻找最后一只手，只是俗套。”",correct:"contradict",requires:["drugWine","reverseFilm"],alternatives:[["winePuncture","sedativeVial","deletionIndex"]],result:"你拒绝他的集体叙事。录像或药瓶、针孔与删除索引都指向他；他承认下药只是想嫁祸梁素琴。",evidence:"白砚的下药与删片已确认。",options:{open:"让他完整叙事",contradict:"换瓶与镜像质证",pressure:"公开盗稿秘密"}},
  liangyin:{claim:"“下降程序早已写入。停止键当时没有亮。通话器中一直有音乐。”",correct:"false",requires:["recoveredVoice","overrideBurn","channels"],alternatives:[["channels","talkButton","propagationTrace","overrideBurn"]],result:"完整录音或传播追踪都封死了退路。你故意把求救说成“停下升降”，她脱口纠正：“他说的是停止旋转。”",evidence:"梁音听见求救并了解具体内容。",options:{open:"逐字询问",false:"错误前提诱导",pressure:"以身世施压"}}
};
const FIRST_QUESTIONS={
  liangsuqin:[
    {id:"last",q:"最后一次见到死者是什么时候？",a:"“开幕前。他仍在反复检查银色面具。”"},{id:"place",q:"最后一幕你位于哪里？",a:"“王后退场后，我一直在左舷演员休息室。”"},{id:"sound",q:"你听见了什么异常声音？",a:"“镜墙碎裂后，我听见舞台下方连续两次撞击。”"},{id:"fear",q:"你最担心警方发现什么？",a:"“那件旧戏服。它不该再出现在船上。”"}
  ],
  qiyue:[
    {id:"last",q:"最后一次见到死者是什么时候？",a:"“我扣下扳机时，他就在镜墙前。”"},{id:"place",q:"最后一幕你位于哪里？",a:"“开枪后我冲向外圈，却被旋转舞台挡住。”"},{id:"sound",q:"你听见了什么异常声音？",a:"“枪声后还有玻璃落地声，没有人体倒地声。”"},{id:"fear",q:"你最担心警方发现什么？",a:"“枪柜登记簿。那发实弹是我领走的。”"}
  ],
  suwan:[
    {id:"last",q:"最后一次见到死者是什么时候？",a:"“升降台试演时。他逼我继续扮演那段绯闻。”"},{id:"place",q:"最后一幕你位于哪里？",a:"“主威亚断裂后，我躲进右侧换装区。”"},{id:"sound",q:"你听见了什么异常声音？",a:"“警报后，电机又完整响了一次。”"},{id:"fear",q:"你最担心警方发现什么？",a:"“未剪排练带里有他威胁我的原话。”"}
  ],
  han:[
    {id:"last",q:"最后一次见到死者是什么时候？",a:"“下降测试前。他命令我别碰主制动。”"},{id:"place",q:"最后一幕你位于哪里？",a:"“下层配重井，我在看第二制动的回压。”"},{id:"sound",q:"你听见了什么异常声音？",a:"“先是入水警报，随后轨道横向咬合。”"},{id:"fear",q:"你最担心警方发现什么？",a:"“我知道一条还能拉回布景舱的路线。”"}
  ],
  baiyan:[
    {id:"last",q:"最后一次见到死者是什么时候？",a:"“晚宴换酒时。他只喝了一口。”"},{id:"place",q:"最后一幕你位于哪里？",a:"“剪辑室。我在处理一段左右颠倒的影像。”"},{id:"sound",q:"你听见了什么异常声音？",a:"“广播只有音乐，但墙内有低频通话串音。”"},{id:"fear",q:"你最担心警方发现什么？",a:"“删除索引会证明我剪掉了谁的画面。”"}
  ],
  liangyin:[
    {id:"last",q:"最后一次见到死者是什么时候？",a:"“下降前。他通过监视器确认第七幕开始。”"},{id:"place",q:"最后一幕你位于哪里？",a:"“控制室。我的位置从未改变。”"},{id:"sound",q:"你听见了什么异常声音？",a:"“耳机里一直有音乐，至少公开声道如此。”"},{id:"fear",q:"你最担心警方发现什么？",a:"“我只担心记录被改写，不担心事实。”"}
  ]
};
const TRUST_BENEFITS={
  liangsuqin:{clues:["identity"],text:"梁素琴主动交出收养资料，双胞胎身份获得另一来源。"},
  qiyue:{clues:["gunRegistry"],text:"祁越允许你检查他的舞台枪套与枪柜领取记录。"},
  suwan:{clues:["threatFilm"],text:"苏晚说出未剪排练带藏在右侧换装柜夹层。"},
  han:{clues:["recoverySketch"],text:"韩九章画出不旋转时仍可使用的应急回收路线。"},
  baiyan:{clues:["reverseFilm"],text:"白砚交出删除索引，镜像录像的原始方向得以恢复。"},
  liangyin:{flag:"liangyinVoluntary",text:"梁音要求你在结案后保留一份未经剪辑的主动陈述。"}
};
const TESTIMONY_FOCUS=Object.fromEntries(Object.keys(PEOPLE).map(id=>[id,["last","place","sound","fear"]]));
const QUESTION_EFFECTS={last:"累积相对时间线，缩短最终复原",place:"累积位置核验，形成排除矩阵",sound:"累积异常声音，形成独立证言",fear:"开放较快的信任路线"};
const DERIVED_TESTIMONY={last:"relativeTimeline",place:"locationMatrix",sound:"soundComparison"};

const PUZZLES = [
  {id:"blueprint",title:"三层图纸",desc:"对齐三个标记，找到安全锁档案。",requires:["shipPlan","stagePlan","lightPlan"]},
  {id:"tape",title:"提示磁带",desc:"修复速度、分离声道并还原求救。",requires:["cueTape","channels"],experiment:true},
  {id:"keys",title:"三个七号房",desc:"辨认三把“7”号钥匙的真正用途。",requires:["threeKeys"]},
  {id:"water",title:"水位时间",desc:"排列水线形成的三个阶段。",requires:["handprints","tankSample"]},
  {id:"misinformation",title:"错误时间传播",desc:"投放两版错误时间并判断哪条路线抵达梁音。",requires:[],requiresFlag:"misinformationPrepared"},
  {id:"timeline",title:"第七幕时间线",desc:"只使用已经发现的事件碎片重建第七幕。",requires:[],requiresAny:["drugWine","aconite","cutRope","liveBullet","gunRegistry","brakeDamage","maintenanceLog"],minimum:4,requiresHyp:"attempts"},
  {id:"oldcase",title:"1978年的九十秒",desc:"区分制造危险与决定死亡。",requires:["delayTape","oldCaseParts"]}
];
const PUZZLE_HINTS={
  blueprint:"不要按图纸标题对齐；寻找北向箭头、第七聚光灯与红色中心点这三个不会随系统改变的基准。",
  tape:"先修复速度轮，再分离右声道；低八度来自半速记录，不需要倒放或剪带。",
  keys:"齿形对应锁芯用途：细齿用于房门，短柄用于道具仓，三角孔只可能插入制动机构。",
  water:"水平水线先随进水升高；旋转后才会出现斜线，回升排水的停顿痕迹一定最后形成。",
  misinformation:"比较两条关系路径的长度与投放先后；梁素琴和韩九章可以直接接触梁音，其余人需要中间人。",
  timeline:"先排演出前准备，再排受伤与进水；求救必须早于继续旋转，轨道错位晚于旋转，溺亡早于房间回升。",
  oldcase:"前三项都只制造危险；最后一项必须是有人听见呼救后仍决定等待。"
};

const TIMELINE = [
  ["drug","白砚在红酒中加入镇静药"],["poison","梁素琴在面具内涂乌头"],["wire","苏晚切断主威亚"],["brake","韩九章破坏主制动"],["restore","韩九章恢复第二制动"],["bullet","祁越更换真子弹"],["fall","祁重楼坠落受伤"],["shot","枪击与镜墙破裂"],["lower","布景舱异常下降"],["call","祁重楼通过通话器求救"],["rotate","梁音确认继续旋转"],["track","应急配重轨道错位"],["drown","祁重楼溺亡"],["return","布景舱返回中层"]
];

const DEFAULT_STATE = {
  screen:"cover",resumeScreen:"prologue",investigator:"",difficulty:"normal",prologue:0,
  elapsed:0,safety:78,clues:[],visited:[],actions:[],hypotheses:[],interviews:{},puzzles:[],connections:[],connectionEvidence:{},experimentUses:0,flags:{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:0},errors:0,hints:0,
  report:{culprit:"",cause:"",room:"",responsibility:"",oldcase:"",harms:{}},attachments:[],disclosure:[],ending:null,firstEnding:null,endingGallery:[],replayMode:false,startedAt:Date.now()
};
const DEFAULT_META={endings:[],endingDates:{},previews:[],previewDates:{},firstEnding:null,bestSafety:0,bestAnySafety:0,bestCompleteSafety:0,bestExtremeCompleteSafety:0,extremeComplete:false,secrets:[]};

let meta=loadMeta();
let state=loadState();
absorbStateMeta(state);
let newGameDifficulty="normal";
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
function loadMeta(){try{const loaded=Object.assign({},DEFAULT_META,JSON.parse(localStorage.getItem(META_STORAGE_KEY))||{});loaded.previews=loaded.previews||[];loaded.previewDates=loaded.previewDates||{};loaded.bestAnySafety=Math.max(loaded.bestAnySafety||0,loaded.bestSafety||0);return loaded;}catch{return Object.assign({},DEFAULT_META);}}
function saveMeta(){localStorage.setItem(META_STORAGE_KEY,JSON.stringify(meta));}
function absorbStateMeta(saved){
  (saved.endingGallery||[]).forEach(type=>{if(!meta.endings.includes(type))meta.endings.push(type);});
  if(!meta.firstEnding&&saved.firstEnding)meta.firstEnding=saved.firstEnding;
  state.firstEnding=meta.firstEnding;state.endingGallery=[...meta.endings];saveMeta();
}
function loadState(){
  try{
    const current=localStorage.getItem(STORAGE_KEY),legacyV8=!current&&localStorage.getItem(LEGACY_V8_STORAGE_KEY),legacyV7=!current&&!legacyV8&&localStorage.getItem(LEGACY_V7_STORAGE_KEY),legacyV6=!current&&!legacyV8&&!legacyV7&&localStorage.getItem(LEGACY_V6_STORAGE_KEY),legacyV5=!current&&!legacyV8&&!legacyV7&&!legacyV6&&localStorage.getItem(LEGACY_V5_STORAGE_KEY),legacyV4=!current&&!legacyV8&&!legacyV7&&!legacyV6&&!legacyV5&&localStorage.getItem(LEGACY_V4_STORAGE_KEY),legacyV3=!current&&!legacyV8&&!legacyV7&&!legacyV6&&!legacyV5&&!legacyV4&&localStorage.getItem(LEGACY_V3_STORAGE_KEY),legacyV2=!current&&!legacyV8&&!legacyV7&&!legacyV6&&!legacyV5&&!legacyV4&&!legacyV3&&localStorage.getItem(LEGACY_STORAGE_KEY);
    const x=JSON.parse(current||legacyV8||legacyV7||legacyV6||legacyV5||legacyV4||legacyV3||legacyV2);if(!x)return freshState();
    const base=freshState(),merged=Object.assign(base,x);
    merged.report=Object.assign(base.report,x.report||{});merged.report.harms=Object.assign({},x.report?.harms||{});merged.connectionEvidence=Object.assign({},x.connectionEvidence||{});
    merged.flags=Object.assign({degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:0},x.flags||{});merged.flags.degraded=Object.assign({},x.flags?.degraded||{});merged.flags.connectionAttempts=Object.assign({},x.flags?.connectionAttempts||{});merged.flags.connectionLocks=Object.assign({},x.flags?.connectionLocks||{});
    const legacy=legacyV8||legacyV7||legacyV6||legacyV5||legacyV4||legacyV3||legacyV2;
    if(legacy&&merged.difficulty==="normal"&&!merged.flags.v26NormalSafetyBonus){merged.safety=Math.min(100,(merged.safety??78)+12);merged.flags.v26NormalSafetyBonus=true;}
    rebuildDerivedTestimony(merged);
    if(merged.flags.disclosureLocked&&!merged.flags.reportDisclosureMode){merged.flags.mandatoryDisclosure=merged.disclosure?.[0]||null;merged.flags.reportDisclosureMode=(merged.disclosure?.length||0)>1?"limited":"sealed";delete merged.flags.disclosureLocked;}
    if(legacyV2){merged.connections=[];merged.connectionEvidence={};merged.attachments=[];merged.flags.migratedProofSystem=true;}
    if(legacy)localStorage.setItem(STORAGE_KEY,JSON.stringify(merged));
    return merged;
  }catch{return freshState();}
}
function saveState(message="进度已保存"){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));if(message)toast(message);}
function clearSavedState(){localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(LEGACY_V8_STORAGE_KEY);localStorage.removeItem(LEGACY_V7_STORAGE_KEY);localStorage.removeItem(LEGACY_V6_STORAGE_KEY);localStorage.removeItem(LEGACY_V5_STORAGE_KEY);localStorage.removeItem(LEGACY_V4_STORAGE_KEY);localStorage.removeItem(LEGACY_V3_STORAGE_KEY);localStorage.removeItem(LEGACY_STORAGE_KEY);}
function escapeHTML(v){return String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));}
function has(id){return state.clues.includes(id);}
function hasAll(ids=[]){return ids.every(has);}
function addClues(ids=[]){ids.forEach(id=>{if(CLUES[id]&&!has(id)){state.clues.push(id);state.flags.clueVersion=(state.flags.clueVersion||0)+1;}});}
function toast(text){const el=document.querySelector("#toast");el.textContent=text;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2600);}
function clock(){let total=54+state.elapsed,h=Math.floor(total/60)%24,m=total%60;return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;}
function safetyBand(){return state.safety>=70?"稳定":state.safety>=40?"受损":state.safety>0?"濒临沉没":"弃船程序";}
function startingSafety(difficulty){return difficulty==="normal"?90:78;}
function stormWearRate(){return {normal:36,hard:18,extreme:14}[state.difficulty]||18;}
function lowSafetyExposureRate(){return {normal:90,hard:45,extreme:30}[state.difficulty]||45;}
function difficultyRules(){return {normal:{degradeAt:120,maxInterviews:99,showNeeds:true,showMeters:true},hard:{degradeAt:75,maxInterviews:3,showNeeds:true,showMeters:true},extreme:{degradeAt:45,maxInterviews:3,showNeeds:false,showMeters:false}}[state.difficulty];}
function experimentLimit(){return 3;}
const NORMAL_PROGRESS_EVENTS=[
  {id:"machineWipe",at:8,title:"机械层有人回来过",text:"有人趁你离开后用煤油擦洗制动器、翻动维修簿并整理零件箱。越仓促的清理留下越明确的装配与出入记录。",clues:["freshBrakeOil","maintenanceLog","springMissing"]},
  {id:"editingErase",at:18,title:"剪辑台的索引正在被删除",text:"有人同时清理剪辑台与换瓶残留：索引被覆盖，药瓶和酒塞也被挪动。匆忙的掩盖让一项原本隐蔽的痕迹暴露出来。",clues:["deletionIndex","winePuncture","sedativeVial"]},
  {id:"costumeMove",at:30,title:"有人试图转移戏服证物",text:"一只戏服箱被拖向上层甲板，雨水把箱底残留冲成了一条连续痕迹。转移行为让原本藏在夹层里的材料暴露出来。",clues:["gloveAconite","ropeFibers","riggingKnife","costumeCache"]}
];
const EXPERIMENT_EVIDENCE=new Set(["freshWaterProof","liveBullet","mirrorWound","brakeDamage","secondBrake","recoveredVoice"]);
const EVIDENCE_SOURCES={
  scenePhotos:"scene-water",waterTrace:"scene-water",dryCorridor:"scene-water",
  foam:"body-exam",cable:"body-exam",talkButton:"body-exam",glassPowder:"body-exam",
  sixBulbs:"room-inspection",fakePort:"room-inspection",thresholdGrease:"room-inspection",
  tankSample:"rain-tank",sandMatch:"rain-tank",liveBullet:"ballistics-test",mirrorWound:"ballistics-test",
  gunRegistry:"gun-inventory",mirrorImpact:"scene-trajectory",brakeDamage:"brake-test",secondBrake:"brake-test",
  springMissing:"parts-inventory",maintenanceLog:"maintenance-record",freshBrakeOil:"brake-surface",
  needleThread:"mask-stitching",gloveAconite:"costume-glove",winePuncture:"bottle-exam",sedativeVial:"medical-inventory",deletionIndex:"editing-index",costumeCache:"costume-cache",riggingKnife:"blade-match",ropeFibers:"costume-fibers",
  relativeTimeline:"relative-testimony",locationMatrix:"location-testimony",soundComparison:"sound-testimony"
};
const CLUE_ORIGINS={
  dryCorridor:"scene",waterTrace:"scene",foam:"scene",cable:"scene",handprints:"scene",tankSample:"scene",freshWaterProof:"record",
  sixBulbs:"scene",fakePort:"scene",brassScrews:"scene",thresholdGrease:"scene",railSample:"machine",sandMatch:"scene",shipPlan:"record",stagePlan:"record",lightPlan:"record",lockManual:"record",threeKeys:"scene",
  aconite:"scene",drugWine:"record",cutRope:"scene",backupRope:"scene",liveBullet:"scene",mirrorWound:"scene",gunRegistry:"record",mirrorImpact:"scene",glassPowder:"scene",brakeDamage:"machine",secondBrake:"machine",springMissing:"machine",maintenanceLog:"record",freshBrakeOil:"machine",
  recoverySketch:"testimony",channels:"machine",cueTape:"record",recoveredVoice:"record",talkButton:"scene",overrideBurn:"machine",motorLog:"record",loadTape:"record",trackMisalign:"machine",penHabit:"record",knowledgeLeak:"testimony",propagationTrace:"testimony",
  identity:"record",threatFilm:"record",reverseFilm:"record",delayTape:"record",oldCaseParts:"record",plagiarism:"record",scenePhotos:"scene",relationshipEvidence:"record",mingzhuLetters:"record",
  needleThread:"scene",winePuncture:"scene",sedativeVial:"record",deletionIndex:"record",costumeCache:"scene",riggingKnife:"scene",gloveAconite:"scene",ropeFibers:"scene",relativeTimeline:"testimony",locationMatrix:"testimony",soundComparison:"testimony"
};
function clueOrigin(id){return CLUE_ORIGINS[id]||"record";}
function testimonyScore(id){const rec=state.interviews[id];if(!rec?.broken)return 0;const answers=rec.firstAnswers||[],focus=TESTIMONY_FOCUS[id]||[],focused=!answers.length||answers.some(answer=>focus.includes(answer));return rec.independent===false?(focused?0.5:0.25):(focused?2:1);}
function derivedWitnesses(target,type){return Object.entries(target.interviews||{}).filter(([,rec])=>rec.originalRecorded&&(rec.firstAnswers||[]).includes(type)).map(([id,rec])=>({id,independent:rec.independent===true}));}
function rebuildDerivedTestimony(target){
  target.flags=target.flags||{};target.flags.derivedTestimony=target.flags.derivedTestimony||{};
  Object.entries(DERIVED_TESTIMONY).forEach(([type,clue])=>{if(!(target.clues||[]).includes(clue))return;const witnesses=derivedWitnesses(target,type);target.flags.derivedTestimony[clue]={witnesses:witnesses.map(item=>item.id),independentCount:witnesses.filter(item=>item.independent).length};});
}
function updateDerivedTestimony(type){
  const clue=DERIVED_TESTIMONY[type],witnesses=derivedWitnesses(state,type);if(!clue||witnesses.length<2)return false;
  state.flags.derivedTestimony=state.flags.derivedTestimony||{};state.flags.derivedTestimony[clue]={witnesses:witnesses.map(item=>item.id),independentCount:witnesses.filter(item=>item.independent).length};addClues([clue]);return true;
}
function derivedTestimonyScore(id){const record=state.flags.derivedTestimony?.[id];if(!record)return 0.5;if(record.independentCount>=2)return 2;if(record.independentCount===1)return 1;return 0.5;}
function derivedTestimonyStatus(id){const score=derivedTestimonyScore(id);return score===2?"两份均独立 · 证明力完整":score===1?"仅一份独立 · 证明力受限":"两份均可能受污染 · 仅作弱补强";}
function clueDescription(id){const record=state.flags.derivedTestimony?.[id];if(!record)return CLUES[id].d;const sources=record.witnesses.map(witness=>`${PEOPLE[witness]?.name||witness}“${({relativeTimeline:"最后见面",locationMatrix:"最后位置",soundComparison:"异常声音"})[id]}”`).join("＋");return `${CLUES[id].d} 来源：${sources||"旧存档未保留来源"}。独立性：${derivedTestimonyStatus(id)}。`;}
function clueScore(id){if(id==="knowledgeLeak")return state.flags.confrontationComplete?2:testimonyScore("liangyin");if(Object.values(DERIVED_TESTIMONY).includes(id))return derivedTestimonyScore(id);if(EXPERIMENT_EVIDENCE.has(id))return 3;return state.flags.degraded[id]?1:2;}
function clueSource(id){return EVIDENCE_SOURCES[id]||id;}
function evidenceScore(ids=[]){const groups={};ids.filter(has).forEach(id=>{const source=clueSource(id);groups[source]=Math.max(groups[source]||0,clueScore(id));});return Object.values(groups).reduce((sum,value)=>sum+value,0);}
function scoreLabel(id){
  if(state.difficulty==="extreme")return state.flags.degraded[id]?"证明力较弱":EXPERIMENT_EVIDENCE.has(id)?"专业复原":id==="knowledgeLeak"?(state.flags.confrontationComplete?"独立对质证言":testimonyScore("liangyin")<1?"受污染证言":"独立证言"):Object.values(DERIVED_TESTIMONY).includes(id)?derivedTestimonyStatus(id):"可用于证明";
  const score=clueScore(id);return `${score}分${state.flags.degraded[id]?'·降级':EXPERIMENT_EVIDENCE.has(id)?'·检验':id==="knowledgeLeak"?'·证言':''}`;
}
function checkCrisisThresholds(before,after){
  if(before>=60&&after<60&&!state.flags.crisisPump)state.flags.pendingCrisis="pump";
  else if(before>=35&&after<35&&!state.flags.crisisArchive)state.flags.pendingCrisis="archive";
  else if(before>=15&&after<15&&!state.flags.crisisTrack)state.flags.pendingCrisis="track";
}
function investigationProgress(){return state.actions.length+state.hypotheses.length+state.puzzles.length+state.connections.length+Object.values(state.interviews).filter(rec=>rec.originalRecorded).length+Object.values(state.interviews).filter(rec=>rec.broken).length;}
function queueNormalProgressEvent(){
  if(state.difficulty!=="normal"||state.flags.pendingProgressEvent)return null;
  state.flags.progressEvents=state.flags.progressEvents||[];
  const event=NORMAL_PROGRESS_EVENTS.find(item=>investigationProgress()>=item.at&&!state.flags.progressEvents.includes(item.id));if(!event)return null;
  const clue=event.clues.find(id=>!has(id))||null;state.flags.progressEvents.push(event.id);state.flags.pendingProgressEvent={id:event.id,clue};if(clue)addClues([clue]);return state.flags.pendingProgressEvent;
}
function expireVideoSalvage(){if(state.flags.videoSalvageAvailable&&state.flags.videoSalvageDeadline&&state.elapsed+15>state.flags.videoSalvageDeadline&&!state.flags.videoSalvageInProgress){state.flags.videoSalvageAvailable=false;state.flags.videoSalvageExpired=true;delete state.flags.activeSalvageSelection;}}
function queueNormalWeakCrisis(){if(state.difficulty==="normal"&&investigationProgress()>=18&&!state.flags.crisisPump&&!state.flags.normalWeakCrisisSeen&&!state.flags.pendingCrisis&&!state.flags.evacuation){state.flags.normalWeakCrisisSeen=true;state.flags.weakPumpCrisis=true;state.flags.pendingCrisis="pump";}}
function advance(minutes,risk=0,repair=0){
  const before=state.safety,beforeElapsed=state.elapsed,wearRate=stormWearRate();
  state.elapsed+=minutes;
  const passive=Math.floor(state.elapsed/wearRate)-Math.floor(beforeElapsed/wearRate);
  state.safety=Math.max(0,Math.min(100,state.safety-passive-Math.max(0,risk)+Math.max(0,repair)));
  if(state.elapsed>=80&&!state.flags.isolated)state.flags.contaminated=true;
  if(state.elapsed>=240&&!state.flags.deckSecured&&!state.flags.lateStormPenalty){state.flags.lateStormPenalty=true;state.safety=Math.max(0,state.safety-4);}
  if(state.safety>0&&state.safety<40){
    const beforeExposure=state.flags.lowSafetyMinutes||0,afterExposure=beforeExposure+minutes,exposureRate=lowSafetyExposureRate();
    const accidents=Math.floor(afterExposure/exposureRate)-Math.floor(beforeExposure/exposureRate);
    state.flags.lowSafetyMinutes=afterExposure;
    if(accidents>0){state.flags.accidents=(state.flags.accidents||0)+accidents;state.safety=Math.max(0,state.safety-accidents);}
  }
  checkCrisisThresholds(before,state.safety);
  if(state.safety===0)state.flags.evacuation=true;
  expireVideoSalvage();
  queueNormalProgressEvent();
  queueNormalWeakCrisis();
}
function chapterName(){
  if(state.screen==="cover")return "标题";
  if(state.screen==="gallery")return "剧场座位 · 结局图鉴";
  if(state.screen==="progressEvent")return "调查异动 · 有人正在掩盖痕迹";
  if(state.screen==="confrontation")return "终章 · 没有观众的对质";
  if(["prologue","discovery"].includes(state.screen))return "序章 · 没有观众的首演";
  const evidence=state.clues.length;
  if(evidence<10)return "第一章 · 被水淹没的密室";
  if(state.hypotheses.length<3)return "第二章 · 六种杀人方法";
  if(!state.puzzles.includes("blueprint"))return "第三章 · 三个七号房";
  if(Object.values(state.interviews).filter(x=>x.originalRecorded).length<3)return "第四章 · 每个人都在保护凶手";
  if(!state.puzzles.includes("oldcase"))return "第五章 · 二十二年前的九十秒";
  if(!state.interviews.liangyin?.broken)return "第六章 · 第七幕";
  return "终章 · 案件报告";
}
function setScreen(screen){state.screen=screen;saveState("");render();window.scrollTo(0,0);}

function sideFile(){
  const chains=["死因","密室","加害","存活","指令","旧案"].map(name=>[name,Object.values(CLUES).filter(c=>c.chain===name).length,state.clues.filter(id=>CLUES[id]?.chain===name).length]);
  return `<aside class="side-file"><p class="eyebrow">SHIP STATUS</p><h3>${clock()} · ${safetyBand()}</h3><div class="meter"><div class="meter-label"><span>船体安全</span><b>${state.safety}%</b></div><div class="meter-track"><div class="meter-fill ${state.safety<40?'danger-fill':''}" style="width:${state.safety}%"></div></div></div><div class="side-stat"><span>风暴损耗</span><strong>${stormWearRate()}分钟 / −1</strong></div>${state.difficulty==="normal"?`<div class="side-stat"><span>掩盖异动</span><strong>${state.flags.progressEvents?.length||0}/${NORMAL_PROGRESS_EVENTS.length}</strong></div>`:""}${chains.map(([n,total,g])=>`<div class="side-stat"><span>${n}</span><strong>${g}/${total}</strong></div>`).join("")}<div class="side-stat"><span>大型检验</span><strong>${state.experimentUses}/${experimentLimit()}</strong></div><div class="side-stat"><span>证据连接</span><strong>${state.connections.length}/${CONNECTIONS.length}</strong></div><div class="side-stat"><span>证词状态</span><strong>${state.flags.contaminated?"已发生传播":"可追溯"}</strong></div></aside>`;
}

function render(){
  const unresolvedCrisis=state.flags.evacuation||state.flags.pendingCrisis,reportAuthorized=state.screen==="report"&&state.flags.crisisReportAuthorized;
  if(unresolvedCrisis&&!["crisis","ending","cover","gallery"].includes(state.screen)&&!reportAuthorized)state.screen="crisis";
  else if(state.screen==="hub"&&state.flags.pendingProgressEvent)state.screen="progressEvent";
  topbar.hidden=state.screen==="cover";
  chapterLabel.textContent=chapterName();timeLabel.textContent=clock();clueCount.textContent=state.clues.length;
  const map={cover:renderCover,gallery:renderGallery,prologue:renderPrologue,discovery:renderDiscovery,hub:renderHub,progressEvent:renderProgressEvent,location:renderLocation,videoSalvage:renderVideoSalvage,hypotheses:renderHypotheses,connections:renderConnections,interviews:renderInterviews,interview:renderInterview,puzzles:renderPuzzles,puzzle:renderPuzzle,crisis:renderCrisis,confrontation:renderConfrontation,report:renderReport,ending:renderEnding};
  (map[state.screen]||renderCover)();
  app.focus({preventScroll:true});
}

function renderProgressEvent(){
  const pending=state.flags.pendingProgressEvent,event=NORMAL_PROGRESS_EVENTS.find(item=>item.id===pending?.id),clue=pending?.clue;
  if(!event){delete state.flags.pendingProgressEvent;setScreen("hub");return;}
  app.innerHTML=`<section class="screen narrow"><div class="crisis-panel"><p class="eyebrow">INVESTIGATION SHIFT · PROGRESS ${investigationProgress()}</p><h1>${event.title}</h1><p>${event.text}</p>${clue?`<div class="reveal"><p class="eyebrow">NEW EVIDENCE</p><h3>${CLUES[clue].t}</h3><p>${CLUES[clue].d}</p><span class="evidence-tag">＋ 已加入案卷</span></div>`:`<div class="reveal"><h3>旧线索得到再次确认</h3><p>相关物证已经在此前调查中封存；这次掩盖行为进一步确认了它并非偶然残留。</p></div>`}<button class="btn" id="recordProgressEvent">记录异动并继续调查</button></div></section>`;
  document.querySelector("#recordProgressEvent").addEventListener("click",()=>{delete state.flags.pendingProgressEvent;state.screen="hub";saveState("");render();});
}

function renderCover(){
  const hasSave=!!localStorage.getItem(STORAGE_KEY);
  app.innerHTML=`<section class="cover"><div class="cover-inner"><div class="cover-seal"><span>VII</span></div><p class="eyebrow">A LOCKED ROOM AT SEA · 2000</p><h1>塞壬号</h1><p class="subtitle">第 七 幕 没 有 掌 声</p><div class="cover-quote">“不要问谁进入过房间。<br>先问房间去过哪里。”</div><form class="intake" id="startForm"><input id="nameInput" maxlength="12" placeholder="侦探署名（可留空）" value="${escapeHTML(state.investigator)}"><button class="btn" type="submit">${hasSave?'覆盖存档并开始':'开始新调查'}</button></form><div class="difficulty-select" aria-label="新游戏难度">${[["normal","普通"],["hard","困难"],["extreme","极难"]].map(([id,n])=>`<button type="button" class="option-pill ${newGameDifficulty===id?'active':''}" data-difficulty="${id}">${n}</button>`).join("")}</div>${hasSave?`<button class="btn secondary" id="continueBtn">继续当前存档 · ${state.difficulty==="normal"?"普通":state.difficulty==="hard"?"困难":"极难"}</button>`:""}${meta.endings.length?`<button class="btn secondary" id="galleryBtn">剧场座位 · ${meta.endings.length} 名观众</button>`:""}<p class="continue-note">普通模式初始安全 90%，每 36 分钟结算 1 点风暴损耗；难度只影响新游戏</p></div></section>`;
  document.querySelectorAll("[data-difficulty]").forEach(el=>el.addEventListener("click",()=>{newGameDifficulty=el.dataset.difficulty;render();}));
  document.querySelector("#startForm").addEventListener("submit",e=>{e.preventDefault();if(hasSave&&!confirm("开始新调查会覆盖当前调查进度，但不会清除结局图鉴。确定继续吗？"))return;const name=document.querySelector("#nameInput").value.trim();state=freshState();state.investigator=name||"受邀侦探";state.difficulty=newGameDifficulty;state.safety=startingSafety(newGameDifficulty);state.screen="prologue";state.resumeScreen="prologue";saveState("");render();});
  document.querySelector("#continueBtn")?.addEventListener("click",()=>{state.screen=state.resumeScreen||"hub";render();});
  document.querySelector("#galleryBtn")?.addEventListener("click",()=>setScreen("gallery"));
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
  const interviews=Object.values(state.interviews).filter(x=>x.broken).length, solved=state.puzzles.length,finalScreen=state.replayMode||state.flags.confrontationComplete?"report":"confrontation";
  app.innerHTML=`<section class="screen"><div class="chapter-head"><div><p class="eyebrow">INVESTIGATION DECK · ${clock()}</p><h2>今晚，房间去过哪里？</h2><p class="chapter-summary">调查、假说、审讯与复原会互相解锁。风暴按累计时间侵蚀船体，短操作不会被重复计罚。</p></div><div class="chapter-no">${state.safety}</div></div>${state.safety<40?`<div class="ship-warning"><b>船体安全 ${state.safety}%</b><span>危险区事故按累计停留时间发生；安全归零仍将强制进入撤离。</span></div>`:""}<div class="case-layout"><div><div class="hub-tools"><button class="hub-tool" data-hub="hypotheses"><b>${state.hypotheses.length}/6</b><span>提出假说</span><small>用已知痕迹开启二次调查</small></button><button class="hub-tool" data-hub="connections"><b>${state.connections.length}/4</b><span>连接证据</span><small>亲自把痕迹组成可验证结论</small></button><button class="hub-tool" data-hub="interviews"><b>${interviews}/6</b><span>审讯嫌疑人</span><small>${state.flags.contaminated?'部分新证词已失去独立性':'先保存原始版本，再用证据突破'}</small></button><button class="hub-tool" data-hub="puzzles"><b>${solved}/${PUZZLES.length}</b><span>复原与实验</span><small>大型检验 ${state.experimentUses}/${experimentLimit()} · 时间线不会提前泄密</small></button><button class="hub-tool report-tool" data-hub="${finalScreen}"><b>VII</b><span>${finalScreen==='confrontation'?'进入最终对质':'提交案件报告'}</span><small>${state.replayMode?'复盘提交只会标记预演':state.flags.confrontationComplete?'对质完成，正式归档':'出示连接、处理保护关系并诱导嫌疑人'}</small></button></div><h3 class="section-label">可调查区域</h3><div class="location-grid">${LOCATIONS.map((loc,i)=>{const actions=visibleLocationActions(loc),done=actions.filter(a=>actionResolved(loc,a)).length;return `<button class="location-card ${done===actions.length?'done':''}" data-location="${loc.id}"><span class="card-index">DECK · ${String(i+1).padStart(2,"0")} · ${done}/${actions.length}</span><h3>${loc.title}</h3><p>${loc.teaser}</p><span class="card-icon">${loc.icon}</span></button>`;}).join("")}</div></div>${sideFile()}</div></section>`;
  document.querySelectorAll("[data-location]").forEach(el=>el.addEventListener("click",()=>{state.flags.activeLocation=el.dataset.location;setScreen("location");}));
  document.querySelectorAll("[data-hub]").forEach(el=>el.addEventListener("click",()=>setScreen(el.dataset.hub)));
}
function visibleLocationActions(loc){return loc.actions.filter(a=>!a.visibleFlag||state.flags[a.visibleFlag]||state.actions.includes(`${loc.id}:${a.id}`));}

const ACTION_LOSS_RULES={
  load:["loadTapeLost","发电机纸带已经泡烂，只剩纸轴压痕；精确校时永久失去。"],
  "1978":["oldTapeLost","1978年磁带磁层已经脱落，无法再次修复。"],
  wine:["formalVideoLost","正式录像母带已经进水；药瓶、针孔与藏药位置已作为残缺替代证据封存。"],
  film:["formalVideoLost","镜像原片已经进水；只能使用剪辑机删除索引。"],
  bullet:["stageClosed","舞台外圈已经封闭，弹头调查永久终止。"],
  seal:["waterSamplesLost","现场水线与原始照片已在紧急抢修中牺牲，不能重新封存。"],
  water:["waterSamplesLost","原始水线已经被排水冲毁，无法再次精查。"],
  tank:["waterSamplesLost","水槽样本已用于紧急抢修并受污染，不能重新采集。"],
  samples:["waterSamplesLost","三组原始水样已经牺牲，无法重新比对。"],
  salvage:["videoSalvageExpired","录像室已完全进水，残余证据抢救窗口已经关闭。"]
};
function actionLossReason(a){const rule=ACTION_LOSS_RULES[a.id];return rule&&state.flags[rule[0]]?rule[1]:"";}
function actionResolved(loc,a){return state.actions.includes(`${loc.id}:${a.id}`)||!!actionLossReason(a);}
function actionAvailable(a){if(actionLossReason(a))return false;if(a.requiresHyp&&!state.hypotheses.includes(a.requiresHyp))return false;if(a.requiresAll&&!hasAll(a.requiresAll))return false;if(a.requiresFlag&&!state.flags[a.requiresFlag])return false;if(a.experiment&&state.experimentUses>=experimentLimit())return false;return true;}
function degradationLimit(){const base=difficultyRules().degradeAt;return state.safety<70?base-20:base;}
function actionDegraded(key){return ["scene:seal","theater:mask","control:logs","machine:rail","quarters:wine"].includes(key)&&state.elapsed>=degradationLimit();}
function actionSubtitle(loc,a){if(loc.id==="deck"&&a.id==="isolate")return state.flags.contaminated?"信息已经交换；隔离只能阻止继续传播，不能恢复独立性":"现在隔离，可阻止证词互相传播";return a.sub;}
function actionNarrative(loc,a){if(loc.id==="deck"&&a.id==="isolate"&&state.flags.contaminated)return "信息已经在六人之间交换。你仍将他们分开，阻止新的串供，但此后记录只能作为受污染证言使用。";return a.text;}
function actionResultHTML(result,prefix="ACTION COMPLETE"){return `<div class="reveal"><p class="eyebrow">${prefix} · ${result.time}</p><h3>${result.title}</h3><p>${result.text}</p>${result.late?`<p class="degraded-note">${result.late}</p>`:""}${result.clues.map(c=>`<span class="evidence-tag">＋ ${CLUES[c].t}${result.degraded?'（降级）':''}</span>`).join("")}</div>`;}
function renderLocation(){
  const loc=LOCATIONS.find(x=>x.id===state.flags.activeLocation)||LOCATIONS[0];
  app.innerHTML=`<section class="screen"><button class="btn secondary small" id="backHub">← 返回调查甲板</button><div class="chapter-head local-head"><div><p class="eyebrow">FIELD INVESTIGATION · ${clock()}</p><h2>${loc.title}</h2><p class="chapter-summary">${loc.teaser}</p></div><div class="chapter-no">${loc.icon}</div></div><div class="case-layout"><div><div id="actionReveal"></div><div class="action-list">${visibleLocationActions(loc).map(a=>{const key=`${loc.id}:${a.id}`,done=state.actions.includes(key),loss=actionLossReason(a),ok=actionAvailable(a),degraded=actionDegraded(key);const sub=actionSubtitle(loc,a),cost=a.repair?`${a.m} 分钟 · 修复 +${a.repair}`:`${a.m} 分钟${a.risk?` · 风险 −${a.risk}`:""}${a.experiment?` · 检验 1/${experimentLimit()}`:""}`;return `<button class="action-card ${done?'done':''} ${loss?'lost-action':''} ${degraded?'degraded':''}" data-action="${a.id}" ${done||!ok?'disabled':''}><span class="action-time">${loss?'不可逆损失':cost}</span><div><b>${a.title}</b><small>${done?'已完成':loss?loss:!ok&&a.experiment&&state.experimentUses>=experimentLimit()?'检验次数已用尽，可改走现场物证路线':!ok?`尚未满足：${sub}`:degraded?'证据已降级，必须用另一独立来源补强':sub}</small></div><span>${done?'✓':loss?'×':'→'}</span></button>`;}).join("")}</div></div>${sideFile()}</div></section>`;
  document.querySelector("#backHub").addEventListener("click",()=>setScreen("hub"));
  document.querySelectorAll("[data-action]").forEach(el=>el.addEventListener("click",()=>performAction(loc,el.dataset.action)));
}

function performAction(loc,id){
  const a=loc.actions.find(x=>x.id===id);if(!a||!actionAvailable(a))return;
  if(a.id==="salvage"){state.flags.activeSalvageSelection=[];setScreen("videoSalvage");return;}
  const key=`${loc.id}:${a.id}`;if(state.actions.includes(key))return;
  const degraded=actionDegraded(key);state.actions.push(key);if(a.experiment)state.experimentUses++;if(a.flag==="isolated")state.flags.isolated=true;advance(a.m||0,a.risk||0,a.repair||0);addClues(a.clues);if(a.flag)state.flags[a.flag]=true;if(degraded)(a.clues||[]).forEach(c=>state.flags.degraded[c]=true);
  const late=degraded?"样本已经退化，直接检验力下降；你保留了照片、微量残留或金属屑，必须用另一条独立路径补强。":"";
  const result={title:a.title,text:actionNarrative(loc,a),clues:a.clues||[],degraded,late,time:clock()};const interrupted=!!(state.flags.pendingCrisis||state.flags.evacuation);if(interrupted)state.flags.pendingActionResult=result;
  saveState("");render();const reveal=document.querySelector("#actionReveal");if(reveal&&!interrupted)reveal.innerHTML=actionResultHTML(result);
  if(state.safety<40)toast("风暴警告：船体安全已进入危险区");
}

const VIDEO_SALVAGE_BUNDLES={
  bottle:{title:"药瓶与酒塞",desc:"保存针孔、药瓶批号与注射方向。",clues:["winePuncture","sedativeVial"]},
  index:{title:"剪辑机删除索引",desc:"保存白砚账号与删除片段的时间戳。",clues:["deletionIndex"]},
  rehearsal:{title:"未剪排练带",desc:"保存苏晚受胁迫内容、索具刀与手套纤维。",clues:["threatFilm","riggingKnife","ropeFibers"]}
};
function securedVideoBundles(){return Object.keys(VIDEO_SALVAGE_BUNDLES).filter(id=>VIDEO_SALVAGE_BUNDLES[id].clues.every(has));}
function videoSalvageRequiredSelections(){return Math.min(2,Object.keys(VIDEO_SALVAGE_BUNDLES).length-securedVideoBundles().length);}
function resolveVideoSalvage(selected){
  expireVideoSalvage();const secured=securedVideoBundles(),required=videoSalvageRequiredSelections();
  if(!state.flags.videoSalvageAvailable||selected.length!==required||new Set(selected).size!==required||selected.some(id=>!VIDEO_SALVAGE_BUNDLES[id]||secured.includes(id)))return false;
  const effective=[...new Set([...secured,...selected])],clues=selected.flatMap(id=>VIDEO_SALVAGE_BUNDLES[id].clues),crossRecovered=[];
  if(effective.includes("bottle")&&effective.includes("rehearsal")&&!has("deletionIndex"))crossRecovered.push("deletionIndex");
  if(effective.includes("index")&&effective.includes("rehearsal")){if(!has("winePuncture"))crossRecovered.push("winePuncture");if(!has("sedativeVial"))crossRecovered.push("sedativeVial");}
  addClues([...clues,...crossRecovered]);state.actions.push("quarters:salvage");state.flags.videoSalvageAvailable=false;state.flags.videoSalvageInProgress=true;state.flags.videoSalvageChoice=[...selected];if(effective.includes("rehearsal"))state.flags.savedThreatFilm=true;advance(selected.length?15:0);delete state.flags.videoSalvageInProgress;
  const allClues=[...new Set([...clues,...crossRecovered])],savedLabels=selected.map(id=>VIDEO_SALVAGE_BUNDLES[id].title),result={title:"抢救录像室残余物证",text:`${secured.length?`已封存的${secured.map(id=>VIDEO_SALVAGE_BUNDLES[id].title).join("、")}无需重复抢救。`:""}${savedLabels.length?`你另外保住了${savedLabels.join("与")}。`:"所有残余均已在案卷中封存。"}${crossRecovered.length?"两组资料交叉复原出了第三条证明链所缺的痕迹。":""}`,clues:allClues,degraded:false,late:"",time:clock()};if(state.flags.pendingCrisis||state.flags.evacuation)state.flags.pendingActionResult=result;delete state.flags.activeSalvageSelection;saveState("");return true;
}
function renderVideoSalvage(){
  expireVideoSalvage();if(!state.flags.videoSalvageAvailable){setScreen("hub");return;}
  const selected=state.flags.activeSalvageSelection||[],secured=securedVideoBundles(),required=videoSalvageRequiredSelections(),remaining=Math.max(0,(state.flags.videoSalvageDeadline||state.elapsed)-state.elapsed);state.flags.activeSalvageSelection=selected;
  app.innerHTML=`<section class="screen narrow"><button class="btn secondary small" id="backLocation">← 返回客舱与剪辑室</button><div class="chapter-head local-head"><div><p class="eyebrow">ARCHIVE SALVAGE · ${clock()}</p><h2>水面已经漫过剪辑台</h2><p class="chapter-summary">必须在 ${remaining} 分钟内完成抢救，操作本身消耗 15 分钟。已完整封存的资料不占抢救名额；任意两组均可交叉形成白砚的可行物证路线。</p></div><div class="chapter-no">${selected.length}/${required}</div></div><div class="deduction-list">${Object.entries(VIDEO_SALVAGE_BUNDLES).map(([id,bundle])=>`<button class="deduction salvage-choice ${selected.includes(id)?'active':''} ${secured.includes(id)?'done':''}" data-salvage="${id}" ${secured.includes(id)?'disabled':''}><h3><span>${secured.includes(id)?'SEALED':'SALVAGE'}</span>${bundle.title}</h3><p>${bundle.desc}${secured.includes(id)?' 已完整封存，无需占用名额。':''}</p></button>`).join("")}</div><button class="btn report-submit" id="confirmSalvage" ${selected.length!==required?'disabled':''}>${required?`抢救所选 ${required} 组 · 15分钟`:'确认全部资料已封存'}</button></section>`;
  document.querySelector("#backLocation").addEventListener("click",()=>setScreen("location"));
  document.querySelectorAll("[data-salvage]").forEach(el=>el.addEventListener("click",()=>{const id=el.dataset.salvage;if(selected.includes(id))state.flags.activeSalvageSelection=selected.filter(item=>item!==id);else if(selected.length<required)selected.push(id);saveState("");render();}));
  document.querySelector("#confirmSalvage").addEventListener("click",()=>{
    if(!resolveVideoSalvage(selected))return;setScreen(state.flags.pendingCrisis||state.flags.evacuation?"crisis":"location");
  });
}

function hypothesisReady(h){if(h.need&&!hasAll(h.need))return false;if(h.needAny)return h.needAny.filter(has).length>=h.count;return true;}
function renderHypotheses(){
  app.innerHTML=`<section class="screen narrow"><button class="btn secondary small" id="backHub">← 返回调查甲板</button><div class="chapter-head local-head"><div><p class="eyebrow">WORKING HYPOTHESES</p><h2>让痕迹成为调查理由</h2><p class="chapter-summary">假说不是结论。它只允许你去做此前没有理由进行的拆查、实验与追问。</p></div><div class="chapter-no">${state.hypotheses.length}/6</div></div><div class="deduction-list">${HYPOTHESES.map((h,i)=>{const done=state.hypotheses.includes(h.id),ready=hypothesisReady(h);const need=h.need||h.needAny;return `<div class="deduction ${done?'done':''}"><h3><span>HYPOTHESIS 0${i+1}</span>${h.title}</h3>${difficultyRules().showNeeds?`<p class="muted">所需线索：${need.map(id=>`${has(id)?'●':'○'} ${CLUES[id].t}`).join("　")}</p>`:`<p class="muted">极难模式不显示缺失组合。</p>`}${done?`<p>${h.result}</p>`:`<button class="btn small" data-hypothesis="${h.id}" ${!ready?'disabled':''}>${ready?'提出并记录':'证据尚不足'}</button>`}</div>`;}).join("")}</div></section>`;
  document.querySelector("#backHub").addEventListener("click",()=>setScreen("hub"));
  document.querySelectorAll("[data-hypothesis]").forEach(el=>el.addEventListener("click",()=>{state.hypotheses.push(el.dataset.hypothesis);advance(5);saveState("");render();toast("假说已记录，新的精查方式可能已开放");}));
}

function connectionEvaluation(connection,selected=[]){
  const conflict=selected.some(id=>(connection.conflicting||[]).includes(id));
  const path=connection.paths.find(candidate=>{
    const allowed=new Set([...candidate.required,...(candidate.optional||[])]);
    return candidate.required.every(id=>selected.includes(id))&&selected.every(id=>allowed.has(id));
  });
  const score=evidenceScore(selected);
  const sources=selected.map(clueSource),repeatedSource=new Set(sources).size<sources.length;
  return {solved:!!path&&!conflict&&score>=connection.threshold,path,score,conflict,repeatedSource,shortfall:Math.max(0,connection.threshold-score)};
}
function connectionSolvedWith(connection,selected){return connectionEvaluation(connection,selected).solved;}
function connectionRelevantClues(connection){return [...new Set(connection.paths.flatMap(path=>[...path.required,...(path.optional||[])]))];}
function relevantClueCount(id){const connection=CONNECTIONS.find(item=>item.id===id);return connection?connectionRelevantClues(connection).filter(has).length:0;}
function connectionLocked(id){const lock=state.flags.connectionLocks[id];if(lock===undefined)return false;const at=typeof lock==="number"?{relevantCount:relevantClueCount(id)}:lock;if(relevantClueCount(id)>at.relevantCount){delete state.flags.connectionLocks[id];state.flags.connectionAttempts[id]=0;return false;}return true;}
function connectionReviewAvailable(id){return !!(CONNECTIONS.some(item=>item.id===id)&&connectionLocked(id));}
function connectionFailureText(check){if(check.conflict)return "组合中存在矛盾证据";if(!check.path)return "组合包含无关证据，或核心证据尚未齐全";if(state.difficulty==="extreme")return check.repeatedSource?"部分证据来自同一来源，无法重复增加证明力":"关系方向接近，但尚不足以排除其他解释";return `核心关系成立，但还缺 ${check.shortfall} 分证明力${check.repeatedSource?'；同源条目只计最高分':''}`;}
function recordConnectionFailure(id){state.errors++;if(state.difficulty==="hard")advance(5);if(state.difficulty==="extreme"){state.flags.connectionAttempts[id]=(state.flags.connectionAttempts[id]||0)+1;state.flags.connectionReviewed=state.flags.connectionReviewed||{};if(state.flags.connectionAttempts[id]>=3&&!state.flags.connectionReviewed[id])state.flags.connectionLocks[id]={relevantCount:relevantClueCount(id)};}return connectionLocked(id);}
function reviewLockedConnection(id){if(!connectionReviewAvailable(id))return false;advance(15);delete state.flags.connectionLocks[id];state.flags.connectionAttempts[id]=0;state.flags.connectionReviewed=state.flags.connectionReviewed||{};state.flags.connectionReviewed[id]=true;saveState("");render();toast(state.flags.pendingCrisis?"重新审阅耗时触发了船体危机":"已用 15 分钟整理现有案卷；本证据链不会再次锁定");return true;}
function renderConnections(){
  const active=state.flags.activeConnection;
  if(active){
    const connection=CONNECTIONS.find(x=>x.id===active),selected=state.flags.connectionDraft||[];
    const filter=state.flags.connectionFilter||{chain:"all",origin:"all",starred:false};state.flags.connectionFilter=filter;state.flags.starredClues=state.flags.starredClues||[];
    const fullPool=state.clues.filter(id=>CLUES[id].stage>=2),pool=fullPool.filter(id=>(filter.chain==="all"||CLUES[id].chain===filter.chain)&&(filter.origin==="all"||clueOrigin(id)===filter.origin)&&(!filter.starred||state.flags.starredClues.includes(id)));
    const evaluation=connectionEvaluation(connection,selected),locked=connectionLocked(connection.id),extreme=state.difficulty==="extreme";
    const proofText=extreme?`选择最多 ${connection.max} 条证据。注意核心关系、独立来源与相互补强；极难模式不公开分数或阈值。${evaluation.repeatedSource?' 当前选择含有重复来源。':''}`:`选择最多 ${connection.max} 条证据。核心证据必须齐全；同一来源只计最高分。当前 ${evaluation.score}/${connection.threshold} 分。`;
    const chains=[["all","全部链"],["死因","死因"],["密室","密室"],["存活","存活"],["指令","指令"],["加害","加害"]],origins=[["all","全部来源"],["scene","现场"],["machine","机械"],["record","录像/记录"],["testimony","证言"]];
    app.innerHTML=`<section class="screen narrow"><button class="btn secondary small" id="backConnections">← 返回证据连接</button><div class="puzzle-board" style="margin-top:24px"><p class="eyebrow">EVIDENCE CONNECTION</p><h2>${connection.question}</h2><p class="puzzle-instruction">${locked?'连续三次验证失败；可消耗 15 分钟整理当前案卷。复核后本证据链不会再次锁定。':proofText}</p><div class="evidence-filters"><div>${chains.map(([value,label])=>`<button class="filter-chip ${filter.chain===value?'active':''}" data-filter-chain="${value}">${label}</button>`).join("")}</div><div>${origins.map(([value,label])=>`<button class="filter-chip ${filter.origin===value?'active':''}" data-filter-origin="${value}">${label}</button>`).join("")}<button class="filter-chip ${filter.starred?'active':''}" id="starredOnly">★ 只看重点</button></div></div><div class="attachment-grid">${pool.map(id=>`<button class="option-pill ${selected.includes(id)?'active':''}" data-link-clue="${id}">${state.flags.starredClues.includes(id)?'★ ':''}${CLUES[id].t} · ${scoreLabel(id)}</button>`).join("")||'<p class="muted">当前筛选下没有线索；已选择的证据不会因筛选而丢失。</p>'}</div><div class="puzzle-actions">${connectionReviewAvailable(connection.id)?'<button class="btn" id="reviewConnection">整理当前案卷 · 15分钟</button>':`<button class="btn" id="checkConnection" ${selected.length<2||locked?'disabled':''}>${locked?'需要复核':'检验证据关系'}</button>`}</div></div></section>`;
    document.querySelector("#backConnections").addEventListener("click",()=>{delete state.flags.activeConnection;delete state.flags.connectionDraft;renderConnections();});
    document.querySelectorAll("[data-filter-chain]").forEach(el=>el.addEventListener("click",()=>{filter.chain=el.dataset.filterChain;saveState("");renderConnections();}));
    document.querySelectorAll("[data-filter-origin]").forEach(el=>el.addEventListener("click",()=>{filter.origin=el.dataset.filterOrigin;saveState("");renderConnections();}));
    document.querySelector("#starredOnly")?.addEventListener("click",()=>{filter.starred=!filter.starred;saveState("");renderConnections();});
    document.querySelectorAll("[data-link-clue]").forEach(el=>el.addEventListener("click",()=>{const id=el.dataset.linkClue;if(selected.includes(id))state.flags.connectionDraft=selected.filter(x=>x!==id);else if(selected.length<connection.max)selected.push(id);saveState("");renderConnections();}));
    document.querySelector("#reviewConnection")?.addEventListener("click",()=>reviewLockedConnection(connection.id));
    document.querySelector("#checkConnection")?.addEventListener("click",()=>{const check=connectionEvaluation(connection,selected);if(check.solved){if(!state.connections.includes(connection.id))state.connections.push(connection.id);state.connectionEvidence[connection.id]=[...selected];state.flags.connectionAttempts[connection.id]=0;delete state.flags.connectionLocks[connection.id];delete state.flags.activeConnection;delete state.flags.connectionDraft;advance(2);saveState("");render();toast(state.difficulty==="extreme"?"证据关系成立，结论已封存":`证据关系成立 · ${check.score}/${connection.threshold} 分`);}else{recordConnectionFailure(connection.id);const message=connectionFailureText(check);saveState("");render();toast(state.flags.pendingCrisis?"验证耗时触发了船体危机":message);}});
    return;
  }
  app.innerHTML=`<section class="screen narrow"><button class="btn secondary small" id="backHub">← 返回调查甲板</button><div class="chapter-head local-head"><div><p class="eyebrow">EVIDENCE CHAINS</p><h2>亲自连接证据</h2><p class="chapter-summary">核心证据是已选证据的必要子集；同一调查来源只计算其中证明力最高的一项。每条成功连接只消耗 2 分钟。</p></div><div class="chapter-no">${state.connections.length}/4</div></div><div class="deduction-list">${CONNECTIONS.map((c,i)=>{const done=state.connections.includes(c.id),locked=connectionLocked(c.id),review=connectionReviewAvailable(c.id);const score=evidenceScore(state.connectionEvidence[c.id]||[]),status=state.difficulty==="extreme"?(done?'证明力已满足':'根据独立来源判断是否充分'):(done?`已封存 ${score}/${c.threshold} 分证据。`:`从案卷中选择核心证据和合法补强证据，达到 ${c.threshold} 分。`);return `<div class="deduction ${done?'done':''}"><h3><span>CHAIN 0${i+1}</span>${done?c.title:c.question}</h3>${done?`<p>${c.result}</p><p class="muted">${status}</p>`:`<p class="muted">${locked?'验证已锁定：进入后可付出时间复核，且只会锁定这一次':status}</p><button class="btn small" data-connection="${c.id}">${review?'进入案卷复核':'开始连接'}</button>`}</div>`;}).join("")}</div></section>`;
  document.querySelector("#backHub").addEventListener("click",()=>setScreen("hub"));
  document.querySelectorAll("[data-connection]").forEach(el=>el.addEventListener("click",()=>{state.flags.activeConnection=el.dataset.connection;state.flags.connectionDraft=[];saveState("");renderConnections();}));
}

function interviewPollution(id){return state.interviews[id]?.independent===false;}
function interviewRoutes(cfg){return [cfg.requires,...(cfg.alternatives||[])];}
function interviewPrerequisites(id,cfg){return interviewRoutes(cfg).some(hasAll)&&(id!=="liangyin"||state.interviews.han?.broken||physicalProofValid("han"));}
function interviewNeeds(cfg){return interviewRoutes(cfg).map((route,i)=>`路线 ${String.fromCharCode(65+i)}：${route.map(x=>`${has(x)?'●':'○'} ${CLUES[x].t}`).join("　")}`).join("<br>");}
function firstQuestionPanel(id,rec){
  const selected=rec.firstAnswers||[],questions=FIRST_QUESTIONS[id];
  return `<div class="puzzle-board"><p class="puzzle-instruction">第一轮只能选择两个中性问题，每题 4 分钟。问题会直接开放时间、位置、声音或信任方向。${state.flags.contaminated?' 信息已经交换；隔离不能恢复这份证词的独立性。':''}</p><div class="question-grid">${questions.map(item=>`<button class="approach ${selected.includes(item.id)?'selected':''}" data-first-question="${item.id}" ${selected.includes(item.id)?'disabled':''}><b>${item.q}</b><small>${selected.includes(item.id)?item.a:`${QUESTION_EFFECTS[item.id]} · 不出示证据`}</small></button>`).join("")}</div><p class="muted">已记录 ${selected.length}/2 个问题</p></div>`;
}
function applyFirstQuestionEffects(id,rec){
  rec.questionEffects=[...new Set((rec.firstAnswers||[]).map(answer=>QUESTION_EFFECTS[answer]))];
  state.flags.questionLeads=state.flags.questionLeads||{};state.flags.questionLeads[id]=[...(rec.firstAnswers||[])];
  rec.trust=(rec.firstAnswers||[]).includes("fear")?1.5:1;
  const answers=Object.values(state.interviews).flatMap(record=>record.firstAnswers||[]),count=type=>answers.filter(answer=>answer===type).length;
  state.flags.timelineQuestionCredit=count("last");
  updateDerivedTestimony("last");updateDerivedTestimony("place");updateDerivedTestimony("sound");
  return "两个问题已产生不同调查收益";
}
function grantTrustBenefit(id,rec){
  if(rec.trust<2||rec.trustBenefit)return "";const benefit=TRUST_BENEFITS[id];if(!benefit)return "";
  rec.trustBenefit=true;rec.trustShield=true;if(benefit.clues)addClues(benefit.clues);if(benefit.flag)state.flags[benefit.flag]=true;return benefit.text;
}
function renderInterviews(){
  const recorded=Object.values(state.interviews).filter(x=>x.originalRecorded).length;
  app.innerHTML=`<section class="screen"><button class="btn secondary small" id="backHub">← 返回调查甲板</button><div class="chapter-head local-head"><div><p class="eyebrow">TESTIMONY ROOM · ${clock()}</p><h2>每个人都在保护凶手</h2><p class="chapter-summary">第一轮先保存未经污染的版本；第二、三轮才用物证突破。梁音的最终知识泄漏只会在满足门槛的剧场对质中成立。</p></div><div class="chapter-no">${recorded}/6</div></div>${state.flags.contaminated?`<div class="ship-warning testimony-warning"><b>信息已经传播</b><span>此后才记录的口供不能作为独立证言。隔离可阻止继续传播，但不能洗净已经交换的信息。</span></div>`:""}<div class="suspect-grid">${Object.entries(PEOPLE).map(([id,p])=>{const rec=state.interviews[id];const status=rec?.broken?"证词已突破":rec?.cornered?"退路已封锁，等待对质":rec?.closed?"话题已封闭":rec?.falseConfession?"出现虚假认罪":rec?.originalRecorded?(rec.independent?"原始证词已封存":"传播后证词"):"尚未记录";return `<button class="suspect-card ${rec?.broken?'done':''} ${rec?.cornered?'cornered':''} ${rec?.closed?'closed':''}" data-person="${id}"><span class="card-index">${p.age}岁 · ${p.role}</span><h3>${p.name}</h3><p>${rec?.broken?INTERVIEWS[id].result:rec?.cornered?'监听、覆盖与回收证据已经让她无法继续回避；最后诱导必须留到剧场。':p.desc}</p><div class="suspect-meta"><span>保护：${p.protect}</span><span>${status}</span></div></button>`;}).join("")}</div></section>`;
  document.querySelector("#backHub").addEventListener("click",()=>setScreen("hub"));
  document.querySelectorAll("[data-person]").forEach(el=>el.addEventListener("click",()=>{state.flags.activePerson=el.dataset.person;setScreen("interview");}));
}

function renderInterview(){
  const id=state.flags.activePerson,p=PEOPLE[id],cfg=INTERVIEWS[id],rec=state.interviews[id]||{attempts:0,alert:0,pressure:0,trust:0,broken:false,closed:false,originalRecorded:false,firstAnswers:[]};state.interviews[id]=rec;rec.firstAnswers=rec.firstAnswers||[];
  const req=interviewNeeds(cfg);
  const claim=rec.broken?cfg.result:rec.cornered?"“你已经知道程序发生了什么。剩下的那句话，我只会在所有人面前回答。”":rec.falseConfession?`“不用再问了。我承认是我做的，其他人什么都不知道。”——这份口供能解释部分物证，却出现了与现场不符的细节。`:cfg.claim;
  const recordedAnswers=rec.originalRecorded?`<div class="original-record"><p class="eyebrow">ORIGINAL RECORD · ${rec.independent?'INDEPENDENT':'CONTAMINATED'}</p>${rec.firstAnswers.map(answer=>{const item=FIRST_QUESTIONS[id].find(q=>q.id===answer);return `<p><b>${item.q}</b><br>${item.a}<small>${QUESTION_EFFECTS[answer]}</small></p>`;}).join("")}</div>`:"";
  const status=rec.broken?'被证据修正后的证词':rec.cornered?'等待最终剧场对质':rec.closed?'话题封闭':rec.falseConfession?'高压虚假认罪':rec.originalRecorded?(rec.independent?'原始证词':'传播后证词'):'尚未正式记录';
  const controls=!rec.originalRecorded?firstQuestionPanel(id,rec):rec.broken?`<div class="reveal"><p class="eyebrow">TESTIMONY BROKEN</p><h3>${cfg.evidence}</h3><p>${cfg.result}</p>${rec.trustBenefit?`<p class="degraded-note">信任路线已生效：${TRUST_BENEFITS[id].text}</p>`:""}</div>`:rec.cornered?`<div class="reveal"><p class="eyebrow">READY FOR FINAL CONFRONTATION</p><h3>梁音的普通审讯已经结束</h3><p>她没有泄露求救原句，也尚未形成正式突破。完成两条最终证据链后，在剧场使用错误前提。</p></div>`:rec.closed?`<div class="ship-warning"><b>话题已封闭</b><span>本人口供无法继续，但三项独立物证仍可确认其客观行为。</span></div>`:`<div class="puzzle-board"><p class="puzzle-instruction">第二/三轮：可以先建立信任，也可以直接质证。“最担心什么”只把信任提高到 1.5；仍需一次温和交流才能取得专属线索。${difficultyRules().showNeeds?`<br>证据条件：${req}`:'极难模式不显示缺失物证。'}${id==='liangyin'&&!state.interviews.han?.broken&&!physicalProofValid('han')?' 梁音的最终追问还需要韩九章的证词或三项独立机械物证。':''}</p><div class="approach-grid">${Object.entries(cfg.options).map(([key,label])=>`<button class="approach" data-technique="${key}"><b>${label}</b><small>${techniqueHelp(key)}</small></button>`).join("")}</div>${difficultyRules().showMeters?`<div class="interview-meters"><span>警觉 ${rec.alert}/3</span><span>压力 ${rec.pressure}/3</span><span>信任 ${rec.trust}/2</span><span>正式审讯 ${rec.attempts}/${difficultyRules().maxInterviews===99?'∞':difficultyRules().maxInterviews}</span></div>`:""}</div>`;
  app.innerHTML=`<section class="screen narrow"><button class="btn secondary small" id="backInterviews">← 返回审讯列表</button><div class="dialogue" style="margin-top:28px"><div class="speaker"><div class="portrait">${p.glyph}</div><div class="speech"><b>${p.name} · ${status}</b><p>${claim}</p></div></div>${recordedAnswers}${controls}</div></section>`;
  document.querySelector("#backInterviews").addEventListener("click",()=>setScreen("interviews"));
  document.querySelectorAll("[data-first-question]").forEach(el=>el.addEventListener("click",()=>{if(rec.firstAnswers.length>=2)return;rec.firstAnswers.push(el.dataset.firstQuestion);advance(4);let benefit="";if(rec.firstAnswers.length===2){rec.originalRecorded=true;rec.independent=!state.flags.contaminated;benefit=applyFirstQuestionEffects(id,rec);}saveState("");render();if(rec.originalRecorded)toast(benefit||`${rec.independent?'两个原始回答已独立封存':'两个回答已记录但受到污染'}；问题方向已经开放`);}));
  document.querySelectorAll("[data-technique]").forEach(el=>el.addEventListener("click",()=>resolveInterview(id,el.dataset.technique)));
}
function techniqueHelp(k){return {open:"不给时间与证据，让对方自由叙述。",contradict:"同时出示可以互相验证的物证。",transfer:"声称对方保护的人即将承担罪名。",silence:"回答后不继续追问。",limited:"限定地点、时段和具体动作。",technical:"区分主制动、第二制动、配重与旋转轨道。",pressure:"提高压力，可能得到虚假认罪。",false:"故意说错求救内容，观察是否纠正。"}[k]||"观察对方如何改变叙事。";}
function resolveInterview(id,tech){
  const cfg=INTERVIEWS[id],rec=state.interviews[id];if(rec.closed||rec.broken)return;
  rec.attempts++;advance(rec.trust>=2?10:15);let trustMessage="";const rapport=tech==="open"||tech==="silence"||(id==="suwan"&&tech==="limited");if(tech==="pressure")rec.pressure++;else if(rapport){rec.trust=Math.min(2,rec.trust+.5);trustMessage=grantTrustBenefit(id,rec);}else if(rec.trustShield)rec.trustShield=false;else rec.alert++;
  const prerequisites=interviewPrerequisites(id,cfg);
  const leakValid=id!=="liangyin"||rec.independent||state.flags.misinformationTrace;
  if(tech===cfg.correct&&prerequisites&&leakValid){
    rec.falseConfession=false;
    if(id==="liangyin"){rec.cornered=true;rec.status="cornered";state.flags.liangyinCornered=true;saveState("");render();toast("梁音的退路已被封住；知识泄漏必须在最终对质中取得");return;}
    rec.broken=true;rec.status="corrected";state.flags[`harm_${id}`]=true;saveState("");render();toast("证词已由物证修正");return;
  }
  if(!rapport)state.errors++;
  if(rec.pressure>=2){rec.falseConfession=true;rec.status="false-confession";}
  if(rec.attempts>=difficultyRules().maxInterviews||rec.alert>=3&&state.difficulty!=="normal")rec.closed=true;
  saveState("");render();
  if(id==="liangyin"&&tech===cfg.correct&&!leakValid)toast("她的纠正已可能来自串供，不能作为知识泄漏");
  else if(trustMessage)toast(trustMessage);
  else if(rec.falseConfession)toast("压力过高：出现了能够解释部分物证的虚假认罪");
  else if(tech===cfg.correct)toast("方法正确，但证据链或前置证词仍不完整");
  else toast(rec.closed?"警觉/次数达到上限，这个话题已封闭":"回答已根据你出示的证据发生变化");
}

function puzzleReady(p){if(!hasAll(p.requires))return false;if(p.requiresAny&&p.requiresAny.filter(has).length<(p.minimum||1))return false;if(p.requiresHyp&&!state.hypotheses.includes(p.requiresHyp))return false;if(p.requiresFlag&&!state.flags[p.requiresFlag])return false;if(p.experiment&&state.experimentUses>=experimentLimit())return false;return true;}
function randomizedPuzzleOptions(id,group,options){state.flags.puzzleOptionOrder=state.flags.puzzleOptionOrder||{};const key=`${id}:${group}`,values=options.map(option=>option[0]);let order=state.flags.puzzleOptionOrder[key];if(!Array.isArray(order)||order.length!==values.length||order.some(value=>!values.includes(value))){order=[...values];for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}state.flags.puzzleOptionOrder[key]=order;}return order.map(value=>options.find(option=>option[0]===value));}
function puzzleHintHTML(id){const shown=state.flags.puzzleHints?.[id];return shown?`<p class="degraded-note puzzle-hint"><b>提示：</b>${shown}</p>`:"";}
function showPuzzleHint(id){state.flags.puzzleHints=state.flags.puzzleHints||{};if(!state.flags.puzzleHints[id]){state.flags.puzzleHints[id]=PUZZLE_HINTS[id]||"重新检查题面中能够固定先后或排除其他解释的物理条件。";state.hints++;}saveState("");render();toast("该谜题的专属提示已写入复原桌");}
function renderPuzzles(){
  app.innerHTML=`<section class="screen"><button class="btn secondary small" id="backHub">← 返回调查甲板</button><div class="chapter-head local-head"><div><p class="eyebrow">RECONSTRUCTION TABLE</p><h2>实验、复原与交叉比对</h2><p class="chapter-summary">四项大型专业检验中可任选 ${experimentLimit()} 项；未选项目均能以现场物证、记录和证词形成等价路线。</p></div><div class="chapter-no">${state.experimentUses}/${experimentLimit()}</div></div><div class="location-grid">${PUZZLES.map((p,i)=>{const done=state.puzzles.includes(p.id),ready=puzzleReady(p);const missing=p.requires.filter(x=>!has(x)).map(x=>CLUES[x].t);const blocked=p.requiresFlag&&!state.flags[p.requiresFlag]?'需要先在甲板完成“准备错误时间追踪”':state.difficulty==='extreme'?'前置条件未满足':p.experiment&&state.experimentUses>=experimentLimit()?'次数已用尽：现场物证替代路线仍可完成最高结局':missing.length?`缺少：${missing.join("、")}`:'需要先确认至少四种独立加害并提出对应假说';return `<button class="location-card ${done?'done':''}" data-puzzle="${p.id}" ${!ready?'disabled':''}><span class="card-index">${p.experiment?'LARGE TEST':'RECONSTRUCTION'} · 0${i+1}</span><h3>${p.title}</h3><p>${done?'复原完成，可作为独立证据。':ready?p.desc:blocked}</p><span class="card-icon">${i+1}</span></button>`;}).join("")}</div></section>`;
  document.querySelector("#backHub").addEventListener("click",()=>setScreen("hub"));
  document.querySelectorAll("[data-puzzle]").forEach(el=>el.addEventListener("click",()=>{state.flags.activePuzzle=el.dataset.puzzle;setScreen("puzzle");}));
}

function completePuzzle(id,clues=[]){const config=PUZZLES.find(x=>x.id===id);if(config?.experiment)state.experimentUses++;if(!state.puzzles.includes(id))state.puzzles.push(id);addClues(clues);const minutes=id==="timeline"?Math.max(15,25-Math.min(5,state.flags.timelineQuestionCredit||0)*2):20;advance(minutes,id==="timeline"?3:1);delete state.flags.puzzleAnswers;saveState("");setScreen("puzzles");toast(id==="timeline"?`时间线复原完成 · 耗时 ${minutes} 分钟`:"复原完成，证据链已更新");}
function puzzleMistake(message){state.errors++;if(state.difficulty!=="normal")advance(5,state.difficulty==="extreme"?2:1);saveState("");render();toast(message);}
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
  else if(id==="misinformation")renderMisinformationPuzzle(head);
  else if(id==="timeline")renderTimelinePuzzle(head);
  else renderSequence(head,"1978年的九十秒","先排列三次制造危险，再指出哪一个决定让死亡不可逆。",[["pin","韩九章拆除二级安全销"],["fire","白砚提前触发焰火"],["door","梁素琴移动后台门"],["delay","祁重楼听见呼救后命令继续九十秒"]],["pin","fire","door","delay"],()=>completePuzzle("oldcase"));
}

function misinformationObservation(outcome){
  if(!outcome)return "先完成两个时间版本、投放顺序与接收人。";
  const wording={normal:outcome.direct?"这个时间，是有人在电话里单独告诉我的。":"这个时间……我是在走廊上听人提起的。",hard:outcome.direct?"这句话只对我说过一次。":"这句话在走廊上被重复过。",extreme:outcome.direct?"我只听见一个人的声音。":"我记得那句话，不记得第一个说的人。"}[state.difficulty];
  return `下一轮记录中，梁音说：“${outcome.time}之后我没有再操作。${wording}”`;
}
function renderMisinformationPuzzle(head){
  const a=state.flags.misinformationAnswers||{timeA:"",timeB:"",delivery:"",recipientA:"",recipientB:"",inference:"",inferenceMode:""};state.flags.misinformationAnswers=a;
  const times=["00:35","00:36","00:38","00:40"],recipients=[["liangsuqin","梁素琴"],["qiyue","祁越"],["suwan","苏晚"],["han","韩九章"],["baiyan","白砚"]];
  const distinctTimes=a.timeA&&a.timeB&&a.timeA!==a.timeB,distinctPeople=a.recipientA&&a.recipientB&&a.recipientA!==a.recipientB,outcome=distinctTimes&&distinctPeople&&a.delivery?misinformationOutcome(a):null,ready=outcome&&a.inference&&a.inferenceMode;
  const timeOptions=times.map(value=>[value,value]),timeRow=key=>randomizedPuzzleOptions("misinformation",key,timeOptions).map(([value,label])=>`<button class="option-pill ${a[key]===value?'active':''}" data-misinfo-key="${key}" data-misinfo-value="${value}">${label}</button>`).join("");
  const personRow=key=>randomizedPuzzleOptions("misinformation",key,recipients).map(([value,label])=>`<button class="option-pill ${a[key]===value?'active':''}" data-misinfo-key="${key}" data-misinfo-value="${value}">${label}</button>`).join("");
  const deliveryOptions=randomizedPuzzleOptions("misinformation","delivery",[["a-first","先A后B"],["simultaneous","同时投放"],["b-first","先B后A"]]),modeOptions=randomizedPuzzleOptions("misinformation","mode",[["direct","直接传递"],["relay","经过中间人"]]);
  app.innerHTML=`<section class="screen narrow">${head}<div class="puzzle-board" style="margin-top:24px"><p class="eyebrow">INFORMATION TRACE</p><h2>错误时间传播</h2><p class="puzzle-instruction">错误数字只是信息内容，不参与传播计时。抵达速度只由投放先后、人物关系路径与转告意愿决定。</p>${puzzleHintHTML("misinformation")}<div class="deduction"><h3><span>01</span>选择版本 A 与版本 B</h3><p class="muted">版本 A</p><div class="option-row">${timeRow("timeA")}</div><p class="muted">版本 B</p><div class="option-row">${timeRow("timeB")}</div>${a.timeA===a.timeB&&a.timeA?'<p class="degraded-note">两个版本必须不同。</p>':''}<p class="muted">投放顺序</p><div class="option-row">${deliveryOptions.map(([value,label])=>`<button class="option-pill ${a.delivery===value?'active':''}" data-misinfo-key="delivery" data-misinfo-value="${value}">${label}</button>`).join("")}</div></div><div class="deduction"><h3><span>02</span>分别投放给不同的人</h3><p class="muted">版本 A 接收人</p><div class="option-row">${personRow("recipientA")}</div><p class="muted">版本 B 接收人</p><div class="option-row">${personRow("recipientB")}</div>${a.recipientA===a.recipientB&&a.recipientA?'<p class="degraded-note">同一个人不能同时作为两条独立传播起点。</p>':''}</div><div class="deduction"><h3><span>03</span>观察并判断来源</h3><p>${misinformationObservation(outcome)}</p><p class="muted">先判断这句时间属于哪一版，再反推最初接收者与传播方式。</p><div class="option-row">${outcome?randomizedPuzzleOptions("misinformation","inference",recipients.filter(([id])=>[a.recipientA,a.recipientB].includes(id))).map(([id,label])=>`<button class="option-pill ${a.inference===id?'active':''}" data-misinfo-key="inference" data-misinfo-value="${id}">起点是 ${label}</button>`).join(""):''}</div><div class="option-row">${outcome?modeOptions.map(([value,label])=>`<button class="option-pill ${a.inferenceMode===value?'active':''}" data-misinfo-key="inferenceMode" data-misinfo-value="${value}">${label}</button>`).join(""):''}</div></div><div class="puzzle-actions"><button class="btn" id="checkMisinformation" ${!ready?'disabled':''}>固定传播路线</button><button class="btn secondary" id="hintPuzzle">获得提示</button></div></div></section>`;
  bindPuzzleBack();document.querySelectorAll("[data-misinfo-key]").forEach(el=>el.addEventListener("click",()=>{a[el.dataset.misinfoKey]=el.dataset.misinfoValue;saveState("");render();}));
  document.querySelector("#hintPuzzle").addEventListener("click",()=>showPuzzleHint("misinformation"));
  document.querySelector("#checkMisinformation")?.addEventListener("click",()=>{if(misinformationSolved(a)){state.flags.misinformationTrace=true;state.flags.misinformationRoute={...a,outcome:misinformationOutcome(a)};delete state.flags.misinformationAnswers;completePuzzle("misinformation",["propagationTrace"]);}else puzzleMistake("传播起点或直接/转述方式不符；比较人物关系链与抵达速度");});
}
const PROPAGATION_PATHS={liangsuqin:["liangsuqin","liangyin"],han:["han","liangyin"],baiyan:["baiyan","liangsuqin","liangyin"],suwan:["suwan","han","liangyin"],qiyue:["qiyue","suwan","han","liangyin"]};
function misinformationOutcome(a){
  if(!a.timeA||!a.timeB||a.timeA===a.timeB||!a.delivery||!a.recipientA||!a.recipientB||a.recipientA===a.recipientB)return null;
  const order={"a-first":[0,4],simultaneous:[0,0],"b-first":[4,0]}[a.delivery],willingness={liangsuqin:0,han:1,baiyan:2,suwan:1,qiyue:2};
  const candidates=[["A",a.timeA,a.recipientA,order[0]],["B",a.timeB,a.recipientB,order[1]]].map(([version,time,recipient,deliveryDelay])=>{const path=PROPAGATION_PATHS[recipient]||[recipient,"liangyin"];return {version,time,recipient,path,direct:path.length===2,arrival:deliveryDelay+(path.length-1)*3+(willingness[recipient]||0)};});
  return candidates.sort((left,right)=>left.arrival-right.arrival||left.version.localeCompare(right.version))[0];
}
function misinformationSolved(a){const outcome=misinformationOutcome(a);return !!(outcome&&a.inference===outcome.recipient&&a.inferenceMode===(outcome.direct?"direct":"relay"));}

function renderSelectPuzzle(head,title,instruction,groups,answers,onDone){
  const picked=state.flags.puzzleAnswers||[],id=state.flags.activePuzzle;state.flags.puzzleAnswers=picked;
  app.innerHTML=`<section class="screen narrow">${head}<div class="puzzle-board" style="margin-top:24px"><p class="eyebrow">MECHANICAL RECONSTRUCTION</p><h2>${title}</h2><p class="puzzle-instruction">${instruction}</p>${puzzleHintHTML(id)}${groups.map((g,i)=>`<div class="deduction"><h3><span>0${i+1}</span>${g[0]}</h3><div class="option-row">${randomizedPuzzleOptions(id,i,g[1]).map(([v,l])=>`<button class="option-pill ${picked[i]===v?'active':''}" data-pick-index="${i}" data-pick-value="${v}">${l}</button>`).join("")}</div></div>`).join("")}<div class="puzzle-actions"><button class="btn" id="checkPuzzle" ${picked.filter(Boolean).length<answers.length?'disabled':''}>验证复原</button><button class="btn secondary" id="hintPuzzle">获得专属提示</button></div></div></section>`;
  bindPuzzleBack();document.querySelectorAll("[data-pick-index]").forEach(el=>el.addEventListener("click",()=>{picked[+el.dataset.pickIndex]=el.dataset.pickValue;saveState("");render();}));
  document.querySelector("#hintPuzzle").addEventListener("click",()=>showPuzzleHint(id));
  document.querySelector("#checkPuzzle").addEventListener("click",()=>{if(answers.every((x,i)=>picked[i]===x))onDone();else puzzleMistake("组合不能解释全部标记，再检查方向与机械用途");});
}
function renderSequence(head,title,instruction,events,correct,onDone){
  const selected=state.flags.puzzleAnswers||[],id=state.flags.activePuzzle;state.flags.puzzleAnswers=selected;const scrambled=randomizedPuzzleOptions(id,"bank",events);
  app.innerHTML=`<section class="screen narrow">${head}<div class="puzzle-board" style="margin-top:24px"><p class="eyebrow">RECONSTRUCTION</p><h2>${title}</h2><p class="puzzle-instruction">${instruction}</p>${puzzleHintHTML(id)}<div class="sequence">${selected.map((eventId,i)=>`<button class="event-card" data-remove="${eventId}" data-order="${i+1}">${events.find(x=>x[0]===eventId)[1]}</button>`).join("")}</div><div class="card-bank">${scrambled.map(e=>`<button class="event-card ${selected.includes(e[0])?'selected':''}" data-add="${e[0]}">${e[1]}</button>`).join("")}</div><div class="puzzle-actions"><button class="btn" id="checkPuzzle" ${selected.length!==events.length?'disabled':''}>验证顺序</button><button class="btn secondary" id="hintPuzzle">获得专属提示</button></div></div></section>`;
  bindPuzzleBack();document.querySelectorAll("[data-add]").forEach(el=>el.addEventListener("click",()=>{if(!selected.includes(el.dataset.add))selected.push(el.dataset.add);saveState("");render();}));document.querySelectorAll("[data-remove]").forEach(el=>el.addEventListener("click",()=>{state.flags.puzzleAnswers=selected.filter(x=>x!==el.dataset.remove);saveState("");render();}));
  document.querySelector("#hintPuzzle").addEventListener("click",()=>showPuzzleHint(id));
  document.querySelector("#checkPuzzle").addEventListener("click",()=>{if(correct.every((x,i)=>selected[i]===x))onDone();else puzzleMistake("顺序仍有断裂：区分演出前准备、受伤、进水、求救和回升");});
}
function timelineDiscovered(id){return {drug:has("drugWine"),poison:has("aconite"),wire:has("cutRope"),brake:has("brakeDamage")||has("maintenanceLog"),restore:has("secondBrake")||hasAll(["springMissing","maintenanceLog","freshBrakeOil"]),bullet:has("liveBullet")||has("gunRegistry"),fall:has("backupRope"),shot:has("mirrorWound")||hasAll(["mirrorImpact","glassPowder"]),lower:(has("brakeDamage")||has("maintenanceLog"))&&has("tankSample"),call:has("recoveredVoice")||has("talkButton"),rotate:has("overrideBurn")&&has("motorLog"),track:has("trackMisalign"),drown:state.connections.includes("waterSource")&&state.connections.includes("victimAlive"),return:has("lockManual")}[id];}
function timelineLabel(id){
  const named=state.difficulty==="normal"||({drug:"baiyan",poison:"liangsuqin",wire:"suwan",brake:"han",restore:"han",bullet:"qiyue",rotate:"liangyin"}[id]&&state.interviews[{drug:"baiyan",poison:"liangsuqin",wire:"suwan",brake:"han",restore:"han",bullet:"qiyue",rotate:"liangyin"}[id]]?.broken);
  const labels={drug:named?"白砚在红酒中加入镇静药":"有人处理过祁重楼的红酒",poison:named?"梁素琴在面具内涂乌头":"银色面具被重新缝入药膏",wire:named?"苏晚切断主威亚":"主威亚发生人为断裂",brake:named?"韩九章破坏主制动":"主制动遭人为磨削",restore:named?"韩九章恢复第二制动":"第二制动在演出前被恢复",bullet:named?"祁越更换真子弹":"一发实弹被装入舞台枪",fall:"高台坠落，但备用绳限制高度",shot:"实弹击碎镜墙，玻璃造成伤口",lower:"布景舱异常下降进入暴雨水槽",call:"舱内通话按钮被持续按住并发出求救",rotate:named?"梁音在警报后确认继续旋转":"进水警报后出现人工覆盖与旋转负载",track:"旋转导致应急配重轨道错位",drown:"活体挣扎与淡水来源共同确认溺亡",return:"自动程序将锁死的布景舱送回中层"};return labels[id];
}
function renderTimelinePuzzle(head){
  const available=TIMELINE.filter(e=>timelineDiscovered(e[0])).map(e=>[e[0],timelineLabel(e[0])]);
  const selected=(state.flags.puzzleAnswers||[]).filter(id=>available.some(e=>e[0]===id));state.flags.puzzleAnswers=selected;
  const scrambled=randomizedPuzzleOptions("timeline","bank",available);
  const timelineCost=Math.max(15,25-Math.min(5,state.flags.timelineQuestionCredit||0)*2);
  app.innerHTML=`<section class="screen narrow">${head}<div class="puzzle-board" style="margin-top:24px"><p class="eyebrow">DYNAMIC TIMELINE · ${available.length}/14</p><h2>第七幕时间线</h2><p class="puzzle-instruction">时间线只显示你已发现的事件。物证未归属人物前使用中性描述；全部十四个节点出现后才能正式固定。“最后见面”问询已将复原耗时降至 ${timelineCost} 分钟。已放入的节点可直接上移或下移，无需删除后重排。</p>${puzzleHintHTML("timeline")}<div class="timeline-sequence">${selected.map((id,i)=>`<div class="timeline-event"><span class="timeline-order">${String(i+1).padStart(2,"0")}</span><b>${available.find(x=>x[0]===id)[1]}</b><div class="timeline-controls"><button data-timeline-move="-1" data-timeline-id="${id}" ${i===0?'disabled':''} aria-label="上移">↑</button><button data-timeline-move="1" data-timeline-id="${id}" ${i===selected.length-1?'disabled':''} aria-label="下移">↓</button><button data-remove="${id}" aria-label="移除">×</button></div></div>`).join("")||'<div class="timeline-empty">从下方事件库选择节点</div>'}</div><div class="card-bank timeline-bank">${scrambled.map(e=>`<button class="event-card ${selected.includes(e[0])?'selected':''}" data-add="${e[0]}">${e[1]}</button>`).join("")}</div><div class="puzzle-actions"><button class="btn" id="checkPuzzle" ${available.length<14||selected.length!==14?'disabled':''}>${available.length<14?`还缺 ${14-available.length} 个事件碎片`:'固定完整时间线'}</button><button class="btn secondary" id="hintPuzzle">获得专属提示</button><button class="btn secondary" id="clearTimeline" ${selected.length?'':'disabled'}>清空排序</button></div></div></section>`;
  bindPuzzleBack();document.querySelectorAll("[data-add]").forEach(el=>el.addEventListener("click",()=>{if(!selected.includes(el.dataset.add))selected.push(el.dataset.add);saveState("");render();}));document.querySelectorAll("[data-remove]").forEach(el=>el.addEventListener("click",()=>{state.flags.puzzleAnswers=selected.filter(x=>x!==el.dataset.remove);saveState("");render();}));
  document.querySelectorAll("[data-timeline-move]").forEach(el=>el.addEventListener("click",()=>{const from=selected.indexOf(el.dataset.timelineId),to=from+Number(el.dataset.timelineMove);if(from<0||to<0||to>=selected.length)return;[selected[from],selected[to]]=[selected[to],selected[from]];saveState("");render();}));
  document.querySelector("#hintPuzzle").addEventListener("click",()=>showPuzzleHint("timeline"));document.querySelector("#clearTimeline").addEventListener("click",()=>{state.flags.puzzleAnswers=[];saveState("");render();});
  document.querySelector("#checkPuzzle")?.addEventListener("click",()=>{if(TIMELINE.every((e,i)=>selected[i]===e[0]))completePuzzle("timeline");else puzzleMistake("已有事件顺序仍不能解释警报、求救与旋转的先后关系");});
}
function bindPuzzleBack(){document.querySelector("#backPuzzles").addEventListener("click",()=>{delete state.flags.puzzleAnswers;setScreen("puzzles");});}

function revalidateConnections(){
  state.connections=state.connections.filter(id=>{const connection=CONNECTIONS.find(c=>c.id===id),selected=state.connectionEvidence[id]||[];return connection&&selected.every(has)&&connectionSolvedWith(connection,selected);});
  Object.keys(state.connectionEvidence).forEach(id=>{if(!state.connections.includes(id))delete state.connectionEvidence[id];});
  refreshAutoAttachments();
}
function removeClues(ids){state.clues=state.clues.filter(id=>!ids.includes(id));state.attachments=state.attachments.filter(id=>!ids.includes(id));revalidateConnections();}
function resolveCrisis(choice){
  const crisis=state.flags.pendingCrisis;
  if(crisis==="pump"){
    const weak=!!state.flags.weakPumpCrisis;state.flags.crisisPump=true;delete state.flags.weakPumpCrisis;
    if(choice==="repair"){state.flags.pendingCrisis=null;advance(weak?10:20,0,weak?8:18);}
    else{state.flags.pendingCrisis=null;(weak?["waterTrace"]:["waterTrace","scenePhotos"]).forEach(id=>state.flags.degraded[id]=true);revalidateConnections();}
  }else if(crisis==="archive"){
    state.flags.crisisArchive=true;state.flags.pendingCrisis=null;
    if(choice==="loseLoad"){state.flags.loadTapeLost=true;removeClues(["loadTape"]);}
    if(choice==="loseOld"){state.flags.oldTapeLost=true;state.puzzles=state.puzzles.filter(id=>id!=="oldcase");removeClues(["delayTape"]);}
    if(choice==="loseVideo"){state.flags.formalVideoLost=true;removeClues(["drugWine","reverseFilm"]);state.flags.videoSalvageAvailable=true;state.flags.videoSalvageDeadline=state.elapsed+45;state.flags.videoPhysicalFallback=true;}
  }else if(crisis==="track"){
    state.flags.crisisTrack=true;state.flags.pendingCrisis=null;
    if(choice==="hanRepair"){state.interviews.han=Object.assign(state.interviews.han||{},{closed:true,originalRecorded:true,independent:true});state.flags.hanInterviewLost=true;state.safety=Math.min(100,state.safety+8);}
    if(choice==="force"){addClues(["trackMisalign"]);advance(20,8);}
    if(choice==="close"){removeClues(["liveBullet"]);state.safety=Math.min(100,state.safety+10);state.flags.stageClosed=true;}
  }
  delete state.flags.pendingActionResult;delete state.flags.crisisReportAuthorized;saveState("");
  if(state.flags.evacuation||state.flags.pendingCrisis){setScreen("crisis");return;}
  const target=state.flags.returnAfterCrisis||"hub";delete state.flags.returnAfterCrisis;setScreen(target);
}
function finishEvacuation(choice){
  state.flags.evacChoice=choice;delete state.flags.pendingActionResult;
  if(state.replayMode)previewEnding("M");else unlockEnding("M");
  state.screen="ending";saveState("");render();return state.ending;
}
function renderCrisis(){
  const interrupted=state.flags.pendingActionResult?`<div class="interrupted-result"><p class="eyebrow">BEFORE THE CRISIS</p><h2>危机发生前，调查已经完成</h2>${actionResultHTML(state.flags.pendingActionResult,"ACTION PRESERVED")}</div>`:"";
  if(state.flags.evacuation){
    app.innerHTML=`<section class="screen narrow">${interrupted}<div class="crisis-panel"><p class="eyebrow">ABANDON SHIP · SAFETY 0</p><h1>海水越过了最后一道舱门</h1><p>普通调查已经终止。你只能结案、牺牲证据抢修一次，或进入撤离阶段。</p><div class="crisis-actions"><button class="btn danger" id="crisisReport">立即提交案件报告</button>${!state.flags.emergencyRepair?`<button class="btn" id="sacrificeEvidence">放弃水样与现场原件，抢修排水泵</button>`:""}<button class="btn secondary" data-evacuate="rescue">撤离：优先救援受困者</button><button class="btn secondary" data-evacuate="evidence">撤离：优先保存关键证物</button></div></div></section>`;
    document.querySelector("#crisisReport").addEventListener("click",()=>{state.flags.crisisReportAuthorized=true;setScreen("report");});
    document.querySelector("#sacrificeEvidence")?.addEventListener("click",()=>{state.flags.waterSamplesLost=true;removeClues(["freshWaterProof","tankSample","scenePhotos","handprints"]);state.flags.emergencyRepair=true;state.flags.evacuation=false;state.safety=22;delete state.flags.pendingActionResult;delete state.flags.crisisReportAuthorized;saveState("");const target=state.flags.returnAfterCrisis||"hub";delete state.flags.returnAfterCrisis;setScreen(target);});
    document.querySelectorAll("[data-evacuate]").forEach(el=>el.addEventListener("click",()=>finishEvacuation(el.dataset.evacuate)));
    return;
  }
  const crisis=state.flags.pendingCrisis,weak=crisis==="pump"&&state.flags.weakPumpCrisis;
  const content={pump:weak?["普通模式危机：排水泵短时失压","调查推进后，有人趁乱关闭了一组排水阀。你可以用十分钟恢复压力，或接受一项水迹证据降级；无论选择哪项，完整路线都不会被封死。",[["repair","立即复位 · 10分钟 · 安全 +8"],["continue","继续调查 · 一项水迹降级"]]]:["第一次危机：排水泵失灵","泵房水位正在抹去现场残水。你要用二十分钟维修，还是接受水样降级？",[["repair","立即维修 · 20分钟 · 安全回升"],["continue","继续调查 · 水迹降级"]]],archive:["第二次危机：录像室进水","放弃正式录像后，残余抢救必须在45分钟内完成；已封存资料不占名额，任意两组都能交叉形成可行路线。放弃旧案录音仍会主动牺牲1978年完整结论。",[["loseLoad","保存旧案录音＋正式录像，放弃精确负载校时"],["loseOld","保存正式录像＋负载纸带，放弃旧案录音 · 永久失去A结局"],["loseVideo","保存旧案录音＋负载纸带，放弃正式录像 · 开放限时残余抢救"]]],track:["第三次危机：轨道再次错位","机械层发出第二次撞击。每种处理都会关闭一条调查路线。",[["hanRepair","让韩九章维修：保船，但改用三项机械物证"],["force","亲自强行复原：获得轨道证据，船体风险 −8"],["close","关闭舞台：安全回升，但永久失去外圈弹头"]]]}[crisis];
  if(!content){delete state.flags.pendingCrisis;setScreen("hub");return;}
  app.innerHTML=`<section class="screen narrow">${interrupted}<div class="crisis-panel"><p class="eyebrow">SHIPBOARD CRISIS</p><h1>${content[0]}</h1><p>${content[1]}</p><div class="crisis-actions">${content[2].map(([id,label])=>`<button class="btn ${id==='continue'?'secondary':''}" data-crisis-choice="${id}">${label}</button>`).join("")}</div></div></section>`;
  document.querySelectorAll("[data-crisis-choice]").forEach(el=>el.addEventListener("click",()=>resolveCrisis(el.dataset.crisisChoice)));
}

const CONFRONTATION_COUNTERS={
  han:{required:"rescueBlocked",claim:"主制动损坏只让房间下降，恢复的第二制动本可把它带回来。"},
  qiyue:{required:"victimAlive",claim:"真弹没有直接致死；祁重楼坠落后仍在水中呼救。"},
  liangsuqin:{required:"waterSource",claim:"乌头造成迟缓，却解释不了肺内淡水的来源。"},
  suwan:{required:"movingRoom",claim:"断绳限制了坠落，却不能解释一间房怎样进入水槽。"},
  baiyan:{required:"victimAlive",claim:"镇静药加重风险，但受害者在换酒之后仍然活着。"},
  liangyin:{required:"rescueBlocked",claim:"真正不可逆的动作发生在求救之后：覆盖警报并继续旋转。"}
};
const CONFRONTATION_REACTIONS={
  identity:{support:-1,text:"祁越冲到梁音身前，双胞胎身份的公开让他拒绝继续配合。"},
  relationship:{support:0,text:"梁素琴与白砚沉默地交换视线；关系被记录，但场内阵线没有改变。"},
  threat:{support:1,text:"苏晚不再替梁音遮掩，主动确认威胁录像的拍摄时间。"},
  plagiarism:{support:1,text:"白砚拿回作品署名，也停止替梁音解释被删掉的片段。"},
  letters:{support:1,text:"韩九章读完信件，决定让机械记录按原样进入证词。"},
  withhold:{support:0,text:"你只公开定罪所必需的事实，私人秘密暂时留在密封袋里。"}
};
function confrontationRequirements(){
  return [
    [!!state.interviews.liangyin?.cornered,"嫌疑人的普通证词退路已封锁"],
    [state.connections.includes("victimAlive"),"已证明坠落后仍然存活"],
    [state.connections.includes("rescueBlocked"),"已证明求救后的主动阻断"],
    [!!(state.interviews.han?.broken||physicalProofValid("han")),"已用韩九章证词或三项机械物证证明回收仍可行"],
    [has("recoveredVoice")||has("channels"),"已取得求救内容或控制室监听记录"],
    [has("overrideBurn"),"已取得紧急覆盖烧蚀记录"]
  ];
}
function confrontationReady(){return confrontationRequirements().every(([ready])=>ready);}
function confrontationConnectionLabel(item,requiredId){if(state.difficulty==="normal")return `${item.title}${item.id===requiredId?' · 对应反证':''}`;if(state.difficulty==="extreme")return `结论摘要：${item.result}`;return item.title;}
function completeConfrontation(){
  const rec=state.interviews.liangyin||(state.interviews.liangyin={});
  rec.broken=true;rec.cornered=false;rec.status="corrected";state.flags.harm_liangyin=true;
  addClues(["knowledgeLeak"]);state.flags.confrontationComplete=true;state.flags.knowledgeLeakIndependent=true;
  const support=state.flags.confrontation?.support||0;delete state.flags.crisisReportAuthorized;state.flags.returnAfterCrisis="report";advance(support>0?5:support<0?12:10);saveState("");
  if(state.flags.evacuation||state.flags.pendingCrisis)setScreen("crisis");else{delete state.flags.returnAfterCrisis;setScreen("report");}
}
function renderConfrontation(){
  const c=state.flags.confrontation||{stage:0,opening:"",connection:"",secret:"",support:0};state.flags.confrontation=c;
  const requirements=confrontationRequirements();
  if(!confrontationReady()){
    app.innerHTML=`<section class="screen narrow"><button class="btn secondary small" id="backHub">← 返回调查甲板</button><div class="chapter-head local-head"><div><p class="eyebrow">FINAL CONFRONTATION · LOCKED</p><h2>剧场还不能开灯</h2><p class="chapter-summary">对质不会提前展示诱导答案。先把存活、救援与回收可能性变成可以公开出示的证明。</p></div><div class="chapter-no">${requirements.filter(([ready])=>ready).length}/${requirements.length}</div></div><div class="puzzle-board requirement-list">${requirements.map(([ready,label])=>`<p class="${ready?'ready':''}"><b>${ready?'✓':'○'}</b>${label}</p>`).join("")}</div></section>`;
    document.querySelector("#backHub").addEventListener("click",()=>setScreen("hub"));return;
  }
  const names=Object.entries(PEOPLE),availableSecrets=Object.entries(SECRET_CONFIG).filter(([,config])=>config.unlocked());
  const opening=c.opening?PEOPLE[c.opening]:null,counter=CONFRONTATION_COUNTERS[c.opening],connection=c.connection?CONNECTIONS.find(item=>item.id===c.connection):null;
  const reaction=c.secret?CONFRONTATION_REACTIONS[c.secret]:null;
  const history=`${opening?`<div class="confrontation-line"><b>你先点名 ${opening.name}</b><span>${counter.claim}</span></div>`:""}${connection?`<div class="confrontation-line"><b>你出示「${connection.title}」</b><span>${connection.result}</span></div>`:""}${reaction?`<div class="confrontation-line"><b>${c.secret==="withhold"?'你密封了私人秘密':`你公开「${SECRET_CONFIG[c.secret]?.label}」`}</b><span>${reaction.text}</span></div>`:""}`;
  let current="";
  if(c.stage===0)current=`<div class="deduction"><h3><span>CONFRONT 01</span>先击破哪一种推卸？</h3><p class="muted">每个人只能由与其辩解直接对应的证据连接反驳；缺少专属连接时不能选择。</p><div class="option-row">${names.map(([id,p])=>{const item=CONFRONTATION_COUNTERS[id],ready=state.connections.includes(item.required);return `<button class="option-pill" data-confront-opening="${id}" ${ready?'':'disabled'}>${p.name} · ${ready?'可反驳':'缺专属连接'}</button>`;}).join("")}</div></div>`;
  else if(c.stage===1){const required=CONNECTIONS.find(item=>item.id===counter.required);current=`<div class="deduction"><h3><span>CONFRONT 02</span>出示对应反证</h3><p class="muted">${opening.name}的推卸只能由一条直接相关的连接击破。选错会消耗 5 分钟，但不会推进对质。${state.difficulty==="normal"?'普通模式会标记对应关系。':state.difficulty==="hard"?'困难模式不标记正确连接。':'极难模式只显示你封存的结论摘要。'}</p><div class="option-row">${CONNECTIONS.filter(item=>state.connections.includes(item.id)).map(item=>`<button class="option-pill" data-confront-connection="${item.id}">${confrontationConnectionLabel(item,required.id)}</button>`).join("")}</div></div>`;}
  else if(c.stage===2)current=`<div class="deduction"><h3><span>CONFRONT 03</span>现场公开哪个秘密？</h3><p class="muted">现场只能使用一个秘密改变支持与对质耗时。公开后不能撤回；其他已发现秘密仍可在最终报告中追加。</p><div class="option-row">${availableSecrets.map(([id,config])=>`<button class="option-pill" data-confront-secret="${id}">现场公开：${config.label}</button>`).join("")}<button class="option-pill" data-confront-secret="withhold">现场不公开私人秘密</button></div></div>`;
  else current=`<div class="deduction"><h3><span>CONFRONT 04</span>向梁音投下一个错误前提</h3><p class="muted">故意错述求救内容。只有在当时听清原句的人，才会本能地纠正你。</p><div class="option-row"><button class="option-pill" data-confront-premise="lower">“他说的是停止升降。”</button><button class="option-pill" data-confront-premise="rotate">“他说的是停止旋转。”</button></div></div>`;
  app.innerHTML=`<section class="screen narrow"><button class="btn secondary small" id="backHub">← 返回调查甲板</button><div class="chapter-head local-head"><div><p class="eyebrow">FINAL CONFRONTATION · ${clock()}</p><h2>没有观众的最后一幕</h2><p class="chapter-summary">调查结果决定可用台词；每次反驳必须来自与人物推卸直接对应的证据。</p></div><div class="chapter-no">${Math.min(c.stage+1,4)}/4</div></div><div class="confrontation-history">${history}</div><div class="puzzle-board">${current}</div></section>`;
  document.querySelector("#backHub").addEventListener("click",()=>setScreen("hub"));
  document.querySelectorAll("[data-confront-opening]").forEach(el=>el.addEventListener("click",()=>{c.opening=el.dataset.confrontOpening;c.connection="";c.stage=1;saveState("");render();}));
  document.querySelectorAll("[data-confront-connection]").forEach(el=>el.addEventListener("click",()=>{if(el.dataset.confrontConnection!==CONFRONTATION_COUNTERS[c.opening].required){state.errors++;advance(5);saveState("");render();toast("这条连接不能直接击破当前推卸");return;}c.connection=el.dataset.confrontConnection;c.stage=2;saveState("");render();}));
  document.querySelectorAll("[data-confront-secret]").forEach(el=>el.addEventListener("click",()=>{c.secret=el.dataset.confrontSecret;const reaction=CONFRONTATION_REACTIONS[c.secret];c.support=reaction.support;state.flags.mandatoryDisclosure=c.secret==="withhold"?null:c.secret;state.flags.reportDisclosureMode="sealed";state.disclosure=state.flags.mandatoryDisclosure?[state.flags.mandatoryDisclosure]:[];c.stage=3;saveState("");render();}));
  document.querySelectorAll("[data-confront-premise]").forEach(el=>el.addEventListener("click",()=>{if(el.dataset.confrontPremise!=="lower"){state.errors++;advance(5);saveState("");render();toast("梁音没有纠正这句真实内容；错误前提尚未成立");return;}if(!confrontationReady()){c.stage=0;saveState("");render();return;}completeConfrontation();toast("梁音纠正了你：他说的是停止旋转。知识泄漏已成为正式证言");}));
}

const REPORT_OPTIONS={
  culprit:[["liangyin","梁音"],["han","韩九章"],["qiyue","祁越"],["liangsuqin","梁素琴"],["suwan","苏晚"],["baiyan","白砚"],["collective","六人共同"],["accident","设备事故"]],
  cause:[["drowning","淡水溺亡"],["poison","乌头中毒"],["bullet","枪伤失血"],["fall","坠落内伤"],["sedative","镇静药过量"]],
  room:[["moving","第七号布景舱下降后回升"],["locked","凶手离开后用线反锁"],["flood","暴雨经通风口灌入"],["fake","尸体被事后搬入"]],
  responsibility:[["override","警报后主动覆盖并旋转，阻断救援"],["brake","破坏主制动导致下降"],["shot","更换真弹造成流血"],["poison","在面具中投放乌头"],["rope","割断主威亚"],["sedative","换酒、下药并删除录像"],["group","所有危险累积，无最后决定者"],["equipment","设备老化与自动程序失灵"]],
  oldcase:[["delay","祁重楼听见呼救后延迟九十秒"],["han","韩九章拆除安全销"],["baiyan","白砚提前焰火"],["accident","无法预见的设备事故"]]
};
const HARM_LABELS={liangsuqin:"面具乌头",qiyue:"更换真弹",suwan:"割断威亚",han:"破坏主制动后恢复副制动",baiyan:"镇静药并删除录像",liangyin:"紧急覆盖与旋转"};
const MOTIVE_EVIDENCE={liangsuqin:["identity"],qiyue:[],suwan:["threatFilm"],han:["oldCaseParts"],baiyan:["plagiarism","relationshipEvidence"]};
const SECRET_CONFIG={identity:{label:"双胞胎身份",unlocked:()=>has("identity")},relationship:{label:"梁素琴与白砚关系",unlocked:()=>has("relationshipEvidence")},threat:{label:"苏晚受胁迫",unlocked:()=>has("threatFilm")},plagiarism:{label:"盗用白砚作品",unlocked:()=>has("plagiarism")},letters:{label:"阮明珠私人信件",unlocked:()=>has("mingzhuLetters")}};
const HARM_PROOF={
  liangsuqin:[["aconite"],["aconite","needleThread","gloveAconite"]],qiyue:[["liveBullet","mirrorWound"],["gunRegistry","mirrorImpact","glassPowder"],["gunRegistry","liveBullet","glassPowder"]],
  suwan:[["cutRope","riggingKnife"],["cutRope","riggingKnife","ropeFibers"]],han:[["secondBrake"],["springMissing","maintenanceLog","freshBrakeOil"],["recoverySketch","maintenanceLog"]],baiyan:[["drugWine","reverseFilm"],["winePuncture","sedativeVial","deletionIndex"]]
};
function motiveEvidenceLabel(id){const found=(MOTIVE_EVIDENCE[id]||[]).filter(has);return found.length?`动机得到解释：${found.map(clue=>CLUES[clue].t).join("、")}`:"动机尚未形成独立证明";}
function harmProofScore(id){const physical=Math.max(0,...(HARM_PROOF[id]||[]).map(route=>evidenceScore(route)));return physical+testimonyScore(id);}
function physicalProofRoute(id){return (HARM_PROOF[id]||[]).find(route=>route.length>=3&&hasAll(route)&&new Set(route.map(clueSource)).size>=3&&evidenceScore(route)>=6);}
function physicalProofValid(id){return !!physicalProofRoute(id);}
function harmProofMode(id){if(physicalProofValid(id))return "三项独立物证";if(state.interviews[id]?.broken&&state.flags[`harm_${id}`]&&harmProofScore(id)>=2.5)return "证言＋物证";return "";}
function harmProofValid(id){return !!harmProofMode(id);}
function refreshAutoAttachments(){
  const ids=[];
  state.connections.forEach(id=>ids.push(...(state.connectionEvidence[id]||[])));
  Object.entries(HARM_PROOF).forEach(([id,routes])=>{if(state.report.harms[id])routes.flat().filter(has).forEach(clue=>ids.push(clue));});
  if(state.interviews.liangyin?.broken&&has("knowledgeLeak"))ids.push("knowledgeLeak");
  if(state.puzzles.includes("oldcase"))ids.push("delayTape","oldCaseParts");
  state.attachments=[...new Set(ids.filter(has))];
  return state.attachments;
}
function connectionAttachmentValid(id){
  const connection=CONNECTIONS.find(c=>c.id===id),selected=state.connectionEvidence[id]||[];
  return !!(connection&&state.connections.includes(id)&&selected.length&&selected.every(clue=>state.attachments.includes(clue))&&connectionSolvedWith(connection,selected));
}
function autoAttachmentHTML(){
  const chains=CONNECTIONS.map(c=>{const ids=state.connectionEvidence[c.id]||[],score=evidenceScore(ids),done=connectionAttachmentValid(c.id),status=state.difficulty==="extreme"?(done?"证明力已满足":"证明力不足"):`${score}/${c.threshold} 分`;return `<div class="auto-attachment ${done?'done':''}"><b>${done?'✓':'○'} ${state.connections.includes(c.id)?c.title:c.question}</b><small>${ids.length?ids.map(id=>`${CLUES[id].t}（${scoreLabel(id)}）`).join("、"):"尚未形成证据连接"}</small><span>${status}</span></div>`;}).join("");
  const leak=state.interviews.liangyin?.broken&&state.attachments.includes("knowledgeLeak");
  return `${chains}<div class="auto-attachment ${leak?'done':''}"><b>${leak?'✓':'○'} 最终对质口供</b><small>${leak?'梁音纠正了从未公开的求救原句；该知识泄漏已独立封存。':'尚未在满足门槛的最终对质中取得知识泄漏。'}</small><span>${leak?'正式附件':'未形成'}</span></div>`;
}

function harmReportHTML(r){
  return Object.entries(HARM_LABELS).map(([id,label])=>{
    const proven=id==="liangyin"?state.interviews[id]?.broken:harmProofValid(id);
    const score=id==="liangyin"?clueScore("knowledgeLeak"):harmProofScore(id),mode=id==="liangyin"?(proven?'最终对质独立知识泄漏证言':''):harmProofMode(id);
    const motive=id==="liangyin"?"最终责任必须由知识泄漏与救援阻断共同证明":motiveEvidenceLabel(id);
    return `<label class="${proven?'':'locked-harm'}"><input type="checkbox" data-harm="${id}" ${r.harms[id]?'checked':''} ${!proven?'disabled':''}><span><b>${PEOPLE[id].name}</b>${label}${proven?(state.difficulty==="extreme"?` · ${mode}`:` · ${mode} · ${score}分`):' · 行为证明不足'}<small>${motive}</small></span></label>`;
  }).join("");
}
function syncReportDisclosure(unlockedSecrets){
  const ids=unlockedSecrets.map(([id])=>id),mandatory=state.flags.mandatoryDisclosure,mode=state.flags.reportDisclosureMode||"sealed";state.flags.reportDisclosureMode=mode;
  if(mode==="full")state.disclosure=[...ids];
  else if(mode==="sealed")state.disclosure=mandatory&&ids.includes(mandatory)?[mandatory]:[];
  else state.disclosure=[...new Set([...(state.disclosure||[]).filter(id=>ids.includes(id)),...(mandatory&&ids.includes(mandatory)?[mandatory]:[])])];
}
function reportDisclosureHTML(unlockedSecrets){
  const mode=state.flags.reportDisclosureMode,mandatory=state.flags.mandatoryDisclosure;
  return `<div class="deduction"><h3><span>EPILOGUE</span>最终报告公开级别</h3><p class="muted">对质现场公开的秘密必须进入报告，不能撤回；其余内容可选择密封、有限公开或全部公开。</p><div class="option-row">${[["sealed","密封报告"],["limited","有限公开"],["full","全部公开"]].map(([id,label])=>`<button class="option-pill ${mode===id?'active':''}" data-disclosure-mode="${id}">${label}</button>`).join("")}</div><div class="option-row">${unlockedSecrets.map(([id,v])=>`<button class="option-pill ${state.disclosure.includes(id)?'active':''}" data-disclosure="${id}" ${mode!=="limited"||mandatory===id?'disabled':''}>${v.label}${mandatory===id?' · 现场已公开':''}</button>`).join("")||'<p class="muted">尚未发现可以合法写入报告的私人秘密。</p>'}</div></div>`;
}

function renderReport(){
  const r=state.report;
  refreshAutoAttachments();
  const unlockedSecrets=Object.entries(SECRET_CONFIG).filter(([,v])=>v.unlocked());
  syncReportDisclosure(unlockedSecrets);
  app.innerHTML=`<section class="screen"><button class="btn secondary small" id="backHub">← 暂不结案</button><div class="chapter-head local-head"><div><p class="eyebrow">FINAL CASE REPORT · ${clock()}</p><h2>${state.replayMode?'复盘案件报告':'提交完整案件报告'}</h2><p class="chapter-summary">答案、自动附件的证明力、审讯效力和加害确认会共同判定结局。同一来源不能重复计分。</p></div><div class="chapter-no">VII</div></div><div class="report-grid"><div class="report-main">${reportField("culprit","最终责任人",REPORT_OPTIONS.culprit,r.culprit)}${reportField("cause","直接死因",REPORT_OPTIONS.cause,r.cause)}${reportField("room","密室原理",REPORT_OPTIONS.room,r.room)}${reportField("responsibility","使死亡不可逆的决定",REPORT_OPTIONS.responsibility,r.responsibility)}${reportField("oldcase","1978年最终责任",REPORT_OPTIONS.oldcase,r.oldcase)}<div class="deduction"><h3><span>REPORT 06</span>六人的加害行为</h3><p class="muted">${state.difficulty==="extreme"?'行为物证与动机材料分开显示；极难模式不公开精确分值。':'行为证明：独立证言＋物证，或三项不同来源的完整物证。动机材料只解释原因，不代替行为。'}</p><div class="harm-list">${harmReportHTML(r)}</div></div><div class="deduction"><h3><span>REPORT 07</span>系统自动生成证据附件</h3><p class="muted">每条已验证连接的原始选证与最终对质口供会自动封存；提交时按独立来源重新计算。</p><div class="auto-attachment-list">${autoAttachmentHTML()}</div></div>${reportDisclosureHTML(unlockedSecrets)}<button class="btn danger report-submit" id="submitReport" ${![r.culprit,r.cause,r.room,r.responsibility,r.oldcase].every(Boolean)?'disabled':''}>${state.replayMode?'生成复盘结局（仅预演）':'封存本周目首次判决'}</button></div>${sideFile()}</div></section>`;
  document.querySelector("#backHub").addEventListener("click",()=>setScreen("hub"));
  document.querySelectorAll("[data-report]").forEach(el=>el.addEventListener("click",()=>{r[el.dataset.report]=el.dataset.value;saveState("");render();}));
  document.querySelectorAll("[data-harm]").forEach(el=>el.addEventListener("change",()=>{r.harms[el.dataset.harm]=el.checked;saveState("");}));
  document.querySelectorAll("[data-disclosure-mode]").forEach(el=>el.addEventListener("click",()=>{state.flags.reportDisclosureMode=el.dataset.disclosureMode;saveState("");render();}));
  document.querySelectorAll("[data-disclosure]").forEach(el=>el.addEventListener("click",()=>{if(state.flags.reportDisclosureMode!=="limited"||state.flags.mandatoryDisclosure===el.dataset.disclosure)return;const id=el.dataset.disclosure;state.disclosure=state.disclosure.includes(id)?state.disclosure.filter(x=>x!==id):[...state.disclosure,id];saveState("");render();}));
  document.querySelector("#submitReport").addEventListener("click",submitReport);
}
function reportField(id,label,options,value){return `<div class="deduction"><h3><span>REPORT</span>${label}</h3><div class="option-row">${options.map(([v,l])=>`<button class="option-pill ${value===v?'active':''}" data-report="${id}" data-value="${v}">${l}</button>`).join("")}</div></div>`;}
function unlockEnding(type){
  state.ending=type;if(!meta.firstEnding)meta.firstEnding=type;if(!meta.endings.includes(type))meta.endings.push(type);
  meta.endingDates[type]=meta.endingDates[type]||new Date().toISOString();meta.bestAnySafety=Math.max(meta.bestAnySafety||0,state.safety);meta.bestSafety=meta.bestAnySafety;
  if(type==="A"){meta.bestCompleteSafety=Math.max(meta.bestCompleteSafety||0,state.safety);if(state.difficulty==="extreme"){meta.extremeComplete=true;meta.bestExtremeCompleteSafety=Math.max(meta.bestExtremeCompleteSafety||0,state.safety);}}
  meta.secrets=[...new Set([...(meta.secrets||[]),...state.disclosure,...(state.flags.liangyinVoluntary?["liangyinVoluntary"]:[])])];
  state.firstEnding=meta.firstEnding;state.endingGallery=[...meta.endings];saveMeta();
}
function previewEnding(type){state.ending=type;if(!meta.endings.includes(type)&&!meta.previews.includes(type))meta.previews.push(type);meta.previewDates[type]=meta.previewDates[type]||new Date().toISOString();saveMeta();}
function wrongSuspectEnding(r){
  const rules={
    han:()=>r.cause==="drowning"&&r.room==="moving"&&r.responsibility==="brake"&&has("brakeDamage"),
    qiyue:()=>r.cause==="bullet"&&r.responsibility==="shot"&&(has("liveBullet")||has("gunRegistry")),
    liangsuqin:()=>r.cause==="poison"&&r.responsibility==="poison"&&has("aconite"),
    suwan:()=>r.cause==="fall"&&r.responsibility==="rope"&&has("cutRope"),
    baiyan:()=>r.cause==="sedative"&&r.responsibility==="sedative"&&(has("drugWine")||has("sedativeVial"))
  },endings={han:"C",qiyue:"D",liangsuqin:"E",suwan:"I",baiyan:"J"};
  return rules[r.culprit]?.()?endings[r.culprit]:"O";
}
function collectiveReportConsistent(r){return r.cause==="drowning"&&r.room==="moving"&&r.responsibility==="group"&&Object.values(r.harms||{}).filter(Boolean).length>=3;}
function accidentReportConsistent(r){return r.cause==="drowning"&&r.room==="moving"&&r.responsibility==="equipment"&&!Object.values(r.harms||{}).some(Boolean);}

function submitReport(){
  const r=state.report;
  refreshAutoAttachments();
  const directCauseSolved=r.cause==="drowning"&&connectionAttachmentValid("waterSource");
  const roomSolved=r.room==="moving"&&connectionAttachmentValid("movingRoom");
  const victimAliveSolved=connectionAttachmentValid("victimAlive")&&state.interviews.liangyin?.broken;
  const finalActionSolved=r.responsibility==="override"&&connectionAttachmentValid("rescueBlocked");
  const otherAttemptsSolved=["liangsuqin","qiyue","suwan","han","baiyan"].every(id=>harmProofValid(id)&&r.harms[id]);
  let type;
  if(["han","qiyue","liangsuqin","suwan","baiyan"].includes(r.culprit))type=wrongSuspectEnding(r);else if(r.culprit==="collective")type=collectiveReportConsistent(r)?"F":"O";else if(r.culprit==="accident")type=accidentReportConsistent(r)?"G":"O";
  else if(r.culprit==="liangyin"){
    if(r.cause!=="drowning"||r.room!=="moving")type="K";
    else if(r.responsibility!=="override")type="L";
    else if(!(directCauseSolved&&roomSolved&&victimAliveSolved&&finalActionSolved&&otherAttemptsSolved))type="B";
    else if(r.oldcase!=="delay"||!state.puzzles.includes("oldcase"))type="H";
    else if(state.puzzles.includes("timeline"))type="A";
    else type="N";
  }else type="O";
  const first=!meta.firstEnding&&!state.replayMode;if(state.replayMode)previewEnding(type);else unlockEnding(type);if(first)state.firstSnapshot={time:clock(),safety:state.safety,clues:state.clues.length,connections:[...state.connections]};state.screen="ending";state.resumeScreen="ending";saveState("");render();
}

const ENDINGS={
  A:{rank:"A",title:"最后的谢幕",lead:"完整破案",copy:["你没有把六次加害揉成一个方便的集体罪名。镇静药、乌头、断绳、真弹与主制动破坏制造了危险；梁音却是在确认祁重楼仍然活着之后，主动按住覆盖开关，让舞台继续旋转。","韩九章承认，不旋转时应急配重可以拉回布景舱。监听声道、带血按钮或恢复录音，加上开关烧蚀、校时记录与错位轨道，闭合了证据链。梁音无法再躲进字面真话里。","1978年的后台录音也被重新封存：祁重楼没有制造最初坠落，却命令所有人等待九十秒。二十二年前与今晚，真正的罪都发生在有人有能力停下，却决定让演出继续的时刻。"]},
  B:{rank:"B",title:"无人作证",lead:"真相正确，证据不足",copy:["你的结论指向梁音，淡水与移动布景舱也基本成立。但证据附件无法同时证明她听见求救、主动覆盖以及旋转阻断了救援。","官方只能把死亡写成多人的舞台破坏共同造成的事故。你知道最后是谁按下确认键，却没能把推理变成可以成立的证明。"]},
  C:{rank:"C",title:"房间坠落之后",lead:"错误指认韩九章",copy:["韩九章承认破坏主制动，也承认让布景舱坠入水槽。他没有说自己后来恢复了第二制动。","你查清是谁让房间掉下去，却没有查清是谁不让它回来。韩九章替苏晚和梁音承担了机械责任。"]},
  D:{rank:"D",title:"没有击中的子弹",lead:"错误指认祁越",copy:["祁越完整认罪。他相信血来自自己射出的真弹，梁音没有纠正。","后续尸检没有在体内找到弹头。你抓住了一个真正想杀人的人，却没有找到决定死亡的人。"]},
  E:{rank:"E",title:"王后的面具",lead:"错误指认梁素琴",copy:["梁素琴用近乎宽慰的神情承担毒杀罪名。乌头能解释耳后红斑和迟缓，却解释不了淡水、房间移动与警报后的旋转。","她的认罪成功把调查挡在梁音之前。"]},
  F:{rank:"C",title:"六个人的手",lead:"集体责任",copy:["媒体把案件写成六人合谋：每个人都碰过机器，每个人都想让祁重楼死。","你找到了每一只移动过道具的手，却没有找到最后按下确认键的人。梁音的主动指令消失在集体罪责里。"]},
  G:{rank:"D",title:"导演的遗作",lead:"事故结论",copy:["死亡被认定为设备老化与违规复演造成的事故。那些确实存在的加害行为，也因彼此遮蔽而没有形成可靠结论。","祁重楼提前拍摄的影像被剪成遗作上映。公众仍把他视为伟大导演——他最后一次操纵获得成功。"]},
  H:{rank:"B",title:"第二次谢幕",lead:"新案已解，旧案未明",copy:["梁音因警报后的主动覆盖接受调查，塞壬号的移动密室也被完整复原。","但祁重楼仍被公众视为1978年事故的受害者。梁音在审判中说：你证明了我为什么有罪，却没有证明他为什么站在这里。"]},
  I:{rank:"D",title:"断裂的主绳",lead:"错误指认苏晚",copy:["断绳、坠落、肋骨伤与苏晚的认罪组成了一条完整却错误的危险链。","备用绳把坠落限制在一米半。你证明了她想杀人，却没有解释淡水、求救和警报后的旋转。"]},
  J:{rank:"D",title:"沉睡的国王",lead:"错误指认白砚",copy:["镇静药、换瓶录像、删除片段与反应迟缓让白砚看起来像最会剪辑死亡的人。","药物加重了溺水风险，却没有让房间下降，也没有在求救后切断回收。危险链不是最后责任链。"]},
  K:{rank:"C",title:"猜中了名字",lead:"人物正确，机制错误",copy:["你写下梁音的名字，却无法用淡水与移动布景舱解释死亡。","名字可能来自直觉、偏见或偶然。司法需要的是可以复现的机制，而不是一次猜中。"]},
  L:{rank:"C",title:"最后一步之外",lead:"人物与机制接近，最终责任错误",copy:["你证明梁音身在控制室，也证明布景舱曾进入水槽，却把责任停在下降程序或集体危险。","案件的边界正是警报后的人工覆盖：谁明知仍可救援，却主动让旋转继续。你停在了最后一步之外。"]},
  M:{rank:"E",title:"没有抵达的报告",lead:"弃船撤离",copy:["塞壬号在报告完成前失去最后一段浮力。所有人被迫离开调查区域。","你做出的撤离选择保存了生命或证物，却没有留下足以在海上宣读的完整结论。第一次谢幕被风暴打断。"]},
  N:{rank:"B",title:"顺序之外",lead:"真凶成立，时间线未固定",copy:["你证明梁音听见求救、主动覆盖程序，并让旋转切断了仍然有效的回收路线。四条证据链、六人的独立行为与旧案责任都足以进入正式调查。","但投毒、坠落、枪击、机械破坏与求救之间的十四个节点尚未完成最终排序。真凶成立，其他人的具体责任次序仍存在争议；这不是无人作证，而是顺序尚未固定。"]},
  O:{rank:"E",title:"没有依据的指控",lead:"名字与证据互不相干",copy:["你写下了一个名字，却没有让死因、密室和对应行为形成同一个案件。报告中的物证无法支持这条错误责任链。","调查机关拒绝把猜测当作结论。即使被指认者确实实施过某次加害，也不能用不相干的死因与机制替代证明。"]}
};

function disclosureEpilogue(){
  const text=[];
  if(!state.disclosure.length)text.push("你只公开定罪必需事实，未发现或未写入的私人关系继续密封");
  if(state.disclosure.includes("identity"))text.push("双胞胎身份公开后，祁越第一次以兄长身份为梁音作证，却不替她否认最后指令");
  if(state.disclosure.includes("relationship"))text.push("梁素琴与白砚的长期关系进入调查，藏药与伪造文件不再被视为偶然互助");
  if(state.disclosure.includes("threat"))text.push("受胁迫录像让公众理解苏晚为何参与加害，但不抹去她割绳的责任");
  if(state.disclosure.includes("plagiarism"))text.push("白砚重新取得作品署名，祁重楼的剧本版权被法院冻结");
  if(state.disclosure.includes("letters"))text.push("阮明珠的信让韩九章终于确认双胞胎并非自己的孩子，也看见她当年真正准备离开的理由");
  if(state.flags.liangyinVoluntary)text.push("梁音在正式认罪前提交了一份未经剪辑的主动陈述；它不降低定罪门槛，却改变了审判后的记录");
  return text.join("；")+"。";
}
function renderGallery(){
  const entries=Object.entries(ENDINGS);
  app.innerHTML=`<section class="screen narrow"><button class="btn secondary small" id="backTitle">← 返回标题</button><div class="chapter-head local-head"><div><p class="eyebrow">THEATER SEATS · META ARCHIVE</p><h2>剧场座位</h2><p class="chapter-summary">每次新调查的首次判决才会让观众正式入座。复盘结局仅以半透明“已预演”标记，不计入解锁数量。</p></div><div class="chapter-no">${meta.endings.length}/${entries.length}</div></div><div class="ending-gallery">${entries.map(([type,ending],index)=>{const unlocked=meta.endings.includes(type),previewed=!unlocked&&meta.previews.includes(type),date=unlocked&&meta.endingDates[type]?new Date(meta.endingDates[type]).toLocaleDateString("zh-CN"):previewed&&meta.previewDates[type]?new Date(meta.previewDates[type]).toLocaleDateString("zh-CN"):"";return `<div class="gallery-seat ${unlocked?'unlocked':previewed?'previewed':''}"><span>${unlocked?'●':previewed?'◐':'○'} SEAT ${String(index+1).padStart(2,"0")}</span><b>${unlocked||previewed?ending.title:'空座位'}</b><small>${unlocked?`${ending.lead} · 正式解锁 · ${date}`:previewed?`${ending.lead} · 已预演 · ${date}`:'尚未有观众入座'}</small></div>`;}).join("")}</div><div class="gallery-meta"><span>首次结局：${meta.firstEnding?ENDINGS[meta.firstEnding].title:'尚无'}</span><span>完整破案最佳安全：${meta.bestCompleteSafety||0}%</span><span>任意结局最佳安全：${meta.bestAnySafety||0}%</span><span>极难完整破案最佳安全：${meta.bestExtremeCompleteSafety||0}%</span><span>复盘预演：${meta.previews.filter(type=>!meta.endings.includes(type)).length}</span><span>秘密后日谈：${(meta.secrets||[]).length}</span></div></section>`;
  document.querySelector("#backTitle").addEventListener("click",()=>setScreen("cover"));
}
function durationLabel(){const hours=Math.floor(state.elapsed/60),minutes=state.elapsed%60;return `${hours}时${String(minutes).padStart(2,"0")}分`;}
function endingMetrics(){
  return {
    polluted:Object.values(state.interviews).filter(rec=>rec.independent===false).length,
    physical:["liangsuqin","qiyue","suwan","han","baiyan"].filter(physicalProofValid).length
  };
}
function investigationStyles(metrics=endingMetrics()){
  const styles=[],trustRoutes=Object.values(state.interviews).filter(rec=>rec.trustBenefit).length;
  if(state.errors===0&&state.hints<=1)styles.push("冷静复原者");
  if(trustRoutes>=3)styles.push("倾听者");
  if(metrics.physical>=3)styles.push("物证主义者");
  if(state.ending==="A"&&state.safety>=70)styles.push("海上守夜人");
  if(state.flags.confrontationComplete&&state.safety<20)styles.push("沉船前的证言");
  return styles.length?styles:["风暴记录员"];
}
function renderEnding(){
  const e=ENDINGS[state.ending]||ENDINGS.G;
  const disclosure=disclosureEpilogue();
  const metrics=endingMetrics();
  const styles=investigationStyles(metrics);
  const ship=state.safety>=70?"塞壬号被拖回港口，原始物证完整抵达陆地。":state.safety>=40?"剧场永久报废，部分机械记录被水毁，幸存者证词变得更加重要。":state.safety>0?"对质后众人紧急撤离，塞壬号沉入海中；你的复制磁带与笔记成为主要证物。":"弃船警报吞没了最后的对质。你只能在救生艇上选择先保存证物，还是先救援受困者。";
  app.innerHTML=`<section class="ending"><div class="ending-mark">${e.rank}</div><p class="eyebrow">${state.replayMode?'REPLAY RESULT · PREVIEW ONLY':'VERDICT ARCHIVED'} · ${clock()}</p><h1>${e.title}</h1><p class="ending-subtitle">${e.lead}</p><div class="ending-copy">${e.copy.map(x=>`<p>${x}</p>`).join("")}<hr><p><b>秘密公开：</b>${disclosure}</p><p><b>船体后日谈：</b>${ship}</p></div><div class="investigation-style"><small>INVESTIGATION STYLE</small><b>${styles.join(" · ")}</b></div><div class="ending-stats"><div><b>${durationLabel()}</b><small>调查耗时</small></div><div><b>${state.errors}</b><small>错误</small></div><div><b>${state.hints}</b><small>提示</small></div><div><b>${metrics.polluted}</b><small>污染证词</small></div><div><b>${metrics.physical}/5</b><small>纯物证行为</small></div><div><b>${state.clues.length}</b><small>线索</small></div><div><b>${state.connections.length}</b><small>证据连接</small></div><div><b>${Object.keys(state.interviews).filter(id=>state.interviews[id].broken).length}</b><small>证词突破</small></div><div><b>${state.safety}</b><small>安全度</small></div></div><div class="gallery-note">${state.replayMode?'本结果仅标记为“已预演”，不会增加正式观众数量。':`本周目首次判决已正式入座。`} 首次结局：${ENDINGS[meta.firstEnding]?.title||e.title} · 正式解锁 ${meta.endings.length} 个</div><div class="cover-actions">${state.replayMode?'<button class="btn" id="returnCase">返回结案前复盘</button>':'<button class="btn" id="openReplay">开启复盘模式</button>'}<button class="btn secondary" id="openGallery">查看剧场座位</button><button class="btn secondary" id="shareEnding">复制结局摘要</button><button class="btn secondary" id="newGame">重新登船</button></div></section>`;
  document.querySelector("#returnCase")?.addEventListener("click",()=>{state.ending=null;setScreen("report");});
  document.querySelector("#openReplay")?.addEventListener("click",()=>{state.replayMode=true;state.ending=null;state.flags.evacuation=false;state.flags.pendingCrisis=null;saveState("");setScreen("report");});
  document.querySelector("#openGallery").addEventListener("click",()=>setScreen("gallery"));
  document.querySelector("#shareEnding").addEventListener("click",async()=>{const text=`我在《塞壬号：第七幕没有掌声》中达成「${e.title}」：${e.lead}。船体安全 ${state.safety}%。`;try{await navigator.clipboard.writeText(text);toast("结局摘要已复制");}catch{toast(text);}});
  document.querySelector("#newGame").addEventListener("click",()=>{if(confirm("重新开始会覆盖当前自动存档，确定吗？")){state=freshState();clearSavedState();render();}});
}

function renderNotebook(){
  state.flags.starredClues=state.flags.starredClues||[];
  document.querySelectorAll("[data-notebook-tab]").forEach(x=>x.classList.toggle("active",x.dataset.notebookTab===notebookTab));
  if(notebookTab==="clues")notebookBody.innerHTML=state.clues.length?state.clues.map((id,i)=>`<div class="note-item"><span class="num">${String(i+1).padStart(2,"0")}</span><div><b>${CLUES[id].t}${state.flags.degraded[id]?' · 已降级':''}</b><p>${clueDescription(id)}</p><span class="note-stage">${["","痕迹","信息","关联","解释","证据"][CLUES[id].stage]} · ${CLUES[id].chain} · ${({scene:"现场",machine:"机械",record:"录像/记录",testimony:"证言"})[clueOrigin(id)]}</span><button class="star-clue ${state.flags.starredClues.includes(id)?'active':''}" data-star-clue="${id}">${state.flags.starredClues.includes(id)?'★ 已标为重点':'☆ 标为重点'}</button></div></div>`).join(""):`<div class="empty-note">案卷还是空的。<br>先封存现场。</div>`;
  else if(notebookTab==="chains")notebookBody.innerHTML=CONNECTIONS.map((c,i)=>`<div class="chain-note"><b>0${i+1} · ${state.connections.includes(c.id)?c.title:c.question}</b><span>${state.connections.includes(c.id)?'已成立':'未连接'}</span><p>${state.connections.includes(c.id)?c.result:'收集线索后，在调查甲板的“连接证据”中亲自组成证明。'}</p></div>`).join("");
  else if(notebookTab==="people")notebookBody.innerHTML=Object.entries(PEOPLE).map(([id,p],i)=>{const rec=state.interviews[id],lead=(rec?.firstAnswers||[]).filter(answer=>["place","fear"].includes(answer)).map(answer=>FIRST_QUESTIONS[id].find(item=>item.id===answer)).filter(Boolean);const status=rec?.broken?"证词已被物证修正":rec?.closed?"核心话题已封闭":rec?.falseConfession?"存在高压虚假认罪":rec?.originalRecorded?(rec.independent?"原始证词可独立使用":"传播后证词，不能独立证明"):"尚未记录原始证词";return `<div class="note-item"><span class="num">0${i+1}</span><div><b>${p.name} · ${p.role}</b><p>${p.desc}<br>保护对象：${p.protect}<br>${status}${lead.length?`<br><em>已开放核验：</em>${lead.map(item=>item.a).join("；")}`:""}</p></div></div>`;}).join("");
  else{const visible=TIMELINE.filter(e=>timelineDiscovered(e[0])),testimonyLeads=Object.entries(state.interviews).flatMap(([id,rec])=>(rec.firstAnswers||[]).filter(answer=>["last","sound"].includes(answer)).map(answer=>({id:`${id}-${answer}`,label:`${PEOPLE[id].name}：${FIRST_QUESTIONS[id].find(item=>item.id===answer).a}`,effect:QUESTION_EFFECTS[answer]})));notebookBody.innerHTML=visible.length||testimonyLeads.length?visible.map((e,i)=>`<div class="note-item"><span class="num">${String(i+1).padStart(2,"0")}</span><div><b>${timelineLabel(e[0])}</b><p>${state.puzzles.includes("timeline")?'已在完整时间线中固定':'事件已发现，顺序尚未正式固定'}</p></div></div>`).join("")+testimonyLeads.map((lead,i)=>`<div class="note-item testimony-lead"><span class="num">Q${i+1}</span><div><b>${lead.label}</b><p>${lead.effect}；可与现场记录交叉核验。</p></div></div>`).join(""):`<div class="empty-note">尚未发现足以进入时间线的事件碎片。</div>`;}
  document.querySelectorAll("[data-star-clue]").forEach(el=>el.addEventListener("click",()=>{const id=el.dataset.starClue;state.flags.starredClues=state.flags.starredClues.includes(id)?state.flags.starredClues.filter(item=>item!==id):[...state.flags.starredClues,id];saveState("");renderNotebook();}));
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
document.querySelector("#restartBtn").addEventListener("click",()=>{if(confirm("重新开始会覆盖当前自动存档，确定吗？")){state=freshState();clearSavedState();pauseMenu.close();render();}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&notebook.open)notebook.close();if(e.key.toLowerCase()==="n"&&!notebook.open&&!pauseMenu.open&&state.screen!=="cover"){renderNotebook();notebook.showModal();}});

revalidateConnections();
render();
