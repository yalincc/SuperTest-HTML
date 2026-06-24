/**
 * 电路图类型定义
 * 用于初中物理电路图
 */

// ===== 基础类型 =====

/** 2D 坐标点 */
export type Coord = [number, number]

// ===== 电路元件类型 =====

/** 元件类型 */
export type ComponentType =
  | 'battery'      // 电池
  | 'resistor'     // 电阻
  | 'switch'       // 开关
  | 'bulb'         // 灯泡
  | 'ammeter'      // 电流表
  | 'voltmeter'    // 电压表
  | 'motor'        // 电动机
  | 'diode'        // 二极管

/** 元件方向 */
export type Direction = 'horizontal' | 'vertical'

/** 电路元件 */
export interface CircuitComponent {
  id: string
  type: ComponentType
  position: Coord           // 元件中心位置
  direction?: Direction     // 默认 horizontal
  label?: string            // 显示标签
  value?: string            // 数值，如 "10Ω"、"3V"
  closed?: boolean          // 开关状态
}

/** 导线 */
export interface Wire {
  from: Coord
  to: Coord
  style?: 'solid' | 'dashed'
}

/** 节点（连接点） */
export interface Junction {
  position: Coord
}

// ===== 电路图 =====

/** 电路图 */
export interface CircuitFigure {
  type: 'circuit'
  components: CircuitComponent[]
  wires: Wire[]
  junctions?: Junction[]
  title?: string
}

// ===== 电路配置 =====

/** 串联电路 */
export interface SeriesCircuit {
  type: 'series'
  battery: { voltage: string }
  components: { type: ComponentType; value: string; label: string }[]
}

/** 并联电路 */
export interface ParallelCircuit {
  type: 'parallel'
  battery: { voltage: string }
  branches: {
    components: { type: ComponentType; value: string; label: string }[]
  }[]
}
