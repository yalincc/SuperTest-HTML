import { useParams, Link } from 'react-router-dom'
import { getTopicBySubject, getQuestionsByChapter } from '@/data'
import { ChevronLeft, BookOpen } from 'lucide-react'
import { loadPracticeRecord } from '@/utils/storage'

function SubjectPage() {
  const { subject } = useParams<{ subject: string }>()
  const topicConfig = getTopicBySubject(subject as 'math' | 'physics' | 'chemistry')

  if (!topicConfig) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted mb-3">学科不存在</p>
          <Link to="/" className="text-primary hover:underline">返回首页</Link>
        </div>
      </div>
    )
  }

  const record = loadPracticeRecord(topicConfig.subject)

  return (
    <div>
      {/* 返回 + 标题 */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition mb-3">
          <ChevronLeft className="w-4 h-4" />
          返回首页
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{topicConfig.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-text">{topicConfig.subjectName}</h1>
            <p className="text-sm text-text-secondary">
              已做 {record.stats.totalAttempted} 题 · 正确率 {record.stats.accuracyRate}%
            </p>
          </div>
        </div>
      </div>

      {/* 年级→章节 */}
      {topicConfig.grades.map((grade) => (
        <div key={grade.grade} className="mb-6">
          <h2 className="text-lg font-bold text-text mb-3">{grade.gradeLabel}</h2>
          <div className="space-y-3">
            {grade.chapters.map((chapter) => {
              const chapterQuestions = getQuestionsByChapter(chapter.id)
              const answeredCount = chapterQuestions.filter(
                (q) => record.questions[q.id]?.answered
              ).length

              return (
                <Link
                  key={chapter.id}
                  to={`/subject/${topicConfig.subject}/topic/${chapter.id}`}
                  className="block bg-surface rounded-xl border border-border p-4 hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-text-muted" />
                      <h3 className="font-medium text-text">{chapter.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted">
                        {answeredCount}/{chapterQuestions.length || chapter.topics.length} 题
                      </span>
                      <ChevronLeft className="w-4 h-4 text-text-muted rotate-180" />
                    </div>
                  </div>
                  {/* 考点列表 */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {chapter.topics.map((topic) => (
                      <span key={topic.id} className="text-xs text-text-muted bg-bg px-2 py-0.5 rounded">
                        {topic.title}
                      </span>
                    ))}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default SubjectPage
