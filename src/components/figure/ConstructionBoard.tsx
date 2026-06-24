import { useMemo } from 'react'
import type { ConstructionFigure } from '@/types/figure'
import { executeConstruction } from '@/utils/geoEngine'
import GeometryBoard from './GeometryBoard'

interface Props {
  figure: ConstructionFigure
}

/**
 * 构造图渲染组件
 * 将构造指令计算为坐标后交给 GeometryBoard 渲染
 */
function ConstructionBoard({ figure }: Props) {
  const geometryFigure = useMemo(
    () => executeConstruction(figure.construction, figure.padding),
    [figure.construction, figure.padding]
  )

  return <GeometryBoard figure={geometryFigure} showAxes={figure.showAxes} />
}

export default ConstructionBoard
