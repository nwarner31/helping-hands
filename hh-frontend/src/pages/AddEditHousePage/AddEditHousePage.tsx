import Button from "../../components/Buttons/Button/Button";
import React, {useState, useEffect} from "react";
import Input from "../../components/Inputs/Input/Input";
import apiService from "../../utility/ApiService";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {House} from "../../models/House";
import {toast} from "react-toastify";
import PageCard from "../../components/Cards/PageCard/PageCard";

const emptyHouse = {
    id: "",
    name: "",
    street1: "",
    street2: "",
    city: "",
    state: "",
    maxClients: 1,
    femaleEmployeeOnly: false
}
interface FormErrors {
    id?: string;
    name?: string;
    street1?: string;
    city?: string;
    state?: string;
    maxClients?: string;

}
const AddEditHousePage = ({isEdit}: {isEdit: boolean}) => {

    const {houseId} = useParams();
    const location = useLocation();
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
        id: "",
        name: "",
        street1: "",
        city: "",
        state: "",
        maxClients: "",
    });

    const validateForm = () => {
        const errors: FormErrors = {};
        if(!houseData.id.trim()) {
            errors.id = "House ID is required";
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
            toast.success("House successfully added", {autoClose: 1500, position: "top-right"});
            navigate("/view-houses");
        }
    }

    const updateHouse = async (data: House) => {
        const response: {message: string, house?:House, errors: any} = await apiService.put(`house/${data.id}`, data);
        if(response.message === "House successfully updated" && response.house && response.house.id) {
            toast.success("House successfully updated", {autoClose: 1500, position: "top-right"});
            navigate("/view-houses");
            //setToastInfo({showToast: true, toastType: "success", toastMessage: "House successfully updated"});
            //setTimeout(() => {navigate("/view-houses")}, 1500);
        }
    }

    // <Card className="max-w-100 w-full py-5 px-4 flex flex-col items-center justify-center min-h-screen rounded-none xs:min-h-0 xs:rounded-xl">
    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-100">
            <PageCard title={isEdit ? "Update House" : "Add House"} size="xs" className="py-5 px-4" >
                <form className="flex flex-col items-center gap-5 w-full" onSubmit={submitHouse}>
                    <Input label="House ID" value={houseData.id} name="id" error={formErrors.id} onChange={updateHouseData} disabled={isEdit} containerClassName="w-full px-3" />
                    <Input label="House Name" value={houseData.name} name="name" error={formErrors.name} onChange={updateHouseData} containerClassName="w-full px-3" />
                    <Input label="Street 1" value={houseData.street1} name="street1" error={formErrors.street1} onChange={updateHouseData} containerClassName="w-full px-3" />
                    <Input label="Street 2" value={houseData.street2} name="street2" onChange={updateHouseData} containerClassName="w-full px-3" />
                    <Input label="City" value={houseData.city} error={formErrors.city} name="city" onChange={updateHouseData} containerClassName="w-full px-3" />
                    <Input label="State" value={houseData.state} error={formErrors.state} name="state" onChange={updateHouseData} containerClassName="w-full px-3" />
                    <Input label="Maximum Clients in House" value={houseData.maxClients} name="maxClients" error={formErrors.maxClients} onChange={updateHouseData} type="number" containerClassName="w-full px-3" />
                    <div>
                        <label>
                            <input type="checkbox" name="femaleEmployeeOnly" checked={houseData.femaleEmployeeOnly} onChange={updateHouseData} className="accent-accent mr-1" />
                            Female Only House
                        </label>
                        </div>
                    <Button className="w-full" >{isEdit ? "Update House" : "Add House"}</Button>
                    <Button className="w-full" variant="secondary" type="button">Cancel</Button>
                </form>
            </PageCard>
        </div>
    )
}


export default AddEditHousePage;