import {Link} from "react-router-dom";
import HouseLogo from "../../../assets/HouseLogo";
import Button from "../../../components/Button/Button";

const DirectorDashboard = () => {
    return (
        <main>
            <Link to="/view-houses" >
                <Button variant="primary" className="flex flex-col items-center text-center mb-4">
                    <HouseLogo className="fill-current w-25 m-auto"  /> Manage Houses
                </Button>
            </Link>
        </main>
    );
}

export default DirectorDashboard;