import {render, screen} from "@testing-library/react";
import {BrowserRouter} from "react-router-dom";

import AdminDashboard from "./AdminDashboard";
const renderPage = () => render(<BrowserRouter><AdminDashboard /></BrowserRouter>);

describe("Admin Dashboard tests", () => {
    it("should render the manage clients button that links to view clients page", () => {
        renderPage();
        const manageClientsButton = screen.getByTestId("link-button-client");
        expect(manageClientsButton).toBeInTheDocument();
        expect(manageClientsButton).toHaveProperty("href", 'http://localhost/view-clients',)
    })
    it("should render the manage houses button that links to view houses page", () => {
        renderPage();
        const manageHousesButton = screen.getByTestId("link-button-house");
        expect(manageHousesButton).toBeInTheDocument();
        expect(manageHousesButton).toHaveProperty("href", 'http://localhost/view-houses',)
    })
})