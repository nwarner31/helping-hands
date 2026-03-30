import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";

import apiService from "../../../utility/ApiService";
import { Employee } from "../../../models/Employee";

const mockToastSuccess = jest.fn();

jest.mock("react-toastify", () => ({
    __esModule: true,
    toast: {
        success: mockToastSuccess,
    },
}));
import EditEmployeePage from "./EditEmployeePage";
import {AuthProvider} from "../../../context/AuthContext";
jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        useNavigate: jest.fn(),
    };
});

jest.mock("../../../utility/ApiService", () => ({
    get: jest.fn(),
    put: jest.fn(),
}));

const mockedUseNavigate = useNavigate as jest.Mock;

const buildEmployee = (overrides: Partial<Employee> = {}): Employee => ({
    id: "E123",
    name: "Jane Doe",
    email: "jane@helpinghands.org",
    position: "ASSOCIATE",
    hireDate: "2024-03-10T08:30:00.000Z",
    sex: "F",
    ...overrides,
});

const renderPage = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    const setQueryDataSpy = jest.spyOn(queryClient, "setQueryData");

    render(
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <MemoryRouter initialEntries={["/employees/E123/edit"]}>
                    <Routes>
                        <Route path="/employees/:employeeId/edit" element={<EditEmployeePage />} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>

        </QueryClientProvider>
    );

    return { queryClient, setQueryDataSpy };
};

describe("EditEmployeePage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseNavigate.mockReturnValue(jest.fn());
    });

    it("shows a loading skeleton while employee query is pending", () => {
        (apiService.get as jest.Mock).mockImplementation(() => new Promise(() => undefined));

        renderPage();

        expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
        expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
    });

    it("fetches employee data and prefills the form", async () => {
        (apiService.get as jest.Mock).mockResolvedValue({ data: buildEmployee() });

        renderPage();

        await waitFor(() => {
            expect(apiService.get).toHaveBeenCalledWith("employee/E123");
            expect(screen.getByLabelText("Name")).toHaveValue("Jane Doe");
            expect(screen.getByLabelText("Email")).toHaveValue("jane@helpinghands.org");
            expect(screen.getByLabelText("Hire Date")).toHaveValue("2024-03-10");
            expect(screen.getByLabelText("Female")).toBeChecked();
            expect(screen.getByLabelText("Position")).toHaveValue("ASSOCIATE");
        });
    });

    it("submits valid updates, updates query cache and navigates back", async () => {
        const navigate = jest.fn();
        const updatedEmployee = buildEmployee({
            name: "Jane Updated",
            position: "MANAGER",
            sex: "M",
            hireDate: "2024-03-11T00:00:00.000Z",
        });

        mockedUseNavigate.mockReturnValue(navigate);
        (apiService.get as jest.Mock).mockResolvedValue({ data: buildEmployee() });
        (apiService.put as jest.Mock).mockResolvedValue({ data: updatedEmployee });

        const { setQueryDataSpy } = renderPage();

        await waitFor(() => {
            expect(screen.getByLabelText("Name")).toHaveValue("Jane Doe");
        });

        await userEvent.clear(screen.getByLabelText("Name"));
        await userEvent.type(screen.getByLabelText("Name"), "Jane Updated");
        await userEvent.click(screen.getByLabelText("Male"));
        await userEvent.selectOptions(screen.getByLabelText("Position"), "MANAGER");

        await userEvent.click(screen.getByRole("button", { name: "Update Employee" }));

        await waitFor(() => {
            // The id is included from the api setting the initial data and not being stripped.
            expect(apiService.put).toHaveBeenCalledWith("employee/E123", {
                name: "Jane Updated",
                email: "jane@helpinghands.org",
                hireDate: "2024-03-10",
                sex: "M",
                position: "MANAGER",
                id: "E123",
            });
            expect(mockToastSuccess).toHaveBeenCalledWith("Employee successfully updated", {
                autoClose: 1500,
                position: "top-right",
            });
            expect(setQueryDataSpy).toHaveBeenCalledWith(["employees"], expect.any(Function));
            expect(setQueryDataSpy).toHaveBeenCalledWith(["employee", "E123"], updatedEmployee);
            expect(navigate).toHaveBeenCalledWith(-1);
        });
    });

    it("shows schema validation errors and does not submit invalid data", async () => {
        (apiService.get as jest.Mock).mockResolvedValue({ data: buildEmployee() });

        renderPage();

        await waitFor(() => {
            expect(screen.getByLabelText("Name")).toHaveValue("Jane Doe");
        });

        await userEvent.clear(screen.getByLabelText("Name"));
        await userEvent.clear(screen.getByLabelText("Email"));
        await userEvent.clear(screen.getByLabelText("Hire Date"));

        await userEvent.click(screen.getByRole("button", { name: "Update Employee" }));

        await waitFor(() => {
            expect(apiService.put).not.toHaveBeenCalled();
            expect(screen.getByText("Name is required")).toBeInTheDocument();
            expect(screen.getByText("Email is required")).toBeInTheDocument();
            expect(screen.getByText("Hire Date is required")).toBeInTheDocument();
        });
    });

    it("shows backend field errors when update request fails", async () => {
        (apiService.get as jest.Mock).mockResolvedValue({ data: buildEmployee() });
        (apiService.put as jest.Mock).mockRejectedValue({
            errors: {
                email: "Email API error",
                name: "Name API error",
            },
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getByLabelText("Name")).toHaveValue("Jane Doe");
        });

        await userEvent.click(screen.getByRole("button", { name: "Update Employee" }));

        await waitFor(() => {
            expect(screen.getByText("Email API error")).toBeInTheDocument();
            expect(screen.getByText("Name API error")).toBeInTheDocument();
        });
    });
});

