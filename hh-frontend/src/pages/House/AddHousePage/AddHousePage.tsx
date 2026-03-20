import PageCard from "../../../components/Cards/PageCard/PageCard";
import {useNavigate} from "react-router-dom";
import {useMutate} from "../../../hooks/mutateHook/mutate.hook";
import {HouseInputSchema} from "../../../utility/validation/house.validation";
import HouseForm, {House} from "../../../components/Forms/HouseForm/HouseForm";
import {toast} from "react-toastify";


const AddHousePage = () => {
    const navigate = useNavigate();
    const {errors, mutate} = useMutate("house", "POST", HouseInputSchema);

    const handleSubmit = async (data: House) => {
        const success = await mutate(data);
        if(success) {
            toast.success("House successfully added", {autoClose: 1500, position: "top-right"});
            navigate("/view-houses");
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-100">
            <PageCard title="Add House" size="xs" className="py-5 px-4" >
                <HouseForm errors={errors} submitButtonText="Add House" onSubmit={handleSubmit} />
            </PageCard>
        </div>
    );
}


export default AddHousePage;