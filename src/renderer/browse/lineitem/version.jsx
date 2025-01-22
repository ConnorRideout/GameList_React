import React from 'react'
import styled from 'styled-components'

const VersionFieldset = styled.fieldset`
  min-width: 75px;
  max-width: 75px;
`

export default function Version({version, timestamps}) {
  const parseTimestamp = time => {
    let timetag = time.replace('_', ' ')
    if (timetag.includes('create')) timetag = `${timetag.slice(0, 1).toUpperCase()}${timetag.slice(1)}`
    else timetag = `Last ${timetag.slice(0, -3)}`
    return timetag
  }

  return (
    <VersionFieldset>
      <legend>Version</legend>
      <div className='hasTooltip'>{version}
        <span className='tooltip'>
          {Object.entries(timestamps).map(([time, timestamp]) => (
            timestamp == null ? '' : <p key={timestamp}>{`${parseTimestamp(time)}: ${timestamp.slice(0, -3)}`}</p>
          ))}
        </span>
      </div>
    </VersionFieldset>
  )
}
