import { render, screen } from "@testing-library/react";
jest.mock("../../../utility/ApiService", () => ({
    post: jest.fn()
}));
import PageCard from "./PageCard";
import {AuthProvider} from "../../../context/AuthContext";
import {BrowserRouter} from "react-router-dom";
import {ReactNode} from "react";
import * as AuthContextModule from "../../../context/AuthContext";
import {userEvent} from "@testing-library/user-event";
import apiService from "../../../utility/ApiService";

const renderComponent = (pageCard: ReactNode) => {
    return render(
        <AuthProvider>
            <BrowserRouter>
                {pageCard}
            </BrowserRouter>
        </AuthProvider>
    )
}

describe("PageCard component", () => {
    it("renders children and applies default md breakpoint classes", () => {
        const { container } = renderComponent(<PageCard>Child Content</PageCard>);
        const wrapper = container.firstChild as HTMLElement;

        expect(screen.getByText("Child Content")).toBeInTheDocument();
        expect(wrapper).toHaveClass("bg-slate-300");
        // default size is md so md:rounded-xl should be present
        expect(wrapper).toHaveClass("md:rounded-xl");
        expect(wrapper).toHaveClass("md:shadow-md");
    });

    it("renders the title when provided and uses title styling", () => {
        renderComponent(<PageCard title="My Title">Content</PageCard>);
        const heading = screen.getByText("My Title");
        expect(heading).toBeInTheDocument();
        // ensure heading uses expected class
        expect(heading).toHaveClass("font-header");
        expect(heading).toHaveClass("text-accent");
    });

    it("does not render a title element when title is not provided", () => {
        renderComponent(<PageCard>Only Content</PageCard>);
        expect(screen.queryByRole("heading")).toBeNull();
        // content still present
        expect(screen.getByText("Only Content")).toBeInTheDocument();
    });

    it("applies provided className alongside breakpoint classes", () => {
        const { container } = renderComponent(
            <PageCard className="custom-class">Body</PageCard>
        );
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass("custom-class");
        expect(wrapper).toHaveClass("bg-slate-300");
    });

    it("applies xs breakpoint classes when size is xs", () => {
        const { container } = renderComponent(<PageCard size="xs">XS Content</PageCard>);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass("xs:rounded-xl");
        expect(wrapper).toHaveClass("max-w-100");
    });
    it("does not show the logout button if not logged in", () => {
        renderComponent(<PageCard>Content</PageCard>);
        const logoutButton = screen.queryByRole("button", { name: /logout/i });
        expect(logoutButton).toBeNull();
    });
    it("shows the logout button and calls the logout api if pressed", async () => {
        const mockPost = apiService.post as jest.Mock;
        const spy = jest.spyOn(AuthContextModule, "useAuth").mockReturnValue({
            employee: {
                id: "1", position: "ADMIN",
                name: "",
                email: "",
                hireDate: ""
            },
            accessToken: null,
            login: jest.fn(),
            logout: jest.fn()
        });
        renderComponent(<PageCard>Content</PageCard>);
        const logoutButton = screen.getByText("Logout");
        expect(logoutButton).toBeInTheDocument();
        await userEvent.click(logoutButton);
        expect(mockPost).toHaveBeenCalledWith("/auth/logout");

        spy.mockRestore();
    })
});
