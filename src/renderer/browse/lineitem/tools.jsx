import React from 'react'
import styled from 'styled-components'

const ToolsFieldset = styled.fieldset`
  min-width: fit-content;
  max-width: fit-content;
`

export default function Tools({path, programPath, url}) {
  return (
    <ToolsFieldset>
      <legend>Tools</legend>
      <p>play</p>
      <p>web</p>
      <p>edit</p>
    </ToolsFieldset>
  )
}
