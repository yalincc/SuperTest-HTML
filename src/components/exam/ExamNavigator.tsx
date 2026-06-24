import { Flag } from 'lucide-react'

interface Props {
  questionIds: string[]
  currentIndex: number
  answers: Record<string, { userAnswer: string; marked?: boolean }>
  onGoTo: (index: number) => void
}

function ExamNavigator({ questionIds, currentIndex, answers, onGoTo }: Props) {
  return (
    <div className="bg-surface rounded-2xl border border-border p-4">
      <h3 className="text-sm font-semibold text-text mb-3">答题卡</h3>
      <div className="flex flex-wrap gap-1.5">
        {questionIds.map((id, i) => {
          const answer = answers[id]
          const isAnswered = !!answer?.userAnswer
          const isMarked = !!answer?.marked
          const isCurrent = i === currentIndex

          return (
            <button
              key={id}
              onClick={() => onGoTo(i)}
              className={`relative w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                isCurrent
                  ? 'bg-primary text-white scale-110 ring-2 ring-primary/30'
                  : isAnswered
                  ? 'bg-success/20 text-success border border-success/30'
                  : 'bg-border/30 text-text-muted hover:bg-border'
              }`}
              title={`第 ${i + 1} 题${isMarked ? '（已标记）' : ''}`}
            >
              {i + 1}
              {isMarked && (
                <Flag className="absolute -top-1 -right-1 w-3 h-3 text-warning fill-warning" />
              )}
            </button>
          )
        })}
      </div>

      {/* 图例 */}
      <div className="flex items-center gap-3 mt-3 text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-border/30" /> 未答
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-success/20" /> 已答
        </span>
        <span className="flex items-center gap-1">
          <Flag className="w-3 h-3 text-warning" /> 标记
        </span>
      </div>

      {/* 进度 */}
      <div className="mt-3 text-xs text-text-secondary">
        已答 {Object.values(answers).filter((a) => a.userAnswer).length} / {questionIds.length} 题
      </div>
    </div>
  )
}

export default ExamNavigator
