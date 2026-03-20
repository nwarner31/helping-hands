import {useAuth} from "../../../context/AuthContext";
import Button from "../../../components/Buttons/Button/Button";
import {House} from "../../../models/House";
import ViewHouseListItem from "./ViewHouseListItem";
import Modal from "../../../components/Modal/Modal";
import {useEffect, useState} from "react";
import {Client} from "../../../models/Client";
import {Employee} from "../../../models/Employee";
import PageCard from "../../../components/Cards/PageCard/PageCard";
import {useGet} from "../../../hooks/getHook/get.hook";
import {useDelete} from "../../../hooks/deleteHook/delete.hook";
import List from "../../../components/List/List";
import ListItem from "../../../components/List/ListItem";
import LinkButton from "../../../components/Buttons/LinkButton/LinkButton";


const ViewHousesListPage = () => {
    const {employee} = useAuth();
    const canEdit = ["ADMIN", "DIRECTOR"].includes(employee?.position as string);
    const {data, get} = useGet<House[]>("house", []);
    const [modalData, setModalData] = useState<{show: boolean, client: Client|undefined, house: House|undefined, manager: Employee | undefined}>({show: false, client: undefined, house: undefined, manager: undefined});
    const [houseList, setHouseList] = useState<House[]>([]);
    const { remove} = useDelete();

    useEffect(() => {
        get();
    }, []);
    useEffect(() => {
        if (houseList.length === 0) {
            setHouseList([...data]);
        }

    }, [data]);

    const removeHandlerClient = (house: House, client: Client) => {
        setModalData({show: true, client: client, house: house, manager: undefined});
    }
    const removeHandlerManager = (house: House, manager: Employee) => {
        setModalData({show: true, house: house, manager: manager, client: undefined});
    }

    const removeHandler = async () => {
        const url = `house/${modalData.house?.id}/${modalData.client ? `clients/${modalData.client.id}` : `manager/${modalData.manager?.id}`}`;
        const response = await remove(url);
        if(response) {
            setHouseList(prevHouses => {
                return prevHouses.map(house =>
                    house.id === response.id ? { ...response } : house
                )
            }

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
                <div className="flex mx-4 gap-x-2 mb-3">
                    {canEdit && <LinkButton to="/add-house" className="grow basis-0">Add House</LinkButton>}
                    <LinkButton to="/dashboard" variant="secondary" className="font-header font-bold grow basis-0">Back to Dashboard</LinkButton>
                </div>

                    <List inset="small">
                        {houseList.map((house, index) =>
                            <ListItem id={house.id} key={house.id}>
                                <ViewHouseListItem house={house} isOdd={index % 2 === 0}  canEdit={canEdit} onRemoveClient={removeHandlerClient} onRemoveManager={removeHandlerManager} />
                            </ListItem>   )}
                    </List>
            </PageCard>
            {modalData.show && (
                <Modal title={`Remove ${modalData.client ? "Client" : "Manager"}`} description={`Do you want to remove this ${modalData.client ? "client" : "manager"} from this house?`} onOpenChange={closeModal}>
                    <div className="pt-1 px-3 pb-4 font-body">
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