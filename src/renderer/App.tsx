// TODO? transitions between screens
// TODO? resizeable
// TODO? light mode
// TODO: if settings are default, prompt user for what they should be updated to
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { MemoryRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import './styles/App.scss'

import Browse from './browse/browse'
import Edit from './edit/edit'
import Settings from './settings/settings'
import DislikeNotes from './shared/dislikeNotes'
import ContextMenuProvider from './ContextMenuProvider'

import {
  useGetGamesQuery,
  useGetCategoriesQuery,
  useGetStatusesQuery,
  useGetTagsQuery,
  useGetStyleVarsQuery,
  useGetDislikedGamesQuery,
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
import { RootState } from '../types'

function Wrapper({children}: {children: React.ReactNode}) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  useGetStyleVarsQuery()
  useGetCategoriesQuery()
  useGetStatusesQuery()
  useGetTagsQuery()
  useGetDislikedGamesQuery()
  const {data: startupSettings} = useGetSettingsQuery()
  const {data: startupGames} = useGetGamesQuery()
  const [blockCheckMissing, setBlockCheckMissing] = useState(false)

  const settings = useSelector((state: RootState) => state.data.settings)
  const games = useSelector((state: RootState) => state.data.gamelib)

  const [checkForMissingGames] = useCheckMissingGamesMutation()
  const [checkForNewGames] = useLazyCheckNewGamesQuery()
  const [openFolder] = useOpenFolderMutation()

  const [showNotes, setShowNotes] = useState(false)

  const doOpenGamesFol = useCallback(() => {
    openFolder(settings.games_folder)
  }, [openFolder, settings.games_folder])

  const gamesRef = useRef(startupGames)

  useEffect(() => {
    gamesRef.current = games
  }, [games])

  // startup state
  useEffect(() => {
    if (!blockCheckMissing && startupGames && startupSettings) {
      setBlockCheckMissing(true)
      checkForMissingGames(startupGames.map(({game_id, title, path}) => ({game_id, title, path})))
      window.electron.onMenuAction(async (action) => {
        switch (action.type) {
          case 'OPEN_GAMES_FOLDER': {
            doOpenGamesFol()
            break
          }
          case 'OPEN_SETTINGS': {
            navigate('/settings')
            break
          }
          case 'CHECK_MISSING': {
            dispatch(clearEditGame())
            navigate('/')
            const missGames = await checkForMissingGames(gamesRef.current!.map(({game_id, title, path}) => ({game_id, title, path}))).unwrap()
            // timeout so the redux state has a chance to update
            setTimeout(() => {
              if (!missGames.length) {
                window.electron.showMessageBox(
                  "Missing Games",
                  "No games are missing!",
                  "info"
                )
              }
            }, 100)
            break
          }
          case 'CHECK_NEW': {
            dispatch(clearEditGame())
            navigate('/')
            const newGames = await checkForNewGames().unwrap()
            // timeout so the redux state has a chance to update
            setTimeout(() => {
              if (!newGames.length) {
                window.electron.showMessageBox(
                  "New Games",
                  "No new games were found!",
                  "info"
                )
              }
            }, 100)
            break
          }
          case 'CHECK_UPDATED': {
            // TODO? check for updated urls for all games
            break
          }
          case 'OPEN_DISLIKE_NOTES': {
            setShowNotes(true)
            break
          }
          default:
        }
      })
    }
  }, [blockCheckMissing, checkForMissingGames, checkForNewGames, dispatch, doOpenGamesFol, navigate, startupGames, startupSettings])

  return (
    <>
      {showNotes && (
        <DislikeNotes
          close={() => setShowNotes(false)}
        />
      )}
      {children}
    </>
  )
}


export default function App() {
  return (
    <Router>
      <ContextMenuProvider>
        <Wrapper>
          <Routes>
            <Route path="/" element={<Browse />} />
            <Route path="/edit" element={<Edit />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Wrapper>
      </ContextMenuProvider>
    </Router>
  );
}
