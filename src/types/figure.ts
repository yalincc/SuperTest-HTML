// ===== 图形描述类型 =====

/** 2D 坐标点 */
export type Coord = [number, number]

// ===== 几何图形元素 =====

/** 点 */
export interface GeoPoint {
  kind: 'point'
  id: string
  coord: Coord
  label?: string
  labelOffset?: Coord
  style?: 'default' | 'cross' | 'circle'
  visible?: boolean
  fixed?: boolean
}

/** 线段 */
export interface GeoSegment {
  kind: 'segment'
  from: string
  to: string
  label?: string
  style?: 'solid' | 'dashed' | 'dotted'
  color?: string
}

/** 直线（无限延伸） */
export interface GeoLine {
  kind: 'line'
  from: string
  to: string
  label?: string
  style?: 'solid' | 'dashed'
  color?: string
}

/** 三角形（高级原语） */
export interface GeoTriangle {
  kind: 'triangle'
  id: string
  vertices: [Coord, Coord, Coord]
  labels?: [string, string, string]
  sideLabels?: {
    ab?: string
    bc?: string
    ca?: string
  }
  ticks?: {
    ab?: 1 | 2 | 3
    bc?: 1 | 2 | 3
    ca?: 1 | 2 | 3
  }
  angles?: {
    a?: { label?: string; right?: boolean }
    b?: { label?: string; right?: boolean }
    c?: { label?: string; right?: boolean }
  }
  style?: { fill?: string; fillOpacity?: number }
}

/** 圆 */
export interface GeoCircle {
  kind: 'circle'
  id: string
  center: Coord
  radius: number
  label?: string
  chords?: { from: string; to: string; label?: string }[]
  tangents?: { pointId: string; label?: string }[]
  style?: 'solid' | 'dashed'
}

/** 弧 */
export interface GeoArc {
  kind: 'arc'
  center: Coord
  radius: number
  startAngle: number
  endAngle: number
  label?: string
}

/** 角标注 */
export interface GeoAngle {
  kind: 'angle'
  vertex: string
  p1: string
  p2: string
  label?: string
  right?: boolean
  radius?: number
}

/** 文本标签 */
export interface GeoLabel {
  kind: 'label'
  coord: Coord
  text: string
}

/** 等号标记（独立使用） */
export interface GeoTickMark {
  kind: 'tick'
  segment: { from: string; to: string }
  count: 1 | 2 | 3
}

/** 几何元素联合类型 */
export type GeometryElement =
  | GeoPoint
  | GeoSegment
  | GeoLine
  | GeoTriangle
  | GeoCircle
  | GeoArc
  | GeoAngle
  | GeoLabel
  | GeoTickMark

// ===== 构造指令类型（Construction DSL） =====

/** 指定坐标放置点 */
export interface OpPoint { op: 'point'; id: string; at: Coord }
/** 相对另一点偏移 */
export interface OpPointRelative { op: 'point_relative'; id: string; from: string; dx: number; dy: number }
/** 极坐标定点 */
export interface OpPointByPolar { op: 'point_by_polar'; id: string; from: string; angle: number; distance: number }
/** 两点中点 */
export interface OpMidpoint { op: 'midpoint'; id: string; of: [string, string] }
/** 线段定比分点 */
export interface OpRatioPoint { op: 'ratio_point'; id: string; from: string; to: string; ratio: number }
/** 两线交点 */
export interface OpIntersection { op: 'intersection'; id: string; line1: [string, string]; line2: [string, string] }
/** 直线与圆交点 */
export interface OpLineCircleIntersect { op: 'line_circle_intersect'; id: string; line: [string, string]; circle: string; which: 'first' | 'second' }
/** 两圆交点 */
export interface OpCircleCircleIntersect { op: 'circle_circle_intersect'; id: string; circle1: string; circle2: string; which: 'first' | 'second' }
/** 点到线的垂足 */
export interface OpFoot { op: 'foot'; id: string; point: string; line: [string, string] }
/** 点关于线的对称点 */
export interface OpReflect { op: 'reflect'; id: string; point: string; line: [string, string] }
/** 三角形重心 */
export interface OpCentroid { op: 'centroid'; id: string; triangle: [string, string, string] }
/** 外心 */
export interface OpCircumcenter { op: 'circumcenter'; id: string; triangle: [string, string, string] }
/** 内心 */
export interface OpIncenter { op: 'incenter'; id: string; triangle: [string, string, string] }
/** 垂心 */
export interface OpOrthocenter { op: 'orthocenter'; id: string; triangle: [string, string, string] }

/** 绘制线段 */
export interface OpSegment { op: 'segment'; from: string; to: string; style?: 'solid' | 'dashed' | 'dotted'; color?: string; label?: string }
/** 绘制直线 */
export interface OpLine { op: 'line'; from: string; to: string; style?: 'solid' | 'dashed'; color?: string; label?: string }
/** 绘制射线 */
export interface OpRay { op: 'ray'; from: string; through: string; style?: 'solid' | 'dashed'; color?: string }
/** 绘制三角形 */
export interface OpTriangle {
  op: 'triangle'; points: [string, string, string]; labels?: [string, string, string]
  sideLabels?: { ab?: string; bc?: string; ca?: string }
  ticks?: { ab?: 1 | 2 | 3; bc?: 1 | 2 | 3; ca?: 1 | 2 | 3 }
  angles?: { a?: { label?: string; right?: boolean }; b?: { label?: string; right?: boolean }; c?: { label?: string; right?: boolean } }
  style?: { fill?: string; fillOpacity?: number }
}
/** 绘制圆 */
export interface OpCircle { op: 'circle'; id: string; center: string; radius?: number; through?: string; style?: 'solid' | 'dashed' }
/** 绘制弧 */
export interface OpArc { op: 'arc'; center: string; radius: number; startAngle: number; endAngle: number; label?: string }
/** 角标注 */
export interface OpAngleMark { op: 'angle_mark'; vertex: string; p1: string; p2: string; label?: string; right?: boolean }
/** 等号标记 */
export interface OpTickMark { op: 'tick_mark'; segment: [string, string]; count: 1 | 2 | 3 }
/** 文本标签 */
export interface OpLabel { op: 'label'; at: Coord; text: string }
/** 多边形 */
export interface OpPolygon { op: 'polygon'; points: string[]; fill?: string; fillOpacity?: number }
/** 平行四边形 */
export interface OpParallelogram { op: 'parallelogram'; points: [string, string, string, string] }

/** 过点作平行线（辅助构造） */
export interface OpParallel { op: 'parallel'; id: string; point: string; line: [string, string] }
/** 过点作垂线（辅助构造） */
export interface OpPerpendicular { op: 'perpendicular'; id: string; point: string; line: [string, string] }
/** 角平分线（辅助构造） */
export interface OpAngleBisector { op: 'angle_bisector'; id: string; vertex: string; p1: string; p2: string }
/** 延长线段（辅助构造） */
export interface OpExtend { op: 'extend'; id: string; from: string; through: string; ratio: number }
/** 绕点旋转 */
export interface OpRotate { op: 'rotate'; id: string; point: string; center: string; angle: number }

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
  | OpRotate

/** 构造图（新增 Figure 类型） */
export interface ConstructionFigure {
  type: 'construction'
  padding?: number
  showAxes?: boolean
  construction: ConstructionOp[]
}

// ===== 图形类型 =====

/** 几何图形 */
export interface GeometryFigure {
  type: 'geometry'
  bounds: [number, number, number, number]
  elements: GeometryElement[]
}

/** 函数图像 */
export interface FunctionFigure {
  type: 'function'
  xRange: [number, number]
  yRange: [number, number]
  grid?: boolean
  plots: FunctionPlot[]
  points?: { coord: Coord; label?: string }[]
}

/** 函数曲线 */
export interface FunctionPlot {
  expression: string
  variable?: string
  domain?: [number, number]
  color?: string
  label?: string
  style?: 'solid' | 'dashed'
}

/** 复合图形 */
export interface CompositeFigure {
  type: 'composite'
  geometry?: GeometryFigure
  functions?: FunctionFigure
}

/** 力学图（物理引擎） */
export interface ForceFigure {
  type: 'force'
  bodies: { id: string; type: string; center: [number, number]; width?: number; height?: number; radius?: number; rotation?: number; label?: string; color?: string }[]
  forces: { id: string; type: string; label: string; origin: [number, number]; vector: { x: number; y: number }; color?: string; dashed?: boolean }[]
  scene?: { type: string; params?: Record<string, unknown> }
  showAxes?: boolean
  showGrid?: boolean
  showResultant?: boolean
  annotations?: { type: string; coord: [number, number]; text: string; angle?: number; length?: number }[]
}

/** 电路图（物理引擎） */
export interface CircuitFigure {
  type: 'circuit'
  components: { id: string; type: string; position: [number, number]; direction?: string; label?: string; value?: string; closed?: boolean }[]
  wires: { from: [number, number]; to: [number, number]; style?: string }[]
  junctions?: { position: [number, number] }[]
  title?: string
}

/** 光学图（物理引擎） */
export interface OpticsFigure {
  type: 'optics'
  elements: { type: string; position: [number, number]; angle?: number; length?: number; focalLength?: number; width?: number; height?: number }[]
  rays: { origin: [number, number]; direction: { x: number; y: number }; label?: string; dashed?: boolean; color?: string; arrowAtEnd?: boolean }[]
  showNormal?: boolean
  showAxes?: boolean
  annotations?: { position: [number, number]; text: string }[]
}

/** 图形联合类型 */
export type Figure = GeometryFigure | FunctionFigure | CompositeFigure | ConstructionFigure | ForceFigure | CircuitFigure | OpticsFigure
