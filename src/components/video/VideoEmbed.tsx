import { useState } from 'react'
import type { VideoRef } from '@/types'
import VideoClipPlayer from './VideoClipPlayer'
import BilibiliPlayer from './BilibiliPlayer'
import { Play, ExternalLink, Video } from 'lucide-react'

interface Props {
  video: VideoRef
  activeClipIndex?: number
  className?: string
}

/**
 * 统一视频入口组件
 * 按 platform 分发：bilibili → 播放器，douyin → 外链
 * 含懒加载占位封面
 */
function VideoEmbed({ video, activeClipIndex, className = '' }: Props) {
  const [loaded, setLoaded] = useState(false)

  // 抖音降级：外链按钮
  if (video.platform === 'douyin') {
    return (
      <div className={`rounded-2xl border border-border bg-surface p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center shrink-0">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text truncate">
              {video.title || '抖音视频'}
            </p>
            <p className="text-xs text-text-muted">抖音视频暂不支持嵌入播放</p>
          </div>
          {video.externalUrl && (
            <a
              href={video.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs rounded-full hover:bg-primary-dark transition shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              打开
            </a>
          )}
        </div>
      </div>
    )
  }

  // Bilibili
  // 懒加载：未加载时显示占位封面
  if (!loaded) {
    return (
      <button
        onClick={() => setLoaded(true)}
        className={`group relative w-full aspect-video rounded-2xl overflow-hidden border border-border ${className}`}
      >
        {/* 背景 */}
        {video.cover ? (
          <img
            src={video.cover}
            alt={video.title || '视频封面'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-bg to-primary/5" />
        )}

        {/* 播放按钮 */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
          <div className="w-16 h-16 rounded-full bg-white/90 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 text-primary ml-1" fill="currentColor" />
          </div>
        </div>

        {/* 底部标题 */}
        {video.title && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
            <p className="text-white text-sm font-medium">{video.title}</p>
            <p className="text-white/70 text-xs mt-0.5 flex items-center gap-1">
              <span className="text-[#00a1d6]">B站</span>
              {video.clips && video.clips.length > 0 && (
                <span>· {video.clips.length} 个片段</span>
              )}
            </p>
          </div>
        )}
      </button>
    )
  }

  // 已加载：渲染播放器
  if (video.clips && video.clips.length > 0) {
    return (
      <VideoClipPlayer
        video={video}
        activeClipIndex={activeClipIndex}
        className={className}
      />
    )
  }

  // 无片段：全片播放
  return (
    <div className={`rounded-2xl border border-border overflow-hidden ${className}`}>
      <BilibiliPlayer
        bvid={video.videoId}
        page={video.page}
      />
      {video.externalUrl && (
        <div className="px-3 py-2 bg-surface text-right">
          <a
            href={video.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-0.5 text-xs text-text-muted hover:text-primary transition justify-end"
          >
            <ExternalLink className="w-3 h-3" />
            在B站打开
          </a>
        </div>
      )}
    </div>
  )
}

export default VideoEmbed
