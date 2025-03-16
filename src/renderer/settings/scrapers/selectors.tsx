/* eslint-disable import/no-cycle */
/* eslint-disable react/no-array-index-key */
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import {
  MinusSvg,
  PlusSvg
} from '../../shared/svg'
import Tooltip from '../../shared/tooltip'

import { Props } from './scrapers'
import { RootState } from '../../../types'


export default function Selectors({formData, setFormData}: Props) {
  const categories = useSelector((state: RootState) => state.data.categories)
  const scraperRef = useRef<HTMLDivElement>(null)
  const [newScraperAdded, setNewScraperAdded] = useState(false)
  const [newSelectorAdded, setNewSelectorAdded] = useState(false)

  useEffect(() => {
    if ((newScraperAdded || newSelectorAdded) && scraperRef.current) {
      const newItem = scraperRef.current.querySelector("input[type='text'][data-value='~~placeholder~~']") as HTMLInputElement
      if (newScraperAdded)
        newItem.parentElement?.nextElementSibling?.nextElementSibling?.scrollIntoView({block: 'nearest'})
      else
        newItem.parentElement?.nextElementSibling?.scrollIntoView({block: 'nearest'})
      newItem.focus()
      if (newScraperAdded)
        setNewScraperAdded(false)
      else
        setNewSelectorAdded(false)
    }
  }, [newScraperAdded, newSelectorAdded])

  const handleAddItem = (scraper_idx?: number) => {
    let site_scrapers: Props['formData']['site_scrapers']
    if (scraper_idx === undefined) {
      site_scrapers = [...formData.site_scrapers, {
        base_url: '~~placeholder~~',
        selectors: []
      }]
      setNewScraperAdded(true)
    } else {
      site_scrapers = formData.site_scrapers.map(scraper => ({...scraper}))
      const newSelectors = [...site_scrapers[scraper_idx].selectors]
      newSelectors.push({
        type: '',
        selector: '~~placeholder~~',
        queryAll: false,
        regex: '',
        limit_text: false,
        remove_regex: '',
      })
      site_scrapers[scraper_idx].selectors = newSelectors
      setNewSelectorAdded(true)
    }
    setFormData(prevVal => ({...prevVal, site_scrapers}))
  }

  const handleRemoveItem = (scraper_idx: number, selector_idx?: number) => {
    let site_scrapers: Props['formData']['site_scrapers']
    if (selector_idx === undefined) {
      site_scrapers = [...formData.site_scrapers]
      site_scrapers.splice(scraper_idx, 1)
    } else {
      site_scrapers = formData.site_scrapers.map(scraper => ({...scraper}))
      const newSelectors = [...site_scrapers[scraper_idx].selectors]
      newSelectors.splice(selector_idx, 1)
      site_scrapers[scraper_idx].selectors = newSelectors
    }
    setFormData(prevVal => ({...prevVal, site_scrapers}))
  }

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | {target: {name: string, value: string}}, scraper_idx: number, selector_idx?: number) => {
    const { name, type, value, checked } = evt.target as HTMLInputElement
    // name == base_url | selector-type | selector-selector | selector-queryAll | selector-regex | selector-limit_text | selector-remove_regex
    const site_scrapers = formData.site_scrapers.map(scraper => ({...scraper}))
    if (name === 'base_url') {
      site_scrapers[scraper_idx].base_url = value
    } else if (selector_idx !== undefined) {
      const key = name.split('-')[1]
      const selector = {...site_scrapers[scraper_idx].selectors[selector_idx]}
      selector[key] = type === 'checkbox' ? checked : value
      site_scrapers[scraper_idx].selectors[selector_idx] = selector
    }
    setFormData(prevVal => ({...prevVal, site_scrapers}))
  }

  const handleBlur = (evt: React.FocusEvent<HTMLInputElement>, scraper_idx: number, selector_idx?: number) => {
    const { name, value } = evt.target
    const newVal = value.trim()
    handleChange({target: {value: newVal, name}}, scraper_idx, selector_idx)
  }

  return (
    <fieldset className='scrapers'>
      <legend><h1>SITE SCRAPERS</h1></legend>
      <div className='scraper-header'>
        <span className='btn-span'/>
        <h2 className='short-span'>
          Site URL
          <span
            data-tooltip-id="selectors-info-tooltip"
            data-tooltip-content="The base URL of the website to scrape (i.e. 'google.com')"
          >?</span>
        </h2>
        <span className='btn-span'/>
        <h2 className='medium-span'>
          Ref Type
          <span
            data-tooltip-id="selectors-info-tooltip"
            data-tooltip-content="The type of data we expect to get from the JS Selector's text content. References either user-defined values from <Game Preferences>, or one of 'title', 'version', or 'description'"
          >?</span>
        </h2>
        <h2 className='long-span'>
          JS Selector
          <span
            data-tooltip-id="selectors-info-tooltip"
            data-tooltip-content="The JavaScript selector that will be passed to 'document.querySelector[All]' on the game's webpage"
          >?</span>
        </h2>
        <h4 className='btn-span'>
          Query<br/>All<br/>
          <span
            data-tooltip-id="selectors-info-tooltip"
            data-tooltip-content="Whether to use 'document.querySelector()' or 'document.querySelectorAll()'"
          >?</span>
        </h4>
        <h2 className='matcher-span'>
          Matcher
          <span
            data-tooltip-id="selectors-info-tooltip"
            data-tooltip-html="A regex matcher. The regex MUST include a group that will be what gets returned. If there is more than 1 group defined, only the first will be returned.<br />
              <br />
              - If [Ref Type] is 'title', 'version', or 'description', and [Query All] is selected, the matcher will be run against all elements found with [JS Selector] and the first element with text content that matches the regex.<br />
              -- If not [Query All], the matcher is run against the text content of the element found with [JS Selector].<br />
              <br />
              - If [Ref Type] is not one of the 3 mentioned above, and [Query All] is selected, the matcher will be compared to every text content of the elements found with [JS Selector]. Text contents that match the matcher will be returned as an array.<br />
              -- If not [Query All], the matcher will find every instance of text that matches the regex within the [JS Selector]'s text content and return that array instead."
          >?</span>
        </h2>
        <h4 className='btn-span'>
          Limit<br/>Text<br/>
          <span
            data-tooltip-id="selectors-info-tooltip"
            data-tooltip-content="Whether to limit the text that is gotten from the element to the top-level element only, or to get all text from the element and all its children"
          >?</span>
        </h4>
        <h2 className='medium-span'>
          Remove Text
          <span
            data-tooltip-id="selectors-info-tooltip"
            data-tooltip-content="This regex will be run against all matches immediately before returning, and will remove matched content. The entire match will be removed, meaning groups don't matter"
          >?</span>
        </h2>
        <Tooltip id="selectors-info-tooltip"/>
      </div>
      <span className='separator' />

      <div className='vertical-container scrollable' ref={scraperRef}>
        {formData.site_scrapers.map(({base_url, selectors}, index) => (
          <React.Fragment key={`scrapers-${index}`}>
            <div className='horizontal-container align-center'>
              <button
                type='button'
                className='svg-button center small'
                onClick={() => handleRemoveItem(index)}
              >
                <MinusSvg />
              </button>

              <input
                type="text"
                className='short'
                name='base_url'
                data-value={base_url}
                value={base_url === "~~placeholder~~" ? "" : base_url}
                onChange={(evt) => handleChange(evt, index)}
                onBlur={(evt) => handleBlur(evt, index)}
              />

              <div className='vertical-container'>
                {selectors.map(({type, selector, queryAll, regex, limit_text, remove_regex}, idx) => {
                  return (
                    <div key={`scrapers-${index}-${idx}`} className='horizontal-container align-center'>
                      <button
                        type='button'
                        className='svg-button small'
                        onClick={() => handleRemoveItem(index, idx)}
                      >
                        <MinusSvg size={17} />
                      </button>

                      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                      <select
                        name="selector-type"
                        value={type}
                        onChange={(evt) => handleChange(evt, index, idx)}
                      >
                        {formData.site_scrapers[index].selectors[idx].type === '' && (
                          <option value="">{}</option>
                        )}
                        <option
                          value="title"
                          disabled={formData.site_scrapers[index].selectors.find(sel => sel.type === "title") && formData.site_scrapers[index].selectors[idx].type !== "title"}
                        >title</option>
                        <option
                          value="description"
                          disabled={formData.site_scrapers[index].selectors.find(sel => sel.type === "description") && formData.site_scrapers[index].selectors[idx].type !== "description"}
                        >description</option>
                        <option
                          value="version"
                          disabled={formData.site_scrapers[index].selectors.find(sel => sel.type === "version") && formData.site_scrapers[index].selectors[idx].type !== "version"}
                        >version</option>
                        <option value="tags">tags</option>
                        <option value="status">status</option>
                        {categories.map(({category_name}, i) => (
                          <option
                            key={`scrapers-${index}-${idx}-${i}`}
                            value={`category_${category_name}`}
                          >
                            {`category > ${category_name}`}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        className='long'
                        name='selector-selector'
                        data-value={selector}
                        value={selector === "~~placeholder~~" ? "" : selector}
                        onChange={(evt) => handleChange(evt, index, idx)}
                        onBlur={(evt) => handleBlur(evt, index, idx)}
                      />

                      <input
                        type="checkbox"
                        name="selector-queryAll"
                        checked={queryAll}
                        onChange={(evt) => handleChange(evt, index, idx)}
                      />

                      <input
                        type="text"
                        name="selector-regex"
                        value={regex}
                        onChange={(evt) => handleChange(evt, index, idx)}
                      />

                      <input
                        type="checkbox"
                        name="selector-limit_text"
                        checked={limit_text}
                        onChange={(evt) => handleChange(evt, index, idx)}
                      />

                      <input
                        type="text"
                        name="selector-remove_regex"
                        value={remove_regex}
                        onChange={(evt) => handleChange(evt, index, idx)}
                      />
                    </div>
                  )
                })}

                <button
                  type='button'
                  className='svg-button small'
                  onClick={() => handleAddItem(index)}
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
        onClick={() => handleAddItem()}
      >
        <PlusSvg />
      </button>
    </fieldset>
  )
}
