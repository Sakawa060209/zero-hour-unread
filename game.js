const STORAGE_KEY = "zero-hour-unread-save-v1";

const CLUES = {
  body: ["尸体与室温", "死者后脑遭钝器重击；过高室温会让死亡时间显得更晚。"],
  message: ["延迟送达的消息", "五条消息20:31—20:36创建，原定22:30发送，网络恢复后于23:17送达。"],
  bolt: ["横闩蓝色纤维", "横闩凹槽里卡着蓝色纤维，门缝下有半透明蓝蜡。"],
  bookend: ["黄铜书挡", "波浪形书挡被异常擦净，凹槽中仍残留头发与少量血迹。"],
  heat: ["暖气日志", "21:51，档案室温度被手动调至30度。"],
  pagegap: ["缺失的第217页", "校样从216页跳到218页，缺页涉及沈奕的版权转让。"],
  cups: ["两只茶杯", "第二只茶杯底有干涸墨水，证明温栀曾进入档案室。"],
  window: ["锁死的窗", "窗框灰尘完好、窗外没有落脚点，可排除翻窗离开。"],
  wine: ["酒窖温度日志", "酒窖门真正开启于22:01，并非记录本上的21:44。"],
  recording: ["温栀的录音", "20:56—21:09，陆承舟承认拿走手稿，并选择不呼救。"],
  router: ["路由器后台日志", "21:20—23:17无人操作；23:17由周启重启，待发消息随即送达。"],
  usb: ["财务U盘", "周启盗走的U盘记录着挪用款项，并存有“夜航”与路由器说明。"],
  greenhouse: ["温室会面", "苏遥承认21:18见过陆承舟；她离开时他仍活着。"],
  watch: ["陈默的运动手表", "陈默21:34进入档案室，21:39离开；这是最后的生存确认。"],
  fragments: ["第217页残片", "陆承舟明知旧案真相，却把唐若岚改写成策划者。"],
  contracts: ["两份签名", "第一份证明手稿属于沈奕；第二份在沈奕死后三天伪造版权转让。"],
  thread: ["蓝色装订蜡线", "唐若岚的线轴缺少约一米，材质与门闩纤维、蜡屑一致。"],
  finger: ["右手食指勒痕", "晚餐时尚不存在；案发后出现，符合高张力蜡线滑过皮肤的痕迹。"],
  lockedroom: ["密室复原", "蜡线可在门外拉动横闩，再从门缝完整抽走。"],
  timeline: ["关键作案窗口", "陆承舟死于21:39—22:01之间，唐若岚没有真实不在场证明。"],
  hiddenrec: ["隐藏录音系统", "陆承舟暗中记录所有人的反应，准备把在场者写进《第六个证人》。"]
};

const PEOPLE = {
  tang: { name: "唐若岚", age: 42, role: "责任编辑", glyph: "岚", desc: "冷静、克制。习惯使用蓝色装订蜡线。" },
  wenzhi: { name: "温栀", age: 27, role: "悬疑小说家", glyph: "栀", desc: "沈奕的妹妹，带着旧海鸟吊坠而来。" },
  zhou: { name: "周启", age: 31, role: "生活助理", glyph: "启", desc: "熟悉馆内网络与电路，正被财务秘密困住。" },
  su: { name: "苏遥", age: 39, role: "纪录片导演", glyph: "遥", desc: "陆承舟前妻，只想取回关于女儿的文件。" },
  chen: { name: "陈默", age: 46, role: "私人医生", glyph: "默", desc: "总用模糊的时间表达，知道十四年前的记录。" }
};

const LOCATIONS = [
  { id: "body", title: "尸体", icon: "人", teaser: "后脑伤、凝固的血、袖口蓝蜡与异常室温。", clues: ["body"], text: "陆承舟侧倒在书桌旁，后脑有明显撞击伤。陈默给出的死亡时间是十点半到十一点，但暖气开得过高——高温会减慢尸体降温，让死亡看起来发生得更晚。" },
  { id: "phone", title: "手机", icon: "信", teaser: "屏幕显示：五条消息已于23:17送达。", clues: ["message"], text: "“送达”不等于“写下”。夜航的本地记录显示：五条消息在20:31到20:36创建，预定22:30发送，第一次发送因断网失败，23:17才自动重试成功。" },
  { id: "door", title: "房门与横闩", icon: "闩", teaser: "由内滑动的横闩，凹槽里却留着蓝色。", clues: ["bolt"], text: "横闩下有新鲜划痕，凹槽内卡着一根蓝色纤维。门缝下还有三点半透明蜡屑。有人也许能在门关上之后，从走廊移动它。" },
  { id: "bookend", title: "黄铜书挡", icon: "凶", teaser: "成对的波浪书挡，其中一只干净得不自然。", clues: ["bookend"], text: "右侧黄铜书挡底部被擦得异常干净。凹槽深处残留一根头发，边缘有未擦净的暗色血迹。它的重量足以造成死者的伤口。" },
  { id: "heater", title: "温控器", icon: "温", teaser: "20:05为21度，21:51被调到最高。", clues: ["heat"], text: "温控记录没有说谎：21:51，设定温度从21度骤升至30度。调高暖气的人并不是为了取暖，而是想让尸体降温得更慢。" },
  { id: "desk", title: "书桌与校样", icon: "217", teaser: "《第六个证人》从216页直接跳到218页。", clues: ["pagegap"], text: "第216页末尾写着“她第一次签下名字，是为了证明沈奕拥有那部作品”；第218页开头则是“第二次签名，让一个死人主动放弃权利”。中间那页被人撕走了。" },
  { id: "cups", title: "两只茶杯", icon: "茶", teaser: "一只属于死者；另一只杯底凝着墨水。", clues: ["cups"], text: "第二只茶杯没有口红或完整指纹，杯底却留有干涸的蓝黑墨水。它能证明有人曾在更早的时候来过，却不能证明那个人杀了陆承舟。" },
  { id: "window", title: "东侧窗户", icon: "窗", teaser: "窗外是悬崖，窗框灰尘保持完整。", clues: ["window"], text: "插销从内部锁住，窗框积灰没有擦碰，窗外也没有阳台或落脚点。所谓“翻窗逃离”可以从理论中排除。" }
];

const INTERVIEWS = {
  tang: {
    claim: "“九点四十分左右，我去了酒窖。十点过后，我回到大厅。期间没有见过陆承舟。”",
    result: "酒窖传感器不接受记忆误差：门在22:01才开启。唐若岚说自己“记错了”，但她伪造酒窖记录的事实已经留下。",
    clues: ["wine"],
    prompts: {
      truth: ["出示酒窖日志", "用自动记录拆穿她精确的‘九点四十分’。"],
      judge: ["指出她在说谎", "迫使她解释为什么伪造不在场证明。"],
      empathy: ["暂时保留质疑", "先让沉默逼她补充自己的行踪。"]
    }
  },
  wenzhi: {
    claim: "“晚餐后我一直在房间。我没有进入档案室。那条消息只是陆承舟故意刺激我。”",
    result: "茶杯底的墨水击破了证词。温栀承认20:50进入档案室；她录下陆承舟对十四年前的承认，21:12离开时他仍活着。",
    clues: ["recording"],
    prompts: {
      truth: ["出示墨水茶杯", "证明她来过，再要求查看录音设备。"],
      judge: ["强行搜查录音", "不接受她以旧案为由隐瞒当前行踪。"],
      empathy: ["谈起沈奕", "承认她说谎是为了保护哥哥留下的真相。"]
    }
  },
  zhou: {
    claim: "“九点二十之后我一直在检查网络。我没有去过陆先生的书房。”",
    result: "后台记录显示21:20—23:17无人操作。周启终于交出财务U盘：他偷过钱，也偷走了证据，但23:17重启路由器的确是他。",
    clues: ["router", "usb"],
    prompts: {
      truth: ["核对后台日志", "让系统记录回答他所谓‘一直检查网络’。"],
      judge: ["要求立刻交出U盘", "盗窃不是谋杀，却仍需要承担后果。"],
      empathy: ["答应暂不公开挪用", "以有限保密换取完整网络记录。"]
    }
  },
  su: {
    claim: "“九点以后，我一直在给女儿录消息。直到收到那条消息，我才知道红盒。”",
    result: "温室水渍与语音创建时间逼出真话：苏遥21:18见过陆承舟并打了他一耳光。她离开时，陆承舟仍然活着。",
    clues: ["greenhouse"],
    prompts: {
      truth: ["出示温室水渍", "她的袖口替她记录了去过哪里。"],
      judge: ["追问肢体冲突", "要求她解释为什么隐瞒那一记耳光。"],
      empathy: ["承诺不牵涉女儿", "先拿走她说谎背后最大的顾虑。"]
    }
  },
  chen: {
    claim: "“我十点左右去看过承舟。他当时状态正常，之后我回房休息。”",
    result: "运动手表把‘十点左右’修正为21:34—21:39。陈默是最后一个确认陆承舟活着的人；他说谎是因为两人谈到被篡改的旧死亡证明。",
    clues: ["watch"],
    prompts: {
      truth: ["读取运动手表", "用步行轨迹还原他真正的到访时间。"],
      judge: ["质问医疗记录", "他帮助过陆承舟，沉默也有代价。"],
      empathy: ["保持沉默", "给他三秒，让他自己说出‘我修改的只是时间’。"]
    }
  }
};

const DEFAULT_STATE = {
  version: 1,
  player: "审阅员",
  screen: "cover",
  prologueStep: 0,
  clues: [],
  inspected: [],
  interviews: [],
  archive: [],
  solved: [],
  trust: { tang: 2, wenzhi: 2, zhou: 2, su: 2, chen: 2 },
  tendency: { truth: 0, judge: 0, empathy: 0 },
  flags: {},
  errors: 0,
  hints: 0,
  verdictStep: 0,
  ending: null,
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
    return saved?.version === 1 ? { ...freshState(), ...saved } : freshState();
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
    archive: renderArchive,
    reasoning: renderReasoning,
    final: renderFinal,
    ending: renderEnding
  };
  (screens[state.screen] || renderCover)();
  app.focus({ preventScroll: true });
}

function renderCover() {
  const canContinue = !!localStorage.getItem(STORAGE_KEY) && state.startedAt && !state.ending;
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
        ${canContinue ? `<div class="cover-actions"><button class="btn secondary small" id="continueBtn">继续：${escapeHTML(chapterName())}</button></div>` : ""}
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
  document.querySelector("#continueBtn")?.addEventListener("click", () => { render(); state.screen === "cover" && setScreen("prologue"); });
}

function chapterName() {
  return ({ prologue:"序章·暴雨来客", discovery:"第一章·23点17分", investigation:"第二章·锁住的房间", interviews:"第三章·每个人都在说谎", archive:"第四章·被撕掉的第217页", reasoning:"第五章·复原与时间", final:"第七章·最终指认" })[state.screen] || "未结案";
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
      if (choice === "observe") { state.flags.recorderSeed = true; addClue("window"); }
      showToast(({ knock:"你在敲门声后听见了六个人的脚步", observe:"东侧亮窗外没有阳台，排水管也无法承重", cars:"六辆车都在，轮胎上覆盖着新雨", signal:"发送失败：卫星链路不可用" })[choice]);
      state.prologueStep = 1; saveState(""); setTimeout(render, 350);
    });
  } else if (step === 1) {
    app.innerHTML = storyScreen("19:10 · 晚餐", `
      <p>陆承舟坐在长桌尽头，逐一介绍今晚的客人。窗外海浪撞击岩壁，像有人在黑暗里一遍遍敲门。</p>
      <p>他把手放在一本未装订的校样上。</p>
      <p class="quote">“《第六个证人》不是小说，是五份证词。今晚结束之后，我们之中至少有一个人，再也无法回到原来的生活。”</p>
      <p>温栀问：“第六个证人是谁？”</p>
      <p>陆承舟越过烛光看向你。“也许是记录这一切的人。”</p>`, [
        ["观察唐若岚", "她正用蓝色蜡线固定散开的校样", "tang"],
        ["观察温栀", "她鞋底的浅灰海沙来自旧潮洞", "wenzhi"],
        ["观察周启", "他不断确认卫星路由器状态", "zhou"],
        ["观察苏遥与陈默", "一个盯着楼梯，一个盯着陆承舟的酒杯", "others"]
      ]);
    bindChoices(choice => {
      state.flags[`observed_${choice}`] = true;
      if (choice === "tang") showToast("记忆：唐若岚右手食指完好，绕线动作十分熟练");
      else showToast("这次观察会被写入你的调查记录");
      state.prologueStep = 2; saveState(""); setTimeout(render, 350);
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
  chapter("第三章 · 每个人都在说谎");
  const active = state.flags.activeInterview;
  if (active) return renderInterviewDetail(active);
  const done = state.interviews.length;
  app.innerHTML = `<section class="screen">
    <div class="chapter-head"><div><p class="eyebrow">CHAPTER 03 · TESTIMONIES</p><h2>每个人都在说谎</h2><p class="chapter-summary">谎言并不都指向谋杀。有的人在隐藏盗窃，有的人在保护家人，有的人在保护十四年前的自己。</p></div><div class="chapter-no">${done}/5</div></div>
    <div class="case-layout"><div><div class="suspect-grid">${Object.entries(PEOPLE).map(([id,p])=>`<button class="suspect-card ${state.interviews.includes(id)?'done':''}" data-person="${id}"><span class="card-index">${p.age}岁 · ${p.role}</span><h3>${p.name}</h3><p>${p.desc}</p><div class="trust"><div class="trust-line">${[1,2,3,4].map(n=>`<i class="${state.trust[id]>=n?'on':''}"></i>`).join("")}</div></div></button>`).join("")}</div>
    <div style="margin-top:26px"><button class="btn" id="toArchive" ${done<5?'disabled':''}>${done<5?`还有 ${5-done} 份证词未核对`:'寻找被撕掉的第217页'} <span>→</span></button></div></div>${sideFile()}</div></section>`;
  document.querySelectorAll("[data-person]").forEach(el => el.addEventListener("click", () => { state.flags.activeInterview = el.dataset.person; render(); }));
  document.querySelector("#toArchive").addEventListener("click", () => { delete state.flags.activeInterview; setScreen("archive"); });
}

function renderInterviewDetail(id) {
  const p = PEOPLE[id], interview = INTERVIEWS[id], already = state.interviews.includes(id);
  app.innerHTML = `<section class="screen narrow"><button class="btn secondary small" id="backInterviews">← 返回人物列表</button><div class="dialogue" style="margin-top:28px">
    <div class="speaker"><div class="portrait">${p.glyph}</div><div class="speech"><b>${p.name} · 初始证词</b><p>${interview.claim}</p></div></div>
    ${already ? `<div class="reveal"><p class="eyebrow">STATEMENT UPDATED</p><h3>证词已经被修正</h3><p>${interview.result}</p>${interview.clues.map(c=>`<span class="evidence-tag">${CLUES[c][0]}</span>`).join("")}</div>` : `<p class="puzzle-instruction">选择你的询问方式。态度不会改变凶手，却会改变人物是否愿意把最深的秘密交给你。</p><div class="approach-grid">${Object.entries(interview.prompts).map(([type,v])=>`<button class="approach" data-approach="${type}"><b>${v[0]}</b><small>${v[1]}</small></button>`).join("")}</div>`}
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
  INTERVIEWS[id].clues.forEach(addClue);
  saveState("");
  renderInterviewDetail(id);
}

const ARCHIVE_ITEMS = [
  { id:"fragments", title:"大厅壁炉", sub:"木柴受潮，纸灰里仍有四块未烧净的校样。", clue:"fragments", text:"残页写道：唐若岚从一开始就知道沈奕不会回来。页边却有陆承舟的批注——“这样更有戏剧性。让她承担主动策划的责任。”这证明他明知内容并非事实。" },
  { id:"contracts", title:"红色文件盒", sub:"两份文件上，都有唐若岚的名字。", clue:"contracts", text:"投稿确认书签于沈奕生前，证明作品属于他；版权转让书却签于沈奕死亡三天后。唐若岚参与造假，但文件不能证明她策划了沈奕之死。" },
  { id:"thread", title:"装订工具箱", sub:"蓝色亚麻线轴少了大约一米。", clue:"thread", text:"蜡线的材质、颜色和表面蜡质与门闩残留一致。工具箱曾放在大厅，单凭线轴不能定罪，但它给出了复原密室的方法。" },
  { id:"finger", title:"唐若岚的右手", sub:"食指侧面多出一道细长、崭新的勒痕。", clue:"finger", text:"这不是纸割伤，而是细线在高张力下滑过皮肤留下的痕迹。若你在晚餐观察过她，还能确认这道伤在案发前并不存在。" }
];

function renderArchive() {
  chapter("第四章 · 被撕掉的第217页");
  const done = state.archive.length;
  app.innerHTML = `<section class="screen">
    <div class="chapter-head"><div><p class="eyebrow">CHAPTER 04 · THE MISSING PAGE</p><h2>被撕掉的第217页</h2><p class="chapter-summary">当前谋杀与十四年前的潮洞之间，隔着一张被改写、撕碎、投入火中的纸。</p></div><div class="chapter-no">217</div></div>
    <div class="case-layout"><div><div id="archiveReveal"></div><div class="location-grid">${ARCHIVE_ITEMS.map((item,i)=>`<button class="location-card ${state.archive.includes(item.id)?'done':''}" data-archive="${item.id}"><span class="card-index">ARCHIVE · 0${i+1}</span><h3>${item.title}</h3><p>${item.sub}</p><span class="card-icon">${i===0?'页':i===1?'签':i===2?'线':'伤'}</span></button>`).join("")}</div>
    <div style="margin-top:26px"><button class="btn" id="toReasoning" ${done<4?'disabled':''}>${done<4?`还需核对 ${4-done} 组旧案证据`:'开始复原密室与时间线'} <span>→</span></button></div></div>${sideFile()}</div></section>`;
  document.querySelectorAll("[data-archive]").forEach(el => el.addEventListener("click", () => inspectArchive(el.dataset.archive)));
  document.querySelector("#toReasoning").addEventListener("click", () => setScreen("reasoning"));
}

function inspectArchive(id) {
  const item = ARCHIVE_ITEMS.find(x=>x.id===id);
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

const DOOR_EVENTS = [
  ["line", "将蓝色蜡线绕过横闩把手"],
  ["ends", "让两端线头从门缝伸到走廊"],
  ["close", "关闭房门"],
  ["pull", "同时拉紧两端，让横闩滑入凹槽"],
  ["release", "松开其中一端"],
  ["extract", "从另一端抽走整根蜡线"]
];
const TIMELINE_EVENTS = [
  ["chenIn", "21:34 · 陈默进入档案室"],
  ["chenOut", "21:39 · 陈默离开，死者仍活着"],
  ["tangIn", "21:43 · 唐若岚进入档案室"],
  ["death", "21:48 · 陆承舟死亡"],
  ["heater", "21:51 · 暖气被调高"],
  ["cellar", "22:01 · 酒窖门真正开启"],
  ["router", "23:17 · 路由器重启，消息送达"]
];

function renderReasoning() {
  chapter("第五、六章 · 复原与时间");
  const mode = state.flags.puzzleMode;
  if (mode === "door") return renderSequencePuzzle("door", DOOR_EVENTS, "复原密室", "按操作顺序放置六张步骤卡。再次点击上方卡片可以撤回。", "lockedroom");
  if (mode === "timeline") return renderSequencePuzzle("timeline", TIMELINE_EVENTS, "真正的死亡时间", "将七张事件卡按真实发生顺序排列。", "timeline");
  if (mode === "deduction") return renderDeductions();
  const solved = state.solved.length;
  app.innerHTML = `<section class="screen">
    <div class="chapter-head"><div><p class="eyebrow">CHAPTER 05–06 · RECONSTRUCTION</p><h2>不要相信钟面</h2><p class="chapter-summary">密室、死亡时间和五条消息，是同一个人为你安排的三种错觉。</p></div><div class="chapter-no">${solved}/3</div></div>
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

function renderSequencePuzzle(type, events, title, instruction, resultId) {
  const currentKey = `${type}Sequence`;
  state.flags[currentKey] ||= [];
  const selected = state.flags[currentKey];
  app.innerHTML = `<section class="screen narrow"><button class="btn secondary small" id="backReasoning">← 返回推理桌</button><div class="puzzle-board" style="margin-top:24px"><p class="eyebrow">RECONSTRUCTION</p><h2>${title}</h2><p class="puzzle-instruction">${instruction}</p><div class="sequence" id="sequence">${selected.map((id,i)=>`<button class="event-card" data-remove="${id}" data-order="${i+1}">${events.find(x=>x[0]===id)[1]}</button>`).join("")}</div><div class="card-bank">${events.map(e=>`<button class="event-card ${selected.includes(e[0])?'selected':''}" data-add="${e[0]}">${e[1]}</button>`).join("")}</div><div class="puzzle-actions"><button class="btn" id="checkSequence" ${selected.length!==events.length?'disabled':''}>验证顺序</button><button class="btn secondary" id="hintPuzzle">获得提示</button></div></div></section>`;
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
  { id:"warm", q:"凶手为什么在21:51调高暖气？", options:["销毁潮湿的纸张","让尸体降温变慢，干扰死亡时间","迫使众人离开二楼"], answer:1, result:"高温让死亡看起来更接近消息送达时间。" },
  { id:"window", q:"哪段时间是凶手必须解释的窗口？", options:["20:42—21:12","21:39—22:01","22:30—23:17"], answer:1, result:"最后生存确认与酒窖开门之间，唐若岚没有不在场证明。" }
];

function renderDeductions() {
  state.flags.deductions ||= [];
  app.innerHTML = `<section class="screen narrow"><button class="btn secondary small" id="backReasoning">← 返回推理桌</button><div class="puzzle-board" style="margin-top:24px"><p class="eyebrow">CERTAIN INFERENCES</p><h2>形成确定推论</h2><p class="puzzle-instruction">每个答案都必须同时解释已获得的时间记录和物证。</p><div class="deduction-list">${DEDUCTIONS.map((d,i)=>`<div class="deduction ${state.flags.deductions.includes(d.id)?'done':''}"><h3><span>推论 0${i+1}</span>${d.q}</h3>${state.flags.deductions.includes(d.id)?`<p>${d.result}</p>`:`<div class="option-row">${d.options.map((o,j)=>`<button class="option-pill" data-deduction="${d.id}" data-answer="${j}">${o}</button>`).join("")}</div>`}</div>`).join("")}</div></div></section>`;
  document.querySelector("#backReasoning").addEventListener("click",()=>{ delete state.flags.puzzleMode; saveState(""); render(); });
  document.querySelectorAll("[data-deduction]").forEach(el=>el.addEventListener("click",()=>{
    const d=DEDUCTIONS.find(x=>x.id===el.dataset.deduction);
    if (+el.dataset.answer===d.answer) {
      if(!state.flags.deductions.includes(d.id)) state.flags.deductions.push(d.id);
      showToast(`推论成立：${d.result}`);
      if(state.flags.deductions.length===DEDUCTIONS.length && !state.solved.includes("deductions")) state.solved.push("deductions");
    } else { state.errors++; showToast("这项解释与至少一条自动记录冲突"); }
    saveState(""); render();
  }));
}

const VERDICT_QUESTIONS = [
  { q:"消息能否证明陆承舟在23:17仍然活着？", options:["能，五部手机同时收到","不能，消息早已写好并进入等待队列","不能，因为手机时间被修改"], answer:1, evidence:"消息创建记录＋网络故障日志" },
  { q:"档案室为什么会从内部上闩？", options:["凶手躲在房内直到破门","凶手用蓝色蜡线在门外拉动横闩","横闩因门板震动自行滑落"], answer:1, evidence:"门闩纤维＋蓝蜡＋密室复原" },
  { q:"唐若岚真正进入酒窖的时间？", options:["21:44","21:51","22:01"], answer:2, evidence:"酒窖温度传感器日志" },
  { q:"她为什么与陆承舟发生致命冲突？", options:["陆承舟发现她偷取稿费","陆承舟拒绝交出女儿文件","陆承舟准备把十四年前的全部责任推给她"], answer:2, evidence:"第217页＋两份合同＋手写批注" },
  { q:"什么证明她亲手操作了蜡线？", options:["右手食指的新鲜勒痕","银戒上的旧划痕","袖口沾有蓝色墨水"], answer:0, evidence:"晚餐观察＋案发后伤口" }
];

function renderFinal() {
  chapter("第七章 · 最终指认");
  if (!state.flags.accused) return renderAccusation();
  if (state.flags.accused !== "tang") return renderWrongAccusation();
  if (state.verdictStep < VERDICT_QUESTIONS.length) return renderVerdictQuestion();
  if (!state.flags.confrontation) return renderConfrontation();
  return renderMoralChoice();
}

function renderAccusation() {
  app.innerHTML = `<section class="screen narrow final-room"><p class="eyebrow">FINAL ACCUSATION · 00:03</p><h1>谁杀了陆承舟？</h1><p class="lead" style="margin-left:auto;margin-right:auto">暴雨仍未停止。五个人坐在大厅里，等你把散落的事实写成唯一能够闭合的故事。</p><div class="accuse-grid">${Object.entries(PEOPLE).map(([id,p])=>`<button class="accuse" data-accuse="${id}"><span>${p.glyph}</span><b>${p.name}</b></button>`).join("")}</div><p class="muted" style="margin-top:26px">错误指认会给真凶清理决定性证据的时间。</p></section>`;
  document.querySelectorAll("[data-accuse]").forEach(el=>el.addEventListener("click",()=>{ state.flags.accused=el.dataset.accuse; saveState(""); render(); }));
}

function renderWrongAccusation() {
  const p=PEOPLE[state.flags.accused];
  app.innerHTML=`<section class="screen narrow"><div class="story-panel" data-time="00:08 · 大厅"><div class="story-text"><p>你指向${p.name}。</p><p>唐若岚逐一指出理论中的缺口：陈默21:39仍见到陆承舟活着；消息并非实时写下；被指认者无法解释蓝色蜡线和酒窖日志。</p><p class="quote">“现在最重要的证据已经被错误的推理污染。我们应该停止互相审判，等待警方。”</p><p>次日清晨，壁炉里的纸页残片消失了。</p></div><div class="choice-list"><button class="choice" id="badEnd"><span class="choice-index">END</span><span><b>接受错误指认的后果</b><small class="muted">坏结局·最方便的凶手</small></span><span class="choice-arrow">→</span></button><button class="choice" id="retryAccuse"><span class="choice-index">↺</span><span><b>重新检查指认</b><small class="muted">计入一次错误推理</small></span><span class="choice-arrow">←</span></button></div></div></section>`;
  document.querySelector("#badEnd").addEventListener("click",()=>finishEnding("bad"));
  document.querySelector("#retryAccuse").addEventListener("click",()=>{ state.errors++; delete state.flags.accused; saveState(""); render(); });
}

function renderVerdictQuestion() {
  const i=state.verdictStep, q=VERDICT_QUESTIONS[i];
  app.innerHTML=`<section class="screen"><div class="verdict-question"><p class="question-count">DEDUCTION ${String(i+1).padStart(2,"0")} / 05</p><h2>${q.q}</h2><p class="puzzle-instruction">需要出示：${q.evidence}</p>${q.options.map((o,j)=>`<button class="verdict-option" data-verdict="${j}"><span class="choice-index">0${j+1}</span>　${o}</button>`).join("")}<div style="margin-top:22px"><button class="btn secondary small" id="verdictHint">提示</button></div></div></section>`;
  document.querySelectorAll("[data-verdict]").forEach(el=>el.addEventListener("click",()=>{
    if(+el.dataset.verdict===q.answer){ state.verdictStep++; saveState(""); showToast("证据链继续闭合"); render(); }
    else { state.errors++; el.classList.add("wrong"); saveState(""); showToast("唐若岚：这解释不了你已经找到的记录"); }
  }));
  document.querySelector("#verdictHint").addEventListener("click",()=>{ state.hints++; saveState(""); showToast(`回到线索簿，核对：${q.evidence}`); });
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
  const hidden = type === "all" && state.flags.recorderSeed && state.flags.observed_tang && state.trust.wenzhi >= 3 && state.flags.fragmentsComplete && state.errors < 3;
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
  app.innerHTML=`<section class="ending"><div class="ending-mark">${e.rank}</div><p class="eyebrow">CASE CLOSED · 00:17</p><h1>${e.title}</h1><div class="ending-copy">${e.copy.map(x=>`<p>${x}</p>`).join("")}</div><div class="ending-stats"><div><b>${state.clues.length}</b><small>线索</small></div><div><b>${state.errors}</b><small>错误推理</small></div><div><b>${state.hints}</b><small>提示</small></div><div><b>${mins}</b><small>分钟</small></div></div><div class="rating"><strong>${e.rank}</strong><span>${e.rank==='S'?'第六个证人':e.rank==='A'?'退潮之后':e.rank==='B'?'锁住的房间':e.rank==='C'?'有罪的人':'方便的真相'}</span></div><div class="cover-actions"><button class="btn" id="newGame">重新调查</button><button class="btn secondary" id="shareEnding">复制结局</button></div></section>`;
  document.querySelector("#newGame").addEventListener("click",()=>{ if(confirm("重新开始会覆盖当前自动存档，确定吗？")){ state=freshState(); localStorage.removeItem(STORAGE_KEY); render(); } });
  document.querySelector("#shareEnding").addEventListener("click",async()=>{ const text=`我在《零点未读》中达成了「${e.title}」与 ${e.rank} 级评价。`; try{await navigator.clipboard.writeText(text);showToast("结局已复制");}catch{showToast(text);} });
}

function renderNotebook() {
  document.querySelectorAll("[data-notebook-tab]").forEach(x=>x.classList.toggle("active",x.dataset.notebookTab===notebookTab));
  if(notebookTab==="clues") {
    notebookBody.innerHTML=state.clues.length?state.clues.map((id,i)=>`<div class="note-item"><span class="num">${String(i+1).padStart(2,"0")}</span><div><b>${CLUES[id][0]}</b><p>${CLUES[id][1]}</p></div></div>`).join(""):`<div class="empty-note">线索页还是空的。<br>先去观察那些不自然的细节。</div>`;
  } else if(notebookTab==="people") {
    notebookBody.innerHTML=Object.entries(PEOPLE).map(([id,p],i)=>`<div class="note-item"><span class="num">0${i+1}</span><div><b>${p.name} · ${p.role}</b><p>${p.desc}<br>信任度：${"●".repeat(state.trust[id])}${"○".repeat(4-state.trust[id])} ${state.interviews.includes(id)?"· 证词已修正":"· 尚未完成审问"}</p></div></div>`).join("");
  } else {
    const events=["18:30 · 众人抵达潮汐馆","20:31 · 五条消息开始创建","20:42 · 卫星网络中断","21:39 · 陈默最后确认死者活着","21:43 · 唐若岚进入档案室","21:51 · 暖气被调高","22:01 · 酒窖门开启","23:17 · 路由器重启，消息送达"];
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
document.querySelector("#homeBtn").addEventListener("click",()=>{ if(state.ending){state.screen="ending";render();} else showToast(chapterName()); });
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&notebook.open)notebook.close(); if(e.key.toLowerCase()==="n"&&!notebook.open&&state.screen!=="cover"){renderNotebook();notebook.showModal();} });

render();
