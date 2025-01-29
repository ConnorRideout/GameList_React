import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { getData } from '../../data/store/gamelibrary'
import Picker from '../shared/picker'
import Lineitem from './lineitem/lineitem'

const BrowseDiv = styled.div`
  align-items: center;
  max-height: calc(100vh - 5px);
`
const SearchFieldset = styled.fieldset`
  padding: 0 7px;
`
const SearchButtonDiv = styled.div`
  justify-content: space-evenly;
  padding: 3px;
  align-items: center;
  margin: 3px;
`


export default function Browse() {
  const dispatch = useDispatch()

  const gamelib = useSelector((state) => state.data.gamelib)
  const status = useSelector((state) => state.data.status)
  const error = useSelector((state) => state.data.error)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(getData())
    }
  }, [status, dispatch])

  return (
    <BrowseDiv className='verticalContainer'>
      <SearchFieldset className='verticalContainer'>
        <legend className='headerMax'>Search</legend>
        <Picker isBrowse/>
        <SearchButtonDiv className='horizontalContainer'>
          <button type='button'>Clear</button>
          <button type='button'>Search</button>
        </SearchButtonDiv>
      </SearchFieldset>
      <div className='gameScroll'>
        {status === 'loading' && <p>Loading...</p>}
        {status === 'succeeded' && gamelib.map(gamedata => (
          <Lineitem key={gamedata.game_id} lineData={gamedata} />
        ))}
        {status === 'failed' && <p>Error: {error}</p>}
      </div>
    </BrowseDiv>
  )
}
