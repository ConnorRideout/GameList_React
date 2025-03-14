/* eslint-disable react/no-array-index-key */
// TODO: option to hide 'beaten' games from recent lists
// TODO: file dialog for game folder and locale emulator
import React, { useEffect, useRef, useState } from 'react'

import {
  MinusSvg,
  PlusSvg
} from '../shared/svg'

// eslint-disable-next-line import/no-cycle
import { DefaultDisplayFormType } from './settings'


interface Props {
  formData: DefaultDisplayFormType,
  setFormData: React.Dispatch<React.SetStateAction<DefaultDisplayFormType>>
}
export default function Display({formData, setFormData}: Props) {
  const [newFiletypeAdded, setNewFiletypeAdded] = useState(false)
  const filetypesRef = useRef<HTMLFieldSetElement>(null)

  useEffect(() => {
    if (newFiletypeAdded && filetypesRef.current) {
      setNewFiletypeAdded(false)
      const newItem = filetypesRef.current.querySelector("input[type='text'][data-value='~~placeholder~~']") as HTMLInputElement
      if (newItem) {
        // scroll the + button into view
        newItem.parentElement?.nextElementSibling?.scrollIntoView({block: 'nearest'})
        newItem.focus()
      }
    }
  }, [newFiletypeAdded])

  const handleRemoveItem = (type: 'Executables' | 'ign_exe' | 'Images', idx: number) => {
    if (type === 'ign_exe') {
      const newIgnExes = [...formData.ignored_exes]
      newIgnExes.splice(idx, 1)
      setFormData(prevVal => ({...prevVal, ignored_exes: newIgnExes}))
    } else {
      const newVal = [...formData.file_types[type]]
      newVal.splice(idx, 1)
      setFormData(prevVal => ({...prevVal, file_types: {...prevVal.file_types, [type]: newVal}}))
    }
  }

  const handleAddItem = (type: 'Executables' | 'ign_exe' | 'Images') => {
    setNewFiletypeAdded(true)

    if (type === 'ign_exe') {
      const newIgnExes = [...formData.ignored_exes, '~~placeholder~~']
      setFormData(prevVal => ({...prevVal, ignored_exes: newIgnExes}))
    } else {
      const newVal = [...formData.file_types[type], '~~placeholder~~']
      setFormData(prevVal => ({...prevVal, file_types: {...prevVal.file_types, [type]: newVal}}))
    }
  }

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement> | {target: {value: string, name: string}}, idx?: number) => {
    const { name, value } = evt.target
    if (['games_folder', 'locale_emulator'].includes(name)) {
      setFormData(prevVal => ({...prevVal, [name]: value}))
    } else if (name === 'ignored_exes') {
      const newIgnExes = [...formData.ignored_exes]
      newIgnExes[idx!] = value
      setFormData(prevVal => ({...prevVal, ignored_exes: newIgnExes}))
    } else {
      const newVal = [...formData.file_types[name]]
      newVal[idx!] = value
      setFormData(prevVal => ({...prevVal, file_types: {...prevVal.file_types, [name]: newVal}}))
    }
  }

  const handleBlur = (evt: React.FocusEvent<HTMLInputElement>, idx: number) => {
    const { name, value } = evt.target
    const newVal = value.trim()
    handleChange({target: {name, value: newVal}}, idx)
  }

  return (
    <div className='settings-display-container'>
      <fieldset>
        <legend><h2>Directories</h2></legend>
        <label>
          Games folder:
          <input
            type="text"
            className='long'
            name="games_folder"
            value={formData.games_folder}
            onChange={handleChange}
          />
        </label>

        <label>
          Locale emulator location:
          <input
            type="text"
            className='long'
            name="locale_emulator"
            value={formData.locale_emulator}
            onChange={handleChange}
          />
        </label>
      </fieldset>

      <fieldset className='scrollable' ref={filetypesRef}>
        <legend><h2>File Types</h2></legend>
        <div className='label'>
          <span>Executables:<span>?</span></span>
          {formData.file_types.Executables.map((exe, idx) => (
            <div key={`filetypes-exes-${idx}`} className='horizontal-container align-center'>
              <button
                type='button'
                className='svg-button small'
                onClick={() => handleRemoveItem('Executables', idx)}
              >
                <MinusSvg size={17} />
              </button>
              <input
                key={`exe-${idx}`}
                type="text"
                className='short'
                name="Executables"
                data-value={exe}
                value={exe === '~~placeholder~~' ? '' : exe}
                onChange={(evt) => handleChange(evt, idx)}
                onBlur={(evt) => handleBlur(evt, idx)}
              />
            </div>
          ))}

          <button
            type='button'
            className='svg-button small'
            onClick={() => handleAddItem('Executables')}
          >
            <PlusSvg size={17} />
          </button>
        </div>

        <span className='separator' />

        <div className='label'>
          <span>Ignored executables:<span>?</span></span>
          {formData.ignored_exes.map((ign_exe, idx) => (
            <div key={`ignored-exes-${idx}`} className='horizontal-container align-center'>
              <button
                type='button'
                className='svg-button small'
                onClick={() => handleRemoveItem('ign_exe', idx)}
              >
                <MinusSvg size={17} />
              </button>
              <input
                key={`ign-exe-${idx}`}
                type="text"
                className='medium'
                name="ignored_exes"
                data-value={ign_exe}
                value={ign_exe === '~~placeholder~~' ? '' : ign_exe}
                onChange={(evt) => handleChange(evt, idx)}
                onBlur={(evt) => handleBlur(evt, idx)}
              />
            </div>
          ))}

          <button
            type='button'
            className='svg-button small'
            onClick={() => handleAddItem('ign_exe')}
          >
            <PlusSvg size={17} />
          </button>
        </div>

        <span className='separator' />

        <div className='label'>
          <span>Images:<span>?</span></span>
          {formData.file_types.Images.map((img, idx) => (
            <div key={`filetypes-images-${idx}`} className='horizontal-container align-center'>
              <button
                type='button'
                className='svg-button small'
                onClick={() => handleRemoveItem('Images', idx)}
              >
                <MinusSvg size={17} />
              </button>
              <input
                key={`img-${idx}`}
                type="text"
                className='short'
                name="Images"
                data-value={img}
                value={img === '~~placeholder~~' ? '' : img}
                onChange={(evt) => handleChange(evt, idx)}
                onBlur={(evt) => handleBlur(evt, idx)}
              />
            </div>
          ))}

          <button
            type='button'
            className='svg-button small'
            onClick={() => handleAddItem('Images')}
          >
            <PlusSvg size={17} />
          </button>
        </div>
      </fieldset>
    </div>
  )
}
