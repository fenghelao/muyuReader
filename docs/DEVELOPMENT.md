# 开发交接文档(muyuReader）

> 面向接手开发者 / AI 编码助手(Codex 等)。读完这份就能接着干,不需要额外上下文。
> 设计蓝图见 [`PROJECT_PLAN.md`](PROJECT_PLAN.md)(需求/背景的单一真源);本文件是 **as-built 现状 + 下一步**。
> 本地路径 `D:\code\MuYu`,remote `git@github.com:fenghelao/muyuReader.git`(main)。

---

## 1. 一句话

界面像素级伪装成 **Claude 桌面客户端**的电子书阅读器(上班摸鱼读小说):侧栏 Recents=书架、正文伪装成 Claude 的回答、回车"发消息"=翻页、`Ctrl+Shift+Space`=老板键秒切空白 Claude。

## 2. 当前进度(M0–M4 前置功能已完成)

| 里程碑 | 状态 | 内容 |
|---|---|---|
| M0 脚手架 | ✅ | electron-vite(main/preload/renderer)+ React18+TS+Vite+Zustand;electron-builder 配好(productName=Claude) |
| M1 UI 克隆 + 问答伪装 | ✅ | 像素级复刻 Claude 桌面版(token 层已逐项核对);Sidebar/TopBar/Thread/Composer;回车翻页+假思考+逐字打字机;常规/混合两种排版;字号可调;亮暗跟随 |
| M2 解析器 + 切块 | ✅(逻辑通,待真机多样本回归） | 主进程 TXT/EPUB/PDF 解析 → 统一 Book;渲染层 chunker 切块;New chat 导入 |
| M3 老板键双视图 | ✅ | 主进程 BaseWindow + 两个 WebContentsView(reader/decoy),只切可见性=零闪烁 |
| 进度持久化 | ✅ | electron-store 存书架元数据 + `ReadingPosition{fileHash,chunkerVersion,blockIndex}`,重启自动加载上次活跃书籍 |
| 书架真实化 | ✅ | Recents 本地书架、搜索、重命名、删除二次确认、Relocate 路径迁移、最近阅读置顶 |
| 阅读交互 | ✅ | Enter/↓/滚到底下一段,↑/滚到顶上一段,进度同步保存 |
| 伪装收尾 | ✅(基础完成) | 右下角 DevBar 已移入顶栏 `...` 设置菜单;账号统一为 `admin`;老板键 Esc/全局快捷键/菜单三通路 |
| M4 Windows 打包 | ✅(待人工安装验证) | `npm run dist` 已生成 `dist/Claude Setup 0.1.0.exe`;当前未签名且使用默认 Electron 图标 |

提交链:`8881bf4`(M0/M1)→ `b1f123f`(伪装改造)→ `d601359`(M2/M3)→ `9f163f9`(gitignore 测试书)。

**下一步从 §7 roadmap 选。**

## 3. 跑起来

```bash
npm install          # 依赖已装过;换机器需重装(会下 Electron 二进制,本机配了 electron_mirror)
npm run dev          # 真·桌面版(Electron 窗口,标题 Claude)
npm run dev:web      # 只跑渲染层,浏览器预览 http://localhost:4610(无 Electron,openBook/老板键走浏览器降级)
npm run typecheck    # tsc 双工程(node + web),提交前必过
npm run build        # electron-vite 构建(main/preload/renderer 双入口 index+decoy)
npm run dist         # electron-builder 打包安装程序(M4)
```

仓库根有两本测试 EPUB（《天空不设限》，已 gitignore）。跑桌面版后点 **New chat** 选它们试 EPUB 导入。

## 4. 架构地图

```
src/main/                    Electron 主进程(Node,无 DOM)
  index.ts                   BaseWindow + 两 WebContentsView(reader/decoy)、老板键、标题锁死、IPC book/library/boss
  store/library.ts           electron-store 本地书架/进度;import/load/rename/delete/relocate/saveProgress
  parsers/                   解析器工厂(§7 PROJECT_PLAN)
    index.ts                 openAndParse(path):按扩展名分发,统一 try/catch → 友好错误
    txt.ts                   jschardet 编码探测 + iconv-lite 解码 + 中文章节正则切分
    epub.ts                  epub2 按 spine(flow)抽章 + node-html-parser 去标签
    pdf.ts                   pdfjs-dist legacy 抽文字层 + 简单行聚类;扫描件降级
    util.ts / types.ts       伪章节切分 / ParsedBook 类型
src/preload/index.ts         contextBridge 白名单:book/library/boss API;非 Electron 时 window.api 为 undefined
src/renderer/
  index.html / decoy.html    两个入口(reader / 遮羞视图)
  src/
    main.tsx / decoy.tsx     入口;main.tsx 在 DEV 暴露 window.__moyu={store,chunkText,chunkBook} 供调试
    App.tsx                  布局 + 主题/字号 effect + boss 状态同步 + ↑/↓ 键盘翻页
    store.ts                 Zustand:mode/theme/font/books/blocks/blockIndex/messages/typing/bossOn + advance/retreat/loadBook/showError
    disguise/                ★伪装排版算法(§5 PROJECT_PLAN)
      types.ts               Segment = novel | action;Block;Thinking
      content.ts             演示内容(内置武侠范文 BLOCKS)+ 伪装素材池(THINK_POOL / ACTION_POOL)
      composer.ts            qFor(伪问题)/ buildThinking / pickAction / buildSegments(按 mode 编排)
      chunker.ts             chunkText/chunkBook:段/句/字三级切块(220–420 字/块)
      stream.ts              打字机(rAF 变速+标点停顿)+ action 折叠行渲染(命令式写进 body ref)
    components/              Sidebar/TopBar/Thread/Composer/AssistantMessage/ThinkBlock/UserBubble/Decoy/DecoyScreen/SettingsMenu/icons
    styles/tokens.css        §4.1 CSS 变量(亮/暗);app.css 组件样式
```

**数据流(阅读)**:`ParsedBook`(main 解析)→ IPC → `store.loadBook` → `chunkBook` 切成 `Block[]` → `store.blocks` → `AssistantMessage` 用 `buildSegments(blocks[i], i, mode)` → `stream.ts` 逐字/整块渲染进 `.body`。

**数据流(书架/进度)**:导入/Relocate 在主进程计算文件 SHA-256 作为 `fileHash` → `electron-store` 的 `library.json` 保存 `items[]`、`activeBookId`、`progress[fileHash]` → renderer 只拿 `{id,name}` 书架项和解析后的 `ParsedBook`。翻页/上翻会保存 `blockIndex`;切书/保存进度会把该书移到 Recents 顶部。

**渲染模型注意**:AssistantMessage 的正文是**命令式**写进一个 `ref` div(打字机/折叠行需要 addEventListener,且避免 React 每帧重渲染)。React 只管消息外壳;切换排版/换书时靠**新 message id 重挂**整条消息来重渲染。改这块留意 StrictMode 会双调 effect(已用 cancel + `body.innerHTML=''` 兜住)。

## 5. 关键约定(改代码前必读)

1. **全程确定性,禁 `Math.random`**(§5.1)。伪问题、思考时长、打字节奏、伪装段选择全部用 `blockIndex`/位置取模派生——保证续读/重开/多端**同一段永远读到同一伪装**,否则穿帮。加随机 = 破坏这条。
2. **三条视觉铁律**(§4,任一破功即露馅):① 页面底禁纯白,用暖米白 `#F5F4ED`;② 全局无阴影,靠 1px 描边;③ 助手正文用衬线体。
3. **伪装不能挡阅读**(用户强诉求)。混合模式的伪装=**一行灰色折叠工具摘要**(仿 Claude Code transcript,`Used 2 tools ›` / `Edited x.tsx ›`),默认折叠、一眼跳过;正文才是衬线体主色。**不要**再往正文里塞整段英文/多行块把阅读挤散。
4. **导入默认会话名 = `General coding session`**;侧栏 Recents 一律用编程会话名伪装;**不要**出现"书架/玄幻/已读"等阅读器痕迹。
5. **商标神似而非全等**:名字/图标仿 Claude,但 `bundleId` 用自有域名(electron-builder.yml 已 `com.fenghelao.muyureader`)。别做 1:1 商标级冒充。
6. **错误伪装成助手消息**(§13):解析失败/扫描件等**绝不弹系统框**,走 `store.showError` 以一条 Claude 口吻的助手消息呈现。
7. **不提交书籍文件**(版权+体积):`*.epub/mobi/azw3/pdf` 已 gitignore。

## 6. 与 PROJECT_PLAN 的差异(as-built 偏差)

设计文档是原始意图;实际落地有几处调整,以本节为准:

- **混合排版**:PROJECT_PLAN §5 早稿设想过多类伪装段;**最终定为单一"灰色折叠 action 摘要行"**(§5 本文件 + commit `b1f123f`),原因=不挡阅读。`disguise/types.ts` 的 `Segment` 只有 `novel | action`。
- **老板键**:PROJECT_PLAN 把它排在 M3;已提前做完,且就是双 WebContentsView 方案。浏览器版(dev:web)用页面内 `Decoy` overlay + `Esc` 兜底;Electron 版用主进程切视图,支持 `Ctrl+Shift+Space`、reader 里 `Esc` 隐藏、decoy 里 `Esc` 恢复、顶栏设置菜单触发。
- **正文内容**:现在 `content.ts` 内置一段**原创武侠范文**当演示;真书走 M2 解析器。范文里的书名/章节标题**不注入正文**(§5.8 防露馅)。
- **阅读进度**:已持久化到主进程 `electron-store`。导入时按文件 SHA-256 作为 `fileHash`;翻页保存 `blockIndex`;重启后读取书架并自动加载上次活跃书籍。
- **书架真实化**:Recents 已从演示数组升级为本地书架;支持搜索、重命名、删除二次确认、Relocate 重新绑定文件路径、最近阅读置顶。删除只删本地记录,不删原始书籍文件。
- **设置入口**:右下角临时 `DevBar` 已删除;排版/字号/主题/老板键入口移入顶栏 `...` 设置菜单。

## 7. 下一步 Roadmap(建议顺序)

1. **安装包人工验证**:安装 `dist/Claude Setup 0.1.0.exe`,验证启动、导入、续读、Relocate、老板键、卸载/重装。测试 OK 后再把安装包上传 GitHub Release。
2. **Release 前图标/签名**:当前 builder 使用默认 Electron 图标且跳过签名;正式 release 前补 `build/claude.ico` / 签名证书或明确无签名分发。
3. **真实文件回归**:多样本 TXT/EPUB/PDF 导入、切块、续读、Relocate、老板键实窗回归。
4. **PDF 复杂版式**:当前只做基础行聚类;多栏/表格重排待优化(§7.2)。
5. **防偷看增强**(§9.5):失焦模糊、内容保护(仅 Windows 有效,mac 如实标注局限)、可选托盘/任务栏隐藏。
6. **书内搜索 / 跳章节**:当前搜索只过滤 Recents 标题,未做正文全文搜索和章节跳转。
7. **删除 Undo**:当前是删除二次确认;若要删除后撤销,主进程需要软删除或短期缓存。
8. **MOBI/AZW3**:PROJECT_PLAN §3.4 的 foliate-js spike(高不确定,做前先评估)。
9. **微信读书书架只读同步**(§8,非首发):走官方 Agent Skill 拉书架填 Recents,正文仍本地。**绝不抓正文。**

## 8. 已知限制 / 待验证

- **EPUB/PDF 真文件导入**只在逻辑层验过(chunker 单测 + loadBook 流);多样本(不同出版社 EPUB、扫描/多栏 PDF、GBK/UTF-8 TXT)需真机回归。可能要调 `htmlToText`/行聚类阈值。
- **老板键零闪烁**、标题伪装、全局快捷键只能在 Electron 窗口里肉眼验(dev:web 是页面内 overlay 降级)。
- **安装包**:Windows 安装包可由 `npm run dist` 生成;安装后仍需人工验证导入/续读/老板键/卸载残留。安装包不提交进 git,测试 OK 后再走 GitHub Release。
- Windows 上 git 会警告 LF→CRLF,无害。
- 依赖里 electron-builder 链有若干 npm audit 告警,不影响开发。

## 9. 提交规范

- 提交前 `npm run typecheck` 必过(node+web 双工程)。
- 改渲染层能在 `npm run dev:web`(4610)里验;改主进程/解析器/老板键需 `npm run dev` 真窗口验。
- 别把 `node_modules/out/dist/*.tsbuildinfo/书籍文件` 提交(已 gitignore)。
