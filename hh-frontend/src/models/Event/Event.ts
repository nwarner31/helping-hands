import {Employee} from "../Employee";
import {Client} from "../Client";

export interface MedicalEvent {
    recordNumber: string;
    recordPrintedDate?: string;
    recordPrintedBy?: Employee;
    recordTakenToHouseDate?: string;
    recordTakenToHouseBy?: Employee;
    appointmentCompletedByEmpId?: string;
    recordFiledDate?: string;
    recordFiledBy?: Employee;
    doctor: string;
    doctorType: string;
    appointmentForCondition: string;
    appointmentResults?: string;
}

export enum EventType {
    WORK = "WORK",
    MEDICAL = "MEDICAL",
    SOCIAL = "SOCIAL",
    OTHER = "OTHER"
}

export interface Event {
    id: string;
    type: EventType;
    description: string;
    beginDate: string;         // ISO string preferred
    endDate: string;
    beginTime: string;         // Time in ISO or HH:mm format
    endTime: string;
    numberStaffRequired: number;
    client: Client;
    medical?: MedicalEvent;
}

export const emptyEvent: Event = {
    id: "",
    type: EventType.OTHER,
    description: "",
    beginDate: "2023-09-01T10:00:00.000Z",
    endDate: "2023-09-01T10:00:00.000Z",
    beginTime: "2023-09-01T10:00:00.000Z",
    endTime: "2023-09-01T10:00:00.000Z",
    numberStaffRequired: 0,
    client: {
        id: "",
        legalName: "",
        name: "",
        dateOfBirth: "",
        sex: "F"
    }
}
