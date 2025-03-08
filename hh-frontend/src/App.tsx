import './App.css';
import {Routes, Route} from 'react-router-dom'

import HomePage from "./pages/HomePage/HomePage";

function App() {

  return (
    <div className='body'>
        <Routes>
            <Route path='/' element={<HomePage />} />
        </Routes>
    </div>
  )
}

export default App
