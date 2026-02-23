export interface ClientResponse {
    id: string;
    legalName: string;
    name?: string | null;
    sex: "M" | "F";
    dateOfBirth: string;
    requiresStaff: boolean;
    house: any;
    events: any[];
    hasConflicts?: {
        hasConflicts: boolean;
        numConflicts: number;
    }
}