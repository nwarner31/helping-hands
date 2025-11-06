import {render, screen} from "@testing-library/react";

import Button from "./Button";
import {userEvent} from "@testing-library/user-event";

describe("Button tests", () => {
    it("should have text content of children", () => {
        render(<Button >I am a button</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveTextContent("I am a button");
    });

    it("should have css class for variant", () => {
        render(<Button variant="accent">I am a button</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-accent');
    });

    it("should call function when pressed", async () => {
        const clickFunction = jest.fn();
        render(<Button onClick={clickFunction} />);
        const button = screen.getByRole('button');
        await userEvent.click(button);
        expect(clickFunction).toHaveBeenCalledTimes(1);

    })
})