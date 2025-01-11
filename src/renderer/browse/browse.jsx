import React from 'react'
import sampleData from '../../data/sample_data.json'

import Lineitem from './lineitem/lineitem'


export default function Browse() {
  return (
    <div>
      <Lineitem lineData={sampleData[0]}/>
    </div>
  )
}
