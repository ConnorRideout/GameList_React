/* eslint-disable import/no-cycle */
/* eslint-disable react/no-array-index-key */
import React from 'react'

import Logins from './logins'
import Selectors from './selectors'
import Aliases from './aliases'

// eslint-disable-next-line import/no-cycle
import { DefaultScrapersFormType } from '../settings'


export interface Props {
  formData: DefaultScrapersFormType,
  setFormData: React.Dispatch<React.SetStateAction<DefaultScrapersFormType>>
}
export default function Scrapers({formData, setFormData}: Props) {
  return (
    // TODO: create a "advanced users only" warning
    <div className='settings-scrapers-container'>
      <Selectors formData={formData} setFormData={setFormData}/>
      <Logins formData={formData} setFormData={setFormData} />
      <Aliases formData={formData} setFormData={setFormData}/>
    </div>
  )
}
