import PageCard from "../../../components/Cards/PageCard/PageCard";
import { useNavigate, useParams } from "react-router-dom";
import HouseForm, {House as HouseInput} from "../../../components/Forms/HouseForm/HouseForm";
import {HouseInputSchema} from "../../../utility/validation/house.validation";
import {toast} from "react-toastify";
import {convertToHouseForm} from "../../../models/House";
import {House} from "../../../models/House";
import {useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getHouse} from "../../../data/house.data";
import LoadingText from "../../../components/TextAreas/LoadingText/LoadingText";
import {mapZodErrors} from "../../../utility/validation/utility.validation";
import apiService from "../../../utility/ApiService";


const EditHousePage = () => {
    const {houseId} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [errors, setErrors] = useState<Record<string, string>>({})
    const handleSubmit = async (data: HouseInput) => {
        const result = HouseInputSchema.safeParse(data);
        if(result.success) {
            mutate(data);
        } else {
            setErrors(mapZodErrors(result.error));
        }
    }
    const updateHouse = async (data: HouseInput) => {
        try {
            const response = await apiService.put<{data: House}>(`house/${houseId}`, data);
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }
    const {mutate} = useMutation({
        mutationFn: updateHouse,
        onSuccess: (updatedHouse) => {
            toast.success("House successfully updated", {autoClose: 1500, position: "top-right"});
            queryClient.setQueryData(["house", houseId], updatedHouse);
            queryClient.setQueryData(["houses"], (prev: House[] | undefined) =>
                prev ? prev.map(house => (house.id === updatedHouse.id ? {...updatedHouse} : house)): []);

            navigate("/view-houses");
        },
        onError: (errors: any) => {
            if(errors.errors) {
                setErrors(errors.errors);
            }
        }
    })

    const {data: house, isLoading} = useQuery({
        queryKey: ["house", houseId],
        queryFn: () => getHouse(houseId!),
        staleTime: 5 * 60 *1000
    });

    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-100">
            <PageCard title="Edit House" size="xs" className="py-5 px-4" >
                { house &&
                    <HouseForm errors={errors} submitButtonText="Update House" onSubmit={handleSubmit} initialData={convertToHouseForm(house)} />
                }
                {isLoading && <LoadingText />}
            </PageCard>
        </div>
    );
}


export default EditHousePage;