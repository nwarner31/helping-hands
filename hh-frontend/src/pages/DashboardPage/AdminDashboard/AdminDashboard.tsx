import Button from "../../../components/Button/Button";
import ClientIcon from '../../../assets/ClientLogo';
import {Link} from "react-router-dom";
import HouseIcon from "../../../assets/HouseLogo";

const AdminDashboard = () => {
    return (
        <div >
            <Link to="/view-clients">
                <Button className="flex flex-col items-center text-center mb-4" variant="secondary">
                    <ClientIcon className="m-auto fill-current w-25 p-0" />
                    <div>Manage Clients</div>
                </Button>
            </Link>
            <Link to="/view-houses" >
                <Button variant="primary" className="flex flex-col items-center text-center">
                    <HouseIcon className="fill-current w-25 m-auto"  /> Manage Houses
                </Button>
            </Link>
        </div>
    );
}

export default AdminDashboard;