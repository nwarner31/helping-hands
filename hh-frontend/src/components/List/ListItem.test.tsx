import { render, screen } from "@testing-library/react";
import List from "./List";
import ListItem from "./ListItem";

describe("ListItem component", () => {
    it("renders child content inside a list item element", () => {
        render(<ListItem id="li1">Item Content</ListItem>);
        const li = screen.getByRole("listitem");
        expect(screen.getByText("Item Content")).toBeInTheDocument();
        expect(li).toHaveTextContent("Item Content");
    });

    it("does not include divider classes when rendered outside of List context", () => {
        render(<ListItem id="li2">No Context</ListItem>);
        const li = screen.getByRole("listitem");
        expect(li).not.toHaveClass("after:bg-primary");
        expect(li).not.toHaveClass("after:left-8");
        expect(li).toHaveClass("relative");
    });

    it("applies default dividerColor and dividerInset from List context", () => {
        render(
            <List>
                <ListItem id="li3">With List</ListItem>
            </List>
        );
        const li = screen.getByRole("listitem");
        expect(li).toHaveClass("after:bg-primary-500");
        expect(li).toHaveClass("after:left-8");
        expect(li).toHaveClass("after:right-8");
        expect(li).toHaveClass("after:absolute");
    });

    it("respects borderVariant='accent' and inset='small' provided by List", () => {
        render(
            <List borderVariant="accent" inset="small">
                <ListItem id="li4">Variant List</ListItem>
            </List>
        );
        const li = screen.getByRole("listitem");
        expect(li).toHaveClass("after:bg-accent");
        expect(li).toHaveClass("after:left-4");
        expect(li).toHaveClass("after:right-4");
    });
});
