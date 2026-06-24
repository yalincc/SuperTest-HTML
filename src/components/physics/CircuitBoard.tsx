import type { CircuitFigure } from '../../engines/physics/circuit/types'
import { CircuitDiagram } from '../../engines/physics/circuit/renderer'

interface Props {
  figure: CircuitFigure
  showTitle?: boolean
}

/**
 * 电路图渲染组件
 */
function CircuitBoard({ figure, showTitle = false }: Props) {
  return <CircuitDiagram figure={figure} showTitle={showTitle} />
}

export default CircuitBoard
