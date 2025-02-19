import React from "react"
import { useSelector, useDispatch } from "react-redux"
import styled from 'styled-components'

import { clearError } from "../../lib/store/gamelibrary"
import { RootState } from "../../types"


const ClearErrorButton = styled.button`
  font-size: 8pt;
  min-height: min-content;
  height: min-content;
  min-width: min-content;
  padding: 2px;
  margin-left: 5px;
  z-index: 100;
`
export default function ErrorMessage() {
  const dispatch = useDispatch()
  const error = useSelector((state: RootState) => state.data.error)

  const clearErrorHandler = () => {
    dispatch(clearError())
  }

  if (error) return (
    <div className='error-container'>
      <p className='error'>Error: {error}</p>
      <ClearErrorButton type='button' onClick={clearErrorHandler}>OK</ClearErrorButton>
    </div>
  )
  return ('')
}
