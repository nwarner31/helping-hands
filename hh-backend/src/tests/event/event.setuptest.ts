import {setupTestEmployees, teardownTestEmployees} from "../setuptestemployees";
import {setupTestClients, teardownTestClients} from "../setuptestclients";


export const eventSetupTests = async () => {
    const employeesPromise = setupTestEmployees();
    const clientsPromise = setupTestClients();
    const [employees, clients] = await Promise.all([employeesPromise, clientsPromise]);
    return { employees, clients };
}

export const eventTeardownTests = async () => {
    await Promise.all([teardownTestEmployees(), teardownTestClients()]);
}