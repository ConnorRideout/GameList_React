import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import Tooltip from '../../shared/tooltip'
import { PlaySvg, WebSvg, EditSvg } from '../../shared/svg'

import {
  usePlayGameMutation,
  useOpenUrlMutation
} from '../../../data/store/filesysteamApi'
import { useLazyEditGameQuery } from '../../../data/store/gamelibApi'
import { RootState } from '../../../types'

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
  url: string
}
export default function Tools({game_id, path, programPath, url}: Props) {
  const [playGame] = usePlayGameMutation()
  const [openUrl] = useOpenUrlMutation()
  const navigate = useNavigate()
  const [showPlay, setShowPlay] = useState(false)
  const [triggerEditGame] = useLazyEditGameQuery()
  const editGame = useSelector((state: RootState) => state.data.editGame)

  useEffect(() => {
    if (editGame !== null) {
      navigate('/edit')
    }
  }, [editGame, navigate])

  const playButtonHandler = () => {
    // TODO: handle multiple programpaths
    // TODO: update recently played timestamp
    setShowPlay(true)
    setTimeout(() => {
      setShowPlay(false)
    }, 2000)
    const progPath = Object.values(programPath)[0]
    const filepath = [path, progPath].join('/')
    playGame(filepath)
  }
  const webBtnHandler = () => {
    openUrl(url)
  }
  const editBtnHandler = () => {
    // TODO: edit button handler
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
        <PlaySvg fill='black' />
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
        <WebSvg fill='black' />
      </WebButton>
      <EditButton
        type='button'
        className='circle-button'
        onClick={editBtnHandler}
      >
        <EditSvg fill='black' />
      </EditButton>
    </ToolsFieldset>
  )
}
