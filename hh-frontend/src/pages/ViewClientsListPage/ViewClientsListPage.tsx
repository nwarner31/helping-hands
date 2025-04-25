import Card from "../../components/Card/Card";
import {useAuth} from "../../context/AuthContext";
import {Link} from "react-router-dom";
import Button from "../../components/Button/Button";

const ViewClientsListPage = () => {
    const {employee} = useAuth();
    return (
        <div>
            <Card >
                <h1>Clients</h1>
                <aside>
                    {employee?.position === "ADMIN" && <Link to="/add-client"><Button>Add Client</Button></Link>}
                </aside>
            </Card>
        </div>
    );
}

export default ViewClientsListPage;