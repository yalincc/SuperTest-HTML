import { useEffect, useId } from 'react'
import type { GeometryFigure } from '@/types/figure'
import { useJSXGraph } from './useJSXGraph'
import { buildGeometry } from './figureBuilders'

interface Props {
  figure: GeometryFigure
  showAxes?: boolean
}

/**
 * 几何图形渲染组件
 * 用于渲染三角形、圆、角标注等纯几何图形
 */
function GeometryBoard({ figure, showAxes = false }: Props) {
  const uid = useId().replace(/:/g, '_')
  const boardId = `geo-board-${uid}`

  const { containerRef, boardRef } = useJSXGraph({
    id: boardId,
    bounds: figure.bounds,
    showAxes,
    showGrid: false,
    showAxisLabels: false,
  })

  useEffect(() => {
    if (!boardRef.current) return
    buildGeometry(boardRef.current, figure.elements)
  }, [boardRef, figure])

  return (
    <div className="flex justify-center my-3">
      <div
        ref={containerRef}
        id={boardId}
        className="jxgbox w-full max-w-[400px] aspect-square"
      />
    </div>
  )
}

export default GeometryBoard
