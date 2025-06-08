import Card from "../../components/Card/Card";
import {useAuth} from "../../context/AuthContext";
import Button from "../../components/Button/Button";
import {Link, useLoaderData} from "react-router-dom";
import apiService from "../../utility/ApiService";
import {House} from "../../models/House";
import ViewHouseListItem from "./ViewHouseListItem";
import styles from "./ViewHouseListPage.module.css";
import Modal from "../../components/Modal/Modal";
import {useState} from "react";
import {Client} from "../../models/Client";
import {Employee} from "../../models/Employee";


const ViewHousesListPage = () => {
    const {employee} = useAuth();
    const canEdit = ["ADMIN", "DIRECTOR"].includes(employee?.position as string);
    const [modalData, setModalData] = useState<{show: boolean, client: Client|undefined, house: House|undefined, manager: Employee | undefined}>({show: false, client: undefined, house: undefined, manager: undefined});
    const {houses} = useLoaderData() as {houses: House[], message: string};
    const [houseList, setHouseList] = useState(houses);
    const removeHandlerClient = (house: House, client: Client) => {
        setModalData({show: true, client: client, house: house, manager: undefined});
    }
    const removeHandlerManager = (house: House, manager: Employee) => {
        setModalData({show: true, house: house, manager: manager, client: undefined});
    }

    const removeHandler = async () => {
        const url = `house/${modalData.house?.id}/${modalData.client ? `clients/${modalData.client.id}` : `manager/${modalData.manager?.id}`}`;
        const response = await apiService.delete<{message: string, house?: House}>(url);
        if(response.house) {
            const updatedHouse = response.house;
            const update: {clients?: Client[], primaryHouseManager?: Employee, secondaryHouseManager?: Employee} = {};
            if (response.message === "client removed from house") {
                update.clients = updatedHouse.clients;
            } else if (response.message === "manager removed from house") {
                update.primaryHouseManager = updatedHouse.primaryHouseManager;
                update.secondaryHouseManager = updatedHouse.secondaryHouseManager;

            }

            console.log(update);
            setHouseList(prevHouses =>

                prevHouses.map(house =>
                    house.id === updatedHouse.id ? { ...house, ...update } : house
                )
            );
            setModalData({show: false, client: undefined, house: undefined, manager: undefined});
        }
    }
    const closeModal = () => {
        setModalData({show: false, client: undefined, house: undefined, manager: undefined});
    }
    return (
        <div className={styles.container}>
            <Card className={styles.page}>
                <h1 className={styles.title}>Houses</h1>
                {canEdit && <div><Link to="/add-house"><Button>Add House</Button></Link></div>}
                {houseList.map((house, index) => <ViewHouseListItem house={house} isOdd={index % 2 === 0} key={house.id} canEdit={canEdit} onRemoveClient={removeHandlerClient} onRemoveManager={removeHandlerManager} />)}
            </Card>
            {modalData.show && (
                <Modal onClose={closeModal}>
                    <h2 className={styles["modal-head"]} >Remove {modalData.client ? "Client" : "Manager"} from House</h2>
                    <div className={styles["modal-body"]}>
                        <p>Do you want to remove this client from this house?</p>
                        <p>House: {modalData.house?.id}: {modalData.house?.name}</p>
                        {modalData.client && <p>Client: {modalData.client.id}: {modalData.client.legalName}</p>}
                        {modalData.manager && <p>Manager: {modalData.manager.id}: {modalData.manager.name}</p>}
                        <Button onClick={removeHandler}>Remove</Button>
                        <Button onClick={closeModal} variant="accent">Cancel</Button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default ViewHousesListPage;

export const loader = async () => apiService.get("house");