/* eslint-disable react/no-array-index-key */
import React from 'react'
import { useSelector } from 'react-redux'

import { MinusSvg, PlusSvg } from '../../shared/svg'

// eslint-disable-next-line import/no-cycle
import { Props } from './scrapers'
import { RootState } from '../../../types'


export default function Aliases({formData, setFormData}: Props) {
  const tags = useSelector((state: RootState) => state.data.tags)
  const statuses = useSelector((state: RootState) => state.data.statuses)
  const categories = useSelector((state: RootState) => state.data.categories)
  const category_options = categories.flatMap(c => c.options.map(o => [c.category_name, o]))

  const handleAddAlias = () => {

  }

  const handleRemoveAlias = (idx: number) => {

  }

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {

  }
  return (
    <fieldset className='aliases'>
      <legend><h1>SCRAPER ALIASES</h1></legend>
      <div className='scraper-header'>
        <span style={{minWidth: '10px'}} />
        <h2 className='short-span'>Site URL</h2>
        <span className='btn-span'/>
        <h2 className='medium-span'>Native Name</h2>
        <h2 className='medium-span'>Site Text</h2>
      </div>
      <span className='separator' />

      <div className='vertical-container scrollable'>
        <fieldset>
          <legend><h2>Tags</h2></legend>
          {Object.entries(formData.site_scraper_aliases.tags).map(([site, aliases], index) => (
            <React.Fragment key={`tags-${index}`}>
              <div className='horizontal-container align-center'>
                <input
                  type="text"
                  className='short'
                  name='aliases-base_url'
                  value={site}
                  onChange={handleChange}
                  disabled
                />

                <div className='vertical-container'>
                  {aliases.map(([site_text, tag], idx) => (
                    <div key={`tags-${index}-${idx}`} className='horizontal-container align-center'>
                      <button
                        type='button'
                        className='svg-button small'
                        onClick={() => handleRemoveAlias(idx)}
                      >
                        <MinusSvg size={17} />
                      </button>

                      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                      <select
                        name={`tags-${site}-${idx}`}
                        value={tag}
                        onChange={handleChange}
                      >
                        {tags.map(({tag_name, tag_id}) => (
                          <option key={`tag-${tag_id}`} value={tag_name}>{tag_name}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        name={`tags-${site}-${idx}`}
                        value={site_text}
                        onChange={handleChange}
                      />
                    </div>
                  ))}

                  <button
                    type='button'
                    className='svg-button small'
                    onClick={handleAddAlias}
                  >
                    <PlusSvg size={17} />
                  </button>
                </div>
              </div>
              {Object.keys(formData.site_scraper_aliases.tags).length > 1 && <span className='separator' />}
            </React.Fragment>
          ))}
        </fieldset>

        <fieldset>
          <legend><h2>Categories</h2></legend>
          {Object.entries(formData.site_scraper_aliases.categories).map(([site, aliases], index) => (
            <React.Fragment key={`categories-${index}`}>
              <div className='horizontal-container align-center'>
                <input
                  type="text"
                  className='short'
                  name='aliases-base_url'
                  value={site}
                  onChange={handleChange}
                  disabled
                />

                <div className='vertical-container'>
                  {aliases.map(([site_text, category], idx) => (
                    <div key={`categories-${index}-${idx}`} className='horizontal-container align-center'>
                      <button
                        type='button'
                        className='svg-button small'
                        onClick={() => handleRemoveAlias(idx)}
                      >
                        <MinusSvg size={17} />
                      </button>

                      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                      <select
                        name={`categories-${index}-${idx}`}
                        value={category}
                        onChange={handleChange}
                      >
                        {category_options.map(([category_name, option], i) => (
                          <option key={`tag-${index}-${i}`} value={option}>{`${category_name} > ${option}`}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        name={`categories-${index}-${idx}`}
                        value={site_text}
                        onChange={handleChange}
                      />
                    </div>
                  ))}

                  <button
                    type='button'
                    className='svg-button small'
                    onClick={handleAddAlias}
                  >
                    <PlusSvg size={17} />
                  </button>
                </div>
              </div>
              {Object.keys(formData.site_scraper_aliases.categories).length > 1 && <span className='separator' />}
            </React.Fragment>
          ))}
        </fieldset>

        <fieldset>
          <legend><h2>Statuses</h2></legend>
          {Object.entries(formData.site_scraper_aliases.statuses).map(([site, aliases], index) => (
            <React.Fragment key={`statuses-${index}`}>
              <div className='horizontal-container align-center'>
                <input
                  type="text"
                  className='short'
                  name='aliases-base_url'
                  value={site}
                  onChange={handleChange}
                  disabled
                />

                <div className='vertical-container'>
                  {aliases.map(([site_text, tag], idx) => (
                    <div key={`statuses-${index}-${idx}`} className='horizontal-container align-center'>
                      <button
                        type='button'
                        className='svg-button small'
                        onClick={() => handleRemoveAlias(idx)}
                      >
                        <MinusSvg size={17} />
                      </button>

                      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                      <select
                        name={`statuses-${index}-${idx}`}
                        value={tag}
                        onChange={handleChange}
                      >
                        {statuses.map(({status_name, status_id}) => (
                          <option key={`tag-${index}-${status_id}`} value={status_name}>{status_name}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        name={`statuses-${index}-${idx}`}
                        value={site_text}
                        onChange={handleChange}
                      />
                    </div>
                  ))}

                  <button
                    type='button'
                    className='svg-button small'
                    onClick={handleAddAlias}
                  >
                    <PlusSvg size={17} />
                  </button>
                </div>
              </div>
              {Object.keys(formData.site_scraper_aliases.statuses).length > 1 && <span className='separator' />}
            </React.Fragment>
          ))}
        </fieldset>
      </div>

    </fieldset>
  )
}