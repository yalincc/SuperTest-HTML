import type { Subject } from '@/types'
import type { PracticeRecord, WrongBook } from '@/types/progress'
import type { ScoreReport, ExamSession } from '@/types/exam'
import { createEmptyPracticeRecord, createEmptyWrongBook } from '@/types/progress'

// ===== 做题记录 =====
function getPracticeKey(subject: Subject): string {
  return `supertest_practice_${subject}`
}

export function loadPracticeRecord(subject: Subject): PracticeRecord {
  try {
    const raw = localStorage.getItem(getPracticeKey(subject))
    if (!raw) return createEmptyPracticeRecord(subject)
    const data = JSON.parse(raw) as PracticeRecord
    if (data.version !== 1) return createEmptyPracticeRecord(subject)
    return data
  } catch {
    return createEmptyPracticeRecord(subject)
  }
}

export function savePracticeRecord(subject: Subject, record: PracticeRecord): void {
  localStorage.setItem(getPracticeKey(subject), JSON.stringify(record))
}

// ===== 错题本 =====
function getWrongBookKey(subject: Subject): string {
  return `supertest_wrongbook_${subject}`
}

export function loadWrongBook(subject: Subject): WrongBook {
  try {
    const raw = localStorage.getItem(getWrongBookKey(subject))
    if (!raw) return createEmptyWrongBook(subject)
    const data = JSON.parse(raw) as WrongBook
    if (data.version !== 1) return createEmptyWrongBook(subject)
    return data
  } catch {
    return createEmptyWrongBook(subject)
  }
}

export function saveWrongBook(subject: Subject, book: WrongBook): void {
  localStorage.setItem(getWrongBookKey(subject), JSON.stringify(book))
}

// ===== 考试成绩 =====
const EXAM_HISTORY_KEY = 'supertest_exam_history'
const EXAM_CURRENT_KEY = 'supertest_exam_current'

export function loadExamHistory(): ScoreReport[] {
  try {
    const raw = localStorage.getItem(EXAM_HISTORY_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ScoreReport[]
  } catch {
    return []
  }
}

export function saveExamHistory(reports: ScoreReport[]): void {
  localStorage.setItem(EXAM_HISTORY_KEY, JSON.stringify(reports))
}

export function loadCurrentExam(): ExamSession | null {
  try {
    const raw = localStorage.getItem(EXAM_CURRENT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ExamSession
  } catch {
    return null
  }
}

export function saveCurrentExam(session: ExamSession): void {
  localStorage.setItem(EXAM_CURRENT_KEY, JSON.stringify(session))
}

export function clearCurrentExam(): void {
  localStorage.removeItem(EXAM_CURRENT_KEY)
}

// ===== 重置 =====
export function resetSubjectData(subject: Subject): void {
  localStorage.removeItem(getPracticeKey(subject))
  localStorage.removeItem(getWrongBookKey(subject))
}
