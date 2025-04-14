import {useAuth} from "../../context/AuthContext";
import Card from "../../components/Card/Card";

const DashboardPage = () => {
    const {employee} = useAuth();

    return (
        <div>
            <Card>
                <h1>Dashboard</h1>
                {employee?.name}
            </Card>
        </div>
    );
}

export default DashboardPage;