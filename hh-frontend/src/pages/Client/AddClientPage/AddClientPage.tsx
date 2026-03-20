import PageCard from "../../../components/Cards/PageCard/PageCard";
import ClientForm from "../../../components/Forms/ClientForm/ClientForm";
import {useNavigate} from "react-router-dom";
import {useMutate} from "../../../hooks/mutateHook/mutate.hook";
import {ClientInputSchema} from "../../../utility/validation/client.validation";
import {Client} from "../../../models/Client";
import {toast} from "react-toastify";


const AddClientPage = () => {
    const navigate = useNavigate();
    const {mutate: post, errors} = useMutate("client", "POST", ClientInputSchema);

    const handleSubmit = async (formData: Client)=> {
        const success = await post(formData);
        if(success) {
            toast.success("Client successfully added", {autoClose: 1500, position: "top-right"});
            navigate("/view-clients");
        }
    }
    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-100">
            <PageCard title="Add Client" size="md-lg" className="py-4 px-3" >
                <ClientForm submitButtonText="Add Client" errors={errors} onSubmit={handleSubmit} />
            </PageCard>
        </div>
    );
}

export default AddClientPage;