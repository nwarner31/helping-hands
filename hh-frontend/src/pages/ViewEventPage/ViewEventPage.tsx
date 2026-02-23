import LinkButton from "../../components/Buttons/LinkButton/LinkButton";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";
import {useEffect, useState} from "react";
import apiService from "../../utility/ApiService";
import {Client} from "../../models/Client";
import {emptyEvent, Event} from "../../models/Event/Event";
import {formatDate, formatTime} from "../../utility/formatting";
import {toast} from "react-toastify";
import Button from "../../components/Buttons/Button/Button";
import PageCard from "../../components/Cards/PageCard/PageCard";

const ViewEventPage = () => {
    const {employee} = useAuth();
    const canEdit = ["ADMIN", "DIRECTOR", "MANAGER"].includes(employee?.position as string);
    const navigate = useNavigate();
    const location = useLocation();
    const {eventId} = useParams();
    const [event, setEvent] = useState<Event>(emptyEvent);
    useEffect(() => {

        const handleError = (errorMessage: string, goBack = false) => {
            toast.error(errorMessage, {autoClose: 1500, position: "top-right"});
            if (goBack) {
                navigate(-1);
            } else {
                navigate("/dashboard", {replace: true});
            }
        }
        const fetchEvent = async () => {
            try {
                const {event, message} = await apiService.get<{event: Event, message: string}>(`event/${eventId}`);

                if (message === "Event found" && event) {
                    setEvent(event);
                }
            } catch(error: {message: string} | any) {
                if (error.message === "Event not found") {
                    handleError("Event not found. Returning to dashboard.");
                } else if (error.message === "Event Id is required") {
                    handleError("Event Id is required. Returning to dashboard.");
                } else {
                    handleError("An error occurred. Going back.", true);
                }
            }


        }
        const fetchClient = async (clientId: string) => {
            try {
                const {client, message} = await apiService.get<{ client: Client, message: string }>(`client/${clientId}`);
                if (message === "Client found" && client) {
                    setEvent(prevEvent => ({...prevEvent, client: client}));
                }
            } catch (error: {message: string} | any) {
                if (error.message === "Client not found") {
                    handleError("Associated client for this event not found. Returning to dashboard.");
                } else if (error.message === "Client Id is required") {
                    handleError("Client Id is required. Returning to dashboard.");
                } else {
                    handleError("An error occurred. Going back.", true);
                }
            }
        }
        if(!location.state?.event) {
            fetchEvent();
        } else if (!(location.state.event.client || location.state.client)) {
            setEvent(location.state.event);
            fetchClient(location.state.event.clientId);
        } else {
            setEvent(location.state.event);
        }
    }, [eventId]);

    // <Card className="w-full py-3 sm:max-w-100 font-body px-4">
    return (
        <div className="flex justify-center items-center bg-slate-100 min-h-screen">
            <PageCard size="xs" title="View Event" className="p-4">
                    <nav aria-label="Primary navigation" className="mb-4">
                        <ul className="list-none flex gap-2">
                            <li className="grow"><Button onClick={() => navigate(-1)} className="w-full">Go Back</Button></li>
                            <li className="grow"><LinkButton to="/dashboard" className="w-full h-full" variant="secondary">Dashboard</LinkButton></li>
                        </ul>
                    </nav>

                {event.id &&
                    <main>
                        {event.client &&
                            <section className="flex flex-col gap-y-1 mb-3 ml-4">
                                <h2 className="font-semibold">Event for Client</h2>
                                <dl className="grid grid-cols-[auto_1fr] gap-x-4">
                                    <dt>Client ID:</dt><dd>{event.client.id}</dd>
                                    <dt>Client Name:</dt><dd>{event.client.legalName}</dd>
                                    <dt>Date of Birth:</dt><dd>{formatDate(event.client.dateOfBirth)}</dd>
                                </dl>
                            </section>}
                        {canEdit && <LinkButton to={`/edit-event/${eventId}`} className="w-full inline-block text-center mb-2">Edit</LinkButton>}
                        <section className="flex flex-col gap-y-1 mb-3 ml-4">
                            <h2 className="font-semibold">Event Details</h2>
                            <dl className="grid grid-cols-[auto_1fr] gap-x-4">
                                <dt>Event ID:</dt><dd>{eventId}</dd>
                                <dt>Description:</dt><dd><p>{event.description}</p></dd>
                                <dt>Event Type:</dt><dd>{event.type}</dd>
                                <dt>Begin:</dt><dd>{formatDate(event.beginDate)} - {formatTime(event.beginTime)}</dd>
                                <dt>End:</dt><dd>{formatDate(event.endDate)} - {formatTime(event.endTime)}</dd>
                                <dt>Staff Required:</dt><dd>{event.numberStaffRequired}</dd>
                            </dl>

                        </section>
                        {event.type === "MEDICAL" && event.medical &&
                            <section className="flex flex-col ml-4 gap-y-1 border-t-2 border-secondary pt-2">
                                <h2 className="font-semibold">Medical Info</h2>
                                <dl  className="grid grid-cols-[auto_1fr] gap-x-4">
                                    <dt>Record Number:</dt><dd>{event.medical.recordNumber}</dd>
                                    <dt>Doctor:</dt><dd>{event.medical.doctor}</dd>
                                    <dt>Doctor Type:</dt><dd>{event.medical.doctorType}</dd>
                                    <dt>Condition:</dt><dd>{event.medical.appointmentForCondition}</dd>
                                    <dt>Record Printed:</dt>
                                    <dd>
                                        <div>{event.medical.recordPrintedDate ? formatDate(event.medical.recordPrintedDate) : "N/A"}</div>
                                        <div>{/* ToDo Add info for person who printed report here */}</div>
                                    </dd>
                                    <dt>Record To House:</dt>
                                    <dd>
                                        <div>{event.medical.recordTakenToHouseDate ? formatDate(event.medical.recordTakenToHouseDate) : "N/A"}</div>
                                        <div>{/* ToDo Add info for person who took record to house */}</div>
                                    </dd>
                                    <dt>Record Filed:</dt>
                                    <dd>
                                        <div>{event.medical.recordFiledDate ? formatDate(event.medical.recordFiledDate) : "N/A"}</div>
                                        <div>{/* ToDo Add info for person who filed report here */}</div>
                                    </dd>
                                </dl>

                            </section>}
                    </main>}
                {!event.id &&
                <div role="status" aria-live="polite" className="text-center font-semibold">Loading event...</div>}
            </PageCard>
        </div>
        );
}


export default ViewEventPage;