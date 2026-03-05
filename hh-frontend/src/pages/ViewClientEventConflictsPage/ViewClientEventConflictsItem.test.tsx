jest.mock("../../utility/formatting", () => ({
    formatDate: (d: string) => `formatted-${d}`,
    formatTime: (t: string) => `formatted-${t}`,
}));

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ViewClientEventConflictsItem from "./ViewClientEventConflictsItem";
import { EventConflict } from "../../models/Event/Event";

const sampleConflict: EventConflict = {
    event: {
        id: "e-main",
        description: "Main Event",
        type: "WORK",
        beginDate: "2025-08-01",
        endDate: "2025-08-01",
        beginTime: "09:00",
        endTime: "10:00",
        numberStaffRequired: 1,
    } as any,
    conflicts: [
        {
            id: "c1",
            description: "Conflicting Event 1",
            type: "MEDICAL",
            beginDate: "2025-08-01",
            endDate: "2025-08-01",
            beginTime: "09:30",
            endTime: "10:30",
            numberStaffRequired: 1,
        } as any,
    ],
};

describe("ViewClientEventConflictsItem", () => {
    it("renders event summary with formatted begin and end", () => {
        render(<ViewClientEventConflictsItem conflict={sampleConflict} />);

        expect(screen.getByText("Main Event")).toBeInTheDocument();
        expect(screen.getByText("WORK")).toBeInTheDocument();
        expect(screen.getByText(/Begin: formatted-2025-08-01 - formatted-09:00/)).toBeInTheDocument();
        expect(screen.getByText(/End: formatted-2025-08-01 - formatted-10:00/)).toBeInTheDocument();

        // conflict details not shown until expanded
        expect(screen.queryByText("Conflicting Event 1")).not.toBeInTheDocument();
    });

    it("toggles expansion to reveal conflicts and renders their formatted details", async () => {
        const user = userEvent.setup();
        render(<ViewClientEventConflictsItem conflict={sampleConflict} />);

        // initial icon is collapsed
        expect(screen.getByText("▶")).toBeInTheDocument();

        await user.click(screen.getByText("▶"));

        // icon changes to expanded
        expect(screen.getByText("▼")).toBeInTheDocument();

        // now conflict details should be visible
        expect(await screen.findByText("Conflicting Event 1")).toBeInTheDocument();
        expect(screen.getByText("MEDICAL")).toBeInTheDocument();
        expect(screen.getByText(/Begin: formatted-2025-08-01 - formatted-09:30/)).toBeInTheDocument();
        expect(screen.getByText(/End: formatted-2025-08-01 - formatted-10:30/)).toBeInTheDocument();

        // clicking again collapses
        await user.click(screen.getByText("▼"));
        expect(screen.getByText("▶")).toBeInTheDocument();
        expect(screen.queryByText("Conflicting Event 1")).not.toBeInTheDocument();
    });

    it("renders gracefully when there are no conflicts", async () => {
        const user = userEvent.setup();
        const noConflicts: EventConflict = {
            event: sampleConflict.event,
            conflicts: [],
        };

        render(<ViewClientEventConflictsItem conflict={noConflicts} />);

        // expand
        await user.click(screen.getByText("▶"));

        // no conflict descriptions should be present
        expect(screen.queryByText(/Conflicting Event/)).not.toBeInTheDocument();

        // main Edit button still present
        expect(screen.getAllByText("Edit")[0]).toBeInTheDocument();
    });
});
