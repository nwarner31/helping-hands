import {useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {House} from "../../../models/House";
import AddClientSearchList from "./AddClientSearchList";
import {Client} from "../../../models/Client";
import {formatDate} from "../../../utility/formatting";
import PageCard from "../../../components/Cards/PageCard/PageCard";
import {useGet} from "../../../hooks/getHook/get.hook";
import {usePrefetchData} from "../../../hooks/prefetchData/prefetchData.hook";
import Button from "../../../components/Buttons/Button/Button";

const AddHouseClientPage = () => {
    const { houseId } = useParams();
    const navigate = useNavigate();

    const {data: clients, get: getClients} = useGet<Client[]>("client/no-house", []);
    const {data: house, fetchData: fetchHouse} = usePrefetchData<House>("house", `house/${houseId}`);
    useEffect(() => {
        fetchHouse();
        getClients();
    }, []);

    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-100">
            <PageCard title="Add Client to House" size="lg" className="py-4 px-1 flex flex-col gap-y-3" >
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
                    {clients &&
                        <AddClientSearchList clients={clients} houseId={house.id} />
                    }
                </>
                }
                <Button className="mx-3" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            </PageCard>
        </div>
    );
}

export default AddHouseClientPage;