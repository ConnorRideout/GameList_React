import React from 'react'
import styled from 'styled-components'

import Tooltip from '../../shared/tooltip'

const TitleFieldset = styled.fieldset`
  position: relative;
  min-width: 205px;
  max-width: 205px;

  img.preview {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.8;
    height: 100%;
    width: 100%;
    padding: 1px;
  }
`
const TitleP = styled.p`
  position: relative;
  text-shadow: -1px -1px 2px black, 1px 1px 2px black, -1px 1px 2px black, 1px -1px 2px black;
  filter: drop-shadow(0 0 1px #0005)
`

interface Props {
  game_id: number,
  title: string,
  img: string,
  status_color: string,
}
export default function Title({game_id, title, img, status_color}: Props) {
  const imgPath = img.replaceAll(' ', '_')

  return (
    <TitleFieldset id={`title-${game_id}`}>
      <Tooltip
        float
        className='tooltip-image'
        place='right'
        opacity='1'
        anchorSelect={`#title-${game_id}`}
      >
        <img
          src={`load-image://${imgPath}`}
          alt="Dynamic Local Resource Tooltip"
        />
      </Tooltip>
      <legend>Title</legend>
      <img className='preview' src={`load-image://${imgPath}`} alt="Dynamic Local Resource" />
      <TitleP style={{color: status_color}}>{title}</TitleP>
    </TitleFieldset>
  )
}
