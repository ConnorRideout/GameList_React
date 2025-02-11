/* eslint-disable react/no-array-index-key */
import React, { ChangeEvent } from "react"

import {
  PlusSvg,
  FileSearchSvg,
  MinusSvg
} from "../shared/svg"
import { Props } from "./info"


export default function ProgramPaths({handleFormChange, formData}: Props) {
  const handleProgramChange = (evt: ChangeEvent<HTMLInputElement>, idx: number) => {
    const {name, value} = evt.target
    const progData = [...formData.program_path]
    const idx2 = Number(name === 'exe_path')
    progData[idx][idx2] = value
    handleFormChange({target: {name: 'program_path', value: progData}})
  }

  return(
    <div className="info-prog-paths-container info-column-2 info-row-6 info-column-span-3">
      {formData.program_path.map(([exe_name, exe_path], idx) => (
        <div className="info-prog-path-horizontal-container" key={`progPath${idx}`}>
          <button
            type="button"
            className="svg-button"
          >
            <PlusSvg />
          </button>

          <input
            type="text"
            name="exe_path"
            className="grow-3"
            onChange={(evt) => handleProgramChange(evt, idx)}
            value={exe_path}
          />

          <button
            type="button"
            className="svg-button"
          >
            <FileSearchSvg />
          </button>

          <input
            type="text"
            name="exe_name"
            className="grow-2"
            onChange={(evt) => handleProgramChange(evt, idx)}
            value={exe_name}
          />

          <button
            type="button"
            className="svg-button"
          >
            <MinusSvg />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="svg-button with-margin"
      >
        <PlusSvg />
      </button>
    </div>
  )
}
