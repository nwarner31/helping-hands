import React, { useState } from 'react';
import styles from "./ViewHouseListItem.module.css";
import Button from "../../components/Button/Button";
import {House} from "../../models/House";
import {Link} from "react-router-dom";
import {formatDate} from "../../utility/formatting";


type Props = {
    house: House;
    isOdd: boolean;
    canEdit: boolean;
};

const ViewHouseListItem: React.FC<Props> = ({ house, isOdd, canEdit }) => {
    const [expanded, setExpanded] = useState(false);
    const buttonVariant = isOdd ? "accent" : "secondary";
    const toggleExpanded = () => setExpanded((prev) => !prev);

    const {clients = [], maxClients} = house;
    const address = [house.street1, house.street2, house.city, house.state]
        .filter(Boolean)
        .join(', ');
    const clientList = [];
    for(let index = 0; index < maxClients; index++) {
        if(index < clients.length) {
            clientList.push(
                <tr key={clients[index].clientId}>
                    <td>{clients[index].clientId}</td>
                    <td>{clients[index].legalName}</td>
                    <td className={canEdit ? styles.dob : ""}>{formatDate(clients[index].dateOfBirth)}</td>
                    {canEdit && <td><Button className={styles["client-action-button"]} variant={buttonVariant}>Remove</Button></td>}
                </tr>);
        } else {
            clientList.push(
                <tr key={index}>
                    <td colSpan={3} >Empty</td>
                    {canEdit && <td><Link to={`/house/${house.houseId}/add-client`} ><Button className={styles["client-action-button"]} variant={buttonVariant}>Add</Button></Link></td>}
                </tr>
            )
        }

    }
    return (
        <div className={`${styles.container} ${styles[isOdd ? "odd-row" : "even-row"]}`}>

            <div className={styles[canEdit ? "display-row-edit" : "display-row-no-edit"]}>
                <Button onClick={toggleExpanded} className={styles["expand-button"]} variant={buttonVariant}>
                    {expanded ? '▼' : '▶'}
                </Button>
                <div className={styles["house-id-head"]}>House Id</div>
                <div className={styles["house-id"]}>{house.houseId}</div>
                <div className={styles["house-name-head"]}>House Name</div>
                <div className={styles["house-name"]}>{house.name}</div>
                <div className={styles["house-clients-head"]}>Clients</div>
                <div className={styles["house-clients"]}>{clients.length}/{house.maxClients}</div>
                <div className={styles["house-female-head"]}>F Only</div>
                <div className={styles["house-female"]}>
                    {house.femaleEmployeeOnly ? 'Yes' : 'No'}
                </div>
                {canEdit &&
                    <div className={styles["edit-button"]}>
                        <Link to={`/edit-house/${house.houseId}`} state={{house: house}}><Button variant={buttonVariant}>
                            Edit
                        </Button></Link>
                    </div>
                   }
            </div>

            {expanded && (
                <div className={styles["expand-container"]}>
                    <div>
                        <strong>Address:</strong> {address}
                    </div>
                    <div>
                        <div>
                            <strong>Primary Manager:</strong> {house.primaryManagerId || 'N/A'}
                        </div>
                        <div>
                            <strong>Secondary Manager:</strong> {house.secondaryManagerId || 'N/A'}
                        </div>
                        <div className={styles["female-only"]}>
                            <strong>Female Employees Only:</strong> {house.femaleEmployeeOnly ? 'Yes' : 'No'}
                        </div>
                    </div>

                    <table className={styles["client-table"]}>
                        <thead>
                        <tr>
                            <th className={styles[canEdit ? "client-data-edit" : "client-data-no-edit"]}>Client ID</th>
                            <th className={styles[canEdit ? "client-data-edit" : "client-data-no-edit"]}>Legal Name</th>
                            <th className={styles[canEdit ? "dob" : "client-data-no-edit"]}>Date of Birth</th>
                        </tr>
                        </thead>
                        <tbody key={1}>
                        {clientList }
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ViewHouseListItem;
