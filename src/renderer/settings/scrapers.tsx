/* TODO: advanced option to make website scrapers:
title/description/version (expects a string) -> textinput[SELECTOR], checkbox[doQueryAll], textinput[regexmatcher](if doQueryAll, will be run on all SELECTOR matches and return the first regexMatch; otherwise, just returns the regexMatch of the textcontent)
tags (expects an array) -> textinput[SELECTOR], checkbox[doQueryAll], textinput[regexmatcher](if doQueryAll, will be run on all SELECTOR matches and returns an array of strings if the string.length > 0; otherwise, returns an array of the matches gotten by regexmatcher) it is required if doQueryAll is false
others -> combobox[TYPE(category|status|tag)], textinput[SELECTOR], checkbox[doQueryAll], textinput[regexmatcher](behaves like tags)
*/
import React from 'react'

// eslint-disable-next-line import/no-cycle
import { DefaultScrapersFormType } from './settings'


interface Props {
  formData: DefaultScrapersFormType,
  setFormData: React.Dispatch<React.SetStateAction<DefaultScrapersFormType>>
}
export default function Scrapers({formData, setFormData}: Props) {
  return (
    <div>scrapers</div>
  )
}
