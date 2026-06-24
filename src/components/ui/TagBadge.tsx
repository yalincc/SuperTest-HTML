import type { QuestionTag } from '@/types'

const TAG_COLORS: Record<QuestionTag, string> = {
  '中考真题': 'bg-blue-50 text-blue-700',
  '易错题': 'bg-orange-50 text-orange-700',
  '陷阱题': 'bg-red-50 text-red-700',
  '高频考点': 'bg-purple-50 text-purple-700',
  '压轴题': 'bg-rose-50 text-rose-700',
  '基础题': 'bg-green-50 text-green-700',
  '综合题': 'bg-indigo-50 text-indigo-700',
}

interface Props {
  tag: QuestionTag
}

function TagBadge({ tag }: Props) {
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${TAG_COLORS[tag] || 'bg-gray-100 text-gray-600'}`}>
      {tag}
    </span>
  )
}

export default TagBadge
