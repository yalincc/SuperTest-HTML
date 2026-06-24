import type { Subject, Question, QuestionTag } from '@/types'
import type { ExamTemplate, ExamSection } from '@/types/exam'
import { getQuestionsBySubject } from '@/data'

/** 智能组卷：从题库中按规则抽题 */
export function composeExam(
  subject: Subject,
  options: {
    duration?: number
    questionCount?: number
    difficultyWeights?: Record<number, number>
    tagWeights?: Partial<Record<QuestionTag, number>>
  } = {}
): ExamTemplate {
  const {
    duration = 45,
    questionCount = 15,
    difficultyWeights = { 1: 0.2, 2: 0.3, 3: 0.3, 4: 0.15, 5: 0.05 },
    tagWeights = {},
  } = options

  const allQuestions = getQuestionsBySubject(subject).filter(
    (q) => ['choice', 'fill', 'true_false'].includes(q.type)
  )

  // 按难度分组
  const byDifficulty = new Map<number, Question[]>()
  allQuestions.forEach((q) => {
    const existing = byDifficulty.get(q.difficulty) || []
    existing.push(q)
    byDifficulty.set(q.difficulty, existing)
  })

  // 按权重抽题
  const selected: Question[] = []
  const usedIds = new Set<string>()

  // 先按难度分配
  const totalWeight = Object.values(difficultyWeights).reduce((a, b) => a + b, 0)
  for (const [diff, weight] of Object.entries(difficultyWeights)) {
    const count = Math.max(1, Math.round((weight / totalWeight) * questionCount))
    const pool = byDifficulty.get(Number(diff)) || []
    const shuffled = shuffle([...pool])

    let taken = 0

    for (const q of shuffled) {
      if (selected.length >= questionCount) break
      if (taken >= count) break
      if (usedIds.has(q.id)) continue

      // 检查标签权重
      if (Object.keys(tagWeights).length > 0) {
        const matchTag = q.tags.some((t) => tagWeights[t as QuestionTag])
        if (!matchTag && Math.random() > 0.3) continue
      }

      selected.push(q)
      usedIds.add(q.id)
      taken++
    }
  }

  // 如果不够，随机补充
  if (selected.length < questionCount) {
    const remaining = shuffle(allQuestions.filter((q) => !usedIds.has(q.id)))
    for (const q of remaining) {
      if (selected.length >= questionCount) break
      selected.push(q)
      usedIds.add(q.id)
    }
  }

  // 构建分区
  const choiceSection: ExamSection = {
    name: '选择题',
    questionIds: selected.filter((q) => q.type === 'choice').map((q) => q.id),
    scorePerQuestion: 5,
  }
  const fillSection: ExamSection = {
    name: '填空题',
    questionIds: selected.filter((q) => q.type === 'fill').map((q) => q.id),
    scorePerQuestion: 5,
  }
  const tfSection: ExamSection = {
    name: '判断题',
    questionIds: selected.filter((q) => q.type === 'true_false').map((q) => q.id),
    scorePerQuestion: 3,
  }

  const sections = [choiceSection, fillSection, tfSection].filter((s) => s.questionIds.length > 0)
  const totalScore = sections.reduce((sum, s) => sum + s.questionIds.length * s.scorePerQuestion, 0)

  const subjectNames: Record<Subject, string> = { math: '数学', physics: '物理', chemistry: '化学' }

  return {
    id: `exam-${subject}-${Date.now()}`,
    subject,
    name: `${subjectNames[subject]}模拟考试`,
    duration,
    totalScore,
    sections,
  }
}

/** Fisher-Yates 洗牌 */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
