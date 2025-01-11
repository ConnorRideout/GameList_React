import React from 'react'

export default function Title({title, img, categories}) {
  return (
    <fieldset>
      <legend>Title</legend>
      <p>{title}</p>
    </fieldset>
  )
}
