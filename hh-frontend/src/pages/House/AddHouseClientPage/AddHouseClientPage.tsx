import {useCallback} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {House} from "../../../models/House";
import AddClientSearchList from "./AddClientSearchList";
import {Client} from "../../../models/Client";
import {formatDate} from "../../../utility/formatting";
import PageCard from "../../../components/Cards/PageCard/PageCard";
import Button from "../../../components/Buttons/Button/Button";
import {useQuery} from "@tanstack/react-query"
import apiService from "../../../utility/ApiService";
import LoadingText from "../../../components/TextAreas/LoadingText/LoadingText";
import {getHouse} from "../../../data/house.data";
import ListItem from "../../../components/List/ListItem";
import List from "../../../components/List/List";

const AddHouseClientPage = () => {
    const { houseId } = useParams();
    const navigate = useNavigate();

    const getUnhousedClients = useCallback(async () => {
        const res = await apiService.get<{data: Client[]}>("client/no-house");
        return res.data;
    }, []);
    const{data: clients = [], isLoading: isLoadingClient} = useQuery<Client[]>({
        queryKey: ["clients", "no-house"],
        queryFn: getUnhousedClients,
        staleTime: 5 * 60 * 1000,
    });

    const{data: house, isLoading: isLoadingHouse} = useQuery<House>({
        queryKey: ["house", houseId],
        queryFn: () => getHouse(houseId!),
        staleTime: 5 * 60 * 1000
    });

    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-100">
            <PageCard title="Add Client" size="lg" className="py-4 px-1 flex flex-col gap-y-3 max-h-screen" >
                {house &&
                <>
                    <div className="grid grid-cols-2 gap-x-2 text-center">
                        <div className="font-semibold">House ID</div>
                        <div className="font-semibold">House Name</div>
                        <div>{house.id}</div>
                        <div>{house.name}</div>
                    </div>

                    <div className="text-center">Current Clients: {house.clients?.length}/{house.maxClients}</div>
                    {house.clients && house.clients.length > 0 &&
                        <table data-testid="house-clients-table" className="text-center">
                            <thead>
                            <tr>
                                <th>Client ID</th>
                                <th>Legal Name</th>
                                <th>Date of Birth</th>
                                <th>Sex</th>
                            </tr>
                            </thead>
                            <tbody>
                            {house.clients.map((client) => (
                                <tr key={client.id} >
                                    <td>{client.id}</td>
                                    <td>{client.legalName}</td>
                                    <td>{formatDate(client.dateOfBirth)}</td>
                                    <td>{client.sex}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>}
                    <div className="overflow-y-auto">
                        {clients && <AddClientSearchList clients={clients} houseId={house.id} />}
                    </div>

                    {isLoadingClient &&
                        <List borderVariant="secondary">
                            {[1,2,3,4,5,6].map(n => (
                                <ListItem id={`loading-${n}`} key={`loading-${n}`}><LoadingText bgColorType="primary" className="h-13 my-1" /></ListItem>))}
                        </List> }
                </>
                }
                {isLoadingHouse && <LoadingText />}
                <Button className="mx-3" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            </PageCard>
        </div>
    );
}

export default AddHouseClientPage;