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


const ViewHousesListPage = () => {
    const {employee} = useAuth();
    const canEdit = ["ADMIN", "DIRECTOR"].includes(employee?.position as string);
    const [modalData, setModalData] = useState<{show: boolean, client: Client|undefined, house: House|undefined}>({show: false, client: undefined, house: undefined});
    const {houses} = useLoaderData() as {houses: House[], message: string};
    const [houseList, setHouseList] = useState(houses);
    const removeHandler = (house: House, client: Client) => {
        setModalData({show: true, client: client, house: house});
    }

    const removeClientHandler = async () => {
        const response = await apiService.delete<{message: string, house?: House}>(`house/${modalData.house?.houseId}/clients/${modalData.client?.clientId}`);
        if(response.house) {
            const updatedHouse = response.house;
            setHouseList(prevHouses =>
                prevHouses.map(house =>
                    house.houseId === updatedHouse.houseId ? { ...house, clients: updatedHouse.clients } : house
                )
            );
            setModalData({show: false, client: undefined, house: undefined});
        }
    }
    const closeModal = () => {
        setModalData({show: false, client: undefined, house: undefined});
    }
    return (
        <div className={styles.container}>
            <Card className={styles.page}>
                <h1 className={styles.title}>Houses</h1>
                {canEdit && <div><Link to="/add-house"><Button>Add House</Button></Link></div>}
                {houseList.map((house, index) => <ViewHouseListItem house={house} isOdd={index % 2 === 0} key={house.houseId} canEdit={canEdit} onRemoveClicked={removeHandler} />)}
            </Card>
            {modalData.show && (
                <Modal onClose={closeModal}>
                    <h2 className={styles["modal-head"]} >Remove Client from House</h2>
                    <div className={styles["modal-body"]}>
                        <p>Do you want to remove this client from this house?</p>
                        <p>House: {modalData.house?.houseId}: {modalData.house?.name}</p>
                        <p>Client: {modalData.client?.clientId}: {modalData.client?.legalName}</p>
                        <Button onClick={removeClientHandler}>Remove</Button>
                        <Button onClick={closeModal} variant="accent">Cancel</Button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default ViewHousesListPage;

export const loader = async () => apiService.get("house");