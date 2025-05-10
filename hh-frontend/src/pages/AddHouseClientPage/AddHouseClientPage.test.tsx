import { render, screen, waitFor } from "@testing-library/react";
import AddHouseClientPage from "./AddHouseClientPage";
import apiService from "../../utility/ApiService";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { House } from "../../models/House";
import { Client } from "../../models/Client";

// Mock apiService
jest.mock("../../utility/ApiService", () => ({
    get: jest.fn()
}));

const mockedApi = apiService as jest.Mocked<typeof apiService>;

const mockHouse: House = {
    houseId: "house123",
    name: "Sunrise Home",
    street1: "123 Main St",
    street2: "",
    city: "Springfield",
    state: "IL",
    maxClients: 3,
    femaleEmployeeOnly: false,
    clients: [
        {
            clientId: "c1",
            legalName: "Alice Smith",
            dateOfBirth: "1990-01-01",
            sex: "F"
        }
    ]
};

const mockClients: Client[] = [
    {
        clientId: "c2",
        legalName: "Bob Johnson",
        dateOfBirth: "1985-06-15",
        sex: "M"
    }
];

const renderWithRouter = (path = "/add-client/house123", locationState: {house: House} | undefined = undefined) => {
    return render(
        <MemoryRouter initialEntries={[{ pathname: path, state: locationState }]}>
            <Routes>
                <Route path="/add-client/:houseId" element={<AddHouseClientPage />} />
            </Routes>
        </MemoryRouter>
    );
};

describe("AddHouseClientPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders with API data when no location state is passed", async () => {
        mockedApi.get.mockImplementation((url) => {
            if (url === "house/house123") {
                return Promise.resolve({ house: mockHouse });
            }
            if (url === "client/no-house") {
                return Promise.resolve({ clients: mockClients });
            }
            return Promise.reject("Unknown URL");
        });

        renderWithRouter();

        await waitFor(() => {
            expect(screen.getByText("Add Client to House")).toBeInTheDocument();
            expect(screen.getByText("Sunrise Home")).toBeInTheDocument();
            expect(screen.getByText("Alice Smith")).toBeInTheDocument();
            expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
        });
    });

    it("renders with house data from location state and fetches clients", async () => {
        mockedApi.get.mockResolvedValueOnce({ clients: mockClients });

        renderWithRouter("/add-client/house123", { house: mockHouse });

        await waitFor(() => {
            expect(screen.getByText("Sunrise Home")).toBeInTheDocument();
            expect(screen.getByText("Alice Smith")).toBeInTheDocument();
            expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
        });

        expect(mockedApi.get).toHaveBeenCalledWith("client/no-house");
        expect(mockedApi.get).not.toHaveBeenCalledWith("house/house123"); // Should skip house fetch
    });

    it("shows 'Current Clients' with count", async () => {
        mockedApi.get.mockResolvedValueOnce({ clients: mockClients });

        renderWithRouter("/add-client/house123", { house: mockHouse });

        await screen.findByText("Current Clients: 1/3");
    });

    it("conditionally renders client table only if there are clients", async () => {
        const houseWithNoClients = { ...mockHouse, clients: [] };
        mockedApi.get.mockResolvedValueOnce({ clients: mockClients });

        renderWithRouter("/add-client/house123", { house: houseWithNoClients });

        await waitFor(() => {
            expect(screen.queryByTestId("house-clients-table")).not.toBeInTheDocument(); // client table header
        });
    });
    it("displays current clients table when clients are present", async () => {
        mockedApi.get.mockResolvedValueOnce({ clients: mockClients });
        renderWithRouter("/add-client/house123", { house: mockHouse });

        // Simulate loading of the house and clients data (e.g., through an effect or async call)
        await waitFor(() => screen.getByText(mockHouse.name));

        // Check if the table exists
        const table = screen.getByTestId("house-clients-table");
        expect(table).toBeInTheDocument();
        expect(table).toHaveTextContent("Client ID");
        expect(table).toHaveTextContent("Legal Name");
        expect(table).toHaveTextContent("Date of Birth");
        expect(table).toHaveTextContent("Sex");

        // Check if the client data is correctly rendered in the table
        expect(table).toHaveTextContent("Alice Smith");
        expect(table).toHaveTextContent("01/01/1990");
        expect(table).toHaveTextContent("F");
    });

});
