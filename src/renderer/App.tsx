import { MemoryRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/App.scss'

import Browse from './browse/browse'
import {
  useGetGamesQuery,
  useGetCategoriesQuery,
  useGetStatusesQuery,
  useGetTagsQuery,
  useGetStyleVarsQuery,
} from '../data/store/gamelibApi'


export default function App() {
  useGetStyleVarsQuery()
  useGetCategoriesQuery()
  useGetStatusesQuery()
  useGetTagsQuery()
  useGetGamesQuery()

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Browse />} />
        {/* <Route path="/edit" element={}/> */}
      </Routes>
    </Router>
  )
}
