import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes} from "react-router-dom";

const mockToastSuccess = jest.fn();
jest.mock("react-toastify", () => ({
    __esModule: true,
    toast: {
        success: mockToastSuccess
    },
}));
import AddClientEventPage from "./AddClientEventPage";
import {Client} from "../../../models/Client";
import {AuthProvider} from "../../../context/AuthContext";


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
jest.mock("../../../utility/ApiService", () => ({
    get: jest.fn(() => Promise.resolve()),
    post: jest.fn(() => Promise.resolve( { message: "Event created", data: { id: "123" }})),
}));

describe("AddClientEventPage", () => {

    const renderPage = (locationState: { client: Client } | undefined = undefined) => {
        render(
            <AuthProvider>
                <MemoryRouter initialEntries={[{pathname: "/client/abc123/event", state: locationState}]}>
                    <Routes>
                        <Route
                            path="/client/:clientId/event"
                            element={<AddClientEventPage />}
                        />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        );
    };

    it("renders basic form fields", async () => {
        renderPage();
        await waitFor(() => {
            expect(screen.getByLabelText(/event id/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/begin date/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/begin time/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/staff required/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/event type/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        })
    });

    it("does not render the client data initially (if if not returned by the prefetch data hook", async () => {
        renderPage();
        await waitFor(() => {
            expect(screen.queryByTestId("client-data")).not.toBeInTheDocument();
        });
    });

    it("renders the client when the data is available", async () => {
        renderPage({client: {id: "abc123", legalName: "John Doe", dateOfBirth: "1990-01-01", sex: "F"}});
        await waitFor(() => {
            expect(screen.queryByTestId("client-data")).toBeInTheDocument();
            expect(screen.getByText(/client id: abc123/i)).toBeInTheDocument();
            expect(screen.getByText(/name: john doe/i)).toBeInTheDocument();
            expect(screen.getByText(/date of birth: 01\/01\/1990/i)).toBeInTheDocument();
        });
    })

    it("shows validation errors when submitting empty form", async () => {
        renderPage();


        await waitFor(async () => {
            await userEvent.click(screen.getByRole("button", {name: /add event/i}));
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

        await waitFor(async () => {

            await userEvent.click(screen.getByRole("button", {name: /add event/i}));

            expect(screen.getByText(/begin date must be today or later/i)).toBeInTheDocument();
            expect(screen.getByText(/end date must be today or later/i)).toBeInTheDocument();
        });


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
        await waitFor(async () => {


            await userEvent.click(screen.getByRole("button", {name: /add event/i}));

            expect(screen.getByText("Number of staff must be at least 0")).toBeInTheDocument();
        });
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
        await waitFor(async () => {


            await userEvent.click(screen.getByRole("button", {name: /add event/i}));

            expect(screen.getByText("Number of staff must be an integer")).toBeInTheDocument();
        });
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
        await waitFor(async () => {


            await userEvent.click(screen.getByRole("button", {name: /add event/i}));

            expect(mockToastSuccess).toHaveBeenCalledWith("Event successfully added", {autoClose: 1500, position: "top-right"});
            expect(mockNavigate).toHaveBeenCalledWith("/view-client/abc123");
        });
    });

    it("renders and validates medical fields when event type is MEDICAL", async () => {
        renderPage();
        await userEvent.type(screen.getByLabelText(/event id/i), "EVT-MED-1");
        await userEvent.type(screen.getByLabelText(/begin date/i), "2028-07-10");
        await userEvent.type(screen.getByLabelText(/begin time/i), "09:00");
        await userEvent.type(screen.getByLabelText(/end date/i), "2028-07-10");
        await userEvent.type(screen.getByLabelText(/end time/i), "11:00");
        await userEvent.type(screen.getByLabelText(/staff required/i), "1");
        await userEvent.selectOptions(screen.getByLabelText(/event type/i), "MEDICAL");
        await userEvent.type(screen.getByLabelText(/description/i), "Checkup");
        await userEvent.click(screen.getByRole("button", {name: /add event/i}));
        await waitFor(async() => {

            expect(screen.getByText(/record number is required/i)).toBeInTheDocument();
            expect(screen.getByText(/doctor is required/i)).toBeInTheDocument();
            expect(screen.getByText(/doctor type is required/i)).toBeInTheDocument();
            expect(screen.getByText(/condition is required/i)).toBeInTheDocument();
        })
    });

    it("submits form with valid medical data and navigates", async () => {
        renderPage();
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

        await userEvent.click(screen.getByRole("button", {name: /add event/i}));
        await waitFor(async () => {


            expect(mockToastSuccess).toHaveBeenCalledWith("Event successfully added", {autoClose: 1500, position: "top-right"});
            expect(mockNavigate).toHaveBeenCalledWith("/view-client/abc123");
        })
    });
});