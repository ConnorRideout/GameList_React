import React from 'react'

import {
  PlusSvg,
  MinusSvg
} from "../../shared/svg"

// eslint-disable-next-line import/no-cycle
import { Props } from './games'


export default function Tags({formData, setFormData}: Props) {
  const {tags} = formData

  const handleRemoveTag = () => {

  }

  const handleAddTag = () => {

  }

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const { value } = evt.target
    const oldTags = [...formData.tags]
    oldTags[idx] = value
    setFormData(prevValue => ({...prevValue, tags: oldTags}))
  }

  return (
    <fieldset className='vertical-container scrollable grid-column-2'>
      <legend>TAGS</legend>

      {tags.map((tag, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={`tag-${idx}`} className='horizontal-container align-center'>
          <button
            type='button'
            className='svg-button'
            onClick={handleRemoveTag}
          >
            <MinusSvg size={17} />
          </button>
          <input
            type="text"
            value={tag}
            onChange={(evt) => handleChange(evt, idx)}
          />
        </div>
      ))}
      <button
        type='button'
        className='svg-button'
        style={{marginTop: '4px'}}
        onClick={handleAddTag}
      >
        <PlusSvg size={17} />
      </button>
    </fieldset>
  )
}
