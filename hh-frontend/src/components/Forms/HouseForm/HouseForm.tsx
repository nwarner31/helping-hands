import Input from "../../Inputs/Input/Input";
import Button from "../../Buttons/Button/Button";
import {z} from "zod";
import {HouseInputSchema} from "../../../utility/validation/house.validation";
import React, {useState} from "react";
import {ValidationErrors} from "../../../utility/validation/utility.validation";
import {useNavigate} from "react-router-dom";

export type House = z.infer<typeof HouseInputSchema>;
const emptyHouse: House = {
    id: "",
    name: "",
    street1: "",
    street2: "",
    city: "",
    state: "",
    maxClients: "1",
    femaleEmployeeOnly: false
}

interface HouseFormProps {
    initialData?: House;
    errors: ValidationErrors;
    submitButtonText: string;
    onSubmit: (data: House) => void;
}

const HouseForm = ({initialData = emptyHouse, errors, submitButtonText, onSubmit}: HouseFormProps) => {
    const [houseData, setHouseData] = useState<House>(initialData);
    const navigate = useNavigate();

    function updateHouseData (e: React.ChangeEvent<HTMLInputElement>) {
        const { name, type, value, checked } = e.target;
        setHouseData(prevState => ({...prevState,  [name]: type === "checkbox" ? checked : value}));
    }
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSubmit(houseData);
    }
    return (
        <form className="flex flex-col items-center gap-5 w-full" onSubmit={handleSubmit}>
            <Input label="House ID" value={houseData.id} name="id" error={errors.id} onChange={updateHouseData} disabled={initialData.id !== ""} containerClassName="w-full px-3" />
            <Input label="House Name" value={houseData.name} name="name" error={errors.name} onChange={updateHouseData} containerClassName="w-full px-3" />
            <Input label="Street 1" value={houseData.street1} name="street1" error={errors.street1} onChange={updateHouseData} containerClassName="w-full px-3" />
            <Input label="Street 2" value={houseData.street2} name="street2" onChange={updateHouseData} containerClassName="w-full px-3" />
            <Input label="City" value={houseData.city} error={errors.city} name="city" onChange={updateHouseData} containerClassName="w-full px-3" />
            <Input label="State" value={houseData.state} error={errors.state} name="state" onChange={updateHouseData} containerClassName="w-full px-3" />
            <Input label="Maximum Clients in House" value={houseData.maxClients} name="maxClients" error={errors.maxClients} onChange={updateHouseData} type="number" containerClassName="w-full px-3" />
            <div>
                <label>
                    <input type="checkbox" name="femaleEmployeeOnly" checked={houseData.femaleEmployeeOnly} onChange={updateHouseData} className="accent-accent mr-1" />
                    Female Only House
                </label>
            </div>
            <Button className="w-full" >{submitButtonText}</Button>
            <Button className="w-full" variant="secondary" type="button" onClick={() => navigate(-1)}>Cancel</Button>
        </form>
    );
}


export default HouseForm;