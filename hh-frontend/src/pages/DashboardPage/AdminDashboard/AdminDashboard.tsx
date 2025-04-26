import Button from "../../../components/Button/Button";
//import clientLogo from '../../../assets/client-logo.png';
import styles from './AdminDashboard.module.css';
import ClientIcon from '../../../assets/ClientLogo';
import {Link} from "react-router-dom";
const AdminDashboard = () => {
    return (
        <main>
            <aside className={styles.sidebar}>
                <Link to="/view-clients">
                    <Button className={styles['sidebar-button']} variant="secondary">
                        <ClientIcon  />Manage Clients
                    </Button>
                </Link>

            </aside>
        </main>
    );
}

export default AdminDashboard;