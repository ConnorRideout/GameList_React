import React from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'

// TODO: place style vars into redux store

const TagColumn = styled.label`
  flex: 1 0 12.5%;

  input {
    margin: 0 4px 0 0;
  }
`
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


export default function Picker({isBrowse}) {
  const categories = useSelector(state=> state.data.categories)
  const tags = useSelector(state => state.data.tags)
  const statuses = useSelector(state => state.data.statuses)

  const subDivideTags = data => {
    const tagsList = [...data]
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

  return (
    <PickerDiv>
      <CatFieldset className='horizontalContainer'>
        <legend className='header'>Categories</legend>
        {categories.map(({category_id, category_name, options}) => (
          <fieldset key={`${category_id}${category_name}`}>
            <legend>{`${category_name.slice(0,1).toUpperCase()}${category_name.slice(1)}`}</legend>
              <select name={category_name}>
                {[isBrowse ? 'Any' : '', ...options].map(opt => (
                  <option key={`${category_id} ${opt}`} value={opt}>{opt}</option>
                ))}
              </select>
          </fieldset>
        ))}
        <fieldset>
          <legend>Protagonist</legend>
          <select name="Protagonist">
            {[isBrowse ? 'Any' : '', ...protagonists].map(protag => (
              <option key={protag} value={protag}>{protag}</option>
            ))}
          </select>
        </fieldset>
        {statuses.map(({status_id, status_name}) => (
          <label key={`${status_id}${status_name}`} htmlFor={`status${status_id}`}>
            <input type="checkbox" key={`status${status_id}`} name={`status${status_id}`} />
            {status_name}
          </label>
        ))}
      </CatFieldset>
      <fieldset className='verticalContainer'>
        <legend className='header'>Tags</legend>
        {subDivideTags(tags).map((row, idx) => (
          <div key={`row${idx}`} className='horizontalContainer'>
            {row.map(({tag_id, tag_name}) => (
              <TagColumn key={`${tag_id}${tag_name}`} htmlFor={`tag${tag_id}`}>
                <input type="checkbox" key={`tag${tag_id}`} name={`tag${tag_id}`} />
                {tag_name}
              </TagColumn>
            ))}
          </div>
        ))}
      </fieldset>
    </PickerDiv>
  )
}
