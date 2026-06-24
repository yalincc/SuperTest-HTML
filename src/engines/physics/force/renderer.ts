/**
 * 力学图渲染器
 * 使用 JSXGraph 渲染力的示意图
 */
import JXG from 'jsxgraph'
import type { ForceFigure, Body, Force, Coord } from '../types'
import { vectorAngle } from './engine'

// ===== 颜色常量 =====

const COLORS: Record<string, string> = {
  gravity: '#1e40af',
  normal: '#059669',
  friction: '#d97706',
  tension: '#7c3aed',
  applied: '#dc2626',
  buoyancy: '#0891b2',
  pressure: '#be185d',
  elastic: '#6d28d9',
  custom: '#374151',
}

// ===== 渲染函数 =====

/** 渲染受力物体 */
function renderBody(board: JXG.Board, body: Body): void {
  if (body.type === 'point') {
    board.create('point', body.center, {
      name: body.label || '',
      fixed: true,
      size: 4,
      strokeColor: '#1e40af',
      fillColor: '#1e40af',
      label: { offset: [8, -8] },
      showInfobox: false,
    })
    return
  }

  if (body.type === 'block' && body.width && body.height) {
    const [cx, cy] = body.center
    const hw = body.width / 2
    const hh = body.height / 2
    const rotation = (body.rotation || 0) * (Math.PI / 180)

    // 计算旋转后的四个角
    const cos = Math.cos(rotation)
    const sin = Math.sin(rotation)
    const corners = [
      [cx + (-hw) * cos - (-hh) * sin, cy + (-hw) * sin + (-hh) * cos],
      [cx + (hw) * cos - (-hh) * sin, cy + (hw) * sin + (-hh) * cos],
      [cx + (hw) * cos - (hh) * sin, cy + (hw) * sin + (hh) * cos],
      [cx + (-hw) * cos - (hh) * sin, cy + (-hw) * sin + (hh) * cos],
    ]

    // 创建矩形（多边形）
    const polygon = board.create('polygon', corners, {
      fillColor: body.color || '#e5e7eb',
      fillOpacity: 0.5,
      strokeColor: '#374151',
      strokeWidth: 1.5,
      fixed: true,
    })

    // 隐藏顶点的小圆点
    if (polygon.vertices) {
      for (const v of polygon.vertices) {
        v.setAttribute({ visible: false })
      }
    }

    // 物体标签
    if (body.label) {
      board.create('text', [cx, cy, body.label], {
        anchorX: 'middle',
        anchorY: 'middle',
        fontSize: 12,
        strokeColor: '#374151',
        fixed: true,
      })
    }
    return
  }

  if (body.type === 'circle' && body.radius) {
    board.create('circle', [body.center, body.radius], {
      fillColor: body.color || '#e5e7eb',
      fillOpacity: 0.5,
      strokeColor: '#374151',
      strokeWidth: 1.5,
      fixed: true,
    })

    if (body.label) {
      board.create('text', [
        body.center[0],
        body.center[1] - body.radius - 0.3,
        body.label,
      ], {
        anchorX: 'middle',
        anchorY: 'middle',
        fontSize: 12,
        strokeColor: '#374151',
        fixed: true,
      })
    }
  }
}

/** 渲染力的箭头（使用 JSXGraph 内置 arrow） */
function renderForce(board: JXG.Board, force: Force): void {
  const [ox, oy] = force.origin
  const ex = ox + force.vector.x
  const ey = oy + force.vector.y

  const color = force.color || COLORS[force.type] || '#374151'

  // 力的箭头线段（JSXGraph 的 arrow 类型自动带箭头）
  board.create('line', [[ox, oy], [ex, ey]], {
    strokeColor: color,
    strokeWidth: 2.5,
    dash: force.dashed ? 2 : 0,
    fixed: true,
    straightFirst: false,
    straightLast: false,
    lastArrow: true,
    firstArrow: false,
    highlight: false,
    showLabel: false,
    name: '',
    label: { visible: false },
  })

  // 力的标签（偏移到线上方或下方）
  const labelX = ox + force.vector.x * 0.5
  const labelY = oy + force.vector.y * 0.5
  const angle = vectorAngle(force.vector) * (Math.PI / 180)

  // 垂直偏移方向（向左偏移）
  const perpX = -Math.sin(angle) * 0.3
  const perpY = Math.cos(angle) * 0.3

  // 判断偏移方向：让标签始终在线的上方/左侧
  let offsetX: number, offsetY: number
  if (force.vector.x >= 0) {
    // 向右的力：标签在上方
    offsetX = perpX
    offsetY = perpY
  } else {
    // 向左的力：标签在上方
    offsetX = -perpX
    offsetY = -perpY
  }
  // 向上的力：标签在左侧
  if (force.vector.y > 0 && Math.abs(force.vector.x) < 0.01) {
    offsetX = -0.3
    offsetY = 0
  }
  // 向下的力：标签在右侧
  if (force.vector.y < 0 && Math.abs(force.vector.x) < 0.01) {
    offsetX = 0.3
    offsetY = 0
  }

  board.create('text', [labelX + offsetX, labelY + offsetY, force.label], {
    anchorX: 'middle',
    anchorY: 'middle',
    fontSize: 12,
    strokeColor: color,
    fixed: true,
  })
}

/** 渲染合力（虚线） */
function renderResultant(
  board: JXG.Board,
  origin: Coord,
  resultant: { x: number; y: number }
): void {
  const [ox, oy] = origin
  const ex = ox + resultant.x
  const ey = oy + resultant.y

  board.create('line', [[ox, oy], [ex, ey]], {
    strokeColor: '#dc2626',
    strokeWidth: 2,
    dash: 3,
    fixed: true,
    straightFirst: false,
    straightLast: false,
    lastArrow: true,
    firstArrow: false,
    highlight: false,
  })

  // 合力标签
  const angle = Math.atan2(resultant.y, resultant.x)
  const offsetX = -Math.sin(angle) * 0.3
  const offsetY = Math.cos(angle) * 0.3

  board.create('text', [
    ox + resultant.x * 0.5 + offsetX,
    oy + resultant.y * 0.5 + offsetY,
    'F合',
  ], {
    anchorX: 'middle',
    anchorY: 'middle',
    fontSize: 11,
    strokeColor: '#dc2626',
    fixed: true,
  })
}

// ===== 主渲染入口 =====

/**
 * 渲染力学图到 JSXGraph Board
 */
export function renderForceFigure(
  board: JXG.Board,
  figure: ForceFigure
): void {
  // 渲染物体
  for (const body of figure.bodies) {
    renderBody(board, body)
  }

  // 渲染力
  for (const force of figure.forces) {
    renderForce(board, force)
  }

  // 渲染合力
  if (figure.showResultant && figure.forces.length > 0) {
    const origin = figure.bodies[0]?.center || [0, 0]
    const resultant = figure.forces.reduce(
      (sum, f) => ({ x: sum.x + f.vector.x, y: sum.y + f.vector.y }),
      { x: 0, y: 0 }
    )
    if (Math.abs(resultant.x) > 0.01 || Math.abs(resultant.y) > 0.01) {
      renderResultant(board, origin, resultant)
    }
  }
}
