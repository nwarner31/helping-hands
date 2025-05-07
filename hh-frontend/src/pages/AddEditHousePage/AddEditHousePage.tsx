import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import React, {useState, useEffect} from "react";
import Input from "../../components/Inputs/Input/Input";
import apiService from "../../utility/ApiService";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {House} from "../../models/House";
import styles from "./AddEditHousePage.module.css";
import Toast from "../../components/Toast/Toast";

const emptyHouse = {
    houseId: "",
    name: "",
    street1: "",
    street2: "",
    city: "",
    state: "",
    maxClients: 1,
    femaleEmployeeOnly: false
}
interface FormErrors {
    houseId?: string;
    name?: string;
    street1?: string;
    city?: string;
    state?: string;
    maxClients?: string;

}
const AddEditHousePage = ({isEdit}: {isEdit: boolean}) => {

    const {houseId} = useParams();
    const location = useLocation();
    const [toastInfo, setToastInfo] = useState<{showToast: boolean, toastType: "info"|"success"|"error", toastMessage: string}>({showToast: false,toastType: "info", toastMessage: ""});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHouse = async () => {
            const {house} = await apiService.get<{house: House, message: string}>(`house/${houseId}`);
            setHouseData({...house});
        }
        if(isEdit && location.state.house) {
            setHouseData(prevState => ({
                ...prevState,
                ...location.state.house
            }));
        } else if (isEdit && !location.state.house) {
            fetchHouse();
        }
    }, []);
    const [houseData, setHouseData] = useState<House>(emptyHouse);
    const [formErrors, setFormErrors] = useState<FormErrors>({
        houseId: "",
        name: "",
        street1: "",
        city: "",
        state: "",
        maxClients: "",
    });

    const validateForm = () => {
        const errors: FormErrors = {};
        if(!houseData.houseId.trim()) {
            errors.houseId = "House ID is required";
        }

        if(!houseData.name.trim()) {
            errors.name = "House Name is required";
        }

        if(!houseData.street1.trim()) {
            errors.street1 = "Street 1 is required";
        }

        if(!houseData.city.trim()) {
            errors.city = "A City is required";
        }

        if(!houseData.state.trim()) {
            errors.state = "A State is required";
        }

        if(!houseData.maxClients.toString().trim()) {
            errors.maxClients = "Max Clients is required";
        } else if (houseData.maxClients < 1) {
            errors.maxClients = "Max Clients must be 1 or greater";
        }

        return errors;
    }

    const updateHouseData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, type, value, checked } = e.target;
        setHouseData(prevState => ({...prevState,  [name]: type === "checkbox" ? checked : value}));
    }
    const submitHouse = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validateForm();
        setFormErrors(errors);
        if(Object.keys(errors).length === 0) {
            let data = {...houseData};
            if(houseData.street2 === "") {
                const {street2, ...rest} = houseData;
                data = rest;
            }
            if(isEdit) {
                await updateHouse(data);
            } else {
                await addHouse(data);
            }
        }
    }

    const addHouse = async (data: House) => {
        const response: {message: string, house?: House} = await apiService.post("house", data);
        if(response.message === "House successfully added" && response.house) {
            setToastInfo({showToast: true, toastType: "success", toastMessage: "House successfully added"});
            setTimeout(() => {navigate("/view-houses")}, 1500);
        }
    }

    const updateHouse = async (data: House) => {
        const response: {message: string, house?:House, errors: any} = await apiService.put(`house/${data.houseId}`, data);

    }

    return (
        <div className={styles.container}>
            <Card className={styles.page}>
                <h1 className={styles.header}>{isEdit ? "Update House" : "Add House"}</h1>
                <form className={styles.form} onSubmit={submitHouse}>
                    <Input label="House ID" value={houseData.houseId} name="houseId" error={formErrors.houseId} onChange={updateHouseData} />
                    <Input label="House Name" value={houseData.name} name="name" error={formErrors.name} onChange={updateHouseData} />
                    <Input label="Street 1" value={houseData.street1} name="street1" error={formErrors.street1} onChange={updateHouseData} />
                    <Input label="Street 2" value={houseData.street2} name="street2" onChange={updateHouseData} />
                    <Input label="City" value={houseData.city} error={formErrors.city} name="city" onChange={updateHouseData} />
                    <Input label="State" value={houseData.state} error={formErrors.state} name="state" onChange={updateHouseData} />
                    <Input label="Maximum Clients in House" value={houseData.maxClients} name="maxClients" error={formErrors.maxClients} onChange={updateHouseData} type="number" />
                    <div>
                        <label>
                            <input type="checkbox" name="femaleEmployeeOnly" checked={houseData.femaleEmployeeOnly} onChange={updateHouseData} className={styles.checkbox} />
                            Female Only House
                        </label>
                        </div>
                    <Button >{isEdit ? "Update House" : "Add House"}</Button>
                    <Button variant="secondary" type="button">Cancel</Button>
                </form>
            </Card>
            {toastInfo.showToast && <Toast type={toastInfo.toastType} >{toastInfo.toastMessage}</Toast>}

        </div>
    )
}


export default AddEditHousePage;