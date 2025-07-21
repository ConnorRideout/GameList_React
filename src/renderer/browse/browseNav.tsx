/* eslint-disable no-restricted-syntax */
import React from "react"
import styled from "styled-components"
import { useDispatch, useSelector } from "react-redux"

import TabularButton from "../shared/tabularButton"
import { RootState } from '../../lib/store/store'
import { setSortOrder, setStatus } from "../../lib/store/gamelibrary"

import { GamelibState } from '../../types'


const NavDiv = styled.div`
  justify-content: flex-start;
  width: 100%;
  margin-top: 6px;
  z-index: 1;
`

interface Props {
  scrollToItem: (idx: number) => void,
  filterGamelib: (gamelib: GamelibState['gamelib'], restraints: GamelibState['searchRestraints'], hideBeaten: boolean, isRecent: boolean) => GamelibState['gamelib']
}

export default function BrowseNav({scrollToItem, filterGamelib}: Props) {
  const dispatch = useDispatch()

  const gamelib = useSelector((state: RootState) => state.data.gamelib)
  const sortOrder = useSelector((state: RootState) => state.data.sortOrder)
  const searchRestraints = useSelector((state: RootState) => state.data.searchRestraints)
  const sortedGamelib = useSelector((state: RootState) => state.data.sortedGamelib)
  const status = useSelector((state: RootState) => state.data.status)

  const sortGamelib = (sortby: GamelibState['sortOrder']) => {
    if (sortOrder !== sortby) {
      dispatch(setStatus('updating'))
      return new Promise(resolve => {
        setTimeout(() => {
          dispatch(setSortOrder(sortby))
          dispatch(setStatus('succeeded'))
          resolve('done')
        }, 10)
      })
    }
    return 'done'
  }

  const scrollToTop = async (alpha=true) => {
    if (alpha) await sortGamelib('alphabetical')
    const browse = document.querySelector('div.game-scroll-list')
    if (browse) {
      browse.scrollTo({top: 0, behavior: "smooth"})
    }
  }
  const scrollToLetter = async (letters: string) => {
    await sortGamelib('alphabetical')
    const letter_arr = letters.split('')
    const currentGamelib = filterGamelib(
      sortedGamelib.alphabetical,
      searchRestraints,
      false,
      false
    )
    for (const l of letter_arr) {
      // const idx = sortedGamelib.alphabetical.findIndex(g => g.title.toUpperCase().startsWith(l))
      const idx = currentGamelib.findIndex(g => g.title.toUpperCase().startsWith(l))
      if (idx !== -1) {
        scrollToItem(idx)
        break
      }
    }
  }


  const letter_pairs = 'BC DE FG HI JK LM NO PQR ST UV WXYZ'.split(' ')
  const checkLetters = (letters: string) => {
    const letters_arr = letters.split('')
    for (const l of letters_arr) {
      const game = gamelib.find(g => g.title.toUpperCase()[0] === l)
      if (game) return true
    }
    return false
  }

  const sortHandler = (evt: React.MouseEvent<HTMLButtonElement>, sortby: GamelibState['sortOrder']) => {
    sortGamelib(sortby)
    scrollToTop(false)
  }

  return (
    <NavDiv className="horizontal-container">
      <TabularButton
        text='Recently Played'
        active={sortOrder === 'recentlyPlayed'}
        clickHandler={(evt) => sortHandler(evt,'recentlyPlayed')}
      />
      <TabularButton
        text='Recently Updated'
        active={sortOrder === 'recentlyUpdated'}
        clickHandler={(evt) => sortHandler(evt,'recentlyUpdated')}
      />
      <TabularButton
        text='Recently Added'
        active={sortOrder === 'recentlyAdded'}
        clickHandler={(evt) => sortHandler(evt,'recentlyAdded')}
      />
      <TabularButton
        text='#A'
        active={sortOrder === 'alphabetical'}
        clickHandler={() => scrollToTop(true)}
      />
      {letter_pairs.map(letters => (
        <TabularButton
          key={letters}
          text={letters}
          active={sortOrder === 'alphabetical'}
          clickHandler={() => scrollToLetter(letters)}
          disabled={!checkLetters(letters)}
        />
      ))}

      <span style={{visibility: 'hidden'}}>{status}</span>
    </NavDiv>
  )
}
