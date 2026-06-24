import { useParams, Link } from 'react-router-dom'
import type { Subject, QuestionTag } from '@/types'
import { useWrongBook } from '@/hooks/useWrongBook'
import { getQuestionById } from '@/data'
import QuestionCard from '@/components/question/QuestionCard'
import { ChevronLeft, CheckCircle, XCircle, Filter } from 'lucide-react'
import { useState, useMemo } from 'react'

const SUBJECTS: { key: Subject; label: string; icon: string }[] = [
  { key: 'math', label: '数学', icon: '📐' },
  { key: 'physics', label: '物理', icon: '⚡' },
  { key: 'chemistry', label: '化学', icon: '⚗️' },
]

const ALL_TAGS: QuestionTag[] = ['中考真题', '易错题', '陷阱题', '高频考点', '压轴题', '基础题', '综合题']

function WrongBookPage() {
  const { subject } = useParams<{ subject: string }>()
  const [activeSubject, setActiveSubject] = useState<Subject>((subject as Subject) || 'math')
  const [showMastered, setShowMastered] = useState(false)
  const [filterTag, setFilterTag] = useState<QuestionTag | null>(null)
  const [showFilter, setShowFilter] = useState(false)

  const wrongBook = useWrongBook(activeSubject)
  const entries = useMemo(() => {
    let list = showMastered ? wrongBook.book.entries : wrongBook.book.entries.filter((e) => !e.mastered)
    if (filterTag) {
      list = list.filter((e) => {
        const q = getQuestionById(e.questionId)
        return q?.tags.includes(filterTag)
      })
    }
    return list
  }, [wrongBook.book.entries, showMastered, filterTag])

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition mb-4">
        <ChevronLeft className="w-4 h-4" />
        返回首页
      </Link>

      <h1 className="text-2xl font-bold text-text mb-4">错题本</h1>

      {/* 学科切换 */}
      <div className="flex gap-2 mb-4">
        {SUBJECTS.map((s) => (
          <button
            key={s.key}
            onClick={() => { setActiveSubject(s.key); setFilterTag(null) }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeSubject === s.key
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-text-secondary hover:border-primary/30'
            }`}
          >
            <span>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* 统计和操作栏 */}
      <div className="flex items-center gap-4 mb-3 text-sm flex-wrap">
        <span className="text-error flex items-center gap-1">
          <XCircle className="w-4 h-4" />
          未掌握: {wrongBook.unmasteredCount}
        </span>
        <span className="text-success flex items-center gap-1">
          <CheckCircle className="w-4 h-4" />
          已掌握: {wrongBook.masteredCount}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition ${
              showFilter || filterTag ? 'bg-primary-bg text-primary' : 'bg-border/30 text-text-muted hover:text-text-secondary'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            {filterTag || '筛选'}
          </button>
          <button
            onClick={() => setShowMastered(!showMastered)}
            className="text-xs text-primary hover:underline"
          >
            {showMastered ? '隐藏已掌握' : '显示已掌握'}
          </button>
        </div>
      </div>

      {/* 标签筛选 */}
      {showFilter && (
        <div className="flex flex-wrap gap-1.5 mb-4 animate-[tab-fade-in_0.25s_ease-out]">
          <button
            onClick={() => setFilterTag(null)}
            className={`text-xs px-2.5 py-1 rounded-full transition ${
              !filterTag ? 'bg-primary text-white' : 'bg-border/30 text-text-muted hover:bg-border'
            }`}
          >
            全部
          </button>
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(filterTag === tag ? null : tag)}
              className={`text-xs px-2.5 py-1 rounded-full transition ${
                filterTag === tag ? 'bg-primary text-white' : 'bg-border/30 text-text-muted hover:bg-border'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* 错题列表 */}
      <div className="space-y-4">
        {entries.map((entry) => {
          const question = getQuestionById(entry.questionId)
          if (!question) return null

          return (
            <div key={entry.questionId} className="relative">
              <QuestionCard
                question={question}
                showSolution={true}
                savedAnswer={entry.userAnswers[entry.userAnswers.length - 1]}
                onSubmit={() => {}}
              />
              {/* 操作按钮 */}
              <div className="absolute top-3 right-3 flex gap-2">
                {!entry.mastered && (
                  <button
                    onClick={() => wrongBook.markMastered(entry.questionId)}
                    className="text-xs text-success hover:text-success/80 transition"
                    title="标记已掌握"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                {entry.mastered && (
                  <span className="text-xs text-success font-medium px-2 py-0.5 bg-success-bg rounded-full">
                    已掌握
                  </span>
                )}
              </div>
              {/* 错误统计 */}
              <div className="mx-5 mb-3 px-3 py-2 bg-red-50 rounded-lg text-xs text-error flex items-center justify-between">
                <span>
                  错误 {entry.wrongCount} 次
                  {entry.consecutiveCorrect > 0 && (
                    <span className="ml-2 text-success">· 已连续做对 {entry.consecutiveCorrect} 次</span>
                  )}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success" />
          <p>{filterTag ? `"${filterTag}" 分类下暂无错题` : showMastered ? '暂无错题记录' : '太棒了！暂无未掌握的错题'}</p>
        </div>
      )}
    </div>
  )
}

export default WrongBookPage
