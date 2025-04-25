import {useAuth} from "../../context/AuthContext";
import Card from "../../components/Card/Card";
import AdminDashboard from "./AdminDashboard/AdminDashboard";

const DashboardPage = () => {
    const {employee} = useAuth();
    let dashboard = <div>Empty Dashboard</div>
    if(employee?.position === "ADMIN") {
        dashboard = <AdminDashboard />
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