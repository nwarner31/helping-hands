import Card from "../../components/Card/Card";
import Input from "../../components/Inputs/Input/Input";
import PasswordInput from "../../components/Inputs/PasswordInput/PasswordInput";
import Button from "../../components/Buttons/Button/Button";
import {Link} from "react-router-dom";
import React, {useState} from "react";
import apiService from "../../utility/ApiService";
import {Employee} from "../../models/Employee";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";

interface Login {
    email: string;
    password: string;
}
interface Errors {
    email?: string;
    password?: string;
    login?: string;
}
const LoginPage = () => {
    const [loginData, setlogin] = useState<Login>({email: "", password: ""});
    const [errors, setErrors] = useState<Errors>({});
    const navigate = useNavigate();
    const {login} = useAuth();

    const handleUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setlogin(prevState => {return {...prevState, [e.target.name]: e.target.value}});
    }

    const clearError = (field: keyof Errors) => {
        setErrors(prevErrors => ({...prevErrors, [field]: undefined, login: undefined}));
    }

    const validateLogin = (values: Login) => {
        const errors: Errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!values.email.trim()) {
            errors.email = "Email is required.";
        } else if (!emailRegex.test(values.email)) {
            errors.email = "Invalid email format.";
        }
        if (!values.password.trim()) {
            errors.password = "Password is required.";
        }
        return errors;
    }

    const loginUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const validationErrors = validateLogin(loginData);
            setErrors(validationErrors);
            if (Object.keys(validationErrors).length === 0) {
                const response: {
                    message: string,
                    employee?: Employee,
                    sessionToken?: string
                } = await apiService.post('auth/login', loginData);
                if (response.message === "Login successful" && response.employee && response.sessionToken) {
                    login(response.employee, response.sessionToken);
                    navigate("/dashboard");
                }
            }
        }catch (error: {message?: string} | any) {
                if(error.message === "Invalid credentials") {
                    setErrors({login: "Invalid email or password."});
                }

        }
    }
    return (
        <div className="flex justify-center items-center w-screen min-h-screen bg-slate-100">
            <Card className="p-4 w-full min-h-screen xs:max-w-100 xs:min-h-0 flex justify-center flex-col items-center font-body">
                <h1 className="text-accent text-2xl font-bold font-header mb-3">Login</h1>
                {errors.login && <div data-testid="login-error" className="text-red-600 text-center mb-2">{errors.login}</div>}
                <form className="flex flex-col w-full gap-y-3" onSubmit={loginUser}>
                    <Input label="Email" name="email" value={loginData.email} className="w-full" onChange={handleUpdate} error={errors.email} onFocus={() => clearError("email")} />
                    <PasswordInput label="Password" name="password" value={loginData.password} onChange={handleUpdate} error={errors.password} onFocus={() => clearError("password")} />
                    <Button type="submit" variant="primary" >Login</Button>
                    <Link to='/register' className="w-full"><Button variant="secondary" className="w-full">Register</Button></Link>
                </form>

            </Card>
        </div>
        );

}

export default LoginPage;