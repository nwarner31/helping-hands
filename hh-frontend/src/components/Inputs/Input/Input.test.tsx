import {render, screen} from '@testing-library/react';
import {userEvent} from "@testing-library/user-event";

import Input from "./Input";
import React from "react";
describe("Input tests", () => {
    it("should have a label that contains the provided text", () => {
        render(<Input label="My Input" />);
        const label = screen.getByText("My Input");
        expect(label.tagName).toBe("LABEL");
    });
    it("should not have the active class with no text and no focus", () => {
        const {container} = render(<Input label="My Input" />);
        const input = container.querySelector(".inputContainer");
        expect(input).not.toHaveClass("active");
    });
    it("should have the active class if it has focus", async () => {
        const {container} = render(<Input label="My Input" />);
        const inputText = screen.getByRole("textbox");
        const input = container.querySelector(".inputContainer");
        await userEvent.click(inputText);
        expect(input).toHaveClass("active");
    });
    it("should have the active class if it has text", async () => {
        const {container} = render(<Input label="My Input" />);
        const inputText = screen.getByRole("textbox");
        const input = container.querySelector(".inputContainer");
        await userEvent.type(inputText, "hello world");
        expect(input).toHaveClass("active");
    });
    it("should not have an error text if one is not provided", () => {
        const {container} = render(<Input label="My Input" />);
        const error = container.querySelector(".errorText");
        expect(error).not.toBeInTheDocument();
    });
    it("should have an error text if it is provided and it contains the provided text", () => {
        const {container} = render(<Input label="My Input" error="Test error" />);
        const error = container.querySelector(".errorText");
        expect(error).toBeInTheDocument();
        expect(error).toHaveTextContent("Test error");
    });
    it("should call the onChange function for each character entered", async () => {
        const changeFunction = jest.fn();
        render(<Input label="My Input" onChange={changeFunction} />);
        const input = screen.getByRole("textbox");
        await userEvent.type(input, "i am the text");
        expect(changeFunction).toBeCalledTimes(13);
    });
    it("should have a value equal to the text entered", async() => {
        let myValue;
        const changeFunction = (e: React.ChangeEvent<HTMLInputElement>) => {myValue=e.target.value}
        const text = "i am the text";
        render(<Input label="My Input" value={myValue} onChange={changeFunction} />);
        const input = screen.getByRole("textbox");
        await userEvent.type(input, text);
        expect(myValue).toBe(text);
    })
});