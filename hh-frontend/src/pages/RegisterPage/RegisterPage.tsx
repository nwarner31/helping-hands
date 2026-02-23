import React, { useState } from "react";
import Input from "../../components/Inputs/Input/Input";
import Button from "../../components/Buttons/Button/Button";
import StaticLabelInput from "../../components/Inputs/StaticLabelInput/StaticLabelInput";
import {useNavigate} from "react-router-dom";
import PasswordInput from "../../components/Inputs/PasswordInput/PasswordInput";
import { Register} from "../../models/Employee";
import RadioInput from "../../components/Inputs/RadioInput/RadioInput";
import PageCard from "../../components/Cards/PageCard/PageCard";
import LinkButton from "../../components/Buttons/LinkButton/LinkButton";
import {useRegister} from "../../hooks/auth.hook";

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    // const {login} = useAuth();
    const [formData, setFormData] = useState<Register>({
        id: "",
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        hireDate: "",
        sex: "F"
    });
    const { register, clearError, status, errors} = useRegister();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const updatedValues = { ...formData, [name]: value };
        setFormData(updatedValues);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await register(formData);
        if (success) {
            navigate("/dashboard");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-100">
            <PageCard size="xs" title="Register" className="py-4 px-5" >
                <form onSubmit={handleSubmit} className="flex flex-col w-full items-center gap-y-5">
                        <Input label="Employee ID" name="id" type="text" onChange={handleChange} error={errors.id} containerClassName="w-full" onFocus={() => clearError("id")} />
                        <Input label="Name" name="name" type="text" onChange={handleChange} error={errors.name} containerClassName="w-full" onFocus={() => clearError("name")} />
                        <Input label="Email" name="email" type="text" onChange={handleChange} error={errors.email} containerClassName="w-full" onFocus={() => clearError("email")} />
                        <StaticLabelInput label="Hire Date" name="hireDate" value={formData.hireDate} type="date" onChange={handleChange} error={errors.hireDate} containerClass="w-full" onFocus={() => clearError("hireDate")}  />
                        <PasswordInput value={formData.password} label="Password" name="password" onChange={handleChange} error={errors.password} containerClassName="w-full" onFocus={() => clearError("password")} />
                        <PasswordInput label="Confirm Password" name="confirmPassword" onChange={handleChange} value={formData.confirmPassword} error={errors.confirmPassword} containerClassName="w-full" onFocus={() => clearError("confirmPassword")} />
                        <div className="w-full flex">
                            <RadioInput label="Female" name="sex" value="F" onChange={handleChange} variant="accent" isChecked={formData.sex === "F"} className="w-1/2" />
                            <RadioInput name="sex" isChecked={formData.sex === "M"} value="M" onChange={handleChange} label="Male" variant="accent" className="w-1/2" />
                        </div>
                        <Button type="submit" variant="primary" className="w-full" disabled={status === "loading"}>{status === "loading" ? "Registering..." : "Register"}</Button>
                        <LinkButton to="/login" className="w-full" variant="secondary" >Login</LinkButton>

                      </form>
            </PageCard>
        </div>
    );
};

export default RegisterPage;
