import {NextFunction, Request, Response} from "express";
import {getEmployees, putEmployee} from "../services/employee.service";
import {getEmployeeById} from "../services/auth.service";
import {EmployeeUpdateSchema} from "../validation/employee.validation";


export const getAllEmployees = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const employees = await getEmployees();
        res.status(200).json({message: "Employees found", data: employees});
    } catch (error) {
        return next(error);
    }
}

export const getEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const employeeId = req.params.employeeId;
        const employee = await getEmployeeById(employeeId);
        const {password, ...employeeData} = employee;
        res.status(200).json({message: "Employee found", data: employeeData});
    } catch (error: any) {
        if(error.message === "Employee not found") {
            return next({status: 404, message: "Employee not found"});
        }
        return next(error);
    }
}

export const updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const employeeId = req.params.employeeId;
        const parseResult = EmployeeUpdateSchema.safeParse(req.body);
        if(!parseResult.success) {
            return next({status: 400, message: "Validation failed", errors: parseResult.error.format()});
        }
        const employeeCheck = await getEmployeeById(employeeId);
        const updatedEmployee = await putEmployee(employeeId, parseResult.data);
        res.status(200).json({message: "Employee successfully updated", data: updatedEmployee});
    } catch (error: any) {
        if(error.message === "Employee not found") {
            return next({status: 404, message: "Employee not found"});
        }
        return next(error);
    }
}
