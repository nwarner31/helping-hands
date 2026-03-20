import { act, renderHook } from "@testing-library/react";
import { usePrefetchData } from "./prefetchData.hook";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useLocation: jest.fn(),
}));

jest.mock("../../utility/ApiService", () => ({
    get: jest.fn(),
}));

import { useLocation } from "react-router-dom";
import apiService from "../../utility/ApiService";

const mockedUseLocation = useLocation as jest.Mock;
const mockedGet = apiService.get as jest.Mock;

describe("usePrefetchData hook", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("uses prefetched state data and does not start loading", () => {
        mockedUseLocation.mockReturnValue({
            state: {
                house: { id: "h1", name: "Prefetched House" },
            },
        });

        const { result } = renderHook(() =>
            usePrefetchData<{ id: string; name: string }>("house", "/houses/h1")
        );

        expect(result.current.data).toEqual({ id: "h1", name: "Prefetched House" });
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it("short-circuits fetchData when data already exists from route prefetch", async () => {
        mockedUseLocation.mockReturnValue({
            state: {
                client: { id: "c1", name: "Jane" },
            },
        });

        const { result } = renderHook(() =>
            usePrefetchData<{ id: string; name: string }>("client", "/clients/c1")
        );

        await act(async () => {
            await result.current.fetchData();
        });

        expect(mockedGet).not.toHaveBeenCalled();
        expect(result.current.data).toEqual({ id: "c1", name: "Jane" });
        expect(result.current.loading).toBe(false);
    });

    it("fetches data when no prefetch exists and updates state", async () => {
        mockedUseLocation.mockReturnValue({ state: null });
        mockedGet.mockResolvedValue({ data: { id: "e1", title: "Event" } });

        const { result } = renderHook(() =>
            usePrefetchData<{ id: string; title: string }>("event", "/events/e1")
        );

        expect(result.current.data).toBeNull();
        expect(result.current.loading).toBe(true);

        await act(async () => {
            await result.current.fetchData();
        });

        expect(mockedGet).toHaveBeenCalledWith("/events/e1");
        expect(result.current.data).toEqual({ id: "e1", title: "Event" });
        expect(result.current.error).toBeNull();
        expect(result.current.loading).toBe(false);
    });

    it("sets error message from thrown error and stops loading", async () => {
        mockedUseLocation.mockReturnValue({ state: null });
        mockedGet.mockRejectedValue(new Error("Network down"));

        const { result } = renderHook(() =>
            usePrefetchData<{ id: string }>("house", "/houses/h2")
        );

        await act(async () => {
            await result.current.fetchData();
        });

        expect(result.current.data).toBeNull();
        expect(result.current.error).toBe("Network down");
        expect(result.current.loading).toBe(false);
    });

    it("uses default error text when thrown error has no message", async () => {
        mockedUseLocation.mockReturnValue({ state: null });
        mockedGet.mockRejectedValue({});

        const { result } = renderHook(() =>
            usePrefetchData<{ id: string }>("house", "/houses/h3")
        );

        await act(async () => {
            await result.current.fetchData();
        });

        expect(result.current.error).toBe("Failed to load data");
        expect(result.current.loading).toBe(false);
    });

    it("does not call API when initialData is provided", async () => {
        mockedUseLocation.mockReturnValue({ state: null });

        const { result } = renderHook(() =>
            usePrefetchData<{ id: string; name: string }>(
                "house",
                "/houses/h4",
                { id: "h4", name: "Initial House" }
            )
        );

        await act(async () => {
            await result.current.fetchData();
        });

        expect(mockedGet).not.toHaveBeenCalled();
        expect(result.current.data).toEqual({ id: "h4", name: "Initial House" });
    });
});

