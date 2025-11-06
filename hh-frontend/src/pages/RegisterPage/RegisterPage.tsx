import React, { useState } from "react";
import Input from "../../components/Inputs/Input/Input";
import Button from "../../components/Buttons/Button/Button";
import StaticLabelInput from "../../components/Inputs/StaticLabelInput/StaticLabelInput";
import {Link} from "react-router-dom";
import Card from "../../components/Card/Card";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";
import PasswordInput from "../../components/Inputs/PasswordInput/PasswordInput";
import apiService from "../../utility/ApiService";
import {Employee} from "../../models/Employee";
import RadioInput from "../../components/Inputs/RadioInput/RadioInput";

interface FormValues {
    id: string;
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    hireDate: string;
    sex: string;
}
interface FormErrors {
    id?: string;
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    hireDate?: string;
}
const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const {login} = useAuth();
    const [formData, setFormData] = useState<FormValues>({
        id: "",
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        hireDate: "",
        sex: "F"
    });

    const [errors, setErrors] = useState<FormErrors>({
        id: "",
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        hireDate: "",
    });


    const validateForm = (values: FormValues): FormErrors => {
        const errors: FormErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!values.id.trim()) {
            errors.id = "Employee ID is required.";
        }

        if (!values.name.trim()) {
            errors.name = "Name is required.";
        }

        if (!values.email.trim()) {
            errors.email = "Email is required.";
        } else if (!emailRegex.test(values.email)) {
            errors.email = "Invalid email format.";
        }

        if (!values.password.trim()) {
            errors.password = "Password is required.";
        } else if (values.password.length < 8) {
            errors.password = "Password must be at least 8 characters.";
        }

        if (!values.confirmPassword.trim()) {
            errors.confirmPassword = "Confirm Password is required.";
        } else if (values.password !== values.confirmPassword) {
            errors.confirmPassword = "Passwords do not match.";
        }

        if (!values.hireDate.trim()) {
            errors.hireDate = "Hire Date is required.";
        }

        return errors;
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const updatedValues = { ...formData, [name]: value };
        setFormData(updatedValues);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validateForm(formData);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length === 0) {
            try {
                const response: {message: string, employee?: Employee, accessToken?: string} = await apiService.post('auth/register', formData);
                if(response.message === "Employee registered successfully" && response.employee && response.accessToken) {
                    login(response.employee, response.accessToken);
                    navigate("/dashboard");
                }
            } catch (error: any) {
                console.log(error.errors);
                setErrors(error.errors);
            }

        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-100">
            <Card className="max-w-100 py-3 flex flex-col items-center font-body gap-y-2 px-7">
                <h2 className="font-header text-2xl font-bold text-accent mb-3">Register</h2>
                <form onSubmit={handleSubmit} className="flex flex-col w-full items-center gap-y-5">

                        <Input label="Employee ID" name="id" type="text" onChange={handleChange} error={errors.id} containerClassName="w-full" />
                        <Input label="Name" name="name" type="text" onChange={handleChange} error={errors.name} containerClassName="w-full" />
                        <Input label="Email" name="email" type="text" onChange={handleChange} error={errors.email} containerClassName="w-full" />
                        <StaticLabelInput label="Hire Date" name="hireDate" value={formData.hireDate} type="date" onChange={handleChange} error={errors.hireDate} containerClass="w-full"  />
                        <PasswordInput value={formData.password} label="Password" name="password" onChange={handleChange} error={errors.password} />
                        <PasswordInput label="Confirm Password" name="confirmPassword" onChange={handleChange} value={formData.confirmPassword} error={errors.confirmPassword} />
                        <div className="w-full flex">
                            <RadioInput label="Female" name="sex" value="F" onChange={handleChange} variant="accent" isChecked={formData.sex === "F"} className="w-1/2" />
                            <RadioInput name="sex" isChecked={formData.sex === "M"} value="M" onChange={handleChange} label="Male" variant="accent" className="w-1/2" />
                        </div>
                        <Button type="submit" variant="primary" className="w-full">Register</Button>
                        <Link to='/login' style={{width: '100%'}}><Button variant="secondary" className="w-full">Login</Button></Link>

                      </form>
            </Card>
        </div>
    );
};

export default RegisterPage;
