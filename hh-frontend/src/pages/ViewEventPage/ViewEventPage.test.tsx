import { render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import apiService from "../../utility/ApiService";

import {useAuth} from "../../context/AuthContext";

//jest.mock("@/services/apiService");
jest.mock("../../context/AuthContext", () => ({
    useAuth: jest.fn(),
}));
jest.mock("../../utility/ApiService", () => ({
    get: jest.fn(() => Promise.resolve( { message: "Employee registered successfully", employee: {}, accessToken: "hello" })),
}));

const mockToastError = jest.fn();
jest.mock("react-toastify", () => ({
    __esModule: true,
    toast: {
        error: mockToastError,
    },
}));

import ViewEventPage from "./ViewEventPage";

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


    describe("EventDetailPage integration", () => {
        function setup(role: "ADMIN" | "ASSOCIATE" = "ADMIN", initialState: any = undefined) {
            (useAuth as jest.Mock).mockReturnValue({
                employee: { position: role }
            });

        render(
            <MemoryRouter initialEntries={["/events", {pathname: "/events/event-123", state: initialState}]}  >
                <Routes>
                    <Route path="/events/:eventId" element={<ViewEventPage />} />
                    <Route path="/events" element={<div>Events List Page</div>} />
                    <Route path="/dashboard" element={<div>Dashboard Page</div>} />
                    <Route path="/edit-event/:id" element={<div>Edit Event Page</div>} />
                </Routes>
            </MemoryRouter>);
    }
        beforeEach(() => jest.resetAllMocks());



        it("navigates back on error", async () => {
            (apiService.get as jest.Mock).mockRejectedValue(new Error("Not found"));

            setup();

            await waitFor(() =>
                expect(screen.getByText("Events List Page")).toBeInTheDocument()
            );
        });

        // Navigation button tests
        it("navigates back when clicking Back button", async () => {
            (apiService.get as jest.Mock).mockResolvedValue( { message: "Event found", event: { ...workEvent }});

            setup();

            expect(await screen.findByText("Some description")).toBeInTheDocument();

            await userEvent.click(screen.getByRole("button", { name: /back/i }));

            expect(await screen.findByText("Events List Page")).toBeInTheDocument();
        });

        it("navigates to dashboard when dashboard button pressed", async () => {
            (apiService.get as jest.Mock).mockResolvedValue( { message: "Event found", event: { ...workEvent }});

            setup();

            expect(await screen.findByText("Some description")).toBeInTheDocument();

            await userEvent.click(screen.getByRole("link", { name: /dashboard/i }));

            expect(await screen.findByText("Dashboard Page")).toBeInTheDocument();
        });
        it("shows edit button for admin role", async () => {
            (apiService.get as jest.Mock).mockResolvedValue( { message: "Event found", event: { ...workEvent }});

            setup("ADMIN");

            expect(await screen.findByText("Some description")).toBeInTheDocument();
            expect(screen.getByRole("link", { name: /edit/i })).toBeInTheDocument();

        });
        it("navigates to edit page when edit button pressed", async () => {
            (apiService.get as jest.Mock).mockResolvedValue( { message: "Event found", event: { ...workEvent }});
            setup("ADMIN");

            expect(await screen.findByText("Some description")).toBeInTheDocument();

            await userEvent.click(screen.getByRole("link", { name: /edit/i }));

            expect(await screen.findByText("Edit Event Page")).toBeInTheDocument();
        });
        it("does not show edit button for associate role", async () => {
            (apiService.get as jest.Mock).mockResolvedValue( { message: "Event found", event: { ...workEvent }});
            setup("ASSOCIATE");

            expect(await screen.findByText("Some description")).toBeInTheDocument();
            expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
        });

        // Fetch event tests
        it("loads event from fetch event and displays it", async () => {
            (apiService.get as jest.Mock).mockResolvedValue({message: "Event found", event: { ...workEvent }});

            setup();

            await waitFor(() => {
                expect(screen.getByText("Some description")).toBeInTheDocument();
                expect(screen.getByText("John Doe")).toBeInTheDocument();
            })
        });

        it("navigates to dashboard for event not found", async () => {
            (apiService.get as jest.Mock).mockRejectedValue(new Error("Event not found"));

            setup();
            await waitFor(async () => {
                  expect(mockToastError).toHaveBeenCalledWith("Event not found. Returning to dashboard.", {autoClose: 1500, position: "top-right"});
            });

            expect(await screen.findByText("Dashboard Page")).toBeInTheDocument();
        });

        it("navigates to dashboard for no event id", async () => {
            (apiService.get as jest.Mock).mockRejectedValue(new Error("Event Id is required"));

            setup();
            await waitFor(async () => {
                expect(mockToastError).toHaveBeenCalledWith("Event Id is required. Returning to dashboard.", {autoClose: 1500, position: "top-right"});
            });

            expect(await screen.findByText("Dashboard Page")).toBeInTheDocument();
        });

        it("navigates back for all other fetch event errors", async () => {
            (apiService.get as jest.Mock).mockRejectedValue(new Error("Some other error"));
            setup();
            await waitFor(async () => {
                expect(mockToastError).toHaveBeenCalledWith("An error occurred. Going back.", {autoClose: 1500, position: "top-right"});
            });

            expect(await screen.findByText("Events List Page")).toBeInTheDocument();
        });

        // Fetch client tests
        it("fetches client if not provided in event", async () => {
            const eventWithoutClient = { ...workEvent, clientId: "c1", client: undefined };
            (apiService.get as jest.Mock).mockReturnValue({message: "Client found", client: {id: "c1", legalName: "John Doe", dateOfBirth: "2025-09-13T11:00:00.000Z"
            }});
            setup( undefined, { event: eventWithoutClient });

            await waitFor(() => {
                expect(screen.getByText("Some description")).toBeInTheDocument();
                expect(screen.getByText("John Doe")).toBeInTheDocument();
                expect(apiService.get).toHaveBeenCalledWith("client/c1");
            });
        });
        it("navigates to the dashboard for client not found", async () => {
            const eventWithoutClient = { ...workEvent, clientId: "c1", client: undefined };
            (apiService.get as jest.Mock).mockRejectedValue(new Error("Client not found"));
            setup(undefined, { event: eventWithoutClient });

            await waitFor(async () => {
                expect(mockToastError).toHaveBeenCalledWith("Associated client for this event not found. Returning to dashboard.", {autoClose: 1500, position: "top-right"});

                expect(await screen.findByText("Dashboard Page")).toBeInTheDocument();
            });
        });
        it("navigates to the dashboard for no client id", async () => {
            const eventWithoutClient = { ...workEvent, clientId: "c1", client: undefined };
            (apiService.get as jest.Mock).mockRejectedValue(new Error("Client Id is required"));
            setup(undefined, { event: eventWithoutClient });

            await waitFor(async () => {
                expect(mockToastError).toHaveBeenCalledWith("Client Id is required. Returning to dashboard.", {autoClose: 1500, position: "top-right"});

                expect(await screen.findByText("Dashboard Page")).toBeInTheDocument();
            });
        });

        it("navigates back for all other fetch client errors", async () => {
            const eventWithoutClient = { ...workEvent, clientId: "c1", client: undefined };
            (apiService.get as jest.Mock).mockRejectedValue(new Error("Some other error"));
            setup(undefined, { event: eventWithoutClient });

            await waitFor(async () => {
                expect(mockToastError).toHaveBeenCalledWith("An error occurred. Going back.", {autoClose: 1500, position: "top-right"});

                expect(await screen.findByText("Events List Page")).toBeInTheDocument();
            });
        });


        it("loads and displays an event from state without api call", async () => {
            const mocked = (apiService.get as jest.Mock).mockResolvedValue({message: "Event found", event: { ...workEvent }});

            setup(undefined, { event: { ...workEvent }});

            await waitFor(() => {
                expect(screen.getByText("Some description")).toBeInTheDocument();
                expect(screen.getByText("John Doe")).toBeInTheDocument();
                expect(mocked).not.toHaveBeenCalled();
            })
        });

        it("displays medical event details correctly", async () => {
            const medicalEvent = { ...workEvent, type: "MEDICAL", medical: { recordNumber: "m3147", doctor: "Dr. Smith", doctorType: "Primary Care", appointmentForCondition: "General Health" }};
            setup(undefined, {event:  { ...medicalEvent } });
            expect(await screen.findByText("Medical Info")).toBeInTheDocument();
            expect(await screen.findByText("m3147")).toBeInTheDocument();
            expect(screen.getByText("Dr. Smith")).toBeInTheDocument();
            expect(screen.getByText("Primary Care")).toBeInTheDocument();
            expect(screen.getByText("General Health")).toBeInTheDocument();
            expect(screen.getAllByText("N/A").length).toBe(3); // Two N/A for any missing optional fields
        });
        it("displays the record dates if included", async () => {
            const medicalEvent = { ...workEvent, type: "MEDICAL", medical: { recordNumber: "m3147", doctor: "Dr. Smith", doctorType: "Primary Care", appointmentForCondition: "General Health", recordTakenToHouseDate: "2025-09-11T11:00:00.000Z", recordPrintedDate: "2025-09-10T11:00:00.000Z", recordFiledDate: "2025-09-12T11:00:00.000Z" }};
            setup(undefined, {event:  { ...medicalEvent } });
            await waitFor(() => {
                expect(screen.getByText("09/10/2025")).toBeInTheDocument();
                expect(screen.getByText("09/11/2025")).toBeInTheDocument();
                expect(screen.getByText("09/12/2025")).toBeInTheDocument();
            })
        })

    });
