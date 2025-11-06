import React from "react";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth, getAccessToken, setNewAccessToken } from "./AuthContext";
import { Employee } from "../models/Employee";

const mockEmployee: Employee = {
    password: "", position: "", primaryHouses: [], secondaryHouses: [],
    hireDate: "",
    id: "1",
    name: "Test User",
    email: "test@example.com"
    // add other required fields if your Employee model has them
};

function wrapper({ children }: { children: React.ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
}

describe("AuthContext", () => {
    it("throws an error if useAuth is called outside of provider", () => {
        expect(() => renderHook(() => useAuth())).toThrow("No context detected");
         });

    it("has default null values", () => {
        const { result } = renderHook(() => useAuth(), { wrapper });
        expect(result.current.employee).toBeNull();
        expect(result.current.accessToken).toBeNull();
        expect(getAccessToken()).toBeNull();
    });

    it("login updates employee and accessToken", () => {
        const { result } = renderHook(() => useAuth(), { wrapper });
        act(() => {
            result.current.login(mockEmployee, "token123");
        });

        expect(result.current.employee).toEqual(mockEmployee);
        expect(result.current.accessToken).toBe("token123");
        expect(getAccessToken()).toBe("token123");
    });

    it("logout clears employee and accessToken", () => {
        const { result } = renderHook(() => useAuth(), { wrapper });
        act(() => {
            result.current.login(mockEmployee, "token123");
            result.current.logout();
        });

        expect(result.current.employee).toBeNull();
        expect(result.current.accessToken).toBeNull();
        expect(getAccessToken()).toBeNull();
    });

    it("setNewAccessToken updates token in state and global variable", () => {
        const { result } = renderHook(() => useAuth(), { wrapper });
        act(() => {
            result.current.login(mockEmployee, "oldToken");
        });

        act(() => {
            setNewAccessToken("newToken");
        });

        expect(result.current.accessToken).toBe("newToken");
        expect(getAccessToken()).toBe("newToken");
    });
});