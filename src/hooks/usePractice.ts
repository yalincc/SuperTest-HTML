import { useState, useCallback } from 'react'
import type { Subject, Question, AnswerResult } from '@/types'
import type { QuestionAttempt, PracticeStats } from '@/types/progress'
import { loadPracticeRecord, savePracticeRecord } from '@/utils/storage'
import { createEmptyPracticeRecord } from '@/types/progress'

export interface UsePracticeReturn {
  record: ReturnType<typeof createEmptyPracticeRecord>
  getAttempt: (questionId: string) => QuestionAttempt | undefined
  submitAnswer: (question: Question, result: AnswerResult) => void
  stats: PracticeStats
  answeredCount: number
}

function recalculateStats(questions: Record<string, QuestionAttempt>): PracticeStats {
  const attempts = Object.values(questions).filter((a) => a.answered)
  const totalAttempted = attempts.length
  const totalCorrect = attempts.filter((a) => a.correct).length
  const totalWrong = totalAttempted - totalCorrect
  const accuracyRate = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0

  // 计算连续做题天数
  const dates = new Set(attempts.map((a) => new Date(a.timestamp).toDateString()))
  let streakDays = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (dates.has(d.toDateString())) {
      streakDays++
    } else if (i > 0) {
      break
    }
  }

  return { totalAttempted, totalCorrect, totalWrong, streakDays, accuracyRate }
}

export function usePractice(subject: Subject): UsePracticeReturn {
  const [record, setRecord] = useState(() => loadPracticeRecord(subject))

  const getAttempt = useCallback(
    (questionId: string) => record.questions[questionId],
    [record]
  )

  const submitAnswer = useCallback(
    (question: Question, result: AnswerResult) => {
      setRecord((prev) => {
        const existing = prev.questions[question.id]
        const attempt: QuestionAttempt = {
          questionId: question.id,
          answered: true,
          correct: result.correct,
          userAnswer: result.userAnswer,
          timestamp: result.timestamp,
          attemptCount: (existing?.attemptCount || 0) + 1,
          lastAttemptAt: Date.now(),
        }

        const updated = {
          ...prev,
          questions: { ...prev.questions, [question.id]: attempt },
        }
        updated.stats = recalculateStats(updated.questions)
        savePracticeRecord(subject, updated)
        return updated
      })
    },
    [subject]
  )

  return {
    record,
    getAttempt,
    submitAnswer,
    stats: record.stats,
    answeredCount: Object.values(record.questions).filter((a) => a.answered).length,
  }
}
