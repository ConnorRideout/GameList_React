import React, { useMemo, useState } from 'react'

import Tooltip from '../../shared/tooltip'


interface Props {
  game_id: number,
  title: string,
  img: string[],
  status_color: string,
}
export default function Title({game_id, title, img, status_color}: Props) {
  const [showTooltip, setShowTooltip] = useState(false)
  const imgPaths = useMemo(() => img.map(i => encodeURIComponent(i)), [img])

  return (
    <fieldset
      id={`title-${game_id}`}
      className='title'
      onMouseEnter={() => setShowTooltip(true)}
    >
      <legend>Title</legend>
      <img
        className='preview'
        src={`load-image://${imgPaths[0]}`}
        alt="Dynamic Local Resource"
        loading='lazy'
      />
      {showTooltip && (
        <Tooltip
          float
          className='tooltip-image'
          place='right'
          opacity='1'
          anchorSelect={`#title-${game_id}`}
        >
          <img
            src={`load-image://${imgPaths.at(-1)}`}
            alt="Dynamic Local Resource Tooltip"
            loading='lazy'
          />
        </Tooltip>
      )}
      <p style={{color: status_color}}>{title}</p>
    </fieldset>
  )
}
