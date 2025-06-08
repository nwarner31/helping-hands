import {Client} from "../../models/Client";
import Button from "../../components/Button/Button";
import styles from './ViewClientsListPage.module.css';
import {Link} from "react-router-dom";
import {formatDate} from "../../utility/formatting";


const ViewClientsItem = ({client, isAdmin, isOddRow}: {client: Client, isAdmin: boolean, isOddRow: boolean}) => {

    return(
        <tr className={isOddRow ? styles["odd-row"] : styles["even-row"]}>
            <td><Link to={`/view-client/${client.id}`} state={{client: client}} ><Button variant={isOddRow ? "accent": "secondary"}>{client.id}</Button></Link></td>
            <td>{client.legalName}</td>
            <td className={isAdmin ? styles.hideable : ""}>{client.name ? client.name : "None"}</td>
            <td>{formatDate(client.dateOfBirth)}</td>
            {isAdmin && <td><Link to={`/edit-client/${client.id}`} state={{client: client}} ><Button variant={isOddRow ? "accent": "secondary"}>Edit</Button></Link></td>}
        </tr>
    );
}

export default ViewClientsItem;