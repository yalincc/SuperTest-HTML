import { useEffect, useState } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'

interface Props {
  timeRemaining: number // seconds
  onTimeUp?: () => void
}

function ExamTimer({ timeRemaining, onTimeUp }: Props) {
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (timeRemaining <= 60 && timeRemaining > 0) {
      setFlash(timeRemaining % 2 === 0)
    }
  }, [timeRemaining])

  useEffect(() => {
    if (timeRemaining === 0 && onTimeUp) onTimeUp()
  }, [timeRemaining, onTimeUp])

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const isUrgent = timeRemaining <= 300 // 5 分钟内
  const isCritical = timeRemaining <= 60

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-mono font-bold transition-colors ${
      isCritical ? 'bg-red-50 text-error' : isUrgent ? 'bg-orange-50 text-warning' : 'bg-border/20 text-text'
    } ${flash && isCritical ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
      <Clock className="w-4 h-4" />
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      {isUrgent && !isCritical && (
        <AlertTriangle className="w-3.5 h-3.5 text-warning" />
      )}
    </div>
  )
}

export default ExamTimer
