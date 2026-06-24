import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Subject } from '@/types'
import type { ExamTemplate, ScoreReport } from '@/types/exam'
import { getQuestionsBySubject } from '@/data'
import { composeExam } from '@/utils/examComposer'
import ExamFlow from '@/components/exam/ExamFlow'
import ScoreReportComp from '@/components/exam/ScoreReportComp'
import { ChevronLeft, Play, Clock, Hash } from 'lucide-react'

const SUBJECTS: { key: Subject; label: string; icon: string }[] = [
  { key: 'math', label: '数学', icon: '📐' },
  { key: 'physics', label: '物理', icon: '⚡' },
  { key: 'chemistry', label: '化学', icon: '⚗️' },
]

type Phase = 'config' | 'exam' | 'result'

function ExamPage() {
  const [phase, setPhase] = useState<Phase>('config')
  const [selectedSubject, setSelectedSubject] = useState<Subject>('math')
  const [duration, setDuration] = useState(30)
  const [questionCount, setQuestionCount] = useState(10)
  const [template, setTemplate] = useState<ExamTemplate | null>(null)
  const [report, setReport] = useState<ScoreReport | null>(null)

  function startExam() {
    const t = composeExam(selectedSubject, { duration, questionCount })
    setTemplate(t)
    setPhase('exam')
  }

  function handleFinish(r: ScoreReport) {
    setReport(r)
    setPhase('result')
  }

  // 考试进行中
  if (phase === 'exam' && template) {
    return <ExamFlow template={template} onFinish={handleFinish} />
  }

  // 成绩报告
  if (phase === 'result' && report) {
    return <ScoreReportComp report={report} />
  }

  // 配置页
  const availableCount = getQuestionsBySubject(selectedSubject).filter(
    (q) => ['choice', 'fill', 'true_false'].includes(q.type)
  ).length

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition mb-4">
        <ChevronLeft className="w-4 h-4" />
        返回首页
      </Link>

      <h1 className="text-2xl font-bold text-text mb-2">模拟考试</h1>
      <p className="text-sm text-text-secondary mb-6">选择学科和参数，开始限时模拟考试</p>

      {/* 学科选择 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text mb-2">选择学科</label>
        <div className="grid grid-cols-3 gap-3">
          {SUBJECTS.map((s) => {
            const count = getQuestionsBySubject(s.key).filter(
              (q) => ['choice', 'fill', 'true_false'].includes(q.type)
            ).length

            return (
              <button
                key={s.key}
                onClick={() => { setSelectedSubject(s.key); setQuestionCount(Math.min(questionCount, count)) }}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  selectedSubject === s.key
                    ? 'border-primary bg-primary-bg'
                    : 'border-border hover:border-primary/30 bg-surface'
                }`}
              >
                <div className="text-2xl mb-1">{s.icon}</div>
                <p className="text-sm font-medium text-text">{s.label}</p>
                <p className="text-xs text-text-muted">{count} 题可用</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* 考试参数 */}
      <div className="bg-surface rounded-2xl border border-border p-5 mb-6 space-y-4">
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-text mb-2">
            <Hash className="w-4 h-4 text-primary" />
            题目数量
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={3}
              max={Math.min(availableCount, 20)}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="text-sm font-bold text-primary w-8 text-center">{questionCount}</span>
          </div>
          <p className="text-xs text-text-muted mt-1">当前可用: {availableCount} 题</p>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-text mb-2">
            <Clock className="w-4 h-4 text-primary" />
            考试时长
          </label>
          <div className="flex gap-2">
            {[15, 20, 30, 45, 60].map((m) => (
              <button
                key={m}
                onClick={() => setDuration(m)}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  duration === m
                    ? 'bg-primary text-white'
                    : 'bg-border/30 text-text-secondary hover:bg-border'
                }`}
              >
                {m} 分钟
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 开始按钮 */}
      <button
        onClick={startExam}
        disabled={availableCount < 3}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white text-base font-medium rounded-xl hover:bg-primary-dark hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <Play className="w-5 h-5" />
        开始考试
      </button>

      {availableCount < 3 && (
        <p className="text-sm text-error text-center mt-2">
          该学科可练习题不足 3 道，暂无法组卷
        </p>
      )}
    </div>
  )
}

export default ExamPage
