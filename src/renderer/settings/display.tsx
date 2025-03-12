// TODO: option to hide 'beaten' games from recent lists
import React from 'react'

// eslint-disable-next-line import/no-cycle
import { DefaultDisplayFormType } from './settings'


interface Props {
  formData: DefaultDisplayFormType,
  setFormData: React.Dispatch<React.SetStateAction<DefaultDisplayFormType>>
}
export default function Display({formData, setFormData}: Props) {
  return (
    <div>display</div>
  )
}
