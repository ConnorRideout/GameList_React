import React from "react"

interface Props {
  children: React.ReactNode,
  title: string,
  buttons: {text: string, clickHandler: React.MouseEventHandler<HTMLButtonElement>, disabledState?: boolean}[],
  className?: string
}
export default function InputBox({children, title, buttons, className=''}: Props) {
  return (
    <div className={`inputbox-container ${className}`}>
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
