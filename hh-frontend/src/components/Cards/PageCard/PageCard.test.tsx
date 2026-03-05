import { render, screen } from "@testing-library/react";
import PageCard from "./PageCard";

describe("PageCard component", () => {
    it("renders children and applies default md breakpoint classes", () => {
        const { container } = render(<PageCard>Child Content</PageCard>);
        const wrapper = container.firstChild as HTMLElement;

        expect(screen.getByText("Child Content")).toBeInTheDocument();
        expect(wrapper).toHaveClass("bg-slate-300");
        // default size is md so md:rounded-xl should be present
        expect(wrapper).toHaveClass("md:rounded-xl");
        expect(wrapper).toHaveClass("md:shadow-md");
    });

    it("renders the title when provided and uses title styling", () => {
        render(<PageCard title="My Title">Content</PageCard>);
        const heading = screen.getByText("My Title");
        expect(heading).toBeInTheDocument();
        // ensure heading uses expected class
        expect(heading).toHaveClass("font-header");
        expect(heading).toHaveClass("text-accent");
    });

    it("does not render a title element when title is not provided", () => {
        render(<PageCard>Only Content</PageCard>);
        expect(screen.queryByRole("heading")).toBeNull();
        // content still present
        expect(screen.getByText("Only Content")).toBeInTheDocument();
    });

    it("applies provided className alongside breakpoint classes", () => {
        const { container } = render(
            <PageCard className="custom-class">Body</PageCard>
        );
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass("custom-class");
        expect(wrapper).toHaveClass("bg-slate-300");
    });

    it("applies xs breakpoint classes when size is xs", () => {
        const { container } = render(<PageCard size="xs">XS Content</PageCard>);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass("xs:rounded-xl");
        expect(wrapper).toHaveClass("max-w-100");
    });
});
