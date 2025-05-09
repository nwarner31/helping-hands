import {render, screen} from "@testing-library/react";
import AddEditHousePage from "./AddEditHousePage";
import {userEvent} from "@testing-library/user-event";
import {BrowserRouter, MemoryRouter, Route, Routes} from "react-router-dom";
import apiService from "../../utility/ApiService";

jest.mock("../../utility/ApiService", () => ({
    post: jest.fn(() => Promise.resolve( { message: "Client added", client: { clientId: "123" }})),
    put: jest.fn(() => Promise.resolve({ message: "client updated successfully", client: { clientId: "123" }})),
}));


describe('AddEditHousePage', () => {
    const renderPage = (isEdit: boolean) => render(<BrowserRouter><AddEditHousePage isEdit={isEdit} /></BrowserRouter>);

    describe("Add House", () => {
        it('should display "Add House" header and empty form when in add mode', () => {
            renderPage(false);

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
           renderPage(false);
           const text = "H12345";
           const input = screen.getByLabelText("House ID");
           await userEvent.type(input, text);
           expect(input).toHaveValue(text);
        });
        // Form validation fails when required fields are empty
        it('should display error messages when form is submitted with empty required fields', async () => {
            renderPage(false);

            // Clear the default value for maxClients
            const maxClientsInput = screen.getByLabelText('Maximum Clients in House');
            await userEvent.clear(maxClientsInput);

            // Submit the form with empty fields
            const submitButton = screen.getByRole("button", { name: 'Add House' });
            await userEvent.click(submitButton);

            // Check that error messages are displayed
            expect(await screen.findByText('House ID is required')).toBeInTheDocument();
            expect(await screen.findByText('House Name is required')).toBeInTheDocument();
            expect(await screen.findByText('Street 1 is required')).toBeInTheDocument();
            expect(await screen.findByText('A City is required')).toBeInTheDocument();
            expect(await screen.findByText('A State is required')).toBeInTheDocument();
            expect(await screen.findByText('Max Clients is required')).toBeInTheDocument();

            // Verify that the form submission didn't proceed (apiService not called)
            expect(apiService.post).not.toHaveBeenCalled();
        });
    });

    it("should not clear input if validation fails", async () => {
       renderPage(false);
       const text = "H12345";
       const input = screen.getByLabelText("House ID");
       await userEvent.type(input, text);
       await userEvent.click(screen.getByRole("button", {name: "Add House"}));

       expect(input).toHaveValue(text);
       expect(screen.queryByText('House ID is required')).not.toBeInTheDocument();
    });

    it("should have an error if the max clients field is less than 1", async () => {
       renderPage(false);

       const maxClients = screen.getByLabelText('Maximum Clients in House');
       await userEvent.clear(maxClients);
       await userEvent.type(maxClients, "-11");
       await userEvent.click(screen.getByRole("button", {name: "Add House"}));
       expect(screen.getByText("Max Clients must be 1 or greater")).toBeInTheDocument();
    });

    it("should submit the form if correct data is entered", async () => {
       renderPage(false);

       await userEvent.type(screen.getByLabelText("House ID"), "H12345");
       await userEvent.type(screen.getByLabelText("House Name"), "Testable");
       await userEvent.type(screen.getByLabelText("Street 1"), "100 Testing Rd");
       await userEvent.type(screen.getByLabelText("City"), "Reactville");
       await userEvent.type(screen.getByLabelText("State"), "TX");

       await userEvent.click(screen.getByRole("button", {name: "Add House"}));
       expect(screen.findByText("House successfully added"));
    });
    describe("Edit House", () => {
        const testHouse = {
            houseId: "H12345",
            name: "Test House",
            street1: "123 Edit Rd",
            street2: "Suite 100",
            city: "Editville",
            state: "CA",
            maxClients: 5,
            femaleEmployeeOnly: true
        };

        const renderEdit = () => render(
            <MemoryRouter initialEntries={[{ pathname: '/test', state: { house: testHouse } }]}>
                <Routes>
                    <Route path="/test" element={<AddEditHousePage isEdit={true} />} />
                </Routes>
            </MemoryRouter>
        );

        beforeEach(() => {
            // Simulate `location.state.house`
            window.history.pushState({ house: testHouse }, '', `/edit-house/${testHouse.houseId}`);
        });

        it('should render form with pre-filled data in edit mode', () => {
            renderEdit();

            expect(screen.getByLabelText('House ID')).toHaveValue(testHouse.houseId);
            expect(screen.getByLabelText('House Name')).toHaveValue(testHouse.name);
            expect(screen.getByLabelText('Street 1')).toHaveValue(testHouse.street1);
            expect(screen.getByLabelText('Street 2')).toHaveValue(testHouse.street2);
            expect(screen.getByLabelText('City')).toHaveValue(testHouse.city);
            expect(screen.getByLabelText('State')).toHaveValue(testHouse.state);
            expect(screen.getByLabelText('Maximum Clients in House')).toHaveValue(testHouse.maxClients);
            expect(screen.getByLabelText('Female Only House')).toBeChecked();
        });

        it('should submit updated data when form is valid in edit mode', async () => {
            renderEdit();

            await userEvent.clear(screen.getByLabelText('House Name'));
            await userEvent.type(screen.getByLabelText('House Name'), "Updated House");

            await userEvent.click(screen.getByRole("button", { name: "Update House" }));

            expect(apiService.put).toHaveBeenCalledWith(
                `house/${testHouse.houseId}`,
                expect.objectContaining({
                    ...testHouse,
                    name: "Updated House"
                })
            );
        });

        it('should disable the House ID field in edit mode', () => {
            renderEdit();
            expect(screen.getByLabelText('House ID')).toBeDisabled();
        });
    });

});
