import { useState } from 'react'
import type { ExamTemplate, ScoreReport } from '@/types/exam'
import type { AnswerResult } from '@/types'
import { useExam } from '@/hooks/useExam'
import QuestionCard from '@/components/question/QuestionCard'
import ExamTimer from './ExamTimer'
import ExamNavigator from './ExamNavigator'
import { ChevronLeft, ChevronRight, Flag, Send } from 'lucide-react'

interface Props {
  template: ExamTemplate
  onFinish: (report: ScoreReport) => void
}

function ExamFlow({ template, onFinish }: Props) {
  const exam = useExam(template)
  const [showNav, setShowNav] = useState(false)
  const [confirmSubmit, setConfirmSubmit] = useState(false)

  const currentQuestion = exam.getQuestion(exam.currentIndex)
  const currentId = exam.allQuestionIds[exam.currentIndex]

  if (!exam.session || exam.isFinished) return null

  function handleAnswer(result: AnswerResult) {
    if (currentId) {
      exam.answerQuestion(currentId, result.userAnswer)
    }
  }

  function handleSubmit() {
    const report = exam.submitExam()
    if (report) onFinish(report)
  }

  const answeredCount = Object.values(exam.session.answers).filter((a) => a.userAnswer).length
  const totalQuestions = exam.allQuestionIds.length

  return (
    <div>
      {/* 顶部栏：计时器 + 操作 */}
      <div className="flex items-center justify-between mb-4">
        <ExamTimer timeRemaining={exam.timeRemaining} />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNav(!showNav)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              showNav ? 'bg-primary text-white' : 'bg-border/30 text-text-secondary hover:bg-border'
            }`}
          >
            答题卡 ({answeredCount}/{totalQuestions})
          </button>
          {currentId && (
            <button
              onClick={() => exam.markQuestion(currentId)}
              className={`p-1.5 rounded-xl text-xs transition ${
                exam.getAnswer(currentId)?.marked
                  ? 'bg-warning/10 text-warning'
                  : 'bg-border/30 text-text-muted hover:text-warning'
              }`}
              title="标记此题"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 答题卡（可折叠） */}
      {showNav && (
        <div className="mb-4 animate-[tab-fade-in_0.25s_ease-out]">
          <ExamNavigator
            questionIds={exam.allQuestionIds}
            currentIndex={exam.currentIndex}
            answers={exam.session.answers}
            onGoTo={(i) => { exam.goTo(i); setShowNav(false) }}
          />
        </div>
      )}

      {/* 当前题目 */}
      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          index={exam.currentIndex}
          total={totalQuestions}
          savedAnswer={exam.getAnswer(currentId)?.userAnswer}
          showSolution={false}
          onSubmit={handleAnswer}
        />
      )}

      {/* 导航按钮 */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={exam.goPrev}
          disabled={exam.currentIndex === 0}
          className="flex items-center gap-1 px-4 py-2 text-sm text-text-secondary hover:text-primary hover:bg-primary-bg rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-4 h-4" />
          上一题
        </button>

        {exam.currentIndex < totalQuestions - 1 ? (
          <button
            onClick={exam.goNext}
            className="flex items-center gap-1 px-4 py-2 text-sm text-text-secondary hover:text-primary hover:bg-primary-bg rounded-xl transition"
          >
            下一题
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setConfirmSubmit(true)}
            className="flex items-center gap-1 px-5 py-2 bg-primary text-white text-sm rounded-xl hover:bg-primary-dark hover:shadow-md transition"
          >
            <Send className="w-4 h-4" />
            交卷
          </button>
        )}
      </div>

      {/* 交卷确认弹窗 */}
      {confirmSubmit && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-bold text-text mb-2">确认交卷？</h3>
            <p className="text-sm text-text-secondary mb-1">
              共 {totalQuestions} 题，已答 {answeredCount} 题。
            </p>
            {answeredCount < totalQuestions && (
              <p className="text-sm text-error mb-4">
                还有 {totalQuestions - answeredCount} 题未作答！
              </p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setConfirmSubmit(false)}
                className="flex-1 px-4 py-2 bg-border/30 text-text text-sm rounded-xl hover:bg-border transition"
              >
                继续答题
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-primary text-white text-sm rounded-xl hover:bg-primary-dark transition"
              >
                确认交卷
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExamFlow
