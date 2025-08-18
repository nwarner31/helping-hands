import {render, screen} from "@testing-library/react";
import ViewClientUpcomingEvent from "./ViewClientUpcomingEvent";
import {Event, EventType} from "../../models/Event/Event";

// mock formatting utilities so test output is stable
jest.mock("../../utility/formatting", () => ({
    formatShortDate: (date: string) => `formatted-${date}`,
    formatTime: (time: string) => `formatted-${time}`,
}));

// sample event
const mockEvent: Event = {
    id: "e1",
    client: { id: "client123", legalName: "Jane Doe", name: "Jane", dateOfBirth: "1990-01-13", sex: "F" },
    beginDate: "2025-08-20",
    endDate: "2025-08-21",
    beginTime: "10:00",
    endTime: "11:00",
    description: "Medical checkup",
    type: EventType.MEDICAL,
    numberStaffRequired: 3,
};

describe("ViewClientUpcomingEvent", () => {
    it("renders the event information", () => {
        render(<ViewClientUpcomingEvent event={mockEvent} isOdd={false} />);

        expect(screen.getByText("View")).toBeInTheDocument();
        expect(screen.getByText("Begin")).toBeInTheDocument();
        expect(screen.getByText("End")).toBeInTheDocument();
        expect(screen.getByText("Type")).toBeInTheDocument();

        expect(screen.getByText("formatted-2025-08-20")).toBeInTheDocument();
        expect(screen.getByText("formatted-2025-08-21")).toBeInTheDocument();
        expect(screen.getByText("MEDICAL")).toBeInTheDocument();
        expect(screen.getByText("formatted-10:00")).toBeInTheDocument();
        expect(screen.getByText("formatted-11:00")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("applies correct classes when isOdd=false (even row)", () => {
        render(<ViewClientUpcomingEvent event={mockEvent} isOdd={false} />);
        const container = screen.getByText("View").closest("div"); // outer container
        expect(container).toHaveClass("bg-white");
    });

    it("applies correct classes when isOdd=true (odd row)", () => {
        render(<ViewClientUpcomingEvent event={mockEvent} isOdd={true} />);
        const container = screen.getByText("View").closest("div"); // outer container
        expect(container).toHaveClass("bg-primary");
        expect(container).toHaveClass("text-white");
    });

    it("renders the button with correct styling based on isOdd", () => {
        const { rerender } = render(<ViewClientUpcomingEvent event={mockEvent} isOdd={false} />);
        let button = screen.getByRole("button", { name: /view/i });
        expect(button).toHaveClass("bg-secondary");
        expect(button).toHaveClass("text-black");

        rerender(<ViewClientUpcomingEvent event={mockEvent} isOdd={true} />);
        button = screen.getByRole("button", { name: /view/i });
        expect(button).toHaveClass("bg-accent");
        expect(button).toHaveClass("text-white");
    });
});
