import LinkButton from "../../../components/Buttons/LinkButton/LinkButton";
import { useNavigate, useParams} from "react-router-dom";
import {useAuth} from "../../../context/AuthContext";
import {useEffect, useState} from "react";
import { Event} from "../../../models/Event/Event";
import {formatDate, formatTime} from "../../../utility/formatting";
import {toast} from "react-toastify";
import Button from "../../../components/Buttons/Button/Button";
import PageCard from "../../../components/Cards/PageCard/PageCard";
import Modal from "../../../components/Modal/Modal";
import Textarea from "../../../components/Inputs/Textarea/Textarea";
import NavButtons from "../../../components/Buttons/NavButtons/NavButtons";
import {RecordEventActionSchema} from "../../../utility/validation/event.validation";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getEvent} from "../../../data/event.data";
import apiService from "../../../utility/ApiService";

const ViewEventPage = () => {
    const {employee} = useAuth();
    const canEdit = ["ADMIN", "DIRECTOR", "MANAGER"].includes(employee?.position as string);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [modalData, setModalData] = useState<{show: boolean, action: string}>({show: false, action: ""});
    const {eventId} = useParams();
    const [results, setResults] = useState("");
    const [eventData, setEventData] = useState<Event|null>(null);

    const {data: event, isLoading, error} = useQuery({
        queryKey: ["event", eventId],
        queryFn: () => getEvent(eventId!),
        staleTime: 5 * 60 * 1000
    });
    useEffect(() => {
        if(!eventId || eventId.trim().length === 0) {
            toast.error("Event ID not found", {autoClose: 1500, position: "top-right"});
            navigate(-1);
        }
    }, [eventId]);
    useEffect(() => {
        if(event) {
            setEventData(event);
        }
    }, [event]);
    useEffect(() => {
        if(error && error.message === "Event not found") {
            toast.error("Unable to find event", {autoClose: 1500, position: "top-right"})
            navigate(-1);
        }
    }, [error]);
    const getRecordStatus = () => {
        // Should never be triggered but kept for insurance
        // istanbul ignore next
        if (!event || !event.medical) return "none";
        if (!event.medical.recordPrintedBy) return "Print Record";
        if (!event.medical.recordTakenToHouseBy) return "Take Record to House";
        if (!event.medical.recordFiledBy) return "File Record";
        // This case should never be hit since the button to trigger this function is hidden once all actions are completed, but we return "complete" just in case
        // istanbul ignore next
        return "complete";
    }

    const closeModal = () => {
        setModalData({show: false, action: ""});
    }

    const updateResults = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setResults(e.target.value);
    }

    const showModalForAction = () => {
        const action = getRecordStatus();
        // This code cannot be reached normally
        // istanbul ignore if
        if (action === "none" || action === "complete") {
            toast.info("No actions are currently available for this event.", {autoClose: 1500, position: "top-right"});
            return;
        }
        setModalData({show: true, action: action});
    }

    const handleRecordAction = async () => {
            let body: {action: string, results?: string} = {action: ""};
            // The if and the else should not be triggered but are included for extra protection
            // istanbul ignore else
            if (!event) {toast.error("Event not present. Going to dashboard.", {autoClose: 1500, position: "top-right"}); navigate("/dashboard");}
            else if (!event.medical?.recordPrintedBy) body = {action: "PRINT"};
            else if (!event.medical?.recordTakenToHouseBy) body = {action: "TAKE_TO_HOUSE"};
            else if (!event.medical?.recordFiledBy) body = {action: "FILE", results: results};
            // This code should never be reached normally
            else {
                toast.info("All actions have already been completed for this event.", {autoClose: 1500, position: "top-right"});
                return;
            }
            const result = RecordEventActionSchema.safeParse(body);
            if(!result.success) {
                toast.error("Invalid action data. Please try again.", {autoClose: 1500, position: "top-right"});
                setModalData({show: false, action: ""});
                return;
            }
            mutate(body);
    }
    const recordAction = async (action: {action: string, results?: string}) => {
        try {
            setModalData({show: false, action: ""});
            const response = await apiService.post<{data: Event}>(`event/${eventId}/record-action`, action);
            return response.data
        } catch (error) {
            throw error;
        }
    }
    const {mutate} = useMutation({
        mutationFn: recordAction,
        onSuccess: (updatedEvent) => {
            toast.success(`Successfully recorded ${getRecordStatus().toLowerCase()} action.`, {autoClose: 1500, position: "top-right"});
            setEventData(updatedEvent);
            queryClient.setQueryData(["event", eventId], updatedEvent);
        }, onError: () => {
            toast.error(`Unable to save ${getRecordStatus().toLowerCase()} action`, {autoClose: 1500, position: "top-right"});
        }
    })
    return (
        <div className="flex justify-center items-center bg-slate-100 min-h-screen">
            <PageCard size="xs" title="View Event" className="p-4">
                    <NavButtons showBackButton={true} />

                {eventData &&
                    <main>
                        {eventData.client &&
                            <section className="flex flex-col gap-y-1 mb-3 ml-4">
                                <h2 className="font-semibold">Event for Client</h2>
                                <dl className="grid grid-cols-[auto_1fr] gap-x-4">
                                    <dt>Client ID:</dt><dd>{eventData.client.id}</dd>
                                    <dt>Client Name:</dt><dd>{eventData.client.legalName}</dd>
                                    <dt>Date of Birth:</dt><dd>{formatDate(eventData.client.dateOfBirth)}</dd>
                                </dl>
                            </section>}
                        {canEdit && <LinkButton to={`/edit-event/${eventId}`} state={{event}} className="w-full inline-block text-center mb-2">Edit</LinkButton>}
                        <section className="flex flex-col gap-y-1 mb-3 ml-4">
                            <h2 className="font-semibold">Event Details</h2>
                            <dl className="grid grid-cols-[auto_1fr] gap-x-4">
                                <dt>Event ID:</dt><dd>{eventId}</dd>
                                <dt>Description:</dt><dd><p>{eventData.description}</p></dd>
                                <dt>Event Type:</dt><dd>{eventData.type}</dd>
                                <dt>Begin:</dt><dd>{formatDate(eventData.beginDate)} - {formatTime(eventData.beginTime)}</dd>
                                <dt>End:</dt><dd>{formatDate(eventData.endDate)} - {formatTime(eventData.endTime)}</dd>
                                <dt>Staff Required:</dt><dd>{eventData.numberStaffRequired}</dd>
                            </dl>

                        </section>
                        {eventData.type === "MEDICAL" && eventData.medical &&
                            <section className="flex flex-col ml-4 gap-y-1 border-t-2 border-secondary pt-2">
                                <h2 className="font-semibold">Medical Info</h2>
                                <dl  className="grid grid-cols-[auto_1fr] gap-x-4">
                                    <dt>Record Number:</dt><dd>{eventData.medical.recordNumber}</dd>
                                    <dt>Doctor:</dt><dd>{eventData.medical.doctor}</dd>
                                    <dt>Doctor Type:</dt><dd>{eventData.medical.doctorType}</dd>
                                    <dt>Condition:</dt><dd>{eventData.medical.appointmentForCondition}</dd>
                                    <dt>Record Printed:</dt>
                                    <dd>
                                        <div>{eventData.medical.recordPrintedDate ? formatDate(eventData.medical.recordPrintedDate) : "N/A"}</div>
                                        <div>{eventData.medical.recordPrintedBy && eventData.medical.recordPrintedBy.name}</div>
                                    </dd>
                                    <dt>Record To House:</dt>
                                    <dd>
                                        <div>{eventData.medical.recordTakenToHouseDate ? formatDate(eventData.medical.recordTakenToHouseDate) : "N/A"}</div>
                                        <div>{eventData.medical.recordTakenToHouseBy && eventData.medical.recordTakenToHouseBy.name}</div>
                                    </dd>
                                    <dt>Record Filed:</dt>
                                    <dd>
                                        <div>{eventData.medical.recordFiledDate ? formatDate(eventData.medical.recordFiledDate) : "N/A"}</div>
                                        <div>{eventData.medical.recordFiledBy && eventData.medical.recordFiledBy.name}</div>
                                    </dd>
                                    {eventData.medical.appointmentResults &&
                                        <>
                                            <dt>Results:</dt>
                                            <dd>{eventData.medical.appointmentResults}</dd>
                                        </>
                                       }
                                </dl>
                                {canEdit && !eventData.medical.recordFiledDate &&
                                    <Button onClick={showModalForAction}>{getRecordStatus()}</Button>}
                            </section>}
                    </main>}
                {isLoading &&
                <div role="status" aria-live="polite" className="text-center font-semibold">Loading event...</div>}
            </PageCard>
            {modalData.show && (
                <Modal onOpenChange={closeModal} title="Confirm Action" description="Are you sure you want to complete the following action?">
                    <p className="font-semibold text-center">{modalData.action}</p>
                    {modalData.action === "File Record" && <Textarea label="Appointment Results" name="results" value={results} onChange={updateResults} containerClass="flex flex-col m-4" />}
                    <div className="flex flex-col gap-y-3 sm:flex-row sm:gap-x-2 my-4 mx-2">
                        <Button className="grow" onClick={handleRecordAction}>Yes</Button>
                        <Button className="grow" onClick={closeModal} variant="accent">No</Button>
                    </div>
                </Modal>
            )}
        </div>
        );
}


export default ViewEventPage;