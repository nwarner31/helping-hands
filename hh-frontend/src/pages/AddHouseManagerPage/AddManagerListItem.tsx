import { useState } from "react";

import Button from "../../components/Button/Button";
import styles from "./AddManagerListItem.module.css";
import {Employee} from "../../models/Employee";
import {House} from "../../models/House";
import {useNavigate, useSearchParams} from "react-router-dom";
import apiService from "../../utility/ApiService";
import Toast from "../../components/Toast/Toast";

interface Props {
    employee: Employee;
    houseId: string;
    isOdd: boolean;
}

const AddManagerListItem = ({ employee, houseId, isOdd }: Props) => {
    const [expanded, setExpanded] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [toastInfo, setToastInfo] = useState<{showToast: boolean, toastType: "info"|"success"|"error", toastMessage: string}>({showToast: false,toastType: "info", toastMessage: ""});

    const position = searchParams.get("position") ?? "primary";
    const createHouseRow = (house: House, managerType: string) => {
        return (
            <li key={house.id} className={styles.houseItem}>
                <span className={styles.houseId}>
                    {house.id} – {house.name} ({managerType} Manager)
                </span>
            </li>
        );
    }

    const addManagerHandler = async () => {
        const response = await apiService.post<{message: string, house: House}>(`house/${houseId}/manager`, {employeeId: employee.id, positionType: position});
        if(response.message === "manager added to house") {
            setToastInfo({showToast: true, toastType: "success", toastMessage: "Manager added to house successfully"});
            setTimeout(() => {navigate("/view-houses")}, 1500);
        }
    }
    const buttonType = isOdd ? "secondary" : "accent"
    return (
        <div className={`${styles.wrapper} ${styles[isOdd ? "odd-row" : "even-row"]}`}>
            {/* Top Row */}
            <div className={styles["info-group"]}>
                    <Button
                        onClick={() => setExpanded((prev) => !prev)}
                        className={styles["toggle-button"]}
                        variant={buttonType}
                    >
                        {expanded ? '▼' : '▶'}
                    </Button>
                    <span className={styles.employeeId}>ID: {employee.id}</span>
                    <span className={styles.name}>{employee.name}</span>

                <Button variant={buttonType} className={styles["add-button"]} onClick={addManagerHandler}>Add</Button>
            </div>

            {/* Detail Panel */}
            {expanded && (
                <div className={styles["detail-page"]}>
                    {(employee.primaryHouses?.length || 0) + (employee.secondaryHouses?.length || 0) === 0 ? (
                        <p className={styles["empty-text"]}>No managed houses.</p>
                    ) : (
                        <ul className={styles["house-list"]}>
                            {employee.primaryHouses?.map(house => createHouseRow(house, "Primary"))}
                            {employee.secondaryHouses?.map(house => createHouseRow(house, "Secondary"))}
                        </ul>
                    )}
                </div>
            )}
            {toastInfo.showToast && <Toast type={toastInfo.toastType} >{toastInfo.toastMessage}</Toast>}
        </div>
    );
};

export default AddManagerListItem;
