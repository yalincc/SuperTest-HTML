interface Props {
  current: number
  total: number
  className?: string
}

function ProgressBar({ current, total, className = '' }: Props) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className={`w-full bg-border/50 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

export default ProgressBar
