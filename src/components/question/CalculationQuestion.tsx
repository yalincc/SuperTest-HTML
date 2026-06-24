import { useState } from 'react'
import type { CalculationQuestion as CalcType, AnswerResult } from '@/types'
import { renderInline } from '@/utils/renderInline'
import { Pencil, CheckCircle, XCircle } from 'lucide-react'

interface Props {
  question: CalcType
  savedAnswer?: string
  onSubmit: (result: AnswerResult) => void
}

function CalculationQuestionComp({ question, savedAnswer, onSubmit }: Props) {
  const [answer, setAnswer] = useState(savedAnswer || '')
  const [submitted, setSubmitted] = useState(!!savedAnswer)

  const isCorrect = submitted && answer.trim() === question.solution.answer.trim()

  function handleSubmit() {
    if (!answer.trim() || submitted) return
    setSubmitted(true)
    // 计算题比对答案（简化版，去除空格后比对）
    const correct = normalizeAnswer(answer) === normalizeAnswer(question.solution.answer)
    onSubmit({
      answered: true,
      correct,
      userAnswer: answer,
      timestamp: Date.now(),
    })
  }

  return (
    <div>
      {/* 子问题列表 */}
      {question.subQuestions && question.subQuestions.length > 0 && (
        <div className="mb-4 space-y-2">
          {question.subQuestions.map((sq) => (
            <div key={sq.label} className="px-3 py-2 bg-primary-bg/50 rounded-lg text-sm">
              <span className="font-semibold text-primary mr-1.5">{sq.label}</span>
              {renderInline(sq.stem)}
            </div>
          ))}
        </div>
      )}

      {/* 答题区 */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          解答过程与答案
        </label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={submitted}
          rows={4}
          placeholder="在此输入你的解答过程和最终答案..."
          className="w-full px-4 py-3 rounded-xl border-2 border-border text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-border/20 disabled:cursor-not-allowed transition resize-y min-h-[100px]"
        />
      </div>

      {/* 提交按钮 */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!answer.trim()}
          className="px-5 py-2 bg-primary text-white text-sm rounded-xl hover:bg-primary-dark hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        >
          提交答案
        </button>
      )}

      {/* 判题结果 */}
      {submitted && (
        <div className={`mt-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
          isCorrect ? 'bg-success-bg text-[#115e59]' : 'bg-red-50 text-[#991b1b]'
        }`}>
          {isCorrect ? (
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              回答正确！
            </span>
          ) : (
            <div>
              <span className="flex items-center gap-1.5 mb-1">
                <XCircle className="w-4 h-4" />
                答案不完全一致，请对照解析自查
              </span>
              <span className="text-xs opacity-80">
                参考答案：{renderInline(question.solution.answer)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 得分点提示 */}
      {question.scorePoints && question.scorePoints.length > 0 && submitted && (
        <div className="mt-3 px-3 py-2 bg-warning/5 border border-warning/20 rounded-xl">
          <p className="text-xs font-medium text-warning mb-1 flex items-center gap-1">
            <Pencil className="w-3.5 h-3.5" />
            得分点参考
          </p>
          <ul className="text-xs text-text-secondary space-y-0.5">
            {question.scorePoints.map((sp, i) => (
              <li key={i}>• {renderInline(sp)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/** 简化答案比对：去除多余空格、换行 */
function normalizeAnswer(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

export default CalculationQuestionComp
