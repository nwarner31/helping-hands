import {act, render, screen} from '@testing-library/react';
import {userEvent} from "@testing-library/user-event";

import Input from "./Input";
import React from "react";
describe("Input tests", () => {
    it("should have a label that contains the provided text", () => {
        render(<Input name="input" label="My Input" />);
        const label = screen.getByText("My Input");
        expect(label.tagName).toBe("LABEL");
    });
    it("should not have the active class with no text and no focus", () => {
        render(<Input name="input" label="My Input" />);
        const input = screen.getByTestId("label-input");
        expect(input).toHaveClass("translate-y-0");
    });
    it("should have the active class if it has focus", async () => {
        render(<Input name="input" label="My Input" />);
        const input = screen.getByTestId("input-input")
        const inputLabel = screen.getByTestId("label-input");
        await userEvent.click(input);
        expect(inputLabel).toHaveClass("-translate-y-5");
    });
    it("should have the active class if it has text", async () => {
        render(<Input name="input" label="My Input" />);
        const input = screen.getByTestId("input-input");
        const inputLabel = screen.getByTestId("label-input");
        await userEvent.type(input, "hello world");
        act(() => input.blur());
        expect(inputLabel).toHaveClass("-translate-y-5");
    });
    it("should not have an error text if one is not provided", () => {
        const {container} = render(<Input name="input" label="My Input" />);
        const error = container.querySelector(".errorText");
        expect(error).not.toBeInTheDocument();
    });
    it("should have an error text if it is provided and it contains the provided text", () => {
        render(<Input name="input" label="My Input" error="Test error" />);
        const error = screen.getByTestId("error-input");
        expect(error).toBeInTheDocument();
        expect(error).toHaveTextContent("Test error");
    });
    it("should call the onChange function for each character entered", async () => {
        const changeFunction = jest.fn();
        render(<Input name="input" label="My Input" onChange={changeFunction} />);
        const input = screen.getByRole("textbox");
        await userEvent.type(input, "i am the text");
        expect(changeFunction).toBeCalledTimes(13);
    });
    it("should have a value equal to the text entered", async() => {
        let myValue;
        const changeFunction = (e: React.ChangeEvent<HTMLInputElement>) => {myValue=e.target.value}
        const text = "i am the text";
        render(<Input name="input" label="My Input" value={myValue} onChange={changeFunction} />);
        const input = screen.getByRole("textbox");
        await userEvent.type(input, text);
        expect(myValue).toBe(text);
    })
});