import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LinkButton from "./LinkButton";

describe("LinkButton", () => {
    it("renders the text from children", () => {
        render(
            <MemoryRouter>
                <LinkButton to="/test">Click Me</LinkButton>
            </MemoryRouter>
        );

        const link = screen.getByText("Click Me");
        expect(link).toBeInTheDocument();
        expect(link.tagName).toBe("A");
    });

    it("applies the correct variant class", () => {
        render(
            <MemoryRouter>
                <LinkButton to="/test" variant="secondary">Click Me</LinkButton>
            </MemoryRouter>
        );

        const link = screen.getByText("Click Me");
        expect(link).toHaveClass("bg-secondary");
    });

    it("uses the provided id and data-testid", () => {
        render(
            <MemoryRouter>
                <LinkButton to="/test" id="my-link">Click Me</LinkButton>
            </MemoryRouter>
        );

        const link = screen.getByTestId("link-button-my-link");
        expect(link).toBeInTheDocument();
    });

    it("navigates to the correct path", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/"]}>
                <LinkButton to="/next">Next Page</LinkButton>
            </MemoryRouter>
        );

        const link = screen.getByText("Next Page");
        expect(link.getAttribute("href")).toBe("/next");

        // Optional: test click navigation
        await user.click(link);
        expect(link).toHaveAttribute("href", "/next");
    });

    it("shows focus outline when focused", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <LinkButton to="/test">Focus Me</LinkButton>
            </MemoryRouter>
        );

        const link = screen.getByText("Focus Me");
        await user.tab();
        expect(link).toHaveFocus();
    });
});
