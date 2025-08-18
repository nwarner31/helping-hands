import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ViewClientsListPage from "./ViewClientsListPage";
import { useAuth } from "../../context/AuthContext";
import { useLoaderData } from "react-router-dom";

// Mock useAuth and useLoaderData
jest.mock("../../context/AuthContext", () => ({
    useAuth: jest.fn(),
}));

jest.mock("../../utility/ApiService", () => ({
    get: jest.fn(() => Promise.resolve( { message: "Employee registered successfully", employee: {}, accessToken: "hello" })),
}));
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useLoaderData: jest.fn(),
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
        (useLoaderData as jest.Mock).mockReturnValue({
            clients: mockClients,
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


    it('renders clients in the table', () => {
        setup("ADMIN");
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    it('shows the "Add Client" button for admins', () => {
        setup("ADMIN");
        expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument();
    });

    it('does not show the "Add Client" button for non-admins', () => {
        setup("EMPLOYEE");
        expect(screen.queryByRole('button', { name: /add client/i })).not.toBeInTheDocument();
    });
});