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
