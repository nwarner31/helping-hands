import {render, screen, waitFor} from "@testing-library/react";
import {userEvent} from "@testing-library/user-event";
import {BrowserRouter, useNavigate} from "react-router-dom";

import LoginPage from "./LoginPage";
import {AuthProvider} from "../../context/AuthContext";
import apiService from "../../utility/ApiService";

//jest.mock('../../config', () => ({API_BASE_URL: 'my-dummy-url'}));
// Mocking the API service (ApiService)
jest.mock("../../utility/ApiService", () => ({
    post: jest.fn(() => Promise.resolve({ message: "Login successful", employee: {}, accessToken: "hello" })),
}));

jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        useNavigate: jest.fn(), // override useNavigate
    };
});

const renderPage = () => render(<AuthProvider><BrowserRouter><LoginPage /></BrowserRouter></AuthProvider>);

describe("Login Page tests", () => {
    it("should render the inputs and buttons", () => {
        renderPage();

        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Login"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Register"})).toBeInTheDocument();
    });
    it("should display error messages for required fields", async () => {
       renderPage();

       await userEvent.click(screen.getByRole("button", {name: "Login"}));

       expect(await screen.findByText("Email is required.")).toBeInTheDocument();
       expect(await screen.findByText("Password is required.")).toBeInTheDocument();
    });
    it("should validate email format", async () => {
       renderPage();

        await userEvent.type(screen.getByLabelText("Email"), "invalid-email");

        await userEvent.click(screen.getByRole("button", { name: "Login" }));
        expect(await screen.findByText("Invalid email format.")).toBeInTheDocument();
    });
    it("should submit the form with valid data", async () => {
        renderPage();

        const mockNavigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

        await userEvent.type(screen.getByLabelText("Email"), "johndoe@example.com");
        await userEvent.type(screen.getByLabelText("Password"), "password123");

        const loginButton = screen.getByRole("button", {name: "Login"});
        await userEvent.click(loginButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/dashboard"); // or wherever you redirect
        });
    });
    it("should display the error message for invalid credentials", async () => {
        const mockPost = (apiService.post as jest.Mock).mockRejectedValue({message: "Invalid credentials"});
        renderPage();

        await userEvent.type(screen.getByLabelText("Email"), "johndoe@example.com");
        await userEvent.type(screen.getByLabelText("Password"), "wrong-password");
        const loginButton = screen.getByRole("button", {name: "Login"});
        await userEvent.click(loginButton);
        await waitFor(() => {
            expect(mockPost).toHaveBeenCalled();
            expect(screen.getByTestId("login-error")).toBeInTheDocument();
        })
    })

});