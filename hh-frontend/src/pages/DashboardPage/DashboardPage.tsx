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
        <div>
            <Card>
                <h1>Dashboard</h1>
                {employee?.name}
                {dashboard}
            </Card>
        </div>
    );
}

export default DashboardPage;