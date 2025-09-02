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
import AddHouseClientPage from "./pages/AddHouseClientPage/AddHouseClientPage";
import AddHouseManagerPage, { loader as addHouseManagerLoader } from "./pages/AddHouseManagerPage/AddHouseManagerPage";
import ViewClientPage from "./pages/ViewClientPage/ViewClientPage";
import ViewClientEventsListPage from "./pages/ViewClientEventsListPage/ViewClientEventsListPage";
import AddEditClientEventPage from "./pages/AddEditClientEventPage/AddEditClientEventPage";

function App() {

    const router = createBrowserRouter([
        {path: "/", element: <HomePage />},
        {path: '/register', element: <RegisterPage />},
        {path: "/login", element: <LoginPage />},
        {element: <ProtectedRoute />,
            children: [
                {path: '/dashboard', element: <DashboardPage />},
                {path: '/view-clients', element: <ViewClientsListPage />, loader: viewClientsLoader},
                {path: '/view-client/:clientId', element: <ViewClientPage />},
                {path: "/add-client", element: <AddEditClientPage isEdit={false} />},
                {path: "/edit-client/:clientId", element: <AddEditClientPage isEdit={true} />},
                {path: "/client/:clientId/add-event", element: <AddEditClientEventPage isEdit={false} />},
                {path: "/client/:clientId/view-events", element: <ViewClientEventsListPage />},
                {path: "/view-houses", element: <ViewHousesListPage />, loader: viewHousesLoader},
                {path: "/edit-house/:houseId", element: <AddEditHousePage isEdit={true} /> },
                {path: "/add-house", element: <AddEditHousePage isEdit={false} />},
                {path: "/house/:houseId/add-client", element: <AddHouseClientPage />},
                {path: "/house/:houseId/add-manager", element: <AddHouseManagerPage />, loader: addHouseManagerLoader},
            ]}
         ]);
  return (
    <div className='body'>
        <RouterProvider router={router} />
    </div>
  );
}

export default App
