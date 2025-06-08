import { Request, Response, NextFunction } from "express";
import { registerEmployee, loginEmployee} from "../services/auth.service";
import { generateToken } from "../utility/token.utility";
import {Employee} from "@prisma/client";

interface EmployeeErrors {
    id?: string;
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    hireDate?: string;
}
type EmployeeData = Employee & {confirmPassword: string};
const validateEmployeeData = (employee: EmployeeData) => {
    const errors: EmployeeErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!employee.id || !employee.id.trim()) {
        errors.id = "Employee ID is required.";
    }

    if (!employee.name || !employee.name.trim()) {
        errors.name = "Name is required.";
    }

    if (!employee.email || !employee.email.trim()) {
        errors.email = "Email is required.";
    } else if (!emailRegex.test(employee.email)) {
        errors.email = "Invalid email format.";
    }

    if (!employee.password || !employee.password.trim()) {
        errors.password = "Password is required.";
    } else if (employee.password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
    }

    if (!employee.confirmPassword || !employee.confirmPassword.trim()) {
        errors.confirmPassword = "Confirm Password is required.";
    } else if (employee.password !== employee.confirmPassword) {
        errors.confirmPassword = "Passwords do not match.";
    }

    if (employee.hireDate === undefined || employee.hireDate === null || employee.hireDate.toString().trim() === "") {
        errors.hireDate = "Hire date is required.";
    } else if (isNaN(new Date(employee.hireDate).getTime())) {
        errors.hireDate = "Hire date must be of a date format";
    }

    return errors;
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const errors = validateEmployeeData(req.body);
        if (Object.keys(errors).length > 0) {
            return next({status: 400, message: errors});
        }
        const {confirmPassword, ...employeeData} = req.body;
        employeeData.hireDate = new Date(employeeData.hireDate);
        const {password, ...employee} = await registerEmployee(employeeData);
        const {accessToken, refreshToken} = generateToken(employee.id);
        res.cookie("refreshToken", refreshToken, {httpOnly: true});
        res.status(201).json({ message: "Employee registered successfully", accessToken, employee });
    } catch (error) {
        return next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const errors: EmployeeErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!data.email || !data.email.trim()) {
            errors.email = "Email is required.";
        } else if (!emailRegex.test(data.email)) {
            errors.email = "Invalid email format.";
        }
        if (!data.password || !data.password.trim()) {
            errors.password = "Password is required.";
        }
        if (Object.keys(errors).length > 0) {

            return next({status: 400, message: errors});
        }
        const {password, ...employee} = await loginEmployee(req.body);
        const {accessToken, refreshToken} = generateToken(employee.id);
        res.cookie("refreshToken", refreshToken, {httpOnly: true});
        res.status(200).json({ message: "Login successful", accessToken, employee });
    } catch (error) {
        if (error instanceof Error && error.message === "Invalid credentials") {
            return next ({status: 400, message: error.message});
        }
        next(error);
    }
};
