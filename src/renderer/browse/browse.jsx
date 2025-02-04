import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { getData } from '../../data/store/gamelibrary'
import Picker from '../shared/picker'
import Lineitem from './lineitem/lineitem'
import BrowseNav from './browseNav'

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

  const gamelib = useSelector((state) => state.data.sortedGamelib)
  const status = useSelector((state) => state.data.status)
  const error = useSelector((state) => state.data.error)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(getData())
    }
  }, [status, dispatch])

  return (
    <BrowseDiv className='vertical-container'>
      <SearchFieldset className='vertical-container'>
        <legend className='header-max'>Search</legend>
        <Picker isBrowse/>
        <SearchButtonDiv className='horizontal-container'>
          <button type='button'>Clear</button>
          {/* TODO: implement text bar search */}
          <button type='button'>Search</button>
        </SearchButtonDiv>
      </SearchFieldset>
      <BrowseNav />
      <div className='game-scroll'>
        {['loading', 'updating'].includes(status) && <div className='loading' />}
        {['succeeded', 'updating'].includes(status) && gamelib.map(gamedata => (
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
