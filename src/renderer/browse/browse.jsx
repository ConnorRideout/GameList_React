import React from 'react'
import styled from 'styled-components'

import sampleData from '../../data/sample_data.json'
import Picker from '../shared/picker'
import Lineitem from './lineitem/lineitem'


const BrowseDiv = styled.div`
  align-items: center;
  max-height: calc(100vh - 5px);
`


export default function Browse() {
  return (
    <BrowseDiv className='verticalContainer'>
      <Picker />
      <div className='gameScroll'>
        {sampleData.map(data => (
          <Lineitem key={data.game_id} lineData={data} />
        ))}
      </div>
    </BrowseDiv>
  )
}
