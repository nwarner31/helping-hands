import Input from "../../Inputs/Input/Input";
import StaticLabelInput from "../../Inputs/StaticLabelInput/StaticLabelInput";
import RadioInput from "../../Inputs/RadioInput/RadioInput";
import Button from "../../Buttons/Button/Button";
import React, {useState} from "react";
import {Client} from "../../../models/Client";
import {useNavigate} from "react-router-dom";
import {ValidationErrors} from "../../../utility/validation/utility.validation";

const emptyClient = {
    id: "",
    legalName: "",
    name: "",
    dateOfBirth: "",
    sex: "F"
}

interface ClientFormProps {
    initialData?: Client;
    submitButtonText: string;
    errors: ValidationErrors;
    onSubmit: (data: Client) => void;
}

const ClientForm = ({initialData = emptyClient, submitButtonText, errors, onSubmit}: ClientFormProps) => {
    const [clientData, setClientData] = useState<Client>(initialData);
    const navigate = useNavigate();

    function updateClientData (e: React.ChangeEvent<HTMLInputElement>) {
        const { name, type, value, checked } = e.target;
        setClientData(prevState => ({...prevState,  [name]: type === "checkbox" ? checked : value}));
    }
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSubmit(clientData);
    }
    return (
        <form className="flex flex-col w-full gap-y-6 items-center px-2"  onSubmit={handleSubmit}>
            <Input containerClassName="w-full" label="Client ID" value={clientData.id} name="id" onChange={updateClientData} error={errors.id} disabled={initialData.id !== ""} />
            <Input containerClassName="w-full" label="Legal Name" value={clientData.legalName} name="legalName" onChange={updateClientData} error={errors.legalName} />
            <Input containerClassName="w-full" label="Preferred Name" value={clientData.name} name="name" onChange={updateClientData} />
            <StaticLabelInput containerClass="w-full" label="Date of Birth" type="date" value={clientData.dateOfBirth} name="dateOfBirth" onChange={updateClientData} error={errors.dateOfBirth} />
            <div className="w-full flex">
                <RadioInput label="Female" name="sex" value="F" onChange={updateClientData} isChecked={clientData.sex === "F"} className="w-1/2" />
                <RadioInput label="Male" name="sex" value="M" onChange={updateClientData} isChecked={clientData.sex === "M"} className="w-1/2" />
            </div>
            <Button className="w-full">{submitButtonText}</Button>
            <Button className="w-full" variant="secondary" type="button" onClick={() => navigate(-1)}>Cancel</Button>
        </form>
    );
}

export default ClientForm;