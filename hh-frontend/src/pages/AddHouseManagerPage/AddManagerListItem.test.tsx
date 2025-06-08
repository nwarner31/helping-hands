import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddManagerListItem from "./AddManagerListItem";
import { MemoryRouter } from "react-router-dom";
import apiService from "../../utility/ApiService";

jest.mock("../../utility/ApiService", () => ({
    post: jest.fn()
}));

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
    it("renders employee info correctly", () => {
        render(
            <MemoryRouter>
                <AddManagerListItem
                    employee={manager}
                    houseId="H1"
                    isOdd={true}
                />
            </MemoryRouter>
        );

        expect(screen.getByText("ID: EMP1")).toBeInTheDocument();
        expect(screen.getByText("Jane")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "▶" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
    });

    it("toggles detail panel", () => {
        render(
            <MemoryRouter>
                <AddManagerListItem
                    employee={manager}
                    houseId="H1"
                    isOdd={false}
                />
            </MemoryRouter>
        );

        const toggleBtn = screen.getByRole("button", { name: "▶" });
        fireEvent.click(toggleBtn);

        expect(screen.getByText("No managed houses.")).toBeInTheDocument();

        fireEvent.click(toggleBtn);
        expect(screen.queryByText("No managed houses.")).not.toBeInTheDocument();
    });

    it("displays managed houses", () => {
        const partialHouse = {street1: "100 W Test Ave", city: "Testopolis", state: "TE", maxClients: 2, femaleEmployeeOnly: false};
        render(
            <MemoryRouter>
                <AddManagerListItem
                    employee={{
                        ...manager,
                        primaryHouses: [{ id: "H100", name: "Main House", ...partialHouse }],
                        secondaryHouses: [{ id: "H200", name: "Side House", ...partialHouse }]
                    }}
                    houseId="H2"
                    isOdd={true}
                />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole("button", { name: "▶" }));

        expect(screen.getByText("H100 – Main House (Primary Manager)")).toBeInTheDocument();
        expect(screen.getByText("H200 – Side House (Secondary Manager)")).toBeInTheDocument();
    });

    it("makes API call and shows toast on add", async () => {
        const mockPost = apiService.post as jest.Mock;
        mockPost.mockResolvedValueOnce({
            message: "manager added to house",
            house: { houseId: "H1", name: "Test House" }
        });

        render(
            <MemoryRouter>
                <AddManagerListItem
                    employee={manager}
                    houseId="H1"
                    isOdd={false}
                />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole("button", { name: "Add" }));

        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledWith("house/H1/manager", {
                employeeId: "EMP1",
                positionType: "primary"
            });

            expect(screen.getByText("Manager added to house successfully")).toBeInTheDocument();
        });
    });

});