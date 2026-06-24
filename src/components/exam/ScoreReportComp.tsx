import { Link } from 'react-router-dom'
import type { ScoreReport } from '@/types/exam'
import { getQuestionById } from '@/data'
import { renderInline } from '@/utils/renderInline'
import { Trophy, Clock, Target, XCircle, Home, RotateCcw } from 'lucide-react'

interface Props {
  report: ScoreReport
}

function ScoreReportComp({ report }: Props) {
  const minutes = Math.floor(report.timeUsed / 60)
  const seconds = report.timeUsed % 60
  const isPass = report.accuracyRate >= 60

  return (
    <div className="animate-[slide-up_0.4s_ease-out]">
      {/* 成绩卡片 */}
      <div className="bg-surface rounded-2xl border border-border p-6 text-center mb-6">
        <Trophy className={`w-16 h-16 mx-auto mb-3 ${isPass ? 'text-warning' : 'text-text-muted'}`} />
        <h2 className="text-2xl font-bold text-text mb-1">{report.name}</h2>
        <p className="text-sm text-text-secondary mb-4">考试完成</p>

        {/* 分数 */}
        <div className="flex items-center justify-center gap-8 mb-4">
          <div>
            <p className="text-4xl font-bold text-primary">{report.earnedScore}</p>
            <p className="text-xs text-text-muted">得分 / {report.totalScore}</p>
          </div>
          <div>
            <p className={`text-4xl font-bold ${isPass ? 'text-success' : 'text-error'}`}>
              {report.accuracyRate}%
            </p>
            <p className="text-xs text-text-muted">正确率</p>
          </div>
        </div>

        {/* 用时 */}
        <div className="flex items-center justify-center gap-1 text-sm text-text-secondary">
          <Clock className="w-4 h-4" />
          <span>用时 {minutes} 分 {seconds} 秒</span>
        </div>
      </div>

      {/* 分区得分 */}
      {report.sectionScores.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-5 mb-4">
          <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-primary" />
            分区得分
          </h3>
          <div className="space-y-2">
            {report.sectionScores.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">{s.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-border/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${s.total > 0 ? (s.earned / s.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-text w-16 text-right">
                    {s.earned}/{s.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 错题列表 */}
      {report.wrongQuestionIds.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-5 mb-4">
          <h3 className="text-sm font-semibold text-error mb-3 flex items-center gap-1.5">
            <XCircle className="w-4 h-4" />
            错题列表 ({report.wrongQuestionIds.length})
          </h3>
          <div className="space-y-2">
            {report.wrongQuestionIds.map((id) => {
              const q = getQuestionById(id)
              if (!q) return null
              return (
                <div key={id} className="px-3 py-2 bg-red-50 rounded-lg text-sm">
                  <span className="text-text-secondary">
                    {q.stem.length > 80 ? renderInline(q.stem.slice(0, 80) + '...') : renderInline(q.stem)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 操作 */}
      <div className="flex gap-3 justify-center">
        <Link
          to="/exam"
          className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white text-sm rounded-xl hover:bg-primary-dark transition"
        >
          <RotateCcw className="w-4 h-4" />
          再考一次
        </Link>
        <Link
          to="/"
          className="flex items-center gap-1.5 px-5 py-2.5 bg-border/30 text-text text-sm rounded-xl hover:bg-border transition"
        >
          <Home className="w-4 h-4" />
          返回首页
        </Link>
      </div>
    </div>
  )
}

export default ScoreReportComp
