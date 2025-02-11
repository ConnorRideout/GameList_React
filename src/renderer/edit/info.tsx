import React from "react"

import {
  ImageSearchSvg,
  FileAutoSearchSvg,
  PlusSvg,
  FileSearchSvg,
  MinusSvg
} from "../shared/svg"


export default function Info() {
  return (
    <fieldset className="info-container">
      <legend>Info</legend>

      <button className="info-column-1 info-row-1" type="button">Auto-fill info from URL</button>

      <img src="na" alt="preview" className="info-column-4 info-row-1 info-row-span-4" />

      <label htmlFor="titleField" className="info-column-1 info-row-2">Title:</label>
      <input id="titleField" type="text" className="info-column-2 info-row-2 info-column-span-2"/>

      <label htmlFor="imageField" className="info-column-1 info-row-3">Image Path:</label>
      <input type="text" id="imageField" className="info-column-2 info-row-3" />
      <button type='button' className="info-column-3 info-row-3">
        <ImageSearchSvg
          color="currentColor"
        />
      </button>

      <label htmlFor="versionField" className="info-column 1 info-row-4">Version:</label>
      <input type="text" id="versionField" className="info-column-2 info-row-4 info-column-span-2" />

      <span className="info-column-1 info-row-5">Program Path(s):</span>
      <span className="info-column-2 info-row-5">
        <u>Executable Path</u>
      </span>
      <span className="info-column-3 info-row-5 info-column-span-2"><u>Viewable Name</u></span>
      <button type='button' className="svg-button info-column-1 info-row-6">
        <FileAutoSearchSvg />
        Auto search
      </button>
      <div className="info-column-2 info-row-6 info-column-span-3">Program Paths Component</div>

      <label htmlFor="descriptionField" className="info-column-1 info-row-7">Description:</label>
      <textarea name="descriptionField" id="descriptionField" className="info-column-2 info-row-7"/>
    </fieldset>
  )
}
