import {useCallback, useState} from "react";
import {ZodObject} from "zod";
import {mapZodErrors, ValidationErrors} from "../../utility/validation/utility.validation";
import apiService from "../../utility/ApiService";


export const useMutate = <T>(url: string, method: "POST" | "PUT" | "PATCH", schema: ZodObject) => {
    const [status, setStatus] = useState("idle");
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [data, setData] = useState<T|null>(null);

    const mutate = useCallback(async (formData: T) => {
        setStatus("loading");
        setErrors({});
        try {
            const parsed = schema.safeParse(formData);
            if(!parsed.success) {
                const fieldErrors = mapZodErrors(parsed.error);
                setErrors(fieldErrors);
                return false;
            } else {
                let response: {data: T};
                if(method === "POST") response  = await apiService.post(url, formData);
                else if (method === "PUT") response = await apiService.put(url, formData);
                else if (method === "PATCH") response = await apiService.patch(url, formData);
                setStatus("success");
                setData(response!.data);
                return true;
            }
        } catch(error: any) {
            setStatus("error");
            setErrors(error.errors)
            return false;
        }
    }, [url, schema]);

    return {status, mutate, errors, data};
}