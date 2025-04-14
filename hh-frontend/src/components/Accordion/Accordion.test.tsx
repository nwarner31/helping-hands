import {render, screen} from "@testing-library/react";

import Accordion from "./Accordion";
import {userEvent} from "@testing-library/user-event";

describe("Accordion Tests", () => {
    it("should have the text from the header prop in a button", () => {
        render(<Accordion header="hello world" />);
        const headerButton = screen.getByRole("button", {name: "hello world"});
        expect(headerButton.tagName).toBe("BUTTON");
        expect(headerButton).toHaveTextContent("hello world");
    });

    it("should have class for variant", () => {
        const {container} = render(<Accordion header="hello world" variant="secondary" />);
        const accordion = container.querySelector('.secondary');
        expect(accordion).toBeInTheDocument();
    })

    it("should have a body without open class", () => {
        render(<Accordion header="hello world">I am the body</Accordion>)
        const body = screen.getByText("I am the body").parentElement;
        expect(body).toBeInTheDocument();
        expect(body).not.toHaveClass("bodyOpen");
    });
    it("should have a body with open class after button is clicked", async () => {
        render(<Accordion header="hello world">I am the body</Accordion>);
        const headerButton = screen.getByRole("button", {name: "hello world"});
        const body = screen.getByText("I am the body").parentElement;
        expect(body).toBeInTheDocument();
        expect(body).not.toHaveClass("bodyOpen")

        const user = userEvent.setup();
        await user.click(headerButton);
        expect(body).toHaveClass("bodyOpen");
    })
});