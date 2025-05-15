import {House} from "./House";

export interface Employee {
    employeeId: string;
    name: string;
    email: string;
    password?: string;
    position: string;
    hireDate: string;
    primaryHouses?: House[];
    secondaryHouses?: House[];
}