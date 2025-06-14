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