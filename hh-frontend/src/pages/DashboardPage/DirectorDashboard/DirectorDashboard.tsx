import {Link} from "react-router-dom";
import HouseLogo from "../../../assets/HouseLogo";
import Button from "../../../components/Button/Button";
import styles from "./DirectorDashboard.module.css";
const DirectorDashboard = () => {
    return (
        <main>
            <Link to="/view-houses" >
                <Button variant="primary" className={styles.button}>
                    <HouseLogo /> Manage Houses
                </Button>
            </Link>
        </main>
    );
}

export default DirectorDashboard;