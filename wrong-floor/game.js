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
    { title: "知道还不够", subtitle: "知道 1402 的人不止一个。真正的问题，是谁同时拥有让它重新成为现场的条件。", objective: "用知识、权限、时间、行为交集锁定置换者，并区分事后处置与致命冲突。" },
    { title: "密室是怎么制造的", subtitle: "先别问谁逃出了密室。把每一步放回记录允许的位置。", objective: "复现放水、取卡、搬运、挂链与离场，并逐步连接材料。" },
    { title: "错误的问题", subtitle: "本案事实已经闭合。最后决定：你要回答谁的问题，又要让哪些事实走出这栋楼。", objective: "核对报告、回应核心质询，并决定公开范围。" }
  ];

  const EVIDENCE = {
    e_lock: ["门锁状态", "现场·观察", "1102 门链从室内挂上；电子锁无撬动。破门前无法从外侧复位门链。"],
    e_access: ["21:41 A047 认证日志", "门锁认证·原始记录", "21:41:08，A047 凭证认证通过，1102 锁舌释放。它只能证明卡完成认证，不能证明门扇真的打开、谁通过、方向或携带物。"],
    e_doorcontact: ["1102 门磁开合记录", "门磁·原始记录", "21:41:10 门扇打开，21:41:32 关闭；之后至 22:47 破门前无再次开合。连续心跳与相邻事件序号完整，现场测试正常。它不能单独证明通过者身份、方向或携带物。"],
    e_body: ["尸表初检", "法医·初检", "后枕部存在钝性撞击伤，尸体周围缺少相应血迹与喷溅；依据尸体现象只能初步判断死亡约在 19:00—20:00。"],
    e_body_review: ["伤情与设备联合复核", "法医·派生复核", "引用尸表初检、智能手表与隐蔽现场撞击痕：伤口形态与墙内结构件吻合；结合 19:16:21 冲击、心率急降及尸体现象，将死亡判断缩至 19:16—19:18。"],
    e_water: ["浴室溢水", "现场·痕迹", "水龙头保持异常小流量，22:36 才渗到楼下；阀门位置与自然漏水不符，需要复现实验确认其计时作用。"],
    e_waterlab: ["浴室渗漏复现实验", "实验·独立验证", "按现场阀门开度与排水口堵塞程度复现，连续 1 小时 50 分钟后出现同等楼下渗漏；22:36 倒推约 20:46 开始放水。"],
    e_remote_sweep: ["远程触发排查记录", "技术队·排除性调查", "无线频谱、蓝牙与局域网日志无异常连接；现场机械触发检查也未发现定时器、牵引线或残留安装点。"],
    e_cufflink: ["许遥的袖扣", "现场·物证", "书柜底部发现，表面有旧灰尘，凹槽内没有当晚的新鲜纤维。"],
    e_dna: ["1102 背景生物痕迹", "环境采样·背景", "玄关与客厅的环境采样检出林知秋长期使用留下的生物痕迹；这些痕迹无法定年，不能证明他案发当晚在 1102 活动。"],
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
    e_chain_tests: ["门链替代顺序测试", "实验·原始记录", "同型号实测：室内把手离场会产生门磁开合，但不会新增刷卡认证；门缝复位模型无法挂链，先离开再挂链在物理上不成立。测试记录不单独确定行为时间。"],
    e_chaintrial: ["锁闭现场复原结论", "分析·派生材料", "引用门链状态、检修口痕迹、服务区路径、连续门磁和替代顺序测试：室内挂链后经检修口离开，是当前材料下同时满足锁闭、前门未再开合与 21:49 路径记录的顺序。"],
    e_watch: ["死者智能手表记录", "设备·独立时间锚点", "19:16:21 检测到剧烈冲击，心率随后急降；19:18 后没有有效活动记录。它固定冲击与生理变化，不单独等同于法医死亡判断。"],
    e_oldfile: ["2014 原始验收卷", "旧案·原始文件", "会议纪要、监理联系单、修改验收页与施工日志共同保存了降配责任链。"],
    e_casualty: ["2014 事故死亡名单", "旧案·人员记录", "遇难者：周屿，男，27 岁；另一名遇难者为施工班组成员。"],
    e_hr: ["物业人事历史档案", "物业·人事记录", "周岚入职档案的历史紧急联系人：周屿（兄）。"],
    e_message: ["“东西我已经找到了”", "手机·通信", "林知秋 17:58 发给记者梁闻；梁闻删除了附件，却保留了校验摘要。"],
    e_copy: ["顾雪的复制日志", "公司·设备记录", "顾雪 19:03 在停车场再次见到林知秋并复制资料。她此前只强调林知秋 18:10 离开公司，省略了之后的再次会面与越权复制。"],
    e_debt: ["保险变更草稿", "私人·动机材料", "程逸并非新增受益人，恰恰在草稿中被移除；经济动机无法证明行为。"],
    e_cart: ["搬运车轮迹", "物业·工具痕迹", "1402 服务通道轮迹与物业搬运车的轮距、轮宽及右后轮磨损缺口位置一致。19:28—21:13 缺失的是搬运车架区域与一段服务通道画面；21:37 的服务梯、门控记录来自独立控制系统，顶置帧只辨认人员经过，不覆盖车体载物。"],
    e_struggle: ["冲突接触复核", "法医·原始检验", "死者指甲内检出周岚上皮细胞；周岚 22:58 留档照片显示左前臂有仍在渗血的平行抓痕；其工作外套袖内侧有与 1402 撞击方向一致的死者血液定向微滴。单纯擦拭或搬运通常形成接触涂抹，不能解释这一组飞溅。它能证明周岚在生前冲突及撞击时近距离在场，但不能单独判断主观故意或具体推搡动作。"]
  };

  const DEDUCTIONS = {
    d_lock: ["死亡地点尚未独立证明", "尸体在 1102 被发现是事实；死亡是否发生在此仍需新的物理来源。"],
    d_alibi: ["许遥的不在场证明成立", "直播、位置与会场三种独立来源形成连续时间链。"],
    d_dimension: ["十三厘米矛盾", "现场照片里的房间尺寸不符合 1102 的固定结构。"],
    d_1402: ["被注销的 1402", "房号从物业系统消失，但原空间仍被合并标注遮蔽。"],
    d_mirror: ["镜像现场", "1402 才是死亡第一现场；1102 是尸体发现现场。"],
    d_body_review: ["伤情与设备联合复核", "初检伤情、手表冲击和 1402 撞击痕形成派生对应链；死亡判断收窄至 19:16—19:18。"],
    d_semantics: ["证据事实与解释分离", "凭证认证、门扇开合与人员通过是三个不同命题；任何一条记录都不能代替另外两条。"],
    d_sound: ["结构传声", "沈曼听见了声音，但无法凭听觉确认楼层来源。"],
    d_cuff: ["袖扣的错误时间", "真实物证也可能在与案件无关的时间留下。"],
    d_access: ["置换者的条件交集", "知识、受控权限、19 点实际通行窗口与 A047 身份链分别获得来源后，唯一交集才指向周岚；这仍不自动证明致命冲突归属。"],
    d_fatal: ["致命冲突行为人", "联合复核固定致命事件，通行记录固定同一时段在场，冲突接触复核把周岚连接到生前冲突与撞击瞬间。"],
    d_reconstruction: ["锁闭现场复原", "约 20:46 先经检修通道放水；21:19 取卡，21:41 从正门运入尸体；室内挂链后于 21:49 经检修通道离开。"],
    d_oldcase: ["旧案责任链", "旧案是置换现场的深层目的，且责任不止一个人。"],
    d_private: ["周岚与旧案的私人联系", "死亡名单与人事档案独立连接：遇难者周屿是周岚的哥哥。"]
  };

  const INTERVIEWS = {
    xuyoa: { name: "许遥", role: "前合伙人", tag:"主动核验", cta:"核验我的不在场", completionLabel:"核验完成", topics: ["公开争吵","旧日合作","袖扣"], requiredTopic: "公开争吵", statement: "今天晚上，我们之间必须有一个结果。", kind: "omission", evidence: "e_cuffphoto", reveal: "我说的结果，是让他决定是否公开资料。袖扣在 9 月 3 日就丢了。", lines: ["已问清争吵语境。","这句话省略了“结果”的具体内容。","带日期的照片固定了袖扣遗失时间。"] },
    guxue: { name: "顾雪", role: "死者助理", tag:"设备外查", cta:"追查设备记录", completionLabel:"回审完成", topics: ["离开公司","案发后去向","复制资料"], requiredTopic: "案发后去向", statement: "林老师六点十分离开公司。", kind: "omission", evidence: "e_copy", unlock: "e_copy", reveal: "19:03 我在停车场又见过他，还复制了资料。我此前说的，只是他离开公司的时间。", lines: ["已追问离开后的行程。","离开公司，不等于最后一次见面。","复制日志迫使她补全了 19:03；原话仍然为真，只是不完整。"] },
    liangwen: { name: "梁闻", role: "调查记者", tag:"措辞限定", cta:"核对“收到”含义", completionLabel:"限定已澄清", topics: ["旧案报道","与死者通信","消息来源"], requiredTopic: "与死者通信", statement: "我没收到能发表的东西。", kind: "omission", evidence: "e_message", unlock: "e_message", reveal: "附件收到了，但未经来源许可，不能发表。", lines: ["已核对通信措辞。","“不能发表”被省略成了“没收到”。","校验摘要证明附件确实存在。"] },
    chengyi: { name: "程逸", role: "死者弟弟", tag:"动机排除", cta:"核验受益关系", completionLabel:"动机已校正", topics: ["家庭关系","保险与债务","旧案动机"], requiredTopic: "保险与债务", statement: "他最近谈过保险，我确实缺钱。", kind: "inference", evidence: "e_debt", unlock: "e_debt", reveal: "我从没说受益人是我；草稿反而把我移除了。", lines: ["已核对保险措辞。","债务与保险只能构成推测，不能证明受益。","变更草稿排除了直接获利。"] },
    shenman: { name: "沈曼", role: "11 层住户", tag:"来源校正", cta:"重建声音来源", completionLabel:"证词已校正", topics: ["听见时间","声音位置","邻里关系"], requiredTopic: "声音位置", statement: "九点多，我在 1102 管井旁一直听见声音。", kind: "inference", evidence: "e_pipe", reveal: "声音确实是在 1102 管井旁听见的；我只是一直以为它来自 1102。", lines: ["已追问她如何定位声音。","听见声音与所在位置是事实，楼层来源是她当时的判断。","管井图给出了结构传声路径。"] },
    zhoulan: { name: "周岚", role: "物业运营负责人", tag:"延后回审", cta:"进行第一次质询", completionLabel:"身份回审完成", topics: ["现行系统","物业旧图","应急权限"], requiredTopic: "物业旧图", statement: "系统里没有 1402。", kind: "omission", evidence: "e_cardauth", unlock: "e_cardauth", reveal: "现行系统删掉了房号。但旧图我看过，A047 也是我本人取出的。", lines: ["已区分现行系统与历史档案。","她省略了“现行”这个限定。","活体认证把岗位账号落实到周岚本人；第一次质询的账号借口不再成立。"] }
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
    d_lock: ["e_lock","e_access","e_doorcontact","e_body"], d_alibi: ["e_checkin","e_stream","e_location"],
    d_dimension: ["e_shelf","e_plan1102","e_fixed"], d_1402: ["e_plan2012","e_plan2019"],
    d_mirror: ["e_impact","e_floor","e_body"], d_body_review:["e_body","e_watch","e_impact","e_body_review"], d_semantics: ["e_access","e_doorcontact","e_cardlog"],
    d_sound: ["e_pipe"], d_cuff: ["e_cufflink","e_cuffphoto"],
    d_access: ["e_permission","e_cardlog","e_accountmap","e_trainingaccess","e_shift","e_cardauth","e_route"],
    d_reconstruction: ["e_waterlab","e_cardlog","e_cardauth","e_cart","e_access","e_doorcontact","e_lock","e_hatch","e_chain_tests","e_chaintrial","e_route"],
    d_fatal:["e_body_review","e_route","e_struggle"],
    d_oldcase: ["e_oldfile"], d_private: ["e_casualty","e_hr"]
  };

  const ORIGIN_BADGES = {
    e_checkin: "独立来源 · 会场", e_stream: "独立来源 · 公开影像", e_location: "独立来源 · 运营商",
    e_watch: "原始来源 · 设备", e_body: "原始来源 · 法医初检", e_impact: "原始来源 · 现场", e_body_review:"派生材料 · 引用初检/设备/现场",
    e_cardlog: "卡柜数据库", e_accountmap: "账号目录", e_trainingaccess: "培训与访问审计", e_shift: "人事排班", e_cardauth: "卡柜活体认证",
    e_access:"原始来源 · 门锁认证", e_doorcontact:"同一门体系统 · 门磁事件", e_route: "门控独立记录", e_hatch: "现场痕迹", e_chain_tests:"原始实验记录", e_chaintrial: "派生材料 · 引用五类来源", e_remote_sweep: "技术排除调查", e_struggle:"原始来源 · 法医接触检验",
    e_casualty: "旧案名册", e_hr: "人事档案", e_waterlab: "独立来源 · 复现实验"
  };

  let state = loadState();
  let toastTimer = null;
  let reconstructionDrag = null;
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
    document.querySelector("#chapter-label").textContent = state.chapter === 10 ? "终章" : `第${toChinese(state.chapter)}章`;
    document.querySelector("#progress-label").textContent = `主案材料 ${progress.found}/${progress.total}`;
    document.querySelector("#evidence-count").textContent = state.evidence.length;
  }

  function toChinese(num) { return ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"][num] || num; }

  function renderLanding() {
    topbar.hidden = true;
    const hasSave = state.started;
    const endings = state.meta.endings.map(id => `结局 ${id}`).join(" · ") || "尚无结案记录";
    app.innerHTML = `
      <section class="landing">
        <div class="landing-copy">
          <div class="eyebrow">澄江市刑侦支队 · 案件分析终端</div>
          <h1 class="display">错层</h1>
           <div class="landing-deck">WRONG FLOOR · V3.7 · 2026/10/05</div>
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

  function resumeGame() {
    const chapterMatch=/^chapter-(\d+)$/.exec(String(state.screen || ""));
    if (chapterMatch) {
      const chapter=Number(chapterMatch[1]);
      if (Logic.chapterUnlocked(state,chapter)) { renderChapter(chapter); return; }
    }
    if (state.screen === "notebook") { renderNotebook(); return; }
    if (state.screen === "timeline") { renderTimeline(); return; }
    if (state.screen === "map") { renderMap(); return; }
    if (/^ending-[ABCD]$/.test(String(state.screen || "")) && state.ending) { renderEnding(state.ending); return; }
    renderHome();
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
           const solvedCount = state.solved.filter(id => ({1:["p01"],2:["p02"],3:["p03"],4:["p04"],5:["p05","p05r","p06"],6:["p07","p08"],7:["p09"],8:["p10"],9:["p10r"],10:["p11","report","p12"]}[no] || []).includes(id)).length;
           const requiredDone = Number(state.solved.includes("p10")) + Number(state.evidence.includes("e_struggle"));
           const progressText = no === 8 ? `主案归属 ${requiredDone}/2` : no === 9 ? `现场复原 ${state.solved.includes("p10r") ? "已完成" : state.legacyReconstruction ? "旧版记录" : "待完成"}` : no === 10 ? `报告与举证 ${solvedCount}/3${state.oldCaseDiscovered ? ` · 封存卷宗${state.solved.includes("p11") ? "已查" : "调查中"}` : ""}` : solvedCount ? `完成 ${solvedCount}` : "";
          return `<article class="card ${unlocked ? "chapter-reveal" : "locked"}">
             <small>${unlocked ? (no === 10 ? "FINAL" : `CHAPTER ${String(no).padStart(2,"0")}`) : `INVESTIGATION ${String(no).padStart(2,"0")}`}</small>
            <h3>${unlocked ? escapeHtml(chapter.title) : `第${toChinese(no)}调查阶段 · 未解锁`}</h3>
            <p>${unlocked ? escapeHtml(chapter.subtitle) : escapeHtml(Logic.chapterLockReason(state,no))}</p>
            <div class="card-actions"><button class="btn" data-action="go-chapter" data-chapter="${no}" ${unlocked ? "" : "disabled"}>${no < highest ? "重新查看" : no === highest ? "进入调查" : "未开放"}</button><span class="meta">${progressText}</span></div>
          </article>`;
        }).join("")}
      </div>
      <div class="puzzle">
        <div class="puzzle-tag">CURRENT CASE STATE</div>
         <h2>主案关键材料 ${progress.found} / ${progress.total}</h2>
         <div class="evidence-progress-breakdown"><span>补充材料 ${progress.supplementalFound}/${progress.supplementalTotal}</span>${state.oldCaseDiscovered ? `<span>封存卷宗 ${progress.oldCaseFound}/${progress.oldCaseTotal}</span>` : ""}</div>
         <p class="muted">已形成 ${state.deductions.length} 条推论；推理修正 ${state.mistakes} 次。普通阅读与复查不会计入。</p>
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
         <div><div class="chapter-no">${no === 10 ? "FINAL REPORT" : `CHAPTER ${String(no).padStart(2,"0")}`}</div><h1 class="chapter-title">${escapeHtml(chapter.title)}</h1><p class="chapter-brief">${escapeHtml(chapter.subtitle)}</p></div>
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
    const preservedScroll = [...document.querySelectorAll("[data-preserve-scroll]")].map((node,index) => ({ index, left:node.scrollLeft, top:node.scrollTop }));
    const screenMatch=/^chapter-(\d+)$/.exec(state.screen);
    const visibleChapter=screenMatch ? Number(screenMatch[1]) : state.chapter;
    renderChapter(visibleChapter);
    requestAnimationFrame(() => {
      document.querySelectorAll("[data-preserve-scroll]").forEach((node,index) => {
        const saved=preservedScroll.find(item=>item.index===index);
        if (saved) { node.scrollLeft=saved.left; node.scrollTop=saved.top; }
      });
      const next = selector ? document.querySelector(selector) : null;
      if (next && previousTop !== null) {
        window.scrollBy(0, next.getBoundingClientRect().top - previousTop);
        next.focus({ preventScroll: true });
      } else window.scrollTo(0, previousScroll);
    });
  }

  function chapterRenderer(no) {
    if (no === 8 && !state.interludeSeen) return `<section class="interlude"><div class="eyebrow">00:48 · 询问室外</div><p>14 层走廊的灯隔着监控屏亮着。周岚抱着一叠物业表格停在门口。</p><blockquote>“你们还要查多久？”</blockquote><p>你合上案件簿：“查到问题变成正确的问题为止。”</p><button class="btn primary" data-action="continue-interlude">继续调查权限关系</button></section>`;
    return [null, chapter1, chapter2, chapter3, chapter4, chapter5, chapter6, chapter7, chapter8, chapter9, chapter10][no]();
  }

  function investigationCard(id, title, text, evidenceIds, label) {
    const done = state.examined.includes(id);
    return `<article class="card ${done ? "done" : ""}"><h3>${title}</h3><p>${text}</p><div class="card-actions"><button class="btn" data-action="examine" data-id="${id}" data-evidence="${evidenceIds.join(",")}">${done ? "复查材料" : (label || "调查")}</button></div></article>`;
  }

  function chapter1() {
    const sceneZones = [
      ["access","玄关","环境采样检出长期使用留下的背景生物痕迹；采样时间不能等同于案发活动时间。",["e_dna"]],
      ["door","门锁","室内门链、锁具认证流与门磁开合流需要分别读取。",["e_lock","e_access","e_doorcontact"]],
      ["living-carpet","客厅地面","尸体周围地毯干净，没有与头部伤势相称的血迹和喷溅。",[]],
      ["body-injury","尸体","后枕部存在钝性撞击伤；初检暂不判断撞击发生在哪个房间。",[]],
      ["shelf","书柜","底部积灰中有一枚刻着 X.Y. 的袖扣，凹槽没有新鲜纤维。",["e_cufflink"]],
      ["bath","浴室","水龙头保持小流量，排水口被部分堵塞，阀门位置已经拍照记录。",["e_water"]],
      ["window-view","窗边","对岸楼顶设备层进入视野；当前只保存角度，不判断拍摄楼层。",[]]
    ];
    const isDone = id => state.examined.includes(id) || (state.examined.includes("body") && ["living-carpet","body-injury"].includes(id)) || (state.solved.includes("p01") && id === "window-view");
    const coreZones = ["door","living-carpet","body-injury","bath"];
    const coreDone = coreZones.filter(isDone).length;
    const ready = state.solved.includes("p01") || coreDone === coreZones.length;
    const selectedId=state.factAnswers.lastSceneZone || "door";
    const selected=sceneZones.find(([id])=>id===selectedId) || sceneZones[1];
    const buttons=sceneZones.map(([id,label,,evidence]) => `<button type="button" class="scene-zone zone-${id} ${isDone(id) ? "is-examined" : ""}" data-action="examine" data-id="${id}" data-evidence="${evidence.join(",")}" aria-pressed="${isDone(id)}"><span>${label}</span>${isDone(id) ? "<b>✓</b>" : ""}</button>`).join("");
    return `<section class="scene-investigation"><div class="scene-heading"><div><div class="eyebrow">1102 · SEALED SCENE</div><h2>在平面现场中自由勘查</h2><p class="muted">门锁、尸体、客厅地面与浴室是本轮核心区域；玄关、书柜和窗边可以现在查看，也可以随后返回现场。</p></div><span class="scene-progress">核心 ${coreDone}/4 · 全部 ${sceneZones.filter(([id])=>isDone(id)).length}/7</span></div><div class="scene-investigation-layout"><div class="scene-board scene-1102" aria-label="1102 现场俯视图">${buttons}<span class="scene-wall wall-a"></span><span class="scene-wall wall-b"></span><span class="scene-fixture fixture-sofa">沙发</span><span class="scene-fixture fixture-bed">尸体位置</span></div><aside class="scene-observation-panel" aria-live="polite"><small>当前原始观察</small><h3>${selected[1]}</h3><p>${selected[2]}</p>${["body-injury","living-carpet"].includes(selected[0]) ? '<span class="observation-link">伤情与地面均检查后，才会生成“尸表初检”材料。</span>' : ""}</aside></div><div class="scene-location-list" aria-label="现场地点文字入口">${sceneZones.map(([id,label,,evidence]) => `<button type="button" class="${isDone(id) ? "is-examined" : ""}" data-action="examine" data-id="${id}" data-evidence="${evidence.join(",")}" aria-pressed="${isDone(id)}">${isDone(id) ? "✓ " : ""}${coreZones.includes(id) ? "核心 · " : "可选 · "}${label}</button>`).join("")}</div></section>
    <div class="grid supplemental-investigation">${investigationCard("remote-sweep", "补充排查 · 无线与机械触发", "排除远程通信、定时器与牵引装置。这是补充材料，不计入主案关键材料进度。", ["e_remote_sweep"])}</div>
    <section class="puzzle" id="p01"><div class="puzzle-tag">P01 · 证据强度</div><h2>现阶段，哪一项结论的证据强度最低？</h2>
      <p class="muted">只判断“是否已经被独立材料证明”，不要推测新的现场。</p>
      <div class="choices">
        ${[["found","尸体在 1102 被发现"],["opened","A047 于 21:41 通过锁具认证"],["locked","破门前房门处于反锁状态"],["death","林知秋在 1102 遇害"]].map(([v,t]) => `<label class="choice"><input type="radio" name="p01" value="${v}"><span>${t}</span></label>`).join("")}
      </div><button class="btn primary" data-action="solve-p01" ${ready ? "" : "disabled"}>提交判断</button>
      <div class="feedback" id="feedback-p01">${ready ? "核心勘查已完成；其余区域仍可自由补查。" : `先完成四个核心区域的原始观察（${coreDone}/4）。`}</div></section>`;
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
        <label class="coverage-row"><input type="checkbox" name="p02" value="e_cuffphoto"><span class="coverage-bar bar-point">9 月 3 日 · 1102 参观合照</span></label>
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
    const photoA = Number(state.factAnswers.photoPointA ?? 14);
    const photoB = Number(state.factAnswers.photoPointB ?? (state.factAnswers.photoMeasure != null ? photoA + Number(state.factAnswers.photoMeasure) : 74));
    const planA = Number(state.factAnswers.planPointA ?? 9);
    const planB = Number(state.factAnswers.planPointB ?? (state.factAnswers.planMeasure != null ? planA + Number(state.factAnswers.planMeasure) : 59));
    const photo = Math.abs(photoB-photoA), plan = Math.abs(planB-planA);
    const phase = Number(state.factAnswers.p03Phase || 1);
    const explanation = state.factAnswers.p03Explanation;
    const hypothesisNames = { furniture:"家具移动", perspective:"摄影透视", room:"房间并非 1102" };
    const adjusters = kind => `<span class="measure-adjust" role="group" aria-label="${kind === "photo" ? "现场照片" : "图纸"} B 点微调"><button type="button" data-action="adjust-measure" data-point="${kind}-b" data-delta="-1" ${phase > 1 ? "disabled" : ""}>B −1</button><button type="button" data-action="adjust-measure" data-point="${kind}-b" data-delta="1" ${phase > 1 ? "disabled" : ""}>B +1</button></span>`;
    const endpoints = (kind,a,b,max) => `<div class="endpoint-ruler" data-endpoint-ruler="${kind}"><label><span><b>A</b> 固定墙边缘</span><input type="range" min="0" max="${max}" step="1" value="${a}" data-measure-point="${kind}-a" ${phase > 1 ? "disabled" : ""}></label><label><span><b>B</b> 书柜定位边缘</span><input type="range" min="0" max="${max}" step="1" value="${b}" data-measure-point="${kind}-b" ${phase > 1 ? "disabled" : ""}></label></div>`;
    return `${state.solved.includes("p03") ? '<div class="deduction-banner"><strong>推理成立 · P03 十三厘米</strong><span>测量只建立异常；固定结构复核排除了家具与透视，最终才裁决房间身份。</span></div>' : ""}<div class="measure-stage">
      <div>${investigationCard("measure-photo", "现场比例照片", "地砖边长 60 厘米。用图上标尺估算书柜右缘与固定墙之间的距离。", [])}</div>
      <div>${investigationCard("measure-plan", "1102 竣工户型图", "用图纸刻度复核固定墙体与书柜定位线，不要直接相信家具摆位。", [])}</div>
    </div>
    <div class="measure-stage" aria-label="尺寸复核示意"><div class="plan-box photo-measure"><div class="tile-grid"></div><div class="plan-shelf"></div><span class="measure-note">每格地砖 60 cm</span><div class="ruler-control"><span>分别拖动 A、B 到照片中的固定墙与书柜右缘</span><output id="photo-output">${photo} cm</output>${endpoints("photo",photoA,photoB,120)}${adjusters("photo")}<span class="range-labels"><b>0</b><b>60</b><b>120 cm</b></span></div></div><div class="plan-box plan-measure"><div class="plan-room"><div class="plan-shelf"></div><div class="scale-line"><span>0</span><span>50</span><span>100cm</span></div><span class="measure-note">图纸比例 1:50 · 尺寸线可读</span><div class="ruler-control"><span>分别拖动 A、B 到固定墙体与书柜定位线</span><output id="plan-output">${plan} cm</output>${endpoints("plan",planA,planB,110)}${adjusters("plan")}<span class="range-labels"><b>0</b><b>50</b><b>100 cm</b></span></div></div></div>
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

  function blueprintOverlay(mode) {
    return `<div class="blueprint-overlay mode-${mode}" aria-label="2012施工图与2019物业图叠合"><div class="overlay-sheet overlay-2012"><small>2012 · 施工图</small><span class="overlay-room left">1401</span><span class="overlay-room middle">1402</span><span class="overlay-room right">1403</span><i class="overlay-door">正式门位</i><i class="overlay-shaft">管井</i></div><div class="overlay-sheet overlay-2019"><small>2019 · 物业图</small><span class="overlay-room merged">1401 / 1403 合并</span><i class="overlay-seal">房号注销</i><i class="overlay-shaft">管井</i></div><div class="overlay-legend"><span>青线 · 固定结构</span><span>红章 · 被注销标注</span></div></div><div class="overlay-controls" role="group" aria-label="图纸叠合模式"><strong class="overlay-control-label">图纸叠合模式</strong>${[["old","只看 2012"],["blend","叠合比较"],["current","只看 2019"]].map(([id,label])=>`<button type="button" class="btn ${mode===id ? "primary" : ""}" data-action="set-blueprint-overlay" data-mode="${id}">${label}</button>`).join("")}</div>`;
  }

  function chapter4() {
    const phase = Number(state.factAnswers.p04Phase || 1);
    const first = state.factAnswers.p04First, second = state.factAnswers.p04Second;
    const overlayMode=state.factAnswers.p04OverlayMode || "old";
    return `<div class="grid">${investigationCard("archive-history", "房号变更申请", "2017 年改造申请写着“1401/1403 合并”，附件页码不连续。", ["e_plan2019"])}</div>
    <section class="puzzle staged-puzzle"><div class="puzzle-tag">P04 · 五版建筑图 · ${phase}/3</div><h2>${phase === 1 ? "第一步：哪一版最早明确出现中部独立房间？" : phase === 2 ? "第二步：哪一版最早不再显示它的房号？" : "第三步：消失的是房号，还是建筑结构？"}</h2>
      <div class="blueprint-stack">${[["2012","施工图"],["2013","销售图"],["2016","消防图"],["2019","物业图"],["2026","电子地图"]].map(([id,label]) => `<button class="blueprint ${(phase === 1 && first === id) || (phase === 2 && second === id) ? "selected" : ""} ${phase === 3 && (first === id || second === id) ? "selected locked-choice" : ""}" data-action="select-blueprint" data-id="${id}" data-stage="${phase}" ${phase === 3 ? "disabled" : ""}><strong>${label}</strong>${blueprintDiagram(id)}</button>`).join("")}</div>
      ${phase === 1 ? '<button class="btn primary" data-action="confirm-p04-first">确认最早存在来源</button>' : ""}
      ${phase === 2 ? '<button class="btn primary" data-action="confirm-p04-second">确认最早注销来源</button>' : ""}
      ${phase === 3 ? `${blueprintOverlay(overlayMode)}<h3>比较 ${first} 与 ${second}：哪些变化可从叠合图直接确认？</h3><div class="choices">${[["number","中部房号消失"],["door","正式门位消失"],["wall-kept","承重边界没有拆除标记"],["pipe","竖向管井仍然存在"],["wall-removed","中部承重墙已全部拆除"]].map(([v,t]) => `<label class="choice"><input type="checkbox" name="p04-change" value="${v}"><span>${t}</span></label>`).join("")}</div><button class="btn primary" data-action="solve-p04">形成建筑档案推论</button>` : ""}<div class="feedback" id="feedback-p04"></div>
    </section>`;
  }

  function chapter5() {
    const differences = [["socket","插座高度","fixed","▭","▭"],["drag","平行拖痕","night","","≋"],["frame","窗框编号","fixed","F11","F14"],["nail","旧钉孔","history","⋰","⋱"],["pipe","暖气管位置","fixed","║","║"],["impact","擦拭撞击痕","night","","×"],["cup","杯子数量","movable","○","○○"],["curtain","窗帘角度","movable","╱","╲"],["lamp","灯罩颜色","unknown","◇","◆"],["painting","装饰画偏移","unknown","▱","▰"]];
    const detail = { socket:"两处插座中心的距地高度相差约 7 厘米。", drag:"清洁剂下有两道间距约 53 厘米的拖擦线，残留蓝灰纤维。", frame:"窗框批次刻码一处为 F11，一处为 F14。", nail:"墙纸下露出方向不同的旧钉孔。", pipe:"暖气管与窗框中线的距离不同。", impact:"结构件表面有新鲜凹痕与被擦拭的暗色残留。", cup:"桌面分别摆着一只和两只杯子。", curtain:"两处窗帘开合角度不同。", lamp:"两处灯罩颜色和批次不同。", painting:"装饰画位置与墙面旧印不重合。" };
    const classLabels={fixed:"固定结构",movable:"可移动陈设",history:"历史改造",night:"当晚异常",unknown:"当前材料无法判断"};
    const observationsSaved = Boolean(state.factAnswers.p05ObservationsSaved);
    const ready = state.mirrorFound.length >= 6;
    const reviewReady = state.solved.includes("p05") && ["e_body","e_watch","e_impact"].every(id=>state.evidence.includes(id));
    const reviewDone = state.solved.includes("p05r") && state.evidence.includes("e_body_review");
    const viewHeight=Number(state.factAnswers.viewFloor || 11);
    const viewedFloors=state.factAnswers.viewedFloors || [];
    const sightNotes={11:"已载入 11F 几何投影；请自行比较两条线。",12:"已载入 12F 几何投影；请自行比较两条线。",13:"已载入 13F 几何投影；请自行比较两条线。",14:"已载入 14F 几何投影；请自行比较两条线。",15:"已载入 15F 几何投影；请自行比较两条线。"};
    return `${state.solved.includes("p05") ? '<div class="deduction-banner"><strong>推论形成：1402 为第一现场</strong><span>墙面痕迹对应后枕部伤情；地板拖痕与搬运毯纤维对应尸体搬运。死亡精确区间仍待联合复核。</span></div>' : ""}<div class="document"><h3>现场准入记录</h3><p>14 层封闭档案室。门上没有房号，旧锁芯可由物业工程总钥匙开启。内部 B2 户型未随产权合并完全拆除。</p></div>
    <section class="puzzle"><div class="puzzle-tag">P05 · 双房调查 · ${observationsSaved ? "案件簿研判" : "现场观察"}</div><h2>${observationsSaved ? "从已保存观察中钉选两项案件关键证据" : "对照 1102 与未编号空间"}</h2>
      ${!observationsSaved ? `<p class="muted">右侧有十处可见差异，没有发光提示。先记录至少六处，再判断它属于结构、陈设、历史、当晚异常，或仅凭当前材料还无法确定；“不知道”也是一种严格结论。</p><div class="mirror-stage"><div class="room-scene detailed-room compare-left"><span class="room-label">11F · 1102</span>${differences.filter(([, , ,left]) => left).map(([id,,,left]) => `<span class="scene-object diff-${id}">${left}</span>`).join("")}</div><div class="room-scene detailed-room compare-right"><span class="room-label">14F · 未编号空间</span>${differences.map(([id,label,,,right]) => `<button class="difference diff-${id} ${state.mirrorFound.includes(id) ? "found" : ""}" data-action="find-diff" data-diff="${id}" title="${label}" aria-label="调查${label}">${right}</button>`).join("")}</div></div><div class="found-differences observation-list">${state.mirrorFound.length ? differences.filter(([id]) => state.mirrorFound.includes(id)).map(([id,label]) => `<article class="difference-note" data-difference-note="${id}"><span><strong>${label}</strong><small>${detail[id]}</small></span><div class="difference-classifications" role="group" aria-label="${label}分类">${Object.entries(classLabels).map(([value,text])=>`<button type="button" class="${state.differenceClasses[id]===value ? "selected" : ""}" data-action="choose-difference-class" data-diff="${id}" data-class="${value}">${text}</button>`).join("")}</div></article>`).join("") : '<span class="muted">尚未记录差异</span>'}</div><p class="feedback ${ready ? "good" : ""}" id="feedback-p05">${ready ? "观察数量足够；完成至少六项有依据的分类后可保存。" : `已记录 ${state.mirrorFound.length}/10。`}</p><button class="btn primary" data-action="save-p05-observations" ${ready ? "" : "disabled"}>保存观察与分类</button>` : `<p class="muted">观察及其类别已经保存。现在只从“当晚异常”中选择能分别支持撞击与搬运的两项。</p><div class="found-differences">${differences.filter(([id]) => state.mirrorFound.includes(id)).map(([id,label]) => `<label class="difference-note"><input type="checkbox" name="p05-proof" value="${id}"><span><strong>${label}</strong><small>${detail[id]}</small><em>${classLabels[state.differenceClasses[id]] || "未分类"}</em></span></label>`).join("")}</div><div class="card-actions"><button class="btn primary" data-action="solve-p05">形成第一现场推论</button><button class="btn ghost" data-action="resume-p05-observation">返回现场补查</button></div><div class="feedback" id="feedback-p05"></div>`}
    </section>
    ${state.solved.includes("p05") ? `<section class="puzzle device-return"><div class="puzzle-tag">DEVICE RETURN · 技术回传</div><h2>死者随身设备数据已经提取</h2><p class="muted">这份记录不随第一现场推论自动生成。先打开技术回传，确认设备究竟记录了什么，再决定是否送交联合复核。</p><button class="btn ${state.evidence.includes("e_watch") ? "ghost" : "primary"}" data-action="open-device-record">${state.evidence.includes("e_watch") ? "重新查看设备记录" : "查看设备记录"}</button><div class="feedback ${state.evidence.includes("e_watch") ? "good" : ""}" id="feedback-device-record">${state.evidence.includes("e_watch") ? "智能手表原始记录已纳入案件簿；它固定冲击与生理变化，不单独等同于死亡判断。" : "设备记录尚未纳入案件簿。"}</div></section>` : ""}
    <section class="puzzle body-review"><div class="puzzle-tag">P05-R · 联合复核</div><h2>把伤情、设备记录和现场痕迹送交同一轮复核</h2><p class="muted">这会生成派生材料，不会凭空增加一个独立来源。复核结果将明确列出所引用的三份原始材料。</p><div class="review-source-chain"><span>尸表初检</span><b>＋</b><span>智能手表</span><b>＋</b><span>1402 撞击痕</span><b>→</b><span>${reviewDone ? "联合复核完成" : "待复核"}</span></div><button class="btn primary" data-action="run-body-review" ${reviewReady && !reviewDone ? "" : "disabled"}>${reviewDone ? "联合复核已完成" : reviewReady ? "提交联合复核" : "先取得三份前置材料"}</button><div class="feedback ${reviewDone ? "good" : ""}" id="feedback-body-review">${reviewDone ? "复核已引用初检、手表与现场比对；精确死亡区间现可用于报告。" : ""}</div></section>
    <section class="puzzle"><div class="puzzle-tag">P06 · 视线模拟</div><h2>拖动拍摄高度，再独立判断照片来自哪一层</h2><p class="muted">至少比较三个高度。提交前系统只绘制当前几何投影，不会用文字评价遮挡、接近或重合。</p><div class="sight-stage sight-simulator" style="--origin-top:${44-(viewHeight-11)*8}%;--line-top:${47-(viewHeight-11)*7}%;--line-rotate:${10-(viewHeight-11)*4}deg"><div class="tower source"><span>临江壹号</span><i class="sight-origin" id="sight-origin-label">${viewHeight}F</i></div><div class="photo-reference" aria-hidden="true"></div><div class="sight-line"></div><div class="tower opposite"><span>对面 12F</span><i class="platform">设备平台</i></div><div class="sight-verdict" id="sight-note">${sightNotes[viewHeight]}</div></div><label class="view-height-control"><span>模拟拍摄楼层 <output id="view-height-output">${viewHeight}F</output></span><input type="range" min="11" max="15" step="1" value="${viewHeight}" data-view-height aria-describedby="sight-note"><small>已比较：${viewedFloors.length ? viewedFloors.map(n=>`${n}F`).join("、") : "尚未移动标尺"}</small></label><div class="choices compact-height-choices">${[11,12,13,14,15].map(n=>`<label class="choice"><input type="radio" name="p06-height" value="${n}" ${String(state.factAnswers.p06Choice||"")===String(n)?"checked":""}><span>${n}F</span></label>`).join("")}</div><button class="btn primary" data-action="solve-p06" ${viewedFloors.length >= 3 ? "" : "disabled"}>记录照片拍摄高度</button><div class="feedback" id="feedback-p06"></div></section>`;
  }

  function chapter6() {
    const facts = [
      {id:"card",claim:"林知秋 21:41 进入 1102",tokens:[["person","林知秋本人"],["time","21:41"],["auth","A047 通过锁具认证"],["entry","并进入 1102"]],strict:"21:41，A047 通过 1102 锁具认证。"},
      {id:"door",claim:"门磁证明周岚携尸进入",tokens:[["person","周岚"],["open","门扇发生一次开合"],["direction","从外进入"],["carry","携带尸体"]],strict:"21:41，1102 门扇发生一次开合；身份、方向与携带物未知。"},
      {id:"sound",claim:"沈曼听见 1102 内两人搏斗",tokens:[["heard","沈曼在管井旁听见声响"],["room","声响来自 1102"],["fight","声音是两人搏斗"]],strict:"沈曼在管井旁听见来源未定的声响。"},
      {id:"dna",claim:"DNA 证明林知秋当晚仍在 1102",tokens:[["detected","1102 检出死者 DNA"],["night","当晚留下"],["alive","21:41 仍存活"]],strict:"1102 检出无法定年的死者 DNA。"},
      {id:"cuff",claim:"许遥当晚遗落袖扣并实施犯罪",tokens:[["found","书柜底发现许遥袖扣"],["night","当晚遗落"],["actor","持有人实施犯罪"]],strict:"属于许遥的袖扣在 1102 书柜底被发现。"},
      {id:"water",claim:"凶手在 22:36 开水且仍在屋内",tokens:[["leak","22:36 楼下发现渗水"],["opened","22:36 才打开水龙头"],["present","凶手仍在屋内"]],strict:"持续小流量溢水在 22:36 被楼下发现。"},
      {id:"injury",claim:"1102 客厅墙面或特定凶器造成致命伤",tokens:[["injury","后枕部存在钝性伤"],["wall","由 1102 墙面造成"],["weapon","由特定凶器造成"]],strict:"后枕部存在钝性撞击伤，致伤位置与物体待查。"},
      {id:"alibi",claim:"直播证明许遥完全无罪且从未进过 1102",tokens:[["venue","关键时段连续处于会场"],["innocent","与案件完全无关"],["never","从未进入 1102"]],strict:"许遥在关键时段连续处于论坛会场。"}
    ];
    const cleanupComplete=state.solved.includes("p07");
    return `<div class="document"><h3>1102 门体系统 · 两条互补记录</h3><table><thead><tr><th>时间</th><th>记录流</th><th>事件</th><th>证明边界</th></tr></thead><tbody><tr><td>21:41:08</td><td>锁具认证</td><td>A047 认证通过</td><td>不证明门扇已打开或谁通过</td></tr><tr><td>21:41:10—32</td><td>门磁</td><td>打开后关闭</td><td>不证明身份、方向或携带物</td></tr></tbody></table><p>两条记录来自同一门体系统的不同传感流，是互补字段，不计作两份彼此独立的来源。</p></div>
    <section class="puzzle"><div class="puzzle-tag">P07 · 证据净化</div><h2>在解释句中划去记录没有支持的词组</h2><p class="muted">划词时只记录“删除／保留”，不会逐卡提示正确与否。提交整组判断后，系统才会统一写出八条严格事实。</p><div class="fact-cleanup-board">${facts.map(fact => { const marks=state.factMarks[fact.id] || []; return `<article class="fact-cleanup-card" data-fact-cleanup="${fact.id}"><small>${cleanupComplete ? "严格事实" : "待净化解释"}</small><h3>${fact.claim}</h3><div class="fact-tokens">${fact.tokens.map(([id,text])=>`<button type="button" class="fact-token ${marks.includes(id)?"struck":""}" data-action="toggle-fact-mark" data-fact-card="${fact.id}" data-token="${id}" aria-pressed="${marks.includes(id)}" ${cleanupComplete ? "disabled" : ""}>${marks.includes(id)?`<s>${text}</s>`:text}</button>`).join("")}</div>${cleanupComplete ? `<p class="strict-fact"><b>保留事实：</b>${fact.strict}</p>` : '<p class="strict-fact pending">当前标记已保存；整组提交前不显示裁决。</p>'}</article>`; }).join("")}</div><button class="btn primary" data-action="solve-p07" ${cleanupComplete ? "disabled" : ""}>${cleanupComplete ? "严格事实已写入" : "写入严格事实"}</button><div class="feedback ${cleanupComplete ? "good" : ""}" id="feedback-p07">${cleanupComplete ? "八条净化后的严格事实已经统一写入案件簿。" : ""}</div></section>
    <section class="puzzle"><div class="puzzle-tag">P08 · 水管线路</div><h2>哪条结构路径能解释 11 层的声音？</h2><div class="choices">${[["hall","14层走廊 → 电梯井 → 11层客厅"],["pipe","1402管井 → 共用立管 → 1102管井旁"],["window","1402窗外 → 外墙反射 → 1102阳台"]].map(([v,t]) => `<label class="choice"><input type="radio" name="p08" value="${v}"><span>${t}</span></label>`).join("")}</div><button class="btn primary" data-action="solve-p08">检查结构图</button><div class="feedback" id="feedback-p08"></div></section>`;
  }

  function interviewRow(id) {
    const person = INTERVIEWS[id];
    const round = Number(state.interviews[id] || 0);
    const labels = ["选择话题","拆解证词","出示材料"];
    const waiting = round === 2 && person.unlock && !state.evidence.includes(person.unlock);
    const route = state.interviewData[id] && state.interviewData[id].routeText;
    const buttonLabel=round >= 3 ? person.completionLabel : waiting ? (id === "zhoulan" ? "等待第八章身份链" : "等待外部调查") : round === 0 ? person.cta : labels[round];
    return `<div class="interview-row interview-${id}"><div><div class="person-name">${person.name}${Logic.CORE_INTERVIEWS.includes(id) ? '<span class="key-mark">关键</span>' : ""}</div><span class="meta">${person.role}</span><span class="interview-method-tag">${person.tag}</span></div><div><span class="round-dots">${[1,2,3].map(n => `<span class="${round >= n ? "on" : ""}">●</span>`).join("")}</span><p class="muted" style="margin:.5em 0 0">${route || (round ? person.lines[round - 1] : id === "xuyoa" ? "他主动要求先核验自己的时间线。" : id === "shenman" ? "她没有说谎，需要校正的是声音来源。" : "先选择能检验这句话边界的话题。")}</p></div><button class="btn" data-action="interview" data-person="${id}" ${(round >= 3 || waiting) ? "disabled" : ""}>${buttonLabel}</button></div>`;
  }

  function chapter7() {
    const coreDone = Logic.keyInterviewCount(state);
    const leads = Object.keys(INTERVIEWS).filter(id => INTERVIEWS[id].unlock && state.interviewData[id] && state.interviewData[id].lead && !state.evidence.includes(INTERVIEWS[id].unlock));
    return `<section><div class="eyebrow">SIX STATEMENTS · DIFFERENT TESTS</div><p class="lead">六个人面对的不是同一套“审讯题”：有人邀请核验，有人需要外查设备，有人只是把来源判断错。第八阶段需要完成至少两名关键人物的查证（${coreDone}/2）。</p>${Object.keys(INTERVIEWS).map(interviewRow).join("")}</section>${leads.length ? `<section class="lead-board"><div class="eyebrow">FOLLOW-UP LEADS · 调查板</div><h2>询问只产生调查方向，不自动产生证据</h2>${leads.map(id => { const routes=LEAD_ROUTES[id], attempts=(state.interviewData[id].leadAttempts || []); return `<article class="lead-case"><h3>${INTERVIEWS[id].name} · ${state.interviewData[id].lead}</h3><div class="lead-routes">${routes.options.map(([route,label,result]) => `<button class="lead-route ${attempts.includes(route) ? "checked" : ""}" data-action="investigate-lead" data-person="${id}" data-route="${route}" ${attempts.includes(route) ? "disabled" : ""}><strong>${label}</strong><span>${attempts.includes(route) ? result : "调取这一来源"}</span></button>`).join("")}</div></article>`; }).join("")}</section>` : ""}
    <section class="puzzle"><div class="puzzle-tag">P09 · 袖扣时间</div><h2>哪两条材料能证明袖扣是真的，却不是当晚留下？</h2>
      <div class="choices">${[["e_cufflink","袖扣凹槽内的旧灰尘"],["e_cuffphoto","9 月 3 日右袖缺扣的照片"],["e_stream","论坛连续直播"],["e_debt","程逸的债务"]].map(([v,t]) => `<label class="choice"><input type="checkbox" name="p09" value="${v}"><span>${t}</span></label>`).join("")}</div><button class="btn primary" data-action="solve-p09">校验遗留时间</button><div class="feedback" id="feedback-p09"></div></section>`;
  }

  function sceneReconstructionHtmlLegacy() {
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

  function sceneReconstructionHtml() {
    const labels={
      water:["放水","让 1102 在 22:36 出现延迟渗漏"], card:["取卡","从应急卡柜取得 A047"],
      transfer:["搬运","把尸体从隐蔽现场送入 1102"], chain:["挂链","人在室内形成门链锁闭"],
      leave:["离开","完成 1102 内最后操作后离场"]
    };
    const requiredEvidenceIds=[...new Set(Object.values(Logic.RECONSTRUCTION_EVIDENCE).flat())];
    const distractorIds=["e_watch","e_cufflink","e_pipe","e_struggle"];
    const evidenceIds=[...requiredEvidenceIds,...distractorIds.filter(id=>state.evidence.includes(id))];
    const ready=requiredEvidenceIds.every(id=>state.evidence.includes(id));
    const complete=state.solved.includes("p10r");
    const selected=state.factAnswers.reconstructionActiveEvidence || "";
    const timeline=state.reconstructionOrder.map((id,index)=>{
      const attached=state.reconstructionEvidence[id] || [];
      return `<article class="crime-action-card" data-reconstruction-step="${id}" data-reconstruction-drop="${id}" tabindex="-1" draggable="${!complete}"><div class="crime-action-position"><span>${index+1}</span><div><button type="button" data-action="move-reconstruction" data-step="${id}" data-delta="-1" ${complete||index===0?"disabled":""} aria-label="将${labels[id][0]}前移">↑</button><button type="button" data-action="move-reconstruction" data-step="${id}" data-delta="1" ${complete||index===state.reconstructionOrder.length-1?"disabled":""} aria-label="将${labels[id][0]}后移">↓</button></div></div><div><small>行为 ${index+1}</small><h3>${labels[id][0]}</h3><p>${labels[id][1]}</p></div><div class="attached-evidence" aria-label="${labels[id][0]}已连接材料">${attached.length?attached.map(eid=>`<span class="attached-evidence-chip">${EVIDENCE[eid][0]}${complete?"":`<button type="button" data-action="detach-reconstruction-evidence" data-step="${id}" data-evidence="${eid}" aria-label="从${labels[id][0]}移除${EVIDENCE[eid][0]}">×</button>`}</span>`).join(""):'<span class="drop-placeholder">把材料拖到这里，或从下方选择后连接</span>'}</div>${complete?"":`<div class="card-actions"><button type="button" class="btn" data-action="attach-reconstruction-evidence" data-step="${id}" ${selected?"":"disabled"}>连接当前材料</button><button type="button" class="text-button" data-action="show-notebook" data-evidence="${attached[0]||selected}" data-return-anchor="[data-reconstruction-step='${id}']" data-return-focus="[data-reconstruction-step='${id}'] [data-action='attach-reconstruction-evidence']">到案件簿核对</button></div>`}</article>`;
    }).join("");
    const bank=evidenceIds.map(id=>`<button type="button" class="reconstruction-evidence-card ${selected===id?"selected":""}" data-action="select-reconstruction-evidence" data-reconstruction-evidence="${id}" draggable="${state.evidence.includes(id)&&!complete}" ${state.evidence.includes(id)&&!complete?"":"disabled"}><span>${EVIDENCE[id][1]}</span><strong>${EVIDENCE[id][0]}</strong></button>`).join("");
    const preview=state.reconstructionOrder.map((id,index)=>`<span><b>${index+1}</b>${labels[id][0]}</span>`).join("");
    return `<section class="puzzle scene-reconstruction"><div class="puzzle-tag">P10-R · 犯罪时间轴</div><h2>排列行为，把材料连接到它真正能支持的步骤</h2><p class="muted">桌面可拖动行为与材料；触控和键盘可使用上下按钮及“连接当前材料”。同一原始记录可以被多个步骤引用。</p>${state.legacyReconstruction&&!complete?'<div class="legacy-reconstruction"><strong>旧版复原结论已保留</strong><span>你可以自愿完成新版时间轴；旧记录不会伪装成已经操作过的排序。</span></div>':""}<div class="reconstruction-preview">${preview}</div><div id="reconstruction-status" class="reconstruction-live-status" role="status" aria-live="polite">${escapeHtml(state.factAnswers.reconstructionAnnouncement||"调整顺序或选择材料后，操作结果会显示在这里。")}</div><div class="reconstruction-workbench"><div class="crime-timeline">${timeline}</div><aside class="reconstruction-evidence-bank" data-preserve-scroll><header><small>材料池</small><strong>${selected&&EVIDENCE[selected]?`当前：${EVIDENCE[selected][0]}`:"先选择一张材料"}</strong></header>${bank}</aside></div><button class="btn primary" data-action="validate-reconstruction" ${ready&&!complete?"":"disabled"}>${complete?"复原已通过":ready?"检验完整因果链":"先补齐复原材料"}</button><div class="feedback ${complete?"good":""}" id="feedback-reconstruction">${complete?"五个步骤的时间、路径与锁闭条件已经闭合。":ready?"":"仍缺渗漏、路径、认证、门磁或替代实验来源。"}</div>${complete?'<section class="reconstruction-strip compact"><article><b>约20:46</b><span>放水</span><small>实验＋管井路径</small></article><article><b>21:19</b><span>取卡</span><small>日志＋活体认证</small></article><article><b>21:41</b><span>搬运</span><small>轮迹＋路径＋正门</small></article><article><b>室内</b><span>挂链</span><small>门链＋替代测试</small></article><article><b>21:49</b><span>检修口离开</span><small>痕迹＋路径＋门磁</small></article></section>':""}</section>`;
  }

  function chapter8Legacy() {
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
    const reconstructionReady=(state.solved.includes("p10r") || state.legacyReconstruction) && ["e_waterlab","e_cardauth","e_route","e_hatch","e_chaintrial","e_doorcontact"].every(id=>state.evidence.includes(id));
    const finalReady=Logic.chapterUnlocked(state,9);
    return `<section class="chapter-task-status" aria-label="第八章任务进度"><article class="${state.solved.includes("p10") ? "done" : ""}"><b>条件交集</b><span>必做 · ${state.solved.includes("p10") ? "已完成" : "未完成"}</span></article><article class="${reconstructionReady ? "done" : ""}"><b>现场复原</b><span>必做 · ${state.solved.includes("p10r") ? "新版完成" : state.legacyReconstruction ? "旧版记录保留" : "未完成"}</span></article><article class="${state.evidence.includes("e_struggle") ? "done" : ""}"><b>冲突归属</b><span>必做 · ${state.evidence.includes("e_struggle") ? "已核验" : "未核验"}</span></article><article class="${state.solved.includes("p11") ? "done" : ""}"><b>旧案责任链</b><span>可选 · ${state.solved.includes("p11") ? "已完成" : "未完成"}</span></article></section><section class="free-investigation"><div class="eyebrow">OPEN INVESTIGATION · 自由调查时间</div><h2>分别核验权限、身份、时间、冲突与锁闭路径</h2><div class="grid">${investigationCard("permission-audit", "物业 · 权限、知情与岗位", "分别核验受控权限、账号岗位、本人培训访问与当班签名；岗位可接触不等于本人知情。", ["e_permission","e_accountmap","e_trainingaccess","e_shift"])}${investigationCard("operation-audit", "卡柜与服务区 · 身份路径", "调取 A047 活体认证、工牌连续通行与搬运车轮迹，把账号落实到自然人和实际路线。", ["e_cardauth","e_route","e_cart"])}${investigationCard("conflict-review", "法医 · 冲突接触复核", "核对当晚抓痕、指甲接触物与定向血液微滴，区分生前冲突和事后搬运。", ["e_struggle"])}${investigationCard("water-reenactment", "1102 · 浴室渗漏复现", "按现场阀门开度和排水状态复现，检验 22:36 的发现时间是否被人为安排。", ["e_waterlab"])}${investigationCard("chain-reconstruction", "1102 · 检修口与门链替代测试", "记录另一出口痕迹，并实测门缝复位、前门离场等替代顺序；这些仍只是复原输入。", ["e_hatch","e_chain_tests"])}${investigationCard("old-case-file", "旧案档案 · 2014 原始验收卷", "可选深度调查；决定能否查清十二年前责任与周岚的私人联系。", ["e_oldfile","e_casualty","e_hr"])}</div></section>
    ${state.solved.includes("p10") ? `<div class="deduction-banner"><strong>${finalReady ? "主案报告已开放" : reconstructionReady ? "现场复原记录成立 · 终章仍有前置复核" : "置换者条件交集成立 · 现场复原尚未闭合"}</strong><span>${finalReady ? "联合复核、条件交集与现场复原均已完成。" : escapeHtml(Logic.chapterLockReason(state,9))}</span></div>` : ""}
    <section class="puzzle"><div class="puzzle-tag">P10 · 条件交集</div><h2>知道还不够：逐人记录为什么不能完成置换</h2><p class="muted">✓ 已证实 · × 已排除 · ? 证据不足。每个状态分别读取自己的来源；权限记录不会自动点亮 A047 行为。</p><div class="matrix-wrap desktop-exclusion"><table class="matrix exclusion-matrix"><thead><tr><th>人物</th>${fields.map(([,label]) => `<th>${label}</th>`).join("")}<th>主要判断</th></tr></thead><tbody>${people.map(([id,name]) => `<tr data-person-row="${id}"><td>${name}</td>${fields.map(([field]) => statusCell(id,field)).join("")}<td>${id === "zhoulan" ? '<strong class="intersection-label">四项交集候选</strong>' : reasonSelect(id)}${rationaleButton(id)}</td></tr>${state.matrixExpanded.includes(id) ? `<tr class="matrix-rationale"><td colspan="6"><strong>${name} · 证据说明</strong><p>${rationale[id]}</p></td></tr>` : ""}`).join("")}</tbody></table></div><div class="mobile-exclusion-cards">${mobileCards}</div>
      <div class="condition-proof"><h3>周岚为什么没有被排除？选择必须同时成立且分别有来源的四个条件</h3>${fields.map(([id,label]) => `<label><input type="checkbox" name="zhou-condition" value="${id}" ${state.zhouConditions.includes(id) ? "checked" : ""}><span><b>${label}</b><small>${id === "know" ? "岗位目录 + 本人签收与访问 → 实际知情" : id === "permission" ? "权限审计 → 受控门与工具" : id === "blank" ? "当班表 + 19:08 通行 → 实施窗口" : "卡柜日志 + 活体认证 + 连续路径"}</small></span></label>`).join("")}</div><button class="btn primary" data-action="solve-p10">提交排除链与唯一交集</button><div class="feedback" id="feedback-p10"></div></section>
    ${sceneReconstructionHtml()}
    <section class="puzzle">${state.solved.includes("p11") ? '<div class="deduction-banner"><strong>推理成立 · P11 旧案责任链</strong><span>四份原始文件分别固定提案、批准、签署与执行；两份人员记录独立连接周屿和周岚。</span></div>' : ""}<div class="puzzle-tag">P11 · 可选深度调查</div><h2>选择卷宗卡，再把它连接到责任主体与行为</h2><p class="muted">先点击一张档案卡，再点击主体槽位；随后为该主体选择文件实际记载的行为。手机端同样使用点击连接。</p><div class="file-fragments interactive-files">${[["file-a","A · 开发商会议纪要","“结构方案调整为 B 案，控制本季度成本。”"],["file-b","B · 监理联系单","“同意按 B 案继续施工，不停工复核。”"],["file-c","C · 验收修改页","林知秋、监理代表、工程总监签字。"],["file-d","D · 施工日志","“班组按 B 方案完成地下结构施工。”"]].map(([id,label,text]) => `<button class="file-card ${state.factAnswers.selectedChainFile === id ? "selected" : ""}" data-action="select-chain-file" data-file="${id}"><b>${label}</b><span>${text}</span></button>`).join("")}</div><div class="responsibility-board">${[["developer","开发商"],["supervisor","监理方"],["design","设计团队"],["contractor","施工方"]].map(([id,label]) => `<article class="responsibility-slot"><h3>${label}</h3><button class="attach-file" data-action="assign-chain-file" data-actor="${id}" ${state.factAnswers.selectedChainFile ? "" : "disabled"}>${state.chainFiles[id] ? `已连接：${fileLabels[state.chainFiles[id]]}` : "连接当前档案卡"}</button><div class="action-chips">${Object.entries(actionLabels).map(([value,text]) => `<button class="${state.chainAnswers[id] === value ? "selected" : ""}" data-action="choose-chain-action" data-actor="${id}" data-value="${value}">${text}</button>`).join("")}</div></article>`).join("")}</div><h3>哪两份人员记录能证明周岚与旧案的私人联系？</h3><div class="choices"><label class="choice"><input type="checkbox" name="p11-private" value="e_casualty"><span>2014 事故死亡名单</span></label><label class="choice"><input type="checkbox" name="p11-private" value="e_hr"><span>物业人事历史档案</span></label><label class="choice"><input type="checkbox" name="p11-private" value="e_debt"><span>程逸债务记录</span></label></div><button class="btn primary" data-action="solve-p11" ${state.evidence.includes("e_oldfile") ? "" : "disabled"}>形成责任链与私人联系</button><div class="feedback" id="feedback-p11">${state.evidence.includes("e_oldfile") ? "" : "先调查原始验收卷。"}</div></section>`;
  }

  function investigationPacketHtml(id, title, summary, files) {
    const packetState=state.factAnswers.investigationPackets && state.factAnswers.investigationPackets[id];
    const reviewed=Array.isArray(packetState) ? packetState : [];
    const expanded=state.factAnswers.openInvestigationPacket===id;
    const complete=files.every(([evidence])=>reviewed.includes(evidence));
    return `<article class="card investigation-packet ${complete?"done":""}" data-investigation-packet="${id}"><h3>${title}</h3><p>${summary}</p><div class="card-actions"><button class="btn" data-action="open-investigation-packet" data-packet="${id}" aria-expanded="${expanded}">${expanded?"收起档案包":complete?"复查档案包":"打开档案包"}</button><span class="meta">${reviewed.length}/${files.length} 份已读</span></div>${expanded?`<div class="packet-files">${files.map(([evidence,label,description])=>`<button type="button" class="packet-file ${reviewed.includes(evidence)?"reviewed":""}" data-action="review-packet-file" data-packet="${id}" data-evidence="${evidence}"><span>${reviewed.includes(evidence)?"已纳入案件簿":"待打开"}</span><strong>${label}</strong><small>${description}</small></button>`).join("")}</div>`:""}</article>`;
  }

  function chapter8() {
    const people = [["xuyoa","许遥"],["guxue","顾雪"],["liangwen","梁闻"],["chengyi","程逸"],["shenman","沈曼"],["zhoulan","周岚"]];
    const fields = [["know","知道隐蔽房间历史"],["permission","具备受控物业权限"],["blank","19点存在实施窗口"],["card","A047 当晚行为链"]];
    const marks = { yes:["✓","已证实"], no:["×","已排除"], unknown:["?","证据不足"] };
    const statusBadge = (id,field) => { const value=Logic.candidateStatus(state,id,field), mark=marks[value]; return `<span class="matrix-status ${value}" data-status="${id}-${field}"><b>${mark[0]}</b><small>${mark[1]}</small></span>`; };
    const reasons = [["","选择当前判断"],["alibi","关键时段连续在场"],["permission","不在受控权限名单"],["knowledge","无隐蔽房间知识"],["time","19 点行程没有空白"],["candidate","目前未被排除"]];
    const rationale = {
      xuyoa:"论坛直播、位置和签到记录连续覆盖关键时段；这能排除他的实施窗口，也能排除他在 21:41 操作 A047。",
      guxue:"复制日志补全了 19:03。权限审计只能排除她通过受控门、卡柜与搬运车架完成整套置换；不能据此声称她从未接触 A047。",
      liangwen:"通信记录只能证明他收到资料。权限记录可以排除受控实施条件，但不会自动生成一条“未接触 A047”的事实。",
      chengyi:"债务只能构成动机推测。权限记录可以排除受控实施条件；其余知识、行程和卡片接触仍应保持证据不足。",
      shenman:"她的证词解释声音来源。权限记录可以排除受控实施条件，但不能把未调查的卡片接触写成已排除。",
      zhoulan:"本人培训签收与访问审计对应实际知情；权限审计对应受控能力；当班表与 19:08 通行记录共同固定实施窗口；卡柜日志、活体认证和连续路径共同固定 A047 行为链。"
    };
    const hints={
      xuyoa:["缺口类别：关键时段是否存在实施窗口。","来源家族：公开活动的连续影像、位置与出入记录。",rationale.xuyoa],
      guxue:["缺口类别：是否具备受控物业实施条件。","来源家族：设备外查与物业权限审计；两者证明范围不同。",rationale.guxue],
      liangwen:["缺口类别：通信行为不能代替受控实施能力。","来源家族：通信服务器记录与物业权限审计。",rationale.liangwen],
      chengyi:["缺口类别：动机材料不能证明实施窗口或受控能力。","来源家族：保险文件与物业权限审计。",rationale.chengyi],
      shenman:["缺口类别：听见声音不能证明进入房间或操作门卡。","来源家族：结构图、证词与物业权限审计。",rationale.shenman],
      zhoulan:["缺口类别：知情、权限、窗口、卡片行为必须分别成立。","来源家族：培训访问、权限、排班通行、卡柜身份与连续路径。",rationale.zhoulan]
    };
    const reasonSelect = id => `<select data-exclusion-input="${id}" aria-label="${people.find(([person])=>person===id)[1]}主要排除理由">${reasons.map(([value,text])=>`<option value="${value}" ${state.exclusionAnswers[id]===value?"selected":""}>${text}</option>`).join("")}</select>`;
    const hintButton = id => { const level=Number(state.matrixHintLevels[id] || 0); return `<button class="text-button" data-action="reveal-matrix-hint" data-person="${id}">${level >= 3 ? "收起提示" : `查看第 ${level + 1} 层提示`}</button>`; };
    const hintPanel = (id,name,table=false) => { const level=Number(state.matrixHintLevels[id] || 0); if (!level) return ""; const body=hints[id].slice(0,level).map((text,index)=>`<p><b>${index+1}</b>${text}</p>`).join(""); return table ? `<tr class="matrix-rationale"><td colspan="6"><strong>${name} · 分层提示 ${level}/3</strong>${body}</td></tr>` : `<div class="candidate-rationale"><strong>分层提示 ${level}/3</strong>${body}</div>`; };
    const mobileCards=people.map(([id,name])=>`<article class="exclusion-card" data-person-card="${id}"><header><h3>${name}</h3></header><div class="candidate-status-list">${fields.map(([field,label])=>`<div><span>${label}</span>${statusBadge(id,field)}</div>`).join("")}</div><div class="candidate-decision">${reasonSelect(id)}${hintButton(id)}</div>${hintPanel(id,name)}</article>`).join("");
    const returnZhou=Number(state.interviews.zhoulan || 0)===2 && state.evidence.includes("e_cardauth") ? '<article class="card full return-interview"><h3>周岚 · 第二次质询</h3><p>第一次质询只触及岗位账号。活体认证已经取得，现在可以把“账号可能借用”的退路落实到自然人。</p><button class="btn primary" data-action="interview" data-person="zhoulan">带身份链返回询问</button></article>' : "";
    const nextOpen=Logic.chapterUnlocked(state,9);
    const candidateConfirmed=Boolean(state.solved.includes("p10") || (state.factAnswers.primaryCandidateConfirmed && state.primaryCandidate==="zhoulan"));
    const candidateOptions=people.map(([id,name])=>`<label class="choice"><input type="radio" name="primary-candidate" value="${id}" ${state.primaryCandidate===id?"checked":""}><span>${name}</span></label>`).join("");
    return `<section class="chapter-task-status" aria-label="第八章任务进度"><article class="${state.solved.includes("p10")?"done":""}"><b>条件交集</b><span>必做 · ${state.solved.includes("p10")?"已完成":"未完成"}</span></article><article class="${state.evidence.includes("e_struggle")?"done":""}"><b>冲突归属</b><span>必做 · ${state.evidence.includes("e_struggle")?"已核验":"未核验"}</span></article></section>
    <section class="free-investigation"><div class="eyebrow">OPEN INVESTIGATION · 行为归属</div><h2>逐份打开原始档案，再判断谁仍具备全部条件</h2><p class="muted">档案包本身不发放结论。只有打开其中的单份记录，它才会进入案件簿。</p><div class="grid">${investigationPacketHtml("property","物业审计包","权限、岗位、本人知情与当班记录分属不同材料，不能用其中一份替代其余三份。",[["e_permission","① 权限名单","谁具备受控门、卡柜与工具权限。"],["e_accountmap","② OPS-04 账号对应","岗位账号对应哪类职务。"],["e_trainingaccess","③ 培训签收与访问审计","谁本人接触过含 1402 的历史图。"],["e_shift","④ 当班表","案发时段由谁签名值守。"]])}${investigationPacketHtml("operation","卡柜与服务区档案包","把取卡账号、自然人身份、连续路线与工具痕迹逐段连接。",[["e_cardauth","① 卡柜活体认证","把 OPS-04 的取卡行为落实到自然人。"],["e_route","② 服务区通行记录","固定受监测位置与时间窗口。"],["e_cart","③ 搬运车架与轮迹复核","只证明工具痕迹，不单独证明载物内容。"]])}${investigationCard("conflict-review","法医 · 冲突接触复核","核对抓痕、指甲接触物与定向血液微滴，区分生前冲突和事后搬运。",["e_struggle"])}${returnZhou}</div></section>
    ${state.solved.includes("p10")?`<div class="deduction-banner"><strong>${nextOpen?"行为归属闭合 · 现场复原已开放":"置换者条件交集成立 · 冲突归属仍待核验"}</strong><span>${nextOpen?"下一章只处理密室如何被制造，不再重复人物筛选。":escapeHtml(Logic.chapterLockReason(state,9))}</span>${nextOpen?'<button class="btn primary" data-action="go-chapter" data-chapter="9">进入现场复原</button>':""}</div>`:""}
    <section class="puzzle"><div class="puzzle-tag">P10 · 条件交集</div><h2>知道还不够：逐人记录为什么不能完成置换</h2><p class="muted">✓ 已证实 · × 已排除 · ? 证据不足。界面不会预先标出唯一交集；先完成排除，再亲自从六人中选择仍满足全部条件的人。</p><div class="matrix-wrap desktop-exclusion"><table class="matrix exclusion-matrix"><thead><tr><th>人物</th>${fields.map(([,label])=>`<th>${label}</th>`).join("")}<th>当前判断</th></tr></thead><tbody>${people.map(([id,name])=>`<tr data-person-row="${id}"><td>${name}</td>${fields.map(([field])=>`<td>${statusBadge(id,field)}</td>`).join("")}<td>${reasonSelect(id)}${hintButton(id)}</td></tr>${hintPanel(id,name,true)}`).join("")}</tbody></table></div><div class="mobile-exclusion-cards">${mobileCards}</div><section class="candidate-choice"><h3>根据当前交集，谁仍同时满足全部实施条件？</h3><div class="choices compact-height-choices">${candidateOptions}</div><button class="btn" data-action="confirm-primary-candidate">确认候选人</button></section>${candidateConfirmed?`<div class="condition-proof"><h3>现在证明周岚为什么没有被排除：选择分别有来源的四个条件</h3>${fields.map(([id,label])=>`<label><input type="checkbox" name="zhou-condition" value="${id}" ${state.zhouConditions.includes(id)?"checked":""}><span><b>${label}</b><small>${id==="know"?"岗位条件与本人访问必须分开核验":id==="permission"?"只判断受控门与工具权限":id==="blank"?"排班与实际通行共同限定窗口":"原始日志、自然人身份与后续路径缺一不可"}</small></span></label>`).join("")}</div><button class="btn primary" data-action="solve-p10">提交排除链与唯一交集</button>`:'<p class="muted">确认候选人后，系统才会要求你证明该判断。</p>'}<div class="feedback" id="feedback-p10"></div></section>`;
  }

  function chapter9() {
    const complete=state.solved.includes("p10r") || state.legacyReconstruction;
    const finalOpen=Logic.chapterUnlocked(state,10);
    return `<section class="chapter-task-status"><article class="${state.evidence.includes("e_waterlab")?"done":""}"><b>延迟发现</b><span>${state.evidence.includes("e_waterlab")?"实验完成":"待复现"}</span></article><article class="${state.evidence.includes("e_hatch")&&state.evidence.includes("e_chain_tests")?"done":""}"><b>锁闭离场</b><span>${state.evidence.includes("e_hatch")&&state.evidence.includes("e_chain_tests")?"替代路径已测":"待勘查"}</span></article><article class="${complete?"done":""}"><b>犯罪时间轴</b><span>${state.solved.includes("p10r")?"新版完成":state.legacyReconstruction?"旧版结论保留":"待完成"}</span></article></section><section class="free-investigation"><div class="eyebrow">SCENE REENACTMENT · 只处理“如何”</div><h2>把人物判断暂时放下，验证水、门与另一条出口</h2><div class="grid">${investigationCard("water-reenactment","1102 · 浴室渗漏复现","按现场阀门开度和排水状态复现，检验 22:36 的发现时间是否被人为安排。",["e_waterlab"])}${investigationCard("chain-reconstruction","1102 · 检修口与门链替代测试","记录另一出口痕迹，分别测试门缝复位、正门离场和挂链后离场。",["e_hatch","e_chain_tests"])}</div></section>${sceneReconstructionHtml()}${complete?`<div class="deduction-banner"><strong>${finalOpen?"现场复原闭合 · 终章已开放":"旧版复原结论保留 · 仍需补齐来源"}</strong><span>${finalOpen?"下一章只汇总已经成立的事实，并回应最后的核心质疑。":escapeHtml(Logic.chapterLockReason(state,10))}</span>${finalOpen?'<button class="btn primary" data-action="go-chapter" data-chapter="10">进入终章</button>':""}</div>`:""}`;
  }

  function oldCaseHtml() {
    if (state.ending) {
      return state.solved.includes("p11")
        ? '<section class="sealed-record"><div class="eyebrow">SEALED RECORD · 结案档案</div><h2>2014 封存卷宗 · 只读</h2><p>责任时间链与周屿、周岚的人员连接已随本周目结案冻结。重新推演不会改写原结局；如需改变公开范围，请开始新周目。</p></section>'
        : "";
    }
    const mainProofsComplete=["q1","q2"].every(key=>Logic.storedProofStatus(state,key)==="current");
    if (!state.oldCaseDiscovered) {
      if (!mainProofsComplete) return "";
      return `<section class="sealed-record undiscovered-record"><div class="eyebrow">CASE DESK · 主案举证后</div><h2>桌边还留着一只未归档的文件袋</h2><p>核心质询已经回答。它不影响本案定罪，也没有写进当前任务清单；你可以现在提交主案，也可以多看一眼林知秋留下的资料。</p><button class="btn ghost" data-action="discover-old-case">整理林知秋遗留资料</button></section>`;
    }
    const fileLabels={"file-a":"A · 开发商会议纪要","file-b":"B · 监理联系单","file-c":"C · 验收修改页","file-d":"D · 施工日志"};
    const actionLabels={lower:"提出结构降配",approve:"批准继续施工",sign:"签署修改验收页",execute:"现场执行变更"};
    const fileData={
      "file-a":["A · 开发商会议纪要","“结构方案调整为 B 案，控制本季度成本。”"],
      "file-b":["B · 监理联系单","“同意按 B 案继续施工，不停工复核。”"],
      "file-c":["C · 验收修改页","林知秋、监理代表、工程总监签字。"],
      "file-d":["D · 施工日志","“班组按 B 方案完成地下结构施工。”"]
    };
    const responsibilityTimeline=state.responsibilityOrder.map((id,index)=>`<article data-responsibility-file="${id}"><small>责任节点 ${index+1}</small><strong>${fileData[id][0]}</strong><p>${fileData[id][1]}</p><div class="card-actions"><button type="button" data-action="move-responsibility-file" data-file="${id}" data-delta="-1" ${state.solved.includes("p11")||index===0?"disabled":""} aria-label="将${fileData[id][0]}前移">←</button><button type="button" data-action="move-responsibility-file" data-file="${id}" data-delta="1" ${state.solved.includes("p11")||index===state.responsibilityOrder.length-1?"disabled":""} aria-label="将${fileData[id][0]}后移">→</button></div></article>`).join("");
    return `<section class="sealed-record"><div class="eyebrow">SEALED RECORD · 新发现 · 与本案直接定罪无关</div><h2>2014 封存卷宗</h2><p>文件袋内是林知秋留下的原始验收卷。主案已经能够独立结案；这组材料只回答被删掉的房号为什么值得有人冒险重新制造。</p><div class="grid">${investigationCard("old-case-file","2014 原始验收卷","卷宗涉及提案、批准、验收与施工四个主体，也包含一份遇难者名单。",["e_oldfile","e_casualty","e_hr"],"逐页检查遗留资料")}</div></section>
    ${state.evidence.includes("e_oldfile")?`<section class="puzzle old-case-puzzle">${state.solved.includes("p11")?'<div class="deduction-banner"><strong>封存卷宗已厘清</strong><span>四份文件先形成责任时间链，再分别固定提案、批准、签署与执行；人员记录独立连接周屿和周岚。</span></div>':""}<div class="puzzle-tag">P11 · 封存卷宗</div><h2>先排列责任时间链，再连接主体、行为与人员记录</h2><p class="muted">这不是寻找单一替罪者。请按提案、批准、修改验收、实际施工的因果顺序整理文件，再确认每个环节由谁留下。</p><div class="responsibility-timeline" aria-label="2014 责任时间链">${responsibilityTimeline}</div><div class="file-fragments interactive-files">${Object.entries(fileData).map(([id,[label,text]])=>`<button class="file-card ${state.factAnswers.selectedChainFile===id?"selected":""}" data-action="select-chain-file" data-file="${id}"><b>${label}</b><span>${text}</span></button>`).join("")}</div><div class="responsibility-board">${[["developer","开发商"],["supervisor","监理方"],["design","设计团队"],["contractor","施工方"]].map(([id,label])=>`<article class="responsibility-slot"><h3>${label}</h3><button class="attach-file" data-action="assign-chain-file" data-actor="${id}" ${state.factAnswers.selectedChainFile?"":"disabled"}>${state.chainFiles[id]?`已连接：${fileLabels[state.chainFiles[id]]}`:"连接当前档案卡"}</button><div class="action-chips">${Object.entries(actionLabels).map(([value,text])=>`<button class="${state.chainAnswers[id]===value?"selected":""}" data-action="choose-chain-action" data-actor="${id}" data-value="${value}">${text}</button>`).join("")}</div></article>`).join("")}</div><h3>哪两份人员记录能连接遇难者周屿与周岚？</h3><div class="choices"><label class="choice"><input type="checkbox" name="p11-private" value="e_casualty"><span>2014 事故死亡名单</span></label><label class="choice"><input type="checkbox" name="p11-private" value="e_hr"><span>物业人事历史档案</span></label><label class="choice"><input type="checkbox" name="p11-private" value="e_debt"><span>程逸债务记录</span></label></div><button class="btn primary" data-action="solve-p11">形成封存卷宗责任链</button><div class="feedback" id="feedback-p11"></div></section>`:""}`;
  }

  function reportSelect(key, label, options) {
    const archived=state.ending && state.caseArchive && state.caseArchive.report;
    const values=archived || state.report;
    const automatic=Logic.REPORT_AUTO_KEYS.includes(key);
    const adopted=Boolean(state.ending || state.reportAdopted.includes(key));
    if (automatic) {
      const boundaryKeys=["deathPlace","cardUser","chainMethod"];
      const adoptionControl=boundaryKeys.includes(key) ? `<button type="button" class="btn ${adopted?"primary":""}" data-action="toggle-report-adoption" data-report-key="${key}" aria-pressed="${adopted}" ${state.ending||!values[key]?"disabled":""}>${adopted?"✓ 已采用":"采用该结论"}</button>` : `<span class="meta">${adopted?"✓ 已随基础事实采用":"等待批量采用"}</span>`;
      return `<div class="report-field report-prefilled ${adopted?"adopted":""}"><label for="report-${key}">${label}<small>${boundaryKeys.includes(key)?"关键边界 · 需你逐项确认":"已核验基础事实 · 可批量采用"}</small></label><div class="report-conclusion"><strong>${values[key] || "前置材料尚未闭合"}</strong>${adoptionControl}</div><select class="report-source-select" id="report-${key}" data-report="${key}" disabled aria-hidden="true" tabindex="-1"><option value="${values[key]||""}" selected>${values[key]||""}</option></select></div>`;
    }
    return `<div class="report-field"><label for="report-${key}">${label}</label><select id="report-${key}" data-report="${key}" ${state.ending ? "disabled" : ""}><option value="">— 选择 —</option>${options.map(value => `<option value="${value}" ${values[key] === value ? "selected" : ""}>${value}</option>`).join("")}</select></div>`;
  }

  function finalProofSummaryLegacy() {
    if (state.ending && state.legacyCaseRecord) return `<div class="legacy-proof-record"><strong>旧版结案证明 · 只读封存</strong><p>${escapeHtml(state.legacyCaseRecord.note || "该结案记录按旧版题序封存，不映射为新版举证轮次。")}</p></div>`;
    const archive=state.ending && state.caseArchive;
    const proofs=archive ? (archive.confrontation || {}) : state.confrontation;
    const versions=archive ? (archive.confrontationVersions || {}) : state.confrontationVersions;
    const legacy=archive ? {} : state.legacyProofRecords;
    const total=archive ? Math.max(5,Object.keys(proofs).length) : Logic.proofTotal(state);
    const rows=[];
    for (let step=1;step<=total;step+=1) {
      const key=`q${step}`, ids=proofs[key] || [];
      if (ids.length && Number(versions[key]) === Logic.PROOF_RULE_VERSION) {
        const proof=Logic.validateConfrontationAnswer(step,ids);
        rows.push(`<p class="proof-current"><small>第 ${step} 轮 · 当前规则</small><strong>${ids.map(id=>EVIDENCE[id] ? EVIDENCE[id][0] : id).join(" + ")}</strong><span>${proof.ok ? proof.explanation : "记录缺项，需要复核；不能作为当前通过的证明。"}</span></p>`);
      } else if (legacy[key]) {
        rows.push(`<p class="proof-legacy"><small>第 ${step} 轮 · 旧版规则</small><strong>${legacy[key].evidence.map(id=>EVIDENCE[id] ? EVIDENCE[id][0] : id).join(" + ") || "旧版组合"}</strong><span>${escapeHtml(legacy[key].note)}</span></p>`);
      }
    }
    return rows.length ? `<div class="final-proof-summary">${rows.join("")}</div>` : '<div class="legacy-proof-record"><strong>证明记录需要复核</strong><p>当前没有可按现行规则验证的完整举证记录。</p></div>';
  }

  function finalProofSummary() {
    const archive=state.ending && state.caseArchive;
    if (archive && Number(archive.saveVersion || 0) < Logic.SAVE_VERSION) {
      const archiveVersion=Number(archive.saveVersion || 0);
      const oldLabels=archiveVersion===9
        ? {q1:"死亡地点",q2:"致命冲突行为人",q3:"封存卷宗"}
        : {q1:"死亡地点",q2:"搬运连接",q3:"持卡身份",q4:"致命冲突",q5:"锁闭复原",q6:"旧案联系"};
      const rows=Object.entries(archive.confrontation || {}).map(([key,ids])=>`<p class="proof-legacy"><small>${oldLabels[key]||key} · v${archive.saveVersion} 只读</small><strong>${(ids||[]).map(id=>EVIDENCE[id]?EVIDENCE[id][0]:id).join(" + ")||"旧版组合"}</strong><span>按结案时规则封存，不使用当前题序重新解释。</span></p>`).join("");
      return `<div class="legacy-proof-record"><strong>旧版结案证明 · 只读封存</strong><p>${escapeHtml(state.legacyCaseRecord&&state.legacyCaseRecord.note||archive.note||"旧版报告与证明保持原样。")}</p>${rows}</div>`;
    }
    const proofs=archive?(archive.confrontation||{}):state.confrontation;
    const versions=archive?(archive.confrontationVersions||{}):state.confrontationVersions;
    const total=archive?(proofs.q3?3:2):Logic.proofTotal(state);
    const rows=[];
    for (let step=1;step<=total;step+=1) {
      const key=`q${step}`, ids=proofs[key]||[];
      if (ids.length && Number(versions[key])===Logic.PROOF_RULE_VERSION) {
        const proof=Logic.validateConfrontationAnswer(step,ids);
        rows.push(`<p class="proof-current"><small>核心质询 ${step} · 当前规则</small><strong>${ids.map(id=>EVIDENCE[id]?EVIDENCE[id][0]:id).join(" + ")}</strong><span>${proof.ok?proof.explanation:"记录缺项，需要复核。"}</span></p>`);
      }
    }
    if (!archive && Object.keys(state.legacyProofRecords||{}).length) {
      const legacyRows=Object.entries(state.legacyProofRecords).map(([key,record])=>`<p class="proof-legacy"><small>${key} · 旧版题序</small><strong>${record.evidence.map(id=>EVIDENCE[id]?EVIDENCE[id][0]:id).join(" + ")||"旧版组合"}</strong><span>${escapeHtml(record.note)}</span></p>`).join("");
      rows.push(`<div class="legacy-proof-record"><strong>旧版举证已封存</strong><p>这些记录不会冒充新版核心质询通过。</p>${legacyRows}</div>`);
    }
    return rows.length?`<div class="final-proof-summary">${rows.join("")}</div>`:`<div class="legacy-proof-record"><strong>核心证明尚待完成</strong><p>${state.oldCaseDiscovered ? "当前终章包含地点、致命行为与新发现卷宗三类质询。" : "当前终章只要求回应死亡地点与致命行为两类核心质询。"}</p></div>`;
  }

  function disclosureModalHtml() {
    if (!Logic.canSubmitDisclosure(state)) return `<div class="eyebrow">JUDGMENT · 暂停提交</div><h2>公开决定尚不能提交</h2>${finalProofSummary()}<p>当前报告或历史举证已经发生变化，需要先回到终章复核。已完成的现行举证会保留。</p><div class="card-actions"><button class="btn primary" data-action="close-modal">返回终章复核</button></div>`;
    return `<div class="eyebrow">JUDGMENT · 等待公开决定</div><h2>最后，哪些事实写入公开报告？</h2>${finalProofSummary()}<p>${state.solved.includes("p11") ? "主案与新发现的历史责任链都已成立。" : state.oldCaseDiscovered ? "主案已经成立；遗留资料仍在整理中。" : "主案证据链已经成立。你仍可关闭这里，检查桌边尚未归档的遗留资料。"}</p><div class="card-actions"><button class="btn primary" data-action="choose-disclosure" data-choice="full">提交现有全部调查</button>${state.solved.includes("p11") ? '<button class="btn ghost" data-action="choose-disclosure" data-choice="culprit-only">只报告本案刑事事实</button>' : ""}</div>`;
  }

  function chapter10() {
    if (!state.ending) state.report=Logic.prefillReport(state.report,state);
    const reportPassed = Logic.isCurrentReportVerified(state);
    const reportState = Logic.reportStatus(state);
    const resolution = Logic.caseResolutionState(state);
    const baseAdoptionKeys=["deathTime","cufflink","sound","waterStart"];
    const baseFactsAdopted=baseAdoptionKeys.every(key=>state.reportAdopted.includes(key));
    const feedback=reportState === "closed" ? "报告已随结案档案冻结，只读显示当时通过复核的快照。" : reportState === "verified" ? "当前报告快照已通过复核与一致性校验。若修改判断或撤回采用事实，将立即转为待复核；已完成举证不会丢失。" : reportState === "modified" ? "报告在上次通过后已修改，当前公开提交暂停；即使改回原值，也必须再次复核。" : "死亡地点、A047 使用者与门链离场需逐项确认；四项已核验基础事实可以一次采用，另外三项仍需主动判断。所有选择都会实时保存。";
    return `${oldCaseHtml()}<div class="document"><h3>案件重构报告 · CJ-0917</h3><p><strong>固定事实：</strong>尸体于 22:47 在 1102 被发现。其余既成结论会显示支持状态，但只有你点击“采用该结论”后才写入本次报告。</p></div>
    <section class="reconstruction-strip" aria-label="现场复原步骤"><article><b>19:08—19:27</b><span>周岚处于 14F 受控区</span><small>直接记录 · 服务区门控</small></article><article><b>19:16—19:18</b><span>1402 致命冲突</span><small>联合复核 + 冲突接触检验</small></article><article><b>20:43 / 约20:46</b><span>经管井进入 1102 并开始放水</span><small>直接记录 + 实验估算</small></article><article><b>21:19—21:41</b><span>取卡、搬运、认证并开合正门</span><small>身份、路径、认证与门磁</small></article><article><b>21:49</b><span>挂链后经检修口离开</span><small>现场痕迹 + 路径 + 门磁复原</small></article></section>
    <section class="puzzle"><div class="puzzle-tag">P12 · 完整案件重构</div><h2>确认三项关键边界，再汇总其余已核验事实</h2><p class="muted">死亡地点、A047 使用者和门链离场方式仍需逐项确认。死亡区间、袖扣、声音与放水时间来自已经完成的核验，可在检查后一次写入报告。</p><div class="report-grid">
      ${reportSelect("deathPlace","死亡地点",["1102","1402","消防楼梯"])}
      ${reportSelect("deathTime","法医死亡判断区间",["18:34—18:40","19:16—19:18","21:41—21:45","无法判断"])}
      ${reportSelect("cardUser","A047 门禁卡使用者",["林知秋","许遥","周岚","无法判断"])}
      ${reportSelect("cufflink","袖扣来源",["当晚搏斗掉落","两周前遗留","周岚伪造"])}
      ${reportSelect("sound","沈曼听见的声音",["1102 内的搏斗","14层管道结构传声","直播音频"])}
      ${reportSelect("transferReason","现场置换的直接作用",["陷害许遥","制造密室奇观","伪造1102内晚间死亡"])}
      ${reportSelect("waterStart","浴室开始放水",["约19:16","约20:46","21:41","无法估算"])}
      ${reportSelect("chainMethod","门链形成与离场",["从门缝复位门链","室内挂链后经浴室检修通道离开","一直藏在1102直到破门","无法解释"])}
      ${reportSelect("stager","完成现场置换的人",["许遥","顾雪","梁闻","周岚"])}
      ${reportSelect("fatalActor","与致命撞击直接相关的冲突行为人",["许遥","顾雪","梁闻","周岚","证据不足"])}
      </div><div class="card-actions"><button class="btn ${baseFactsAdopted?"ghost":"primary"}" data-action="toggle-base-report-adoption" aria-pressed="${baseFactsAdopted}" ${state.ending ? "disabled" : ""}>${baseFactsAdopted?"✓ 其余四项基础事实已采用":"采用其余四项已核验基础事实"}</button><button class="btn primary" data-action="validate-report" ${state.ending ? "disabled" : ""}>${reportPassed ? "重新复核当前报告" : "复核并封存当前报告"}</button></div><div class="feedback ${reportPassed || state.ending ? "good" : reportState === "modified" ? "bad" : ""}" id="feedback-report">${feedback}</div></section>
      ${reportPassed && resolution === "proving" ? confrontationHtml() : resolution === "awaiting-disclosure" ? `<div class="deduction-banner pending-disclosure"><strong>最终举证已完成 · 等待公开决定</strong><span>即使关闭弹窗、刷新或离开页面，也可以从这里继续；提交时还会再次检查报告快照与每轮举证。</span><button class="btn primary" data-action="continue-disclosure">继续提交报告</button></div>` : resolution === "awaiting-report-review" ? '<div class="deduction-banner warning"><strong>最终举证已保留 · 报告修改后待复核</strong><span>重新复核当前报告后即可恢复公开决定，不必重做举证。</span></div>' : resolution === "awaiting-proof-review" ? '<div class="deduction-banner warning"><strong>新增质询尚待完成</strong><span>已完成的主案举证保持有效；新发现的封存卷宗需单独形成责任链并回应追加质询。</span></div>' : resolution === "closed" ? `<div class="deduction-banner"><strong>本周目已结案 · 结局 ${state.ending}</strong><span>${state.legacyCaseRecord ? "旧版报告与证明已按原规则封存，不会套入新版举证。" : "报告快照、举证、公开决定与结案记录均已冻结保存。"}</span><button class="btn" data-action="view-ending">查看结局</button></div>${finalProofSummary()}` : ""}`;
  }

  function confrontationHtml() {
    const questions = [
      "你能证明 1402 存在。可你怎么证明林知秋死在那里？",
      "你证明了我后来处理现场。可你怎么证明，19:16 那次冲突也与我有关？",
      "你已经证明本案。为什么还要翻十二年前的资料？"
    ];
    const responses = ["周岚看向桌面：“……林知秋确实是在那面墙前倒下的。”","她看见袖口的定向微滴报告，沉默不再能把冲突藏到搬运之后。","“周屿是我哥哥。十二年了，文件里却只写他违规。”"];
    const total = Logic.proofTotal(state);
    const step = Math.min(Logic.nextConfrontationStep(state), total - 1);
    state.confrontationStep=step;
    const transcript = Array.from({length:total},(_,index)=>index+1).map(index => {
      const key=`q${index}`, ids=state.confrontation[key] || [], status=Logic.storedProofStatus(state,key);
      if (status === "current" && ids.length) { const proof=Logic.validateConfrontationAnswer(index,ids); return `<div class="dialogue-line"><span>第 ${index} 轮闭环 · 当前规则</span><strong>${ids.map(id => EVIDENCE[id] ? EVIDENCE[id][0] : id).join(" + ")}</strong><p>${proof.explanation}</p><blockquote>${responses[index-1]}</blockquote></div>`; }
      if (status === "legacy" && state.legacyProofRecords[key]) return `<div class="dialogue-line legacy"><span>第 ${index} 轮 · 旧版规则</span><strong>${state.legacyProofRecords[key].evidence.map(id=>EVIDENCE[id] ? EVIDENCE[id][0] : id).join(" + ") || "旧版组合"}</strong><p>${escapeHtml(state.legacyProofRecords[key].note)}</p></div>`;
      return "";
    }).join("");
    const orderedEvidence = [...state.pinnedEvidence, ...state.evidence.filter(id => !state.pinnedEvidence.includes(id))];
    const draftKey = `q${step + 1}`, draft = state.confrontationDraft[draftKey] || [], expanded = state.confrontationExpanded[draftKey] || [];
    const visibleEvidence=state.confrontationOnlySelected ? orderedEvidence.filter(id=>draft.includes(id)) : orderedEvidence;
    const evidenceList=visibleEvidence.length ? visibleEvidence.map(id => { const isExpanded=expanded.includes(id), model=Logic.EVIDENCE_PROVENANCE[id]; return `<article class="evidence-choice-card ${evidenceMaterialClass(id)} ${state.pinnedEvidence.includes(id) ? "pinned" : ""}" data-proof-id="${id}"><label class="evidence-choice"><input type="checkbox" name="confrontation-evidence" value="${id}" ${draft.includes(id) ? "checked" : ""}><span class="source">${EVIDENCE[id][1]}${model && model.stage === "derived" ? " · 派生" : ""}</span><strong>${EVIDENCE[id][0]}</strong></label><button type="button" class="evidence-summary-toggle" data-action="toggle-proof-summary" data-evidence="${id}" aria-expanded="${isExpanded}">${isExpanded ? "收起摘要" : "展开摘要"}</button><p class="evidence-choice-summary" ${isExpanded ? "" : "hidden"}>${EVIDENCE[id][2]}</p></article>`; }).join("") : '<div class="proof-empty"><strong>尚无已选材料</strong><p>返回全部材料后选择能直接回答当前质疑的来源。</p><button type="button" class="btn ghost" data-action="toggle-selected-proofs">查看全部材料</button></div>';
    const legacyNotice=Object.keys(state.legacyProofRecords||{}).length?`<div class="legacy-proof-record"><strong>旧版举证已封存</strong><p>旧题序不会被套入本版判断；当前只需完成下方两项主案质询${state.oldCaseDiscovered?"，新发现材料会单独增加一项":""}。</p></div>`:"";
    return `<section class="puzzle confrontation" id="current-confrontation"><div class="puzzle-tag">FINAL CONFRONTATION · ${step + 1}/${total}</div><h2>周岚：“${questions[step]}”</h2>${legacyNotice}<div class="confrontation-toolbar" role="region" aria-label="当前举证操作"><span id="proof-selection-count">第 ${step + 1} 轮 · 已选 ${draft.length}/3</span><button type="button" class="btn ghost" data-action="toggle-selected-proofs" aria-pressed="${state.confrontationOnlySelected}">${state.confrontationOnlySelected ? "查看全部材料" : "仅查看已选材料"}</button><button class="btn primary" data-action="validate-confrontation">出示所选材料</button></div>${transcript}<p class="muted">必要证据齐全即可通过；相关材料可以补强时间、身份或路径，无关材料仍需移除。派生材料与其引用来源不会重复计算为独立支持。</p><div class="confrontation-evidence">${evidenceList}</div><div class="feedback" id="feedback-confrontation"></div></section>`;
  }

  function evidenceMaterialClass(id) {
    const source=EVIDENCE[id] ? EVIDENCE[id][1] : "";
    if (Logic.OLD_CASE_EVIDENCE.includes(id)) return "material-old-case";
    if (/法医|实验室/.test(source)) return "material-forensic";
    if (/图纸|档案馆|工程|结构记录/.test(source) || ["e_plan1102","e_plan2012","e_plan2019","e_pipe"].includes(id)) return "material-blueprint";
    if (/系统|门锁|门磁|卡柜|门控|物业/.test(source)) return "material-system";
    if (/照片|手机|私人|通信/.test(source) || ["e_cuffphoto","e_message","e_copy","e_debt"].includes(id)) return "material-private";
    return "material-scene";
  }

  function evidenceMatches(id) {
    const personMap = {
      xu: ["e_cufflink","e_cuffphoto","e_stream","e_location","e_checkin"],
      zhou: ["e_permission","e_accountmap","e_trainingaccess","e_shift","e_cardauth","e_route","e_cart","e_struggle","e_oldfile","e_casualty","e_hr"],
      lin: ["e_body","e_body_review","e_dna","e_water","e_waterlab","e_shelf","e_plan1102","e_fixed","e_impact","e_floor","e_watch","e_access","e_doorcontact","e_hatch","e_chain_tests","e_chaintrial","e_struggle","e_oldfile"],
      gu: ["e_copy"], liang: ["e_message"], shen: ["e_pipe"]
    };
    const source = EVIDENCE[id][1];
    const sourceMatch = notebookView.source === "all" ||
      (notebookView.source === "scene" && /现场|物证|痕迹/.test(source)) ||
      (notebookView.source === "system" && /系统|运营商|记录/.test(source)) ||
      (notebookView.source === "plan" && /图纸|档案|工程/.test(source)) ||
      (notebookView.source === "old" && Logic.OLD_CASE_EVIDENCE.includes(id));
    const personMatch = notebookView.person === "all" || (personMap[notebookView.person] || []).includes(id);
    return sourceMatch && personMatch;
  }

  function renderNotebook() {
    topbar.hidden = false;
    state.screen = "notebook";
    const filtered = state.evidence.filter(evidenceMatches);
    const progress=Logic.evidenceProgress(state);
    const evidenceHtml = `<div class="notebook-progress"><span><b>主案</b>${progress.found}/${progress.total}</span><span><b>补充</b>${progress.supplementalFound}/${progress.supplementalTotal}</span>${state.oldCaseDiscovered ? `<span><b>封存卷宗</b>${progress.oldCaseFound}/${progress.oldCaseTotal}</span>` : ""}</div><div class="notebook-tools"><label>人物<select id="notebook-person"><option value="all">全部人物</option><option value="xu">许遥</option><option value="zhou">周岚</option><option value="lin">林知秋</option><option value="gu">顾雪</option><option value="liang">梁闻</option><option value="shen">沈曼</option></select></label><label>来源<select id="notebook-source"><option value="all">全部来源</option><option value="scene">现场 / 物证</option><option value="system">系统 / 记录</option><option value="plan">图纸 / 工程</option>${state.oldCaseDiscovered ? '<option value="old">封存卷宗</option>' : ""}</select></label><span class="meta">已钉选 ${state.pinnedEvidence.length}/3</span></div>${notebookView.returnDeduction ? '<button class="text-button notebook-back-link" data-action="return-to-deduction">← 返回原推论</button>' : ""}<div class="evidence-list">${filtered.length ? filtered.map(id => { const e = EVIDENCE[id], pinned = state.pinnedEvidence.includes(id), focused=notebookView.focusEvidence===id, model=Logic.EVIDENCE_PROVENANCE[id]; return `<article class="evidence-card ${evidenceMaterialClass(id)} ${model&&model.stage==="derived"?"material-derived":""} ${pinned ? "pinned" : ""} ${focused ? "notebook-focus" : ""}" data-notebook-evidence="${id}" tabindex="-1"><span class="source">${e[1]}</span>${ORIGIN_BADGES[id] ? `<span class="origin-badge">${ORIGIN_BADGES[id]}</span>` : ""}<h3>${e[0]}</h3><p>${e[2]}</p><button class="text-button" data-action="pin-evidence" data-evidence="${id}">${pinned ? "取消钉选" : "钉在顶部"}</button></article>`; }).join("") : '<p class="muted">当前筛选下没有材料。</p>'}</div>`;
    const deductionHtml = `<div class="evidence-list">${state.deductions.length ? state.deductions.map(id => { const d = DEDUCTIONS[id], links=(DEDUCTION_LINKS[id] || []).filter(eid => state.evidence.includes(eid)); return `<article class="evidence-card deduction-card ${notebookView.focusDeduction===id ? "notebook-focus" : ""}" data-notebook-deduction="${id}" tabindex="-1"><span class="source">DEDUCTION</span><h3>${d[0]}</h3><p>${d[1]}</p>${links.length ? `<div class="related-evidence"><strong>关联证据</strong>${links.map(eid => `<button type="button" data-action="open-related-evidence" data-evidence="${eid}" data-deduction="${id}">${EVIDENCE[eid][0]}</button>`).join("")}</div>` : ""}</article>`; }).join("") : '<p class="muted">推论必须由材料组合产生。</p>'}</div>`;
    app.innerHTML = `<section class="screen"><div class="eyebrow">CASE NOTEBOOK</div><div class="notebook-heading"><h1 class="chapter-title">案件簿</h1>${state.notebookReturn ? `<button class="btn primary" data-action="return-from-notebook">${state.notebookReturn.chapter === 10 ? "返回当前举证" : `返回第${toChinese(state.notebookReturn.chapter)}章原位置`}</button>` : ""}</div>${state.pinnedEvidence.length ? `<div class="pinned-strip">${state.pinnedEvidence.map(id => `<span class="evidence-chip">${EVIDENCE[id][0]}</span>`).join("")}</div>` : ""}<div class="notebook-tabs"><button class="${notebookView.tab === "evidence" ? "active" : ""}" data-action="notebook-tab" data-tab="evidence">案件材料 ${state.evidence.length}</button><button class="${notebookView.tab === "deductions" ? "active" : ""}" data-action="notebook-tab" data-tab="deductions">推论 ${state.deductions.length}</button></div>${notebookView.tab === "evidence" ? evidenceHtml : deductionHtml}</section>`;
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
      { time:has("e_watch") ? "19:16" : "时间待核验", text:has("e_body_review") ? "联合复核把剧烈冲击定位到 1402" : "手表记录到剧烈冲击与心率急降，地点未定", source:has("e_body_review") ? "派生材料 · 手表 + 现场比对" : "智能手表", type:has("e_body_review") ? "inference" : "direct", known:has("e_watch") },
      { time:has("e_body_review") ? "19:16—19:18" : has("e_body") ? "19:00—20:00" : "区间待初检", text:has("e_body_review") ? "联合复核收窄死亡判断区间" : "尸表初检给出宽泛死亡区间", source:has("e_body_review") ? "派生材料 · 引用初检、手表与现场" : "尸表初检", type:has("e_body_review") ? "inference" : "estimate", known:has("e_body") },
      { time:has("e_body_review") && has("e_route") && has("e_struggle") ? "19:16—19:18" : "行为人待核验", text:has("e_body_review") && has("e_route") && has("e_struggle") ? "周岚与致命撞击前的生前冲突直接相关" : "致命冲突行为人尚未形成三段连接", source:"联合复核 + 通行记录 + 冲突接触复核", type:"inference", known:has("e_body_review") && has("e_route") && has("e_struggle") },
      { time:"19:31—22:31", text:solved("p02") ? "许遥连续处于建筑论坛会场" : "许遥的会场记录待核验", source:"直播、位置与会场三种来源", type:"direct", known:solved("p02") },
      { time:"20:43—20:50", text:has("e_route") ? "ZL-017 工牌进出 11F 管井走廊" : "11F 管井走廊通行待核验", source:"服务区门控原始记录", type:"direct", known:has("e_route") },
      { time:has("e_waterlab") ? "约20:46" : "约?", text:has("e_waterlab") ? "1102 浴室开始按现场流量放水" : "浴室放水开始时间待复现", source:"浴室渗漏复现实验", type:"estimate", known:has("e_waterlab") },
      { time:"21:19", text:has("e_cardauth") ? "活体认证确认周岚取出 A047" : has("e_cardlog") ? "OPS-04 账号取出 A047，身份待核验" : "A047 取出记录待核验", source:has("e_cardauth") ? "卡柜日志 + 活体认证" : "卡柜原始日志", type:"direct", known:has("e_cardlog") },
      { time:"21:37", text:has("e_route") ? "服务梯从 14F 下行至 11F" : "搬运路径待核验", source:"服务梯控制记录", type:"direct", known:has("e_route") },
      { time:"21:41:08", text:"A047 凭证认证通过，锁舌释放", source:"1102 锁具认证日志", type:"direct", known:has("e_access") },
      { time:"21:41:10—32", text:"1102 门扇打开后关闭；身份与方向未知", source:"1102 连续门磁记录", type:"direct", known:has("e_doorcontact") },
      { time:"21:49", text:has("e_route") ? "ZL-017 工牌从 11F 管井走廊离开" : "离场路径待核验", source:"服务区门控原始记录", type:"direct", known:has("e_route") },
      { time:"22:36", text:"楼下报告渗水", source:"物业工单", type:"direct", known:true },
      { time:"22:47", text:"破门发现尸体与室内门链", source:"出警记录", type:"direct", known:true }
    ];
    const labels={direct:"直接记录",estimate:"实验估算",inference:"证据推论"};
    app.innerHTML = `<section class="screen"><div class="eyebrow">VERIFIED TIMELINE</div><h1 class="chapter-title">案件时间线</h1><p class="lead">每条事件都标明证据层级；直接记录、实验估算和推论不会混写。未确认项目保持灰色，不补入精确行为人。</p><div class="timeline-list dynamic-timeline">${events.map(event => `<div class="timeline-item ${event.known ? "known" : "unknown"} timeline-${event.type}"><span><strong>${event.time}</strong> · ${event.known ? event.text : "??? · " + event.text}<br><small class="timeline-kind ${event.type}">${labels[event.type]}</small><small class="muted">${event.source}</small></span></div>`).join("")}</div></section>`;
    updateHeader();
  }

  function renderMapLegacy() {
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

  function renderMap() {
    topbar.hidden=false;
    state.screen="map";
    const floors=[["external","楼外"],["14","14F"],["11","11F"],["1","1F"],["property","物业"]];
    const revealed1402=state.solved.includes("p04"), suspected=state.solved.includes("p03");
    const hasPipe=state.evidence.includes("e_pipe"), hasRoute=state.evidence.includes("e_route"), hasHatch=state.evidence.includes("e_hatch"), reconstructed=state.solved.includes("p10r");
    const rooms=[
      ["external",2,"建筑论坛会场","连续在场证明"],["external",4,"市档案馆","建筑档案比对"],
      ["11",1,"1102 现场","尸体发现与锁闭状态"],["11",3,"1102 复测","空间尺寸复核"],["11",9,"1102 复原","水、门链与检修口"],
      ["14",5,revealed1402?"1402":suspected?"封闭区域":"14F 住户区",revealed1402?"房号已从旧图恢复":suspected?"尺寸异常后出现待查空间":"尚无异常记录"],
      ["1",6,"门体与卡柜系统","认证、门磁与语义边界"],["property",7,"人物查证","六种不同核验方式"],["property",8,"案件分析室","条件交集与行为归属"],["property",10,"结案室",state.oldCaseDiscovered?"报告、遗留卷宗与公开决定":"案件报告与公开决定"]
    ].filter(([floor])=>floor===mapFloor);
    const routeButton=(className,label,evidence)=>`<button type="button" class="schematic-route ${className}" data-action="open-map-evidence" data-evidence="${evidence.join(",")}" aria-label="查看${label}的支持材料">${label}</button>`;
    const reconstructionPath=reconstructed?routeButton("route-reconstruction","①14F冲突 → ②管井放水 → ③正门搬运 → ④室内挂链 → ⑤检修口离开",["e_chaintrial","e_route","e_doorcontact"]):"";
    app.innerHTML=`<section class="screen"><div class="eyebrow">PROGRESSIVE BUILDING SCHEMATIC</div><h1 class="chapter-title">建筑关系图</h1><p class="lead">空间、管道与服务路线只在取得对应材料后出现。点击已揭示的路线段，可以直接核对支持该段的材料。</p><div class="building-schematic map-stage-${revealed1402?"named":suspected?"suspected":"initial"}" role="group" aria-label="临江壹号渐进建筑剖面"><div class="schematic-floor floor-14"><b>14F</b><span>1401</span><span class="schematic-room hidden-room">${revealed1402?"1402":suspected?"封闭区域":"未调查"}</span><span>1403</span></div><div class="schematic-core">服务核心${hasRoute?routeButton("route-service","服务梯 / 受监测通道",["e_route"]):""}</div><div class="schematic-floor floor-11"><b>11F</b><span>1101</span><span class="schematic-room room-1102">1102</span><span>1103</span></div>${hasPipe?routeButton("route-pipe","共用竖向管井",["e_pipe"]):""}${hasHatch?routeButton("route-hatch","浴室检修口支路",["e_hatch","e_route","e_chain_tests","e_doorcontact"]):""}${reconstructionPath}</div><div class="map-legend"><span>房间</span>${hasPipe?'<span>管井</span>':""}${hasRoute?'<span>服务路线</span>':""}${hasHatch?'<span>检修口</span>':""}</div><div class="map-layout"><nav class="floor-tabs">${floors.map(([id,label])=>`<button class="${mapFloor===id?"active":""}" data-action="map-floor" data-floor="${id}">${label}</button>`).join("")}</nav><div class="building-map">${rooms.map(([,chapter,name,desc])=>`<button class="map-room" data-action="go-chapter" data-chapter="${chapter}" ${Logic.chapterUnlocked(state,chapter)?"":"disabled"}><strong>${name}</strong><small>${desc}</small></button>`).join("")}</div></div></section>`;
    updateHeader();
  }

  function renderEnding(id) {
    topbar.hidden = true;
    state.screen = `ending-${id}`;
    const endings = {
      A: ["ENDING A · 正确答案","正确答案","冲突接触复核已在结案前把周岚连接到 19:16 的生前冲突；她随后承认冲突与现场置换，成为对既有证据链的印证，而不是第一份答案。你找到了从系统中消失的房间，却没有查全十二年前的原始卷宗与人员关系；2014 年事故只留下待复核标记，尚未进入公开追责程序。"],
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
    const rating=Logic.reasoningRating(state);
    const critique = id === "B" ? `<section class="theory-autopsy"><h2>报告内部自洽度不足</h2><div><b>× 连续在场</b><span>19:40—22:20 直播、位置与会场记录封闭了许遥的往返窗口。</span></div><div><b>× 地点前提</b><span>1402 的撞击、血迹与搬运痕迹不支持 1102 是死亡第一现场。</span></div><div><b>× 门卡解释</b><span>21:41 的 A047 日志只证明凭证认证通过；门磁也不记录通过者身份。</span></div></section>` : "";
    app.innerHTML = `<section class="ending"><div class="ending-letter">${label}</div><h1 class="${id === "D" ? "title-shift" : ""}">${title}</h1><p class="ending-copy">${copy}</p>${critique}<div class="case-rating"><span>研判档案评级</span><strong>${rating}</strong><small>推理修正 ${state.mistakes} 次 · 评级不改变结局</small></div><div class="epilogue-grid">${epilogues[id].map(([name,text]) => `<article><strong>${name}</strong><p>${text}</p></article>`).join("")}</div><p class="muted">已收集 ${state.evidence.length} 条材料 · 关键人物查证 ${Logic.CORE_INTERVIEWS.filter(x => Number(state.interviews[x] || 0) >= 3).length}/4 · 结局档案 ${state.meta.endings.join(" / ")}</p><div class="ending-actions"><button class="btn primary" data-action="review-case">返回案件总览</button><button class="btn ghost" data-action="confirm-new">开始新周目</button></div></section>`;
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
      openModal(`<div class="eyebrow">${person.tag} · 第一阶段</div><h2>${person.name} · 选择两个检验方向</h2><p class="muted">不同人物需要不同的核验方式；选择能真正触及这句话边界的话题。</p><div class="choices">${person.topics.map(topic => `<label class="choice"><input type="checkbox" name="interview-topic" value="${topic}"><span>${topic}</span></label>`).join("")}</div><button class="btn primary" data-action="submit-interview-topic" data-person="${id}">记录询问方向</button><div class="feedback" id="feedback-interview"></div>`);
    } else if (round === 1) {
      openModal(`<div class="eyebrow">${person.tag} · 措辞边界</div><h2>“${person.statement}”</h2><p class="muted">判断她是在省略限定，还是把自己的来源判断当成了事实；不要默认每个人都在说纯粹谎言。</p><div class="choices">${[["fact","完整事实"],["inference","把推测说成事实"],["omission","省略关键限定"],["lie","可以被直接证伪的谎言"]].map(([v,t]) => `<label class="choice"><input type="radio" name="interview-kind" value="${v}"><span>${t}</span></label>`).join("")}</div><button class="btn primary" data-action="submit-interview-kind" data-person="${id}">提交判断</button><div class="feedback" id="feedback-interview"></div>`);
    } else if (round === 2) {
      openModal(`<div class="eyebrow">ROUND 3 · 举证</div><h2>用哪条材料迫使${person.name}补全原话？</h2><div class="confrontation-evidence">${state.evidence.map(eid => `<label class="evidence-choice"><input type="radio" name="interview-evidence" value="${eid}"><span class="source">${EVIDENCE[eid][1]}</span><strong>${EVIDENCE[eid][0]}</strong></label>`).join("")}</div><button class="btn primary" data-action="submit-interview-evidence" data-person="${id}">出示材料</button><div class="feedback" id="feedback-interview"></div>`);
    }
  }

  function handleAction(action, target) {
    if (action === "new-game") { state.started = true; saveState(true); renderChapter(1); }
    if (action === "continue-game") resumeGame();
    if (action === "show-home" || action === "review-case") { state.notebookReturn=null; saveState(true); renderHome(); }
    if (action === "show-map") renderMap();
    if (action === "show-notebook") {
      closeModal();
      const chapterMatch = /^chapter-(\d+)$/.exec(state.screen);
      if (chapterMatch) {
        const chapter = Number(chapterMatch[1]);
        const fallbackAnchor = chapter === 10 ? (document.querySelector("#current-confrontation") ? "#current-confrontation" : "[data-report]") : "";
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
    if (action === "open-map-evidence") {
      const ids=String(target.dataset.evidence || "").split(",").filter(id=>EVIDENCE[id] && state.evidence.includes(id));
      openModal(`<div class="eyebrow">SPATIAL EVIDENCE · 路线支持材料</div><h2>${escapeHtml(target.textContent.trim())}</h2><p class="muted">路线只负责组织空间关系；点击材料回到案件簿核对其证明边界。</p><div class="evidence-list">${ids.map(id=>`<article class="evidence-card ${evidenceMaterialClass(id)}"><span class="source">${EVIDENCE[id][1]}</span><h3>${EVIDENCE[id][0]}</h3><p>${EVIDENCE[id][2]}</p><button class="text-button" data-action="show-notebook" data-evidence="${id}">在案件簿中打开</button></article>`).join("") || '<p class="muted">该路线的支持材料尚未取得。</p>'}</div><button class="btn" data-action="close-modal">返回地图</button>`);
    }
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
    if (action === "show-prologue") openModal(`<div class="eyebrow">CASE BRIEF</div><h1>临江壹号死亡案</h1><p class="lead">2026 年 9 月 17 日 22:47，建筑设计师林知秋被发现死在从内部反锁的 1102。</p><div class="document"><p><strong>21:41</strong> 林知秋名下的 A047 凭证通过 1102 锁具认证；这尚不等于本人进入。</p><p><strong>19:40—22:20</strong> 头号嫌疑人许遥在十四公里外公开演讲。</p><p><strong>询问规则</strong> 初查尚未发现一句可直接证伪的纯假证词。真话是否完整，仍需独立来源检验。</p><p><strong>问题</strong> 证据证明许遥是凶手，时间证明他不可能是凶手。</p></div><div class="card-actions"><button class="btn primary" data-action="close-modal">开始思考</button></div>`);
    if (action === "confirm-new") openModal(`<h2>重新开始案件？</h2><p class="muted">当前周目会清空，但已解锁的结局档案会保留。</p><div class="card-actions"><button class="btn danger-btn" data-action="reset-run">确认重新开案</button><button class="btn" data-action="close-modal">取消</button></div>`);
    if (action === "reset-run") { closeModal(); resetRun(); }

    if (action === "examine") {
      const id = target.dataset.id;
      const sceneArea = target.closest(".scene-location-list") ? ".scene-location-list" : target.closest(".scene-board") ? ".scene-board" : "";
      if (!state.examined.includes(id)) state.examined.push(id);
      if (["access","door","living-carpet","body-injury","shelf","bath","window-view"].includes(id)) state.factAnswers.lastSceneZone=id;
      addEvidence(...String(target.dataset.evidence || "").split(",").filter(Boolean));
      if (["living-carpet","body-injury"].every(zone => state.examined.includes(zone))) {
        if (!state.examined.includes("body")) state.examined.push("body");
        addEvidence("e_body");
      }
      saveState(true); renderChapterPreserving(`${sceneArea ? `${sceneArea} ` : ""}[data-action="examine"][data-id="${id}"]`);
    }
    if (action === "solve-p01") {
      if (chosen("p01") === "death") { solve("p01","d_lock"); setFeedback("feedback-p01","正确。发现地点、凭证认证、门磁开合和反锁都有直接记录；死亡地点目前只有默认前提，仍需独立物证。",true); }
      else wrong("feedback-p01","这一项已有现场照片、锁具认证、门磁或破门记录直接支持。寻找尚未获得独立来源的结论。 ");
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
      const input=document.querySelector(`[data-measure-point="${target.dataset.point}"]`), delta=Number(target.dataset.delta || 0);
      if (input) { input.value=String(Math.max(Number(input.min),Math.min(Number(input.max),Number(input.value)+delta))); input.dispatchEvent(new Event("input",{bubbles:true})); target.focus({preventScroll:true}); }
    }
    if (action === "lock-p03-measure") {
      const reading = kind => Math.abs(Number(document.querySelector(`[data-measure-point="${kind}-b"]`).value)-Number(document.querySelector(`[data-measure-point="${kind}-a"]`).value));
      const photo = reading("photo"), plan = reading("plan");
      if (Logic.validateDimensionReadings(photo,plan).ok) { addEvidence("e_shelf","e_plan1102"); state.factAnswers.p03Phase = 2; saveState(true); renderChapter(3); }
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
    if (action === "set-blueprint-overlay") {
      state.factAnswers.p04OverlayMode=target.dataset.mode;
      state.factAnswers.p04OverlaySeen=true;
      saveState(true);
      renderChapterPreserving(".blueprint-overlay");
    }
    if (action === "solve-p04") {
      const changes = checked("p04-change"), expected = ["number","door","wall-kept","pipe"];
      if (state.factAnswers.p04First === "2012" && state.factAnswers.p04Second === "2019" && changes.length === 4 && expected.every(id => changes.includes(id))) { addEvidence("e_plan2012","e_plan2019"); solve("p04","d_1402"); setFeedback("feedback-p04","房号与正式门位消失，但承重边界和管井仍在：被注销的是编号，不是空间。",true); openModal('<div class="eyebrow">ARCHIVE OVERLAY · 发现</div><h2>1402</h2><div class="witness-scene"><p>旧图上，“1402”三个数字重新出现在屏幕上。</p><p>房间从系统里消失了十四年。</p><blockquote>但墙没有。</blockquote></div><button class="btn primary" data-action="close-modal">记录这个房间</button>'); }
      else wrong("feedback-p04","需要一份能证明原始空间的早期来源，以及一份首次抹去房号的变更来源。 ");
    }
    if (action === "find-diff") {
      const id = target.dataset.diff;
      if (!state.mirrorFound.includes(id)) state.mirrorFound.push(id);
      saveState(true); renderChapterPreserving(`[data-action="find-diff"][data-diff="${id}"]`);
    }
    if (action === "choose-difference-class") {
      state.differenceClasses[target.dataset.diff]=target.dataset.class;
      saveState(true);
      renderChapterPreserving(`[data-difference-note="${target.dataset.diff}"] [data-class="${target.dataset.class}"]`);
    }
    if (action === "solve-p05") {
      const result = Logic.validateEvidenceSet(checked("p05-proof"), ["impact","drag"], [{ all:["impact","drag"], exact:true }]);
      if (result.ok) { solve("p05","d_mirror",["e_impact","e_floor"]); renderChapter(5); }
      else wrong("feedback-p05",result.reason);
    }
    if (action === "open-device-record") {
      if (!state.solved.includes("p05")) return;
      addEvidence("e_watch");
      saveState(true);
      renderChapterPreserving(".device-return");
      openModal(`<div class="eyebrow">DEVICE RETURN · 原始数据</div><h2>${EVIDENCE.e_watch[0]}</h2><p>${EVIDENCE.e_watch[2]}</p><div class="document"><p><strong>19:16:21</strong> 剧烈冲击</p><p><strong>随后</strong> 心率急降</p><p><strong>19:18 后</strong> 无有效活动记录</p></div><p class="muted">这是一条设备时间锚点，不是单独的法医死亡结论。</p><button class="btn primary" data-action="close-modal">纳入案件簿</button>`);
    }
    if (action === "run-body-review") {
      const prerequisites = ["e_body","e_watch","e_impact"];
      if (state.solved.includes("p05") && prerequisites.every(id => state.evidence.includes(id))) {
        solve("p05r","d_body_review",["e_body_review"]);
        renderChapter(5);
        setFeedback("feedback-body-review","联合复核完成：精确死亡区间与伤情地点对应现已生成，并明确引用三份前置材料。",true);
      } else wrong("feedback-body-review","联合复核尚缺尸表初检、设备冲击记录或隐蔽现场撞击痕，不能提前生成高级结论。 ");
    }
    if (action === "save-p05-observations") {
      const result=Logic.validateDifferenceClasses(state.mirrorFound,state.differenceClasses);
      if (result.ok) { state.factAnswers.p05ObservationsSaved = true; saveState(true); renderChapter(5); }
      else wrong("feedback-p05",result.wrong.length ? `有 ${result.wrong.length} 项分类超出了当前材料；不能证明形成时间时，应保留“当前材料无法判断”。` : result.missingUncertain ? "至少有一项差异仅凭当前观察无法确定形成时间；请保留证据不足。" : `至少完成六项分类；当前有依据的记录 ${result.correct.length}/6。`);
    }
    if (action === "resume-p05-observation") { state.factAnswers.p05ObservationsSaved = false; saveState(true); renderChapter(5); }
    if (action === "set-view-floor") { state.factAnswers.viewFloor = Number(target.dataset.floor); state.factAnswers.viewedFloors = [...new Set([...(state.factAnswers.viewedFloors || []),String(target.dataset.floor)])]; saveState(true); renderChapter(5); }
    if (action === "solve-p06") {
      const choice=Number(chosen("p06-height")), viewed=state.factAnswers.viewedFloors || [];
      state.factAnswers.p06Choice=choice;
      if (choice === 14 && viewed.length >= 3 && viewed.includes("14")) { solve("p06",null,["e_window"]); setFeedback("feedback-p06","比较多个高度后，14F 的设备层轮廓与照片俯角重合；11—13F 被遮挡，15F 角度又过陡。",true); }
      else wrong("feedback-p06",!viewed.includes(String(choice)) ? "先在模拟器中实际查看你选择的高度，再提交判断。" : "继续利用对岸十二层设备平台的轮廓，同时比较遮挡与俯角，而不是只看能否越过女儿墙。 ");
    }
    if (action === "solve-p07") {
      const result=Logic.validateFactCleanup(state.factMarks);
      if (result.ok) { solve("p07","d_semantics",["e_cardlog"]); renderChapter(6); setFeedback("feedback-p07","八条解释已经统一净化。凭证认证、门扇开合、人员身份和行为方向各自保留证明边界。",true); }
      else wrong("feedback-p07",`仍有 ${result.wrong.length} 条记录保留了未经支持的词组，或误删了直接记录。逐条比较“记录本身”和解释句。`);
    }
    if (action === "toggle-fact-mark") {
      const id=target.dataset.factCard, token=target.dataset.token, marks=state.factMarks[id] || [];
      state.factMarks[id]=marks.includes(token) ? marks.filter(value=>value!==token) : [...marks,token];
      saveState(true);
      renderChapterPreserving(`[data-fact-cleanup="${id}"] [data-token="${token}"]`);
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
    if (action === "open-investigation-packet") {
      const id=target.dataset.packet;
      state.factAnswers.openInvestigationPacket=state.factAnswers.openInvestigationPacket===id ? "" : id;
      saveState(true);
      renderChapterPreserving(`[data-investigation-packet="${id}"]`);
    }
    if (action === "review-packet-file") {
      const packet=target.dataset.packet, evidence=target.dataset.evidence;
      if (!EVIDENCE[evidence]) return;
      if (!state.factAnswers.investigationPackets || typeof state.factAnswers.investigationPackets !== "object") state.factAnswers.investigationPackets={};
      const reviewed=Array.isArray(state.factAnswers.investigationPackets[packet]) ? state.factAnswers.investigationPackets[packet] : [];
      state.factAnswers.investigationPackets[packet]=[...new Set([...reviewed,evidence])];
      addEvidence(evidence);
      const packetFiles={property:["e_permission","e_accountmap","e_trainingaccess","e_shift"],operation:["e_cardauth","e_route","e_cart"]};
      if ((packetFiles[packet]||[]).every(id=>state.factAnswers.investigationPackets[packet].includes(id))) {
        const examinedId=packet==="property"?"permission-audit":"operation-audit";
        if (!state.examined.includes(examinedId)) state.examined.push(examinedId);
      }
      saveState(true);
      renderChapterPreserving(`[data-investigation-packet="${packet}"] [data-evidence="${evidence}"]`);
    }
    if (action === "toggle-matrix-rationale") { const id=target.dataset.person; state.matrixExpanded = state.matrixExpanded.includes(id) ? state.matrixExpanded.filter(x=>x!==id) : [...state.matrixExpanded,id]; saveState(true); const selector=window.matchMedia("(max-width: 700px)").matches ? `[data-person-card="${id}"]` : `[data-person-row="${id}"]`; renderChapterPreserving(selector); }
    if (action === "reveal-matrix-hint") {
      const id=target.dataset.person, current=Number(state.matrixHintLevels[id] || 0);
      state.matrixHintLevels[id]=current >= 3 ? 0 : current + 1;
      if (!state.hints.includes(`p10-${id}`)) state.hints.push(`p10-${id}`);
      saveState(true);
      const selector=window.matchMedia("(max-width: 700px)").matches ? `[data-person-card="${id}"] [data-action="reveal-matrix-hint"]` : `[data-person-row="${id}"] [data-action="reveal-matrix-hint"]`;
      renderChapterPreserving(selector);
    }
    if (action === "confirm-primary-candidate") {
      const candidate=chosen("primary-candidate") || state.primaryCandidate;
      state.primaryCandidate=candidate || "";
      if (!candidate) { wrong("feedback-p10","先从六名受查人员中选择一名仍满足全部实施条件的人。 "); return; }
      if (candidate !== "zhoulan") { state.factAnswers.primaryCandidateConfirmed=false; wrong("feedback-p10","当前选择仍有一项实施条件已被独立材料排除，或关键条件保持证据不足。请回到逐人交集核对。 "); return; }
      state.factAnswers.primaryCandidateConfirmed=true;
      saveState(true);
      renderChapterPreserving(".candidate-choice");
      setFeedback("feedback-p10","候选人已记录。现在请证明四项条件为什么能同时落到同一人身上。",true);
    }
    if (action === "solve-p10") {
      if (!state.factAnswers.primaryCandidateConfirmed) { wrong("feedback-p10","先从六名受查人员中确认唯一交集，再进入条件举证。 "); return; }
      state.zhouConditions = checked("zhou-condition");
      const result = Logic.validateExclusionMatrix(state.exclusionAnswers,state.zhouConditions,state);
      if (result.ok) { solve("p10","d_access"); renderChapter(8); openModal('<div class="eyebrow">RETURN INTERVIEW · 条件交集</div><h2>周岚没有立刻否认</h2><div class="witness-scene"><p>你把四条互不替代的记录依次推到她面前。</p><blockquote>“你证明了我处理现场。”</blockquote><p>她抬起眼：“可你怎么证明，十九点十六分那次撞击也与我有关？”</p></div><button class="btn primary" data-action="close-modal">继续核验致命冲突</button>'); }
      else wrong("feedback-p10",result.candidateError ? "当前候选人与条件交集不一致；不要让界面替你跳过候选判断。" : result.unsupportedPeople.length ? `有 ${result.unsupportedPeople.length} 名候选人的排除理由尚未获得对应来源；权限、行程和卡片接触不能互相替代。` : result.unsupportedConditions.length ? `所选候选人的四项条件中仍有 ${result.unsupportedConditions.length} 项处于“证据不足”；继续核验岗位、权限、通行窗口或 A047 身份链。` : result.wrongPeople.length ? `仍有 ${result.wrongPeople.length} 人的主要排除理由与现有材料不匹配。可按层查看提示，先核对缺口类别。` : `还缺 ${result.missingConditions.length} 个必须同时成立的条件。`);
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
        renderChapter(9);
        requestAnimationFrame(() => {
          const button=document.querySelector(`[data-reconstruction-step="${id}"] [data-action="move-reconstruction"][data-delta="${newDelta}"]:not([disabled])`);
          const card=document.querySelector(`[data-reconstruction-step="${id}"]`);
          (button || card)?.scrollIntoView({block:"center"});
          button?.focus({preventScroll:true});
        });
      }
    }
    if (action === "validate-reconstruction") {
      const result=Logic.validateSceneReconstruction(state.reconstructionOrder,state.reconstructionEvidence,state);
      if (result.ok) {
        state.legacyReconstruction=false;
        solve("p10r","d_reconstruction",["e_chaintrial"]);
        renderChapter(9);
        setFeedback("feedback-reconstruction","五个步骤的顺序与逐步材料连接均已闭合；完整复原现在由你构建的时间轴生成。",true);
      } else wrong("feedback-reconstruction",result.reason);
    }
    if (action === "select-reconstruction-evidence") {
      const id=target.dataset.reconstructionEvidence;
      if (!state.evidence.includes(id) || state.solved.includes("p10r")) return;
      state.factAnswers.reconstructionActiveEvidence=state.factAnswers.reconstructionActiveEvidence===id?"":id;
      state.factAnswers.reconstructionAnnouncement=state.factAnswers.reconstructionActiveEvidence?`已选择${EVIDENCE[id][0]}；请选择要连接的行为。`:"已取消当前材料。";
      saveState(true);
      renderChapterPreserving(`[data-reconstruction-evidence="${id}"]`);
    }
    if (action === "attach-reconstruction-evidence") {
      const step=target.dataset.step, id=state.factAnswers.reconstructionActiveEvidence;
      if (!id || !state.evidence.includes(id) || state.solved.includes("p10r")) return;
      state.reconstructionEvidence[step]=[...new Set([...(state.reconstructionEvidence[step]||[]),id])];
      state.factAnswers.reconstructionAnnouncement=`${EVIDENCE[id][0]}已连接到${{water:"放水",card:"取卡",transfer:"搬运",chain:"挂链",leave:"离开"}[step]}。`;
      saveState(true);
      renderChapterPreserving(`[data-reconstruction-step="${step}"] [data-action="attach-reconstruction-evidence"]`);
    }
    if (action === "detach-reconstruction-evidence") {
      const step=target.dataset.step, id=target.dataset.evidence;
      if (state.solved.includes("p10r")) return;
      state.reconstructionEvidence[step]=(state.reconstructionEvidence[step]||[]).filter(value=>value!==id);
      state.factAnswers.reconstructionAnnouncement=`已从该步骤移除${EVIDENCE[id][0]}。`;
      saveState(true);
      renderChapterPreserving(`[data-reconstruction-step="${step}"]`);
    }
    if (action === "discover-old-case") {
      if (state.ending) { toast("已结案档案为只读；请从新周目改变调查范围"); return; }
      state.oldCaseDiscovered=true;
      saveState(true);
      renderChapter(10);
      openModal('<div class="eyebrow">UNFILED MATERIAL · 遗留资料</div><h2>文件袋里写着：2014</h2><div class="witness-scene"><p>封口已经松开。第一页不是凶案照片，而是一张地下结构修改验收页。</p><p>再往后，是一份事故死亡名单。</p><blockquote>其中一个名字：周屿。</blockquote></div><button class="btn primary" data-action="close-modal">开始整理封存卷宗</button>');
    }
    if (action === "move-responsibility-file") {
      if (state.solved.includes("p11")) return;
      const id=target.dataset.file, from=state.responsibilityOrder.indexOf(id), to=Math.max(0,Math.min(state.responsibilityOrder.length-1,from+Number(target.dataset.delta)));
      if (from>=0 && from!==to) {
        const next=[...state.responsibilityOrder];
        [next[from],next[to]]=[next[to],next[from]];
        state.responsibilityOrder=next;
        saveState(true);
        renderChapterPreserving(`[data-responsibility-file="${id}"]`);
        requestAnimationFrame(()=>document.querySelector(`[data-responsibility-file="${id}"] [data-action="move-responsibility-file"]:not([disabled])`)?.focus({preventScroll:true}));
      }
    }
    if (action === "select-chain-file") { state.factAnswers.selectedChainFile = target.dataset.file; saveState(true); renderChapterPreserving(`[data-action="select-chain-file"][data-file="${target.dataset.file}"]`); }
    if (action === "assign-chain-file") { if (state.factAnswers.selectedChainFile) state.chainFiles[target.dataset.actor] = state.factAnswers.selectedChainFile; saveState(true); renderChapterPreserving(`[data-action="assign-chain-file"][data-actor="${target.dataset.actor}"]`); }
    if (action === "choose-chain-action") { state.chainAnswers[target.dataset.actor] = target.dataset.value; saveState(true); renderChapterPreserving(`[data-action="choose-chain-action"][data-actor="${target.dataset.actor}"][data-value="${target.dataset.value}"]`); }
    if (action === "solve-p11") {
      const result = Logic.validateResponsibilityPuzzle(state.chainFiles,state.chainAnswers,state.responsibilityOrder);
      const privateProof = Logic.validateEvidenceSet(checked("p11-private"), ["e_casualty","e_hr"], [{ all:["e_casualty","e_hr"], exact:true }]);
      if (result.ok && privateProof.ok && state.evidence.includes("e_oldfile")) {
        solve("p11","d_oldcase"); addDeduction("d_private");
        if (!Logic.allCurrentProofsComplete(state)) state.solved=state.solved.filter(id=>id!=="p12");
        state.confrontationStep=Logic.nextConfrontationStep(state);
        saveState(true);
        renderChapter(10);
        setFeedback("feedback-p11","责任链与私人联系均成立：周屿是旧案遇难者，也是周岚的哥哥。若两项主案质询已完成，终章会新增第三项封存卷宗质询。",true);
        openModal('<div class="eyebrow">PRIVATE LINK · 人员记录</div><h2>周屿</h2><div class="witness-scene"><p>死亡名单与人事档案在同一个名字上重合。</p><p>询问室里，周岚第一次移开视线。</p><blockquote>“他不是违规。他只是没有机会从那层地下室里出来。”</blockquote></div><button class="btn primary" data-action="close-modal">把名字写回责任链</button>');
      }
      else wrong("feedback-p11",!state.evidence.includes("e_oldfile") ? "先调查 2014 原始验收卷。" : result.orderWrong.length ? `责任时间链仍有 ${result.orderWrong.length} 个节点前后颠倒；先核对提案、批准、验收与施工的因果顺序。` : !result.ok ? `卷宗连接仍有 ${result.fileWrong.length} 处、行为连接仍有 ${result.actionWrong} 处不符；从每张文件的发文主体和动词核对。` : "责任链已经成立；私人联系还需要死亡名单与人事档案两种独立人员记录共同证明。");
    }
    if (action === "validate-report") {
      if (state.ending) { toast("已结案报告为只读档案"); return; }
      document.querySelectorAll("[data-report]").forEach(node => { if (state.report[node.dataset.report] !== node.value) Logic.markReportEdited(state,node.dataset.report,node.value); });
      const result = Logic.verifyReportSnapshot(state);
      if (result.ok) {
        addDeduction("d_reconstruction"); addDeduction("d_fatal");
        const proofsComplete=Logic.allCurrentProofsComplete(state);
        if (proofsComplete && !state.solved.includes("p12")) solve("p12");
        else saveState(true);
        renderChapter(10);
        setFeedback("feedback-report",proofsComplete ? "当前报告快照已通过复核与一致性校验；已完成举证保持有效，可以继续公开决定。" : "十项结论均有来源且互相兼容；当前报告快照已通过一致性校验。",true);
      }
      else wrong("feedback-report",`报告尚未闭合：${result.categories.length ? result.categories.join("、") : "存在未完成项目"}。请回看对应材料的来源与证据层级，不必逐项盲猜。`);
    }
    if (action === "toggle-report-adoption") {
      if (state.ending) return;
      const key=target.dataset.reportKey, adopted=!state.reportAdopted.includes(key);
      Logic.markReportAdopted(state,key,adopted);
      saveState(true);
      renderChapterPreserving(`[data-action="toggle-report-adoption"][data-report-key="${key}"]`);
    }
    if (action === "toggle-base-report-adoption") {
      if (state.ending) return;
      const keys=["deathTime","cufflink","sound","waterStart"];
      const adopt=!keys.every(key=>state.reportAdopted.includes(key));
      keys.forEach(key=>Logic.markReportAdopted(state,key,adopt));
      saveState(true);
      renderChapterPreserving('[data-action="toggle-base-report-adoption"]');
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
      renderChapter(10);
      requestAnimationFrame(()=>{ const button=document.querySelector('#current-confrontation [data-action="toggle-selected-proofs"]'); button?.scrollIntoView({block:"center"}); button?.focus({preventScroll:true}); });
    }
    if (action === "validate-confrontation") {
      const evidence = checked("confrontation-evidence"), step = Logic.nextConfrontationStep(state) + 1;
      const result = Logic.validateConfrontationAnswer(step,evidence), total = Logic.proofTotal(state);
      if (result.ok) {
        state.confrontation[`q${step}`] = evidence;
        state.confrontationVersions[`q${step}`] = Logic.PROOF_RULE_VERSION;
        delete state.legacyProofRecords[`q${step}`];
        delete state.confrontationDraft[`q${step}`];
        state.confrontationStep = Logic.nextConfrontationStep(state);
        state.confrontationOnlySelected=false;
        if (step === 2) addDeduction("d_fatal");
        saveState(true);
        if (Logic.allCurrentProofsComplete(state) && Logic.isCurrentReportVerified(state)) { solve("p12"); renderChapter(10); openModal(disclosureModalHtml()); }
        else renderChapter(10);
      } else {
        wrong("feedback-confrontation",result.reason || "这组材料不能直接回答当前质疑。 ");
        const feedback=document.querySelector("#feedback-confrontation");
        if (feedback) feedback.innerHTML=`<span>${escapeHtml(result.reason || "这组材料不能直接回答当前质疑。")}</span><div><button class="text-button" data-action="show-notebook">打开案件簿核对现有材料</button></div>`;
      }
    }
    if (action === "continue-disclosure") {
      if (!Logic.canSubmitDisclosure(state)) { modalContent.innerHTML=""; toast("当前报告或举证需要复核"); renderChapter(10); }
      else openModal(disclosureModalHtml());
    }
    if (action === "view-ending" && state.ending) renderEnding(state.ending);
    if (action === "choose-disclosure") {
      const ending = Logic.determineEnding(state,target.dataset.choice);
      if (!ending) { toast("当前报告或举证已变化，不能提交公开决定"); closeModal(); renderChapter(10); return; }
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
    if (event.target.name === "primary-candidate") {
      state.primaryCandidate=event.target.value;
      state.factAnswers.primaryCandidateConfirmed=false;
      saveState(true);
    }
    if (event.target.name === "p06-height") { state.factAnswers.p06Choice=Number(event.target.value); saveState(true); }
    if (event.target.dataset.viewHeight !== undefined) { saveState(true); }
    if (event.target.dataset.report) {
      if (state.ending) { toast("已结案报告为只读档案"); renderChapter(10); return; }
      Logic.markReportEdited(state,event.target.dataset.report,event.target.value);
      saveState(true);
      const feedback=document.querySelector("#feedback-report");
      if (feedback) { feedback.className="feedback bad"; feedback.textContent="报告已修改，当前公开提交暂停；请重新复核。已完成举证会保留。"; }
    }
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
      if (state.confrontationOnlySelected && !event.target.checked) {
        setTimeout(() => {
          renderChapterPreserving("#current-confrontation");
          requestAnimationFrame(()=>document.querySelector('#current-confrontation [data-action="toggle-selected-proofs"]')?.focus({preventScroll:true}));
        },30);
      }
    }
  });

  document.addEventListener("input", event => {
    if (event.target.dataset.viewHeight !== undefined) {
      const value=Number(event.target.value), notes={11:"已载入 11F 几何投影；请自行比较两条线。",12:"已载入 12F 几何投影；请自行比较两条线。",13:"已载入 13F 几何投影；请自行比较两条线。",14:"已载入 14F 几何投影；请自行比较两条线。",15:"已载入 15F 几何投影；请自行比较两条线。"};
      state.factAnswers.viewFloor=value;
      state.factAnswers.viewedFloors=[...new Set([...(state.factAnswers.viewedFloors || []),String(value)])];
      const stage=document.querySelector(".sight-simulator");
      if (stage) {
        stage.style.setProperty("--origin-top",`${44-(value-11)*8}%`);
        stage.style.setProperty("--line-top",`${47-(value-11)*7}%`);
        stage.style.setProperty("--line-rotate",`${10-(value-11)*4}deg`);
      }
      const origin=document.querySelector("#sight-origin-label"); if (origin) origin.textContent=`${value}F`;
      const output=document.querySelector("#view-height-output"); if (output) output.textContent=`${value}F`;
      const note=document.querySelector("#sight-note"); if (note) note.textContent=notes[value];
      const compared=event.target.closest(".view-height-control")?.querySelector("small");
      if (compared) compared.textContent=`已比较：${state.factAnswers.viewedFloors.map(floor=>`${floor}F`).join("、")}`;
      const submit=document.querySelector('[data-action="solve-p06"]');
      if (submit) submit.disabled=state.factAnswers.viewedFloors.length < 3;
      saveState(true);
      return;
    }
    if (event.target.dataset.measurePoint) {
      const [kind,point] = event.target.dataset.measurePoint.split("-");
      const key=`${kind}Point${point.toUpperCase()}`;
      state.factAnswers[key]=Number(event.target.value);
      const reading = type => Math.abs(Number(document.querySelector(`[data-measure-point="${type}-b"]`)?.value || 0)-Number(document.querySelector(`[data-measure-point="${type}-a"]`)?.value || 0));
      const photo=reading("photo"), plan=reading("plan"), value=reading(kind);
      state.factAnswers[kind === "photo" ? "photoMeasure" : "planMeasure"] = value;
      const output = document.querySelector(`#${kind}-output`); if (output) output.textContent = `${value} cm`;
      const result = document.querySelector(`#result-${kind}`); if (result) result.textContent = value;
      const diff = document.querySelector("#result-diff"); if (diff) diff.textContent = Math.abs(plan-photo);
      saveState(true);
    }
  });

  document.addEventListener("dragstart", event => {
    if (state.solved.includes("p10r")) return;
    const evidence=event.target.closest("[data-reconstruction-evidence]");
    const step=event.target.closest("[data-reconstruction-step]");
    if (evidence && state.evidence.includes(evidence.dataset.reconstructionEvidence)) reconstructionDrag={kind:"evidence",id:evidence.dataset.reconstructionEvidence};
    else if (step) reconstructionDrag={kind:"step",id:step.dataset.reconstructionStep};
    else return;
    event.dataTransfer.effectAllowed=reconstructionDrag.kind==="step"?"move":"copy";
    event.dataTransfer.setData("text/plain",`${reconstructionDrag.kind}:${reconstructionDrag.id}`);
  });
  document.addEventListener("dragover", event => {
    const target=event.target.closest("[data-reconstruction-drop]");
    if (target && reconstructionDrag) { event.preventDefault(); event.dataTransfer.dropEffect=reconstructionDrag.kind==="step"?"move":"copy"; target.classList.add("drag-over"); }
  });
  document.addEventListener("dragleave", event => event.target.closest("[data-reconstruction-drop]")?.classList.remove("drag-over"));
  document.addEventListener("drop", event => {
    const target=event.target.closest("[data-reconstruction-drop]");
    if (!target || !reconstructionDrag || state.solved.includes("p10r")) return;
    event.preventDefault();
    const targetStep=target.dataset.reconstructionDrop;
    if (reconstructionDrag.kind==="evidence") {
      state.reconstructionEvidence[targetStep]=[...new Set([...(state.reconstructionEvidence[targetStep]||[]),reconstructionDrag.id])];
      state.factAnswers.reconstructionAnnouncement=`${EVIDENCE[reconstructionDrag.id][0]}已连接到时间轴。`;
    } else {
      const from=state.reconstructionOrder.indexOf(reconstructionDrag.id), to=state.reconstructionOrder.indexOf(targetStep), next=[...state.reconstructionOrder];
      if (from>=0&&to>=0&&from!==to) { next.splice(from,1); next.splice(to,0,reconstructionDrag.id); state.reconstructionOrder=next; state.factAnswers.reconstructionAnnouncement="行为顺序已通过拖动更新。"; }
    }
    const focusId=reconstructionDrag.id;
    reconstructionDrag=null;
    saveState(true); renderChapter(9);
    requestAnimationFrame(()=>document.querySelector(`[data-reconstruction-step="${targetStep}"]`)?.focus({preventScroll:true}));
  });
  document.addEventListener("dragend", () => { reconstructionDrag=null; document.querySelectorAll(".drag-over").forEach(node=>node.classList.remove("drag-over")); });

  modal.addEventListener("click", event => { if (event.target === modal) closeModal(); });
  modal.addEventListener("close", () => {
    if (Logic.caseResolutionState(state) === "awaiting-disclosure" && state.screen === "chapter-10") renderChapter(10);
  });
  window.addEventListener("beforeunload", () => { if (state.started) saveState(true); });
  renderLanding();
})();
