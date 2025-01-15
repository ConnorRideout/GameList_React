import React from 'react'
import sampleData from '../../data/sample_data.json'

import Lineitem from './lineitem/lineitem'


export default function Browse() {
  return (
    <div>
      {sampleData.map(data => (
        <Lineitem lineData={data} />
      ))}
    </div>
  )
}
