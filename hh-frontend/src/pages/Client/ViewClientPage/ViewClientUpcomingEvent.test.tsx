import {render, screen} from "@testing-library/react";
import ViewClientUpcomingEvent from "./ViewClientUpcomingEvent";
import {Event, EventType} from "../../../models/Event/Event";
import {MemoryRouter} from "react-router-dom";

// mock formatting utilities so test output is stable
jest.mock("../../../utility/formatting", () => ({
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

const renderComponent = (isOdd: boolean) => {
    return render (
        <MemoryRouter>
            <ViewClientUpcomingEvent event={mockEvent} isOdd={isOdd} />
        </MemoryRouter>
    );
}

describe("ViewClientUpcomingEvent", () => {
    it("renders the event information", () => {
        renderComponent(false);

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

    it("applies correct button classes when isOdd=false (even row)", () => {
        renderComponent(false);
        expect(screen.getByText("View")).toHaveClass("bg-secondary");
    });

    it("applies correct button classes when isOdd=true (odd row)", () => {
        renderComponent(true);
        expect(screen.getByText("View")).toHaveClass("bg-accent");
    });
});
