/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect, ChangeEvent, useMemo } from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'

import TristateCheckbox from './tristateCheckbox'
import { RootState } from '../../data/types/types'


const PickerDiv = styled.div`
  min-width: 1000px;
  max-width: 1000px;
  min-height: fit-content;
  max-height: fit-content;
`
const CatFieldset = styled.fieldset`
  align-items: center;

  &>* {
    margin: 0 3px;
  }
  &>label {
    flex-grow: 1;
  }
`

export default function Picker({isBrowse}: {isBrowse: boolean}) {
  const categories = useSelector((state: RootState) => state.data.categories)
  const tags = useSelector((state: RootState) => state.data.tags)
  const statuses = useSelector((state: RootState) => state.data.statuses)

  const tagValues = useMemo(() => tags.map(({tag_name}) => tag_name), [tags])
  const statusValues = useMemo(() => statuses.map(({status_name}) => status_name), [statuses])
  const [formData, setFormData] = useState(() => ({
      tags: {},
      statuses: {},
      categories: {},
  }))

  useEffect(() => {
    const accumulator: {[key: string]: number | string} = {}
    setFormData({
      tags: tagValues.reduce((acc, cur) => {
        acc[cur] = isBrowse ? -1 : 0
        return acc
      }, {...accumulator}),
      statuses: statusValues.reduce((acc, cur) => {
        acc[cur] = isBrowse ? -1 : 0
        return acc
      }, {...accumulator}),
      categories: {...categories.reduce((acc, cur) => {
        const {category_name} = cur
        acc[category_name] = isBrowse ? 'Any' : ''
        return acc
      }, {...accumulator}), Protagonist: isBrowse ? 'Any' : ''},
  })
  }, [tagValues, statusValues, categories, isBrowse])

  const subDivideTags = () => {
    const tagsList = [...tags]
    const numRows = Math.ceil(tagsList.length / 8)
    const rows = []

    const baseRowSize = Math.floor(tagsList.length / numRows)
    const extraItems = tagsList.length % numRows
    for (let idx = 0; idx < numRows; idx++) {
      const currentRowSize = baseRowSize + (idx < extraItems ? 1 : 0)
      rows.push(tagsList.splice(0, currentRowSize))
    }
    return rows
  }
  const protagonists = ['Male', 'Female', 'Futa/Trans', 'Multiple', 'Created', 'Unknown']

  const handleFormChange = (evt: ChangeEvent<HTMLInputElement | HTMLSelectElement>, tristate: boolean = false) => {
    const {name, type, value, checked} = (evt.target as HTMLInputElement)
    let updated
    if (type === 'checkbox') {
      const val = {[name]: isBrowse ? (tristate ? -1 : Number(checked)) : Number(checked)}
      if (tagValues.includes(name)) updated = {tags: {...formData.tags, ...val}}
      else updated = {statuses: {...formData.statuses, ...val}}
    } else {
      // type is <select>
      updated = {categories: {...formData.categories, [name]: value}}
    }
    setFormData({...formData, ...updated})
  }

  return (
    <PickerDiv>
      <CatFieldset className='horizontal-container'>
        <legend className='header'>Categories</legend>
        {categories.map(({category_id, category_name, options}) => (
          <fieldset key={`${category_id}${category_name}`}>
            <legend>{`${category_name.slice(0,1).toUpperCase()}${category_name.slice(1)}`}</legend>
              <select
                name={category_name}
                onChange={handleFormChange}
              >
                {[isBrowse ? 'Any' : '', ...options].map(opt => (
                  <option key={`${category_id} ${opt}`} value={opt}>{opt}</option>
                ))}
              </select>
          </fieldset>
        ))}
        <fieldset>
          <legend>Protagonist</legend>
          <select
            name="Protagonist"
            onChange={handleFormChange}
          >
            {[isBrowse ? 'Any' : '', ...protagonists].map(protag => (
              <option key={protag} value={protag}>{protag}</option>
            ))}
          </select>
        </fieldset>
        {statuses.map(({status_id, status_name}) => (
          isBrowse ?
            <TristateCheckbox
              key={`${status_id}${status_name}`}
              labelText={status_name}
              handleFormChange={handleFormChange}
            />
            :
            <label
              key={`${status_id}${status_name}`}
            >
              <input
                type="checkbox"
                name={status_name}
                onChange={handleFormChange}
              />
              {status_name}
            </label>
        ))}
      </CatFieldset>
      <fieldset className='vertical-container'>
        <legend className='header'>Tags</legend>
        {subDivideTags().map((row, idx) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={`row${idx}`} className='horizontal-container'>
            {row.map(({tag_id, tag_name}) => (
              isBrowse ?
                <TristateCheckbox  style={{flex: '1 0 12.5%'}}
                  key={`${tag_id}${tag_name}`}
                  labelText={tag_name}
                  handleFormChange={handleFormChange}
                />
                :
                <label
                  style={{flex: '1 0 12.5%'}}
                  key={`${tag_id}${tag_name}`}
                >
                  <input
                    type="checkbox"
                    name={tag_name}
                    onChange={handleFormChange}
                  />
                  {tag_name}
                </label>
            ))}
          </div>
        ))}
      </fieldset>
    </PickerDiv>
  )
}
