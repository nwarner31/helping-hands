import {useAuth} from "../../context/AuthContext";
import {useNavigate} from "react-router-dom";
import AdminDashboard from "./AdminDashboard/AdminDashboard";
import DirectorDashboard from "./DirectorDashboard/DirectorDashboard";
import Button from "../../components/Buttons/Button/Button";
import api from "../../utility/ApiService";
import PageCard from "../../components/Cards/PageCard/PageCard";

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
    // <Card className="flex flex-col items-center py-5 w-auto">
    return (
        <div className="min-h-screen bg-slate-100 flex justify-center items-center">
            <PageCard size="xs" title="Dashboard" className="py-5 px-3 items-center" >
                <Button type="button" onClick={logoutHandler} className="w-full">Logout</Button>
                <span className="mb-3">{employee?.name}</span>
                {dashboard}
            </PageCard>
        </div>
    );
}

export default DashboardPage;