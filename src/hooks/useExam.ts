import { useState, useCallback, useEffect, useRef } from 'react'
import type { Subject, Question } from '@/types'
import type { ExamTemplate, ExamSession, ExamAnswer, ScoreReport } from '@/types/exam'
import { getQuestionById } from '@/data'
import { saveCurrentExam, loadCurrentExam, clearCurrentExam, loadExamHistory, saveExamHistory } from '@/utils/storage'

export interface UseExamReturn {
  session: ExamSession | null
  template: ExamTemplate | null
  timeRemaining: number
  currentIndex: number
  allQuestionIds: string[]
  getQuestion: (index: number) => Question | undefined
  getAnswer: (questionId: string) => ExamAnswer | undefined
  answerQuestion: (questionId: string, answer: string) => void
  markQuestion: (questionId: string) => void
  goTo: (index: number) => void
  goNext: () => void
  goPrev: () => void
  submitExam: () => ScoreReport | null
  isFinished: boolean
}

export function useExam(template: ExamTemplate | null): UseExamReturn {
  const [session, setSession] = useState<ExamSession | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 所有题目 ID（按分区顺序）
  const allQuestionIds = template
    ? template.sections.flatMap((s) => s.questionIds)
    : []

  // 启动考试
  useEffect(() => {
    if (!template) return

    // 检查是否有未完成的考试
    const saved = loadCurrentExam()
    if (saved && saved.templateId === template.id && !saved.isSubmitted) {
      setSession(saved)
      const elapsed = Math.floor((Date.now() - saved.startedAt) / 1000)
      setTimeRemaining(Math.max(0, template.duration * 60 - elapsed))
    } else {
      const newSession: ExamSession = {
        templateId: template.id,
        startedAt: Date.now(),
        answers: {},
        isSubmitted: false,
      }
      setSession(newSession)
      setTimeRemaining(template.duration * 60)
      saveCurrentExam(newSession)
    }
  }, [template])

  // 倒计时
  useEffect(() => {
    if (!session || session.isSubmitted || !template) return

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // 时间到，自动交卷
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [session?.isSubmitted, template])

  // 保存进度
  useEffect(() => {
    if (session && !session.isSubmitted) {
      saveCurrentExam(session)
    }
  }, [session])

  const getQuestion = useCallback(
    (index: number) => {
      const id = allQuestionIds[index]
      return id ? getQuestionById(id) : undefined
    },
    [allQuestionIds]
  )

  const getAnswer = useCallback(
    (questionId: string) => session?.answers[questionId],
    [session]
  )

  const answerQuestion = useCallback(
    (questionId: string, answer: string) => {
      setSession((prev) => {
        if (!prev || prev.isSubmitted) return prev
        const now = Date.now()
        const existing = prev.answers[questionId]
        const updated: ExamSession = {
          ...prev,
          answers: {
            ...prev.answers,
            [questionId]: {
              questionId,
              userAnswer: answer,
              answeredAt: now,
              timeSpent: (existing?.timeSpent || 0) + (now - (existing?.answeredAt || now)),
              marked: existing?.marked,
            },
          },
        }
        return updated
      })
    },
    []
  )

  const markQuestion = useCallback(
    (questionId: string) => {
      setSession((prev) => {
        if (!prev || prev.isSubmitted) return prev
        const existing = prev.answers[questionId]
        return {
          ...prev,
          answers: {
            ...prev.answers,
            [questionId]: {
              questionId,
              userAnswer: existing?.userAnswer || '',
              answeredAt: existing?.answeredAt || Date.now(),
              timeSpent: existing?.timeSpent || 0,
              marked: !existing?.marked,
            },
          },
        }
      })
    },
    []
  )

  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < allQuestionIds.length) setCurrentIndex(index)
    },
    [allQuestionIds]
  )

  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo])
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo])

  const submitExam = useCallback((): ScoreReport | null => {
    if (!session || !template) return null
    if (timerRef.current) clearInterval(timerRef.current)

    const submittedAt = Date.now()
    const timeUsed = Math.floor((submittedAt - session.startedAt) / 1000)

    // 计算分数
    let earnedScore = 0
    const wrongQuestionIds: string[] = []
    const sectionScores: { name: string; earned: number; total: number }[] = []

    for (const section of template.sections) {
      let sectionEarned = 0
      for (const qId of section.questionIds) {
        const answer = session.answers[qId]
        const question = getQuestionById(qId)
        if (!question) continue

        let correct = false
        if (answer) {
          if (question.type === 'choice') correct = answer.userAnswer === question.answer
          else if (question.type === 'true_false') correct = answer.userAnswer === String(question.answer)
          else if (question.type === 'fill') {
            const blanks = question.blanks
            correct = blanks.some((b) => {
              const acceptable = [b.answer, ...(b.alternatives || [])]
              return acceptable.includes(answer.userAnswer.trim())
            })
          }
        }

        if (correct) {
          sectionEarned += section.scorePerQuestion
        } else {
          wrongQuestionIds.push(qId)
        }
      }
      earnedScore += sectionEarned
      sectionScores.push({
        name: section.name,
        earned: sectionEarned,
        total: section.questionIds.length * section.scorePerQuestion,
      })
    }

    const report: ScoreReport = {
      templateId: template.id,
      subject: template.subject,
      name: template.name,
      totalScore: template.totalScore,
      earnedScore,
      accuracyRate: template.totalScore > 0 ? Math.round((earnedScore / template.totalScore) * 100) : 0,
      sectionScores,
      timeUsed,
      wrongQuestionIds,
      completedAt: submittedAt,
    }

    // 保存
    const updated: ExamSession = { ...session, isSubmitted: true, submittedAt }
    setSession(updated)
    saveCurrentExam(updated)

    const history = loadExamHistory()
    history.push(report)
    saveExamHistory(history)
    clearCurrentExam()

    return report
  }, [session, template])

  // 时间到自动交卷
  useEffect(() => {
    if (timeRemaining === 0 && session && !session.isSubmitted && template) {
      submitExam()
    }
  }, [timeRemaining, session, template, submitExam])

  return {
    session,
    template,
    timeRemaining,
    currentIndex,
    allQuestionIds,
    getQuestion,
    getAnswer,
    answerQuestion,
    markQuestion,
    goTo,
    goNext,
    goPrev,
    submitExam,
    isFinished: !!(session?.isSubmitted),
  }
}
