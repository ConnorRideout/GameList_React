/* eslint-disable react/prop-types */
import React from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'

import Tools from './tools'
import Title from './title'
import Version from './version'
import Categories from './categories'
import Tags from './tags'
import Description from './description'
import { RootState } from '../../../data/store/store'

const LineitemDiv = styled.div`
  min-height: 135px;
  max-height: 135px;
  padding: 0;

  fieldset {
    margin: 0 1px;
    padding-top: 0;
  }
`


export default function Lineitem({lineData}) {
  const {game_id, path, title, url, image, version, description, program_path, tags, status, categories, timestamps} = lineData

  const statuses = useSelector((state: RootState) => state.data.statuses)

  const getStatusColor = (arr: string[]) => {
    if (arr.length) {
      // get a list of categories sorted by priority
      const statusHierarchy = statuses.map(({status_name}) => status_name)
      // sort the statuses of this lineitem
      const sorted = [...arr].sort((a, b) => (
        statusHierarchy.indexOf(a) - statusHierarchy.indexOf(b)
      ))
      return statuses.find(s => s.status_name === sorted[0])?.status_color || 'currentColor'
    } else {
      return 'currentColor'
    }
  }

  const status_color = getStatusColor(status)

  return (
    <LineitemDiv className='horizontal-container'>
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
        status_color={status_color}
      />
      <Version
        game_id={game_id}
        version={version}
        timestamps={timestamps}
        status_color={status_color}
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
