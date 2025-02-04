/* eslint-disable no-restricted-syntax */
import React from "react"
import styled from "styled-components"
import { useDispatch, useSelector } from "react-redux"

import TabularButton from "./tabularButton"
import { RootState } from '../../data/store/store'
import { setSortOrder, setStatus } from "../../data/store/gamelibrary"

const NavDiv = styled.div`
  justify-content: flex-start;
  width: 100%;
  margin-top: 6px;
`

export default function BrowseNav() {
  const dispatch = useDispatch()

  const gamelib = useSelector((state: RootState) => state.data.gamelib)
  const sortOrder = useSelector((state: RootState) => state.data.sortOrder)

  const checkAlphebetical = () => {
    if (sortOrder !== 'alphabetical') {
      dispatch(setStatus('updating'))
      return new Promise(resolve => {
        setTimeout(() => {
          dispatch(setSortOrder('alphabetical'))
          dispatch(setStatus('succeeded'))
          resolve('done')
        }, 0)
      })
    }
    return 'done'
  }
  const sortGamelib = (sortby: string) => {
      if (sortOrder !== sortby) {
        dispatch(setStatus('updating'))
        setTimeout(() => {
          dispatch(setSortOrder(sortby))
          dispatch(setStatus('succeeded'))
        }, 0)
      }
    }

  const scrollToTop = async (alpha=true) => {
    if (alpha) await checkAlphebetical()
    const browse = document.querySelector('div.game-scroll')
    if (browse) {
      browse.scrollTo({top: 0, behavior: "smooth"})
    }
  }
  const scrollToLetter = async (letters: string) => {
    await checkAlphebetical()
    const letter_arr = letters.split('')
    for (const l of letter_arr) {
        const item = document.querySelector(`div[data-name^="${l}"`)
        if (item) {
          item.scrollIntoView({behavior: 'smooth', block: 'start'})
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

  const sortHandler = (evt: React.MouseEvent<HTMLButtonElement>, sortby: string) => {
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
        text='Recently Added'
        active={sortOrder === 'recentlyAdded'}
        clickHandler={(evt) => sortHandler(evt,'recentlyAdded')}
      />
      <TabularButton
        text='Recently Updated'
        active={sortOrder === 'recentlyUpdated'}
        clickHandler={(evt) => sortHandler(evt,'recentlyUpdated')}
      />
      <TabularButton
        text='#A'
        active={sortOrder === 'alphabetical'}
        clickHandler={() => scrollToTop(true)}
      />
      {letter_pairs.map(letters => (
        <TabularButton
          text={letters}
          active={sortOrder === 'alphabetical'}
          clickHandler={() => scrollToLetter(letters)}
          disabled={!checkLetters(letters)}
        />
      ))}
    </NavDiv>
  )
}
