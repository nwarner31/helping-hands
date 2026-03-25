import {setupTestEmployees, teardownTestEmployees} from "../../setuptestemployees";
import {setupTestClients, teardownTestClients} from "../../setuptestclients";
import {setupTestEvents, teardownTestEvents, TestEvent} from "../../setuptestevents";


export const eventSetupTests = async () => {
    const employeesPromise = setupTestEmployees();
    const clientsPromise = setupTestClients();
    const [employees, clients] = await Promise.all([employeesPromise, clientsPromise]);
    const events: TestEvent[] = await setupTestEvents(clients.client1.id, clients.client2.id, clients.client3.id);
    return { employees, clients, events };
}

export const eventTeardownTests = async () => {
    await teardownTestEvents()
    await Promise.all([teardownTestEmployees(), teardownTestClients()]);
}