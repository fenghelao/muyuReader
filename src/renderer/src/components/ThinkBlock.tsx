import { useState } from 'react'
import type { Thinking } from '../disguise/types'
import { Chevron } from './icons'

// 假思考折叠块(仿 Claude 的 "Thought for Ns" 推理摘要)
export default function ThinkBlock({ thinking }: { thinking: Thinking }) {
  // 默认折叠成一行 "Thought for Ns"(不挡阅读),点击可展开
  const [collapsed, setCollapsed] = useState(true)
  return (
    <div className={'think' + (collapsed ? ' collapsed' : '')}>
      <div className="think-head" onClick={() => setCollapsed((c) => !c)}>
        <Chevron className="icon" />
        <span>Thought for {thinking.seconds}s</span>
      </div>
      <div className="think-body">
        {thinking.lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  )
}
