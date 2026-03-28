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
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import ViewEmployeesListPage from "./pages/Employee/ViewEmployeesListPage/ViewEmployeesListPage";

function App() {
    const queryClient = new QueryClient();

    const router = createBrowserRouter([
        {path: "/", element: <HomePage />},
        {path: '/register', element: <RegisterPage />},
        {path: "/login", element: <LoginPage />},
        {path: '/dashboard', element: <ProtectedRoute><DashboardPage /></ProtectedRoute> },
        // Client routes
        {path: '/view-clients', element: <ProtectedRoute><ViewClientsListPage /></ProtectedRoute>},
        {path: '/view-client/:clientId', element: <ProtectedRoute><ViewClientPage /></ProtectedRoute>},
        {path: "/add-client", element: <ProtectedRoute><AddClientPage /></ProtectedRoute>},
        {path: "/edit-client/:clientId", element: <ProtectedRoute><EditClientPage /></ProtectedRoute>},
        // Event routes
        {path: "/client/:clientId/add-event", element: <ProtectedRoute><AddClientEventPage /></ProtectedRoute>},
        {path: "/client/:clientId/view-events", element: <ProtectedRoute><ViewClientEventsListPage /></ProtectedRoute>},
        {path: "/client/:clientId/view-event-conflicts", element: <ProtectedRoute><ViewClientEventConflictsPage /></ProtectedRoute>},
        {path: "/event/:eventId", element: <ProtectedRoute><ViewEventPage /></ProtectedRoute>},
        {path: "/edit-event/:eventId", element: <ProtectedRoute><EditClientEventPage /></ProtectedRoute>},
        // House routes
        {path: "/view-houses", element: <ProtectedRoute><ViewHousesListPage /></ProtectedRoute>},
        {path: "/edit-house/:houseId", element: <EditHousePage /> },
        {path: "/add-house", element: <AddHousePage />},
        {path: "/house/:houseId/add-client", element: <AddHouseClientPage />},
        {path: "/house/:houseId/add-manager", element: <AddHouseManagerPage />},
        // Employee routes
        {path: "/view-employees", element: <ProtectedRoute rolesAllowed={["ADMIN"]}><ViewEmployeesListPage /></ProtectedRoute>}
         ]);
  return (
      <QueryClientProvider client={queryClient}>
        <div className='body'>
            <RouterProvider router={router} />
            <ToastContainer />
        </div>
      </QueryClientProvider>
  );
}

export default App;