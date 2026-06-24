/**
 * 光学计算引擎
 * 计算反射、折射角度
 */
import type { Coord, Vector, LightRay, ReflectionResult, RefractionResult } from './types'

const DEG = Math.PI / 180

// ===== 基础向量运算 =====

/** 向量长度 */
export function vectorMagnitude(v: Vector): number {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}

/** 向量角度（度） */
export function vectorAngle(v: Vector): number {
  return Math.atan2(v.y, v.x) / DEG
}

/** 从角度和大小创建向量 */
export function vectorFromAngle(angleDeg: number, magnitude: number): Vector {
  const rad = angleDeg * DEG
  return {
    x: magnitude * Math.cos(rad),
    y: magnitude * Math.sin(rad),
  }
}

/** 向量归一化 */
export function vectorNormalize(v: Vector): Vector {
  const mag = vectorMagnitude(v)
  if (mag < 1e-10) return { x: 0, y: 0 }
  return { x: v.x / mag, y: v.y / mag }
}

/** 向量点积 */
export function vectorDot(a: Vector, b: Vector): number {
  return a.x * b.x + a.y * b.y
}

/** 向量反射（关于法线） */
export function vectorReflect(v: Vector, normal: Vector): Vector {
  const n = vectorNormalize(normal)
  const d = 2 * vectorDot(v, n)
  return {
    x: v.x - d * n.x,
    y: v.y - d * n.y,
  }
}

// ===== 反射计算 =====

/**
 * 计算反射光线
 * 入射光线关于法线反射
 */
export function calculateReflection(
  incidentRay: LightRay,
  mirrorAngle: number,    // 镜面角度（度）
  mirrorPos: Coord
): ReflectionResult {
  // 法线角度 = 镜面角度 + 90°
  const normalAngle = mirrorAngle + 90
  const normal = vectorFromAngle(normalAngle, 1)

  // 入射角（入射光线与法线的夹角）
  const incidentAngle = Math.abs(vectorAngle(incidentRay.direction) - normalAngle)
  const normalizedIncident = incidentAngle > 180 ? 360 - incidentAngle : incidentAngle

  // 反射光线
  const reflectedDir = vectorReflect(incidentRay.direction, normal)
  const reflectedAngle = vectorAngle(reflectedDir)

  return {
    incidentAngle: normalizedIncident,
    reflectedAngle: normalizedIncident,  // 反射角 = 入射角
    reflectedRay: {
      origin: mirrorPos,
      direction: reflectedDir,
      label: '反射光线',
      arrowAtEnd: true,
    },
  }
}

// ===== 折射计算 =====

/**
 * 计算折射光线（斯涅尔定律）
 * n1 * sin(θ1) = n2 * sin(θ2)
 */
export function calculateRefraction(
  incidentRay: LightRay,
  interfaceAngle: number,  // 界面角度（度）
  n1: number,              // 介质1折射率
  n2: number,              // 介质2折射率
  interfacePos: Coord
): RefractionResult {
  // 法线角度
  const normalAngle = interfaceAngle + 90

  // 入射角
  const incidentAngleRad = Math.abs((vectorAngle(incidentRay.direction) - normalAngle) * DEG)
  const normalizedIncident = incidentAngleRad > Math.PI ? Math.PI * 2 - incidentAngleRad : incidentAngleRad

  // 斯涅尔定律：n1 * sin(θ1) = n2 * sin(θ2)
  const sinIncident = Math.sin(normalizedIncident)
  const sinRefracted = (n1 / n2) * sinIncident

  // 检查全反射
  if (Math.abs(sinRefracted) > 1) {
    // 全反射
    const reflectedDir = vectorReflect(incidentRay.direction, vectorFromAngle(normalAngle, 1))
    return {
      incidentAngle: normalizedIncident / DEG,
      refractedAngle: 90,  // 全反射标记
      refractedRay: {
        origin: interfacePos,
        direction: reflectedDir,
        label: '全反射',
        dashed: true,
        arrowAtEnd: true,
      },
    }
  }

  const refractedAngle = Math.asin(sinRefracted) / DEG

  // 折射光线方向
  const refractedDir = vectorFromAngle(normalAngle - refractedAngle, vectorMagnitude(incidentRay.direction))

  return {
    incidentAngle: normalizedIncident / DEG,
    refractedAngle,
    refractedRay: {
      origin: interfacePos,
      direction: refractedDir,
      label: '折射光线',
      arrowAtEnd: true,
    },
  }
}

// ===== 常用折射率 =====

export const REFRACTIVE_INDEX = {
  AIR: 1.0,
  WATER: 1.33,
  GLASS: 1.5,
  DIAMOND: 2.42,
} as const
