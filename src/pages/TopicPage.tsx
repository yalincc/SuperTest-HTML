import { useParams, Link } from 'react-router-dom'
import { getTopicBySubject, getQuestionsByChapter } from '@/data'
import type { Subject, QuestionTag } from '@/types'
import { ChevronLeft, Play } from 'lucide-react'
import { useState } from 'react'
import QuestionCard from '@/components/question/QuestionCard'

const ALL_TAGS: QuestionTag[] = ['中考真题', '易错题', '陷阱题', '高频考点', '压轴题', '基础题']

function TopicPage() {
  const { subject, topicId } = useParams<{ subject: string; topicId: string }>()
  const topicConfig = getTopicBySubject(subject as Subject)
  const questions = getQuestionsByChapter(topicId || '')

  const [filterTag, setFilterTag] = useState<QuestionTag | null>(null)

  const filtered = filterTag
    ? questions.filter((q) => q.tags.includes(filterTag))
    : questions

  // 查找章节名
  let chapterTitle = topicId || ''
  if (topicConfig) {
    for (const g of topicConfig.grades) {
      for (const ch of g.chapters) {
        if (ch.id === topicId) {
          chapterTitle = ch.title
        }
      }
    }
  }

  return (
    <div>
      {/* 导航 */}
      <div className="mb-4">
        <Link
          to={`/subject/${subject}`}
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          返回{topicConfig?.subjectName}
        </Link>
        <h1 className="text-2xl font-bold text-text">{chapterTitle}</h1>
        <p className="text-sm text-text-secondary mt-1">{questions.length} 道题目</p>
      </div>

      {/* 标签筛选 */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setFilterTag(null)}
          className={`text-xs px-3 py-1 rounded-full transition ${
            !filterTag ? 'bg-primary text-white' : 'bg-border/50 text-text-secondary hover:bg-border'
          }`}
        >
          全部
        </button>
        {ALL_TAGS.map((tag) => {
          const count = questions.filter((q) => q.tags.includes(tag)).length
          if (count === 0) return null
          return (
            <button
              key={tag}
              onClick={() => setFilterTag(filterTag === tag ? null : tag)}
              className={`text-xs px-3 py-1 rounded-full transition ${
                filterTag === tag ? 'bg-primary text-white' : 'bg-border/50 text-text-secondary hover:bg-border'
              }`}
            >
              {tag} ({count})
            </button>
          )
        })}
      </div>

      {/* 开始刷题按钮 */}
      {filtered.length > 0 && (
        <Link
          to={`/practice/${subject}?chapter=${topicId}${filterTag ? `&tag=${filterTag}` : ''}`}
          className="flex items-center justify-center gap-2 w-full py-3 mb-5 bg-primary text-white rounded-full font-semibold text-base hover:bg-primary-dark active:scale-[0.98] transition-all shadow-md"
        >
          <Play className="w-5 h-5" />
          开始刷题 ({filtered.length} 题)
        </Link>
      )}

      {/* 题目列表 */}
      <div className="space-y-4">
        {filtered.map((q, i) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={i}
            total={filtered.length}
            showSolution={true}
            onSubmit={() => {}}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          <p>该分类下暂无题目</p>
        </div>
      )}
    </div>
  )
}

export default TopicPage
