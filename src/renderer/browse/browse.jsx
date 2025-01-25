import React from 'react'
import styled from 'styled-components'

import sampleData from '../../data/sample_data.json'
import Picker from '../shared/picker'
import Lineitem from './lineitem/lineitem'

const BrowseDiv = styled.div`
  align-items: center;
  max-height: calc(100vh - 5px);
`
const SearchFieldset = styled.fieldset`
  padding: 7px;
`


export default function Browse() {
  return (
    <BrowseDiv className='verticalContainer'>
      <SearchFieldset>
        <legend className='headerMax'>Search</legend>
        <Picker isBrowse={true}/>
      </SearchFieldset>
      <div className='gameScroll'>
        {sampleData.map(data => (
          <Lineitem key={data.game_id} lineData={data} />
        ))}
      </div>
    </BrowseDiv>
  )
}
