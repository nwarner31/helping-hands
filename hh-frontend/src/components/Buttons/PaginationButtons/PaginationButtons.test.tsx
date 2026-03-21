import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PaginationButtons from "./PaginationButtons";

describe("PaginationButtons", () => {
    it("renders the current page in the input and the total page count", () => {
        render(<PaginationButtons page={3} numPages={8} onPageChange={jest.fn()} />);

        expect(screen.getByRole("spinbutton")).toHaveValue(3);
        expect(screen.getByText("/ 8")).toBeInTheDocument();
    });

    it("disables the previous button on the first page and the next button on the last page", () => {
        const { rerender } = render(
            <PaginationButtons page={1} numPages={4} onPageChange={jest.fn()} />
        );

        expect(screen.getByRole("button", { name: "<" })).toBeDisabled();
        expect(screen.getByRole("button", { name: ">" })).toBeEnabled();

        rerender(<PaginationButtons page={4} numPages={4} onPageChange={jest.fn()} />);

        expect(screen.getByRole("button", { name: ">" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "<" })).toBeEnabled();
    });

    it("calls onPageChange with the previous or next page when the buttons are clicked", async () => {
        const user = userEvent.setup();
        const onPageChange = jest.fn();

        render(<PaginationButtons page={3} numPages={5} onPageChange={onPageChange} />);

        await user.click(screen.getByRole("button", { name: "<" }));
        await user.click(screen.getByRole("button", { name: ">" }));

        expect(onPageChange).toHaveBeenNthCalledWith(1, 2);
        expect(onPageChange).toHaveBeenNthCalledWith(2, 4);
    });

    it("does not call onPageChange when a disabled navigation button is clicked", async () => {
        const user = userEvent.setup();
        const onPageChange = jest.fn();

        const { rerender } = render(
            <PaginationButtons page={1} numPages={3} onPageChange={onPageChange} />
        );

        await user.click(screen.getByRole("button", { name: "<" }));

        rerender(<PaginationButtons page={3} numPages={3} onPageChange={onPageChange} />);

        await user.click(screen.getByRole("button", { name: ">" }));

        expect(onPageChange).not.toHaveBeenCalled();
    });

    it("submits a valid page number entered in the input", async () => {
        const user = userEvent.setup();
        const onPageChange = jest.fn();

        render(<PaginationButtons page={1} numPages={10} onPageChange={onPageChange} />);

        const input = screen.getByRole("spinbutton");
        await user.clear(input);
        await user.type(input, "7");

        fireEvent.submit(input.closest("form") as HTMLFormElement);

        expect(onPageChange).toHaveBeenCalledTimes(1);
        expect(onPageChange).toHaveBeenCalledWith(7);
    });

    it("does not submit invalid page numbers", async () => {
        const user = userEvent.setup();
        const onPageChange = jest.fn();

        render(<PaginationButtons page={2} numPages={5} onPageChange={onPageChange} />);

        const input = screen.getByRole("spinbutton");
        const form = input.closest("form") as HTMLFormElement;

        await user.clear(input);
        await user.type(input, "0");
        fireEvent.submit(form);

        await user.clear(input);
        await user.type(input, "6");
        fireEvent.submit(form);

        await user.clear(input);
        await user.type(input, "-1");
        fireEvent.submit(form);

        await user.clear(input);
        fireEvent.submit(form);

        expect(onPageChange).not.toHaveBeenCalled();
    });

    it("syncs the input value when the page prop changes", async () => {
        const user = userEvent.setup();
        const { rerender } = render(
            <PaginationButtons page={2} numPages={6} onPageChange={jest.fn()} />
        );

        const input = screen.getByRole("spinbutton");
        await user.clear(input);
        await user.type(input, "5");
        expect(input).toHaveValue(5);

        rerender(<PaginationButtons page={4} numPages={6} onPageChange={jest.fn()} />);

        expect(screen.getByRole("spinbutton")).toHaveValue(4);
    });
});

