import {validateDate, validateTime} from "../../utility/validation/dateTime.validation";
import {validateNumber} from "../../utility/validation/number.validation";
import {ValidationErrors} from "../../utility/validation/utility.validation";

export interface EventInput {
    id: string;
    type:  "WORK" | "MEDICAL" | "SOCIAL" | "OTHER";
    description: string;
    beginDate: string;
    endDate: string;
    beginTime: string;
    endTime: string;
    numberStaffRequired: string;
    medical: MedicalInput;
}

export interface MedicalInput {
    recordNumber: string;
    doctor: string;
    doctorType: string;
    appointmentForCondition: string;
}



export const validateEventInput = (data: EventInput): ValidationErrors => {
    const errors: ValidationErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if(!data.id) errors.id = "Event id is required";
    if(!data.type) {
        errors.type = "Event type is required";
    } else if (!["SOCIAL", "WORK", "MEDICAL", "OTHER"].includes(data.type)) {
        errors.type = "Invalid event type";
    }
    if(!data.description) errors.description = "Description is required";
    const bdError = validateDate(data.beginDate, "Begin date", "future");
    if (bdError) errors.beginDate = bdError;
    const edError  = validateDate(data.endDate, "End date", "future");
    if (edError) errors.endDate = edError;
    const btError = validateTime(data.beginTime, "Begin time");
    if (btError) errors.beginTime = btError;
    const etError = validateTime(data.endTime, "End time");
    if (etError) errors.endTime = etError;
    const staffNumError = validateNumber(data.numberStaffRequired, "Number of staff", {min: 0, isInteger: true});
    if (staffNumError) errors.numberStaffRequired = staffNumError;
    if (data.type === "MEDICAL") {
        const medErrors = validateMedical(data.medical);
        if (Object.keys(medErrors).length > 0) errors.medical = medErrors;
    }
    return errors;
}

const validateMedical = (data: MedicalInput): ValidationErrors => {
    const errors: ValidationErrors = {};
    if (!data.recordNumber) errors.recordNumber = "Record number is required";
    if (!data.doctor) errors.doctor = "Doctor is required";
    if (!data.doctorType) errors.doctorType = "Doctor type is required";
    if (!data.appointmentForCondition) errors.appointmentForCondition = "A condition is required";
    return errors;
}
