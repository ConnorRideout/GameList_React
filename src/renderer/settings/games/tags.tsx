import React, { useEffect, useRef, useState } from 'react'

import {
  PlusSvg,
  MinusSvg
} from "../../shared/svg"

// eslint-disable-next-line import/no-cycle
import { Props } from './games'


export default function Tags({formData, setFormData}: Props) {
  const [newTagAdded, setNewTagAdded] = useState(false)
  const tagRef = useRef<HTMLFieldSetElement>(null)
  useEffect(() => {
    if (newTagAdded && tagRef.current) {
      setNewTagAdded(false)
      tagRef.current.scrollTop = tagRef.current.scrollHeight
    }
  }, [newTagAdded])

  const handleRemoveTag = (idx: number) => {
    const newTags = [...formData.tags]
    newTags.splice(idx, 1)
    setFormData(prevValue => ({...prevValue, tags: newTags}))
  }

  const handleAddTag = () => {
    const newTags = [...formData.tags, '']
    setNewTagAdded(true)
    setFormData(prevValue => ({...prevValue, tags: newTags}))
  }

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const { value } = evt.target
    const newTags = [...formData.tags]
    newTags[idx] = value
    setFormData(prevValue => ({...prevValue, tags: newTags}))
  }

  return (
    <fieldset className='vertical-container scrollable grid-column-2' ref={tagRef}>
      <legend>TAGS</legend>

      {formData.tags.map((tag, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={`tag-${idx}`} className='horizontal-container align-center'>
          <button
            type='button'
            className='svg-button'
            onClick={() => handleRemoveTag(idx)}
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
