/**
 * 光学图 SVG 渲染器（精准布局版）
 */
import type { OpticsFigure, OpticsElement, LightRay, Coord } from './types'
import { vectorAngle, vectorMagnitude } from './engine'

const COLOR = '#000000'
const LINE_INTERFACE = 3
const LINE_NORMAL = 2
const LINE_RAY = 2
const LINE_ARC = 1.5
const DOT_RADIUS = 3
const ARC_RADIUS = 35
const FONT = 'Microsoft YaHei, sans-serif'

// ===== 平面镜 =====
function PlaneMirrorSVG({ element }: { element: any }) {
  const { position, length } = element
  const [cx, cy] = position
  const halfLen = length / 2
  const toothCount = Math.floor(length / 6)
  return (
    <g>
      <line x1={cx - halfLen} y1={cy} x2={cx + halfLen} y2={cy} stroke={COLOR} strokeWidth={LINE_INTERFACE} />
      {Array.from({ length: toothCount }, (_, i) => {
        const x = cx - halfLen + i * 6 + 3
        return <line key={i} x1={x} y1={cy + 2} x2={x - 2} y2={cy + 6} stroke={COLOR} strokeWidth={1} />
      })}
    </g>
  )
}

// ===== 水面 =====
function WaterSurfaceSVG({ element }: { element: any }) {
  const { position, width } = element
  const [cx, cy] = position
  const halfW = width / 2
  return (
    <g>
      <rect x={cx - halfW} y={cy} width={width} height={50} fill="#e6f7ff" opacity={0.6} />
      <line x1={cx - halfW} y1={cy} x2={cx + halfW} y2={cy} stroke={COLOR} strokeWidth={LINE_INTERFACE} />
      <text x={cx - halfW + 5} y={cy - 12} fontSize="14" fill={COLOR} fontFamily={FONT}>空气</text>
      <text x={cx - halfW + 5} y={cy + 28} fontSize="14" fill={COLOR} fontFamily={FONT}>水</text>
    </g>
  )
}

// ===== 透镜 =====
function ConvexLensSVG({ element }: { element: any }) {
  const { position, height = 60 } = element
  const [cx, cy] = position
  const halfH = height / 2
  return <path d={`M ${cx} ${cy - halfH} Q ${cx - 10} ${cy} ${cx} ${cy + halfH} Q ${cx + 10} ${cy} ${cx} ${cy - halfH} Z`} fill="none" stroke={COLOR} strokeWidth={LINE_INTERFACE} />
}

function OpticsElementSVG({ element }: { element: OpticsElement }) {
  switch (element.type) {
    case 'plane_mirror': return <PlaneMirrorSVG element={element} />
    case 'convex_lens': return <ConvexLensSVG element={element} />
    case 'water_surface': return <WaterSurfaceSVG element={element} />
    default: return null
  }
}

// ===== 入射点 O =====
function IncidentDot({ position }: { position: Coord }) {
  return (
    <g>
      <circle cx={position[0]} cy={position[1]} r={DOT_RADIUS} fill={COLOR} />
      <text x={position[0] - 14} y={position[1] + 22} fontSize="15" fill={COLOR} fontFamily={FONT} fontWeight="bold" textAnchor="middle">O</text>
    </g>
  )
}

// ===== 法线 =====
function NormalLine({ position, length = 90 }: { position: Coord; length?: number }) {
  const [cx, cy] = position
  const halfLen = length / 2
  return (
    <g>
      <line x1={cx} y1={cy - halfLen} x2={cx} y2={cy + halfLen} stroke={COLOR} strokeWidth={LINE_NORMAL} strokeDasharray="3,2" />
      <text x={cx + 8} y={cy - halfLen + 5} fontSize="15" fill={COLOR} fontFamily={FONT} fontWeight="bold">N</text>
      <text x={cx + 8} y={cy + halfLen + 5} fontSize="15" fill={COLOR} fontFamily={FONT} fontWeight="bold">N'</text>
    </g>
  )
}

// ===== 光线 =====
function LightRaySVG({ ray, endpointLabel }: { ray: LightRay; endpointLabel?: string }) {
  const [ox, oy] = ray.origin
  const len = vectorMagnitude(ray.direction)
  const angle = vectorAngle(ray.direction)
  const rad = (angle * Math.PI) / 180
  const ex = ox + len * Math.cos(rad)
  const ey = oy + len * Math.sin(rad)
  const isIncident = ray.label?.includes('入射')
  // 所有箭头都指向传播方向：A→O, O→B, O→C
  const arrowRatio = isIncident ? 0.65 : 0.35
  const arrowX = ox + len * arrowRatio * Math.cos(rad)
  const arrowY = oy + len * arrowRatio * Math.sin(rad)
  const arrowDir = -1  // 箭头方向反转

  let labelX = ex, labelY = ey - 12
  if (endpointLabel === 'A') { labelX = ox; labelY = oy - 12 }
  else if (endpointLabel === 'B') { labelX = ex; labelY = ey - 12 }
  else if (endpointLabel === 'C') { labelX = ex; labelY = ey + 18 }

  return (
    <g>
      <line x1={ox} y1={oy} x2={ex} y2={ey} stroke={COLOR} strokeWidth={LINE_RAY} />
      <polygon points={`${arrowX},${arrowY} ${arrowX + 10 * arrowDir * Math.cos(rad - 0.6)},${arrowY + 10 * arrowDir * Math.sin(rad - 0.6)} ${arrowX + 10 * arrowDir * Math.cos(rad + 0.6)},${arrowY + 10 * arrowDir * Math.sin(rad + 0.6)}`} fill={COLOR} />
      {endpointLabel && <text x={labelX} y={labelY} fontSize="15" fill={COLOR} fontFamily={FONT} fontWeight="bold" textAnchor="middle">{endpointLabel}</text>}
    </g>
  )
}

// ===== 角度圆弧 =====
function AngleArc({ position, startAngle, endAngle, label, color }: { position: Coord; startAngle: number; endAngle: number; label: string; color?: string }) {
  const [cx, cy] = position
  const arcColor = color || COLOR
  const startRad = (startAngle * Math.PI) / 180
  const endRad = (endAngle * Math.PI) / 180
  const x1 = cx + ARC_RADIUS * Math.cos(startRad)
  const y1 = cy + ARC_RADIUS * Math.sin(startRad)
  const x2 = cx + ARC_RADIUS * Math.cos(endRad)
  const y2 = cy + ARC_RADIUS * Math.sin(endRad)
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0
  const sweep = endAngle > startAngle ? 1 : 0
  const midAngle = ((startAngle + endAngle) / 2) * Math.PI / 180
  const labelX = cx + (ARC_RADIUS * 0.6) * Math.cos(midAngle)
  const labelY = cy + (ARC_RADIUS * 0.6) * Math.sin(midAngle)

  return (
    <g>
      <path d={`M ${x1} ${y1} A ${ARC_RADIUS} ${ARC_RADIUS} 0 ${largeArc} ${sweep} ${x2} ${y2}`} fill="none" stroke={arcColor} strokeWidth={LINE_ARC} />
      {label && <text x={labelX} y={labelY} fontSize="13" fill={arcColor} fontFamily={FONT} fontWeight="bold" textAnchor="middle" dominantBaseline="middle">{label}</text>}
    </g>
  )
}

// ===== 光学图类型 =====

interface AngleArcData {
  startAngle: number
  endAngle: number
  label: string
  color?: string
}

interface OpticsFigureWithArcs {
  type: string
  elements: any[]
  rays: any[]
  showNormal?: boolean
  angleArcs?: AngleArcData[]
  annotations?: any[]
}

// ===== 主渲染组件 =====
interface Props { figure: OpticsFigureWithArcs }

export function OpticsDiagram({ figure }: Props) {
  const PADDING = 40
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const el of figure.elements) {
    if ('position' in el) {
      const [x, y] = el.position
      minX = Math.min(minX, x - 80); minY = Math.min(minY, y - 80)
      maxX = Math.max(maxX, x + 80); maxY = Math.max(maxY, y + 80)
    }
  }
  for (const ray of figure.rays) {
    const [ox, oy] = ray.origin
    const len = vectorMagnitude(ray.direction)
    const angle = vectorAngle(ray.direction)
    const ex = ox + len * Math.cos(angle * Math.PI / 180)
    const ey = oy + len * Math.sin(angle * Math.PI / 180)
    minX = Math.min(minX, ox, ex) - 35; minY = Math.min(minY, oy, ey) - 35
    maxX = Math.max(maxX, ox, ex) + 35; maxY = Math.max(maxY, oy, ey) + 35
  }
  const width = maxX - minX + PADDING * 2
  const height = maxY - minY + PADDING * 2
  const incidentPoint: Coord = figure.elements[0] && 'position' in figure.elements[0] ? figure.elements[0].position : [0, 0]
  const incidentRay = figure.rays.find(r => r.label?.includes('入射'))
  const reflectedRay = figure.rays.find(r => r.label?.includes('反射'))
  const refractedRay = figure.rays.find(r => r.label?.includes('折射'))

  // 光线名称位置
  const incidentLabelPos: Coord = incidentRay ? [incidentRay.origin[0], incidentRay.origin[1] - 30] : [0, 0]
  const reflectedEnd = reflectedRay ? [reflectedRay.origin[0] + vectorMagnitude(reflectedRay.direction) * Math.cos(vectorAngle(reflectedRay.direction) * Math.PI / 180), reflectedRay.origin[1] + vectorMagnitude(reflectedRay.direction) * Math.sin(vectorAngle(reflectedRay.direction) * Math.PI / 180)] : [0, 0]
  const refractedEnd = refractedRay ? [refractedRay.origin[0] + vectorMagnitude(refractedRay.direction) * Math.cos(vectorAngle(refractedRay.direction) * Math.PI / 180), refractedRay.origin[1] + vectorMagnitude(refractedRay.direction) * Math.sin(vectorAngle(refractedRay.direction) * Math.PI / 180)] : [0, 0]

  return (
    <div className="flex justify-center my-3">
      <svg viewBox={`${minX - PADDING} ${minY - PADDING} ${width} ${height}`} className="w-full max-w-[400px]" style={{ aspectRatio: `${width}/${height}` }}>
        <rect x={minX - PADDING} y={minY - PADDING} width={width} height={height} fill="white" />
        <NormalLine position={incidentPoint} length={180} />
        {figure.elements.map((el, i) => <OpticsElementSVG key={i} element={el} />)}
        <IncidentDot position={incidentPoint} />
        {incidentRay && <LightRaySVG ray={incidentRay} endpointLabel="A" />}
        {reflectedRay && <LightRaySVG ray={reflectedRay} endpointLabel="B" />}
        {refractedRay && <LightRaySVG ray={refractedRay} endpointLabel="C" />}
        {incidentRay && <text x={incidentLabelPos[0]} y={incidentLabelPos[1]} fontSize="11" fill={COLOR} fontFamily={FONT} textAnchor="middle">入射光线</text>}
        {reflectedRay && <text x={reflectedEnd[0]} y={reflectedEnd[1] - 30} fontSize="11" fill={COLOR} fontFamily={FONT} textAnchor="middle">反射光线</text>}
        {refractedRay && <text x={refractedEnd[0]} y={refractedEnd[1] + 35} fontSize="11" fill={COLOR} fontFamily={FONT} textAnchor="middle">折射光线</text>}
        {/* 角度圆弧（不同颜色） */}
        {figure.angleArcs?.map((arc, i) => (
          <AngleArc key={`arc-${i}`} position={incidentPoint} startAngle={arc.startAngle} endAngle={arc.endAngle} label={arc.label} color={arc.color} />
        ))}
        {figure.annotations?.map((ann, i) => (
          <text key={i} x={ann.position[0]} y={ann.position[1]} fontSize="11" fill={COLOR} fontFamily={FONT} textAnchor="middle">{ann.text}</text>
        ))}
      </svg>
    </div>
  )
}

export default OpticsDiagram
