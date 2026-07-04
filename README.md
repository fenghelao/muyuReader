# muyuReader(摸鱼阅读器)

一个界面像素级伪装成 **Claude 桌面客户端**的电子书阅读器 —— 屏幕上看着在正常用 Claude 问答,实际在读小说。

> 设计蓝图见 [`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md)。静态交互原型见 [`prototype/index.html`](prototype/index.html)(单文件,浏览器打开即看)。

## 技术栈

- **Electron**(BaseWindow + WebContentsView)+ **Vite** + **React 18** + **TypeScript**
- 状态 **Zustand**,样式用原生 CSS 变量 token 层(PROJECT_PLAN §4.1)
- 构建 **electron-vite**,分发 **electron-builder**

## 核心玩法

- 左侧 `Recents` = 书架(导入默认名 `General coding session`,可改名)
- 正文伪装成 Claude 的回答:**常规排版**(纯净阅读)/ **混合排版**(穿插 `⏺ tool 调用`、`Update(...) +/- diff` 文件编辑、思考块、英文讲解,像 Claude 在写代码)
- 回车「发消息」= 翻页(假思考 + 逐字打字机);`Esc` = 老板键(切空白 Claude 新会话)
- 阅读字号可调、亮暗跟随系统、阅读进度记忆
- 伪装排版全程**确定性**(禁随机),保证续读/重开一致

## 开发

```bash
npm install

npm run dev       # 启动 Electron(桌面版)
npm run dev:web   # 只跑渲染层,浏览器预览(http://localhost:4610)
npm run build     # 构建
npm run dist      # 打包安装程序
```

## 目录

```
src/main/       Electron 主进程(窗口 / 老板键 / 标题伪装 / 解析器工厂)
src/preload/    contextBridge 白名单 IPC
src/renderer/   React 渲染层(Claude 克隆 UI + 伪装排版算法)
  src/disguise/   切块 / 编排 / 打字机 / 内容池(确定性)
  src/components/ Sidebar / TopBar / Thread / Composer / ...
prototype/      早期静态 HTML 原型(参考)
docs/           设计文档
```

## 合规

仅本地文件阅读器,不内置书源、不抓取正文;导入内容责任自负。名称/图标神似 Claude 但 `bundleId` 用自有域名,规避商标级冒充。
