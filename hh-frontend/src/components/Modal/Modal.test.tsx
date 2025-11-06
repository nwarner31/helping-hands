import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "./Modal";
import {useState} from "react";

describe("Modal", () => {
    const mockOnClose = jest.fn();

    beforeEach(() => {
        mockOnClose.mockClear();
    });

    test("renders title, description, and children", () => {
        render(
            <Modal
                id="test"
                title="My Modal"
                description="This is a test description"
                onClose={mockOnClose}
            >
                <div data-testid="modal-content">Hello Modal</div>
            </Modal>
        );

        expect(screen.getByTestId("modal-test")).toBeInTheDocument();
        expect(screen.getByTestId("modal-test-title")).toHaveTextContent("My Modal");
        expect(screen.getByTestId("modal-test-description")).toHaveTextContent(
            "This is a test description"
        );
        expect(screen.getByTestId("modal-content")).toHaveTextContent("Hello Modal");
    });

    test("calls onClose when overlay is clicked", async () => {
        const user = userEvent.setup();
        render(
            <Modal id="test" onClose={mockOnClose}>
                <div>Modal Content</div>
            </Modal>
        );

        const backdrop = screen.getByTestId("modal-test-backdrop");
        await user.click(backdrop);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test("does not call onClose when clicking inside modal content", async () => {
        const user = userEvent.setup();
        render(
            <Modal id="test" onClose={mockOnClose}>
                <div data-testid="inside-content">Click me</div>
            </Modal>
        );

        const inside = screen.getByTestId("inside-content");
        await user.click(inside);

        expect(mockOnClose).not.toHaveBeenCalled();
    });

    test("calls onClose when close button is clicked", async () => {
        const user = userEvent.setup();
        render(
            <Modal id="test" onClose={mockOnClose}>
                <div>Modal Content</div>
            </Modal>
        );

        const closeBtn = screen.getByTestId("modal-test-close");
        await user.click(closeBtn);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test("calls onClose when Escape key is pressed", async () => {
        const user = userEvent.setup();
        render(
            <Modal id="test" onClose={mockOnClose}>
                <div>Modal Content</div>
            </Modal>
        );

        await user.keyboard("{Escape}");
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test("focus is trapped inside modal", async () => {
        const user = userEvent.setup();
        render(
            <Modal id="test" onClose={mockOnClose} showCloseButton={false}>
                <button data-testid="first-btn">First</button>
                <button data-testid="second-btn">Second</button>
            </Modal>
        );

        const firstBtn = screen.getByTestId("first-btn");
        const secondBtn = screen.getByTestId("second-btn");

        // First button should be focused automatically
        expect(firstBtn).toHaveFocus();

        // Tab → moves to second button
        await user.tab();
        expect(secondBtn).toHaveFocus();

        // Tab → loops back to first
        await user.tab();
        expect(firstBtn).toHaveFocus();

        // Shift+Tab → goes back to second
        await user.tab({ shift: true });
        expect(secondBtn).toHaveFocus();
    });

    test("restores focus to last focused element when closed", async () => {
        const user = userEvent.setup();
        render(<ModalHarness />);

        const openBtn = screen.getByTestId("open-btn");
        openBtn.focus();
        expect(openBtn).toHaveFocus();
        await user.click(openBtn);

        const closeBtn = screen.getByTestId("modal-test-close");
        await user.click(closeBtn);

        // after modal unmounts, focus should return to "Open" button
        await waitFor(() => expect(openBtn).toHaveFocus());

    });
    it("should focus on the modal when no focusable elements inside", async () => {
        render(
            <Modal id="test" onClose={mockOnClose} showCloseButton={false}>
                <div>Modal Content</div>
            </Modal>
        );

        const modal = screen.getByTestId("modal-test");
        expect(modal).toHaveFocus();
    })
});


function ModalHarness() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button data-testid="open-btn" onClick={() => setOpen(true)}>Open modal</button>
            {open && <Modal id="test" onClose={() => setOpen(false)}>
                <button>Inside modal</button>
            </Modal>}
        </>
    );
}
