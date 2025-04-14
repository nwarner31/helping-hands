import {createContext, ReactNode, useContext, useState} from "react";
import {Employee} from "../models/Employee";

interface AuthContextType {
    employee: Employee | null;
    accessToken: string | null;
    login: (employee: Employee, accessToken: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    const login = (employee: Employee, accessToken: string) => {
        setEmployee(employee);
        setAccessToken(accessToken);
    }
    const logout = () => {
        setEmployee(null);
        setAccessToken(null);
    }

    return (
        <AuthContext.Provider value={{employee, accessToken, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext);
    if(!context) throw new Error("No context detected");
    return context;
}