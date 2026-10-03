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
    { title: "所有人都说了真话", subtitle: "没有一句假话，却共同拼出了一个错误现场。", objective: "完成至少两名关键证人的“询问→外查→回审”闭环，并厘清袖扣时间。" },
    { title: "知道还不够", subtitle: "知道 1402 的人不止一个。真正的问题，是谁同时拥有让它重新成为现场的条件。", objective: "用排除理由和知识、权限、时间、行为四项交集锁定置换者。" },
    { title: "错误的问题", subtitle: "回答十个问题，然后决定哪些真相应该走出这栋楼。", objective: "完成现场复原、提交一致的案件报告并完成最终举证。" }
  ];

  const EVIDENCE = {
    e_lock: ["门锁状态", "现场·观察", "1102 门链从室内挂上；电子锁无撬动。破门前无法从外侧复位门链。"],
    e_access: ["21:41 门禁记录", "系统·原始记录", "21:41:08，卡号 A047，1102，开启成功。记录没有持卡人的影像。"],
    e_body: ["尸表初检", "法医·初检", "后枕部存在钝性撞击伤，尸体周围缺少相应血迹与喷溅；依据尸体现象只能初步判断死亡约在 19:00—20:00。"],
    e_body_review: ["伤情与设备联合复核", "法医·派生复核", "引用尸表初检、智能手表与隐蔽现场撞击痕：伤口形态与墙内结构件吻合；结合 19:16:21 冲击、心率急降及尸体现象，将死亡判断缩至 19:16—19:18。"],
    e_water: ["浴室溢水", "现场·痕迹", "水龙头保持异常小流量，22:36 才渗到楼下；阀门位置与自然漏水不符，需要复现实验确认其计时作用。"],
    e_waterlab: ["浴室渗漏复现实验", "实验·独立验证", "按现场阀门开度与排水口堵塞程度复现，连续 1 小时 50 分钟后出现同等楼下渗漏；22:36 倒推约 20:46 开始放水。"],
    e_remote_sweep: ["远程触发排查记录", "技术队·排除性调查", "无线频谱、蓝牙与局域网日志无异常连接；现场机械触发检查也未发现定时器、牵引线或残留安装点。"],
    e_cufflink: ["许遥的袖扣", "现场·物证", "书柜底部发现，表面有旧灰尘，凹槽内没有当晚的新鲜纤维。"],
    e_dna: ["1102 内的旧 DNA", "实验室·背景", "林知秋曾长期在 1102 办公，多处 DNA 无法证明他当晚在此活动。"],
    e_stream: ["论坛直播母带", "公开记录·独立来源", "19:40 开场至 22:20 结束，许遥多次连续出镜，没有可供往返的空档。"],
    e_location: ["手机与地铁记录", "运营商·独立来源", "手机基站与实名交通记录均把许遥固定在论坛周边。"],
    e_checkin: ["会场签到与合照", "会场·独立来源", "19:31 签到，22:24 离场合照；二百余名参与者可交叉确认。"],
    e_cuffphoto: ["两周前的合伙人合照", "照片·时间锚点", "9 月 3 日，许遥在 1102 参观；照片中右袖已经少了一枚袖扣。"],
    e_shelf: ["书柜位置复测", "现场·空间痕迹", "发现尸体时的照片中，书柜右缘距墙 83 厘米。"],
    e_plan1102: ["1102 竣工尺寸", "档案·图纸", "固定墙体至标准书柜右缘应为 96 厘米；家具型号无误。"],
    e_fixed: ["窗框—暖气管复测", "现场·固定结构", "照片中窗框中线与暖气管的相对位置也偏离 1102 竣工图；两者均不可由移动书柜解释。"],
    e_plan2012: ["2012 样板层施工图", "市档案馆·原始图", "14 层中部清楚标注 1402，与 1102 同为 B2 户型。"],
    e_plan2019: ["2019 物业电子图", "物业·变更图", "1401 与 1403 被标为合并，原 1402 编号及门位从系统中消失。"],
    e_impact: ["1402 墙面撞击痕", "隐蔽现场·物证", "墙内结构件有新鲜撞击与血液擦拭残留，高度、形状与后枕伤吻合。"],
    e_floor: ["1402 地板拖痕", "隐蔽现场·物证", "地板清洁剂下保留两道平行拖痕，纤维与包裹尸体的搬运毯一致。"],
    e_window: ["照片窗外视角", "影像·空间定位", "死者手机照片可越过对岸楼顶设备层；从 11 层无法形成该俯角。"],
    e_cardlog: ["A047 卡片流转原始日志", "系统·原始记录", "21:19:04，应急卡柜，A047 取出；操作账号 OPS-04。原始日志不记录自然人姓名。"],
    e_pipe: ["垂直排水管图", "工程·结构记录", "1402 与 1102 共用竖向管井。14 层撞击与拖动可在 11 层管井旁被放大听见。"],
    e_permission: ["物业权限审计", "系统·权限记录", "14F 服务门、搬运车架与应急卡柜均需工牌加个人口令；单人闸机无尾随、强开或备用机械钥匙记录。其余受查人员均不在授权名单中。"],
    e_accountmap: ["后台账号对应表", "系统·账号记录", "OPS-04 对应“物业运营负责人”岗位账号；该岗位制度上可接触历史楼层图，但账号目录不能证明周岚本人看过哪份资料。"],
    e_trainingaccess: ["历史图培训签收与访问审计", "培训·本人记录", "周岚于 2025 年 11 月签收隐蔽空间处置培训；ZL-017 在案发前一周打开过含 1402 原始编号的 2012 图纸。记录证明本人知情，不代表当晚实施行为。"],
    e_shift: ["当班人员表", "物业·人员记录", "9 月 17 日 18:00—23:00，物业运营负责人岗位由周岚单人值守并签名交接。"],
    e_cardauth: ["应急卡柜活体认证", "卡柜·身份原始记录", "21:18:58，OPS-04 与工牌 ZL-017 完成口令和活体人脸双重认证；留存帧与周岚人事照匹配，21:19:04 A047 随后取出。"],
    e_route: ["服务区通行原始记录", "门控·路径记录", "ZL-017 于 19:08—19:27 进出 14F 服务区；20:43—20:50 进出 11F 管井走廊；21:24 再入 14F，21:37 服务梯下行，21:49 从 11F 管井走廊离开。门控顶置帧与卡柜活体帧为同一人，各门无尾随报警。"],
    e_hatch: ["浴室检修口痕迹", "1102·现场物证", "浴室镜柜后的 58×82 厘米检修口通向管井走廊；内沿有新鲜鞋擦、搬运毯蓝灰纤维与当晚未干的清洁剂印迹。"],
    e_chain_tests: ["门链替代顺序测试", "实验·原始记录", "门缝复位模型无法挂链；经前门离开会新增门控记录；先离开再挂链在物理上不成立。测试记录不单独确定行为时间。"],
    e_chaintrial: ["锁闭现场复原结论", "分析·派生材料", "引用门链状态、检修口痕迹、服务区路径和替代顺序测试：室内挂链后经检修口离开，是当前材料下同时满足锁闭与 21:49 离场记录的顺序。"],
    e_watch: ["死者智能手表记录", "设备·独立时间锚点", "19:16:21 检测到剧烈冲击，心率随后急降；19:18 后没有有效活动记录。它固定冲击与生理变化，不单独等同于法医死亡判断。"],
    e_oldfile: ["2014 原始验收卷", "旧案·原始文件", "会议纪要、监理联系单、修改验收页与施工日志共同保存了降配责任链。"],
    e_casualty: ["2014 事故死亡名单", "旧案·人员记录", "遇难者：周屿，男，27 岁；另一名遇难者为施工班组成员。"],
    e_hr: ["物业人事历史档案", "物业·人事记录", "周岚入职档案的历史紧急联系人：周屿（兄）。"],
    e_message: ["“东西我已经找到了”", "手机·通信", "林知秋 17:58 发给记者梁闻；梁闻删除了附件，却保留了校验摘要。"],
    e_copy: ["顾雪的复制日志", "公司·设备记录", "顾雪 19:03 在停车场见到林知秋并复制资料，谎报离开时间是为掩盖越权。"],
    e_debt: ["保险变更草稿", "私人·动机材料", "程逸并非新增受益人，恰恰在草稿中被移除；经济动机无法证明行为。"],
    e_cart: ["搬运车轮迹", "物业·工具痕迹", "1402 服务通道轮迹与物业搬运车的轮距、轮宽及右后轮磨损缺口位置一致；19:28—21:13 的监控片段因例行维护缺失。"]
  };

  const DEDUCTIONS = {
    d_lock: ["死亡地点尚未独立证明", "尸体在 1102 被发现是事实；死亡是否发生在此仍需新的物理来源。"],
    d_alibi: ["许遥的不在场证明成立", "直播、位置与会场三种独立来源形成连续时间链。"],
    d_dimension: ["十三厘米矛盾", "现场照片里的房间尺寸不符合 1102 的固定结构。"],
    d_1402: ["被注销的 1402", "房号从物业系统消失，但原空间仍被合并标注遮蔽。"],
    d_mirror: ["镜像现场", "1402 才是死亡第一现场；1102 是尸体发现现场。"],
    d_body_review: ["伤情与设备联合复核", "初检伤情、手表冲击和 1402 撞击痕形成派生对应链；死亡判断收窄至 19:16—19:18。"],
    d_semantics: ["证据事实与解释分离", "卡片开启房门，不等于卡片登记人亲自进入。"],
    d_sound: ["结构传声", "沈曼听见了声音，但无法凭听觉确认楼层来源。"],
    d_cuff: ["袖扣的错误时间", "真实物证也可能在与案件无关的时间留下。"],
    d_access: ["置换者的条件交集", "知识、受控权限、19 点实际通行窗口与 A047 身份链分别获得来源后，唯一交集才指向周岚。"],
    d_reconstruction: ["锁闭现场复原", "约 20:46 先经检修通道放水；21:19 取卡，21:41 从正门运入尸体；室内挂链后于 21:49 经检修通道离开。"],
    d_oldcase: ["旧案责任链", "旧案是置换现场的深层目的，且责任不止一个人。"],
    d_private: ["周岚与旧案的私人联系", "死亡名单与人事档案独立连接：遇难者周屿是周岚的哥哥。"]
  };

  const INTERVIEWS = {
    xuyoa: { name: "许遥", role: "前合伙人", topics: ["公开争吵","旧日合作","袖扣"], requiredTopic: "公开争吵", statement: "今天晚上，我们之间必须有一个结果。", kind: "omission", evidence: "e_cuffphoto", reveal: "我说的结果，是让他决定是否公开资料。袖扣在 9 月 3 日就丢了。", lines: ["已问清争吵语境。","这句话省略了“结果”的具体内容。","带日期的照片固定了袖扣遗失时间。"] },
    guxue: { name: "顾雪", role: "死者助理", topics: ["离开公司","案发后去向","复制资料"], requiredTopic: "案发后去向", statement: "林老师六点十分离开公司。", kind: "omission", evidence: "e_copy", unlock: "e_copy", reveal: "19:03 我在停车场又见过他，还复制了资料。", lines: ["已追问离开后的行程。","离开公司，不等于最后一次见面。","复制日志迫使她补全了 19:03。"] },
    liangwen: { name: "梁闻", role: "调查记者", topics: ["旧案报道","与死者通信","消息来源"], requiredTopic: "与死者通信", statement: "我没收到能发表的东西。", kind: "omission", evidence: "e_message", unlock: "e_message", reveal: "附件收到了，但未经来源许可，不能发表。", lines: ["已核对通信措辞。","“不能发表”被省略成了“没收到”。","校验摘要证明附件确实存在。"] },
    chengyi: { name: "程逸", role: "死者弟弟", topics: ["家庭关系","保险与债务","旧案动机"], requiredTopic: "保险与债务", statement: "他最近谈过保险，我确实缺钱。", kind: "inference", evidence: "e_debt", unlock: "e_debt", reveal: "我从没说受益人是我；草稿反而把我移除了。", lines: ["已核对保险措辞。","债务与保险只能构成推测，不能证明受益。","变更草稿排除了直接获利。"] },
    shenman: { name: "沈曼", role: "11 层住户", topics: ["听见时间","声音位置","邻里关系"], requiredTopic: "声音位置", statement: "九点多，我听见 1102 一直有声音。", kind: "inference", evidence: "e_pipe", reveal: "我没亲眼确认，只是在管井旁听见撞击和拖动。", lines: ["已追问她如何定位声音。","听见声音是事实，楼层来源是推测。","管井图给出了结构传声路径。"] },
    zhoulan: { name: "周岚", role: "物业运营负责人", topics: ["现行系统","物业旧图","应急权限"], requiredTopic: "物业旧图", statement: "系统里没有 1402。", kind: "omission", evidence: "e_cardlog", reveal: "我说的是现行系统。旧图和应急卡柜是另一套记录。", lines: ["已区分现行系统与历史档案。","她省略了“现行”这个限定。","A047 流转记录证明另一套系统在当晚被操作；操作者身份仍需另查。"] }
  };

  const LEAD_ROUTES = {
    guxue: {
      correct: "parking-access",
      options: [["parking-camera","停车场监控","19:00 后画面被立柱遮挡，只能确认车辆进出。"],["parking-access","停车场设备接入记录","19:03 出现顾雪工牌与加密存储设备的复制会话。"],["office-log","办公电脑登录日志","18:12 后没有新的桌面登录，无法说明停车场活动。"]]
    },
    liangwen: {
      correct: "attachment-checksum",
      options: [["call-log","手机通话清单","只记录通话，没有附件内容。"],["public-draft","公开报道草稿","草稿未引用附件，无法证明是否收到。"],["attachment-checksum","附件校验摘要","服务器保留接收时间与被删附件的哈希摘要。"]]
    },
    chengyi: {
      correct: "insurance-draft",
      options: [["bank-flow","银行流水","存在债务，但没有来自死者的异常转账。"],["insurance-draft","保险变更草稿","草稿显示程逸被移出受益人名单。"],["phone-location","手机位置记录","只能确认他当晚在住所附近，不能解释保险受益关系。"]]
    }
  };

  const DEDUCTION_LINKS = {
    d_lock: ["e_lock","e_access","e_body"], d_alibi: ["e_checkin","e_stream","e_location"],
    d_dimension: ["e_shelf","e_plan1102","e_fixed"], d_1402: ["e_plan2012","e_plan2019"],
    d_mirror: ["e_impact","e_floor","e_body"], d_body_review:["e_body","e_watch","e_impact","e_body_review"], d_semantics: ["e_access","e_cardlog"],
    d_sound: ["e_pipe"], d_cuff: ["e_cufflink","e_cuffphoto"],
    d_access: ["e_permission","e_cardlog","e_accountmap","e_trainingaccess","e_shift","e_cardauth","e_route"],
    d_reconstruction: ["e_waterlab","e_cardlog","e_cardauth","e_cart","e_access","e_lock","e_hatch","e_chain_tests","e_chaintrial","e_route"],
    d_oldcase: ["e_oldfile"], d_private: ["e_casualty","e_hr"]
  };

  const ORIGIN_BADGES = {
    e_checkin: "独立来源 · 会场", e_stream: "独立来源 · 公开影像", e_location: "独立来源 · 运营商",
    e_watch: "原始来源 · 设备", e_body: "原始来源 · 法医初检", e_impact: "原始来源 · 现场", e_body_review:"派生材料 · 引用初检/设备/现场",
    e_cardlog: "卡柜数据库", e_accountmap: "账号目录", e_trainingaccess: "培训与访问审计", e_shift: "人事排班", e_cardauth: "卡柜活体认证",
    e_route: "门控独立记录", e_hatch: "现场痕迹", e_chain_tests:"原始实验记录", e_chaintrial: "派生材料 · 引用四类来源", e_remote_sweep: "技术排除调查",
    e_casualty: "旧案名册", e_hr: "人事档案", e_waterlab: "独立来源 · 复现实验"
  };

  let state = loadState();
  let toastTimer = null;
  let notebookView = { tab: "evidence", person: "all", source: "all", focusEvidence: null, focusDeduction: null, returnDeduction: false };
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
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      localStorage.setItem(META_KEY, JSON.stringify(state.meta));
      if (!silent) toast("案件进度已保存在本机");
    } catch (_) {
      toast("本机存储写入失败；本页内进度仍保留，请勿刷新");
      updateHeader();
      return false;
    }
    updateHeader();
    return true;
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
          <div class="landing-deck">WRONG FLOOR · V3.4 · 2026/09/17</div>
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
            ${[16,15,14,13,12,11,10,9,8,7,6,5].map(f => `<div class="building-floor"><span class="floor-no">${f}F</span><span class="floor-room ${f === 11 ? "hot" : ""}">${f === 11 ? "1102 · 尸体发现" : `${f}F · 住户层`}</span></div>`).join("")}
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
          const solvedCount = state.solved.filter(id => ({1:["p01"],2:["p02"],3:["p03"],4:["p04"],5:["p05","p05r","p06"],6:["p07","p08"],7:["p09"],8:["p10","p10r","p11"],9:["p12"]}[no] || []).includes(id)).length;
          const reconstructionResolved = state.solved.includes("p10r") || state.legacyReconstruction;
          const requiredDone = Number(state.solved.includes("p10")) + Number(reconstructionResolved);
          const progressText = no === 8 ? `必做 ${requiredDone}/2${state.legacyReconstruction && !state.solved.includes("p10r") ? "（含旧版复原）" : ""} · 旧案${state.solved.includes("p11") ? "完成" : "可选"}` : solvedCount ? `完成 ${solvedCount}` : "";
          return `<article class="card ${unlocked ? "chapter-reveal" : "locked"}">
            <small>${unlocked ? (no === 9 ? "FINAL" : `CHAPTER 0${no}`) : `INVESTIGATION 0${no}`}</small>
            <h3>${unlocked ? escapeHtml(chapter.title) : `第${toChinese(no)}调查阶段 · 未解锁`}</h3>
            <p>${unlocked ? escapeHtml(chapter.subtitle) : escapeHtml(Logic.chapterLockReason(state,no))}</p>
            <div class="card-actions"><button class="btn" data-action="go-chapter" data-chapter="${no}" ${unlocked ? "" : "disabled"}>${no < highest ? "重新查看" : no === highest ? "进入调查" : "未开放"}</button><span class="meta">${progressText}</span></div>
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
        <div><div class="objective"><strong>当前目标</strong>${escapeHtml(chapter.objective)}</div>${state.pinnedEvidence.length ? `<div class="chapter-pins"><span>已钉选</span>${state.pinnedEvidence.map(id => `<button data-action="show-notebook">${EVIDENCE[id][0]}</button>`).join("")}</div>` : ""}</div>
      </header>
      <div id="chapter-body">${chapterRenderer(no)}</div>
    </section>`;
    updateHeader();
    saveState(true);
    app.focus({ preventScroll: true });
  }

  function renderChapterPreserving(selector) {
    const anchor = selector ? document.querySelector(selector) : null;
    const previousTop = anchor ? anchor.getBoundingClientRect().top : null;
    const previousScroll = window.scrollY;
    renderChapter(state.chapter);
    requestAnimationFrame(() => {
      const next = selector ? document.querySelector(selector) : null;
      if (next && previousTop !== null) {
        window.scrollBy(0, next.getBoundingClientRect().top - previousTop);
        next.focus({ preventScroll: true });
      } else window.scrollTo(0, previousScroll);
    });
  }

  function chapterRenderer(no) {
    if (no === 8 && !state.interludeSeen) return `<section class="interlude"><div class="eyebrow">00:48 · 询问室外</div><p>14 层走廊的灯隔着监控屏亮着。周岚抱着一叠物业表格停在门口。</p><blockquote>“你们还要查多久？”</blockquote><p>你合上案件簿：“查到问题变成正确的问题为止。”</p><button class="btn primary" data-action="continue-interlude">继续调查权限关系</button></section>`;
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
      ${investigationCard("body", "尸体与客厅", "后枕部有钝性撞击伤，地毯却异常干净。", ["e_body"])}
      ${investigationCard("bath", "持续溢水的浴室", "小流量、阀门开度和排水口堵塞状态已记录；原因与时间作用仍待复现。", ["e_water"])}
      ${investigationCard("shelf", "书柜底部", "一枚刻有 X.Y. 的袖扣落在积灰中。", ["e_cufflink"])}
      ${investigationCard("access", "1102 使用痕迹", "死者曾把这里当临时办公室，旧痕迹很多。", ["e_dna"])}
      ${investigationCard("remote-sweep", "无线与机械触发排查", "排除远程通信、定时器与牵引装置；这是可选的排除性调查。", ["e_remote_sweep"])}
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
    return `<section class="puzzle subdued"><div class="puzzle-tag">CURRENT THEORY · 可选</div><h2>以当前理论暂时结案</h2><p class="muted">校验器会分别显示“与证据矛盾”“已有支持”和“尚未得到证明”；证据不足不等于理论已被证伪。</p><div class="report-grid">${field("culprit","嫌疑人",["许遥","顾雪","周岚"])}${field("place","死亡地点",["1102","其他地点"])}${field("method","犯罪方法",["远程装置","密室后逃离","未知"])}</div><button class="btn danger-btn" data-action="check-theory">检查当前理论</button><div class="feedback" id="feedback-theory"></div></section>`;
  }

  function chapter3() {
    const ready = state.examined.includes("measure-photo") && state.examined.includes("measure-plan");
    const photo = Number(state.factAnswers.photoMeasure ?? 60), plan = Number(state.factAnswers.planMeasure ?? 50);
    const phase = Number(state.factAnswers.p03Phase || 1);
    const explanation = state.factAnswers.p03Explanation;
    const hypothesisNames = { furniture:"家具移动", perspective:"摄影透视", room:"房间并非 1102" };
    const adjusters = kind => `<span class="measure-adjust" role="group" aria-label="${kind === "photo" ? "现场照片" : "图纸"}读数微调"><button type="button" data-action="adjust-measure" data-kind="${kind}" data-delta="-1" ${phase > 1 ? "disabled" : ""}>−1</button><button type="button" data-action="adjust-measure" data-kind="${kind}" data-delta="1" ${phase > 1 ? "disabled" : ""}>+1</button></span>`;
    return `${state.solved.includes("p03") ? '<div class="deduction-banner"><strong>推理成立 · P03 十三厘米</strong><span>测量只建立异常；固定结构复核排除了家具与透视，最终才裁决房间身份。</span></div>' : ""}<div class="measure-stage">
      <div>${investigationCard("measure-photo", "现场比例照片", "地砖边长 60 厘米。用图上标尺估算书柜右缘与固定墙之间的距离。", [])}</div>
      <div>${investigationCard("measure-plan", "1102 竣工户型图", "用图纸刻度复核固定墙体与书柜定位线，不要直接相信家具摆位。", [])}</div>
    </div>
    <div class="measure-stage" aria-label="尺寸复核示意"><div class="plan-box photo-measure"><div class="tile-grid"></div><div class="plan-shelf"></div><span class="measure-note">每格地砖 60 cm</span><label class="ruler-control"><span>拖动 A—B 测量点对齐书柜边缘刻线</span><output id="photo-output">${photo} cm</output><span class="measure-slider"><i class="target-notch" style="left:69.17%" aria-hidden="true"></i><input type="range" min="0" max="120" step="1" value="${photo}" data-measure="photo" ${phase > 1 ? "disabled" : ""}></span>${adjusters("photo")}<span class="range-labels"><b>0</b><b>60</b><b>120 cm</b></span></label></div><div class="plan-box plan-measure"><div class="plan-room"><div class="plan-shelf"></div><div class="scale-line"><span>0</span><span>50</span><span>100cm</span></div><span class="measure-note">图纸比例 1:50 · 尺寸线可读</span><label class="ruler-control"><span>拖动图纸标尺到定位线</span><output id="plan-output">${plan} cm</output><span class="measure-slider"><i class="target-notch" style="left:87.27%" aria-hidden="true"></i><input type="range" min="0" max="110" step="1" value="${plan}" data-measure="plan" ${phase > 1 ? "disabled" : ""}></span>${adjusters("plan")}<span class="range-labels"><b>0</b><b>50</b><b>100 cm</b></span></label></div></div>
    <section class="puzzle staged-puzzle"><div class="puzzle-tag">P03 · 十三厘米 · ${Math.min(phase,4)}/4</div><h2>${phase === 1 ? "第一步：记录带容差的测量结果" : phase === 2 ? "第二步：暂存一个解释假说" : phase === 3 ? "第三步：选择独立固定结构复核" : "第四步：根据复核结果裁决假说"}</h2><div class="measurement-result">现场约 <strong id="result-photo">${photo}</strong> cm · 图纸 <strong id="result-plan">${plan}</strong> cm · 差值约 <strong id="result-diff">${Math.abs(plan-photo)}</strong> cm</div>
      ${phase === 1 ? `<p class="muted">允许每项 ±2 cm 的读数误差；最终判断看约 13 cm 的差值，而不是要求手指停在唯一像素。</p><button class="btn primary" data-action="lock-p03-measure" ${ready ? "" : "disabled"}>记录尺寸异常</button>` : ""}
      ${phase === 2 ? `<p class="muted">这里不判对错。先留下工作假说，再让下一份固定结构材料决定它能否成立。</p><div class="choices">${[["furniture","A · 家具被移动"],["perspective","B · 摄影透视造成误差"],["room","C · 房间不是 1102"]].map(([v,t]) => `<label class="choice"><input type="radio" name="p03-explanation" value="${v}" ${explanation === v ? "checked" : ""}><span>${t}</span></label>`).join("")}</div><button class="btn primary" data-action="lock-p03-explanation">暂存假说并继续复核</button>` : ""}
      ${phase === 3 ? `<p class="muted">当前暂存：${hypothesisNames[explanation] || "未选择"}。选择一项不会随家具移动、又能检验透视误差的来源。</p><div class="choices">${[["curtain","窗帘角度"],["window","窗框中线与暖气管距离"],["table","桌上杯子位置"]].map(([v,t]) => `<label class="choice"><input type="radio" name="p03-fixed" value="${v}"><span>${t}</span></label>`).join("")}</div><button class="btn primary" data-action="run-p03-fixed">执行固定结构复核</button>` : ""}
      ${phase >= 4 ? `<div class="document"><h3>固定结构复核结果</h3><p>窗框中线与暖气管的相对位置同样偏离 1102 竣工图。移动家具不能改变两者；单纯透视也应保留两套固定结构的比例关系。</p><p>先前假说：<strong>${hypothesisNames[explanation] || "未记录"}</strong></p></div><div class="choices">${[["furniture","家具移动仍能解释全部异常"],["perspective","摄影透视仍能解释全部异常"],["room","照片中的房间不是 1102"]].map(([v,t]) => `<label class="choice"><input type="radio" name="p03-conclusion" value="${v}"><span>${t}</span></label>`).join("")}</div><button class="btn primary" data-action="solve-p03">形成空间推论</button>` : ""}<div class="feedback" id="feedback-p03"></div>
    </section>`;
  }

  function blueprintDiagram(id) {
    const middle = id === "2012" || id === "2013" || id === "2016" ? "1402" : id === "2019" ? "—" : "设备区域";
    return `<div class="mini-plan ${id >= "2019" ? "changed" : ""}"><span>1401</span><span class="middle">${middle}</span><span>1403</span><i class="door">门位</i><i class="shaft">管井</i></div>`;
  }

  function chapter4() {
    const phase = Number(state.factAnswers.p04Phase || 1);
    const first = state.factAnswers.p04First, second = state.factAnswers.p04Second;
    return `<div class="grid">${investigationCard("archive-history", "房号变更申请", "2017 年改造申请写着“1401/1403 合并”，附件页码不连续。", ["e_plan2019"])}</div>
    <section class="puzzle staged-puzzle"><div class="puzzle-tag">P04 · 五版建筑图 · ${phase}/3</div><h2>${phase === 1 ? "第一步：哪一版最早明确出现中部独立房间？" : phase === 2 ? "第二步：哪一版最早不再显示它的房号？" : "第三步：消失的是房号，还是建筑结构？"}</h2>
      <div class="blueprint-stack">${[["2012","施工图"],["2013","销售图"],["2016","消防图"],["2019","物业图"],["2026","电子地图"]].map(([id,label]) => `<button class="blueprint ${(phase === 1 && first === id) || (phase === 2 && second === id) ? "selected" : ""} ${phase === 3 && (first === id || second === id) ? "selected locked-choice" : ""}" data-action="select-blueprint" data-id="${id}" data-stage="${phase}" ${phase === 3 ? "disabled" : ""}><strong>${label}</strong>${blueprintDiagram(id)}</button>`).join("")}</div>
      ${phase === 1 ? '<button class="btn primary" data-action="confirm-p04-first">确认最早存在来源</button>' : ""}
      ${phase === 2 ? '<button class="btn primary" data-action="confirm-p04-second">确认最早注销来源</button>' : ""}
      ${phase === 3 ? `<h3>比较 ${first} 与 ${second}：哪些变化可从图上直接确认？</h3><div class="choices">${[["number","中部房号消失"],["door","正式门位消失"],["wall-kept","承重边界没有拆除标记"],["pipe","竖向管井仍然存在"],["wall-removed","中部承重墙已全部拆除"]].map(([v,t]) => `<label class="choice"><input type="checkbox" name="p04-change" value="${v}"><span>${t}</span></label>`).join("")}</div><button class="btn primary" data-action="solve-p04">形成建筑档案推论</button>` : ""}<div class="feedback" id="feedback-p04"></div>
    </section>`;
  }

  function chapter5() {
    const differences = [["socket","插座高度","fix","▭","▭"],["drag","平行拖痕","key","","≋"],["frame","窗框编号","fix","F11","F14"],["nail","旧钉孔","history","⋰","⋱"],["pipe","暖气管位置","fix","║","║"],["impact","擦拭撞击痕","key","","×"],["cup","杯子数量","noise","○","○○"],["curtain","窗帘角度","noise","╱","╲"],["lamp","灯罩颜色","noise","◇","◆"],["painting","装饰画偏移","history","▱","▰"]];
    const detail = { socket:"距地高度相差 7 厘米，属于固定装修差异。", drag:"两道约 53 厘米间距的拖擦痕；清洁剂下残留蓝灰纤维，与搬运毯同类。", frame:"窗框批次刻码为 F14，可定位楼层。", nail:"旧钉孔显示这里曾使用另一套挂画方案。", pipe:"暖气管与窗框中线距离不同，排除单纯透视。", impact:"结构件有血液擦拭残留；高度、形状与死者后枕伤吻合。", cup:"桌面杯子数量不同，属于可移动物。", curtain:"窗帘开合角度不同，无法定位房间。", lamp:"灯罩后来更换，和案发行为无直接关系。", painting:"装饰画偏移能说明装修历史，不能证明死亡。" };
    const observationsSaved = Boolean(state.factAnswers.p05ObservationsSaved);
    const ready = state.mirrorFound.length >= 6;
    const reviewReady = state.solved.includes("p05") && ["e_body","e_watch","e_impact"].every(id=>state.evidence.includes(id));
    const reviewDone = state.solved.includes("p05r") && state.evidence.includes("e_body_review");
    return `${state.solved.includes("p05") ? '<div class="deduction-banner"><strong>推论形成：1402 为第一现场</strong><span>墙面痕迹对应后枕部伤情；地板拖痕与搬运毯纤维对应尸体搬运。死亡精确区间仍待联合复核。</span></div>' : ""}<div class="document"><h3>现场准入记录</h3><p>14 层封闭档案室。门上没有房号，旧锁芯可由物业工程总钥匙开启。内部 B2 户型未随产权合并完全拆除。</p></div>
    <section class="puzzle"><div class="puzzle-tag">P05 · 双房调查 · ${observationsSaved ? "案件簿研判" : "现场观察"}</div><h2>${observationsSaved ? "从已保存观察中钉选两项案件关键证据" : "对照 1102 与未编号空间"}</h2>
      ${!observationsSaved ? `<p class="muted">右侧有十处可见差异，没有发光提示。先记录至少六处；这一步只保存观察，不形成推论。</p><div class="mirror-stage"><div class="room-scene detailed-room compare-left"><span class="room-label">11F · 1102</span>${differences.filter(([, , ,left]) => left).map(([id,,,left]) => `<span class="scene-object diff-${id}">${left}</span>`).join("")}</div><div class="room-scene detailed-room compare-right"><span class="room-label">14F · 未编号空间</span>${differences.map(([id,label,,,right]) => `<button class="difference diff-${id} ${state.mirrorFound.includes(id) ? "found" : ""}" data-action="find-diff" data-diff="${id}" title="${label}" aria-label="调查${label}">${right}</button>`).join("")}</div></div><div class="found-differences observation-list">${state.mirrorFound.length ? differences.filter(([id]) => state.mirrorFound.includes(id)).map(([id,label]) => `<article class="difference-note"><span><strong>${label}</strong><small>${detail[id]}</small></span></article>`).join("") : '<span class="muted">尚未记录差异</span>'}</div><p class="feedback ${ready ? "good" : ""}" id="feedback-p05">${ready ? "观察数量足够，可以先保存到案件簿再判断意义。" : `已记录 ${state.mirrorFound.length}/10。`}</p><button class="btn primary" data-action="save-p05-observations" ${ready ? "" : "disabled"}>保存现场观察</button>` : `<p class="muted">观察已与现场分离保存。选择能分别证明“致命冲突”和“尸体搬运”的两项。</p><div class="found-differences">${differences.filter(([id]) => state.mirrorFound.includes(id)).map(([id,label]) => `<label class="difference-note"><input type="checkbox" name="p05-proof" value="${id}"><span><strong>${label}</strong><small>${detail[id]}</small></span></label>`).join("")}</div><div class="card-actions"><button class="btn primary" data-action="solve-p05">形成第一现场推论</button><button class="btn ghost" data-action="resume-p05-observation">返回现场补查</button></div><div class="feedback" id="feedback-p05"></div>`}
    </section>
    <section class="puzzle body-review"><div class="puzzle-tag">P05-R · 联合复核</div><h2>把伤情、设备记录和现场痕迹送交同一轮复核</h2><p class="muted">这会生成派生材料，不会凭空增加一个独立来源。复核结果将明确列出所引用的三份原始材料。</p><div class="review-source-chain"><span>尸表初检</span><b>＋</b><span>智能手表</span><b>＋</b><span>1402 撞击痕</span><b>→</b><span>${reviewDone ? "联合复核完成" : "待复核"}</span></div><button class="btn primary" data-action="run-body-review" ${reviewReady && !reviewDone ? "" : "disabled"}>${reviewDone ? "联合复核已完成" : reviewReady ? "提交联合复核" : "先取得三份前置材料"}</button><div class="feedback ${reviewDone ? "good" : ""}" id="feedback-body-review">${reviewDone ? "复核已引用初检、手表与现场比对；精确死亡区间现可用于报告。" : ""}</div></section>
    <section class="puzzle"><div class="puzzle-tag">P06 · 三层视线模拟</div><h2>依次切换 11F、12F、14F，观察照片俯角</h2><div class="sight-stage floor-${state.factAnswers.viewFloor || 11}"><div class="tower source"><span>临江壹号</span><i class="sight-origin">${state.factAnswers.viewFloor || 11}F</i></div><div class="sight-line"></div><div class="tower opposite"><span>对面 12F</span><i class="platform">设备平台</i></div><div class="sight-verdict ${(state.factAnswers.viewFloor || 11) === 14 ? "pass" : "blocked"}">${(state.factAnswers.viewFloor || 11) === 14 ? "✓ 可越过女儿墙，形成照片俯角" : (state.factAnswers.viewFloor || 11) === 12 ? "× 视线仍被女儿墙上缘截断" : "× 视线完全落在女儿墙后"}</div></div><div class="floor-switch">${[11,12,14].map(n => `<button class="btn ${Number(state.factAnswers.viewFloor || 11) === n ? "primary" : ""}" data-action="set-view-floor" data-floor="${n}">${n}F 视线${(state.factAnswers.viewedFloors || []).includes(String(n)) ? " · 已看" : ""}</button>`).join("")}</div><button class="btn primary" data-action="solve-p06" ${["11","12","14"].every(n => (state.factAnswers.viewedFloors || []).includes(n)) ? "" : "disabled"}>记录照片拍摄高度</button><div class="feedback" id="feedback-p06"></div></section>`;
  }

  function chapter6() {
    const facts = [
      ["card", "林知秋 21:41 进入 1102", [["person","登记人亲自进入房间"],["card","A047 卡于 21:41 开启 1102"],["nocamera","21:41 没有人进入 1102"]]],
      ["sound", "沈曼听见 1102 有人", [["sound","沈曼在管井旁听见来源不明的声响"],["room","声响确定来自 1102"],["fight","沈曼听见了两人搏斗"]]],
      ["dna", "林知秋当晚在 1102", [["night","DNA 于当晚留下"],["alive","DNA 证明死者 21:41 仍存活"],["dna","1102 内检出无法定年的死者 DNA"]]],
      ["cuff", "许遥当晚到过现场", [["owner","许遥本人当晚遗落袖扣"],["cuff","属于许遥的袖扣在 1102 书柜底被发现"],["killer","袖扣持有人实施了犯罪"]]],
      ["water", "凶手 22:36 仍在屋内", [["water","持续小流量溢水在 22:36 被楼下发现"],["person","有人恰在 22:36 打开水龙头"],["timer","溢水精确记录了凶手离开时间"]]],
      ["injury", "客厅墙面造成致命伤", [["wall","1102 墙面造成伤口"],["weapon","死者遭特定凶器攻击"],["injury","后枕部存在钝性撞击伤"]]],
      ["alibi", "直播证明许遥无罪", [["innocent","许遥与案件完全无关"],["alibi","许遥在关键时段连续处于会场"],["never","许遥从未进入过 1102"]]]
    ];
    return `<div class="document"><h3>门禁后台原始日志</h3><table><thead><tr><th>时间</th><th>卡号</th><th>门点</th><th>结果</th></tr></thead><tbody><tr><td>21:41:08</td><td>A047</td><td>1102</td><td>开启成功</td></tr></tbody></table><p>系统字段中没有“姓名”或“人脸确认”。</p></div>
    <section class="puzzle"><div class="puzzle-tag">P07 · 门禁语言陷阱</div><h2>把“警方解释”改写为“证据事实”</h2><div>${facts.map(([id,claim,options]) => `<div class="fact-card"><strong>${claim}</strong><span class="arrow">→</span><select data-fact="${id}"><option value="">选择严格表述</option>${options.map(([v,t]) => `<option value="${v}" ${state.factAnswers[id] === v ? "selected" : ""}>${t}</option>`).join("")}</select></div>`).join("")}</div><button class="btn primary" data-action="solve-p07">剥离解释</button><div class="feedback" id="feedback-p07"></div></section>
    <section class="puzzle"><div class="puzzle-tag">P08 · 水管线路</div><h2>哪条结构路径能解释 11 层的声音？</h2><div class="choices">${[["hall","14层走廊 → 电梯井 → 11层客厅"],["pipe","1402管井 → 共用立管 → 1102管井旁"],["window","1402窗外 → 外墙反射 → 1102阳台"]].map(([v,t]) => `<label class="choice"><input type="radio" name="p08" value="${v}"><span>${t}</span></label>`).join("")}</div><button class="btn primary" data-action="solve-p08">检查结构图</button><div class="feedback" id="feedback-p08"></div></section>`;
  }

  function interviewRow(id) {
    const person = INTERVIEWS[id];
    const round = Number(state.interviews[id] || 0);
    const labels = ["选择话题","拆解证词","出示材料"];
    const waiting = round === 2 && person.unlock && !state.evidence.includes(person.unlock);
    const route = state.interviewData[id] && state.interviewData[id].routeText;
    return `<div class="interview-row"><div><div class="person-name">${person.name}${Logic.CORE_INTERVIEWS.includes(id) ? '<span class="key-mark">关键</span>' : ""}</div><span class="meta">${person.role}</span></div><div><span class="round-dots">${[1,2,3].map(n => `<span class="${round >= n ? "on" : ""}">●</span>`).join("")}</span><p class="muted" style="margin:.5em 0 0">${route || (round ? person.lines[round - 1] : "三轮分别需要选择话题、判断语言性质、提交证据。")}</p></div><button class="btn" data-action="interview" data-person="${id}" ${(round >= 3 || waiting) ? "disabled" : ""}>${round >= 3 ? "突破完成" : waiting ? "等待外部调查" : labels[round]}</button></div>`;
  }

  function chapter7() {
    const coreDone = Logic.keyInterviewCount(state);
    const leads = Object.keys(INTERVIEWS).filter(id => INTERVIEWS[id].unlock && state.interviewData[id] && state.interviewData[id].lead && !state.evidence.includes(INTERVIEWS[id].unlock));
    return `<section><div class="eyebrow">SIX STATEMENTS · THREE ROUNDS</div><p class="lead">本案尚未发现一句可以直接证伪的纯假话。第八阶段需要至少突破两名关键证人（${coreDone}/2）；真话是否完整，要由外部来源检验。</p>${Object.keys(INTERVIEWS).map(interviewRow).join("")}</section>${leads.length ? `<section class="lead-board"><div class="eyebrow">FOLLOW-UP LEADS · 调查板</div><h2>审讯只产生调查方向，不自动产生证据</h2>${leads.map(id => { const routes=LEAD_ROUTES[id], attempts=(state.interviewData[id].leadAttempts || []); return `<article class="lead-case"><h3>${INTERVIEWS[id].name} · ${state.interviewData[id].lead}</h3><div class="lead-routes">${routes.options.map(([route,label,result]) => `<button class="lead-route ${attempts.includes(route) ? "checked" : ""}" data-action="investigate-lead" data-person="${id}" data-route="${route}" ${attempts.includes(route) ? "disabled" : ""}><strong>${label}</strong><span>${attempts.includes(route) ? result : "调取这一来源"}</span></button>`).join("")}</div></article>`; }).join("")}</section>` : ""}
    <section class="puzzle"><div class="puzzle-tag">P09 · 袖扣时间</div><h2>哪两条材料能证明袖扣是真的，却不是当晚留下？</h2>
      <div class="choices">${[["e_cufflink","袖扣凹槽内的旧灰尘"],["e_cuffphoto","9 月 3 日右袖缺扣的照片"],["e_stream","论坛连续直播"],["e_debt","程逸的债务"]].map(([v,t]) => `<label class="choice"><input type="checkbox" name="p09" value="${v}"><span>${t}</span></label>`).join("")}</div><button class="btn primary" data-action="solve-p09">校验遗留时间</button><div class="feedback" id="feedback-p09"></div></section>`;
  }

  function sceneReconstructionHtml() {
    const labels = {
      water: ["放水", "1102 浴室开始形成延迟渗漏"],
      card: ["取卡", "从应急卡柜取出 A047"],
      transfer: ["搬运", "尸体经正门进入 1102"],
      chain: ["挂链", "人在室内形成门链锁闭状态"],
      leave: ["离开", "不再经过正门离开 1102"]
    };
    const sourceIds = ["e_waterlab", "e_cardlog", "e_cart", "e_lock", "e_hatch"];
    const supportOptions = Object.values(Logic.RECONSTRUCTION_SUPPORT);
    const requiredEvidence = [...new Set([...sourceIds,...supportOptions.flatMap(rule=>rule.evidence)])];
    const ready = requiredEvidence.every(id => state.evidence.includes(id));
    const complete = state.solved.includes("p10r");
    const cards = state.reconstructionOrder.map((id,index) => `<article class="reconstruction-task-card" data-reconstruction-step="${id}" tabindex="-1">
      <div class="reconstruction-position"><span>顺序 ${index + 1}</span><div><button type="button" data-action="move-reconstruction" data-step="${id}" data-delta="-1" ${complete || index === 0 ? "disabled" : ""} aria-label="将${labels[id][0]}前移">↑</button><button type="button" data-action="move-reconstruction" data-step="${id}" data-delta="1" ${complete || index === state.reconstructionOrder.length - 1 ? "disabled" : ""} aria-label="将${labels[id][0]}后移">↓</button></div></div>
      <h3>${labels[id][0]}</h3><p>${labels[id][1]}</p>
      <label>主要依据<select data-reconstruction-source="${id}" ${complete ? "disabled" : ""}><option value="">— 支持这个行为的材料 —</option>${sourceIds.map(eid => `<option value="${eid}" ${state.reconstructionSources[id] === eid ? "selected" : ""} ${state.evidence.includes(eid) ? "" : "disabled"}>${EVIDENCE[eid][0]}</option>`).join("")}</select></label>
      <label>时间 / 路径补充<select data-reconstruction-support="${id}" ${complete ? "disabled" : ""}><option value="">— 补足何时、谁或如何到达 —</option>${supportOptions.map(rule => `<option value="${rule.value}" ${state.reconstructionSupport[id] === rule.value ? "selected" : ""} ${rule.evidence.every(eid=>state.evidence.includes(eid)) ? "" : "disabled"}>${rule.label}</option>`).join("")}</select></label>
      <button type="button" class="text-button reconstruction-notebook" data-action="show-notebook" data-evidence="${state.reconstructionSources[id] || ""}" data-return-anchor="[data-reconstruction-step='${id}']" data-return-focus="[data-reconstruction-step='${id}'] [data-action='show-notebook']">到案件簿核对材料</button>
    </article>`).join("");
    const preview=state.reconstructionOrder.map((id,index)=>`<span><b>${index+1}</b>${labels[id][0]}</span>`).join("");
    return `<section class="puzzle scene-reconstruction"><div class="puzzle-tag">P10-R · 现场复原</div><h2>排列五个行为，并分别连接主要依据与时间/路径补充</h2><p class="muted">顺序必须同时满足时间记录、正门搬运与室内门链。主要依据证明行为，补充依据回答何时、谁或如何到达。</p>${state.legacyReconstruction && !complete ? '<div class="legacy-reconstruction"><strong>旧版复原记录已保留</strong><span>终章资格不受影响；下方新版双来源任务可自愿完成，不会显示成你已经操作过的排序。</span></div>' : ""}<div class="reconstruction-preview" aria-label="当前五步顺序">${preview}</div><div id="reconstruction-status" class="sr-status" role="status" aria-live="polite">${escapeHtml(state.factAnswers.reconstructionAnnouncement || "")}</div><details class="reconstruction-details" ${complete ? "" : "open"}><summary>${complete ? "展开查看已完成的来源连接" : "展开排列与来源连接"}</summary><div class="reconstruction-task">${cards}</div></details><button class="btn primary" data-action="validate-reconstruction" ${ready && !complete ? "" : "disabled"}>${complete ? "复原已通过" : ready ? "运行现场复原" : "先补齐时间与路径材料"}</button><div class="feedback ${complete ? "good" : ""}" id="feedback-reconstruction">${complete ? "五个步骤的顺序、主要依据与补充依据已经闭合，完整复原时间线现已开放。" : ready ? "" : "路径、正门记录或门链替代测试仍有缺项；已有痕迹不会自动生成精确时间。"}</div>${complete ? '<section class="reconstruction-strip compact" aria-label="已完成现场复原"><article><b>约20:46</b><span>放水</span><small>实验＋管井路径</small></article><article><b>21:19</b><span>取卡</span><small>日志＋活体认证</small></article><article><b>21:41</b><span>搬运</span><small>轮迹＋路径＋正门</small></article><article><b>门链锁闭</b><span>室内挂链</span><small>门链＋替代测试</small></article><article><b>21:49</b><span>检修口离开</span><small>痕迹＋路径＋测试</small></article></section>' : ""}</section>`;
  }

  function chapter8() {
    const people = [["xuyoa","许遥"],["guxue","顾雪"],["liangwen","梁闻"],["chengyi","程逸"],["shenman","沈曼"],["zhoulan","周岚"]];
    const fields = [["know","知道隐蔽房间历史"],["permission","具备受控物业权限"],["blank","19点存在实施窗口"],["card","A047 当晚行为链"]];
    const marks = { yes:["✓","已证实"], no:["×","已排除"], unknown:["?","证据不足"] };
    const statusBadge = (id,field) => { const value=Logic.candidateStatus(state,id,field), m=marks[value]; return `<span class="matrix-status ${value}" data-status="${id}-${field}"><b>${m[0]}</b><small>${m[1]}</small></span>`; };
    const statusCell = (id,field) => `<td>${statusBadge(id,field)}</td>`;
    const reasons = [["","选择主要排除理由"],["alibi","关键时段连续在场"],["permission","不在受控权限名单"],["knowledge","无隐蔽房间知识"],["time","19 点行程没有空白"]];
    const rationale = {
      xuyoa:"论坛直播、位置和签到记录连续覆盖关键时段；这能排除他的实施窗口，也能排除他在 21:41 操作 A047。",
      guxue:"复制日志补全了 19:03。权限审计只能排除她通过受控门、卡柜与搬运车架完成整套置换；不能据此声称她从未接触 A047。",
      liangwen:"通信记录只能证明他收到资料。权限记录可以排除受控实施条件，但不会自动生成一条“未接触 A047”的事实。",
      chengyi:"债务只能构成动机推测。权限记录可以排除受控实施条件；其余知识、行程和卡片接触仍应保持证据不足。",
      shenman:"她的证词解释声音来源。权限记录可以排除受控实施条件，但不能把未调查的卡片接触写成已排除。",
      zhoulan:"四格分别取证：本人培训签收与访问审计对应实际知情；权限审计对应受控能力；当班表与 19:08 通行记录共同固定实施窗口；卡柜日志、活体认证和连续路径共同固定 A047 行为链。"
    };
    const reasonSelect = id => `<select data-exclusion-input="${id}" aria-label="${people.find(([pid])=>pid===id)[1]}主要排除理由">${reasons.map(([v,t]) => `<option value="${v}" ${state.exclusionAnswers[id] === v ? "selected" : ""}>${t}</option>`).join("")}</select>`;
    const rationaleButton = id => `<button class="text-button" data-action="toggle-matrix-rationale" data-person="${id}">${state.matrixExpanded.includes(id) ? "收起依据" : "为什么？"}</button>`;
    const mobileCards = people.map(([id,name]) => `<article class="exclusion-card" data-person-card="${id}"><header><h3>${name}</h3>${id === "zhoulan" ? '<strong class="intersection-label">四项交集候选</strong>' : ""}</header><div class="candidate-status-list">${fields.map(([field,label]) => `<div><span>${label}</span>${statusBadge(id,field)}</div>`).join("")}</div><div class="candidate-decision">${id === "zhoulan" ? '<strong class="intersection-label">需证明四项同时成立</strong>' : reasonSelect(id)}${rationaleButton(id)}</div>${state.matrixExpanded.includes(id) ? `<div class="candidate-rationale"><strong>当前证据说明</strong><p>${rationale[id]}</p></div>` : ""}</article>`).join("");
    const fileLabels={"file-a":"A · 开发商会议纪要","file-b":"B · 监理联系单","file-c":"C · 验收修改页","file-d":"D · 施工日志"};
    const actionLabels={lower:"提出结构降配",approve:"批准继续施工",sign:"签署修改验收页",execute:"现场执行变更"};
    const reconstructionReady=(state.solved.includes("p10r") || state.legacyReconstruction) && ["e_waterlab","e_cardauth","e_route","e_hatch","e_chaintrial"].every(id=>state.evidence.includes(id));
    const finalReady=Logic.chapterUnlocked(state,9);
    return `<section class="chapter-task-status" aria-label="第八章任务进度"><article class="${state.solved.includes("p10") ? "done" : ""}"><b>条件交集</b><span>必做 · ${state.solved.includes("p10") ? "已完成" : "未完成"}</span></article><article class="${reconstructionReady ? "done" : ""}"><b>现场复原</b><span>必做 · ${state.solved.includes("p10r") ? "新版完成" : state.legacyReconstruction ? "旧版记录保留" : "未完成"}</span></article><article class="${state.solved.includes("p11") ? "done" : ""}"><b>旧案责任链</b><span>可选 · ${state.solved.includes("p11") ? "已完成" : "未完成"}</span></article></section><section class="free-investigation"><div class="eyebrow">OPEN INVESTIGATION · 自由调查时间</div><h2>分别核验权限、身份、时间与锁闭路径</h2><div class="grid">${investigationCard("permission-audit", "物业 · 权限、知情与岗位", "分别核验受控权限、账号岗位、本人培训访问与当班签名；岗位可接触不等于本人知情。", ["e_permission","e_accountmap","e_trainingaccess","e_shift"])}${investigationCard("operation-audit", "卡柜与服务区 · 身份路径", "调取 A047 活体认证、工牌连续通行与搬运车轮迹，把账号落实到自然人和实际路线。", ["e_cardauth","e_route","e_cart"])}${investigationCard("water-reenactment", "1102 · 浴室渗漏复现", "按现场阀门开度和排水状态复现，检验 22:36 的发现时间是否被人为安排。", ["e_waterlab"])}${investigationCard("chain-reconstruction", "1102 · 检修口与门链替代测试", "记录另一出口痕迹，并实测门缝复位、前门离场等替代顺序；这些仍只是复原输入。", ["e_hatch","e_chain_tests"])}${investigationCard("old-case-file", "旧案档案 · 2014 原始验收卷", "可选深度调查；决定能否查清十二年前责任与周岚的私人联系。", ["e_oldfile","e_casualty","e_hr"])}</div></section>
    ${state.solved.includes("p10") ? `<div class="deduction-banner"><strong>${finalReady ? "主案报告已开放" : reconstructionReady ? "现场复原记录成立 · 终章仍有前置复核" : "置换者条件交集成立 · 现场复原尚未闭合"}</strong><span>${finalReady ? "联合复核、条件交集与现场复原均已完成。" : escapeHtml(Logic.chapterLockReason(state,9))}</span></div>` : ""}
    <section class="puzzle"><div class="puzzle-tag">P10 · 条件交集</div><h2>知道还不够：逐人记录为什么不能完成置换</h2><p class="muted">✓ 已证实 · × 已排除 · ? 证据不足。每个状态分别读取自己的来源；权限记录不会自动点亮 A047 行为。</p><div class="matrix-wrap desktop-exclusion"><table class="matrix exclusion-matrix"><thead><tr><th>人物</th>${fields.map(([,label]) => `<th>${label}</th>`).join("")}<th>主要判断</th></tr></thead><tbody>${people.map(([id,name]) => `<tr data-person-row="${id}"><td>${name}</td>${fields.map(([field]) => statusCell(id,field)).join("")}<td>${id === "zhoulan" ? '<strong class="intersection-label">四项交集候选</strong>' : reasonSelect(id)}${rationaleButton(id)}</td></tr>${state.matrixExpanded.includes(id) ? `<tr class="matrix-rationale"><td colspan="6"><strong>${name} · 证据说明</strong><p>${rationale[id]}</p></td></tr>` : ""}`).join("")}</tbody></table></div><div class="mobile-exclusion-cards">${mobileCards}</div>
      <div class="condition-proof"><h3>周岚为什么没有被排除？选择必须同时成立且分别有来源的四个条件</h3>${fields.map(([id,label]) => `<label><input type="checkbox" name="zhou-condition" value="${id}" ${state.zhouConditions.includes(id) ? "checked" : ""}><span><b>${label}</b><small>${id === "know" ? "岗位目录 + 本人签收与访问 → 实际知情" : id === "permission" ? "权限审计 → 受控门与工具" : id === "blank" ? "当班表 + 19:08 通行 → 实施窗口" : "卡柜日志 + 活体认证 + 连续路径"}</small></span></label>`).join("")}</div><button class="btn primary" data-action="solve-p10">提交排除链与唯一交集</button><div class="feedback" id="feedback-p10"></div></section>
    ${sceneReconstructionHtml()}
    <section class="puzzle">${state.solved.includes("p11") ? '<div class="deduction-banner"><strong>推理成立 · P11 旧案责任链</strong><span>四份原始文件分别固定提案、批准、签署与执行；两份人员记录独立连接周屿和周岚。</span></div>' : ""}<div class="puzzle-tag">P11 · 可选深度调查</div><h2>选择卷宗卡，再把它连接到责任主体与行为</h2><p class="muted">先点击一张档案卡，再点击主体槽位；随后为该主体选择文件实际记载的行为。手机端同样使用点击连接。</p><div class="file-fragments interactive-files">${[["file-a","A · 开发商会议纪要","“结构方案调整为 B 案，控制本季度成本。”"],["file-b","B · 监理联系单","“同意按 B 案继续施工，不停工复核。”"],["file-c","C · 验收修改页","林知秋、监理代表、工程总监签字。"],["file-d","D · 施工日志","“班组按 B 方案完成地下结构施工。”"]].map(([id,label,text]) => `<button class="file-card ${state.factAnswers.selectedChainFile === id ? "selected" : ""}" data-action="select-chain-file" data-file="${id}"><b>${label}</b><span>${text}</span></button>`).join("")}</div><div class="responsibility-board">${[["developer","开发商"],["supervisor","监理方"],["design","设计团队"],["contractor","施工方"]].map(([id,label]) => `<article class="responsibility-slot"><h3>${label}</h3><button class="attach-file" data-action="assign-chain-file" data-actor="${id}" ${state.factAnswers.selectedChainFile ? "" : "disabled"}>${state.chainFiles[id] ? `已连接：${fileLabels[state.chainFiles[id]]}` : "连接当前档案卡"}</button><div class="action-chips">${Object.entries(actionLabels).map(([value,text]) => `<button class="${state.chainAnswers[id] === value ? "selected" : ""}" data-action="choose-chain-action" data-actor="${id}" data-value="${value}">${text}</button>`).join("")}</div></article>`).join("")}</div><h3>哪两份人员记录能证明周岚与旧案的私人联系？</h3><div class="choices"><label class="choice"><input type="checkbox" name="p11-private" value="e_casualty"><span>2014 事故死亡名单</span></label><label class="choice"><input type="checkbox" name="p11-private" value="e_hr"><span>物业人事历史档案</span></label><label class="choice"><input type="checkbox" name="p11-private" value="e_debt"><span>程逸债务记录</span></label></div><button class="btn primary" data-action="solve-p11" ${state.evidence.includes("e_oldfile") ? "" : "disabled"}>形成责任链与私人联系</button><div class="feedback" id="feedback-p11">${state.evidence.includes("e_oldfile") ? "" : "先调查原始验收卷。"}</div></section>`;
  }

  function reportSelect(key, label, options) {
    return `<div class="report-field"><label for="report-${key}">${label}</label><select id="report-${key}" data-report="${key}" ${state.solved.includes("report") ? "disabled" : ""}><option value="">— 选择 —</option>${options.map(value => `<option value="${value}" ${state.report[key] === value ? "selected" : ""}>${value}</option>`).join("")}</select></div>`;
  }

  function finalProofSummary() {
    const keys = Object.keys(state.confrontation).sort((a,b) => Number(a.slice(1)) - Number(b.slice(1)));
    if (!keys.length && state.legacyCaseRecord) return `<div class="legacy-proof-record"><strong>旧版证明记录</strong><p>${escapeHtml(state.legacyCaseRecord.note || "该结案记录按旧版题序封存，不映射为新版现场复原。")}</p></div>`;
    return `<div class="final-proof-summary">${keys.map(key => { const proof=Logic.validateConfrontationAnswer(Number(key.slice(1)),state.confrontation[key]); return `<p><strong>${state.confrontation[key].map(id=>EVIDENCE[id] ? EVIDENCE[id][0] : id).join(" + ")}</strong><span>${proof.explanation || "该轮证据组合已通过校验。"}</span></p>`; }).join("")}</div>`;
  }

  function disclosureModalHtml() {
    return `<div class="eyebrow">JUDGMENT · 等待公开决定</div><h2>最后，哪些事实写入公开报告？</h2>${finalProofSummary()}<p>${state.solved.includes("p11") ? "主案与旧案责任链都已成立。" : "主案已经成立，但旧案责任链仍不完整。"}</p><div class="card-actions"><button class="btn primary" data-action="choose-disclosure" data-choice="full">提交现有全部调查</button>${state.solved.includes("p11") ? '<button class="btn ghost" data-action="choose-disclosure" data-choice="culprit-only">只报告本案刑事事实</button>' : ""}</div>`;
  }

  function chapter9() {
    const reportPassed = state.solved.includes("report");
    const resolution = Logic.caseResolutionState(state);
    return `<div class="document"><h3>案件重构报告 · CJ-0917</h3><p>报告不是材料数量检查。每一步必须能回到直接记录、实验估算或由二者形成的推论。</p></div>
    <section class="reconstruction-strip" aria-label="现场复原步骤"><article><b>19:08—19:27</b><span>工牌进入 14F 服务区</span><small>直接记录 · 服务区门控</small></article><article><b>19:16</b><span>1402 发生致命撞击</span><small>设备记录 + 现场推论</small></article><article><b>20:43 / 约20:46</b><span>经管井进入 1102 并开始放水</span><small>直接记录 + 实验估算</small></article><article><b>21:19—21:41</b><span>取出 A047、搬运尸体、开启正门</span><small>身份与路径记录</small></article><article><b>21:49</b><span>室内挂链后经检修口离开</span><small>现场痕迹 + 复原实验</small></article></section>
    <section class="puzzle"><div class="puzzle-tag">P12 · 完整案件重构</div><h2>填写十项关键事实</h2><div class="report-grid">
      ${reportSelect("deathPlace","死亡地点",["1102","1402","消防楼梯"])}
      ${reportSelect("deathTime","法医死亡判断区间",["18:34—18:40","19:16—19:18","21:41—21:45","无法判断"])}
      ${reportSelect("foundPlace","尸体发现地点",["1102","1402","物业档案室"])}
      ${reportSelect("cardUser","A047 门禁卡使用者",["林知秋","许遥","周岚","无法判断"])}
      ${reportSelect("cufflink","袖扣来源",["当晚搏斗掉落","两周前遗留","周岚伪造"])}
      ${reportSelect("sound","沈曼听见的声音",["1102 内的搏斗","14层管道结构传声","直播音频"])}
      ${reportSelect("transferReason","现场置换的直接作用",["陷害许遥","制造密室奇观","伪造1102内晚间死亡"])}
      ${reportSelect("waterStart","浴室开始放水",["约19:16","约20:46","21:41","无法估算"])}
      ${reportSelect("chainMethod","门链形成与离场",["从门缝复位门链","室内挂链后经浴室检修通道离开","一直藏在1102直到破门","无法解释"])}
      ${reportSelect("culprit","导致死亡并置换现场的人",["许遥","顾雪","梁闻","周岚"])}
      </div><button class="btn primary" data-action="validate-report">封存报告</button><div class="feedback" id="feedback-report">${reportPassed ? "报告草稿已通过一致性校验。继续完成最终举证。" : "选择会实时保存；可随时往返案件簿核对材料。"}</div></section>
      ${reportPassed && resolution === "proving" ? confrontationHtml() : resolution === "awaiting-disclosure" ? `<div class="deduction-banner pending-disclosure"><strong>最终举证已完成 · 等待公开决定</strong><span>即使关闭弹窗、刷新或离开页面，也可以从这里继续，不必重新举证。</span><button class="btn primary" data-action="continue-disclosure">继续提交报告</button></div>` : resolution === "closed" ? `<div class="deduction-banner"><strong>本周目已结案 · 结局 ${state.ending}</strong><span>${state.legacyCaseRecord ? "旧版证明记录已按原题序封存，不会套入新版门链举证。" : "举证、公开决定与结案记录均已保存。"}</span><button class="btn" data-action="view-ending">查看结局</button></div>` : ""}`;
  }

  function confrontationHtml() {
    const questions = [
      "你能证明 1402 存在。可你怎么证明林知秋死在那里？",
      "墙上的痕迹只能证明撞击。你怎么证明尸体被搬走？",
      "21:41 的记录属于林知秋。你凭什么说是我？",
      "就算卡在我手里，你怎么证明我能完成整个置换？",
      "门链是从里面挂上的。人离开后，它怎么还会保持锁闭？",
      "你已经证明本案。为什么还要翻十二年前的资料？"
    ];
    const responses = ["周岚看向桌面：“……林知秋确实是在那面墙前倒下的。”","她停了很久：“那辆车把他从 14 层送到了 11 层。”","活体认证帧停在屏幕上。她没有再说 OPS-04 只是一个账号。","“权限只能说明我能做到。”你把实际通行与轮迹并排放下。","她望向浴室方向：“检修口本来不该有人知道。”","“周屿是我哥哥。十二年了，文件里却只写他违规。”"];
    const total = state.solved.includes("p11") ? 6 : 5;
    const step = Math.min(state.confrontationStep, total - 1);
    const transcript = Object.keys(state.confrontation).sort().map((key,index) => { const proof=Logic.validateConfrontationAnswer(Number(key.slice(1)),state.confrontation[key]); return `<div class="dialogue-line"><span>第 ${index + 1} 轮闭环</span><strong>${state.confrontation[key].map(id => EVIDENCE[id][0]).join(" + ")}</strong><p>${proof.explanation || "该轮证据组合已通过校验。"}</p><blockquote>${responses[index]}</blockquote></div>`; }).join("");
    const orderedEvidence = [...state.pinnedEvidence, ...state.evidence.filter(id => !state.pinnedEvidence.includes(id))];
    const draftKey = `q${step + 1}`, draft = state.confrontationDraft[draftKey] || [], expanded = state.confrontationExpanded[draftKey] || [];
    const visibleEvidence=state.confrontationOnlySelected ? orderedEvidence.filter(id=>draft.includes(id)) : orderedEvidence;
    return `<section class="puzzle confrontation" id="current-confrontation"><div class="puzzle-tag">FINAL CONFRONTATION · ${state.confrontationStep + 1}/${total}</div><h2>周岚：“${questions[step]}”</h2><div class="confrontation-toolbar" role="region" aria-label="当前举证操作"><span id="proof-selection-count">第 ${step + 1} 轮 · 已选 ${draft.length}/3</span><button type="button" class="btn ghost" data-action="toggle-selected-proofs" aria-pressed="${state.confrontationOnlySelected}">${state.confrontationOnlySelected ? "查看全部材料" : "仅查看已选材料"}</button><button class="btn primary" data-action="validate-confrontation">出示所选材料</button></div>${transcript}<p class="muted">必要证据齐全即可通过；相关材料可以补强时间、身份或路径，无关材料仍需移除。派生材料与其引用来源不会重复计算为独立支持。</p><div class="confrontation-evidence">${visibleEvidence.map(id => { const isExpanded=expanded.includes(id), model=Logic.EVIDENCE_PROVENANCE[id]; return `<article class="evidence-choice-card ${state.pinnedEvidence.includes(id) ? "pinned" : ""}" data-proof-id="${id}"><label class="evidence-choice"><input type="checkbox" name="confrontation-evidence" value="${id}" ${draft.includes(id) ? "checked" : ""}><span class="source">${EVIDENCE[id][1]}${model && model.stage === "derived" ? " · 派生" : ""}</span><strong>${EVIDENCE[id][0]}</strong></label><button type="button" class="evidence-summary-toggle" data-action="toggle-proof-summary" data-evidence="${id}" aria-expanded="${isExpanded}">${isExpanded ? "收起摘要" : "展开摘要"}</button><p class="evidence-choice-summary" ${isExpanded ? "" : "hidden"}>${EVIDENCE[id][2]}</p></article>`; }).join("")}</div><div class="feedback" id="feedback-confrontation"></div></section>`;
  }

  function evidenceMatches(id) {
    const personMap = {
      xu: ["e_cufflink","e_cuffphoto","e_stream","e_location","e_checkin"],
      zhou: ["e_permission","e_accountmap","e_trainingaccess","e_shift","e_cardauth","e_route","e_cart","e_oldfile","e_casualty","e_hr"],
      lin: ["e_body","e_body_review","e_dna","e_water","e_waterlab","e_shelf","e_plan1102","e_fixed","e_impact","e_floor","e_watch","e_hatch","e_chain_tests","e_chaintrial","e_oldfile"],
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
    const evidenceHtml = `<div class="notebook-tools"><label>人物<select id="notebook-person"><option value="all">全部人物</option><option value="xu">许遥</option><option value="zhou">周岚</option><option value="lin">林知秋</option><option value="gu">顾雪</option><option value="liang">梁闻</option><option value="shen">沈曼</option></select></label><label>来源<select id="notebook-source"><option value="all">全部来源</option><option value="scene">现场 / 物证</option><option value="system">系统 / 记录</option><option value="plan">图纸 / 工程</option><option value="old">旧案</option></select></label><span class="meta">已钉选 ${state.pinnedEvidence.length}/3</span></div>${notebookView.returnDeduction ? '<button class="text-button notebook-back-link" data-action="return-to-deduction">← 返回原推论</button>' : ""}<div class="evidence-list">${filtered.length ? filtered.map(id => { const e = EVIDENCE[id], pinned = state.pinnedEvidence.includes(id), focused=notebookView.focusEvidence===id; return `<article class="evidence-card ${pinned ? "pinned" : ""} ${focused ? "notebook-focus" : ""}" data-notebook-evidence="${id}" tabindex="-1"><span class="source">${e[1]}</span>${ORIGIN_BADGES[id] ? `<span class="origin-badge">${ORIGIN_BADGES[id]}</span>` : ""}<h3>${e[0]}</h3><p>${e[2]}</p><button class="text-button" data-action="pin-evidence" data-evidence="${id}">${pinned ? "取消钉选" : "钉在顶部"}</button></article>`; }).join("") : '<p class="muted">当前筛选下没有材料。</p>'}</div>`;
    const deductionHtml = `<div class="evidence-list">${state.deductions.length ? state.deductions.map(id => { const d = DEDUCTIONS[id], links=(DEDUCTION_LINKS[id] || []).filter(eid => state.evidence.includes(eid)); return `<article class="evidence-card deduction-card ${notebookView.focusDeduction===id ? "notebook-focus" : ""}" data-notebook-deduction="${id}" tabindex="-1"><span class="source">DEDUCTION</span><h3>${d[0]}</h3><p>${d[1]}</p>${links.length ? `<div class="related-evidence"><strong>关联证据</strong>${links.map(eid => `<button type="button" data-action="open-related-evidence" data-evidence="${eid}" data-deduction="${id}">${EVIDENCE[eid][0]}</button>`).join("")}</div>` : ""}</article>`; }).join("") : '<p class="muted">推论必须由材料组合产生。</p>'}</div>`;
    app.innerHTML = `<section class="screen"><div class="eyebrow">CASE NOTEBOOK</div><div class="notebook-heading"><h1 class="chapter-title">案件簿</h1>${state.notebookReturn ? `<button class="btn primary" data-action="return-from-notebook">${state.notebookReturn.chapter === 9 ? "返回当前举证" : `返回第${toChinese(state.notebookReturn.chapter)}章原位置`}</button>` : ""}</div>${state.pinnedEvidence.length ? `<div class="pinned-strip">${state.pinnedEvidence.map(id => `<span class="evidence-chip">${EVIDENCE[id][0]}</span>`).join("")}</div>` : ""}<div class="notebook-tabs"><button class="${notebookView.tab === "evidence" ? "active" : ""}" data-action="notebook-tab" data-tab="evidence">案件材料 ${state.evidence.length}</button><button class="${notebookView.tab === "deductions" ? "active" : ""}" data-action="notebook-tab" data-tab="deductions">推论 ${state.deductions.length}</button></div>${notebookView.tab === "evidence" ? evidenceHtml : deductionHtml}</section>`;
    const person = document.querySelector("#notebook-person"), source = document.querySelector("#notebook-source");
    if (person) person.value = notebookView.person;
    if (source) source.value = notebookView.source;
    updateHeader();
    requestAnimationFrame(()=>{
      const selector=notebookView.tab === "evidence" && notebookView.focusEvidence ? `[data-notebook-evidence="${notebookView.focusEvidence}"]` : notebookView.tab === "deductions" && notebookView.focusDeduction ? `[data-notebook-deduction="${notebookView.focusDeduction}"]` : "";
      const node=selector && document.querySelector(selector);
      if (node) { node.scrollIntoView({block:"center"}); node.focus({preventScroll:true}); }
    });
  }

  function renderTimeline() {
    topbar.hidden = false;
    state.screen = "timeline";
    const solved = id => state.solved.includes(id);
    const has = id => state.evidence.includes(id);
    const events = [
      { time:"17:32", text:"许遥与林知秋在公司争吵", source:"公开监控", type:"direct", known:true },
      { time:"18:34", text:"林知秋抵达临江壹号", source:"停车场记录", type:"direct", known:true },
      { time:"19:03", text:Number(state.interviews.guxue || 0) >= 3 ? "顾雪在停车场再次见到林知秋" : "该时段尚待外查", source:"顾雪复制日志", type:"direct", known:Number(state.interviews.guxue || 0) >= 3 },
      { time:"19:08—19:27", text:has("e_route") ? "ZL-017 工牌进出 14F 服务区" : "14F 服务区通行待核验", source:"服务区门控原始记录", type:"direct", known:has("e_route") },
      { time:has("e_watch") ? "19:16" : "时间待核验", text:solved("p05") ? "剧烈冲击发生在 1402" : "记录到剧烈冲击与心率急降", source:solved("p05") ? "手表记录 + 1402 撞击痕" : "智能手表", type:solved("p05") ? "inference" : "direct", known:has("e_watch") },
      { time:has("e_body_review") ? "19:16—19:18" : has("e_body") ? "19:00—20:00" : "区间待初检", text:has("e_body_review") ? "联合复核收窄死亡判断区间" : "尸表初检给出宽泛死亡区间", source:has("e_body_review") ? "派生材料 · 引用初检、手表与现场" : "尸表初检", type:has("e_body_review") ? "inference" : "estimate", known:has("e_body") },
      { time:"19:31—22:31", text:solved("p02") ? "许遥连续处于建筑论坛会场" : "许遥的会场记录待核验", source:"直播、位置与会场三种来源", type:"direct", known:solved("p02") },
      { time:"20:43—20:50", text:has("e_route") ? "ZL-017 工牌进出 11F 管井走廊" : "11F 管井走廊通行待核验", source:"服务区门控原始记录", type:"direct", known:has("e_route") },
      { time:has("e_waterlab") ? "约20:46" : "约?", text:has("e_waterlab") ? "1102 浴室开始按现场流量放水" : "浴室放水开始时间待复现", source:"浴室渗漏复现实验", type:"estimate", known:has("e_waterlab") },
      { time:"21:19", text:has("e_cardauth") ? "活体认证确认周岚取出 A047" : has("e_cardlog") ? "OPS-04 账号取出 A047，身份待核验" : "A047 取出记录待核验", source:has("e_cardauth") ? "卡柜日志 + 活体认证" : "卡柜原始日志", type:"direct", known:has("e_cardlog") },
      { time:"21:37", text:has("e_route") ? "服务梯从 14F 下行至 11F" : "搬运路径待核验", source:"服务梯控制记录", type:"direct", known:has("e_route") },
      { time:"21:41", text:"A047 开启 1102", source:"1102 门禁原始记录", type:"direct", known:has("e_access") },
      { time:"21:49", text:has("e_route") ? "ZL-017 工牌从 11F 管井走廊离开" : "离场路径待核验", source:"服务区门控原始记录", type:"direct", known:has("e_route") },
      { time:"22:36", text:"楼下报告渗水", source:"物业工单", type:"direct", known:true },
      { time:"22:47", text:"破门发现尸体与室内门链", source:"出警记录", type:"direct", known:true }
    ];
    const labels={direct:"直接记录",estimate:"实验估算",inference:"证据推论"};
    app.innerHTML = `<section class="screen"><div class="eyebrow">VERIFIED TIMELINE</div><h1 class="chapter-title">案件时间线</h1><p class="lead">每条事件都标明证据层级；直接记录、实验估算和推论不会混写。未确认项目保持灰色，不补入精确行为人。</p><div class="timeline-list dynamic-timeline">${events.map(event => `<div class="timeline-item ${event.known ? "known" : "unknown"} timeline-${event.type}"><span><strong>${event.time}</strong> · ${event.known ? event.text : "??? · " + event.text}<br><small class="timeline-kind ${event.type}">${labels[event.type]}</small><small class="muted">${event.source}</small></span></div>`).join("")}</div></section>`;
    updateHeader();
  }

  function renderMap() {
    topbar.hidden = false;
    state.screen = "map";
    const floors = [["external","外部"],["14","14F"],["11","11F"],["1","1F"],["property","物业"]];
    const rooms = [
      ["external",2,"建筑论坛会场","连续在场证明"], ["external",4,"市档案馆","建筑档案比对"],
      ["11",1,"1102","尸体发现现场"], ["11",3,"1102 复测","空间尺寸复核"],
      ["14",5,state.solved.includes("p04") ? "1402" : state.solved.includes("p03") ? "封闭区域" : "14F 住户区",state.solved.includes("p04") ? "房号已从旧图恢复" : state.solved.includes("p03") ? "尺寸异常后出现待查空间" : "尚无异常记录"],
      ["1",6,"门禁服务器室","A047 原始日志"], ["property",7,"询问室","六名相关人员"], ["property",8,"物业办公室","权限与旧案"], ["property",9,"案件分析室","最终报告"]
    ].filter(([floor]) => floor === mapFloor);
    const floorVisual = mapFloor === "14" ? `<div class="floor-plan-reveal ${state.solved.includes("p04") ? "revealed" : ""}"><span>14F-A</span><span>${state.solved.includes("p04") ? "1402" : state.solved.includes("p03") ? "████" : "住户区"}</span><span>14F-C</span></div>` : "";
    app.innerHTML = `<section class="screen"><div class="eyebrow">LOCATION DIRECTORY</div><h1 class="chapter-title">建筑地图</h1><div class="map-layout"><nav class="floor-tabs">${floors.map(([id,label]) => `<button class="${mapFloor===id?"active":""}" data-action="map-floor" data-floor="${id}">${label}</button>`).join("")}</nav><div class="building-map">${floorVisual}${rooms.map(([,no,name,desc]) => `<button class="map-room" data-action="go-chapter" data-chapter="${no}" ${Logic.chapterUnlocked(state,no)?"":"disabled"}><strong>${name}</strong><small>${desc}</small></button>`).join("")}</div></div></section>`;
    updateHeader();
  }

  function renderEnding(id) {
    topbar.hidden = true;
    state.screen = `ending-${id}`;
    const endings = {
      A: ["ENDING A · 正确答案","正确答案","周岚承认 19:16 的冲突与之后的现场置换，主案证据链完整闭合。你找到了从系统中消失的房间，却没有查全十二年前的原始卷宗与人员关系；2014 年事故只留下待复核标记，尚未进入公开追责程序。"],
      B: ["ENDING B · 完美证据","完美证据","你指认许遥，却无法让他同时出现在论坛和 1102。案件因证据链自相矛盾而搁置。三年后，一封匿名邮件抵达：你一直在寻找进入房间的方法。可你有没有想过——为什么一定是那个房间？"],
      C: ["ENDING C · 不存在的房间","不存在的房间","周岚因致人死亡与毁灭证据被捕。你找到了 1402，却把旧案材料排除在结案报告之外。十二年前的事故仍被写作“工人违规”。她在审讯室只问：所以你找到了杀人的地方。然后呢？"],
      D: ["ENDING D · 正确的问题","正确的问题","墙面少掉的十三厘米，最终撬开了十二年的沉默。开发商、监理与设计团队重新接受调查，遇难者姓名第一次出现在公开更正里。标题页上的“错层”被划去——推理的终点从来不是找到一个人，而是终于问对了问题。"]
    };
    const epilogues = {
      A: [["许遥","论坛录像成为排除证据，他重新整理林知秋留下的建筑史手稿。"],["顾雪","因越权复制接受处分，也成为旧案重启后的第一名证人。"],["周岚","等待审判，同时把哥哥的姓名交回公开档案。"]],
      B: [["许遥","嫌疑没有被正式撤销，职业生涯停在那场直播之后。"],["顾雪","复制文件被当作无关违规封存。"],["周岚","继续管理那栋没有 1402 的建筑。"]],
      C: [["梁闻","报道只能停在本案，旧事故仍沿用十二年前的结论。"],["沈曼","终于知道自己听见的声音从何而来。"],["周岚","她等到的只是一个正确地点。"]],
      D: [["顾雪","以复制日志补上林知秋最后一段行程。"],["梁闻","用附件摘要公开责任链，并保护了最初的消息来源。"],["沈曼","她的证词从“1102 有人”改成了真正听见的事实。"],["周岚","她没能逃避本案责任，但十二年前的死者终于不再为事故负责。"]]
    };
    const [label,title,copy] = endings[id];
    const critique = id === "B" ? `<section class="theory-autopsy"><h2>报告内部自洽度不足</h2><div><b>× 连续在场</b><span>19:40—22:20 直播、位置与会场记录封闭了许遥的往返窗口。</span></div><div><b>× 地点前提</b><span>1402 的撞击、血迹与搬运痕迹不支持 1102 是死亡第一现场。</span></div><div><b>× 门卡解释</b><span>21:41 只证明 A047 开门，不证明登记持卡人亲自进入。</span></div></section>` : "";
    app.innerHTML = `<section class="ending"><div class="ending-letter">${label}</div><h1 class="${id === "D" ? "title-shift" : ""}">${title}</h1><p class="ending-copy">${copy}</p>${critique}<div class="epilogue-grid">${epilogues[id].map(([name,text]) => `<article><strong>${name}</strong><p>${text}</p></article>`).join("")}</div><p class="muted">已收集 ${state.evidence.length} 条材料 · 关键证人突破 ${Logic.CORE_INTERVIEWS.filter(x => Number(state.interviews[x] || 0) >= 3).length}/4 · 结局档案 ${state.meta.endings.join(" / ")}</p><div class="ending-actions"><button class="btn primary" data-action="review-case">返回案件总览</button><button class="btn ghost" data-action="confirm-new">开始新周目</button></div></section>`;
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
    if (action === "show-home" || action === "review-case") { state.notebookReturn=null; saveState(true); renderHome(); }
    if (action === "show-map") renderMap();
    if (action === "show-notebook") {
      const chapterMatch = /^chapter-(\d+)$/.exec(state.screen);
      if (chapterMatch) {
        const chapter = Number(chapterMatch[1]);
        const fallbackAnchor = chapter === 9 ? (document.querySelector("#current-confrontation") ? "#current-confrontation" : "[data-report]") : "";
        state.notebookReturn = {
          chapter,
          anchor: target.dataset.returnAnchor || fallbackAnchor,
          focus: target.dataset.returnFocus || "",
          scrollY: window.scrollY
        };
      }
      if (target.dataset.evidence && EVIDENCE[target.dataset.evidence]) {
        notebookView.tab="evidence";
        notebookView.person="all";
        notebookView.source="all";
        notebookView.focusEvidence=target.dataset.evidence;
        notebookView.returnDeduction=false;
      }
      saveState(true);
      renderNotebook();
    }
    if (action === "return-from-notebook") {
      const returnState = state.notebookReturn || { chapter: state.chapter, anchor: "", focus: "", scrollY: 0 };
      state.notebookReturn = null;
      saveState(true);
      renderChapter(returnState.chapter);
      requestAnimationFrame(() => {
        const anchor = returnState.anchor && document.querySelector(returnState.anchor);
        if (anchor) anchor.scrollIntoView({ block:"center" });
        else window.scrollTo({ top:Number(returnState.scrollY || 0), behavior:"instant" });
        const focus = returnState.focus && document.querySelector(returnState.focus);
        if (focus) focus.focus({ preventScroll:true });
      });
    }
    if (action === "show-timeline") renderTimeline();
    if (action === "save-game") saveState(false);
    if (action === "close-modal") closeModal();
    if (action === "go-chapter") { state.notebookReturn=null; renderChapter(Number(target.dataset.chapter)); }
    if (action === "continue-interlude") { state.interludeSeen = true; saveState(true); renderChapter(8); }
    if (action === "map-floor") { mapFloor = target.dataset.floor; renderMap(); }
    if (action === "notebook-tab") { notebookView.tab = target.dataset.tab; notebookView.focusEvidence = null; notebookView.focusDeduction = null; notebookView.returnDeduction = false; renderNotebook(); }
    if (action === "open-related-evidence") {
      notebookView.tab = "evidence";
      notebookView.person = "all";
      notebookView.source = "all";
      notebookView.focusEvidence = target.dataset.evidence;
      notebookView.focusDeduction = target.dataset.deduction;
      notebookView.returnDeduction = true;
      renderNotebook();
    }
    if (action === "return-to-deduction") {
      notebookView.tab = "deductions";
      notebookView.focusEvidence = null;
      notebookView.returnDeduction = false;
      renderNotebook();
    }
    if (action === "pin-evidence") {
      const id = target.dataset.evidence;
      if (state.pinnedEvidence.includes(id)) state.pinnedEvidence = state.pinnedEvidence.filter(x => x !== id);
      else if (state.pinnedEvidence.length < 3) state.pinnedEvidence.push(id);
      else { toast("最多钉选三条材料"); return; }
      saveState(true); renderNotebook();
    }
    if (action === "show-prologue") openModal(`<div class="eyebrow">CASE BRIEF</div><h1>临江壹号死亡案</h1><p class="lead">2026 年 9 月 17 日 22:47，建筑设计师林知秋被发现死在从内部反锁的 1102。</p><div class="document"><p><strong>21:41</strong> 林知秋的 A047 门禁卡开启 1102。</p><p><strong>19:40—22:20</strong> 头号嫌疑人许遥在十四公里外公开演讲。</p><p><strong>询问规则</strong> 初查尚未发现一句可直接证伪的纯假证词。真话是否完整，仍需独立来源检验。</p><p><strong>问题</strong> 证据证明许遥是凶手，时间证明他不可能是凶手。</p></div><div class="card-actions"><button class="btn primary" data-action="close-modal">开始思考</button></div>`);
    if (action === "confirm-new") openModal(`<h2>重新开始案件？</h2><p class="muted">当前周目会清空，但已解锁的结局档案会保留。</p><div class="card-actions"><button class="btn danger-btn" data-action="reset-run">确认重新开案</button><button class="btn" data-action="close-modal">取消</button></div>`);
    if (action === "reset-run") { closeModal(); resetRun(); }

    if (action === "examine") {
      const id = target.dataset.id;
      if (!state.examined.includes(id)) state.examined.push(id);
      addEvidence(...target.dataset.evidence.split(","));
      saveState(true); renderChapterPreserving(`[data-action="examine"][data-id="${id}"]`);
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
      const result = Logic.evaluateTheory(state.currentTheory,state);
      const node = document.querySelector("#feedback-theory");
      node.className = "feedback theory-check-results";
      node.innerHTML = `<section class="theory-state conflict"><strong>● 与证据矛盾</strong>${result.conflicts.length ? `<ul>${result.conflicts.map(x=>`<li>${x}</li>`).join("")}</ul>` : "<p>暂未发现直接冲突。</p>"}</section><section class="theory-state support"><strong>● 已有证据支持</strong>${result.support.length ? `<ul>${result.support.map(x=>`<li>${x}</li>`).join("")}</ul>` : "<p>当前还没有正面支持。</p>"}</section><section class="theory-state missing"><strong>● 尚未得到证明</strong>${result.missing.length ? `<ul>${result.missing.map(x=>`<li>${x}</li>`).join("")}</ul>` : "<p>没有未补足的关键项。</p>"}</section>${result.canSubmitFailure ? '<div class="card-actions"><button class="btn danger-btn" data-action="ending-b">无视冲突并提交内部不足报告</button></div>' : ""}`;
    }
    if (action === "ending-b") { closeModal(); state = Logic.recordEnding(state,"B"); saveState(true); renderEnding("B"); }
    if (action === "adjust-measure") {
      const input=document.querySelector(`[data-measure="${target.dataset.kind}"]`), delta=Number(target.dataset.delta || 0);
      if (input) { input.value=String(Math.max(Number(input.min),Math.min(Number(input.max),Number(input.value)+delta))); input.dispatchEvent(new Event("input",{bubbles:true})); target.focus({preventScroll:true}); }
    }
    if (action === "lock-p03-measure") {
      const photo = Number(document.querySelector('[data-measure="photo"]').value), plan = Number(document.querySelector('[data-measure="plan"]').value);
      const difference = plan - photo;
      if (Math.abs(photo - 83) <= 2 && Math.abs(plan - 96) <= 2 && Math.abs(difference - 13) <= 2) { addEvidence("e_shelf","e_plan1102"); state.factAnswers.p03Phase = 2; saveState(true); renderChapter(3); }
      else wrong("feedback-p03","允许单项 ±2 cm，但两次读数仍应形成约 13 cm 的稳定差值。可用滑块旁的 ±1 按钮微调。 ");
    }
    if (action === "lock-p03-explanation") {
      const value = chosen("p03-explanation");
      if (["furniture","perspective","room"].includes(value)) { state.factAnswers.p03Explanation = value; state.factAnswers.p03Phase = 3; saveState(true); renderChapter(3); }
      else wrong("feedback-p03","先暂存一个解释。此处不会判对错，下一份固定结构材料才负责裁决。 ");
    }
    if (action === "run-p03-fixed") {
      if (chosen("p03-fixed") === "window") { addEvidence("e_fixed"); state.factAnswers.p03Phase = 4; saveState(true); renderChapter(3); }
      else wrong("feedback-p03","复核点必须不可移动，并且能同时在现场照片和竣工图中定位。 ");
    }
    if (action === "solve-p03") {
      if (chosen("p03-conclusion") === "room" && state.evidence.includes("e_fixed")) { solve("p03","d_dimension"); renderChapter(3); }
      else wrong("feedback-p03","固定结构复核已经排除家具移动与单纯透视；请让最终结论服从新取得的材料。 ");
    }
    if (action === "select-blueprint") {
      if (target.dataset.stage === "1") state.factAnswers.p04First = target.dataset.id;
      if (target.dataset.stage === "2") state.factAnswers.p04Second = target.dataset.id;
      saveState(true); renderChapter(4);
    }
    if (action === "confirm-p04-first") {
      if (state.factAnswers.p04First === "2012") { state.factAnswers.p04Phase = 2; saveState(true); renderChapter(4); }
      else wrong("feedback-p04","题目要找“最早”明确出现中部独立房间的原始来源，而不是任意一张仍保留房号的后续图。 ");
    }
    if (action === "confirm-p04-second") {
      if (state.factAnswers.p04Second === "2019") { state.factAnswers.p04Phase = 3; saveState(true); renderChapter(4); }
      else wrong("feedback-p04","继续按年份寻找第一次不再显示中部房号的版本；2026 已经是后续结果。 ");
    }
    if (action === "solve-p04") {
      const changes = checked("p04-change"), expected = ["number","door","wall-kept","pipe"];
      if (state.factAnswers.p04First === "2012" && state.factAnswers.p04Second === "2019" && changes.length === 4 && expected.every(id => changes.includes(id))) { addEvidence("e_plan2012","e_plan2019"); solve("p04","d_1402"); setFeedback("feedback-p04","房号与正式门位消失，但承重边界和管井仍在：被注销的是编号，不是空间。",true); }
      else wrong("feedback-p04","需要一份能证明原始空间的早期来源，以及一份首次抹去房号的变更来源。 ");
    }
    if (action === "find-diff") {
      const id = target.dataset.diff;
      if (!state.mirrorFound.includes(id)) state.mirrorFound.push(id);
      saveState(true); renderChapter(5);
    }
    if (action === "solve-p05") {
      const result = Logic.validateEvidenceSet(checked("p05-proof"), ["impact","drag"], [{ all:["impact","drag"], exact:true }]);
      if (result.ok) { solve("p05","d_mirror",["e_impact","e_floor","e_watch"]); renderChapter(5); }
      else wrong("feedback-p05",result.reason);
    }
    if (action === "run-body-review") {
      const prerequisites = ["e_body","e_watch","e_impact"];
      if (state.solved.includes("p05") && prerequisites.every(id => state.evidence.includes(id))) {
        solve("p05r","d_body_review",["e_body_review"]);
        renderChapter(5);
        setFeedback("feedback-body-review","联合复核完成：精确死亡区间与伤情地点对应现已生成，并明确引用三份前置材料。",true);
      } else wrong("feedback-body-review","联合复核尚缺尸表初检、设备冲击记录或隐蔽现场撞击痕，不能提前生成高级结论。 ");
    }
    if (action === "save-p05-observations") { state.factAnswers.p05ObservationsSaved = true; saveState(true); renderChapter(5); }
    if (action === "resume-p05-observation") { state.factAnswers.p05ObservationsSaved = false; saveState(true); renderChapter(5); }
    if (action === "set-view-floor") { state.factAnswers.viewFloor = Number(target.dataset.floor); state.factAnswers.viewedFloors = [...new Set([...(state.factAnswers.viewedFloors || []),String(target.dataset.floor)])]; saveState(true); renderChapter(5); }
    if (action === "solve-p06") {
      if (Number(state.factAnswers.viewFloor) === 14 && ["11","12","14"].every(n => (state.factAnswers.viewedFloors || []).includes(n))) { solve("p06",null,["e_window"]); setFeedback("feedback-p06","三层视角已逐一排除：11F 与 12F 被女儿墙截断，只有 14F 能形成照片中的俯角。",true); }
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
      if (topics.length === 2 && topics.includes(person.requiredTopic)) {
        const other = topics.find(x => x !== person.requiredTopic);
        const routeText = other === "复制资料" ? "顾雪回避了设备接入细节；公司日志成为可调查的新方向。" : other === "离开公司" ? "她承认“离开公司”只描述地点，不描述之后的会面。" : other === "消息来源" ? "梁闻强调来源许可，暗示“收到”与“可发表”不是一回事。" : other === "旧案报道" ? "报道选题与附件时间产生交叉，需要调取校验摘要。" : other === "保险与债务" ? "债务只能构成动机，需要核对受益人草稿。" : `已从“${other}”方向补全原话的语境。`;
        const lead = id === "guxue" ? "查询 19:00 后公司停车场设备连接与复制记录。" : id === "liangwen" ? "调取被删附件的校验摘要与接收时间。" : id === "chengyi" ? "调取保险受益人变更草稿。" : null;
        state.interviewData[id] = { topics, routeText, lead, leadAttempts: [] };
        state.interviews[id] = 1; closeModal(); saveState(true); renderChapter(7);
      }
      else setFeedback("feedback-interview","请选择两个话题，其中必须包含能检验这句话边界的行程、通信或记录方向。",false);
    }
    if (action === "investigate-lead") {
      const id = target.dataset.person, person = INTERVIEWS[id], route = target.dataset.route, data = state.interviewData[id] || {};
      data.leadAttempts = [...new Set([...(data.leadAttempts || []),route])]; state.interviewData[id] = data;
      if (LEAD_ROUTES[id] && route === LEAD_ROUTES[id].correct && person.unlock) addEvidence(person.unlock);
      saveState(true); renderChapter(7);
    }
    if (action === "submit-interview-kind") {
      const id = target.dataset.person, value = chosen("interview-kind");
      if (value === INTERVIEWS[id].kind) { state.interviews[id] = 2; closeModal(); saveState(true); renderChapter(7); }
      else setFeedback("feedback-interview", value === "lie" ? "原话并非可直接证伪的谎言。检查它省略了限定，还是把判断当成事实。" : "这项分类无法准确描述原话的语言漏洞。",false);
    }
    if (action === "submit-interview-evidence") {
      const id = target.dataset.person, evidence = chosen("interview-evidence");
      if (evidence === INTERVIEWS[id].evidence) {
        state.interviews[id] = 3; if (Logic.coreInterviewsComplete(state) && !state.solved.includes("interviews-core")) state.solved.push("interviews-core"); saveState(true);
        const objections = { guxue:"“设备记录只能说明有人接入过。”", liangwen:"“校验摘要不等于文章可以发表。”", chengyi:"“缺钱并不等于我会从保险获利。”", shenman:"“我只说我听见了，并没有亲眼看见楼层。”", zhoulan:"“这只能证明有人从另一套系统取了卡。”", xuyoa:"“那张照片本来就早于案发。”" };
        modalContent.innerHTML = `<div class="eyebrow">ROUND 3 · 连续反应</div><h2>${INTERVIEWS[id].name}</h2><div class="witness-scene"><p class="investigator-line">你出示：【${EVIDENCE[evidence][0]}】</p><blockquote>${objections[id]}</blockquote><p class="proof-answer">材料限定的是记录能够证明的事实，不替你补写行为人或时间。</p><blockquote class="reveal-quote">“${INTERVIEWS[id].reveal}”</blockquote></div><p class="muted">这不是推翻一句假话，而是用外部来源迫使证人补全原先省略或误判的部分。</p><button class="btn primary" data-action="record-interview">记录完整证词</button>`;
      }
      else setFeedback("feedback-interview","这条材料不能直接迫使证人补全当前省略或修正当前推测。",false);
    }
    if (action === "record-interview") { closeModal(); renderChapter(7); }
    if (action === "solve-p09") {
      const result = Logic.validateEvidenceSet(checked("p09"), ["e_cufflink","e_cuffphoto"], [{ all:["e_cufflink","e_cuffphoto"], exact:true }]);
      if (result.ok) { solve("p09","d_cuff"); setFeedback("feedback-p09","灰尘说明遗留已久，带日期的照片提供独立时间锚点。",true); }
      else wrong("feedback-p09",result.reason);
    }
    if (action === "toggle-matrix-rationale") { const id=target.dataset.person; state.matrixExpanded = state.matrixExpanded.includes(id) ? state.matrixExpanded.filter(x=>x!==id) : [...state.matrixExpanded,id]; saveState(true); const selector=window.matchMedia("(max-width: 700px)").matches ? `[data-person-card="${id}"]` : `[data-person-row="${id}"]`; renderChapterPreserving(selector); }
    if (action === "solve-p10") {
      state.zhouConditions = checked("zhou-condition");
      const result = Logic.validateExclusionMatrix(state.exclusionAnswers,state.zhouConditions,state);
      if (result.ok) { solve("p10","d_access"); renderChapter(8); }
      else wrong("feedback-p10",result.unsupportedPeople.length ? `有 ${result.unsupportedPeople.length} 名候选人的排除理由尚未获得对应来源；权限、行程和卡片接触不能互相替代。` : result.unsupportedConditions.length ? `周岚的四项条件中仍有 ${result.unsupportedConditions.length} 项处于“证据不足”；继续核验岗位、权限、通行窗口或 A047 身份链。` : result.wrongPeople.length ? `仍有 ${result.wrongPeople.length} 人的主要排除理由与现有材料不匹配。点击“为什么？”复核。` : `还缺 ${result.missingConditions.length} 个必须同时成立的条件。`);
    }
    if (action === "move-reconstruction") {
      const id=target.dataset.step, from=state.reconstructionOrder.indexOf(id), to=Math.max(0,Math.min(state.reconstructionOrder.length-1,from+Number(target.dataset.delta)));
      if (from >= 0 && from !== to) {
        const labels={water:"放水",card:"取卡",transfer:"搬运",chain:"挂链",leave:"离开"};
        const next=[...state.reconstructionOrder];
        [next[from],next[to]]=[next[to],next[from]];
        state.reconstructionOrder=next;
        state.factAnswers.reconstructionAnnouncement=`${labels[id]}已移至第 ${to + 1} 步`;
        saveState(true);
        const newDelta = to === 0 ? "1" : to === next.length - 1 ? "-1" : target.dataset.delta;
        renderChapter(8);
        requestAnimationFrame(() => {
          const button=document.querySelector(`[data-reconstruction-step="${id}"] [data-action="move-reconstruction"][data-delta="${newDelta}"]:not([disabled])`);
          const card=document.querySelector(`[data-reconstruction-step="${id}"]`);
          (button || card)?.scrollIntoView({block:"center"});
          button?.focus({preventScroll:true});
        });
      }
    }
    if (action === "validate-reconstruction") {
      const result=Logic.validateSceneReconstruction(state.reconstructionOrder,state.reconstructionSources,state.reconstructionSupport,state);
      if (result.ok) {
        state.legacyReconstruction=false;
        solve("p10r","d_reconstruction",["e_chaintrial"]);
        renderChapter(8);
        setFeedback("feedback-reconstruction","五个步骤的顺序、主要依据与时间／路径补充均闭合。替代顺序的失败原因已写入复原记录。",true);
      } else wrong("feedback-reconstruction",result.reason);
    }
    if (action === "select-chain-file") { state.factAnswers.selectedChainFile = target.dataset.file; saveState(true); renderChapterPreserving(`[data-action="select-chain-file"][data-file="${target.dataset.file}"]`); }
    if (action === "assign-chain-file") { if (state.factAnswers.selectedChainFile) state.chainFiles[target.dataset.actor] = state.factAnswers.selectedChainFile; saveState(true); renderChapterPreserving(`[data-action="assign-chain-file"][data-actor="${target.dataset.actor}"]`); }
    if (action === "choose-chain-action") { state.chainAnswers[target.dataset.actor] = target.dataset.value; saveState(true); renderChapterPreserving(`[data-action="choose-chain-action"][data-actor="${target.dataset.actor}"][data-value="${target.dataset.value}"]`); }
    if (action === "solve-p11") {
      const result = Logic.validateResponsibilityPuzzle(state.chainFiles,state.chainAnswers);
      const privateProof = Logic.validateEvidenceSet(checked("p11-private"), ["e_casualty","e_hr"], [{ all:["e_casualty","e_hr"], exact:true }]);
      if (result.ok && privateProof.ok && state.evidence.includes("e_oldfile")) { solve("p11","d_oldcase"); addDeduction("d_private"); setFeedback("feedback-p11","责任链与私人联系均成立：周屿是旧案遇难者，也是周岚的哥哥。",true); }
      else wrong("feedback-p11",!state.evidence.includes("e_oldfile") ? "先调查 2014 原始验收卷。" : !result.ok ? `卷宗连接仍有 ${result.fileWrong.length} 处、行为连接仍有 ${result.actionWrong} 处不符；从每张文件的发文主体和动词核对。` : "责任链已经成立；私人联系还需要死亡名单与人事档案两种独立人员记录共同证明。");
    }
    if (action === "validate-report") {
      document.querySelectorAll("[data-report]").forEach(node => state.report[node.dataset.report] = node.value);
      const result = Logic.validateReport(state.report,state);
      if (result.ok) { if (!state.solved.includes("report")) state.solved.push("report"); addDeduction("d_reconstruction"); saveState(true); renderChapter(9); setFeedback("feedback-report","十项事实均有来源且互相兼容。现场复原通过一致性校验。",true); }
      else wrong("feedback-report",`报告尚未闭合：${result.categories.length ? result.categories.join("、") : "存在未完成项目"}。请回看对应材料的来源与证据层级，不必逐项盲猜。`);
    }
    if (action === "toggle-proof-summary") {
      const card = target.closest(".evidence-choice-card"), summary = card && card.querySelector(".evidence-choice-summary");
      if (summary) {
        const key=`q${state.confrontationStep + 1}`, id=target.dataset.evidence;
        const expanded=state.confrontationExpanded[key] || [];
        state.confrontationExpanded[key]=expanded.includes(id) ? expanded.filter(value=>value!==id) : [...expanded,id];
        summary.hidden = !summary.hidden;
        target.textContent = summary.hidden ? "展开摘要" : "收起摘要";
        target.setAttribute("aria-expanded",String(!summary.hidden));
        saveState(true);
      }
    }
    if (action === "toggle-selected-proofs") {
      const key=`q${state.confrontationStep + 1}`, draft=state.confrontationDraft[key] || [];
      if (!state.confrontationOnlySelected && !draft.length) { toast("尚未选择材料"); return; }
      state.confrontationOnlySelected=!state.confrontationOnlySelected;
      saveState(true);
      renderChapter(9);
      requestAnimationFrame(()=>document.querySelector("#current-confrontation")?.scrollIntoView({block:"start"}));
    }
    if (action === "validate-confrontation") {
      const evidence = checked("confrontation-evidence"), step = state.confrontationStep + 1;
      const result = Logic.validateConfrontationAnswer(step,evidence), total = state.solved.includes("p11") ? 6 : 5;
      if (result.ok) {
        state.confrontation[`q${step}`] = evidence;
        delete state.confrontationDraft[`q${step}`];
        state.confrontationStep += 1;
        state.confrontationOnlySelected=false;
        saveState(true);
        if (state.confrontationStep >= total) { solve("p12"); renderChapter(9); openModal(disclosureModalHtml()); }
        else renderChapter(9);
      } else {
        wrong("feedback-confrontation",result.reason || "这组材料不能直接回答当前质疑。 ");
        const feedback=document.querySelector("#feedback-confrontation");
        if (feedback) feedback.insertAdjacentHTML("beforeend",'<div><button class="text-button" data-action="show-notebook">打开案件簿核对现有材料</button></div>');
      }
    }
    if (action === "continue-disclosure") openModal(disclosureModalHtml());
    if (action === "view-ending" && state.ending) renderEnding(state.ending);
    if (action === "choose-disclosure") {
      const ending = Logic.determineEnding(state,target.dataset.choice);
      state = Logic.recordEnding(state,ending); saveState(true); closeModal(); renderEnding(ending);
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
    if (event.target.dataset.exclusionInput) {
      const id=event.target.dataset.exclusionInput;
      state.exclusionAnswers[id]=event.target.value;
      document.querySelectorAll(`[data-exclusion-input="${id}"]`).forEach(node => { node.value=event.target.value; });
      saveState(true);
    }
    if (event.target.name === "zhou-condition") { state.zhouConditions=checked("zhou-condition"); saveState(true); }
    if (event.target.dataset.report) { state.report[event.target.dataset.report]=event.target.value; saveState(true); }
    if (event.target.dataset.reconstructionSource) {
      state.reconstructionSources[event.target.dataset.reconstructionSource]=event.target.value;
      const lookup=event.target.closest("[data-reconstruction-step]")?.querySelector('[data-action="show-notebook"]');
      if (lookup) lookup.dataset.evidence=event.target.value;
      saveState(true);
    }
    if (event.target.dataset.reconstructionSupport) { state.reconstructionSupport[event.target.dataset.reconstructionSupport]=event.target.value; saveState(true); }
    if (event.target.name === "confrontation-evidence") {
      const key=`q${state.confrontationStep + 1}`;
      let values=checked("confrontation-evidence");
      if (values.length > 3) { event.target.checked=false; toast("每轮最多组合三条材料"); values=checked("confrontation-evidence"); }
      state.confrontationDraft[key]=values;
      saveState(true);
      const count=document.querySelector("#proof-selection-count");
      if (count) count.textContent=`第 ${state.confrontationStep + 1} 轮 · 已选 ${values.length}/3`;
    }
  });

  document.addEventListener("input", event => {
    if (event.target.dataset.measure) {
      const kind = event.target.dataset.measure, value = Number(event.target.value);
      state.factAnswers[kind === "photo" ? "photoMeasure" : "planMeasure"] = value;
      const photo = Number(document.querySelector('[data-measure="photo"]')?.value || 0), plan = Number(document.querySelector('[data-measure="plan"]')?.value || 0);
      const output = document.querySelector(`#${kind}-output`); if (output) output.textContent = `${value} cm`;
      const result = document.querySelector(`#result-${kind}`); if (result) result.textContent = value;
      const diff = document.querySelector("#result-diff"); if (diff) diff.textContent = Math.abs(plan-photo);
    }
  });

  modal.addEventListener("click", event => { if (event.target === modal) closeModal(); });
  modal.addEventListener("close", () => {
    if (Logic.caseResolutionState(state) === "awaiting-disclosure" && state.screen === "chapter-9") renderChapter(9);
  });
  window.addEventListener("beforeunload", () => { if (state.started) saveState(true); });
  renderLanding();
})();
