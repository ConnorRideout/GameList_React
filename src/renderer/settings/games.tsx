// TODO: options for editing the categories/tags/etc
import React from 'react'

import {
  PlusSvg,
  FileSearchSvg,
  MinusSvg
} from "../shared/svg"

import { DefaultFormType } from './settings'



interface Props {
  formData: DefaultFormType
}
export default function Games({formData}: Props) {
  const {categories, statuses, tags} = formData
  return (
    <div className='settings-games-container'>
      <fieldset className='vertical-container'>
        <legend>CATEGORIES</legend>
        <div className='horizontal-container'>
          <span style={{minWidth: 22}} />
          <h2>Category Name</h2>
          <span style={{minWidth: 17}} />
          <h2>Category Options</h2>
          <h3>Default Option</h3>
        </div>
        {categories.map(({category_id,category_name,options,default_option}) => {
          return (
            <>
              <div className='horizontal-container'>
                <button
                  type='button'
                  className='svg-button center'
                >
                  <MinusSvg />
                </button>
                <input
                  type="text"
                  value={category_name}
                />
                <div className='vertical-container'>
                  {options.map(opt => (
                    <div key={`${category_id}-${opt}`} className='horizontal-container align-center'>
                      <button
                        type='button'
                        className='svg-button'
                      >
                        <MinusSvg size={17} />
                      </button>
                      <input
                        type="text"
                        value={opt}
                      />
                      <input
                        type="radio"
                        name={`category-${category_id}`}
                        value={opt}
                        checked={opt === default_option}
                      />
                    </div>
                  ))}
                  <button
                    type='button'
                    className='svg-button'
                  >
                    <PlusSvg size={17} />
                  </button>
                </div>
              </div>
              <span className='separator'/>
            </>
          )
        })}
        <button
          type='button'
          className='svg-button'
        >
          <PlusSvg />
        </button>
      </fieldset>

      <fieldset className='vertical-container'>
        <legend>STATUSES</legend>

        <div className='horizontal-container'>
          <h2>head</h2>
        </div>

        {statuses.map(({status_id, status_name, status_priority, status_color, status_color_applies_to}) => {
          return (
            <div className='horizontal-container'>
              {status_name}
            </div>
          )
        })}
      </fieldset>
    </div>
  )
}
