import {NextFunction, Request, Response} from "express";
import {getEmployees} from "../services/employee.service";


export const getAllEmployees = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const employees = await getEmployees();
        res.status(200).json({message: "Employees found", data: employees});
    } catch (error) {
        return next(error);
    }
}
