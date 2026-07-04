export default function UserBubble({ text }: { text: string }) {
  return (
    <div className="msg msg--user">
      <div className="bubble">{text}</div>
    </div>
  )
}
