/* eslint-disable import/no-cycle */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, {ChangeEvent} from "react"

import TristateCheckbox from "../tristateCheckbox"

import { FormState } from "./picker"
import { RootState } from '../../../types'


interface Props {
  tags: RootState['data']['tags'],
  isBrowse: boolean,
  handleFormChange: (evt: ChangeEvent<HTMLInputElement | HTMLSelectElement>, tristate?: boolean) => void,
  formData: FormState,
}
export default function Tags({tags, isBrowse, handleFormChange, formData}: Props) {
  const subDivideTags = () => {
    const tagsList = [...tags]
    const numRows = Math.ceil(tagsList.length / 8)
    const rows = []

    const baseRowSize = Math.floor(tagsList.length / numRows)
    const extraItems = tagsList.length % numRows
    for (let idx = 0; idx < numRows; idx++) {
      const currentRowSize = baseRowSize + (idx < extraItems ? 1 : 0)
      rows.push(tagsList.splice(0, currentRowSize))
    }
    return rows
  }

  return (
    <fieldset className='vertical-container'>
      <legend className='header'>Tags</legend>
      {subDivideTags().map((row, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={`row${idx}`} className='horizontal-container'>
          {row.map(({tag_id, tag_name}) => (
            isBrowse ?
              <TristateCheckbox  style={{flex: '1 0 12.5%'}}
                key={`${tag_id}${tag_name}`}
                labelText={tag_name}
                handleFormChange={handleFormChange}
                checkState={formData.tags[tag_name]}
              />
              :
              <label
                style={{flex: '1 0 12.5%'}}
                key={`${tag_id}${tag_name}`}
              >
                <input
                  type="checkbox"
                  name={tag_name}
                  onChange={handleFormChange}
                  checked={!!formData.tags[tag_name]}
                />
                {tag_name}
              </label>
          ))}
        </div>
      ))}
    </fieldset>
  )
}
