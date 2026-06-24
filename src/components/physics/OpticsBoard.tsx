import type { OpticsFigure } from '../../engines/physics/optics/types'
import { OpticsDiagram } from '../../engines/physics/optics/renderer'

interface Props {
  figure: OpticsFigure
}

/**
 * 光学图渲染组件
 */
function OpticsBoard({ figure }: Props) {
  return <OpticsDiagram figure={figure} />
}

export default OpticsBoard
