import { useState, useCallback, useRef, useEffect } from 'react'
import type { VideoRef, VideoClip } from '@/types'
import { useVideoTimeRange, formatVideoTime } from '@/hooks/useVideoTimeRange'
import BilibiliPlayer from './BilibiliPlayer'
import { Play, RotateCcw, SkipForward, ExternalLink } from 'lucide-react'

interface Props {
  video: VideoRef
  activeClipIndex?: number
  className?: string
}

/**
 * 片段播放器：顶部片段选择条 + BilibiliPlayer + 播放完毕覆盖层
 */
function VideoClipPlayer({ video, activeClipIndex, className = '' }: Props) {
  const clips = video.clips || []
  const [currentClipIdx, setCurrentClipIdx] = useState(activeClipIndex ?? 0)
  const [reloadKey, setReloadKey] = useState(0)
  const videoRef = useRef<HTMLDivElement>(null)

  const currentClip: VideoClip | undefined = clips[currentClipIdx]

  // 时间控制
  const { isPlaying, isFinished, elapsed, duration, startPlayback, stopPlayback, reset } =
    useVideoTimeRange({
      start: currentClip?.start ?? 0,
      end: currentClip?.end,
    })

  // activeClipIndex 外部变化时切换
  useEffect(() => {
    if (activeClipIndex != null && activeClipIndex !== currentClipIdx && activeClipIndex < clips.length) {
      setCurrentClipIdx(activeClipIndex)
      setReloadKey((k) => k + 1)
    }
  }, [activeClipIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // 切换片段时重置
  useEffect(() => {
    reset()
    setReloadKey((k) => k + 1)
  }, [currentClipIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectClip = useCallback((idx: number) => {
    stopPlayback()
    setCurrentClipIdx(idx)
  }, [stopPlayback])

  const handleReplay = useCallback(() => {
    reset()
    setReloadKey((k) => k + 1)
    setTimeout(() => startPlayback(), 100)
  }, [reset, startPlayback])

  const handleContinue = useCallback(() => {
    // 移除覆盖层，允许自由播放
    reset()
  }, [reset])

  const hasClips = clips.length > 0

  return (
    <div ref={videoRef} className={`rounded-2xl border border-border overflow-hidden bg-surface ${className}`}>
      {/* 片段选择条 */}
      {hasClips && (
        <div className="flex gap-2 overflow-x-auto py-2 px-3 bg-border/10">
          {clips.map((clip, i) => (
            <button
              key={i}
              onClick={() => selectClip(i)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                i === currentClipIdx
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-border/50 text-text-secondary hover:bg-border hover:text-text'
              }`}
            >
              {clip.label || `片段 ${i + 1}`}
              {clip.end != null && (
                <span className="ml-1 opacity-70">
                  {formatVideoTime(clip.start)}-{formatVideoTime(clip.end)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 视频播放区域 */}
      <div className="relative">
        <BilibiliPlayer
          bvid={video.videoId}
          page={video.page}
          startTime={currentClip?.start ?? 0}
          reloadKey={`${currentClipIdx}-${reloadKey}`}
        />

        {/* 播放完毕覆盖层 */}
        {isFinished && currentClip?.end != null && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 animate-[tab-fade-in_0.25s_ease-out]">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-1">
              <SkipForward className="w-6 h-6 text-white" />
            </div>
            <p className="text-white text-sm font-medium">片段播放完毕</p>
            <div className="flex gap-3">
              <button
                onClick={handleReplay}
                className="flex items-center gap-1 px-4 py-1.5 bg-white/90 text-text text-xs rounded-full hover:bg-white transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                重新播放
              </button>
              <button
                onClick={handleContinue}
                className="flex items-center gap-1 px-4 py-1.5 bg-white/20 text-white text-xs rounded-full hover:bg-white/30 transition"
              >
                <Play className="w-3.5 h-3.5" />
                继续观看
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 底部信息栏 */}
      <div className="flex items-center justify-between px-3 py-2 text-xs text-text-muted">
        <div className="flex items-center gap-2">
          {currentClip && (
            <span>
              {isPlaying || isFinished
                ? `${formatVideoTime(elapsed)} / ${duration > 0 ? formatVideoTime(duration) : '∞'}`
                : currentClip.label || `片段 ${currentClipIdx + 1}`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {video.externalUrl && (
            <a
              href={video.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-0.5 text-text-muted hover:text-primary transition"
              title="在B站打开"
            >
              <ExternalLink className="w-3 h-3" />
              <span>B站</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default VideoClipPlayer
