import React, { useState } from "react";
import styles from "./RegisterPage.module.css";
import Input from "../../components/Inputs/Input/Input";
import Button from "../../components/Button/Button";
import DateInput from "../../components/Inputs/DateInput/DateInput";
import {Link} from "react-router-dom";
import Card from "../../components/Card/Card";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";
import PasswordInput from "../../components/Inputs/PasswordInput/PasswordInput";
import apiService from "../../utility/ApiService";
import {Employee} from "../../models/Employee";

interface FormValues {
    employeeId: string;
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    hireDate: string;
}
interface FormErrors {
    employeeId?: string;
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
        employeeId: "",
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        hireDate: "",
    });

    const [errors, setErrors] = useState<FormErrors>({
        employeeId: "",
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        hireDate: "",
    });


    const validateForm = (values: FormValues): FormErrors => {
        const errors: FormErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!values.employeeId.trim()) {
            errors.employeeId = "Employee ID is required.";
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
            const response: {message: string, employee?: Employee, accessToken?: string} = await apiService.post('auth/register', formData);
            if(response.message === "Employee registered successfully" && response.employee && response.accessToken) {
                login(response.employee, response.accessToken);
                navigate("/dashboard");
            }
        }
    };

    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <h2 className={styles.title}>Register</h2>
                <form onSubmit={handleSubmit} className={styles.inputs}>
                    <div className={styles.inputs}>
                        <Input label="Employee ID" name="employeeId" type="text" onChange={handleChange} error={errors.employeeId} />
                        <Input label="Name" name="name" type="text" onChange={handleChange} error={errors.name} />
                        <Input label="Email" name="email" type="text" onChange={handleChange} error={errors.email} />
                        <DateInput label="Hire Date" name="hireDate" value={formData.hireDate} onChange={handleChange} error={errors.hireDate}/>
                        <PasswordInput value={formData.password} label="Password" name="password" onChange={handleChange} error={errors.password} />
                        <PasswordInput label="Confirm Password" name="confirmPassword" onChange={handleChange} value={formData.confirmPassword} error={errors.confirmPassword} />

                        <Button type="submit" variant="primary" className={styles.button}>Register</Button>
                        <Link to='/login' style={{width: '100%'}}><Button variant="secondary" className={styles.button}>Login</Button></Link>
                    </div>
                      </form>
            </Card>
        </div>
    );
};

export default RegisterPage;
