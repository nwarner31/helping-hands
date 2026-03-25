import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import ViewHousesListPage from "./ViewHousesListPage";
import { useAuth } from "../../../context/AuthContext";
import { MemoryRouter } from "react-router-dom";
import {userEvent} from "@testing-library/user-event";
import {Client} from "../../../models/Client";
import apiService from "../../../utility/ApiService";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

jest.mock("../../../context/AuthContext", () => ({
    useAuth: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useLoaderData: jest.fn(),
}));

jest.mock("../../../utility/ApiService", () => ({
    get: jest.fn(() => Promise.resolve( { message: "Nothing special", employee: {}, accessToken: "hello" })),
    delete: jest.fn(() => Promise.resolve({message: "deleted"}))
}));

jest.mock("./ViewHouseListItem", () => (props: any) => (
    <div key={props.house.id}>
        <div data-testid="house-item">{props.house.name}</div>
        <div>Manager:
            {props.house.primaryHouseManager ?
                <button onClick={() => props.onRemoveManager(props.house, props.house.primaryHouseManager)}>{props.house.primaryHouseManager.name}</button>
                : "N/A"}</div>
        {props.house.clients.map((client: Client) => <button key={client.id} onClick={() => props.onRemoveClient(props.house, client)}>{client.legalName}</button> )}
    </div>
));

const sampleHouses = [
    { id: "H1", name: "Test House 1", maxClients: 2, clients: [], femaleEmployeeOnly: false, primaryHouseManager:{id: "E1", name: "Alice Williams"} },
    { id: "H2", name: "Test House 2", maxClients: 3, clients: [{id: "C1", legalName: "Bob Smith"}], femaleEmployeeOnly: true },
];

const generateHouses = (count: number) =>
    Array.from({ length: count }, (_, i) => ({
        id: `H${i + 1}`,
        name: `Test House ${i + 1}`,
        maxClients: 3,
        clients: [],
        femaleEmployeeOnly: false,
    }));

// Inside each test
const renderPage = (role: "DIRECTOR" | "ADMIN" | "MANAGER", data = sampleHouses) => {
    (useAuth as jest.Mock).mockReturnValue({ employee: { position: role } });
    (apiService.get as jest.Mock).mockResolvedValue({ message: "houses successfully retrieved", data: data });
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
            <ViewHousesListPage />
        </MemoryRouter>
        </QueryClientProvider>
    );
}

describe("ViewHousesListPage", () => {


    it('renders header', async () => {
        await waitFor(()=> {
            renderPage("ADMIN");
            expect(screen.getByRole('heading', { name: "Houses" })).toBeInTheDocument();
        });

    });

    it("renders the list of houses", async () => {
        renderPage("DIRECTOR");

        await waitFor(() => {
            const houseItems = screen.getAllByTestId("house-item");
            expect(houseItems).toHaveLength(2);
            expect(houseItems[0]).toHaveTextContent("Test House 1");
            expect(houseItems[1]).toHaveTextContent("Test House 2");
        });

    });

    it("shows the 'Add House' button for DIRECTOR or ADMIN", async () => {
        renderPage("ADMIN");
        await waitFor(() => {
            expect(screen.getByText("Add House")).toBeInTheDocument();
        });

    });

    it("does NOT show the 'Add House' button for MANAGER", async () => {
        renderPage("MANAGER");
        await waitFor(() => {
            expect(screen.queryByText("Add House")).not.toBeInTheDocument();
        });

    });
    it("displays modal when a client is being removed", async () => {
        renderPage("DIRECTOR");

        await waitFor(async () => {
            await userEvent.click(screen.getByText("Bob Smith"), {pointerEventsCheck: 0});
            expect(screen.getByText("Remove Client")).toBeInTheDocument();
            expect(screen.getByText(/House: H2/)).toBeInTheDocument();
            expect(screen.getByText(/Client: C1/)).toBeInTheDocument();
        })

    });
    it("calls the delete api and removes client when the remove modal button clicked", async () => {
        (apiService.delete as jest.Mock).mockResolvedValue({message: "client removed from house", data: { ...sampleHouses[1], clients: []}});
        renderPage("DIRECTOR");
        await waitFor(async () => {
            await userEvent.click(screen.getByText("Bob Smith"), {pointerEventsCheck: 0});
            await userEvent.click(screen.getByText("Remove"));
            expect(apiService.delete).toHaveBeenCalled();
            expect(screen.queryByText("Bob Smith")).not.toBeInTheDocument();
        })

    });

    it("displays modal when a manager is being removed", async () => {
        renderPage("DIRECTOR");

        await waitFor(async () => {
            await userEvent.click(screen.getByText("Alice Williams"), {pointerEventsCheck: 0});
            expect(screen.getByText("Remove Manager")).toBeInTheDocument();
            expect(screen.getByText(/Manager: E1/)).toBeInTheDocument();
        })

    });

    it("calls the delete API and removes manager when remove manager modal button clicked", async () => {
        (apiService.delete as jest.Mock).mockResolvedValue({message: "manager removed from house", data: { ...sampleHouses[0], primaryHouseManager: undefined }});
        renderPage("ADMIN");

        await waitFor(async () => {
            await userEvent.click(screen.getByText("Alice Williams"), {pointerEventsCheck: 0});
            await userEvent.click(screen.getByText("Remove"));

            expect(apiService.delete).toHaveBeenCalledWith("house/H1/manager/E1");
            expect(screen.queryByText("Alice Williams")).not.toBeInTheDocument();
            expect(screen.getAllByText(/N\/A/i)).toHaveLength(2);
        });

    });
    it("should close the modal when Cancel is clicked", async () => {
        renderPage("DIRECTOR");

        await waitFor(async () => {
            await userEvent.click(screen.getByText("Alice Williams"), {pointerEventsCheck: 0});
            expect(screen.getByText("Remove Manager")).toBeInTheDocument();

            await userEvent.click(screen.getByText("Cancel"));
            expect(screen.queryByText("Remove Manager")).not.toBeInTheDocument();
        })

    });

    describe("pagination", () => {
        it("does NOT show pagination when house count is at or below page size (5)", async () => {
            renderPage("ADMIN", generateHouses(5));
            await waitFor(() => {
                expect(screen.getAllByTestId("house-item")).toHaveLength(5);
                expect(screen.queryByRole("button", { name: "<" })).not.toBeInTheDocument();
                expect(screen.queryByRole("button", { name: ">" })).not.toBeInTheDocument();
            });
        });

        it("shows pagination buttons when house count exceeds page size (5)", async () => {
            renderPage("ADMIN", generateHouses(6));
            await waitFor(() => {
                expect(screen.getByRole("button", { name: "<" })).toBeInTheDocument();
                expect(screen.getByRole("button", { name: ">" })).toBeInTheDocument();
            });
        });

        it("shows only the first page of houses on initial load", async () => {
            renderPage("ADMIN", generateHouses(8));
            await waitFor(() => {
                const items = screen.getAllByTestId("house-item");
                expect(items).toHaveLength(5);
                expect(items[0]).toHaveTextContent("Test House 1");
                expect(items[4]).toHaveTextContent("Test House 5");
            });
        });

        it("navigates to the next page when the '>' button is clicked", async () => {
            renderPage("ADMIN", generateHouses(8));
            await waitFor(() => expect(screen.getAllByTestId("house-item")).toHaveLength(5));

            await userEvent.click(screen.getByRole("button", { name: ">" }), { pointerEventsCheck: 0 });

            await waitFor(() => {
                const items = screen.getAllByTestId("house-item");
                expect(items).toHaveLength(3);
                expect(items[0]).toHaveTextContent("Test House 6");
                expect(items[2]).toHaveTextContent("Test House 8");
            });
        });

        it("navigates back to the previous page when the '<' button is clicked", async () => {
            renderPage("ADMIN", generateHouses(8));
            await waitFor(() => expect(screen.getAllByTestId("house-item")).toHaveLength(5));

            await userEvent.click(screen.getByRole("button", { name: ">" }), { pointerEventsCheck: 0 });
            await waitFor(() => expect(screen.getAllByTestId("house-item")).toHaveLength(3));

            await userEvent.click(screen.getByRole("button", { name: "<" }), { pointerEventsCheck: 0 });

            await waitFor(() => {
                const items = screen.getAllByTestId("house-item");
                expect(items).toHaveLength(5);
                expect(items[0]).toHaveTextContent("Test House 1");
            });
        });

        it("disables the '<' button on the first page", async () => {
            renderPage("ADMIN", generateHouses(6));
            await waitFor(() => {
                expect(screen.getByRole("button", { name: "<" })).toBeDisabled();
            });
        });

        it("disables the '>' button on the last page", async () => {
            renderPage("ADMIN", generateHouses(6));
            await waitFor(() => expect(screen.getByRole("button", { name: ">" })).toBeInTheDocument());

            await userEvent.click(screen.getByRole("button", { name: ">" }), { pointerEventsCheck: 0 });

            await waitFor(() => {
                expect(screen.getByRole("button", { name: ">" })).toBeDisabled();
            });
        });

        it("displays the correct total page count", async () => {
            renderPage("ADMIN", generateHouses(11)); //WithManyHouses(11);
            await waitFor(() => {
                expect(screen.getByText(/\/\s*3/)).toBeInTheDocument();
            });
        });

        it("navigates to a specific page via the page number input", async () => {
            renderPage("ADMIN", generateHouses(11));
            await waitFor(() => expect(screen.getAllByTestId("house-item")).toHaveLength(5));

            const input = screen.getByTestId("pagination-input");
            await userEvent.clear(input);

            await userEvent.type(input, "3{enter}");
            expect(input).toHaveValue(3);
            fireEvent.submit(screen.getByTestId("pagination-form"));

            await waitFor(() => {
                const items = screen.getAllByTestId("house-item");
                expect(items).toHaveLength(1);
                expect(items[0]).toHaveTextContent("Test House 11");
            });
        });
    });
});
