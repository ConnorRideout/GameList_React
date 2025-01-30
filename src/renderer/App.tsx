import { MemoryRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/App.scss'

import Browse from './browse/browse'


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Browse />} />
        {/* <Route path="/edit" element={}/> */}
      </Routes>
    </Router>
  )
}
