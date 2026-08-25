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
    { title: "不可能的嫌疑人", subtitle: "最强的动机，最完整的不在场证明。两者都是真的。", objective: "用独立来源覆盖在场时段，检验是否存在往返窗口。" },
    { title: "十三厘米", subtitle: "房间不会作证，尺寸会。", objective: "复核现场照片与 1102 户型图的空间关系。" },
    { title: "不存在的房间", subtitle: "从一张图上消失，不等于从建筑里消失。", objective: "比对五版建筑档案，找出被注销的空间。" },
    { title: "镜室", subtitle: "两个几乎相同的房间，只有一个记得那晚发生了什么。", objective: "对照 1102 与隐蔽房间，确认第一现场。" },
    { title: "21:41", subtitle: "记录从未说谎。说得太多的是我们。", objective: "剥离门禁与证言中的解释，重建可验证事实。" },
    { title: "所有人都说了真话", subtitle: "没有一句假话，却共同拼出了一个错误现场。", objective: "突破四名关键证人的三轮询问，并厘清袖扣时间。" },
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
    d_lock: ["死亡地点尚未独立证明", "尸体在 1102 被发现是事实；死亡是否发生在此仍需新的物理来源。"],
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
    xuyoa: { name: "许遥", role: "前合伙人", topics: ["公开争吵","旧日合作","袖扣"], requiredTopic: "公开争吵", statement: "今天晚上，我们之间必须有一个结果。", kind: "omission", evidence: "e_cuffphoto", reveal: "我说的结果，是让他决定是否公开资料。袖扣在 9 月 3 日就丢了。", lines: ["已问清争吵语境。","这句话省略了“结果”的具体内容。","带日期的照片固定了袖扣遗失时间。"] },
    guxue: { name: "顾雪", role: "死者助理", topics: ["离开公司","案发后去向","复制资料"], requiredTopic: "案发后去向", statement: "林老师六点十分离开公司。", kind: "omission", evidence: "e_copy", unlock: "e_copy", reveal: "19:03 我在停车场又见过他，还复制了资料。", lines: ["已追问离开后的行程。","离开公司，不等于最后一次见面。","复制日志迫使她补全了 19:03。"] },
    liangwen: { name: "梁闻", role: "调查记者", topics: ["旧案报道","与死者通信","消息来源"], requiredTopic: "与死者通信", statement: "我没收到能发表的东西。", kind: "omission", evidence: "e_message", unlock: "e_message", reveal: "附件收到了，但未经来源许可，不能发表。", lines: ["已核对通信措辞。","“不能发表”被省略成了“没收到”。","校验摘要证明附件确实存在。"] },
    chengyi: { name: "程逸", role: "死者弟弟", topics: ["家庭关系","保险与债务","旧案动机"], requiredTopic: "保险与债务", statement: "他最近谈过保险，我确实缺钱。", kind: "inference", evidence: "e_debt", unlock: "e_debt", reveal: "我从没说受益人是我；草稿反而把我移除了。", lines: ["已核对保险措辞。","债务与保险只能构成推测，不能证明受益。","变更草稿排除了直接获利。"] },
    shenman: { name: "沈曼", role: "11 层住户", topics: ["听见时间","声音位置","邻里关系"], requiredTopic: "声音位置", statement: "九点多，我听见 1102 一直有声音。", kind: "inference", evidence: "e_pipe", reveal: "我没亲眼确认，只是在管井旁听见撞击和拖动。", lines: ["已追问她如何定位声音。","听见声音是事实，楼层来源是推测。","管井图给出了结构传声路径。"] },
    zhoulan: { name: "周岚", role: "物业运营负责人", topics: ["现行系统","物业旧图","应急权限"], requiredTopic: "物业旧图", statement: "系统里没有 1402。", kind: "omission", evidence: "e_cardlog", reveal: "我说的是现行系统。旧图和应急卡柜是另一套记录。", lines: ["已区分现行系统与历史档案。","她省略了“现行”这个限定。","A047 流转记录证明她实际操作过独立系统。"] }
  };

  let state = loadState();
  let toastTimer = null;
  let notebookView = { tab: "evidence", person: "all", source: "all" };
  let mapFloor = "external";

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
          <div class="landing-deck">WRONG FLOOR · V2.0 · 2026/09/17</div>
          <p class="landing-quote">“如果所有证据都是真的，为什么结论会是假的？”</p>
          <div class="landing-actions">
            <button class="btn primary" data-action="${hasSave ? "continue-game" : "new-game"}">${hasSave ? "继续调查" : "接受委托"}</button>
            ${hasSave ? '<button class="btn ghost" data-action="confirm-new">重新开案</button>' : ""}
            <button class="btn ghost" data-action="show-prologue">案件简报</button>
          </div>
          <p class="muted" style="margin-top:24px;font-size:.76rem">自动存档 · 无音频要求 · 支持移动端 · ${endings}</p>
        </div>
        <div class="landing-visual" aria-label="临江壹号建筑剖面示意">
          <div class="building">
            ${[16,15,14,13,12,11,10,9,8,7,6,5].map(f => `<div class="building-floor"><span class="floor-no">${f}F</span><span class="floor-room ${f === 11 ? "hot" : ""} ${f === 14 ? "void" : ""}">${f === 11 ? "1102 · 尸体发现" : f === 14 ? "封闭区域" : `${f}02`}</span></div>`).join("")}
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
          return `<article class="card ${unlocked ? "chapter-reveal" : "locked"}">
            <small>${unlocked ? (no === 9 ? "FINAL" : `CHAPTER 0${no}`) : `INVESTIGATION 0${no}`}</small>
            <h3>${unlocked ? escapeHtml(chapter.title) : `第${toChinese(no)}调查阶段 · 未解锁`}</h3>
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
    <section class="puzzle" id="p01"><div class="puzzle-tag">P01 · 证据强度</div><h2>现阶段，哪一项结论的证据强度最低？</h2>
      <p class="muted">只判断“是否已经被独立材料证明”，不要推测新的现场。</p>
      <div class="choices">
        ${[["found","尸体在 1102 被发现"],["opened","A047 曾开启 1102"],["locked","破门前房门处于反锁状态"],["death","林知秋在 1102 遇害"]].map(([v,t]) => `<label class="choice"><input type="radio" name="p01" value="${v}"><span>${t}</span></label>`).join("")}
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
    <section class="puzzle"><div class="puzzle-tag">P02 · 连续在场证明</div><h2>选择能覆盖 19:31—22:31、且来源彼此独立的材料</h2><p class="muted">临江壹号与会场单程最快 37 分钟。离散照片只能证明瞬间，连续记录才能封闭往返窗口。</p>
      <div class="coverage-axis"><span>19:30</span><span>20:30</span><span>21:30</span><span>22:30</span></div>
      <div class="coverage-list">
        <label class="coverage-row"><input type="checkbox" name="p02" value="e_checkin"><span class="coverage-bar bar-checkin">签到、入口合照与工作人员陪同 · 19:31—20:04</span></label>
        <label class="coverage-row"><input type="checkbox" name="p02" value="e_stream"><span class="coverage-bar bar-stream">直播母带与连续问答 · 19:57—22:17</span></label>
        <label class="coverage-row"><input type="checkbox" name="p02" value="e_location"><span class="coverage-bar bar-location">会场 Wi‑Fi、基站与实名地铁 · 21:46—22:31</span></label>
        <label class="coverage-row"><input type="checkbox" name="p02" value="e_cuffphoto"><span class="coverage-bar bar-point">9 月 3 日参观合照 · 与当晚无关</span></label>
      </div>
      <div class="card-actions"><button class="btn primary" data-action="solve-p02" ${hasSources ? "" : "disabled"}>检查覆盖缺口</button></div><div class="feedback" id="feedback-p02">${hasSources ? "" : "先核验直播、交通、会场三种来源。"}</div>
    </section>${state.solved.includes("p02") ? theoryHtml() : ""}`;
  }

  function theoryHtml() {
    const theory = state.currentTheory;
    const field = (key, label, options) => `<label>${label}<select data-theory="${key}"><option value="">未判断</option>${options.map(x => `<option value="${x}" ${theory[key] === x ? "selected" : ""}>${x}</option>`).join("")}</select></label>`;
    return `<section class="puzzle subdued"><div class="puzzle-tag">CURRENT THEORY · 可选</div><h2>以当前理论暂时结案</h2><p class="muted">系统只报告无法解释的矛盾数量，不替你判断是否值得继续调查。</p><div class="report-grid">${field("culprit","嫌疑人",["许遥","顾雪","周岚"])}${field("place","死亡地点",["1102","其他地点"])}${field("method","犯罪方法",["远程装置","密室后逃离","未知"])}</div><button class="btn danger-btn" data-action="check-theory">检查当前理论</button><div class="feedback" id="feedback-theory"></div></section>`;
  }

  function chapter3() {
    const ready = state.examined.includes("measure-photo") && state.examined.includes("measure-plan");
    return `<div class="measure-stage">
      <div>${investigationCard("measure-photo", "现场比例照片", "地砖边长 60 厘米。用图上标尺估算书柜右缘与固定墙之间的距离。", [])}</div>
      <div>${investigationCard("measure-plan", "1102 竣工户型图", "用图纸刻度复核固定墙体与书柜定位线，不要直接相信家具摆位。", [])}</div>
    </div>
    <div class="measure-stage" aria-label="尺寸复核示意"><div class="plan-box photo-measure"><div class="tile-grid"></div><div class="plan-shelf"></div><span class="measure-note">每格 60 cm · 间距约 1.38 格</span></div><div class="plan-box plan-measure"><div class="plan-room"><div class="plan-shelf"></div><span class="measure-note">图纸比例 1:50 · 定位线可读数</span></div></div></div>
    <section class="puzzle"><div class="puzzle-tag">P03 · 十三厘米</div><h2>完成两次测量，再选择待验证假说</h2>
      <div class="measurement-form"><label>现场间距（地砖格数）<input type="number" id="tile-ratio" inputmode="decimal" step="0.01" min="1" max="2"></label><label>1102 图纸间距（厘米）<input type="number" id="plan-distance" inputmode="numeric" min="80" max="110"></label><label>用第二个固定结构验证<select id="fixed-check"><option value="">选择结构</option><option value="curtain">窗帘角度</option><option value="window">窗框中线与暖气管距离</option><option value="table">桌上杯子位置</option></select></label></div>
      <div class="choices">${[["furniture","H1 · 家具曾被移动"],["perspective","H2 · 单纯拍摄透视"],["room","H3 · 户型并非 1102"]].map(([v,t]) => `<label class="choice"><input type="radio" name="p03" value="${v}"><span>${t}</span></label>`).join("")}</div><button class="btn primary" data-action="solve-p03" ${ready ? "" : "disabled"}>提交测量假说</button><div class="feedback" id="feedback-p03"></div>
    </section>`;
  }

  function blueprintDiagram(id) {
    const middle = id === "2012" || id === "2013" || id === "2016" ? "1402" : id === "2019" ? "—" : "设备区域";
    return `<div class="mini-plan ${id >= "2019" ? "changed" : ""}"><span>1401</span><span class="middle">${middle}</span><span>1403</span><i class="door">门位</i><i class="shaft">管井</i></div>`;
  }

  function chapter4() {
    const selected = state.factAnswers.blueprints || [];
    return `<div class="grid">${investigationCard("archive-history", "房号变更申请", "2017 年改造申请写着“1401/1403 合并”，附件页码不连续。", ["e_plan2019"])}</div>
    <section class="puzzle"><div class="puzzle-tag">P04 · 五版建筑图</div><h2>选择能共同证明空间被注销、却未必拆除的两版图纸</h2>
      <div class="blueprint-stack">${[["2012","施工图"],["2013","销售图"],["2016","消防图"],["2019","物业图"],["2026","电子地图"]].map(([id,label]) => `<button class="blueprint ${selected.includes(id) ? "selected" : ""}" data-action="toggle-blueprint" data-id="${id}"><strong>${label}</strong>${blueprintDiagram(id)}</button>`).join("")}</div>
      <h3>2012 与 2019 之间，哪些变化可从图上直接确认？</h3><div class="choices">${[["number","中部房号消失"],["door","正式门位消失"],["wall-kept","承重边界没有拆除标记"],["pipe","竖向管井仍然存在"],["wall-removed","中部承重墙已全部拆除"]].map(([v,t]) => `<label class="choice"><input type="checkbox" name="p04-change" value="${v}"><span>${t}</span></label>`).join("")}</div>
      <button class="btn primary" data-action="solve-p04">叠加图层并提交观察</button><div class="feedback" id="feedback-p04"></div>
    </section>`;
  }

  function chapter5() {
    const differences = [["socket","插座高度","fix","▭","▭"],["drag","平行拖痕","key","","≋"],["frame","窗框编号","fix","F11","F14"],["nail","旧钉孔","history","⋰","⋱"],["pipe","暖气管位置","fix","║","║"],["impact","擦拭撞击痕","key","","×"],["cup","杯子数量","noise","○","○○"],["curtain","窗帘角度","noise","╱","╲"],["lamp","灯罩颜色","noise","◇","◆"],["painting","装饰画偏移","history","▱","▰"]];
    const ready = state.mirrorFound.length >= 6 && ["impact","drag"].every(id => state.mirrorFound.includes(id));
    return `<div class="document"><h3>现场准入记录</h3><p>14 层封闭档案室。门上没有房号，旧锁芯可由物业工程总钥匙开启。内部 B2 户型未随产权合并完全拆除。</p></div>
    <section class="puzzle"><div class="puzzle-tag">P05 · 双房调查</div><h2>对照 1102 与未编号空间</h2><p class="muted">右侧有十处可见差异，没有发光提示。点击你观察到的物件；至少记录六处，再选出两种独立案件痕迹。</p>
      <div class="mirror-stage"><div class="room-scene detailed-room compare-left"><span class="room-label">11F · 1102</span>${differences.filter(([, , ,left]) => left).map(([id,,,left]) => `<span class="scene-object diff-${id}">${left}</span>`).join("")}</div><div class="room-scene detailed-room compare-right"><span class="room-label">14F · 未编号空间</span>${differences.map(([id,label,,,right]) => `<button class="difference diff-${id} ${state.mirrorFound.includes(id) ? "found" : ""}" data-action="find-diff" data-diff="${id}" title="${label}" aria-label="调查${label}">${right}</button>`).join("")}</div></div>
      <div class="found-differences">${state.mirrorFound.length ? differences.filter(([id]) => state.mirrorFound.includes(id)).map(([id,label]) => `<label class="evidence-chip"><input type="checkbox" name="p05-proof" value="${id}">${label}</label>`).join("") : '<span class="muted">尚未记录差异</span>'}</div>
      <p class="feedback ${ready ? "good" : ""}">${ready ? "已具备提交条件。注意：装修差异能识别房间，但不能单独证明死亡和搬运。" : `已记录 ${state.mirrorFound.length}/10，需包含案件痕迹。`}</p><button class="btn primary" data-action="solve-p05" ${ready ? "" : "disabled"}>提交两项独立物证</button>
    </section>
    <section class="puzzle"><div class="puzzle-tag">P06 · 视线推理</div><h2>切换拍摄楼层，观察哪条视线能越过对面屋顶</h2><div class="sight-stage floor-${state.factAnswers.viewFloor || 11}"><div class="tower source"><span>临江壹号</span><i class="sight-origin">${state.factAnswers.viewFloor || 11}F</i></div><div class="sight-line"></div><div class="tower opposite"><span>对面 12F</span><i class="platform">设备平台</i></div></div><div class="floor-switch">${[11,12,14].map(n => `<button class="btn ${Number(state.factAnswers.viewFloor || 11) === n ? "primary" : ""}" data-action="set-view-floor" data-floor="${n}">${n}F 视线</button>`).join("")}</div><button class="btn primary" data-action="solve-p06">记录可见楼层</button><div class="feedback" id="feedback-p06"></div></section>`;
  }

  function chapter6() {
    const facts = [
      ["card", "林知秋 21:41 进入 1102", [["person","登记人进入房间"],["card","A047 卡于 21:41 开启 1102"]]],
      ["sound", "沈曼听见 1102 有人", [["room","声音来自 1102"],["sound","沈曼在管井旁听见来源不明的声响"]]],
      ["dna", "林知秋当晚在 1102", [["night","当晚留下死者 DNA"],["dna","1102 内检出无法定年的死者 DNA"]]],
      ["cuff", "许遥当晚到过现场", [["owner","许遥本人遗留物证"],["cuff","属于许遥的袖扣在 1102 书柜底被发现"]]],
      ["water", "凶手 22:36 仍在屋内", [["person","有人在 22:36 打开水龙头"],["water","持续小流量溢水在 22:36 被楼下发现"]]],
      ["injury", "客厅墙面造成致命伤", [["wall","1102 墙面造成伤口"],["injury","后枕部存在钝性撞击伤"]]],
      ["alibi", "直播证明许遥无罪", [["innocent","许遥与案件完全无关"],["alibi","许遥在关键时段连续处于会场"]]]
    ];
    return `<div class="document"><h3>门禁后台原始日志</h3><table><thead><tr><th>时间</th><th>卡号</th><th>门点</th><th>结果</th></tr></thead><tbody><tr><td>21:41:08</td><td>A047</td><td>1102</td><td>开启成功</td></tr></tbody></table><p>系统字段中没有“姓名”或“人脸确认”。</p></div>
    <section class="puzzle"><div class="puzzle-tag">P07 · 门禁语言陷阱</div><h2>把“警方解释”改写为“证据事实”</h2><div>${facts.map(([id,claim,options]) => `<div class="fact-card"><strong>${claim}</strong><span class="arrow">→</span><select data-fact="${id}"><option value="">选择严格表述</option>${options.map(([v,t]) => `<option value="${v}" ${state.factAnswers[id] === v ? "selected" : ""}>${t}</option>`).join("")}</select></div>`).join("")}</div><button class="btn primary" data-action="solve-p07">剥离解释</button><div class="feedback" id="feedback-p07"></div></section>
    <section class="puzzle"><div class="puzzle-tag">P08 · 水管线路</div><h2>哪条结构路径能解释 11 层的声音？</h2><div class="choices">${[["hall","14层走廊 → 电梯井 → 11层客厅"],["pipe","1402管井 → 共用立管 → 1102管井旁"],["window","1402窗外 → 外墙反射 → 1102阳台"]].map(([v,t]) => `<label class="choice"><input type="radio" name="p08" value="${v}"><span>${t}</span></label>`).join("")}</div><button class="btn primary" data-action="solve-p08">检查结构图</button><div class="feedback" id="feedback-p08"></div></section>`;
  }

  function interviewRow(id) {
    const person = INTERVIEWS[id];
    const round = Number(state.interviews[id] || 0);
    const labels = ["选择话题","拆解证词","出示材料"];
    return `<div class="interview-row"><div><div class="person-name">${person.name}${Logic.CORE_INTERVIEWS.includes(id) ? '<span class="key-mark">关键</span>' : ""}</div><span class="meta">${person.role}</span></div><div><span class="round-dots">${[1,2,3].map(n => `<span class="${round >= n ? "on" : ""}">●</span>`).join("")}</span><p class="muted" style="margin:.5em 0 0">${round ? person.lines[round - 1] : "三轮分别需要选择话题、判断语言性质、提交证据。"}</p></div><button class="btn" data-action="interview" data-person="${id}" ${round >= 3 ? "disabled" : ""}>${round >= 3 ? "突破完成" : labels[round]}</button></div>`;
  }

  function chapter7() {
    const coreDone = Logic.CORE_INTERVIEWS.filter(id => Number(state.interviews[id] || 0) >= 3).length;
    return `<section><div class="eyebrow">SIX STATEMENTS · THREE ROUNDS</div><p class="lead">每个人的话都可能包含事实、推测或省略，但没有人需要靠一句纯粹的谎话成立。第八阶段要求突破四名关键证人（${coreDone}/4）。</p>${Object.keys(INTERVIEWS).map(interviewRow).join("")}</section>
    <section class="puzzle"><div class="puzzle-tag">P09 · 袖扣时间</div><h2>哪两条材料能证明袖扣是真的，却不是当晚留下？</h2>
      <div class="choices">${[["e_cufflink","袖扣凹槽内的旧灰尘"],["e_cuffphoto","9 月 3 日右袖缺扣的照片"],["e_stream","论坛连续直播"],["e_debt","程逸的债务"]].map(([v,t]) => `<label class="choice"><input type="checkbox" name="p09" value="${v}"><span>${t}</span></label>`).join("")}</div><button class="btn primary" data-action="solve-p09">校验遗留时间</button><div class="feedback" id="feedback-p09"></div></section>`;
  }

  function chapter8() {
    const people = [["xuyoa","许遥"],["guxue","顾雪"],["liangwen","梁闻"],["chengyi","程逸"],["shenman","沈曼"],["zhoulan","周岚"]];
    const fields = [["know","知道隐蔽房间历史"],["permission","有物业权限"],["blank","19点行程有空白"],["card","接触 A047"]];
    const mark = value => value === "yes" ? "✓" : value === "no" ? "×" : value === "maybe" ? "△" : "?";
    return `<div class="grid">${investigationCard("permission-audit", "物业权限审计", "应急卡柜、总钥匙、搬运车的操作记录来自三个子系统。", ["e_permission","e_cardlog","e_cart"])}${investigationCard("old-case-file", "2014 原始验收卷", "被改写的验收页和事故调查结论藏在 1402 资料柜夹层。", ["e_oldfile","e_message","e_copy","e_debt"])}</div>
    <section class="puzzle"><div class="puzzle-tag">P10 · 知识与权限矩阵</div><h2>由你填写每一格</h2><p class="muted">点击单元格在 ? / ✓ / × / △ 间切换。矩阵不会预先替你排除任何人。</p><div class="matrix-wrap"><table class="matrix"><thead><tr><th>人物</th>${fields.map(([,label]) => `<th>${label}</th>`).join("")}</tr></thead><tbody>${people.map(([id,name]) => `<tr><td>${name}</td>${fields.map(([field]) => { const key = `${id}_${field}`, value = state.matrixAnswers[key] || "unknown"; return `<td><button class="matrix-cell ${value}" data-action="cycle-matrix" data-key="${key}">${mark(value)}</button></td>`; }).join("")}</tr>`).join("")}</tbody></table></div>
      <button class="btn primary" data-action="solve-p10">校验整张矩阵</button><div class="feedback" id="feedback-p10"></div></section>
    <section class="puzzle"><div class="puzzle-tag">P11 · 十二年前责任链</div><h2>把四个主体与卷宗中的行为连接</h2><div class="chain-grid">${[["developer","开发商"],["supervisor","监理方"],["design","设计团队"],["contractor","施工方"]].map(([id,label]) => `<label><strong>${label}</strong><select data-chain="${id}"><option value="">选择其行为</option><option value="lower">提出结构降配</option><option value="approve">批准继续施工</option><option value="sign">签署修改验收页</option><option value="execute">现场执行变更</option></select></label>`).join("")}</div><button class="btn primary" data-action="solve-p11">形成责任链</button><div class="feedback" id="feedback-p11"></div></section>`;
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
      "你能证明 1402 存在。可你怎么证明林知秋死在那里？",
      "墙上的痕迹只能证明撞击。你怎么证明尸体被搬走？",
      "21:41 的记录属于林知秋。你凭什么说是我？",
      "就算卡在我手里，你怎么证明我能完成整个置换？",
      "你已经证明本案。为什么还要翻十二年前的资料？"
    ];
    const step = Math.min(state.confrontationStep, 4);
    const transcript = Object.keys(state.confrontation).sort().map(key => `<div class="dialogue-line"><span>已提交</span><strong>${EVIDENCE[state.confrontation[key]][0]}</strong></div>`).join("");
    const orderedEvidence = [...state.pinnedEvidence, ...state.evidence.filter(id => !state.pinnedEvidence.includes(id))];
    return `<section class="puzzle confrontation"><div class="puzzle-tag">FINAL CONFRONTATION · ${state.confrontationStep + 1}/5</div><h2>周岚：“${questions[step]}”</h2>${transcript}<p class="muted">从你实际收集的案件材料中自由选择。动机材料不能代替行为物证。</p><div class="confrontation-evidence">${orderedEvidence.map(id => `<label class="evidence-choice ${state.pinnedEvidence.includes(id) ? "pinned" : ""}"><input type="radio" name="confrontation-evidence" value="${id}"><span class="source">${EVIDENCE[id][1]}</span><strong>${EVIDENCE[id][0]}</strong></label>`).join("")}</div><button class="btn primary" data-action="validate-confrontation">出示所选材料</button><div class="feedback" id="feedback-confrontation"></div></section>`;
  }

  function evidenceMatches(id) {
    const personMap = {
      xu: ["e_cufflink","e_cuffphoto","e_stream","e_location","e_checkin"],
      zhou: ["e_access","e_cardlog","e_permission","e_cart","e_oldfile"],
      lin: ["e_body","e_dna","e_water","e_shelf","e_plan1102","e_impact","e_floor"],
      gu: ["e_copy"], liang: ["e_message"], shen: ["e_pipe"]
    };
    const source = EVIDENCE[id][1];
    const sourceMatch = notebookView.source === "all" ||
      (notebookView.source === "scene" && /现场|物证|痕迹/.test(source)) ||
      (notebookView.source === "system" && /系统|运营商|记录/.test(source)) ||
      (notebookView.source === "plan" && /图纸|档案|工程/.test(source)) ||
      (notebookView.source === "old" && /旧案|原始文件/.test(source));
    const personMatch = notebookView.person === "all" || (personMap[notebookView.person] || []).includes(id);
    return sourceMatch && personMatch;
  }

  function renderNotebook() {
    topbar.hidden = false;
    state.screen = "notebook";
    const filtered = state.evidence.filter(evidenceMatches);
    const evidenceHtml = `<div class="notebook-tools"><label>人物<select id="notebook-person"><option value="all">全部人物</option><option value="xu">许遥</option><option value="zhou">周岚</option><option value="lin">林知秋</option><option value="gu">顾雪</option><option value="liang">梁闻</option><option value="shen">沈曼</option></select></label><label>来源<select id="notebook-source"><option value="all">全部来源</option><option value="scene">现场 / 物证</option><option value="system">系统 / 记录</option><option value="plan">图纸 / 工程</option><option value="old">旧案</option></select></label><span class="meta">已钉选 ${state.pinnedEvidence.length}/3</span></div><div class="evidence-list">${filtered.length ? filtered.map(id => { const e = EVIDENCE[id], pinned = state.pinnedEvidence.includes(id); return `<article class="evidence-card ${pinned ? "pinned" : ""}"><span class="source">${e[1]}</span><h3>${e[0]}</h3><p>${e[2]}</p><button class="text-button" data-action="pin-evidence" data-evidence="${id}">${pinned ? "取消钉选" : "钉在顶部"}</button></article>`; }).join("") : '<p class="muted">当前筛选下没有材料。</p>'}</div>`;
    const deductionHtml = `<div class="evidence-list">${state.deductions.length ? state.deductions.map(id => { const d = DEDUCTIONS[id]; return `<article class="evidence-card"><span class="source">DEDUCTION</span><h3>${d[0]}</h3><p>${d[1]}</p></article>`; }).join("") : '<p class="muted">推论必须由材料组合产生。</p>'}</div>`;
    app.innerHTML = `<section class="screen"><div class="eyebrow">CASE NOTEBOOK</div><h1 class="chapter-title">案件簿</h1>${state.pinnedEvidence.length ? `<div class="pinned-strip">${state.pinnedEvidence.map(id => `<span class="evidence-chip">${EVIDENCE[id][0]}</span>`).join("")}</div>` : ""}<div class="notebook-tabs"><button class="${notebookView.tab === "evidence" ? "active" : ""}" data-action="notebook-tab" data-tab="evidence">原始材料 ${state.evidence.length}</button><button class="${notebookView.tab === "deductions" ? "active" : ""}" data-action="notebook-tab" data-tab="deductions">推论 ${state.deductions.length}</button></div>${notebookView.tab === "evidence" ? evidenceHtml : deductionHtml}</section>`;
    const person = document.querySelector("#notebook-person"), source = document.querySelector("#notebook-source");
    if (person) person.value = notebookView.person;
    if (source) source.value = notebookView.source;
    updateHeader();
  }

  function renderTimeline() {
    topbar.hidden = false;
    state.screen = "timeline";
    const solved = id => state.solved.includes(id);
    const events = [
      ["17:32","许遥与林知秋在公司争吵","公开监控",true], ["18:34","林知秋抵达临江壹号","停车场记录",true],
      ["18:51", solved("p10") ? "周岚进入 1402" : solved("p04") ? "有人进入未编号空间" : "???", solved("p10") ? "权限与行为记录" : "尚未确认", solved("p04")],
      ["19:03", Number(state.interviews.guxue || 0) >= 3 ? "顾雪在停车场再次见到林知秋" : "???", "复制日志", Number(state.interviews.guxue || 0) >= 3],
      [solved("p05") ? "约19:16" : "19:00—20:00", solved("p10") ? "周岚与林知秋在 1402 冲突，发生致命撞击" : solved("p05") ? "隐蔽第一现场发生致命撞击" : "法医推定死亡区间", solved("p05") ? "物证重构" : "法医初检", solved("p05")],
      ["19:31—22:31", solved("p02") ? "许遥连续处于建筑论坛会场" : "许遥的会场记录待核验", "三种独立来源", solved("p02")],
      ["21:41", solved("p10") ? "周岚使用 A047 开启 1102" : solved("p07") ? "持卡人使用 A047 开启 1102" : "A047 开启 1102", solved("p07") ? "卡片流转" : "门禁原始记录", solved("p07")],
      ["22:36","楼下报告渗水","物业工单",true], ["22:47","破门发现尸体","出警记录",true]
    ];
    app.innerHTML = `<section class="screen"><div class="eyebrow">VERIFIED TIMELINE</div><h1 class="chapter-title">案件时间线</h1><p class="lead">未确认事件保持灰色与匿名；每完成一条推理，时间线才写入更精确的地点、行为人与时间。</p><div class="timeline-list dynamic-timeline">${events.map(([time,text,source,known]) => `<div class="timeline-item ${known ? "known" : "unknown"}"><span><strong>${time}</strong> · ${text}<br><small class="muted">${source}</small></span></div>`).join("")}</div></section>`;
    updateHeader();
  }

  function renderMap() {
    topbar.hidden = false;
    state.screen = "map";
    const floors = [["external","外部"],["14","14F"],["11","11F"],["1","1F"],["property","物业"]];
    const rooms = [
      ["external",2,"建筑论坛会场","连续在场证明"], ["external",4,"市档案馆","建筑档案比对"],
      ["11",1,"1102","尸体发现现场"], ["11",3,"1102 复测","空间尺寸复核"],
      ["14",5,state.solved.includes("p04") ? "1402" : "封闭区域",state.solved.includes("p04") ? "房号已从旧图恢复" : "中部空间未识别"],
      ["1",6,"门禁服务器室","A047 原始日志"], ["property",7,"询问室","六名相关人员"], ["property",8,"物业办公室","权限与旧案"], ["property",9,"案件分析室","最终报告"]
    ].filter(([floor]) => floor === mapFloor);
    const floorVisual = mapFloor === "14" ? `<div class="floor-plan-reveal ${state.solved.includes("p04") ? "revealed" : ""}"><span>1401</span><span>${state.solved.includes("p04") ? "1402" : "████"}</span><span>1403</span></div>` : "";
    app.innerHTML = `<section class="screen"><div class="eyebrow">LOCATION DIRECTORY</div><h1 class="chapter-title">建筑地图</h1><div class="map-layout"><nav class="floor-tabs">${floors.map(([id,label]) => `<button class="${mapFloor===id?"active":""}" data-action="map-floor" data-floor="${id}">${label}</button>`).join("")}</nav><div class="building-map">${floorVisual}${rooms.map(([,no,name,desc]) => `<button class="map-room" data-action="go-chapter" data-chapter="${no}" ${Logic.chapterUnlocked(state,no)?"":"disabled"}><strong>${name}</strong><small>${desc}</small></button>`).join("")}</div></div></section>`;
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
    const epilogues = {
      A: [["许遥","论坛录像成为排除证据，他重新整理林知秋留下的建筑史手稿。"],["顾雪","因越权复制接受处分，也成为旧案重启后的第一名证人。"],["周岚","等待审判，同时把哥哥的姓名交回公开档案。"]],
      B: [["许遥","嫌疑没有被正式撤销，职业生涯停在那场直播之后。"],["顾雪","复制文件被当作无关违规封存。"],["周岚","继续管理那栋没有 1402 的建筑。"]],
      C: [["梁闻","报道只能停在本案，旧事故仍沿用十二年前的结论。"],["沈曼","终于知道自己听见的声音从何而来。"],["周岚","她等到的只是一个正确地点。"]],
      D: [["顾雪","以复制日志补上林知秋最后一段行程。"],["梁闻","用附件摘要公开责任链，并保护了最初的消息来源。"],["沈曼","她的证词从“1102 有人”改成了真正听见的事实。"],["周岚","她没能逃避本案责任，但十二年前的死者终于不再为事故负责。"]]
    };
    const [label,title,copy] = endings[id];
    app.innerHTML = `<section class="ending"><div class="ending-letter">${label}</div><h1 class="${id === "D" ? "title-shift" : ""}">${title}</h1><p class="ending-copy">${copy}</p><div class="epilogue-grid">${epilogues[id].map(([name,text]) => `<article><strong>${name}</strong><p>${text}</p></article>`).join("")}</div><p class="muted">已收集 ${state.evidence.length} 条材料 · 关键证人突破 ${Logic.CORE_INTERVIEWS.filter(x => Number(state.interviews[x] || 0) >= 3).length}/4 · 结局档案 ${state.meta.endings.join(" / ")}</p><div class="ending-actions"><button class="btn primary" data-action="review-case">返回案件总览</button><button class="btn ghost" data-action="confirm-new">开始新周目</button></div></section>`;
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

  function openInterview(id) {
    const person = INTERVIEWS[id], round = Number(state.interviews[id] || 0);
    if (round === 0) {
      openModal(`<div class="eyebrow">ROUND 1 · 自由询问</div><h2>${person.name} · 选择两个话题</h2><p class="muted">你只有两次连续追问机会。选择能检验其措辞边界的话题。</p><div class="choices">${person.topics.map(topic => `<label class="choice"><input type="checkbox" name="interview-topic" value="${topic}"><span>${topic}</span></label>`).join("")}</div><button class="btn primary" data-action="submit-interview-topic" data-person="${id}">完成询问</button><div class="feedback" id="feedback-interview"></div>`);
    } else if (round === 1) {
      openModal(`<div class="eyebrow">ROUND 2 · 语言拆解</div><h2>“${person.statement}”</h2><p class="muted">这句话本身属于哪一种？本章的规则是：没有人必须说一句纯粹的假话。</p><div class="choices">${[["fact","完整事实"],["inference","把推测说成事实"],["omission","省略关键限定"],["lie","可以被直接证伪的谎言"]].map(([v,t]) => `<label class="choice"><input type="radio" name="interview-kind" value="${v}"><span>${t}</span></label>`).join("")}</div><button class="btn primary" data-action="submit-interview-kind" data-person="${id}">提交判断</button><div class="feedback" id="feedback-interview"></div>`);
    } else if (round === 2) {
      openModal(`<div class="eyebrow">ROUND 3 · 举证</div><h2>用哪条材料迫使${person.name}补全原话？</h2><div class="confrontation-evidence">${state.evidence.map(eid => `<label class="evidence-choice"><input type="radio" name="interview-evidence" value="${eid}"><span class="source">${EVIDENCE[eid][1]}</span><strong>${EVIDENCE[eid][0]}</strong></label>`).join("")}</div><button class="btn primary" data-action="submit-interview-evidence" data-person="${id}">出示材料</button><div class="feedback" id="feedback-interview"></div>`);
    }
  }

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
    if (action === "map-floor") { mapFloor = target.dataset.floor; renderMap(); }
    if (action === "notebook-tab") { notebookView.tab = target.dataset.tab; renderNotebook(); }
    if (action === "pin-evidence") {
      const id = target.dataset.evidence;
      if (state.pinnedEvidence.includes(id)) state.pinnedEvidence = state.pinnedEvidence.filter(x => x !== id);
      else if (state.pinnedEvidence.length < 3) state.pinnedEvidence.push(id);
      else { toast("最多钉选三条材料"); return; }
      saveState(true); renderNotebook();
    }
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
      if (chosen("p01") === "death") { solve("p01","d_lock"); setFeedback("feedback-p01","正确。发现地点、门禁和反锁都有直接记录；死亡地点目前只有默认前提，仍需独立物证。",true); }
      else wrong("feedback-p01","这一项已有现场照片、系统日志或破门记录直接支持。寻找尚未获得独立来源的结论。 ");
    }
    if (action === "solve-p02") {
      const result = Logic.validateAlibiCoverage(checked("p02"));
      if (result.ok) { solve("p02","d_alibi"); setFeedback("feedback-p02","三种来源前后重叠，连续覆盖 19:31—22:31；不存在可容纳 74 分钟往返的缺口。",true); }
      else wrong("feedback-p02",result.reason);
    }
    if (action === "check-theory") {
      document.querySelectorAll("[data-theory]").forEach(node => state.currentTheory[node.dataset.theory] = node.value);
      saveState(true);
      const contradictions = state.currentTheory.culprit === "许遥" && state.currentTheory.place === "1102" ? 1 : 2;
      const node = document.querySelector("#feedback-theory");
      node.className = "feedback bad";
      node.innerHTML = `当前理论存在无法解释的矛盾：${contradictions}。${state.currentTheory.culprit === "许遥" ? '<div class="card-actions"><button class="btn danger-btn" data-action="ending-b">仍提交现有理论</button></div>' : ""}`;
    }
    if (action === "ending-b") { closeModal(); state = Logic.recordEnding(state,"B"); saveState(true); renderEnding("B"); }
    if (action === "solve-p03") {
      const ratio = Number(document.querySelector("#tile-ratio").value), plan = Number(document.querySelector("#plan-distance").value);
      const fixed = document.querySelector("#fixed-check").value;
      if (Math.abs(ratio - 1.38) <= 0.04 && plan === 96 && fixed === "window" && chosen("p03") === "room") { addEvidence("e_shelf","e_plan1102"); solve("p03","d_dimension"); setFeedback("feedback-p03","现场约 82.8 厘米，图纸 96 厘米；窗框中线的第二次复核排除了家具移动与单纯透视。H3 获得支持。",true); }
      else wrong("feedback-p03","复核 60 厘米地砖的比例读数，并用不会随家具移动而改变的第二个固定结构验证假说。 ");
    }
    if (action === "toggle-blueprint") {
      const id = target.dataset.id, picks = state.factAnswers.blueprints || [];
      state.factAnswers.blueprints = picks.includes(id) ? picks.filter(x => x !== id) : picks.length < 2 ? [...picks,id] : [picks[1],id];
      saveState(true); renderChapter(4);
    }
    if (action === "solve-p04") {
      const picks = state.factAnswers.blueprints || [];
      const changes = checked("p04-change"), expected = ["number","door","wall-kept","pipe"];
      if (picks.length === 2 && picks.includes("2012") && picks.includes("2019") && changes.length === 4 && expected.every(id => changes.includes(id))) { addEvidence("e_plan2012","e_plan2019"); solve("p04","d_1402"); setFeedback("feedback-p04","房号与正式门位消失，但承重边界和管井仍在：被注销的是编号，不是空间。",true); }
      else wrong("feedback-p04","需要一份能证明原始空间的早期来源，以及一份首次抹去房号的变更来源。 ");
    }
    if (action === "find-diff") {
      const id = target.dataset.diff;
      if (!state.mirrorFound.includes(id)) state.mirrorFound.push(id);
      saveState(true); renderChapter(5);
    }
    if (action === "solve-p05") {
      const result = Logic.validateEvidenceSet(checked("p05-proof"), ["impact","drag"], [{ all:["impact","drag"], exact:true }]);
      if (result.ok) { solve("p05","d_mirror",["e_impact","e_floor"]); renderChapter(5); }
      else wrong("feedback-p05",result.reason);
    }
    if (action === "set-view-floor") { state.factAnswers.viewFloor = Number(target.dataset.floor); saveState(true); renderChapter(5); }
    if (action === "solve-p06") {
      if (Number(state.factAnswers.viewFloor) === 14) { solve("p06",null,["e_window"]); setFeedback("feedback-p06","14F 视线越过女儿墙后落向设备平台；11F 与 12F 都被屋顶遮挡。",true); }
      else wrong("feedback-p06","用对岸十二层楼顶作为水平参照：拍摄点必须明显高于它。 ");
    }
    if (action === "solve-p07") {
      document.querySelectorAll("[data-fact]").forEach(node => state.factAnswers[node.dataset.fact] = node.value);
      const correct = { card:"card", sound:"sound", dna:"dna", cuff:"cuff", water:"water", injury:"injury", alibi:"alibi" };
      if (Object.keys(correct).every(key => state.factAnswers[key] === correct[key])) { solve("p07","d_semantics",["e_cardlog"]); setFeedback("feedback-p07","七条解释已全部剥离。事实只保留记录真正观察到的对象、动作与时间。",true); }
      else wrong("feedback-p07","仍有一句把登记人、声音来源或留下痕迹的时间当成了已证实事实。 ");
    }
    if (action === "solve-p08") {
      if (chosen("p08") === "pipe") { solve("p08","d_sound",["e_pipe"]); setFeedback("feedback-p08","共用立管会放大并向下传递结构声。证词是真的，楼层解释是错的。",true); }
      else wrong("feedback-p08","选择有工程图直接支持、且无需假设空气远距离反射的路径。 ");
    }
    if (action === "interview") openInterview(target.dataset.person);
    if (action === "submit-interview-topic") {
      const id = target.dataset.person, person = INTERVIEWS[id], topics = checked("interview-topic");
      if (topics.length === 2 && topics.includes(person.requiredTopic)) { state.interviewData[id] = { topics }; state.interviews[id] = 1; if (person.unlock) addEvidence(person.unlock); closeModal(); saveState(true); renderChapter(7); }
      else setFeedback("feedback-interview","请选择两个话题，其中必须包含能检验这句话边界的行程、通信或记录方向。",false);
    }
    if (action === "submit-interview-kind") {
      const id = target.dataset.person, value = chosen("interview-kind");
      if (value === INTERVIEWS[id].kind) { state.interviews[id] = 2; closeModal(); saveState(true); renderChapter(7); }
      else setFeedback("feedback-interview", value === "lie" ? "原话并非可直接证伪的谎言。检查它省略了限定，还是把判断当成事实。" : "这项分类无法准确描述原话的语言漏洞。",false);
    }
    if (action === "submit-interview-evidence") {
      const id = target.dataset.person, evidence = chosen("interview-evidence");
      if (evidence === INTERVIEWS[id].evidence) { state.interviews[id] = 3; if (Logic.coreInterviewsComplete(state) && !state.solved.includes("interviews-core")) state.solved.push("interviews-core"); closeModal(); saveState(true); renderChapter(7); }
      else setFeedback("feedback-interview","这条材料不能直接迫使证人补全当前省略或修正当前推测。",false);
    }
    if (action === "solve-p09") {
      const result = Logic.validateEvidenceSet(checked("p09"), ["e_cufflink","e_cuffphoto"], [{ all:["e_cufflink","e_cuffphoto"], exact:true }]);
      if (result.ok) { solve("p09","d_cuff"); setFeedback("feedback-p09","灰尘说明遗留已久，带日期的照片提供独立时间锚点。",true); }
      else wrong("feedback-p09",result.reason);
    }
    if (action === "solve-p10") {
      const result = Logic.validateMatrix(state.matrixAnswers);
      if (result.ok && state.evidence.includes("e_permission")) { solve("p10","d_access"); setFeedback("feedback-p10","矩阵闭合。只有一行同时具备知识、权限、时间与 A047 行为记录。",true); }
      else wrong("feedback-p10",state.evidence.includes("e_permission") ? `仍有 ${result.wrongCount} 格与已取得的审讯或系统记录冲突。` : "先检查物业权限审计，矩阵还缺行为来源。 ");
    }
    if (action === "cycle-matrix") { const order=["unknown","yes","no","maybe"], key=target.dataset.key, current=state.matrixAnswers[key]||"unknown"; state.matrixAnswers[key]=order[(order.indexOf(current)+1)%order.length]; saveState(true); renderChapter(8); }
    if (action === "solve-p11") {
      document.querySelectorAll("[data-chain]").forEach(node => state.chainAnswers[node.dataset.chain] = node.value);
      const result = Logic.validateResponsibilityChain(state.chainAnswers);
      if (result.ok && state.evidence.includes("e_oldfile")) { solve("p11","d_oldcase"); setFeedback("feedback-p11","责任链成立：提出降配、批准放行、签署验收与现场执行由不同主体完成。",true); }
      else wrong("feedback-p11",state.evidence.includes("e_oldfile") ? "不要把一份有多方签字的原始卷宗缩减成单一坏人的故事。" : "先调查 2014 原始验收卷。 ");
    }
    if (action === "validate-report") {
      document.querySelectorAll("[data-report]").forEach(node => state.report[node.dataset.report] = node.value);
      const result = Logic.validateReport(state.report);
      if (result.ok) { if (!state.solved.includes("report")) state.solved.push("report"); saveState(true); renderChapter(9); setFeedback("feedback-report","八项事实互相兼容。报告通过一致性校验。",true); }
      else wrong("feedback-report",`有 ${result.wrong.length} 项与已形成的证据链冲突。检查地点、时间和行为人是否属于同一个故事。`);
    }
    if (action === "validate-confrontation") {
      const evidence = chosen("confrontation-evidence"), step = state.confrontationStep + 1;
      if (Logic.validateConfrontationAnswer(step,evidence)) {
        state.confrontation[`q${step}`] = evidence; state.confrontationStep += 1; saveState(true);
        if (state.confrontationStep >= 5) { solve("p12"); openModal(`<div class="eyebrow">JUDGMENT</div><h2>最后，哪些事实写入公开报告？</h2><p>本案事实已经成立。你还必须决定是否把 2014 年责任链一并提交重启调查。</p><div class="card-actions"><button class="btn primary" data-action="choose-disclosure" data-choice="full">提交完整责任链</button><button class="btn ghost" data-action="choose-disclosure" data-choice="culprit-only">只报告本案刑事事实</button></div>`); }
        else renderChapter(9);
      } else wrong("feedback-confrontation","这条材料只能说明背景、动机或相邻结论，不能直接回答周岚当前的质疑。 ");
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

  document.addEventListener("change", event => {
    if (event.target.id === "notebook-person") { notebookView.person = event.target.value; renderNotebook(); }
    if (event.target.id === "notebook-source") { notebookView.source = event.target.value; renderNotebook(); }
  });

  modal.addEventListener("click", event => { if (event.target === modal) closeModal(); });
  window.addEventListener("beforeunload", () => { if (state.started) saveState(true); });
  renderLanding();
})();
