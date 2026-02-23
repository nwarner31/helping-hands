import * as AuthContextModule from "../../context/AuthContext";
import {AuthProvider} from "../../context/AuthContext";

jest.mock("../../utility/ApiService", () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
    },
}));

import { render, screen, waitFor } from "@testing-library/react";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import ViewClientPage from "./ViewClientPage";

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
    beforeEach(() => {
        jest.clearAllMocks();
    })
    it("renders with client from location.state", async () => {
        mockedApi.mockReturnValue({client: mockClient});
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
        mockedApi.mockReturnValue({client: mockClient});

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
            expect(mockedApi).toHaveBeenCalledTimes(1);
        });
    });

    // it("fetches the house if it is not included in the location state", async () => {
    //
    //     render(
    //         <AuthProvider>
    //             <MemoryRouter
    //                 initialEntries={[
    //                     {
    //                         pathname: "/client/client123",
    //                         state: {client: {...mockClient, houseId: "H1234", events: []}},
    //                     },
    //                 ]}
    //             >
    //                 <Routes>
    //                     <Route path="/client/:clientId" element={<ViewClientPage/>}/>
    //                 </Routes>
    //             </MemoryRouter>
    //         </AuthProvider>
    //     );
    //     await waitFor(() => {
    //         expect(mockedApi).toHaveBeenCalledTimes(1);
    //     })
    //
    // });
    //
    // it("fetches the upcoming events if it is not included in the location state", async () => {
    //
    //     render(
    //         <AuthProvider>
    //             <MemoryRouter
    //                 initialEntries={[
    //                     {
    //                         pathname: "/client/client123",
    //                         state: {client: {...mockClient, house: mockHouse}},
    //                     },
    //                 ]}
    //             >
    //                 <Routes>
    //                     <Route path="/client/:clientId" element={<ViewClientPage/>}/>
    //                 </Routes>
    //             </MemoryRouter>
    //         </AuthProvider>
    //     );
    //     await waitFor(() => {
    //         expect(mockedApi).toHaveBeenCalledTimes(1);
    //     })
    //
    // });

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
        mockedApi.mockReturnValue({client: {...mockClient, house: houseWithManagers}});

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
        mockedApi.mockReturnValue({client: {...mockClient, house: mockHouse}});
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
        mockedApi.mockReturnValue({client: {...mockClient, house: houseWithStreet2}});

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
        mockedApi.mockReturnValue({client: {...mockClient, house: mockHouse}});
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
        mockedApi.mockReturnValue({client: {...mockClient, house: houseNotFemaleOnly}});

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
        mockedApi.mockReturnValue({client: mockClient});
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
        mockedApi.mockReturnValue({client: soloClient});

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
        mockedApi.mockReturnValue({client: clientWithRoommate});

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

it("does not show the event conflict button if it is not on the client", async () => {
    mockedApi.mockReturnValue({client: mockClient});

    render(
        <AuthProvider>
            <MemoryRouter
                initialEntries={[
                    {
                        pathname: "/client/client123",
                    } as any,
                ]}
            >
                <Routes>
                    <Route path="/client/:clientId" element={<ViewClientPage />} />
                </Routes>
            </MemoryRouter>
        </AuthProvider>
    );

    await waitFor(() => {
        expect(screen.queryByTestId("link-button-has-conflict")).not.toBeInTheDocument();
    });

});

it("should display there are no event conflicts if hasConflicts is false", async () => {
    mockedApi.mockReturnValue({client: {...mockClient, hasConflicts: {hasConflicts: false, numConflicts: 0}}});
    render(
        <AuthProvider>
            <MemoryRouter
                initialEntries={[
                    {
                        pathname: "/client/client123",
                    } as any,
                ]}
            >
                <Routes>
                    <Route path="/client/:clientId" element={<ViewClientPage />} />
                </Routes>
            </MemoryRouter>
        </AuthProvider>
    );

    await waitFor(() => {
        const conflictLink = screen.queryByTestId("link-button-has-conflict");
        expect(conflictLink).toBeInTheDocument();
        expect(conflictLink).toHaveClass("bg-success");
        expect(conflictLink).toHaveTextContent("No Upcoming Event Conflicts");
    });


});
it("should display that there are event conflicts if hasConflicts is true", async () => {
    mockedApi.mockReturnValue({client: {...mockClient, hasConflicts: {hasConflicts: true, numConflicts: 2}}});
    render(
        <AuthProvider>
            <MemoryRouter
                initialEntries={[
                    {
                        pathname: "/client/client123",
                    } as any,
                ]}
            >
                <Routes>
                    <Route path="/client/:clientId" element={<ViewClientPage />} />
                </Routes>
            </MemoryRouter>
        </AuthProvider>
    );

    await waitFor(() => {
        const conflictLink = screen.queryByTestId("link-button-has-conflict");
        expect(conflictLink).toBeInTheDocument();
        expect(conflictLink).toHaveClass("bg-danger");
        expect(conflictLink).toHaveTextContent("(2) Upcoming Event Conflicts");
    });
});

