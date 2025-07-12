export interface MedicalEventInput {
    id: string;
    recordNumber: string;
    recordPrintedDate?: string;
    recordPrintedEmpId?: string;

    recordTakenToHouseDate?: string;
    recordTakenEmpId?: string;

    appointmentCompletedByEmpId?: string;

    recordFiledDate?: string;
    recordFiledEmpId?: string;

    doctor: string;
    doctorType: string;
    appointmentForCondition: string;
    appointmentResults?: string;
}

export interface EventInput {
    id: string;
    type: "WORK" | "MEDICAL" | "SOCIAL" | "OTHER";
    description: string;
    beginDate: string;
    endDate: string;
    beginTime: string;
    endTime: string;
    numberStaffRequired: number;
    clientId: string;
    medical?: MedicalEventInput;
}