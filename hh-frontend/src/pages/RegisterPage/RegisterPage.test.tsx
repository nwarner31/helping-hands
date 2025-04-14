import {render, screen, waitFor} from "@testing-library/react";
import {userEvent} from "@testing-library/user-event";
import {BrowserRouter} from "react-router-dom";

import RegisterPage from "./RegisterPage";

//jest.mock('../../config', () => ({API_BASE_URL: 'my-dummy-url'}));
// Mocking the API service (ApiService)
jest.mock("../../utility/ApiService", () => ({
    post: jest.fn(() => Promise.resolve({ data: "success" })),
}));


const renderPage = () => render(<BrowserRouter><RegisterPage /></BrowserRouter>);

describe("Register Page tests", () => {
    it("renders all input fields and buttons", () => {
        renderPage();

        expect(screen.getByLabelText("Employee ID")).toBeInTheDocument();
        expect(screen.getByLabelText("Name")).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.getByLabelText("Hire Date")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
        expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    });
    it("should display error message for required fields", async () => {
        renderPage();

        // Submit the form without filling any fields
        await userEvent.click(screen.getByRole("button", { name: /register/i }));

        // Check for validation error messages
        expect(await screen.findByText("Employee ID is required.")).toBeInTheDocument();
        expect(await screen.findByText("Name is required.")).toBeInTheDocument();
        expect(await screen.findByText("Email is required.")).toBeInTheDocument();
        expect(await screen.findByText("Password is required.")).toBeInTheDocument();
        expect(await screen.findByText("Confirm Password is required.")).toBeInTheDocument();
        expect(await screen.findByText("Hire Date is required.")).toBeInTheDocument();
    });

    it("should validate email format", async () => {
        renderPage();

        await userEvent.type(screen.getByLabelText("Email"), "invalid-email");

        // Check for the validation error
        await userEvent.click(screen.getByRole("button", { name: /register/i }));
        expect(await screen.findByText("Invalid email format.")).toBeInTheDocument();
    });

    it("should match password and confirm password", async () => {
        renderPage();

        await userEvent.type(screen.getByLabelText("Password"), "my-password");
        await userEvent.type(screen.getByLabelText("Confirm Password"), "other-password");

        await userEvent.click(screen.getByRole("button", { name: /register/i }));
        expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    });

    it("should submit the form with valid data", async () => {
        renderPage();

        // Fill out the form with valid data
        await userEvent.type(screen.getByLabelText(/employee id/i), "12345");
        await userEvent.type(screen.getByLabelText(/name/i), "John Doe");
        await userEvent.type(screen.getByLabelText(/email/i), "johndoe@example.com");
        await userEvent.type(screen.getByLabelText("Password"), "password123");
        await userEvent.type(screen.getByLabelText(/confirm password/i), "password123");
        await userEvent.type(screen.getByLabelText(/hire date/i), "2023-01-01");

        // Mock the API call to resolve
        const submitButton = screen.getByRole("button", { name: /register/i });
        await userEvent.click(submitButton);

        // Wait for the API call and check if the submit was successful
        await waitFor(() => expect(screen.queryByText(/success/i)).toBeInTheDocument()); // assuming you display some success message after API call
    });
})