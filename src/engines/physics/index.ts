/**
 * 物理画图引擎
 * 初中物理力学图、电路图、光学图
 */

// 类型定义
export type {
  Coord,
  Vector,
  Force,
  ForceType,
  Body,
  ForceFigure,
  ForceResultant,
  MotionFigure,
  MotionPoint,
  OpticsFigure,
  OpticsElement,
  LightRay,
  PhysicsFigure,
  Annotation,
} from './types'

// 力学图引擎
export {
  vectorMagnitude,
  vectorAngle,
  vectorFromAngle,
  vectorAdd,
  vectorSubtract,
  vectorScale,
  vectorNormalize,
  calculateResultant,
  twoForceResultant,
  decomposeForce,
  decomposeToAxes,
  isBalanced,
  calculateBalancingForce,
  createGravity,
  createNormalForce,
  createFriction,
  createTension,
  createAppliedForce,
} from './force/engine'

// 力学图渲染
export { renderForceFigure } from './force/renderer'

// 电路图引擎
export * from './circuit'

// 光学图引擎
export * from './optics'
