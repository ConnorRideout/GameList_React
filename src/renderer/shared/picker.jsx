import React from 'react'

import sampleTags from '../../data/sample_tags.json'
import sampleStatus from '../../data/sample_status.json'


export default function Picker() {
  return (
    <div>
      <fieldset>
        <legend>status</legend>
        {sampleStatus.map(({status_id, status_name}) => (
          <label htmlFor={`status${status_id}`}>
            <input type="checkbox" id={`status${status_id}`} name={`status${status_id}`} />
            {status_name}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Tags</legend>
        {sampleTags.map(({tag_id, tag_name}) => (
          <label htmlFor={`tag${tag_id}`}>
            <input type="checkbox" id={`tag${tag_id}`} name={`tag${tag_id}`} />
            {tag_name}
          </label>
        ))}
      </fieldset>
    </div>
  )
}
