/**
 * 力学图引擎
 * 计算力的合成、分解、平衡等
 */
import type { Coord, Vector, Force, ForceResultant } from '../types'

// ===== 基础计算 =====

/** 向量长度 */
export function vectorMagnitude(v: Vector): number {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}

/** 向量角度（度，从 x 轴正方向逆时针） */
export function vectorAngle(v: Vector): number {
  return Math.atan2(v.y, v.x) * (180 / Math.PI)
}

/** 从角度和大小创建向量 */
export function vectorFromAngle(angleDeg: number, magnitude: number): Vector {
  const rad = angleDeg * (Math.PI / 180)
  return {
    x: magnitude * Math.cos(rad),
    y: magnitude * Math.sin(rad),
  }
}

/** 向量加法 */
export function vectorAdd(a: Vector, b: Vector): Vector {
  return { x: a.x + b.x, y: a.y + b.y }
}

/** 向量减法 */
export function vectorSubtract(a: Vector, b: Vector): Vector {
  return { x: a.x - b.x, y: a.y - b.y }
}

/** 向量数乘 */
export function vectorScale(v: Vector, scalar: number): Vector {
  return { x: v.x * scalar, y: v.y * scalar }
}

/** 单位向量 */
export function vectorNormalize(v: Vector): Vector {
  const mag = vectorMagnitude(v)
  if (mag < 1e-10) return { x: 0, y: 0 }
  return { x: v.x / mag, y: v.y / mag }
}

// ===== 力的合成 =====

/** 计算多个力的合力 */
export function calculateResultant(forces: Force[]): ForceResultant {
  const resultant = forces.reduce(
    (sum, f) => vectorAdd(sum, f.vector),
    { x: 0, y: 0 }
  )
  
  return {
    forces: forces.map(f => f.id),
    resultant,
    magnitude: vectorMagnitude(resultant),
    angle: vectorAngle(resultant),
  }
}

/** 计算二力合力（平行四边形法则） */
export function twoForceResultant(f1: Force, f2: Force): ForceResultant {
  return calculateResultant([f1, f2])
}

// ===== 力的分解 =====

/** 将力分解到指定方向 */
export function decomposeForce(
  force: Force,
  direction1Angle: number,
  direction2Angle: number
): { d1: Vector; d2: Vector } {
  const f = force.vector
  const angle1 = direction1Angle * (Math.PI / 180)
  const angle2 = direction2Angle * (Math.PI / 180)
  
  // 解方程组：f = d1 * u1 + d2 * u2
  const det = Math.cos(angle1) * Math.sin(angle2) - Math.sin(angle1) * Math.cos(angle2)
  
  if (Math.abs(det) < 1e-10) {
    return { d1: { x: 0, y: 0 }, d2: { x: 0, y: 0 } }
  }
  
  const d1Mag = (f.x * Math.sin(angle2) - f.y * Math.cos(angle2)) / det
  const d2Mag = (f.y * Math.cos(angle1) - f.x * Math.sin(angle1)) / det
  
  return {
    d1: vectorFromAngle(direction1Angle, d1Mag),
    d2: vectorFromAngle(direction2Angle, d2Mag),
  }
}

/** 将力分解为水平和垂直分量 */
export function decomposeToAxes(force: Force): { horizontal: Vector; vertical: Vector } {
  return {
    horizontal: { x: force.vector.x, y: 0 },
    vertical: { x: 0, y: force.vector.y },
  }
}

// ===== 力的平衡 =====

/** 检查力是否平衡（合力为零） */
export function isBalanced(forces: Force[], tolerance = 0.01): boolean {
  const resultant = calculateResultant(forces)
  return resultant.magnitude < tolerance
}

/** 计算平衡所需的力 */
export function calculateBalancingForce(forces: Force[]): Force {
  const resultant = calculateResultant(forces)
  return {
    id: 'balancing',
    type: 'custom',
    label: 'F平衡',
    origin: [0, 0],
    vector: { x: -resultant.vector.x, y: -resultant.vector.y },
    color: '#dc2626',
  }
}

// ===== 常用力 =====

/** 创建重力 */
export function createGravity(
  id: string,
  origin: Coord,
  magnitude: number,
  label = 'G'
): Force {
  return {
    id,
    type: 'gravity',
    label,
    origin,
    vector: { x: 0, y: -magnitude },
    color: '#1e40af',
  }
}

/** 创建支持力（垂直于接触面向上） */
export function createNormalForce(
  id: string,
  origin: Coord,
  magnitude: number,
  angle = 90,
  label = 'N'
): Force {
  return {
    id,
    type: 'normal',
    label,
    origin,
    vector: vectorFromAngle(angle, magnitude),
    color: '#059669',
  }
}

/** 创建摩擦力（平行于接触面） */
export function createFriction(
  id: string,
  origin: Coord,
  magnitude: number,
  angle = 0,
  label = 'f'
): Force {
  return {
    id,
    type: 'friction',
    label,
    origin,
    vector: vectorFromAngle(angle, magnitude),
    color: '#d97706',
  }
}

/** 创建拉力 */
export function createTension(
  id: string,
  origin: Coord,
  magnitude: number,
  angle: number,
  label = 'T'
): Force {
  return {
    id,
    type: 'tension',
    label,
    origin,
    vector: vectorFromAngle(angle, magnitude),
    color: '#7c3aed',
  }
}

/** 创建外力 */
export function createAppliedForce(
  id: string,
  origin: Coord,
  magnitude: number,
  angle: number,
  label = 'F'
): Force {
  return {
    id,
    type: 'applied',
    label,
    origin,
    vector: vectorFromAngle(angle, magnitude),
    color: '#dc2626',
  }
}