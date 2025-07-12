import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Textarea from "./Textarea";

describe("Textarea component", () => {
    it("renders the label and textarea", () => {
        render(<Textarea name="notes" label="Notes" />);

        expect(screen.getByLabelText("Notes")).toBeInTheDocument();
        expect(screen.getByRole("textbox")).toHaveAttribute("name", "notes");
    });

    it("calls onChange when user types", async () => {
        const user = userEvent.setup();
        const handleChange = jest.fn();

        render(<Textarea name="notes" label="Notes" onChange={handleChange} />);

        const textarea = screen.getByRole("textbox");
        await user.type(textarea, "Some text");

        expect(handleChange).toHaveBeenCalled();
    });

    it("shows error message and applies error class", () => {
        render(
            <Textarea
                name="notes"
                label="Notes"
                error="This field is required"
            />
        );

        expect(screen.getByText("This field is required")).toBeInTheDocument();
        const textarea = screen.getByRole("textbox");
        expect(textarea.className).toMatch(/textareaError/);
    });

    it("applies custom container class", () => {
        render(<Textarea name="notes" label="Notes" containerClass="custom-class" />);
        const container = screen.getByLabelText("Notes").parentElement;
        expect(container?.className).toContain("custom-class");
    });
});
