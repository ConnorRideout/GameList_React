import React from 'react'

// eslint-disable-next-line import/no-cycle
import { DataValue } from './autofillCompare'

interface Props {
  header: string,
  data: {
    current?: DataValue;
    updated?: DataValue;
  }
}
// TODO: handle form
export default function ComparisonBlock({header, data}: Props) {
    const formatted_header = header
      .replaceAll('_', ' ')
      .replace(/(?:^| )(\w)/g, (_, m) => m.toUpperCase())

    const { current: cur, updated: upd } = data
    let cur_child: React.ReactNode[] | null = null
    let upd_child: React.ReactNode[] | null = null
    if (header === 'program_path') {
      if (cur) {
        cur_child = (cur as {id: number,paths: [string, string]}[]).map(progs => (
          <p>{progs.paths[1]}</p>
        ))
      }
      if (upd) {
        upd_child = (upd as {id: number,paths: [string, string]}[]).map(progs => (
          <p>{progs.paths[1]}</p>
        ))
      }
    } else if (header === 'categories') {
      if (cur) {
        cur_child = Object.entries(cur as Record<string, string>).map(([cat, val]) => (
          <p>{`${cat}: ${val}`}</p>
        ))
      }
      if (upd) {
        upd_child = Object.entries(upd as Record<string, string>).map(([cat, val]) => (
          <p>{`${cat}: ${val}`}</p>
        ))
      }
    } else if (['title', 'version', 'description'].includes(header)) {
      if (cur) {
        cur_child = [
          <p>{cur as string}</p>
        ]
      }
      if (upd) {
        upd_child = [
          <p>{upd as string}</p>
        ]
      }
    } else {
      if (cur) {
        cur_child = (cur as string[]).map(v => (
          <p>{v}</p>
        ))
      }
      if (upd) {
        upd_child = (upd as string[]).map(v => (
          <p>{v}</p>
        ))
      }
    }

  return (
    <React.Fragment key={`${header}--comparison`}>
      <h3><u>{formatted_header}</u></h3>
      <div className='comparison'>
        <div className='vertical-container'>
          {cur_child?.map(c => (
            <div className='comparison-line left'>
              <input type="checkbox" />
              {c}
            </div>
          ))}
        </div>
        <span className='vertical-separator' />
        <div className='vertical-container'>
          {upd_child?.map(c => (
            <div className='comparison-line right'>
              {c}
              <input type="checkbox" />
            </div>
          ))}
        </div>
      </div>
      <span className='separator' />
    </React.Fragment>
  )
}
