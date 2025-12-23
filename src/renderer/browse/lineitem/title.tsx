import React, { useMemo } from 'react'


interface Props {
  game_id: number,
  title: string,
  img: string[],
  status_color: string,
}
export default function Title({game_id, title, img, status_color}: Props) {
  const imgPaths = useMemo(() => img.map(i => encodeURIComponent(i)), [img])

  return (
    <fieldset
      id={`title-${game_id}`}
      className='title'
    >
      <legend>Title</legend>
      <img
        className='preview'
        src={`load-image://${imgPaths[0]}`}
        alt="Dynamic Local Resource"
        loading='lazy'
        data-tooltip-id='titleTooltip'
        data-tooltip-content={`load-image://${imgPaths.at(-1)}`}
        />
      <p
        style={{color: status_color}}
        data-tooltip-id='titleTooltip'
        data-tooltip-content={`load-image://${imgPaths.at(-1)}`}
      >{title}</p>
    </fieldset>
  )
}
