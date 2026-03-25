import { useParams} from "react-router-dom";
import {formatDate} from "../../../utility/formatting";
import Accordion from "../../../components/Accordion/Accordion";
import {useAuth} from "../../../context/AuthContext";
import ViewClientUpcomingEvent from "./ViewClientUpcomingEvent";
import LinkButton from "../../../components/Buttons/LinkButton/LinkButton";
import PageCard from "../../../components/Cards/PageCard/PageCard";
import NavButtons from "../../../components/Buttons/NavButtons/NavButtons";
import {useQuery} from "@tanstack/react-query";
import {getClient} from "../../../data/client.data";


const ViewClientPage = () => {
    const { clientId } = useParams();
    const {employee} = useAuth();
    const canEdit = ["ADMIN", "DIRECTOR", "MANAGER"].includes(employee?.position as string);

    const {data: client} = useQuery({
        queryKey: ["client", clientId],
        queryFn: () => getClient(clientId!)
    })

    return (
        <div className="flex justify-center items-center bg-slate-100 min-h-screen">
           <PageCard title="View Client" className="py-4 px-3" >
               <NavButtons showBackButton={true} />
                {client &&
                    <>
                        <div className="font-bold text-md mb-4 text-center font-header">
                        <div>Client Id: {client.id}</div>
                        <div>Legal Name: {client.legalName}</div>
                            <div>Date of Birth: {formatDate(client.dateOfBirth)}</div>
                            <div>Name: {client.name ?? "None"}</div>
                            <div>Sex: {client.sex}</div>
                    </div>
                        {canEdit &&
                            <LinkButton to={`/edit-client/${clientId}`} state={{client: client}} variant="accent" className="mb-4">Edit Client</LinkButton>
                        }

                        {client.house &&
                        <Accordion id="house-info" header="House Info" variant="secondary" className="font-header mb-4 font-semibold">
                            <div className="grid grid-cols-2 font-body">
                                <div >House ID:</div><div>{client.house.id}</div>
                                <div >Name:  </div><div>{client.house.name}</div>
                                <div >Primary Manager:</div><div>{client.house.primaryHouseManager ? `${client.house.primaryHouseManager.id}: ${client.house.primaryHouseManager.name}` : "N/A"}</div>
                                <div >Secondary Manager:</div><div>{client.house.secondaryHouseManager ? `${client.house.secondaryHouseManager.id}: ${client.house.secondaryHouseManager.name}` : "N/A"}</div>
                                <div >Address:</div>
                                <div >
                                    <div>{client.house.street1}</div>
                                    {client.house.street2 && <div>{client.house.street2}</div>}
                                    <div>{client.house.city}, {client.house.state}</div>
                                </div>
                                <div >Female Only:</div><div>{client.house.femaleEmployeeOnly ?  "Yes" : "No"}</div>
                                <div >Clients:</div><div>{client.house.numClients}/{client.house.maxClients}</div>
                                <div >Roommates:</div>
                                <div >
                                    {client.house.clients && client.house.clients.length > 0 ?  client.house.clients.map(client => `${client.id}: ${client.legalName}`) : "No roommates" }
                                </div>
                            </div>

                        </Accordion>}
                        <Accordion id="upcoming-events" header="Upcoming Events" className="font-header font-semibold">
                            <div className="flex flex-col gap-y-2 mb-3" >
                                {client.hasConflicts && <LinkButton to={`/client/${clientId}/view-event-conflicts`} variant={client.hasConflicts.hasConflicts ? "danger" : "success"} id="has-conflict" >
                                    {client.hasConflicts.hasConflicts ? `(${client.hasConflicts.numConflicts}) Upcoming Event Conflicts` : "No Upcoming Event Conflicts"}                                </LinkButton>}

                                {canEdit && <LinkButton to={`/client/${clientId}/add-event`} state={{client: client}} variant="secondary">Add Event</LinkButton>}
                                <LinkButton to={`/client/${clientId}/view-events`} variant="accent">View Events</LinkButton>
                            </div>

                            {client.events && client.events.length > 0 ? (
                                client.events.map((event, index) => <ViewClientUpcomingEvent key={event.id} event={{...event, client: client}} isOdd={index % 2 === 0} />)
                            ) : (
                                <div className="text-center text-gray-500">No Upcoming Events</div>
                            )}
                        </Accordion>
                    </>
             }


            </PageCard>
        </div>
    );
}


export default ViewClientPage;