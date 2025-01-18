import React from 'react'
import styled from 'styled-components'

import sampleTags from '../../data/sample_tags.json'
import sampleStatus from '../../data/sample_status.json'


const TagColumn = styled.label`
  flex: 1 0 12.5%;
`
const PickerDiv = styled.div`
  min-width: 1000px;
  max-width: 1000px;
  min-height: 250px;
  max-height: 250px;
`
const CatFieldset = styled.fieldset`
  justify-content: space-evenly;
`


export default function Picker() {
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

  return (
    <PickerDiv>
      <CatFieldset className='horizontalContainer'>
        <legend>Categories</legend>
        {sampleStatus.map(({status_id, status_name}) => (
          <label htmlFor={`status${status_id}`}>
            <input type="checkbox" key={`status${status_id}`} name={`status${status_id}`} />
            {status_name}
          </label>
        ))}
      </CatFieldset>
      <fieldset className='verticalContainer'>
        <legend>Tags</legend>
        {subDivideTags(sampleTags).map(row => (
          <div className='horizontalContainer'>
            {row.map(({tag_id, tag_name}) => (
              <TagColumn htmlFor={`tag${tag_id}`}>
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
