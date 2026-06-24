import type { Question, AnswerResult } from '@/types'
import ChoiceQuestionComp from './ChoiceQuestion'
import FillQuestionComp from './FillQuestion'
import TrueFalseQuestionComp from './TrueFalseQuestion'
import CalculationQuestionComp from './CalculationQuestion'
import ProofQuestionComp from './ProofQuestion'
import { renderInline } from '@/utils/renderInline'
import TagBadge from '@/components/ui/TagBadge'
import DifficultyStars from '@/components/ui/DifficultyStars'
import TTSButton from '@/components/ui/TTSButton'
import SolutionPanel from '@/components/solution/SolutionPanel'
import FigureRenderer from '@/components/figure/FigureRenderer'

interface Props {
  question: Question
  index?: number
  total?: number
  savedAnswer?: string
  showSolution?: boolean
  onSubmit: (result: AnswerResult) => void
}

const TYPE_LABELS: Record<string, string> = {
  choice: '选择题',
  fill: '填空题',
  true_false: '判断题',
  calculation: '计算题',
  proof: '证明题',
}

function QuestionCard({ question, index, total, savedAnswer, showSolution = true, onSubmit }: Props) {
  return (
    <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* 头部：题号 + 题型 + 难度 + 标签 */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {index !== undefined && (
              <span className="text-xs font-semibold text-primary bg-primary-bg px-2 py-0.5 rounded-full">
                {index + 1}{total !== undefined ? `/${total}` : ''}
              </span>
            )}
            <span className="inline-block bg-border/50 text-text-secondary text-xs font-medium px-2 py-0.5 rounded-full">
              {TYPE_LABELS[question.type] || question.type}
            </span>
          </div>
          <DifficultyStars level={question.difficulty} />
          <TTSButton text={question.stem} />
        </div>

        {/* 标签 */}
        <div className="flex flex-wrap gap-1 mb-3">
          {question.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
          {question.source && (
            <span className="text-xs text-text-muted">
              {question.source.year ? `${question.source.year}年` : ''}
              {question.source.province || ''}
              {question.source.city || ''}
              {question.source.questionNumber || ''}
            </span>
          )}
        </div>

        {/* 题干 */}
        <div className="text-sm font-medium text-text leading-relaxed">
          {renderInline(question.stem)}
        </div>
      </div>

      {/* 题目配图（静态图片） */}
      {question.image && (
        <div className="px-5 pt-2">
          <img src={question.image} alt="题目配图" className="max-w-full rounded-lg my-2" />
        </div>
      )}

      {/* 图形区域 */}
      <FigureRenderer figure={question.figure} />

      {/* 题目区域 */}
      <div className="px-5 pb-4">
        {question.type === 'choice' && (
          <ChoiceQuestionComp
            question={question}
            savedAnswer={savedAnswer}
            onSubmit={onSubmit}
          />
        )}
        {question.type === 'fill' && (
          <FillQuestionComp
            question={question}
            savedAnswer={savedAnswer}
            onSubmit={onSubmit}
          />
        )}
        {question.type === 'true_false' && (
          <TrueFalseQuestionComp
            question={question}
            savedAnswer={savedAnswer}
            onSubmit={onSubmit}
          />
        )}
        {question.type === 'calculation' && (
          <CalculationQuestionComp
            question={question}
            savedAnswer={savedAnswer}
            onSubmit={onSubmit}
          />
        )}
        {question.type === 'proof' && (
          <ProofQuestionComp
            question={question}
            savedAnswer={savedAnswer}
            onSubmit={onSubmit}
          />
        )}
      </div>

      {/* 解析 */}
      {showSolution && savedAnswer && (
        <div className="border-t border-border/60">
          <SolutionPanel solution={question.solution} trapPoints={question.trapPoints} />
        </div>
      )}
    </div>
  )
}

export default QuestionCard
