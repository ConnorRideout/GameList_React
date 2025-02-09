/* eslint-disable import/no-cycle */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, {ChangeEvent} from "react"
import styled from "styled-components"

import TristateCheckbox from "../tristateCheckbox"

import { FormState } from "./picker"
import { RootState } from '../../../types'


const CatFieldset = styled.fieldset`
  align-items: center;

  &>* {
    margin: 0 3px;
  }
  &>label {
    flex-grow: 1;
  }
`

interface Props {
  categories: RootState['data']['categories'],
  statuses: RootState['data']['statuses'],
  handleFormChange: (evt: ChangeEvent<HTMLInputElement | HTMLSelectElement>, tristate?: boolean) => void,
  isBrowse: boolean,
  formData: FormState,
}
export default function Categories({categories, statuses, handleFormChange, isBrowse, formData}: Props) {
  const protagonists = ['Male', 'Female', 'Futa/Trans', 'Multiple', 'Created', 'Unknown']
  return (
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
  )
}
