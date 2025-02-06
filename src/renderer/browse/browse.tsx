import React from 'react'
import { FixedSizeList as List } from 'react-window'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import Picker from '../shared/picker'
import Lineitem from './lineitem/lineitem'
import BrowseNav from './browseNav'
import { RootState } from '../../data/store/store'

const BrowseDiv = styled.div`
  align-items: center;
  max-height: calc(100vh - 5px);
  min-height: calc(100vh - 5px);
  min-width: calc(100vw - 5px);
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
  const gamelib = useSelector((state: RootState) => state.data.sortedGamelib)
  const sortOrder = useSelector((state: RootState) => state.data.sortOrder)
  const status = useSelector((state: RootState) => state.data.status)
  const error = useSelector((state: RootState) => state.data.error)

  const scrollToItem = (idx: number) => {
    const offset = idx * 140
    document.querySelector('div.game-scroll-list')?.scrollTo({top: offset, behavior: 'smooth'})
  }

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
      <BrowseNav scrollToItem={scrollToItem}/>
      <div className='game-scroll'>
        {['loading', 'updating'].includes(status) && <div className='loading' />}
        {['succeeded', 'updating'].includes(status) && (
          <>
            <div className='loading-lineitems'>
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
            </div>
            <List
              height={ document.querySelector('div.game-scroll')?.getBoundingClientRect().height || 865 }
              width='100%'
              itemCount={gamelib[sortOrder].length}
              itemSize={140}
              overscanCount={10}
              className='game-scroll-list'
            >
              {({index, style}) => (
                <Lineitem
                  key={gamelib[sortOrder][index].game_id}
                  lineData={gamelib[sortOrder][index]}
                  style={style}
                />
              )}
            </List>
          </>
        )}
        {status === 'failed' && <p>Error: {error}</p>}
      </div>
    </BrowseDiv>
  )
}
