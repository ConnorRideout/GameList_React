import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

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

import { RootState } from '../../../types'
// eslint-disable-next-line import/no-cycle
import { GamePickerState } from './lineitem'

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
  const [playGame] = usePlayGameMutation()
  const [openUrl] = useOpenUrlMutation()
  const [updatePlayedTimestamp] = useUpdateTimestampMutation()
  const navigate = useNavigate()
  const [showPlay, setShowPlay] = useState(false)
  const [triggerEditGame] = useLazyEditGameQuery()
  const editGame = useSelector((state: RootState) => state.data.editGame)

  useEffect(() => {
    if (editGame !== null) {
      navigate('/edit')
    }
  }, [editGame, navigate])

  const {setShowGamePicker, setGamePickerOptions, setGamePickerClickHandler} = gamePickerState

  const playGameHandler = (progPath: string) => {
    // TODO: update play status from 'new' to 'playing'
    // hide the picker if necessary
    setShowGamePicker(false)
    // show the starting game message
    // FIXME: "starting..." graphic doesn't work when using game picker
    setShowPlay(true)
    setTimeout(() => {
      setShowPlay(false)
      updatePlayedTimestamp({game_id})
    }, 5000)
    // update recently played timestamp
    // run game
    // TODO? only update timestamp/showPlay if playGame succeeds
    const filepath = [path, progPath].join('/')
    playGame({path: filepath, useLE: isEroge})
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
    sessionStorage.setItem('scrollPosition', String(document.querySelector('.game-scroll-list')?.scrollTop || 0))
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
