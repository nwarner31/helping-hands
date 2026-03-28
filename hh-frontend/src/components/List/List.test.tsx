import { useContext } from "react";
import { render, screen } from "@testing-library/react";
import List, { ListContext } from "./List";

const Consumer = () => {
    const ctx = useContext(ListContext);
    return <div data-testid="ctx">{`${ctx?.dividerColor || ""}-${ctx?.dividerInset || ""}`}</div>;
};

describe("List component", () => {
    it("renders children inside a ul", () => {
        render(
            <List>
                <li>First</li>
            </List>
        );

        expect(screen.getByText("First")).toBeInTheDocument();
        expect(screen.getByRole("list")).toBeInTheDocument();
    });

    it("provides default dividerColor and dividerInset via context", () => {
        render(
            <List>
                <Consumer />
            </List>
        );

        expect(screen.getByTestId("ctx")).toHaveTextContent("after:bg-primary-500-after:left-8 after:right-8");
    });

    it("maps borderVariant='accent' and inset='small' to correct context values", () => {
        render(
            <List borderVariant="accent" inset="small">
                <Consumer />
            </List>
        );

        expect(screen.getByTestId("ctx")).toHaveTextContent("after:bg-accent-after:left-4 after:right-4");
    });

    it("renders multiple children as list items", () => {
        render(
            <List>
                <li>One</li>
                <li>Two</li>
            </List>
        );

        expect(screen.getAllByRole("listitem")).toHaveLength(2);
    });
});
