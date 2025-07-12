import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes} from "react-router-dom";
import AddEditClientEventPage from "./AddEditClientEventPage";
import {Client} from "../../models/Client";


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
    post: jest.fn(() => Promise.resolve( { message: "Event created", event: { id: "123" }})),
    put: jest.fn(() => Promise.resolve({ message: "Event updated successfully", event: { id: "123" }})),
}));
// jest.mock("../../utility/ApiService", () => ({
//     __esModule: true,
//     default: {
//         post: jest.fn(() => Promise.resolve({ message: "Event added", event: { id: "123" } })),
//         put: jest.fn(() => Promise.resolve({ message: "Event updated successfully", event: { id: "123" } })),
//     }
// }));

describe("AddEditClientEventPage", () => {
    //const renderPage = (isEdit: boolean) => render(<BrowserRouter><AddEditClientEventPage isEdit={false} /></BrowserRouter>)

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

    // beforeEach(() => {
    //     jest.resetAllMocks();
    // });
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
        // const mockPost = jest.spyOn(apiService, "post").mockResolvedValue({
        //     message: "Event created",
        //     event: { id: "E1", type: "MEDICAL" },
        // });

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
});
