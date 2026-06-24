import { useTTS } from '@/hooks/useTTS'
import { Volume2, VolumeX } from 'lucide-react'

interface Props {
  text: string
  label?: string
}

function TTSButton({ text, label }: Props) {
  const { isPlaying, isSupported, toggle } = useTTS()

  if (!isSupported) return null

  return (
    <button
      onClick={() => toggle(text)}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
        isPlaying
          ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
          : 'bg-border/30 text-text-muted hover:text-primary hover:bg-primary/5'
      }`}
      title={isPlaying ? '停止朗读' : '朗读'}
    >
      {isPlaying ? (
        <VolumeX className="w-3.5 h-3.5" />
      ) : (
        <Volume2 className="w-3.5 h-3.5" />
      )}
      {label && <span>{label}</span>}
    </button>
  )
}

export default TTSButton
