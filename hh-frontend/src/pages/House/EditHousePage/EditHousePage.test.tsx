import {render, screen, waitFor} from "@testing-library/react";

import {userEvent} from "@testing-library/user-event";
import { MemoryRouter, Route, Routes} from "react-router-dom";
import apiService from "../../../utility/ApiService";
import {AuthProvider} from "../../../context/AuthContext";
import EditHousePage from "./EditHousePage";
import {convertToHouseForm} from "../../../models/House";

jest.mock("../../../utility/ApiService", () => ({
    get: jest.fn(() => Promise.resolve()),
    post: jest.fn(() => Promise.resolve( { message: "Client added", client: { id: "123" }})),
    put: jest.fn(() => Promise.resolve({ message: "client updated successfully", client: { id: "123" }})),
}));



    const renderPage = (state?: any) => {
        render(
            <AuthProvider>
                <MemoryRouter initialEntries={[{ pathname: `/test/123`, state: { house: state} }]}>
                    <Routes>
                        <Route path="/test/:houseId" element={<EditHousePage />} />
                        <Route path="view-houses" element={<div>View Houses Page</div>} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>

        );


    }

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

    // const renderEdit = (state = testHouse) => render(
    //     <MemoryRouter initialEntries={[{ pathname: `/test/${testHouse.id}`, state: { house: state} }]}>
    //         <Routes>
    //             <Route path="/test/:houseId" element={<AddEditHousePage isEdit={true} />} />
    //             <Route path="view-houses" element={<div>View Houses Page</div>} />
    //         </Routes>
    //     </MemoryRouter>
    // );

    beforeEach(() => {
        // Simulate `location.state.house`
        window.history.pushState({ house: testHouse }, '', `/edit-house/${testHouse.id}`);
    });

    it('should render form with pre-filled data', async () => {
        renderPage(testHouse);
        await waitFor(() => {
            expect(screen.getByLabelText('House ID')).toHaveValue(testHouse.id);
            expect(screen.getByLabelText('House Name')).toHaveValue(testHouse.name);
            expect(screen.getByLabelText('Street 1')).toHaveValue(testHouse.street1);
            expect(screen.getByLabelText('Street 2')).toHaveValue(testHouse.street2);
            expect(screen.getByLabelText('City')).toHaveValue(testHouse.city);
            expect(screen.getByLabelText('State')).toHaveValue(testHouse.state);
            expect(screen.getByLabelText('Maximum Clients in House')).toHaveValue(testHouse.maxClients);
            expect(screen.getByLabelText('Female Only House')).toBeChecked();
        });

    });

    it('should submit updated data when form is valid', async () => {
        const mockPut = (apiService.put as jest.Mock).mockResolvedValue({message: "House successfully updated", house: {id: "H12345"}});

        renderPage(testHouse);

        await userEvent.clear(screen.getByLabelText('House Name'));
        await userEvent.type(screen.getByLabelText('House Name'), "Updated House");

        await userEvent.click(screen.getByRole("button", { name: "Update House" }));

        expect(apiService.put).toHaveBeenCalledWith(
            `house/123`,
            expect.objectContaining({
                ...convertToHouseForm(testHouse),
                name: "Updated House"
            })
        );

        await waitFor(() => {
            expect(mockPut).toHaveBeenCalled();
            expect(screen.findByText("House successfully updated"));
            expect(screen.getByText("View Houses Page")).toBeInTheDocument();
        })
    });

    it('should disable the House ID field in edit mode', () => {
        renderPage(testHouse);
        expect(screen.getByLabelText('House ID')).toBeDisabled();
    });
    it("should fetch existing house data when in edit mode", async () => {
        const mockFetch = (apiService.get as jest.Mock).mockResolvedValue({message: "house successfully retrieved", data: testHouse});
        renderPage();
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith("house/123");
            expect(screen.getByLabelText('House ID')).toHaveValue(testHouse.id);
        });

    })
});