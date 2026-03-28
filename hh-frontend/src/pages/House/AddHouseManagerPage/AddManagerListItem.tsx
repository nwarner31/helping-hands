import { useState } from "react";
import clsx from "clsx";
import Button from "../../../components/Buttons/Button/Button";
import {Employee} from "../../../models/Employee";
import {House} from "../../../models/House";
import {useNavigate, useSearchParams} from "react-router-dom";
import Card from "../../../components/Cards/Card/Card";
import {z} from "zod";
import {toast} from "react-toastify";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import apiService from "../../../utility/ApiService";

interface Props {
    employee: Employee;
    houseId: string;
}

const AddManagerListItem = ({ employee, houseId }: Props) => {
    const [expanded, setExpanded] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
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
        const result = z.object({employeeId: z.string(), positionType: z.enum(["primary", "secondary"])}).safeParse({employeeId: employee.id, positionType: position});
        if(result.success) {
            mutate();
        }
    }
    const addManager = async () => {
        const response = await apiService.post<{data: House}>(`house/${houseId}/manager`, {employeeId: employee.id, positionType: position});
        return response.data;
    }
    const {mutate} = useMutation<House, Error>({
        mutationFn: addManager,
        onSuccess: (updatedHouse) => {
            toast.success("Manager added to house successfully", {autoClose: 1500, position: "top-right"});
            queryClient.setQueryData(["houses"], (prev: House[] | undefined) =>
                prev ? prev.map(house => (house.id === updatedHouse.id ? {...updatedHouse} : house)): [])
            navigate("/view-houses");
        }
    });

    return (
        <div className={clsx(" p-2 w-full")}>
            {/* Top Row */}
            <div className="flex items-center gap-x-3">
                    <Button
                        onClick={() => setExpanded((prev) => !prev)}
                        className="w-16"
                        variant="primary"
                    >
                        {expanded ? '▼' : '▶'}
                    </Button>
                    <span>ID: {employee.id}</span>
                    <span className="grow">{employee.name}</span>

                <Button variant="primary" className="w-25" onClick={addManagerHandler}>Add</Button>
            </div>

            {/* Detail Panel */}
            {expanded && (
                <Card className="mt-2 mx-2 border-primary border-1">
                    {(employee.primaryHouses?.length || 0) + (employee.secondaryHouses?.length || 0) === 0 ? (
                        <p className="text-center">No managed houses.</p>
                    ) : (
                        <ul className="text-center p-0 list-none">
                            {employee.primaryHouses?.map(house => createHouseRow(house, "Primary"))}
                            {employee.secondaryHouses?.map(house => createHouseRow(house, "Secondary"))}
                        </ul>
                    )}
                </Card>
            )}
        </div>
    );
};

export default AddManagerListItem;