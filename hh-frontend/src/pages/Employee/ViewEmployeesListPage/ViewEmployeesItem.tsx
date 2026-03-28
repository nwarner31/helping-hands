import {Employee} from "../../../models/Employee";
import LinkButton from "../../../components/Buttons/LinkButton/LinkButton";
import {formatDate} from "../../../utility/formatting";


const ViewEmployeesItem = ({employee}: {employee: Employee}) => {

    return (
        <div className="grid font-body grid-cols-[2fr_2fr_3fr_1fr] sm:grid-cols-[2fr_2fr_3fr_1fr_2fr] md:grid-cols-[2fr_2fr_3fr_1fr_2fr_2fr] lg:grid-cols-[2fr_2fr_3fr_1fr_2fr_3fr_2fr] m-1 gap-x-1">
            <LinkButton to="" >Edit</LinkButton>
            <div>
                <div className="text-xs text-slate-700 font-semibold">Employee Id</div>
                <div className="text-sm">{employee.id}</div>
            </div>
            <div>
                <div className="text-xs text-slate-700 font-semibold">Employee Name</div>
                <div className="text-sm">{employee.name}</div>
            </div>
            <div>
                <div className="text-xs text-slate-700 font-semibold">Sex</div>
                <div className="text-sm">{employee.sex}</div>
            </div>
            <div className="hidden sm:block">
                <div className="text-xs text-slate-700 font-semibold">Position</div>
                <div className="text-sm">{employee.position}</div>
            </div>
            <div className="hidden lg:block">
                <div className="text-xs text-slate-700 font-semibold">Email</div>
                <div className="text-sm">{employee.email}</div>
            </div>
            <div className="hidden md:block">
                <div className="text-xs text-slate-700 font-semibold">Hire Date</div>
                <div className="text-sm">{formatDate(employee.hireDate)}</div>
            </div>
        </div>
    );
}


export default ViewEmployeesItem;