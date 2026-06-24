import { lazy, Suspense } from 'react'
import type { Figure } from '@/types/figure'

const GeometryBoard = lazy(() => import('./GeometryBoard'))
const FunctionBoard = lazy(() => import('./FunctionBoard'))
const ConstructionBoard = lazy(() => import('./ConstructionBoard'))
const ForceBoard = lazy(() => import('../physics/ForceBoard'))
const CircuitBoard = lazy(() => import('../physics/CircuitBoard'))
const OpticsBoard = lazy(() => import('../physics/OpticsBoard'))

interface Props {
  figure?: Figure
}

/**
 * 图形渲染入口
 * 根据 figure.type 分发到对应渲染器，无 figure 时不渲染
 */
function FigureRenderer({ figure }: Props) {
  if (!figure) return null

  const Fallback = () => (
    <div className="flex justify-center my-3">
      <div className="w-full max-w-[400px] aspect-square bg-gray-50 rounded-xl animate-pulse" />
    </div>
  )

  return (
    <Suspense fallback={<Fallback />}>
      {figure.type === 'geometry' && <GeometryBoard figure={figure} />}
      {figure.type === 'function' && <FunctionBoard figure={figure} />}
      {figure.type === 'construction' && <ConstructionBoard figure={figure} />}
      {figure.type === 'force' && <ForceBoard figure={figure} scene={figure.scene} />}
      {figure.type === 'circuit' && <CircuitBoard figure={figure} />}
      {figure.type === 'optics' && <OpticsBoard figure={figure} />}
      {figure.type === 'composite' && (
        <div>
          {figure.geometry && <GeometryBoard figure={figure.geometry} />}
          {figure.functions && <FunctionBoard figure={figure.functions} />}
        </div>
      )}
    </Suspense>
  )
}

export default FigureRenderer
