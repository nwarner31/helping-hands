import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {MemoryRouter} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import ViewEmployeesListPage from "./ViewEmployeesListPage";
import apiService from "../../../utility/ApiService";
import {Employee} from "../../../models/Employee";
import {AuthProvider} from "../../../context/AuthContext";

jest.mock("../../../hooks/dounceHook/debounce.hook", () => ({
    useDebounce: jest.fn((value: string) => value),
}));

jest.mock("../../../utility/ApiService", () => ({
    get: jest.fn(),
}));

jest.mock("./ViewEmployeesItem", () => ({
    __esModule: true,
    default: ({employee}: {employee: Employee}) => <div data-testid="employee-item">{employee.name}</div>,
}));

const buildEmployee = (index: number, overrides: Partial<Employee> = {}): Employee => ({
    id: `E${index}`,
    name: `Employee ${index}`,
    email: `employee${index}@test.com`,
    position: index % 2 === 0 ? "ASSOCIATE" : "MANAGER",
    hireDate: "2024-01-01",
    sex: index % 2 === 0 ? "F" : "M",
    ...overrides,
});

const renderPage = () => {
    const testQuery = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    render(
        <QueryClientProvider client={testQuery}>
            <AuthProvider>
                <MemoryRouter>
                    <ViewEmployeesListPage />
                </MemoryRouter>
            </AuthProvider>

        </QueryClientProvider>
    );
};

describe("ViewEmployeesListPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders page heading and dashboard link", async () => {
        (apiService.get as jest.Mock).mockResolvedValue({data: [buildEmployee(1)]});

        renderPage();

        expect(screen.getByRole("heading", {name: "Employees"})).toBeInTheDocument();
        const dashboardLink = screen.getByRole("link", {name: "Dashboard"});
        expect(dashboardLink).toHaveAttribute("href", "/dashboard");

        await waitFor(() => {
            expect(screen.getByText("Employee 1")).toBeInTheDocument();
        });
    });

    it("shows loading skeletons while employee data is loading", () => {
        (apiService.get as jest.Mock).mockImplementation(() => new Promise(() => undefined));

        renderPage();

        expect(screen.getAllByTestId("loading-skeleton")).toHaveLength(6);
    });

    it("shows pagination and navigates to the next page", async () => {
        (apiService.get as jest.Mock).mockResolvedValue({
            data: Array.from({length: 10}, (_, i) => buildEmployee(i + 1)),
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getAllByTestId("employee-item")).toHaveLength(8);
        });

        expect(screen.getByTestId("pagination-buttons")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("pagination-next"));

        await waitFor(() => {
            const items = screen.getAllByTestId("employee-item");
            expect(items).toHaveLength(2);
            expect(screen.getByText("Employee 9")).toBeInTheDocument();
            expect(screen.getByText("Employee 10")).toBeInTheDocument();
        });
    });

    it("filters employees by name, sex, and position", async () => {
        (apiService.get as jest.Mock).mockResolvedValue({
            data: [
                buildEmployee(1, {name: "Mark Manager", sex: "M", position: "MANAGER"}),
                buildEmployee(2, {name: "Mia Manager", sex: "F", position: "MANAGER"}),
                buildEmployee(3, {name: "Mary Associate", sex: "F", position: "ASSOCIATE"}),
            ],
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getAllByTestId("employee-item")).toHaveLength(3);
        });

        await userEvent.type(screen.getByLabelText("Search Name"), "ma");
        await userEvent.selectOptions(screen.getByLabelText("Sex"), "F");
        await userEvent.selectOptions(screen.getByLabelText("Position"), "MANAGER");

        await waitFor(() => {
            const items = screen.getAllByTestId("employee-item");
            expect(items).toHaveLength(1);
            expect(items[0]).toHaveTextContent("Mia Manager");
            expect(screen.queryByText("Mark Manager")).not.toBeInTheDocument();
        });
    });

    it("resets to page 1 when filters change the dataset", async () => {
        (apiService.get as jest.Mock).mockResolvedValue({
            data: Array.from({length: 12}, (_, i) => buildEmployee(i + 1)),
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getAllByTestId("employee-item")).toHaveLength(8);
        });

        await userEvent.click(screen.getByTestId("pagination-next"));

        await waitFor(() => {
            expect(screen.getByText("Employee 12")).toBeInTheDocument();
            expect(screen.queryByText("Employee 1")).not.toBeInTheDocument();
        });

        await userEvent.type(screen.getByLabelText("Search Name"), "Employee 1");

        await waitFor(() => {
            expect(screen.getByText("Employee 1")).toBeInTheDocument();
            expect(screen.queryByText("Employee 9")).not.toBeInTheDocument();
            expect(screen.queryByTestId("pagination-buttons")).not.toBeInTheDocument();
        });
    });
});

