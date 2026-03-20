import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import HouseForm, { House } from "./HouseForm";

jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        useNavigate: jest.fn(),
    };
});

import { useNavigate } from "react-router-dom";

const mockedUseNavigate = useNavigate as jest.Mock;

const createHouse = (overrides: Partial<House> = {}): House => ({
    id: "H123",
    name: "Sunrise Home",
    street1: "123 Main St",
    street2: "Unit 2",
    city: "Austin",
    state: "TX",
    maxClients: "5",
    femaleEmployeeOnly: true,
    ...overrides,
});

describe("HouseForm", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseNavigate.mockReturnValue(jest.fn());
    });

    it("renders empty default values and an enabled House ID field in add mode", () => {
        render(
            <HouseForm
                errors={{}}
                submitButtonText="Add House"
                onSubmit={jest.fn()}
            />
        );

        expect(screen.getByLabelText("House ID")).toHaveValue("");
        expect(screen.getByLabelText("House ID")).toBeEnabled();
        expect(screen.getByLabelText("House Name")).toHaveValue("");
        expect(screen.getByLabelText("Street 1")).toHaveValue("");
        expect(screen.getByLabelText("Street 2")).toHaveValue("");
        expect(screen.getByLabelText("City")).toHaveValue("");
        expect(screen.getByLabelText("State")).toHaveValue("");
        expect(screen.getByLabelText("Maximum Clients in House")).toHaveDisplayValue("1");
        expect(screen.getByLabelText("Female Only House")).not.toBeChecked();
        expect(screen.getByRole("button", { name: "Add House" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("renders initial data and disables the House ID field in edit mode", () => {
        const initialData = createHouse();

        render(
            <HouseForm
                initialData={initialData}
                errors={{}}
                submitButtonText="Update House"
                onSubmit={jest.fn()}
            />
        );

        expect(screen.getByLabelText("House ID")).toHaveValue(initialData.id);
        expect(screen.getByLabelText("House ID")).toBeDisabled();
        expect(screen.getByLabelText("House Name")).toHaveValue(initialData.name);
        expect(screen.getByLabelText("Street 1")).toHaveValue(initialData.street1);
        expect(screen.getByLabelText("Street 2")).toHaveValue(initialData.street2);
        expect(screen.getByLabelText("City")).toHaveValue(initialData.city);
        expect(screen.getByLabelText("State")).toHaveValue(initialData.state);
        expect(screen.getByLabelText("Maximum Clients in House")).toHaveValue(Number(initialData.maxClients));
        expect(screen.getByLabelText("Female Only House")).toBeChecked();
    });

    it("updates text, number, and checkbox fields before submit", async () => {
        render(
            <HouseForm
                errors={{}}
                submitButtonText="Add House"
                onSubmit={jest.fn()}
            />
        );

        await userEvent.type(screen.getByLabelText("House ID"), "H999");
        await userEvent.type(screen.getByLabelText("House Name"), "Testing House");
        await userEvent.type(screen.getByLabelText("Street 1"), "500 Test Way");
        await userEvent.type(screen.getByLabelText("Street 2"), "Suite 9");
        await userEvent.type(screen.getByLabelText("City"), "Dallas");
        await userEvent.type(screen.getByLabelText("State"), "TX");
        await userEvent.clear(screen.getByLabelText("Maximum Clients in House"));
        await userEvent.type(screen.getByLabelText("Maximum Clients in House"), "8");
        await userEvent.click(screen.getByLabelText("Female Only House"));

        expect(screen.getByLabelText("House ID")).toHaveValue("H999");
        expect(screen.getByLabelText("House Name")).toHaveValue("Testing House");
        expect(screen.getByLabelText("Street 1")).toHaveValue("500 Test Way");
        expect(screen.getByLabelText("Street 2")).toHaveValue("Suite 9");
        expect(screen.getByLabelText("City")).toHaveValue("Dallas");
        expect(screen.getByLabelText("State")).toHaveValue("TX");
        expect(screen.getByLabelText("Maximum Clients in House")).toHaveDisplayValue("8");
        expect(screen.getByLabelText("Female Only House")).toBeChecked();
    });

    it("submits the current house data", async () => {
        const onSubmit = jest.fn();

        render(
            <HouseForm
                errors={{}}
                submitButtonText="Add House"
                onSubmit={onSubmit}
            />
        );

        await userEvent.type(screen.getByLabelText("House ID"), "H555");
        await userEvent.type(screen.getByLabelText("House Name"), "Submit House");
        await userEvent.type(screen.getByLabelText("Street 1"), "100 Submit St");
        await userEvent.type(screen.getByLabelText("Street 2"), "Floor 3");
        await userEvent.type(screen.getByLabelText("City"), "Houston");
        await userEvent.type(screen.getByLabelText("State"), "TX");
        await userEvent.clear(screen.getByLabelText("Maximum Clients in House"));
        await userEvent.type(screen.getByLabelText("Maximum Clients in House"), "10");
        await userEvent.click(screen.getByLabelText("Female Only House"));

        await userEvent.click(screen.getByRole("button", { name: "Add House" }));

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith({
            id: "H555",
            name: "Submit House",
            street1: "100 Submit St",
            street2: "Floor 3",
            city: "Houston",
            state: "TX",
            maxClients: "10",
            femaleEmployeeOnly: true,
        });
    });

    it("navigates back when cancel is clicked", async () => {
        const navigate = jest.fn();
        mockedUseNavigate.mockReturnValue(navigate);

        render(
            <HouseForm
                errors={{}}
                submitButtonText="Add House"
                onSubmit={jest.fn()}
            />
        );

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(navigate).toHaveBeenCalledWith(-1);
    });

    it("renders validation errors for matching fields", () => {
        render(
            <HouseForm
                errors={{
                    id: "House ID is required",
                    name: "House name is required",
                    city: "City is required",
                    maxClients: "Max clients is required",
                }}
                submitButtonText="Add House"
                onSubmit={jest.fn()}
            />
        );

        expect(screen.getByText("House ID is required")).toBeInTheDocument();
        expect(screen.getByText("House name is required")).toBeInTheDocument();
        expect(screen.getByText("City is required")).toBeInTheDocument();
        expect(screen.getByText("Max clients is required")).toBeInTheDocument();
        expect(screen.getByLabelText("House ID")).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByLabelText("House Name")).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByLabelText("City")).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByLabelText("Maximum Clients in House")).toHaveAttribute("aria-invalid", "true");
    });
});

