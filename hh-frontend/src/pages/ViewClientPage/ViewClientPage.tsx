import Card from "../../components/Card/Card";
import {Link, useLocation, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import apiService from "../../utility/ApiService";
import {Client} from "../../models/Client";
import {formatDate} from "../../utility/formatting";
import Accordion from "../../components/Accordion/Accordion";
import {House} from "../../models/House";
import styles from "./ViewClientPage.module.css";
import {useAuth} from "../../context/AuthContext";
import Button from "../../components/Button/Button";


const emptyClient = {
    id: "",
    legalName: "",
    name: "",
    dateOfBirth: "",
    sex: "F"
}

const ViewClientPage = () => {
    const { clientId } = useParams();
    const location = useLocation();
    const {employee} = useAuth();
    const canEdit = ["ADMIN", "DIRECTOR", "MANAGER"].includes(employee?.position as string);
    const [clientData, setClientData] = useState<Client>(emptyClient);

    useEffect(() => {
        const fetchClient = async () => {
            const { client } = await apiService.get<{client: Client, message: string}>(`client/${clientId}`);
            setClientData(client);
        }
        const fetchHouse = async () => {
            const { house } = await apiService.get<{house: House}>(`house/${location.state.client.houseId}`);
            setClientData(prevState => ({...prevState, house: house}));
        }
        if(location.state && location.state.client) {
            if(!location.state.client.house && location.state.client.houseId) {
                fetchHouse();
            }

            setClientData(prevState => ({
                ...prevState,
                ...location.state.client,
            }))
        } else {
            fetchClient();
        }
    }, []);
    const roommates = clientData.house?.clients?.filter(client => client.id !== clientData.id) ?? [];
    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <h1 className={styles.title}>View Client</h1>
                <div className={styles.info}>
                    <div>Client Id: {clientData.id}</div>
                    <div>Legal Name: {clientData.legalName}</div>
                </div>
                <Accordion header="Basic Info" variant="primary" className={styles.section}>
                    <div className={styles["basic-data"]} >
                        <div>Date of Birth: {formatDate(clientData.dateOfBirth)}</div>
                        <div>Name: {clientData.name}</div>
                        <div>Sex: {clientData.sex}</div>
                    </div>

                </Accordion>
                {clientData.house &&
                <Accordion header="House Info" variant="secondary" className={styles.section}>
                    <div className={styles["house-data"]}>
                        <div className={styles["house-id-text"]}>House ID:</div><div className={styles["house-id-data"]}>{clientData.house.id}</div>
                        <div className={styles["house-name-text"]}>Name:  </div><div className={styles["house-name-data"]}>{clientData.house.name}</div>
                        <div className={styles["house-primary-text"]}>Primary Manager:</div><div className={styles["house-primary-data"]}>{clientData.house.primaryHouseManager ? `${clientData.house.primaryHouseManager.id} : ${clientData.house.primaryHouseManager.name}` : "N/A"}</div>
                        <div className={styles["house-secondary-text"]}>Secondary Manager:</div><div className={styles["house-secondary-data"]}>{clientData.house.secondaryHouseManager ? `${clientData.house.secondaryHouseManager.id} : ${clientData.house.secondaryHouseManager.name}` : "N/A"}</div>
                        <div className={styles["house-address-text"]}>Address:</div>
                        <div className={styles["house-address-data"]}>
                            <div>{clientData.house.street1}</div>
                            {clientData.house.street2 && <div>{clientData.house.street2}</div>}
                            <div>{clientData.house.city}, {clientData.house.state}</div>
                        </div>
                        <div className={styles["house-female-text"]}>Female Only:</div><div className={styles["house-female-data"]}>{clientData.house.femaleEmployeeOnly ?  "Yes" : "No"}</div>
                        <div className={styles["house-client-text"]}>Clients:</div><div>{clientData.house.clients?.length ?? 0}/{clientData.house.maxClients}</div>
                        <div className={styles["house-roommates-text"]}>Roommates:</div>
                        <div className={styles["house-roommate-data"]}>
                            {roommates.length > 0 ?  roommates.map(client => `${client.id}: ${client.legalName}`) : "No roommates" }
                        </div>
                    </div>

                </Accordion>}
                <Accordion header="Upcoming Events">
                    {canEdit && <Link to={`/client/${clientId}/add-event`} ><Button>Add Event</Button> </Link>}
                </Accordion>
            </Card>
        </div>
    );
}


export default ViewClientPage;