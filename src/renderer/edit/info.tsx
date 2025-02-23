import React, {ChangeEvent} from "react"
import Tooltip from "../shared/tooltip"

import {
  ImageSearchSvg,
  FileAutoSearchSvg,
} from "../shared/svg"
// eslint-disable-next-line import/no-cycle
import ProgramPaths from "./programPaths"
import { GameEntry } from "../../types"


export interface Props {
  handleFormChange: (evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | {target: {name: string, value: string | [string, string][]}}) => void,
  formData: Pick<GameEntry, 'path' | 'title' | 'url' | 'image' | 'version' | 'description'> & {program_path: [string, string][]}
}
export default function Info({handleFormChange, formData}: Props) {
  return (
    <fieldset className="info-container">
      <legend>Info</legend>
      {/* TODO: implement auto-fill */}
      <button
        className="info-column-1 info-row-1"
        type="button"
      >Auto-fill info from URL</button>

      <Tooltip
        float
        className='tooltip-image'
        place='bottom-end'
        opacity='1'
        anchorSelect='#imagePreview'
      >
        <img
          src={`load-image://${formData.image.replaceAll(' ', '_')}`}
          alt="Dynamic Local Resource Tooltip"
        />
      </Tooltip>
      <img
        id="imagePreview"
        src={`load-image://${formData.image.replaceAll(' ', '_')}`}
        alt="[image preview]"
        className="info-column-4 info-row-1 info-row-span-4"
      />

      <label htmlFor="titleField" className="info-column-1 info-row-2">Title:</label>
      {/* TODO: warn if title already exists */}
      <input
        id="titleField"
        type="text"
        className="info-column-2 info-row-2 info-column-span-2 info-justify-stretch"
        name="title"
        onChange={handleFormChange}
        value={formData.title}
      />

      <label htmlFor="imageField" className="info-column-1 info-row-3">Image Path:</label>
      <input
        type="text"
        id="imageField"
        className="info-column-2 info-row-3 info-justify-stretch"
        name="image"
        onChange={handleFormChange}
        value={formData.image}
      />
      <button type='button' className="info-column-3 info-row-3 svg-button">
        {/* TODO: implement image search */}
        <ImageSearchSvg
          color="currentColor"
        />
      </button>

      <label htmlFor="versionField" className="info-column 1 info-row-4">Version:</label>
      <input
        type="text"
        id="versionField"
        className="info-column-2 info-row-4 info-column-span-2 info-justify-stretch"
        name="version"
        onChange={handleFormChange}
        value={formData.version}
      />

      <span className="info-column-1 info-row-5">Program Path(s):</span>
      <span className="info-column-2 info-row-5">
        <u>Executable Path</u>
      </span>
      <span className="info-column-3 info-row-5 info-column-span-2"><u>Viewable Name</u></span>
      {/* TODO: implement file auto search */}
      <button type='button' className="svg-button info-column-1 info-row-6">
        <FileAutoSearchSvg />
        Auto search
      </button>
      <ProgramPaths
        handleFormChange={handleFormChange}
        formData={formData}
      />

      <label htmlFor="descriptionField" className="info-column-1 info-row-7">Description:</label>
      <textarea
        name="description"
        id="descriptionField"
        className="info-column-2 info-row-7 info-justify-stretch"
        onChange={handleFormChange}
        value={formData.description}
      />
    </fieldset>
  )
}
