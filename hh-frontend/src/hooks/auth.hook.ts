import {useState} from "react";
import {LoginSchema, RegisterSchema} from "../utility/validation/employee.validation";
import {ErrorType, mapZodErrorsFromSchema} from "../utility/validation/utility.validation";
import {Employee, Register} from "../models/Employee";
import apiService from "../utility/ApiService";
import {useAuth} from "../context/AuthContext";


export const useLogin = () => {
    const [status, setStatus] = useState("idle");
    const [errors, setErrors] = useState<{email?: string, password?: string}>({email: undefined, password: undefined});
    const {login: loginEmployee} = useAuth();

    const login = async (loginData: {email: string, password: string}) => {
        setStatus("loading");
        try {
        const parsed = LoginSchema.safeParse(loginData);
        if(!parsed.success) {
            const fieldErrors = mapZodErrorsFromSchema(parsed.error);
            setStatus("error");
            setErrors(fieldErrors);
            return false;
        } else {
            const response: { message: string, employee: Employee, sessionToken: string
            } = await apiService.post('auth/login', loginData);
            setStatus("success");
            loginEmployee(response.employee, response.sessionToken);
            return true

        }
        } catch (error) {
            setStatus("failed");
            return false;
        }
    }

    const clearError = (field: string) => {
        setErrors(prevState => {return {...prevState, [field]: undefined}});
    }

    return {status, errors, login, clearError};
}

interface RegisterErrors {
    id?: ErrorType,
    name?: ErrorType,
    email?: ErrorType,
    password?: ErrorType,
    confirmPassword?: ErrorType,
    hireDate?: ErrorType,
}


export const useRegister = () => {
    const [status, setStatus] = useState("idle");
    const [errors, setErrors] = useState<RegisterErrors>({
        confirmPassword: undefined,
        email: undefined,
        hireDate: undefined,
        name: undefined,
        password: undefined,
        id: undefined
    });
    const {login} = useAuth();

    const register = async (registerData: Register) => {
        setStatus("loading");
        try {
            const parsed = RegisterSchema.safeParse(registerData);
            if(!parsed.success) {
                const fieldErrors = mapZodErrorsFromSchema(parsed.error);
                setStatus("error");
                setErrors(fieldErrors);
                return false;
            } else {
                const response: { message: string, employee: Employee, sessionToken: string} =
                    await apiService.post('auth/register', registerData);
                setStatus("success");
                login(response.employee, response.sessionToken);
                return true;
            }
        } catch (error: any) {
            setStatus("failed");
            setErrors(error.errors);
            return false;
        }
    }
    const clearError = (field: string) => {
        setErrors(prevState => {return {...prevState, [field]: undefined}});
    }
    return {status, errors, register, clearError};
}