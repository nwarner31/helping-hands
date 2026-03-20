import {render, screen, waitFor} from "@testing-library/react";

import {userEvent} from "@testing-library/user-event";
import { MemoryRouter, Route, Routes} from "react-router-dom";
import apiService from "../../../utility/ApiService";
import AddHousePage from "./AddHousePage";
import {AuthProvider} from "../../../context/AuthContext";

jest.mock("../../../utility/ApiService", () => ({
    get: jest.fn(() => Promise.resolve()),
    post: jest.fn(() => Promise.resolve( { message: "Client added", client: { id: "123" }})),
    put: jest.fn(() => Promise.resolve({ message: "client updated successfully", client: { id: "123" }})),
}));



    const renderPage = () => {
        render(
            <AuthProvider>
                <MemoryRouter initialEntries={[{ pathname: `/test` }]}>
                    <Routes>
                        <Route path="/test" element={<AddHousePage />} />
                        <Route path="view-houses" element={<div>View Houses Page</div>} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        );
    }




describe("Add House", () => {


    it('should display "Add House" header and empty form when in add mode', () => {
        renderPage();

        // Check header text
        expect(screen.getByRole("heading", {name: "Add House"})).toBeInTheDocument();

        // Check form fields are empty
        expect(screen.getByLabelText('House ID')).toHaveValue('');
        expect(screen.getByLabelText('House Name')).toHaveValue('');
        expect(screen.getByLabelText('Street 1')).toHaveValue('');
        expect(screen.getByLabelText('Street 2')).toHaveValue('');
        expect(screen.getByLabelText('City')).toHaveValue('');
        expect(screen.getByLabelText('State')).toHaveValue('');
        expect(screen.getByLabelText('Maximum Clients in House')).toHaveValue(1);

        // Check button text
        expect(screen.getByRole("button", {name: "Add House"})).toBeInTheDocument();
    });

    it('should update the house ID on input', async () => {
        renderPage();
        const text = "H12345";
        const input = screen.getByLabelText("House ID");
        await userEvent.type(input, text);
        expect(input).toHaveValue(text);
    });
    // Form validation fails when required fields are empty
    it('should display error messages when form is submitted with empty required fields', async () => {
        renderPage();

        // Clear the default value for maxClients
        const maxClientsInput = screen.getByLabelText('Maximum Clients in House');
        await userEvent.clear(maxClientsInput);

        // Submit the form with empty fields
        const submitButton = screen.getByRole("button", { name: 'Add House' });
        await userEvent.click(submitButton);

        // Check that error messages are displayed
        expect(await screen.findByText('House ID is required')).toBeInTheDocument();
        expect(await screen.findByText('House name is required')).toBeInTheDocument();
        expect(await screen.findByText('Street 1 is required')).toBeInTheDocument();
        expect(await screen.findByText('City is required')).toBeInTheDocument();
        expect(await screen.findByText('State is required')).toBeInTheDocument();
        expect(await screen.findByText('Max clients is required')).toBeInTheDocument();

        // Verify that the form submission didn't proceed (apiService not called)
        expect(apiService.post).not.toHaveBeenCalled();
    });
    it("should submit the form if correct data is entered", async () => {
        const mockPost = (apiService.post as jest.Mock).mockResolvedValue({message: "House successfully added", house: {id: "H12345"}});
        renderPage();

        await userEvent.type(screen.getByLabelText("House ID"), "H12345");
        await userEvent.type(screen.getByLabelText("House Name"), "Testable");
        await userEvent.type(screen.getByLabelText("Street 1"), "100 Testing Rd");
        await userEvent.type(screen.getByLabelText("City"), "Reactville");
        await userEvent.type(screen.getByLabelText("State"), "TX");

        await userEvent.click(screen.getByRole("button", {name: "Add House"}));

        await waitFor(() => {
            expect(mockPost).toHaveBeenCalled();
            expect(screen.findByText("House successfully added"));
            expect(screen.getByText("View Houses Page")).toBeInTheDocument();
        })

    });
    it("should not clear input if validation fails", async () => {
        renderPage();
        const text = "H12345";
        const input = screen.getByLabelText("House ID");
        await userEvent.type(input, text);
        await userEvent.click(screen.getByRole("button", {name: "Add House"}));

        expect(input).toHaveValue(text);
        expect(screen.queryByText('House ID is required')).not.toBeInTheDocument();
    });

    it("should have an error if the max clients field is less than 1", async () => {
        renderPage();

        const maxClients = screen.getByLabelText('Maximum Clients in House');
        await userEvent.clear(maxClients);
        await userEvent.type(maxClients, "-11");
        await userEvent.click(screen.getByRole("button", {name: "Add House"}));
        expect(screen.getByText("Max clients must be at least 1")).toBeInTheDocument();
    });
});


