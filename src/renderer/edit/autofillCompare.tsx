import React, { useState } from 'react'

import InputBox from '../shared/inputBox'
// import TristateCheckbox from '../shared/tristateCheckbox'
// eslint-disable-next-line import/no-cycle
import ComparisonBlock from './comparisonBlock'

// eslint-disable-next-line import/no-cycle
import { AutofillComparisonType } from './edit'
import { FormState as PickerFormType } from '../shared/picker/picker'


export type DataValue = string | string[] | Record<string, string> | { id: number; paths: [string, string] }[] | undefined
type DifferencesObject = Record<string, {
  current?: DataValue;
  updated?: DataValue;
}>
export type FormDataValue = boolean | boolean[] | Record<string, boolean>

interface Props {
  currentPickerData: PickerFormType,
  autofillComparisonData: AutofillComparisonType,
  setAutofillComparisonData: React.Dispatch<React.SetStateAction<AutofillComparisonType | false>>,
}
export default function AutofillCompare({currentPickerData, autofillComparisonData, setAutofillComparisonData}: Props) {
  // TODO: create form
  const parsed_picker_data = {
    tags: Object.entries(currentPickerData.tags).reduce((acc, [k,v]) => {
      if (v) acc.push(k)
      return acc
    }, [] as string[]),
    categories: currentPickerData.categories,
    status: Object.entries(currentPickerData.statuses).reduce((acc, [k,v]) => {
      if (v) acc.push(k)
      return acc
    }, [] as string[])
  }
  const current = {
    ...autofillComparisonData.current,
    ...parsed_picker_data
  }


  const {updated, submitHandler} = autofillComparisonData
  // TODO: only show the differences dialog when the form has data; otherwise just fill it

  // compare current and updated
  const normalizeForComparison = (value: DataValue) => {
    if (Array.isArray(value)) {
      return JSON.stringify([...value].sort())
    }
    if (value && typeof value === 'object') {
      const sortedKeys = Object.keys(value).sort()
      const sortedObj: Record<string, string> = {}
      sortedKeys.forEach(key => {
        sortedObj[key] = value[key]
      })
      return JSON.stringify(sortedObj)
    }
    return JSON.stringify(value)
  }

  const differences: DifferencesObject = {};

  // Get all unique keys from both objects
  const allKeys = new Set([...Object.keys(current), ...Object.keys(updated)])

  allKeys.forEach((key) => {
    const currentValue = current[key as keyof typeof current]
    const updatedValue = updated[key as keyof typeof updated]

    // Skip if values are identical (using normalized comparison)
    if (normalizeForComparison(currentValue) === normalizeForComparison(updatedValue)) {
      return
    }

    // Handle arrays - show only the differences
    if (Array.isArray(currentValue) && Array.isArray(updatedValue)) {
      const currentOnly = currentValue.filter(item => !updatedValue.some(updatedItem => JSON.stringify(item) === JSON.stringify(updatedItem)))
      const updatedOnly = updatedValue.filter(item => !currentValue.some(currentItem => JSON.stringify(item) === JSON.stringify(currentItem)))

      if (currentOnly.length > 0 || updatedOnly.length > 0) {
        differences[key] = {}
        if (currentOnly.length > 0) differences[key].current = currentOnly as DataValue
        if (updatedOnly.length > 0) differences[key].updated = updatedOnly as DataValue
      }
    }
    // Handle objects - show full objects but with identical key-value pairs removed
    else if (currentValue && updatedValue &&
             typeof currentValue === 'object' && typeof updatedValue === 'object' &&
             !Array.isArray(currentValue) && !Array.isArray(updatedValue)) {

      const allObjectKeys = new Set([...Object.keys(currentValue), ...Object.keys(updatedValue)])
      const currentFiltered: Record<string, string> = {}
      const updatedFiltered: Record<string, string> = {}
      let hasObjectDifferences = false

      allObjectKeys.forEach(objKey => {
        const currentObjValue = currentValue[objKey]
        const updatedObjValue = updatedValue[objKey]

        // Only include if they're different or one is missing
        if (currentObjValue !== updatedObjValue) {
          hasObjectDifferences = true
          if (currentObjValue !== undefined) currentFiltered[objKey] = currentObjValue
          if (updatedObjValue !== undefined) updatedFiltered[objKey] = updatedObjValue
        }
      })

      if (hasObjectDifferences) {
        differences[key] = {}
        if (Object.keys(currentFiltered).length > 0) differences[key].current = currentFiltered
        if (Object.keys(updatedFiltered).length > 0) differences[key].updated = updatedFiltered
      }
    }
    // Handle primitive values or when one side is missing
    else {
      differences[key] = {}
      if (currentValue !== undefined) {
        differences[key].current = currentValue
      }
      if (updatedValue !== undefined) {
        differences[key].updated = updatedValue
      }
    }
  })

  console.log(allKeys)
  console.log(differences)

  const defaultFormData = Object.entries(differences).reduce((acc, [header, val]) => {
    acc[header] = {}

    Object.entries(val).forEach(([k, v]) => {
      // k = current/updated, v = DataValue
      let parsed_v: FormDataValue
      if (header === 'program_path') {
        parsed_v = (v as {id: number,paths: [string, string]}[]).map(() => (
          k === 'current'
        ))
      } else if (header === 'categories') {
        parsed_v = Object.fromEntries(
          Object.keys(v as Record<string, string>).map(cat => [cat, k === 'current'])
        )
      } else if (['title', 'version', 'description'].includes(header)) {
        parsed_v = k === 'current'
      } else {
        parsed_v = (v as string[]).map(() => true)

      }
      acc[header][k as 'current' | 'updated'] = parsed_v
    })

    return acc
  }, {} as Record<string, {
    current?: FormDataValue,
    updated?: FormDataValue
  }>)

  console.log(defaultFormData)

  const [formData, setFormData] = useState(defaultFormData)

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {}


  return (
    <InputBox
      id='autofillComparisonContainer'
      title="Autofill"
      buttons={[
        { text: 'Cancel', clickHandler: () => {} },
        { text: 'Update', clickHandler: () => {} },
      ]}
    >
      <div className='horizontal-container'>
        <p>use</p>
        <h2>Existing</h2>
        <span className='vertical-separator'/>
        <h2>Updated</h2>
        <p>use</p>
      </div>
      <span className='separator' />
      <div className='vertical-container scrollable'>
        {Object.entries(differences).map(([header, data]) => (
          <ComparisonBlock
            key={`${header}--comparison`}
            header={header}
            data={data}
            formData={formData[header]}
            handleChange={handleChange}
          />
        ))}
      </div>
    </InputBox>
  )
}
