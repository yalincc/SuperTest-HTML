// ===== 学科标识 =====
import type { Figure } from './figure'
export type { Figure, ConstructionOp, ConstructionFigure } from './figure'
export type Subject = 'math' | 'physics' | 'chemistry'

// ===== 年级 =====
export type Grade = 7 | 8 | 9

// ===== 题目标签 =====
export type QuestionTag =
  | '中考真题'
  | '易错题'
  | '陷阱题'
  | '高频考点'
  | '压轴题'
  | '基础题'
  | '综合题'

// ===== 来源信息 =====
export interface QuestionSource {
  type: 'zhongkao' | 'mock' | 'custom'
  year?: number
  province?: string
  city?: string
  paper?: string
  questionNumber?: string
}

// ===== 易错点/陷阱点 =====
export interface TrapPoint {
  description: string
  correctApproach: string
  commonMistake: string
}

// ===== 解题步骤 =====
export interface SolutionStep {
  description: string
  expression?: string
  note?: string
  videoClip?: VideoClip
}

// ===== 详细解析 =====
export interface Solution {
  answer: string
  steps: SolutionStep[]
  keyKnowledge?: string
  alternativeMethods?: SolutionStep[][]
  video?: VideoRef
}

// ===== 题目基础字段 =====
interface QuestionBase {
  id: string
  stem: string
  difficulty: 1 | 2 | 3 | 4 | 5
  topicId: string
  tags: QuestionTag[]
  source?: QuestionSource
  solution: Solution
  trapPoints?: TrapPoint[]
  ttsText?: string
  figure?: Figure
  image?: string  // 静态图片路径，如 "/images/math-g8-ch02-q001.png"
}

// ===== 选择题 =====
export interface ChoiceQuestion extends QuestionBase {
  type: 'choice'
  options: { label: string; text: string }[]
  answer: string
  isMultiple?: boolean
}

// ===== 填空题 =====
export interface FillBlank {
  index: number
  answer: string
  alternatives?: string[]
  unit?: string
}

export interface FillQuestion extends QuestionBase {
  type: 'fill'
  segments: string[]
  blanks: FillBlank[]
}

// ===== 计算题/解答题 =====
export interface SubQuestion {
  label: string
  stem: string
  answer: string
}

export interface CalculationQuestion extends QuestionBase {
  type: 'calculation'
  subQuestions?: SubQuestion[]
  scorePoints?: string[]
}

// ===== 判断题 =====
export interface TrueFalseQuestion extends QuestionBase {
  type: 'true_false'
  answer: boolean
}

// ===== 证明题 =====
export interface ProofQuestion extends QuestionBase {
  type: 'proof'
  proofSteps: SolutionStep[]
  conclusion: string
}

// ===== 题目联合类型 =====
export type Question =
  | ChoiceQuestion
  | FillQuestion
  | CalculationQuestion
  | TrueFalseQuestion
  | ProofQuestion

// ===== 题库文件 =====
export interface QuestionFile {
  subject: Subject
  grade: Grade
  chapterId: string
  questions: Question[]
}

// ===== 主题/章节配置 =====
export interface TopicNode {
  id: string
  title: string
  tags?: string[]
}

export interface ChapterConfig {
  id: string
  title: string
  topics: TopicNode[]
  introVideo?: VideoRef
}

export interface GradeConfig {
  grade: Grade
  gradeLabel: string
  chapters: ChapterConfig[]
}

export interface TopicConfig {
  subject: Subject
  subjectName: string
  icon: string
  color: string
  grades: GradeConfig[]
}

// ===== 答案结果 =====
export interface AnswerResult {
  answered: boolean
  correct: boolean
  userAnswer: string
  timestamp: number
}

// ===== 视频平台 =====
export type VideoPlatform = 'bilibili' | 'douyin'

// ===== 视频片段（指定时间区间） =====
export interface VideoClip {
  /** 片段标题/描述，如"配方法讲解" */
  label?: string
  /** 起始秒数 */
  start: number
  /** 结束秒数（可选，不设则可自由播放） */
  end?: number
}

// ===== 视频引用 =====
export interface VideoRef {
  /** 平台标识 */
  platform: VideoPlatform
  /** 视频ID（Bilibili=BV号如"BV1xx411c7mD"，抖音=视频ID） */
  videoId: string
  /** 多P视频的集数（Bilibili专用，默认1） */
  page?: number
  /** 视频标题 */
  title?: string
  /** 视频封面URL（用于懒加载占位） */
  cover?: string
  /** 时间片段列表（一个视频可切多个片段） */
  clips?: VideoClip[]
  /** 原始链接（抖音降级用，或"在B站打开"按钮） */
  externalUrl?: string
}
