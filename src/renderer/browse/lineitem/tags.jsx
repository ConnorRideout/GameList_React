import React from 'react'
import styled from 'styled-components'

const TagsFieldset = styled.fieldset`
  min-width: 230px;
  max-width: 230px;
`

export default function Tags({tags}) {
  return (
    <TagsFieldset>
      <legend>Tags</legend>
      <p>{tags.join(', ')}</p>
    </TagsFieldset>
  )
}
