import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes} from "react-router-dom";
import AddEditClientEventPage from "./AddEditClientEventPage";
import {Client} from "../../models/Client";
import apiService from "../../utility/ApiService";


// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock apiService
jest.mock("../../utility/ApiService", () => ({
    get: jest.fn(() => Promise.resolve()),
    post: jest.fn(() => Promise.resolve( { message: "Event created", event: { id: "123" }})),
    put: jest.fn(() => Promise.resolve({ message: "Event updated", event: { id: "123" }})),
}));

describe("AddEditClientEventPage", () => {

    const renderPage = (isEdit: boolean = false, locationState: {client: Client} | undefined = undefined) => {
        render(
            <MemoryRouter initialEntries={[{pathname: "/client/abc123/event", state: locationState}]}>
                <Routes>
                    <Route
                        path="/client/:clientId/event"
                        element={<AddEditClientEventPage isEdit={isEdit} />}
                    />
                </Routes>
            </MemoryRouter>
        );
    };

    it("renders basic form fields", () => {
        renderPage(false);
        expect(screen.getByLabelText(/event id/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/begin date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/begin time/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/staff required/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/event type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it("shows validation errors when submitting empty form", async () => {
        renderPage(false);
        await userEvent.click(screen.getByRole("button", { name: /add event/i }));

        await waitFor(() => {
            expect(screen.getByText(/event id is required/i)).toBeInTheDocument();
            expect(screen.getByText(/begin date is required/i)).toBeInTheDocument();
        });
    });


    it("shows validation errors when the dates are in the past", async () => {
        renderPage();

        await userEvent.type(screen.getByLabelText(/event id/i), "EVT123");
        await userEvent.type(screen.getByLabelText(/begin date/i), "2025-07-10");
        await userEvent.type(screen.getByLabelText(/begin time/i), "09:00");
        await userEvent.type(screen.getByLabelText(/end date/i), "2025-07-10");
        await userEvent.type(screen.getByLabelText(/end time/i), "11:00");
        await userEvent.type(screen.getByLabelText(/staff required/i), "2");
        await userEvent.selectOptions(screen.getByLabelText(/event type/i), "WORK");
        await userEvent.type(screen.getByLabelText(/description/i), "Test event");

        await userEvent.click(screen.getByRole("button", { name: /add event/i }));

        expect(screen.getByText(/begin date must be today or later/i)).toBeInTheDocument();
        expect(screen.getByText(/end date must be today or later/i)).toBeInTheDocument();

    });

    it("shows a validation error for numbers below 0", async () => {

        renderPage();

        await userEvent.type(screen.getByLabelText(/event id/i), "EVT123");
        await userEvent.type(screen.getByLabelText(/begin date/i), "2028-07-10");
        await userEvent.type(screen.getByLabelText(/begin time/i), "09:00");
        await userEvent.type(screen.getByLabelText(/end date/i), "2028-07-10");
        await userEvent.type(screen.getByLabelText(/end time/i), "11:00");
        await userEvent.clear(screen.getByLabelText(/staff required/i));
        await userEvent.type(screen.getByLabelText(/staff required/i), "-2");
        await userEvent.selectOptions(screen.getByLabelText(/event type/i), "WORK");
        await userEvent.type(screen.getByLabelText(/description/i), "Test event");

        await userEvent.click(screen.getByRole("button", { name: /add event/i }));

        expect(screen.getByText("Number of staff must be at least 0")).toBeInTheDocument();
    });

    it("shows a validation error for numbers that are not an integer", async () => {

        renderPage();

        await userEvent.type(screen.getByLabelText(/event id/i), "EVT123");
        await userEvent.type(screen.getByLabelText(/begin date/i), "2028-07-10");
        await userEvent.type(screen.getByLabelText(/begin time/i), "09:00");
        await userEvent.type(screen.getByLabelText(/end date/i), "2028-07-10");
        await userEvent.type(screen.getByLabelText(/end time/i), "11:00");
        await userEvent.clear(screen.getByLabelText(/staff required/i));
        await userEvent.type(screen.getByLabelText(/staff required/i), "2.5");
        await userEvent.selectOptions(screen.getByLabelText(/event type/i), "WORK");
        await userEvent.type(screen.getByLabelText(/description/i), "Test event");

        await userEvent.click(screen.getByRole("button", { name: /add event/i }));

        expect(screen.getByText("Number of staff must be an integer")).toBeInTheDocument();
    });

    it("submits valid data and shows the toast", async () => {

        renderPage();

        await userEvent.type(screen.getByLabelText(/event id/i), "EVT123");
        await userEvent.type(screen.getByLabelText(/begin date/i), "2028-07-10");
        await userEvent.type(screen.getByLabelText(/begin time/i), "09:00");
        await userEvent.type(screen.getByLabelText(/end date/i), "2028-07-10");
        await userEvent.type(screen.getByLabelText(/end time/i), "11:00");
        await userEvent.type(screen.getByLabelText(/staff required/i), "2");
        await userEvent.selectOptions(screen.getByLabelText(/event type/i), "WORK");
        await userEvent.type(screen.getByLabelText(/description/i), "Test event");

        await userEvent.click(screen.getByRole("button", { name: /add event/i }));

        expect(screen.getByText("Event successfully added")).toBeInTheDocument();
    });

    it("renders and validates medical fields when event type is MEDICAL", async () => {
        renderPage(false);

        await userEvent.type(screen.getByLabelText(/event id/i), "EVT-MED-1");
        await userEvent.type(screen.getByLabelText(/begin date/i), "2028-07-10");
        await userEvent.type(screen.getByLabelText(/begin time/i), "09:00");
        await userEvent.type(screen.getByLabelText(/end date/i), "2028-07-10");
        await userEvent.type(screen.getByLabelText(/end time/i), "11:00");
        await userEvent.type(screen.getByLabelText(/staff required/i), "1");
        await userEvent.selectOptions(screen.getByLabelText(/event type/i), "MEDICAL");
        await userEvent.type(screen.getByLabelText(/description/i), "Checkup");

        // Don't fill medical fields yet
        await userEvent.click(screen.getByRole("button", { name: /add event/i }));

        await waitFor(() => {
            expect(screen.getByText(/record number is required/i)).toBeInTheDocument();
            expect(screen.getByText(/doctor is required/i)).toBeInTheDocument();
            expect(screen.getByText(/doctor type is required/i)).toBeInTheDocument();
            expect(screen.getByText(/condition is required/i)).toBeInTheDocument();
        });
    });

    it("submits form with valid medical data and navigates", async () => {

        renderPage(false);

        await userEvent.type(screen.getByLabelText(/event id/i), "EVT-MED-2");
        await userEvent.type(screen.getByLabelText(/begin date/i), "2028-07-10");
        await userEvent.type(screen.getByLabelText(/begin time/i), "10:00");
        await userEvent.type(screen.getByLabelText(/end date/i), "2028-07-10");
        await userEvent.type(screen.getByLabelText(/end time/i), "12:00");
        await userEvent.type(screen.getByLabelText(/staff required/i), "1");
        await userEvent.selectOptions(screen.getByLabelText(/event type/i), "MEDICAL");
        await userEvent.type(screen.getByLabelText(/description/i), "Medical event test");

        // Medical fields
        await userEvent.type(screen.getByLabelText(/record number/i), "REC-001");
        await userEvent.type(screen.getByLabelText(/doctor name/i), "Dr. Smith");
        await userEvent.type(screen.getByLabelText(/doctor type/i), "General");
        await userEvent.type(screen.getByLabelText(/condition/i), "Routine check");

        await userEvent.click(screen.getByRole("button", { name: /add event/i }));

        expect(screen.getByText("Event successfully added")).toBeInTheDocument();
    });

    describe("Edit mode", () => {
        const testEvent = {
            id: "EVT-EDIT-1",
            beginDate: "2028-08-15",
            beginTime: "14:00",
            endDate: "2028-08-15",
            endTime: "16:00",
            numberStaffRequired: "3",
            type: "WORK",
            description: "Edited event description",
            medical: {
                recordNumber: "",
                doctor: "",
                doctorType: "",
                appointmentForCondition: ""
            }
        };

        const renderEdit = (state = testEvent) => render(
            <MemoryRouter initialEntries={[{ pathname: `/edit-event/e123`, state: { event: state } }]}>
                <Routes>
                    <Route path="/edit-event/:eventId" element={<AddEditClientEventPage isEdit={true} />} />
                </Routes>
            </MemoryRouter>
        );

        it("renders form with pre-filled data in edit mode", () => {
            renderEdit();
            expect(screen.getByLabelText(/event id/i)).toHaveValue(testEvent.id);
            expect(screen.getByLabelText(/begin date/i)).toHaveValue(testEvent.beginDate);
            expect(screen.getByLabelText(/begin time/i)).toHaveValue(testEvent.beginTime);
            expect(screen.getByLabelText(/end date/i)).toHaveValue(testEvent.endDate);
            expect(screen.getByLabelText(/end time/i)).toHaveValue(testEvent.endTime);
            expect(screen.getByLabelText(/staff required/i)).toHaveValue(Number(testEvent.numberStaffRequired));
            expect(screen.getByLabelText(/event type/i)).toHaveValue(testEvent.type);
            expect(screen.getByLabelText(/description/i)).toHaveValue(testEvent.description);
        });
        it("should submit the updated event in edit mode", async () => {
            renderEdit();
            await userEvent.clear(screen.getByLabelText(/description/i));
            await userEvent.type(screen.getByLabelText(/description/i), "Updated event description");
            await userEvent.click(screen.getByRole("button", { name: /update event/i }));
            const {medical, ...updatedEvent} = testEvent;
            expect(apiService.put).toHaveBeenCalledWith(`event/e123`,
                expect.objectContaining({...updatedEvent, description: "Updated event description", numberStaffRequired: Number(updatedEvent.numberStaffRequired)}));
            await waitFor(() => {
                expect(screen.getByText("Event successfully updated")).toBeInTheDocument();
            });
        });
        it("disables Event Type field when in edit mode and type is MEDICAL", () => {
            const medicalEvent = { ...testEvent, type: "MEDICAL" };
            renderEdit(medicalEvent);
            expect(screen.getByLabelText(/event type/i)).toBeDisabled();
        });
        it("should disable Event ID field in edit mode", () => {
            renderEdit();
            expect(screen.getByLabelText(/event id/i)).toBeDisabled();
        });
        it("should fetch event data when in edit mode", async () => {
            const mockReturnEvent = {
                ...testEvent,
                beginDate: "2028-08-15T14:00:00.000Z",
                endDate: "2028-08-15T16:00:00.000Z",
                beginTime: "2000-01-01T14:00",
                endTime: "2000-01-01T14:00",
            }
            const mockGet = (apiService.get as jest.Mock).mockResolvedValue({message: "event successfully retrieved", event: mockReturnEvent});
            renderEdit(null as any);
            await waitFor(() => {
                expect(mockGet).toHaveBeenCalledWith(`event/e123`);
                expect(screen.getByLabelText(/event id/i)).toHaveValue(testEvent.id);
            });
        })
    });


});
