import Card from "../../components/Card/Card";
import {Client} from "../../models/Client";
import React, {useEffect, useState} from "react";
import Input from "../../components/Inputs/Input/Input";
import DateInput from "../../components/Inputs/DateInput/DateInput";
import Button from "../../components/Button/Button";
import { useLocation, useNavigate, useParams} from "react-router-dom";
import apiService from "../../utility/ApiService";
import styles from './AddEddClientPage.module.css';
import Toast from "../../components/Toast/Toast";

const emptyClient = {
    clientId: "",
    legalName: "",
    name: "",
    dateOfBirth: ""
}

interface FormErrors {
    clientId?: string;
    legalName?: string;
    dateOfBirth?: string;
}
const AddEditClientPage = ({isEdit}: {isEdit: boolean}) => {
    const { clientId } = useParams();
    const location = useLocation();
    useEffect(() => {
        const fetchClient = async () => {
            const {client} = await apiService.get<{client: Client, message: string}>(`client/${clientId}`);
            setClientData({...client});
        }
        if(isEdit && location.state.client) {
            setClientData(prevState => ({
                ...prevState,
                ...location.state.client,
                dateOfBirth: location.state.client.dateOfBirth?.split("T")[0] ?? ""
            }));
        } else if(isEdit && !location.state.client) {
            fetchClient();
        }
    },[])
    const [clientData, setClientData] = useState<Client>(emptyClient);
    const [formErrors, setFormErrors] = useState<FormErrors>({
        clientId: "",
        legalName: "",
        dateOfBirth: ""
    });

    const [toastInfo, setToastInfo] = useState<{showToast: boolean, toastType: "info"|"success"|"error", toastMessage: string}>({showToast: false,toastType: "info", toastMessage: ""});
    const navigate = useNavigate();

    const validateForm = (values: Client): FormErrors => {
        const errors: FormErrors = {};
        if(!values.clientId.trim()) {
            errors.clientId = "Client ID is required";
        }
        if(!values.legalName.trim()) {
            errors.legalName = "Legal Name is required";
        } else if (values.legalName.split(" ").length === 1) {
            errors.legalName = "Legal Name requires a first name and last name";
        }
        if(!values.dateOfBirth.trim()) {
            errors.dateOfBirth = "Date of Birth is required";
        }

        return errors;
    }

    function updateClientData(e: React.ChangeEvent<HTMLInputElement>) {
        setClientData(prevState => ({...prevState, [e.target.name]: e.target.value}));
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validateForm(clientData);
        setFormErrors(validationErrors);
        if(Object.keys(validationErrors).length === 0) {
            const data = Object.fromEntries(Object.entries(clientData).filter(([_, value]) => value !== "")) as Client;
            if(!isEdit) {
                await addClient(data);
            } else {
                await updateClient(data);
            }
        }
    }

    const addClient = async (data: Client) => {
        const response: {message: string, client?: Client} = await apiService.post('client', data);
        if(response.message === "Client added" && response.client && response.client.clientId) {
            setToastInfo({showToast: true, toastType: "success", toastMessage: "Client successfully added"});
            setTimeout(() => {navigate("/view-clients")}, 1500);
        }
    }
    const updateClient = async (data: Client) => {
        const response: {message: string, client?: Client} = await apiService.put(`client/${clientId}`, data);
        if(response.message === "client updated successfully" && response.client && response.client.clientId) {
            setToastInfo({showToast: true, toastType: "success", toastMessage: "Client successfully updated"});
            setTimeout(() => {navigate("/view-clients")}, 1500);
        }
    }

    return (
        <div className={styles.container}>
            <Card className={styles.page}>
                <h1 className={styles.header}>{isEdit ? "Update Client": "Add Client" }</h1>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <Input label="Client ID" value={clientData.clientId} name="clientId" onChange={updateClientData} error={formErrors.clientId} disabled={isEdit} />
                    <Input label="Legal Name" value={clientData.legalName} name="legalName" onChange={updateClientData} error={formErrors.legalName} />
                    <Input label="Preferred Name" value={clientData.name} name="name" onChange={updateClientData} />
                    <DateInput label="Date of Birth" value={clientData.dateOfBirth} name="dateOfBirth" onChange={updateClientData} error={formErrors.dateOfBirth} />
                    <Button>{isEdit ? "Update Client": "Add Client" }</Button>
                    <Button variant="secondary" type="button">Cancel</Button>
                </form>
            </Card>
            {toastInfo.showToast && <Toast type={toastInfo.toastType} >{toastInfo.toastMessage}</Toast>}

        </div>);
}

export default AddEditClientPage;