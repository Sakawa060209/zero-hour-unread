(function () {
  "use strict";

  const Logic = window.WrongFloorLogic;
  const SAVE_KEY = "wrong-floor-save-v1";
  const META_KEY = "wrong-floor-meta-v1";
  const app = document.querySelector("#app");
  const topbar = document.querySelector("#topbar");
  const modal = document.querySelector("#modal");
  const modalContent = document.querySelector("#modal-content");
  const toastNode = document.querySelector("#toast");

  const CHAPTERS = [
    null,
    { title: "1102", subtitle: "所有门都锁着。但我们先别急着寻找出口。", objective: "完成现场勘查，判断“密室”问题是否成立。" },
    { title: "不可能的嫌疑人", subtitle: "最强的动机，最完整的不在场证明。两者都是真的。", objective: "重排论坛时间线，检验许遥是否可能往返现场。" },
    { title: "十三厘米", subtitle: "房间不会作证，尺寸会。", objective: "复核现场照片与 1102 户型图的空间关系。" },
    { title: "不存在的房间", subtitle: "从一张图上消失，不等于从建筑里消失。", objective: "比对五版建筑档案，找出被注销的空间。" },
    { title: "镜室", subtitle: "两个几乎相同的房间，只有一个记得那晚发生了什么。", objective: "对照 1102 与隐蔽房间，确认第一现场。" },
    { title: "21:41", subtitle: "记录从未说谎。说得太多的是我们。", objective: "剥离门禁与证言中的解释，重建可验证事实。" },
    { title: "所有人都说了真话", subtitle: "没有一句假话，却共同拼出了一个错误现场。", objective: "完成二轮审讯，厘清袖扣与结构传声。" },
    { title: "谁知道1402", subtitle: "机会不再是进入 1102，而是知道 1402。", objective: "用知识、权限与行为证据筛选置换现场的人。" },
    { title: "错误的问题", subtitle: "回答八个问题，然后决定哪些真相应该走出这栋楼。", objective: "提交一致的案件报告并完成最终举证。" }
  ];

  const EVIDENCE = {
    e_lock: ["门锁状态", "现场·观察", "1102 门链从室内挂上；电子锁无撬动。破门前无法从外侧复位门链。"],
    e_access: ["21:41 门禁记录", "系统·原始记录", "21:41:08，卡号 A047，1102，开启成功。记录没有持卡人的影像。"],
    e_body: ["尸表与伤口", "法医·初检", "后枕部钝器样撞击，死亡约在 19:00—20:00；尸体周围缺少对应喷溅。"],
    e_water: ["浴室溢水", "现场·痕迹", "水龙头在小流量持续出水，22:36 才渗到楼下；像是用来安排发现时间。"],
    e_cufflink: ["许遥的袖扣", "现场·物证", "书柜底部发现，表面有旧灰尘，凹槽内没有当晚的新鲜纤维。"],
    e_dna: ["1102 内的旧 DNA", "实验室·背景", "林知秋曾长期在 1102 办公，多处 DNA 无法证明他当晚在此活动。"],
    e_stream: ["论坛直播母带", "公开记录·独立来源", "19:40 开场至 22:20 结束，许遥多次连续出镜，没有可供往返的空档。"],
    e_location: ["手机与地铁记录", "运营商·独立来源", "手机基站与实名交通记录均把许遥固定在论坛周边。"],
    e_checkin: ["会场签到与合照", "会场·独立来源", "19:31 签到，22:24 离场合照；二百余名参与者可交叉确认。"],
    e_cuffphoto: ["两周前的合伙人合照", "照片·时间锚点", "9 月 3 日，许遥在 1102 参观；照片中右袖已经少了一枚袖扣。"],
    e_shelf: ["书柜位置复测", "现场·空间痕迹", "发现尸体时的照片中，书柜右缘距墙 83 厘米。"],
    e_plan1102: ["1102 竣工尺寸", "档案·图纸", "固定墙体至标准书柜右缘应为 96 厘米；家具型号无误。"],
    e_plan2012: ["2012 样板层施工图", "市档案馆·原始图", "14 层中部清楚标注 1402，与 1102 同为 B2 户型。"],
    e_plan2019: ["2019 物业电子图", "物业·变更图", "1401 与 1403 被标为合并，原 1402 编号及门位从系统中消失。"],
    e_impact: ["1402 墙面撞击痕", "隐蔽现场·物证", "墙内结构件有新鲜撞击与血液擦拭残留，高度、形状与后枕伤吻合。"],
    e_floor: ["1402 地板拖痕", "隐蔽现场·物证", "地板清洁剂下保留两道平行拖痕，纤维与包裹尸体的搬运毯一致。"],
    e_window: ["照片窗外视角", "影像·空间定位", "死者手机照片可越过对岸楼顶设备层；从 11 层无法形成该俯角。"],
    e_cardlog: ["A047 卡片流转", "系统·行为记录", "A047 未在死者遗物中找到；21:19 后由物业应急卡柜被取出，操作账号属于周岚。"],
    e_pipe: ["垂直排水管图", "工程·结构记录", "1402 与 1102 共用竖向管井。14 层撞击与拖动可在 11 层管井旁被放大听见。"],
    e_permission: ["物业权限审计", "系统·行为证据", "周岚可开启隐蔽档案室、调取搬运车，并在 21:19 取用 A047。"],
    e_oldfile: ["2014 原始验收卷", "旧案·原始文件", "降配变更在事故前获批，林知秋、监理与开发商工程总监均在被修改的验收页签字。"],
    e_message: ["“东西我已经找到了”", "手机·通信", "林知秋 17:58 发给记者梁闻；梁闻删除了附件，却保留了校验摘要。"],
    e_copy: ["顾雪的复制日志", "公司·设备记录", "顾雪 19:03 在停车场见到林知秋并复制资料，谎报离开时间是为掩盖越权。"],
    e_debt: ["保险变更草稿", "私人·动机材料", "程逸并非新增受益人，恰恰在草稿中被移除；经济动机无法证明行为。"],
    e_cart: ["搬运车轮迹", "物业·工具痕迹", "1402 服务通道至货梯有同型轮迹，19:28—21:13 的监控片段因例行维护缺失。"]
  };

  const DEDUCTIONS = {
    d_lock: ["错误的密室问题", "现有材料只能说明尸体在 1102 被发现，不能证明死亡发生于此。"],
    d_alibi: ["许遥的不在场证明成立", "直播、位置与会场三种独立来源形成连续时间链。"],
    d_dimension: ["十三厘米矛盾", "现场照片里的房间尺寸不符合 1102 的固定结构。"],
    d_1402: ["被注销的 1402", "房号从物业系统消失，但原空间仍被合并标注遮蔽。"],
    d_mirror: ["镜像现场", "1402 才是死亡第一现场；1102 是尸体发现现场。"],
    d_semantics: ["证据事实与解释分离", "卡片开启房门，不等于卡片登记人亲自进入。"],
    d_sound: ["结构传声", "沈曼听见了声音，但无法凭听觉确认楼层来源。"],
    d_cuff: ["袖扣的错误时间", "真实物证也可能在与案件无关的时间留下。"],
    d_access: ["置换者的知识范围", "周岚同时具备知识、权限、时间与实际操作记录。"],
    d_oldcase: ["旧案责任链", "旧案是置换现场的深层目的，且责任不止一个人。"]
  };

  const INTERVIEWS = {
    xuyoa: { name: "许遥", role: "前合伙人", lines: ["我说晚上必须有结果。结果是让他决定是否公开资料。", "我没必要破解不在场证明——它本来就是真的。", "袖扣？9 月 3 日参观 1102 后我就发现少了一枚。"] },
    guxue: { name: "顾雪", role: "死者助理", lines: ["林老师六点十分离开公司。", "我说的是离开公司，不是最后一次见他。", "19:03 我在停车场复制过他的资料。我怕这件事把我变成嫌疑人。"] },
    liangwen: { name: "梁闻", role: "调查记者", lines: ["我没收到能发表的东西。", "附件我收到过，但来源未经同意，不能算可用材料。", "我删文件是保护来源；校验摘要能证明它与旧验收卷同源。"] },
    chengyi: { name: "程逸", role: "死者弟弟", lines: ["他最近谈过保险，我确实缺钱。", "我不知道他把谁写成受益人，也没说那个人是我。", "他查旧案是为了交易筹码，不全是忏悔。"] },
    shenman: { name: "沈曼", role: "11 层住户", lines: ["九点多，我听见 1102 一直有声音。", "我没有开门看，只在管井旁听见撞击和拖动。", "我只是觉得，只可能是那里。图纸说明我听见的可能来自 14 层。"] },
    zhoulan: { name: "周岚", role: "物业运营负责人", lines: ["系统里没有 1402。", "我说的是现行物业系统；旧施工图不归我保管。", "我帮你们找图，不代表我希望你们立刻找到那个房间。"] }
  };

  const TIMELINE_ITEMS = {
    location: "19:38 · 手机连接会场 Wi‑Fi",
    photo: "19:42 · 第一张观众合照",
    checkin: "19:57 · 主持人介绍许遥",
    speech: "20:00—21:48 · 连续主题演讲",
    qa: "21:49—22:17 · 现场问答",
    exit: "22:24 · 离场合照与地铁进站"
  };

  let state = loadState();
  let toastTimer = null;

  function loadState() {
    let raw = null;
    try { raw = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (_) { raw = null; }
    const normalized = Logic.normalizeState(raw);
    try {
      const meta = JSON.parse(localStorage.getItem(META_KEY));
      if (meta && typeof meta === "object") normalized.meta = Logic.normalizeState({ meta }).meta;
    } catch (_) { /* ignore corrupt meta */ }
    return normalized;
  }

  function saveState(silent) {
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    localStorage.setItem(META_KEY, JSON.stringify(state.meta));
    if (!silent) toast("案件进度已保存在本机");
    updateHeader();
  }

  function resetRun() {
    const meta = state.meta;
    state = Logic.freshState();
    state.meta = meta;
    saveState(true);
    renderLanding();
  }

  function toast(message) {
    clearTimeout(toastTimer);
    toastNode.textContent = message;
    toastNode.classList.add("show");
    toastTimer = setTimeout(() => toastNode.classList.remove("show"), 2300);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function openModal(html) {
    modalContent.innerHTML = html;
    if (!modal.open) modal.showModal();
  }

  function closeModal() { if (modal.open) modal.close(); }

  function addEvidence(...ids) {
    let added = 0;
    ids.forEach(id => {
      if (EVIDENCE[id] && !state.evidence.includes(id)) { state.evidence.push(id); added += 1; }
    });
    if (added) toast(`新增 ${added} 条案件材料`);
  }

  function addDeduction(id) {
    if (!state.deductions.includes(id)) state.deductions.push(id);
  }

  function solve(id, deduction, evidence) {
    if (!state.solved.includes(id)) state.solved.push(id);
    if (deduction) addDeduction(deduction);
    if (evidence) addEvidence(...evidence);
    const highest = Logic.highestUnlockedChapter(state);
    state.chapter = Math.max(state.chapter, highest);
    saveState(true);
  }

  function updateHeader() {
    const progress = Logic.evidenceProgress(state);
    document.querySelector("#chapter-label").textContent = state.chapter === 9 ? "终章" : `第${toChinese(state.chapter)}章`;
    document.querySelector("#progress-label").textContent = `核心材料 ${progress.found}/${progress.total}`;
    document.querySelector("#evidence-count").textContent = state.evidence.length;
  }

  function toChinese(num) { return ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"][num] || num; }

  function renderLanding() {
    topbar.hidden = true;
    const hasSave = state.started;
    const endings = state.meta.endings.map(id => `结局 ${id}`).join(" · ") || "尚无结案记录";
    app.innerHTML = `
      <section class="landing">
        <div class="landing-copy">
          <div class="eyebrow">澄江市刑侦支队 · 案件分析终端</div>
          <h1 class="display">错层</h1>
          <div class="landing-deck">WRONG FLOOR · 2026/09/17</div>
          <p class="landing-quote">“如果所有证据都是真的，为什么结论会是假的？”</p>
          <div class="landing-actions">
            <button class="btn primary" data-action="${hasSave ? "continue-game" : "new-game"}">${hasSave ? "继续调查" : "接受委托"}</button>
            ${hasSave ? '<button class="btn ghost" data-action="confirm-new">重新开案</button>' : ""}
            <button class="btn ghost" data-action="show-prologue">案件简报</button>
          </div>
          <p class="muted" style="margin-top:24px;font-size:.76rem">自动存档 · 建议佩戴耳机（无需音频） · ${endings}</p>
        </div>
        <div class="landing-visual" aria-label="临江壹号建筑剖面示意">
          <div class="building">
            ${[16,15,14,13,12,11,10,9,8,7,6,5].map(f => `<div class="building-floor"><span class="floor-no">${f}F</span><span class="floor-room ${f === 11 ? "hot" : ""} ${f === 14 ? "void" : ""}">${f === 11 ? "1102 · 尸体发现" : f === 14 ? "1402" : `${f}02`}</span></div>`).join("")}
          </div>
          <div class="case-stamp">现场封存 22:47</div>
        </div>
      </section>`;
  }

  function renderHome() {
    topbar.hidden = false;
    state.screen = "home";
    const highest = Logic.highestUnlockedChapter(state);
    const progress = Logic.evidenceProgress(state);
    app.innerHTML = `<section class="screen">
      <div class="eyebrow">CASE OVERVIEW · CJ-0917</div>
      <h1 class="display" style="font-size:clamp(2.8rem,8vw,6rem)">临江壹号死亡案</h1>
      <p class="lead">林知秋被发现死于反锁的 1102。许遥拥有无法推翻的不在场证明。你的任务不是替警方补全一个故事，而是确认故事的每个前提。</p>
      <div class="rule"></div>
      <div class="grid">
        ${CHAPTERS.slice(1).map((chapter, index) => {
          const no = index + 1;
          const unlocked = Logic.chapterUnlocked(state, no);
          const solvedCount = state.solved.filter(id => ({1:["p01"],2:["p02"],3:["p03"],4:["p04"],5:["p05","p06"],6:["p07","p08"],7:["p09"],8:["p10","p11"],9:["p12"]}[no] || []).includes(id)).length;
          return `<article class="card ${unlocked ? "" : "locked"}">
            <small>${no === 9 ? "FINAL" : `CHAPTER 0${no}`}</small>
            <h3>${escapeHtml(chapter.title)}</h3>
            <p>${unlocked ? escapeHtml(chapter.subtitle) : "完成前一阶段的关键推理后开放。"}</p>
            <div class="card-actions"><button class="btn" data-action="go-chapter" data-chapter="${no}" ${unlocked ? "" : "disabled"}>${no < highest ? "重新查看" : no === highest ? "进入调查" : "未开放"}</button><span class="meta">${solvedCount ? `完成 ${solvedCount}` : ""}</span></div>
          </article>`;
        }).join("")}
      </div>
      <div class="puzzle">
        <div class="puzzle-tag">CURRENT CASE STATE</div>
        <h2>核心材料 ${progress.found} / ${progress.total}</h2>
        <p class="muted">已形成 ${state.deductions.length} 条推论；误判 ${state.mistakes} 次。普通阅读与复查不会产生惩罚。</p>
      </div>
    </section>`;
    updateHeader();
  }

  function renderChapter(no) {
    if (!Logic.chapterUnlocked(state, no)) { toast("该阶段尚未开放"); return; }
    topbar.hidden = false;
    state.chapter = no;
    state.screen = `chapter-${no}`;
    const chapter = CHAPTERS[no];
    app.innerHTML = `<section class="screen">
      <header class="chapter-hero">
        <div><div class="chapter-no">${no === 9 ? "FINAL REPORT" : `CHAPTER 0${no}`}</div><h1 class="chapter-title">${escapeHtml(chapter.title)}</h1><p class="chapter-brief">${escapeHtml(chapter.subtitle)}</p></div>
        <div class="objective"><strong>当前目标</strong>${escapeHtml(chapter.objective)}</div>
      </header>
      <div id="chapter-body">${chapterRenderer(no)}</div>
    </section>`;
    updateHeader();
    saveState(true);
    app.focus({ preventScroll: true });
  }

  function chapterRenderer(no) {
    return [null, chapter1, chapter2, chapter3, chapter4, chapter5, chapter6, chapter7, chapter8, chapter9][no]();
  }

  function investigationCard(id, title, text, evidenceIds, label) {
    const done = state.examined.includes(id);
    return `<article class="card ${done ? "done" : ""}"><h3>${title}</h3><p>${text}</p><div class="card-actions"><button class="btn" data-action="examine" data-id="${id}" data-evidence="${evidenceIds.join(",")}">${done ? "复查材料" : (label || "调查")}</button></div></article>`;
  }

  function chapter1() {
    const ready = ["door","body","bath","shelf","access"].every(id => state.examined.includes(id));
    return `<div class="grid">
      ${investigationCard("door", "门口与电子锁", "门链从室内挂上，门锁后台只记录成功开启。", ["e_lock","e_access"])}
      ${investigationCard("body", "尸体与客厅", "后枕部有致命撞击，地毯却异常干净。", ["e_body"])}
      ${investigationCard("bath", "持续溢水的浴室", "水量经过计算，像一枚粗糙的定时器。", ["e_water"])}
      ${investigationCard("shelf", "书柜底部", "一枚刻有 X.Y. 的袖扣落在积灰中。", ["e_cufflink"])}
      ${investigationCard("access", "1102 使用痕迹", "死者曾把这里当临时办公室，旧痕迹很多。", ["e_dna"])}
    </div>
    <section class="puzzle" id="p01"><div class="puzzle-tag">P01 · 门锁悖论</div><h2>凶手是如何离开 1102 的？</h2>
      <p class="muted">请选择现阶段唯一能被证据支持的表述。</p>
      <div class="choices">
        ${[["balcony","从阳台转移到相邻住户"],["stairs","通过消防通道离开"],["hack","篡改门禁并复位门链"],["premise","现有证据没有证明凶杀发生在 1102"]].map(([v,t]) => `<label class="choice"><input type="radio" name="p01" value="${v}"><span>${t}</span></label>`).join("")}
      </div><button class="btn primary" data-action="solve-p01" ${ready ? "" : "disabled"}>提交判断</button>
      <div class="feedback" id="feedback-p01">${ready ? "" : "先完成五处现场勘查。"}</div></section>`;
  }

  function chapter2() {
    const hasSources = ["forum-video","forum-travel","forum-checkin"].every(id => state.examined.includes(id));
    return `<div class="grid">
      ${investigationCard("forum-video", "论坛直播母带", "连续机位、观众手机与直播弹幕互相校验。", ["e_stream"])}
      ${investigationCard("forum-travel", "位置与交通记录", "两个独立系统记录许遥当晚的移动。", ["e_location"])}
      ${investigationCard("forum-checkin", "签到与离场合照", "会场入口记录锁定首尾时间。", ["e_checkin"])}
      ${investigationCard("old-photo", "两周前的参观照片", "许遥曾随项目组进入 1102。", ["e_cuffphoto"])}
    </div>
    <section class="puzzle"><div class="puzzle-tag">P02 · 许遥时间线</div><h2>把六条记录按真实时间排序</h2><p class="muted">使用上下按钮调整；每条记录本身都来自独立可核验材料。</p>
      <div class="timeline-list">${state.timelineOrder.map((id, index) => `<div class="timeline-item"><span>${TIMELINE_ITEMS[id]}</span><div class="reorder"><button data-action="move-timeline" data-index="${index}" data-dir="-1" aria-label="上移" ${index === 0 ? "disabled" : ""}>↑</button><button data-action="move-timeline" data-index="${index}" data-dir="1" aria-label="下移" ${index === 5 ? "disabled" : ""}>↓</button></div></div>`).join("")}</div>
      <div class="card-actions"><button class="btn primary" data-action="solve-p02" ${hasSources ? "" : "disabled"}>检验往返可能</button>${state.solved.includes("p02") ? '<button class="btn danger-btn" data-action="accuse-xu">仍然指认许遥</button>' : ""}</div><div class="feedback" id="feedback-p02">${hasSources ? "" : "先核验直播、交通、会场三种来源。"}</div>
    </section>`;
  }

  function chapter3() {
    const ready = state.examined.includes("measure-photo") && state.examined.includes("measure-plan");
    return `<div class="measure-stage">
      <div>${investigationCard("measure-photo", "现场比例照片", "以 60 厘米地砖为参照，书柜右缘到墙约 83 厘米。", ["e_shelf"])}</div>
      <div>${investigationCard("measure-plan", "1102 竣工户型图", "固定墙体、踢脚线与标准书柜型号都可复算。", ["e_plan1102"])}</div>
    </div>
    <div class="measure-stage" aria-label="尺寸复核示意"><div class="plan-box"><div class="plan-room"><div class="plan-shelf"></div><span class="dimension">现场 83 cm</span></div></div><div class="plan-box"><div class="plan-room"><div class="plan-shelf"></div><span class="dimension">图纸 96 cm</span></div></div></div>
    <section class="puzzle"><div class="puzzle-tag">P03 · 十三厘米</div><h2>两者相差多少厘米？这说明什么？</h2>
      <div class="number-entry"><input type="number" id="dimension-number" inputmode="numeric" min="0" max="99" aria-label="尺寸差"><span>厘米</span><select id="dimension-meaning"><option value="">选择结论</option><option value="furniture">家具型号录入错误</option><option value="photo">照片发生透视畸变</option><option value="room">照片中的固定空间不是 1102</option></select><button class="btn primary" data-action="solve-p03" ${ready ? "" : "disabled"}>提交复测</button></div><div class="feedback" id="feedback-p03"></div>
    </section>`;
  }

  function chapter4() {
    const selected = state.factAnswers.blueprints || [];
    return `<div class="grid">${investigationCard("archive-history", "房号变更申请", "2017 年改造申请写着“1401/1403 合并”，附件页码不连续。", ["e_plan2019"])}</div>
    <section class="puzzle"><div class="puzzle-tag">P04 · 五版建筑图</div><h2>选择能共同证明空间被注销、却未必拆除的两版图纸</h2>
      <div class="blueprint-stack">${[["2012","施工图",false],["2013","销售图",false],["2016","消防图",false],["2019","物业图",true],["2026","电子地图",true]].map(([id,label,missing]) => `<button class="blueprint ${selected.includes(id) ? "selected" : ""}" data-action="toggle-blueprint" data-id="${id}"><strong>${label}</strong><span class="blueprint-lines"><i></i><i class="${missing ? "missing" : ""}"></i><i></i></span></button>`).join("")}</div>
      <button class="btn primary" data-action="solve-p04">叠加所选图层</button><div class="feedback" id="feedback-p04"></div>
    </section>`;
  }

  function chapter5() {
    const allDiffs = ["socket","scratch","frame","nail","pipe","impact"].every(id => state.mirrorFound.includes(id));
    return `<div class="document"><h3>现场准入记录</h3><p>14 层封闭档案室。门上没有房号，旧锁芯可由物业工程总钥匙开启。内部 B2 户型未随产权合并完全拆除。</p></div>
    <section class="puzzle"><div class="puzzle-tag">P05 · 双房找不同</div><h2>对照 1102 与隐蔽房间</h2><p class="muted">点击右侧房间中六处发光标记，记录与 1102 不同的固定痕迹。</p>
      <div class="mirror-stage"><div class="room-scene"><span class="room-label">11F · 1102</span></div><div class="room-scene"><span class="room-label">14F · 未编号空间</span>${["socket","scratch","frame","nail","pipe","impact"].map(id => `<button class="hotspot ${state.mirrorFound.includes(id) ? "found" : ""}" data-action="find-diff" data-diff="${id}" aria-label="调查差异点"></button>`).join("")}</div></div>
      <p class="feedback ${allDiffs ? "good" : ""}">${allDiffs ? "六处差异已记录。墙面撞击和地板拖痕构成两种独立物理来源。" : `已找到 ${state.mirrorFound.length}/6`}</p><button class="btn primary" data-action="solve-p05" ${allDiffs ? "" : "disabled"}>确认第一现场</button>
    </section>
    <section class="puzzle"><div class="puzzle-tag">P06 · 窗外视角</div><h2>死者手机照片拍自哪一层？</h2><p>照片能越过对岸十二层楼顶看见设备平台。从 1102 的窗高只能看到女儿墙。</p><div class="choices">${[11,12,14].map(n => `<label class="choice"><input type="radio" name="p06" value="${n}"><span>${n} 层</span></label>`).join("")}</div><button class="btn primary" data-action="solve-p06">提交空间定位</button><div class="feedback" id="feedback-p06"></div></section>`;
  }

  function chapter6() {
    const facts = [
      ["card", "林知秋 21:41 进入 1102", [["person","登记人进入房间"],["card","A047 卡于 21:41 开启 1102"]]],
      ["sound", "沈曼听见 1102 有人", [["room","声音来自 1102"],["sound","沈曼在管井旁听见来源不明的声响"]]],
      ["dna", "林知秋当晚在 1102", [["night","当晚留下死者 DNA"],["dna","1102 内检出无法定年的死者 DNA"]]]
    ];
    return `<div class="document"><h3>门禁后台原始日志</h3><table><thead><tr><th>时间</th><th>卡号</th><th>门点</th><th>结果</th></tr></thead><tbody><tr><td>21:41:08</td><td>A047</td><td>1102</td><td>开启成功</td></tr></tbody></table><p>系统字段中没有“姓名”或“人脸确认”。</p></div>
    <section class="puzzle"><div class="puzzle-tag">P07 · 门禁语言陷阱</div><h2>把“警方解释”改写为“证据事实”</h2><div>${facts.map(([id,claim,options]) => `<div class="fact-card"><strong>${claim}</strong><span class="arrow">→</span><select data-fact="${id}"><option value="">选择严格表述</option>${options.map(([v,t]) => `<option value="${v}" ${state.factAnswers[id] === v ? "selected" : ""}>${t}</option>`).join("")}</select></div>`).join("")}</div><button class="btn primary" data-action="solve-p07">剥离解释</button><div class="feedback" id="feedback-p07"></div></section>
    <section class="puzzle"><div class="puzzle-tag">P08 · 水管线路</div><h2>哪条结构路径能解释 11 层的声音？</h2><div class="choices">${[["hall","14层走廊 → 电梯井 → 11层客厅"],["pipe","1402管井 → 共用立管 → 1102管井旁"],["window","1402窗外 → 外墙反射 → 1102阳台"]].map(([v,t]) => `<label class="choice"><input type="radio" name="p08" value="${v}"><span>${t}</span></label>`).join("")}</div><button class="btn primary" data-action="solve-p08">检查结构图</button><div class="feedback" id="feedback-p08"></div></section>`;
  }

  function interviewRow(id) {
    const person = INTERVIEWS[id];
    const round = Number(state.interviews[id] || 0);
    return `<div class="interview-row"><div><div class="person-name">${person.name}</div><span class="meta">${person.role}</span></div><div><span class="round-dots">${[1,2,3].map(n => `<span class="${round >= n ? "on" : ""}">●</span>`).join("")}</span><p class="muted" style="margin:.5em 0 0">${round ? person.lines[round - 1] : "尚未询问"}</p></div><button class="btn" data-action="interview" data-person="${id}" ${round >= 3 ? "disabled" : ""}>${round >= 3 ? "已完成" : `第 ${round + 1} 轮`}</button></div>`;
  }

  function chapter7() {
    return `<section><div class="eyebrow">SIX STATEMENTS · THREE ROUNDS</div>${Object.keys(INTERVIEWS).map(interviewRow).join("")}</section>
    <section class="puzzle"><div class="puzzle-tag">P09 · 袖扣时间</div><h2>哪两条材料能证明袖扣是真的，却不是当晚留下？</h2>
      <div class="choices">${[["e_cufflink","袖扣凹槽内的旧灰尘"],["e_cuffphoto","9 月 3 日右袖缺扣的照片"],["e_stream","论坛连续直播"],["e_debt","程逸的债务"]].map(([v,t]) => `<label class="choice"><input type="checkbox" name="p09" value="${v}"><span>${t}</span></label>`).join("")}</div><button class="btn primary" data-action="solve-p09">校验遗留时间</button><div class="feedback" id="feedback-p09"></div></section>`;
  }

  function chapter8() {
    const people = [
      ["许遥","yes","no","no","no"], ["顾雪","yes","no","no","maybe"], ["梁闻","yes","maybe","no","yes"],
      ["程逸","yes","no","no","yes"], ["沈曼","yes","no","no","yes"], ["周岚","yes","yes","yes","yes"]
    ];
    return `<div class="grid">${investigationCard("permission-audit", "物业权限审计", "应急卡柜、总钥匙、搬运车的操作记录来自三个子系统。", ["e_permission","e_cardlog","e_cart"])}${investigationCard("old-case-file", "2014 原始验收卷", "被改写的验收页和事故调查结论藏在 1402 资料柜夹层。", ["e_oldfile","e_message","e_copy","e_debt"])}</div>
    <section class="puzzle"><div class="puzzle-tag">P10 · 权限关系图</div><h2>谁同时满足知识、权限、时间与行为记录？</h2><div class="matrix-wrap"><table class="matrix"><thead><tr><th>人物</th><th>知道 1102</th><th>知道 1402 历史</th><th>物业权限</th><th>19点位置不明</th></tr></thead><tbody>${people.map(row => `<tr><td>${row[0]}</td>${row.slice(1).map(v => `<td class="${v}">${v === "yes" ? "✓" : v === "no" ? "×" : "△"}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
      <div class="choices">${["许遥","顾雪","梁闻","程逸","沈曼","周岚"].map(name => `<label class="choice"><input type="radio" name="p10" value="${name}"><span>${name}</span></label>`).join("")}</div><button class="btn primary" data-action="solve-p10">提交行为结论</button><div class="feedback" id="feedback-p10"></div></section>
    <section class="puzzle"><div class="puzzle-tag">P11 · 十二年前档案</div><h2>原始验收卷支持哪一条结论？</h2><div class="choices">${[["worker","事故只因工人违规进入"],["lin","林知秋独自修改文件"],["chain","开发商降配、监理放行、设计团队签字共同形成责任链"],["zhou","周岚策划了十二年前事故"]].map(([v,t]) => `<label class="choice"><input type="radio" name="p11" value="${v}"><span>${t}</span></label>`).join("")}</div><button class="btn primary" data-action="solve-p11">写入旧案结论</button><div class="feedback" id="feedback-p11"></div></section>`;
  }

  function reportSelect(key, label, options) {
    return `<div class="report-field"><label for="report-${key}">${label}</label><select id="report-${key}" data-report="${key}"><option value="">— 选择 —</option>${options.map(value => `<option value="${value}" ${state.report[key] === value ? "selected" : ""}>${value}</option>`).join("")}</select></div>`;
  }

  function chapter9() {
    const reportPassed = state.solved.includes("report");
    return `<div class="document"><h3>案件重构报告 · CJ-0917</h3><p>报告不是材料数量检查。地点、时间、行为人与动机必须互相兼容。</p></div>
    <section class="puzzle"><div class="puzzle-tag">P12 · 完整案件重构</div><h2>填写八项关键事实</h2><div class="report-grid">
      ${reportSelect("deathPlace","死亡地点",["1102","1402","消防楼梯"])}
      ${reportSelect("deathTime","死亡时间",["18:34","19:16","21:41","22:36"])}
      ${reportSelect("foundPlace","尸体发现地点",["1102","1402","物业档案室"])}
      ${reportSelect("cardUser","A047 门禁卡使用者",["林知秋","许遥","周岚","无法判断"])}
      ${reportSelect("cufflink","袖扣来源",["当晚搏斗掉落","两周前遗留","周岚伪造"])}
      ${reportSelect("sound","沈曼听见的声音",["1102 内的搏斗","14层管道结构传声","直播音频"])}
      ${reportSelect("transferReason","现场被转移的深层原因",["陷害许遥","制造密室奇观","争取处理旧案资料的时间"])}
      ${reportSelect("culprit","导致死亡并置换现场的人",["许遥","顾雪","梁闻","周岚"])}
      </div><button class="btn primary" data-action="validate-report">封存报告</button><div class="feedback" id="feedback-report">${reportPassed ? "报告已通过一致性校验。继续完成最终举证。" : ""}</div></section>
      ${reportPassed ? confrontationHtml() : ""}`;
  }

  function confrontationHtml() {
    const questions = [
      ["q1","林知秋为什么不可能死在 1102？",[["e_shelf","书柜位置复测 + 竣工尺寸"],["e_cufflink","许遥的袖扣"],["e_water","浴室溢水"]]],
      ["q2","真正的第一现场是什么？",[["d_mirror","镜像现场推论"],["d_alibi","许遥不在场证明"],["d_sound","结构传声"]]],
      ["q3","什么让警方误判 21:41 时死者仍活着？",[["e_cardlog","A047 卡片流转"],["e_stream","论坛直播"],["e_body","尸表与伤口"]]],
      ["q4","谁能完成尸体与记录的置换？",[["e_permission","物业权限审计"],["e_message","记者收到的消息"],["e_debt","保险草稿"]]],
      ["q5","周岚真正想暂时隐藏什么？",[["e_oldfile","2014 原始验收卷"],["e_cufflink","许遥的袖扣"],["e_lock","门锁状态"]]]
    ];
    return `<section class="puzzle"><div class="puzzle-tag">FINAL CONFRONTATION</div><h2>向周岚连续举证</h2><p class="muted">每一问只接受能直接支撑该主张的材料。</p>${questions.map(([id,q,options]) => `<div class="fact-card"><strong>${q}</strong><span class="arrow">→</span><select data-confrontation="${id}"><option value="">选择举证</option>${options.map(([v,t]) => `<option value="${v}" ${state.confrontation[id] === v ? "selected" : ""}>${t}</option>`).join("")}</select></div>`).join("")}<button class="btn primary" data-action="validate-confrontation">完成指认</button><div class="feedback" id="feedback-confrontation"></div></section>`;
  }

  function renderNotebook() {
    topbar.hidden = false;
    state.screen = "notebook";
    app.innerHTML = `<section class="screen"><div class="eyebrow">CASE NOTEBOOK</div><h1 class="chapter-title">案件簿</h1><div class="notebook-tabs"><button class="active">原始材料 ${state.evidence.length}</button><button>推论 ${state.deductions.length}</button></div>
      <h2>原始材料</h2><div class="evidence-list">${state.evidence.length ? state.evidence.map(id => { const e = EVIDENCE[id]; return `<article class="evidence-card"><span class="source">${e[1]}</span><h3>${e[0]}</h3><p>${e[2]}</p></article>`; }).join("") : '<p class="muted">尚未收集材料。</p>'}</div>
      <div class="rule"></div><h2>已形成推论</h2><div class="evidence-list">${state.deductions.length ? state.deductions.map(id => { const d = DEDUCTIONS[id]; return `<article class="evidence-card"><span class="source">DEDUCTION</span><h3>${d[0]}</h3><p>${d[1]}</p></article>`; }).join("") : '<p class="muted">推论必须由材料组合产生。</p>'}</div></section>`;
    updateHeader();
  }

  function renderTimeline() {
    topbar.hidden = false;
    state.screen = "timeline";
    const events = [
      ["17:32","许遥与林知秋在公司争吵","公开监控"], ["18:34","林知秋抵达临江壹号","停车场记录"],
      ["18:51","周岚进入隐蔽空间","后期推定"], ["19:03","顾雪在停车场见到林知秋","复制日志"],
      ["19:16","林知秋在 1402 撞击身亡","物证重构"], ["19:40","许遥开始参加建筑论坛","三源校验"],
      ["21:41","A047 开启 1102","门禁原始记录"], ["22:36","楼下报告渗水","物业工单"], ["22:47","破门发现尸体","出警记录"]
    ];
    app.innerHTML = `<section class="screen"><div class="eyebrow">VERIFIED TIMELINE</div><h1 class="chapter-title">案件时间线</h1><p class="lead">灰色项目是调查假设；只有完成对应推理后，地点与行为人才会写入确定时间线。</p><div class="timeline-list">${events.map(([time,text,source],i) => `<div class="timeline-item"><span><strong>${time}</strong> · ${text}<br><small class="muted">${source}</small></span></div>`).join("")}</div></section>`;
    updateHeader();
  }

  function renderMap() {
    topbar.hidden = false;
    state.screen = "map";
    const rooms = [
      [1,"11F · 1102","尸体发现现场"], [2,"外部 · 建筑论坛","许遥不在场证明"], [3,"11F · 复测现场","空间尺寸复核"],
      [4,"市档案馆","五版建筑图"], [5,"14F · 封闭区域",state.solved.includes("p04") ? "1402 已识别" : "完成图纸比对后开放"],
      [6,"1F · 门禁服务器室","A047 原始日志"], [7,"询问室","六名相关人员"], [8,"物业办公室","权限与旧案"], [9,"案件分析室","最终报告"]
    ];
    app.innerHTML = `<section class="screen"><div class="eyebrow">LOCATION DIRECTORY</div><h1 class="chapter-title">建筑地图</h1><div class="map-layout"><nav class="floor-tabs">${["外部","14F","11F","1F","物业"].map((x,i) => `<button class="${i===0?"active":""}">${x}</button>`).join("")}</nav><div class="building-map">${rooms.map(([no,name,desc]) => `<button class="map-room" data-action="go-chapter" data-chapter="${no}" ${Logic.chapterUnlocked(state,no)?"":"disabled"}><strong>${name}</strong><small>${desc}</small></button>`).join("")}</div></div></section>`;
    updateHeader();
  }

  function renderEnding(id) {
    topbar.hidden = true;
    const endings = {
      A: ["ENDING A · 正确答案","正确答案","周岚承认 19:16 的冲突与之后的现场置换。2014 年事故重新立案，原始验收卷进入司法程序。她被带走前看了一眼 14 层亮起的灯——那间从系统中消失的房间，终于重新出现在城市记录里。"],
      B: ["ENDING B · 完美证据","完美证据","你指认许遥，却无法让他同时出现在论坛和 1102。案件因证据链自相矛盾而搁置。三年后，一封匿名邮件抵达：你一直在寻找进入房间的方法。可你有没有想过——为什么一定是那个房间？"],
      C: ["ENDING C · 不存在的房间","不存在的房间","周岚因致人死亡与毁灭证据被捕。你找到了 1402，却把旧案材料排除在结案报告之外。十二年前的事故仍被写作“工人违规”。她在审讯室只问：所以你找到了杀人的地方。然后呢？"],
      D: ["ENDING D · 十三厘米","正确的问题","墙面少掉的十三厘米，最终撬开了十二年的沉默。开发商、监理与设计团队重新接受调查，遇难者姓名第一次出现在公开更正里。标题页上的“错层”被划去——推理的终点从来不是找到一个人，而是终于问对了问题。"]
    };
    const [label,title,copy] = endings[id];
    app.innerHTML = `<section class="ending"><div class="ending-letter">${label}</div><h1 class="${id === "D" ? "title-shift" : ""}">${title}</h1><p class="ending-copy">${copy}</p><p class="muted">已收集 ${state.evidence.length} 条材料 · 已完成 ${Object.values(state.interviews).filter(n => n >= 3).length}/6 人三轮询问 · 结局档案 ${state.meta.endings.join(" / ")}</p><div class="ending-actions"><button class="btn primary" data-action="review-case">返回案件总览</button><button class="btn ghost" data-action="confirm-new">开始新周目</button></div></section>`;
  }

  function setFeedback(id, message, ok) {
    const node = document.querySelector(`#${id}`);
    if (!node) return;
    node.textContent = message;
    node.className = `feedback ${ok ? "good" : "bad"}`;
  }

  function wrong(feedbackId, message) { state.mistakes += 1; saveState(true); setFeedback(feedbackId, message, false); }

  function chosen(name) {
    const node = document.querySelector(`input[name="${name}"]:checked`);
    return node ? node.value : null;
  }

  function checked(name) { return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(node => node.value); }

  function handleAction(action, target) {
    if (action === "new-game") { state.started = true; saveState(true); renderChapter(1); }
    if (action === "continue-game") renderHome();
    if (action === "show-home" || action === "review-case") renderHome();
    if (action === "show-map") renderMap();
    if (action === "show-notebook") renderNotebook();
    if (action === "show-timeline") renderTimeline();
    if (action === "save-game") saveState(false);
    if (action === "close-modal") closeModal();
    if (action === "go-chapter") renderChapter(Number(target.dataset.chapter));
    if (action === "show-prologue") openModal(`<div class="eyebrow">CASE BRIEF</div><h1>临江壹号死亡案</h1><p class="lead">2026 年 9 月 17 日 22:47，建筑设计师林知秋被发现死在从内部反锁的 1102。</p><div class="document"><p><strong>21:41</strong> 林知秋的 A047 门禁卡开启 1102。</p><p><strong>19:40—22:20</strong> 头号嫌疑人许遥在十四公里外公开演讲。</p><p><strong>问题</strong> 证据证明许遥是凶手，时间证明他不可能是凶手。</p></div><div class="card-actions"><button class="btn primary" data-action="close-modal">开始思考</button></div>`);
    if (action === "confirm-new") openModal(`<h2>重新开始案件？</h2><p class="muted">当前周目会清空，但已解锁的结局档案会保留。</p><div class="card-actions"><button class="btn danger-btn" data-action="reset-run">确认重新开案</button><button class="btn" data-action="close-modal">取消</button></div>`);
    if (action === "reset-run") { closeModal(); resetRun(); }

    if (action === "examine") {
      const id = target.dataset.id;
      if (!state.examined.includes(id)) state.examined.push(id);
      addEvidence(...target.dataset.evidence.split(","));
      saveState(true); renderChapter(state.chapter);
    }
    if (action === "solve-p01") {
      if (chosen("p01") === "premise") { solve("p01","d_lock"); setFeedback("feedback-p01","正确。门锁只约束 1102，不约束真正的死亡地点。第二章已开放。",true); }
      else wrong("feedback-p01","这个选项试图解释出口，却还没有证明凶手曾在 1102 杀人。先检查问题的前提。 ");
    }
    if (action === "move-timeline") {
      const index = Number(target.dataset.index), next = index + Number(target.dataset.dir);
      [state.timelineOrder[index], state.timelineOrder[next]] = [state.timelineOrder[next], state.timelineOrder[index]];
      saveState(true); renderChapter(2);
    }
    if (action === "solve-p02") {
      if (Logic.validateTimeline(state.timelineOrder)) { solve("p02","d_alibi"); setFeedback("feedback-p02","时间线闭合。十四公里的往返不存在：许遥的不在场证明完全成立。",true); }
      else wrong("feedback-p02","至少一条记录的先后关系不对。注意主持介绍发生在主题演讲之前。 ");
    }
    if (action === "accuse-xu") openModal(`<h2>以许遥为嫌疑人结案？</h2><p>动机和袖扣都指向他，但三种独立记录证明他无法实施你报告中的行为。这会让报告内部矛盾。</p><div class="card-actions"><button class="btn danger-btn" data-action="ending-b">坚持指认</button><button class="btn" data-action="close-modal">继续调查错误前提</button></div>`);
    if (action === "ending-b") { closeModal(); state = Logic.recordEnding(state,"B"); saveState(true); renderEnding("B"); }
    if (action === "solve-p03") {
      const num = Number(document.querySelector("#dimension-number").value), meaning = document.querySelector("#dimension-meaning").value;
      if (num === 13 && meaning === "room") { solve("p03","d_dimension"); setFeedback("feedback-p03","十三厘米来自固定墙体，不是可移动家具：照片里的房间不是 1102。",true); }
      else wrong("feedback-p03","请分别复核 96−83 的数值，以及哪一种解释不依赖可移动物体。 ");
    }
    if (action === "toggle-blueprint") {
      const id = target.dataset.id, picks = state.factAnswers.blueprints || [];
      state.factAnswers.blueprints = picks.includes(id) ? picks.filter(x => x !== id) : picks.length < 2 ? [...picks,id] : [picks[1],id];
      saveState(true); renderChapter(4);
    }
    if (action === "solve-p04") {
      const picks = state.factAnswers.blueprints || [];
      if (picks.length === 2 && picks.includes("2012") && picks.includes("2019")) { addEvidence("e_plan2012","e_plan2019"); solve("p04","d_1402"); setFeedback("feedback-p04","2012 图证明 1402 存在，2019 图证明编号消失，却没有拆除墙体的记录。",true); }
      else wrong("feedback-p04","需要一份能证明原始空间的早期来源，以及一份首次抹去房号的变更来源。 ");
    }
    if (action === "find-diff") {
      const id = target.dataset.diff;
      if (!state.mirrorFound.includes(id)) state.mirrorFound.push(id);
      saveState(true); renderChapter(5);
    }
    if (action === "solve-p05") { solve("p05","d_mirror",["e_impact","e_floor"]); renderChapter(5); }
    if (action === "solve-p06") {
      if (chosen("p06") === "14") { solve("p06",null,["e_window"]); setFeedback("feedback-p06","俯角只能来自 14 层。照片定位与物理痕迹相互独立。",true); }
      else wrong("feedback-p06","用对岸十二层楼顶作为水平参照：拍摄点必须明显高于它。 ");
    }
    if (action === "solve-p07") {
      document.querySelectorAll("[data-fact]").forEach(node => state.factAnswers[node.dataset.fact] = node.value);
      if (state.factAnswers.card === "card" && state.factAnswers.sound === "sound" && state.factAnswers.dna === "dna") { solve("p07","d_semantics",["e_cardlog"]); setFeedback("feedback-p07","完成。事实只保留系统或观察真正记录的内容，不替它补上行为人和地点。",true); }
      else wrong("feedback-p07","仍有一句把登记人、声音来源或留下痕迹的时间当成了已证实事实。 ");
    }
    if (action === "solve-p08") {
      if (chosen("p08") === "pipe") { solve("p08","d_sound",["e_pipe"]); setFeedback("feedback-p08","共用立管会放大并向下传递结构声。证词是真的，楼层解释是错的。",true); }
      else wrong("feedback-p08","选择有工程图直接支持、且无需假设空气远距离反射的路径。 ");
    }
    if (action === "interview") {
      const id = target.dataset.person, round = Math.min(3, Number(state.interviews[id] || 0) + 1);
      state.interviews[id] = round;
      if (id === "guxue" && round >= 3) addEvidence("e_copy");
      if (id === "liangwen" && round >= 3) addEvidence("e_message");
      if (id === "chengyi" && round >= 3) addEvidence("e_debt");
      saveState(true); renderChapter(7);
    }
    if (action === "solve-p09") {
      const result = Logic.validateEvidenceSet(checked("p09"), ["e_cufflink","e_cuffphoto"], [{ all:["e_cufflink","e_cuffphoto"], exact:true }]);
      if (result.ok) { solve("p09","d_cuff"); setFeedback("feedback-p09","灰尘说明遗留已久，带日期的照片提供独立时间锚点。",true); }
      else wrong("feedback-p09",result.reason);
    }
    if (action === "solve-p10") {
      if (chosen("p10") === "周岚" && state.evidence.includes("e_permission")) { solve("p10","d_access"); setFeedback("feedback-p10","动机没有替代行为证据：权限审计把周岚与 A047、总钥匙和搬运车直接连接。",true); }
      else wrong("feedback-p10",state.evidence.includes("e_permission") ? "选择同时满足四列、且有系统行为记录的人。" : "先检查物业权限审计，矩阵还缺行为证据。 ");
    }
    if (action === "solve-p11") {
      if (chosen("p11") === "chain" && state.evidence.includes("e_oldfile")) { solve("p11","d_oldcase"); setFeedback("feedback-p11","正确。林知秋签过字，但原始卷宗显示这是多方共同形成的责任链。",true); }
      else wrong("feedback-p11",state.evidence.includes("e_oldfile") ? "不要把一份有多方签字的原始卷宗缩减成单一坏人的故事。" : "先调查 2014 原始验收卷。 ");
    }
    if (action === "validate-report") {
      document.querySelectorAll("[data-report]").forEach(node => state.report[node.dataset.report] = node.value);
      const result = Logic.validateReport(state.report);
      if (result.ok) { if (!state.solved.includes("report")) state.solved.push("report"); saveState(true); renderChapter(9); setFeedback("feedback-report","八项事实互相兼容。报告通过一致性校验。",true); }
      else wrong("feedback-report",`有 ${result.wrong.length} 项与已形成的证据链冲突。检查地点、时间和行为人是否属于同一个故事。`);
    }
    if (action === "validate-confrontation") {
      document.querySelectorAll("[data-confrontation]").forEach(node => state.confrontation[node.dataset.confrontation] = node.value);
      if (Logic.validateConfrontation(state.confrontation)) { solve("p12"); openModal(`<div class="eyebrow">JUDGMENT</div><h2>最后，哪些事实写入公开报告？</h2><p>周岚导致林知秋死亡并置换现场已经成立。你还必须决定，报告是否把 2014 年责任链一并提交重启调查。</p><div class="card-actions"><button class="btn primary" data-action="choose-disclosure" data-choice="full">提交完整责任链</button><button class="btn ghost" data-action="choose-disclosure" data-choice="culprit-only">只报告本案刑事事实</button></div>`); }
      else wrong("feedback-confrontation","至少一问使用了只能说明背景或动机、不能直接证明该主张的材料。 ");
    }
    if (action === "choose-disclosure") {
      const ending = Logic.determineEnding(state,target.dataset.choice);
      closeModal(); state = Logic.recordEnding(state,ending); saveState(true); renderEnding(ending);
    }
  }

  document.addEventListener("click", event => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    handleAction(target.dataset.action,target);
  });

  modal.addEventListener("click", event => { if (event.target === modal) closeModal(); });
  window.addEventListener("beforeunload", () => { if (state.started) saveState(true); });
  renderLanding();
})();
