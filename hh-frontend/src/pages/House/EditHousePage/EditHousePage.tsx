import PageCard from "../../../components/Cards/PageCard/PageCard";
import { useNavigate, useParams } from "react-router-dom";
import {useMutate} from "../../../hooks/mutateHook/mutate.hook";
import HouseForm, {House as HouseInput} from "../../../components/Forms/HouseForm/HouseForm";
import {HouseInputSchema} from "../../../utility/validation/house.validation";
import {toast} from "react-toastify";
import {convertToHouseForm} from "../../../models/House";
import {House} from "../../../models/House";
import {useEffect} from "react";
import {usePrefetchData} from "../../../hooks/prefetchData/prefetchData.hook";


const EditHousePage = () => {
    const {houseId} = useParams();
    const navigate = useNavigate();
    const {errors, mutate} = useMutate(`house/${houseId}`, "PUT", HouseInputSchema);
    const {data: house, fetchData} = usePrefetchData<House>("house", `house/${houseId}`);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    const handleSubmit = async (data: HouseInput) => {
        const success = await mutate(data);
        if(success) {
            toast.success("House successfully updated", {autoClose: 1500, position: "top-right"});
            navigate("/view-houses");
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-100">
            <PageCard title="Edit House" size="xs" className="py-5 px-4" >
                { house &&
                    <HouseForm errors={errors} submitButtonText="Update House" onSubmit={handleSubmit} initialData={convertToHouseForm(house)} />
                }
            </PageCard>
        </div>
    );
}


export default EditHousePage;