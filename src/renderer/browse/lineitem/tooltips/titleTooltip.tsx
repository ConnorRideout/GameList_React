import React from 'react'
import Tooltip from '../../../shared/tooltip'


export default function TitleTooltip() {
  return (
    <Tooltip
      id='titleTooltip'
      float
      className='tooltip-image'
      place='right'
      opacity={1}
      render={({ content }) => {
        const img = content || ''

        return (
          <img
            src={img}
            alt="Game Zoomed In"
            loading='lazy'
          />
        )
      }}
    />
  )
}

