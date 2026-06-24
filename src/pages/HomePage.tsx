import { Link } from 'react-router-dom'
import { getAllTopics } from '@/data'
import { loadPracticeRecord } from '@/utils/storage'
import { BookOpen, TrendingUp, XCircle, BarChart3 } from 'lucide-react'

function HomePage() {
  const topics = getAllTopics()

  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-[36px] font-bold text-text mb-2">SuperTest</h1>
        <p className="text-base text-text-secondary">初中数理化 · 经典题库</p>
      </div>

      {/* 学科卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {topics.map((t) => {
          const record = loadPracticeRecord(t.subject)
          const stats = record.stats
          return (
            <Link
              key={t.subject}
              to={`/subject/${t.subject}`}
              className="group bg-surface rounded-2xl border border-border p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="text-4xl mb-3">{t.icon}</div>
              <h2 className="text-xl font-bold text-text mb-1">{t.subjectName}</h2>
              <p className="text-xs text-text-secondary mb-4">
                {t.grades.map((g) => g.gradeLabel).join(' · ')}
              </p>

              {/* 统计 */}
              <div className="flex items-center justify-between text-xs text-text-muted">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>已做 {stats.totalAttempted} 题</span>
                </div>
                {stats.totalAttempted > 0 && (
                  <div className="flex items-center gap-1 text-success">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{stats.accuracyRate}%</span>
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {/* 快捷入口 */}
      <div className="grid grid-cols-3 gap-4">
        <Link
          to="/wrongbook"
          className="flex items-center gap-3 bg-surface rounded-xl border border-border p-4 hover:shadow-md transition"
        >
          <XCircle className="w-5 h-5 text-error" />
          <div>
            <p className="text-sm font-medium text-text">错题本</p>
            <p className="text-xs text-text-muted">回顾错题</p>
          </div>
        </Link>
        <Link
          to="/stats"
          className="flex items-center gap-3 bg-surface rounded-xl border border-border p-4 hover:shadow-md transition"
        >
          <BarChart3 className="w-5 h-5 text-success" />
          <div>
            <p className="text-sm font-medium text-text">学习统计</p>
            <p className="text-xs text-text-muted">查看进度</p>
          </div>
        </Link>
        <Link
          to="/exam"
          className="flex items-center gap-3 bg-surface rounded-xl border border-border p-4 hover:shadow-md transition"
        >
          <BookOpen className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-text">模拟考试</p>
            <p className="text-xs text-text-muted">限时模拟</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default HomePage
