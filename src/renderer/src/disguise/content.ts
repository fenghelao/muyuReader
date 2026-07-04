import type { Block } from './types'

// M1 演示内容(将来由真实解析器产出;此处内置一段原创武侠范文 + 伪装素材池)。
export const HISTORY = 3 // 首屏回填的历史块数

export interface SampleBook {
  id: string
  name: string
}

// 侧栏 Recents:导入默认名 = General coding session(伪装成编程会话)
export const SAMPLE_BOOKS: SampleBook[] = [
  { id: 'b1', name: 'General coding session' },
  { id: 'b2', name: 'Debug WebSocket reconnect' },
  { id: 'b3', name: 'Refactor auth middleware' },
  { id: 'b4', name: 'SQL query optimization' },
  { id: 'b5', name: 'Fix flaky CI test' },
  { id: 'b6', name: 'Dockerfile multi-stage build' },
  { id: 'b7', name: 'Explain event loop microtasks' }
]

export const BLOCKS: Block[] = [
  {
    paragraphs: [
      '暮色像被谁打翻的墨，一层层从山脊上淌下来。裴砚站在断桥的尽头，望着桥下那条早已干涸的河。河床里满是白得发亮的卵石，风一过便有细碎的声响，像是谁在低声数着什么。',
      '他已经在这里站了整整一日。那柄剑斜挎在背后，剑鞘上的漆早裂了，露出底下暗沉的木纹——一柄谁也不会多看一眼的剑。可裴砚知道，这世上没有几个人，能接下它出鞘后的第一声。'
    ]
  },
  {
    paragraphs: [
      '桥的另一头，走来一个挑着灯笼的老人。灯笼是旧的，纸面被雨水洇出一圈圈黄痕，火光却稳，一丝不晃。',
      '“后生，”老人在三丈外停下，把灯笼往地上一搁，“天要黑了，你还不下山？”',
      '裴砚没有回头。“我在等一个人。”'
    ]
  },
  {
    paragraphs: [
      '老人笑了笑，那笑意却没到眼底。“等了十年的人，未必还认得当年的你。”',
      '风忽然停了。干涸的河床上，那些白卵石的细响，也在同一瞬间静了下去。裴砚终于转过身，右手很自然地搭上了肩后的剑柄。'
    ]
  },
  {
    paragraphs: [
      '“因为我数着呢。”老人拎起灯笼，火光照亮他半张脸——那是一张不该属于这个年纪的脸，太干净，干净得像从未在世上活过。“十年前的今夜，也是在这座桥上。你师父就站在你现在站的地方。”',
      '裴砚的指节，一点点收紧。'
    ]
  },
  {
    paragraphs: [
      '“他也在等人，”老人缓缓道，“等的，恰好也是我。”',
      '剑鸣响起的刹那，断桥两侧的枯草齐齐伏倒。不是被风，是被那一声里裹着的东西压下去的。裴砚这一剑没有华彩，甚至称不上快，只是极稳、极直，像有人用尺子在暮色里划下一道线。'
    ]
  },
  {
    paragraphs: [
      '老人没有躲。灯笼稳稳地悬在原处，火苗被剑气切开，分作两瓣，又慢慢合拢。',
      '“好剑，”他说，“可惜，还差半分。”',
      '那半分是什么，裴砚在此后的很多年里都在想。直到他自己，也成了在桥头挑灯笼的人。'
    ]
  },
  {
    paragraphs: [
      '后来的事，说书人各有各的讲法。有人说那一夜断桥塌了，有人说桥还在，塌的是别的东西。',
      '只有一件事众口一致：从那以后，山下再没人见过裴砚，也再没人，敢在入夜后走那座桥。'
    ]
  }
]
export const BLOCK_COUNT = BLOCKS.length

export const FRAMING = '接着上面的，继续。'
export const QUESTIONS = ['继续', '然后呢？', '嗯，接着讲', '这里再展开下', '好的，请继续', '再往下', '接着', '别停，继续']

// 假思考摘要(折叠一行 "Thought for Ns")
export const THINK_POOL = [
  'Let me restate the goal, then work through it step by step.',
  "I'll check the edge cases first: empty input, retries, and ordering.",
  'There are two reasonable approaches here — comparing them before I commit.',
  'The subtle part is the async ordering; let me reason through it carefully.',
  'I want to verify this against the spec rather than assume the behavior.',
  'Outlining the structure first, then filling in each piece.'
]

// 伪装:仿 Claude Code transcript 的灰色折叠工具摘要行。
// summary = 折叠时显示的一行灰字;detail = 展开后的细节(可省略,省略则不可展开)。
export interface ActionItem {
  summary: string
  detail?: string[]
}
export const ACTION_POOL: ActionItem[] = [
  { summary: 'Used 2 tools', detail: ['⏺ Read(src/auth/session.ts)', '  ⎿ Read 48 lines', '⏺ Grep("useAuth")', '  ⎿ 6 matches in 4 files'] },
  { summary: 'Edited components/Sidebar.tsx  (+8 −2)', detail: ['+ const [collapsed, setCollapsed] = useState(false);', '- const collapsed = false;'] },
  { summary: 'Ran npm run test — 128 passed in 4.2s', detail: ['⏺ Bash(npm run test)', '  ⎿ ✓ 128 passed, 0 failed'] },
  { summary: 'Typechecked the renderer TypeScript', detail: ['⏺ tsc --noEmit -p tsconfig.web.json', '  ⎿ 0 errors'] },
  { summary: 'Read package.json' },
  { summary: 'Searched the codebase for TODO', detail: ['⏺ Grep("TODO")', '  ⎿ 12 matches across 9 files'] },
  { summary: 'Updated api/client.ts  (+12 −4)', detail: ['+ headers.set("Authorization", `Bearer ${token}`);', '- // TODO: attach auth header'] },
  { summary: 'Ran the build — done in 3.1s', detail: ['⏺ Bash(npm run build)', '  ⎿ ✓ built in 3.1s'] },
  { summary: 'Explored the project structure', detail: ['⏺ Glob("src/**/*.ts")', '  ⎿ 37 files'] },
  { summary: 'Formatted 5 files with Prettier' },
  { summary: 'Created src/hooks/useDebounce.ts  (14 lines)', detail: ['+ export function useDebounce<T>(value: T, ms = 300) {', '+   const [v, setV] = useState(value);'] },
  { summary: 'Ran git status', detail: ['⏺ Bash(git status)', '  ⎿ 3 files changed, 1 untracked'] },
  { summary: 'Read 2 files, used a tool', detail: ['⏺ Read(store.ts)', '  ⎿ Read 92 lines', '⏺ Read(App.tsx)', '  ⎿ Read 41 lines'] },
  { summary: 'Checked the diff' }
]
