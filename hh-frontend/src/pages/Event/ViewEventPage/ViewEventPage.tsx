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
import {usePrefetchData} from "../../../hooks/prefetchData/prefetchData.hook";
import {useMutate} from "../../../hooks/mutateHook/mutate.hook";
import {RecordEventActionSchema} from "../../../utility/validation/event.validation";

const ViewEventPage = () => {
    const {employee} = useAuth();
    const canEdit = ["ADMIN", "DIRECTOR", "MANAGER"].includes(employee?.position as string);
    const navigate = useNavigate();
    const [modalData, setModalData] = useState<{show: boolean, action: string}>({show: false, action: ""});
    const {eventId} = useParams();
    const [results, setResults] = useState("");

    const {data: event, fetchData, setData: setEvent, error: fetchError} = usePrefetchData<Event>("event", `event/${eventId}`);
    const {mutate: post, data: updatedEvent} = useMutate(`event/${eventId}/record-action`, "POST", RecordEventActionSchema);

    useEffect(() => {
        fetchData();
    }, [eventId]);
    useEffect(() => {
        if(fetchError) {
            toast.error("Unable to find event", {autoClose: 1500, position: "top-right"});
            navigate(-1);
        }
    }, [fetchError]);
    useEffect(() => {
        if(updatedEvent) {
            setEvent(updatedEvent as Event);
        }
    }, [updatedEvent]);
    const getRecordStatus = () => {
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
            const actionString = getRecordStatus();
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
            const success = await post(body);
            setModalData({show: false, action: ""});
            if(success) {
                toast.success(`Successfully recorded ${actionString.toLocaleLowerCase()} action.`, {autoClose: 1500, position: "top-right"});
            } else {
                toast.error(`Failed to save ${actionString.toLocaleLowerCase()} action`, {autoClose: 1500, position: "top-right"});
            }
    }
    return (
        <div className="flex justify-center items-center bg-slate-100 min-h-screen">
            <PageCard size="xs" title="View Event" className="p-4">
                    <NavButtons showBackButton={true} />

                {event &&
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
                        {canEdit && <LinkButton to={`/edit-event/${eventId}`} state={{event}} className="w-full inline-block text-center mb-2">Edit</LinkButton>}
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
                                        <div>{event.medical.recordPrintedBy && event.medical.recordPrintedBy.name}</div>
                                    </dd>
                                    <dt>Record To House:</dt>
                                    <dd>
                                        <div>{event.medical.recordTakenToHouseDate ? formatDate(event.medical.recordTakenToHouseDate) : "N/A"}</div>
                                        <div>{event.medical.recordTakenToHouseBy && event.medical.recordTakenToHouseBy.name}</div>
                                    </dd>
                                    <dt>Record Filed:</dt>
                                    <dd>
                                        <div>{event.medical.recordFiledDate ? formatDate(event.medical.recordFiledDate) : "N/A"}</div>
                                        <div>{event.medical.recordFiledBy && event.medical.recordFiledBy.name}</div>
                                    </dd>
                                    {event.medical.appointmentResults &&
                                        <>
                                            <dt>Results:</dt>
                                            <dd>{event.medical.appointmentResults}</dd>
                                        </>
                                       }
                                </dl>
                                {canEdit && !event.medical.recordFiledDate &&
                                    <Button onClick={showModalForAction}>{getRecordStatus()}</Button>}
                            </section>}
                    </main>}
                {!event &&
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