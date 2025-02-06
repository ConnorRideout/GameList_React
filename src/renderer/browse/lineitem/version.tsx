import React from 'react'
import styled from 'styled-components'
import Tooltip from '../../shared/tooltip'

import { Timestamps } from '../../../data/types/types-gamelibrary'

const VersionFieldset = styled.fieldset`
  min-width: 90px;
  max-width: 90px;
`

interface Props {
  game_id: number,
  version: string,
  timestamps: Timestamps,
  status_color: string,
}
export default function Version({game_id, version, timestamps, status_color}: Props) {
  const parseTimestamp = (time: string) => {
    let timetag = time.replace('_', ' ')
    if (timetag.includes('create')) timetag = `${timetag.slice(0, 1).toUpperCase()}${timetag.slice(1)}`
    else timetag = `Last ${timetag.slice(0, -3)}`
    return timetag
  }

  return (
    <VersionFieldset>
      <legend>Version</legend>
      <p id={`version-${game_id}`} style={{color: status_color}}>
        {version}
      </p>
      <Tooltip anchorSelect={`#version-${game_id}`}>
        {Object.entries(timestamps).map(([time, timestamp]) => (
          timestamp == null
            ? ''
            : <p key={timestamp}>{`${parseTimestamp(time)}: ${timestamp.slice(0, -3)}`}</p>
        ))}
      </Tooltip>
    </VersionFieldset>
  )
}
