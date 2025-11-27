import {EventInput} from "../../models/Event/EventInput";
import {formatDate, formatTime} from "../formatting";

export function convertEventToInput(event: any): EventInput {

    return {
        ...event,
        beginDate: event.beginDate.split("T")[0],  //formatDate(event.beginDate),
        endDate: event.endDate.split("T")[0], //formatDate(event.endDate),
        numberStaffRequired: event.numberStaffRequired.toString(),
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
