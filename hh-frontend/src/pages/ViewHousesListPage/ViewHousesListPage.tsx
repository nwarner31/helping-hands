import {useAuth} from "../../context/AuthContext";
import Button from "../../components/Buttons/Button/Button";
import {Link, useLoaderData} from "react-router-dom";
import apiService from "../../utility/ApiService";
import {House} from "../../models/House";
import ViewHouseListItem from "./ViewHouseListItem";
import Modal from "../../components/Modal/Modal";
import {useState} from "react";
import {Client} from "../../models/Client";
import {Employee} from "../../models/Employee";
import PageCard from "../../components/Cards/PageCard/PageCard";


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
        <div className="flex justify-center items-center min-h-screen bg-slate-100">
            <PageCard size="md-lg" className="py-5 px-2" title="Houses" >
                {canEdit && <div><Link to="/add-house"><Button className="w-full">Add House</Button></Link></div>}
                {houseList.map((house, index) => <ViewHouseListItem house={house} isOdd={index % 2 === 0} key={house.id} canEdit={canEdit} onRemoveClient={removeHandlerClient} onRemoveManager={removeHandlerManager} />)}
            </PageCard>
            {modalData.show && (
                <Modal onClose={closeModal}>
                    <h2 className="m-0 py-1 px-3 bg-secondary text-white rounded-t-lg font-header font-bold text-lg" >Remove {modalData.client ? "Client" : "Manager"} from House</h2>
                    <div className="pt-1 px-3 pb-4 font-body">
                        <p>Do you want to remove this {modalData.client ? "client" : "manager"} from this house?</p>
                           <div className="ml-4">
                               <p>House: {modalData.house?.id}: {modalData.house?.name}</p>
                            {modalData.client && <p>Client: {modalData.client.id}: {modalData.client.legalName}</p>}
                            {modalData.manager && <p>Manager: {modalData.manager.id}: {modalData.manager.name}</p>}
                        </div>
                                         <div className="flex flex-col gap-y-3 sm:flex-row sm:gap-x-2 mt-4">
                            <Button className="grow" onClick={removeHandler}>Remove</Button>
                            <Button className="grow" onClick={closeModal} variant="accent">Cancel</Button>
                        </div>

                    </div>
                </Modal>
            )}
        </div>
    );
}

export default ViewHousesListPage;

export const loader = async () => apiService.get("house");