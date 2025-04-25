import {createContext, ReactNode, useContext, useState} from "react";
import {Employee} from "../models/Employee";

interface AuthContextType {
    employee: Employee | null;
    accessToken: string | null;
    login: (employee: Employee, accessToken: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
let currentToken: string | null = null;
let setAccessTokenState: ((token: string | null) => void) | null;
export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [accessToken, _setAccessToken] = useState<string | null>(null);
    setAccessTokenState = _setAccessToken;
    const login = (employee: Employee, accessToken: string) => {
        setEmployee(employee);
        _setAccessToken(accessToken);
        currentToken = accessToken;
    }
    const logout = () => {
        setEmployee(null);
        _setAccessToken(null);
        currentToken = null;
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

export function getAccessToken() { return currentToken;}
export function setNewAccessToken(newToken: string) {
    currentToken = newToken;
    if(setAccessTokenState) {
        setAccessTokenState(newToken);
    }
}