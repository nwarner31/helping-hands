import { act, renderHook } from "@testing-library/react";
import { useMutate } from "./mutate.hook";

jest.mock("../../utility/validation/utility.validation", () => ({
    mapZodErrors: jest.fn(),
}));

jest.mock("../../utility/ApiService", () => ({
    __esModule: true,
    default: {
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
    },
}));

import apiService from "../../utility/ApiService";
import { mapZodErrors } from "../../utility/validation/utility.validation";

const mockedPost = apiService.post as jest.Mock;
const mockedPut = apiService.put as jest.Mock;
const mockedPatch = apiService.patch as jest.Mock;
const mockedMapErrors = mapZodErrors as jest.MockedFunction<typeof mapZodErrors>;

describe("useMutate hook", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns initial state", () => {
        const schema = { safeParse: jest.fn() } as any;
        const { result } = renderHook(() => useMutate("/clients", "POST", schema));

        expect(result.current.status).toBe("idle");
        expect(result.current.errors).toEqual({});
        expect(result.current.data).toBeNull();
    });

    it("returns false and sets field errors when validation fails", async () => {
        const schema = { safeParse: jest.fn() } as any;
        schema.safeParse.mockReturnValue({ success: false, error: {} });
        mockedMapErrors.mockReturnValue({ name: "Name is required" });

        const { result } = renderHook(() => useMutate("/clients", "POST", schema));

        let response: boolean;
        await act(async () => {
            response = await result.current.mutate({ name: "" } as any);
        });

        expect(response!).toBe(false);
        expect(schema.safeParse).toHaveBeenCalledWith({ name: "" });
        expect(result.current.status).toBe("loading");
        expect(result.current.errors).toEqual({ name: "Name is required" });
        expect(mockedPost).not.toHaveBeenCalled();
        expect(mockedPut).not.toHaveBeenCalled();
        expect(mockedPatch).not.toHaveBeenCalled();
    });

    it("calls post, returns true, and sets success state", async () => {
        const schema = { safeParse: jest.fn() } as any;
        schema.safeParse.mockReturnValue({ success: true, data: { name: "John" } });
        mockedPost.mockResolvedValue({ data: { id: "1", name: "John" } });

        const { result } = renderHook(() => useMutate("/clients", "POST", schema));

        let response: boolean;
        await act(async () => {
            response = await result.current.mutate({ name: "John" } as any);
        });

        expect(response!).toBe(true);
        expect(mockedPost).toHaveBeenCalledWith("/clients", { name: "John" });
        expect(result.current.status).toBe("success");
        expect(result.current.errors).toEqual({});
        expect(result.current.data).toEqual({ id: "1", name: "John" });
    });

    it("calls put when method is PUT", async () => {
        const schema = { safeParse: jest.fn() } as any;
        schema.safeParse.mockReturnValue({ success: true, data: { id: "1", name: "Jane" } });
        mockedPut.mockResolvedValue({ data: { id: "1", name: "Jane" } });

        const { result } = renderHook(() => useMutate("/clients/1", "PUT", schema));

        await act(async () => {
            await result.current.mutate({ id: "1", name: "Jane" } as any);
        });

        expect(mockedPut).toHaveBeenCalledWith("/clients/1", { id: "1", name: "Jane" });
        expect(mockedPost).not.toHaveBeenCalled();
        expect(mockedPatch).not.toHaveBeenCalled();
        expect(result.current.status).toBe("success");
    });

    it("calls patch when method is PATCH", async () => {
        const schema = { safeParse: jest.fn() } as any;
        schema.safeParse.mockReturnValue({ success: true, data: { active: true } });
        mockedPatch.mockResolvedValue({ data: { id: "1", active: true } });

        const { result } = renderHook(() => useMutate("/clients/1", "PATCH", schema));

        await act(async () => {
            await result.current.mutate({ active: true } as any);
        });

        expect(mockedPatch).toHaveBeenCalledWith("/clients/1", { active: true });
        expect(mockedPost).not.toHaveBeenCalled();
        expect(mockedPut).not.toHaveBeenCalled();
        expect(result.current.status).toBe("success");
    });

    it("returns false and sets status error when API request fails", async () => {
        const schema = { safeParse: jest.fn() } as any;
        schema.safeParse.mockReturnValue({ success: true, data: { name: "John" } });
        mockedPost.mockRejectedValue(new Error("Network error"));

        const { result } = renderHook(() => useMutate("/clients", "POST", schema));

        let response: boolean;
        await act(async () => {
            response = await result.current.mutate({ name: "John" } as any);
        });

        expect(response!).toBe(false);
        expect(result.current.status).toBe("error");
    });
});

