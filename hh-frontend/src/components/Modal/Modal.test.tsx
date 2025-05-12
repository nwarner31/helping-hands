import { render, screen } from "@testing-library/react";
import Modal from "./Modal";
import {userEvent} from "@testing-library/user-event";

describe("Modal", () => {
    const mockOnClose = jest.fn();

    beforeEach(() => {
        mockOnClose.mockClear();
    });

    test("renders children inside modal", () => {
        render(
            <Modal onClose={mockOnClose}>
                <div data-testid="modal-content">Hello Modal</div>
            </Modal>
        );

        expect(screen.getByTestId("modal-content")).toBeInTheDocument();
        expect(screen.getByText("Hello Modal")).toBeInTheDocument();
    });

    test("calls onClose when overlay is clicked", async () => {
        render(
            <Modal onClose={mockOnClose}>
                <div>Modal Content</div>
            </Modal>
        );


        const overlay = screen.getByText("Modal Content").parentElement!.parentElement!;
        await userEvent.click(overlay);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("does not call onClose when clicking inside modal content", async () => {
        render(
            <Modal onClose={mockOnClose}>
                <div data-testid="inside-content">Click me</div>
            </Modal>
        );

        const inside = screen.getByTestId("inside-content");
        await userEvent.click(inside);

        expect(mockOnClose).not.toHaveBeenCalled();
    });
});
