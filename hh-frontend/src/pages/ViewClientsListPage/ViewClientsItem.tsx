import {Client} from "../../models/Client";
import Button from "../../components/Button/Button";
import styles from './ViewClientsListPage.module.css';


const ViewClientsItem = ({client, isAdmin, isOddRow}: {client: Client, isAdmin: boolean, isOddRow: boolean}) => {
    const [year, month, day] = client.dateOfBirth.split("T")[0].split('-');
    const formattedDate = `${month}/${day}/${year}`;
    //  = new Date(client.dateOfBirth).toDateString('en-US', {
    //     year: 'numeric',
    //     month: '2-digit',
    //     day: '2-digit'
    // });
    return(
        <tr className={isOddRow ? styles["odd-row"] : styles["even-row"]}>
            <td>{client.clientId}</td>
            <td>{client.legalName}</td>
            <td className={isAdmin ? styles.hideable : ""}>{client.name ? client.name : "None"}</td>
            <td>{formattedDate}</td>
            {isAdmin && <td><Button variant={isOddRow ? "accent": "secondary"}>Edit</Button></td>}
        </tr>
    );
}

export default ViewClientsItem;