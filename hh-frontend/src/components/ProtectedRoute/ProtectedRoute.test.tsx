import { render, screen, waitFor } from "@testing-library/react";
import {Routes, Route, MemoryRouter} from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Mock the useAuth hook
jest.mock("../../context/AuthContext", () => ({
    useAuth: jest.fn()
}));

describe("ProtectedRoute", () => {
    it("should render the protected route if the user is authenticated", async () => {
        // Mock the `useAuth` hook to simulate an authenticated user
        const mockUseAuth = require("../../context/AuthContext").useAuth;
        mockUseAuth.mockReturnValue({ accessToken: "valid-token" });

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/" element={<ProtectedRoute />}>
                        <Route path="protected" element={<div>Protected Content</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        // Wait for the protected content to appear
        const protectedContent = await screen.findByText("Protected Content");
        expect(protectedContent).toBeInTheDocument();
    });

    it("should redirect if the user is not authenticated", async () => {
        // Mock the `useAuth` hook to simulate an unauthenticated user
        const mockUseAuth = require("../../context/AuthContext").useAuth;
        mockUseAuth.mockReturnValue({ accessToken: null });

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/" element={<ProtectedRoute redirect="/login" />}>
                        <Route path="protected" element={<div>Protected Content</div>} />

                    </Route>
                    <Route path="login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        // Wait for the redirection to happen and check if the login page is rendered
        await waitFor(() => expect(screen.getByText("Login Page")).toBeInTheDocument());

        // Check if "Protected Content" is not rendered (because the user was redirected)
        expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });
});
