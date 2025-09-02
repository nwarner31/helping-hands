import {useAuth} from "../../context/AuthContext";
import Card from "../../components/Card/Card";
import AdminDashboard from "./AdminDashboard/AdminDashboard";
import DirectorDashboard from "./DirectorDashboard/DirectorDashboard";

const DashboardPage = () => {
    const {employee} = useAuth();
    let dashboard = <div>Empty Dashboard</div>
    if(employee?.position === "ADMIN") {
        dashboard = <AdminDashboard />
    } else if (employee?.position === "DIRECTOR") {
        dashboard = <DirectorDashboard />
    }
    return (
        <div className="min-h-screen bg-slate-100 flex justify-center items-center">
            <Card className="flex flex-col items-center py-5 w-auto">
                <h1 className="font-header text-2xl font-bold text-accent mb-4">Dashboard</h1>
                <span className="mb-3">{employee?.name}</span>
                {dashboard}
            </Card>
        </div>
    );
}

export default DashboardPage;