import { useEffect, useRef, useCallback } from 'react'
import JXG from 'jsxgraph'

export interface UseJSXGraphOptions {
  /** 画板 ID（唯一） */
  id: string
  /** 逻辑坐标边界 [x1, y1, x2, y2] */
  bounds: [number, number, number, number]
  /** 是否显示坐标轴 */
  showAxes?: boolean
  /** 是否显示网格 */
  showGrid?: boolean
  /** 是否显示坐标轴数字 */
  showAxisLabels?: boolean
  /** 画板额外属性 */
  boardAttributes?: Record<string, unknown>
}

export interface UseJSXGraphResult {
  containerRef: React.RefObject<HTMLDivElement | null>
  boardRef: React.RefObject<JXG.Board | null>
}

/**
 * JSXGraph Board 生命周期管理 hook
 * 负责初始化 Board、响应式尺寸、销毁清理
 */
export function useJSXGraph(options: UseJSXGraphOptions): UseJSXGraphResult {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const boardRef = useRef<JXG.Board | null>(null)

  const { id, bounds, showAxes = false, showGrid = false, showAxisLabels = true, boardAttributes } = options

  const initBoard = useCallback(() => {
    if (!containerRef.current) return null

    // 清理旧 board
    if (boardRef.current) {
      JXG.JSXGraph.freeBoard(boardRef.current)
      boardRef.current = null
    }

    const board = JXG.JSXGraph.initBoard(id, {
      boundingbox: bounds,
      keepaspectratio: true,
      showCopyright: false,
      showNavigation: false,
      pan: { enabled: false },
      zoom: { enabled: false },
      axis: false,
      grid: showGrid,
      ...boardAttributes,
    })

    // 手动创建坐标轴（可控制是否显示数字）
    if (showAxes) {
      const [x1, y1, x2, y2] = bounds
      // JSXGraph: y1 > top, y2 < bottom (Y轴向下)
      // 数学: Y轴向上，所以从下(y2)画到上(y1)

      // X 轴：从左到右，带箭头
      board.create('axis', [[x1 - 1, 0], [x2 + 1, 0]], {
        strokeColor: '#9ca3af',
        strokeWidth: 1,
        firstArrow: false,
        lastArrow: true,
        ticks: {
          drawLabels: showAxisLabels,
          drawZero: true,
          strokeColor: '#9ca3af',
          minorHeight: 0,
          majorHeight: 5,
          label: { offset: [-5, 10], fontSize: 10, strokeColor: '#6b7280' },
        },
      })

      // Y 轴：从下(y2)到上(y1)，带箭头
      board.create('axis', [[0, y2 - 1], [0, y1 + 1]], {
        strokeColor: '#9ca3af',
        strokeWidth: 1,
        firstArrow: false,
        lastArrow: true,
        ticks: {
          drawLabels: showAxisLabels,
          drawZero: false,
          strokeColor: '#9ca3af',
          minorHeight: 0,
          majorHeight: 5,
          label: { offset: [8, 0], fontSize: 10, strokeColor: '#6b7280' },
        },
      })
    }

    boardRef.current = board
    return board
  }, [id, bounds, showAxes, showGrid, showAxisLabels, boardAttributes])

  useEffect(() => {
    initBoard()
    return () => {
      if (boardRef.current) {
        JXG.JSXGraph.freeBoard(boardRef.current)
        boardRef.current = null
      }
    }
  }, [initBoard])

  return { containerRef, boardRef }
}
