import React from "react"

interface Props {
  text: string,
  clickHandler: (event: React.MouseEvent<HTMLButtonElement>) => void,
  active: boolean,
  disabled?: boolean,
  className?: string
}
export default function TabularButton({text, clickHandler, active, disabled=false, className=''}: Props) {
  return (
    <button
      type="button"
      className={`${className} tab-btn-container ${active ? 'tab-active' : ''}`}
      onClick={clickHandler}
      disabled={disabled}
    >
      <span className={`tab-btn-border ${active ? 'hidden' : ''}`}/>
      <div className="tab-btn-left" />
      <span className="tab-btn-center">{text}</span>
      <div className="tab-btn-right" />
    </button>
  )
}
