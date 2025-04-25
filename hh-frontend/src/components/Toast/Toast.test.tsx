import {render, screen} from "@testing-library/react";
import Toast from "./Toast";

describe("Toast tests", () => {
    it("renders with default top-right positioand info typen", () => {
        render(<Toast >Hello World</Toast>);
        const toast = screen.getByText("Hello World");
        expect(toast).toBeInTheDocument();

        expect(toast.parentElement!.parentElement).toHaveClass("hor-right");
        expect(toast.parentElement!.parentElement).toHaveClass("vert-top");
        expect(toast.parentElement).toHaveClass("toast-info");
    });
    it("renders in bottom-center position when specified", () => {
        render(<Toast type="info" vertical="bottom" horizontal="center">Update Complete</Toast>);
        const toast = screen.getByText("Update Complete");
        expect(toast.parentElement!.parentElement).toHaveClass("hor-center");
        expect(toast.parentElement!.parentElement).toHaveClass("vert-bottom");
    });
    it("displays the header when provided", () => {
        render(<Toast type="error" header="Error">Something went wrong</Toast>);
        expect(screen.getByText("Error")).toBeInTheDocument();
        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });
    it("applies correct style based on type", () => {
        render(<Toast type="error">Failure</Toast>);
        const toast = screen.getByText("Failure");
        expect(toast.parentElement).toHaveClass("toast-error"); // depends on your implementation
    });
    it("can render JSX children", () => {
        render(<Toast type="info"><strong>Bold text</strong></Toast>);
        expect(screen.getByText("Bold text")).toBeInTheDocument();
    });

});