import { useState, useRef, useCallback } from 'react'
import type { Solution, TrapPoint } from '@/types'
import { renderInline } from '@/utils/renderInline'
import VideoEmbed from '@/components/video/VideoEmbed'
import { ChevronDown, ChevronUp, Lightbulb, AlertTriangle, BookOpen, Play } from 'lucide-react'

interface Props {
  solution: Solution
  trapPoints?: TrapPoint[]
}

function SolutionPanel({ solution, trapPoints }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [activeClipIndex, setActiveClipIndex] = useState<number | undefined>(undefined)
  const videoAreaRef = useRef<HTMLDivElement>(null)

  const handleStepPlayVideo = useCallback((clipIdx: number) => {
    setActiveClipIndex(clipIdx)
    // 滚动到视频区域
    videoAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  return (
    <div className="px-5 py-4 bg-surface-warm">
      {/* 展开/收起按钮 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition mb-2"
      >
        <Lightbulb className="w-4 h-4" />
        <span>查看解析</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {expanded && (
        <div className="animate-[tab-fade-in_0.25s_ease-out]">
          {/* 视频讲解 */}
          {solution.video && (
            <div ref={videoAreaRef} className="mb-4">
              <h4 className="text-xs font-semibold text-text-secondary mb-2 flex items-center gap-1">
                <Play className="w-3.5 h-3.5 text-primary" />
                视频讲解
              </h4>
              <VideoEmbed video={solution.video} activeClipIndex={activeClipIndex} />
            </div>
          )}

          {/* 最终答案 */}
          <div className="mb-3 px-3 py-2 bg-success-bg rounded-xl text-sm">
            <span className="font-semibold text-success">答案：</span>
            <span className="text-text">{renderInline(solution.answer)}</span>
          </div>

          {/* 分步解析 */}
          {solution.steps.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-text-secondary mb-2 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                解题步骤
              </h4>
              <div className="space-y-2">
                {solution.steps.map((step, i) => (
                  <div key={i} className="flex gap-2.5 text-sm">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <p className="text-text flex-1">{renderInline(step.description)}</p>
                        {step.videoClip && solution.video && (
                          <button
                            onClick={() => {
                              const clipIdx = solution.video!.clips?.findIndex(
                                (c) => c.start === step.videoClip!.start
                              ) ?? 0
                              handleStepPlayVideo(clipIdx >= 0 ? clipIdx : 0)
                            }}
                            className="shrink-0 flex items-center gap-0.5 px-2 py-0.5 text-xs text-primary bg-primary-bg rounded-full hover:bg-primary/10 transition"
                            title="播放此步骤视频"
                          >
                            <Play className="w-3 h-3" fill="currentColor" />
                            <span className="hidden sm:inline">视频</span>
                          </button>
                        )}
                      </div>
                      {step.expression && (
                        <p className="mt-1 text-text-secondary bg-white/60 px-2.5 py-1.5 rounded-lg text-center">
                          {renderInline(`$${step.expression}$`)}
                        </p>
                      )}
                      {step.note && (
                        <p className="mt-1 text-xs text-warning">{step.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 涉及知识点 */}
          {solution.keyKnowledge && (
            <div className="mb-3 px-3 py-2 bg-primary-bg rounded-xl text-sm text-primary">
              <span className="font-medium">知识点：</span>{solution.keyKnowledge}
            </div>
          )}

          {/* 易错点 */}
          {trapPoints && trapPoints.length > 0 && (
            <div className="space-y-2">
              {trapPoints.map((tp, i) => (
                <div key={i} className="px-3 py-2.5 bg-orange-50 border border-orange-200 rounded-xl text-sm">
                  <div className="flex items-center gap-1.5 text-orange-700 font-medium mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    易错提醒
                  </div>
                  <p className="text-text-secondary">{renderInline(tp.description)}</p>
                  <p className="mt-1 text-success"><strong>正确做法：</strong>{renderInline(tp.correctApproach)}</p>
                  <p className="mt-0.5 text-error"><strong>常见错误：</strong>{renderInline(tp.commonMistake)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SolutionPanel
