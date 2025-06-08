import {House} from "./House";

export interface Client {
    id: string;
    legalName: string;
    name?: string;
    dateOfBirth: string;
    sex: string;
    houseId?: string;
    house?: House;
}