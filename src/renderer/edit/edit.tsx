// TODO: when updating, auto fill info
// TODO: when updating, show differences in tags/categories/etc and allow user to pick which ones to keep/change
// TODO: add checkbox that will prevent the `updated_at` timestamp from updating even if version changes
// TODO: drag n drop handler for urls and images
// TODO: set default values for categories like 'play-status'
// TODO: title must be unique

/* eslint-disable no-use-before-define */
/* eslint-disable promise/catch-or-return */
import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from "react"
import styled from "styled-components"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { StringSchema, reach as yup_reach } from "yup"

import Picker, { FormState } from "../shared/picker/picker"
import ErrorMessage from "../shared/errorMessage"
import Info from "./info"
import {
  clearEditGame,
  setError,
  dequeueMissingGame,
  setEditGame,
  dequeueNewGame,
} from "../../lib/store/gamelibrary"
import {
  FolderOpenSvg,
  FolderEditSvg,
  WebSvg,
} from "../shared/svg"
import {
  useOpenUrlMutation,
  useOpenFolderMutation,
  useCheckUpdatedUrlMutation,
} from "../../lib/store/filesystemApi"
import {
  useUpdateGameMutation,
  useUpdateTimestampMutation,
  useLazyEditGameQuery,
  useNewGameMutation,
} from "../../lib/store/gamelibApi"

import { GameEntry, GamelibState, RootState } from "../../types"
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
export default function Edit() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [openUrl] = useOpenUrlMutation()
  const [openFolder] = useOpenFolderMutation()
  const [updateGame] = useUpdateGameMutation()
  const [newGame] = useNewGameMutation()
  const [updateTimestamp] = useUpdateTimestampMutation()
  const [updateEditGame] = useLazyEditGameQuery()
  const [isLoading, setIsLoading] = useState(false)
  const game_dir = useSelector((state: RootState) => state.data.settings.games_folder)
  const editType = useSelector((state: RootState) => state.data.editGameType)

  const [flashPath, setFlashPath] = useState(false)
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
  const {path, title, url, image, version, description, program_path: prog_obj, tags, status, categories}: Omit<GameEntry, 'game_id' | 'timestamps' | 'timestamps_sec'> = useMemo(() => (
    {
      path: '',
      title: '',
      url: '',
      image: '',
      version: '',
      description: '',
      program_path: {"":""},
      tags: [],
      status: [],
      categories: {},
      ...game_data
    }
  ), [game_data])
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
    if (editType === 'new') {
      const addedGame = {
        ...updatedData,
        tags: updatedTags,
        status: updatedStatuses,
        categories: updatedCategories,
      }
      await newGame(addedGame)
      setIsLoading(false)
      dispatch(dequeueNewGame())
      if (newGames.length === 1)
        closeEdit()
    } else {
      const { game_id, timestamps, timestamps_sec } = (game_data as GameEntry)
      const updatedGame: GameEntry = {
        game_id,
        ...updatedData,
        tags: updatedTags,
        status: updatedStatuses,
        categories: updatedCategories,
        timestamps,
        timestamps_sec
      }
      await updateGame({game_id, updatedGameData: updatedGame})
      if (version !== updatedData.version) await updateTimestamp({game_id, type: 'updated_at'})
      setIsLoading(false)
      if (editType === 'update') {
        // handle updating missingGames
        dispatch(dequeueMissingGame())
        if (missingGames.length === 1)
          closeEdit()
      } else {
        closeEdit()
      }
    }
  }

  const handleChangeFolder = () => {
    const newFol = window.electron.openFileDialog({
      title: `Choose a New Folder for '${title}'`,
      dialogType: 'openDirectory'
    })
    if (newFol) {
      // folder path was updated
      setFormData({...formData, path: newFol})
    }
  }

  const additionalFormData = {
    defaults: {tags, status, categories},
    disabledState: submitDisabled,
    formErrors
  }

  //    _   _ ___ ___   _ _____ ___ _  _  ___   __  __ ___ ___ ___ ___ _  _  ___    ___   _   __  __ ___ ___
  //   | | | | _ \   \ /_\_   _|_ _| \| |/ __| |  \/  |_ _/ __/ __|_ _| \| |/ __|  / __| /_\ |  \/  | __/ __|
  //   | |_| |  _/ |) / _ \| |  | || .` | (_ | | |\/| || |\__ \__ \| || .` | (_ | | (_ |/ _ \| |\/| | _|\__ \
  //    \___/|_| |___/_/ \_\_| |___|_|\_|\___| |_|  |_|___|___/___/___|_|\_|\___|  \___/_/ \_\_|  |_|___|___/
  //
  const [checkForUpdatedUrl] = useCheckUpdatedUrlMutation()
  const missingGames = useSelector((state: RootState) => state.data.missingGames)
  const [currentMissing, setCurrentMissing] = useState<GamelibState['missingGames'][0]>()
  const blockUpdateEdit = useRef(false)
  useEffect(() => {
    // if updating missing games, start working through missingGames
    if (missingGames.length && editType === 'update') {
      const curMissing = missingGames[0]
      setCurrentMissing(curMissing)
      updateEditGame(curMissing.game_id)
    }
  }, [editType, missingGames, updateEditGame])
  useEffect(() => {
    // fill the form with data
    if (editType === 'update' && !blockUpdateEdit.current && game_data && currentMissing && formData.path !== currentMissing.path && title === currentMissing.title) {
      // show visual blocking and block the effect
      setIsLoading(true)
      blockUpdateEdit.current = true;
      (async () => {
        // update url
        const rawUpdatedUrl = await checkForUpdatedUrl(url).unwrap()
        const {redirectedUrl} = rawUpdatedUrl
        // update formData
        setFormData({path: currentMissing.path, title, url: redirectedUrl, image, version, description, program_path})
        // clear visual and effect blocking
        setIsLoading(false)
        blockUpdateEdit.current = false
        setFlashPath(true)
        setTimeout(() => setFlashPath(false), 300)
      })()
    }
  }, [editType, game_data, formData, currentMissing, checkForUpdatedUrl, title, url, image, version, description, program_path])

  //      _   ___  ___ ___ _  _  ___   _  _ _____      __   ___   _   __  __ ___ ___
  //     /_\ |   \|   \_ _| \| |/ __| | \| | __\ \    / /  / __| /_\ |  \/  | __/ __|
  //    / _ \| |) | |) | || .` | (_ | | .` | _| \ \/\/ /  | (_ |/ _ \| |\/| | _|\__ \
  //   /_/ \_\___/|___/___|_|\_|\___| |_|\_|___| \_/\_/    \___/_/ \_\_|  |_|___|___/
  //
  const newGames = useSelector((state: RootState) => state.data.newGames)
  const [currentNew, setCurrentNew] = useState<GamelibState['newGames'][0]>()
  useEffect(() => {
    // if adding new games, start working through newGames
    if (newGames && newGames.length && editType === 'new') {
      const curNew = newGames[0]
      setCurrentNew(curNew)
      dispatch(setEditGame({path: curNew}))
    }
  }, [editType, newGames, dispatch])
  useEffect(() => {
    // fill the form with data
    if (editType === 'new' && !blockUpdateEdit.current && currentNew && currentNew !== formData.path) {
      // show visual blocking and block the effect
      setIsLoading(true)
      blockUpdateEdit.current = true;
      (async () => {
        // update formData
        setFormData({path: currentNew, title, url, image, version, description, program_path})
        // clear visual and effect blocking
        setIsLoading(false)
        blockUpdateEdit.current = false
        setFlashPath(true)
        setTimeout(() => setFlashPath(false), 300)
      })()
    }
  }, [editType, game_data, formData, currentNew, path, title, url, image, version, description, program_path])

  return (
    <EditDiv className="main-container vertical-center">
      {isLoading && <div className='loading' />}
      <h1>{editType === 'new' ? 'ADD NEW' : 'EDIT'} GAME</h1>
      <button style={{position: 'fixed', left: 0, top: '30px'}} type='button' onClick={() => dispatch(setError('test error'))}>Test</button>
      <ErrorMessage />

      <fieldset className={`horizontal-container ${flashPath ? 'flash-twice-invert' : ''}`}>
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
          onClick={handleChangeFolder}
        >
          <FolderEditSvg color="currentColor" size={25} />
        </button>
      </fieldset>

      <fieldset className="horizontal-container">
        {/* TODO: button to check for updated url */}
        {/* TODO? warn if url is invalid */}
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
