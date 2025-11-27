import * as AuthContextModule from "../../context/AuthContext";
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
import { Employee } from "../../models/Employee";

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
    beforeAll(() => {
        jest.clearAllMocks();
        mockedApi.mockImplementation((url: string, _config?: any) => {

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

            if (url.includes("event/upcoming")) {
                return Promise.resolve({
                    events: [{
                        id: "E1234",
                        beginDate: "2023-10-01T10:00:00.000Z",
                        endDate: "2023-10-01T12:00:00.000Z",
                        beginTime: "2023-10-01T10:00:00.000Z",
                        endTime: "2023-10-01T12:00:00.000Z",
                        type: "WORK",
                        numberStaffRequired: 2,
                    }],
                }) as Promise<any>;
            }
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

            return Promise.reject(new Error("Unknown URL"));
        });
    });
    beforeEach(() => {
        jest.clearAllMocks();
    })
    it("renders with client from location.state", async () => {
        render(
            <AuthProvider>
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: "/client/client123",
                            state: {client: {...mockClient, house: mockHouse, events: []}},
                        },
                    ]}
                >
                    <Routes>
                        <Route path="/client/:clientId" element={<ViewClientPage/>}/>
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


        render(
            <AuthProvider>
                <MemoryRouter initialEntries={["/client/client123"]}>
                    <Routes>
                        <Route path="/client/:clientId" element={<ViewClientPage/>}/>
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByText("Legal Name: Jane Doe")).toBeInTheDocument();
        });
    });

    it("fetches the house if it is not included in the location state", async () => {

        render(
            <AuthProvider>
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: "/client/client123",
                            state: {client: {...mockClient, houseId: "H1234", events: []}},
                        },
                    ]}
                >
                    <Routes>
                        <Route path="/client/:clientId" element={<ViewClientPage/>}/>
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        );
        await waitFor(() => {
            expect(mockedApi).toHaveBeenCalledTimes(1);
        })

    });

    it("fetches the upcoming events if it is not included in the location state", async () => {

        render(
            <AuthProvider>
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: "/client/client123",
                            state: {client: {...mockClient, house: mockHouse}},
                        },
                    ]}
                >
                    <Routes>
                        <Route path="/client/:clientId" element={<ViewClientPage/>}/>
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        );
        await waitFor(() => {
            expect(mockedApi).toHaveBeenCalledTimes(1);
        })

    });

    it("shows the managers when they exist", async () => {
        const houseWithManagers = {
            ...mockHouse,
            primaryHouseManager: {
                id: "emp123",
                name: "Alice Manager",
            },
            secondaryHouseManager: {
                id: "emp456",
                name: "Bob Supervisor",
            },
        };

        render(
            <AuthProvider>
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: "/client/client123",
                            state: {client: {...mockClient, house: houseWithManagers, events: []}},
                        } as any,
                    ]}
                >
                    <Routes>
                        <Route path="/client/:clientId" element={<ViewClientPage/>}/>
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        );

        expect(await screen.findByText("emp123: Alice Manager")).toBeInTheDocument();
        expect(screen.getByText("emp456: Bob Supervisor")).toBeInTheDocument();
    })

    it("shows the fallback when no managers exist", async () => {
        render(
            <AuthProvider>
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: "/client/client123",
                            state: {client: {...mockClient, house: mockHouse, events: []}},
                        } as any,
                    ]}
                >
                    <Routes>
                        <Route path="/client/:clientId" element={<ViewClientPage/>}/>
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        );

        expect((await screen.findAllByText("N/A")).length).toBe(2);
    });

    it("shows the street2 when it exists", async () => {
        const houseWithStreet2 = {
            ...mockHouse,
            street2: "Apt 4B",
        };

        render(
            <AuthProvider>
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: "/client/client123",
                            state: {client: {...mockClient, house: houseWithStreet2, events: []}},
                        } as any,
                    ]}
                >
                    <Routes>
                        <Route path="/client/:clientId" element={<ViewClientPage/>}/>
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        );

        expect(await screen.findByText("Apt 4B")).toBeInTheDocument();
    });

    it("shows yes if the house is female only", async () => {
        render(
            <AuthProvider>
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: "/client/client123",
                            state: {client: {...mockClient, house: mockHouse, events: []}},
                        } as any,
                    ]}
                >
                    <Routes>
                        <Route path="/client/:clientId" element={<ViewClientPage/>}/>
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        );

        expect(await screen.findByText("Yes")).toBeInTheDocument();
    });
    it("shows no if the house is not female only", async () => {
        const houseNotFemaleOnly = {
            ...mockHouse,
            femaleEmployeeOnly: false,
        };

        render(
            <AuthProvider>
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: "/client/client123",
                            state: {client: {...mockClient, house: houseNotFemaleOnly, events: []}},
                        } as any,
                    ]}
                >
                    <Routes>
                        <Route path="/client/:clientId" element={<ViewClientPage/>}/>
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        );

        expect(await screen.findByText("No")).toBeInTheDocument();
    });

    it("does not show edit button for associate users", async () => {
        const spy = jest.spyOn(AuthContextModule, "useAuth").mockReturnValue({
            employee: {
                id: "1", position: "ADMIN",
                name: "",
                email: "",
                hireDate: ""
            },
            accessToken: null,
            login: function (_employee: Employee, _accessToken: string): void {
                throw new Error("Function not implemented.");
            },
            logout: function (): void {
                throw new Error("Function not implemented.");
            }
        });
        render(
            <AuthProvider>
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: "/client/client123",
                            state: { client: { ...mockClient, house: mockHouse, events: [] } },
                        } as any,
                    ]}
                >
                    <Routes>
                        <Route path="/client/:clientId" element={<ViewClientPage />} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>

        );

        expect(await screen.findByText("View Client")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
        spy.mockRestore();
    });

    it("shows fallback when there are no roommates", async () => {
        const soloClient = {
            ...mockClient,
            house: {
                ...mockHouse,
                clients: [mockClient],
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

    it("shows roommates when there are roommates", async () => {
        const mockRoommate = {
            id: "client456",
            legalName: "Jimmy Doe",
            dateOfBirth: "1984-06-20T00:00:00.000Z",
            sex: "M",
        };
        const clientWithRoommate = {
            ...mockClient,
            house: {
                ...mockHouse,
                clients: [mockClient, mockRoommate], // only the current client, no roommates
            },
        };

        render(
            <AuthProvider>
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: "/client/client123",
                            state: { client: clientWithRoommate },
                        } as any,
                    ]}
                >
                    <Routes>
                        <Route path="/client/:clientId" element={<ViewClientPage />} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>

        );

        expect(await screen.findByText("client456: Jimmy Doe")).toBeInTheDocument();
    });

});
