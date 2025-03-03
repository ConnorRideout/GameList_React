import React, { useState } from 'react'

import Tooltip from '../../shared/tooltip'
import { RefreshSvg } from '../../shared/svg'

import { useOpenUrlMutation } from '../../../lib/store/filesystemApi'
import { useCheckUpdatedUrlMutation } from '../../../lib/store/websitesApi'

import { Timestamps } from '../../../lib/types/types-gamelibrary'

interface Props {
  game_id: number,
  version: string,
  timestamps: Timestamps,
  url: string,
  status_color: string,
}
export default function Version({game_id, version, timestamps, url, status_color}: Props) {
  const [checkForUpdatedUrl] = useCheckUpdatedUrlMutation()
  const [openUrl] = useOpenUrlMutation()
  const [updateMessage, setUpdateMessage] = useState('')

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

  const handleCheckUpdate = async () => {
    setUpdateMessage('Checking for updates...')
    const updated = await checkForUpdatedUrl(url).unwrap()
    let tOut = 5000
    if (updated.message === 'updated') {
      setUpdateMessage('An updated version is available!')
    } else {
      setUpdateMessage('No updates available')
      tOut = 2000
    }
    setTimeout(() => setUpdateMessage(''), tOut)
  }

  const pClassName = updateMessage === 'An updated version is available!' ?
    'updated'
    : updateMessage === 'No updates available' ?
    'no-update'
    : ''

  return (
    <fieldset className='version-container'>
      <legend>Version
        <button id={`version-btn-${game_id}`} type='button' onClick={handleCheckUpdate}>
          <RefreshSvg />
        </button>
        <Tooltip
          anchorSelect={`#version-btn-${game_id}`}
          isOpen={!!updateMessage}
          closeEvents={{}}
          delayShow={0}
          place='bottom-start'
          clickable
        >
          <p className={pClassName}>{updateMessage}</p>
          {updateMessage === 'An updated version is available!' && (
            <button type='button' onClick={() => openUrl(url)}>Open</button>
          )}
        </Tooltip>
      </legend>
      <p id={`version-${game_id}`} style={{color: status_color}}>
        {version}
      </p>
      <Tooltip anchorSelect={`#version-${game_id}`}>
        {Object.entries(timestamps).map(([time, timestamp]) => (
          timestamp == null
            ? ''
            : <p key={timestamp}>{`${parseTimestamp(time)}: ${convertUTCToLocal(timestamp)}`}</p>
        ))}
      </Tooltip>
    </fieldset>
  )
}
