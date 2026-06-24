import { useEffect, useId } from 'react'
import JXG from 'jsxgraph'
import type { ForceFigure } from '../../engines/physics/types'
import { renderForceFigure } from '../../engines/physics/force/renderer'
import { renderScene, type Scene } from '../../engines/physics/force/scenes'

interface Props {
  figure: ForceFigure
  scene?: Scene
}

/**
 * 力学图渲染组件
 */
function ForceBoard({ figure, scene }: Props) {
  const uid = useId().replace(/:/g, '_')
  const boardId = `force-board-${uid}`

  useEffect(() => {
    const container = document.getElementById(boardId)
    if (!container) return

    // 计算边界
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const body of figure.bodies) {
      const [x, y] = body.center
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
    for (const force of figure.forces) {
      const [ox, oy] = force.origin
      minX = Math.min(minX, ox, ox + force.vector.x)
      minY = Math.min(minY, oy, oy + force.vector.y)
      maxX = Math.max(maxX, ox, ox + force.vector.x)
      maxY = Math.max(maxY, oy, oy + force.vector.y)
    }

    // 场景额外空间
    const sceneMargin = scene ? 3 : 0
    if (scene) {
      minY = minY - sceneMargin
      maxY = maxY + sceneMargin
      minX = minX - sceneMargin
      maxX = maxX + sceneMargin
    }

    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    const half = Math.max(Math.max(maxX - minX, maxY - minY) / 2 + 2, 4)

    // 创建画板
    const board = JXG.JSXGraph.initBoard(boardId, {
      boundingbox: [cx - half, cy + half, cx + half, cy - half],
      keepaspectratio: true,
      showCopyright: false,
      showNavigation: false,
      pan: { enabled: false },
      zoom: { enabled: false },
      axis: false,
      grid: false,
    })

    // 渲染场景（先画背景）
    if (scene && figure.bodies.length > 0) {
      const body = figure.bodies[0]
      renderScene(board, scene, body.center, body.height)
    }

    // 渲染力学图
    renderForceFigure(board, figure)

    return () => {
      JXG.JSXGraph.freeBoard(board)
    }
  }, [figure, scene, boardId])

  return (
    <div className="flex justify-center my-3">
      <div
        id={boardId}
        className="jxgbox w-full max-w-[400px] aspect-square"
      />
    </div>
  )
}

export default ForceBoard
