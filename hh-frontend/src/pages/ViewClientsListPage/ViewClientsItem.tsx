import {Client} from "../../models/Client";


const ViewClientsItem = (client: Client) => {
    return(
        <tr>
            <td>{client.clientId}</td>
            <td>{client.legalName}</td>
            <td>{client.name ? client.name : "None"}</td>
            <td>{client.dateOfBirth}</td>
        </tr>
    );
}

export default ViewClientsItem;