import {render, screen, waitFor} from "@testing-library/react";
import AddEditHousePage from "./AddEditHousePage";
import {userEvent} from "@testing-library/user-event";
import { MemoryRouter, Route, Routes} from "react-router-dom";
import apiService from "../../utility/ApiService";

jest.mock("../../utility/ApiService", () => ({
    get: jest.fn(() => Promise.resolve()),
    post: jest.fn(() => Promise.resolve( { message: "Client added", client: { id: "123" }})),
    put: jest.fn(() => Promise.resolve({ message: "client updated successfully", client: { id: "123" }})),
}));


describe('AddEditHousePage', () => {
    const renderPage = () => {
        render(
            <MemoryRouter initialEntries={[{ pathname: `/test` }]}>
                <Routes>
                    <Route path="/test" element={<AddEditHousePage isEdit={false} />} />
                    <Route path="view-houses" element={<div>View Houses Page</div>} />
                </Routes>
            </MemoryRouter>
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
            expect(await screen.findByText('House Name is required')).toBeInTheDocument();
            expect(await screen.findByText('Street 1 is required')).toBeInTheDocument();
            expect(await screen.findByText('A City is required')).toBeInTheDocument();
            expect(await screen.findByText('A State is required')).toBeInTheDocument();
            expect(await screen.findByText('Max Clients is required')).toBeInTheDocument();

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
       expect(screen.getByText("Max Clients must be 1 or greater")).toBeInTheDocument();
    });


    describe("Edit House", () => {
        const testHouse = {
            id: "H12345",
            name: "Test House",
            street1: "123 Edit Rd",
            street2: "Suite 100",
            city: "Editville",
            state: "CA",
            maxClients: 5,
            femaleEmployeeOnly: true
        };

        const renderEdit = (state = testHouse) => render(
            <MemoryRouter initialEntries={[{ pathname: `/test/${testHouse.id}`, state: { house: state} }]}>
                <Routes>
                    <Route path="/test/:houseId" element={<AddEditHousePage isEdit={true} />} />
                    <Route path="view-houses" element={<div>View Houses Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        beforeEach(() => {
            // Simulate `location.state.house`
            window.history.pushState({ house: testHouse }, '', `/edit-house/${testHouse.id}`);
        });

        it('should render form with pre-filled data in edit mode', () => {
            renderEdit();

            expect(screen.getByLabelText('House ID')).toHaveValue(testHouse.id);
            expect(screen.getByLabelText('House Name')).toHaveValue(testHouse.name);
            expect(screen.getByLabelText('Street 1')).toHaveValue(testHouse.street1);
            expect(screen.getByLabelText('Street 2')).toHaveValue(testHouse.street2);
            expect(screen.getByLabelText('City')).toHaveValue(testHouse.city);
            expect(screen.getByLabelText('State')).toHaveValue(testHouse.state);
            expect(screen.getByLabelText('Maximum Clients in House')).toHaveValue(testHouse.maxClients);
            expect(screen.getByLabelText('Female Only House')).toBeChecked();
        });

        it('should submit updated data when form is valid in edit mode', async () => {
            const mockPost = (apiService.put as jest.Mock).mockResolvedValue({message: "House successfully updated", house: {id: "H12345"}});

            renderEdit();

            await userEvent.clear(screen.getByLabelText('House Name'));
            await userEvent.type(screen.getByLabelText('House Name'), "Updated House");

            await userEvent.click(screen.getByRole("button", { name: "Update House" }));

            expect(apiService.put).toHaveBeenCalledWith(
                `house/${testHouse.id}`,
                expect.objectContaining({
                    ...testHouse,
                    name: "Updated House"
                })
            );

            await waitFor(() => {
                expect(mockPost).toHaveBeenCalled();
                expect(screen.findByText("House successfully updated"));
                expect(screen.getByText("View Houses Page")).toBeInTheDocument();
            })
        });

        it('should disable the House ID field in edit mode', () => {
            renderEdit();
            expect(screen.getByLabelText('House ID')).toBeDisabled();
        });
        it("should fetch existing house data when in edit mode", async () => {
            const mockFetch = (apiService.get as jest.Mock).mockResolvedValue({message: "house successfully retrieved", house: testHouse});
            renderEdit(null as any);
            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith("house/H12345");
                expect(screen.getByLabelText('House ID')).toHaveValue(testHouse.id);
            });

        })
    });



});
