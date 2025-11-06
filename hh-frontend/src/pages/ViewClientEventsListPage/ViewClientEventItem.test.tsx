// ViewClientEventItem.test.tsx
import { render, screen } from "@testing-library/react";
import ViewClientEventItem from "./ViewClientEventItem";
import { Event } from "../../models/Event/Event";
import {BrowserRouter} from "react-router-dom";


describe("ViewClientEventItem", () => {
    const mockEvent: Event = {
        id: "123",
        beginDate: "2025-09-01T00:00:00.000Z",
        beginTime: "2020-01-01T08:30",
        endDate: "2025-09-01T00:00:00.000Z",
        endTime: "2020-01-01T09:30",
        type: "MEDICAL",
    } as Event;

    it("renders the event ID inside a button", () => {
        render(<BrowserRouter><ViewClientEventItem event={mockEvent} /></BrowserRouter> );
        expect(screen.getByRole("link", { name: /123/i })).toBeInTheDocument();
    });

    it("renders the begin date and time", () => {
        render(<BrowserRouter><ViewClientEventItem event={mockEvent} /></BrowserRouter> );
        expect(
            screen.getByText("09/01/2025 - 08:30")
        ).toBeInTheDocument();
    });

    it("renders the end date and time", () => {
        render(<BrowserRouter><ViewClientEventItem event={mockEvent} /></BrowserRouter> );
        expect(
            screen.getByText("09/01/2025 - 09:30")
        ).toBeInTheDocument();
    });

    it("renders the event type", () => {
        render(<BrowserRouter><ViewClientEventItem event={mockEvent} /></BrowserRouter> );
        expect(screen.getByText("MEDICAL")).toBeInTheDocument();
    });

    it("renders Begin/End labels", () => {
        render(<BrowserRouter><ViewClientEventItem event={mockEvent} /></BrowserRouter> );
        expect(screen.getByText("Begin")).toBeInTheDocument();
        expect(screen.getByText("End")).toBeInTheDocument();
    });

    it("renders the compact labels for small screens", () => {
        render(<BrowserRouter><ViewClientEventItem event={mockEvent} /></BrowserRouter> );
        expect(screen.getByText("B")).toBeInTheDocument();
        expect(screen.getByText("E")).toBeInTheDocument();
    });
});
