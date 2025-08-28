/* eslint-disable react/no-array-index-key */
import React from 'react'

// eslint-disable-next-line import/no-cycle
import { CategoryObj, DataValue, FormDataValue, Multiselect } from './autofillCompare'

interface Props {
  header: string,
  data: {
    current?: DataValue;
    updated?: DataValue;
  },
  formData: FormDataValue,
  handleChange: (evt: React.ChangeEvent<HTMLInputElement>, current: boolean, change_type: string) => void
}
// TODO: handle form
export default function ComparisonBlock({header, data, formData, handleChange}: Props) {
  const formatted_header = header
    .replaceAll('_', ' ')
    .replace(/(?:^| )(\w)/g, (_, m) => m.toUpperCase())

  const { current: cur, updated: upd } = data
  let cur_child: {type: string, name: string, checked: boolean, node: React.ReactNode}[] | null = null
  let upd_child: {type: string, name: string, checked: boolean, node: React.ReactNode}[] | null = null
  if (header === 'program_path') {
    if (cur) {
      cur_child = (cur as {id: number,paths: [string, string]}[]).map((progs, idx) => (
        {
          type: "checkbox",
          name: `${header}--comparison-block--progs`,
          checked: (formData as Multiselect).current![idx],
          node: <p>{progs.paths[1]}</p>
        }
      ))
    }
    if (upd) {
      upd_child = (upd as {id: number,paths: [string, string]}[]).map((progs, idx) => (
        {
          type: "checkbox",
          name: `${header}--comparison-block--progs`,
          checked: (formData as Multiselect).updated![idx],
          node: <p>{progs.paths[1]}</p>
        }
      ))
    }
  } else if (header === 'categories') {
    if (cur) {
      cur_child = Object.entries(cur as Record<string, string>).map(([cat, val]) => (
        {
          type: "radio",
          name: `${header}--comparison-block--cats-${cat}`,
          checked: (formData as CategoryObj)[cat] === 'current',
          node: <p>{`${cat}: ${val}`}</p>
        }
      ))
    }
    if (upd) {
      upd_child = Object.entries(upd as Record<string, string>).map(([cat, val]) => (
        {
          type: "radio",
          name: `${header}--comparison-block--cats-${cat}`,
          checked: (formData as CategoryObj)[cat] === 'updated',
          node: <p>{`${cat}: ${val}`}</p>
        }
      ))
    }
  } else if (['title', 'version', 'description'].includes(header)) {
    if (cur) {
      cur_child = [
        {
          type: "radio",
          name: `${header}--comparison-block--${header}`,
          checked: formData === 'current',
          node: <p>{cur as string}</p>
        }
      ]
    }
    if (upd) {
      upd_child = [
        {
          type: "radio",
          name: `${header}--comparison-block--${header}`,
          checked: formData === 'updated',
          node: <p>{upd as string}</p>
        }
      ]
    }
  } else {
    // status or tags
    if (cur) {
      cur_child = (cur as string[]).map((v, idx) => (
        {
          type: "checkbox",
          name: `${header}--comparison-block--${header}`,
          checked: (formData as Multiselect).current![idx],
          node: <p>{v}</p>
        }
      ))
    }
    if (upd) {
      upd_child = (upd as string[]).map((v, idx) => (
        {
          type: "checkbox",
          name: `${header}--comparison-block--${header}`,
          checked: (formData as Multiselect).updated![idx],
          node: <p>{v}</p>
        }
      ))
    }
  }

  return (
    <>
      <h3><u>{formatted_header}</u></h3>
      <div className='comparison'>
        <div className='vertical-container'>
          {cur_child?.map(({type, name, checked, node}, idx) => (
            <div key={`${header}--comparison-current-${idx}`} className='comparison-line left'>
              <input
                type={type}
                name={name}
                checked={checked}
                onChange={(evt) => handleChange(evt, true, header)}
              />
              {node}
            </div>
          ))}
        </div>
        <span className='vertical-separator' />
        <div className='vertical-container'>
          {upd_child?.map(({type, name, checked, node}, idx) => (
            <div key={`${header}--comparison-updated-${idx}`} className='comparison-line right'>
              {node}
              <input
                type={type}
                name={name}
                checked={checked}
                onChange={(evt) => handleChange(evt, false, header)}
              />
            </div>
          ))}
        </div>
      </div>
      <span className='separator' />
    </>
  )
}
