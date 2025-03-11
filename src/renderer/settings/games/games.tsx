/* eslint-disable import/no-cycle */
// TODO: have a 'deleted' item for any removed item, so the user can undo it
import React from 'react'

import Categories from './categories'
import Statuses from './statuses'
import Tags from './tags'
import { DefaultFormType } from '../settings'


export interface Props {
  formData: DefaultFormType,
  setFormData: React.Dispatch<React.SetStateAction<DefaultFormType>>
}
export default function Games({formData, setFormData}: Props) {
  return (
    <div className='settings-games-container'>
      <Categories formData={formData} setFormData={setFormData}/>
      <Statuses formData={formData} setFormData={setFormData}/>
      <Tags formData={formData} setFormData={setFormData}/>
    </div>
  )
}
