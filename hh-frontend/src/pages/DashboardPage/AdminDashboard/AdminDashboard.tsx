import Button from "../../../components/Button/Button";
import styles from './AdminDashboard.module.css';
import ClientIcon from '../../../assets/ClientLogo';
import {Link} from "react-router-dom";

const AdminDashboard = () => {
    return (
        <main>
            <aside className={styles.sidebar}>
                <Link to="/view-clients">
                    <Button className="flex flex-col items-center text-center" variant="secondary">
                        <ClientIcon className="m-auto fill-current w-25 p-0" />
                        <div>Manage Clients</div>
                    </Button>
                </Link>

            </aside>
        </main>
    );
}

export default AdminDashboard;