/* eslint-disable react/jsx-props-no-spreading */
import React from "react"

interface Props extends React.ComponentProps<'div'> {
  title: string,
  buttons: {text: string, clickHandler: React.MouseEventHandler<HTMLButtonElement>, disabledState?: boolean}[],
}
export default function InputBox({title, buttons, children, className='', ...divProps}: Props) {
  return (
    <div className={`inputbox-container ${className}`} {...divProps}>
      <div className="inputbox">
        <h1>{title}</h1>
        <div className="inputbox-content">
          {children}
        </div>
        <div className="inputbox-buttons">
          {buttons.map(({text, clickHandler, disabledState}) => (
            <button
              key={`inputBox-btn-${text}`}
              type="button"
              onClick={clickHandler}
              disabled={disabledState}
            >{text}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
