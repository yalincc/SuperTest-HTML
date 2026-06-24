# 几何构造引擎（Geometry Construction Engine）开发计划

## 1. 背景与动机

### 1.1 当前状态

SuperTest-HTML 已实现 JSXGraph 渲染管线：

```
JSON figure 数据 → FigureRenderer → GeometryBoard → figureBuilders.ts → JSXGraph Board
```

但现有的 `GeometryFigure` 类型要求**直接提供所有点的精确坐标**（如 `coord: [3.5, 4.33]`）。这意味着生成题目 JSON 的 AI 必须自己做空间几何计算，而 AI 在这方面的计算经常出错。

### 1.2 失败的路径

| 路径 | 问题 |
|------|------|
| AI 直接输出坐标 | AI 算不出精确交点/垂足/角平分线交点 |
| 模板填充 | 模板覆盖有限，AI 填复杂参数也容易错 |

### 1.3 解决方案

引入**几何构造引擎**（geoEngine），将 AI 的工作从"算坐标"降级为"描述构造步骤"：

```
AI 输出构造指令 → geoEngine 精确计算坐标 → 输出 GeometryFigure → JSXGraph 渲染
```

引擎中每个操作都用**确定性数学公式**实现，零误差、零猜测。

---

## 2. 架构设计

### 2.1 数据流

```
题目 JSON 中的 construction 字段
        │
        ▼
┌──────────────────────────┐
│  src/utils/geoEngine.ts  │  ← 纯计算，无 DOM 依赖
│  (GeometryEngine)        │
│                          │
│  输入: ConstructionOp[]  │
│  输出: GeometryFigure    │
└──────────┬───────────────┘
           │
           ▼
   GeometryFigure (现有类型)
           │
           ▼
┌──────────────────────────┐
│  FigureRenderer          │  ← 已有组件，不改动
│  → GeometryBoard         │
│  → figureBuilders.ts     │
└──────────────────────────┘
```

### 2.2 集成点

在 `Figure` 联合类型中新增 `ConstructionFigure`：

```typescript
export type Figure = GeometryFigure | FunctionFigure | CompositeFigure | ConstructionFigure
```

`FigureRenderer` 新增分发：遇到 `type: 'construction'` 时，先调用 geoEngine 计算，再传给 GeometryBoard 渲染。

### 2.3 文件结构

```
src/
├── utils/
│   └── geoEngine.ts          ← 新增：几何构造引擎（核心）
├── types/
│   └── figure.ts             ← 修改：新增 ConstructionFigure + ConstructionOp 类型
├── components/
│   └── figure/
│       ├── FigureRenderer.tsx ← 修改：新增 construction 分发
│       └── ConstructionBoard.tsx ← 新增：构造图渲染组件（薄层）
```

---

## 3. 构造指令集设计（Construction DSL）

### 3.1 设计原则

1. **AI 友好**：指令语义直观，AI 看到题目文字就能写出
2. **数学精确**：每条指令都有唯一确定的数学解
3. **顺序依赖**：后一条指令可引用前面已创建的点/线
4. **覆盖完备**：覆盖初中几何全部场景（7-9 年级）

### 3.2 指令总表

每条指令输出一个或多个**命名点**（注册到 pointRegistry），供后续指令引用。

#### 第一类：基础点（锚点）

| 操作 | 语义 | 参数 |
|------|------|------|
| `point` | 指定坐标放置点 | `id, at: [x, y]` |
| `point_relative` | 相对另一点偏移 | `id, from, dx, dy` |

#### 第二类：由约束定点

| 操作 | 语义 | 参数 |
|------|------|------|
| `point_by_polar` | 极坐标定点 | `id, from, angle(°), distance` |
| `midpoint` | 两点中点 | `id, of: [p1, p2]` |
| `ratio_point` | 线段定比分点 | `id, from, to, ratio` (ratio=0.3 表示距 from 30%) |
| `intersection` | 两线交点 | `id, line1: [a,b], line2: [c,d]` |
| `line_circle_intersect` | 直线与圆的交点 | `id, line: [a,b], circle, which: 'first'/'second'` |
| `circle_circle_intersect` | 两圆交点 | `id, circle1, circle2, which: 'first'/'second'` |
| `foot` | 点到线的垂足 | `id, point, line: [a,b]` |
| `reflect` | 点关于线的对称点 | `id, point, line: [a,b]` |

#### 第三类：特殊点

| 操作 | 语义 | 参数 |
|------|------|------|
| `centroid` | 三角形重心 | `id, triangle: [a,b,c]` |
| `circumcenter` | 外心（外接圆圆心） | `id, triangle: [a,b,c]` |
| `incenter` | 内心（内切圆圆心） | `id, triangle: [a,b,c]` |
| `orthocenter` | 垂心（三条高交点） | `id, triangle: [a,b,c]` |

#### 第四类：绘制元素

| 操作 | 语义 | 参数 |
|------|------|------|
| `segment` | 绘制线段 | `from, to, style?, label?` |
| `line` | 绘制直线（延伸） | `from, to, style?, label?` |
| `ray` | 绘制射线 | `from, through, style?, label?` |
| `triangle` | 绘制三角形 | `points: [a,b,c], labels?, angles?, ticks?, sideLabels?` |
| `circle` | 绘制圆 | `id, center, radius` 或 `id, center, through` |
| `arc` | 绘制圆弧 | `center, radius, startAngle, endAngle` |
| `angle_mark` | 绘制角标注 | `vertex, p1, p2, label?, right?` |
| `tick_mark` | 等号标记 | `segment: [a,b], count` |
| `label` | 文本标签 | `at, text` |
| `polygon` | 多边形 | `points: [...], fill?, stroke?` |
| `parallelogram` | 平行四边形 | `points: [a,b,c,d]`（自动验证平行） |

#### 第五类：辅助构造（生成中间点，不一定绘制）

| 操作 | 语义 | 参数 |
|------|------|------|
| `parallel` | 过点作平行线，返回线上两点 | `id, point, line: [a,b]` |
| `perpendicular` | 过点作垂线，返回线上两点 | `id, point, line: [a,b]` |
| `angle_bisector` | 角平分线，返回线上一点 | `id, vertex, p1, p2` |
| `extend` | 延长线段到指定比例 | `id, from, through, ratio` |

### 3.3 指令示例

**题目**：在△ABC中，AB=5，BC=7，∠B=60°，D是BC中点，过D作DE⊥AB于E。

```json
{
  "construction": [
    { "op": "point", "id": "B", "at": [0, 0] },
    { "op": "point", "id": "C", "at": [7, 0] },
    { "op": "point_by_polar", "id": "A", "from": "B", "angle": 60, "distance": 5 },
    { "op": "triangle", "points": ["A", "B", "C"], "labels": ["A", "B", "C"] },
    { "op": "midpoint", "id": "D", "of": ["B", "C"] },
    { "op": "foot", "id": "E", "point": "D", "line": ["A", "B"] },
    { "op": "segment", "from": "D", "to": "E", "style": "dashed", "label": "DE" },
    { "op": "angle_mark", "vertex": "E", "p1": "D", "p2": "B", "right": true },
    { "op": "tick_mark", "segment": ["B", "D"], "count": 1 },
    { "op": "tick_mark", "segment": ["D", "C"], "count": 1 }
  ]
}
```

**题目**：圆O中，弦AB=6，OC⊥AB于C，OC=4，求圆O的半径。

```json
{
  "construction": [
    { "op": "point", "id": "O", "at": [0, 4] },
    { "op": "point", "id": "A", "at": [-3, 0] },
    { "op": "point", "id": "B", "at": [3, 0] },
    { "op": "midpoint", "id": "C", "of": ["A", "B"] },
    { "op": "circle", "id": "circleO", "center": "O", "through": "A" },
    { "op": "segment", "from": "A", "to": "B", "label": "6" },
    { "op": "segment", "from": "O", "to": "C", "style": "dashed", "label": "4" },
    { "op": "segment", "from": "O", "to": "A", "style": "dashed", "label": "r" },
    { "op": "angle_mark", "vertex": "C", "p1": "O", "p2": "A", "right": true }
  ]
}
```

---

## 4. geoEngine 核心实现

### 4.1 类型定义

```typescript
// src/types/figure.ts 新增

/** 构造指令联合类型 */
export type ConstructionOp =
  | OpPoint | OpPointRelative | OpPointByPolar
  | OpMidpoint | OpRatioPoint
  | OpIntersection | OpLineCircleIntersect | OpCircleCircleIntersect
  | OpFoot | OpReflect
  | OpCentroid | OpCircumcenter | OpIncenter | OpOrthocenter
  | OpSegment | OpLine | OpRay | OpTriangle
  | OpCircle | OpArc | OpAngleMark | OpTickMark
  | OpLabel | OpPolygon | OpParallelogram
  | OpParallel | OpPerpendicular | OpAngleBisector | OpExtend

/** 构造图（新增 Figure 类型） */
export interface ConstructionFigure {
  type: 'construction'
  padding?: number           // 画边距，默认 0.5
  construction: ConstructionOp[]
}
```

### 4.2 引擎核心结构

```typescript
// src/utils/geoEngine.ts

type Point = { x: number; y: number }

interface EngineState {
  points: Map<string, Point>     // 命名点注册表
  circles: Map<string, { center: Point; radius: number }>
  elements: GeometryElement[]    // 输出元素列表
}

export function executeConstruction(ops: ConstructionOp[]): GeometryFigure {
  const state: EngineState = {
    points: new Map(),
    circles: new Map(),
    elements: [],
  }

  for (const op of ops) {
    executeOp(state, op)
  }

  // 自动计算 bounds
  const bounds = computeBounds(state.points, padding)

  return {
    type: 'geometry',
    bounds,
    elements: state.elements,
  }
}
```

### 4.3 关键数学公式

每个操作的实现都是纯数学，不依赖任何外部库：

```typescript
// ===== 基础操作 =====

/** 极坐标定点 */
function pointByPolar(from: Point, angleDeg: number, dist: number): Point {
  const rad = (angleDeg * Math.PI) / 180
  return { x: from.x + dist * Math.cos(rad), y: from.y + dist * Math.sin(rad) }
}

/** 中点 */
function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

/** 定比分点 */
function ratioPoint(a: Point, b: Point, ratio: number): Point {
  return { x: a.x + ratio * (b.x - a.x), y: a.y + ratio * (b.y - a.y) }
}

/** 两线交点（参数方程法） */
function lineIntersection(a: Point, b: Point, c: Point, d: Point): Point | null {
  const dx1 = b.x - a.x, dy1 = b.y - a.y
  const dx2 = d.x - c.x, dy2 = d.y - c.y
  const denom = dx1 * dy2 - dy1 * dx2
  if (Math.abs(denom) < 1e-10) return null  // 平行
  const t = ((c.x - a.x) * dy2 - (c.y - a.y) * dx2) / denom
  return { x: a.x + t * dx1, y: a.y + t * dy1 }
}

/** 点到线的垂足 */
function footToLine(p: Point, a: Point, b: Point): Point {
  const dx = b.x - a.x, dy = b.y - a.y
  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)
  return { x: a.x + t * dx, y: a.y + t * dy }
}

/** 点关于线的对称点 */
function reflectPoint(p: Point, a: Point, b: Point): Point {
  const foot = footToLine(p, a, b)
  return { x: 2 * foot.x - p.x, y: 2 * foot.y - p.y }
}

// ===== 三角形特殊点 =====

/** 重心 */
function centroid(a: Point, b: Point, c: Point): Point {
  return { x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 }
}

/** 外心（两边中垂线交点） */
function circumcenter(a: Point, b: Point, c: Point): Point {
  const mAB = midpoint(a, b)
  const mBC = midpoint(b, c)
  // AB 的中垂线方向：旋转 AB 向量 90°
  const perpAB = { x: -(b.y - a.y), y: b.x - a.x }
  const perpBC = { x: -(c.y - b.y), y: c.x - b.x }
  return lineIntersection(
    mAB, { x: mAB.x + perpAB.x, y: mAB.y + perpAB.y },
    mBC, { x: mBC.x + perpBC.x, y: mBC.y + perpBC.y }
  )!
}

/** 内心（角平分线交点，用面积权重法） */
function incenter(a: Point, b: Point, c: Point): Point {
  const la = dist(b, c), lb = dist(a, c), lc = dist(a, b)
  const s = la + lb + lc
  return {
    x: (la * a.x + lb * b.x + lc * c.x) / s,
    y: (la * a.y + lb * b.y + lc * c.y) / s,
  }
}

/** 垂心（两条高的交点） */
function orthocenter(a: Point, b: Point, c: Point): Point {
  // 过 A 作 BC 的垂线，过 B 作 AC 的垂线，求交点
  const footA = footToLine(a, b, c)
  const footB = footToLine(b, a, c)
  return lineIntersection(a, footA, b, footB)!
}

// ===== 圆相关 =====

/** 直线与圆的交点 */
function lineCircleIntersect(a: Point, b: Point, center: Point, r: number): [Point, Point] {
  const dx = b.x - a.x, dy = b.y - a.y
  const fx = a.x - center.x, fy = a.y - center.y
  const A = dx * dx + dy * dy
  const B = 2 * (fx * dx + fy * dy)
  const C = fx * fx + fy * fy - r * r
  const disc = B * B - 4 * A * C
  const sqrtDisc = Math.sqrt(Math.max(0, disc))
  const t1 = (-B - sqrtDisc) / (2 * A)
  const t2 = (-B + sqrtDisc) / (2 * A)
  return [
    { x: a.x + t1 * dx, y: a.y + t1 * dy },
    { x: a.x + t2 * dx, y: a.y + t2 * dy },
  ]
}

/** 两圆交点 */
function circleCircleIntersect(c1: Point, r1: number, c2: Point, r2: number): [Point, Point] | null {
  const d = dist(c1, c2)
  if (d > r1 + r2 || d < Math.abs(r1 - r2) || d < 1e-10) return null
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d)
  const h = Math.sqrt(Math.max(0, r1 * r1 - a * a))
  const px = c1.x + a * (c2.x - c1.x) / d
  const py = c1.y + a * (c2.y - c1.y) / d
  return [
    { x: px + h * (c2.y - c1.y) / d, y: py - h * (c2.x - c1.x) / d },
    { x: px - h * (c2.y - c1.y) / d, y: py + h * (c2.x - c1.x) / d },
  ]
}
```

### 4.4 Bounds 自动计算

```typescript
function computeBounds(points: Map<string, Point>, padding: number): [number, number, number, number] {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of points.values()) {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  }
  return [minX - padding, maxY + padding, maxX + padding, minY - padding]
}
```

---

## 5. 渲染集成

### 5.1 ConstructionBoard 组件

```typescript
// src/components/figure/ConstructionBoard.tsx

import { useMemo } from 'react'
import type { ConstructionFigure } from '@/types/figure'
import { executeConstruction } from '@/utils/geoEngine'
import GeometryBoard from './GeometryBoard'

interface Props {
  figure: ConstructionFigure
}

function ConstructionBoard({ figure }: Props) {
  // 将 construction 指令计算为 GeometryFigure
  const geometryFigure = useMemo(
    () => executeConstruction(figure.construction, figure.padding),
    [figure.construction, figure.padding]
  )

  return <GeometryBoard figure={geometryFigure} />
}

export default ConstructionBoard
```

### 5.2 FigureRenderer 修改

```typescript
// 新增导入
const ConstructionBoard = lazy(() => import('./ConstructionBoard'))

// 新增分发
{figure.type === 'construction' && <ConstructionBoard figure={figure} />}
```

### 5.3 数据流总结

```
JSON (type: 'construction', construction: [...])
  → FigureRenderer 识别 type
  → lazy 加载 ConstructionBoard
  → useMemo 调用 executeConstruction()
  → 输出 GeometryFigure
  → 传给 GeometryBoard 渲染
  → figureBuilders.ts → JSXGraph
```

---

## 6. 题目 JSON 数据格式

### 6.1 QuestionBase 扩展

```typescript
// src/types/index.ts - 不改动，figure 字段已支持所有 Figure 联合类型
// figure 字段使用 ConstructionFigure 时：
interface QuestionBase {
  // ... 其他字段不变
  figure?: Figure  // 可以是 ConstructionFigure
}
```

### 6.2 完整题目示例

```json
{
  "id": "q001",
  "type": "choice",
  "stem": "在△ABC中，AB=5，BC=7，∠B=60°，D是BC的中点。求AD的长度。",
  "difficulty": 3,
  "topicId": "t01",
  "tags": ["geometry", "triangle"],
  "figure": {
    "type": "construction",
    "padding": 0.8,
    "construction": [
      { "op": "point", "id": "B", "at": [0, 0] },
      { "op": "point", "id": "C", "at": [7, 0] },
      { "op": "point_by_polar", "id": "A", "from": "B", "angle": 60, "distance": 5 },
      { "op": "triangle", "points": ["A", "B", "C"], "labels": ["A", "B", "C"] },
      { "op": "midpoint", "id": "D", "of": ["B", "C"] },
      { "op": "segment", "from": "A", "to": "D", "style": "dashed", "label": "AD" },
      { "op": "tick_mark", "segment": ["B", "D"], "count": 1 },
      { "op": "tick_mark", "segment": ["D", "C"], "count": 1 },
      { "op": "angle_mark", "vertex": "B", "p1": "A", "p2": "C", "label": "60°" }
    ]
  },
  "options": ["$\\sqrt{13}$", "$\\sqrt{19}$", "$\\sqrt{21}$", "$\\sqrt{25}$"],
  "answer": 1,
  "solution": {
    "steps": ["由余弦定理：$AD^2 = AB^2 + BD^2 - 2 \\cdot AB \\cdot BD \\cdot \\cos 60°$"],
    "answer": "$AD = \\sqrt{25 + \\frac{49}{4} - 2 \\times 5 \\times \\frac{7}{2} \\times \\frac{1}{2}} = \\sqrt{19}$"
  }
}
```

---

## 7. 开发任务分解

### Task 1：类型定义（~30 min）

**修改文件**：`src/types/figure.ts`

- 定义所有 `ConstructionOp` 子类型（约 25 种操作的 interface）
- 定义 `ConstructionFigure` 接口
- 将 `ConstructionFigure` 加入 `Figure` 联合类型

### Task 2：geoEngine 核心（~2-3 h）

**新建文件**：`src/utils/geoEngine.ts`

分阶段实现：

1. **基础数学函数**（约 15 个纯函数）
   - `dist`, `angle`, `midpoint`, `ratioPoint`
   - `lineIntersection`, `footToLine`, `reflectPoint`
   - `centroid`, `circumcenter`, `incenter`, `orthocenter`
   - `lineCircleIntersect`, `circleCircleIntersect`
   - `angleBisectorPoint`, `parallelLine`, `perpendicularLine`

2. **指令执行器** `executeOp(state, op)`
   - 根据 `op.op` 分发到对应数学函数
   - 将计算结果注册到 `state.points` 和 `state.circles`
   - 将绘制类操作转为 `GeometryElement` 推入 `state.elements`

3. **主入口** `executeConstruction(ops, padding?)`
   - 遍历执行所有指令
   - 自动计算 bounds
   - 返回 `GeometryFigure`

### Task 3：单元测试（~1 h）

验证数学正确性：

```typescript
// 已知三角形的验证
const ops = [
  { op: 'point', id: 'A', at: [0, 0] },
  { op: 'point', id: 'B', at: [4, 0] },
  { op: 'point_by_polar', id: 'C', from: 'A', angle: 60, distance: 3 },
  { op: 'midpoint', id: 'M', of: ['B', 'C'] },
]
const result = executeConstruction(ops)
// 验证 M 的坐标正确
```

### Task 4：ConstructionBoard + FigureRenderer 集成（~30 min）

**新建文件**：`src/components/figure/ConstructionBoard.tsx`
**修改文件**：`src/components/figure/FigureRenderer.tsx`

### Task 5：端到端验证（~1 h）

1. 在题库 JSON 中添加 2-3 道带 construction 的题目
2. `npm run dev` 验证图形渲染正确
3. `npm run build` 验证构建无误

### Task 6：文档化构造指令集（~30 min）

为 AI 生成题目时提供 prompt 模板：

```
你是一名初中数学出题专家。为以下题目生成几何构造指令。
规则：
- 使用以下操作：point, point_by_polar, midpoint, ...
- 第一条指令必须是 point 操作，作为锚点
- 角度以逆时针方向为正
- 参考示例：[附上 2-3 个示例]

题目：{stem}
```

---

## 8. 初中几何场景覆盖清单

| 场景 | 所需操作 | 年级 |
|------|---------|------|
| 三角形基本 | point, point_by_polar, triangle | 7 |
| 全等三角形 | triangle, tick_mark, angle_mark | 8 |
| 等腰/等边三角形 | point_by_polar (等距), tick_mark | 8 |
| 中位线 | midpoint, segment | 8 |
| 平行四边形 | point, point_relative, polygon | 8 |
| 相似三角形 | ratio_point, triangle | 9 |
| 角平分线 | angle_bisector, intersection | 8 |
| 垂线/高 | foot / perpendicular, angle_mark(right) | 8 |
| 延长线 | extend, intersection | 8 |
| 圆的基本 | point, circle | 9 |
| 弦与垂径 | circle, midpoint, foot, angle_mark(right) | 9 |
| 切线 | circle, foot, angle_mark(right) | 9 |
| 外接圆 | circumcenter, circle | 9 |
| 内切圆 | incenter, circle | 9 |
| 圆与线相交 | line_circle_intersect, segment | 9 |
| 两圆相交/相切 | circle_circle_intersect | 9 |
| 坐标系中的几何 | point (直接坐标), segment | 综合 |

---

## 9. 风险与应对

| 风险 | 应对 |
|------|------|
| AI 生成的构造指令顺序错误（引用不存在的点） | geoEngine 加入 try-catch，跳过无效指令并 console.warn |
| 退化情况（平行线无交点） | 返回 null，跳过该指令 |
| 数值精度问题 | 关键比较使用 1e-10 容差 |
| 某些操作数学上无解（如两圆不相交却求交点） | 返回 null，不绘制 |
| bounds 太紧导致图形贴边 | 默认 padding = 0.5，可配置 |

---

## 10. 代码量估算

| 文件 | 行数 |
|------|------|
| `src/types/figure.ts`（新增类型） | ~80 行 |
| `src/utils/geoEngine.ts` | ~350 行 |
| `src/components/figure/ConstructionBoard.tsx` | ~20 行 |
| `src/components/figure/FigureRenderer.tsx`（修改） | ~5 行 |
| **总计** | **~455 行** |

---

## 11. 与现有系统的兼容性

| 方面 | 影响 |
|------|------|
| 现有 `GeometryFigure` 题目 | 不受影响，向后兼容 |
| 现有 `FunctionFigure` 题目 | 不受影响 |
| JSXGraph 依赖 | 无新增依赖 |
| Bundle 体积 | geoEngine ~5KB gzip（纯数学），可忽略 |
| 构建工具链 | 无变化 |
| Netlify 部署 | 纯前端，无变化 |
