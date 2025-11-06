import {render, screen} from "@testing-library/react";

import Accordion from "./Accordion";
import {userEvent} from "@testing-library/user-event";

describe("Accordion Tests", () => {
    it("should have the text from the header prop in a button", () => {
        render(<Accordion id="hw" header="hello world" />);
        const headerButton = screen.getByTestId("accordion-button-hw");
        expect(headerButton.tagName).toBe("BUTTON");
        expect(headerButton).toHaveTextContent("hello world");
    });

    it("should have class for variant", () => {
        render(<Accordion id="hw" header="hello world" variant="secondary" />);
        const accordion = screen.getByTestId("accordion-hw");
        expect(accordion).toHaveClass("bg-secondary");
    })

    it("should have the body initially closed", () => {
        render(<Accordion id="hw" header="hello world">I am the body</Accordion>)
        const body = screen.getByTestId("accordion-panel-hw");
        expect(body).toBeInTheDocument();
        expect(body).toHaveClass("max-h-0");
    });
    it("should have a body with open class after button is clicked", async () => {
        render(<Accordion id="hw" header="hello world">I am the body</Accordion>);
        const headerButton = screen.getByTestId("accordion-button-hw");
        const body = screen.getByTestId("accordion-panel-hw");
        expect(body).toBeInTheDocument();
        expect(body).toHaveClass("max-h-0");

        const user = userEvent.setup();
        await user.click(headerButton);
        expect(body).toHaveClass("max-h-200");
    });
    describe("Accordion keyboard interaction", () => {
        it("should open the panel when Enter is pressed on the button", async () => {
            render(<Accordion id="hw" header="hello world">I am the body</Accordion>);
            const headerButton = screen.getByTestId("accordion-button-hw");
            const body = screen.getByTestId("accordion-panel-hw");

            expect(body).toHaveClass("max-h-0");

            const user = userEvent.setup();
            await user.keyboard("{Enter}"); // focus should already be on button in most tests
            headerButton.focus(); // ensure the button has focus
            await user.keyboard("{Enter}");

            expect(body).toHaveClass("max-h-200");
        });

        it("should open the panel when Space is pressed on the button", async () => {
            render(<Accordion id="hw" header="hello world">I am the body</Accordion>);
            const headerButton = screen.getByTestId("accordion-button-hw");
            const body = screen.getByTestId("accordion-panel-hw");

            expect(body).toHaveClass("max-h-0");

            const user = userEvent.setup();
            headerButton.focus();
            await user.keyboard(" ");

            expect(body).toHaveClass("max-h-200");
        });
    });
});