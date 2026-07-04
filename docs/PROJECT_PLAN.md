# 摸鱼阅读器 · 项目规划文档

> 一个把界面像素级伪装成 Claude 桌面客户端的电子书阅读器。面向开发者的落地蓝图,据此可直接开工。
> 版本:v1.1(设计定稿,已过评审闭环) · 语言:全中文交付 · 平台:Electron(macOS + Windows)

---

## 1. 项目概述与目标

**一句话定位**:一个界面像素级伪装成 Claude 桌面客户端的桌面电子书阅读器——屏幕上看起来你在正常用 Claude 问答,实际在读小说。

**为什么这么做**:上班摸鱼读小说的核心痛点是"被旁人/老板一眼识破"。市面阅读器再怎么"极简"也一眼是阅读器。而 Claude/ChatGPT 这类问答工具在办公场景天然合理、随处可见、内容形态多变(长文本、代码块、markdown),把小说正文伪装成"Claude 的长回答"、把翻页伪装成"发消息",能获得远超普通"老板键"方案的隐蔽度。Claude 客户端的三大视觉特征——**衬线体正文 + 暖米白禁纯白 + 无阴影极简**——恰好和"渲染大段小说正文"高度契合。

**非目标(第一版明确不做)**:
- 不抓取微信读书**正文全文**(工程量大、封号几乎必然、违约侵权;正文一律走本地文件)。
- 不做 PDF **OCR**(扫描版直接降级提示)。
- 不做移动端 / Web 端(仅桌面 Electron)。
- 不做真实 Claude API 接入(所有"回答"都是本地小说内容,零联网 AI 调用)。
- 不做多人协作 / 云端书架托管(书架仅本地 + 可选微信读书书架**只读**同步,且非首发)。
- 不做"完全等同官方 Claude"的商标级冒充(神似而非全等,规避商标风险,见 §12)。

---

## 2. 核心创意:伪装映射表

产品的灵魂是一套 **Claude 元素 ↔ 阅读器元素** 的双向映射。开发时任何 UI/交互决策都回到这张表核对。

| Claude 客户端元素 | 伪装映射(阅读器语义) | 交互细节 |
|---|---|---|
| **New chat**(新建会话) | 导入一本新书 | 点击 → 文件选择器导入 EPUB/TXT/PDF;新书出现在 Recents 顶部 |
| **Recents**(会话列表) | 书架(可改名) | 每本书 = 一个 Recents 项,书名 = 会话标题;右键/hover"···"可**重命名**(伪装成"项目/会话名");**绝不显示封面缩略图**(Claude 会话列表无封面,显示即露馅) |
| **Projects**(项目分组) | 书单 / 分类("玄幻""已读""摸鱼精选") | 把书按分类分组;非必做,MVP 可留空占位 |
| **会话正文**(一问一答流) | 小说正文问答流 | 助手气泡=小说正文段落;穿插的用户气泡=伪问题("继续""然后呢") |
| **助手回答气泡**(全宽 serif 无气泡) | 一屏小说正文(1 个 Block) | 衬线体渲染,天然像 Claude 长回答;支持逐字打字机 |
| **用户提问气泡**(右侧灰圆角) | 伪问题 / 翻页触发 | 按位置确定性插入,营造"人在追问"假象 |
| **底部输入框发消息**(回车) | 翻到下一段 / 下一屏 | 回车 → 假思考 → 逐字流出下一 Block;输入任意字都当翻页 |
| **发送中→停止方块态** | 假打字机正在生成小说 | 打字机可被下一次回车/老板键中断 |
| **模型选择器**(Opus/Sonnet/Haiku) | 纯装饰(可绑定伪装档位/字号) | 点开有菜单即可,不联网 |
| **会话标题**(顶栏,可编辑) | 书名 | 与 Recents 项同步 |
| **账户区**(头像/套餐) | 纯装饰(显示"Pro") | hover 弹 Settings/Log out 假菜单 |
| **搜索 chats(⌘K)** | 搜书 / 跳章 | MVP 可先做书内搜索;跳章复用 TOC |
| **暗色模式跟随系统** | 同步跟随(防老板开灯切暗不穿帮) | 见 §4 暗色 token |

---

## 3. 功能需求(MVP vs 迭代)

> **MVP 边界铁律**:正文格式**只锁 EPUB + TXT + PDF(文字层)三种**;MOBI/AZW3 与微信读书同步**均不进首发**(理由见 §3.4、§7.2、§8)。评审确认:这两项是全文最大的技术不确定源,悬在首发路径上会阻塞开工,故明确下沉。

### 3.1 MVP(第一版必做)

- [ ] **UI 克隆**:像素级仿 Claude 消费者版桌面客户端(侧栏 + 主聊天区 + Composer + 顶栏),暖米白 + serif + 无阴影三铁律。
- [ ] **本地导入**:EPUB / TXT / PDF(文字层)三格式解析为统一 Book 模型。
- [ ] **问答式伪装排版**:切块 → 编排(伪问题确定性插入)→ 渲染成气泡流。
- [ ] **翻页交互**:回车推进(假思考 + 逐字打字机)+ 滚动追加(静默)双模式,含状态机边界(§5.5)。
- [ ] **阅读进度记忆**:每本书记住 `(blockIndex, charOffset)`,续读回填历史营造"聊了一会"。
- [ ] **书架管理**:Recents 列表、书名可改名、删除。
- [ ] **伪装强度档位**:pure / natural / chatty 三档,随书记忆。
- [ ] **第一版隐蔽功能四件套**(见 §3.3)。
- [ ] **遮羞层(decoy)**:预加载常驻的真·空白 Claude 视图,规格见 §9.1.1。

### 3.2 后续迭代(M5+)

- [ ] **MOBI/AZW3 解析**(下沉自 MVP;需先过 §3.4 的 spike,再决定是否落地)。
- [ ] 微信读书书架**只读**同步(填充 Recents,正文仍本地;需先过 §8.2 的 API 可用性验证)。
- [ ] Projects 书单分组。
- [ ] 书内全文搜索 / FTS5 索引。
- [ ] 防偷看增强:失焦模糊、内容保护(仅 Windows 有效,见 §9.5)。
- [ ] 阅读统计(伪装成"token 用量")。
- [ ] 主题/字号自定义(伪装成 Claude 外观设置)。
- [ ] PDF **复杂版式**(多栏/表格)重排优化。**注意**:PDF 基础的行聚类+行内排序是 MVP 能读的前提,已在 M2(§7.2),这里只是复杂版式增强。
- [ ] PDF OCR(仅在明确需求时)。

### 3.3 第一版隐蔽功能四件套(硬性)

1. **老板键**:全局快捷键一键秒切"真·空白 Claude 新会话"(无闪烁,遮羞层预加载常驻)。
2. **假打字机**:逐字生成效果(变速 + 标点停顿 + "thinking"前置 + 可中断)。
3. **阅读进度记忆**:每本书记住读到哪、续读直达。
4. **窗口标题/任务栏图标伪装**:标题锁死 "Claude"、exe/图标伪装、`page-title-updated` 拦截、mac/Win 全链路显示名(§9.2)。

### 3.4 MOBI/AZW3 前置 spike(若坚持首发带,否则跳过)

若产品坚持首发带 MOBI/AZW3,则在 **M1 之后、M2 之前插入一个独立 spike 里程碑 M1.5**(预算 1 person-week,结果**不确定**):

- 目标:用 `foliate-js`(git submodule 锁版本)在渲染进程隐藏 worker 里跑通一本 MOBI + 一本 KF8/AZW3,输出统一 Book 模型,验证解析耗时与内存。
- **失败降级路径(必须实现,不能悬空)**:spike 不达标或 API 不稳 → MOBI/AZW3 直接从格式列表移除,导入 `.mobi/.azw3` 时以"伪装成 Claude 助手消息"的方式报错(见 §13 异常降级),文案:"抱歉,我暂时无法读取这个文件,试试导入 EPUB 或 TXT 吧。"
- 默认路线:**不做**。本文档 MVP 一律按 EPUB/TXT/PDF 三格式推进。

---

## 4. 界面设计:Claude 桌面版克隆规格

> **复刻目标 = 消费者版 Claude 聊天客户端**(New chat + Recents + Projects 侧栏形态),**不是** Claude Code 开发者编排面板(那个不符合"看起来在正常问答"的伪装需求)。

### 4.1 CSS 变量表(可直接抄进 `:root`)

```css
:root {
  /* ---- 背景层(暖米白,禁止纯白 #fff)---- */
  --bg-canvas:        #F5F4ED;  /* Parchment 主聊天区/页面底 */
  --bg-elevated:      #FAF9F5;  /* Ivory 卡片/浮层/悬浮容器 */
  --bg-sidebar:       #F0ECE0;  /* 侧栏底 */
  --bg-user-bubble:   #E5E0D6;  /* 用户气泡底 */

  /* ---- 文字 ---- */
  --text-primary:     #141413;  /* 近黑正文/标题 */
  --text-secondary:   #5C5A54;  /* 次级/时间戳/说明 */
  --text-tertiary:    #8A8780;  /* 占位/禁用 */
  --text-mid-gray:    #B0AEA5;  /* 图标弱化 */

  /* ---- 描边/分隔 ---- */
  --border-default:   #E5E0D6;  /* composer/气泡/分割线 */
  --border-subtle:    #E8E6DC;  /* 更淡的分隔 */

  /* ---- 强调 / 品牌橙(terracotta)---- */
  --accent-primary:   #C96442;  /* 主 CTA / 发送键 / Sparkle 图标 */
  --accent-coral:     #D97757;  /* 品牌 Coral,链接/次级强调 */
  --accent-blue:      #6A9BCC;
  --accent-green:     #788C5D;

  /* ---- 圆角 ---- */
  --radius-bubble:    16px;     /* 气泡/composer(rounded-2xl) */
  --radius-chip:      8px;      /* 模式 chip / 模型选择器 */
  --radius-btn:       10px;     /* New chat / 侧栏项 */
  --radius-code:      8px;      /* 代码块 */

  /* ---- 字体(MVP 兜底栈,决策见 §4.8)---- */
  --font-ui:    "Styrene B", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
  --font-body:  "Copernicus", "Source Serif 4", "Noto Serif SC", "Tiempos Text", ui-serif, Georgia, "Songti SC", "SimSun", serif;
  --font-mono:  "Söhne Mono", "JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
}

/* ---- 暗色模式(默认跟随系统)---- */
:root[data-theme="dark"] {
  --bg-canvas:      #262624;
  --bg-sidebar:     #1F1E1B;
  --bg-elevated:    #2B2A27;
  --bg-user-bubble: #3A3833;
  --text-primary:   #FAF9F5;
  --border-default: #3D3A35;
  --accent-primary: #D97757;
}
```

**遮羞层复用同一套 `tokens.css`**(§9.1.1):decoy 与 reader 共用一份变量,改一处两处同步,杜绝"改了 reader 忘了 decoy"的色差露馅。

**三条铁律(任一破功即露馅)**:① 页面底绝不用纯白 `#fff`,所有中性灰带暖黄棕调;② 全局无阴影,靠 1px 描边分区;③ 助手正文用 serif 衬线体。

### 4.2 布局规格

| 区域 | 值 | 备注 |
|---|---|---|
| 窗口最小宽 | ~800px | 低于此侧栏可折叠 |
| 左侧栏宽度 | 260px 展开 / ~60px 折叠 | 可拖拽 |
| 主聊天区 | flex 占满,内容列**居中最大宽 ~740px** | 正文不铺满,左右留白 |
| 右侧栏/Canvas | **无** | 伪装版不做 Artifacts 面板 |
| 顶栏高度 | ~52–56px | |
| 整体 chrome | 极简、无阴影、1px 描边 | |

```
┌────────────┬───────────────────────────────┐
│            │  顶栏(书名·模型名·分享·更多) 56px │
│  侧栏 260  ├───────────────────────────────┤
│  New chat  │     主聊天区(内容居中 ~740)    │
│  Search    │     ...气泡流(小说正文)...     │
│  Recents   ├───────────────────────────────┤
│  Projects  │     Composer 输入框(翻页器)    │
│  ─account─ │                               │
└────────────┴───────────────────────────────┘
```

### 4.3 字号层级

| 元素 | font-size | line-height | weight | family |
|---|---|---|---|---|
| 助手正文(小说正文) | 16px | 1.65 (26px) | 400 | serif |
| 用户消息(伪问题) | 15–16px | 1.5 | 400 | sans |
| H1 / H2 / H3(markdown) | 24 / 20 / 17px | 1.3–1.4 | 600 | serif |
| 侧栏会话标题(书名) | 13–14px | 1.4 | 400 | sans |
| 分组标题 Recents/Projects | 11–12px | 1.4 | 500 | sans |
| 代码块 | 13px | 1.5 | 400 | mono |
| 时间戳/次级 | 12px | 1.4 | 400 | sans |

### 4.4 消息渲染(伪装核心,非对称设计)

- **助手消息(=小说正文)**:全宽、纯 markdown、**无气泡底、无边框、无阴影、无头像**,serif 16px/1.65,文字直接坐在 Parchment 背景上。**不放头像**更干净且好对齐。
- **用户消息(=伪问题)**:**右对齐**,`max-width: 80%`,底色 `--bg-user-bubble`,圆角 16px,`padding: 10px 14px`,sans 字体,**无头像**。
- **消息间距**:相邻 ~24–32px;内容列水平居中,列宽 ~720–740px。
- **action bar**(复制/重试/👍👎):默认隐藏,**hover 才浮出**(Claude 的"呼吸感")。

### 4.5 Markdown 元素样式

| 元素 | 样式 |
|---|---|
| 段落 | margin-bottom 16px |
| 引用 blockquote | 左 2px `--border-default` 竖条,左内边距 16px,`--text-secondary` |
| 行内 code | 底 `#EDEAE0`,圆角 4px,padding 2px 5px,mono 13px |
| 代码块 | 底 `#F0EDE4`(暗色 `#1F1E1B`),圆角 8px,padding 12–16px,mono 13px,右上角复制按钮 hover 浮出 |
| 链接 | `--accent-coral #D97757` |
| hr | 1px `--border-subtle` |

### 4.6 Composer(=翻页器)

- 大圆角框 16px,底 `#FFFFFF`(暗色 `#1F1E1B`),仅 1px `--border-default` 描边,**无阴影**。
- 内边距 `px-3.5 pt-3 pb-2.5`(左右 14px / 上 12px / 下 10px)。
- placeholder:"Message Claude…",色 `--text-tertiary`。
- 底部工具行:左 `+` 附件 + 模式 chip;中/右 模型选择器("Claude Opus 4.x ⌄");最右 **发送键**(圆形,底 `--accent-primary`,内白色 `↑`)。
- **发送键四状态**:空输入→麦克风;有文字→橙色 `↑`;生成中→停止方块(可 Cancel);语音中→StopDictation。
- **映射**:回车 = 翻下一段;生成中态 = 假打字机流出小说。

### 4.7 顶栏 & 侧栏细节

- **顶栏**:左=书名(可编辑,14–15px/500);中=模型名下拉;右=Share / ⭐ / "···"(重命名/删除/导出)。图标线宽 1.5px。
- **侧栏 New chat**:整行宽 ~40px,`--radius-btn 10px`,**低调描边非实心橙**,左侧 `+`/铅笔图标 + "New chat",hover 底色加深到 `#EBE7DB`。
- **Recents 项**:高 ~34–36px,单行 ellipsis,13–14px/400,圆角 8px;hover 底 `#EBE7DB` + 右侧"···";选中态底 `#E5E0D6`(**整块浅底高亮,无左侧色条**);**只显示书名文字,无封面缩略图**。
- **账户区**:吸底,圆形头像(首字母,底橙 28px)+ 账户名 + `⌄`。

### 4.8 字体决策(MVP 已拍板,非开放问题)

Styrene/Copernicus/Söhne 均为 Anthropic 商业授权字体,**不能随包分发**。MVP **最终兜底栈**如下(先 fallback 到商业名以命中已装该字体的机器,再落免费开源栈):

| 用途 | 首选(免费/开源,随包或系统) | 说明 |
|---|---|---|
| 正文 serif(**权重最高**) | `Source Serif 4`(拉丁) + `Noto Serif SC`(中文) | 中文正文 serif 是 Claude 中文观感的命门;`Noto Serif SC` 开源可随包,需与系统 `Songti SC`/宋体做**并排实测**取舍(宋体在小字号更"书面",Noto Serif SC 更接近 Claude 的现代衬线感) |
| UI sans | `system-ui`(mac=SF Pro,Win=Segoe UI) | 宁用 system-ui 也**不用 Inter**(一眼"AI 味") |
| mono | `JetBrains Mono`(开源随包) | 代码块 |

**开放项仅保留一条**:是否再寻更贴近 Copernicus 的付费替代 serif(不阻塞 MVP)。

---

## 5. 问答式伪装排版算法(核心)

### 5.1 总流程

```
[原始书籍] → ①解析 Parser → Chapter[]{index,title,rawText}
           → ②分块 Chunker → Block[](220~420字/块,三级边界:段→句→字数)
           → ③编排 Composer → Turn[](Block 与伪问题确定性交织)
           → ④渲染 Renderer → 气泡 DOM
           → ⑤交互 Driver(SessionState 状态机:回车推进=假思考+打字机 / 滚动追加=静默)
           → ⑥持久化 Position{fileHash,chunkerVersion,blockIndex,charStart}
```

**首要原则**:**全程确定性,禁用 `Math.random`**。伪问题、思考延时、引导壳、**以及所有"偶发"事件**全部用 `blockIndex`/`askOrdinal` 取模派生。这样续读、多端、重开完全一致——**同一段永远读到同一伪问题、同一打字节奏**,不会穿帮。测试点:同一 book 跑两遍,渲染出的 `Turn[]` 与打字节奏逐字节一致(可 hash 断言,见 §11.1)。

### 5.2 核心数据结构(TS)

```typescript
interface Block {
  bookId: string;
  blockIndex: number;        // 全书全局块序号 —— 唯一权威锚点
  charStart: number; charEnd: number;  // 仅在 chunkerVersion 失配时用于重定位
  paragraphs: string[];      // 2~5 段
  kind: 'body' | 'chapter-open' | 'image-alt' | 'formula-alt';
  isChapterOpen: boolean;
  chapterTitle?: string;     // 仅内部保存,渲染时绝不显示原文(§5.8)
  // 注:chapterIndex 从 blockIndex 派生,不单独持久化(避免三键不自洽)
}

type Turn = AssistantTurn | FakeUserTurn;
interface AssistantTurn { role:'assistant'; turnIndex:number; block:Block; shell?:AssistantShell; renderedMarkdown:string; }
interface FakeUserTurn  { role:'user'; turnIndex:number; text:string; templateId:number; anchorBlockIndex:number; }
interface AssistantShell { prefix?:string; suffix?:string; }

// 续读锚点:单一权威 = fileHash + chunkerVersion + blockIndex;charStart 仅回退用
interface ReadingPosition {
  fileHash: string;          // 内容 hash,进度主键(不用易变的 bookId 路径)
  chunkerVersion: number;    // 切块规则版本;失配则用 charStart 重定位
  blockIndex: number;        // 主锚点
  charStart: number;         // chunkerVersion 失配时的重定位回退键
  updatedAt: number;
  disguiseLevel: DisguiseLevel;
}
type DisguiseLevel = 'pure' | 'natural' | 'chatty';

interface ComposeConfig {
  disguiseLevel: DisguiseLevel;
  askEveryN: number;             // pure=12, natural=4, chatty=2
  targetChars: [number, number]; // 默认 [220,420]
  hardMaxChars: number;          // 默认 520
  backfillTurns: number;         // 续读回填历史轮数,默认 6
  chunkerVersion: number;        // 切块规则版本
}
```

**锚点权威优先级(单一真源)**:持久化以 `fileHash + chunkerVersion + blockIndex` 为主键;仅当加载时发现存档 `chunkerVersion` ≠ 当前版本(切块规则升级),才用 `charStart` 反查最近块重定位。`chapterIndex` 一律从 `blockIndex` 派生,不持久化。重定位伪码见 §5.6。

### 5.3 切块(Chunker)

三级边界:**段(`\n\n`)→句(`。!?…`)→字数硬切**。目标 220~420 字/块,单块硬上限 520。逻辑:

- 逐段喂入缓冲;`bufChars ≥ 220 且已≥2段`,或 `≥420`,或 `已 5 段` → flush 出块。
- 超长段(>420):先按句边界拆子片;无标点长段按 `hardMaxChars=520` 字数硬切。
- 本章第一块标 `isChapterOpen=true` 并吸收 `chapterTitle`(仅内部)。
- **切块规则任何变更都必须 bump `chunkerVersion`**,以触发续读重定位护栏。

### 5.4 伪问题模板库(24 条,3 分类 + 关键词填充)

```typescript
const FAKE_QUESTION_TEMPLATES = [
  // A 推进型(最高频)
  {id:0,cls:'advance',text:'继续'}, {id:1,cls:'advance',text:'接下来呢?'},
  {id:2,cls:'advance',text:'嗯,然后呢'}, {id:3,cls:'advance',text:'好的,请继续'},
  {id:4,cls:'advance',text:'再往下讲讲'}, {id:5,cls:'advance',text:'继续,别停'},
  {id:6,cls:'advance',text:'下面呢?'}, {id:7,cls:'advance',text:'还有吗'},
  // B 深入型
  {id:8,cls:'dig',text:'这一段能再详细讲讲吗'}, {id:9,cls:'dig',text:'展开说说上面这部分'},
  {id:10,cls:'dig',text:'这里我没太懂,再解释下'}, {id:11,cls:'dig',text:'为什么会这样?'},
  {id:12,cls:'dig',text:'这段的重点是什么'}, {id:13,cls:'dig',text:'能举个例子吗'},
  // C 回顾型(低频)
  {id:14,cls:'recap',text:'帮我把上面这段总结一下'}, {id:15,cls:'recap',text:'前面讲到哪了'},
  {id:16,cls:'recap',text:'简单概括下刚才的内容'}, {id:17,cls:'recap',text:'梳理一下前面的要点'},
  // D 关键词填充(默认关闭,仅 chatty 谨慎启用,见下)
  {id:18,cls:'kw',needsKeyword:true,text:'再说说「{kw}」这块'},
  {id:19,cls:'kw',needsKeyword:true,text:'关于{kw},再多讲点'},
  {id:20,cls:'kw',needsKeyword:true,text:'{kw}这部分继续'},
  {id:21,cls:'kw',needsKeyword:true,text:'刚提到的{kw},展开下'},
  // E 口语碎语(极低频)
  {id:22,cls:'chat',text:'哦,原来如此,继续'}, {id:23,cls:'chat',text:'有点意思,往下'},
] as const;
```

**确定性轮换**:用"第几次插问 `askOrdinal`"过一个**节奏环**(长 13)决定类别,再类内确定性轮换。**去重护栏**:维护最近 4 次 templateId 窗口,撞车则同类顺移一位——杜绝连续两条"继续"。

```typescript
const CLASS_RHYTHM = ['advance','advance','dig','advance','advance','recap',
  'advance','dig','advance','advance','chat','advance','dig']; // len 13
const CLASS_POOL = {
  advance:[0,1,2,3,4,5,6,7], dig:[8,9,10,11,12,13],
  recap:[14,15,16,17], chat:[22,23], kw:[18,19,20,21],
};
```

**节奏环无共振验证(设计断言 + 单测)**:三档 `askEveryN`(12/4/2)与节奏环长 13 **两两互质**(`gcd(12,13)=gcd(4,13)=gcd(2,13)=1`),故任何档位下类别序列都不与内容插问周期共振。单测覆盖:三档各跑 200 块,统计伪问题类别分布,断言无明显周期性(相邻同类间距的方差在阈内)。

**关键词提取(反露馅铁律,策略从"黑名单+频次"改为"白名单式安全过滤")**:网文里的高频词恰恰常是人名/门派/功法,单纯频次过滤反而放行它们。因此:

1. **高频即排除**:全书词频 top 0.5% 的词一律**丢弃**(高频专名最危险),而非纳入。
2. **疑似专名启发式丢弃**:满足任一即弃——词首命中 GB 常见姓氏表 / 词典未收录(OOV)/ 全书首次出现在对话或动作句中。
3. **默认关闭**:`kw` 模板 MVP 默认**不启用**,仅 `chatty` 档谨慎开启。
4. **命中率上限**:单本书 `kw` 型伪问题占比 **< 5%**;超限则回退非 kw 模板。
5. 基础过滤仍保留:`Intl.Segmenter('zh',{granularity:'word'})` 分词 + 停用词表 + 排除引号内容 + 长度 2~4。

**宁可全用"继续/然后呢"也不冒一次露馅风险。** 拿不到安全词就退回非 kw 模板。

### 5.5 编排 & 翻页交互(含状态机)

**编排 Composer**:`block.blockIndex > 0 && block.blockIndex % askEveryN === 0` 时在块前插一条伪问题;助手块偶发引导壳(`chapter-open` 强制引导句,其余 `blockIndex % 7 === 3` 给一次口语壳,大多数块**无壳**——刻意"不规整")。

**章节标题反露馅**:`chapter-open` **不显示原始标题**(可能含"血染魔刀"露馅词),转成引导句"好,我们接着往下。这是第 N 部分:"。

**Driver 状态机(补齐翻页/滚动冲突边界)**:

```typescript
type SessionState = 'idle' | 'typing' | 'committing';
```

不变量与规则(均为可测断言):

- **`cursor` 单调递增**:已渲染到的 turnIndex 只增不减;向上滚动回看历史**永不**触发 append(测试点:滚到顶后再滚,cursor 不变)。
- **`typing` 期间禁止 append**:打字机运行中,滚动到底**不新增单元**;若此时用户回车,则中断当前打字机并**补全整段**(不新增单元、cursor 不跳变),回到 `idle` 后方可再推进。
- **滚动 append 触发条件**:仅当 `state === 'idle'` 且 `scrollBottomGap < N px`(建议 N=120),并加 **150–250ms 防抖**(吸收触控板惯性滚动),才静默 append 下一单元。
- **回车推进**:`state:idle → committing`,`appendUserBubble(伪问题或"继续")` → 假思考 `120+(blockIndex*97)%280` ms(确定性)→ `state:typing` 逐字打字机 → `commitPosition` → `state:idle`。
- 取"渲染单元"= 一个 Assistant + 其紧邻前置的 FakeUser(若有)。

**打字机(参数集中定义,消除三处散值)**:统一到单一常量源,以 **ms/字素** 为单位:

```typescript
const TYPEWRITER_CONFIG = {
  baseMsPerGrapheme: [25, 45],    // 基础每字素耗时区间(确定性取点,非 random)
  graphemesPerTick:  [1, 3],      // 一次吐 1~3 字素模拟 token 流
  punctPauseMs:      [120, 300],  // 标点后额外停顿
  longPausePredicate: (i:number) => (i * 31) % 17 === 0,  // 偶发长停顿(确定性)
  longPauseMs:       [400, 700],
  thinkDelayMs:      (blockIndex:number) => 120 + (blockIndex * 97) % 280, // 假思考
} as const;
```

实现:`requestAnimationFrame` 累加时间(**不用 setInterval** 免掉帧露馅);中文按 `Intl.Segmenter` grapheme 逐字素推进;代码块/markdown 整块出不逐字;可 `AbortController` 中断,中断后直接补全整段再翻页;先出 "Claude is thinking…" 闪烁点再吐字,末尾闪烁 `▍` 光标。**§4/§9 两处引用同一个 `TYPEWRITER_CONFIG`,不得再出现散落数值。**

**"偶发"事件全部确定性化(禁 random)**:长停顿 `(i*31)%17===0`;口语壳 `blockIndex%7===3`;引导壳仅 `chapter-open`。测试点见 §11.1。

### 5.6 阅读位置模型 & 续读

- **主锚点** `blockIndex`(确定性切块下与内容一一对应)。
- **chunkerVersion 护栏(重定位伪码)**:

```typescript
function resolvePosition(saved: ReadingPosition, book: Book): number {
  if (saved.chunkerVersion === CURRENT_CHUNKER_VERSION) return saved.blockIndex;
  // 规则升级 → 用 charStart 反查:找 charStart 落在 [charStart,charEnd) 的块
  const blk = book.blocks.find(b => saved.charStart >= b.charStart && saved.charStart < b.charEnd);
  return blk ? blk.blockIndex : nearestByChar(book, saved.charStart);
}
```

- **续读重建(营造历史感)**:找到目标 `blockIndex` 对应 turnIndex,回填前 `backfillTurns`(默认 6,约 3 组问答)**静态渲染**(不走打字动画,否则续读要等半天),再从下一块继续,滚到底。回填内容因确定性与真实前文一致,不穿帮。

### 5.7 伪装强度档位

| 档位 | askEveryN | 观感 | 适用 |
|---|---|---|---|
| `pure` 纯净 | 12 | 几乎全是"回答" | 沉浸阅读、旁边没人 |
| `natural` 默认 | 4 | 每 3~4 段一问,最像真用 Claude | 日常摸鱼 |
| `chatty` 高频 | 2 | 频繁一问一答 | 老板常走动 |

切档**只改 Composer 插问密度,不改 Block 切分**,故不打乱续读锚点。三档 askEveryN 均与节奏环长 13 互质(§5.4),无共振。

### 5.8 反露馅清单

1. 章节标题绝不显示原文,只转"第 N 部分"。
2. 超长段句边界优先拆,无标点按 520 字硬切。
3. **图片** → `image-alt` 占位,渲染成"(此处略过一张插图)",**绝不显示图片**(出现小说插图=立刻露馅)。
4. 公式/特殊排版 → `formula-alt` 中性跳过。
5. 关键词填充白名单式安全过滤(高频即排除 + 疑似专名丢弃 + 默认关闭 + <5% 上限),宁缺毋滥。
6. 伪问题最近 4 条去重 + 同类顺移,杜绝连续两"继续"。
7. 大多数块无引导壳,保留原文口语分段,刻意"不规整"。
8. 全程确定性伪随机(含"偶发"事件),续读/多端/重开一致。
9. **Recents 侧栏不显示任何封面缩略图**(Claude 会话列表无封面)。
10. **错误一律伪装成 Claude 助手消息**,不弹系统对话框(见 §13)。

---

## 6. 技术架构

### 6.1 技术栈选型(版本已锁定)

| 层 | 选型 | 锁定版本 | 理由 / 约束 |
|---|---|---|---|
| 框架 | **Electron** | **v31.x(LTS)** | BaseWindow+WebContentsView 需 ≥ v30(2024-04 起稳定);直接取 v31 LTS 更稳。老板键叠层必须靠这套多视图模型(§9.1) |
| 渲染层 | React 18 + Vite + TypeScript | React **^18.3**,Vite **^5** | 生态成熟、HMR 快;TS 全程强类型契合确定性算法 |
| 状态管理 | Zustand | **^4.5** | 轻量、无 boilerplate,适合书架/会话/进度这类局部状态;避免 Redux 过重 |
| 样式 | CSS 变量 + CSS Modules | — | §4 token 层用原生 CSS 变量,微调只改一处;不强上 Tailwind 免"AI 味"类名 |
| markdown 渲染 | react-markdown + remark-gfm | react-markdown **^9**,remark-gfm **^4** | 渲染助手气泡内的 markdown/代码块 |
| EPUB | @gxl/epub-parser + epub2 | 见 §7.4 | `sec.toMarkdown()` 剥内嵌 CSS |
| TXT 编码 | jschardet + iconv-lite | jschardet **^3**,iconv-lite **^0.6** | 中文网文编码探测 |
| PDF | **pdfjs-dist(legacy build)** | **^4.x** | **必须 legacy build**,否则 Node/worker 环境报 `DOMMatrix`/`Path2D` 缺失 |
| MOBI(迭代) | foliate-js | git submodule 锁 commit | 不进 npm dependencies;需 DOM |
| 打包 | electron-builder | **^25** | productName/executableName 伪装、跨平台 ico/icns、mac extendInfo |
| 持久化 | electron-store + better-sqlite3 + safeStorage | electron-store **v8.x(CJS)**,better-sqlite3 **^11**(需 `electron-rebuild` 匹配 Electron ABI) | 见 §10;better-sqlite3 **MVP 不引**,首个需要 FTS 的功能才引 |

**裁决**:状态管理选 Zustand 而非 Redux/MobX(状态规模小,store+selector 足够);样式用原生 CSS 变量 token 层而非 Tailwind(可维护 + 去 AI 味)。这两条从"开放问题"提为已定决策。

### 6.2 主/渲染进程分工

```
主进程(Node,无 DOM)
├─ 窗口/视图管理:BaseWindow + 双 WebContentsView(reader / decoy 遮羞层)  ★统一窗口模型
├─ 全局快捷键 globalShortcut(老板键,main 内同步切换)
├─ 解析器工厂 ParserFactory(EPUB/TXT/PDF)→ worker_threads/utilityProcess
├─ 持久化:electron-store / better-sqlite3 / safeStorage
├─ 窗口伪装:title 锁定、setIcon、setSkipTaskbar、dock.hide、setContentProtection
└─ IPC 主控

渲染进程(reader,有 DOM)
├─ React UI(Claude 克隆)
├─ 伪装排版算法层 disguise/(chunker/composer/driver/position)
├─ 打字机动画(requestAnimationFrame)
├─ (迭代)MOBI/AZW3 解析(foliate-js 需 DOM,放隐藏 worker)
└─ 失焦模糊 / 遮羞层

渲染进程(decoy)= 预加载常驻的真·空白 Claude 视图(规格见 §9.1.1)
```

**IPC 要点**:
- 渲染进程**永不直接解析原始 ebook**(EPUB/PDF 可能含畸形 XML/脚本),主进程/worker 解析成纯 JSON Book 模型再 IPC 过去。
- Book 模型纯数据,`structuredClone` 友好;**正文按章传,别一次性传全书**。
- 老板键切换在 **main 进程同步执行**,别绕 IPC 往返(免延迟)。
- preload 用 `contextBridge` 暴露白名单 IPC(`window.privacy.onBlur`、`window.book.loadChapter` 等)。
- **BaseWindow 无 `webContents`**:每个 WebContentsView 各自准备 preload;窗口关闭时 WebContentsView 的 webContents **不会自动销毁**,须显式 `destroy()` 防内存泄漏。

---

## 7. 书籍格式与解析

**总原则**:所有格式收敛到统一 Book 模型;解析放 worker/utilityProcess;**两段式**(先出骨架 meta+toc+每章 title/charCount,text 懒加载);`fileHash` 做进度主键 + 缓存续读。**MVP 只做 EPUB/TXT/PDF 三格式**(MOBI/AZW3 见 §3.4)。**MVP 不解析封面**(Recents 不显示缩略图,少一层露馅面 + 省一份解析成本)。

### 7.1 统一 Book 中间模型(TS)

```typescript
export type BookFormat = 'epub' | 'txt' | 'pdf' | 'mobi' | 'azw3';  // mobi/azw3 迭代期启用

export interface BookMeta {
  title: string; author?: string; publisher?: string; language?: string;
  identifier?: string;                         // coverImage 字段 MVP 不填(不解析封面)
  format: BookFormat; sourcePath: string;
  fileHash: string;                            // 内容 hash,进度/去重稳定主键
}
export interface TocEntry { label:string; chapterIndex:number; anchor?:string; children?:TocEntry[]; }
export interface Chapter {
  index:number;               // spine/flow 顺序,权威排序键
  id:string; title:string;
  text:string|null;           // 纯文本(\n 分段);null=未加载
  charCount:number;           // 字数,不依赖 text
  loaded:boolean;
}
export interface Book { meta:BookMeta; toc:TocEntry[]; chapters:Chapter[]; totalChars:number; }
export interface BookParser {
  format:BookFormat;
  canParse(filePath:string):Promise<boolean>;
  parse(filePath:string):Promise<Book>;                 // 出骨架,text 懒加载
  loadChapter(book:Book, chapterIndex:number):Promise<string>;
}
```

### 7.2 各格式选型

| 格式 | 推荐库 | 关键点 |
|---|---|---|
| **EPUB** | `@gxl/epub-parser`(主)+ `epub2`(补 flow/元数据) | `sec.toMarkdown()` 天然剥内嵌 CSS(要按 Claude 重排,不要 EPUB 自带排版);`toHtmlObjects()` 保图片 base64(但正文渲染一律略过图片) |
| **TXT** | `jschardet` 探测 + `iconv-lite` 转码 | 见下编码探测 |
| **PDF** | `pdfjs-dist`(**legacy build**)`page.getTextContent()` | 按 item `transform`(x,y)**行聚类 + 行内 x 排序**(MVP 必做,见下);扫描版无文字层**降级提示不 OCR** |
| **MOBI/AZW3**(迭代) | `foliate-js`(git submodule 锁版本) | 唯一同吃 MOBI+KF8;需 DOM 放渲染进程隐藏 worker;DRM 书明确报错;先过 §3.4 spike |

**EPUB 坑**:`toc ≠ 阅读顺序`,拼正文必须用 `flow`/spine,`toc` 只做导航树。章节 XHTML 用 `node-html-parser`/`cheerio` 抽 `textContent`,`<p>`/`<br>` 转 `\n` 保段落边界。

**TXT 编码探测**(中文网文重灾区):

```typescript
function detectAndDecode(filePath: string): string {
  const buf = fs.readFileSync(filePath);
  if (buf[0]===0xEF&&buf[1]===0xBB&&buf[2]===0xBF) return buf.slice(3).toString('utf8');
  if (buf[0]===0xFF&&buf[1]===0xFE) return iconv.decode(buf,'utf16le');
  if (buf[0]===0xFE&&buf[1]===0xFF) return iconv.decode(buf,'utf16be');
  const sample = buf.subarray(0, 64*1024);   // 只采样前 64KB
  const res = jschardet.detect(sample, {
    detectEncodings:['UTF-8','GB2312','GB18030','Big5'], minimumThreshold:0 });
  let enc = (res.encoding||'GB18030').toLowerCase();
  if (enc.startsWith('gb')||enc==='gbk'||enc==='gb2312') enc='gb18030'; // 归一超集
  return iconv.decode(buf, iconv.encodingExists(enc)?enc:'gb18030');
}
```

**TXT 章节切分**:正则匹配"第X章/卷/楔子/番外/Chapter N"(`^` 配 `m` 标志按行锚定),全角空格 `　`、行首缩进都覆盖;**无章节标记按每 3000 字伪分章**(否则几 MB 一次性渲染卡死)。超大 TXT(几十 MB)走流式/分片读,不一次 `readFileSync` 全量(异常路径见 §13)。

```typescript
const CHAPTER_RE = /^[ \t　]*(?:第[零〇一二三四五六七八九十百千万\d]{1,9}[章节回卷篇]|楔子|序章?|引子|番外|后记|尾声|Chapter\s+\d+)[ \t　]*.{0,40}$/gm;
```

**PDF 坑(重排是能读的前提,非优化项 → 列入 M2 验收)**:`getTextContent()` 顺序=内容流顺序≠视觉顺序,**MVP 必须**按 `transform` 聚类成行(同 y 归一行)+ 行内按 x 排序;英文书按 x 间距补空格。不做行聚类 = PDF 正文乱序 = 直接露馅。扫描版返回空 items → **第一版直接降级提示**("该 PDF 无文字层,无法阅读"),不扛 tesseract 几十 MB。**多栏/表格等复杂版式**的进阶重排属迭代(§3.2)。

**MOBI/AZW3 坑(迭代期)**:`foliate-js` 无正式 npm 发布、API 不稳定 → git submodule 锁版本;依赖 DOM(`DOMParser`)→ 放渲染进程隐藏 worker;DRM 书(亚马逊 `.azw`/`.kfx`)无法解密 → 明确报错。**必须先过 §3.4 spike。**

### 7.3 性能架构

- 解析放 `worker_threads`/`utilityProcess.fork()`,UI 全程不卡;PDF worker 指对 `workerSrc`(legacy build)。
- 两段式:`parse()` 秒出骨架(侧栏/目录即出)→ `loadChapter()` 滚到哪加载哪 + 预取下一章。
- 缓存:首解析后 Book 骨架按 `fileHash` 落 `app.getPath('userData')`(json;FTS 需求出现后才用 sqlite),二次秒开续读直达。

### 7.4 依赖清单(锁版本)

```jsonc
{
  "dependencies": {
    "@gxl/epub-parser": "^1.2.0",
    "epub2": "^3.0.2",
    "jschardet": "^3.1.4",
    "iconv-lite": "^0.6.3",
    "pdfjs-dist": "^4.10.38",        // ★ 用 legacy build 入口:pdfjs-dist/legacy/build/pdf.mjs
    "node-html-parser": "^6.1.13",
    "react": "^18.3.1",
    "react-markdown": "^9.0.1",
    "remark-gfm": "^4.0.0",
    "zustand": "^4.5.5",
    "electron-store": "^8.2.0"       // ★ v8 锁死(CJS);v10 是 ESM 不兼容当前 CJS 主进程
    // better-sqlite3: MVP 不引,首个 FTS 功能才加(需 electron-rebuild 匹配 ABI)
    // foliate-js: git submodule,不进 dependencies(迭代期)
    // tesseract.js + chi_sim: 不做
  },
  "devDependencies": {
    "electron": "^31.7.0",
    "electron-builder": "^25.1.8",
    "vite": "^5.4.0",
    "typescript": "^5.6.0"
  }
}
```

---

## 8. 微信读书同步方案(迭代 M6,非首发)

### 8.1 可行性结论

**只同步书架 + 书名(充当伪装 Recents),正文 100% 读本地文件。**

| 数据层 | 可行性 | 取舍 |
|---|---|---|
| 书架列表 + 书名/进度 | 能(官方 Agent Skill 合规路径) | **做**(填充 Recents;封面不取,§7 不显示缩略图) |
| 阅读统计 / 章节目录 | 能(官方 Skill 支持) | 可做 |
| 划线/笔记(读取) | 官方 Skill 支持读取,但历史 cookie 路径封号高危 | 走官方 API 可做,非重点 |
| **书籍正文全文** | 官方**不提供**;逆向抓取封号几乎必然 + 违约侵权 | **绝不做** |

**裁决**:正文抓取(Canvas hook 逆向 + 双向加密 + XWEB 校验)工程量巨大、微信读书一改前端即废、封号+法律三重叠加,且与"本地全格式导入已覆盖正文"高度重复——一律不碰。这恰好和产品定位一致:**会话列表要像真项目(书架同步填充),内容你自己塞(本地)**。

### 8.2 API 现状与核实状态(评审要求:标注证据来源)

> **核实结论(2026-07 复核)**:微信读书**官方 Agent Skill / API Key 机制真实存在**,于 **2026-05-17 发布**,官方入口 `weread.qq.com/r/weread-skills`,通过它获取 `wrk-` 开头的个人 API Key,覆盖**书架、阅读统计、划线/想法读取、搜书、推荐**等**只读**能力(暂无写操作)。已有社区项目(weread-cli、awesome-weread 等)基于其构建。来源见文末。
>
> **草稿原文的错误已修正**:早前草稿写的 endpoint `i.weread.qq.com/api/agent/gateway` 属**臆造/混淆**——`i.weread.qq.com` 是**旧的非官方内部接口域名**(cookie 抓取路径),**不是** 2026 官方 Agent Gateway。官方接入以其提供的 Skill 包/网关为准,**具体 endpoint 与字段以接入时官方文档为准,不在本文档硬编码**(避免再次固化错误)。

**分步实现(优先级从高到低)**:

1. **首选:官方 Agent Skill(合规零逆向)** —— 引导用户在 `weread.qq.com/r/weread-skills` 获取 `wrk-` API Key → 写入 `WEREAD_API_KEY`(经 safeStorage 加密存,§10)→ 调官方书架能力 → 映射成 Recents 条目。正文仍本地。
   - **前置检查点(M6 开工前必做)**:实测官方书架返回字段是否稳定、是否够填 Recents(书名足矣,封面不需要)。
   - **降级**:若官方 API 变更/不可用/字段不满足 → 微信读书同步**整体砍掉**(非首发,不阻塞任何其他功能)。
2. **不做:cookie 抓取(旧 `i.weread.qq.com` 路径)** —— 需手动粘贴 cookie、`wr_skey` 会过期、只能拿对朋友公开的书、且封号高危。官方精选库已明确排除此类。**不采用。**
3. **绝不做:抓正文**(理由见 §8.1)。

### 8.3 凭据存储与封号风险

- API Key 用 **safeStorage 加密**后存(§10)。
- **风险清单**:微信读书 2023-12 起风控主打笔记/爬取;历史 cookie 抓取插件有实测封号案例,处罚阶梯 警告→5天临封→永封,申诉基本无效。**走官方 Agent Skill 才是安全路径**;严格限速(打开 App 同步一次 + 手动刷新,绝不轮询)。
- **对产品建议**:微信读书同步排在 **M6**,非首发关键路径;首发只做本地导入。

---

## 9. 隐蔽功能实现(Electron API)

> **窗口模型统一**:全程 **`BaseWindow` + 两个 `WebContentsView`**(reader / decoy)。§9.2 的 title/icon 伪装示例全部改写为对 `BaseWindow` + `view.webContents` 的调用,**不再出现 `new BrowserWindow`**(BrowserWindow 无法挂多视图叠层,与老板键架构冲突)。

### 9.1 老板键(无闪烁三原则)

**架构:单 `BaseWindow` + 两个 `WebContentsView` 叠层**(reader 在上,decoy 遮羞层在下,**提前加载常驻**)。

```js
const { app, globalShortcut, BaseWindow, WebContentsView } = require('electron');

let win, readerView, decoyView, hidden = false;

app.whenReady().then(() => {
  win = new BaseWindow({ width: 1200, height: 800, title: 'Claude' });

  decoyView = new WebContentsView();          // 遮羞层:先加载,常驻底层
  win.contentView.addChildView(decoyView);
  decoyView.webContents.loadFile('decoy/decoy-claude.html');

  readerView = new WebContentsView();         // reader:叠在上层
  win.contentView.addChildView(readerView);
  readerView.webContents.loadURL(READER_URL);
  layout();                                    // 两 view 同尺寸满铺

  const ok = globalShortcut.register('CommandOrControl+Shift+Space', triggerBossKey);
  if (!ok) globalShortcut.register('CommandOrControl+`', triggerBossKey); // 被占用降级
});
app.on('will-quit', () => globalShortcut.unregisterAll());

function triggerBossKey() {
  const t0 = performance.now();
  hidden = !hidden;
  readerView.setVisible(!hidden);            // 只切可见性,零 loadURL 零白屏
  if (hidden) decoyView.webContents.focus(); // 焦点给遮羞层
  else        readerView.webContents.focus();
  // 埋点断言:t0 → 此处 < 16ms(见 §11 验收)
}
```

**三原则**:① 遮羞内容预加载常驻;② 触发只切可见性/焦点,**绝不当场 loadURL**;③ 切换放 main 进程同步执行。**允许用户自定义快捷键**(`register` 返回 false 即被占用要降级)。

**彻底隐身变体**(可选,老板键第二段;**默认关闭**,设为可选项):Win `win.hide()+win.setSkipTaskbar(true)`;mac `app.dock.hide()`(连带移出 ⌘-Tab)。靠全局快捷键/Tray 唤回。

#### 9.1.1 遮羞层(decoy)规格(隐蔽核心,补齐)

- **复用同一套 `tokens.css`**(§4.1),与 reader 共享变量,改一处两处同步。
- **内容**:空 Recents(或 1~2 条**中性假会话**,如"重构建议""周报润色 v2")+ 空 Composer(placeholder "Message Claude…")+ 顶栏书名位显示新会话默认名。整体 = 一个刚打开、尚未提问的 Claude 空会话。
- **切回**:同一快捷键 **toggle**(再按一次 reader 重新可见并夺焦)。
- **误输入防护(关键)**:decoy 里的 Composer 输入**不触发任何翻页、不写任何书籍状态、不 IPC 到 reader**——防"老板走后你以为还在 reader,结果把翻页键敲进了 decoy",或反之在 reader 里敲出真问题。decoy 的回车仅本地清空输入或无操作。
- **验收**:decoy 与 reader 并排,§4 三铁律(无纯白 / 无阴影 / serif)逐项一致;取色器比对关键区域色值,偏差 token 级。

### 9.2 标题 / 图标 / 应用名伪装(BaseWindow 版)

```js
win.setTitle('Claude');
// ★ HTML <title> 会覆盖窗口标题,须在每个 WebContentsView 的 webContents 上锁死:
readerView.webContents.on('page-title-updated', (e) => e.preventDefault());
decoyView.webContents.on('page-title-updated', (e) => e.preventDefault());
win.setIcon('claude.png');
if (process.platform === 'darwin') app.dock.setIcon('claude.png');
```

**进程名 / 全链路显示名伪装**:任务管理器进程名 = **exe 文件名**,`app.setName()` 改不了它。靠打包配置,并补齐 mac ⌘-Tab / Win 任务管理器"描述列":

```jsonc
// electron-builder.json
{
  "productName": "Claude",
  "win": {
    "executableName": "Claude",
    "icon": "build/claude.ico"
    // FileDescription/版本信息随 productName 生成,影响任务管理器"描述"列
  },
  "mac": {
    "bundleId": "com.你的域名.reader",   // 自有域名,避免商标级冒充
    "icon": "build/claude.icns",
    "extendInfo": {
      "CFBundleName": "Claude",          // ★ ⌘-Tab 显示名来自这里
      "CFBundleDisplayName": "Claude"    // 访达/"关于本机"显示名
    }
  }
}
```

> 合规:**神似而非全等**——名字用 "Claude"、图标近似风格,但 `bundleId` 用自有域名,避免对 Anthropic 的商标级冒充(见 §12)。

### 9.3 进度记忆

见 §5.6 + §10:每推进一块落库 `ReadingPosition`(`fileHash + chunkerVersion + blockIndex`);续读回填 6 条历史静态渲染。

### 9.4 假打字机

参数与实现见 §5.5 的 `TYPEWRITER_CONFIG`(单一参数源,本节不再另列数值,避免不一致):`requestAnimationFrame` 变速 + 标点停顿 + 偶发长停(确定性)+ 一次 1~3 字素 + `AbortController` 可中断 + "Claude is thinking…" 前置 + 末尾闪烁 `▍`。

### 9.5 防偷看增强(M5)

```js
// 失焦模糊(主力,零成本无闪烁)—— BaseWindow 事件
win.on('blur',  () => readerView.webContents.send('privacy:blur'));   // renderer: body.classList.add('mask') → CSS filter:blur(18px)
win.on('focus', () => readerView.webContents.send('privacy:focus'));
// 内容保护(防会议共享/截图)—— 窗口创建时就设
win.setContentProtection(true);
```

**平台差异与如实降级(评审要求:不给虚假安全感)**:
- **Windows**:截图录屏都防(可能显示黑块),**开启有实际意义**。
- **macOS**:`setContentProtection` 只防系统截图,**QuickTime / 系统录屏 / Zoom 屏幕共享均可绕过**。而摸鱼露馅主场景(会议投屏)恰恰在这些工具上。
- **结论**:content protection 仅在 **Windows** 作为防会议共享手段有效;**macOS 会议共享无法用它兜底,只能靠老板键 + 失焦模糊 + 自觉不投屏**。不得把它写成 macOS 防会议露馅的主力。

### 9.6 跨平台雷区速查

1. `globalShortcut` 只能 ready 后注册,返回 false 要降级,`will-quit` 里 `unregisterAll()`。
2. 老板键无闪烁 = 遮羞层预加载 + 只切可见性。
3. 进程名靠 `productName`/`executableName`(+ mac `CFBundleName`),不是 `app.setName()`。
4. `skipTaskbar` 在 hide→show 后丢失,每次 show 后重设。
5. mac `dock.hide()` 连带移出 ⌘-Tab,需快捷键/Tray 唤回。
6. `page-title-updated` 必须在**每个 WebContentsView 的 webContents** 上 `preventDefault()`。
7. `safeStorage` 必须 app ready 后调,推荐异步版 `encryptStringAsync`。
8. `setContentProtection` 别在 ipc handler 内首次调;mac 防不住 QuickTime。
9. **BaseWindow 关闭不自动销毁子 WebContentsView 的 webContents**,须显式销毁防泄漏。

---

## 10. 数据模型与持久化

**选型:electron-store + better-sqlite3 + safeStorage 混用(非二选一)**

| 数据 | 存储 | 引入时机 | 理由 |
|---|---|---|---|
| 书架列表、每本书阅读位置、书籍文件路径、窗口/伪装配置 | **electron-store v8.x** | M0 起 | 少量结构化 JSON、读写频繁量小、零依赖跨平台稳(CJS 项目必须锁 v8,v10 是 ESM) |
| 全文索引、书签、微信读书章节缓存 | **better-sqlite3(FTS5)** | **首个需要 FTS 的功能**(书内搜索或微信同步,取先到者);**MVP M0~M3 不引** | 大数据量、需查询分页;延后引入减小 native 依赖打包风险(需 electron-rebuild 匹配 ABI) |
| **微信读书 API Key(敏感)** | **safeStorage 加密**后存 electron-store | M6 | 平台加密(mac Keychain / win DPAPI) |

```js
// 阅读进度(electron-store)—— 主键 fileHash
const store = new Store({ name: 'library' });
store.set(`progress.${fileHash}`, { chunkerVersion, blockIndex, charStart, disguiseLevel, updatedAt: Date.now() });

// 敏感凭据(safeStorage,app ready 后调)
function saveApiKey(raw) {
  if (!safeStorage.isEncryptionAvailable()) return;
  store.set('weread.apiKey', safeStorage.encryptString(raw).toString('base64'));
}
```

**持久化数据实体**:
- `Book 骨架缓存`(按 fileHash)—— 二次秒开。
- `ReadingPosition`(按 fileHash,§5.2)—— 主锚点 `fileHash+chunkerVersion+blockIndex`,charStart 回退。
- `书架元数据`(书名/自定义名/分类/导入时间;**不含封面路径**)。
- `AppConfig`(伪装档位默认值、老板键快捷键、主题跟随、内容保护开关)。
- `WeReadCredential`(safeStorage 加密,M6)。

**安全说明**:safeStorage 同一用户下任意进程可解密——对"防同事偷看凭据"够用,不是抗高强度攻击方案。

---

## 11. 开发路线图 / 里程碑(含工作量估算)

> 估算单位 person-week(单人)。**首发 = M0~M3**,微信同步/防偷看延后。验收细则见 §11.1「验收标准与测试」。

| 里程碑 | 内容 | 估工(pw) | 高风险吃时项 | 验收标准(可测口径见 §11.1) |
|---|---|---|---|---|
| **M0 脚手架** | Electron v31 + Vite + React + TS 工程、BaseWindow+双视图通信、electron-builder | 0.5~1 | native 依赖打包 | 空窗口跑通;`productName:Claude` 打包后任务管理器显示 Claude.exe / mac ⌘-Tab 显示 Claude |
| **M1 UI 克隆** | §4 全部:侧栏/主区/Composer/顶栏、token 层、暗色跟随、非对称气泡、markdown 渲染 | **2~3**(字体/色值反复调) | serif 字体取舍、色值逐项比对 | 像素比对通过(§11.1a);三铁律达标;暗色跟随系统 |
| **(M1.5 MOBI spike,可选)** | §3.4:foliate-js 隐藏 worker 跑通 MOBI+KF8 | 1(**不确定**) | API 不稳、DOM 隔离 | 达标则纳入,否则走降级路径 |
| **M2 本地书 + 问答伪装** | §7 EPUB/TXT/PDF 三解析器(含 **PDF 行聚类重排**)+ 统一 Book 模型 + §5 chunker/composer/driver(状态机)+ 进度记忆 + 打字机 | **3~4** | PDF transform 重排、确定性算法、打字机状态机 | 三格式各导入 1 本正常阅读;PDF 正文顺序正确;回车翻页有打字机;重开续读到原处;确定性 hash 断言(§11.1b) |
| **M3 隐蔽功能四件套** | 老板键(叠层遮羞 + decoy 规格 §9.1.1)、标题/图标/全链路名伪装、伪装档位 UI | **1.5~2** | 遮羞层误输入防护、老板键埋点 | 老板键 <16ms 切换且无 loadURL 事件(§11.1);标题锁死 Claude;decoy 三铁律一致;三档随书记忆 |
| **M4 打包分发** | 双平台打包、图标/名伪装收尾、签名(可选)、自动更新(可选) | 1~1.5 | mac 公证 | 双平台安装即用;伪装完整;冷启 <3s |
| **M5 防偷看**(迭代) | 失焦模糊、content protection(仅 Win 有效) | 0.5~1 | — | 失焦即模糊;Win 会议共享看不到正文;mac 如实标注局限 |
| **M6 微信读书同步**(迭代) | 官方 Agent Skill 书架只读同步(先过 §8.2 检查点) | 1~2 | 官方 API 字段稳定性 | 书架填充 Recents(正文仍本地);API 不可用则整体砍掉 |

**首发总量估算**:M0~M4 约 **8~11.5 pw**(不含可选 MOBI spike),其中 M1 UI 克隆与 M2 算法层是吃时主力,可据此砍范围。

**关键路径**:M0→M1→M2→M3→M4。

### 11.1 验收标准与测试(新增,主观项转可测)

| 类别 | 项 | pass/fail 阈值(可测口径) |
|---|---|---|
| **a. 像素对比** | UI 与 claude.ai 一致 | 提供 N 张 claude.ai 截图基线,关键区域(气泡内边距、正文字号/行高、圆角、核心色值)用取色器/DevTools 逐项比对,**偏差 token 级**(色值 ΔE < 3、间距 ±2px) |
| **b. 确定性** | 同书两遍逐字节一致 | 同一 book 跑两遍,序列化 `Turn[]` + 打字节奏时间轴做 **SHA-256**,两次 hash 必须相等 |
| **c. 打字机节奏** | 参数单一源 | 断言渲染只读 `TYPEWRITER_CONFIG`;无 `Math.random` 调用(lint 规则禁用 + 单测扫描) |
| **d. 翻页状态机** | cursor 单调 / typing 期禁 append / 向上不 append | 自动化滚动脚本跑 500 次,断言 cursor 从不回退、typing 期间无新单元、滚顶后 cursor 不变 |
| **e. 老板键** | 切换延迟 | `performance.now()` 埋点:从 `globalShortcut` 回调进入到 `setVisible` 返回 **< 16ms**;切换 100 次,断言**无一次**触发 `did-start-loading`/`loadURL` |
| **f. 遮羞层不加载** | decoy 就绪且不再加载 | app ready 后 3s 内 decoy `isLoading()===false`;老板键触发时 decoy 不产生任何 `did-start-loading` 事件 |
| **g. 反露馅 checklist** | 人工过一遍 | §5.8 十条逐项人工核:插图不显示 / 章节标题不露原文 / 无连续两"继续" / 暗色跟随 / Recents 无封面 / 错误伪装成助手消息 |
| **h. 性能** | 启动/导入/翻页 | 冷启 **<3s**;导入 5MB TXT 首屏 **<1s**;老板键 **<16ms**;翻页打字机首字 **<300ms** |

---

## 12. 风险与合规

| 风险 | 说明 | 缓解 |
|---|---|---|
| **版权/法律** | 用户导入盗版小说、抓取微信读书正文侵权 | 只做"本地文件阅读器",不内置书源/不抓正文;用户导入内容责任自负(EULA 声明) |
| **商标冒充** | 完全等同官方 Claude 图标/名/bundleId 有商标风险 | **神似而非全等**:名用 Claude、图标近似风格、bundleId 用自有域名 |
| **微信读书封号** | 旧 cookie 路径拉笔记/正文/高频请求触发风控,永封申诉无效 | 只走**官方 Agent Skill** 拉书架、严格限速、绝不碰正文;同步非 MVP(M6) |
| **被识破失败模式** | 显示小说插图、章节标题露馅词、匀速打字、连续"继续"、纯白背景、无 serif、Recents 显封面 | §5.8 反露馅清单(10 条)+ §4 三铁律逐条落地 + §11.1g checklist;失焦模糊兜底 |
| **隐私** | 凭据泄露 | safeStorage 加密;不上传任何用户数据;纯本地 |
| **content protection 局限** | mac 防不住 QuickTime/Zoom | §9.5 如实降级:仅 Windows 有效;mac 会议共享靠老板键 + 自觉 |
| **MOBI/AZW3 不确定性** | foliate-js API 不稳、需 DOM 隔离 | 下沉出 MVP;若做则先过 §3.4 spike + 降级路径 |
| **微信官方 API 变更** | 官方 Skill 字段/可用性变化 | M6 前置检查点;不可用则整体砍掉,不阻塞 |

---

## 13. 异常与降级(且不露馅)· 新增

**统一原则**:所有错误**伪装成一条 Claude 助手消息**呈现,**绝不弹系统对话框**(一个写着"解析失败"的系统弹窗在 Claude 界面上极其突兀,本身就是露馅)。报错文案走 Claude 口吻。

| 错误类型 | Claude 风格文案(助手气泡) | 降级动作 |
|---|---|---|
| 损坏/畸形文件 | "抱歉,这个文件我读不太出来,可能已损坏。" | 不加入书架,保留导入入口 |
| DRM MOBI/AZW3(迭代期) | "这个文件带有版权保护,我无法打开它。" | 拒绝导入 |
| 无文字层 PDF(扫描版) | "这个 PDF 看起来是扫描件,没有可读的文字层。" | 拒绝,不 OCR |
| 超大 TXT(几十 MB) | 静默:流式分片读 + 每 3000 字伪分章,首屏先出 | 不一次性 readFileSync;后台续解析 |
| 解析 worker 崩溃 | "刚才出了点问题,要不要再试一次?" | 重启 worker,一键重试 |
| 微信读书 Key 过期/失效(M6) | "微信读书的连接好像过期了,去设置里重新连接一下吧。" | 引导重新获取 API Key |
| 不支持的格式(如 MOBI 未做时) | "抱歉,我暂时无法读取这个文件,试试导入 EPUB 或 TXT 吧。" | 拒绝导入 |

---

## 14. 已定决策(原"开放问题"中必须前置的已拍板)

以下四项评审判定为 **MVP 开工前必须拍板**,已从"开放"转为"已定":

1. **MVP 格式边界** = EPUB + TXT + PDF(文字层);MOBI/AZW3 下沉迭代(§3.1、§3.4)。
2. **窗口模型** = BaseWindow + 双 WebContentsView,全程统一,不用 BrowserWindow(§6.2、§9)。
3. **样式方案** = 原生 CSS 变量 + CSS Modules,不上 Tailwind(§6.1)。
4. **字体兜底栈** = 正文 `Source Serif 4`+`Noto Serif SC`、UI system-ui、mono `JetBrains Mono`(§4.8)。

### 14.1 真正可延后的开放问题

1. **老板键第二段**(彻底隐身 hide+skipTaskbar)默认关闭,是否提供为可选项——倾向默认只遮羞层叠切。
2. **代码块伪装频率**:小说正文偶发插入假代码块增强伪装还是显突兀?需用户测试;倾向低频且仅在"技术类伪问题"后。
3. **签名/公证时机**:mac 公证 + Win 签名成本 vs 分发范围,是否首发就做。
4. **serif 付费替代**:是否再寻更贴近 Copernicus 的付费替代 serif(不阻塞 MVP)。

---

## 15. 目录结构建议

```
moyu-reader/                          # 独立新仓库(勿放固件仓 multi-dev-assistant)
├─ package.json
├─ electron-builder.json              # productName:Claude / executableName / mac extendInfo
├─ tsconfig.json
├─ vite.config.ts
├─ build/                             # 打包资源
│  ├─ claude.ico                      # Win 图标(近似风格)
│  └─ claude.icns                     # mac 图标
├─ src/
│  ├─ main/                           # 主进程(Node,无 DOM)
│  │  ├─ index.ts                     # app 生命周期、BaseWindow + 双 WebContentsView
│  │  ├─ boss-key.ts                  # globalShortcut + 叠层切换 + 埋点
│  │  ├─ disguise-win.ts              # title/icon/skipTaskbar/dock/contentProtection
│  │  ├─ ipc.ts                       # IPC 主控(白名单)
│  │  ├─ store/                       # electron-store / (迭代)better-sqlite3 / safeStorage
│  │  │  ├─ library.ts
│  │  │  ├─ progress.ts               # fileHash+chunkerVersion+blockIndex
│  │  │  └─ credential.ts             # safeStorage(M6)
│  │  └─ parsers/                     # 解析器工厂(worker/utilityProcess)
│  │     ├─ factory.ts
│  │     ├─ epub.ts                   # @gxl/epub-parser + epub2
│  │     ├─ txt.ts                    # jschardet + iconv-lite + 流式大文件
│  │     ├─ pdf.ts                    # pdfjs-dist legacy + transform 行聚类重排
│  │     └─ mobi.worker.ts            # foliate-js(迭代,需 DOM;先过 spike)
│  ├─ preload/
│  │  └─ index.ts                     # contextBridge 白名单(book/privacy/boss)
│  ├─ renderer/                       # reader 渲染进程(React,有 DOM)
│  │  ├─ main.tsx
│  │  ├─ App.tsx
│  │  ├─ theme/
│  │  │  └─ tokens.css                # §4.1 CSS 变量表(reader 与 decoy 共用)
│  │  ├─ components/                  # Claude 克隆 UI
│  │  │  ├─ Sidebar.tsx               # Recents(书架,无封面)/ Projects / New chat / 账户
│  │  │  ├─ TopBar.tsx
│  │  │  ├─ MessageList.tsx           # 气泡流
│  │  │  ├─ AssistantBubble.tsx       # 全宽 serif 无气泡(小说正文)
│  │  │  ├─ UserBubble.tsx            # 右侧灰圆角(伪问题)
│  │  │  ├─ Composer.tsx              # 翻页器 + 发送键四状态
│  │  │  └─ Typewriter.tsx            # rAF 打字机(读 TYPEWRITER_CONFIG)
│  │  ├─ disguise/                    # ★ 伪装排版算法层(§5)
│  │  │  ├─ types.ts                  # Block/Turn/ReadingPosition/ComposeConfig
│  │  │  ├─ config.ts                 # TYPEWRITER_CONFIG 等单一参数源
│  │  │  ├─ chunker.ts                # §5.3 切块(bump chunkerVersion)
│  │  │  ├─ composer.ts               # §5.5 编排 + 节奏环
│  │  │  ├─ templates.ts              # §5.4 伪问题模板库
│  │  │  ├─ keyword.ts                # 白名单式安全关键词提取
│  │  │  ├─ driver.ts                 # §5.5 翻页交互 + SessionState 状态机
│  │  │  └─ position.ts               # §5.6 续读重建 + 重定位
│  │  ├─ store/                       # Zustand(书架/会话/进度/配置)
│  │  └─ weread/                      # M6 微信读书官方 Agent Skill
│  │     └─ shelf-sync.ts
│  └─ decoy/                          # 遮羞层渲染进程(预加载常驻)
│     └─ decoy-claude.html            # 像素级仿的空会话(复用 tokens.css)
├─ vendor/
│  └─ foliate-js/                     # git submodule(锁版本,迭代期)
└─ resources/
   └─ fonts/                          # 开源 serif/sans(Source Serif 4 / Noto Serif SC / JetBrains Mono)
```

**落位说明**:算法层(chunker/composer/driver/position/config/templates/keyword)全部在 `renderer/disguise/`;解析器在 `main/parsers/`(worker 隔离);MOBI 解析器迭代期因需 DOM 放渲染进程 worker。本产品**新建独立仓库**,不放在当前固件仓 `D:\Frimware\multi-dev-assistant`(那是 BLE_PROG 烧录器仓)。

---

## 附:参考来源(关键事实核实)

- 微信读书官方 Agent Skill / API Key(2026-05-17 发布,`wrk-` key、`weread.qq.com/r/weread-skills`、只读能力、旧 `i.weread.qq.com` 为非官方 cookie 路径):[小众软件 · 微信读书发布官方 Skill](https://www.appinn.com/weread-skills/)、[awesome-weread(官方 Agent Skill 二创精选)](https://github.com/BENZEMA216/awesome-weread)、[weread-cli(基于官方 API)](https://github.com/shiquda/weread-cli)
- Electron BaseWindow + WebContentsView(v30 起稳定、叠层/内存注意事项):[Electron 官方 BaseWindow 文档](https://www.electronjs.org/docs/latest/api/base-window)、[Electron v30.0.0 Release](https://releases.electronjs.org/release/v30.0.0)
