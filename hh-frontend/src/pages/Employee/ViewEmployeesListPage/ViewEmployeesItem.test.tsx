import {render, screen} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import ViewEmployeesItem from "./ViewEmployeesItem";
import {Employee} from "../../../models/Employee";

const mockEmployee: Employee = {
    id: "E123",
    name: "Taylor Jordan",
    email: "taylor.jordan@example.com",
    position: "MANAGER",
    hireDate: "2024-06-03T00:00:00.000Z",
    sex: "F",
};

const renderItem = (employee: Employee = mockEmployee) => {
    render(
        <MemoryRouter initialEntries={["/employees"]}>
            <ViewEmployeesItem employee={employee} />
        </MemoryRouter>
    );
};

describe("ViewEmployeesItem", () => {
    it("renders the edit action and all field labels", () => {
        renderItem();

        expect(screen.getByRole("link", {name: "Edit"})).toBeInTheDocument();
        expect(screen.getByText("Employee Id")).toBeInTheDocument();
        expect(screen.getByText("Employee Name")).toBeInTheDocument();
        expect(screen.getByText("Sex")).toBeInTheDocument();
        expect(screen.getByText("Position")).toBeInTheDocument();
        expect(screen.getByText("Email")).toBeInTheDocument();
        expect(screen.getByText("Hire Date")).toBeInTheDocument();
    });

    it("renders employee field values", () => {
        renderItem();

        expect(screen.getByText("E123")).toBeInTheDocument();
        expect(screen.getByText("Taylor Jordan")).toBeInTheDocument();
        expect(screen.getByText("F")).toBeInTheDocument();
        expect(screen.getByText("MANAGER")).toBeInTheDocument();
        expect(screen.getByText("taylor.jordan@example.com")).toBeInTheDocument();
    });

    it("formats hire date before rendering", () => {
        renderItem();

        expect(screen.getByText("06/03/2024")).toBeInTheDocument();
        expect(screen.queryByText("2024-06-03T00:00:00.000Z")).not.toBeInTheDocument();
    });

    it("keeps the Edit link on the current route when to is empty", () => {
        renderItem();

        const editLink = screen.getByRole("link", {name: "Edit"});
        expect(editLink).toHaveAttribute("href", "/employee/E123");
    });
});

