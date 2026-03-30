import {House} from "./House";

export interface Employee {
    id: string;
    name: string;
    email: string;
    password?: string;
    position: string;
    hireDate: string;
    sex: string;
    primaryHouses?: House[];
    secondaryHouses?: House[];
}

export interface EmployeeFormData {
    name: string,
    email: string,
    hireDate: string,
    sex: string,
    position: string
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

export const positions = [ {label: "Associate", value: "ASSOCIATE"}, {label: "Manager", value: "MANAGER"}, {label: "Director", value: "DIRECTOR"}, {label: "Admin", value: "ADMIN"}];

export const convertToEmployeeForm = (employee: Employee): EmployeeFormData => {
    return {
        ...employee,
        hireDate: employee.hireDate.split("T")[0] //formatDate(employee.hireDate)
    }
}