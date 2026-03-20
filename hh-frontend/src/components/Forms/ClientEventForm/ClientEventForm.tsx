import React, {useState} from "react";
import Input from "../../Inputs/Input/Input";
import StaticLabelInput from "../../Inputs/StaticLabelInput/StaticLabelInput";
import Select from "../../Inputs/Select/Select";
import Textarea from "../../Inputs/Textarea/Textarea";
import clsx from "clsx";
import Button from "../../Buttons/Button/Button";
import {EventType} from "../../../models/Event/Event";
import {ValidationErrors} from "../../../utility/validation/utility.validation";
import {useNavigate} from "react-router-dom";
import {EventInputSchema} from "../../../utility/validation/event.validation";
import {z} from "zod";

 export type ClientEvent = z.infer<typeof EventInputSchema>;

const emptyEvent: ClientEvent = {
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

interface ClientEventFormProps {
    initialData?: ClientEvent;
    errors: ValidationErrors;
    submitButtonText: string;
    onSubmit: (data: ClientEvent) => void;
}
const ClientEventForm = ({initialData=emptyEvent, submitButtonText, errors, onSubmit}: ClientEventFormProps) => {
        const [eventData, setEventData] = useState<ClientEvent>(initialData);
        const navigate = useNavigate();

    const eventTypeOptions = Object.values(EventType).map((type) => ({
        label: type.charAt(0) + type.slice(1).toLowerCase(),
        value: type
    }));
    function updateEventData (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setEventData((prevState) => ({...prevState, [e.target.name]: e.target.value}));
    }
    function updateMedicalEventData (e: React.ChangeEvent<HTMLInputElement>) {
        setEventData((prevState) => ({...prevState, medical: {...prevState.medical, [e.target.name]: e.target.value}}));
    }
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSubmit(eventData);
    }
        return (
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full font-body">
                <Input label="Event ID" name="id" value={eventData.id} onChange={updateEventData} error={errors.id} containerClassName="w-full px-2" disabled={initialData.id !== ""} />
                <StaticLabelInput label="Begin Date" type="date" name="beginDate" value={eventData.beginDate} onChange={updateEventData} error={errors.beginDate} containerClass="w-full px-2" />
                <StaticLabelInput label="Begin Time" type="time" name="beginTime" value={eventData.beginTime} onChange={updateEventData} error={errors.beginTime} containerClass="w-full px-2" />
                <StaticLabelInput label="End Date" type="date" name="endDate" value={eventData.endDate} onChange={updateEventData} error={errors.endDate} containerClass="w-full px-2" />
                <StaticLabelInput label="End Time" type="time" name="endTime" value={eventData.endTime} onChange={updateEventData} error={errors.endTime} containerClass="w-full px-2" />
                <StaticLabelInput label="Staff Required" type="number" name="numberStaffRequired" value={eventData.numberStaffRequired} onChange={updateEventData} error={errors.numberStaffRequired} containerClass="w-full px-2" />
                <Select name="type" label="Event Type" options={eventTypeOptions} value={eventData.type!} onChange={updateEventData} containerClass="w-full px-2" className="border-1 rounded-sm" disabled={initialData.type === "MEDICAL"} />
                <Textarea label="Description" name="description" value={eventData.description} onChange={updateEventData} containerClass="w-full px-2" className="w-full border-1 rounded-sm" error={errors.description} />
                {eventData.medical &&
                    <div className={clsx("flex flex-col items-center gap-5 w-full overflow-hidden transition-all duration-300 ", eventData.type === "MEDICAL" ? "max-h-175 pt-4": "max-h-0")}>
                        <Input label="Record Number" name="recordNumber" value={eventData.medical.recordNumber} onChange={updateMedicalEventData} error={errors["medical.recordNumber"]} containerClassName="w-full px-2" tabIndex={eventData.type === "MEDICAL" ? 0 : -1} />
                        <Input label="Doctor Name" name="doctor" value={eventData.medical.doctor} onChange={updateMedicalEventData} error={errors["medical.doctor"]} containerClassName="w-full px-2" tabIndex={eventData.type === "MEDICAL" ? 0 : -1} />
                        <Input label="Doctor Type" name="doctorType" value={eventData.medical.doctorType} onChange={updateMedicalEventData} error={errors["medical.doctorType"]} containerClassName="w-full px-2" tabIndex={eventData.type === "MEDICAL" ? 0 : -1} />
                        <Input label="Condition" name="appointmentForCondition" value={eventData.medical.appointmentForCondition} onChange={updateMedicalEventData} error={errors["medical.appointmentForCondition"]} containerClassName="w-full px-2" tabIndex={eventData.type === "MEDICAL" ? 0 : -1} />
                    </div>
                }
                <Button className="w-full" >{submitButtonText}</Button>
                <Button className="w-full" variant="secondary" type="button" onClick={() => navigate(-1)}>Cancel</Button>
            </form>
        );
}


export default ClientEventForm;