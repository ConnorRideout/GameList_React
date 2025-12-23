import React from 'react'

import Tooltip from '../../../shared/tooltip'
import { useOpenUrlMutation } from '../../../../lib/store/filesystemApi'

import { Timestamps } from '../../../../types'


export function VersionTooltip() {
  const parseTimestamp = (time: string) => {
    let timetag = time.replace('_', ' ')
    if (timetag.includes('create')) timetag = `${timetag.slice(0, 1).toUpperCase()}${timetag.slice(1)}`
    else timetag = `Last ${timetag.slice(0, -3)}`
    return timetag
  }

  const convertUTCToLocal = (utcTimestamp: string) => {
    // Parse the UTC timestamp into a Date object
    const date = new Date(`${utcTimestamp}Z`); // 'Z' at the end indicates UTC
    // Return the time as a string formatted using 'sv-SE' which will give the correct appearance
    return date.toLocaleString('sv-SE').slice(0, -3)
  }

  return (
    <Tooltip
      id='versionTooltip'
      render={({ content }) => {
        const timestamps: Timestamps = JSON.parse(content || '{}')
        return (
          <>
            {Object.entries(timestamps).map(([time, timestamp]) => (
              timestamp
              ? <p key={timestamp}>{`${parseTimestamp(time)}: ${convertUTCToLocal(timestamp)}`}</p>
              : ''
            ))}
          </>
        )
      }}
    />
  )
}

export function VersionCheckTooltip() {
  const [openUrl] = useOpenUrlMutation()

  return (
    <Tooltip
      id='versionCheckTooltip'
      delayShow={0}
      isOpen
      closeEvents={{}}
      place='bottom-start'
      clickable
      render={({ content, activeAnchor }) => {
        const url = activeAnchor?.getAttribute('data-url') || 'google.com'
        const pClassName = content === 'An updated version is available!' ?
          'updated'
          : content === 'No updates available' ?
          'no-update'
          : ''

        return (
          <>
            <p className={pClassName}>{content}</p>
            {content === 'An updated version is available!' && (
              <button type='button' onClick={() => openUrl(url)}>Open</button>
            )}
          </>
        )
      }}
    />
  )
}
