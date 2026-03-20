import { useNavigate, useParams } from "react-router-dom";
import {Client} from "../../../models/Client";
import PageCard from "../../../components/Cards/PageCard/PageCard";
import {formatDate} from "../../../utility/formatting";
import ClientEventForm, {ClientEvent} from "../../../components/Forms/ClientEventForm/ClientEventForm";
import {useMutate} from "../../../hooks/mutateHook/mutate.hook";
import {EventInputSchema} from "../../../utility/validation/event.validation";
import {toast} from "react-toastify";
import {usePrefetchData} from "../../../hooks/prefetchData/prefetchData.hook";
import {useEffect} from "react";

const AddClientEventPage = () => {
    const {clientId} = useParams();
    const { fetchData, data: client} = usePrefetchData<Client>("client", `client/${clientId}`);
    const navigate = useNavigate();
    const { errors, mutate} = useMutate<ClientEvent>(`client/${clientId}/event`, "POST", EventInputSchema);

    useEffect(() => {
        fetchData();
    }, []);
    const handleSubmit = async (formData: ClientEvent) => {
        const success = await mutate(formData);
        if(success) {
            toast.success("Event successfully added", {autoClose: 1500, position: "top-right"});
            navigate(`/view-client/${clientId}`);
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-100">
            <PageCard title="Add Client Event" size="md-lg" className="py-4 px-3" >
                {client &&
                    <div data-testid="client-data" className="text-center font-semibold font-body mb-3">
                        <div>Client ID: {client.id}</div>
                        <div>Name: {client.legalName}</div>
                        <div>Date of Birth: {formatDate(client.dateOfBirth)}</div>
                    </div>
                }
                <ClientEventForm errors={errors} submitButtonText="Add Event" onSubmit={handleSubmit} />
            </PageCard>
        </div>
    );
}

export default AddClientEventPage