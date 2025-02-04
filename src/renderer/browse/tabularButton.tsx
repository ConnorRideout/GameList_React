import React from "react"

interface Props {
  text: string,
  clickHandler: (event: React.MouseEvent<HTMLButtonElement>) => void,
  active: boolean,
  disabled?: boolean,
}
export default function TabularButton({text, clickHandler, active, disabled=false}: Props) {
  return (
    <button type="button" className={`tab-btn-container ${active ? 'tab-active' : ''}`} onClick={clickHandler} disabled={disabled}>
      <div className="tab-btn-left" />
      <span className="tab-btn-center">{text}</span>
      <div className="tab-btn-right" />
    </button>
  )
}
