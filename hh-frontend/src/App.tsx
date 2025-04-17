import './App.css';
import {Routes, Route} from 'react-router-dom'

import HomePage from "./pages/HomePage/HomePage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage/DashboardPage";
import LoginPage from "./pages/LoginPage/LoginPage";

function App() {

  return (
    <div className='body'>
        <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/register' element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path='/dashboard' element={<ProtectedRoute redirect="/" ><DashboardPage /></ProtectedRoute>} />
        </Routes>
    </div>
  )
}

export default App
