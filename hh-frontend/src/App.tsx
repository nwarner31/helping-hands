import './App.css';
import {createBrowserRouter, RouterProvider} from 'react-router-dom'

import HomePage from "./pages/HomePage/HomePage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage/DashboardPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import ViewClientsListPage, {loader as viewClientsLoader} from "./pages/ViewClientsListPage/ViewClientsListPage";
import AddEditClientPage from "./pages/AddEditClientPage/AddEditClientPage";

function App() {

    const router = createBrowserRouter([
        {path: "/", element: <HomePage />},
        {path: '/register', element: <RegisterPage />},
        {path: "/login", element: <LoginPage />},
        {path: '/dashboard', element: <ProtectedRoute redirect="/" ><DashboardPage /></ProtectedRoute>},
        {path: '/view-clients', element: <ProtectedRoute><ViewClientsListPage /></ProtectedRoute>, loader: viewClientsLoader},
        {path: "/add-client", element: <ProtectedRoute><AddEditClientPage /></ProtectedRoute>}
    ]);
  return (
    <div className='body'>
        <RouterProvider router={router} />
    </div>
  );
}

export default App
