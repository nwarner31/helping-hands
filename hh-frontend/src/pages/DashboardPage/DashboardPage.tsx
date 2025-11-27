import {useAuth} from "../../context/AuthContext";
import {useNavigate} from "react-router-dom";
import Card from "../../components/Card/Card";
import AdminDashboard from "./AdminDashboard/AdminDashboard";
import DirectorDashboard from "./DirectorDashboard/DirectorDashboard";
import Button from "../../components/Buttons/Button/Button";
import api from "../../utility/ApiService";

const DashboardPage = () => {
    const navigate = useNavigate();
    const {employee, logout} = useAuth();
    let dashboard = <div>Empty Dashboard</div>
    if(employee?.position === "ADMIN") {
        dashboard = <AdminDashboard />
    } else if (employee?.position === "DIRECTOR") {
        dashboard = <DirectorDashboard />
    }

    const logoutHandler = async () => {
        try {
            await api.post("/auth/logout");

        } catch (error) {

        }
        await logout();
        navigate("/")
    }
    return (
        <div className="min-h-screen bg-slate-100 flex justify-center items-center">
            <Card className="flex flex-col items-center py-5 w-auto">
                <h1 className="font-header text-2xl font-bold text-accent mb-4">Dashboard</h1>
                <Button type="button" onClick={logoutHandler}>Logout</Button>
                <span className="mb-3">{employee?.name}</span>
                {dashboard}
            </Card>
        </div>
    );
}

export default DashboardPage;