import RadioInput from "./RadioInput";
import {render, screen} from "@testing-library/react";
import {userEvent} from "@testing-library/user-event";


describe("RadioInput tests", () => {
    it("renders the radio input with correct props", () => {
        render(
            <RadioInput
                label="Option A"
                name="testRadio"
                value="A"
                onChange={() => {}}
                isChecked={true}
            />
        );
        const radio = screen.getByRole("radio");
        expect(radio).toBeInTheDocument();
        expect(radio).toHaveAttribute("name", "testRadio");
        expect(radio).toHaveAttribute("value", "A");
        expect(radio).toBeChecked();
        expect(screen.getByText("Option A")).toBeInTheDocument();
    });

    it("calls onChange when clicked", async () => {
        const handleChange = jest.fn(); // or jest.fn()
        render(
            <RadioInput
                label="Option B"
                name="testRadio"
                value="B"
                onChange={handleChange}
                isChecked={false}
            />
        );
        const radio = screen.getByRole("radio");
        await userEvent.click(radio);
        expect(handleChange).toHaveBeenCalled();
    });

    it("applies the correct variant style", () => {
        render(
            <RadioInput
                label="Option C"
                name="testRadio"
                value="C"
                onChange={() => {}}
                isChecked={false}
                variant="accent"
            />
        );
        const checkmark = screen.getByText("Option C").querySelector(".checkmark-accent");
        expect(checkmark).toBeInTheDocument();
    });

})