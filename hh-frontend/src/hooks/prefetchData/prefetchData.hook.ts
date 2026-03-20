import {useLocation} from "react-router-dom";
import {useCallback, useState} from "react";
import apiService from "../../utility/ApiService";


export const usePrefetchData = <T>(key: string, url: string, initialData: T | null = null) => {
    const location = useLocation();
    const prefetch = location.state ? location.state[key] : null;

    const [data, setData] = useState<T|null>(() => prefetch ?? initialData);
    const [loading, setLoading] = useState(!prefetch);
    const [error, setError] = useState<string|null>(null);

    const fetchData = useCallback(async () => {
        if(data !== null) return;
        setLoading(true);
        try {
            const response = await apiService.get<{data: T}>(url);
            setData(response.data);
        } catch (error: any) {
            setError(error.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    }, [url, data]);

    return { data, setData, fetchData, loading, error};
}