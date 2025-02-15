/* eslint-disable react/no-array-index-key */
import React from 'react'
import { FixedSizeList as List } from 'react-window'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'

import {
  setSearchRestraints,
  clearSearchRestraints,
  setError // FIXME: Dev dependency
} from '../../data/store/gamelibrary'
import Picker, { FormState } from '../shared/picker/picker'
import Lineitem from './lineitem/lineitem'
import BrowseNav from './browseNav'
import ErrorMessage from '../shared/errorMessage'
import TextSearch from './textSearch'

import { SearchRestraints, RootState } from '../../types'


const SearchFieldset = styled.fieldset`
  padding: 0 7px;
`

// FIXME: dev dependency refetch
export default function Browse({refetch}: {refetch: ({force}: {force: boolean}) => void}) {
  const dispatch = useDispatch()
  const sortedGamelib = useSelector((state: RootState) => state.data.sortedGamelib)
  const sortOrder = useSelector((state: RootState) => state.data.sortOrder)
  const searchRestraints = useSelector((state: RootState) => state.data.searchRestraints)
  const status = useSelector((state: RootState) => state.data.status)

  const scrollToItem = (idx: number) => {
    const offset = idx * 140
    document.querySelector('div.game-scroll-list')?.scrollTo({top: offset, behavior: 'smooth'})
  }

  const getScrollOffset = () => {
    const offset = parseInt(sessionStorage.getItem('scrollPosition') || '0')
    sessionStorage.removeItem('scrollPosition')
    return offset
  }

  const searchHandler = (data: FormState) => {
    /*
    SearchRestraints
      include: {
        tags: string[];
        status: string[];
        categories: StringMap;
      };
      exclude: {
        tags: string[];
        status: string[];
        categories: StringMap;
      }
    data
      number: -1=indeterminate, 0=exclude, 1=include
      string: 'any'=indeterminate, otherwise include
        categories: {[key: string]: string},
        statuses: {[key: string]: number},
        tags: {[key: string]: number},
    */
    const {categories, statuses, tags} = data
    const restraints: SearchRestraints = {
      include:{tags: [], status: [], categories: {}},
      exclude:{tags: [], status: [], categories: {}}
    }
    Object.entries(tags).forEach(([tagName, val]) => {
      if (val === 0) restraints.exclude.tags.push(tagName)
      else if (val === 1) restraints.include.tags.push(tagName)
    })
    Object.entries(statuses).forEach(([statusName, val]) => {
      if (val === 0) restraints.exclude.status.push(statusName)
      else if (val === 1) restraints.include.status.push(statusName)
    })
    Object.entries(categories).forEach(([catName, val]) => {
      if (val !== 'Any') restraints.include.categories[catName] = val
    })
    dispatch(setSearchRestraints(restraints))
  }
  const clearHandler = () => {
    dispatch(clearSearchRestraints())
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
    <div className='main-container'>
      <button style={{position: 'fixed', left: 0}} type='button' onClick={() => refetch({force: true})}>Refetch Gamelib</button>
      <button style={{position: 'fixed', left: 0, top: '30px'}} type='button' onClick={() => dispatch(setError('test error'))}>Test</button>
      <SearchFieldset className='vertical-container'>
        <legend className='header-max'>Search</legend>
        <Picker
          submitHandler={{
            text: 'Search',
            handler: searchHandler,
          }}
          cancelHandler={{
            text: 'Clear',
            handler: clearHandler,
          }}
          isBrowse
        />
      </SearchFieldset>
      <TextSearch scrollToItem={scrollToItem}/>
      <BrowseNav scrollToItem={scrollToItem}/>
      <div className='game-scroll'>
        {['loading', 'updating'].includes(status) && <div className='loading' />}
        <ErrorMessage />
        {status !== 'idle' && (
          <>
            <div className='loading-lineitems'>
              {Array(Math.min(currentGamlib.length, 10)).fill(null).map((_, i) => <div key={`placeholder${i}`} />)}
              <p>-- end --</p>
            </div>
            <List
              height={ document.querySelector('div.game-scroll')?.getBoundingClientRect().height || 865 }
              width='100%'
              itemCount={currentGamlib.length}
              itemSize={140}
              overscanCount={10}
              className='game-scroll-list'
              initialScrollOffset={getScrollOffset()}
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
      </div>
    </div>
  )
}
