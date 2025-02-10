import React from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'

import Tooltip from '../../shared/tooltip'
import {
  usePlayGameMutation,
  useOpenUrlMutation
} from '../../../data/store/filesysteamApi'

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

  const playButtonHandler = () => {
    // TODO: handle multiple programpaths
    // TODO: update recently played timestamp
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
    navigate('/edit')
  }

  return (
    <ToolsFieldset className='vertical-container'>
      <legend>Tools</legend>
      <PlayButton
        type='button'
        className='circle-button'
        onClick={playButtonHandler}
      >
        <svg
          stroke='none'
          fill='black'
          height="32"
          width="32"
          viewBox='0 0 32 32'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M 25.3 13.5 Q 28.3 15.5 25.3 17.5 L 13.3 25.5 C 10.9 26.7 8.3 25.5 8.3 22.5 L 8.3 9.5 C 8.3 6.5 11.1 5.3 13.3 6.5 L 25.3 13.5 Z' />
        </svg>
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
        <svg
          stroke='none'
          fill='black'
          height="32"
          width="32"
          viewBox='0 0 32 32'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M 16 0 A 1 1 0 0 0 16 32 A 1 1 0 0 0 16 0 Z M 27.7 9.2 H 24.2 C 23.6 7 22.8 5.2 21.8 3.6 C 24.3 4.9 26.4 6.8 27.7 9.2 Z M 22.3 12.8 C 22.2 12.3 22.1 11.9 21.8 11.6 H 22.3 C 22.5 12.9 22.7 14.4 22.7 15.9 C 22.7 16.5 22.6 17.0 22.6 17.6 L 20.3 15.3 L 21.0 15.0 C 21.8 14.6 22.4 13.7 22.3 12.8 Z M 17.1 2.6 C 18.3 3.0 19.5 4.2 20.5 6.0 C 21.0 7.0 21.4 8.1 21.8 9.2 H 17.1 V 2.6 Z M 11.4 6.0 C 12.3 4.2 13.5 3.0 14.8 2.6 V 9.0 L 10.6 7.8 C 10.6 7.8 10.6 7.8 10.6 7.8 C 10.8 7.2 11.1 6.6 11.4 6.0 Z M 10.1 3.6 C 9.1 5.1 8.2 7.0 7.7 9.2 H 4.1 C 5.5 6.8 7.6 4.9 10.1 3.6 Z M 9.2 15.3 L 10.7 20.3 H 9.6 C 9.3 18.9 9.2 17.4 9.2 15.9 C 9.2 15.7 9.2 15.5 9.2 15.3 Z M 2.3 15.9 C 2.3 14.4 2.6 12.9 3.0 11.6 H 7.2 C 7.0 12.9 6.9 14.4 6.9 15.9 C 6.9 17.4 7.0 18.9 7.2 20.3 H 3.0 C 2.6 18.9 2.3 17.4 2.3 15.9 Z M 4.1 22.6 H 7.7 C 8.2 24.8 9.1 26.7 10.1 28.2 C 7.6 27.0 5.5 25.0 4.1 22.6 Z M 14.8 29.3 C 13.5 28.8 12.3 27.6 11.4 25.8 C 10.9 24.9 10.4 23.8 10.1 22.6 H 14.8 V 29.3 Z M 14.8 17.7 L 13.6 20.3 C 13.4 20.6 13.2 20.8 12.9 20.7 C 12.6 20.7 12.4 20.5 12.3 20.2 L 9.3 10.1 C 9.2 9.9 9.3 9.6 9.4 9.4 C 9.6 9.3 9.9 9.2 10.1 9.3 L 20.2 12.3 C 20.5 12.4 20.7 12.6 20.7 12.9 C 20.8 13.2 20.6 13.4 20.3 13.6 L 17.7 14.8 L 22.4 19.6 C 22.7 19.9 22.7 20.3 22.4 20.6 L 20.6 22.4 C 20.3 22.7 19.9 22.7 19.6 22.4 L 14.8 17.7 Z M 20.5 25.8 C 19.5 27.6 18.3 28.8 17.1 29.3 V 22.6 H 17.6 L 18.5 23.5 C 18.9 23.9 19.5 24.2 20.1 24.2 C 20.6 24.2 21.0 24.0 21.4 23.7 C 21.1 24.5 20.8 25.2 20.5 25.8 Z M 21.8 28.2 C 22.8 26.7 23.6 24.8 24.2 22.6 H 27.7 C 26.4 25.0 24.3 27.0 21.8 28.2 Z M 24.7 20.3 C 24.9 18.9 25.0 17.4 25.0 15.9 C 25.0 14.4 24.9 12.9 24.7 11.6 H 28.8 C 29.3 12.9 29.5 14.4 29.5 15.9 S 29.3 18.9 28.8 20.3 H 24.7 Z' />
        </svg>
      </WebButton>
      <EditButton
        type='button'
        className='circle-button'
        onClick={editBtnHandler}
      >
        <svg
          stroke='black'
          fill='none'
          strokeWidth='2'
          height='32'
          width='32'
          viewBox='0 0 32 32'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M 23 4 L 6 21 V 26 H 11 L 28 9 Z M 18.5 8.5 L 23.5 13.5' />
        </svg>
      </EditButton>
    </ToolsFieldset>
  )
}
