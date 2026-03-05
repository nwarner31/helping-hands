import { renderHook, act } from "@testing-library/react";
import { useGet } from "./get.hook";

jest.mock("../utility/ApiService", () => ({
    get: jest.fn(),
}));

import apiService from "../utility/ApiService";

const mockedGet = apiService.get as jest.Mock;

describe("useGet hook", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns true and updates data and status on successful fetch and cleans query params", async () => {
        const initialData: any[] = [];
        const responseData = [{ id: "1" }];
        mockedGet.mockResolvedValue({ data: responseData });

        const { result } = renderHook(() => useGet<any[]>("/test", initialData));

        let res: any;
        await act(async () => {
            // include empty and undefined values to ensure cleanQuery strips them
            res = await result.current.get({ a: "", b: undefined, c: "value" } as any);
        });

        expect(res).toBe(true);
        expect(result.current.status).toBe("success");
        expect(result.current.data).toEqual(responseData);
        expect(mockedGet).toHaveBeenCalledTimes(1);
        // ensure params passed are cleaned
        expect(mockedGet.mock.calls[0][1].params).toEqual({ c: "value" });
        expect(mockedGet.mock.calls[0][1].signal).toBeDefined();
    });

    it("sets errors and status 'error' when API returns 400 with validation errors", async () => {
        const initial = { items: [] };
        const err = { status: 400, errors: { field: "bad" } };
        mockedGet.mockRejectedValue(err);

        const { result } = renderHook(() => useGet<any>("/test", initial));

        let res: any;
        await act(async () => {
            res = await result.current.get();
        });

        expect(res).toBe(false);
        expect(result.current.status).toBe("error");
        expect(result.current.errors).toEqual({ field: "bad" });
        expect(result.current.data).toBe(initial);
    });

    it("sets status 'not_found' when API returns 404", async () => {
        const initial = { items: [] };
        mockedGet.mockRejectedValue({ status: 404 });

        const { result } = renderHook(() => useGet<any>("/test", initial));

        let res: any;
        await act(async () => {
            res = await result.current.get();
        });

        expect(res).toBe(false);
        expect(result.current.status).toBe("not_found");
        expect(result.current.data).toBe(initial);
    });

    it("sets status 'failed' and errors for string or generic errors", async () => {
        const initial: any[] = [];
        mockedGet.mockRejectedValue("something went wrong");

        const { result } = renderHook(() => useGet<any[]>("/test", initial));

        let res: any;
        await act(async () => {
            res = await result.current.get({});
        });

        expect(res).toBe(false);
        expect(result.current.status).toBe("failed");
        expect(result.current.errors).toBe("something went wrong");
    });

    it("clearErrors clears the errors state", async () => {
        const initial: any[] = [];
        mockedGet.mockRejectedValue({ status: 400, errors: { field: "bad" } });

        const { result } = renderHook(() => useGet<any[]>("/test", initial));

        await act(async () => {
            await result.current.get();
        });

        expect(result.current.errors).toEqual({ field: "bad" });
        expect(result.current.status).toBe("error");

        act(() => result.current.clearErrors());
        expect(result.current.errors).toBeNull();
    });

    it("returns false and does not set new state when the error indicates cancellation", async () => {
        const initial: any[] = [];
        mockedGet.mockRejectedValue({ name: "CanceledError" });

        const { result } = renderHook(() => useGet<any[]>("/test", initial));

        let res: any;
        await act(async () => {
            res = await result.current.get();
        });

        expect(res).toBe(false);
        // According to implementation, status was set to 'loading' before the call and not changed on cancel
        expect(result.current.status).toBe("loading");
        expect(result.current.errors).toBeNull();
    });

    it("aborts previous in-flight request when a new get is called and keeps final state from the latest call", async () => {
        const initial: any[] = [];
        let call = 0;

        mockedGet.mockImplementation((_url: string, config: any) => {
            call++;
            if (call === 1) {
                return new Promise((resolve, reject) => {
                    // reject when the signal is aborted
                    config.signal?.addEventListener("abort", () => reject({ name: "CanceledError" }));
                    // resolve later if not aborted (should not happen in this test)
                    setTimeout(() => resolve({ data: [{ id: "first" }] }), 50);
                });
            }
            // second call resolves immediately
            return Promise.resolve({ data: [{ id: "second" }] });
        });

        const { result } = renderHook(() => useGet<any[]>("/test", initial));

        let firstRes: any;
        let secondRes: any;

        await act(async () => {
            const p1 = result.current.get();
            const p2 = result.current.get();

            // await both; first should resolve to false due to cancellation
            firstRes = await p1;
            secondRes = await p2;
        });

        expect(firstRes).toBe(false);
        expect(secondRes).toBe(true);
        expect(result.current.status).toBe("success");
        expect(result.current.data).toEqual([{ id: "second" }]);
        expect(mockedGet).toHaveBeenCalledTimes(2);
    });

    it("sets status 'failed' and errors when API throws a generic object error", async () => {
        const initial: any[] = [];
        const genericErr = { message: "internal", code: 500 };
        mockedGet.mockRejectedValue(genericErr);

        const { result } = renderHook(() => useGet<any[]>("/test", initial));

        let res: any;
        await act(async () => {
            res = await result.current.get();
        });

        expect(res).toBe(false);
        expect(result.current.status).toBe("failed");
        expect(result.current.errors).toEqual(genericErr);
    });
});
