/**
 * 光学图类型定义
 * 用于初中物理光学图（反射、折射、透镜）
 */

// ===== 基础类型 =====

/** 2D 坐标点 */
export type Coord = [number, number]

/** 向量 */
export interface Vector {
  x: number
  y: number
}

// ===== 光线 =====

/** 光线 */
export interface LightRay {
  origin: Coord
  direction: Vector
  label?: string
  dashed?: boolean
  color?: string
  arrowAtEnd?: boolean
}

// ===== 光学元件 =====

/** 平面镜 */
export interface PlaneMirror {
  type: 'plane_mirror'
  position: Coord
  angle: number          // 镜面角度（度）
  length: number         // 镜面长度
}

/** 凸透镜 */
export interface ConvexLens {
  type: 'convex_lens'
  position: Coord
  focalLength: number    // 焦距
  height?: number        // 透镜高度
}

/** 凹透镜 */
export interface ConcaveLens {
  type: 'concave_lens'
  position: Coord
  focalLength: number
  height?: number
}

/** 水面（折射界面） */
export interface WaterSurface {
  type: 'water_surface'
  position: Coord        // 水面中心点
  width: number          // 水面宽度
  waterLevel?: number    // 水面 y 坐标
}

/** 介质界面 */
export interface MediumInterface {
  type: 'medium_interface'
  position: Coord
  angle: number          // 界面角度
  width: number
  medium1?: string       // 介质1名称
  medium2?: string       // 介质2名称
}

/** 光学元件联合类型 */
export type OpticsElement = PlaneMirror | ConvexLens | ConcaveLens | WaterSurface | MediumInterface

// ===== 光学图 =====

/** 光学图 */
export interface OpticsFigure {
  type: 'optics'
  elements: OpticsElement[]
  rays: LightRay[]
  showNormal?: boolean     // 是否显示法线
  showAxes?: boolean       // 是否显示坐标轴
  annotations?: { position: Coord; text: string }[]
}

// ===== 反射定律 =====

export interface ReflectionResult {
  incidentAngle: number   // 入射角
  reflectedAngle: number  // 反射角
  reflectedRay: LightRay
}

// ===== 折射定律 =====

export interface RefractionResult {
  incidentAngle: number
  refractedAngle: number
  refractedRay: LightRay
}
