// TODO: allow categories/any pulldown to be multi-selected with both include and exclude (like the tristate checkbox)

/* eslint-disable import/no-cycle */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect, ChangeEvent, useMemo, MouseEvent } from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import { reach as yup_reach, StringSchema } from 'yup'

import CreatePickerFormSchema from './picker_schema'
import Categories from './pick_categories'
import Tags from './pick_tags'

import { RootState, GameEntry } from '../../../types'


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

export interface FormState {
  categories: {[key: string]: string},
  statuses: {[key: string]: number}, // -1 if tristate, 0 if unchecked, 1 if checked
  tags: {[key: string]: number}, // -1 if tristate, 0 if unchecked, 1 if checked
}
interface Props {
  submitHandler: {
    text: string,
    handler: (data: FormState) => void | Promise<void>,
  },
  cancelHandler: {
    text: string,
    handler: () => void,
  },
  isBrowse?: boolean,
  additionalFormData?: {
    defaults: Pick<GameEntry, 'tags' | 'status' | 'categories'>,
    disabledState: boolean,
    formErrors: {[key: string]: string}
  } | null,
}
export default function Picker({submitHandler, cancelHandler, isBrowse=false, additionalFormData=null}: Props) {

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
  const [flashClear, setFlashClear] = useState(false)
  const [allowSetDefault, setAllowSetDefault] = useState(true)

  const defaultFormData = useMemo(() => ({
    categories: categories.reduce((acc: FormState['categories'], cur) => {
      const {category_name} = cur
      acc[category_name] = isBrowse ? 'Any' : (additionalFormData ? additionalFormData.defaults?.categories[category_name] || '' : '')
      return acc
    }, {protagonist: isBrowse ? 'Any' : (additionalFormData ? additionalFormData.defaults?.categories.protagonist || '' : '')}),
    statuses: statusValues.reduce((acc: FormState['statuses'], cur) => {
      acc[cur] = isBrowse ? -1 : (additionalFormData ? Number(additionalFormData.defaults?.status.includes(cur)) || 0 : 0)
      return acc
    }, {}),
    tags: tagValues.reduce((acc: FormState['tags'], cur) => {
      acc[cur] = isBrowse ? -1 : (additionalFormData ? Number(additionalFormData.defaults?.tags.includes(cur)) || 0 : 0)
      return acc
    }, {}),
  }), [tagValues, statusValues, categories, isBrowse, additionalFormData])

  useEffect(() => {
    if (allowSetDefault) {
      setFormData(defaultFormData)
      setFormErrors(Object.keys(defaultFormData.categories).reduce((acc: {[key: string]: string}, cur) => {
        acc[cur] = ''
        return acc
      }, {}))
    }
  }, [defaultFormData, allowSetDefault])

  const formSchema = CreatePickerFormSchema([...categories, {category_name: 'protagonist'}], statuses, tags)
  useEffect(() => {
    // eslint-disable-next-line promise/catch-or-return
    formSchema.isValid(formData)
      .then(isPickerValid => {
        setSubmitDisabled(!isPickerValid)
      })
  }, [formData, formSchema])
  //    _    ___   ___ ___ ___
  //   | |  / _ \ / __|_ _/ __|
  //   | |_| (_) | (_ || | (__
  //   |____\___/ \___|___\___|
  //

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

  const handleSubmit = async (evt: MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault()
    setAllowSetDefault(false)
    await submitHandler.handler(formData)
    setAllowSetDefault(true)
  }
  const handleReset = (evt: MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault()
    // run the parent's handler
    cancelHandler.handler()
    if (isBrowse) {
      setFlashClear(true)
      setTimeout(() => setFlashClear(false), 350)
      setFormData(defaultFormData)
    }
  }

  return (
    <PickerForm className={flashClear ? 'flash-once' : ''}>
      <Categories
        categories={categories}
        statuses={statuses}
        handleFormChange={handleFormChange}
        isBrowse={isBrowse}
        formData={formData}
      />
      <Tags
        tags={tags}
        isBrowse={isBrowse}
        handleFormChange={handleFormChange}
        formData={formData}
      />
      {!isBrowse && (Object.values(formErrors).find(s => s) || Object.values(additionalFormData!.formErrors).find(s => s)) && (
        <>
          <p className='error'>{Object.values(additionalFormData!.formErrors).find(s => s)}</p>
          <p className='error'>{Object.values(formErrors).find(s => s)}</p>
        </>
      )}
      <div className='horizontal-container'>
        {/* eslint-disable-next-line react/button-has-type */}
        <button
          type='reset'
          onClick={handleReset}
        >{cancelHandler.text}</button>
        <button
          type='submit'
          onClick={handleSubmit}
          disabled={isBrowse ? false : (submitDisabled || additionalFormData?.disabledState)}
        >{submitHandler.text}</button>
      </div>
    </PickerForm>
  )
}
