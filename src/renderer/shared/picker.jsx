import React from 'react'

import sampleTags from '../../data/sample_tags.json'
import sampleCategories from '../../data/sample_categories.json'


export default function Picker() {
  return (
    <div>
      <fieldset>
        <legend>Categories</legend>
        {sampleCategories.map(({category_id, category_name}) => (
          <label htmlFor={`category${category_id}`}>
            <input type="checkbox" id={`category${category_id}`} name={`category${category_id}`} />
            {category_name}
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
