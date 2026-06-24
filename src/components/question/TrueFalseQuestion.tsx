import { useState } from 'react'
import type { TrueFalseQuestion as TFType, AnswerResult } from '@/types'
import { renderInline } from '@/utils/renderInline'

interface Props {
  question: TFType
  savedAnswer?: string
  onSubmit: (result: AnswerResult) => void
}

function TrueFalseQuestionComp({ question, savedAnswer, onSubmit }: Props) {
  const [selected, setSelected] = useState<boolean | null>(
    savedAnswer !== undefined ? savedAnswer === 'true' : null
  )
  const [submitted, setSubmitted] = useState(!!savedAnswer)

  const isCorrect = submitted && selected === question.answer

  function handleSelect(value: boolean) {
    if (submitted) return
    setSelected(value)
  }

  function handleSubmit() {
    if (selected === null || submitted) return
    setSubmitted(true)
    onSubmit({
      answered: true,
      correct: selected === question.answer,
      userAnswer: String(selected),
      timestamp: Date.now(),
    })
  }

  const buttons = [
    { value: true as const, label: '✓ 对' },
    { value: false as const, label: '✗ 错' },
  ]

  return (
    <div>
      {/* 对/错 按钮 */}
      <div className="flex gap-3">
        {buttons.map((btn) => {
          const isSelected = selected === btn.value
          const isAnswer = btn.value === question.answer
          let style = 'border-border hover:border-primary-light hover:bg-primary-bg'

          if (submitted) {
            if (isAnswer) {
              style = 'border-success bg-success-bg'
            } else if (isSelected && !isAnswer) {
              style = 'border-error bg-red-50'
            } else {
              style = 'border-border opacity-60'
            }
          } else if (isSelected) {
            style = 'border-primary bg-primary-bg'
          }

          return (
            <button
              key={String(btn.value)}
              onClick={() => handleSelect(btn.value)}
              disabled={submitted}
              className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${style}`}
            >
              {btn.label}
            </button>
          )
        })}
      </div>

      {/* 提交按钮 */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={selected === null}
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
          {isCorrect ? '✅ 回答正确！' : `❌ 回答错误，正确答案是「${question.answer ? '对' : '错'}」`}
        </div>
      )}
    </div>
  )
}

export default TrueFalseQuestionComp
