/**
 * 几何构造引擎（Geometry Construction Engine）
 * 纯计算模块，无 DOM 依赖
 * 
 * 输入：构造指令数组 ConstructionOp[]
 * 输出：GeometryFigure（坐标已计算，可直接渲染）
 */
import type {
  Coord,
  ConstructionOp,
  GeometryFigure,
  GeometryElement,
  GeoPoint,
  GeoSegment,
  GeoLine,
  GeoTriangle,
  GeoCircle,
  GeoAngle,
  GeoArc,
  GeoLabel,
  GeoTickMark,
} from '@/types/figure'

// ===== 内部类型 =====

interface Pt { x: number; y: number }

interface CircleData { center: Pt; radius: number }

interface EngineState {
  points: Map<string, Pt>
  circles: Map<string, CircleData>
  elements: GeometryElement[]
}

const DEG = Math.PI / 180

// ===== 基础数学函数 =====

function dist(a: Pt, b: Pt): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function angle(from: Pt, to: Pt): number {
  return Math.atan2(to.y - from.y, to.x - from.x)
}

function midpoint(a: Pt, b: Pt): Pt {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

function ratioPoint(a: Pt, b: Pt, ratio: number): Pt {
  return { x: a.x + ratio * (b.x - a.x), y: a.y + ratio * (b.y - a.y) }
}

function pointByPolar(from: Pt, angleDeg: number, distance: number): Pt {
  const rad = angleDeg * DEG
  return { x: from.x + distance * Math.cos(rad), y: from.y + distance * Math.sin(rad) }
}

/** 两线交点（参数方程法） */
function lineIntersection(a: Pt, b: Pt, c: Pt, d: Pt): Pt | null {
  const dx1 = b.x - a.x, dy1 = b.y - a.y
  const dx2 = d.x - c.x, dy2 = d.y - c.y
  const denom = dx1 * dy2 - dy1 * dx2
  if (Math.abs(denom) < 1e-10) return null
  const t = ((c.x - a.x) * dy2 - (c.y - a.y) * dx2) / denom
  return { x: a.x + t * dx1, y: a.y + t * dy1 }
}

/** 点到线的垂足 */
function footToLine(p: Pt, a: Pt, b: Pt): Pt {
  const dx = b.x - a.x, dy = b.y - a.y
  const lenSq = dx * dx + dy * dy
  if (lenSq < 1e-20) return { ...a }
  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq
  return { x: a.x + t * dx, y: a.y + t * dy }
}

/** 点关于线的对称点 */
function reflectPoint(p: Pt, a: Pt, b: Pt): Pt {
  const foot = footToLine(p, a, b)
  return { x: 2 * foot.x - p.x, y: 2 * foot.y - p.y }
}

/** 绕点旋转 */
function rotatePoint(p: Pt, center: Pt, angleDeg: number): Pt {
  const rad = angleDeg * DEG
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const dx = p.x - center.x
  const dy = p.y - center.y
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  }
}

// ===== 三角形特殊点 =====

function centroid(a: Pt, b: Pt, c: Pt): Pt {
  return { x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 }
}

function circumcenter(a: Pt, b: Pt, c: Pt): Pt | null {
  const mAB = midpoint(a, b)
  const mBC = midpoint(b, c)
  const perpAB = { x: mAB.x - (b.y - a.y), y: mAB.y + (b.x - a.x) }
  const perpBC = { x: mBC.x - (c.y - b.y), y: mBC.y + (c.x - b.x) }
  return lineIntersection(mAB, perpAB, mBC, perpBC)
}

function incenter(a: Pt, b: Pt, c: Pt): Pt {
  const la = dist(b, c), lb = dist(a, c), lc = dist(a, b)
  const s = la + lb + lc
  return {
    x: (la * a.x + lb * b.x + lc * c.x) / s,
    y: (la * a.y + lb * b.y + lc * c.y) / s,
  }
}

function orthocenter(a: Pt, b: Pt, c: Pt): Pt | null {
  const footA = footToLine(a, b, c)
  const footB = footToLine(b, a, c)
  return lineIntersection(a, footA, b, footB)
}

// ===== 圆相关 =====

function lineCircleIntersect(a: Pt, b: Pt, center: Pt, r: number): [Pt, Pt] | null {
  const dx = b.x - a.x, dy = b.y - a.y
  const fx = a.x - center.x, fy = a.y - center.y
  const A = dx * dx + dy * dy
  if (A < 1e-20) return null
  const B = 2 * (fx * dx + fy * dy)
  const C = fx * fx + fy * fy - r * r
  const disc = B * B - 4 * A * C
  if (disc < 0) return null
  const sqrtDisc = Math.sqrt(Math.max(0, disc))
  const t1 = (-B - sqrtDisc) / (2 * A)
  const t2 = (-B + sqrtDisc) / (2 * A)
  return [
    { x: a.x + t1 * dx, y: a.y + t1 * dy },
    { x: a.x + t2 * dx, y: a.y + t2 * dy },
  ]
}

function circleCircleIntersect(c1: Pt, r1: number, c2: Pt, r2: number): [Pt, Pt] | null {
  const d = dist(c1, c2)
  if (d > r1 + r2 + 1e-10 || d < Math.abs(r1 - r2) - 1e-10 || d < 1e-10) return null
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d)
  const hSq = r1 * r1 - a * a
  const h = Math.sqrt(Math.max(0, hSq))
  const px = c1.x + a * (c2.x - c1.x) / d
  const py = c1.y + a * (c2.y - c1.y) / d
  return [
    { x: px + h * (c2.y - c1.y) / d, y: py - h * (c2.x - c1.x) / d },
    { x: px - h * (c2.y - c1.y) / d, y: py + h * (c2.x - c1.x) / d },
  ]
}

// ===== 辅助构造 =====

/** 角平分线上的点（在角平分线方向上距离顶点 unit 长度） */
function angleBisectorPoint(vertex: Pt, p1: Pt, p2: Pt): Pt {
  const a1 = angle(vertex, p1)
  const a2 = angle(vertex, p2)
  // 取较短弧的中分方向
  let mid = (a1 + a2) / 2
  if (Math.abs(a1 - a2) > Math.PI) mid += Math.PI
  return { x: vertex.x + Math.cos(mid), y: vertex.y + Math.sin(mid) }
}

/** 过点作平行线，返回线上另一点（距离 100，仅用于方向） */
function parallelPoint(p: Pt, a: Pt, b: Pt): Pt {
  const dx = b.x - a.x, dy = b.y - a.y
  return { x: p.x + dx, y: p.y + dy }
}

/** 过点作垂线，返回线上另一点 */
function perpendicularPoint(p: Pt, a: Pt, b: Pt): Pt {
  const dx = b.x - a.x, dy = b.y - a.y
  return { x: p.x - dy, y: p.y + dx }
}

// ===== 自动计算 Bounds =====

function computeBounds(
  points: Map<string, Pt>,
  circles: Map<string, CircleData>,
  padding: number
): [number, number, number, number] {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of points.values()) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }
  // 考虑圆的范围
  for (const c of circles.values()) {
    const left = c.center.x - c.radius
    const right = c.center.x + c.radius
    const bottom = c.center.y - c.radius
    const top = c.center.y + c.radius
    if (left < minX) minX = left
    if (bottom < minY) minY = bottom
    if (right > maxX) maxX = right
    if (top > maxY) maxY = top
  }
  if (!isFinite(minX)) return [-5, 5, 5, -5]
  // 保证正方形比例，避免图形被压扁
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const halfW = Math.max((maxX - minX) / 2 + padding, 1)
  const halfH = Math.max((maxY - minY) / 2 + padding, 1)
  const half = Math.max(halfW, halfH)
  // JSXGraph: boundingbox = [left, top, right, bottom]，top > bottom 表示 Y 轴向下
  return [cx - half, cy + half, cx + half, cy - half]
}

// ===== 指令执行器 =====

function getPt(state: EngineState, id: string): Pt | null {
  const p = state.points.get(id)
  if (!p) console.warn(`[geoEngine] 点 "${id}" 不存在，跳过指令`)
  return p || null
}

function getLine(state: EngineState, ids: [string, string]): [Pt, Pt] | null {
  const a = getPt(state, ids[0])
  const b = getPt(state, ids[1])
  if (!a || !b) return null
  return [a, b]
}

function executeOp(state: EngineState, op: ConstructionOp): void {
  try {
    switch (op.op) {
      // ===== 第一类：基础点 =====
      case 'point': {
        state.points.set(op.id, { x: op.at[0], y: op.at[1] })
        // 默认可见点（小圆点）
        state.elements.push({
          kind: 'point', id: op.id, coord: op.at,
          label: op.id, visible: true, fixed: true,
        } as GeoPoint)
        break
      }
      case 'point_relative': {
        const from = getPt(state, op.from)
        if (!from) break
        const pt = { x: from.x + op.dx, y: from.y + op.dy }
        state.points.set(op.id, pt)
        state.elements.push({
          kind: 'point', id: op.id, coord: [pt.x, pt.y],
          label: op.id, visible: true, fixed: true,
        } as GeoPoint)
        break
      }
      case 'point_by_polar': {
        const from = getPt(state, op.from)
        if (!from) break
        const pt = pointByPolar(from, op.angle, op.distance)
        state.points.set(op.id, pt)
        state.elements.push({
          kind: 'point', id: op.id, coord: [pt.x, pt.y],
          label: op.id, visible: true, fixed: true,
        } as GeoPoint)
        break
      }

      // ===== 第二类：约束定点 =====
      case 'midpoint': {
        const [a, b] = getLine(state, op.of) || []
        if (!a || !b) break
        const pt = midpoint(a, b)
        state.points.set(op.id, pt)
        state.elements.push({
          kind: 'point', id: op.id, coord: [pt.x, pt.y],
          label: op.id, visible: true, fixed: true,
        } as GeoPoint)
        break
      }
      case 'ratio_point': {
        const from = getPt(state, op.from)
        const to = getPt(state, op.to)
        if (!from || !to) break
        const pt = ratioPoint(from, to, op.ratio)
        state.points.set(op.id, pt)
        state.elements.push({
          kind: 'point', id: op.id, coord: [pt.x, pt.y],
          label: op.id, visible: true, fixed: true,
        } as GeoPoint)
        break
      }
      case 'intersection': {
        const l1 = getLine(state, op.line1)
        const l2 = getLine(state, op.line2)
        if (!l1 || !l2) break
        const pt = lineIntersection(l1[0], l1[1], l2[0], l2[1])
        if (!pt) { console.warn('[geoEngine] 两线平行，无交点'); break }
        state.points.set(op.id, pt)
        state.elements.push({
          kind: 'point', id: op.id, coord: [pt.x, pt.y],
          label: op.id, visible: true, fixed: true,
        } as GeoPoint)
        break
      }
      case 'line_circle_intersect': {
        const line = getLine(state, op.line)
        const circle = state.circles.get(op.circle)
        if (!line || !circle) break
        const pts = lineCircleIntersect(line[0], line[1], circle.center, circle.radius)
        if (!pts) { console.warn('[geoEngine] 直线与圆无交点'); break }
        const pt = op.which === 'second' ? pts[1] : pts[0]
        state.points.set(op.id, pt)
        state.elements.push({
          kind: 'point', id: op.id, coord: [pt.x, pt.y],
          label: op.id, visible: true, fixed: true,
        } as GeoPoint)
        break
      }
      case 'circle_circle_intersect': {
        const c1 = state.circles.get(op.circle1)
        const c2 = state.circles.get(op.circle2)
        if (!c1 || !c2) break
        const pts = circleCircleIntersect(c1.center, c1.radius, c2.center, c2.radius)
        if (!pts) { console.warn('[geoEngine] 两圆无交点'); break }
        const pt = op.which === 'second' ? pts[1] : pts[0]
        state.points.set(op.id, pt)
        state.elements.push({
          kind: 'point', id: op.id, coord: [pt.x, pt.y],
          label: op.id, visible: true, fixed: true,
        } as GeoPoint)
        break
      }
      case 'foot': {
        const p = getPt(state, op.point)
        const line = getLine(state, op.line)
        if (!p || !line) break
        const pt = footToLine(p, line[0], line[1])
        state.points.set(op.id, pt)
        state.elements.push({
          kind: 'point', id: op.id, coord: [pt.x, pt.y],
          label: op.id, visible: true, fixed: true,
        } as GeoPoint)
        break
      }
      case 'reflect': {
        const p = getPt(state, op.point)
        const line = getLine(state, op.line)
        if (!p || !line) break
        const pt = reflectPoint(p, line[0], line[1])
        state.points.set(op.id, pt)
        state.elements.push({
          kind: 'point', id: op.id, coord: [pt.x, pt.y],
          label: op.id, visible: true, fixed: true,
        } as GeoPoint)
        break
      }

      // ===== 第三类：特殊点 =====
      case 'centroid': {
        const [a, b, c] = [getPt(state, op.triangle[0]), getPt(state, op.triangle[1]), getPt(state, op.triangle[2])]
        if (!a || !b || !c) break
        const pt = centroid(a, b, c)
        state.points.set(op.id, pt)
        state.elements.push({
          kind: 'point', id: op.id, coord: [pt.x, pt.y],
          label: op.id, visible: true, fixed: true,
        } as GeoPoint)
        break
      }
      case 'circumcenter': {
        const [a, b, c] = [getPt(state, op.triangle[0]), getPt(state, op.triangle[1]), getPt(state, op.triangle[2])]
        if (!a || !b || !c) break
        const pt = circumcenter(a, b, c)
        if (!pt) break
        state.points.set(op.id, pt)
        state.elements.push({
          kind: 'point', id: op.id, coord: [pt.x, pt.y],
          label: op.id, visible: true, fixed: true,
        } as GeoPoint)
        break
      }
      case 'incenter': {
        const [a, b, c] = [getPt(state, op.triangle[0]), getPt(state, op.triangle[1]), getPt(state, op.triangle[2])]
        if (!a || !b || !c) break
        const pt = incenter(a, b, c)
        state.points.set(op.id, pt)
        state.elements.push({
          kind: 'point', id: op.id, coord: [pt.x, pt.y],
          label: op.id, visible: true, fixed: true,
        } as GeoPoint)
        break
      }
      case 'orthocenter': {
        const [a, b, c] = [getPt(state, op.triangle[0]), getPt(state, op.triangle[1]), getPt(state, op.triangle[2])]
        if (!a || !b || !c) break
        const pt = orthocenter(a, b, c)
        if (!pt) break
        state.points.set(op.id, pt)
        state.elements.push({
          kind: 'point', id: op.id, coord: [pt.x, pt.y],
          label: op.id, visible: true, fixed: true,
        } as GeoPoint)
        break
      }

      // ===== 第四类：绘制元素 =====
      case 'segment': {
        state.elements.push({
          kind: 'segment', from: op.from, to: op.to,
          style: op.style || 'solid', color: op.color, label: op.label,
        } as GeoSegment)
        break
      }
      case 'line': {
        state.elements.push({
          kind: 'line', from: op.from, to: op.to,
          style: op.style || 'solid', color: op.color, label: op.label,
        } as GeoLine)
        break
      }
      case 'ray': {
        // 射线用 line 实现，straightFirst=false, straightLast=true
        // 这里简化为 line，builder 层面处理
        state.elements.push({
          kind: 'line', from: op.from, to: op.through,
          style: op.style || 'solid', color: op.color,
        } as GeoLine)
        break
      }
      case 'triangle': {
        const pts = op.points.map(id => getPt(state, id)) as (Pt | null)[]
        if (pts.some(p => !p)) break
        const coords = pts.map(p => [p!.x, p!.y] as Coord) as [Coord, Coord, Coord]
        const triId = op.points.join('_')
        // 注册三角形的顶点以便引用
        for (let i = 0; i < 3; i++) {
          const label = op.labels?.[i] || ''
          if (label && label !== op.points[i]) {
            state.points.set(label, pts[i]!)
          }
        }
        state.elements.push({
          kind: 'triangle', id: triId,
          vertices: coords, labels: op.labels,
          sideLabels: op.sideLabels, ticks: op.ticks,
          angles: op.angles, style: op.style,
        } as GeoTriangle)
        break
      }
      case 'circle': {
        const center = getPt(state, op.center)
        if (!center) break
        let r = op.radius
        if (!r && op.through) {
          const through = getPt(state, op.through)
          if (!through) break
          r = dist(center, through)
        }
        if (!r) break
        state.circles.set(op.id, { center, radius: r })
        state.elements.push({
          kind: 'circle', id: op.id,
          center: [center.x, center.y], radius: r,
          label: op.center, style: op.style,
        } as GeoCircle)
        break
      }
      case 'arc': {
        const center = getPt(state, op.center)
        if (!center) break
        state.elements.push({
          kind: 'arc',
          center: [center.x, center.y],
          radius: op.radius,
          startAngle: op.startAngle,
          endAngle: op.endAngle,
          label: op.label,
        } as GeoArc)
        break
      }
      case 'angle_mark': {
        state.elements.push({
          kind: 'angle', vertex: op.vertex,
          p1: op.p1, p2: op.p2,
          label: op.label, right: op.right,
        } as GeoAngle)
        break
      }
      case 'tick_mark': {
        state.elements.push({
          kind: 'tick',
          segment: { from: op.segment[0], to: op.segment[1] },
          count: op.count,
        } as GeoTickMark)
        break
      }
      case 'label': {
        state.elements.push({
          kind: 'label', coord: op.at, text: op.text,
        } as GeoLabel)
        break
      }
      case 'polygon': {
        // 多边形简化为多条线段
        const pts = op.points.map(id => getPt(state, id))
        if (pts.some(p => !p)) break
        for (let i = 0; i < pts.length; i++) {
          const next = (i + 1) % pts.length
          state.elements.push({
            kind: 'segment', from: op.points[i], to: op.points[next],
            style: 'solid',
          } as GeoSegment)
        }
        break
      }
      case 'parallelogram': {
        const pts = op.points.map(id => getPt(state, id))
        if (pts.some(p => !p)) break
        for (let i = 0; i < 4; i++) {
          const next = (i + 1) % 4
          state.elements.push({
            kind: 'segment', from: op.points[i], to: op.points[next],
            style: 'solid',
          } as GeoSegment)
        }
        break
      }

      // ===== 第五类：辅助构造 =====
      case 'parallel': {
        const p = getPt(state, op.point)
        const line = getLine(state, op.line)
        if (!p || !line) break
        const q = parallelPoint(p, line[0], line[1])
        state.points.set(op.id, q)
        state.points.set(op.id + '_base', p)
        break
      }
      case 'perpendicular': {
        const p = getPt(state, op.point)
        const line = getLine(state, op.line)
        if (!p || !line) break
        const q = perpendicularPoint(p, line[0], line[1])
        state.points.set(op.id, q)
        state.points.set(op.id + '_base', p)
        break
      }
      case 'angle_bisector': {
        const vertex = getPt(state, op.vertex)
        const p1 = getPt(state, op.p1)
        const p2 = getPt(state, op.p2)
        if (!vertex || !p1 || !p2) break
        const pt = angleBisectorPoint(vertex, p1, p2)
        state.points.set(op.id, pt)
        break
      }
      case 'extend': {
        const from = getPt(state, op.from)
        const through = getPt(state, op.through)
        if (!from || !through) break
        // 从 through 继续延伸 ratio 倍
        const pt = ratioPoint(from, through, 1 + op.ratio)
        state.points.set(op.id, pt)
        break
      }
      case 'rotate': {
        const p = getPt(state, op.point)
        const center = getPt(state, op.center)
        if (!p || !center) break
        const pt = rotatePoint(p, center, op.angle)
        state.points.set(op.id, pt)
        state.elements.push({
          kind: 'point', id: op.id, coord: [pt.x, pt.y],
          label: op.id, visible: true, fixed: true,
        } as GeoPoint)
        break
      }
    }
  } catch (err) {
    console.warn(`[geoEngine] 执行指令失败:`, op, err)
  }
}

// ===== 公共 API =====

/**
 * 执行构造指令，输出 GeometryFigure
 */
export function executeConstruction(ops: ConstructionOp[], padding = 0.8): GeometryFigure {
  const state: EngineState = {
    points: new Map(),
    circles: new Map(),
    elements: [],
  }

  for (const op of ops) {
    executeOp(state, op)
  }

  const bounds = computeBounds(state.points, state.circles, padding)

  return {
    type: 'geometry',
    bounds,
    elements: state.elements,
  }
}
