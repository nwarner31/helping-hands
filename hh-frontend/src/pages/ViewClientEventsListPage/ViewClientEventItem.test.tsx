// ViewClientEventItem.test.tsx
import { render, screen } from "@testing-library/react";
import ViewClientEventItem from "./ViewClientEventItem";
import { Event } from "../../models/Event/Event";

// Mock formatting helpers
jest.mock("../../utility/formatting", () => ({
    formatDate: (date: string) => `formatted-${date}`,
    formatTime: (time: string) => `formatted-${time}`,
}));

describe("ViewClientEventItem", () => {
    const mockEvent: Event = {
        id: "123",
        beginDate: "2025-09-01",
        beginTime: "08:30",
        endDate: "2025-09-01",
        endTime: "09:30",
        type: "MEDICAL",
    } as Event;

    it("renders the event ID inside a button", () => {
        render(<ViewClientEventItem event={mockEvent} />);
        expect(screen.getByRole("button", { name: /123/i })).toBeInTheDocument();
    });

    it("renders the begin date and time", () => {
        render(<ViewClientEventItem event={mockEvent} />);
        expect(
            screen.getByText(/formatted-2025-09-01 - formatted-08:30/)
        ).toBeInTheDocument();
    });

    it("renders the end date and time", () => {
        render(<ViewClientEventItem event={mockEvent} />);
        expect(
            screen.getByText(/formatted-2025-09-01 - formatted-09:30/)
        ).toBeInTheDocument();
    });

    it("renders the event type", () => {
        render(<ViewClientEventItem event={mockEvent} />);
        expect(screen.getByText("MEDICAL")).toBeInTheDocument();
    });

    it("renders Begin/End labels", () => {
        render(<ViewClientEventItem event={mockEvent} />);
        expect(screen.getByText("Begin")).toBeInTheDocument();
        expect(screen.getByText("End")).toBeInTheDocument();
    });

    it("renders the compact labels for small screens", () => {
        render(<ViewClientEventItem event={mockEvent} />);
        expect(screen.getByText("B")).toBeInTheDocument();
        expect(screen.getByText("E")).toBeInTheDocument();
    });
});
