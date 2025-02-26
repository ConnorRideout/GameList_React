// TODO? transitions between screens
// TODO? resizeable
// TODO? light mode
// TODO: create an ini file if it doesn't exist, prompting user for the defaults
import React, { useEffect, useState } from 'react'
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/App.scss'

import Browse from './browse/browse'
import Edit from './edit/edit'
import Settings from './settings/settings'

import {
  useGetGamesQuery,
  useGetCategoriesQuery,
  useGetStatusesQuery,
  useGetTagsQuery,
  useGetStyleVarsQuery,
} from '../lib/store/gamelibApi'
import {
  useGetConfigQuery,
  useCheckMissingGamesMutation,
} from '../lib/store/filesystemApi'

export default function App() {
  useGetStyleVarsQuery()
  useGetCategoriesQuery()
  useGetStatusesQuery()
  useGetTagsQuery()
  useGetConfigQuery()
  const {data: games} = useGetGamesQuery()
  const [blockCheckMissing, setBlockCheckMissing] = useState(false)

  const [checkForMissingGames] = useCheckMissingGamesMutation()

  useEffect(() => {
    if (!blockCheckMissing && games) {
      setBlockCheckMissing(true)
      checkForMissingGames(games.map(({game_id, title, path}) => ({game_id, title, path})))
    }
  }, [games, checkForMissingGames, blockCheckMissing])


  return (
    <Router>
      <div className='dimming-overlay' id='dialogOverlay' style={{display: 'none'}} />
      <Routes>
        <Route path="/" element={<Browse />} />
        <Route path="/edit" element={<Edit />}/>
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  )
}
