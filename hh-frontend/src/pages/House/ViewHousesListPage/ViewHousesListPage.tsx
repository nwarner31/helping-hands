import {useAuth} from "../../../context/AuthContext";
import Button from "../../../components/Buttons/Button/Button";
import {House} from "../../../models/House";
import ViewHouseListItem from "./ViewHouseListItem";
import Modal from "../../../components/Modal/Modal";
import {useCallback, useEffect, useState} from "react";
import {Client} from "../../../models/Client";
import {Employee} from "../../../models/Employee";
import PageCard from "../../../components/Cards/PageCard/PageCard";
import List from "../../../components/List/List";
import ListItem from "../../../components/List/ListItem";
import LinkButton from "../../../components/Buttons/LinkButton/LinkButton";
import PaginationButtons from "../../../components/Buttons/PaginationButtons/PaginationButtons";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import apiService from "../../../utility/ApiService";
import LoadingText from "../../../components/TextAreas/LoadingText/LoadingText";


const ViewHousesListPage = () => {
    const pageSize = 5;
    const {employee} = useAuth();
    const canEdit = ["ADMIN", "DIRECTOR"].includes(employee?.position as string);
    const [modalData, setModalData] = useState<{show: boolean, type: "Client"|"Manager"|"none", displayPerson: {id: string, name: string}|undefined, house: House|undefined}>({show: false, type: "none", displayPerson: undefined, house: undefined});
    const [houseList, setHouseList] = useState<House[]>([]);
    const [pageHouseList, setPageHouseList] = useState<House[]>([]);
    const [page, setPage] = useState(0);
    const [pages, setPages] = useState(0);
    const queryClient = useQueryClient();
    const getHouses = useCallback(async () => {
        const res = await apiService.get<{data: House[]}>("house");
        return res.data;
    }, []);
    const {data = [], isLoading} = useQuery<House[]>({
        queryKey: ["houses"],
        queryFn: getHouses,
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        if (data.length !== 0) {
            setHouseList([...data]);
            setPage(1);
            setPages(Math.ceil(data.length / pageSize));
        }
    }, [data]);
    useEffect(() => {
        console.log("Page changed: ", page);
        if(page !== 0) {
            const startIndex = (page - 1) * pageSize;
            setPageHouseList(houseList.slice(startIndex, startIndex + pageSize));
        }
    }, [page]);
    const removeHandlerClient = (house: House, client: Client) => {
        setModalData({show: true, type: "Client", displayPerson: {id: client.id, name: client.legalName}, house: house});
    }
    const removeHandlerManager = (house: House, manager: Employee) => {
        setModalData({show: true, type: "Manager", displayPerson: {id: manager.id, name: manager.name}, house: house});
    }

    const removeFunction = (type: string) => {
        const url = `house/${modalData.house?.id}/${type === "Client" ? `clients/${modalData.displayPerson!.id}` : `manager/${modalData.displayPerson!.id}`}`;
        return apiService.delete<{ data: House }>(url)
            .then((response) => response.data);
    }

    const {mutate: removeHandler} = useMutation<House, Error, string>({
        mutationFn: removeFunction,
        onSuccess: (updatedHouse: House, variable) => {
            queryClient.setQueryData(["houses"], (prev: House[] | undefined) =>
                prev ? prev.map(house => (house.id === updatedHouse.id ? {...updatedHouse} : house)): []);
            queryClient.setQueryData(["house", updatedHouse.id], updatedHouse);
            setModalData({show: false, type: "none", displayPerson: undefined, house: undefined});
            setPageHouseList(prevHouses => {
                return prevHouses.map(house => house.id === updatedHouse.id ? { ...updatedHouse } : house)});
            setHouseList(prevHouses => {
                return prevHouses.map(house => house.id === updatedHouse.id ? { ...updatedHouse } : house)});
            if(variable === "Client") {
                queryClient.invalidateQueries({queryKey: ["clients", "no-house"]});
            }
        }
    });

    const closeModal = () => {
        setModalData({show: false, type: "none", displayPerson: undefined, house: undefined});
    }


    const handlePageChange = (pageNum: number) => {
        if(pageNum > 0 && pageNum <= pages) {
            setPage(pageNum);
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-100">
            <PageCard size="md-lg" className="py-5 px-2" title="Houses" >
                <div className="flex mx-4 gap-x-2 mb-3">
                    {canEdit && <LinkButton to="/add-house" className="grow basis-0">Add House</LinkButton>}
                    <LinkButton to="/dashboard" variant="ghost-secondary" className="font-header font-bold grow basis-0">Dashboard</LinkButton>
                </div>
                {!isLoading &&
                    <>
                        <List inset="small" borderVariant="secondary">
                            {pageHouseList.map((house) =>
                                <ListItem id={house.id} key={house.id}>
                                    <ViewHouseListItem house={house}  canEdit={canEdit} onRemoveClient={removeHandlerClient} onRemoveManager={removeHandlerManager} />
                                </ListItem>   )}
                        </List>
                        {houseList.length > pageSize &&
                            <PaginationButtons page={page} numPages={pages} className="border-t-1 mt-2 pt-2 border-slate-500" onPageChange={handlePageChange} />}
                    </>
                }
                {isLoading &&
                    <div>
                        <List inset="small" borderVariant="secondary">
                            {[1,2,3,4,5, 6].map(n =>
                                <ListItem id={`loading-${n}`} key={`loading-${n}`}>
                                    <LoadingText className="h-15 m-2" />
                                </ListItem>)}
                        </List>
                    </div>

                }

            </PageCard>
            {modalData.show && (
                <Modal title={`Remove ${modalData.type}`} description={`Do you want to remove this ${modalData.type.toLowerCase()} from this house?`} onOpenChange={closeModal}>
                    <div className="pt-1 px-3 pb-4 font-body">
                           <div className="ml-4">
                               <p>House: {modalData.house?.id}: {modalData.house?.name}</p>
                               {modalData.displayPerson && <p>{modalData.type}: {modalData.displayPerson.id} - {modalData.displayPerson.name}</p>}
                        </div>
                        <div className="flex flex-col gap-y-3 sm:flex-row sm:gap-x-2 mt-4">
                            <Button className="grow" onClick={() => removeHandler(modalData.type)}>Remove</Button>
                            <Button className="grow" onClick={closeModal} variant="accent">Cancel</Button>
                        </div>

                    </div>
                </Modal>
            )}
        </div>
    );
}

export default ViewHousesListPage;