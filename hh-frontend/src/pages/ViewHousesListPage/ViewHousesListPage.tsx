import Card from "../../components/Card/Card";
import {useAuth} from "../../context/AuthContext";
import Button from "../../components/Button/Button";
import {Link} from "react-router-dom";


const ViewHousesListPage = () => {
    const {employee} = useAuth();
    return (
        <div>
            <Card>
                <h1>Houses</h1>
                {["ADMIN", "DIRECTOR"].includes(employee?.position as string) && <div><Link to="/add-house"><Button>Add House</Button></Link></div>}
            </Card>
        </div>
    );
}

export default ViewHousesListPage;