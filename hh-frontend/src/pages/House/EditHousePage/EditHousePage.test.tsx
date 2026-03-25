import {render, screen, waitFor} from "@testing-library/react";

import {userEvent} from "@testing-library/user-event";
import { MemoryRouter, Route, Routes} from "react-router-dom";
import apiService from "../../../utility/ApiService";
import {AuthProvider} from "../../../context/AuthContext";
import EditHousePage from "./EditHousePage";
import {convertToHouseForm} from "../../../models/House";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

jest.mock("../../../utility/ApiService", () => ({
    get: jest.fn(() => Promise.resolve()),
    post: jest.fn(() => Promise.resolve( { message: "Client added", client: { id: "123" }})),
    put: jest.fn(() => Promise.resolve({ message: "client updated successfully", client: { id: "123" }})),
}));



    const renderPage = () => {
        const testQuery = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false
                }
            }
        });

        render(
            <QueryClientProvider client={testQuery}>
            <AuthProvider>
                <MemoryRouter initialEntries={[{ pathname: `/test/123` }]}>
                    <Routes>
                        <Route path="/test/:houseId" element={<EditHousePage />} />
                        <Route path="view-houses" element={<div>View Houses Page</div>} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
            </QueryClientProvider>
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

    it('should render form with pre-filled data', async () => {
        (apiService.get as jest.Mock).mockResolvedValue({message: "house successfully retrieved", data: testHouse});
        renderPage();
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
        (apiService.get as jest.Mock).mockResolvedValue({message: "house successfully retrieved", data: testHouse});

        renderPage();

        await waitFor(async () => {
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

            expect(mockPut).toHaveBeenCalled();
            expect(screen.findByText("House successfully updated"));
            expect(screen.getByText("View Houses Page")).toBeInTheDocument();
        })
    });

    it('should disable the House ID field', async () => {
        (apiService.get as jest.Mock).mockResolvedValue({message: "house successfully retrieved", data: testHouse});

        renderPage();
        await waitFor(() => {
            expect(screen.getByLabelText('House ID')).toBeDisabled();
        });
    });
    it("should fetch existing house data when in edit mode", async () => {
        const mockFetch = (apiService.get as jest.Mock).mockResolvedValue({message: "house successfully retrieved", data: testHouse});
        renderPage();
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith("house/123");
            expect(screen.getByLabelText('House ID')).toHaveValue(testHouse.id);
        });
    });
    it("should show validation errors", async () => {
        (apiService.get as jest.Mock).mockResolvedValue({message: "house successfully retrieved", data: testHouse});
        renderPage();
        await waitFor(async () => {
           await userEvent.clear(screen.getByLabelText('House Name'));
           await userEvent.click(screen.getByRole("button", { name: "Update House" }));


           expect(screen.getByText("House name is required")).toBeInTheDocument();
        });
    });
    it("should show field errors returned from the api", async () => {
        (apiService.get as jest.Mock).mockResolvedValue({message: "house successfully retrieved", data: testHouse});
        (apiService.put as jest.Mock).mockRejectedValue({ errors: { name: "House Name API error" } });
        renderPage();
        await waitFor(async () => {
           await userEvent.click(screen.getByRole("button", { name: "Update House" }));

           expect(screen.getByText("House Name API error")).toBeInTheDocument();
        });
    })
});