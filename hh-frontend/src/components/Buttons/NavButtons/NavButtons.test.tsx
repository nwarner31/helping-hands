import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import NavButtons from "./NavButtons";

jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        useNavigate: jest.fn(),
    };
});

import { useNavigate } from "react-router-dom";

const mockedUseNavigate = useNavigate as jest.Mock;

describe("NavButtons", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseNavigate.mockReturnValue(jest.fn());
    });

    it("renders the navigation landmark, back button, and dashboard link by default", () => {
        render(
            <MemoryRouter>
                <NavButtons />
            </MemoryRouter>
        );

        expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Go Back" })).toBeInTheDocument();

        const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
        expect(dashboardLink).toBeInTheDocument();
        expect(dashboardLink).toHaveAttribute("href", "/dashboard");
    });

    it("hides the back button when showBackButton is false", () => {
        render(
            <MemoryRouter>
                <NavButtons showBackButton={false} />
            </MemoryRouter>
        );

        expect(screen.queryByRole("button", { name: "Go Back" })).not.toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");
    });

    it("navigates back when the Go Back button is clicked", async () => {
        const user = userEvent.setup();
        const navigate = jest.fn();
        mockedUseNavigate.mockReturnValue(navigate);

        render(
            <MemoryRouter>
                <NavButtons />
            </MemoryRouter>
        );

        await user.click(screen.getByRole("button", { name: "Go Back" }));

        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(-1);
    });

    it("merges a custom className onto the nav element", () => {
        render(
            <MemoryRouter>
                <NavButtons className="custom-nav-class" />
            </MemoryRouter>
        );

        expect(screen.getByRole("navigation", { name: "Primary navigation" })).toHaveClass("mb-4", "custom-nav-class");
    });
});

