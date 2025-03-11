import React, { useRef, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

import {
  MinusSvg,
  PlusSvg
} from "../../shared/svg"

// eslint-disable-next-line import/no-cycle
import { Props } from './games'
import { RootState } from '../../../types'


export default function Statuses({formData, setFormData}: Props) {
  const defaultFontColor = useSelector((state: RootState) => state.data.styleVars.$fgNormal)
  const [newStatusAdded, setNewStatusAdded] = useState(false)
  const statusRef = useRef<HTMLFieldSetElement>(null)

  useEffect(() => {
      if (newStatusAdded && statusRef.current) {
        setNewStatusAdded(false)
        statusRef.current.scrollTop = statusRef.current.scrollHeight
      }
    }, [newStatusAdded])

  const handleRemoveStatus = (idx: number) => {
    const newStatuses = [...formData.statuses]
    newStatuses.splice(idx, 1)
    setFormData(prevValue => ({...prevValue, statuses: newStatuses}))
  }

  const handleAddStatus = () => {
    const status_ids = formData.statuses.map(s => s.status_id)
    const status_id = Math.max(...status_ids) + 1
    const status_priorities = formData.statuses.map(s => s.status_priority)
    const status_priority = Math.max(...status_priorities) + 1
    const newStatuses = [...formData.statuses, {
      status_id,
      status_name: '',
      status_priority,
      status_color: defaultFontColor.toUpperCase(),
      status_color_applies_to: 'title'
    }]
    setNewStatusAdded(true)
    setFormData(prevValue => ({...prevValue, statuses: newStatuses}))
  }

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, idx: number) => {
    // eslint-disable-next-line prefer-const
    let { name, value } = evt.target
    if (name === 'status_color') {
      value = value.toUpperCase()
      if (!/^#[A-F0-9]{0,6}$/.test(value)) return
    }
    const oldStatuses = formData.statuses.map(status => ({...status}))
    oldStatuses[idx][name] = value
    setFormData(prevValue => ({...prevValue, statuses: oldStatuses}))
  }

  return (
    <fieldset className='vertical-container scrollable grid-column-2' ref={statusRef}>
      <legend>STATUSES</legend>

      <div className='horizontal-container'>
        <span style={{minWidth: 22}} />
        <span style={{minWidth: '1.165rem'}}/>
        <h2>Status Name</h2>
        <h2 style={{maxWidth: '8rem'}}>Color</h2>
        <h3>Applies to...</h3>
      </div>

      {formData.statuses.map(({status_id, status_name, status_priority, status_color, status_color_applies_to}, idx) => (
        <div key={`status-${status_id}`} className='horizontal-container align-center'>
          <button
            type='button'
            className='svg-button'
            onClick={() => handleRemoveStatus(idx)}
          >
            <MinusSvg size={17} />
          </button>
          <p>{status_priority}.</p>
          <input
            type="text"
            name='status_name'
            value={status_name}
            onChange={(evt) => handleChange(evt, idx)}
          />
          <input
            className='color-input'
            type="text"
            name='status_color'
            value={status_color}
            onChange={(evt) => handleChange(evt, idx)}
          />
          <input
            type="color"
            name='status_color'
            value={status_color}
            onChange={(evt) => handleChange(evt, idx)}
          />
          <select
            name='status_color_applies_to'
            value={status_color_applies_to}
            onChange={(evt) => handleChange(evt, idx)}
          >
            <option value="title">Title</option>
            <option value="version">Version</option>
            <option value="categories">Categories</option>
            <option value="tags">Tags</option>
            <option value="description">Description</option>
          </select>
        </div>
      ))}
      <button
        type='button'
        className='svg-button'
        style={{marginTop: '4px'}}
        onClick={handleAddStatus}
      >
        <PlusSvg size={17} />
      </button>
    </fieldset>
  )
}
