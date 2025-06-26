/* eslint-disable import/no-cycle */
// TODO: have a 'deleted' item for any removed item, so the user can undo it
// TODO: warn about deleting existing items, as it will permanently delete them from all the related games as well
import React from 'react'

import Categories from './categories'
import Statuses from './statuses'
import Tags from './tags'
import { DefaultGamesFormType } from '../settings'


export interface Props {
  formData: DefaultGamesFormType,
  setFormData: React.Dispatch<React.SetStateAction<DefaultGamesFormType>>
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
