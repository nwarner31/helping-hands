import {render, screen} from "@testing-library/react";
import {userEvent} from "@testing-library/user-event";

import DateInput from "./DateInput";

describe("Date Input tests", () => {
    it("should have a label that contains the provided text", () => {
        render(<DateInput label='My Date' />);
        const label = screen.getByText("My Date");
        expect(label).toBeInTheDocument();
    });
    it("should have a type of date", () => {
        const {container} = render(<DateInput label="My Date" />);
        const dateInput = container.querySelector(".input");
        expect(dateInput).toHaveAttribute("type", "date");
    });
    it("should have the container class if it is provided", () => {
        const {container} = render(<DateInput label="My Date" containerClass="my-class" />);
        const inputContainer = container.querySelector(".inputContainer");
        expect(inputContainer).toHaveClass("my-class");
    });
    it("should call the on change function when a value is entered", async () => {
        const changeValue = jest.fn();
        render(<DateInput label="My Date" name="my-date" onChange={changeValue} />);
        const date = "2025-01-01"
        const dateInput = screen.getByLabelText("My Date");
        await userEvent.type(dateInput, date);
        expect(changeValue).toHaveBeenCalled();
    })
    it("should update the value when one is entered", async () => {
        let dateValue = ''
        const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {dateValue = e.target.value; }
        render(<DateInput label="My Date" name="my-date" onChange={changeValue} />);
        const date = "2025-01-01"
        const dateInput = screen.getByLabelText("My Date");
        await userEvent.type(dateInput, date);
        expect(dateValue).toBe(date);
    });
    it("should have an error text if it is provided", () => {
        render(<DateInput label="My Date" name="my-date" error="Date error" />);
        const error = screen.getByText("Date error");
        expect(error).toBeInTheDocument();
    });
})