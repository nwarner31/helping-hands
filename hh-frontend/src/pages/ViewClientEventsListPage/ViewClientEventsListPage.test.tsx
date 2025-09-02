import { AuthProvider } from "../../context/AuthContext";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ViewClientEventsListPage from "./ViewClientEventsListPage";
import apiService from "../../utility/ApiService";

// Mock apiService
jest.mock("../../utility/ApiService", () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
    },
}));
const mockedGet = apiService.get as jest.Mock;

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
        mockedGet.mockResolvedValueOnce({ success: true, message: "Events found", events: fakeEvents });

        await act(async () => {
            renderWithRouter();
        });
        act(() => { jest.advanceTimersByTime(1500); });

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledWith("client/client123/event");
            expect(screen.getByText("T12345")).toBeInTheDocument();
        });
    });

    it("shows 'No Events Found' on mount when no events returned", async () => {
        mockedGet.mockResolvedValueOnce({ success: true, message: "Events found", events: [] });

        await act(async () => {
            renderWithRouter();
        });
        act(() => { jest.advanceTimersByTime(1500); });

        await waitFor(() => {
            expect(screen.getByText("No Events Found.")).toBeInTheDocument();
        });
    });

    it("handles fetch error on mount and shows toast", async () => {
        mockedGet.mockResolvedValueOnce({ success: false, message: "API failure" });

        await act(async () => {
            renderWithRouter();
        });
        act(() => { jest.advanceTimersByTime(1500); });
        await waitFor(() => {
            expect(screen.getByText("Unable to fetch events.")).toBeInTheDocument();
        });
    });

    // --- Existing search & validation tests ---
    it("renders default month search correctly", async () => {
        mockedGet.mockResolvedValueOnce({ success: false, message: "API failure" });
        await act(async () => {
            renderWithRouter();
        });
        act(() => { jest.runAllTimers(); });
        expect(await screen.findByText("View Client Events")).toBeInTheDocument();
        expect(screen.getByLabelText(/Search by/i)).toHaveValue("month");
        expect(screen.getByLabelText(/Month/i)).toBeInTheDocument();
    });

    it("switches to date search when 'Dates' is selected", async () => {
        mockedGet.mockResolvedValueOnce({ success: false, message: "API failure" });
        await act(async () => {
            renderWithRouter();
        });
        act(() => { jest.runAllTimers(); });
        fireEvent.change(await screen.findByLabelText(/Search by/i), { target: { value: "dates" } });
        expect(screen.getByLabelText("From")).toBeInTheDocument();
        expect(screen.getByLabelText("To")).toBeInTheDocument();
    });

    it("shows validation error if month is empty", async () => {
        mockedGet.mockResolvedValue({ message: "Events found", events: [] });
        await act(async () => {
            renderWithRouter();
        });

        act(() => { jest.advanceTimersByTime(1500); });
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
        mockedGet.mockResolvedValue({ message: "Events found", events: fakeEvents });

        await act(async () => {
            renderWithRouter();
        });
        act(() => { jest.advanceTimersByTime(1500); });
        fireEvent.change(screen.getByLabelText(/Month/i), { target: { value: "2025-08" } });
        await waitFor(() => { fireEvent.click(screen.getByRole("button", { name: /Search/i })); })

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledWith("client/client123/event?month=2025-08");
            expect(screen.getByText("T12345")).toBeInTheDocument();
        });
    });

    it("shows 'No Events Found' for empty month search results", async () => {
        mockedGet.mockResolvedValue({ message: "Events found", events: [] });
        await act(async () => {
            renderWithRouter();
        });
        act(() => { jest.advanceTimersByTime(1500); });
        fireEvent.change(screen.getByLabelText(/Month/i), { target: { value: "2025-08" } });
        await waitFor(() => { fireEvent.click(screen.getByRole("button", { name: /Search/i })); })
        await waitFor(() => expect(screen.getByText("No Events Found.")).toBeInTheDocument());
    });

    it("shows validation errors for empty dates", async () => {
        mockedGet.mockResolvedValue({ message: "Events found", events: [] });
        await act(async () => {
            renderWithRouter();
        });
        act(() => { jest.advanceTimersByTime(1500); });
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
        mockedGet.mockResolvedValue({ message: "Events found", events: fakeEvents });
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

        mockedGet.mockResolvedValueOnce({ message: "Events found", events: fakeEvents });

        fireEvent.click(screen.getByRole("button", { name: /Search/i }));

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledWith("client/client123/event?from=2023-01-01&to=2023-01-02");
            expect(screen.getByText("T12345")).toBeInTheDocument();
        });
    });

    it("should display errors on inputs if returned from the backend as well as the error text", async () => {
        const fakeEvents = [{  id: "T12345",
            title: "Test Event",
            beginDate: "2023-10-01T10:00:00.000Z",
            endDate: "2023-10-01T12:00:00.000Z",
            beginTime: "2023-10-01T10:00:00.000Z",
            endTime: "2023-10-01T12:00:00.000Z", }];
        mockedGet.mockResolvedValue({ message: "Events found", events: fakeEvents });
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

        mockedGet.mockResolvedValueOnce({ message: "Errors", errors: {month: "Month error", toDate: "To error", fromDate: "From error"} });

        fireEvent.click(screen.getByRole("button", { name: /Search/i }));

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledWith("client/client123/event?from=2023-01-01&to=2023-01-02");
            expect(screen.getByText("Month error")).toBeInTheDocument();
            expect(screen.getByText("Unable to fetch events.")).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText(/Search by/i), { target: { value: "dates" } });
        await waitFor(() => {
            expect(screen.getByText("To error")).toBeInTheDocument();
            expect(screen.getByText("From error")).toBeInTheDocument();
        })

    });

    it("shows toast for invalid search type", async () => {
        mockedGet.mockResolvedValue({ message: "Events found", events: [] });
        await act(async () => {
            renderWithRouter();

        });
        act(() => { jest.runAllTimers(); });

        fireEvent.change(await screen.findByLabelText(/Search by/i), { target: { value: "invalid" } });
        const searchButton = await screen.findByRole("button", { name: /Search/i });

        await act(async () => {
            fireEvent.click(searchButton);
        });

        expect(await screen.findByText(/Invalid search type/i)).toBeInTheDocument();
        act(() => { jest.runAllTimers(); });
        expect(await screen.findByText(/Unable to fetch events/i)).toBeInTheDocument();

    });

    it("should redirect to view client page with invalid client id", async () => {
        mockedGet.mockResolvedValueOnce({ success: false, message: "Client not found" });

        await act(async () => {
            renderWithRouter();
        });
        act(() => { jest.advanceTimersByTime(1500); });

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
        mockedGet.mockResolvedValueOnce({ message: "Events found", events: fakeEvents });
        mockedGet.mockResolvedValueOnce({success: false, message: "Client not found" });
        //mockedGet.mockClear();
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




        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /Search/i }));
            jest.advanceTimersByTime(1500);
        });
        act(() => {
            jest.runAllTimers(); // runs every pending timer
        });
        await waitFor(() => {

            expect(screen.getByText("View Clients")).toBeInTheDocument();
        });
    });


    it("handles API error on search gracefully", async () => {
        mockedGet.mockResolvedValue({ success: false, message: "API failure" });
        await act(async () => {
            renderWithRouter();
        });
        act(() => { jest.advanceTimersByTime(1500); });
        fireEvent.change(screen.getByLabelText(/Month/i), { target: { value: "2025-08" } });
        await waitFor(() => { fireEvent.click(screen.getByRole("button", { name: /Search/i })); })
        act(() => { jest.advanceTimersByTime(1500); });
        await waitFor(() => expect(screen.getByText("Unable to fetch events.")).toBeInTheDocument());
    });
});
