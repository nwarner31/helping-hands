import PageCard from "../../../components/Cards/PageCard/PageCard";
import {useNavigate, useParams} from "react-router-dom";
import {useMutate} from "../../../hooks/mutateHook/mutate.hook";
import {ClientInputSchema} from "../../../utility/validation/client.validation";
import {usePrefetchData} from "../../../hooks/prefetchData/prefetchData.hook";
import {useEffect} from "react";
import ClientForm from "../../../components/Forms/ClientForm/ClientForm";
import {Client} from "../../../models/Client";
import {toast} from "react-toastify";


const EditClientPage = () => {
    const {clientId} = useParams();
    const navigate = useNavigate();
    const {errors, mutate: put} = useMutate(`client/${clientId}`, "PUT", ClientInputSchema);
    const {data: client, fetchData} = usePrefetchData<Client>("client", `client/${clientId}`);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    const handleSubmit = async (data: Client) => {
        const success = await put(data);
        console.log(success)
        if(success) {
            toast.success("Client successfully updated", {autoClose: 1500, position: "top-right"});
            navigate(-1);
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-100">
            <PageCard title="Edit Client" size="md-lg" className="py-4 px-3" >
                {client &&
                    <ClientForm submitButtonText="Update Client" errors={errors} onSubmit={handleSubmit} initialData={client} />
                }
            </PageCard>
        </div>
    );
}

export default EditClientPage;