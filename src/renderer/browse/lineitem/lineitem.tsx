/* eslint-disable react/prop-types */
import React, { CSSProperties } from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'

import Tools from './tools'
import Title from './title'
import Version from './version'
import Categories from './categories'
import Tags from './tags'
import Description from './description'
import { RootState } from '../../../data/store/store'
import { GameEntry } from '../../../data/types/types-gamelibrary'

const LineitemDiv = styled.div`
  min-height: 140px;
  max-height: 140px;
  padding: 0;
  padding-right: 3px;

  fieldset {
    margin: 0 1px;
    padding-top: 0;
  }
`

interface Props {
  lineData: GameEntry,
  style: CSSProperties
}
export default function Lineitem({lineData, style}: Props) {
  const {game_id, path, title, url, image, version, description, program_path, tags, status, categories, timestamps} = lineData

  const statuses = useSelector((state: RootState) => state.data.statuses)
  const styleVars = useSelector((state: RootState) => state.data.styleVars)

  const getStatusColors = (arr: string[]) => {
    if (arr.length) {
      // split the statuses of this lineitem dependent on if they apply to title or version
      const [[, titleColor], [, versionColor]] = arr.reduce((acc, cur) => {
        // get the status entry that matches this lineitem's from the store
        const {status_priority, status_color, status_color_applies_to} = statuses.find(s => s.status_name === cur)!
        // put it in the correct slot if it's a higher priority than the one that's currently there
        if (status_color_applies_to === 'title' && status_priority < acc[0][0]) acc[0] = [status_priority, status_color]
        else if (status_color_applies_to === 'version' && status_priority < acc[1][0]) acc[1] = [status_priority, status_color]
        return acc
      }, [[100, 'currentColor'], [100, 'currentColor']])
      return [titleColor, versionColor]
    } else {
      return ['currentColor', 'currentColor']
    }
  }

  const [status_color_title, status_color_version] = getStatusColors(status)

  return (
    <LineitemDiv style={{background: styleVars.$bgNormal, ...style}} className='horizontal-container' data-title={title}>
      <Tools
        game_id={game_id}
        path={path}
        programPath={program_path}
        url={url}
      />
      <Title
        game_id={game_id}
        title={title}
        img={image}
        status_color={status_color_title}
      />
      <Version
        game_id={game_id}
        version={version}
        timestamps={timestamps}
        status_color={status_color_version}
      />
      <Categories
        categories={categories}
      />
      <Tags
        tags={tags}
      />
      <Description
        description={description}
      />
    </LineitemDiv>
  )
}
