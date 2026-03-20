import {useAuth} from "../../context/AuthContext";
import AdminDashboard from "./AdminDashboard/AdminDashboard";
import DirectorDashboard from "./DirectorDashboard/DirectorDashboard";
import PageCard from "../../components/Cards/PageCard/PageCard";

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
            <PageCard size="xs" title="Dashboard" className="py-5 px-3 items-center" >
                <div className="mb-3 text-right w-full mr-13">{employee?.name}</div>
                {dashboard}
            </PageCard>
        </div>
    );
}

export default DashboardPage;