const STORAGE_KEY = "zero-hour-unread-save-v2";

const CLUES = {
  body: ["E01 · 尸体伤痕", "后脑有一处钝器伤；袖口沾有蓝色蜡屑，手腕留有抓握红痕。"],
  delivery: ["E02 · 消息送达记录", "死者手机仅显示：五条消息于23:17送达。"],
  bolt: ["横闩蓝色纤维", "横闩凹槽里卡着蓝色纤维，门缝下有半透明蓝蜡。"],
  bookend: ["E04 · 黄铜书挡痕迹", "右侧波浪形书挡被异常擦净，凹槽中有头发和少量暗色痕迹。"],
  heat: ["E05 · 温控记录", "20:05为21度；21:51被手动调至30度；23:26室温达到27度。"],
  pagegap: ["缺失的第217页", "校样从216页跳到218页，缺页涉及沈奕的版权转让。"],
  cups: ["两只茶杯", "第二只茶杯底有干涸墨水，杯沿没有口红或可用指纹。"],
  window: ["锁死的窗", "窗框灰尘完好，内部插销闭合，窗外没有阳台或稳定落脚点。"],
  wineNote: ["E09 · 酒窖手写记录", "记录本上由唐若岚写着：21:44，取出1998年红酒一瓶。"],
  wine: ["E10 · 酒窖门传感器", "低温波动表明酒窖门真正开启于22:01。"],
  routerIdle: ["E11 · 路由器操作日志", "21:20—23:17没有任何后台操作；23:17的重启账号属于周启。"],
  network: ["E12 · 网络故障记录", "20:42链路中断；22:30服务器收到五次失败请求；23:17连接恢复。"],
  message: ["E13 · 夜航本地记录", "五条消息20:31—20:36创建，预定发送时间均为22:30。"],
  recording: ["温栀的录音", "20:56—21:09，陆承舟承认拿走手稿，并选择不呼救。"],
  usb: ["财务U盘", "周启盗走的U盘记录着挪用款项，并存有“夜航”与路由器说明。"],
  greenhouse: ["E16 · 温室痕迹", "西侧温室有苏遥的鞋印，灌溉记录显示21:16启动。"],
  voice: ["E17 · 语音文件时间", "苏遥给女儿的语音创建于20:47，并非她声称的九点以后。"],
  watch: ["陈默的运动手表", "陈默21:34进入档案室，21:39离开；这是最后的生存确认。"],
  fragments: ["第217页残片", "陆承舟明知旧案真相，却把唐若岚改写成策划者。"],
  contracts: ["两份签名", "第一份证明手稿属于沈奕；第二份在沈奕死后三天伪造版权转让。"],
  thread: ["蓝色装订蜡线", "唐若岚的线轴缺少约一米，材质与门闩纤维、蜡屑一致。"],
  finger: ["右手食指勒痕", "晚餐时尚不存在；案发后出现，符合高张力蜡线滑过皮肤的痕迹。"],
  recorder: ["未接线的麦克风", "晚餐时，陆承舟书桌下有一枚未亮灯的隐藏麦克风，线缆通向墙内。"],
  autoMessage: ["推论 · 死后送达", "创建、预定发送与网络记录共同证明：消息可以在陆承舟死亡后自动送达。"],
  weapon: ["推论 · 凶器", "书挡的形状、擦拭痕迹与尸体创口相符，黄铜书挡是凶器。"],
  lockedroom: ["密室复原", "蜡线可在门外拉动横闩，再从门缝完整抽走。"],
  timeline: ["推论 · 作案窗口", "已知最后生存时间为21:39，现场伪造在22:01前完成；死亡只能落在这一区间。"],
  hiddenrec: ["隐藏录音系统", "陆承舟暗中记录所有人的反应，准备把在场者写进《第六个证人》。"]
};

const PEOPLE = {
  tang: { name: "唐若岚", age: 42, role: "责任编辑", glyph: "岚", desc: "与陆承舟合作十五年。用词精确，似乎非常在意时间。" },
  wenzhi: { name: "温栀", age: 27, role: "悬疑小说家", glyph: "栀", desc: "新人作家。她对陆承舟表现出远超同行竞争的敌意。" },
  zhou: { name: "周启", age: 31, role: "生活助理", glyph: "启", desc: "陆承舟的生活助理，熟悉潮汐馆的设备和网络。" },
  su: { name: "苏遥", age: 39, role: "纪录片导演", glyph: "遥", desc: "陆承舟的前妻。进入潮汐馆后一直在观察二楼。" },
  chen: { name: "陈默", age: 46, role: "私人医生", glyph: "默", desc: "陆承舟的私人医生。回答时间问题时总使用模糊措辞。" }
};

const LOCATIONS = [
  { id: "body", title: "尸体", icon: "人", teaser: "后脑伤、凝固的血、袖口蓝蜡与手腕红痕。", clues: ["body"], text: "陆承舟侧倒在书桌旁。后脑只有一处集中撞击伤；袖口粘着细小蓝蜡，右手指甲里有纸张纤维，左手腕有一圈抓握形成的红痕。" },
  { id: "phone", title: "手机", icon: "信", teaser: "屏幕显示：五条消息已于23:17送达。", clues: ["delivery"], text: "锁屏通知只记录了结果：五条消息在23:17送达。普通界面没有显示它们何时写下，也没有显示发送尝试。手机需要“夜航”的技术说明才能继续检查。" },
  { id: "door", title: "房门与横闩", icon: "闩", teaser: "由内滑动的横闩，凹槽里却留着蓝色。", clues: ["bolt"], text: "横闩下方有一道新的细小划痕，凹槽内卡着蓝色纤维。门缝下有三点半透明蓝蜡。横闩目前完全卡进右侧门框。" },
  { id: "bookend", title: "黄铜书挡", icon: "凶", teaser: "成对的波浪书挡，其中一只干净得不自然。", clues: ["bookend"], text: "右侧书挡底部被擦得异常干净。凹槽深处残留一根深色头发，边缘有少量暗色痕迹，侧面还有一道新撞痕。先记录，不判断用途。" },
  { id: "heater", title: "温控器", icon: "温", teaser: "20:05为21度，21:51被调到最高。", clues: ["heat"], text: "温控器保存三条记录：20:05，21度；21:51，设定温度手动改为30度；23:26，室温达到27度。记录里没有操作者身份。" },
  { id: "desk", title: "书桌与校样", icon: "217", teaser: "《第六个证人》从216页直接跳到218页。", clues: ["pagegap"], text: "第216页末尾是“她第一次签下名字”；第218页开头是“第二次签名，让一个死人主动放弃权利”。撕口很新，但缺页内容仍未知。" },
  { id: "cups", title: "两只茶杯", icon: "茶", teaser: "一只属于死者；另一只杯底凝着墨水。", clues: ["cups"], text: "第二只茶杯没有口红或完整指纹，杯底却留有干涸的蓝黑墨水。它能证明有人曾在更早的时候来过，却不能证明那个人杀了陆承舟。" },
  { id: "window", title: "东侧窗户", icon: "窗", teaser: "窗外是悬崖，窗框灰尘保持完整。", clues: ["window"], text: "插销从内部锁住，窗框积灰没有擦碰，窗外也没有阳台或落脚点。所谓“翻窗逃离”可以从理论中排除。" }
];

const INTERVIEWS = {
  tang: {
    claim: "“九点四十分左右，我去了酒窖。十点过后，我回到大厅。期间没有见过陆承舟。”",
    lead: "她给出了精确的开始时间，却模糊了结束时间。酒窖里或许有不依赖记忆的记录。",
    prompts: {
      truth: ["记录原话", "先固定所有时间措辞，再寻找自动记录。"],
      judge: ["追问准确时间", "要求她解释为何只记得开始、不记得结束。"],
      empathy: ["暂时保留", "不在证据不足时贸然指控。"]
    }
  },
  wenzhi: {
    claim: "“晚餐后我一直在房间。我没有进入档案室。那条消息只是陆承舟故意刺激我。”",
    lead: "她否认进入档案室，但桌上第二只茶杯与打翻的墨水还没有主人。",
    prompts: {
      truth: ["记录否认", "把“没有进入档案室”单独记为可验证证词。"],
      judge: ["追问消息中的哥哥", "她的敌意显然不只是文学竞争。"],
      empathy: ["允许她暂不解释", "先确认当前行踪，再谈旧事。"]
    }
  },
  zhou: {
    claim: "“九点二十之后我一直在检查网络。我没有去过陆先生的书房。”",
    lead: "网络后台应该记录每一次管理员操作。机房记录比他的口供可靠。",
    prompts: {
      truth: ["记录操作时段", "重点核查21:20到23:17是否真的持续操作。"],
      judge: ["追问书房钥匙", "他左口袋里的钥匙不属于机房。"],
      empathy: ["询问他在害怕什么", "先区分财务秘密与谋杀。"]
    }
  },
  su: {
    claim: "“九点以后，我一直在给女儿录消息。直到收到那条消息，我才知道红盒。”",
    lead: "她的袖口有温室灌溉水渍，语音文件也应当保存创建时间。",
    prompts: {
      truth: ["记录语音证词", "文件元数据可以验证她的时间。"],
      judge: ["追问袖口水渍", "她去过的地方与口供不符。"],
      empathy: ["承诺不牵涉女儿", "让她愿意保留设备供稍后核对。"]
    }
  },
  chen: {
    claim: "“我十点左右去看过承舟。他当时状态正常，之后我回房休息。”",
    lead: "他反复说“十点左右”，但腕上的运动手表会留下精确步行轨迹。",
    prompts: {
      truth: ["记录模糊措辞", "稍后用设备数据替换“左右”。"],
      judge: ["追问谈话内容", "他显然在隐藏一次冲突。"],
      empathy: ["保持沉默", "让他自己意识到时间比死因更重要。"]
    }
  }
};

const FIELD_LOCATIONS = [
  { id:"cellar", title:"酒窖", icon:"酒", teaser:"手写记录与低温传感器各自保存了一种时间。", clues:["wineNote","wine"], text:"记录本上写着“21:44”，署名笔迹属于唐若岚。门传感器则在22:01记录到第一次明显温度波动。两个时间不能同时为真。" },
  { id:"machine", title:"机房", icon:"网", teaser:"检查卫星链路、后台操作与失败请求。", clues:["routerIdle","network"], text:"后台在21:20—23:17之间没有管理员操作。链路20:42中断，服务器22:30收到五次失败请求，23:17由周启账号重启。" },
  { id:"greenhouse", title:"西侧温室", icon:"温", teaser:"灌溉水、鞋印和一段并非九点后创建的语音。", clues:["greenhouse","voice"], text:"苏遥的鞋印停在长椅旁，自动灌溉于21:16启动。她交出的语音文件元数据显示创建时间为20:47。" },
  { id:"guest", title:"客房走廊", icon:"步", teaser:"陈默的运动手表刚与房内终端完成同步。", clues:["watch"], text:"步行轨迹清楚记录：21:31离房，21:34抵达二楼东侧，21:39离开档案室，21:42回房。" },
  { id:"phoneDeep", title:"再次检查手机", icon:"信", teaser:"需要先取得机房里的“夜航”机制记录。", clues:["message"], requires:"network", text:"按照机房说明打开本地队列：五条消息创建于20:31—20:36，预定发送时间均为22:30。界面仍不会替你解释这意味着什么。" },
  { id:"recordingDesk", title:"晚餐后的书桌", icon:"录", teaser:"只有曾注意到桌下设备的人，才会知道该检查哪里。", clues:["recorder"], optional:true, requiresFlag:"recorderSeed", text:"桌下那枚未亮灯的麦克风并非装饰。线缆没有接入桌面设备，而是穿进墙内，通向馆内旧广播线路。" }
];

const CONFRONTATIONS = {
  tang:{ lines:["九点四十分左右，我去了酒窖。","十点过后，我回到大厅。","期间没有见过陆承舟。"], target:0, evidence:"wine", defense:true, result:"门传感器把她进入酒窖的时间固定在22:01。她改口称自己只是记错；但记录本上的21:44是主动写下的假时间，而非记忆误差。", clues:[] },
  wenzhi:{ lines:["晚餐后我一直在房间。","我没有进入档案室。","那条消息只是故意刺激我。"], target:1, evidence:"cups", result:"茶杯底的墨水使她承认20:50进入档案室。她交出20:56—21:09的录音；21:12离开时，陆承舟仍然活着。", clues:["recording"] },
  zhou:{ lines:["九点二十之后我一直在检查网络。","风暴造成了卫星连接故障。","我没有去过陆先生的书房。"], target:0, evidence:"routerIdle", result:"后台日志证明他没有持续检查网络。他承认21:26进入书房盗走财务U盘，并交出夜航说明；23:17重启路由器的人确实是他。", clues:["usb"] },
  su:{ lines:["九点以后，我一直在给女儿录消息。","我没有见过陆承舟。","收到消息后我才知道红盒。"], target:0, evidence:"voice", result:"语音文件创建于20:47。苏遥承认21:18在温室见过陆承舟并打了他一耳光；她离开时，他仍然活着。", clues:[] },
  chen:{ lines:["我十点左右去看过承舟。","他当时状态正常。","之后我回房休息。"], target:0, evidence:"watch", result:"运动手表把“十点左右”改写为21:34—21:39。陈默是最后一个能确认陆承舟活着的人；他隐瞒的是十四年前被修改的死亡证明。", clues:[] }
};

const DEFAULT_STATE = {
  version: 2,
  player: "审阅员",
  screen: "cover",
  prologueStep: 0,
  clues: [],
  inspected: [],
  interviews: [],
  fieldwork: [],
  confrontations: [],
  archive: [],
  solved: [],
  trust: { tang: 2, wenzhi: 2, zhou: 2, su: 2, chen: 2 },
  tendency: { truth: 0, judge: 0, empathy: 0 },
  flags: {},
  errors: 0,
  hints: 0,
  verdictStep: 0,
  ending: null,
  resumeScreen: null,
  startedAt: null
};

let state = loadState();
let notebookTab = "clues";
let toastTimer;
let audioCtx;
let rainNode;

const app = document.querySelector("#app");
const topbar = document.querySelector("#topbar");
const chapterLabel = document.querySelector("#chapterLabel");
const clueCount = document.querySelector("#clueCount");
const notebook = document.querySelector("#notebook");
const notebookBody = document.querySelector("#notebookBody");

function freshState() { return JSON.parse(JSON.stringify(DEFAULT_STATE)); }
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const merged = saved?.version === 2 ? { ...freshState(), ...saved } : freshState();
    if (merged.startedAt && !merged.ending && merged.screen !== "cover") {
      merged.resumeScreen = merged.screen;
      merged.screen = "cover";
    }
    return merged;
  } catch { return freshState(); }
}
function saveState(message = "进度已保存") {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (message) showToast(message);
}
function hasClue(id) { return state.clues.includes(id); }
function addClue(id) {
  if (!CLUES[id] || hasClue(id)) return;
  state.clues.push(id);
  clueCount.textContent = state.clues.length;
  showToast(`新线索：${CLUES[id][0]}`);
  saveState("");
}
function setScreen(screen) { state.screen = screen; saveState(""); render(); window.scrollTo(0, 0); }
function showToast(text) {
  const el = document.querySelector("#toast");
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
}
function escapeHTML(value) { return String(value).replace(/[&<>'"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[ch])); }
function dominantTendency() { return Object.entries(state.tendency).sort((a,b) => b[1] - a[1])[0][0]; }
function chapter(name) { chapterLabel.textContent = name; }

function render() {
  topbar.hidden = state.screen === "cover";
  clueCount.textContent = state.clues.length;
  const screens = {
    cover: renderCover,
    prologue: renderPrologue,
    discovery: renderDiscovery,
    investigation: renderInvestigation,
    interviews: renderInterviews,
    fieldwork: renderFieldwork,
    confrontations: renderConfrontations,
    archive: renderArchive,
    reasoning: renderReasoning,
    final: renderFinal,
    ending: renderEnding
  };
  (screens[state.screen] || renderCover)();
  app.focus({ preventScroll: true });
}

function renderCover() {
  const canContinue = !!localStorage.getItem(STORAGE_KEY) && state.startedAt && !state.ending && state.resumeScreen;
  app.innerHTML = `
    <section class="cover">
      <div class="cover-inner">
        <div class="cover-seal"><span>未</span></div>
        <p class="eyebrow">A CLOSED-ROOM TEXT MYSTERY</p>
        <h1>零点未读</h1>
        <p class="subtitle">THE UNREAD HOUR · 一桩写在送达时间里的谋杀</p>
        <div class="cover-quote">零点之前，死者给五个人留下了五条消息。<br>零点之后，所有人都声称自己没有杀他。</div>
        <form class="intake" id="startForm">
          <input id="playerName" maxlength="12" autocomplete="off" placeholder="在调查报告上签名" value="${canContinue ? escapeHTML(state.player) : ""}" aria-label="玩家姓名">
          <button class="btn" type="submit">${canContinue ? "重新调查" : "推开铁门"}<span>→</span></button>
        </form>
        ${canContinue ? `<div class="cover-actions"><button class="btn secondary small" id="continueBtn">继续：${escapeHTML(chapterName(state.resumeScreen))}</button></div>` : ""}
        <p class="continue-note">建议佩戴耳机 · 自动保存 · 约 30–45 分钟</p>
      </div>
    </section>`;
  document.querySelector("#startForm").addEventListener("submit", e => {
    e.preventDefault();
    const name = document.querySelector("#playerName").value.trim() || "审阅员";
    state = freshState();
    state.player = name;
    state.startedAt = Date.now();
    state.screen = "prologue";
    saveState("");
    render();
  });
  document.querySelector("#continueBtn")?.addEventListener("click", () => {
    const target = state.resumeScreen || "prologue";
    state.resumeScreen = null;
    setScreen(target);
  });
}

function chapterName(screen = state.screen) {
  return ({ prologue:"序章·暴雨来客", discovery:"第一章·23点17分", investigation:"第二章·锁住的房间", interviews:"第三章·第一轮问询", fieldwork:"第四章·自由调查", confrontations:"第五章·证词对质", archive:"第六章·被撕掉的第217页", reasoning:"第七章·复原与时间", final:"第八章·最终指认" })[screen] || "未结案";
}

function renderPrologue() {
  chapter("序章 · 暴雨来客");
  const step = state.prologueStep || 0;
  if (step === 0) {
    app.innerHTML = storyScreen("18:28 · 潮汐馆门外", `
      <p>雨从傍晚开始，一直没有停。</p>
      <p>通往潮汐馆的最后一段路没有路灯。悬崖边的旧旅店比照片里更高，也更窄，所有窗户都朝向海。</p>
      <p>手机没有信号。出版社最后发来的消息还停在屏幕上：</p>
      <p class="quote">“陆老师的精神状态可能不太稳定。午夜之前完成签字。”</p>
      <p>风吹动铁门。门没有锁。</p>`, [
        ["立即敲门", "不让屋里的人继续等待", "knock"],
        ["观察二楼亮窗", "确认档案室是否存在其他出口", "observe"],
        ["检查院内车辆", "确认是否有人已经离开", "cars"],
        ["尝试发送到达消息", "确认这里与外界的联系", "signal"]
      ]);
    bindChoices(choice => {
      state.flags[`prologue_${choice}`] = true;
      if (choice === "observe") addClue("window");
      showToast(({ knock:"你在敲门声后听见了六个人的脚步", observe:"东侧亮窗外没有阳台，排水管也无法承重", cars:"六辆车都在，轮胎上覆盖着新雨", signal:"发送失败：卫星链路不可用" })[choice]);
      state.prologueStep = 1; saveState(""); setTimeout(render, 350);
    });
  } else if (step === 1) {
    const dinnerChoices = [
      ["观察唐若岚", "她正用蓝色蜡线固定散开的校样", "tang"],
      ["观察温栀", "她鞋底的浅灰海沙来自旧潮洞", "wenzhi"],
      ["观察周启", "他不断确认卫星路由器状态", "zhou"],
      ["观察苏遥与陈默", "一个盯着楼梯，一个盯着陆承舟的酒杯", "others"],
      ["观察陆承舟的书桌", "桌下似乎藏着一枚没有亮灯的麦克风", "desk"]
    ].filter(x=>!state.flags[`observed_${x[2]}`]);
    app.innerHTML = storyScreen("19:10 · 晚餐", `
      <p>陆承舟坐在长桌尽头，逐一介绍今晚的客人。窗外海浪撞击岩壁，像有人在黑暗里一遍遍敲门。</p>
      <p>他把手放在一本未装订的校样上。</p>
      <p class="quote">“《第六个证人》不是小说，是五份证词。今晚结束之后，我们之中至少有一个人，再也无法回到原来的生活。”</p>
      <p>温栀问：“第六个证人是谁？”</p>
      <p>陆承舟越过烛光看向你。“也许是记录这一切的人。”</p>
      <p class="muted">晚餐结束前，你还有时间观察两处细节。</p>`, dinnerChoices);
    bindChoices(choice => {
      state.flags[`observed_${choice}`] = true;
      if (choice === "tang") showToast("记忆：唐若岚右手食指完好，绕线动作十分熟练");
      else if (choice === "desk") { state.flags.recorderSeed = true; showToast("记忆：未亮灯的麦克风线缆穿进墙内，而不是接入桌面"); }
      else showToast("这次观察会被写入你的调查记录");
      state.flags.dinnerObserveCount=(state.flags.dinnerObserveCount||0)+1;
      if(state.flags.dinnerObserveCount>=2)state.prologueStep=2;
      saveState(""); setTimeout(render, 350);
    });
  } else {
    app.innerHTML = storyScreen("23:17 · 大厅", `
      <p>你正在整理档案目录。五声提示音几乎在同一个瞬间响起。</p>
      <p>唐若岚立刻锁屏；温栀脸色发白；周启冲向书房；苏遥站起来，走向楼梯；陈默下意识摸了摸药箱。</p>
      <p>苏遥敲响二楼档案室的门。没有回应。备用钥匙能打开门锁，门却只移动了一条缝——里面的横闩挡住了它。</p>
      <p class="quote">唐若岚：“别再推了，门闩会把旧门框撕裂。”</p>
      <p>此时，她还看不到门后的东西。</p>`, [["上楼，参与破门", "手机屏幕在门缝后的黑暗里亮着", "break"]]);
    bindChoices(() => setScreen("discovery"));
  }
}

function storyScreen(time, html, choices) {
  return `<section class="screen narrow"><div class="progress-strip"><span class="done"></span><span class="${state.prologueStep>0?'done':''}"></span><span class="${state.prologueStep>1?'done':''}"></span><span></span></div><div class="story-panel" data-time="${time}"><div class="story-text">${html}</div><div class="choice-list">${choices.map((c,i)=>`<button class="choice" data-choice="${c[2]}"><span class="choice-index">0${i+1}</span><span><b>${c[0]}</b><small class="muted">${c[1]}</small></span><span class="choice-arrow">→</span></button>`).join("")}</div></div></section>`;
}
function bindChoices(handler) { document.querySelectorAll("[data-choice]").forEach(el => el.addEventListener("click", () => handler(el.dataset.choice))); }

function renderDiscovery() {
  chapter("第一章 · 23点17分");
  app.innerHTML = `<section class="screen narrow">
    <div class="chapter-head"><div><p class="eyebrow">CHAPTER 01</p><h2>死者发来的消息</h2><p class="chapter-summary">门板发出低沉的断裂声。横闩仍伸在门框凹槽中，暖气开得像盛夏。</p></div><div class="chapter-no">23:17</div></div>
    <div class="story-panel" data-time="23:26 · 档案室">
      <div class="story-text"><p>陆承舟侧倒在书桌旁，右手距离手机不到十厘米。屏幕顶部显示：</p><p class="quote">“五条消息已于23:17送达。”</p><p>窗户从里面锁着，房间没有第二个出口。门闩仍卡在门框里。</p><p>如果这是一篇小说，答案会被作者藏在公平的位置。可现在，作者已经死了。</p></div>
      <div class="choice-list"><button class="choice" id="beginInvestigation"><span class="choice-index">01</span><span><b>封锁档案室</b><small class="muted">在警察抵达前，逐一记录现场</small></span><span class="choice-arrow">→</span></button></div>
    </div></section>`;
  document.querySelector("#beginInvestigation").addEventListener("click", () => setScreen("investigation"));
}

function sideFile() {
  const pct = Math.min(100, Math.round(state.clues.length / Object.keys(CLUES).length * 100));
  return `<aside class="side-file"><h3>${escapeHTML(state.player)}的案卷</h3><div class="meter"><div class="meter-label"><span>证据完整度</span><b>${pct}%</b></div><div class="meter-track"><div class="meter-fill" style="width:${pct}%"></div></div></div><div class="side-stat">已获物证<strong>${state.clues.length}</strong></div><div class="side-stat">错误推理<strong>${state.errors}</strong></div><div class="side-stat">提示次数<strong>${state.hints}</strong></div></aside>`;
}

function renderInvestigation() {
  chapter("第二章 · 锁住的房间");
  const done = state.inspected.length;
  app.innerHTML = `<section class="screen">
    <div class="chapter-head"><div><p class="eyebrow">CHAPTER 02 · SCENE EXAMINATION</p><h2>锁住的房间</h2><p class="chapter-summary">八处调查点不会自动给出结论。先记录事实，再决定哪些事实属于同一个故事。</p></div><div class="chapter-no">${done}/8</div></div>
    <div class="case-layout"><div>
      <div id="investigationReveal"></div>
      <div class="location-grid">${LOCATIONS.map((loc,i)=>`<button class="location-card ${state.inspected.includes(loc.id)?'done':''}" data-location="${loc.id}"><span class="card-index">POINT · 0${i+1}</span><h3>${loc.title}</h3><p>${loc.teaser}</p><span class="card-icon">${loc.icon}</span></button>`).join("")}</div>
      <div style="margin-top:26px"><button class="btn" id="toInterviews" ${done<5?'disabled':''}>${done<5?`至少再调查 ${5-done} 处`:'开始逐一审问'} <span>→</span></button></div>
    </div>${sideFile()}</div></section>`;
  document.querySelectorAll("[data-location]").forEach(el => el.addEventListener("click", () => inspectLocation(el.dataset.location)));
  document.querySelector("#toInterviews").addEventListener("click", () => setScreen("interviews"));
}

function inspectLocation(id) {
  const loc = LOCATIONS.find(x => x.id === id);
  if (!state.inspected.includes(id)) state.inspected.push(id);
  loc.clues.forEach(addClue);
  saveState("");
  renderInvestigation();
  const reveal = document.querySelector("#investigationReveal");
  reveal.innerHTML = `<div class="reveal"><p class="eyebrow">EXAMINED · ${loc.title}</p><h3>${CLUES[loc.clues[0]][0]}</h3><p>${loc.text}</p>${loc.clues.map(c=>`<span class="evidence-tag">＋ ${CLUES[c][0]}</span>`).join("")}</div>`;
  reveal.scrollIntoView({ behavior:"smooth", block:"center" });
}

function renderInterviews() {
  chapter("第三章 · 第一轮问询");
  const active = state.flags.activeInterview;
  if (active) return renderInterviewDetail(active);
  const done = state.interviews.length;
  app.innerHTML = `<section class="screen">
    <div class="chapter-head"><div><p class="eyebrow">CHAPTER 03 · FIRST STATEMENTS</p><h2>先固定他们的原话</h2><p class="chapter-summary">这一轮不负责揭晓秘密。把每句能够验证的证词原样记下，再去寻找不会“记错”的设备记录。</p></div><div class="chapter-no">${done}/5</div></div>
    <div class="case-layout"><div><div class="suspect-grid">${Object.entries(PEOPLE).map(([id,p])=>`<button class="suspect-card ${state.interviews.includes(id)?'done':''}" data-person="${id}"><span class="card-index">${p.age}岁 · ${p.role}</span><h3>${p.name}</h3><p>${p.desc}</p><div class="trust"><div class="trust-line">${[1,2,3,4].map(n=>`<i class="${state.trust[id]>=n?'on':''}"></i>`).join("")}</div></div></button>`).join("")}</div>
    <div style="margin-top:26px"><button class="btn" id="toFieldwork" ${done<5?'disabled':''}>${done<5?`还有 ${5-done} 份原始证词未记录`:'根据证词展开自由调查'} <span>→</span></button></div></div>${sideFile()}</div></section>`;
  document.querySelectorAll("[data-person]").forEach(el => el.addEventListener("click", () => { state.flags.activeInterview = el.dataset.person; render(); }));
  document.querySelector("#toFieldwork").addEventListener("click", () => { delete state.flags.activeInterview; setScreen("fieldwork"); });
}

function renderInterviewDetail(id) {
  const p = PEOPLE[id], interview = INTERVIEWS[id], already = state.interviews.includes(id);
  app.innerHTML = `<section class="screen narrow"><button class="btn secondary small" id="backInterviews">← 返回人物列表</button><div class="dialogue" style="margin-top:28px">
    <div class="speaker"><div class="portrait">${p.glyph}</div><div class="speech"><b>${p.name} · 初始证词</b><p>${interview.claim}</p></div></div>
    ${already ? `<div class="reveal"><p class="eyebrow">STATEMENT RECORDED</p><h3>可验证的矛盾</h3><p>${interview.lead}</p><span class="evidence-tag">证词尚未被击破</span></div>` : `<p class="puzzle-instruction">选择记录方式。此时证据不足，任何方式都只能固定口供，不能让系统替你判定谁在说谎。</p><div class="approach-grid">${Object.entries(interview.prompts).map(([type,v])=>`<button class="approach" data-approach="${type}"><b>${v[0]}</b><small>${v[1]}</small></button>`).join("")}</div>`}
  </div></section>`;
  document.querySelector("#backInterviews").addEventListener("click", () => { delete state.flags.activeInterview; saveState(""); render(); });
  document.querySelectorAll("[data-approach]").forEach(el => el.addEventListener("click", () => resolveInterview(id, el.dataset.approach)));
}

function resolveInterview(id, approach) {
  if (!state.interviews.includes(id)) state.interviews.push(id);
  state.tendency[approach] += 1;
  if (approach === "empathy") state.trust[id] = Math.min(4, state.trust[id] + 2);
  else if (approach === "truth") state.trust[id] = Math.min(4, state.trust[id] + 1);
  else state.trust[id] = Math.max(0, state.trust[id] - 1);
  state.flags[`firstApproach_${id}`] = approach;
  saveState("");
  renderInterviewDetail(id);
}

function renderFieldwork() {
  chapter("第四章 · 自由调查");
  const coreDone = state.fieldwork.filter(id => !FIELD_LOCATIONS.find(x=>x.id===id)?.optional).length;
  app.innerHTML = `<section class="screen">
    <div class="chapter-head"><div><p class="eyebrow">CHAPTER 04 · FOLLOW THE STATEMENTS</p><h2>让设备回答时间</h2><p class="chapter-summary">酒窖、机房、温室和客房不在最初的封锁现场。你去哪里，取决于刚刚记下的证词。</p></div><div class="chapter-no">${coreDone}/5</div></div>
    <div class="case-layout"><div><div id="fieldReveal"></div><div class="location-grid">${FIELD_LOCATIONS.filter(x=>!x.requiresFlag||state.flags[x.requiresFlag]).map((loc,i)=>{
      const locked=loc.requires&&!hasClue(loc.requires);
      return `<button class="location-card ${state.fieldwork.includes(loc.id)?'done':''}" data-field="${loc.id}" ${locked?'disabled':''}><span class="card-index">${loc.optional?'OPTIONAL':'FIELD'} · 0${i+1}</span><h3>${loc.title}</h3><p>${locked?'先取得机房的网络故障记录。':loc.teaser}</p><span class="card-icon">${loc.icon}</span></button>`;
    }).join("")}</div><div style="margin-top:26px"><button class="btn" id="toConfrontations" ${coreDone<5?'disabled':''}>${coreDone<5?`还需完成 ${5-coreDone} 处关键调查`:'带着证据进行第二轮对质'} <span>→</span></button></div></div>${sideFile()}</div></section>`;
  document.querySelectorAll("[data-field]").forEach(el=>el.addEventListener("click",()=>inspectField(el.dataset.field)));
  document.querySelector("#toConfrontations").addEventListener("click",()=>setScreen("confrontations"));
}

function inspectField(id) {
  const loc=FIELD_LOCATIONS.find(x=>x.id===id);
  if(loc.requires&&!hasClue(loc.requires)) return showToast("现有线索不足以进行这项检查");
  if(!state.fieldwork.includes(id)) state.fieldwork.push(id);
  loc.clues.forEach(addClue); saveState(""); renderFieldwork();
  const reveal=document.querySelector("#fieldReveal");
  reveal.innerHTML=`<div class="reveal"><p class="eyebrow">FIELD EXAMINED · ${loc.title}</p><h3>${loc.optional?'额外观察':'取得自动记录'}</h3><p>${loc.text}</p>${loc.clues.map(c=>`<span class="evidence-tag">＋ ${CLUES[c][0]}</span>`).join("")}</div>`;
  reveal.scrollIntoView({behavior:"smooth",block:"center"});
}

function renderConfrontations() {
  chapter("第五章 · 证词对质");
  const active=state.flags.activeConfrontation;
  if(active) return renderConfrontationDetail(active);
  const done=state.confrontations.length;
  app.innerHTML=`<section class="screen"><div class="chapter-head"><div><p class="eyebrow">CHAPTER 05 · EVIDENCE CONFRONTATION</p><h2>选择原话，出示证据</h2><p class="chapter-summary">态度只能改变他们愿意多说多少。要击破证词，必须同时选中矛盾句和能够反驳它的物证。</p></div><div class="chapter-no">${done}/5</div></div><div class="case-layout"><div><div class="suspect-grid">${Object.entries(PEOPLE).map(([id,p])=>`<button class="suspect-card ${state.confrontations.includes(id)?'done':''}" data-confront-person="${id}"><span class="card-index">SECOND STATEMENT</span><h3>${p.name}</h3><p>${state.confrontations.includes(id)?CONFRONTATIONS[id].result:"证词尚未经过物证检验。"}</p></button>`).join("")}</div><div style="margin-top:26px"><button class="btn" id="toArchive" ${done<5?'disabled':''}>${done<5?`还有 ${5-done} 份证词未击破`:'追查第217页与十四年前的旧案'} <span>→</span></button></div></div>${sideFile()}</div></section>`;
  document.querySelectorAll("[data-confront-person]").forEach(el=>el.addEventListener("click",()=>{state.flags.activeConfrontation=el.dataset.confrontPerson;clearChallenge();render();}));
  document.querySelector("#toArchive").addEventListener("click",()=>{delete state.flags.activeConfrontation;setScreen("archive");});
}

function clearChallenge(){ delete state.flags.challengeLine; delete state.flags.challengeEvidence; }

function renderConfrontationDetail(id) {
  const p=PEOPLE[id], c=CONFRONTATIONS[id], done=state.confrontations.includes(id);
  if(state.flags.pendingAttitude===id) return renderConfrontationAttitude(id);
  const defense=id==="tang"&&state.flags.tangDefense;
  const evidencePool=[c.evidence,"heat","delivery","bolt","bookend","wineNote","network","cups","voice","watch"].filter((x,i,a)=>hasClue(x)&&a.indexOf(x)===i).slice(0,7);
  app.innerHTML=`<section class="screen narrow"><button class="btn secondary small" id="backConfrontations">← 返回对质列表</button><div class="dialogue" style="margin-top:28px"><div class="speaker"><div class="portrait">${p.glyph}</div><div class="speech"><b>${p.name} · ${defense?'第二层防御':'原始证词'}</b><p>${defense?'“我只是记错了进入酒窖的时间。”':INTERVIEWS[id].claim}</p></div></div>${done?`<div class="reveal"><p class="eyebrow">TESTIMONY BROKEN</p><h3>证词已被物证修正</h3><p>${c.result}</p>${c.clues.map(x=>`<span class="evidence-tag">${CLUES[x][0]}</span>`).join("")}</div>`:`<div class="puzzle-board"><p class="puzzle-instruction">${defense?'她把伪造解释成记错。选择能够区分二者的记录。':'第一步：选择证词中有明确证据可以反驳的一句。'}</p>${defense?`<button class="verdict-option selected">“我只是记错了时间。”</button>`:c.lines.map((line,i)=>`<button class="verdict-option ${state.flags.challengeLine===i?'selected':''}" data-line="${i}">${line}</button>`).join("")}<p class="puzzle-instruction" style="margin-top:24px">第二步：从案卷中选择反驳证据。</p><div class="option-row">${evidencePool.map(e=>`<button class="option-pill ${state.flags.challengeEvidence===e?'active':''}" data-challenge-evidence="${e}">${CLUES[e][0]}</button>`).join("")}</div><div class="puzzle-actions"><button class="btn" id="submitChallenge" ${(!defense&&state.flags.challengeLine===undefined)||!state.flags.challengeEvidence?'disabled':''}>提交反驳</button></div></div>`}</div></section>`;
  document.querySelector("#backConfrontations").addEventListener("click",()=>{delete state.flags.activeConfrontation;clearChallenge();saveState("");render();});
  document.querySelectorAll("[data-line]").forEach(el=>el.addEventListener("click",()=>{state.flags.challengeLine=+el.dataset.line;saveState("");render();}));
  document.querySelectorAll("[data-challenge-evidence]").forEach(el=>el.addEventListener("click",()=>{state.flags.challengeEvidence=el.dataset.challengeEvidence;saveState("");render();}));
  document.querySelector("#submitChallenge")?.addEventListener("click",()=>submitChallenge(id,defense));
}

function submitChallenge(id,defense) {
  const c=CONFRONTATIONS[id];
  const correct=defense?state.flags.challengeEvidence==="wineNote":state.flags.challengeLine===c.target&&state.flags.challengeEvidence===c.evidence;
  if(!correct){state.errors++;state.trust[id]=Math.max(0,state.trust[id]-1);saveState("");showToast("这件物证不能直接反驳所选句子");return;}
  if(id==="tang"&&!defense){state.flags.tangDefense=true;clearChallenge();saveState("");showToast("唐若岚：我只是记错了时间");render();return;}
  state.flags.pendingAttitude=id;clearChallenge();saveState("");render();
}

function renderConfrontationAttitude(id){
  const p=PEOPLE[id];
  app.innerHTML=`<section class="screen narrow"><div class="reveal"><p class="eyebrow">CONTRADICTION CONFIRMED</p><h3>${p.name}无法再维持原证词</h3><p>主线证据已经成立。现在选择态度，只决定对方是否主动补充私人动机，不会替代物证。</p></div><div class="approach-grid"><button class="approach" data-final-approach="truth"><b>求真</b><small>要求把全部时间与动作写进修正证词。</small></button><button class="approach" data-final-approach="judge"><b>审判</b><small>更快逼出口供，但会失去一段主动补充。</small></button><button class="approach" data-final-approach="empathy"><b>共情</b><small>承认谎言背后可能是另一桩罪或另一种保护。</small></button></div></section>`;
  document.querySelectorAll("[data-final-approach]").forEach(el=>el.addEventListener("click",()=>resolveConfrontation(id,el.dataset.finalApproach)));
}

function resolveConfrontation(id,approach){
  if(!state.confrontations.includes(id))state.confrontations.push(id);
  state.tendency[approach]++; state.trust[id]=Math.max(0,Math.min(4,state.trust[id]+(approach==="empathy"?1:approach==="judge"?-1:0)));
  CONFRONTATIONS[id].clues.forEach(addClue); delete state.flags.pendingAttitude; saveState(""); renderConfrontationDetail(id);
}

const ARCHIVE_ITEMS = [
  { id:"fragments", title:"大厅壁炉", sub:"木柴受潮，纸灰里仍有四块未烧净的校样。", clue:"fragments", text:"残页写道：唐若岚从一开始就知道沈奕不会回来。页边却有陆承舟的批注——“这样更有戏剧性。让她承担主动策划的责任。”这证明他明知内容并非事实。" },
  { id:"contracts", title:"红色文件盒", sub:"两份文件上，都有唐若岚的名字。", clue:"contracts", text:"投稿确认书签于沈奕生前，证明作品属于他；版权转让书却签于沈奕死亡三天后。唐若岚参与造假，但文件不能证明她策划了沈奕之死。" },
  { id:"thread", title:"装订工具箱", sub:"蓝色亚麻线轴少了大约一米。", clue:"thread", text:"蜡线的材质、颜色和表面蜡质与门闩残留一致。工具箱曾放在大厅，单凭线轴不能定罪，但它给出了复原密室的方法。" },
  { id:"finger", title:"唐若岚的右手", sub:"食指侧面多出一道细长、崭新的勒痕。", clue:"finger", text:"这不是纸割伤，而是细线在高张力下滑过皮肤留下的痕迹。若你在晚餐观察过她，还能确认这道伤在案发前并不存在。" }
];

function renderArchive() {
  chapter("第六章 · 被撕掉的第217页");
  if(state.flags.fragmentMode) return renderFragmentPuzzle();
  const done = state.archive.length;
  app.innerHTML = `<section class="screen">
    <div class="chapter-head"><div><p class="eyebrow">CHAPTER 06 · THE MISSING PAGE</p><h2>被撕掉的第217页</h2><p class="chapter-summary">当前谋杀与十四年前的潮洞之间，隔着一张被改写、撕碎、投入火中的纸。</p></div><div class="chapter-no">217</div></div>
    <div class="case-layout"><div><div id="archiveReveal"></div><div class="location-grid">${ARCHIVE_ITEMS.map((item,i)=>`<button class="location-card ${state.archive.includes(item.id)?'done':''}" data-archive="${item.id}"><span class="card-index">ARCHIVE · 0${i+1}</span><h3>${item.title}</h3><p>${item.sub}</p><span class="card-icon">${i===0?'页':i===1?'签':i===2?'线':'伤'}</span></button>`).join("")}</div>
    <div style="margin-top:26px"><button class="btn" id="toReasoning" ${done<4?'disabled':''}>${done<4?`还需核对 ${4-done} 组旧案证据`:'开始复原密室与时间线'} <span>→</span></button></div></div>${sideFile()}</div></section>`;
  document.querySelectorAll("[data-archive]").forEach(el => el.addEventListener("click", () => inspectArchive(el.dataset.archive)));
  document.querySelector("#toReasoning").addEventListener("click", () => setScreen("reasoning"));
}

function inspectArchive(id) {
  const item = ARCHIVE_ITEMS.find(x=>x.id===id);
  if(id==="fragments"&&!state.archive.includes(id)){
    state.flags.fragmentMode=true;
    state.flags.fragmentOrder||=[2,0,3,1];
    saveState("");render();return;
  }
  if (!state.archive.includes(id)) state.archive.push(id);
  addClue(item.clue);
  if (id === "fragments") state.flags.fragmentsComplete = true;
  saveState("");
  renderArchive();
  const reveal = document.querySelector("#archiveReveal");
  if (id === "fragments") {
    reveal.innerHTML = `<div class="reveal"><p class="eyebrow">RECOVERED · PAGE 217</p><h3>四块残页重新拼合</h3><div class="fragment-grid"><div class="fragment" style="--r:-2deg"><span class="fragment-number">217 · A</span>唐若岚从一开始就知道沈奕不会活着回来。</div><div class="fragment" style="--r:2deg"><span class="fragment-number">217 · B</span>她准备了第二份转让协议。</div><div class="fragment" style="--r:1deg"><span class="fragment-number">217 · C</span>只要死人签过名字，活人就可以替他解释。</div><div class="fragment" style="--r:-1deg"><span class="fragment-number">批注</span>“这样处理更有戏剧性。让她承担主动策划的责任。”</div></div><p>${item.text}</p></div>`;
  } else {
    reveal.innerHTML = `<div class="reveal"><p class="eyebrow">ARCHIVE EXAMINED</p><h3>${CLUES[item.clue][0]}</h3><p>${item.text}</p><span class="evidence-tag">＋ ${CLUES[item.clue][0]}</span></div>`;
  }
  reveal.scrollIntoView({ behavior:"smooth", block:"center" });
}

const PAGE_FRAGMENTS=[
  "唐若岚从一开始就知道",
  "沈奕不会活着回来。她准备了",
  "第二份转让协议。只要死人签过名字，",
  "活人就可以替他解释。｜批注：让她承担主动策划的责任。"
];

function renderFragmentPuzzle(){
  const order=state.flags.fragmentOrder;
  app.innerHTML=`<section class="screen narrow"><button class="btn secondary small" id="backArchive">← 暂时离开壁炉</button><div class="puzzle-board" style="margin-top:24px"><p class="eyebrow">PAGE 217 · TEXT ASSEMBLY</p><h2>让烧焦的句子重新连接</h2><p class="puzzle-instruction">选择两块残页即可交换位置。根据断句、语义与烧焦边缘还原从左到右的顺序；批注只会在完整拼合后显现。</p><div class="fragment-grid">${order.map((id,pos)=>`<button class="fragment ${state.flags.fragmentSelected===pos?'active':''}" style="--r:${[-2,2,1,-1][pos]}deg" data-fragment-pos="${pos}"><span class="fragment-number">残片 ${String.fromCharCode(65+pos)}</span>${PAGE_FRAGMENTS[id]}</button>`).join("")}</div><div class="puzzle-actions"><button class="btn" id="checkFragments">检查拼合</button><button class="btn secondary" id="hintFragments">观察烧焦边缘</button></div></div></section>`;
  document.querySelector("#backArchive").addEventListener("click",()=>{delete state.flags.fragmentMode;delete state.flags.fragmentSelected;saveState("");render();});
  document.querySelectorAll("[data-fragment-pos]").forEach(el=>el.addEventListener("click",()=>{
    const pos=+el.dataset.fragmentPos;
    if(state.flags.fragmentSelected===undefined)state.flags.fragmentSelected=pos;
    else{const first=state.flags.fragmentSelected;[order[first],order[pos]]=[order[pos],order[first]];delete state.flags.fragmentSelected;}
    saveState("");render();
  }));
  document.querySelector("#hintFragments").addEventListener("click",()=>{state.hints++;saveState("");showToast("第一块结尾没有标点；最后一块同时带着竖线后的手写批注");});
  document.querySelector("#checkFragments").addEventListener("click",()=>{
    if(!order.every((id,i)=>id===i)){state.errors++;saveState("");showToast("句子仍有断裂：检查标点前后的主语与谓语");return;}
    state.archive.push("fragments");addClue("fragments");state.flags.fragmentsComplete=true;delete state.flags.fragmentMode;delete state.flags.fragmentSelected;saveState("");showToast("第217页残片已经完整拼合");render();
  });
}

const DOOR_EVENTS = [
  ["line", "将蓝色蜡线绕过横闩把手"],
  ["ends", "让两端线头从门缝伸到走廊"],
  ["close", "关闭房门"],
  ["pull", "同时拉紧两端，让横闩滑入凹槽"],
  ["release", "松开其中一端"],
  ["extract", "从另一端抽走整根蜡线"]
];
const TIMELINE_EVENTS = [
  ["wenOut", "温栀离开档案室，死者仍活着"],
  ["suOut", "苏遥离开温室，死者仍活着"],
  ["chenOut", "陈默离开档案室，死者仍活着"],
  ["heater", "档案室暖气被手动调高"],
  ["cellar", "酒窖门真正开启"],
  ["sendFail", "五条预定消息首次发送失败"],
  ["router", "周启重启卫星路由器"],
  ["delivered", "五条消息实际送达"]
];

function renderReasoning() {
  chapter("第七章 · 复原与时间");
  const mode = state.flags.puzzleMode;
  if (mode === "door") return state.flags.doorConfigured ? renderSequencePuzzle("door", DOOR_EVENTS, "复原密室", "把操作卡按因果顺序放入上方。卡片已经被打乱，再次点击上方卡片可以撤回。", "lockedroom") : renderDoorSetup();
  if (mode === "timeline") return renderSequencePuzzle("timeline", TIMELINE_EVENTS, "可证明的时间线", "卡片已被乱序且不显示时间。请核对线索簿中的证词与自动日志，再按真实发生顺序排列；时间线不会提供精确死亡时刻。", "timeline");
  if (mode === "deduction") return renderDeductions();
  const solved = state.solved.length;
  app.innerHTML = `<section class="screen">
    <div class="chapter-head"><div><p class="eyebrow">CHAPTER 07 · RECONSTRUCTION</p><h2>不要相信钟面</h2><p class="chapter-summary">这里没有“21:48死亡”这种开发者答案。你只能使用证词与自动记录，确定一个能够被证明的区间。</p></div><div class="chapter-no">${solved}/3</div></div>
    <div class="case-layout"><div class="deduction-list">
      ${reasoningCard("door","复原门闩机关","蓝蜡、纤维与细线如何在门外移动横闩？","lockedroom")}
      ${reasoningCard("timeline","排列真实时间线","从最后的生存确认到伪造的不在场证明。","timeline")}
      ${reasoningCard("deduction","形成三条确定推论","解释消息、暖气与真正的作案窗口。","deductions", !state.solved.includes("lockedroom") || !state.solved.includes("timeline"))}
      <button class="btn danger" id="toFinal" ${solved<3?'disabled':''}>召集所有人，最终指认 <span>→</span></button>
    </div>${sideFile()}</div></section>`;
  document.querySelectorAll("[data-puzzle]").forEach(el => el.addEventListener("click", () => { state.flags.puzzleMode = el.dataset.puzzle; saveState(""); render(); }));
  document.querySelector("#toFinal").addEventListener("click", () => setScreen("final"));
}

function reasoningCard(mode,title,desc,solveId,disabled=false) {
  const done = state.solved.includes(solveId);
  return `<div class="deduction ${done?'done':''}"><h3>${title}<span>${done?'已确认':'待推理'}</span></h3><p class="muted">${desc}</p><button class="btn secondary small" data-puzzle="${mode}" ${disabled?'disabled':''}>${done?'重新查看':'开始推理'} →</button></div>`;
}

function renderDoorSetup(){
  const config=state.flags.doorConfig||={};
  const groups=[
    ["material","选择材料",[["cotton","普通棉线"],["wax","蓝色蜡线"],["fishing","透明钓鱼线"],["wire","细电线"]]],
    ["anchor","选择连接点",[["handle","门把手"],["bolt","横闩把手"],["keyhole","锁孔"],["frame","门框凹槽"]]],
    ["pull","选择拉动方式",[["single","只拉一端"],["both","同时拉紧两端"],["twist","旋转线头"]]]
  ];
  app.innerHTML=`<section class="screen narrow"><button class="btn secondary small" id="backReasoning">← 返回推理桌</button><div class="puzzle-board" style="margin-top:24px"><p class="eyebrow">LOCKED ROOM · MECHANICAL TEST</p><h2>先让横闩真正移动</h2><p class="puzzle-instruction">步骤顺序不是关键的第一步。先选择材料、受力点与拉动方式；错误组合会给出具体的物理反馈。</p>${groups.map(([key,title,options])=>`<div class="deduction"><h3>${title}</h3><div class="option-row">${options.map(([id,label])=>`<button class="option-pill ${config[key]===id?'active':''}" data-door-key="${key}" data-door-value="${id}">${label}</button>`).join("")}</div></div>`).join("")}<div class="puzzle-actions"><button class="btn" id="checkDoorSetup" ${Object.keys(config).length<3?'disabled':''}>在模型上测试</button><button class="btn secondary" id="doorSetupHint">观察残留物</button></div></div></section>`;
  document.querySelector("#backReasoning").addEventListener("click",()=>{delete state.flags.puzzleMode;saveState("");render();});
  document.querySelectorAll("[data-door-key]").forEach(el=>el.addEventListener("click",()=>{config[el.dataset.doorKey]=el.dataset.doorValue;saveState("");render();}));
  document.querySelector("#doorSetupHint").addEventListener("click",()=>{state.hints++;saveState("");showToast("凹槽留下的是蓝色纤维与蜡；受力点本身也出现了新划痕");});
  document.querySelector("#checkDoorSetup").addEventListener("click",()=>{
    if(config.material!=="wax"){state.errors++;saveState("");showToast(config.material==="cotton"?"棉线在横闩表面打滑，无法保持受力方向":"这种材料与现场残留的蓝蜡和纤维不符");return;}
    if(config.anchor!=="bolt"){state.errors++;saveState("");showToast("这个连接点无法把水平拉力传递给横闩");return;}
    if(config.pull!=="both"){state.errors++;saveState("");showToast("横闩偏转并卡住了；需要两端同时受力才能沿凹槽平移");return;}
    state.flags.doorConfigured=true;saveState("");showToast("横闩在模型中移动成功；现在还原完整操作顺序");render();
  });
}

function renderSequencePuzzle(type, events, title, instruction, resultId) {
  const currentKey = `${type}Sequence`;
  state.flags[currentKey] ||= [];
  const selected = state.flags[currentKey];
  let bankOrder;
  if(type==="door") bankOrder=["extract","line","close","release","ends","pull"];
  else {
    if(!state.flags.timelineBank){
      bankOrder=events.map(x=>x[0]);
      for(let i=bankOrder.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bankOrder[i],bankOrder[j]]=[bankOrder[j],bankOrder[i]];}
      if(bankOrder.every((id,i)=>id===events[i][0])) bankOrder.push(bankOrder.shift());
      state.flags.timelineBank=bankOrder;saveState("");
    } else bankOrder=state.flags.timelineBank;
  }
  const bank=bankOrder.map(id=>events.find(x=>x[0]===id));
  app.innerHTML = `<section class="screen narrow"><button class="btn secondary small" id="backReasoning">← 返回推理桌</button><div class="puzzle-board" style="margin-top:24px"><p class="eyebrow">RECONSTRUCTION</p><h2>${title}</h2><p class="puzzle-instruction">${instruction}</p><div class="sequence" id="sequence">${selected.map((id,i)=>`<button class="event-card" data-remove="${id}" data-order="${i+1}">${events.find(x=>x[0]===id)[1]}</button>`).join("")}</div><div class="card-bank">${bank.map(e=>`<button class="event-card ${selected.includes(e[0])?'selected':''}" data-add="${e[0]}">${e[1]}</button>`).join("")}</div><div class="puzzle-actions"><button class="btn" id="checkSequence" ${selected.length!==events.length?'disabled':''}>验证顺序</button><button class="btn secondary" id="hintPuzzle">获得提示</button></div></div></section>`;
  document.querySelector("#backReasoning").addEventListener("click", () => { delete state.flags.puzzleMode; saveState(""); render(); });
  document.querySelectorAll("[data-add]").forEach(el=>el.addEventListener("click",()=>{ if(!selected.includes(el.dataset.add)) selected.push(el.dataset.add); saveState(""); render(); }));
  document.querySelectorAll("[data-remove]").forEach(el=>el.addEventListener("click",()=>{ state.flags[currentKey]=selected.filter(x=>x!==el.dataset.remove); saveState(""); render(); }));
  document.querySelector("#hintPuzzle").addEventListener("click",()=>{
    state.hints++;
    const next = events[selected.length];
    showToast(next ? `下一步应当与“${next[1]}”有关` : "检查第一张卡是否是最早发生的动作");
    saveState("");
  });
  document.querySelector("#checkSequence").addEventListener("click",()=>{
    const correct = events.every((e,i)=>selected[i]===e[0]);
    if (!correct) { state.errors++; saveState(""); showToast("顺序中仍有矛盾：后一个动作无法由前一个动作推出"); return; }
    if (!state.solved.includes(resultId)) state.solved.push(resultId);
    addClue(resultId);
    if (type === "door") state.flags.doorSequence = [];
    else state.flags.timelineSequence = [];
    delete state.flags.puzzleMode;
    saveState("");
    showToast(type === "door" ? "密室成立的前提已经被拆除" : "作案窗口确定：21:39—22:01");
    setTimeout(render,350);
  });
}

const DEDUCTIONS = [
  { id:"msg", q:"23:17的消息能证明陆承舟当时还活着吗？", options:["能，手机刚收到他的消息","不能，送达时间晚于创建与预定发送时间","不能，因为周启伪造了全部消息"], answer:1, result:"23:17只是抵达时间；死者不需要活到那一刻。" },
  { id:"weapon", q:"哪件物品与尸体创口和擦拭痕迹形成闭环？", options:["黄铜书挡","裁纸刀","金属药箱"], answer:0, result:"书挡的形状、头发、暗色残留与新撞痕同时吻合。" },
  { id:"warm", q:"21:51调高暖气能够造成什么效果？", options:["让纸张更快燃烧","让尸体降温变慢，干扰死亡时间判断","让门框受热变形"], answer:1, result:"高温会使死亡时间看起来更接近23:17。" }
];

function renderDeductions() {
  state.flags.deductions ||= [];
  app.innerHTML = `<section class="screen narrow"><button class="btn secondary small" id="backReasoning">← 返回推理桌</button><div class="puzzle-board" style="margin-top:24px"><p class="eyebrow">CERTAIN INFERENCES</p><h2>形成确定推论</h2><p class="puzzle-instruction">每个答案都必须同时解释已获得的时间记录和物证。</p><div class="deduction-list">${DEDUCTIONS.map((d,i)=>`<div class="deduction ${state.flags.deductions.includes(d.id)?'done':''}"><h3><span>推论 0${i+1}</span>${d.q}</h3>${state.flags.deductions.includes(d.id)?`<p>${d.result}</p>`:`<div class="option-row">${d.options.map((o,j)=>`<button class="option-pill" data-deduction="${d.id}" data-answer="${j}">${o}</button>`).join("")}</div>`}</div>`).join("")}</div></div></section>`;
  document.querySelector("#backReasoning").addEventListener("click",()=>{ delete state.flags.puzzleMode; saveState(""); render(); });
  document.querySelectorAll("[data-deduction]").forEach(el=>el.addEventListener("click",()=>{
    const d=DEDUCTIONS.find(x=>x.id===el.dataset.deduction);
    if (+el.dataset.answer===d.answer) {
      if(!state.flags.deductions.includes(d.id)) state.flags.deductions.push(d.id);
      if(d.id==="msg")addClue("autoMessage");
      if(d.id==="weapon")addClue("weapon");
      showToast(`推论成立：${d.result}`);
      if(state.flags.deductions.length===DEDUCTIONS.length && !state.solved.includes("deductions")) state.solved.push("deductions");
    } else { state.errors++; showToast("这项解释与至少一条自动记录冲突"); }
    saveState(""); render();
  }));
}

const REPORT_FIELDS=[
  {id:"killer",label:"凶手",options:[["wenzhi","温栀"],["tang","唐若岚"],["zhou","周启"],["su","苏遥"],["chen","陈默"]],answer:"tang"},
  {id:"window",label:"作案与伪造窗口",options:[["early","20:42—21:12"],["core","21:39—22:01"],["late","22:30—23:17"]],answer:"core"},
  {id:"weapon",label:"凶器",options:[["knife","裁纸刀"],["medicine","金属药箱"],["bookend","黄铜书挡"]],answer:"bookend"},
  {id:"method",label:"密室手法",options:[["hide","留在室内躲藏"],["thread","蓝色蜡线从门外拉动横闩"],["window","从窗外操作插销"]],answer:"thread"},
  {id:"motive",label:"直接冲突动机",options:[["money","财务U盘中的挪用记录"],["daughter","红盒中的女儿文件"],["page","第217页把旧案责任推给唐若岚"]],answer:"page"}
];

function renderFinal() {
  chapter("第八章 · 最终指认");
  if (!state.flags.reportComplete) return renderCaseReport();
  if (!state.flags.rebuttalComplete) return renderRebuttal();
  if (!state.flags.confrontation) return renderConfrontation();
  return renderMoralChoice();
}

function renderCaseReport(){
  state.flags.report||={};
  app.innerHTML=`<section class="screen"><div class="chapter-head"><div><p class="eyebrow">FINAL CASE REPORT · 00:03</p><h2>提交完整案件报告</h2><p class="chapter-summary">不再回答已经做过的三选一。把凶手、窗口、凶器、密室手法和动机一次写进同一条证据链。</p></div><div class="chapter-no">结案</div></div><div class="case-layout"><div class="deduction-list">${REPORT_FIELDS.map((f,i)=>`<div class="deduction"><h3><span>REPORT 0${i+1}</span>${f.label}</h3><div class="option-row">${f.options.map(([id,label])=>`<button class="option-pill ${state.flags.report[f.id]===id?'active':''}" data-report-field="${f.id}" data-report-value="${id}">${label}</button>`).join("")}</div></div>`).join("")}<button class="btn danger" id="submitReport" ${Object.keys(state.flags.report).length<REPORT_FIELDS.length?'disabled':''}>宣读案件报告</button>${(state.flags.reportAttempts||0)>=3?`<button class="btn secondary" id="acceptWrong">停止推理，等待警方</button>`:""}</div>${sideFile()}</div></section>`;
  document.querySelectorAll("[data-report-field]").forEach(el=>el.addEventListener("click",()=>{state.flags.report[el.dataset.reportField]=el.dataset.reportValue;saveState("");render();}));
  document.querySelector("#submitReport").addEventListener("click",()=>{
    const wrong=REPORT_FIELDS.filter(f=>state.flags.report[f.id]!==f.answer);
    if(wrong.length){state.errors++;state.flags.reportAttempts=(state.flags.reportAttempts||0)+1;saveState("");showToast(`报告中仍有 ${wrong.length} 处无法被证据支持`);render();return;}
    state.flags.reportComplete=true;saveState("");showToast("案件报告成立；唐若岚提出最后反驳");render();
  });
  document.querySelector("#acceptWrong")?.addEventListener("click",()=>finishEnding("bad"));
}

function renderRebuttal(){
  state.flags.rebuttalEvidence||=[];
  const pool=["thread","finger","wine","bolt","recording","usb","greenhouse","contracts"].filter(hasClue);
  app.innerHTML=`<section class="screen narrow"><div class="speaker"><div class="portrait">岚</div><div class="speech"><b>唐若岚 · 反驳</b><p>“线轴一直放在大厅，任何人都能使用。你证明了方法，却没有证明是我亲手做的。”</p></div></div><div class="puzzle-board"><p class="eyebrow">CLOSE THE EVIDENCE CHAIN</p><h2>选择三条互相补强的证据</h2><p class="puzzle-instruction">需要同时证明：工具与现场一致、她亲手施力、她伪造了案后行踪。最多选择三项。</p><div class="option-row">${pool.map(id=>`<button class="option-pill ${state.flags.rebuttalEvidence.includes(id)?'active':''}" data-rebuttal="${id}">${CLUES[id][0]}</button>`).join("")}</div><div class="puzzle-actions"><button class="btn" id="submitRebuttal" ${state.flags.rebuttalEvidence.length!==3?'disabled':''}>回应反驳</button></div></div></section>`;
  document.querySelectorAll("[data-rebuttal]").forEach(el=>el.addEventListener("click",()=>{const id=el.dataset.rebuttal,arr=state.flags.rebuttalEvidence;if(arr.includes(id))state.flags.rebuttalEvidence=arr.filter(x=>x!==id);else if(arr.length<3)arr.push(id);saveState("");render();}));
  document.querySelector("#submitRebuttal").addEventListener("click",()=>{
    const required=["thread","finger","wine"];
    if(!required.every(x=>state.flags.rebuttalEvidence.includes(x))){state.errors++;saveState("");showToast("这组三项还不能把公共工具、身体痕迹与虚假行踪连接起来");return;}
    state.flags.rebuttalComplete=true;saveState("");showToast("公共线轴＋勒痕＋伪造时间，反驳被封闭");render();
  });
}

function renderConfrontation() {
  const tendency=dominantTendency();
  const lines={
    truth:["求真","“我没有看见。但真相存在于你为了掩盖那个瞬间，留下的每一个动作里。”"],
    judge:["审判","“你擦掉血、伪造时间、制造密室。这些不是无辜者会做的事。”"],
    empathy:["共情","“你不是为了十四年前的合同杀他。你是因为直到今晚，他仍要让别人替他承担一切。”"]
  };
  app.innerHTML=`<section class="screen narrow"><div class="speaker"><div class="portrait">岚</div><div class="speech"><b>唐若岚</b><p>“你证明我进过房间，证明我说了谎，证明我用线锁上了门。可你仍然没有看见我杀他。”</p></div></div><p class="eyebrow" style="margin-top:34px">你的调查更接近：${lines[tendency][0]}</p><div class="approach-grid">${Object.entries(lines).map(([id,v])=>`<button class="approach" data-confront="${id}"><b>${v[0]}</b><small>${v[1]}</small></button>`).join("")}</div></section>`;
  document.querySelectorAll("[data-confront]").forEach(el=>el.addEventListener("click",()=>{ state.tendency[el.dataset.confront]+=2; state.flags.confrontation=el.dataset.confront; saveState(""); render(); }));
}

function renderMoralChoice() {
  app.innerHTML=`<section class="screen narrow"><div class="story-panel" data-time="00:17 · 雨仍未停"><div class="story-text"><p>唐若岚终于看向自己的右手。</p><p class="quote">“我只是想拿走那一页。他抓住我。我拿起书挡，然后他倒下了。”</p><p>苏遥说：“你可以叫人。”</p><p>唐若岚回答：“十四年前，陆承舟也可以叫人。”</p><p>当前谋杀已经查明。桌上还放着十四年前的录音、两份合同、被修改的死亡证明和第217页。</p><p><b>${escapeHTML(state.player)}</b>，你要把多少真相交给明天？</p></div><div class="choice-list"><button class="choice" data-moral="all"><span class="choice-index">01</span><span><b>公开全部证据</b><small class="muted">让沈奕重新成为《潮汐盲区》的作者</small></span><span class="choice-arrow">→</span></button><button class="choice" data-moral="current"><span class="choice-index">02</span><span><b>只公开当前谋杀案</b><small class="muted">旧案的真相仍留在私人录音中</small></span><span class="choice-arrow">→</span></button><button class="choice" data-moral="delete"><span class="choice-index">03</span><span><b>删除温栀的录音</b><small class="muted">保护活人，也替死者重写最后一页</small></span><span class="choice-arrow">→</span></button></div></div></section>`;
  document.querySelectorAll("[data-moral]").forEach(el=>el.addEventListener("click",()=>finishEnding(el.dataset.moral)));
}

function finishEnding(type) {
  const hidden = type === "all" && hasClue("recorder") && state.flags.observed_tang && state.trust.wenzhi >= 3 && state.flags.fragmentsComplete && state.errors < 3;
  state.ending = hidden ? "hidden" : type;
  state.screen = "ending";
  if(hidden) addClue("hiddenrec");
  saveState(""); render(); window.scrollTo(0,0);
}

const ENDINGS = {
  all:{ rank:"A", title:"真结局 · 退潮之后", copy:["三个月后，出版社发行了一本没有陆承舟名字的书。封面只有一行字：‘作者：沈奕。’","温栀没有参加发布会。她去了潮洞，把那枚旧海鸟吊坠留在洞口。","海水退去时，石缝里露出一小块生锈的金属，像某种迟到了十四年的证词。"] },
  current:{ rank:"B", title:"普通结局 · 关上的门", copy:["警方在报告中写道：‘案件已经查明。’你看着那行字很久。","陆承舟的死亡确实已经查明，但沈奕的死亡没有。","有些门被打开。另一些门，只是换了一把锁。"] },
  delete:{ rank:"C", title:"灰色结局 · 编辑版本", copy:["出版社后来发行了《第六个证人》。第217页被重新编写。","所有句子都流畅、准确、符合逻辑。没有一句是事实。","你第一次明白，修改一个故事并不需要烧掉全部手稿，只需要改变最关键的一页。"] },
  bad:{ rank:"D", title:"坏结局 · 最方便的凶手", copy:["人们喜欢复杂的案件，却喜欢简单的凶手。","你选择了那个最像凶手的人。真正的凶手因此获得了清理故事的时间。","案件最终因证据不足长期悬而未决。"] },
  hidden:{ rank:"S", title:"隐藏结局 · 第六个证人", copy:["录音设备里最后一段声音并不是谋杀。那是陆承舟在晚餐前测试麦克风。","‘五个人有五种秘密。只要给他们足够的恐惧，他们就会主动替我写完结局。’","他停顿了一下：‘至于第六个人——记录者总以为自己站在故事外面。这是他们最可爱的误解。’","数月后，一本名为《零点未读》的书出现在书店。作者栏里，是你的名字。"] }
};

function renderEnding() {
  topbar.hidden=false; chapter("案件结局");
  const e=ENDINGS[state.ending] || ENDINGS.bad;
  const mins=Math.max(1,Math.round((Date.now()-(state.startedAt||Date.now()))/60000));
  app.innerHTML=`<section class="ending"><div class="ending-mark">${e.rank}</div><p class="eyebrow">CASE CLOSED · 00:17</p><h1>${e.title}</h1><div class="ending-copy">${e.copy.map(x=>`<p>${x}</p>`).join("")}</div><div class="ending-stats"><div><b>${state.clues.length}</b><small>线索</small></div><div><b>${state.errors}</b><small>错误推理</small></div><div><b>${state.hints}</b><small>提示</small></div><div><b>${mins}</b><small>分钟</small></div></div><div class="rating"><strong>${e.rank}</strong><span>${e.rank==='S'?'第六个证人':e.rank==='A'?'退潮之后':e.rank==='B'?'关上的门':e.rank==='C'?'编辑版本':'最方便的凶手'}</span></div><div class="cover-actions"><button class="btn" id="newGame">重新调查</button><button class="btn secondary" id="shareEnding">复制结局</button></div></section>`;
  document.querySelector("#newGame").addEventListener("click",()=>{ if(confirm("重新开始会覆盖当前自动存档，确定吗？")){ state=freshState(); localStorage.removeItem(STORAGE_KEY); render(); } });
  document.querySelector("#shareEnding").addEventListener("click",async()=>{ const text=`我在《零点未读》中达成了「${e.title}」与 ${e.rank} 级评价。`; try{await navigator.clipboard.writeText(text);showToast("结局已复制");}catch{showToast(text);} });
}

function renderNotebook() {
  document.querySelectorAll("[data-notebook-tab]").forEach(x=>x.classList.toggle("active",x.dataset.notebookTab===notebookTab));
  if(notebookTab==="clues") {
    notebookBody.innerHTML=state.clues.length?state.clues.map((id,i)=>`<div class="note-item"><span class="num">${String(i+1).padStart(2,"0")}</span><div><b>${CLUES[id][0]}</b><p>${CLUES[id][1]}</p></div></div>`).join(""):`<div class="empty-note">线索页还是空的。<br>先去观察那些不自然的细节。</div>`;
  } else if(notebookTab==="people") {
    notebookBody.innerHTML=Object.entries(PEOPLE).map(([id,p],i)=>`<div class="note-item"><span class="num">0${i+1}</span><div><b>${p.name} · ${p.role}</b><p>${p.desc}<br>信任度：${"●".repeat(state.trust[id])}${"○".repeat(4-state.trust[id])} ${state.confrontations.includes(id)?"· 证词已被物证修正":state.interviews.includes(id)?"· 原始证词已记录":"· 尚未问询"}</p></div></div>`).join("");
  } else {
    const events=["18:30 · 众人抵达潮汐馆","20:31—20:36 · 五条消息创建","20:42 · 卫星网络中断","21:12 · 温栀离开，死者活着","21:18 · 苏遥离开，死者活着","21:39 · 陈默最后确认死者活着","21:51 · 暖气被调高","22:01 · 酒窖门开启","22:30 · 五次发送失败","23:17 · 路由器重启，消息送达"];
    notebookBody.innerHTML=events.map((x,i)=>`<div class="note-item"><span class="num">${String(i+1).padStart(2,"0")}</span><div><b>${x}</b><p>${state.solved.includes("timeline")||i<3?"已由记录确认":"时间尚待证词或日志确认"}</p></div></div>`).join("");
  }
}

function toggleAudio() {
  const btn=document.querySelector("#soundBtn");
  if(audioCtx){ audioCtx.close(); audioCtx=null; btn.textContent="♩"; btn.setAttribute("aria-label","开启环境音"); showToast("环境音已关闭"); return; }
  audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  const length=audioCtx.sampleRate*2, buffer=audioCtx.createBuffer(1,length,audioCtx.sampleRate), data=buffer.getChannelData(0);
  for(let i=0;i<length;i++) data[i]=(Math.random()*2-1)*.34;
  rainNode=audioCtx.createBufferSource(); rainNode.buffer=buffer; rainNode.loop=true;
  const filter=audioCtx.createBiquadFilter(); filter.type="lowpass"; filter.frequency.value=1100;
  const gain=audioCtx.createGain(); gain.gain.value=.045;
  rainNode.connect(filter).connect(gain).connect(audioCtx.destination); rainNode.start();
  btn.textContent="♪"; btn.setAttribute("aria-label","关闭环境音"); showToast("环境音已开启");
}

document.querySelector("#clueBtn").addEventListener("click",()=>{ renderNotebook(); notebook.showModal(); });
document.querySelector("#closeNotebook").addEventListener("click",()=>notebook.close());
document.querySelectorAll("[data-notebook-tab]").forEach(el=>el.addEventListener("click",()=>{notebookTab=el.dataset.notebookTab;renderNotebook();}));
document.querySelector("#saveBtn").addEventListener("click",()=>saveState());
document.querySelector("#soundBtn").addEventListener("click",toggleAudio);
const pauseMenu=document.querySelector("#pauseMenu");
document.querySelector("#homeBtn").addEventListener("click",()=>{
  if(state.screen==="cover")return;
  document.querySelector("#pauseChapter").textContent=chapterName();
  pauseMenu.showModal();
});
document.querySelector("#resumeBtn").addEventListener("click",()=>pauseMenu.close());
document.querySelector("#pauseClueBtn").addEventListener("click",()=>{pauseMenu.close();renderNotebook();notebook.showModal();});
document.querySelector("#pauseSaveBtn").addEventListener("click",()=>saveState());
document.querySelector("#titleBtn").addEventListener("click",()=>{state.resumeScreen=state.screen;state.screen="cover";pauseMenu.close();saveState("");render();});
document.querySelector("#restartBtn").addEventListener("click",()=>{if(confirm("重新开始会覆盖当前自动存档，确定吗？")){state=freshState();localStorage.removeItem(STORAGE_KEY);pauseMenu.close();render();}});
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&notebook.open)notebook.close(); if(e.key.toLowerCase()==="n"&&!notebook.open&&!pauseMenu.open&&state.screen!=="cover"){renderNotebook();notebook.showModal();} });

render();
