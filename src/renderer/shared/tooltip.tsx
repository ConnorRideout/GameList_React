/* eslint-disable import/no-cycle */
/* eslint-disable react/jsx-props-no-spreading */
import React from "react"
import { useSelector } from "react-redux"
import { Tooltip as RTooltip } from "react-tooltip"
// types
import { ITooltip } from 'react-tooltip/dist/react-tooltip'
import { RootState } from "../../types"


// docs: https://react-tooltip.com/docs/examples/basic-examples
interface TooltipProps extends ITooltip {
  children?: React.ReactNode
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
    <RTooltip {...defaultProps}>
      {children}
    </RTooltip>
  )
}
