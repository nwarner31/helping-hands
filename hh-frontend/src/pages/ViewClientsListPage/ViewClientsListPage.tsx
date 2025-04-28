import Card from "../../components/Card/Card";
import {useAuth} from "../../context/AuthContext";
import {Link, useLoaderData} from "react-router-dom";
import Button from "../../components/Button/Button";
import apiService from "../../utility/ApiService";
import {Client} from "../../models/Client";
import ViewClientsItem from "./ViewClientsItem";
import styles from './ViewClientsListPage.module.css';

const ViewClientsListPage = () => {
    const {employee} = useAuth();
    const {clients} = useLoaderData() as {clients: Client[], message: string};
    return (
        <div className={styles.container}>
            <Card className={styles.page}>
                <h1 className={styles.header}>Clients</h1>
                <div >
                    <div>
                        {employee?.position === "ADMIN" && <Link to="/add-client"><Button>Add Client</Button></Link>}
                    </div>
                    <div className={styles.main}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>Client ID</th>
                                <th>Legal Name</th>
                                <th className={employee?.position === "ADMIN" ? styles.hideable : ""}>Name</th>
                                <th>Date of Birth</th>
                                {employee?.position === "ADMIN" && <th></th>}
                            </tr>
                            </thead>
                            <tbody>
                            {clients.map((client, index) => (<ViewClientsItem key={client.clientId} client={client} isAdmin={employee?.position === "ADMIN"} isOddRow={index % 2 === 0} /> ))}
                            </tbody>
                            </table>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default ViewClientsListPage;

export const loader = async () => apiService.get("client");