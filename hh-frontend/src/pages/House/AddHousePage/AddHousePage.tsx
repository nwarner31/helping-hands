import PageCard from "../../../components/Cards/PageCard/PageCard";
import {useNavigate} from "react-router-dom";
import {HouseInputSchema} from "../../../utility/validation/house.validation";
import HouseForm, {House} from "../../../components/Forms/HouseForm/HouseForm";
import {toast} from "react-toastify";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import apiService from "../../../utility/ApiService";
import {useState} from "react";
import {mapZodErrors} from "../../../utility/validation/utility.validation";


const AddHousePage = () => {
    const navigate = useNavigate();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const queryClient = useQueryClient();

    const handleSubmit = async (data: House) => {
        const result = HouseInputSchema.safeParse(data);
        if(result.success) {
            mutate(data);
        } else {
            setErrors(mapZodErrors(result.error));
        }
    }

    const createHouse = async (data: House) => {
        try {
            const response = await apiService.post<{data: House}>("house", data);
            return response.data;
        } catch (error: any) {
            throw error;
        }

    }
    const {mutate} = useMutation<House, Error, House>({
        mutationFn: createHouse,
        onSuccess: (newHouse) => {
            toast.success("House successfully added", {autoClose: 1500, position: "top-right"});
            queryClient.setQueryData(["houses"],
                (prev: House[] | undefined) => prev ? [...prev, newHouse] : [newHouse]);
            navigate("/view-houses");
        },
        onError: (errors: any) => {
            if(errors.errors) {
                setErrors(errors.errors);
            }

        }
    })

    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-100">
            <PageCard title="Add House" size="xs" className="py-5 px-4" >
                <HouseForm errors={errors} submitButtonText="Add House" onSubmit={handleSubmit} />
            </PageCard>
        </div>
    );
}


export default AddHousePage;