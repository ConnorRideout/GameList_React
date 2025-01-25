import React from 'react'
import styled from 'styled-components'

const TagsFieldset = styled.fieldset`
  min-width: 215px;
  max-width: 215px;
`

export default function Tags({tags}) {
  return (
    <TagsFieldset>
      <legend>Tags</legend>
      <p>{tags.join(', ')}</p>
    </TagsFieldset>
  )
}
