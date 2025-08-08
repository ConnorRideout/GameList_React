// STRETCH: image editor/selector if image isn't 16:9
// TODO: if image is changed, attempt to delete the old image so it's not still sitting in the fol
// FIXME: image handling with gifs seems broken when editing. Make sure the right field is being edited
import React, {ChangeEvent} from "react"
import { useDispatch, useSelector } from "react-redux"

import Tooltip from "../shared/tooltip"
import {
  ImageSearchSvg,
  FileAutoSearchSvg,
} from "../shared/svg"
// eslint-disable-next-line import/no-cycle
import ProgramPaths from "./dnd/programPaths"
import { toTitleCase } from "../../lib/helperFunctions"

import { useAutofillFromWebsiteMutation } from "../../lib/store/websitesApi"
import { useGetExecutablesMutation } from "../../lib/store/filesystemApi"
import { setError } from "../../lib/store/gamelibrary"

import { GameEntry, RootState, StringMap } from "../../types"


export interface Props {
  handleFormChange: (evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | {target: {name: string, value: string | {id: number, paths: [string, string]}[]}}) => void,
  formData: Pick<GameEntry, 'path' | 'title' | 'url' | 'version' | 'description'> & {image: string, program_path: {id: number, paths: [string, string]}[]},
  setFormData: React.Dispatch<React.SetStateAction<{
    path: string;
    title: string;
    url: string;
    image: string;
    version: string;
    description: string;
    program_path: {
        id: number;
        paths: [string, string];
    }[];
}>>,
  updatePickerDefaults: (newDefaults: {[type: string]: string | string[] | StringMap}) => void,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  ignoreUpdatedVersion: boolean,
  setIgnoreUpdatedVersion: React.Dispatch<React.SetStateAction<boolean>>
}
export default function Info({handleFormChange, formData, setFormData, updatePickerDefaults, setIsLoading, ignoreUpdatedVersion, setIgnoreUpdatedVersion}: Props) {
  const dispatch = useDispatch()
  const settings = useSelector((state: RootState) => state.data.settings)
  const [autoFillFromWebsite] = useAutofillFromWebsiteMutation()
  const [getExecutables] = useGetExecutablesMutation()

  const handleImageSearch = () => {
    const img = window.electron.openFileDialog(
      `Select the Image for "${formData.title}"`,
      'openFile',
      undefined,
      'images'
    )
    if (img !== undefined) {
      setFormData(prevVal => ({...prevVal, image: img}))
    }
  }

  const handleAutoExeSearch = () => {
    const existing_paths = formData.program_path.map(({paths: [,prog_pth]}) => prog_pth).filter(p => p.trim())
    getExecutables({top_path: formData.path, existing_paths}).unwrap()
      .then(({filepaths}: {filepaths: string[]}) => {
        const program_path: {id: number, paths: [string, string]}[] = filepaths.map((pth, id) => {
          const basepath = pth.replace(/\.[^.]*?$/, '')
          const split_path = basepath.replaceAll(/(?<=[a-z])(?=[A-Z])|_/g, ' ')
          return {id, paths: [toTitleCase(split_path).trim(), pth]}
        })
        setFormData(prevVal => ({...prevVal, program_path}))
      })
      .catch(err => {
        console.error(err)
      })
  }

  const handleAutoFill = async () => {
    // TODO: when updating, show differences in tags/categories/etc and allow user to pick which ones to keep/change
    // TODO: move protagonist to categories, and make a selector for it. Have the database be ordered by preference? IDK how to have 'multiple' be an option
    const { url } = formData
    const { website_id } = settings.site_scrapers.find(scraper => url.includes(scraper.base_url))!
    setIsLoading(true)
    try {
      const scraper_result = await autoFillFromWebsite({website_id, url}).unwrap()
      const newEditFormData: StringMap = {}
      const newPickerFormData: {[type: string]: string | string[] | StringMap} = {}
      scraper_result.forEach(({type, parsed}) => {
        if (['title', 'description', 'version'].includes(type)) {
          // type is title, description, or version from Edit FormData
          newEditFormData[type] = (parsed as string)
        } else {
          // type is tags, tag, status, or category_<cat_name> from Picker FormData
          const updateType = type.includes('tag')
            ? 'tags'
            : type.includes('category')
              ? 'categories'
              : 'status'
          const newValues = updateType === 'categories'
            ? {[type.match(/_(.+)$/)![1]]: parsed[0], ...((newPickerFormData.categories as StringMap | undefined) || {})}
            : parsed
          // console.log('changing picker', updateType, newValues)
          newPickerFormData[updateType] = newValues
        }
      })
      setFormData({...formData, ...newEditFormData})
      updatePickerDefaults(newPickerFormData)
    } catch (error: any) {
      dispatch(setError(error.message))
    }
    setIsLoading(false)
    handleAutoExeSearch()
  }

  const toggleIgnoreVersion = () => {
    setIgnoreUpdatedVersion(prev => !prev)
  }

  const autofillIsDisabled = !settings.site_scrapers.find(s => formData.url.includes(s.base_url))

  return (
    <fieldset className="info-container">
      <legend>Info</legend>
      <button
        id="autoFillButton"
        className="grid-column-1 grid-row-1 pad"
        type="button"
        onClick={handleAutoFill}
        disabled={autofillIsDisabled}
      >Auto-fill info from URL</button>
      <Tooltip
        className="wide"
        place='top-start'
        anchorSelect="#autoFillButton"
      >
        {autofillIsDisabled ? (
          <p>The URL provided does not have a site scraper defined within settings. Please manually enter the information instead</p>
        ) : (
            <ul>
              Attempt to retrieve various data from the provided url.
              <li>- Data may include the <u>title</u>, <u>version</u>, <u>description</u>, <u>categories</u>, <u>statuses</u>, and/or <u>tags</u></li>
              <li>- This will also run the auto-search for program path(s)</li>
            </ul>
        )}
      </Tooltip>

      <Tooltip
        float
        className='tooltip-image'
        place='bottom-end'
        opacity='1'
        anchorSelect='#imagePreview'
      >
        <img
          src={`load-image://${encodeURIComponent(formData.image)}`}
          alt="Dynamic Local Resource Tooltip"
        />
      </Tooltip>
      <img
        id="imagePreview"
        src={`load-image://${encodeURIComponent(formData.image)}`}
        alt="[image preview]"
        className="grid-column-4 grid-row-1 grid-row-span-4"
      />

      <label htmlFor="titleField" className="grid-column-1 grid-row-2">Title:</label>
      <input
        id="titleField"
        type="text"
        className="grid-column-2 grid-row-2 grid-column-span-2 info-justify-stretch"
        name="title"
        onChange={handleFormChange}
        value={formData.title}
      />

      <label htmlFor="imageField" className="grid-column-1 grid-row-3">Image Path:</label>
      <input
        type="text"
        id="imageField"
        className="grid-column-2 grid-row-3 info-justify-stretch"
        name="image"
        onChange={handleFormChange}
        value={formData.image}
      />
      <button
        type='button'
        className="grid-column-3 grid-row-3 svg-button"
        onClick={handleImageSearch}
      >
        <ImageSearchSvg
          color="currentColor"
        />
      </button>

      <label htmlFor="versionField" className="grid-column-1 grid-row-4">Version:</label>
      <input
        type="text"
        id="versionField"
        className="grid-column-2 grid-row-4 info-justify-stretch"
        name="version"
        onChange={handleFormChange}
        value={formData.version}
      />
      <label id="versionIgnoreCheckbox" className="grid-column-3 grid-row-4">
        <input
          type="checkbox"
          checked={ignoreUpdatedVersion}
          onChange={toggleIgnoreVersion}
        />
        Ignore
      </label>
      <Tooltip
        anchorSelect="#versionIgnoreCheckbox"
      >
        If this is selected, the &quot;updated at&quot; timestamp won&apos;t be changed, even if the version changes
      </Tooltip>

      <span className="grid-column-1 grid-row-5 align-start">Program Path(s):</span>
      <button
        type='button'
        className="svg-button grid-column-1 grid-row-6 align-start"
        onClick={handleAutoExeSearch}
      >
        <FileAutoSearchSvg />
        Auto search
      </button>
      <ProgramPaths
        handleFormChange={handleFormChange}
        formData={formData}
      />

      <label htmlFor="descriptionField" className="grid-column-1 grid-row-7 align-start">Description:</label>
      <textarea
        name="description"
        id="descriptionField"
        className="grid-column-2 grid-row-7 info-justify-stretch"
        onChange={handleFormChange}
        value={formData.description}
      />
    </fieldset>
  )
}
