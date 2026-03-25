import {render, screen, waitFor} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ViewClientsListPage from "./ViewClientsListPage";
import { useAuth } from "../../../context/AuthContext";
import apiService from "../../../utility/ApiService";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {userEvent} from "@testing-library/user-event";

// Mock useAuth and useLoaderData
jest.mock("../../../context/AuthContext", () => ({
    useAuth: jest.fn(),
}));

jest.mock("../../../utility/ApiService", () => ({
    get: jest.fn(() => Promise.resolve( { message: "Employee registered successfully", employee: {}, accessToken: "hello" })),
}));
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
}));
describe("View Clients List Page tests", () => {
    const mockClients = [
        { id: "1", legalName: "John Doe", name: "Johnny", dateOfBirth: "2000-01-01", sex: "M" },
        { id: "2", legalName: "Jane Smith", name: "Janey", dateOfBirth: "1995-05-05", sex: "F" },
    ];

    function setup(role: "ADMIN" | "EMPLOYEE", clients = mockClients) {
        (useAuth as jest.Mock).mockReturnValue({
            employee: { position: role }
        });
        (apiService.get as jest.Mock).mockReturnValue({
            data: clients,
            message: "Fetched successfully"
        });
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
                <ViewClientsListPage />
            </MemoryRouter>
            </QueryClientProvider>
        );
    }

    it('renders header', () => {
        setup("ADMIN");
        expect(screen.getByRole('heading', { name: /clients/i })).toBeInTheDocument();
    });


    it('renders clients in the table', async () => {
        setup("ADMIN");
        await waitFor(() => {
            expect(screen.getByText("John Doe")).toBeInTheDocument();
            expect(screen.getByText("Jane Smith")).toBeInTheDocument();
        })

    });

    it('shows the "Add Client" button for admins', () => {
        setup("ADMIN");
        expect(screen.getByRole('link', { name: /add client/i })).toBeInTheDocument();
    });

    it('does not show the "Add Client" button for non-admins', () => {
        setup("EMPLOYEE");
        expect(screen.queryByRole('link', { name: /add client/i })).not.toBeInTheDocument();
    });
    const generateTestClients = (numClients: number) => {
        const clients = [];
        for(let i = 0; i < numClients; i++) {
            const client = {id: `c${i+1}`, legalName: `Client ${i+1}`, name: "Client", sex: i % 2 === 0 ? "M" : "F", dateOfBirth: "2000-01-01"};
            clients.push(client);
        }
        return clients;
    }
    describe("Pagination Tests", () => {
        it("renders pagination controls when there are more than 10 clients", async () => {
            const manyClients = generateTestClients(25);
            setup("ADMIN", manyClients);
            await waitFor(() => {
                expect(screen.getByTestId("pagination-next")).toBeInTheDocument();
                expect(screen.getByTestId("pagination-previous")).toBeInTheDocument();
            });
        });
        it("does not render pagination controls when there are 10 or fewer clients", async () => {
            setup("ADMIN");
            await waitFor(() => {
                expect(screen.queryByTestId("pagination-next")).not.toBeInTheDocument();
                expect(screen.queryByTestId("pagination-previous")).not.toBeInTheDocument();
            });
        });
        it("should change pages when the next button is pressed", async () => {
            setup("ADMIN", generateTestClients(25));
            await waitFor(async () => {
                expect(screen.getByTestId("pagination-input")).toHaveValue(1);


            });
            const nextButton = screen.getByTestId("pagination-next");
            expect(nextButton).toBeInTheDocument();
            await userEvent.click(nextButton, { pointerEventsCheck: 0 });
            expect(screen.getByTestId("pagination-input")).toHaveValue(2);
            expect(screen.queryByText("Client 10")).not.toBeInTheDocument();
            expect(screen.getByText("Client 11")).toBeInTheDocument();
        });
    });
    describe("Name Filter Tests", () => {
        it("should filter the clients based on the name input", async () => {
            setup("ADMIN", generateTestClients(15));
            await waitFor(async () => {
                expect(screen.getByTestId("pagination-next")).toBeInTheDocument();
            });
            const nameInput = screen.getByLabelText("Search Name")
            await userEvent.type(nameInput, "Client 1");
            await waitFor(() => {
                expect(screen.getByText("Client 1")).toBeInTheDocument();
                expect(screen.queryByText("Client 2")).not.toBeInTheDocument();
                expect(screen.queryByTestId("pagination-next")).not.toBeInTheDocument();
            });
        });
    });
    describe("Sex Filter tests", () => {
        it("should filter based upon the sex filter dropdown", async () => {
            setup("ADMIN", generateTestClients(15));
            await waitFor(async () => {
                expect(screen.getByTestId("pagination-next")).toBeInTheDocument();
            });
            await userEvent.selectOptions(screen.getByDisplayValue("Both"), "Female");
            expect(screen.getByText("Client 2")).toBeInTheDocument();
            expect(screen.queryByText("Client 1")).not.toBeInTheDocument();
            expect(screen.queryByTestId("pagination-next")).not.toBeInTheDocument();
        })
    })
});