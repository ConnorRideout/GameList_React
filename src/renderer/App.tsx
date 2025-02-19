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
import { useGetConfigQuery } from '../lib/store/filesysteamApi'

export default function App() {
  useGetStyleVarsQuery()
  useGetCategoriesQuery()
  useGetStatusesQuery()
  useGetTagsQuery()
  useGetConfigQuery()
  // FIXME: dev dependency refetch
  const {refetch} = useGetGamesQuery()
  // TODO: transitions between screens?
  // TODO: resizeable?
  // TODO: light mode?
  // TODO: create an ini file if it doesn't exist, prompting user for the defaults

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Browse refetch={refetch} />} />
        <Route path="/edit" element={<Edit />}/>
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  )
}
