import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// import icon from '../../assets/icon.svg';
import './styles/App.scss';

import Browse from './browse/browse';


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Browse />} />
      </Routes>
    </Router>
  );
}
