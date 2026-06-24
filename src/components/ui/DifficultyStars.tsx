import { Star } from 'lucide-react'

interface Props {
  level: number
  max?: number
}

function DifficultyStars({ level, max = 5 }: Props) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i < level ? 'fill-warning text-warning' : 'text-border'}`}
        />
      ))}
    </span>
  )
}

export default DifficultyStars
