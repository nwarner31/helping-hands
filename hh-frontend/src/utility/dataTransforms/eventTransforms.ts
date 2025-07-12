import {EventInput} from "../../models/Event/EventInput";
import {formatDate, formatTime} from "../formatting";

export function convertEventToInput(event: any): EventInput {

    return {
        ...event,
        beginDate: formatDate(event.beginDate),
        endDate: formatDate(event.endDate),
        beginTime: formatTime(event.beginTime),
        endTime: formatTime(event.endTime),
        medical: event.medical ?? {
            recordNumber: "",
            doctor: "",
            doctorType: "",
            appointmentForCondition: ""
        },
    };
}
