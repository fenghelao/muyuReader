import type { Block, DiffLine } from './types'

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

// ---- 混合排版伪装素材 ----
export const THINK_POOL = [
  'Let me restate the goal, then work through it step by step.',
  "I'll check the edge cases first: empty input, retries, and ordering.",
  'There are two reasonable approaches here — comparing them before I commit.',
  'The subtle part is the async ordering; let me reason through it carefully.',
  'I want to verify this against the spec rather than assume the behavior.',
  'Outlining the structure first, then filling in each piece.'
]

export const CAMO_POOL = [
  "The core idea is to keep the reducer pure, so every state transition stays replayable — that's what makes the whole flow deterministic and easy to test.",
  "One caveat: an effect with an empty dependency array runs after the first paint, not before it, so don't rely on it to block the initial render.",
  "I'd wrap the network layer in a thin client that centralizes auth, retries, and error normalization, so call sites never touch a raw response.",
  "Complexity is dominated by the sort at O(n log n); the pass afterward is linear, so it won't be the bottleneck in practice.",
  'The migration stays safe because the new column is nullable with a default, letting existing rows validate while the backfill runs in batches.'
]

export const CODE_POOL = [
  'const debounce = (fn, ms) => {\n  let t;\n  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };\n};',
  'async function withRetry(fn, n = 3) {\n  for (let i = 0; i < n; i++) {\n    try { return await fn(); }\n    catch (e) { if (i === n - 1) throw e; }\n  }\n}',
  'function chunk(arr, size) {\n  const out = [];\n  for (let i = 0; i < arr.length; i += size)\n    out.push(arr.slice(i, i + size));\n  return out;\n}'
]

export const TOOL_POOL: { name: string; res: string }[] = [
  { name: 'Read(src/auth/session.ts)', res: 'Read 48 lines' },
  { name: 'Grep("useAuth")', res: 'Found 6 matches across 4 files' },
  { name: 'Bash(npm run test)', res: '✓ 128 passed in 4.2s' },
  { name: 'Read(components/Sidebar.tsx)', res: 'Read 112 lines' },
  { name: 'Bash(npm run build)', res: '✓ built in 3.1s' },
  { name: 'Glob("src/**/*.ts")', res: '37 files' }
]

export const EDIT_POOL: { name: string; res: string; diff: DiffLine[] }[] = [
  {
    name: 'Update(components/Sidebar.tsx)',
    res: 'Updated with 8 additions and 2 removals',
    diff: [
      { t: '+', text: 'const [collapsed, setCollapsed] = useState(false);' },
      { t: '-', text: 'const collapsed = false;' }
    ]
  },
  {
    name: 'Update(src/store/auth.ts)',
    res: 'Updated with 5 additions and 1 removal',
    diff: [{ t: '+', text: 'set({ user, token, status: "authed" });' }]
  },
  {
    name: 'Write(src/hooks/useDebounce.ts)',
    res: 'Created 14 lines',
    diff: [{ t: '+', text: 'export function useDebounce<T>(value: T, ms = 300) {' }]
  },
  {
    name: 'Update(api/client.ts)',
    res: 'Updated with 12 additions and 4 removals',
    diff: [
      { t: '+', text: 'headers.set("Authorization", `Bearer ${token}`);' },
      { t: '-', text: '// TODO: attach auth header' }
    ]
  }
]
