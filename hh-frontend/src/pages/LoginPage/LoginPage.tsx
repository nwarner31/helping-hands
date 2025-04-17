import Card from "../../components/Card/Card";
import Input from "../../components/Inputs/Input/Input";
import PasswordInput from "../../components/Inputs/PasswordInput/PasswordInput";
import Button from "../../components/Button/Button";
import styles from "./LoginPage.module.css";
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
}
const LoginPage = () => {
    const [loginData, setlogin] = useState<Login>({email: "", password: ""});
    const [errors, setErrors] = useState<Errors>({});
    const navigate = useNavigate();
    const {login} = useAuth();

    const handleUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setlogin(prevState => {return {...prevState, [e.target.name]: e.target.value}});
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
        const validationErrors = validateLogin(loginData);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length === 0) {
            const response: {message: string, employee?: Employee, accessToken?: string} = await apiService.post('auth/login', loginData);

            if(response.message === "Login successful" && response.employee && response.accessToken) {
                login(response.employee, response.accessToken);
                navigate("/dashboard");
            }
        }
    }
    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <h2 className={styles.title}>Login</h2>
                <form className={styles.form} onSubmit={loginUser}>
                    <Input label="Email" name="email" value={loginData.email} onChange={handleUpdate} error={errors.email} />
                    <PasswordInput label="Password" name="password" value={loginData.password} onChange={handleUpdate} error={errors.password} />
                    <Button type="submit" variant="primary" className={styles.button}>Login</Button>
                    <Link to='/register' style={{width: '100%'}}><Button variant="secondary" className={styles.button}>Register</Button></Link>
                </form>

            </Card>
        </div>
        );

}

export default LoginPage