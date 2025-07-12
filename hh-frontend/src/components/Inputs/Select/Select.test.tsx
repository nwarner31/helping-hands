import { render, screen } from "@testing-library/react";
import Select from "./Select";
import {userEvent} from "@testing-library/user-event";

describe("Select component", () => {
    const baseProps = {
        name: "eventType",
        label: "Event Type",
        value: "WORK",
        onChange: jest.fn(),
        options: [
            { label: "Work", value: "WORK" },
            { label: "Medical", value: "MEDICAL" },
            { label: "Social", value: "SOCIAL" },
        ],
    };

    it("renders label and options correctly", () => {
        render(<Select {...baseProps} />);
        expect(screen.getByLabelText("Event Type")).toBeInTheDocument();

        baseProps.options.forEach((option) => {
            expect(screen.getByRole("option", { name: option.label })).toBeInTheDocument();
        });
    });

    it("selects the correct initial value", () => {
        render(<Select {...baseProps} />);
        const select = screen.getByRole("combobox");
        expect(select).toHaveValue("WORK");
    });

    it("calls onChange when selection changes", async () => {
        render(<Select {...baseProps} />);
        const select = screen.getByRole("combobox");
        await userEvent.selectOptions(select, "MEDICAL");
        expect(baseProps.onChange).toHaveBeenCalled();
    });

    it("displays an error message when provided", () => {
        render(<Select {...baseProps} error="This field is required" />);
        expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("applies custom class names", () => {
        render(<Select {...baseProps} className="custom-class" containerClass="container-class" />);
        const container = screen.getByText("Event Type").parentElement;
        expect(container).toHaveClass("container-class");
        expect(screen.getByRole("combobox")).toHaveClass("custom-class");
    });
});
