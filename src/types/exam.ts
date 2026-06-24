import type { Subject } from './index'

// ===== 考试模板 =====
export interface ExamTemplate {
  id: string
  subject: Subject
  name: string
  duration: number
  totalScore: number
  sections: ExamSection[]
}

export interface ExamSection {
  name: string
  questionIds: string[]
  scorePerQuestion: number
}

// ===== 考试会话（进行中） =====
export interface ExamSession {
  templateId: string
  startedAt: number
  answers: Record<string, ExamAnswer>
  isSubmitted: boolean
  submittedAt?: number
}

export interface ExamAnswer {
  questionId: string
  userAnswer: string
  answeredAt: number
  timeSpent: number
  marked?: boolean
}

// ===== 成绩报告 =====
export interface ScoreReport {
  templateId: string
  subject: Subject
  name: string
  totalScore: number
  earnedScore: number
  accuracyRate: number
  sectionScores: { name: string; earned: number; total: number }[]
  timeUsed: number
  wrongQuestionIds: string[]
  completedAt: number
}
