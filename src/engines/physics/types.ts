/**
 * 物理画图引擎类型定义
 * 用于初中物理力学图、电路图、光学图等
 */

// ===== 基础类型 =====

/** 2D 坐标点 */
export type Coord = [number, number]

/** 向量（方向+大小） */
export interface Vector {
  x: number
  y: number
}

// ===== 力学图类型 =====

/** 力的类型 */
export type ForceType = 
  | 'gravity'      // 重力 G
  | 'normal'       // 支持力 N
  | 'friction'     // 摩擦力 f
  | 'tension'      // 拉力 T
  | 'applied'      // 外力 F
  | 'buoyancy'     // 浮力 F_浮
  | 'pressure'     // 压力 F_压
  | 'elastic'      // 弹力 F_弹
  | 'custom'       // 自定义力

/** 力的表示 */
export interface Force {
  id: string
  type: ForceType
  label: string           // 显示标签，如 "F₁"
  origin: Coord           // 力的作用点
  vector: Vector          // 力的方向和大小（像素）
  color?: string          // 力的颜色
  dashed?: boolean        // 是否虚线
}

/** 受力物体 */
export interface Body {
  id: string
  type: 'point' | 'block' | 'circle'
  center: Coord
  width?: number          // block 宽度
  height?: number         // block 高度
  radius?: number         // circle 半径
  rotation?: number       // 旋转角度（度）
  label?: string
  mass?: number           // 质量（可选）
  color?: string
}

/** 力学图 */
export interface ForceFigure {
  type: 'force'
  bodies: Body[]
  forces: Force[]
  showAxes?: boolean
  showGrid?: boolean
  showResultant?: boolean  // 是否显示合力
  annotations?: Annotation[]
}

/** 标注 */
export interface Annotation {
  type: 'angle' | 'dimension' | 'text'
  coord: Coord
  text: string
  angle?: number
  length?: number
}

// ===== 力的合成与分解 =====

/** 力的合成结果 */
export interface ForceResultant {
  forces: string[]         // 参与合成的力 ID
  resultant: Vector        // 合力
  magnitude: number        // 合力大小
  angle: number            // 合力方向（度）
}

// ===== 运动图类型 =====

/** 运动数据点 */
export interface MotionPoint {
  time: number
  value: number           // 位移或速度
}

/** 运动图 */
export interface MotionFigure {
  type: 'motion'
  quantity: 'displacement' | 'velocity' | 'acceleration'
  data: MotionPoint[]
  title?: string
  xLabel?: string
  yLabel?: string
}

// ===== 光学图类型 =====

/** 光线 */
export interface LightRay {
  origin: Coord
  direction: Vector
  label?: string
  dashed?: boolean
  color?: string
}

/** 光学元件 */
export type OpticsElement =
  | { type: 'mirror'; kind: 'plane' | 'concave' | 'convex'; pos: Coord; angle: number; size: number }
  | { type: 'lens'; kind: 'convex' | 'concave'; pos: Coord; focalLength: number }
  | { type: 'surface'; pos: Coord; angle: number }

/** 光学图 */
export interface OpticsFigure {
  type: 'optics'
  elements: OpticsElement[]
  rays: LightRay[]
  showNormal?: boolean     // 是否显示法线
}

// ===== 联合类型 =====

export type PhysicsFigure = ForceFigure | MotionFigure | OpticsFigure
