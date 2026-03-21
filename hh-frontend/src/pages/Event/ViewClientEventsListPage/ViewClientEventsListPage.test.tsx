import { AuthProvider } from "../../../context/AuthContext";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import apiService from "../../../utility/ApiService";

// Mock apiService
jest.mock("../../../utility/ApiService", () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
    },
}));
const mockedGet = apiService.get as jest.Mock;

const mockToastError = jest.fn();
jest.mock("react-toastify", () => ({
    __esModule: true,
    toast: {
        error: mockToastError
    },
}));
import ViewClientEventsListPage from "./ViewClientEventsListPage";

function renderWithRouter(clientId = "client123") {
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[`/clients/${clientId}/events`]}>
                <Routes>
                    <Route path="/clients/:clientId/events" element={<ViewClientEventsListPage />} />
                    <Route path="/view-clients" element={<h1>View Clients</h1>} />
                </Routes>
            </MemoryRouter>
        </AuthProvider>
    );
}

function createFakeEvent(id: string) {
    return {
        id,
        title: `Event ${id}`,
        beginDate: "2023-10-01T10:00:00.000Z",
        endDate: "2023-10-01T12:00:00.000Z",
        beginTime: "2023-10-01T10:00:00.000Z",
        endTime: "2023-10-01T12:00:00.000Z",
    };
}

function paginatedEventsResponse(events: any[], numPages = 1, pageNum = 1) {
    return {
        message: "Events found",
        data: { events, numPages, pageNum },
    };
}

describe("ViewClientEventsListPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers(); // to handle toast timers
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    // --- Initial fetch tests ---
    it("fetches current month events on mount (success)", async () => {
        const fakeEvents = [{  id: "T12345",
            title: "Test Event",
            beginDate: "2023-10-01T10:00:00.000Z",
            endDate: "2023-10-01T12:00:00.000Z",
            beginTime: "2023-10-01T10:00:00.000Z",
            endTime: "2023-10-01T12:00:00.000Z", }];
        mockedGet.mockResolvedValueOnce({ success: true, message: "Events found", data: {events: fakeEvents } });

        await act(async () => {
            renderWithRouter();
        });
        act(() => { jest.advanceTimersByTime(1500); });

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledWith("client/client123/event", expect.objectContaining({"params": {"pageSize": 7}}));
            expect(screen.getByText("T12345")).toBeInTheDocument();
        });
    });

    it("shows 'No Events Found' on mount when no events returned", async () => {
        mockedGet.mockResolvedValueOnce({ success: true, message: "Events found", data: {events: []} });

        await act(async () => {
            renderWithRouter();
        });

        await waitFor(() => {
            expect(screen.getByText("No Events Found.")).toBeInTheDocument();
        });
    });

    it("handles fetch error on mount and shows toast", async () => {
        mockedGet.mockRejectedValueOnce({ success: false, message: "API failure" });

        await act(async () => {
            renderWithRouter();
        });
        await waitFor(() => {
            expect(screen.getByText("Unable to fetch events.")).toBeInTheDocument();
        });
    });

    // --- Existing search & validation tests ---
    it("renders default month search correctly", async () => {
        mockedGet.mockResolvedValueOnce({ success: "", message: "API failure", data: {events: []} });
        await act(async () => {
            renderWithRouter();
        });

        expect(await screen.findByText("View Client Events")).toBeInTheDocument();
        expect(screen.getByLabelText(/Search by/i)).toHaveValue("month");
        expect(screen.getByLabelText(/Month/i)).toBeInTheDocument();
    });

    it("switches to date search when 'Dates' is selected", async () => {
        mockedGet.mockResolvedValueOnce({ success: false, message: "API failure", data: {events: []} });
        await act(async () => {
            renderWithRouter();
        });

        fireEvent.change(await screen.findByLabelText(/Search by/i), { target: { value: "dates" } });
        expect(screen.getByLabelText("From")).toBeInTheDocument();
        expect(screen.getByLabelText("To")).toBeInTheDocument();
    });

    it("shows validation error if month is empty", async () => {
        mockedGet.mockResolvedValue({ message: "Events found", data: {events: []} });
        await act(async () => {
            renderWithRouter();
        });

        mockedGet.mockClear();
        await waitFor(() => {fireEvent.click(screen.getByRole("button", { name: /Search/i }));})

        await waitFor(() => expect(screen.getByText(/Month is required/i)).toBeInTheDocument());
        expect(mockedGet).not.toHaveBeenCalled();
    });

    it("fetches and displays events by month", async () => {
        const fakeEvents = [{  id: "T12345",
            title: "Test Event",
            beginDate: "2023-10-01T10:00:00.000Z",
            endDate: "2023-10-01T12:00:00.000Z",
            beginTime: "2023-10-01T10:00:00.000Z",
            endTime: "2023-10-01T12:00:00.000Z", }];
        mockedGet.mockResolvedValue({ message: "Events found", data: {events: fakeEvents} });

        await act(async () => {
            renderWithRouter();
        });
        //act(() => { jest.advanceTimersByTime(1500); });
        fireEvent.change(screen.getByLabelText(/Month/i), { target: { value: "2025-08" } });
        await waitFor(() => { fireEvent.click(screen.getByRole("button", { name: /Search/i })); })

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledTimes(2); // once on mount and once on search
            expect(mockedGet).toHaveBeenNthCalledWith(1,"client/client123/event", expect.objectContaining({"params": {"pageSize": 7}}));
            expect(mockedGet).toHaveBeenNthCalledWith(2, "client/client123/event", expect.objectContaining({"params": {"month": "2025-08", "pageSize": 7}}));
            expect(screen.getByText("T12345")).toBeInTheDocument();
        });
    });

    it("shows 'No Events Found' for empty month search results", async () => {
        mockedGet.mockResolvedValue({ message: "Events found", data: {events: [] }});
        await act(async () => {
            renderWithRouter();
        });

        fireEvent.change(screen.getByLabelText(/Month/i), { target: { value: "2025-08" } });
        await waitFor(() => { fireEvent.click(screen.getByRole("button", { name: /Search/i })); })
        await waitFor(() => expect(screen.getByText("No Events Found.")).toBeInTheDocument());
    });

    it("shows validation errors for empty dates", async () => {
        mockedGet.mockResolvedValue({ message: "Events found", data: {events: [] }});
        await act(async () => {
            renderWithRouter();
        });

        mockedGet.mockClear();
        fireEvent.change(screen.getByLabelText(/Search by/i), { target: { value: "dates" } });
        await waitFor(() => { fireEvent.click(screen.getByRole("button", { name: /Search/i })); })
        await waitFor(() => {
            expect(screen.getByText(/From is required/i)).toBeInTheDocument();
            expect(screen.getByText(/To is required/i)).toBeInTheDocument();
        });
        expect(mockedGet).not.toHaveBeenCalled();
    });

    it("fetches and displays events by date range", async () => {
        const fakeEvents = [{  id: "T12345",
            title: "Test Event",
            beginDate: "2023-10-01T10:00:00.000Z",
            endDate: "2023-10-01T12:00:00.000Z",
            beginTime: "2023-10-01T10:00:00.000Z",
            endTime: "2023-10-01T12:00:00.000Z", }];
        mockedGet.mockResolvedValue({ message: "Events found", data: {events: fakeEvents }});
        mockedGet.mockClear();
        await act(async () => {
            renderWithRouter();
        });

        act(() => { jest.advanceTimersByTime(1500); });
        fireEvent.change(screen.getByLabelText(/Search by/i), { target: { value: "dates" } });

        // Wait for the input to appear
        const fromInput = await screen.findByLabelText(/From/i);
        const toInput = await screen.findByLabelText(/To/i);
        fireEvent.change(fromInput, { target: { value: "2023-01-01" } });
        fireEvent.change(toInput, { target: { value: "2023-01-02" } });

        mockedGet.mockResolvedValueOnce({ message: "Events found", data: {events: fakeEvents }});

        fireEvent.click(screen.getByRole("button", { name: /Search/i }));

        await waitFor(() => {
            expect(mockedGet).toHaveBeenNthCalledWith(2, "client/client123/event", expect.objectContaining({"params": {"from": "2023-01-01", "to": "2023-01-02", "pageSize": 7}}));
            expect(screen.getByText("T12345")).toBeInTheDocument();
        });
    });

    it("shows pagination controls only when more than one page is available and reflects the current page", async () => {
        mockedGet.mockResolvedValueOnce(
            paginatedEventsResponse([createFakeEvent("PAGE-2-EVENT")], 3, 2)
        );

        await act(async () => {
            renderWithRouter();
        });

        await waitFor(() => {
            expect(screen.getByText("PAGE-2-EVENT")).toBeInTheDocument();
        });

        expect(screen.getByRole("spinbutton")).toHaveValue(2);
        expect(screen.getByText("/ 3")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "<" })).toBeEnabled();
        expect(screen.getByRole("button", { name: ">" })).toBeEnabled();
    });

    it("does not render pagination controls when the response only has one page", async () => {
        mockedGet.mockResolvedValueOnce(
            paginatedEventsResponse([createFakeEvent("ONLY-PAGE")], 1, 1)
        );

        await act(async () => {
            renderWithRouter();
        });

        await waitFor(() => {
            expect(screen.getByText("ONLY-PAGE")).toBeInTheDocument();
        });

        expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "<" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: ">" })).not.toBeInTheDocument();
    });

    it("paginates month search results and preserves the active month filter", async () => {
        mockedGet
            .mockResolvedValueOnce(paginatedEventsResponse([createFakeEvent("INITIAL")], 1, 1))
            .mockResolvedValueOnce(paginatedEventsResponse([createFakeEvent("MONTH-PAGE-1")], 3, 1))
            .mockResolvedValueOnce(paginatedEventsResponse([createFakeEvent("MONTH-PAGE-2")], 3, 2));

        await act(async () => {
            renderWithRouter();
        });

        fireEvent.change(screen.getByLabelText(/Month/i), { target: { value: "2025-08" } });
        fireEvent.click(screen.getByRole("button", { name: /Search/i }));

        await waitFor(() => {
            expect(mockedGet).toHaveBeenNthCalledWith(
                2,
                "client/client123/event",
                expect.objectContaining({ params: { month: "2025-08", pageSize: 7 } })
            );
        });

        await waitFor(() => {
            expect(screen.getByRole("spinbutton")).toHaveValue(1);
            expect(screen.getByText("MONTH-PAGE-1")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: ">" }));

        await waitFor(() => {
            expect(mockedGet).toHaveBeenNthCalledWith(
                3,
                "client/client123/event",
                expect.objectContaining({ params: { month: "2025-08", page: 2, pageSize: 7 } })
            );
        });

        await waitFor(() => {
            expect(screen.getByText("MONTH-PAGE-2")).toBeInTheDocument();
            expect(screen.getByRole("spinbutton")).toHaveValue(2);
        });
    });

    it("paginates date-search results and preserves the active date filters", async () => {
        mockedGet
            .mockResolvedValueOnce(paginatedEventsResponse([createFakeEvent("INITIAL")], 1, 1))
            .mockResolvedValueOnce(paginatedEventsResponse([createFakeEvent("DATES-PAGE-1")], 4, 1))
            .mockResolvedValueOnce(paginatedEventsResponse([createFakeEvent("DATES-PAGE-3")], 4, 3));

        await act(async () => {
            renderWithRouter();
        });

        fireEvent.change(screen.getByLabelText(/Search by/i), { target: { value: "dates" } });

        const fromInput = await screen.findByLabelText(/From/i);
        const toInput = await screen.findByLabelText(/To/i);

        fireEvent.change(fromInput, { target: { value: "2023-01-01" } });
        fireEvent.change(toInput, { target: { value: "2023-01-02" } });
        fireEvent.click(screen.getByRole("button", { name: /Search/i }));

        await waitFor(() => {
            expect(mockedGet).toHaveBeenNthCalledWith(
                2,
                "client/client123/event",
                expect.objectContaining({ params: { from: "2023-01-01", to: "2023-01-02", pageSize: 7 } })
            );
        });

        const pageInput = await screen.findByRole("spinbutton");
        fireEvent.change(pageInput, { target: { value: "3" } });
        fireEvent.submit(pageInput.closest("form") as HTMLFormElement);

        await waitFor(() => {
            expect(mockedGet).toHaveBeenNthCalledWith(
                3,
                "client/client123/event",
                expect.objectContaining({ params: { from: "2023-01-01", to: "2023-01-02", page: 3, pageSize: 7 } })
            );
        });

        await waitFor(() => {
            expect(screen.getByText("DATES-PAGE-3")).toBeInTheDocument();
            expect(screen.getByRole("spinbutton")).toHaveValue(3);
        });
    });

    it("should display errors on inputs if returned from the backend as well as the error text", async () => {
        const fakeEvents = [{  id: "T12345",
            title: "Test Event",
            beginDate: "2023-10-01T10:00:00.000Z",
            endDate: "2023-10-01T12:00:00.000Z",
            beginTime: "2023-10-01T10:00:00.000Z",
            endTime: "2023-10-01T12:00:00.000Z", }];
        mockedGet.mockResolvedValue({ message: "Events found", data: {events: fakeEvents }});
        mockedGet.mockClear();
        await act(async () => {
            renderWithRouter();
        });

        act(() => { jest.advanceTimersByTime(1500); });
        fireEvent.change(screen.getByLabelText(/Search by/i), { target: { value: "dates" } });

        // Wait for the input to appear
        const fromInput = await screen.findByLabelText(/From/i);
        const toInput = await screen.findByLabelText(/To/i);
        fireEvent.change(fromInput, { target: { value: "2023-01-01" } });
        fireEvent.change(toInput, { target: { value: "2023-01-02" } });

        mockedGet.mockRejectedValue({ message: "Errors", errors: {month: "Month error", toDate: "To error", fromDate: "From error"} });

        fireEvent.click(screen.getByRole("button", { name: /Search/i }));

        await waitFor( () => {
            expect(mockedGet).toHaveBeenNthCalledWith(2, "client/client123/event", expect.objectContaining({"params": {"from": "2023-01-01", "to": "2023-01-02", "pageSize": 7}}));
            fireEvent.change(screen.getByLabelText(/Search by/i), { target: { value: "dates" } });
            expect(screen.getByText("To error")).toBeInTheDocument();
            expect(screen.getByText("From error")).toBeInTheDocument();
        });
    });

    it("shows toast for invalid search type", async () => {
        jest.clearAllMocks();
        mockedGet.mockResolvedValue({ message: "Events found", data: {events: []} });
        await act(async () => {
            renderWithRouter();
        });

        fireEvent.change(await screen.findByLabelText(/Search by/i), { target: { value: "invalid" } });
        const searchButton = await screen.findByRole("button", { name: /Search/i });

        await act(async () => {
            fireEvent.click(searchButton);
        });
        expect(mockToastError).toHaveBeenCalledTimes(1);
        expect(mockToastError).toHaveBeenCalledWith("Invalid search type", {autoClose: 1500, position: "top-right"});

        expect(await screen.findByText(/Unable to fetch events/i)).toBeInTheDocument();

    });

    it("should redirect to view client page with invalid client id", async () => {
        mockedGet.mockRejectedValueOnce({ success: false, message: "Client not found" });

        await act(async () => {
            renderWithRouter();
        });

        await waitFor(() => {
            expect(screen.getByText("View Clients")).toBeInTheDocument();
        });
    });

    it("should redirect to view clients page from search button ", async () => {
        const fakeEvents = [{  id: "T12345",
            title: "Test Event",
            beginDate: "2023-10-01T10:00:00.000Z",
            endDate: "2023-10-01T12:00:00.000Z",
            beginTime: "2023-10-01T10:00:00.000Z",
            endTime: "2023-10-01T12:00:00.000Z", }];
        mockedGet.mockResolvedValueOnce({ message: "Events found", data: {events: fakeEvents }});
        mockedGet.mockRejectedValueOnce({success: false, message: "Client not found" });
        await act(async () => {
            renderWithRouter();
        });

        fireEvent.change(screen.getByLabelText(/Search by/i), { target: { value: "dates" } });

        // Wait for the input to appear
        const fromInput = await screen.findByLabelText(/From/i);
        const toInput = await screen.findByLabelText(/To/i);
        fireEvent.change(fromInput, { target: { value: "2023-01-01" } });
        fireEvent.change(toInput, { target: { value: "2023-01-02" } });

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /Search/i }));
        });
        await waitFor(() => {

            expect(screen.getByText("View Clients")).toBeInTheDocument();
        });
    });


    it("handles API error on search gracefully", async () => {
        mockedGet.mockRejectedValue({ success: false, message: "API failure" });
        await act(async () => {
            renderWithRouter();
        });
        fireEvent.change(screen.getByLabelText(/Month/i), { target: { value: "2025-08" } });
        await waitFor(() => { fireEvent.click(screen.getByRole("button", { name: /Search/i })); })
        await waitFor(() => expect(screen.getByText("Unable to fetch events.")).toBeInTheDocument());
    });
});
