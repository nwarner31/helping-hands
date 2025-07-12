import Card from "../../components/Card/Card";
import React, {useEffect, useState} from "react";
import apiService from "../../utility/ApiService";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {EventInput, validateEventInput} from "../../models/Event/EventInput";
import {Event, EventType} from "../../models/Event/Event";
import Input from "../../components/Inputs/Input/Input";
import StaticLabelInput from "../../components/Inputs/StaticLabelInput/StaticLabelInput";
import Select from "../../components/Inputs/Select/Select";
import Textarea from "../../components/Inputs/Textarea/Textarea";
import Button from "../../components/Button/Button";
import styles from "./AddEditClientEventPage.module.css";
import {convertEventToInput} from "../../utility/dataTransforms/eventTransforms";
import {ValidationErrors} from "../../utility/validation/utility.validation";
import Toast from "../../components/Toast/Toast";

const emptyEvent: EventInput = {
    beginDate: "",
    beginTime: "",
    description: "",
    endDate: "",
    endTime: "",
    id: "",
    numberStaffRequired: "0",
    type: "OTHER",
    medical: {
        recordNumber: "",
        doctor: "",
        doctorType: "",
        appointmentForCondition: ""
    }
};


const AddEditClientEventPage = ({isEdit}: {isEdit: boolean}) => {
    const {eventId, clientId} = useParams();
    const location = useLocation();
    const eventTypeOptions = Object.values(EventType).map((type) => ({
        label: type.charAt(0) + type.slice(1).toLowerCase(),
        value: type
    }));
    const [errors, setErrors] = useState<ValidationErrors>({});
    const medicalErrors = (errors.medical ?? {}) as Record<string, string>;
    const [toastInfo, setToastInfo] = useState<{showToast: boolean, toastType: "info"|"success"|"error", toastMessage: string}>({showToast: false,toastType: "info", toastMessage: ""});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvent = async () => {
            const {event} = await apiService.get<{event: Event, message: string}>(`event/${eventId}`);
            const eventInput = convertEventToInput(event)
            setEventData(eventInput);
        }
        if(isEdit && location.state && location.state.event) {
            setEventData(prevState => ({...prevState, ...location.state.event}));
        } else if(isEdit) {
            fetchEvent();
        }
    }, []);
    const [eventData, setEventData] = useState<EventInput>(emptyEvent);
    function updateEventData (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setEventData(prevState => ({...prevState, [e.target.name]: e.target.value}));
    }
    function updateMedicalEventData (e: React.ChangeEvent<HTMLInputElement>) {
        setEventData(prevState => ({...prevState, medical: {...prevState.medical, [e.target.name]: e.target.value}}));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        const errors = validateEventInput(eventData);
        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            return;
        }
        const { medical, ...rest } = eventData;
        const dataToSend = eventData.type === "MEDICAL"
            ? { ...eventData, numberStaffRequired: Number(eventData.numberStaffRequired) }
            : { ...rest, numberStaffRequired: Number(eventData.numberStaffRequired) };

        if (isEdit){
            console.log("edit");
        } else {
            await addEvent(dataToSend);
        }
    }

    const addEvent = async (data: any) => {
        const response = await apiService.post<{event?: Event, message: string}>(`client/${clientId}/event`, data);
        if(response.message === "Event created" && response.event) {
            setToastInfo({showToast: true, toastType: "success", toastMessage: "Event successfully added"});
            setTimeout(() => {navigate(`/view-client/${clientId}`)}, 1500);

        }
    }
    return (
        <div className={styles.container}>
            <Card className={styles.page}>
                <h1 className={styles.header}>{isEdit ? "Update Event" : "Add Event"}</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input label="Event ID" name="id" value={eventData.id} onChange={updateEventData} error={errors.id as string} />
                    <StaticLabelInput label="Begin Date" type="date" name="beginDate" value={eventData.beginDate} onChange={updateEventData} error={errors.beginDate as string} />
                    <StaticLabelInput label="Begin Time" type="time" name="beginTime" value={eventData.beginTime} onChange={updateEventData} error={errors.beginTime as string} />
                    <StaticLabelInput label="End Date" type="date" name="endDate" value={eventData.endDate} onChange={updateEventData} error={errors.endDate as string} />
                    <StaticLabelInput label="End Time" type="time" name="endTime" value={eventData.endTime} onChange={updateEventData} error={errors.endTime as string} />
                    <StaticLabelInput label="Staff Required" type="number" name="numberStaffRequired" value={eventData.numberStaffRequired} onChange={updateEventData} error={errors.numberStaffRequired as string} />
                    <Select name="type" label="Event Type" options={eventTypeOptions} value={eventData.type} onChange={updateEventData} containerClass={styles["select-container"]} />
                    <Textarea label="Description" name="description" value={eventData.description} onChange={updateEventData} containerClass={styles["description-container"]} className={styles.description} error={errors.description as string as string} />
                    <div className={`${styles.medical} ${eventData.type === "MEDICAL" ? styles.open : ""}`}>
                        <Input label="Record Number" name="recordNumber" value={eventData.medical.recordNumber} onChange={updateMedicalEventData} error={medicalErrors.recordNumber} />
                        <Input label="Doctor Name" name="doctor" value={eventData.medical.doctor} onChange={updateMedicalEventData} error={medicalErrors.doctor} />
                        <Input label="Doctor Type" name="doctorType" value={eventData.medical.doctorType} onChange={updateMedicalEventData} error={medicalErrors.doctorType} />
                        <Input label="Condition" name="appointmentForCondition" value={eventData.medical.appointmentForCondition} onChange={updateMedicalEventData} error={medicalErrors.appointmentForCondition} />
                    </div>
                    <Button >{isEdit ? "Update Event" : "Add Event"}</Button>
                    <Button variant="secondary" type="button">Cancel</Button>
                </form>
            </Card>
            {toastInfo.showToast && <Toast type={toastInfo.toastType} >{toastInfo.toastMessage}</Toast>}

        </div>
    );
}

export default AddEditClientEventPage;