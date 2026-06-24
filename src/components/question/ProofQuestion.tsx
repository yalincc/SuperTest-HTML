import { useState } from 'react'
import type { ProofQuestion as ProofType, AnswerResult } from '@/types'
import { renderInline } from '@/utils/renderInline'
import { ArrowRight } from 'lucide-react'

interface Props {
  question: ProofType
  savedAnswer?: string
  onSubmit: (result: AnswerResult) => void
}

function ProofQuestionComp({ question, savedAnswer, onSubmit }: Props) {
  const [answer, setAnswer] = useState(savedAnswer || '')
  const [submitted, setSubmitted] = useState(!!savedAnswer)
  const [showSteps, setShowSteps] = useState(false)

  function handleSubmit() {
    if (!answer.trim() || submitted) return
    setSubmitted(true)
    // 证明题无法自动精确判题，标记为已作答，让用户自行对照
    onSubmit({
      answered: true,
      correct: false, // 默认 false，由用户自行对照
      userAnswer: answer,
      timestamp: Date.now(),
    })
  }

  return (
    <div>
      {/* 结论 */}
      <div className="mb-4 px-3 py-2.5 bg-success-bg rounded-xl text-sm">
        <span className="font-semibold text-success">待证结论：</span>
        {renderInline(question.conclusion)}
      </div>

      {/* 答题区 */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          证明过程
        </label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={submitted}
          rows={5}
          placeholder="在此写出你的证明过程..."
          className="w-full px-4 py-3 rounded-xl border-2 border-border text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-border/20 disabled:cursor-not-allowed transition resize-y min-h-[120px]"
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

      {/* 提交后提示 */}
      {submitted && (
        <div className="mt-3 px-3.5 py-2.5 rounded-xl text-sm font-medium bg-primary-bg text-primary">
          证明题请对照下方参考步骤，自行检查证明逻辑是否完整。
        </div>
      )}

      {/* 参考证明步骤 */}
      {submitted && question.proofSteps.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="text-xs font-medium text-primary hover:text-primary-dark transition flex items-center gap-1"
          >
            <ArrowRight className={`w-3.5 h-3.5 transition-transform ${showSteps ? 'rotate-90' : ''}`} />
            {showSteps ? '收起参考步骤' : '查看参考证明步骤'}
          </button>

          {showSteps && (
            <div className="mt-2 space-y-2 animate-[tab-fade-in_0.25s_ease-out]">
              {question.proofSteps.map((step, i) => (
                <div key={i} className="flex gap-2.5 text-sm">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-text">{renderInline(step.description)}</p>
                    {step.expression && (
                      <p className="mt-1 text-text-secondary bg-white/60 px-2.5 py-1.5 rounded-lg text-center">
                        {renderInline(`$${step.expression}$`)}
                      </p>
                    )}
                    {step.note && (
                      <p className="mt-1 text-xs text-warning">{step.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProofQuestionComp
