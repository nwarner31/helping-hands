import {render, screen} from "@testing-library/react";
import {BrowserRouter} from "react-router-dom";

import AdminDashboard from "./AdminDashboard";
jest.mock("../../../assets/client-logo.svg", () => ({
    ReactComponent: () => <div>Client Icon</div>
}));
const renderPage = () => render(<BrowserRouter><AdminDashboard /></BrowserRouter>);

describe("Admin Dashboard tests", () => {
    it("should render the manage clients button that links to view clients page", () => {
        renderPage();
        const manageClientsButton = screen.getByRole("button", {name: "Client Icon Manage Clients"});
        expect(manageClientsButton).toBeInTheDocument();
        expect(manageClientsButton.parentElement!).toHaveProperty("href", 'http://localhost/view-clients',)
    })
})