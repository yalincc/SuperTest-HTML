/**
 * 电路图 SVG 渲染器（国标 GB/T 4728 规范）
 */
import type { CircuitFigure, CircuitComponent, Wire, Junction } from './types'

// ===== 样式常量 =====

const STROKE_COLOR = '#000000'
const STROKE_WIDTH = 2
const FILL_COLOR = '#000000'
const LABEL_COLOR = '#374151'
const LABEL_SIZE = 12
const VALUE_SIZE = 10

// ===== 国标元件符号 =====

/**
 * 电池符号（国标）
 * 长线=正极，短粗线=负极，间距统一
 */
function BatterySymbol({ x, y, direction = 'horizontal' }: { x: number; y: number; direction?: string }) {
  const isH = direction === 'horizontal'
  return (
    <g transform={`translate(${x}, ${y})`}>
      {isH ? (
        <>
          {/* 左导线 */}
          <line x1="-20" y1="0" x2="-6" y2="0" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
          {/* 正极（长细线） */}
          <line x1="-6" y1="-12" x2="-6" y2="12" stroke={STROKE_COLOR} strokeWidth={1.5} />
          {/* 负极（短粗线） */}
          <line x1="6" y1="-7" x2="6" y2="7" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH + 1} />
          {/* 右导线 */}
          <line x1="6" y1="0" x2="20" y2="0" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
        </>
      ) : (
        <>
          {/* 上导线 */}
          <line x1="0" y1="-20" x2="0" y2="-6" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
          {/* 正极（长细线） */}
          <line x1="-12" y1="-6" x2="12" y2="-6" stroke={STROKE_COLOR} strokeWidth={1.5} />
          {/* 负极（短粗线） */}
          <line x1="-7" y1="6" x2="7" y2="6" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH + 1} />
          {/* 下导线 */}
          <line x1="0" y1="6" x2="0" y2="20" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
        </>
      )}
    </g>
  )
}

/**
 * 开关符号（国标）
 * closed=true: 闸片水平连接两端
 * closed=false: 闸片向上翘起约30°，有明显空隙
 */
function SwitchSymbol({ x, y, closed = false, direction = 'horizontal' }: { x: number; y: number; closed?: boolean; direction?: string }) {
  const isH = direction === 'horizontal'

  if (isH) {
    // 闸片长度
    const armLen = 14
    // 右接线柱位置（空心=枢轴点，闸片从这里出发）
    const rightX = 8
    // 未闭合时的翘起角度（30°向左上方）
    const openAngle = closed ? 0 : 30
    const rad = (openAngle * Math.PI) / 180
    // 闸片终点（从右接线柱出发，向左上方翘起）
    const armEndX = rightX - armLen * Math.cos(rad)
    const armEndY = -armLen * Math.sin(rad) // 向上为负Y

    return (
      <g transform={`translate(${x}, ${y})`}>
        {/* 左导线 */}
        <line x1="-20" y1="0" x2="-8" y2="0" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
        {/* 左接线柱（实心=固定端） */}
        <circle cx="-8" cy="0" r="2.5" fill={FILL_COLOR} />
        {/* 右导线 */}
        <line x1="8" y1="0" x2="20" y2="0" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
        {/* 右接线柱（空心=枢轴点） */}
        <circle cx="8" cy="0" r="2.5" fill="white" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
        {/* 闸片（从右接线柱出发，向左上方翘起） */}
        <line
          x1={rightX} y1="0"
          x2={closed ? "-8" : String(armEndX)}
          y2={closed ? "0" : String(armEndY)}
          stroke={STROKE_COLOR}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
        />
      </g>
    )
  }

  // 垂直方向（空心=枢轴点在下方）
  const armLen = 14
  const bottomY = 8 // 空心接线柱位置
  const openAngle = closed ? 0 : 30
  const rad = (openAngle * Math.PI) / 180
  const armEndX = -armLen * Math.sin(rad) // 向左
  const armEndY = bottomY - armLen * Math.cos(rad) // 向上

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* 上导线 */}
      <line x1="0" y1="-20" x2="0" y2="-8" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      {/* 上接线柱（实心=固定端） */}
      <circle cx="0" cy="-8" r="2.5" fill={FILL_COLOR} />
      {/* 下导线 */}
      <line x1="0" y1="8" x2="0" y2="20" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      {/* 下接线柱（空心=枢轴点） */}
      <circle cx="0" cy="8" r="2.5" fill="white" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      {/* 闸片（从下接线柱出发，向左上方翘起） */}
      <line
        x1="0" y1={bottomY}
        x2={closed ? "0" : String(armEndX)}
        y2={closed ? "-8" : String(armEndY)}
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
      />
    </g>
  )
}

/**
 * 灯泡符号（国标）
 * 圆圈内画叉，大小统一，两端延伸导线确保无缝连接
 */
function BulbSymbol({ x, y }: { x: number; y: number }) {
  const r = 10
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* 左延伸线（无缝连接） */}
      <line x1="-20" y1="0" x2={-r} y2="0" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      {/* 圆圈 */}
      <circle cx="0" cy="0" r={r} fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      {/* 叉号 */}
      <line x1={-r * 0.6} y1={-r * 0.6} x2={r * 0.6} y2={r * 0.6} stroke={STROKE_COLOR} strokeWidth={1.5} />
      <line x1={r * 0.6} y1={-r * 0.6} x2={-r * 0.6} y2={r * 0.6} stroke={STROKE_COLOR} strokeWidth={1.5} />
      {/* 右延伸线（无缝连接） */}
      <line x1={r} y1="0" x2="20" y2="0" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
    </g>
  )
}

/**
 * 电阻符号（锯齿形）
 */
function ResistorSymbol({ x, y, direction = 'horizontal' }: { x: number; y: number; direction?: string }) {
  const isH = direction === 'horizontal'
  if (isH) {
    return (
      <g transform={`translate(${x}, ${y})`}>
        <line x1="-20" y1="0" x2="-12" y2="0" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
        <polyline
          points="-12,0 -10,-6 -6,6 -2,-6 2,6 6,-6 10,6 12,0"
          fill="none"
          stroke={STROKE_COLOR}
          strokeWidth={STROKE_WIDTH}
        />
        <line x1="12" y1="0" x2="20" y2="0" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      </g>
    )
  }
  return (
    <g transform={`translate(${x}, ${y}) rotate(90)`}>
      <line x1="-20" y1="0" x2="-12" y2="0" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      <polyline
        points="-12,0 -10,-6 -6,6 -2,-6 2,6 6,-6 10,6 12,0"
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      <line x1="12" y1="0" x2="20" y2="0" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
    </g>
  )
}

/**
 * 电流表符号（含延伸线）
 */
function AmmeterSymbol({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <line x1="-20" y1="0" x2="-12" y2="0" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      <circle cx="0" cy="0" r="12" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      <text x="0" y="5" textAnchor="middle" fontSize="14" fontWeight="bold" fill={FILL_COLOR}>A</text>
      <line x1="12" y1="0" x2="20" y2="0" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
    </g>
  )
}

/**
 * 电压表符号（含延伸线）
 */
function VoltmeterSymbol({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <line x1="-20" y1="0" x2="-12" y2="0" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      <circle cx="0" cy="0" r="12" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      <text x="0" y="5" textAnchor="middle" fontSize="14" fontWeight="bold" fill={FILL_COLOR}>V</text>
      <line x1="12" y1="0" x2="20" y2="0" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
    </g>
  )
}

/**
 * 节点绘制（导线交接处实心圆点，大小统一）
 */
function JunctionDot({ junction }: { junction: Junction }) {
  return (
    <circle
      cx={junction.position[0]}
      cy={junction.position[1]}
      r="3"
      fill={FILL_COLOR}
    />
  )
}

// ===== 元件分发 =====

function CircuitComponentSymbol({ component }: { component: CircuitComponent }) {
  const [x, y] = component.position
  const dir = component.direction || 'horizontal'

  switch (component.type) {
    case 'battery':
      return <BatterySymbol x={x} y={y} direction={dir} />
    case 'resistor':
      return <ResistorSymbol x={x} y={y} direction={dir} />
    case 'switch':
      return <SwitchSymbol x={x} y={y} closed={component.closed} direction={dir} />
    case 'bulb':
      return <BulbSymbol x={x} y={y} />
    case 'ammeter':
      return <AmmeterSymbol x={x} y={y} />
    case 'voltmeter':
      return <VoltmeterSymbol x={x} y={y} />
    case 'motor':
      return <MotorSymbol x={x} y={y} />
    default:
      return null
  }
}

// ===== 导线绘制 =====

function WireLine({ wire }: { wire: Wire }) {
  return (
    <line
      x1={wire.from[0]}
      y1={wire.from[1]}
      x2={wire.to[0]}
      y2={wire.to[1]}
      stroke={STROKE_COLOR}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

// ===== 主渲染组件 =====

interface Props {
  figure: CircuitFigure
  showTitle?: boolean
}

/**
 * 电路图渲染组件
 */
export function CircuitDiagram({ figure, showTitle = false }: Props) {
  // 计算边界
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

  for (const comp of figure.components) {
    const [x, y] = comp.position
    minX = Math.min(minX, x - 25)
    minY = Math.min(minY, y - 25)
    maxX = Math.max(maxX, x + 25)
    maxY = Math.max(maxY, y + 25)
  }

  for (const wire of figure.wires) {
    minX = Math.min(minX, wire.from[0], wire.to[0])
    minY = Math.min(minY, wire.from[1], wire.to[1])
    maxX = Math.max(maxX, wire.from[0], wire.to[0])
    maxY = Math.max(maxY, wire.from[1], wire.to[1])
  }

  const width = maxX - minX + 60
  const height = maxY - minY + 60

  return (
    <div className="flex justify-center my-3">
      <svg
        viewBox={`${minX - 30} ${minY - 30} ${width} ${height}`}
        className="w-full max-w-[400px]"
        style={{ aspectRatio: `${width}/${height}` }}
      >
        {/* 白色背景 */}
        <rect x={minX - 30} y={minY - 30} width={width} height={height} fill="white" />

        {/* 标题（可选，默认隐藏） */}
        {showTitle && figure.title && (
          <text
            x={(minX + maxX) / 2}
            y={minY - 15}
            textAnchor="middle"
            fontSize="13"
            fill={LABEL_COLOR}
          >
            {figure.title}
          </text>
        )}

        {/* 导线 */}
        {figure.wires.map((wire, i) => (
          <WireLine key={`wire-${i}`} wire={wire} />
        ))}

        {/* 节点（导线连接点实心圆点） */}
        {figure.junctions?.map((j, i) => (
          <JunctionDot key={`junction-${i}`} junction={j} />
        ))}

        {/* 元件 */}
        {figure.components.map((comp) => (
          <CircuitComponentSymbol key={comp.id} component={comp} />
        ))}

        {/* 元件标注（统一位置，避免与导线重叠） */}
        {figure.components.map((comp) => {
          if (!comp.label && !comp.value) return null
          const [x, y] = comp.position

          let labelX: number
          let labelY: number
          let anchor: string

          switch (comp.type) {
            case 'battery':
              // 电源：标注在左侧居中
              labelX = x - 22
              labelY = y + 4
              anchor = 'end'
              break
            case 'switch':
              // 开关：标注在右上方
              labelX = x + 12
              labelY = y - 14
              anchor = 'start'
              break
            case 'bulb':
              // 灯泡：标注在右上方
              labelX = x + 14
              labelY = y - 14
              anchor = 'start'
              break
            case 'ammeter':
            case 'voltmeter':
            case 'motor':
              // 电表/电动机：标注在右上方
              labelX = x + 16
              labelY = y - 14
              anchor = 'start'
              break
            case 'resistor':
              // 电阻：标注在上方
              labelX = x
              labelY = y - 16
              anchor = 'middle'
              break
            default:
              labelX = x + 16
              labelY = y - 14
              anchor = 'start'
          }

          return (
            <g key={`label-${comp.id}`}>
              {comp.label && (
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor={anchor}
                  fontSize={LABEL_SIZE}
                  fill={LABEL_COLOR}
                >
                  {comp.label}
                </text>
              )}
              {comp.value && (
                <text
                  x={labelX}
                  y={labelY + 12}
                  textAnchor={anchor}
                  fontSize={VALUE_SIZE}
                  fill="#6b7280"
                >
                  {comp.value}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default CircuitDiagram
