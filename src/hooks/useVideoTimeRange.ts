import { useState, useCallback, useRef, useEffect } from 'react'

interface UseVideoTimeRangeOptions {
  start: number       // 起始秒数
  end?: number        // 结束秒数
  onEnd?: () => void  // 到达结束时间回调
}

interface UseVideoTimeRangeReturn {
  isPlaying: boolean
  isFinished: boolean
  elapsed: number      // 已播放秒数
  duration: number     // 片段总时长（0=无限）
  startPlayback: () => void
  stopPlayback: () => void
  reset: () => void
}

/**
 * 视频时间区间控制 hook
 * 从播放开始计时，到达 (end - start) 秒后标记 finished
 */
export function useVideoTimeRange(options: UseVideoTimeRangeOptions): UseVideoTimeRangeReturn {
  const { start, end, onEnd } = options
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const duration = end != null ? Math.max(0, end - start) : 0

  const stopPlayback = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsPlaying(false)
  }, [])

  const startPlayback = useCallback(() => {
    // 清理之前的
    if (intervalRef.current) clearInterval(intervalRef.current)
    setIsFinished(false)
    setElapsed(0)
    setIsPlaying(true)

    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1
        // 如果有结束时间且到达
        if (duration > 0 && next >= duration) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          intervalRef.current = null
          setIsPlaying(false)
          setIsFinished(true)
          onEnd?.()
          return duration
        }
        return next
      })
    }, 1000)
  }, [duration, onEnd])

  const reset = useCallback(() => {
    stopPlayback()
    setIsFinished(false)
    setElapsed(0)
  }, [stopPlayback])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // options 变化时重置
  useEffect(() => {
    reset()
  }, [start, end]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isPlaying,
    isFinished,
    elapsed,
    duration,
    startPlayback,
    stopPlayback,
    reset,
  }
}

/** 将秒数格式化为 m:ss 或 h:mm:ss */
export function formatVideoTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}
