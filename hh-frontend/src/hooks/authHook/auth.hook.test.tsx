import { renderHook, act } from "@testing-library/react";
import { useLogin, useLogout, useRegister } from "./auth.hook";

// Mock the validation schemas and mapper
jest.mock("../../utility/validation/employee.validation", () => ({
    LoginSchema: { safeParse: jest.fn() },
    RegisterSchema: { safeParse: jest.fn() },
}));

jest.mock("../../utility/validation/utility.validation", () => ({
    mapZodErrors: jest.fn(),
}));

// Mock ApiService
jest.mock("../../utility/ApiService", () => ({
    post: jest.fn(),
}));

// Mock useAuth from AuthContext used inside hooks
jest.mock("../../context/AuthContext", () => ({
    useAuth: jest.fn(),
}));

import apiService from "../../utility/ApiService";
import { LoginSchema, RegisterSchema } from "../../utility/validation/employee.validation";
import { mapZodErrors } from "../../utility/validation/utility.validation";
import { useAuth } from "../../context/AuthContext";

const mockedApiPost = apiService.post as jest.Mock;
const mockedLoginSafeParse = (LoginSchema as any).safeParse as jest.Mock;
const mockedRegisterSafeParse = (RegisterSchema as any).safeParse as jest.Mock;
const mockedMapErrors = mapZodErrors as jest.MockedFunction<typeof mapZodErrors>;
const mockedUseAuth = useAuth as jest.Mock;

describe("useLogin hook", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns false and sets field errors when validation fails", async () => {
        mockedLoginSafeParse.mockReturnValue({ success: false, error: { /* zod error shape */ } });
        mockedMapErrors.mockReturnValue({ email: "Email is required", password: "Password is required" });

        const loginFn = jest.fn();
        mockedUseAuth.mockReturnValue({ login: loginFn });

        const { result } = renderHook(() => useLogin());

        let res: any;
        await act(async () => {
            res = await result.current.login({ email: "", password: "" });
        });

        expect(res).toBe(false);
        expect(result.current.status).toBe("error");
        expect(result.current.errors.email).toBe("Email is required");
        expect(result.current.errors.password).toBe("Password is required");

        // clearError should clear a single field
        act(() => {
            result.current.clearError("email");
        });
        expect(result.current.errors.email).toBeUndefined();
        expect(result.current.errors.password).toBe("Password is required");
    });

    it("calls api and useAuth.login on successful validation", async () => {
        const mockEmployee = { id: "e1", name: "Emp" } as any;
        mockedLoginSafeParse.mockReturnValue({ success: true, data: { email: "a@b.com", password: "p" } });
        mockedApiPost.mockResolvedValue({ message: "ok", employee: mockEmployee, sessionToken: "tok" });

        const loginFn = jest.fn();
        mockedUseAuth.mockReturnValue({ login: loginFn });

        const { result } = renderHook(() => useLogin());

        let res: any;
        await act(async () => {
            res = await result.current.login({ email: "a@b.com", password: "p" });
        });

        expect(res).toBe(true);
        expect(result.current.status).toBe("success");
        expect(loginFn).toHaveBeenCalledWith(mockEmployee, "tok");
        expect(mockedApiPost).toHaveBeenCalledWith("auth/login", { email: "a@b.com", password: "p" });
    });

    it("handles api rejection and sets status failed", async () => {
        mockedLoginSafeParse.mockReturnValue({ success: true, data: { email: "a@b.com", password: "p" } });
        mockedApiPost.mockRejectedValue(new Error("network"));

        const loginFn = jest.fn();
        mockedUseAuth.mockReturnValue({ login: loginFn });

        const { result } = renderHook(() => useLogin());

        let res: any;
        await act(async () => {
            res = await result.current.login({ email: "a@b.com", password: "p" });
        });

        expect(res).toBe(false);
        expect(result.current.status).toBe("failed");
        expect(loginFn).not.toHaveBeenCalled();
    });
});

describe("useRegister hook", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns false and sets field errors when validation fails", async () => {
        mockedRegisterSafeParse.mockReturnValue({ success: false, error: {} });
        mockedMapErrors.mockReturnValue({ email: { message: "Email required" } as any });

        const loginFn = jest.fn();
        mockedUseAuth.mockReturnValue({ login: loginFn });

        const { result } = renderHook(() => useRegister());

        let res: any;
        await act(async () => {
            res = await result.current.register({} as any);
        });

        expect(res).toBe(false);
        expect(result.current.status).toBe("error");
        expect(result.current.errors.email).toEqual({ message: "Email required" } as any);

        act(() => result.current.clearError("email"));
        expect(result.current.errors.email).toBeUndefined();
    });

    it("calls api and logs in on successful registration", async () => {
        const mockEmployee = { id: "e2", name: "Reg" } as any;
        mockedRegisterSafeParse.mockReturnValue({ success: true, data: {} });
        mockedApiPost.mockResolvedValue({ message: "ok", employee: mockEmployee, sessionToken: "rtok" });

        const loginFn = jest.fn();
        mockedUseAuth.mockReturnValue({ login: loginFn });

        const { result } = renderHook(() => useRegister());

        let res: any;
        await act(async () => {
            res = await result.current.register({} as any);
        });

        expect(res).toBe(true);
        expect(result.current.status).toBe("success");
        expect(loginFn).toHaveBeenCalledWith(mockEmployee, "rtok");
        expect(mockedApiPost).toHaveBeenCalledWith("auth/register", {});
    });

    it("handles api rejection and sets status failed and errors from thrown error", async () => {
        mockedRegisterSafeParse.mockReturnValue({ success: true, data: {} });
        const errorObj = { errors: { email: { message: "already used" } } };
        mockedApiPost.mockRejectedValue(errorObj);

        const loginFn = jest.fn();
        mockedUseAuth.mockReturnValue({ login: loginFn });

        const { result } = renderHook(() => useRegister());

        let res: any;
        await act(async () => {
            res = await result.current.register({} as any);
        });

        expect(res).toBe(false);
        expect(result.current.status).toBe("failed");
        expect(result.current.errors).toEqual(errorObj.errors);
    });
});

describe("useLogout hook", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls useAuth.logout and api logout endpoint, then returns true", async () => {
        const logoutFn = jest.fn();
        mockedUseAuth.mockReturnValue({ logout: logoutFn });
        mockedApiPost.mockResolvedValue({});

        const { result } = renderHook(() => useLogout());

        let res: any;
        await act(async () => {
            res = await result.current.logout();
        });

        expect(res).toBe(true);
        expect(logoutFn).toHaveBeenCalledTimes(1);
        expect(mockedApiPost).toHaveBeenCalledWith("/auth/logout");
    });

    it("returns false when api logout request fails", async () => {
        const logoutFn = jest.fn();
        mockedUseAuth.mockReturnValue({ logout: logoutFn });
        mockedApiPost.mockRejectedValue(new Error("network"));

        const { result } = renderHook(() => useLogout());

        let res: any;
        await act(async () => {
            res = await result.current.logout();
        });

        expect(res).toBe(false);
        expect(logoutFn).toHaveBeenCalledTimes(1);
        expect(mockedApiPost).toHaveBeenCalledWith("/auth/logout");
    });
});

