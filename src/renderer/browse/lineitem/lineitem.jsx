/* eslint-disable react/prop-types */
import React from 'react'

import Tools from './tools'
import Title from './title'
import Version from './version'
import Categories from './categories'
import Tags from './tags'
import Description from './description'


export default function Lineitem({lineData}) {
  const {game_id, path, title, url, image, version, description, program_path, tags, categories, created_at, played_at, updated_at, ...cats} = lineData

  return (
    <div>
      <Tools
        path={path}
        programPath={program_path}
        url={url}
      />
      <Title
        title={title}
        img={image}
        categories={categories}
      />
      <Version
        version={version}
        timestamps={{created_at, played_at, updated_at}}
      />
      <Categories
        categories={cats}
      />
      <Tags
        tags={tags}
      />
      <Description
        description={description}
      />
    </div>
  )
}
