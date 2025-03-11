import React from 'react'

import {
  PlusSvg,
  MinusSvg
} from "../../shared/svg"

// eslint-disable-next-line import/no-cycle
import { Props } from './games'


export default function Tags({formData, setFormData}: Props) {
  const {tags} = formData

  const handleChange = () => {}

  return (
    <fieldset className='vertical-container scrollable grid-column-2'>
      <legend>TAGS</legend>

      {tags.map(tag => (
        <div className='horizontal-container align-center'>
          <button
            type='button'
            className='svg-button'
          >
            <MinusSvg size={17} />
          </button>
          <input
            type="text"
            value={tag}
            onChange={handleChange}
          />
        </div>
      ))}
      <button
        type='button'
        className='svg-button'
        style={{marginTop: '4px'}}
      >
        <PlusSvg size={17} />
      </button>
    </fieldset>
  )
}
