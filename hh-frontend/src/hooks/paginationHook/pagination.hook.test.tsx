import { act, renderHook } from "@testing-library/react";

import { usePagination } from "./pagination.hook";

describe("usePagination hook", () => {
    it("starts with page 1 and zero total pages", () => {
        const { result } = renderHook(() => usePagination());

        expect(result.current.page).toBe(1);
        expect(result.current.numPages).toBe(0);
    });

    it("setSearch stores the provided page and search terms for subsequent navigation", () => {
        const { result } = renderHook(() => usePagination());

        act(() => {
            result.current.setSearch(5, 3, { status: "open", city: "Boston" });
        });

        expect(result.current.page).toBe(3);
        expect(result.current.numPages).toBe(5);

        let response: ReturnType<typeof result.current.nextPage>;
        act(() => {
            response = result.current.nextPage();
        });

        expect(response!).toEqual({
            canAdvance: true,
            data: { status: "open", city: "Boston", page: 4 },
        });
        expect(result.current.page).toBe(4);
    });

    it("setSearch defaults the page to 1 and replaces previous search terms", () => {
        const { result } = renderHook(() => usePagination());

        act(() => {
            result.current.setSearch(8, 4, { status: "open" });
        });

        act(() => {
            result.current.setSearch(3, undefined, { name: "Jane" });
        });

        expect(result.current.page).toBe(1);
        expect(result.current.numPages).toBe(3);

        let response: ReturnType<typeof result.current.nextPage>;
        act(() => {
            response = result.current.nextPage();
        });

        expect(response!).toEqual({
            canAdvance: true,
            data: { name: "Jane", page: 2 },
        });
        expect(result.current.page).toBe(2);
    });

    it("clears previous search terms when setSearch is called without new terms", () => {
        const { result } = renderHook(() => usePagination());

        act(() => {
            result.current.setSearch(4, 2, { status: "open" });
        });

        act(() => {
            result.current.setSearch(4);
        });

        let response: ReturnType<typeof result.current.nextPage>;
        act(() => {
            response = result.current.nextPage();
        });

        expect(response!).toEqual({
            canAdvance: true,
            data: { page: 2 },
        });
        expect(result.current.page).toBe(2);
    });

    it("previousPage moves back when possible and returns the merged query data", () => {
        const { result } = renderHook(() => usePagination());

        act(() => {
            result.current.setSearch(6, 4);
        });

        let response: ReturnType<typeof result.current.previousPage>;
        act(() => {
            response = result.current.previousPage();
        });

        expect(response!).toEqual({
            canDecline: true,
            data: { page: 3 },
        });
        expect(result.current.page).toBe(3);
    });

    it("does not advance past the last page or decline before the first page", () => {
        const { result } = renderHook(() => usePagination());

        act(() => {
            result.current.setSearch(3, 3, { category: "houses" });
        });

        let nextResponse: ReturnType<typeof result.current.nextPage>;
        act(() => {
            nextResponse = result.current.nextPage();
        });

        expect(nextResponse!).toEqual({
            canAdvance: false,
            data: { category: "houses", page: 3 },
        });
        expect(result.current.page).toBe(3);

        act(() => {
            result.current.setSearch(3, 1, { category: "houses" });
        });

        let previousResponse: ReturnType<typeof result.current.previousPage>;
        act(() => {
            previousResponse = result.current.previousPage();
        });

        expect(previousResponse!).toEqual({
            canDecline: false,
            data: { category: "houses", page: 1 },
        });
        expect(result.current.page).toBe(1);
    });

    it("goToPage updates state for a valid page and keeps search terms in the returned data", () => {
        const { result } = renderHook(() => usePagination());

        act(() => {
            result.current.setSearch(5, 2, { filter: "recent" });
        });

        let response: ReturnType<typeof result.current.goToPage>;
        act(() => {
            response = result.current.goToPage(5);
        });

        expect(response!).toEqual({
            canGoTo: true,
            data: { filter: "recent", page: 5 },
        });
        expect(result.current.page).toBe(5);
    });

    it("goToPage rejects invalid page numbers and leaves state unchanged", () => {
        const { result } = renderHook(() => usePagination());

        act(() => {
            result.current.setSearch(4, 3, { filter: "recent" });
        });

        [0, -1, 5].forEach((pageNum) => {
            let response: ReturnType<typeof result.current.goToPage>;
            act(() => {
                response = result.current.goToPage(pageNum);
            });

            expect(response!).toEqual({
                canGoTo: false,
                data: { filter: "recent", page: 3 },
            });
            expect(result.current.page).toBe(3);
        });
    });

    it("does not allow goToPage when no pages have been set yet", () => {
        const { result } = renderHook(() => usePagination());

        let response: ReturnType<typeof result.current.goToPage>;
        act(() => {
            response = result.current.goToPage(1);
        });

        expect(response!).toEqual({
            canGoTo: false,
            data: { page: 1 },
        });
        expect(result.current.page).toBe(1);
        expect(result.current.numPages).toBe(0);
    });
});

