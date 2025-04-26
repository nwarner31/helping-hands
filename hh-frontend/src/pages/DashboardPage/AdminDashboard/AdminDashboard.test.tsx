import {render, screen} from "@testing-library/react";
import {BrowserRouter} from "react-router-dom";

import AdminDashboard from "./AdminDashboard";
const renderPage = () => render(<BrowserRouter><AdminDashboard /></BrowserRouter>);

describe("Admin Dashboard tests", () => {
    it("should render the manage clients button that links to view clients page", () => {
        renderPage();
        const manageClientsButton = screen.getByRole("button", {name: /Manage Clients/});
        expect(manageClientsButton).toBeInTheDocument();
        expect(manageClientsButton.parentElement!).toHaveProperty("href", 'http://localhost/view-clients',)
    })
})