import {House} from "./House";

export interface Employee {
    id: string;
    name: string;
    email: string;
    password?: string;
    position: string;
    hireDate: string;
    primaryHouses?: House[];
    secondaryHouses?: House[];
}

export interface Register {
    id: string;
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    hireDate: string;
    sex: string;
}