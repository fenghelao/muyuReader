# MuYuReader(摸鱼阅读器)

一个把电子书阅读伪装成 **Claude 桌面聊天界面**的本地阅读器。屏幕上看起来像是在和 Claude 讨论代码、文档、问题，实际可以安静读 TXT / EPUB / PDF。

MuYuReader 也提供正常 Reader 排版：不需要伪装时，可以切到干净的阅读器视图，拖动进度、调背景、改字号继续读。

## 亮点

- **Claude 风格伪装界面**：侧栏、会话、输入框、模型选择器、工具摘要行，整体像一个正常 AI 聊天客户端。
- **摸鱼友好阅读流**：回车、下滑、`↓` 都可以继续下一段；上滑、`↑` 回到上一段。
- **正常 Reader 模式**：进度百分比、进度条拖动、上一段/下一段、背景切换、字号调节。
- **本地书架和进度**：导入的书本、最近阅读、每本书读到哪里，都会保存在本机。
- **老板键 / 遮挡视图**：`Esc` 或快捷入口可以快速切到空白聊天视图。
- **本地优先**：不内置书源、不抓取正文、不调用 AI API，导入什么由用户自己负责。

## 支持格式

- `TXT`
- `EPUB`
- `PDF`，目前偏基础，适合有文字层的 PDF

## 使用方式

```bash
npm install

npm run dev       # 启动 Electron 桌面版
npm run dev:web   # 只跑渲染层预览: http://localhost:4610
npm run typecheck # 类型检查
npm run build     # 构建
npm run dist      # 打包 Windows 安装包
```

启动后点击左侧 **New chat** 导入本地书籍。默认会话名会伪装成 `General coding session`，可以在侧栏重命名。

## 界面模式

- **Claude / Chat 模式**：正文以聊天回答的形式出现，混合模式会穿插灰色折叠工具摘要行，尽量像正在正常使用 Claude。
- **Reader 模式**：标准阅读器排版，适合认真阅读和快速拖进度。

## 本地数据

MuYuReader 使用 `electron-store` 保存本地书架和阅读进度。书籍文件不会被复制进仓库，也不会上传到任何服务。

## 打包

```bash
npm run dist
```

Windows 安装包会生成在 `dist/`。安装包不建议提交到 git，测试完成后可以上传到 GitHub Releases。

## 免责声明

MuYuReader 是独立开源项目，不隶属于 Anthropic 或 Claude。项目只做本地文件阅读，不提供书源、不绕过 DRM、不处理版权内容分发；导入内容的版权责任由用户自行承担。

## License

MIT. See [LICENSE](LICENSE).
