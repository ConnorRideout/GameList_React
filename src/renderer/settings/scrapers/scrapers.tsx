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
    <div className='settings-scrapers-container'>
      <Logins formData={formData} setFormData={setFormData} />
      <Selectors formData={formData} setFormData={setFormData}/>
      <Aliases formData={formData} setFormData={setFormData}/>
    </div>
  )
}
