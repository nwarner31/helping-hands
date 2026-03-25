import { render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import apiService from "../../../utility/ApiService";
import {useAuth} from "../../../context/AuthContext";

//jest.mock("@/services/apiService");
jest.mock("../../../context/AuthContext", () => ({
    useAuth: jest.fn(),
}));
jest.mock("../../../utility/ApiService", () => ({
    get: jest.fn(() => Promise.resolve( { message: "Employee registered successfully", employee: {}, accessToken: "hello" })),
    post: jest.fn(() => Promise.resolve({event: {...workEvent, medical: {doctor: "Dr Sam", recordNumber: "r1", doctorType: "Good", appointmentForCondition: "Health"}}}))
}));

const mockToastError = jest.fn();
const mockToastSuccess = jest.fn();
jest.mock("react-toastify", () => ({
    __esModule: true,
    toast: {
        error: mockToastError,
        success: mockToastSuccess
    },
}));

import ViewEventPage from "./ViewEventPage";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

const workEvent = {
    id: "event-123",
    type: "WORK",
    description: "Some description",
    beginDate: "2025-09-13T00:00:00.000Z",
    endDate: "2025-09-13T00:00:00.000Z",
    beginTime: "2025-09-13T09:00:00.000Z",
    endTime: "2025-09-13T11:00:00.000Z",
    numberStaffRequired: 2,
    client: {
        id: "c1",
        legalName: "John Doe",
        dateOfBirth: "2025-09-13T11:00:00.000Z"
    },
    medical: null
}


    describe("View Event Page", () => {
        function setup(role: "ADMIN" | "ASSOCIATE" = "ADMIN", eventId = "event-123") {
            (useAuth as jest.Mock).mockReturnValue({
                employee: { position: role }
            });
            const testQuery = new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: false
                    }
                }
            });

        render(
            <QueryClientProvider client={testQuery}>
            <MemoryRouter initialEntries={["/events", {pathname: `/events/${eventId}`}]}  >
                <>
                    <Routes>
                    <Route path="/events/:eventId" element={<ViewEventPage />} />
                    <Route path="/events" element={<div>Events List Page</div>} />
                    <Route path="/dashboard" element={<div>Dashboard Page</div>} />
                    <Route path="/edit-event/:id" element={<div>Edit Event Page</div>} />
                    </Routes>

                </>

            </MemoryRouter>
            </QueryClientProvider>);
    }
        beforeEach(() => jest.resetAllMocks());



        it("navigates back on error", async () => {
            (apiService.get as jest.Mock).mockRejectedValue(new Error("Event not found"));

            setup();

            await waitFor(() =>
                expect(screen.getByText("Events List Page")).toBeInTheDocument()
            );
        });

        // Navigation button tests
        it("navigates back when clicking Back button", async () => {
            (apiService.get as jest.Mock).mockResolvedValue( { message: "Event found", data: { ...workEvent }});

            setup();

            expect(await screen.findByText("Some description")).toBeInTheDocument();

            await userEvent.click(screen.getByRole("button", { name: /back/i }));

            expect(await screen.findByText("Events List Page")).toBeInTheDocument();
        });

        it("navigates to dashboard when dashboard button pressed", async () => {
            (apiService.get as jest.Mock).mockResolvedValue( { message: "Event found", data: { ...workEvent }});

            setup();

            expect(await screen.findByText("Some description")).toBeInTheDocument();

            await userEvent.click(screen.getByRole("link", { name: /dashboard/i }));

            expect(await screen.findByText("Dashboard Page")).toBeInTheDocument();
        });
        it("shows edit button for admin role", async () => {
            (apiService.get as jest.Mock).mockResolvedValue( { message: "Event found", data: { ...workEvent }});

            setup("ADMIN");

            expect(await screen.findByText("Some description")).toBeInTheDocument();
            expect(screen.getByRole("link", { name: /edit/i })).toBeInTheDocument();

        });
        it("navigates to edit page when edit button pressed", async () => {
            (apiService.get as jest.Mock).mockResolvedValue( { message: "Event found", data: { ...workEvent }});
            setup("ADMIN");

            expect(await screen.findByText("Some description")).toBeInTheDocument();

            await userEvent.click(screen.getByRole("link", { name: /edit/i }));

            expect(await screen.findByText("Edit Event Page")).toBeInTheDocument();
        });
        it("does not show edit button for associate role", async () => {
            (apiService.get as jest.Mock).mockResolvedValue( { message: "Event found", data: { ...workEvent }});
            setup("ASSOCIATE");

            expect(await screen.findByText("Some description")).toBeInTheDocument();
            expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
        });

        // Fetch event tests
        it("loads event from fetch event and displays it", async () => {
            (apiService.get as jest.Mock).mockResolvedValue({message: "Event found", data: { ...workEvent }});

            setup();

            await waitFor(() => {
                expect(screen.getByText("Some description")).toBeInTheDocument();
                expect(screen.getByText("John Doe")).toBeInTheDocument();
            })
        });

        it("navigates back to the event list page for event fetch error", async () => {
            (apiService.get as jest.Mock).mockRejectedValue(new Error("Event not found"));

            setup();
            await waitFor(async () => {
                  expect(mockToastError).toHaveBeenCalledWith("Unable to find event", {autoClose: 1500, position: "top-right"});
            });

            expect(await screen.findByText("Events List Page")).toBeInTheDocument();
        });

        it("navigates to dashboard for no event id", async () => {
            //(useParams as jest.Mock).mockReturnValue({});

            setup("ADMIN", " ");
            await waitFor(async () => {
                expect(mockToastError).toHaveBeenCalledWith("Event ID not found", {autoClose: 1500, position: "top-right"});
            });

            expect(await screen.findByText("Events List Page")).toBeInTheDocument();
        });


        it("displays medical event details correctly", async () => {
            const medicalEvent = { ...workEvent, type: "MEDICAL", medical: { recordNumber: "m3147", doctor: "Dr. Smith", doctorType: "Primary Care", appointmentForCondition: "General Health" }};
            (apiService.get as jest.Mock).mockResolvedValue({data: medicalEvent});
            setup();
            expect(await screen.findByText("Medical Info")).toBeInTheDocument();
            expect(await screen.findByText("m3147")).toBeInTheDocument();
            expect(screen.getByText("Dr. Smith")).toBeInTheDocument();
            expect(screen.getByText("Primary Care")).toBeInTheDocument();
            expect(screen.getByText("General Health")).toBeInTheDocument();
            expect(screen.getAllByText("N/A").length).toBe(3);
        });
        it("displays the record dates, names and results if included", async () => {
            const medicalEvent = { ...workEvent, type: "MEDICAL", medical: { recordNumber: "m3147", doctor: "Dr. Smith", doctorType: "Primary Care", appointmentResults: "Appointment went well",
                    appointmentForCondition: "General Health", recordTakenToHouseDate: "2025-09-11T11:00:00.000Z", recordPrintedDate: "2025-09-10T11:00:00.000Z",
                    recordFiledDate: "2025-09-12T11:00:00.000Z", recordPrintedBy: {name: "Dan Doe"}, recordTakenToHouseBy: {name: "Jane Manager"}, recordFiledBy: {name: "Jim Director"} }};
            (apiService.get as jest.Mock).mockResolvedValue({data: medicalEvent});
            setup();
            await waitFor(() => {
                expect(screen.getByText("09/10/2025")).toBeInTheDocument();
                expect(screen.getByText("Dan Doe")).toBeInTheDocument();
                expect(screen.getByText("09/11/2025")).toBeInTheDocument();
                expect(screen.getByText("Jane Manager")).toBeInTheDocument();
                expect(screen.getByText("09/12/2025")).toBeInTheDocument();
                expect(screen.getByText("Jim Director")).toBeInTheDocument();
                expect(screen.getByText("Appointment went well")).toBeInTheDocument();
            })
        });

        it("displays the modal when the record action button is clicked", async () => {
            const medicalEvent = { ...workEvent, type: "MEDICAL", medical: { recordNumber: "m3147", doctor: "Dr. Smith", doctorType: "Primary Care",
                    appointmentForCondition: "General Health",  }};
            (apiService.get as jest.Mock).mockResolvedValue({data: medicalEvent});
            setup();
            await waitFor(async () => {
                const actionButton = screen.getByText("Print Record");
                await userEvent.click(actionButton);
                expect(await screen.findByText("Confirm Action")).toBeInTheDocument();
            })

        });

        it("closes the modal when no is clicked", async () => {
            const medicalEvent = { ...workEvent, type: "MEDICAL", medical: { recordNumber: "m3147", doctor: "Dr. Smith", doctorType: "Primary Care",
                    appointmentForCondition: "General Health",  }};
            (apiService.get as jest.Mock).mockResolvedValue({data: medicalEvent})
            setup();
            await waitFor(async () => {
                const actionButton = screen.getByText("Print Record");
                await userEvent.click(actionButton);
                expect(await screen.findByText("Confirm Action")).toBeInTheDocument();
                const noButton = screen.getByRole("button", { name: /no/i });
                await userEvent.click(noButton);
                expect(screen.queryByText("Confirm Action")).not.toBeInTheDocument();
            });
        });

        it("displays the results text area and updates the text properly when the action is file record", async () => {
            const medicalEvent = { ...workEvent, type: "MEDICAL", medical: { recordNumber: "m3147", doctor: "Dr. Smith", doctorType: "Primary Care",
                    appointmentForCondition: "General Health", recordPrintedDate: "2025-09-10T11:00:00.000Z", recordPrintedBy: {name: "Bill Manager"}, recordTakenToHouseDate: "2025-09-11T11:00:00.000Z",
                    recordTakenToHouseBy: {name: "Jane Manager"}, recordFiledDate: null }};
            (apiService.get as jest.Mock).mockResolvedValue({data: medicalEvent});
            setup();
            await waitFor(async () => {
                const actionButton = screen.getByText("File Record");
                await userEvent.click(actionButton);
                const textArea = await screen.findByLabelText("Appointment Results");
                expect(textArea).toBeInTheDocument();
                await userEvent.type(textArea, "Patient is in good health.");
                expect(textArea).toHaveValue("Patient is in good health.");
            });
        });

        it("displays the toast with successful post", async () => {
            const mockPost = (apiService.post as jest.Mock).mockResolvedValue({message: "All good", data: {...workEvent, medical: {doctor: "Dr Sam", recordNumber: "r1", doctorType: "Good", appointmentForCondition: "Health"}}});
            const medicalEvent = { ...workEvent, type: "MEDICAL", medical: { recordNumber: "m3147", doctor: "Dr. Smith", doctorType: "Primary Care",
                    appointmentForCondition: "General Health",}};
            (apiService.get as jest.Mock).mockResolvedValue({data: medicalEvent});
            setup();
            await waitFor(async () => {
                const actionButton = screen.getByText("Print Record");
                await userEvent.click(actionButton);
                const yesButton = screen.getByText("Yes");
                await userEvent.click(yesButton);
                expect(mockPost).toHaveBeenCalledTimes(1);
                expect(mockToastSuccess).toHaveBeenCalledWith(`Successfully recorded print record action.`, {autoClose: 1500, position: "top-right"});
            });
        });

        it("displays 'Print Record' on the button when the record has not been printed and submits when yes is pressed", async () => {
            const mockPost = (apiService.post as jest.Mock).mockResolvedValue({message: "All good",event: {...workEvent, medical: {doctor: "Dr Sam", recordNumber: "r1", doctorType: "Good", appointmentForCondition: "Health"}}});
            const medicalEvent = { ...workEvent, type: "MEDICAL", medical: { recordNumber: "m3147", doctor: "Dr. Smith", doctorType: "Primary Care",
                    appointmentForCondition: "General Health", recordPrintedDate: null }};
            (apiService.get as jest.Mock).mockResolvedValue({data: medicalEvent});
            setup();
            await waitFor(async () => {
                const actionButton = screen.getByText("Print Record")
                expect(actionButton).toBeInTheDocument();
                await userEvent.click(actionButton);
                const yesButton = screen.getByText("Yes");
                await userEvent.click(yesButton);
                expect(mockPost).toHaveBeenCalledTimes(1);
            });
        });

        it("displays 'Take Record to House' on the button when the record has been printed but not taken to the house and submits when yes in the modal is pressed", async () => {
            const mockPost = (apiService.post as jest.Mock).mockResolvedValue({message: "All good",event: {...workEvent, medical: {doctor: "Dr Sam", recordNumber: "r1", doctorType: "Good", appointmentForCondition: "Health"}}});
            const medicalEvent = { ...workEvent, type: "MEDICAL", medical: { recordNumber: "m3147", doctor: "Dr. Smith", doctorType: "Primary Care",
                    appointmentForCondition: "General Health", recordPrintedDate: "2025-09-10T11:00:00.000Z", recordPrintedBy: {name: "Bill Manager"}, recordTakenToHouseDate: null }};
            (apiService.get as jest.Mock).mockResolvedValue({data: medicalEvent});
            setup();
            await waitFor(async () => {
                const actionButton = screen.getByText("Take Record to House")
                expect(actionButton).toBeInTheDocument();
                await userEvent.click(actionButton);
                const yesButton = screen.getByText("Yes");
                await userEvent.click(yesButton);
                expect(mockPost).toHaveBeenCalledTimes(1);
            })

        });

        it("displays 'File Record' on the button when the record has been taken to the house but not filed and submits when yes in the modal is pressed", async () => {
            const mockPost = (apiService.post as jest.Mock).mockResolvedValue({message: "All good",data: {...workEvent, medical: {doctor: "Dr Sam", recordNumber: "r1", doctorType: "Good", appointmentForCondition: "Health"}}});
            const medicalEvent = { ...workEvent, type: "MEDICAL", medical: { recordNumber: "m3147", doctor: "Dr. Smith", doctorType: "Primary Care",
                    appointmentForCondition: "General Health", recordPrintedDate: "2025-09-10T11:00:00.000Z", recordPrintedBy: {name: "Bill Manager"}, recordTakenToHouseDate: "2025-09-11T11:00:00.000Z",
                    recordTakenToHouseBy: {name: "Jane Manager"}, recordFiledDate: null }};
            (apiService.get as jest.Mock).mockResolvedValue({message: "Event found", data: { ...medicalEvent}});
            setup();
            await waitFor(async () => {
                const actionButton = screen.getByText("File Record")
                expect(actionButton).toBeInTheDocument();
                await userEvent.click(actionButton);
                await userEvent.type(screen.getByLabelText("Appointment Results"), "Patient is in good health.");
                const yesButton = screen.getByText("Yes");
                await userEvent.click(yesButton);
                expect(mockPost).toHaveBeenCalledTimes(1);
            });
        });

        it("displays a toast for record action validation error (no result for file action)", async () => {
            const medicalEvent = { ...workEvent, type: "MEDICAL", medical: { recordNumber: "m3147", doctor: "Dr. Smith", doctorType: "Primary Care",
                    appointmentForCondition: "General Health", recordPrintedDate: "2025-09-10T11:00:00.000Z", recordPrintedBy: {name: "Bill Manager"}, recordTakenToHouseDate: "2025-09-11T11:00:00.000Z",
                    recordTakenToHouseBy: {name: "Jane Manager"}, recordFiledDate: null }};
            (apiService.get as jest.Mock).mockResolvedValue({message: "Event found", data: { ...medicalEvent}});
            setup();
            await waitFor(async () => {
                const actionButton = screen.getByText("File Record")
                expect(actionButton).toBeInTheDocument();
                await userEvent.click(actionButton);
                // await userEvent.type(screen.getByLabelText("Appointment Results"), "Patient is in good health.");
                const yesButton = screen.getByText("Yes");
                await userEvent.click(yesButton);
                // expect(mockPost).toHaveBeenCalledTimes(1);
                expect(mockToastError).toHaveBeenCalledWith("Invalid action data. Please try again.", {autoClose: 1500, position: "top-right"})
            });
        });
        it("displays an error toast for an api error", async () => {
            (apiService.post as jest.Mock).mockRejectedValue(new Error("Network error"));
            const medicalEvent = { ...workEvent, type: "MEDICAL", medical: { recordNumber: "m3147", doctor: "Dr. Smith", doctorType: "Primary Care",
                    appointmentForCondition: "General Health", recordPrintedDate: "2025-09-10T11:00:00.000Z", recordPrintedBy: {name: "Bill Manager"}, recordTakenToHouseDate: null }};
            (apiService.get as jest.Mock).mockResolvedValue({data: medicalEvent});
            setup();
            await waitFor(async () => {
                const actionButton = screen.getByText("Take Record to House")
                expect(actionButton).toBeInTheDocument();
                await userEvent.click(actionButton);
                const yesButton = screen.getByText("Yes");
                await userEvent.click(yesButton);
                expect(mockToastError).toHaveBeenCalledWith(`Unable to save take record to house action`, {autoClose: 1500, position: "top-right"})
            });
        });
    });
