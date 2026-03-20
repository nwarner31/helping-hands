import {render, screen, waitFor} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ViewClientsListPage from "./ViewClientsListPage";
import { useAuth } from "../../../context/AuthContext";
import apiService from "../../../utility/ApiService";

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

    function setup(role: "ADMIN" | "EMPLOYEE") {
        (useAuth as jest.Mock).mockReturnValue({
            employee: { position: role }
        });
        (apiService.get as jest.Mock).mockReturnValue({
            data: mockClients,
            message: "Fetched successfully"
        });

        render(
            <MemoryRouter>
                <ViewClientsListPage />
            </MemoryRouter>
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
});