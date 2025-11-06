import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { AccordionGroup } from "./AccordionGroup";
import Accordion from "./Accordion";

describe("AccordionGroup Tests", () => {
    it("should focus next/previous buttons with ArrowDown and ArrowUp", async () => {
        render(
            <AccordionGroup>
                <Accordion id="a1" header="Header 1" />
                <Accordion id="a2" header="Header 2" />
                <Accordion id="a3" header="Header 3" />
            </AccordionGroup>
        );

        const user = userEvent.setup();
        const btn1 = screen.getByTestId("accordion-button-a1");
        const btn2 = screen.getByTestId("accordion-button-a2");
        const btn3 = screen.getByTestId("accordion-button-a3");

        btn1.focus();
        expect(btn1).toHaveFocus();

        // ArrowDown moves focus to next button
        await user.keyboard("{ArrowDown}");
        expect(btn2).toHaveFocus();

        // ArrowDown wraps to first button
        await user.keyboard("{ArrowDown}");
        expect(btn3).toHaveFocus();
        await user.keyboard("{ArrowDown}");
        expect(btn1).toHaveFocus();

        // ArrowUp wraps to last button
        await user.keyboard("{ArrowUp}");
        expect(btn3).toHaveFocus();
    });

    it("should focus first and last buttons with Home and End keys", async () => {
        render(
            <AccordionGroup>
                <Accordion id="a1" header="Header 1" />
                <Accordion id="a2" header="Header 2" />
                <Accordion id="a3" header="Header 3" />
            </AccordionGroup>
        );

        const user = userEvent.setup();
        const btn1 = screen.getByTestId("accordion-button-a1");
        const btn3 = screen.getByTestId("accordion-button-a3");

        btn3.focus();
        expect(btn3).toHaveFocus();

        await user.keyboard("{Home}");
        expect(btn1).toHaveFocus();

        await user.keyboard("{End}");
        expect(btn3).toHaveFocus();
    });

    it("should allow only one panel open in singleOpen mode", async () => {
        render(
            <AccordionGroup singleOpen>
                <Accordion id="a1" header="Header 1">Body 1</Accordion>
                <Accordion id="a2" header="Header 2">Body 2</Accordion>
            </AccordionGroup>
        );

        const user = userEvent.setup();
        const btn1 = screen.getByTestId("accordion-button-a1");
        const btn2 = screen.getByTestId("accordion-button-a2");
        const body1 = screen.getByTestId("accordion-panel-a1");
        const body2 = screen.getByTestId("accordion-panel-a2");

        // Open first
        await user.click(btn1);
        expect(body1).toHaveClass("max-h-200");
        expect(body2).toHaveClass("max-h-0");

        // Open second, first closes
        await user.click(btn2);
        expect(body2).toHaveClass("max-h-200");
        expect(body1).toHaveClass("max-h-0");
    });
});
