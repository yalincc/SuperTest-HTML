import { useParams, useSearchParams, Link } from 'react-router-dom'
import { getQuestionsByChapter, getQuestionsBySubject } from '@/data'
import type { Subject, Question, QuestionTag } from '@/types'
import { usePractice } from '@/hooks/usePractice'
import { useWrongBook } from '@/hooks/useWrongBook'
import PracticeFlow from '@/components/practice/PracticeFlow'
import { ChevronLeft, Trophy, RotateCcw, XCircle, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

function PracticePage() {
  const { subject } = useParams<{ subject: string }>()
  const [searchParams] = useSearchParams()
  const chapterId = searchParams.get('chapter')
  const tagFilter = searchParams.get('tag') as QuestionTag | null

  const sub = subject as Subject
  const practice = usePractice(sub)
  const wrongBook = useWrongBook(sub)
  const [showResult, setShowResult] = useState(false)

  // 获取题目
  let questions: Question[] = chapterId
    ? getQuestionsByChapter(chapterId)
    : getQuestionsBySubject(sub)

  if (tagFilter) {
    questions = questions.filter((q) => q.tags.includes(tagFilter))
  }

  // 只保留可自动判题的题型 (现在支持全部题型)
  questions = questions.filter((q) => ['choice', 'fill', 'true_false', 'calculation', 'proof'].includes(q.type))

  function getSavedAnswer(questionId: string): string | undefined {
    return practice.getAttempt(questionId)?.userAnswer
  }

  function handleAnswer(question: Question, result: import('@/types').AnswerResult) {
    practice.submitAnswer(question, result)
    if (!result.correct) {
      wrongBook.addWrong(question.id, result.userAnswer)
    } else {
      wrongBook.markCorrect(question.id)
    }
  }

  // 结果页
  if (showResult) {
    const answeredIds = Object.keys(practice.record.questions)
    const sessionQuestions = questions.filter((q) => answeredIds.includes(q.id))
    const correctCount = sessionQuestions.filter((q) => practice.getAttempt(q.id)?.correct).length
    const wrongQuestions = sessionQuestions.filter((q) => !practice.getAttempt(q.id)?.correct)

    return (
      <div className="text-center py-8">
        <Trophy className="w-16 h-16 text-warning mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-text mb-2">练习完成！</h2>
        <p className="text-text-secondary mb-6">
          {sessionQuestions.length} 题完成，正确 {correctCount} 题，
          正确率 {sessionQuestions.length > 0 ? Math.round((correctCount / sessionQuestions.length) * 100) : 0}%
        </p>

        {wrongQuestions.length > 0 && (
          <div className="text-left mb-6">
            <h3 className="text-sm font-semibold text-error mb-2 flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              本次错题 ({wrongQuestions.length})
            </h3>
            <div className="space-y-2">
              {wrongQuestions.map((q) => (
                <div key={q.id} className="bg-surface rounded-lg border border-border p-3 text-sm text-text-secondary">
                  {q.stem.length > 60 ? q.stem.slice(0, 60) + '...' : q.stem}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          {wrongQuestions.length > 0 && (
            <Link
              to={`/wrongbook`}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-error text-white text-sm rounded-xl hover:opacity-90 transition"
            >
              <XCircle className="w-4 h-4" />
              查看错题本
            </Link>
          )}
          <button
            onClick={() => setShowResult(false)}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white text-sm rounded-xl hover:bg-primary-dark transition"
          >
            <RotateCcw className="w-4 h-4" />
            返回题目
          </button>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-16 text-text-muted">
        <p>该分类下暂无可练习题</p>
        <Link to={`/subject/${subject}`} className="text-primary hover:underline mt-2 inline-block">
          返回章节
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* 导航 */}
      <Link
        to={chapterId ? `/subject/${subject}/topic/${chapterId}` : `/subject/${subject}`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        返回
      </Link>

      <PracticeFlow
        questions={questions}
        getSavedAnswer={getSavedAnswer}
        onAnswer={handleAnswer}
        onComplete={() => setShowResult(true)}
      />
    </div>
  )
}

export default PracticePage
