import Card from "../../components/Card/Card";
import {useEffect, useState} from "react";
import apiService from "../../utility/ApiService";
import {useLocation, useParams} from "react-router-dom";
import {House} from "../../models/House";
import AddClientSearchList from "./AddClientSearchList";
import styles from "./AddHouseClientPage.module.css";
import {Client} from "../../models/Client";
import {formatDate} from "../../utility/formatting";

const emptyHouse = {
    houseId: "",
    name: "",
    street1: "",
    street2: "",
    city: "",
    state: "",
    maxClients: 1,
    femaleEmployeeOnly: false
}
const AddHouseClientPage = () => {
    const { houseId } = useParams();
    const location = useLocation();
    useEffect(() => {
        const fetchHouse = async () => {
            const {house} = await apiService.get<{house: House}>(`house/${houseId}`);
            setHouseData({...house});
        }
        const fetchClients = async() => {
            const {clients} = await apiService.get<{clients: Client[]}>("client/no-house");
            setClientsData(clients);
        }
        if(location.state && location.state.house) {
            setHouseData(prevState => ({
                ...prevState,
                ...location.state.house
            }));
        } else {
            fetchHouse();
        }
        fetchClients();
    }, []);

    const [houseData, setHouseData] = useState<House>(emptyHouse);
    const [clientsData, setClientsData] = useState<Client[]>([]);
    return (
        <div className={styles.container}>
            <Card className={styles.page}>
                <h1 className={styles.title}>Add Client to House</h1>
                <table className={styles["house-table"]}>
                    <thead>
                    <tr>
                        <th>House ID</th>
                        <th>House Name</th>
                    </tr>

                    </thead>
                    <tbody>
                        <tr>
                            <td>{houseData.houseId}</td>
                            <td>{houseData.name}</td>
                        </tr>
                    </tbody>

                </table>
                <div>Current Clients: {houseData.clients?.length}/{houseData.maxClients}</div>
                {houseData.clients && houseData.clients.length > 0 &&
                <table data-testid="house-clients-table">
                    <thead>
                        <tr>
                            <th>Client ID</th>
                            <th>Legal Name</th>
                            <th>Date of Birth</th>
                            <th>Sex</th>
                        </tr>
                    </thead>
                    <tbody>
                    {houseData.clients.map((client) => (
                        <tr key={client.clientId}>
                            <td>{client.clientId}</td>
                            <td>{client.legalName}</td>
                            <td>{formatDate(client.dateOfBirth)}</td>
                            <td>{client.sex}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>}
                <AddClientSearchList clients={clientsData} houseId={houseData.houseId} />
            </Card>
        </div>
    );
}

export default AddHouseClientPage;