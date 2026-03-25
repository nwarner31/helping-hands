import { render, screen, waitFor } from "@testing-library/react";
import AddHouseClientPage from "./AddHouseClientPage";
import apiService from "../../../utility/ApiService";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { House } from "../../../models/House";
import { Client } from "../../../models/Client";
import {AuthProvider} from "../../../context/AuthContext";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {userEvent} from "@testing-library/user-event";

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...(jest.requireActual('react-router-dom')),
    useNavigate: () => mockedNavigate,
}));

// Mock apiService
jest.mock("../../../utility/ApiService", () => ({
    get: jest.fn()
}));

const mockedApi = apiService as jest.Mocked<typeof apiService>;

const mockHouse: House = {
    id: "house123",
    name: "Sunrise Home",
    street1: "123 Main St",
    street2: "",
    city: "Springfield",
    state: "IL",
    maxClients: 3,
    femaleEmployeeOnly: false,
    clients: [
        {
            id: "c1",
            legalName: "Alice Smith",
            dateOfBirth: "1990-01-01",
            sex: "F"
        }
    ]
};

const mockClients: Client[] = [
    {
        id: "c2",
        legalName: "Bob Johnson",
        dateOfBirth: "1985-06-15",
        sex: "M"
    }
];

const renderWithRouter = (path = "/add-client/house123") => {
    const testQuery = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false
            }
        }
    });

    return render(
        <QueryClientProvider client={testQuery}>
        <AuthProvider>
            <MemoryRouter initialEntries={[{ pathname: path}]}>
                <Routes>
                    <Route path="/add-client/:houseId" element={<AddHouseClientPage />} />
                </Routes>
            </MemoryRouter>
        </AuthProvider>
        </QueryClientProvider>
    );
};

describe("AddHouseClientPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the data correctly", async () => {
        mockedApi.get.mockImplementation((url) => {
            if (url === "house/house123") {
                return Promise.resolve({ data: mockHouse });
            }
            if (url === "client/no-house") {
                return Promise.resolve({ data: mockClients });
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


    it("shows 'Current Clients' with count", async () => {
        (mockedApi.get as jest.Mock).mockResolvedValueOnce({ data: mockClients });
        (mockedApi.get as jest.Mock).mockResolvedValueOnce({ data: mockHouse });
        renderWithRouter("/add-client/house123");

        await waitFor(() => screen.findByText("Current Clients: 1/3"));
    });

    it("conditionally renders client table only if there are clients", async () => {
        const houseWithNoClients = { ...mockHouse, clients: [] };
        (mockedApi.get as jest.Mock).mockResolvedValueOnce({ data: houseWithNoClients });

        renderWithRouter("/add-client/house123");

        await waitFor(() => {
            expect(screen.queryByTestId("house-clients-table")).not.toBeInTheDocument(); // client table header
        });
    });
    it("displays current clients table when clients are present", async () => {
        mockedApi.get.mockResolvedValueOnce({ data: mockClients });
        renderWithRouter("/add-client/house123");

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
    it("should navigate back when cancel is clicked", async () => {
        mockedApi.get.mockResolvedValueOnce({ data: mockClients });
        renderWithRouter("/add-client/house123");

        await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

        await waitFor(() => {
            expect(mockedNavigate).toHaveBeenCalledWith(-1);
        });
    });
    it("should show loading texts for the clients if the house has loaded from the api before the clients", async () => {
        mockedApi.get.mockImplementation((url) => {
            if (url === "house/house123") {
                return Promise.resolve({ data: mockHouse });
            }
            if (url === "client/no-house") {
                return new Promise(() => {})
            }
            return Promise.reject("Unknown URL");
        });
        renderWithRouter("/add-client/house123");

        await waitFor(() => {
            expect(screen.getByText("house123")).toBeInTheDocument();
            expect(screen.getByText("Sunrise Home")).toBeInTheDocument();
            expect(screen.getByText("Loading...")).toBeInTheDocument();
        });
    })

});
