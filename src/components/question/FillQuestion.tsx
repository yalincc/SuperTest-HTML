import { useState } from 'react'
import type { FillQuestion as FillType, AnswerResult } from '@/types'
import { checkAnswer } from '@/utils/formula'
import { renderInline } from '@/utils/renderInline'

interface Props {
  question: FillType
  savedAnswer?: string
  onSubmit: (result: AnswerResult) => void
}

function FillQuestionComp({ question, savedAnswer, onSubmit }: Props) {
  const savedValues = savedAnswer ? savedAnswer.split('|||') : []
  const [values, setValues] = useState<string[]>(
    savedAnswer ? savedValues : question.blanks.map(() => '')
  )
  const [submitted, setSubmitted] = useState(!!savedAnswer)
  const [results, setResults] = useState<boolean[]>(
    submitted
      ? question.blanks.map((blank, i) => checkAnswer(savedValues[i] || '', blank.answer, blank.alternatives))
      : []
  )

  const allCorrect = submitted && results.every(Boolean)

  function handleChange(index: number, value: string) {
    if (submitted) return
    const newValues = [...values]
    newValues[index] = value
    setValues(newValues)
  }

  function handleSubmit() {
    if (submitted) return
    const checkResults = question.blanks.map((blank, i) =>
      checkAnswer(values[i] || '', blank.answer, blank.alternatives)
    )
    setResults(checkResults)
    setSubmitted(true)
    onSubmit({
      answered: true,
      correct: checkResults.every(Boolean),
      userAnswer: values.join('|||'),
      timestamp: Date.now(),
    })
  }

  function renderSegments() {
    return question.segments.map((segment, i) => {
      const blankMatch = segment.match(/^___(\d+)___$/)
      if (blankMatch) {
        const blankIndex = parseInt(blankMatch[1], 10) - 1
        const isResult = submitted ? results[blankIndex] : undefined
        return (
          <input
            key={i}
            type="text"
            value={values[blankIndex] || ''}
            onChange={(e) => handleChange(blankIndex, e.target.value)}
            disabled={submitted}
            className={`inline-block w-20 sm:w-28 mx-1 px-2.5 py-1.5 text-sm border-2 rounded-lg transition-all ${
              isResult === true
                ? 'border-success bg-success-bg'
                : isResult === false
                ? 'border-error bg-red-50'
                : 'border-border focus:border-primary focus:outline-none'
            }`}
          />
        )
      }
      return <span key={i}>{renderInline(segment)}</span>
    })
  }

  return (
    <div>
      {/* 题干（含输入框） */}
      <div className="mb-3 text-sm text-text leading-loose">
        {renderSegments()}
      </div>

      {/* 提交按钮 */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={values.every((v) => !v.trim())}
          className="mt-2 px-5 py-2 bg-primary text-white text-sm rounded-xl hover:bg-primary-dark hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        >
          提交答案
        </button>
      )}

      {/* 判题结果 + 正确答案 */}
      {submitted && (
        <div className={`mt-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
          allCorrect ? 'bg-success-bg text-[#115e59]' : 'bg-red-50 text-[#991b1b]'
        }`}>
          {allCorrect ? '✅ 全部正确！' : (
            <span>
              ❌ 正确答案：
              {question.blanks.map((blank, i) => (
                <span key={i} className="ml-1">
                  第{blank.index}空 = <strong>{blank.answer}</strong>
                  {blank.unit ? ` ${blank.unit}` : ''}
                  {i < question.blanks.length - 1 ? '，' : ''}
                </span>
              ))}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default FillQuestionComp
