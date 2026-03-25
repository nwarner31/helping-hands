import { useNavigate, useParams } from "react-router-dom";
import PageCard from "../../../components/Cards/PageCard/PageCard";
import {formatDate} from "../../../utility/formatting";
import ClientEventForm, {ClientEvent} from "../../../components/Forms/ClientEventForm/ClientEventForm";
import {EventInputSchema} from "../../../utility/validation/event.validation";
import {toast} from "react-toastify";
import {useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {mapZodErrors} from "../../../utility/validation/utility.validation";
import apiService from "../../../utility/ApiService";
import {Event} from "../../../models/Event/Event";
import {getClient} from "../../../data/client.data";

const AddClientEventPage = () => {
    const {clientId} = useParams();
    const [errors, setErrors] = useState<Record<string, string>>({})
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const {data: client} = useQuery({
        queryKey: ["client", clientId],
        queryFn: () => getClient(clientId!),
        staleTime: 5 * 60 * 1000,
    })
    const handleSubmit = async (formData: ClientEvent) => {
        const result = EventInputSchema.safeParse(formData);
        if (result.success) {
            mutate(formData);
        } else {
            setErrors(mapZodErrors(result.error));
        }
    }
    const createEvent = async (data: ClientEvent) => {
        try {
            const response = await apiService.post<{data: Event}>(`client/${clientId}/event`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
    const {mutate} = useMutation<Event, {errors: Record<string, string>}, ClientEvent>({
        mutationFn: createEvent,
        onSuccess: (newEvent) => {
            toast.success("Event successfully added", {autoClose: 1500, position: "top-right"});
            queryClient.setQueryData(["event", newEvent.id], () => newEvent);
            navigate(`/view-client/${clientId}`);
        },
        onError: (error) => {
            if(error.errors) {
                setErrors(error.errors);
            }
        }
    })

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