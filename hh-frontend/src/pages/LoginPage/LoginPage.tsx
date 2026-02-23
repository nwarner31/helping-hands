import Input from "../../components/Inputs/Input/Input";
import PasswordInput from "../../components/Inputs/PasswordInput/PasswordInput";
import Button from "../../components/Buttons/Button/Button";
import {Link} from "react-router-dom";
import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import PageCard from "../../components/Cards/PageCard/PageCard";
import {useLogin} from "../../hooks/auth.hook";
import ErrorText from "../../components/TextAreas/ErrorText/ErrorText";

interface Login {
    email: string;
    password: string;
}

const LoginPage = () => {
    const [loginData, setLogin] = useState<Login>({email: "", password: ""});
    const navigate = useNavigate();

    const { login, clearError, errors, status } = useLogin();

    const handleUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLogin(prevState => {return {...prevState, [e.target.name]: e.target.value}});
    }

    const loginUser = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await login(loginData);
        if(success) {
            navigate("/dashboard");
        }
    }

      return (
        <div className="flex justify-center items-center w-screen min-h-screen bg-slate-100">
           <PageCard size="xs" title="Login" className="p-4">
               {status === "failed" && <ErrorText text="Invalid Email or Password" id="login-error" className="mb-7" />}
               <form className="flex flex-col w-full gap-y-3" onSubmit={loginUser}>
                    <Input label="Email" name="email" value={loginData.email} className="w-full" onChange={handleUpdate} error={errors.email} onFocus={() => clearError("email")} />
                    <PasswordInput label="Password" name="password" value={loginData.password} onChange={handleUpdate} error={errors.password} onFocus={() => clearError("password")} />
                    <Button type="submit" variant="primary" >Login</Button>
                    <Link to='/register' className="w-full"><Button variant="secondary" className="w-full">Register</Button></Link>
                </form>
        </PageCard>

        </div>
        );
}

export default LoginPage;