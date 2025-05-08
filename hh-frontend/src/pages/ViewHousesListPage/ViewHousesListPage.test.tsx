import { render, screen } from "@testing-library/react";
import ViewHousesListPage from "./ViewHousesListPage";
import { useAuth } from "../../context/AuthContext";
import { useLoaderData } from "react-router-dom";
import { MemoryRouter } from "react-router-dom";

jest.mock("../../context/AuthContext", () => ({
    useAuth: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useLoaderData: jest.fn(),
}));

jest.mock("../../utility/ApiService", () => ({
    get: jest.fn(() => Promise.resolve( { message: "Employee registered successfully", employee: {}, accessToken: "hello" })),
}));

jest.mock("./ViewHouseListItem", () => (props: any) => (
    <div data-testid="house-item">{props.house.name}</div>
));

const sampleHouses = [
    { houseId: "H1", name: "Test House 1", maxClients: 2, clients: [], femaleEmployeeOnly: false },
    { houseId: "H2", name: "Test House 2", maxClients: 3, clients: [], femaleEmployeeOnly: true },
];

// Inside each test
const renderPage = (role: "DIRECTOR" | "ADMIN" | "MANAGER") => {
    (useAuth as jest.Mock).mockReturnValue({ employee: { position: role } });
    (useLoaderData as jest.Mock).mockReturnValue({ houses: sampleHouses, message: "houses successfully retrieved" });

    render(
        <MemoryRouter>
            <ViewHousesListPage />
        </MemoryRouter>
    );
}

describe("ViewHousesListPage", () => {


    it('renders header', () => {
        renderPage("ADMIN");
        expect(screen.getByRole('heading', { name: "Houses" })).toBeInTheDocument();
    });

    it("renders the list of houses", () => {
        renderPage("DIRECTOR");

        const houseItems = screen.getAllByTestId("house-item");
        expect(houseItems).toHaveLength(2);
        expect(houseItems[0]).toHaveTextContent("Test House 1");
        expect(houseItems[1]).toHaveTextContent("Test House 2");
    });

    it("shows the 'Add House' button for DIRECTOR or ADMIN", () => {
        renderPage("ADMIN");
        expect(screen.getByText("Add House")).toBeInTheDocument();
    });

    it("does NOT show the 'Add House' button for MANAGER", () => {
        renderPage("MANAGER");
        expect(screen.queryByText("Add House")).not.toBeInTheDocument();
    });
});
