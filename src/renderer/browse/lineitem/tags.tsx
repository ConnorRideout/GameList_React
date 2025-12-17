import React from 'react'


export default function Tags({tags}: {tags: string[]}) {
  const sortedTags = [...tags].sort()

  return (
    <fieldset className='tags'>
      <legend>Tags</legend>
      <p>{sortedTags.join(', ')}</p>
    </fieldset>
  )
}
