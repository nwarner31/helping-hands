import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CheckBox from "./CheckBox";

describe("CheckBox tests", () => {
    it("renders a checkbox with the provided label, name, and id", () => {
        render(
            <CheckBox
                name="femaleEmployeeOnly"
                label="Female Only House"
                isChecked={false}
                onChange={jest.fn()}
            />
        );

        const checkbox = screen.getByRole("checkbox", { name: "Female Only House" });
        const label = screen.getByText("Female Only House");

        expect(checkbox).toHaveAttribute("name", "femaleEmployeeOnly");
        expect(checkbox).toHaveAttribute("id", "input-femaleEmployeeOnly");
        expect(checkbox).toHaveClass("accent-accent");
        expect(label).toHaveAttribute("for", "input-femaleEmployeeOnly");
    });

    it("reflects controlled checked state", () => {
        const { rerender } = render(
            <CheckBox
                name="newsletter"
                label="Subscribe"
                isChecked={false}
                onChange={jest.fn()}
            />
        );

        expect(screen.getByRole("checkbox", { name: "Subscribe" })).not.toBeChecked();

        rerender(
            <CheckBox
                name="newsletter"
                label="Subscribe"
                isChecked={true}
                onChange={jest.fn()}
            />
        );

        expect(screen.getByRole("checkbox", { name: "Subscribe" })).toBeChecked();
    });

    it("calls onChange when the checkbox is clicked", async () => {
        const onChange = jest.fn();

        render(
            <CheckBox
                name="agreeToTerms"
                label="Agree to terms"
                isChecked={false}
                onChange={onChange}
            />
        );

        await userEvent.click(screen.getByRole("checkbox", { name: "Agree to terms" }));

        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("calls onChange when its label is clicked", async () => {
        const onChange = jest.fn();

        render(
            <CheckBox
                name="receiveSms"
                label="Receive SMS alerts"
                isChecked={false}
                onChange={onChange}
            />
        );

        await userEvent.click(screen.getByText("Receive SMS alerts"));

        expect(onChange).toHaveBeenCalledTimes(1);
    });
});
