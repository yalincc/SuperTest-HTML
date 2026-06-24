/**
 * 力学图场景模板
 * 预设常见物理场景的环境元素
 */
import JXG from 'jsxgraph'

// ===== 颜色常量 =====

const COLOR_SCENE = '#374151'
const COLOR_GROUND = '#6b7280'

// ===== 场景类型定义 =====

export interface HorizontalSurfaceParams {
  width?: number
  friction?: boolean
}

export interface HangingParams {
  ropeLength?: number
  ceilingWidth?: number
}

export interface InclineParams {
  angle?: number
  width?: number
}

export type SceneParams = HorizontalSurfaceParams | HangingParams | InclineParams

// ===== 场景渲染函数 =====

/**
 * 水平地面
 * 从 (x, y) 开始向右延伸
 */
export function renderHorizontalSurface(
  board: JXG.Board,
  x: number,
  y: number,
  params: HorizontalSurfaceParams = {}
): void {
  const width = params.width || 8

  // 地面线
  board.create('segment', [[x, y], [x + width, y]], {
    strokeColor: COLOR_SCENE,
    strokeWidth: 2,
    fixed: true,
  })

  // 斜线填充（地面以下）
  const hatchCount = Math.floor(width / 0.6)
  for (let i = 0; i <= hatchCount; i++) {
    const hx = x + (i * width) / hatchCount
    board.create('segment', [
      [hx, y],
      [hx - 0.4, y - 0.4],
    ], {
      strokeColor: COLOR_GROUND,
      strokeWidth: 1,
      fixed: true,
    })
  }
}

/**
 * 天花板 + 悬挂绳
 */
export function renderHanging(
  board: JXG.Board,
  ceilingX: number,
  ceilingY: number,
  ropeEndX: number,
  ropeEndY: number,
  params: HangingParams = {}
): void {
  const ceilingWidth = params.ceilingWidth || 6

  // 天花板（粗线 + 斜线填充）
  board.create('segment', [
    [ceilingX - ceilingWidth / 2, ceilingY],
    [ceilingX + ceilingWidth / 2, ceilingY],
  ], {
    strokeColor: COLOR_SCENE,
    strokeWidth: 3,
    fixed: true,
  })

  // 天花板斜线填充（天花板以上）
  const hatchCount = Math.floor(ceilingWidth / 0.6)
  for (let i = 0; i <= hatchCount; i++) {
    const hx = ceilingX - ceilingWidth / 2 + (i * ceilingWidth) / hatchCount
    board.create('segment', [
      [hx, ceilingY],
      [hx + 0.4, ceilingY + 0.4],
    ], {
      strokeColor: COLOR_GROUND,
      strokeWidth: 1,
      fixed: true,
    })
  }

  // 绳子
  board.create('segment', [
    [ceilingX, ceilingY],
    [ropeEndX, ropeEndY],
  ], {
    strokeColor: COLOR_SCENE,
    strokeWidth: 1.5,
    fixed: true,
  })
}

/**
 * 斜面
 * 从 (x, y) 开始的斜面，只画底边和斜边
 */
export function renderIncline(
  board: JXG.Board,
  x: number,
  y: number,
  params: InclineParams = {}
): void {
  const angle = params.angle || 30
  const width = params.width || 6
  const rad = (angle * Math.PI) / 180

  // 斜面顶点
  const baseEndX = x + width
  const slopeEndX = x + width * Math.cos(rad)
  const slopeEndY = y + width * Math.sin(rad)

  // 斜面填充（用 polygon 但不画边）
  board.create('polygon', [
    [x, y],
    [baseEndX, y],
    [slopeEndX, slopeEndY],
  ], {
    fillColor: '#d1d5db',
    fillOpacity: 0.4,
    strokeColor: 'none',
    fixed: true,
    vertices: { visible: false },
    borders: { visible: false },
  })

  // 斜面底边（水平）
  board.create('segment', [[x, y], [baseEndX, y]], {
    strokeColor: COLOR_SCENE,
    strokeWidth: 2,
    fixed: true,
  })

  // 斜面斜边
  board.create('segment', [[x, y], [slopeEndX, slopeEndY]], {
    strokeColor: COLOR_SCENE,
    strokeWidth: 2,
    fixed: true,
  })

  // 斜面填充斜线
  const hatchCount = Math.floor(width / 0.8)
  for (let i = 0; i <= hatchCount; i++) {
    const t = i / hatchCount
    const hx = x + t * width * Math.cos(rad)
    const hy = y + t * width * Math.sin(rad)
    board.create('segment', [
      [hx, hy],
      [hx - 0.3, hy - 0.3],
    ], {
      strokeColor: COLOR_GROUND,
      strokeWidth: 1,
      fixed: true,
    })
  }

  // 角度标注
  if (angle) {
    const angleRad = (angle * Math.PI) / 180
    const arcRadius = 0.8

    const pCenter = board.create('point', [x, y], { visible: false, fixed: true })
    const pStart = board.create('point', [x + arcRadius, y], { visible: false, fixed: true })
    const pEnd = board.create('point', [
      x + arcRadius * Math.cos(angleRad),
      y + arcRadius * Math.sin(angleRad),
    ], { visible: false, fixed: true })

    board.create('arc', [pCenter, pStart, pEnd], {
      strokeColor: COLOR_SCENE,
      strokeWidth: 1,
      fillColor: 'none',
      fixed: true,
    })

    board.create('text', [
      x + arcRadius * 1.3 * Math.cos(angleRad / 2),
      y + arcRadius * 1.3 * Math.sin(angleRad / 2),
      `${angle}°`,
    ], {
      anchorX: 'middle',
      anchorY: 'middle',
      fontSize: 10,
      strokeColor: COLOR_SCENE,
      fixed: true,
    })
  }
}

/**
 * 电梯框
 */
export function renderElevator(
  board: JXG.Board,
  x: number,
  y: number,
  width: number = 3,
  height: number = 4,
): void {
  // 电梯框（矩形）
  board.create('segment', [[x, y], [x + width, y]], {
    strokeColor: COLOR_SCENE,
    strokeWidth: 2,
    fixed: true,
  })
  board.create('segment', [[x + width, y], [x + width, y + height]], {
    strokeColor: COLOR_SCENE,
    strokeWidth: 2,
    fixed: true,
  })
  board.create('segment', [[x + width, y + height], [x, y + height]], {
    strokeColor: COLOR_SCENE,
    strokeWidth: 2,
    fixed: true,
  })
  board.create('segment', [[x, y + height], [x, y]], {
    strokeColor: COLOR_SCENE,
    strokeWidth: 2,
    fixed: true,
  })

  // 顶部绳子
  board.create('segment', [
    [x + width / 2, y + height],
    [x + width / 2, y + height + 1.5],
  ], {
    strokeColor: COLOR_SCENE,
    strokeWidth: 1.5,
    fixed: true,
  })
}

/**
 * 场景分发入口
 */
export interface Scene {
  type: string
  params?: Record<string, unknown>
}

/**
 * 渲染场景
 */
export function renderScene(
  board: JXG.Board,
  scene: Scene,
  bodyCenter: [number, number],
  bodyHeight?: number
): void {
  const [bx, by] = bodyCenter
  const halfH = (bodyHeight || 1) / 2

  switch (scene.type) {
    case 'horizontal_surface':
      // 地面贴着物体底部
      renderHorizontalSurface(board, bx - 4, by - halfH, scene.params as HorizontalSurfaceParams)
      break
    case 'hanging':
      renderHanging(board, bx, by + 4, bx, by, scene.params as HangingParams)
      break
    case 'incline': {
      // 斜面：让斜面顶部贴着物体底部
      const angle = (scene.params as InclineParams)?.angle || 30
      const rad = (angle * Math.PI) / 180
      const baseX = bx - 3
      // 斜面底部 y 坐标：物体底部 - 水平距离 * tan(角度)
      const baseY = (by - halfH) - 3 * Math.tan(rad)
      renderIncline(board, baseX, baseY, scene.params as InclineParams)
      break
    }
    case 'elevator':
      renderElevator(board, bx - 1.5, by - 2)
      break
  }
}
