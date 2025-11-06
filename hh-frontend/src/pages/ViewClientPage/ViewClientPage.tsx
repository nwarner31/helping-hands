import Card from "../../components/Card/Card";
import {Link, useLocation, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import apiService from "../../utility/ApiService";
import {Client} from "../../models/Client";
import {Event} from "../../models/Event/Event";
import {formatDate} from "../../utility/formatting";
import Accordion from "../../components/Accordion/Accordion";
import {House} from "../../models/House";
import {useAuth} from "../../context/AuthContext";
import Button from "../../components/Buttons/Button/Button";
import ViewClientUpcomingEvent from "./ViewClientUpcomingEvent";


const emptyClient = {
    id: "",
    legalName: "",
    name: "",
    dateOfBirth: "",
    sex: "F",
    events: []
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
        const fetchUpcomingEvents = async () => {
            const { events } = await apiService.get<{events: Event[]}>(`client/${clientId}/event/upcoming`);
            setClientData(prevState => ({...prevState, events: events}));
        }
        if(location.state && location.state.client) {
            if(!location.state.client.house && location.state.client.houseId) {
                fetchHouse();
            }

            if(!location.state.client.events) {
                fetchUpcomingEvents();
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
        <div className="flex justify-center items-center bg-slate-100 min-h-screen">
            <Card className="w-full py-4 px-3 xs:mx-4 sm:max-w-125">
                <h1 className="font-header text-accent text-center font-bold text-2xl mb-3">View Client</h1>
                <div className="font-bold text-md mb-4 text-center font-header">
                    <div>Client Id: {clientData.id}</div>
                    <div>Legal Name: {clientData.legalName}</div>
                </div>
                <Accordion id="basic-info" header="Basic Info" variant="primary" className="font-header mb-4 font-semibold">
                    <div className="font-body font-light" >
                        <div>Date of Birth: {formatDate(clientData.dateOfBirth)}</div>
                        <div>Name: {clientData.name ?? "None"}</div>
                        <div>Sex: {clientData.sex}</div>
                    </div>

                </Accordion>
                {clientData.house &&
                <Accordion id="house-info" header="House Info" variant="secondary" className="font-header mb-4 font-semibold">
                    <div className="grid grid-cols-2 font-body">
                        <div >House ID:</div><div>{clientData.house.id}</div>
                        <div >Name:  </div><div>{clientData.house.name}</div>
                        <div >Primary Manager:</div><div>{clientData.house.primaryHouseManager ? `${clientData.house.primaryHouseManager.id}: ${clientData.house.primaryHouseManager.name}` : "N/A"}</div>
                        <div >Secondary Manager:</div><div>{clientData.house.secondaryHouseManager ? `${clientData.house.secondaryHouseManager.id}: ${clientData.house.secondaryHouseManager.name}` : "N/A"}</div>
                        <div >Address:</div>
                        <div >
                            <div>{clientData.house.street1}</div>
                            {clientData.house.street2 && <div>{clientData.house.street2}</div>}
                            <div>{clientData.house.city}, {clientData.house.state}</div>
                        </div>
                        <div >Female Only:</div><div>{clientData.house.femaleEmployeeOnly ?  "Yes" : "No"}</div>
                        <div >Clients:</div><div>{clientData.house.clients ? clientData.house.clients.length : 0}/{clientData.house.maxClients}</div>
                        <div >Roommates:</div>
                        <div >
                            {roommates.length > 0 ?  roommates.map(client => `${client.id}: ${client.legalName}`) : "No roommates" }
                        </div>
                    </div>

                </Accordion>}
                <Accordion id="upcoming-events" header="Upcoming Events" className="font-header font-semibold">
                    {canEdit && <Link to={`/client/${clientId}/add-event`} ><Button className="w-full">Add Event</Button> </Link>}
                    <Link to={`/client/${clientId}/view-events`} ><Button className="w-full">View Events</Button> </Link>
                    {clientData.events && clientData.events.length > 0 ? (
                        clientData.events.map((event, index) => <ViewClientUpcomingEvent key={event.id} event={event} isOdd={index % 2 === 0} />)
                    ) : (
                        <div className="text-center text-gray-500">No Upcoming Events</div>
                    )}
                </Accordion>
            </Card>
        </div>
    );
}


export default ViewClientPage;