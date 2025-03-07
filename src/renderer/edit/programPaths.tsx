// TODO? drag-n-drop lines

/* eslint-disable react/no-array-index-key */
import React, { ChangeEvent } from "react"

import {
  PlusSvg,
  FileSearchSvg,
  MinusSvg
} from "../shared/svg"

// eslint-disable-next-line import/no-cycle
import { Props } from "./info"


export default function ProgramPaths({handleFormChange, formData}: Pick<Props, 'handleFormChange' | 'formData'>) {

  const handleProgramChange = (evt: ChangeEvent<HTMLInputElement>, idx: number) => {
    const {name, value} = evt.target
    const progData = [...formData.program_path]
    const idx2 = Number(name === 'exe_path')
    progData[idx][idx2] = value
    handleFormChange({target: {name: 'program_path', value: progData}})
  }

  const handleAddRow = (idx: number) => {
    const progData = [...formData.program_path]
    if (idx === -1) {
      progData.push(['', ''])
    } else {
      progData.splice(idx, 0, ['', ''])
    }
    handleFormChange({target: {name: 'program_path', value: progData}})
  }

  const handleRemoveRow = (idx: number) => {
    const progData = [...formData.program_path]
    progData.splice(idx, 1)
    if (!progData.length) progData.push(['', ''])
    handleFormChange({target: {name: 'program_path', value: progData}})
  }

  const handleFileSearch = (idx: number) => {
    const filePath = window.electron.openFileDialog({
      initialPath: formData.path,
      extension_filters: 'executables'
    })
    if (filePath) {
      const regex = new RegExp(`^.+${formData.path}\\\\?`)
      const relativePath = filePath.replace(regex, '')
      const parsedPath = relativePath.trim()
        .replace(/\.\w{2,}?$/, '') // remove extension
        .replaceAll(/(?<=[a-z])(?=[A-Z])|_|(?<=\)|\])(?=[A-Za-z])|(?<=[A-Za-z])(?=\(|\[)/g, ' ') // insert spaces
        .replaceAll(/(?<=^|\s|\(|\[|\d)([a-z])/g, match => match.toUpperCase()) // titlecase words
      const progData = [...formData.program_path]
      progData[idx] = [parsedPath, relativePath]
      handleFormChange({target: {name: 'program_path', value: progData}})
    }
  }

  return(
    <div className="info-prog-paths-container info-column-2 info-row-6 info-column-span-3">
      {formData.program_path.map(([exe_name, exe_path], idx) => (
        <div className="info-prog-path-horizontal-container" key={`progPath${idx}`}>
          <button
            type="button"
            className="svg-button"
            onClick={() => handleAddRow(idx)}
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
            onClick={() => handleFileSearch(idx)}
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
            onClick={() => handleRemoveRow(idx)}
          >
            <MinusSvg />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="svg-button with-margin"
        onClick={() => handleAddRow(-1)}
      >
        <PlusSvg />
      </button>
    </div>
  )
}
