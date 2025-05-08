import React, { useState } from 'react';
import styles from "./ViewHouseListItem.module.css";
import Button from "../../components/Button/Button";
import {House} from "../../models/House";


type Props = {
    house: House;
    isOdd: boolean;
};

const ViewHouseListItem: React.FC<Props> = ({ house, isOdd }) => {
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
                    <td className={styles.dob}>{clients[index].dateOfBirth}</td>
                    <td><Button className={styles["client-action-button"]} variant={buttonVariant}>Remove</Button></td>
                </tr>);
        } else {
            clientList.push(
                <tr key={index}>
                    <td colSpan={3} >Empty</td>
                    <td><Button className={styles["client-action-button"]} variant={buttonVariant}>Add</Button></td>
                </tr>
            )
        }

    }
    return (
        <div className={`${styles.container} ${styles[isOdd ? "odd-row" : "even-row"]}`}>

            <div className={styles["display-row"]}>
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
                <Button className={styles["edit-button"]} variant={buttonVariant}>
                    Edit
                </Button>
            </div>

            {expanded && (
                <div className={styles["expand-container"]}>
                    <div className="mb-2 text-sm text-gray-700">
                        <strong>Address:</strong> {address}
                    </div>
                    <div className="mb-2 flex text-sm text-gray-700">
                        <div className="flex-1">
                            <strong>Primary Manager:</strong> {house.primaryManagerId || 'N/A'}
                        </div>
                        <div className="flex-1">
                            <strong>Secondary Manager:</strong> {house.secondaryManagerId || 'N/A'}
                        </div>
                        <div className={styles["female-only"]}>
                            <strong>Female Employees Only:</strong> {house.femaleEmployeeOnly ? 'Yes' : 'No'}
                        </div>
                    </div>

                    <table className="w-full mt-2 border-t border-gray-300 text-sm">
                        <thead>
                        <tr>
                            <th className={styles["client-data"]}>Client ID</th>
                            <th className={styles["client-data"]}>Legal Name</th>
                            <th className={styles.dob}>Date of Birth</th>
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
