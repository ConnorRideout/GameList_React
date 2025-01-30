import React from "react"
import { useSelector } from "react-redux"
import { Tooltip as RTooltip } from "react-tooltip"
// types
import {ITooltip} from 'react-tooltip/dist/react-tooltip'
import { RootState } from "../../data/store/store"

interface TooltipProps extends ITooltip {
  children: React.ReactNode
}
export default function Tooltip({ children, ...props }: TooltipProps) {
  const styleVars = useSelector((state: RootState) => state.data.styleVars)
  const defaultProps = {
    delayShow: 300,
    border: `1px solid ${styleVars.$fgNormal}`,
    ...props,
    className: `tooltip ${props.className || ''}`,
  }

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <RTooltip {...defaultProps}>
      {children}
    </RTooltip>
  )
}
