import { Link } from 'react-router-dom'
import { getAllTopics, getQuestionsBySubject } from '@/data'
import { loadPracticeRecord, loadWrongBook } from '@/utils/storage'
import { ChevronLeft, BookOpen, Target, Flame, XCircle, BarChart3 } from 'lucide-react'

const SUBJECTS = [
  { key: 'math' as const, label: '数学', icon: '📐' },
  { key: 'physics' as const, label: '物理', icon: '⚡' },
  { key: 'chemistry' as const, label: '化学', icon: '⚗️' },
]

function StatsPage() {
  const topics = getAllTopics()

  // 汇总所有学科统计
  let totalQuestions = 0
  let totalAttempted = 0
  let totalCorrect = 0
  let totalWrong = 0
  let totalWrongBook = 0
  let totalMastered = 0

  const subjectData = SUBJECTS.map((s) => {
    const qs = getQuestionsBySubject(s.key)
    const record = loadPracticeRecord(s.key)
    const wrongBook = loadWrongBook(s.key)
    const stats = record.stats

    totalQuestions += qs.length
    totalAttempted += stats.totalAttempted
    totalCorrect += stats.totalCorrect
    totalWrong += stats.totalWrong
    totalWrongBook += wrongBook.entries.length
    totalMastered += wrongBook.entries.filter((e) => e.mastered).length

    return {
      ...s,
      questionCount: qs.length,
      stats,
      wrongCount: wrongBook.entries.filter((e) => !e.mastered).length,
      masteredCount: wrongBook.entries.filter((e) => e.mastered).length,
    }
  })

  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition mb-4">
        <ChevronLeft className="w-4 h-4" />
        返回首页
      </Link>

      <h1 className="text-2xl font-bold text-text mb-2">学习统计</h1>
      <p className="text-sm text-text-secondary mb-6">查看你的刷题进度和成绩</p>

      {/* 总览卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<BookOpen className="w-5 h-5 text-primary" />} label="总做题" value={`${totalAttempted}`} sub={`/ ${totalQuestions} 题`} />
        <StatCard icon={<Target className="w-5 h-5 text-success" />} label="正确率" value={`${overallAccuracy}%`} sub={`${totalCorrect} 对`} />
        <StatCard icon={<XCircle className="w-5 h-5 text-error" />} label="未掌握" value={`${totalWrongBook - totalMastered}`} sub={`已掌握 ${totalMastered}`} />
        <StatCard icon={<Flame className="w-5 h-5 text-warning" />} label="连续天数" value={`${Math.max(...subjectData.map((d) => d.stats.streakDays), 0)}`} sub="天" />
      </div>

      {/* 各学科详情 */}
      <div className="space-y-4">
        {subjectData.map((s) => {
          const topic = topics.find((t) => t.subject === s.key)
          const gradeLabels = topic?.grades.map((g) => g.gradeLabel).join(' / ') || ''

          return (
            <div key={s.key} className="bg-surface rounded-2xl border border-border p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <h3 className="font-bold text-text">{s.label}</h3>
                  <p className="text-xs text-text-muted">{gradeLabels}</p>
                </div>
                <Link
                  to={`/subject/${s.key}`}
                  className="ml-auto text-xs text-primary hover:underline"
                >
                  去刷题 →
                </Link>
              </div>

              {/* 学科统计 */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold text-text">{s.questionCount}</p>
                  <p className="text-xs text-text-muted">总题数</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-primary">{s.stats.totalAttempted}</p>
                  <p className="text-xs text-text-muted">已做</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-success">{s.stats.accuracyRate}%</p>
                  <p className="text-xs text-text-muted">正确率</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-error">{s.wrongCount}</p>
                  <p className="text-xs text-text-muted">错题</p>
                </div>
              </div>

              {/* 进度条 */}
              {s.questionCount > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                    <span>完成进度</span>
                    <span>{Math.round((s.stats.totalAttempted / s.questionCount) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-border/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((s.stats.totalAttempted / s.questionCount) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 空状态 */}
      {totalAttempted === 0 && (
        <div className="text-center py-12 text-text-muted">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-border" />
          <p>还没有做题记录</p>
          <Link to="/" className="text-primary hover:underline mt-2 inline-block text-sm">
            去首页开始刷题 →
          </Link>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-4 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-xl font-bold text-text">{value}</p>
      <p className="text-xs text-text-muted mt-0.5">{label}</p>
      <p className="text-xs text-text-secondary">{sub}</p>
    </div>
  )
}

export default StatsPage
