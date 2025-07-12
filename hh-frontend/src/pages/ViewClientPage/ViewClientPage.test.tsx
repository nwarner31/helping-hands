import {AuthProvider} from "../../context/AuthContext";


jest.mock("../../utility/ApiService", () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
    },
}));

// ✅ only import after mocking
import { render, screen, waitFor } from "@testing-library/react";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import ViewClientPage from "./ViewClientPage";

// ✅ now it's safe to use the mocked version
import apiService from "../../utility/ApiService";
const mockedApi = apiService.get as jest.Mock;

const mockClient = {
    id: "client123",
    legalName: "Jane Doe",
    name: "Jane",
    dateOfBirth: "1990-01-01T00:00:00.000Z",
    sex: "F",
};

const mockHouse = {
    id: "house1",
    name: "Sunrise Home",
    street1: "123 Main St",
    city: "Somewhere",
    state: "CA",
    maxClients: 3,
    femaleEmployeeOnly: true,
    clients: [mockClient],
};

describe("ViewClientPage", () => {
    it("renders with client from location.state", async () => {
        render(
            <AuthProvider>
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: "/client/client123",
                            state: { client: { ...mockClient, house: mockHouse } },
                        },
                    ]}
                >
                    <Routes>
                        <Route path="/client/:clientId" element={<ViewClientPage />} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>

        );

        expect(await screen.findByText("View Client")).toBeInTheDocument();
        expect(screen.getByText("Legal Name: Jane Doe")).toBeInTheDocument();
        expect(screen.getByText("Name: Jane")).toBeInTheDocument();
        expect(screen.getByText("Female Only:")).toBeInTheDocument();
    });

    it("fetches client from API when no state is provided", async () => {
        mockedApi.mockImplementation((url: string, _config?: any) => {
            if (url.includes("client")) {
                return Promise.resolve({
                    client: {
                        id: "client123",
                        legalName: "Jane Doe",
                        name: "Test Name",
                        dateOfBirth: "2000-01-01",
                        sex: "F",
                        houseId: "house123",
                    },
                    message: "Success",
                }) as Promise<any>;
            }

            if (url.includes("house")) {
                return Promise.resolve({
                    house: {
                        id: "house123",
                        name: "Sunset Villa",
                        street1: "123 Main St",
                        street2: "",
                        city: "Los Angeles",
                        state: "CA",
                        femaleEmployeeOnly: true,
                        maxClients: 5,
                        clients: [],
                        primaryHouseManager: null,
                        secondaryHouseManager: null,
                    },
                }) as Promise<any>;
            }

            return Promise.reject(new Error("Unknown URL"));
        });


        render(
            <AuthProvider>
                <MemoryRouter initialEntries={["/client/client123"]}>
                    <Routes>
                        <Route path="/client/:clientId" element={<ViewClientPage />} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>

        );

        await waitFor(() => {
            expect(screen.getByText("Legal Name: Jane Doe")).toBeInTheDocument();
        });
    });

    it("shows fallback when there are no roommates", async () => {
        const soloClient = {
            ...mockClient,
            house: {
                ...mockHouse,
                clients: [mockClient], // only the current client, no roommates
            },
        };

        render(
            <AuthProvider>
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: "/client/client123",
                            state: { client: soloClient },
                        } as any,
                    ]}
                >
                    <Routes>
                        <Route path="/client/:clientId" element={<ViewClientPage />} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>

        );

        expect(await screen.findByText("No roommates")).toBeInTheDocument();
    });
});
