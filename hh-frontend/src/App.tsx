import './App.css';
import {createBrowserRouter, RouterProvider} from 'react-router-dom'

import HomePage from "./pages/HomePage/HomePage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage/DashboardPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import ViewClientsListPage, {
    loader as viewClientsLoader
} from "./pages/ViewClientsListPage/ViewClientsListPage";
import ViewHousesListPage, {loader as viewHousesLoader} from "./pages/ViewHousesListPage/ViewHousesListPage";
import AddEditClientPage from "./pages/AddEditClientPage/AddEditClientPage";
import AddEditHousePage from "./pages/AddEditHousePage/AddEditHousePage";

function App() {

    const router = createBrowserRouter([
        {path: "/", element: <HomePage />},
        {path: '/register', element: <RegisterPage />},
        {path: "/login", element: <LoginPage />},
        {element: <ProtectedRoute />,
            children: [
                {path: '/dashboard', element: <DashboardPage />},
                {path: '/view-clients', element: <ViewClientsListPage />, loader: viewClientsLoader},
                {path: "/add-client", element: <AddEditClientPage isEdit={false} />},
                {path: "/edit-client/:clientId", element: <AddEditClientPage isEdit={true} />},
                {path: "/view-houses", element: <ViewHousesListPage />, loader: viewHousesLoader},
                {path: "/edit-house/:houseId", element: <AddEditHousePage isEdit={true} /> },
                {path: "/add-house", element: <AddEditHousePage isEdit={false} />}
            ]}
         ]);
  return (
    <div className='body'>
        <RouterProvider router={router} />
    </div>
  );
}

export default App
