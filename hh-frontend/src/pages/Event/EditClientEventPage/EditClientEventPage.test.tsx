import {MemoryRouter, Route, Routes} from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
const mockToastSuccess = jest.fn();
jest.mock("react-toastify", () => ({
    __esModule: true,
    toast: {
        success: mockToastSuccess
    },
}));
import {Event, EventType} from "../../../models/Event/Event";
import EditClientEventPage from "./EditClientEventPage";
import {userEvent} from "@testing-library/user-event";
import {AuthProvider} from "../../../context/AuthContext";
import apiService from "../../../utility/ApiService";
jest.mock("../../../utility/ApiService", () => ({
    get: jest.fn(() => Promise.resolve()),
    put: jest.fn(() => Promise.resolve( { message: "Event created", data: { id: "123" }})),
}));
const mockedApi = apiService as jest.Mocked<typeof apiService>;

describe("EditClientEventPage", () => {
    const testEvent = {
        id: "EVT-EDIT-1",
        beginDate: "2028-08-15",
        beginTime: "2000-01-01T14:00",
        endDate: "2028-08-15",
        endTime: "2000-01-01T16:00",
        numberStaffRequired: 3,
        type: "WORK" as EventType,
        description: "Edited event description",
        medical: {
            recordNumber: "",
            doctor: "",
            doctorType: "",
            appointmentForCondition: ""
        },
        client: {
            id: "test1",
            legalName: "Test Client",
            dateOfBirth: "2000-01-01T00:00",
            sex: "M"
        }
    };

    const renderPage = (state: Event | undefined = undefined) => {
        render(
            <AuthProvider>
                <MemoryRouter initialEntries={[{ pathname: `/edit-event/e123`, state: { event: state } }]}>
                    <Routes>
                        <Route path="/edit-event/:eventId" element={<EditClientEventPage  />} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        );
    }

    it("renders form with pre-filled data in edit mode", () => {
        renderPage(testEvent);
        expect(screen.getByLabelText(/event id/i)).toHaveValue(testEvent.id);
        expect(screen.getByLabelText(/begin date/i)).toHaveValue(testEvent.beginDate);
        expect(screen.getByLabelText(/begin time/i)).toHaveValue(testEvent.beginTime.split("T")[1]);
        expect(screen.getByLabelText(/end date/i)).toHaveValue(testEvent.endDate);
        expect(screen.getByLabelText(/end time/i)).toHaveValue(testEvent.endTime.split("T")[1]);
        expect(screen.getByLabelText(/staff required/i)).toHaveValue(Number(testEvent.numberStaffRequired));
        expect(screen.getByLabelText(/event type/i)).toHaveValue(testEvent.type);
        expect(screen.getByLabelText(/description/i)).toHaveValue(testEvent.description);
    });
    it("should submit the updated event", async () => {
        renderPage(testEvent);
        await userEvent.clear(screen.getByLabelText(/description/i));
        await userEvent.type(screen.getByLabelText(/description/i), "Updated event description");
        await userEvent.click(screen.getByRole("button", { name: /update event/i }));

        expect(mockToastSuccess).toHaveBeenCalledWith("Event successfully updated", expect.objectContaining({autoClose: 1500, position: "top-right"}));
    });
    it("disables Event Type field whentype is MEDICAL", () => {
        const medicalEvent = { ...testEvent, type: "MEDICAL" as EventType };
        renderPage(medicalEvent);
        expect(screen.getByLabelText(/event type/i)).toBeDisabled();
    });
    it("should disable Event ID field in edit mode", async () => {
        renderPage(testEvent);
        await waitFor(() => {
            expect(screen.getByLabelText(/event id/i)).toBeDisabled();
        })

    });
    it("should fetch event data", async () => {
        const mockGet = (mockedApi.get as jest.Mock).mockResolvedValue({ data: testEvent });

       //  = (apiService.get as jest.Mock).mockResolvedValue({message: "event successfully retrieved", event: mockReturnEvent});
        renderPage();
        await waitFor(() => {
            expect(mockGet).toHaveBeenCalledWith(`event/e123`);
            expect(screen.getByLabelText(/event id/i)).toHaveValue(testEvent.id);
        });
    });
    it("should go back if the cancel button is pressed", async () => {

    })
});