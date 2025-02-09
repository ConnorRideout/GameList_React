import React from 'react'
import styled from 'styled-components'

const TagsFieldset = styled.fieldset`
  min-width: 230px;
  max-width: 230px;
`

export default function Tags({tags}: {tags: string[]}) {
  const sortedTags = [...tags].sort()

  return (
    <TagsFieldset>
      <legend>Tags</legend>
      <p>{sortedTags.join(', ')}</p>
    </TagsFieldset>
  )
}
