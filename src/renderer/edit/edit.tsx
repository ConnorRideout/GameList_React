// TODO: when updating, auto fill info

/* eslint-disable no-use-before-define */
/* eslint-disable promise/catch-or-return */
import React, { ChangeEvent, useEffect, useMemo, useRef, useState, useCallback } from "react"
import styled from "styled-components"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { StringSchema, reach as yup_reach } from "yup"

import Picker, { FormState } from "../shared/picker/picker"
import ErrorMessage from "../shared/errorMessage"
import Tooltip from "../shared/tooltip"
import Info from "./info"
import CreateEditFormSchema from "./edit_schema"

import {
  clearEditGame,
  // setError,
  dequeueMissingGame,
  setEditGame,
  dequeueNewGame,
} from "../../lib/store/gamelibrary"
import {
  FolderOpenSvg,
  FolderEditSvg,
  WebSvg,
  RefreshSvg,
} from "../shared/svg"
import {
  useOpenUrlMutation,
  useOpenFolderMutation,
  useDeleteFileMutation,
} from "../../lib/store/filesystemApi"
import { useCheckUpdatedUrlMutation } from "../../lib/store/websitesApi"
import {
  useUpdateGameMutation,
  useUpdateTimestampMutation,
  useLazyEditGameQuery,
  useNewGameMutation,
} from "../../lib/store/gamelibApi"

import { GameEntry, GamelibState, RootState, StringMap } from "../../types"


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
  const [deleteUrlFile] = useDeleteFileMutation()
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
  const [ignoreUpdatedVersion, setIgnoreUpdatedVersion] = useState(false)

  const game_data = useSelector((state: RootState) => state.data.editGame)
  const { path, title, url, image, version, description, program_path: prog_obj, tags, status, categories }: Omit<GameEntry, 'game_id' | 'image' | 'timestamps' | 'timestamps_sec'> & {image: string} = useMemo(() => (
    {
      path: '',
      title: '',
      url: '',
      version: '',
      description: '',
      program_path: { "": "" },
      tags: [],
      status: [],
      categories: {},
      ...game_data,
      image: (game_data?.image?.at(-1) as string) || ''
    }
  ), [game_data])
  const program_path = Object.entries(prog_obj).map((paths, id) => ({id, paths}))
  const defaultFormData = useMemo<Pick<GameEntry, "url" | "path" | "title" | "version" | "description"> & { image: string, program_path: { id: number; paths: [string, string] }[] }>(
    () => ({ path, title, url, image, version, description, program_path }),
    [path, title, url, image, version, description, program_path]
  )
  const [formData, setFormData] = useState(defaultFormData)

  // Form Validation
  const gamelib = useSelector((state: RootState) => state.data.gamelib)
  const existingTitles = useMemo(() => (gamelib.map(g => g.title)), [gamelib])
  const formSchema = CreateEditFormSchema(existingTitles, title)

  const validateAll = useCallback((curFormData: typeof formData) => {
    // console.log('validate all')
    const formErrorKeys = ['path', 'title', 'url', 'image', 'version', 'description', 'program_path']
    setFormErrors(prev => {
      const newErrors: {[key: string]: any} = {...prev}
      formErrorKeys.forEach(key => {
        const schema = yup_reach(formSchema, key) as StringSchema
        schema.validate((curFormData as {[key: string]: any})[key], {context: curFormData.program_path})
          .then(() => {
            newErrors[key] = ''
          })
          .catch(({ errors: [err] }) => {
            newErrors[key] = err
          })
      })
      return newErrors as typeof prev
    })
  }, [formSchema])
  useEffect(() => {
    validateAll(formData)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    formSchema.isValid(formData, {context: formData.program_path})
      .then(isEditValid => {
        const isFormUpdated = JSON.stringify(defaultFormData) !== JSON.stringify(formData)
        setSubmitDisabled(!isFormUpdated || !isEditValid)
      })
  }, [defaultFormData, formData, formSchema])

  const handleFormChange = (evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string, value: string | string[] | {id: number, paths: [string, string]}[] } }) => {
    const { name, value } = evt.target
    // let value: string | string[] | {id: number, paths: [string, string]}[]
    // if (name === 'image') {
    //   value = [...formData.image]
    //   value[0] = rawVal as string
    // } else {
    //   value = rawVal
    // }
    const schema = yup_reach(formSchema, name) as StringSchema
    const kwargs = name === 'program_path' ? {context: (value as {id: number, paths: [string, string]}[])} : {}
    schema.validate(value, kwargs)
      .then(() => {
        setFormErrors({ ...formErrors, [name]: '' })
      })
      .catch(({ errors }) => {
        setFormErrors({ ...formErrors, [name]: errors[0] })
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
      program_path: {id: number, [string, string]}[]
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
    // delete the dropped url file (if it exists)
    if (urlFile.current) {
      deleteUrlFile(urlFile.current)
      urlFile.current = ''
    }
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
      program_path: formData.program_path.reduce((acc: { [key: string]: string }, {paths: [progPath, progPathName]}) => {
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
      const updatedGame: Omit<GameEntry, 'image'> & {image: string} = {
        game_id,
        ...updatedData,
        tags: updatedTags,
        status: updatedStatuses,
        categories: updatedCategories,
        timestamps,
        timestamps_sec
      }
      await updateGame({ game_id, updatedGameData: updatedGame })
      if (version !== updatedData.version && !ignoreUpdatedVersion)
        await updateTimestamp({ game_id, type: 'updated_at' })
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
    const newFol = window.electron.openFileDialog(
      `Choose a New Folder for '${title}'`,
      'openDirectory'
    )
    if (newFol) {
      // folder path was updated
      setFormData({ ...formData, path: newFol })
    }
  }

  const [additionalFormDataDefaults, setAdditionalFormDataDefaults] = useState({ tags, status, categories})
  const additionalFormData = {
    defaults: additionalFormDataDefaults,
    disabledState: submitDisabled,
    isLoading,
    formErrors
  }

  const updatePickerDefaults = (newDefaults: {[type: string]: string | string[] | StringMap}) => {
    // ensure other categories aren't destroyed
    const updateDefaults = {
      ...newDefaults,
      ...(newDefaults.categories
        ? {...additionalFormDataDefaults.categories, ...(newDefaults.categories as StringMap)}
        : {}
      )
    }
    setAdditionalFormDataDefaults({
      ...additionalFormDataDefaults,
      ...updateDefaults
    })
  }

  const handleCheckUpdatedUrl = async () => {
    const updated = await checkForUpdatedUrl(formData.url).unwrap()
    if (updated.message === 'updated') {
      setFormData(prev => ({...prev, url: updated.redirectedUrl}))
      // STRETCH: flash url input to indicate it was updated
    } else {
      // TODO: indicate the url was not updated
    }
  }

  //    ___  ___    _   ___ _ _  _ _ ___  ___  ___  ___
  //   |   \| _ \  /_\ / __( ) \| ( )   \| _ \/ _ \| _ \
  //   | |) |   / / _ \ (_ |/| .` |/| |) |   / (_) |  _/
  //   |___/|_|_\/_/ \_\___| |_|\_| |___/|_|_\\___/|_|
  //

  const urlFile = useRef('')

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault() // to allow drop
  }, [])

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const { items } = event.dataTransfer

    Array.from(items).forEach(item => {
      if (item.kind === 'file') {
        const file = item.getAsFile()

        if (file) {
          const filePath = file.path
          if (filePath.endsWith('.url')) {
            const reader = new FileReader()
            reader.onload = e => {
              const urlContent = e.target?.result
              if (typeof urlContent === 'string') {
                const weburl = urlContent.split('=')[1]
                setFormData(prev => {
                  const newFormData = { ...prev, url: weburl }
                  validateAll(newFormData)
                  return newFormData
                })
                urlFile.current = filePath
              }
            }
            reader.readAsText(file)
          } else if (file.type.startsWith('image/')) {
            setFormData(prev => {
              const newFormData = { ...prev, image: filePath }
              validateAll(newFormData)
              return newFormData
            })
          }
        }
      }
    })
  }, [validateAll])

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
        const { redirectedUrl } = rawUpdatedUrl
        // update formData
        setFormData({ path: currentMissing.path, title, url: redirectedUrl, image, version, description, program_path })
        setAdditionalFormDataDefaults({tags, status, categories})
        // clear visual and effect blocking
        setIsLoading(false)
        blockUpdateEdit.current = false
        validateAll({ path: currentMissing.path, title, url: redirectedUrl, image, version, description, program_path })
        setFlashPath(true)
        setTimeout(() => setFlashPath(false), 300)
      })()
    }
  }, [editType, game_data, formData, currentMissing, checkForUpdatedUrl, title, url, image, version, description, program_path, tags, status, categories, validateAll])

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
      dispatch(setEditGame({ path: curNew }))
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
        setFormData({ path: currentNew, title, url, image, version, description, program_path })
        // clear visual and effect blocking
        setIsLoading(false)
        blockUpdateEdit.current = false
        setFlashPath(true)
        setTimeout(() => setFlashPath(false), 300)
      })()
    }
  }, [editType, game_data, formData, currentNew, path, title, url, image, version, description, program_path])

  return (
    <div
      className="main-container"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <EditDiv className="main-container center">
        {isLoading && <div className='loading' />}
        <h1>{editType === 'new' ? 'ADD NEW' : 'EDIT'} GAME</h1>
        {/* <button style={{ position: 'fixed', left: 0, top: '30px' }} type='button' onClick={() => dispatch(setError('test error'))}>Test</button> */}
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
            className="svg-button small floating"
            onClick={handleCheckUpdatedUrl}
          >
            <RefreshSvg />
          </button>
          <Tooltip
            anchorSelect=".svg-button.small.floating"
          >
            Check if URL has been updated
          </Tooltip>
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
          setFormData={setFormData}
          updatePickerDefaults={updatePickerDefaults}
          setIsLoading={setIsLoading}
          ignoreUpdatedVersion={ignoreUpdatedVersion}
          setIgnoreUpdatedVersion={setIgnoreUpdatedVersion}
          validateAll={validateAll}
        />

        <Picker
          submitHandler={{
            text: 'Save and Close',
            handler: submitHandler
          }}
          cancelHandler={{
            text: 'Cancel',
            handler: closeEdit
          }}
          additionalFormData={additionalFormData}
        />
      </EditDiv>
    </div>
  )
}
