import {render, screen} from "@testing-library/react";
import {userEvent} from "@testing-library/user-event";

import StaticLabelInput from "./StaticLabelInput";

describe("Date Input tests", () => {
    it("should have a label that contains the provided text", () => {
        render(<StaticLabelInput label='My Date' type="date" />);
        const label = screen.getByText("My Date");
        expect(label).toBeInTheDocument();
    });
    it("should have a type of date", () => {
        const {container} = render(<StaticLabelInput label="My Date" type="date" />);
        const dateInput = container.querySelector(".input");
        expect(dateInput).toHaveAttribute("type", "date");
    });
    it("should have the container class if it is provided", () => {
        const {container} = render(<StaticLabelInput label="My Date" containerClass="my-class" type="date" />);
        const inputContainer = container.querySelector(".inputContainer");
        expect(inputContainer).toHaveClass("my-class");
    });
    it("should call the on change function when a value is entered", async () => {
        const changeValue = jest.fn();
        render(<StaticLabelInput label="My Date" name="my-date" type="date" onChange={changeValue} />);
        const date = "2025-01-01"
        const dateInput = screen.getByLabelText("My Date");
        await userEvent.type(dateInput, date);
        expect(changeValue).toHaveBeenCalled();
    })
    it("should update the value when one is entered", async () => {
        let dateValue = ''
        const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {dateValue = e.target.value; }
        render(<StaticLabelInput label="My Date" name="my-date" type="date" onChange={changeValue} />);
        const date = "2025-01-01"
        const dateInput = screen.getByLabelText("My Date");
        await userEvent.type(dateInput, date);
        expect(dateValue).toBe(date);
    });
    it("should have an error text if it is provided", () => {
        render(<StaticLabelInput label="My Date" name="my-date" error="Date error" type="date" />);
        const error = screen.getByText("Date error");
        expect(error).toBeInTheDocument();
    });
})