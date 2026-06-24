import type { TopicConfig, QuestionFile, Question, Subject, QuestionTag } from '@/types'

// ===== 自动扫描 topics/ 和 questions/ =====
const topicModules = import.meta.glob<{ default: TopicConfig }>(
  './topics/*/topic.json',
  { eager: true }
)

const questionModules = import.meta.glob<{ default: QuestionFile }>(
  './questions/**/*.json',
  { eager: true }
)

// ===== 构建数据索引 =====
const topics: TopicConfig[] = []
const allQuestions: Question[] = []
const questionsByChapter: Map<string, Question[]> = new Map()
const questionsBySubject: Map<Subject, Question[]> = new Map()

function buildIndex() {
  // 加载主题配置
  for (const [, mod] of Object.entries(topicModules)) {
    topics.push(mod.default)
  }

  // 加载题库
  for (const [, mod] of Object.entries(questionModules)) {
    const file = mod.default
    for (const q of file.questions) {
      allQuestions.push(q)
      // 按章节索引
      const existing = questionsByChapter.get(file.chapterId) || []
      existing.push(q)
      questionsByChapter.set(file.chapterId, existing)
      // 按学科索引
      const subjectQs = questionsBySubject.get(file.subject) || []
      subjectQs.push(q)
      questionsBySubject.set(file.subject, subjectQs)
    }
  }

  if (import.meta.env.DEV) {
    console.log('[SuperTest] topics:', topics.length, 'questions:', allQuestions.length)
  }
}

buildIndex()

// ===== 查询 API =====
export function getAllTopics(): TopicConfig[] {
  return topics
}

export function getTopicBySubject(subject: Subject): TopicConfig | undefined {
  return topics.find((t) => t.subject === subject)
}

export function getQuestionsByChapter(chapterId: string): Question[] {
  return questionsByChapter.get(chapterId) || []
}

export function getQuestionsBySubject(subject: Subject, filters?: {
  tags?: QuestionTag[]
  difficulty?: number[]
  topicId?: string
}): Question[] {
  let result = questionsBySubject.get(subject) || []

  if (filters?.tags && filters.tags.length > 0) {
    result = result.filter((q) => q.tags.some((t) => filters.tags!.includes(t)))
  }

  if (filters?.difficulty && filters.difficulty.length > 0) {
    result = result.filter((q) => filters.difficulty!.includes(q.difficulty))
  }

  if (filters?.topicId) {
    result = result.filter((q) => q.topicId === filters.topicId)
  }

  return result
}

export function getQuestionById(questionId: string): Question | undefined {
  return allQuestions.find((q) => q.id === questionId)
}

export function getSubjectStats(subject: Subject) {
  const qs = getQuestionsBySubject(subject)
  return {
    total: qs.length,
    byTag: qs.reduce((acc, q) => {
      q.tags.forEach((t) => {
        acc[t] = (acc[t] || 0) + 1
      })
      return acc
    }, {} as Record<string, number>),
  }
}
