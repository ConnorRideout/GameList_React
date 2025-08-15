/* eslint-disable react/no-array-index-key */
import React, { ChangeEvent } from "react"

import SortableList from "./sortableList"

import {
  PlusSvg,
  FileSearchSvg,
  MinusSvg
} from "../../shared/svg"

// eslint-disable-next-line import/no-cycle
import { Props } from "../info"


export default function ProgramPaths({handleFormChange, formData}: Pick<Props, 'handleFormChange' | 'formData'>) {
  const handleProgramChange = (evt: ChangeEvent<HTMLInputElement>, id: number) => {
    const {name, value} = evt.target
    const progData = [...formData.program_path]
    const idx2 = Number(name === 'exe_path')
    progData.find(p => p.id === id)!.paths[idx2] = value
    handleFormChange({target: {name: 'program_path', value: progData}})
  }

  const handleAddRow = (id: number) => {
    const newId = Math.max(...formData.program_path.map(p => p.id)) + 1
    const newItem: {id: number, paths: [string, string]} = {id: newId, paths: ['', '']}
    const progData = [...formData.program_path]
    if (id === -1) {
      progData.push(newItem)
    } else {
      const idx = progData.findIndex(p => p.id === id)
      progData.splice(idx, 0, newItem)
    }
    handleFormChange({target: {name: 'program_path', value: progData}})
  }

  const handleRemoveRow = (id: number) => {
    const progData = formData.program_path.filter(p => p.id !== id)
    if (!progData.length) progData.push({id: 0, paths: ['', '']})
    handleFormChange({target: {name: 'program_path', value: progData}})
  }

  const handleFileSearch = (id: number) => {
    const filePath = window.electron.openFileDialog(
      undefined, undefined,
      formData.path,
      'executables'
    )
    if (filePath) {
      const regex = new RegExp(`^.+${formData.path}\\\\?`)
      const relativePath = filePath.replace(regex, '')
      const parsedPath = relativePath.trim()
        .replace(/\.\w{2,}?$/, '') // remove extension
        .replaceAll(/(?<=[a-z])(?=[A-Z])|_|(?<=\)|\])(?=[A-Za-z])|(?<=[A-Za-z])(?=\(|\[)/g, ' ') // insert spaces
        .replaceAll(/(?<=^|\s|\(|\[|\d)([a-z])/g, match => match.toUpperCase()) // titlecase words
      const progData = [...formData.program_path]
      progData.find(p => p.id === id)!.paths = [parsedPath, relativePath]
      handleFormChange({target: {name: 'program_path', value: progData}})
    }
  }

  return(
    <div className="info-prog-paths-container grid-column-2 grid-row-5 grid-column-span-3 grid-row-span-2">
      <div className="horizontal-container">
        <span className="exe-path">
          <u>Executable Path</u>
        </span>
        <span className="exe-viewable-name">
          <u>Viewable Name</u>
        </span>
      </div>

      <div className="vertical-container">
        <SortableList
          items={formData.program_path}
          onChange={(items) => handleFormChange({target: {name: 'program_path', value: items}})}
          renderItem={(item) => {
            const [exe_name, exe_path] = item.paths
            return (
              <SortableList.Item id={item.id}>
                <button
                  type="button"
                  className="svg-button small"
                  onClick={() => handleAddRow(item.id)}
                >
                  <PlusSvg />
                </button>

                <input
                  type="text"
                  name="exe_path"
                  className="grow-3"
                  onChange={(evt) => handleProgramChange(evt, item.id)}
                  value={exe_path}
                />

                <button
                  type="button"
                  className="svg-button small"
                  onClick={() => handleFileSearch(item.id)}
                >
                  <FileSearchSvg />
                </button>

                <input
                  type="text"
                  name="exe_name"
                  className="grow-2"
                  onChange={(evt) => handleProgramChange(evt, item.id)}
                  value={exe_name}
                />

                <button
                  type="button"
                  className="svg-button small"
                  onClick={() => handleRemoveRow(item.id)}
                >
                  <MinusSvg />
                </button>
                <SortableList.DragHandle />
              </SortableList.Item>
            )
          }}
        />
        <button
          type="button"
          className="svg-button small with-margin"
          onClick={() => handleAddRow(-1)}
        >
          <PlusSvg />
        </button>
      </div>
    </div>
  )
}
