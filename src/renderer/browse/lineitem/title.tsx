import React from 'react'
import styled from 'styled-components'

import Tooltip from '../../shared/tooltip'

const TitleFieldset = styled.fieldset`
  position: relative;
  min-width: 205px;
  max-width: 205px;

  img.preview {
    opacity: 0.6;
    height: 100%;
    width: 100%;
    padding: 0;
  }
`
const TitleP = styled.p`
  position: absolute;
  top: 0px;
  left: 0px;

  text-shadow: -1px -1px 2px black, 1px 1px 2px black, -1px 1px 2px black, 1px -1px 2px black;
`

interface Props {
  game_id: number,
  title: string,
  img: string,
  status: string[],
}
export default function Title({game_id, title, img, status}: Props) {


  const categoryHierarchy = ['Favorite', 'Abandoned', 'Watching']
  const orderCats = (arr: string[]) => {
    return arr.sort((a, b) => {
      return categoryHierarchy.indexOf(a) - categoryHierarchy.indexOf(b)
    })
  }

  const imgPath = img.replaceAll(' ', '_')

  return (
    <TitleFieldset id={`title-${game_id}`}>
      <Tooltip
        float
        className='tooltip-image'
        place='bottom'
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
      <TitleP className={`title-${(orderCats(status)[0] || 'default').toLowerCase()}`}>{title}</TitleP>
    </TitleFieldset>
  )
}
