import { useState, useRef, useEffect } from 'react'

interface Props {
  bvid: string
  page?: number
  startTime?: number
  autoplay?: boolean
  className?: string
  /** 用于强制重载 iframe（key 变化时重新挂载） */
  reloadKey?: string | number
}

/**
 * Bilibili iframe 播放器
 * 使用 IntersectionObserver 懒加载
 */
function BilibiliPlayer({
  bvid,
  page = 1,
  startTime = 0,
  autoplay = false,
  className = '',
  reloadKey,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // IntersectionObserver 懒加载
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // 构建 iframe URL
  const buildSrc = () => {
    const params = new URLSearchParams({
      bvid,
      page: String(page),
      danmaku: '0',
      high_quality: '1',
    })
    if (startTime > 0) params.set('t', String(startTime))
    if (autoplay) params.set('autoplay', '1')
    return `https://player.bilibili.com/player.html?${params.toString()}`
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-video rounded-xl overflow-hidden bg-black ${className}`}
    >
      {isVisible ? (
        <iframe
          key={reloadKey}
          src={buildSrc()}
          className="w-full h-full"
          scrolling="no"
          frameBorder="0"
          allowFullScreen
          onLoad={() => setIsLoaded(true)}
          style={{ border: 'none' }}
        />
      ) : (
        // 占位
        <div className="w-full h-full bg-border/20 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-border/50 animate-pulse" />
        </div>
      )}

      {/* 加载中指示 */}
      {isVisible && !isLoaded && (
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
          <div className="px-3 py-1.5 bg-black/60 text-white text-xs rounded-full">
            加载播放器...
          </div>
        </div>
      )}
    </div>
  )
}

export default BilibiliPlayer
