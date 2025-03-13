/* eslint-disable react/no-array-index-key */
// TODO: option to hide 'beaten' games from recent lists
// TODO: file dialog for game folder and locale emulator
import React from 'react'

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
  const handleRemoveItem = (type: 'exe' | 'ign_exe' | 'img', idx: number) => {

  }

  const handleAddItem = (type: 'exe' | 'ign_exe' | 'img') => {

  }

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {

  }

  return (
    <div className='settings-display-container scrollable'>
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

      <fieldset>
        <legend><h2>File Types</h2></legend>
        <div className='label'>
          <span>Executables:<span>?</span></span>
          {formData.file_types.Executables.map((exe, idx) => (
            <div key={`filetypes-exes-${idx}`} className='horizontal-container align-center'>
              <button
                type='button'
                className='svg-button small'
                onClick={() => handleRemoveItem('exe', idx)}
              >
                <MinusSvg size={17} />
              </button>
              <input
                key={`exe-${idx}`}
                type="text"
                className='short'
                name="executable"
                value={exe}
                onChange={handleChange}
              />
            </div>
          ))}

          <button
            type='button'
            className='svg-button small'
            onClick={() => handleAddItem('exe')}
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
                value={ign_exe}
                onChange={handleChange}
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
                onClick={() => handleRemoveItem('img', idx)}
              >
                <MinusSvg size={17} />
              </button>
              <input
                key={`img-${idx}`}
                type="text"
                className='short'
                name="image"
                value={img}
                onChange={handleChange}
              />
            </div>
          ))}

          <button
            type='button'
            className='svg-button small'
            onClick={() => handleAddItem('img')}
          >
            <PlusSvg size={17} />
          </button>
        </div>
      </fieldset>
    </div>
  )
}
