/* eslint-disable react/no-array-index-key */
import React from 'react'
import { useSelector } from 'react-redux'

import {
  MinusSvg,
  PlusSvg
} from '../../shared/svg'

import { Props } from './scrapers'
import { RootState } from '../../../types'


export default function Selectors({formData, setFormData}: Props) {
  const categories = useSelector((state: RootState) => state.data.categories)

  const handleAddItem = (type: 'site' | 'selector', site?: string) => {

  }

  const handleRemoveItem = (type: 'site' | 'selector', idx: number) => {

  }

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {

  }
  return (
    <fieldset className='scrapers'>
      <legend><h1>SITE SCRAPERS</h1></legend>
      <div className='scraper-header'>
        <span className='btn-span'/>
        <h2 className='short-span'>Site URL</h2>
        <span className='btn-span'/>
        <h2 className='medium-span'>Ref Type</h2>
        <h2 className='long-span'>JS Selector</h2>
        <h4 className='btn-span'>Query<br/>All</h4>
        <h2 className='matcher-span'>Matcher</h2>
        <h4 className='btn-span'>Limit<br/>Text</h4>
        <h2 className='medium-span'>Remove Text</h2>
      </div>
      <span className='separator' />

      <div className='vertical-container scrollable'>
        {formData.site_scrapers.map(({base_url, selectors}, index) => (
          <React.Fragment key={`scrapers-${index}`}>
            <div className='horizontal-container align-center'>
              <button
                type='button'
                className='svg-button center small'
                onClick={() => handleRemoveItem('site', index)}
              >
                <MinusSvg />
              </button>

              <input
                type="text"
                className='short'
                name='base_url'
                value={base_url}
                onChange={handleChange}
              />

              <div className='vertical-container'>
                {selectors.map(({type, selector, queryAll, regex, limit_text, remove_regex}, idx) => {
                  const selType = type.replace(/^category_/, 'category > ')
                  return (
                    <div className='horizontal-container align-center'>
                      <button
                        type='button'
                        className='svg-button small'
                        onClick={() => handleRemoveItem('selector', idx)}
                      >
                        <MinusSvg size={17} />
                      </button>

                      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                      <select
                        name="selector-type"
                        value={selType}
                        onChange={handleChange}
                      >
                        <option value="title">title</option>
                        <option value="description">description</option>
                        <option value="version">version</option>
                        <option value="tags">tags</option>
                        <option value="status">status</option>
                        {categories.map(({category_name}) => (
                          <option value={`category > ${category_name}`}>{`category > ${category_name}`}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        className='long'
                        name='selector-selector'
                        value={selector}
                        onChange={handleChange}
                      />

                      <input
                        type="checkbox"
                        name="selector-queryAll"
                        checked={queryAll}
                        onChange={handleChange}
                      />

                      <input
                        type="text"
                        name="selector-regex"
                        value={regex}
                        onChange={handleChange}
                      />

                      <input
                        type="checkbox"
                        name="selector-limit_text"
                        checked={limit_text}
                        onChange={handleChange}
                      />

                      <input
                        type="text"
                        name="selector-remove_regex"
                        value={remove_regex}
                        onChange={handleChange}
                      />
                    </div>
                  )
                })}

                <button
                  type='button'
                  className='svg-button small'
                  onClick={() => handleAddItem('selector', base_url)}
                >
                  <PlusSvg size={17} />
                </button>
              </div>
            </div>
            <span className='separator' />
          </React.Fragment>
        ))}
      </div>

      <button
        type='button'
        className='svg-button small'
        onClick={() => handleAddItem('site')}
      >
        <PlusSvg />
      </button>
    </fieldset>
  )
}