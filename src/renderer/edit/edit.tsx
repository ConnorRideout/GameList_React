/* eslint-disable promise/catch-or-return */
import React, { ChangeEvent, useEffect, useState } from "react"
import styled from "styled-components"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { StringSchema, reach as yup_reach } from "yup"

import Picker, { FormState } from "../shared/picker/picker"
import ErrorMessage from "../shared/errorMessage"
import Info from "./info"
import { clearEditGame, setError } from "../../lib/store/gamelibrary"
import {
  FolderOpenSvg,
  FolderEditSvg,
  WebSvg,
} from "../shared/svg"
import {
  useOpenUrlMutation,
  useOpenFolderMutation,
} from "../../lib/store/filesystemApi"
import {
  useUpdateGameMutation,
  useUpdateTimestampMutation,
} from "../../lib/store/gamelibApi"

import { GameEntry, RootState } from "../../types"
import CreateEditFormSchema from "./edit_schema"


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
export interface Props {
  isNew?: boolean,
}
export default function Edit({isNew=false}: Props) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [openUrl] = useOpenUrlMutation()
  const [openFolder] = useOpenFolderMutation()
  const [updateGame] = useUpdateGameMutation()
  const [updateTimestamp] = useUpdateTimestampMutation()
  const game_dir = useSelector((state: RootState) => state.data.config.games_folder)
  const [isLoading, setIsLoading] = useState(false)

  const [submitDisabled, setSubmitDisabled] = useState(true)
  const emptyFormErrors = {
    path: '',
    title: '',
    url: '',
    image: '',
    version: '',
    description: '',
    program_path: '',
  }
  const [formErrors, setFormErrors] = useState(emptyFormErrors)

  const game_data = useSelector((state: RootState) => state.data.editGame)
  const emptyFormData = {
    path: '',
    title: '',
    url: '',
    image: '',
    version: '',
    description: '',
    program_path: {"":""},
    tags: [],
    status: [],
    categories: {}
  }
  const {path, title, url, image, version, description, program_path: prog_obj, tags, status, categories}: Omit<GameEntry, 'game_id' | 'timestamps' | 'timestamps_sec'> = game_data || emptyFormData
  const program_path = Object.entries(prog_obj)
  const [formData, setFormData] = useState({path, title, url, image, version, description, program_path})

  const formSchema = CreateEditFormSchema()
  useEffect(() => {
    formSchema.isValid(formData)
      .then(isEditValid => {
        setSubmitDisabled(!isEditValid)
      })
  }, [formData, formSchema])

  const handleFormChange = (evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | {target: {name: string, value: string | [string, string][]}}) => {
    const {name, value} = evt.target
    const schema = yup_reach(formSchema, name) as StringSchema
    schema.validate(value)
      .then(() => {
        setFormErrors({...formErrors, [name]: ''})
      })
      .catch(({errors}) => {
        setFormErrors({...formErrors, [name]: errors[0]})
      })
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const closeEdit = () => {
    dispatch(clearEditGame())
    navigate('/')
  }

  const submitHandler = async (data: FormState) => {
    /*
    data = {
      categories: {[key: string]: string},
      statuses: {[key: string]: number},  // 0 if unchecked, 1 if checked
      tags: {[key: string]: number}, // 0 if unchecked, 1 if checked
    }
    formData = {
      path: string,
      title: string,
      url: string,
      image: string,
      version: string,
      description: string,
      program_path: [string, string][]
    }
    needs to be: {
      path: string,
      title: string,
      url: string,
      image: string,
      version: string,
      description: string,
      program_path: {[key: string]: string},
      tags: string[],
      status: string[],
      categories: {[key: string]: string},
      timestamps: {
        created_at: string,
        updated_at: string | null,
        played_at: string | null,
      }
    },
    */
    setIsLoading(true)
    // parse data
    const { categories: updatedCategories, statuses: rawStatuses, tags: rawTags } = data
    const updatedStatuses = Object.entries(rawStatuses).reduce((acc: string[], [stat, isChecked]) => {
      if (isChecked) acc.push(stat)
      return acc
    }, [])
    const updatedTags = Object.entries(rawTags).reduce((acc: string[], [tag, isChecked]) => {
      if (isChecked) acc.push(tag)
      return acc
    }, [])
    // parse formData
    const updatedData = {
      ...formData,
      program_path: formData.program_path.reduce((acc: {[key: string]: string}, [progPath, progPathName]) => {
        acc[progPath] = progPathName
        return acc
      }, {})
    }
    if (isNew) {
      // TODO: handle creating new game entry
    } else {
      const { game_id, timestamps, timestamps_sec } = game_data!
      const updatedGame: GameEntry = {
        game_id,
        ...updatedData,
        tags: updatedTags,
        status: updatedStatuses,
        categories: updatedCategories,
        timestamps,
        timestamps_sec
      }
      // setFormData({...emptyFormData, program_path: [["", ""]]})
      await updateGame({game_id, game: updatedGame})
      if (version !== updatedData.version) await updateTimestamp({game_id, type: 'updated_at'})
      setIsLoading(false)
      closeEdit()
    }
  }

  const additionalFormData = {
    defaults: {tags, status, categories},
    disabledState: submitDisabled,
    formErrors
  }

  return (
    <EditDiv className="main-container vertical-center">
      {isLoading && <div className='loading' />}
      <h1>{isNew ? 'ADD NEW' : 'EDIT'} GAME</h1>
      <button style={{position: 'fixed', left: 0, top: '30px'}} type='button' onClick={() => dispatch(setError('test error'))}>Test</button>
      <ErrorMessage />

      <fieldset className="horizontal-container">
        <legend>Top Path</legend>
        <PathP className="grow-1">{formData.path}</PathP>
        <button
          type="button"
          className="svg-button"
          onClick={() => openFolder(`${game_dir}/${formData.path}`)}
        >
          <FolderOpenSvg color="currentColor" size={25} />
        </button>
        <button
          type="button"
          className="svg-button"
        >
          <FolderEditSvg color="currentColor" size={25} />
        </button>
      </fieldset>

      <fieldset className="horizontal-container">
        <legend>URL</legend>
        <input
          type="text"
          className="grow-1"
          name="url"
          onChange={handleFormChange}
          value={formData.url}
        />
        <button
          type='button'
          className="svg-button"
          onClick={() => openUrl(formData.url)}
        >
          <WebSvg color="currentColor" size={25} />
        </button>
      </fieldset>

      <Info
        handleFormChange={handleFormChange}
        formData={formData}
      />


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
    </EditDiv>
  )
}
