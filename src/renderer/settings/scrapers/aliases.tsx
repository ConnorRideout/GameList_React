/* eslint-disable react/no-array-index-key */
import React, { useEffect, useRef, useState } from 'react'
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
  const aliasRef = useRef<HTMLDivElement>(null)
  const [newAliasAdded, setNewAliasAdded] = useState(false)

  useEffect(() => {
    if (newAliasAdded) {
      // using a timeout ensures the component updates and shows any errors before trying to do anything
      setTimeout(() => {
        const newItem = aliasRef.current!.querySelector("input[type='text'][data-value='~~placeholder~~']") as HTMLInputElement
        newItem?.parentElement?.nextElementSibling?.scrollIntoView({block: 'nearest'})
        newItem?.focus()
        setNewAliasAdded(false)
      }, 0)
    }
  }, [newAliasAdded])

  const handleAddAlias = (type: 'tags' | 'categories' | 'statuses', website_id: number) => {
    // FIXME: currently broken
    const scraper = {...formData.find(s => s.website_id === website_id)!}
    // const aliases = [...scraper.aliases[type]]
    // aliases.push(["~~placeholder~~", ""])
    // type_aliases[site] = aliases

    // const type_aliases = {...formData.site_scraper_aliases[type]}
    // const aliases = [...type_aliases[site]]
    // aliases.push(["~~placeholder~~", ""])
    // type_aliases[site] = aliases

    // setNewAliasAdded(true)
    // setFormData(prevVal => ({...prevVal, site_scraper_aliases: {...prevVal.site_scraper_aliases, [type]: type_aliases}}))
  }

  const handleRemoveAlias = (type: 'tags' | 'categories' | 'statuses', site: string, alias_idx: number) => {
    // FIXME: currently broken
    // const type_aliases = {...formData.site_scraper_aliases[type]}
    // const aliases = [...type_aliases[site]]
    // aliases.splice(alias_idx, 1)
    // type_aliases[site] = aliases

    // setFormData(prevVal => ({...prevVal, site_scraper_aliases: {...prevVal.site_scraper_aliases, [type]: type_aliases}}))
  }

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | {target: {name: string, value: string}}) => {
    // FIXME: currently broken
    // const {name, type, value} = evt.target as HTMLInputElement
    // const [alias_type, site, str_idx] = name.split('-')
    // const idx = parseInt(str_idx)
    // const new_alias_types = {...formData.site_scraper_aliases[alias_type]}
    // const new_aliases: [string, string][] = new_alias_types[site].map(alias => ([...alias]))
    // // type will be undefined if it's the selector, i.e. the el of the array at idx 1
    // new_aliases[idx][Number(type !== 'text')] = value
    // new_alias_types[site] = new_aliases

    // setFormData(prevVal => ({...prevVal, site_scraper_aliases: {...prevVal.site_scraper_aliases, [alias_type]: new_alias_types}}))
  }

  const handleBlur = (evt: React.FocusEvent<HTMLInputElement>) => {
    const {name, type, value} = evt.target
    const newVal = value.trim()
    handleChange({target: {name, type, value: newVal}})
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

      <div className='vertical-container scrollable' ref={aliasRef}>
        <fieldset>
          <legend><h2>Tags</h2></legend>
          {formData.map(({website_id, base_url, aliases: site_aliases}, index) => (
            <React.Fragment key={`tags-${index}`}>
              <div className='horizontal-container align-center'>
                <input
                  type="text"
                  className='short'
                  name='aliases-base_url'
                  value={base_url}
                  disabled
                />

                <div className='vertical-container'>
                  {site_aliases.tags.map(([site_text, tag], idx) => (
                    <div key={`tags-${index}-${idx}`} className='horizontal-container align-center'>
                      <button
                        type='button'
                        className='svg-button small'
                        onClick={() => handleRemoveAlias('tags', base_url, idx)}
                      >
                        <MinusSvg size={17} />
                      </button>

                      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                      <select
                        name={`tags-${base_url}-${idx}`}
                        value={tag}
                        onChange={handleChange}
                      >
                        {formData[index].aliases.tags[idx][1] === "" && (
                          <option value="">{}</option>
                        )}
                        {tags.map(({tag_name, tag_id}) => (
                          <option key={`tag-${tag_id}`} value={tag_name}>{tag_name}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        name={`tags-${base_url}-${idx}`}
                        data-value={site_text}
                        value={site_text === "~~placeholder~~" ? "" : site_text}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </div>
                  ))}

                  <button
                    type='button'
                    className='svg-button small'
                    onClick={() => handleAddAlias('tags', website_id)}
                  >
                    <PlusSvg size={17} />
                  </button>
                </div>
              </div>
              {Object.keys(formData[index].aliases.tags).length > 1 && <span className='separator' />}
            </React.Fragment>
          ))}
        </fieldset>

        <fieldset>
          <legend><h2>Categories</h2></legend>
          {formData.map(({website_id, base_url, aliases: site_aliases}, index) => (
            <React.Fragment key={`categories-${index}`}>
              <div className='horizontal-container align-center'>
                <input
                  type="text"
                  className='short'
                  name='aliases-base_url'
                  value={base_url}
                  onChange={handleChange}
                  disabled
                />

                <div className='vertical-container'>
                  {site_aliases.categories.map(([site_text, category], idx) => (
                    <div key={`categories-${index}-${idx}`} className='horizontal-container align-center'>
                      <button
                        type='button'
                        className='svg-button small'
                        onClick={() => handleRemoveAlias('categories', base_url, idx)}
                      >
                        <MinusSvg size={17} />
                      </button>

                      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                      <select
                        name={`categories-${base_url}-${idx}`}
                        value={category}
                        onChange={handleChange}
                      >
                        {formData[index].aliases.categories[idx][1] === "" && (
                          <option value="">{}</option>
                        )}
                        {category_options.map(([category_name, option], i) => (
                          <option key={`tag-${index}-${i}`} value={option}>{`${category_name} > ${option}`}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        name={`categories-${base_url}-${idx}`}
                        data-value={site_text}
                        value={site_text === "~~placeholder~~" ? "" : site_text}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </div>
                  ))}

                  <button
                    type='button'
                    className='svg-button small'
                    onClick={() => handleAddAlias('categories', website_id)}
                  >
                    <PlusSvg size={17} />
                  </button>
                </div>
              </div>
              {Object.keys(formData[index].aliases.categories).length > 1 && <span className='separator' />}
            </React.Fragment>
          ))}
        </fieldset>

        <fieldset>
          <legend><h2>Statuses</h2></legend>
          {formData.map(({website_id, base_url, aliases: site_aliases}, index) => (
            <React.Fragment key={`statuses-${index}`}>
              <div className='horizontal-container align-center'>
                <input
                  type="text"
                  className='short'
                  name='aliases-base_url'
                  value={base_url}
                  onChange={handleChange}
                  disabled
                />

                <div className='vertical-container'>
                  {site_aliases.statuses.map(([site_text, tag], idx) => (
                    <div key={`statuses-${base_url}-${idx}`} className='horizontal-container align-center'>
                      <button
                        type='button'
                        className='svg-button small'
                        onClick={() => handleRemoveAlias('statuses', base_url, idx)}
                      >
                        <MinusSvg size={17} />
                      </button>

                      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                      <select
                        name={`statuses-${base_url}-${idx}`}
                        value={tag}
                        onChange={handleChange}
                      >
                        {formData[index].aliases.statuses[idx][1] === "" && (
                          <option value="">{}</option>
                        )}
                        {statuses.map(({status_name, status_id}) => (
                          <option key={`tag-${index}-${status_id}`} value={status_name}>{status_name}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        name={`statuses-${base_url}-${idx}`}
                        data-value={site_text}
                        value={site_text === "~~placeholder~~" ? "" : site_text}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </div>
                  ))}

                  <button
                    type='button'
                    className='svg-button small'
                    onClick={() => handleAddAlias('statuses', website_id)}
                  >
                    <PlusSvg size={17} />
                  </button>
                </div>
              </div>
              {/* FIXME: all these separators don't properly show. Need to check if there's more than 1 WEBSITE that has aliases */}
              {Object.keys(formData[index].aliases.statuses).length > 1 && <span className='separator' />}
            </React.Fragment>
          ))}
        </fieldset>
      </div>

    </fieldset>
  )
}
