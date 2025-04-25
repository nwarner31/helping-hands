import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../../context/AuthContext";

jest.mock("../../context/AuthContext", () => ({
    useAuth: jest.fn(),
}));
const ProtectedComponent = () => <div>Protected Content</div>;
const LoginComponent = () => <div>Login Page</div>;

describe("ProtectedRoute", () => {
    afterEach(() => {
        jest.resetModules(); // reset mock state between tests
    });

    it("renders protected content if authenticated", async () => {
        (useAuth as jest.Mock).mockReturnValue({
            employee: { id: "1", name: "Jane", position: "ADMIN" },
            accessToken: "hello"
        });
        const { findByText } = render(
            <MemoryRouter initialEntries={["/protected"]}>
                <Routes>
                    <Route path="/protected" element={<ProtectedRoute redirect="/login"> <ProtectedComponent /></ProtectedRoute>} />
                    <Route path="/login" element={<LoginComponent />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await findByText("Protected Content")).toBeInTheDocument();
    });

    it("redirects to login if not authenticated", async () => {
        (useAuth as jest.Mock).mockReturnValue({
            employee: null,
            accessToken: null
        });
        const { findByText } = render(
            <MemoryRouter initialEntries={["/protected"]}>
                <Routes>
                    <Route path="/protected" element={<ProtectedRoute redirect="/login"> <ProtectedComponent /></ProtectedRoute>} />
                    <Route path="/login" element={<LoginComponent />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await findByText("Login Page")).toBeInTheDocument();
    });
});
