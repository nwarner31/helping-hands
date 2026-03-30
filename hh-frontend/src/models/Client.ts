import {House} from "./House";
import {Event} from "./Event/Event";

export interface Client {
    id: string;
    legalName: string;
    name?: string;
    dateOfBirth: string;
    sex: string;
    requiresStaff: boolean;
    houseId?: string;
    house?: House;
    events?: Event[];
    hasConflicts?: {
        hasConflicts: boolean;
        numConflicts: number;
    }
}