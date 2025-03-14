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
    if (newTagAdded) {
      setTimeout(() => {
        // using a timeout ensures the component updates and shows any errors before trying to do anything
        setNewTagAdded(false)
        tagRef.current!.scrollTop = tagRef.current!.scrollHeight

        const lastInput = tagRef.current!.querySelector('input[type="text"][data-value="~~placeholder~~"]') as HTMLInputElement
        lastInput?.focus()
      }, 0)
    }
  }, [newTagAdded])

  const handleRemoveTag = (idx: number) => {
    const newTags = [...formData.tags]
    newTags.splice(idx, 1)
    setFormData(prevValue => ({...prevValue, tags: newTags}))
  }

  const handleAddTag = () => {
    const newTags = [...formData.tags, '~~placeholder~~']
    setNewTagAdded(true)
    setFormData(prevValue => ({...prevValue, tags: newTags}))
  }

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement> | {target: {value: string}}, idx: number) => {
    const { value } = evt.target
    const newTags = [...formData.tags]
    newTags[idx] = value
    setFormData(prevValue => ({...prevValue, tags: newTags}))
  }

  const handleBlur = (evt: React.FocusEvent<HTMLInputElement>, idx: number) => {
    const { value } = evt.target
    const newVal = value.trim()
    handleChange({target: {value: newVal}}, idx)
  }

  return (
    <fieldset className='vertical-container scrollable grid-column-2' ref={tagRef}>
      <legend>TAGS</legend>

      {formData.tags.map((tag, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={`tag-${idx}`} className='horizontal-container align-center'>
          <button
            type='button'
            className='svg-button small'
            onClick={() => handleRemoveTag(idx)}
          >
            <MinusSvg size={17} />
          </button>
          <input
            type="text"
            data-value={tag}
            value={tag === '~~placeholder~~' ? '' : tag}
            onChange={(evt) => handleChange(evt, idx)}
            onBlur={(evt) => handleBlur(evt, idx)}
          />
        </div>
      ))}
      <button
        type='button'
        className='svg-button small'
        style={{marginTop: '4px'}}
        onClick={handleAddTag}
      >
        <PlusSvg size={17} />
      </button>
    </fieldset>
  )
}
