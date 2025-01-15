import React from 'react'
import styled from 'styled-components'

const TitleFieldset = styled.fieldset`
  min-width: 205px;
  max-width: 205px;
`

export default function Title({title, img, categories}) {
  const categoryHierarchy = ['Favorite', 'Complete', 'Abandoned', 'Watching']
  const orderCats = str => {
    if (str === null) return ['Default']
    const arr = str.split(',')
    return arr.sort((a, b) => {
      return categoryHierarchy.indexOf(a) - categoryHierarchy.indexOf(b)
    })
  }
  return (
    <TitleFieldset>
      <legend>Title</legend>
      <p className={`title${orderCats(categories)[0]}`}>{title}</p>
    </TitleFieldset>
  )
}
