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

  fieldset {
    margin: 0 1px;
    padding-top: 0;
  }
`


export default function Lineitem({lineData, dataName}) {
  const {game_id, path, title, url, image, version, description, program_path, tags, status, created_at, played_at, updated_at, ...categories} = lineData

  const isComplete = status.includes('Complete')
  const splitStatus = status.filter(s => s !== 'Complete')
  return (
    <LineitemDiv data-name={dataName} className='horizontal-container'>
      <Tools
        game_id={game_id}
        path={path}
        programPath={program_path}
        url={url}
      />
      <Title
        game_id={game_id}
        title={title}
        img={image}
        status={splitStatus}
      />
      <Version
        game_id={game_id}
        version={version}
        timestamps={{created_at, played_at, updated_at}}
        isComplete={isComplete}
      />
      <Categories
        categories={categories}
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
