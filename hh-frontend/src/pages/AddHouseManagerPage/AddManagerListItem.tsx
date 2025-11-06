import { useState } from "react";
import clsx from "clsx";
import Button from "../../components/Buttons/Button/Button";
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
            <li key={house.id}>
                <span>
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
        <div className={clsx("py-1 px-2 w-full", isOdd && "bg-primary text-white")}>
            {/* Top Row */}
            <div className="flex items-center gap-x-3">
                    <Button
                        onClick={() => setExpanded((prev) => !prev)}
                        className="w-16"
                        variant={buttonType}
                    >
                        {expanded ? '▼' : '▶'}
                    </Button>
                    <span>ID: {employee.id}</span>
                    <span className="grow">{employee.name}</span>

                <Button variant={buttonType} className="w-25" onClick={addManagerHandler}>Add</Button>
            </div>

            {/* Detail Panel */}
            {expanded && (
                <div>
                    {(employee.primaryHouses?.length || 0) + (employee.secondaryHouses?.length || 0) === 0 ? (
                        <p className="text-center">No managed houses.</p>
                    ) : (
                        <ul className="text-center p-0 list-none">
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
