// FIXME: when returning from edit, if a search was active, the search continues to be active but the picker no longer reflects it
/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect, useRef } from 'react'
import { FixedSizeList as List } from 'react-window'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import {
  setSearchRestraints,
  clearSearchRestraints
} from '../../lib/store/gamelibrary'
import Picker, { FormState } from '../shared/picker/picker'
import Lineitem from './lineitem/lineitem'
import BrowseNav from './browseNav'
import ErrorMessage from '../shared/errorMessage'
import TextSearch from './textSearch'
import GamePicker from './dialogs/gamePicker'
import MissingGames from './dialogs/missingGames'
import DislikeGame from './dialogs/dislike'
import NewGames from './dialogs/newGames'

import { SearchRestraints, RootState } from '../../types'


const SearchFieldset = styled.fieldset`
  padding: 0 7px;
`

const HideCheckbox = styled.label`
  align-self: flex-start;
`

export default function Browse() {
  const dispatch = useDispatch()
  const sortedGamelib = useSelector((state: RootState) => state.data.sortedGamelib)
  const sortOrder = useSelector((state: RootState) => state.data.sortOrder)
  const searchRestraints = useSelector((state: RootState) => state.data.searchRestraints)
  const status = useSelector((state: RootState) => state.data.status)
  const [hideBeatenInRecents, setHideBeatenInRecents] = useState<boolean>(JSON.parse(sessionStorage.getItem('hideBeatenInRecents') || 'false'))
  // new games
  const newGames = useSelector((state: RootState) => state.data.newGames)
  const [handleNewGames, setHandleNewGames] = useState(false)
  // missing games
  const missingGames = useSelector((state: RootState) => state.data.missingGames)
  const [handleMissingGames, setHandleMissingGames] = useState(false)
  // edit games
  const navigate = useNavigate()
  const editGame = useSelector((state: RootState) => state.data.editGame)
  // dislike game
  const [dislikedGame, setDislikedGame] = useState<{game_id: number, title: string} | null>(null)


  useEffect(() => {
    // navigate to /edit if editGame is updated
    if (editGame !== null) {
      navigate('/edit')
    }
  }, [editGame, navigate])

  const scrollToItem = (idx: number) => {
    const offset = idx * 140
    document.querySelector('div.game-scroll-list')?.scrollTo({ top: offset, behavior: 'smooth' })
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
    const { categories, statuses, tags } = data
    const restraints: SearchRestraints = {
      include: { tags: [], status: [], categories: {} },
      exclude: { tags: [], status: [], categories: {} }
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

  const currentGamelib = sortedGamelib[sortOrder].filter(g => {
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
    if (hideBeatenInRecents && sortOrder.startsWith('recent')) {
      if (Object.values(g.categories).find(c => c.toLowerCase() === 'beaten')) return false
    }
    return true
  })

  const hideBeatenChangeHandler = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = evt.target
    sessionStorage.setItem('hideBeatenInRecents', JSON.stringify(checked))
    setHideBeatenInRecents(checked)
  }

  const clearDislikedGame = () => {
    setDislikedGame(null)
  }

  // ask about new games
  useEffect(() => {
    setHandleNewGames(newGames.length > 0)
  }, [newGames])

  // ask about missing games
  useEffect(() => {
    setHandleMissingGames(missingGames.length > 0)
  }, [missingGames])

  // game picker state
  const [showGamePicker, setShowGamePicker] = useState(false)
  const [gamePickerOptions, setGamePickerOptions] = useState<[string, string][]>([])
  const [shownPlayMessages, setShownPlayMessages] = useState<number[]>([])
  const gamePickerClickHandler = useRef<(progPath: string) => void>(() => {})
  const gamePickerState = { setShowGamePicker, setGamePickerOptions, gamePickerClickHandler, shownPlayMessages, setShownPlayMessages }

  return (
    <div className='main-container'>
      {handleMissingGames && (
        <MissingGames />
      )}
      {handleNewGames && !handleMissingGames && (
        <NewGames />
      )}
      {dislikedGame && (
        <DislikeGame
          dislikedGame={dislikedGame}
          clearDislikedGame={clearDislikedGame}
        />
      )}

      <GamePicker
        isVisible={showGamePicker}
        setIsVisible={setShowGamePicker}
        programPaths={gamePickerOptions}
        clickHandler={gamePickerClickHandler}
      />

      {/* <button style={{ position: 'fixed', left: 0 }} type='button' onClick={() => doTest()}>Test</button> */}

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
        <TextSearch scrollToItem={scrollToItem} currentGamelib={currentGamelib} />
      </SearchFieldset>

      <HideCheckbox>
        <input
          type="checkbox"
          checked={hideBeatenInRecents}
          onChange={hideBeatenChangeHandler}
        />
        Hide beaten games in recent lists
      </HideCheckbox>

      <BrowseNav scrollToItem={scrollToItem} currentGamelib={currentGamelib}/>

      <div className='game-scroll'>
        {['loading', 'updating'].includes(status) && <div className='loading' />}
        <ErrorMessage />

        {status !== 'idle' && (
          <>
            <div className='loading-lineitems'>
              {Array(Math.min(currentGamelib.length, 10)).fill(null).map((_, i) => <div key={`placeholder${i}`} />)}
              <p>-- end --</p>
            </div>
            <List
              height={document.querySelector('div.game-scroll')?.getBoundingClientRect().height || 865}
              width='100%'
              itemCount={currentGamelib.length}
              itemSize={140}
              overscanCount={10}
              className='game-scroll-list'
              initialScrollOffset={getScrollOffset()}
            >
              {({ index, style }) => (
                <Lineitem
                  key={currentGamelib[index].game_id}
                  gamePickerState={gamePickerState}
                  lineData={currentGamelib[index]}
                  setDislikedGame={setDislikedGame}
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
