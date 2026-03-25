import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { MemoryRouter } from "react-router-dom";
import apiService from "../../../utility/ApiService";

jest.mock("../../../utility/ApiService", () => ({
    post: jest.fn()
}));
const mockToastSuccess = jest.fn();
jest.mock("react-toastify", () => ({
    __esModule: true,
    toast: {
        success: mockToastSuccess
    },
}));
import AddManagerListItem from "./AddManagerListItem";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {Employee} from "../../../models/Employee";
jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => jest.fn(),
        useSearchParams: () => [new URLSearchParams("position=primary")]
    };
});

describe("AddManagerListItem tests", () => {
    const manager = { id: "EMP1", name: "Jane", position: "MANAGER", primaryHouses: [], secondaryHouses: [], email: "test@email.com", hireDate: "2024-01-01" };

    const renderPage = (employee: Employee = manager) => {
        const testQuery = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false
                }
            }
        });

        render(
            <QueryClientProvider client={testQuery}>
            <MemoryRouter>
                <AddManagerListItem
                    employee={employee}
                    houseId="H1"
                    isOdd={false}
                />
            </MemoryRouter>
            </QueryClientProvider>
        );
    }

      it("renders employee info correctly", () => {
        renderPage();

        expect(screen.getByText("ID: EMP1")).toBeInTheDocument();
        expect(screen.getByText("Jane")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "▶" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
    });

    it("toggles detail panel", () => {
        renderPage();

        const toggleBtn = screen.getByRole("button", { name: "▶" });
        fireEvent.click(toggleBtn);

        expect(screen.getByText("No managed houses.")).toBeInTheDocument();

        fireEvent.click(toggleBtn);
        expect(screen.queryByText("No managed houses.")).not.toBeInTheDocument();
    });

    it("displays managed houses", () => {
        const partialHouse = {street1: "100 W Test Ave", city: "Testopolis", state: "TE", maxClients: 2, femaleEmployeeOnly: false};
        renderPage({...manager, primaryHouses: [{ id: "H100", name: "Main House", ...partialHouse }], secondaryHouses: [{ id: "H200", name: "Side House", ...partialHouse }]
        });

        fireEvent.click(screen.getByRole("button", { name: "▶" }));

        expect(screen.getByText("H100 – Main House (Primary Manager)")).toBeInTheDocument();
        expect(screen.getByText("H200 – Side House (Secondary Manager)")).toBeInTheDocument();
    });

    it("makes API call and shows toast on add", async () => {
        const mockPost = apiService.post as jest.Mock;
        mockPost.mockResolvedValueOnce({
            message: "manager added to house",
            data: { houseId: "H1", name: "Test House" }
        });

        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Add" }));

        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledWith("house/H1/manager", {
                employeeId: "EMP1",
                positionType: "primary"
            });
            expect(mockToastSuccess).toHaveBeenCalledWith("Manager added to house successfully", {autoClose: 1500, position: "top-right"});
        });
    });

});