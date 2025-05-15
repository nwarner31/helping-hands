import {Client} from "./Client";
import {Employee} from "./Employee";


export interface House {
    houseId: string;
    name: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    maxClients: number;
    femaleEmployeeOnly: boolean;
    clients?: Client[];
    primaryManagerId?: string;
    secondaryManagerId?: string;
    primaryHouseManager?: Employee;
    secondaryHouseManager?: Employee;
}