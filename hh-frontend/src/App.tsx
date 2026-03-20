import './App.css';
import {createBrowserRouter, RouterProvider} from 'react-router-dom'

import HomePage from "./pages/HomePage/HomePage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage/DashboardPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import ViewClientsListPage from "./pages/Client/ViewClientsListPage/ViewClientsListPage";
import ViewHousesListPage from "./pages/House/ViewHousesListPage/ViewHousesListPage";
import AddHouseClientPage from "./pages/House/AddHouseClientPage/AddHouseClientPage";
import AddHouseManagerPage from "./pages/House/AddHouseManagerPage/AddHouseManagerPage";
import ViewClientPage from "./pages/Client/ViewClientPage/ViewClientPage";
import ViewClientEventsListPage from "./pages/Event/ViewClientEventsListPage/ViewClientEventsListPage";
import ViewEventPage from "./pages/Event/ViewEventPage/ViewEventPage";
import ViewClientEventConflictsPage from "./pages/Event/ViewClientEventConflictsPage/ViewClientEventConflictsPage";

import {ToastContainer} from "react-toastify";
import AddClientEventPage from "./pages/Event/AddClientEventPage/AddClientEventPage";
import EditClientEventPage from "./pages/Event/EditClientEventPage/EditClientEventPage";
import AddHousePage from "./pages/House/AddHousePage/AddHousePage";
import EditHousePage from "./pages/House/EditHousePage/EditHousePage";
import AddClientPage from "./pages/Client/AddClientPage/AddClientPage";
import EditClientPage from "./pages/Client/EditClientPage/EditClientPage";
function App() {

    const router = createBrowserRouter([
        {path: "/", element: <HomePage />},
        {path: '/register', element: <RegisterPage />},
        {path: "/login", element: <LoginPage />},
        {element: <ProtectedRoute />,
            children: [

                {path: '/dashboard', element: <DashboardPage />},
                // Client routes
                {path: '/view-clients', element: <ViewClientsListPage />},
                {path: '/view-client/:clientId', element: <ViewClientPage />},
                {path: "/add-client", element: <AddClientPage />},
                {path: "/edit-client/:clientId", element: <EditClientPage />},
                // Event routes
                {path: "/client/:clientId/add-event", element: <AddClientEventPage />},
                {path: "/client/:clientId/view-events", element: <ViewClientEventsListPage />},
                {path: "/client/:clientId/view-event-conflicts", element: <ViewClientEventConflictsPage />},
                {path: "/event/:eventId", element: <ViewEventPage />},
                {path: "/edit-event/:eventId", element: <EditClientEventPage />},
                // House routes
                {path: "/view-houses", element: <ViewHousesListPage />},
                {path: "/edit-house/:houseId", element: <EditHousePage /> },
                {path: "/add-house", element: <AddHousePage />},
                {path: "/house/:houseId/add-client", element: <AddHouseClientPage />},
                {path: "/house/:houseId/add-manager", element: <AddHouseManagerPage />},
            ]}
         ]);
  return (
    <div className='body'>
        <RouterProvider router={router} />
        <ToastContainer />
    </div>
  );
}

export default App;