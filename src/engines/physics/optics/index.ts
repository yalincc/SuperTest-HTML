/**
 * 光学图引擎
 */

// 类型
export type {
  Coord,
  Vector,
  LightRay,
  PlaneMirror,
  ConvexLens,
  ConcaveLens,
  WaterSurface,
  MediumInterface,
  OpticsElement,
  OpticsFigure,
  ReflectionResult,
  RefractionResult,
} from './types'

// 计算引擎
export {
  vectorMagnitude,
  vectorAngle,
  vectorFromAngle,
  vectorNormalize,
  vectorDot,
  vectorReflect,
  calculateReflection,
  calculateRefraction,
  REFRACTIVE_INDEX,
} from './engine'

// 渲染器
export { OpticsDiagram } from './renderer'
