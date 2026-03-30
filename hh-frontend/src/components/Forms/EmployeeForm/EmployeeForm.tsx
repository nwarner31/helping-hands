import Input from "../../Inputs/Input/Input";
import React, {useState} from "react";
import {EmployeeFormData, positions} from "../../../models/Employee";
import StaticLabelInput from "../../Inputs/StaticLabelInput/StaticLabelInput";
import RadioInput from "../../Inputs/RadioInput/RadioInput";
import Button from "../../Buttons/Button/Button";
import {useNavigate} from "react-router-dom";
import Select from "../../Inputs/Select/Select";

const emptyEmployeeForm = {
    name: "",
    email: "",
    hireDate: "",
    sex: "F",
    position: "ASSOCIATE"
}

interface EmployeeFormProps {
    initialData?: EmployeeFormData;
    onSubmit: (data: EmployeeFormData) => void;
    errors: Record<string, string>;
}

const EmployeeForm = ({initialData = emptyEmployeeForm, onSubmit, errors}: EmployeeFormProps) => {
    const navigate = useNavigate();
    const [employeeData, setEmployeeData] = useState(initialData);


    const updateEmployeeData = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEmployeeData(prevState => ({...prevState, [name]: value}));
    }
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(employeeData);
    }
    return (
        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-y-6 items-center px-2 mt-4">
            <Input label="Name" name="name" value={employeeData.name} onChange={updateEmployeeData} error={errors.name} containerClassName="w-full" />
            <Input label="Email" name="email" value={employeeData.email} onChange={updateEmployeeData} error={errors.email} containerClassName="w-full" />
            <StaticLabelInput label="Hire Date" name="hireDate" type="date" value={employeeData.hireDate} onChange={updateEmployeeData} error={errors.hireDate} containerClass="w-full" />
            <div className="w-full flex">
                <RadioInput label="Female" name="sex" value="F" onChange={updateEmployeeData} variant="accent" isChecked={employeeData.sex === "F"} className="w-1/2" />
                <RadioInput name="sex" isChecked={employeeData.sex === "M"} value="M" onChange={updateEmployeeData} label="Male" variant="accent" className="w-1/2" />
            </div>
            <Select name="position" label="Position" options={positions} value={employeeData.position} onChange={updateEmployeeData} className="px-7" />
            <Button className="w-full">Update Employee</Button>
            <Button className="w-full" variant="secondary" type="button" onClick={() => navigate(-1)}>Cancel</Button>
        </form>
    );
}


export default EmployeeForm;