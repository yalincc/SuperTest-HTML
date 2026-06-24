import { useEffect, useId } from 'react'
import JXG from 'jsxgraph'
import type { FunctionFigure } from '@/types/figure'
import { useJSXGraph } from './useJSXGraph'
import { parseExpression } from './figureBuilders'

interface Props {
  figure: FunctionFigure
}

const PLOT_COLORS = ['#2563eb', '#dc2626', '#059669', '#7c3aed', '#ea580c']

/**
 * 函数图像渲染组件
 * 用于渲染坐标系上的函数曲线和标注点
 */
function FunctionBoard({ figure }: Props) {
  const uid = useId().replace(/:/g, '_')
  const boardId = `func-board-${uid}`

  const bounds: [number, number, number, number] = [
    figure.xRange[0] - 1,
    figure.yRange[1] + 1,
    figure.xRange[1] + 1,
    figure.yRange[0] - 1,
  ]

  const { containerRef, boardRef } = useJSXGraph({
    id: boardId,
    bounds,
    showAxes: true,
    showGrid: figure.grid ?? false,
    showAxisLabels: true,
  })

  useEffect(() => {
    const board = boardRef.current
    if (!board) return

    // 绘制函数曲线
    figure.plots.forEach((plot, i) => {
      const fn = parseExpression(plot.expression)
      if (!fn) return

      const color = plot.color || PLOT_COLORS[i % PLOT_COLORS.length]

      const attrs: Record<string, unknown> = {
        strokeColor: color,
        strokeWidth: 2.5,
        highlight: false,
      }
      if (plot.style === 'dashed') {
        attrs.dash = 2
      }

      if (plot.domain) {
        board.create('functiongraph', [fn, plot.domain[0], plot.domain[1]], attrs)
      } else {
        board.create('functiongraph', [fn, figure.xRange[0], figure.xRange[1]], attrs)
      }

      // 函数标签
      if (plot.label) {
        board.create('text', [
          figure.xRange[1] - 0.5,
          () => {
            try { return fn(figure.xRange[1] - 0.5) } catch { return 0 }
          },
          plot.label,
        ], {
          anchorX: 'left',
          anchorY: 'bottom',
          fontSize: 11,
          strokeColor: color,
          offset: [5, 5],
        })
      }
    })

    // 标注关键点
    if (figure.points) {
      for (const pt of figure.points) {
        const point = board.create('point', pt.coord, {
          name: pt.label || '',
          fixed: true,
          size: 3,
          strokeColor: '#dc2626',
          fillColor: '#dc2626',
          label: { offset: [8, -8] },
          showInfobox: false,
        }) as JXG.Point

        // 添加虚线到坐标轴
        if (pt.label) {
          const [x, y] = pt.coord
          board.create('segment', [
            point,
            board.create('point', [x, 0], { visible: false, fixed: true }),
          ], {
            strokeColor: '#9ca3af',
            strokeWidth: 1,
            dash: 2,
            straightFirst: false,
            straightLast: false,
          })
          board.create('segment', [
            point,
            board.create('point', [0, y], { visible: false, fixed: true }),
          ], {
            strokeColor: '#9ca3af',
            strokeWidth: 1,
            dash: 2,
            straightFirst: false,
            straightLast: false,
          })
        }
      }
    }
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

export default FunctionBoard
