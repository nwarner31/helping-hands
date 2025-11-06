import { Request, Response, NextFunction } from "express";
import { registerEmployee, loginEmployee} from "../services/auth.service";
import { generateToken } from "../utility/token.utility";
import {Employee} from "@prisma/client";
import {EmployeeSchema} from "../validation/employee.validation";

interface EmployeeErrors {
    id?: string;
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    hireDate?: string;
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parseResult = EmployeeSchema.safeParse(req.body);
        if (!parseResult.success) {
            return next({status: 400, message: "Validation failed", errors: parseResult.error.format()});
        }
        const {confirmPassword, ...employeeData} = parseResult.data;
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
