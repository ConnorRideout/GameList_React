import React from 'react'
import styled from 'styled-components'

const DescriptionFieldset = styled.fieldset`
  overflow-y: auto;
  flex-grow: 1;
`

export default function Description({description}) {
  return (
    <DescriptionFieldset>
      <legend>Description</legend>
      <p className='description'>{description}</p>
    </DescriptionFieldset>
  )
}
