import {useState} from "react";
import apiService from "../../utility/ApiService";


export const useDelete = () => {
    const [status, setStatus] = useState("idle");

    const remove = async (url: string) => {
        setStatus("loading");
        try {
            const response: {data?: any} = await apiService.delete(url);
            setStatus("success");
            return response.data;
        } catch (error: any) {
            setStatus("error");
        }
    }

    return {status, remove};
}