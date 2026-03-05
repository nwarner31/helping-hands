import { useCallback, useRef, useState } from "react";
import apiService from "../utility/ApiService";

export type UseGetStatus = "idle" | "loading" | "success" | "error" | "not_found" | "failed";


interface UseGetReturn<T> {
    status: UseGetStatus;
    data: T;
    errors: any;
    get: (queryOverride?: Record<string, any>) => Promise<boolean>;
    clearErrors: () => void;
}

function cleanQuery(query?: Record<string, any>) {
    if (!query) return undefined;
    const out: Record<string, any> = {};
    Object.keys(query).forEach((k) => {
        const v = query[k];
        // strip undefined / null and empty strings
        if (v === undefined || v === null) return;
        if (typeof v === "string" && v.trim() === "") return;
        out[k] = v;
    });
    return Object.keys(out).length ? out : undefined;
}

export const useGet = <T = any>(
    url: string,
    initialData: T
): UseGetReturn<T> => {
    const [status, setStatus] = useState<UseGetStatus>("idle");
    const [data, setData] = useState<T>(initialData);
    const [errors, setErrors] = useState<any>(null);

    // Keep a ref to the current abort controller so we can cancel previous requests
    const controllerRef = useRef<AbortController | null>(null);

    const clearErrors = useCallback(() => setErrors(null), []);

    const get = useCallback(
        async (query?: Record<string, any>) => {
            // Cancel any in-flight request
            if (controllerRef.current) {
                try {
                    controllerRef.current.abort();
                } catch (e) {
                    // istanbul ignore next - abort() can throw if the request already completed, but we can safely ignore that
                    return false;
                }
            }

            const controller = new AbortController();
            controllerRef.current = controller;

            const finalQuery = cleanQuery(query || undefined );

            setStatus("loading");
            setErrors(null);

            try {
                // ApiService expects axios-like config; pass params and the abort signal
                const response = await apiService.get<{message: string, data: T}>(url, { params: finalQuery, signal: controller.signal } as any);
                setData(response.data);
                setStatus("success");
                return true;
            } catch (err: any) {
                // If request was aborted, don't update state
                if (err && (err.name === "CanceledError" || err.message === "canceled")) {
                    return false;
                }

                // The ApiService.handleError returns `error.response?.data || "An error occurred"`
                // So `err` here is often the response body (object) or a string.
                // Try to detect common shapes: { status: 400, errors: {...} }, { status: 404 }, or raw string.
                if (err && typeof err === "object") {
                    const statusCode = err.status ?? err.statusCode ?? undefined;
                    if (statusCode === 404) {
                        setData(initialData);
                        setStatus("not_found");
                        return false;
                    }
                    if (statusCode === 400) {
                        // validation errors object
                        setErrors(err.errors ?? err);
                        setStatus("error");
                        return false;
                    }
                    // otherwise treat as generic error payload
                    setErrors(err);
                    setStatus("failed");
                    return false;
                }

                // string or unknown error
                setErrors(err ?? "An error occurred");
                setStatus("failed");
                return false;
            } finally {
                // Clear controller if it is still the current one
                if (controllerRef.current === controller) controllerRef.current = null;
            }
        },
        [url]
    );

    return { status, data, errors, get, clearErrors };
};
