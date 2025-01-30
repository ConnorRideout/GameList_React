import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { getData } from '../../data/store/gamelibrary'
import Picker from '../shared/picker'
import Lineitem from './lineitem/lineitem'

const BrowseDiv = styled.div`
  align-items: center;
  max-height: calc(100vh - 5px);
  position: relative;
  z-index: 1;
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

  const scrollToLetter = letter => {
    const item = document.querySelector(`div[data-name^="${letter}"`)
    if (item) {
      item.scrollIntoView({behavior: 'smooth', block: 'start'})
    }
  }

  return (
    <BrowseDiv className='vertical-container'>
      <SearchFieldset className='vertical-container'>
        <legend className='header-max'>Search</legend>
        <Picker isBrowse/>
        <SearchButtonDiv className='horizontal-container'>
          <button type='button'>Clear</button>
          <button type='button'>Search</button>
        </SearchButtonDiv>
      </SearchFieldset>
      <button type='button' onClick={() => scrollToLetter('F')}>test</button>
      <div className='game-scroll'>
        {status === 'loading' && <p>Loading...</p>}
        {status === 'succeeded' && gamelib.map(gamedata => (
          <Lineitem
            key={gamedata.game_id}
            lineData={gamedata}
          />
        ))}
        {status === 'failed' && <p>Error: {error}</p>}
      </div>
    </BrowseDiv>
  )
}
