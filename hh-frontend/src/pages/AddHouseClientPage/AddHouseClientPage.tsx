import {useEffect, useState} from "react";
import apiService from "../../utility/ApiService";
import {useLocation, useParams} from "react-router-dom";
import {House} from "../../models/House";
import AddClientSearchList from "./AddClientSearchList";
import {Client} from "../../models/Client";
import {formatDate} from "../../utility/formatting";
import PageCard from "../../components/Cards/PageCard/PageCard";

const emptyHouse = {
    id: "",
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
            console.log("get house");
            const {house} = await apiService.get<{house: House}>(`house/${houseId}`);
            setHouseData({...house});
        }
        const fetchClients = async() => {
            const {clients} = await apiService.get<{clients: Client[]}>("client/no-house");
            setClientsData(clients);
        }
        console.log(location.state);
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
        <div className="flex justify-center items-center min-h-screen bg-slate-100">
            <PageCard title="Add Client to House" size="lg" className="py-4 px-1 flex flex-col gap-y-3" >
                <div className="grid grid-cols-2 gap-x-2 text-center">
                    <div className="font-semibold">House ID</div>
                    <div className="font-semibold">House Name</div>
                    <div>{houseData.id}</div>
                    <div>{houseData.name}</div>
                </div>

                <div className="text-center">Current Clients: {houseData.clients?.length}/{houseData.maxClients}</div>
                {houseData.clients && houseData.clients.length > 0 &&
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
                    {houseData.clients.map((client) => (
                        <tr key={client.id} >
                            <td>{client.id}</td>
                            <td>{client.legalName}</td>
                            <td>{formatDate(client.dateOfBirth)}</td>
                            <td>{client.sex}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>}
                <AddClientSearchList clients={clientsData} houseId={houseData.id} />
            </PageCard>
        </div>
    );
}

export default AddHouseClientPage;