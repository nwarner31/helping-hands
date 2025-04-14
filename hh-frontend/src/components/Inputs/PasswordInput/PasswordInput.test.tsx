import {render, screen} from "@testing-library/react";
import {userEvent} from "@testing-library/user-event";

import PasswordInput from "./PasswordInput";

describe("Password Input tests", () => {
    it("should have a label that contains the provided text", () => {
        render(<PasswordInput label="My Password" name="" value="" onChange={() => {}} />);
        const label = screen.getByText("My Password");
        expect(label.tagName).toBe("LABEL");
    });
    it("should not have the active class with no text and no focus", () => {
        const {container} = render(<PasswordInput label="My Password"  name="" value="" onChange={() => {}} />);
        const input = container.querySelector(".inputWrapper");
        expect(input).not.toHaveClass("active");
    });
    it("should have the active class if it has focus", async () => {
        const {container} = render(<PasswordInput label="My Password"  name="password" value="" onChange={() => {}} />);
        const inputText = screen.getByLabelText("My Password");
        const input = container.querySelector(".inputWrapper");
        await userEvent.click(inputText);
        expect(input).toHaveClass("active");
    });
    it("should have the active class if it has text", async () => {
        const {container} = render(<PasswordInput label="My Password" name="password" value="" onChange={() => {}} />);
        const inputText = screen.getByLabelText("My Password");
        const input = container.querySelector(".inputWrapper");
        await userEvent.type(inputText, "hello world");
        expect(input).toHaveClass("active");
    });
    it("should not have an error text if one is not provided", () => {
        const {container} = render(<PasswordInput label="My Input" name="" value="" onChange={() => {}} />);
        const error = container.querySelector(".errorText");
        expect(error).not.toBeInTheDocument();
    });
    it("should have an error text if it is provided and it contains the provided text", () => {
        const {container} = render(<PasswordInput label="My Input" error="Test error" name="" value="" onChange={() => {}} />);
        const error = container.querySelector(".errorText");
        expect(error).toBeInTheDocument();
        expect(error).toHaveTextContent("Test error");
    });
    it("should call the onChange function for each character entered", async () => {
        const changeFunction = jest.fn();
        render(<PasswordInput label="My Password" onChange={changeFunction}  name="password" value="" />);
        const input = screen.getByLabelText("My Password")
        await userEvent.type(input, "i am the text");
        expect(changeFunction).toBeCalledTimes(13);
    });
    it("should have a value equal to the text entered", async() => {
        let myValue = "";
        // This is to set the variable properly because it is a regular variable and not state
        const changeFunction = (e: React.ChangeEvent<HTMLInputElement>) => {myValue+=e.target.value}
        const text = "i am the text";
        render(<PasswordInput label="My Password" value={myValue} onChange={changeFunction}  name="password" />);
        const input = screen.getByLabelText("My Password");
        await userEvent.type(input, text);
        expect(myValue).toBe(text);
    });
    it("should have an initial type of password", () => {
        render(<PasswordInput label="My Password"  name="" value="" onChange={() => {}} />);
        const input = screen.getByLabelText("My Password");
        expect(input).toHaveAttribute("type", "password");
    });
    it("should have a type of text after the show password button is pressed", async () => {
        render(<PasswordInput label="My Password"  name="" value="" onChange={() => {}} />);
        const input = screen.getByLabelText("My Password");
        const showPasswordButton = screen.getByRole("button");
        await userEvent.click(showPasswordButton);
        expect(input).toHaveAttribute("type", "text");
    })
});