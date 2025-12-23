// STRETCH: add a "previously played version" tooltip
import React, { useMemo, useState } from 'react'

import { RefreshSvg } from '../../shared/svg'

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
  const [updateMessage, setUpdateMessage] = useState('')

  const splitAtSlash = (text: string) => {
    return text.replace(/(\/|\\)/g, '$1\u200B')
  }

  const displayVersion = useMemo(() => splitAtSlash(version), [version])

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

  return (
    <fieldset
      className='version-container'
    >
      <legend>Version
        <button
          id={`versionBtn${game_id}`}
          type='button'
          onClick={handleCheckUpdate}
          data-tooltip-id='versionCheckTooltip'
          data-tooltip-content={updateMessage}
          data-tooltip-hidden={!updateMessage}
          data-url={url}
        >
          <RefreshSvg />
        </button>
      </legend>
      <p
        id={`version${game_id}`}
        style={{color: status_color}}
        data-tooltip-id='versionTooltip'
        data-tooltip-content={JSON.stringify(timestamps)}
      >
        {displayVersion}
      </p>
    </fieldset>
  )
}
