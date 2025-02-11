// TODO: make edit window
import React, { useState } from "react"
import styled from "styled-components"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"

import Picker, { FormState } from "../shared/picker/picker"
import Info from "./info"
import { clearEditGame } from "../../data/store/gamelibrary"
import {
  FolderOpenSvg,
  FolderEditSvg,
  WebSvg,
} from "../shared/svg"

import { RootState } from "../../types"


const EditDiv = styled.div`
  min-width: fit-content;

  &>fieldset {
    width: 100%;
    padding: 6px;

    &>legend {
      font-size: var(--font-title);
    }
  }
`
const PathP = styled.p`
  font-size: var(--font-header);
`
export default function Edit() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [submitDisabled, setSubmitDisabled] = useState(true)
  const emptyFormErrors: {[key: string]: string} = {}
  const [formErrors, setFormErrors] = useState(emptyFormErrors)

  const game_data = useSelector((state: RootState) => state.data.editGame)!
  const {path, title, url, image, version, description, program_path, tags, status, categories} = game_data

  const closeEdit = () => {
    dispatch(clearEditGame())
    navigate('/')
  }

  const submitHandler = (data: FormState) => {
    console.log(data)
  }

  const additionalFormData = {
    defaults: game_data,
    disabledState: submitDisabled,
    formError: formErrors
  }

  return (
    <EditDiv className="main-container">

      <fieldset className="horizontal-container">
        <legend>Top Path</legend>
        <PathP className="grow-1">{path}</PathP>
        <button type="button" className="svg-button">
          <FolderOpenSvg color="currentColor" size={25} />
        </button>
        <button type="button" className="svg-button">
          <FolderEditSvg color="currentColor" size={25} />
        </button>
      </fieldset>

      <fieldset className="horizontal-container">
        <legend>URL</legend>
        <input
          type="text"
          className="grow-1"
        />
        <button type='button' className="svg-button">
          <WebSvg color="currentColor" size={25} />
        </button>
      </fieldset>

      <Info />


      <Picker
        submitHandler={{
          text: 'Save',
          handler: submitHandler}}
        cancelHandler={{
          text: 'Cancel',
          handler: closeEdit
        }}
        additionalFormData={additionalFormData}
      />
      <button type="button" onClick={closeEdit}>Return to browse</button>
    </EditDiv>
  )
}
