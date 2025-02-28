import React, { useState, useEffect, ChangeEvent } from "react"

import InputBox from "../../shared/inputBox"
import { PlaySvg } from "../../shared/svg"

interface Props {
  isVisible: boolean,
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>,
  programPaths: [string, string][],
  clickHandler: {func: (progPath: string) => void},
}
export default function GamePicker({isVisible, setIsVisible, programPaths, clickHandler}: Props) {
  const [multiSelect, setMultiSelect] = useState<{[key: string]: boolean}>({})

  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = evt.target
    setMultiSelect({...multiSelect, [name]: checked})
  }

  useEffect(() => {
    setMultiSelect(programPaths.reduce((acc: {[key:string]: boolean}, cur) => {
      acc[cur[1]] = false
      return acc
    }, {}))
  }, [programPaths])

  const handleMultipleStarts = () => {
    Object.entries(multiSelect).forEach(([progPath, checked]) => {
      if (checked) clickHandler.func(progPath)
    })
  }

  const handleCancel = () => {
    setMultiSelect({})
    setIsVisible(false)
  }

  if (!isVisible || Object.keys(multiSelect).length === 0) return null
  return (
    <InputBox
      title="Select which version(s) you want to play..."
      buttons={[{text: 'Cancel', clickHandler: handleCancel}]}
      className="game-picker-container"
    >
      {programPaths.map(([displayText, progPath]) => (
        <span key={displayText}>
          <input
            type="checkbox"
            name={progPath}
            onChange={handleChange}
            checked={multiSelect[progPath]}
          />
          <button type="button" onClick={() => {
            setIsVisible(false)
            clickHandler.func(progPath)
          }}>
            <PlaySvg color="currentColor"/>
          </button>
          <p>{displayText}</p>
        </span>
      ))}
      <button
        type="button"
        onClick={handleMultipleStarts}
        disabled={Object.values(multiSelect).filter(chk => chk).length < 2}
      >Start Multiple</button>
    </InputBox>
  )
  // return (
  //   <div className="game-picker-container">
  //     <div>
  //       <h1>Select which version(s) you want to play...</h1>
  //       <div>
  //         {programPaths.map(([displayText, progPath]) => (
  //           <span key={displayText}>
  //             <input
  //               type="checkbox"
  //               name={progPath}
  //               onChange={handleChange}
  //               checked={multiSelect[progPath]}
  //             />
  //             <button type="button" onClick={() => {
  //               setIsVisible(false)
  //               clickHandler.func(progPath)
  //             }}>
  //               <PlaySvg color="currentColor"/>
  //             </button>
  //             <p>{displayText}</p>
  //           </span>
  //         ))}
  //         <button
  //           type="button"
  //           onClick={handleMultipleStarts}
  //           disabled={Object.values(multiSelect).filter(chk => chk).length < 2}
  //         >Start Multiple</button>
  //       </div>
  //       <button type="button" onClick={handleCancel}>Cancel</button>
  //     </div>
  //   </div>
  // )
}
