import { useState } from 'react'
import type { ChoiceQuestion as ChoiceType, AnswerResult } from '@/types'
import { renderInline } from '@/utils/renderInline'

interface Props {
  question: ChoiceType
  savedAnswer?: string
  onSubmit: (result: AnswerResult) => void
}

function ChoiceQuestionComp({ question, savedAnswer, onSubmit }: Props) {
  const [selected, setSelected] = useState<string | null>(savedAnswer || null)
  const [submitted, setSubmitted] = useState(!!savedAnswer)

  const isCorrect = submitted && selected === question.answer

  function handleSelect(label: string) {
    if (submitted) return
    setSelected(label)
  }

  function handleSubmit() {
    if (!selected || submitted) return
    setSubmitted(true)
    onSubmit({
      answered: true,
      correct: selected === question.answer,
      userAnswer: selected,
      timestamp: Date.now(),
    })
  }

  return (
    <div>
      {/* 选项 */}
      <div className="space-y-2.5">
        {question.options.map((opt) => {
          const isSelected = selected === opt.label
          const isAnswer = question.answer === opt.label

          let cardStyle = 'border-border hover:border-primary-light hover:bg-primary-bg'
          let labelStyle = 'bg-border/40 text-text-secondary'

          if (submitted) {
            if (isAnswer) {
              cardStyle = 'border-success bg-success-bg'
              labelStyle = 'bg-success text-white'
            } else if (isSelected && !isAnswer) {
              cardStyle = 'border-error bg-red-50'
              labelStyle = 'bg-error text-white'
            } else {
              cardStyle = 'border-border opacity-50'
              labelStyle = 'bg-border/40 text-text-muted'
            }
          } else if (isSelected) {
            cardStyle = 'border-primary bg-primary-bg'
            labelStyle = 'bg-primary text-white'
          }

          return (
            <button
              key={opt.label}
              onClick={() => handleSelect(opt.label)}
              disabled={submitted}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 ${cardStyle}`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-200 ${labelStyle}`}>
                {submitted && isAnswer ? '✓' :
                 submitted && isSelected && !isAnswer ? '✗' :
                 opt.label}
              </span>
              <span className="text-sm text-text">{renderInline(opt.text)}</span>
            </button>
          )
        })}
      </div>

      {/* 提交按钮 */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!selected}
          className="mt-4 px-5 py-2 bg-primary text-white text-sm rounded-xl hover:bg-primary-dark hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        >
          提交答案
        </button>
      )}

      {/* 判题结果 */}
      {submitted && (
        <div className={`mt-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
          isCorrect ? 'bg-success-bg text-[#115e59]' : 'bg-red-50 text-[#991b1b]'
        }`}>
          {isCorrect ? '✅ 回答正确！' : `❌ 回答错误，正确答案是 ${question.answer}`}
        </div>
      )}
    </div>
  )
}

export default ChoiceQuestionComp
