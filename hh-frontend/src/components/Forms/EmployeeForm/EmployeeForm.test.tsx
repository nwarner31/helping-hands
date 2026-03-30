import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmployeeForm from "./EmployeeForm";
import { EmployeeFormData } from "../../../models/Employee";

jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        useNavigate: jest.fn(),
    };
});

import { useNavigate } from "react-router-dom";

const mockedUseNavigate = useNavigate as jest.Mock;

const createEmployeeFormData = (overrides: Partial<EmployeeFormData> = {}): EmployeeFormData => ({
    name: "Jane Doe",
    email: "jane@example.com",
    hireDate: "2024-05-01",
    sex: "F",
    position: "ASSOCIATE",
    ...overrides,
});

describe("EmployeeForm", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseNavigate.mockReturnValue(jest.fn());
    });

    it("renders empty default values", () => {
        render(<EmployeeForm errors={{}} onSubmit={jest.fn()} />);

        expect(screen.getByLabelText("Name")).toHaveValue("");
        expect(screen.getByLabelText("Email")).toHaveValue("");
        expect(screen.getByLabelText("Hire Date")).toHaveValue("");
        expect(screen.getByLabelText("Female")).toBeChecked();
        expect(screen.getByLabelText("Male")).not.toBeChecked();
        expect(screen.getByLabelText("Position")).toHaveValue("ASSOCIATE");
        expect(screen.getByRole("button", { name: "Update Employee" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("renders initial data values", () => {
        const initialData = createEmployeeFormData({
            name: "John Smith",
            email: "john@example.com",
            hireDate: "2023-11-15",
            sex: "M",
            position: "MANAGER",
        });

        render(<EmployeeForm initialData={initialData} errors={{}} onSubmit={jest.fn()} />);

        expect(screen.getByLabelText("Name")).toHaveValue(initialData.name);
        expect(screen.getByLabelText("Email")).toHaveValue(initialData.email);
        expect(screen.getByLabelText("Hire Date")).toHaveValue(initialData.hireDate);
        expect(screen.getByLabelText("Male")).toBeChecked();
        expect(screen.getByLabelText("Female")).not.toBeChecked();
        expect(screen.getByLabelText("Position")).toHaveValue(initialData.position);
    });

    it("updates text, date, radio and select fields before submit", async () => {
        render(<EmployeeForm errors={{}} onSubmit={jest.fn()} />);

        await userEvent.type(screen.getByLabelText("Name"), "Alex Johnson");
        await userEvent.type(screen.getByLabelText("Email"), "alex@example.com");
        await userEvent.type(screen.getByLabelText("Hire Date"), "2022-01-20");
        await userEvent.click(screen.getByLabelText("Male"));
        await userEvent.selectOptions(screen.getByLabelText("Position"), "DIRECTOR");

        expect(screen.getByLabelText("Name")).toHaveValue("Alex Johnson");
        expect(screen.getByLabelText("Email")).toHaveValue("alex@example.com");
        expect(screen.getByLabelText("Hire Date")).toHaveValue("2022-01-20");
        expect(screen.getByLabelText("Male")).toBeChecked();
        expect(screen.getByLabelText("Female")).not.toBeChecked();
        expect(screen.getByLabelText("Position")).toHaveValue("DIRECTOR");
    });

    it("submits the current employee data", async () => {
        const onSubmit = jest.fn();

        render(<EmployeeForm errors={{}} onSubmit={onSubmit} />);

        await userEvent.type(screen.getByLabelText("Name"), "Taylor Reed");
        await userEvent.type(screen.getByLabelText("Email"), "taylor@example.com");
        await userEvent.type(screen.getByLabelText("Hire Date"), "2021-10-08");
        await userEvent.click(screen.getByLabelText("Male"));
        await userEvent.selectOptions(screen.getByLabelText("Position"), "ADMIN");

        await userEvent.click(screen.getByRole("button", { name: "Update Employee" }));

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith({
            name: "Taylor Reed",
            email: "taylor@example.com",
            hireDate: "2021-10-08",
            sex: "M",
            position: "ADMIN",
        });
    });

    it("navigates back when cancel is clicked", async () => {
        const navigate = jest.fn();
        mockedUseNavigate.mockReturnValue(navigate);

        render(<EmployeeForm errors={{}} onSubmit={jest.fn()} />);

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(navigate).toHaveBeenCalledWith(-1);
    });

    it("renders validation errors for matching fields", () => {
        render(
            <EmployeeForm
                errors={{
                    name: "Name is required",
                    email: "Email is required",
                    hireDate: "Hire date is required",
                }}
                onSubmit={jest.fn()}
            />
        );

        expect(screen.getByText("Name is required")).toBeInTheDocument();
        expect(screen.getByText("Email is required")).toBeInTheDocument();
        expect(screen.getByText("Hire date is required")).toBeInTheDocument();
        expect(screen.getByLabelText("Name")).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByLabelText("Hire Date")).toHaveAttribute("aria-invalid", "true");
    });
});

