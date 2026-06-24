import { useState } from 'react'
import type { Question, AnswerResult } from '@/types'
import QuestionCard from '@/components/question/QuestionCard'
import ProgressBar from '@/components/ui/ProgressBar'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'

interface Props {
  questions: Question[]
  getSavedAnswer: (questionId: string) => string | undefined
  onAnswer: (question: Question, result: AnswerResult) => void
  onComplete?: () => void
}

function PracticeFlow({ questions, getSavedAnswer, onAnswer, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answeredSet, setAnsweredSet] = useState<Set<string>>(() => {
    const set = new Set<string>()
    questions.forEach((q) => {
      if (getSavedAnswer(q.id)) set.add(q.id)
    })
    return set
  })

  const current = questions[currentIndex]
  const allDone = answeredSet.size === questions.length

  function handleAnswer(result: AnswerResult) {
    setAnsweredSet((prev) => new Set([...prev, current.id]))
    onAnswer(current, result)
  }

  function goNext() {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1)
  }

  function goPrev() {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
  }

  if (!current) return null

  return (
    <div>
      {/* 进度条 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-text-muted">
            已完成 {answeredSet.size}/{questions.length}
          </span>
          {allDone && onComplete && (
            <button
              onClick={onComplete}
              className="flex items-center gap-1 text-xs font-medium text-success hover:text-success/80 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              查看结果
            </button>
          )}
        </div>
        <ProgressBar current={answeredSet.size} total={questions.length} />

        {/* 进度点 */}
        <div className="flex gap-1 mt-2 flex-wrap">
          {questions.map((q, i) => {
            const done = answeredSet.has(q.id)
            const isCurrent = i === currentIndex
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-6 h-6 rounded-full text-xs font-medium transition-all ${
                  isCurrent
                    ? 'bg-primary text-white scale-110'
                    : done
                    ? 'bg-success/20 text-success'
                    : 'bg-border/50 text-text-muted hover:bg-border'
                }`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      </div>

      {/* 题目卡片 */}
      <QuestionCard
        question={current}
        index={currentIndex}
        total={questions.length}
        savedAnswer={getSavedAnswer(current.id)}
        onSubmit={handleAnswer}
      />

      {/* 导航按钮 */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 px-4 py-2 text-sm text-text-secondary hover:text-primary hover:bg-primary-bg rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-4 h-4" />
          上一题
        </button>
        <button
          onClick={goNext}
          disabled={currentIndex === questions.length - 1}
          className="flex items-center gap-1 px-4 py-2 text-sm text-text-secondary hover:text-primary hover:bg-primary-bg rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          下一题
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default PracticeFlow
