import type { Subject } from './index'

// ===== 做题记录 =====
export interface PracticeRecord {
  version: 1
  subject: Subject
  questions: Record<string, QuestionAttempt>
  stats: PracticeStats
}

export interface QuestionAttempt {
  questionId: string
  answered: boolean
  correct: boolean
  userAnswer: string
  timestamp: number
  timeSpent?: number
  attemptCount: number
  lastAttemptAt?: number
}

export interface PracticeStats {
  totalAttempted: number
  totalCorrect: number
  totalWrong: number
  streakDays: number
  accuracyRate: number
}

// ===== 错题本 =====
export interface WrongBook {
  version: 1
  subject: Subject
  entries: WrongEntry[]
}

export interface WrongEntry {
  questionId: string
  firstWrongAt: number
  lastWrongAt: number
  wrongCount: number
  userAnswers: string[]
  mastered: boolean
  masteredAt?: number
  consecutiveCorrect: number
}

/** 连续做对 N 次即标记为 mastered */
export const MASTERY_THRESHOLD = 3

// ===== 创建空记录 =====
export function createEmptyPracticeRecord(subject: Subject): PracticeRecord {
  return {
    version: 1,
    subject,
    questions: {},
    stats: {
      totalAttempted: 0,
      totalCorrect: 0,
      totalWrong: 0,
      streakDays: 0,
      accuracyRate: 0,
    },
  }
}

export function createEmptyWrongBook(subject: Subject): WrongBook {
  return {
    version: 1,
    subject,
    entries: [],
  }
}
