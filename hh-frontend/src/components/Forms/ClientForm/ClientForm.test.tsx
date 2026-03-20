import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClientForm from "./ClientForm";
import { Client } from "../../../models/Client";

jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        useNavigate: jest.fn(),
    };
});

import { useNavigate } from "react-router-dom";

const mockedUseNavigate = useNavigate as jest.Mock;

const createClient = (overrides: Partial<Client> = {}): Client => ({
    id: "C123",
    legalName: "Jane Doe",
    name: "Jane",
    dateOfBirth: "1999-06-15",
    sex: "F",
    ...overrides,
});

describe("ClientForm", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseNavigate.mockReturnValue(jest.fn());
    });

    it("renders empty default values and an enabled Client ID field in add mode", () => {
        render(
            <ClientForm
                errors={{}}
                submitButtonText="Add Client"
                onSubmit={jest.fn()}
            />
        );

        expect(screen.getByLabelText("Client ID")).toHaveValue("");
        expect(screen.getByLabelText("Client ID")).toBeEnabled();
        expect(screen.getByLabelText("Legal Name")).toHaveValue("");
        expect(screen.getByLabelText("Preferred Name")).toHaveValue("");
        expect(screen.getByLabelText("Date of Birth")).toHaveValue("");
        expect(screen.getByLabelText("Female")).toBeChecked();
        expect(screen.getByLabelText("Male")).not.toBeChecked();
        expect(screen.getByRole("button", { name: "Add Client" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("renders initial data and disables the Client ID field in edit mode", () => {
        const initialData = createClient({ sex: "M" });

        render(
            <ClientForm
                initialData={initialData}
                errors={{}}
                submitButtonText="Update Client"
                onSubmit={jest.fn()}
            />
        );

        expect(screen.getByLabelText("Client ID")).toHaveValue(initialData.id);
        expect(screen.getByLabelText("Client ID")).toBeDisabled();
        expect(screen.getByLabelText("Legal Name")).toHaveValue(initialData.legalName);
        expect(screen.getByLabelText("Preferred Name")).toHaveValue(initialData.name ?? "");
        expect(screen.getByLabelText("Date of Birth")).toHaveValue(initialData.dateOfBirth);
        expect(screen.getByLabelText("Male")).toBeChecked();
        expect(screen.getByLabelText("Female")).not.toBeChecked();
    });

    it("updates text, date, and sex fields before submit", async () => {
        render(
            <ClientForm
                errors={{}}
                submitButtonText="Add Client"
                onSubmit={jest.fn()}
            />
        );

        await userEvent.type(screen.getByLabelText("Client ID"), "C999");
        await userEvent.type(screen.getByLabelText("Legal Name"), "Sam Taylor");
        await userEvent.type(screen.getByLabelText("Preferred Name"), "Sam");
        await userEvent.type(screen.getByLabelText("Date of Birth"), "2001-01-20");
        await userEvent.click(screen.getByLabelText("Male"));

        expect(screen.getByLabelText("Client ID")).toHaveValue("C999");
        expect(screen.getByLabelText("Legal Name")).toHaveValue("Sam Taylor");
        expect(screen.getByLabelText("Preferred Name")).toHaveValue("Sam");
        expect(screen.getByLabelText("Date of Birth")).toHaveValue("2001-01-20");
        expect(screen.getByLabelText("Male")).toBeChecked();
        expect(screen.getByLabelText("Female")).not.toBeChecked();
    });

    it("submits the current client data", async () => {
        const onSubmit = jest.fn();

        render(
            <ClientForm
                errors={{}}
                submitButtonText="Add Client"
                onSubmit={onSubmit}
            />
        );

        await userEvent.type(screen.getByLabelText("Client ID"), "C555");
        await userEvent.type(screen.getByLabelText("Legal Name"), "Chris Evans");
        await userEvent.type(screen.getByLabelText("Preferred Name"), "Chris");
        await userEvent.type(screen.getByLabelText("Date of Birth"), "1995-12-05");
        await userEvent.click(screen.getByLabelText("Male"));

        await userEvent.click(screen.getByRole("button", { name: "Add Client" }));

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith({
            id: "C555",
            legalName: "Chris Evans",
            name: "Chris",
            dateOfBirth: "1995-12-05",
            sex: "M",
        });
    });

    it("navigates back when cancel is clicked", async () => {
        const navigate = jest.fn();
        mockedUseNavigate.mockReturnValue(navigate);

        render(
            <ClientForm
                errors={{}}
                submitButtonText="Add Client"
                onSubmit={jest.fn()}
            />
        );

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(navigate).toHaveBeenCalledWith(-1);
    });

    it("renders validation errors for matching fields", () => {
        render(
            <ClientForm
                errors={{
                    id: "Client ID is required",
                    legalName: "Legal name is required",
                    dateOfBirth: "Date of Birth is required",
                }}
                submitButtonText="Add Client"
                onSubmit={jest.fn()}
            />
        );

        expect(screen.getByText("Client ID is required")).toBeInTheDocument();
        expect(screen.getByText("Legal name is required")).toBeInTheDocument();
        expect(screen.getByText("Date of Birth is required")).toBeInTheDocument();
        expect(screen.getByLabelText("Client ID")).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByLabelText("Legal Name")).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByLabelText("Date of Birth")).toHaveAttribute("aria-invalid", "true");
    });
});

