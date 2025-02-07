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
  const sortedGamelib = useSelector((state: RootState) => state.data.sortedGamelib)
  const sortOrder = useSelector((state: RootState) => state.data.sortOrder)
  const searchRestraints = useSelector((state: RootState) => state.data.searchRestraints)
  const status = useSelector((state: RootState) => state.data.status)
  const error = useSelector((state: RootState) => state.data.error)

  const scrollToItem = (idx: number) => {
    const offset = idx * 140
    document.querySelector('div.game-scroll-list')?.scrollTo({top: offset, behavior: 'smooth'})
  }

  const currentGamlib = sortedGamelib[sortOrder].filter(g => {
    // check inclusions
    const incl = searchRestraints.include
    if (incl.tags.length) {
      if (!incl.tags.every(t => g.tags.includes(t))) return false
    }
    if (incl.status.length) {
      if (!incl.status.every(s => g.status.includes(s))) return false
    }
    if (Object.keys(incl.categories).length) {
      if (!Object.keys(incl.categories).every(k => g.categories[k] === incl.categories[k])) return false
    }
    // check exclusions
    const excl = searchRestraints.exclude
    if (excl.tags.length) {
      if (excl.tags.every(t => g.tags.includes(t))) return false
    }
    if (excl.status.length) {
      if (excl.status.every(s => g.status.includes(s))) return false
    }
    if (Object.keys(excl.categories).length) {
      if (Object.keys(excl.categories).every(k => g.categories[k] === excl.categories[k])) return false
    }
    return true
  })

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
              itemCount={currentGamlib.length}
              itemSize={140}
              overscanCount={10}
              className='game-scroll-list'
            >
              {({index, style}) => (
                <Lineitem
                  key={currentGamlib[index].game_id}
                  lineData={currentGamlib[index]}
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
