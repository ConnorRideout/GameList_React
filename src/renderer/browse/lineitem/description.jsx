import React from 'react'

export default function Description({description}) {
  return (
    <fieldset>
      <legend>Description</legend>
      <p>{description}</p>
    </fieldset>
  )
}
