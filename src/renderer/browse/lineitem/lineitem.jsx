/* eslint-disable react/prop-types */
import React from 'react'
import styled from 'styled-components'

import Tools from './tools'
import Title from './title'
import Version from './version'
import Categories from './categories'
import Tags from './tags'
import Description from './description'

const LineitemDiv = styled.div`
  min-height: 135px;
  max-height: 135px;
  padding: 0;

  & fieldset {
    margin: 0 1px;
    padding-top: 0;
  }
`


export default function Lineitem({lineData}) {
  const {game_id, path, title, url, image, version, description, program_path, tags, categories, created_at, played_at, updated_at, ...cats} = lineData

  let splitCategories = categories === null ? ['Default'] : categories.split(',')
  const isComplete = splitCategories.includes('Complete')
  splitCategories = splitCategories.filter(s => s !== 'Complete')
  return (
    <LineitemDiv className='horizontalContainer'>
      <Tools
        path={path}
        programPath={program_path}
        url={url}
      />
      <Title
        title={title}
        img={image}
        categories={splitCategories}
      />
      <Version
        version={version}
        timestamps={{created_at, played_at, updated_at}}
        isComplete={isComplete}
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
    </LineitemDiv>
  )
}
