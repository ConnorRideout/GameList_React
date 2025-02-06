import React from 'react'
import styled from 'styled-components'

const DescriptionFieldset = styled.fieldset`
  flex-grow: 1;
  padding: 3px;
`

export default function Description({description}: {description: string}) {
  return (
    <DescriptionFieldset>
      <legend>Description</legend>
      <p className='description'>{description}</p>
    </DescriptionFieldset>
  )
}
