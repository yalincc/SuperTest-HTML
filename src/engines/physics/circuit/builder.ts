/**
 * 电路图构建器
 * 快速创建常见电路配置
 */
import type { CircuitFigure, CircuitComponent, Wire, Coord } from './types'

// ===== 工具函数 =====

/** 创建导线 */
function wire(from: Coord, to: Coord): Wire {
  return { from, to }
}

/** 创建 L 型导线（先水平再垂直） */
function wireL(from: Coord, mid: Coord, to: Coord): Wire[] {
  return [
    { from, to: mid },
    { from: mid, to },
  ]
}

// ===== 串联电路 =====

/**
 * 创建串联电路
 * 电池 → 元件1 → 元件2 → ... → 回到电池
 */
export function createSeriesCircuit(config: {
  components: { type: string; value: string; label: string }[]
  batteryVoltage?: string
  title?: string
}): CircuitFigure {
  const comps: CircuitComponent[] = []
  const wires: Wire[] = []
  const junctions: { position: Coord }[] = []

  const y = 0
  const spacing = 80
  const startX = -((config.components.length + 1) * spacing) / 2

  // 电池
  comps.push({
    id: 'battery',
    type: 'battery',
    position: [startX, y],
    direction: 'vertical',
    label: '电源',
    value: config.batteryVoltage || '3V',
  })

  // 上方导线
  wires.push(wire([startX, y - 10], [startX + spacing, y - 10]))

  // 各元件
  config.components.forEach((comp, i) => {
    const x = startX + spacing * (i + 1)
    comps.push({
      id: `comp-${i}`,
      type: comp.type as any,
      position: [x, y - 10],
      direction: 'horizontal',
      label: comp.label,
      value: comp.value,
    })

    // 元件之间的导线
    if (i < config.components.length - 1) {
      wires.push(wire([x + 15, y - 10], [x + spacing - 15, y - 10]))
    }
  })

  // 右侧垂直导线
  const lastX = startX + spacing * config.components.length
  wires.push(wire([lastX + 15, y - 10], [lastX + 15, y + 10]))
  wires.push(wire([lastX + 15, y + 10], [startX, y + 10]))

  return {
    type: 'circuit',
    components: comps,
    wires,
    junctions,
    title: config.title || '串联电路',
  }
}

// ===== 并联电路 =====

/**
 * 创建并联电路
 */
export function createParallelCircuit(config: {
  branches: {
    components: { type: string; value: string; label: string }[]
  }[]
  batteryVoltage?: string
  title?: string
}): CircuitFigure {
  const comps: CircuitComponent[] = []
  const wires: Wire[] = []
  const junctions: { position: Coord }[] = []

  const y = 0
  const branchSpacing = 60
  const compSpacing = 80
  const totalWidth = Math.max(...config.branches.map(b => b.components.length)) * compSpacing

  // 电池（左侧）
  comps.push({
    id: 'battery',
    type: 'battery',
    position: [-totalWidth / 2 - 40, y],
    direction: 'vertical',
    label: '电源',
    value: config.batteryVoltage || '3V',
  })

  // 左侧垂直导线
  wires.push(wire([-totalWidth / 2 - 40, y - 10], [-totalWidth / 2 - 20, y - 10]))
  wires.push(wire([-totalWidth / 2 - 20, y - 10], [-totalWidth / 2 - 20, y + 10 + branchSpacing * (config.branches.length - 1)]))

  // 右侧垂直导线
  wires.push(wire([totalWidth / 2 + 20, y - 10], [totalWidth / 2 + 20, y + 10 + branchSpacing * (config.branches.length - 1)]))

  // 各支路
  config.branches.forEach((branch, bi) => {
    const branchY = y + branchSpacing * bi

    // 支路起点
    junctions.push({ position: [-totalWidth / 2 - 20, branchY] })
    wires.push(wire([-totalWidth / 2 - 20, branchY], [-totalWidth / 2, branchY]))

    // 支路元件
    branch.components.forEach((comp, ci) => {
      const x = -totalWidth / 2 + compSpacing * (ci + 0.5)
      comps.push({
        id: `branch-${bi}-comp-${ci}`,
        type: comp.type as any,
        position: [x, branchY],
        direction: 'horizontal',
        label: comp.label,
        value: comp.value,
      })

      // 元件间导线
      if (ci < branch.components.length - 1) {
        wires.push(wire([x + 15, branchY], [x + compSpacing - 15, branchY]))
      }
    })

    // 支路终点
    const lastCompX = -totalWidth / 2 + compSpacing * branch.components.length
    wires.push(wire([lastCompX + 15, branchY], [totalWidth / 2 + 20, branchY]))
    junctions.push({ position: [totalWidth / 2 + 20, branchY] })
  })

  return {
    type: 'circuit',
    components: comps,
    wires,
    junctions,
    title: config.title || '并联电路',
  }
}

// ===== 简单电路 =====

/**
 * 创建简单电路（一个电池 + 一个元件）
 */
export function createSimpleCircuit(config: {
  component: { type: string; value: string; label: string }
  batteryVoltage?: string
  title?: string
}): CircuitFigure {
  const y = 0
  const w = 80
  const h = 50

  return {
    type: 'circuit',
    components: [
      {
        id: 'battery',
        type: 'battery',
        position: [-w, y],
        direction: 'vertical',
        label: '电源',
        value: config.batteryVoltage || '3V',
      },
      {
        id: 'comp',
        type: config.component.type as any,
        position: [w, y],
        direction: 'vertical',
        label: config.component.label,
        value: config.component.value,
      },
    ],
    wires: [
      wire([-w, y - 10], [-w, y - h]),
      wire([-w, y - h], [w, y - h]),
      wire([w, y - h], [w, y - 10]),
      wire([w, y + 10], [w, y + h]),
      wire([w, y + h], [-w, y + h]),
      wire([-w, y + h], [-w, y + 10]),
    ],
    title: config.title || '简单电路',
  }
}
