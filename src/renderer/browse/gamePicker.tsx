import React from "react"

import { PlaySvg } from "../shared/svg"

interface Props {
  isVisible: boolean,
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>,
  programPaths: string[][],
  clickHandler: {func: (progPath: string) => void},
}
export default function GamePicker({isVisible, setIsVisible, programPaths, clickHandler}: Props) {
  if (!isVisible) return null

  return (
    <div className="game-picker-container">
      <div>
        <h1>Select which version to play...</h1>
        <div>
          {programPaths.map(([displayText, progPath]) => (
            <span key={displayText}>
              <button type="button" onClick={() => {
                setIsVisible(false)
                clickHandler.func(progPath)
              }}>
                <PlaySvg color="currentColor"/>
              </button>
              <p>{displayText}</p>
            </span>
          ))}
        </div>
        <button type="button" onClick={() => setIsVisible(false)}>Cancel</button>
      </div>
    </div>
  )
}
