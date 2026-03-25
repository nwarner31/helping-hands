import { act, renderHook } from "@testing-library/react";
import { useDebounce } from "./debounce.hook";

describe("useDebounce hook", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it("returns the initial value immediately", () => {
        const { result } = renderHook(() => useDebounce("initial"));

        expect(result.current).toBe("initial");
    });

    it("updates the debounced value only after the provided delay", () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            {
                initialProps: {
                    value: "first",
                    delay: 300,
                },
            }
        );

        rerender({ value: "second", delay: 300 });

        expect(result.current).toBe("first");

        act(() => {
            jest.advanceTimersByTime(299);
        });

        expect(result.current).toBe("first");

        act(() => {
            jest.advanceTimersByTime(1);
        });

        expect(result.current).toBe("second");
    });

    it("cancels the previous timeout when the value changes again before the delay elapses", () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            {
                initialProps: {
                    value: "first",
                    delay: 300,
                },
            }
        );

        rerender({ value: "second", delay: 300 });

        act(() => {
            jest.advanceTimersByTime(200);
        });

        rerender({ value: "third", delay: 300 });

        act(() => {
            jest.advanceTimersByTime(299);
        });

        expect(result.current).toBe("first");

        act(() => {
            jest.advanceTimersByTime(1);
        });

        expect(result.current).toBe("third");
    });

    it("uses the default 500ms delay when one is not provided", () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value),
            {
                initialProps: {
                    value: "initial",
                },
            }
        );

        rerender({ value: "updated" });

        act(() => {
            jest.advanceTimersByTime(499);
        });

        expect(result.current).toBe("initial");

        act(() => {
            jest.advanceTimersByTime(1);
        });

        expect(result.current).toBe("updated");
    });

    it("clears the active timeout when the hook unmounts", () => {
        const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

        const { rerender, unmount } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            {
                initialProps: {
                    value: "first",
                    delay: 300,
                },
            }
        );

        rerender({ value: "second", delay: 300 });
        clearTimeoutSpy.mockClear();

        unmount();

        expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
    });
});

