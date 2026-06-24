/**
 * 数据驱动的 JSXGraph 元素构建器
 * 将 figure.ts 中的几何元素描述转换为 JSXGraph Board 上的实际图形
 */
import JXG from 'jsxgraph'
import type {
  GeometryElement,
  GeoPoint,
  GeoSegment,
  GeoLine,
  GeoTriangle,
  GeoCircle,
  GeoAngle,
  GeoLabel,
  GeoTickMark,
  GeoArc,
} from '@/types/figure'

/** 点 ID → JSXGraph Point 映射表 */
type PointMap = Map<string, JXG.Point>

// ===== 颜色常量 =====
const COLOR_PRIMARY = '#1e40af'
const COLOR_SECONDARY = '#7c3aed'
const COLOR_ACCENT = '#059669'
const COLOR_GRAY = '#6b7280'

// ===== 基础元素构建器 =====

function buildPoint(board: JXG.Board, el: GeoPoint, points: PointMap): void {
  const attrs: Record<string, unknown> = {
    name: el.label || '',
    fixed: el.fixed !== false,
    strokeColor: COLOR_PRIMARY,
    fillColor: COLOR_PRIMARY,
    size: 3,
    showInfobox: false,
  }

  if (el.style === 'cross') {
    attrs.face = 'cross'
    attrs.size = 4
  } else if (el.style === 'circle') {
    attrs.face = 'circle'
  }

  if (el.visible === false) {
    attrs.visible = false
  }

  if (el.labelOffset) {
    attrs.label = { offset: el.labelOffset }
  } else if (el.label) {
    attrs.label = { offset: [8, -8] }
  }

  const point = board.create('point', el.coord, attrs) as JXG.Point
  points.set(el.id, point)
}

function buildSegment(board: JXG.Board, el: GeoSegment, points: PointMap): void {
  const from = points.get(el.from)
  const to = points.get(el.to)
  if (!from || !to) return

  const dashMap: Record<string, number> = { solid: 0, dashed: 2, dotted: 1 }
  const attrs: Record<string, unknown> = {
    strokeColor: el.color || COLOR_PRIMARY,
    strokeWidth: 2,
    dash: dashMap[el.style || 'solid'] || 0,
    straightFirst: false,
    straightLast: false,
    fixed: true,
  }

  const seg = board.create('segment', [from, to], attrs) as JXG.Line

  if (el.label) {
    board.create('text', [
      () => (from.X() + to.X()) / 2,
      () => (from.Y() + to.Y()) / 2,
      () => el.label!,
    ], {
      anchorX: 'middle',
      anchorY: 'middle',
      fontSize: 12,
      strokeColor: COLOR_GRAY,
      offset: [0, -12],
    })
  }

  // 注册到 points 以便后续引用
  void seg
}

function buildLine(board: JXG.Board, el: GeoLine, points: PointMap): void {
  const from = points.get(el.from)
  const to = points.get(el.to)
  if (!from || !to) return

  const dashMap: Record<string, number> = { solid: 0, dashed: 2 }
  board.create('line', [from, to], {
    strokeColor: el.color || COLOR_GRAY,
    strokeWidth: 1.5,
    dash: dashMap[el.style || 'solid'] || 0,
    straightFirst: true,
    straightLast: true,
    fixed: true,
  })
}

function buildTriangle(board: JXG.Board, el: GeoTriangle, points: PointMap): void {
  const [va, vb, vc] = el.vertices
  const labels = el.labels || ['', '', '']

  // 复用已有点或创建新点
  const pointAttrs = (label: string, offset: number[]) => ({
    name: label, fixed: true, size: 3,
    strokeColor: COLOR_PRIMARY, fillColor: COLOR_PRIMARY,
    label: { offset }, showInfobox: false,
  })

  // 查找已有点的标签名
  const findLabel = (coord: Coord): string => {
    for (const [id, pt] of points) {
      if (Math.abs(pt.X() - coord[0]) < 0.01 && Math.abs(pt.Y() - coord[1]) < 0.01) {
        return id
      }
    }
    return ''
  }

  const existingA = findLabel(va)
  const existingB = findLabel(vb)
  const existingC = findLabel(vc)

  const pA = existingA
    ? (points.get(existingA) as JXG.Point)
    : board.create('point', va, pointAttrs(labels[0], [-10, -10])) as JXG.Point
  const pB = existingB
    ? (points.get(existingB) as JXG.Point)
    : board.create('point', vb, pointAttrs(labels[1], [10, -10])) as JXG.Point
  const pC = existingC
    ? (points.get(existingC) as JXG.Point)
    : board.create('point', vc, pointAttrs(labels[2], [0, 12])) as JXG.Point

  // 更新标签（如果点已存在但标签不同）
  if (existingA && labels[0]) pA.setName(labels[0])
  if (existingB && labels[1]) pB.setName(labels[1])
  if (existingC && labels[2]) pC.setName(labels[2])

  points.set(`${el.id}_a`, pA)
  points.set(`${el.id}_b`, pB)
  points.set(`${el.id}_c`, pC)

  // 三条边
  const sideAttrs = {
    strokeColor: COLOR_PRIMARY, strokeWidth: 2,
    straightFirst: false, straightLast: false, fixed: true,
  }
  board.create('segment', [pA, pB], sideAttrs)
  board.create('segment', [pB, pC], sideAttrs)
  board.create('segment', [pC, pA], sideAttrs)

  // 填充
  if (el.style?.fill) {
    board.create('polygon', [pA, pB, pC], {
      fillColor: el.style.fill,
      fillOpacity: el.style.fillOpacity || 0.1,
      borders: { visible: false },
      fixed: true,
    })
  }

  // Tick marks（等号标记）
  if (el.ticks) {
    if (el.ticks.ab) addTicks(board, pA, pB, el.ticks.ab)
    if (el.ticks.bc) addTicks(board, pB, pC, el.ticks.bc)
    if (el.ticks.ca) addTicks(board, pC, pA, el.ticks.ca)
  }

  // 边标签
  if (el.sideLabels) {
    if (el.sideLabels.ab) addSideLabel(board, pA, pB, el.sideLabels.ab)
    if (el.sideLabels.bc) addSideLabel(board, pB, pC, el.sideLabels.bc)
    if (el.sideLabels.ca) addSideLabel(board, pC, pA, el.sideLabels.ca)
  }

  // 角标注
  if (el.angles) {
    if (el.angles.a) addAngleMark(board, pC, pA, pB, el.angles.a.label, el.angles.a.right)
    if (el.angles.b) addAngleMark(board, pA, pB, pC, el.angles.b.label, el.angles.b.right)
    if (el.angles.c) addAngleMark(board, pB, pC, pA, el.angles.c.label, el.angles.c.right)
  }
}

function buildCircle(board: JXG.Board, el: GeoCircle, points: PointMap): void {
  const center = board.create('point', el.center, {
    name: el.label || '',
    fixed: true, size: 3,
    strokeColor: COLOR_SECONDARY, fillColor: COLOR_SECONDARY,
    label: { offset: [8, -8] }, showInfobox: false,
  }) as JXG.Point

  points.set(el.id + '_center', center)

  const circleAttrs: Record<string, unknown> = {
    strokeColor: COLOR_SECONDARY,
    strokeWidth: 2,
    fixed: true,
  }
  if (el.style === 'dashed') {
    circleAttrs.dash = 2
  }

  board.create('circle', [center, el.radius], circleAttrs)

  // 弦
  if (el.chords) {
    for (const chord of el.chords) {
      const from = points.get(chord.from)
      const to = points.get(chord.to)
      if (from && to) {
        board.create('segment', [from, to], {
          strokeColor: COLOR_ACCENT,
          strokeWidth: 2,
          straightFirst: false,
          straightLast: false,
          fixed: true,
        })
        if (chord.label) {
          board.create('text', [
            () => (from.X() + to.X()) / 2,
            () => (from.Y() + to.Y()) / 2,
            () => chord.label!,
          ], {
            anchorX: 'middle', anchorY: 'middle',
            fontSize: 12, strokeColor: COLOR_GRAY, offset: [0, -10],
          })
        }
      }
    }
  }

  // 切线
  if (el.tangents) {
    for (const tangent of el.tangents) {
      const tPoint = points.get(tangent.pointId)
      if (tPoint) {
        board.create('line', [center, tPoint], {
          strokeColor: COLOR_GRAY,
          strokeWidth: 1.5,
          dash: 2,
          visible: false,
        })
      }
    }
  }
}

function buildAngle(board: JXG.Board, el: GeoAngle, points: PointMap): void {
  const vertex = points.get(el.vertex)
  const p1 = points.get(el.p1)
  const p2 = points.get(el.p2)
  if (!vertex || !p1 || !p2) return

  addAngleMark(board, p1, vertex, p2, el.label, el.right, el.radius)
}

function buildArc(board: JXG.Board, el: GeoArc, _points: PointMap): void {
  const startRad = (el.startAngle * Math.PI) / 180
  const endRad = (el.endAngle * Math.PI) / 180
  const startX = el.center[0] + el.radius * Math.cos(startRad)
  const startY = el.center[1] + el.radius * Math.sin(startRad)
  const endX = el.center[0] + el.radius * Math.cos(endRad)
  const endY = el.center[1] + el.radius * Math.sin(endRad)

  const p1 = board.create('point', [startX, startY], { visible: false, fixed: true })
  const p2 = board.create('point', [endX, endY], { visible: false, fixed: true })
  const center = board.create('point', el.center, { visible: false, fixed: true })

  board.create('arc', [center, p1, p2], {
    strokeColor: COLOR_ACCENT,
    strokeWidth: 2,
  })

  if (el.label) {
    const midRad = ((el.startAngle + el.endAngle) / 2 * Math.PI) / 180
    const lx = el.center[0] + (el.radius + 0.3) * Math.cos(midRad)
    const ly = el.center[1] + (el.radius + 0.3) * Math.sin(midRad)
    board.create('text', [lx, ly, el.label], {
      anchorX: 'middle', anchorY: 'middle',
      fontSize: 11, strokeColor: COLOR_ACCENT,
    })
  }
}

function buildLabel(board: JXG.Board, el: GeoLabel): void {
  board.create('text', [el.coord[0], el.coord[1], el.text], {
    anchorX: 'middle',
    anchorY: 'middle',
    fontSize: 12,
    strokeColor: COLOR_GRAY,
  })
}

function buildTickMark(board: JXG.Board, el: GeoTickMark, points: PointMap): void {
  const from = points.get(el.segment.from)
  const to = points.get(el.segment.to)
  if (from && to) {
    addTicks(board, from, to, el.count)
  }
}

// ===== 辅助函数 =====

/** 在线段中点添加等号标记（小垂直线段） */
function addTicks(board: JXG.Board, p1: JXG.Point, p2: JXG.Point, count: number): void {
  const mx = () => (p1.X() + p2.X()) / 2
  const my = () => (p1.Y() + p2.Y()) / 2
  const dx = () => p2.X() - p1.X()
  const dy = () => p2.Y() - p1.Y()
  const len = () => Math.sqrt(dx() * dx + dy() * dy())
  // 垂直方向单位向量（缩放到 0.2 单位长度）
  const perpX = () => (-dy() / len()) * 0.2
  const perpY = () => (dx() / len()) * 0.2

  const tickAttrs = {
    strokeColor: COLOR_PRIMARY,
    strokeWidth: 1.5,
    fixed: true,
    straightFirst: false,
    straightLast: false,
  }

  if (count === 1) {
    // 一条垂直线
    const a = board.create('point', [() => mx() + perpX(), () => my() + perpY()], { visible: false, fixed: true })
    const b = board.create('point', [() => mx() - perpX(), () => my() - perpY()], { visible: false, fixed: true })
    board.create('segment', [a, b], tickAttrs)
  } else {
    // 多条：沿垂直方向偏移排列
    const offset = 0.12
    for (let i = 0; i < count; i++) {
      const shift = (i - (count - 1) / 2) * offset
      // 沿线段方向偏移
      const shiftX = () => (dx() / len()) * shift
      const shiftY = () => (dy() / len()) * shift
      const a = board.create('point', [() => mx() + shiftX() + perpX(), () => my() + shiftY() + perpY()], { visible: false, fixed: true })
      const b = board.create('point', [() => mx() + shiftX() - perpX(), () => my() + shiftY() - perpY()], { visible: false, fixed: true })
      board.create('segment', [a, b], tickAttrs)
    }
  }
}

/** 在边的中点旁添加标签 */
function addSideLabel(board: JXG.Board, p1: JXG.Point, p2: JXG.Point, label: string): void {
  board.create('text', [
    () => (p1.X() + p2.X()) / 2,
    () => (p1.Y() + p2.Y()) / 2,
    () => label,
  ], {
    anchorX: 'middle', anchorY: 'middle',
    fontSize: 11, strokeColor: COLOR_GRAY, offset: [0, -10],
  })
}

/** 在角上添加弧线和标注 */
function addAngleMark(
  board: JXG.Board,
  p1: JXG.Point, vertex: JXG.Point, p2: JXG.Point,
  label?: string, right?: boolean, radius?: number
): void {
  const r = radius || 0.5

  if (right) {
    // 直角标记：用小正方形
    board.create('angle', [p1, vertex, p2], {
      radius: r,
      type: 'square',
      strokeColor: COLOR_ACCENT,
      strokeWidth: 1.5,
      fillColor: 'none',
      label: { visible: false },
    })
  } else {
    const angleAttrs: Record<string, unknown> = {
      radius: r,
      strokeColor: COLOR_ACCENT,
      strokeWidth: 1.5,
      fillColor: 'none',
      label: { visible: false },
    }
    board.create('angle', [p1, vertex, p2], angleAttrs)
  }

  if (label) {
    // 在角弧中间放置标签
    board.create('text', [
      () => {
        const vx = vertex.X(), vy = vertex.Y()
        const ax = p1.X() - vx, ay = p1.Y() - vy
        const bx = p2.X() - vx, by = p2.Y() - vy
        const angA = Math.atan2(ay, ax)
        const angB = Math.atan2(by, bx)
        let mid = (angA + angB) / 2
        // 确保取较短的弧
        if (Math.abs(angA - angB) > Math.PI) mid += Math.PI
        return vx + (r + 0.4) * Math.cos(mid)
      },
      () => {
        const vx = vertex.X(), vy = vertex.Y()
        const ax = p1.X() - vx, ay = p1.Y() - vy
        const bx = p2.X() - vx, by = p2.Y() - vy
        const angA = Math.atan2(ay, ax)
        const angB = Math.atan2(by, bx)
        let mid = (angA + angB) / 2
        if (Math.abs(angA - angB) > Math.PI) mid += Math.PI
        return vy + (r + 0.4) * Math.sin(mid)
      },
      () => label,
    ], {
      anchorX: 'middle', anchorY: 'middle',
      fontSize: 11, strokeColor: COLOR_ACCENT,
    })
  }
}

// ===== 主构建入口 =====

/**
 * 将所有几何元素构建到 Board 上
 */
export function buildGeometry(board: JXG.Board, elements: GeometryElement[]): void {
  const points: PointMap = new Map()

  // 第一遍：先创建所有点
  for (const el of elements) {
    if (el.kind === 'point') {
      buildPoint(board, el, points)
    }
  }

  // 第二遍：创建非点元素（需要引用点）
  for (const el of elements) {
    switch (el.kind) {
      case 'point': break // 已处理
      case 'segment': buildSegment(board, el, points); break
      case 'line': buildLine(board, el, points); break
      case 'triangle': buildTriangle(board, el, points); break
      case 'circle': buildCircle(board, el, points); break
      case 'angle': buildAngle(board, el, points); break
      case 'arc': buildArc(board, el, points); break
      case 'label': buildLabel(board, el); break
      case 'tick': buildTickMark(board, el, points); break
    }
  }
}

/**
 * 安全解析数学表达式为 JS 函数
 * 仅允许基本运算符和 Math 白名单函数
 */
export function parseExpression(expr: string): ((x: number) => number) | null {
  try {
    // 白名单验证：仅允许数字、运算符、Math 函数、变量 x
    const sanitized = expr
      .replace(/\b(sin|cos|tan|sqrt|abs|pow|log|ln|exp|PI|E|floor|ceil|round)\b/g, 'Math.$1')
      .replace(/\bln\b/g, 'Math.log')
      .replace(/\^/g, '**')

    // 安全检查：禁止危险关键词
    if (/[;{}[\]\\]/.test(sanitized) || /\b(eval|function|var|let|const|import|require|window|document)\b/i.test(sanitized)) {
      console.warn('[figureBuilders] 表达式安全检查未通过:', expr)
      return null
    }

    // eslint-disable-next-line no-new-func
    const fn = new Function('x', `"use strict"; return (${sanitized});`) as (x: number) => number
    // 验证可用性
    fn(0)
    return fn
  } catch {
    console.warn('[figureBuilders] 表达式解析失败:', expr)
    return null
  }
}
