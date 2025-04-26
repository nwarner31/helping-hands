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
        { clientId: "1", legalName: "John Doe LLC", name: "Johnny", dateOfBirth: "2000-01-01" },
        { clientId: "2", legalName: "Jane Smith Corp", name: "Janey", dateOfBirth: "1995-05-05" },
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

    it('renders the table headers', () => {
        setup("ADMIN");
        expect(screen.getByText("Client ID")).toBeInTheDocument();
        expect(screen.getByText("Legal Name")).toBeInTheDocument();
        expect(screen.getByText("Name")).toBeInTheDocument();
        expect(screen.getByText("Date of Birth")).toBeInTheDocument();
    });

    it('renders clients in the table', () => {
        setup("ADMIN");
        expect(screen.getByText("John Doe LLC")).toBeInTheDocument();
        expect(screen.getByText("Jane Smith Corp")).toBeInTheDocument();
    });

    it('shows the "Add Client" button for admins', () => {
        setup("ADMIN");
        expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument();
    });

    it('does not show the "Add Client" button for non-admins', () => {
        setup("EMPLOYEE");
        expect(screen.queryByRole('button', { name: /add client/i })).not.toBeInTheDocument();
    });

    it('should have the hideable class for admins', () => {
        setup("ADMIN");
        expect(screen.queryByText("Name")).toHaveClass("hideable");
    });

    it('should not have the hideable class for non admins', () => {
        setup("EMPLOYEE");
        expect(screen.queryByText("Name")).not.toHaveClass("hideable");
    });
});