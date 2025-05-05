// TODO? transitions between screens
// TODO? resizeable
// TODO? light mode
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
import Login from './Login'

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

  const settingsRef = useRef(startupSettings)

  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  // startup state
  useEffect(() => {
    if (!blockCheckMissing && startupGames && startupSettings) {
      setBlockCheckMissing(true)
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
            if (!settingsRef.current!.games_folder) {
              window.electron.showMessageBox(
                "Set Settings",
                "Please set the required settings first."
              )
            } else {
              dispatch(clearEditGame())
              navigate('/')
              const missGames = await checkForMissingGames(gamesRef.current!.map(({game_id, title, path}) => ({game_id, title, path}))).unwrap()
              // use timeout so the redux state has a chance to update
              setTimeout(() => {
                if (!missGames.length) {
                  window.electron.showMessageBox(
                    "Missing Games",
                    "No games are missing!",
                    "info"
                  )
                }
              }, 100)
            }
            break
          }
          case 'CHECK_NEW': {
            if (!settingsRef.current!.games_folder) {
              window.electron.showMessageBox(
                "Set Settings",
                "Please set the required settings first."
              )
            } else {
              dispatch(clearEditGame())
              navigate('/')
              const newGames = await checkForNewGames().unwrap()
              // use timeout so the redux state has a chance to update
              setTimeout(() => {
                if (!newGames.length) {
                  window.electron.showMessageBox(
                    "New Games",
                    "No new games were found!",
                    "info"
                  )
                }
              }, 100)
            }
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
      // if the settings haven't been set, go to them
      if (!startupSettings.games_folder) {
        window.electron.showMessageBox(
          "Welcome!",
          "Welcome to the GameLibrary! Please set your default settings."
        )
        navigate('/settings')
      } else {
        checkForMissingGames(startupGames.map(({game_id, title, path}) => ({game_id, title, path})))
      }
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
        <Login>
          <Wrapper>
            <Routes>
              <Route path="/" element={<Browse />} />
              <Route path="/edit" element={<Edit />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Wrapper>
        </Login>
      </ContextMenuProvider>
    </Router>
  );
}
