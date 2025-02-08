/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect, ChangeEvent, useMemo, MouseEvent } from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import { reach as yup_reach, StringSchema } from 'yup'

import TristateCheckbox from './tristateCheckbox'
import CreateFormSchema from './picker_schema'
import { RootState } from '../../data/types/types'


const PickerForm = styled.form`
  min-width: 1000px;
  max-width: 1000px;
  min-height: fit-content;
  max-height: fit-content;
  padding: 0;

  &>div.horizontal-container {
    justify-content: space-evenly;
    padding: 3px;
    align-items: center;
    margin: 3px;
  }
`
const CatFieldset = styled.fieldset`
  align-items: center;

  &>* {
    margin: 0 3px;
  }
  &>label {
    flex-grow: 1;
  }
`
export interface FormState {
  categories: {[key: string]: string},
  statuses: {[key: string]: number},
  tags: {[key: string]: number},
}
interface BtnHandler {
  text: string,
  handler: (data: FormState) => void,
}
interface Props {
  submitHandler: BtnHandler,
  cancelHandler: BtnHandler,
  isBrowse?: boolean,
  // TODO: use Edit Form State
  additionalFormState?: {
    disabledState: boolean,
    formError: {[key: string]: string}
  } | null,
}
export default function Picker({submitHandler, cancelHandler, isBrowse=false, additionalFormState=null}: Props) {
  const protagonists = ['Male', 'Female', 'Futa/Trans', 'Multiple', 'Created', 'Unknown']
  //    ___ _____ _ _____ ___
  //   / __|_   _/_\_   _| __|
  //   \__ \ | |/ _ \| | | _|
  //   |___/ |_/_/ \_\_| |___|
  //
  const categories = useSelector((state: RootState) => state.data.categories)
  const tags = useSelector((state: RootState) => state.data.tags)
  const statuses = useSelector((state: RootState) => state.data.statuses)

  const tagValues = useMemo(() => tags.map(({tag_name}) => tag_name), [tags])
  const statusValues = useMemo(() => statuses.map(({status_name}) => status_name), [statuses])

  const emptyFormData: FormState = {
    categories: {},
    statuses: {},
    tags: {},
  }
  const [formData, setFormData] = useState(emptyFormData)
  const [submitDisabled, setSubmitDisabled] = useState(true)
  const emptyFormErrors: {[key: string]: string} = {}
  const [formErrors, setFormErrors] = useState(emptyFormErrors)

  const defaultFormData = useMemo(() => ({
    categories: categories.reduce((acc: FormState['categories'], cur) => {
      const {category_name} = cur
      acc[category_name] = isBrowse ? 'Any' : ''
      return acc
    }, {protagonist: isBrowse ? 'Any' : ''}),
    statuses: statusValues.reduce((acc: FormState['statuses'], cur) => {
      acc[cur] = isBrowse ? -1 : 0
      return acc
    }, {}),
    tags: tagValues.reduce((acc: FormState['tags'], cur) => {
      acc[cur] = isBrowse ? -1 : 0
      return acc
    }, {}),
  }), [tagValues, statusValues, categories, isBrowse])

  useEffect(() => {
    setFormData(defaultFormData)
    setFormErrors(Object.keys(defaultFormData.categories).reduce((acc: {[key: string]: string}, cur) => {
      acc[cur] = ''
      return acc
    }, {}))
  }, [defaultFormData])

  const formSchema = CreateFormSchema([...categories, {category_name: 'protagonist'}], statuses, tags)
  useEffect(() => {
    // eslint-disable-next-line promise/catch-or-return
    formSchema.isValid(formData)
      .then((isValid) => {
        setSubmitDisabled(!isValid)
      })
  }, [formData, formSchema])
  //    _    ___   ___ ___ ___
  //   | |  / _ \ / __|_ _/ __|
  //   | |_| (_) | (_ || | (__
  //   |____\___/ \___|___\___|
  //
  const subDivideTags = () => {
    const tagsList = [...tags]
    const numRows = Math.ceil(tagsList.length / 8)
    const rows = []

    const baseRowSize = Math.floor(tagsList.length / numRows)
    const extraItems = tagsList.length % numRows
    for (let idx = 0; idx < numRows; idx++) {
      const currentRowSize = baseRowSize + (idx < extraItems ? 1 : 0)
      rows.push(tagsList.splice(0, currentRowSize))
    }
    return rows
  }

  const handleFormChange = (evt: ChangeEvent<HTMLInputElement | HTMLSelectElement>, tristate: boolean = false) => {
    const {name, type, value, checked} = (evt.target as HTMLInputElement)
    let updated
    if (type === 'checkbox') {
      const val = {[name]: isBrowse ? (tristate ? -1 : Number(checked)) : Number(checked)}
      if (tagValues.includes(name)) updated = {tags: {...formData.tags, ...val}}
      else updated = {statuses: {...formData.statuses, ...val}}
    } else {
      // type is <select>
      updated = {categories: {...formData.categories, [name]: value}}
      const schema = yup_reach(formSchema, `categories.${name}`) as StringSchema
      schema.validate(value)
        .then(() => {
          setFormErrors({...formErrors, [name]: ''})
        })
        .catch(({errors}) => {
          setFormErrors({...formErrors, [name]: errors[0]})
        })
    }
    setFormData({...formData, ...updated})
  }

  const handleSubmit = (evt: MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault()
  }
  const handleReset = (evt: MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault()
  }

  return (
    <PickerForm>
      <CatFieldset className='horizontal-container'>
        <legend className='header'>Categories</legend>
        {categories.map(({category_id, category_name, options}) => (
          <fieldset key={`${category_id}${category_name}`}>
            <legend>{`${category_name.slice(0,1).toUpperCase()}${category_name.slice(1)}`}</legend>
              <select
                name={category_name}
                onChange={handleFormChange}
                value={formData.categories[category_name]}
              >
                {[isBrowse ? 'Any' : '', ...options].map(opt => (
                  <option key={`${category_id} ${opt}`} value={opt}>{opt}</option>
                ))}
              </select>
          </fieldset>
        ))}
        <fieldset>
          <legend>Protagonist</legend>
          <select
            name="protagonist"
            onChange={handleFormChange}
            value={formData.categories.protagonist}
          >
            {[isBrowse ? 'Any' : '', ...protagonists].map(protag => (
              <option key={protag} value={protag}>{protag}</option>
            ))}
          </select>
        </fieldset>
        {statuses.map(({status_id, status_name}) => (
          isBrowse ?
            <TristateCheckbox
              key={`${status_id}${status_name}`}
              labelText={status_name}
              handleFormChange={handleFormChange}
              checkState={formData.statuses[status_name]}
            />
            :
            <label
              key={`${status_id}${status_name}`}
            >
              <input
                type="checkbox"
                name={status_name}
                onChange={handleFormChange}
                checked={!!formData.statuses[status_name]}
              />
              {status_name}
            </label>
        ))}
      </CatFieldset>
      <fieldset className='vertical-container'>
        <legend className='header'>Tags</legend>
        {subDivideTags().map((row, idx) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={`row${idx}`} className='horizontal-container'>
            {row.map(({tag_id, tag_name}) => (
              isBrowse ?
                <TristateCheckbox  style={{flex: '1 0 12.5%'}}
                  key={`${tag_id}${tag_name}`}
                  labelText={tag_name}
                  handleFormChange={handleFormChange}
                  checkState={formData.tags[tag_name]}
                />
                :
                <label
                  style={{flex: '1 0 12.5%'}}
                  key={`${tag_id}${tag_name}`}
                >
                  <input
                    type="checkbox"
                    name={tag_name}
                    onChange={handleFormChange}
                    checked={!!formData.tags[tag_name]}
                  />
                  {tag_name}
                </label>
            ))}
          </div>
        ))}
      </fieldset>
      {!isBrowse && Object.values(formErrors).find(s => s) && <p className='error'>{Object.values(formErrors).find(s => s)}</p>}
      <div className='horizontal-container'>
        {/* eslint-disable-next-line react/button-has-type */}
        <button
          type='reset'
          onClick={handleReset}
        >{cancelHandler.text}</button>
        <button
          type='submit'
          onClick={handleSubmit}
          disabled={isBrowse ? false : (submitDisabled || additionalFormState?.disabledState)}
        >{submitHandler.text}</button>
      </div>
    </PickerForm>
  )
}
