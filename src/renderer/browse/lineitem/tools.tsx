import React, { useState } from 'react'
import styled from 'styled-components'
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

const ToolsFieldset = styled.fieldset`
  min-width: max-content;
  justify-content: space-around;
  padding: 0 6px;
  z-index: 2;
`
const PlayButton = styled.button`
  background: SpringGreen;

  &:hover {
    background: Green;
  }
`
const WebButton = styled.button`
  background: LightSkyBlue;

  &:hover {
    background: SteelBlue;
  }
`
const EditButton = styled.button`
  background: Tan;

  &:hover {
    background: Sienna;
  }
`

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
  const [showPlay, setShowPlay] = useState(false)
  const [triggerEditGame] = useLazyEditGameQuery()

  const {setShowGamePicker, setGamePickerOptions, setGamePickerClickHandler} = gamePickerState

  const playGameHandler = (progPath: string) => {
    // STRETCH: update play status from 'new' to 'playing'; idk how this would work since play-status can be changed/removed
    // hide the picker if necessary
    setShowGamePicker(false)
    // show the starting game message
    // FIXME: "starting..." graphic doesn't work when using game picker
    setShowPlay(true)
    const filepath = [path, progPath].join('/')
    // run game
    playGame({path: filepath, useLE: isEroge})
    setTimeout(() => {
      setShowPlay(false)
      // STRETCH: only update timestamp/showPlay if playGame succeeds
      // update recently played timestamp
      updatePlayedTimestamp({game_id})
    }, 5000)
  }

  const playButtonHandler = () => {
    const progPaths = Object.entries(programPath)
    if (progPaths.length > 1) {
      setGamePickerClickHandler({func: playGameHandler})
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
    <ToolsFieldset className='vertical-container'>
      <legend>Tools</legend>
      {showPlay &&
        <div className='starting-game'>
          <span>Starting Game...</span>
          <div className='loading' />
        </div>
      }
      <PlayButton
        type='button'
        className='circle-button'
        onClick={playButtonHandler}
      >
        <PlaySvg color='black' />
      </PlayButton>
      <WebButton
        type='button'
        className='circle-button'
        id={`web-btn-${game_id}`}
        onClick={webBtnHandler}
      >
        <Tooltip anchorSelect={`#web-btn-${game_id}`}>
          {url}
        </Tooltip>
        <WebSvg color='black' />
      </WebButton>
      <EditButton
        type='button'
        className='circle-button'
        onClick={editBtnHandler}
      >
        <EditSvg color='black' />
      </EditButton>
    </ToolsFieldset>
  )
}
