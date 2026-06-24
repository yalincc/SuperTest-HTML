import { useState, useCallback } from 'react'
import type { Subject } from '@/types'
import type { WrongBook, WrongEntry } from '@/types/progress'
import { MASTERY_THRESHOLD } from '@/types/progress'
import { loadWrongBook, saveWrongBook } from '@/utils/storage'

export interface UseWrongBookReturn {
  book: WrongBook
  addWrong: (questionId: string, userAnswer: string) => void
  markCorrect: (questionId: string) => void
  markMastered: (questionId: string) => void
  getEntry: (questionId: string) => WrongEntry | undefined
  unmasteredCount: number
  masteredCount: number
}

export function useWrongBook(subject: Subject): UseWrongBookReturn {
  const [book, setBook] = useState(() => loadWrongBook(subject))

  const addWrong = useCallback(
    (questionId: string, userAnswer: string) => {
      setBook((prev) => {
        const existing = prev.entries.find((e) => e.questionId === questionId)
        const now = Date.now()
        let entries: WrongEntry[]

        if (existing) {
          entries = prev.entries.map((e) =>
            e.questionId === questionId
              ? {
                  ...e,
                  lastWrongAt: now,
                  wrongCount: e.wrongCount + 1,
                  userAnswers: [...e.userAnswers.slice(-9), userAnswer],
                  mastered: false,
                  consecutiveCorrect: 0,
                }
              : e
          )
        } else {
          entries = [
            ...prev.entries,
            {
              questionId,
              firstWrongAt: now,
              lastWrongAt: now,
              wrongCount: 1,
              userAnswers: [userAnswer],
              mastered: false,
              consecutiveCorrect: 0,
            },
          ]
        }

        const updated = { ...prev, entries }
        saveWrongBook(subject, updated)
        return updated
      })
    },
    [subject]
  )

  const markCorrect = useCallback(
    (questionId: string) => {
      setBook((prev) => {
        const entries = prev.entries.map((e) => {
          if (e.questionId !== questionId) return e
          const consecutive = e.consecutiveCorrect + 1
          return {
            ...e,
            consecutiveCorrect: consecutive,
            mastered: consecutive >= MASTERY_THRESHOLD,
            masteredAt: consecutive >= MASTERY_THRESHOLD ? Date.now() : undefined,
          }
        })
        const updated = { ...prev, entries }
        saveWrongBook(subject, updated)
        return updated
      })
    },
    [subject]
  )

  const markMastered = useCallback(
    (questionId: string) => {
      setBook((prev) => {
        const entries = prev.entries.map((e) =>
          e.questionId === questionId
            ? { ...e, mastered: true, masteredAt: Date.now(), consecutiveCorrect: MASTERY_THRESHOLD }
            : e
        )
        const updated = { ...prev, entries }
        saveWrongBook(subject, updated)
        return updated
      })
    },
    [subject]
  )

  const getEntry = useCallback(
    (questionId: string) => book.entries.find((e) => e.questionId === questionId),
    [book]
  )

  const unmasteredCount = book.entries.filter((e) => !e.mastered).length
  const masteredCount = book.entries.filter((e) => e.mastered).length

  return { book, addWrong, markCorrect, markMastered, getEntry, unmasteredCount, masteredCount }
}
