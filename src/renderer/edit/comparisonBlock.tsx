/* eslint-disable react/no-array-index-key */
import React from 'react'

// eslint-disable-next-line import/no-cycle
import { DataValue, FormDataValue } from './autofillCompare'

interface Props {
  header: string,
  data: {
    current?: DataValue;
    updated?: DataValue;
  },
  formData: {
    current?: FormDataValue,
    updated?: FormDataValue
  },
  handleChange: (evt: React.ChangeEvent<HTMLInputElement>) => void
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
          checked: (formData.current as boolean[])[idx],
          node: <p>{progs.paths[1]}</p>
        }
      ))
    }
    if (upd) {
      upd_child = (upd as {id: number,paths: [string, string]}[]).map((progs, idx) => (
        {
          type: "checkbox",
          name: `${header}--comparison-block--progs`,
          checked: (formData.updated as boolean[])[idx],
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
          checked: (formData.current as Record<string, boolean>)[cat],
          node: <p>{`${cat}: ${val}`}</p>
        }
      ))
    }
    if (upd) {
      upd_child = Object.entries(upd as Record<string, string>).map(([cat, val]) => (
        {
          type: "radio",
          name: `${header}--comparison-block--cats-${cat}`,
          checked: (formData.updated as Record<string, boolean>)[cat],
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
          checked: (formData.current as boolean),
          node: <p>{cur as string}</p>
        }
      ]
    }
    if (upd) {
      upd_child = [
        {
          type: "radio",
          name: `${header}--comparison-block--${header}`,
          checked: (formData.updated as boolean),
          node: <p>{upd as string}</p>
        }
      ]
    }
  } else {
    if (cur) {
      cur_child = (cur as string[]).map((v, idx) => (
        {
          type: "checkbox",
          name: `${header}--comparison-block--${header}`,
          checked: (formData.current as boolean[])[idx],
          node: <p>{v}</p>
        }
      ))
    }
    if (upd) {
      upd_child = (upd as string[]).map((v, idx) => (
        {
          type: "checkbox",
          name: `${header}--comparison-block--${header}`,
          checked: (formData.updated as boolean[])[idx],
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
              {/* TODO: radio name needs to match for like entries */}
              <input
                type={type}
                name={name}
                checked={checked}
                onChange={handleChange}
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
                onChange={handleChange}
              />
            </div>
          ))}
        </div>
      </div>
      <span className='separator' />
    </>
  )
}
