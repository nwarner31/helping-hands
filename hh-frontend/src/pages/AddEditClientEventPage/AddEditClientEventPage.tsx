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
import Button from "../../components/Buttons/Button/Button";
import clsx from "clsx";
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
        <div className="flex justify-center items-center min-h-screen bg-slate-100">
            <Card className="w-full rounded-none min-h-screen xs:min-h-0 xs:rounded-xl xs:max-w-100 py-5 px-2 flex flex-col items-center justify-center">
                <h1 className="text-accent text-2xl font-bold font-header mb-3">{isEdit ? "Update Event" : "Add Event"}</h1>
                <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full font-body">
                    <Input label="Event ID" name="id" value={eventData.id} onChange={updateEventData} error={errors.id as string} containerClassName="w-full px-2" />
                    <StaticLabelInput label="Begin Date" type="date" name="beginDate" value={eventData.beginDate} onChange={updateEventData} error={errors.beginDate as string} containerClass="w-full px-2" />
                    <StaticLabelInput label="Begin Time" type="time" name="beginTime" value={eventData.beginTime} onChange={updateEventData} error={errors.beginTime as string} containerClass="w-full px-2" />
                    <StaticLabelInput label="End Date" type="date" name="endDate" value={eventData.endDate} onChange={updateEventData} error={errors.endDate as string} containerClass="w-full px-2" />
                    <StaticLabelInput label="End Time" type="time" name="endTime" value={eventData.endTime} onChange={updateEventData} error={errors.endTime as string} containerClass="w-full px-2" />
                    <StaticLabelInput label="Staff Required" type="number" name="numberStaffRequired" value={eventData.numberStaffRequired} onChange={updateEventData} error={errors.numberStaffRequired as string} containerClass="w-full px-2" />
                    <Select name="type" label="Event Type" options={eventTypeOptions} value={eventData.type} onChange={updateEventData} containerClass="w-full px-2" className="border-1 rounded-sm" />
                    <Textarea label="Description" name="description" value={eventData.description} onChange={updateEventData} containerClass="w-full px-2" className="w-full border-1 rounded-sm" error={errors.description as string as string} />
                    <div className={clsx("flex flex-col items-center gap-4 w-full overflow-hidden transition-all duration-300", eventData.type === "MEDICAL" ? "max-h-175": "max-h-0")}>
                        <Input label="Record Number" name="recordNumber" value={eventData.medical.recordNumber} onChange={updateMedicalEventData} error={medicalErrors.recordNumber} containerClassName="w-full px-2" />
                        <Input label="Doctor Name" name="doctor" value={eventData.medical.doctor} onChange={updateMedicalEventData} error={medicalErrors.doctor} containerClassName="w-full px-2" />
                        <Input label="Doctor Type" name="doctorType" value={eventData.medical.doctorType} onChange={updateMedicalEventData} error={medicalErrors.doctorType} containerClassName="w-full px-2" />
                        <Input label="Condition" name="appointmentForCondition" value={eventData.medical.appointmentForCondition} onChange={updateMedicalEventData} error={medicalErrors.appointmentForCondition} containerClassName="w-full px-2" />
                    </div>
                    <Button className="w-full" >{isEdit ? "Update Event" : "Add Event"}</Button>
                    <Button className="w-full" variant="secondary" type="button">Cancel</Button>
                </form>
            </Card>
            {toastInfo.showToast && <Toast type={toastInfo.toastType} >{toastInfo.toastMessage}</Toast>}

        </div>
    );
}

export default AddEditClientEventPage;