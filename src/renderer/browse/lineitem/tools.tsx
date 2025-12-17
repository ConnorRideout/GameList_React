import React from 'react'
import { useDispatch } from 'react-redux'

import Tooltip from '../../shared/tooltip'
import { PlaySvg, WebSvg, EditSvg } from '../../shared/svg'

import {
  usePlayGameMutation,
  useOpenUrlMutation,
} from '../../../lib/store/filesystemApi'
import {
  useLazyEditGameQuery,
  useUpdateTimestampMutation,
} from '../../../lib/store/gamelibApi'

// eslint-disable-next-line import/no-cycle
import { GamePickerState } from './lineitem'
import { setEditType } from '../../../lib/store/gamelibrary'


interface Props {
  game_id: number,
  path: string,
  programPath: {[key: string]: string},
  url: string,
  gamePickerState: GamePickerState,
  isEroge: boolean
}
export default function Tools({game_id, path, programPath, url, gamePickerState, isEroge}: Props) {
  const dispatch = useDispatch()
  const [playGame] = usePlayGameMutation()
  const [openUrl] = useOpenUrlMutation()
  const [updatePlayedTimestamp] = useUpdateTimestampMutation()
  const [triggerEditGame] = useLazyEditGameQuery()

  const {setShowGamePicker, setGamePickerOptions, gamePickerClickHandler, shownPlayMessages, setShownPlayMessages} = gamePickerState

  const playGameHandler = (progPath: string) => {
    // STRETCH: update play status from 'new' to 'playing'; idk how this would work since play-status can be changed/removed
    // hide the picker if necessary
    setShowGamePicker(false)
    // show the starting game message
    setShownPlayMessages(prev => [...prev, game_id])
    const filepath = [path, progPath].join('/')
    // run game
    playGame({path: filepath, useLE: isEroge})
    setTimeout(() => {
      setShownPlayMessages(prev => prev.filter(g_id => g_id !== game_id))
      // STRETCH: only update timestamp/showPlay if playGame succeeds
      // update recently played timestamp
      updatePlayedTimestamp({game_id})
    }, 5000)
  }

  const playButtonHandler = () => {
    const progPaths = Object.entries(programPath)
    if (progPaths.length > 1) {
      gamePickerClickHandler.current = playGameHandler
      setGamePickerOptions(progPaths)
      setShowGamePicker(true)
    } else {
      const progPath = Object.values(programPath)[0]
      playGameHandler(progPath)
    }
  }
  const webBtnHandler = () => {
    openUrl(url)
  }
  const editBtnHandler = () => {
    // save scroll position for when browse is reopened
    sessionStorage.setItem('scrollPosition', String(document.querySelector('.game-scroll-list')?.scrollTop || 0))
    // trigger edit
    dispatch(setEditType('edit'))
    triggerEditGame(game_id)
  }

  return (
    <fieldset className='vertical-container tools'>
      <legend>Tools</legend>
      {shownPlayMessages.includes(game_id) &&
        <div className='starting-game'>
          <span>Starting Game...</span>
          <div className='loading' />
        </div>
      }
      <button
        type='button'
        className='circle-button play'
        onClick={playButtonHandler}
      >
        <PlaySvg color='black' />
      </button>
      <button
        type='button'
        className='circle-button web'
        id={`web-btn-${game_id}`}
        onClick={webBtnHandler}
      >
        <Tooltip anchorSelect={`#web-btn-${game_id}`}>
          {url}
        </Tooltip>
        <WebSvg color='black' />
      </button>
      <button
        type='button'
        className='circle-button edit'
        onClick={editBtnHandler}
      >
        <EditSvg color='black' />
      </button>
    </fieldset>
  )
}
