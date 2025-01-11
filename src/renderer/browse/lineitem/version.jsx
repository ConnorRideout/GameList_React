import React from 'react'

export default function Version({version, timestamps}) {
  return (
    <fieldset>
      <legend>Version</legend>
      <p>{version}</p>
    </fieldset>
  )
}
