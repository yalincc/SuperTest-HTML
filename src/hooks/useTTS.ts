import { useState, useCallback, useRef, useEffect } from 'react'
import { questionToSpeech } from '@/utils/latexToSpeech'

export interface UseTTSReturn {
  isPlaying: boolean
  isSupported: boolean
  speak: (text: string) => void
  stop: () => void
  toggle: (text: string) => void
}

/**
 * TTS 语音朗读 hook（基于 Web Speech API）
 * 自动过滤 LaTeX 公式标记和 HTML 标签
 */
export function useTTS(rate = 0.9): UseTTSReturn {
  const [isPlaying, setIsPlaying] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  // 使用 latexToSpeech 将公式转为口语
  const cleanText = useCallback((text: string): string => {
    return questionToSpeech(text)
  }, [])

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
  }, [isSupported])

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) return

      // 停止之前的朗读
      window.speechSynthesis.cancel()

      const cleaned = cleanText(text)
      if (!cleaned) return

      const utterance = new SpeechSynthesisUtterance(cleaned)
      utterance.lang = 'zh-CN'
      utterance.rate = rate
      utterance.pitch = 1
      utterance.volume = 1

      // 尝试选择中文语音
      const voices = window.speechSynthesis.getVoices()
      const zhVoice = voices.find((v) => v.lang.startsWith('zh'))
      if (zhVoice) utterance.voice = zhVoice

      utterance.onstart = () => setIsPlaying(true)
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    [isSupported, cleanText, rate]
  )

  const toggle = useCallback(
    (text: string) => {
      if (isPlaying) {
        stop()
      } else {
        speak(text)
      }
    },
    [isPlaying, speak, stop]
  )

  // 组件卸载时停止朗读
  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel()
    }
  }, [isSupported])

  return { isPlaying, isSupported, speak, stop, toggle }
}
