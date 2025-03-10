// TODO? transitions between screens
// TODO? resizeable
// TODO? light mode
// TODO: if settings are default, prompt user for what they should be updated to
import React, { useEffect, useState } from 'react'
import { MemoryRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import './styles/App.scss'

import Browse from './browse/browse'
import Edit from './edit/edit'
import Settings from './settings/settings'
import ContextMenuProvider from './ContextMenuProvider'

import {
  useGetGamesQuery,
  useGetCategoriesQuery,
  useGetStatusesQuery,
  useGetTagsQuery,
  useGetStyleVarsQuery,
} from '../lib/store/gamelibApi'
import {
  useCheckMissingGamesMutation,
  useLazyCheckNewGamesQuery,
  useOpenFolderMutation,
} from '../lib/store/filesystemApi'
import {
  useGetSettingsQuery,
} from '../lib/store/settingsApi'
import {
  clearEditGame
} from '../lib/store/gamelibrary'

function Wrapper({children}: {children: React.ReactNode}) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  useGetStyleVarsQuery()
  useGetCategoriesQuery()
  useGetStatusesQuery()
  useGetTagsQuery()
  const {data: settings} = useGetSettingsQuery()
  const {data: games} = useGetGamesQuery()
  const [blockCheckMissing, setBlockCheckMissing] = useState(false)

  const [checkForMissingGames] = useCheckMissingGamesMutation()
  const [checkForNewGames] = useLazyCheckNewGamesQuery()
  const [openFolder] = useOpenFolderMutation()

  // startup state
  useEffect(() => {
    if (!blockCheckMissing && games && settings) {
      setBlockCheckMissing(true)
      checkForMissingGames(games.map(({game_id, title, path}) => ({game_id, title, path})))
      window.electron.onMenuAction((action) => {
        switch (action.type) {
          case 'OPEN_GAMES_FOLDER': {
            openFolder(settings.games_folder)
            break
          }
          case 'OPEN_SETTINGS': {
            navigate('/settings')
            break
          }
          case 'CHECK_MISSING': {
            dispatch(clearEditGame())
            navigate('/')
            checkForMissingGames(games!.map(({game_id, title, path}) => ({game_id, title, path})))
            break
          }
          case 'CHECK_NEW': {
            dispatch(clearEditGame())
            navigate('/')
            checkForNewGames()
            break
          }
          case 'CHECK_UPDATED': {
            // TODO: check for updated urls for all games
            break
          }
          default:
        }
      })
    }
  }, [games, settings, blockCheckMissing, navigate, dispatch, checkForMissingGames, checkForNewGames, openFolder])

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {children}
    </>
  )
}


export default function App() {
  return (
    <Router>
      <Wrapper>
        <ContextMenuProvider>
          <Routes>
            <Route path="/" element={<Browse />} />
            <Route path="/edit" element={<Edit />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </ContextMenuProvider>
      </Wrapper>
    </Router>
  );
}
