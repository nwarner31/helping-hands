import PageCard from "../../../components/Cards/PageCard/PageCard";
import { useNavigate, useParams} from "react-router-dom";
import {convertToEventForm, Event} from "../../../models/Event/Event";
import ClientEventForm, {ClientEvent} from "../../../components/Forms/ClientEventForm/ClientEventForm";
import {EventInputSchema} from "../../../utility/validation/event.validation";
import {toast} from "react-toastify";
import {formatDate} from "../../../utility/formatting";
import {useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import apiService from "../../../utility/ApiService";
import {mapZodErrors} from "../../../utility/validation/utility.validation";
import {getEvent} from "../../../data/event.data";
import LoadingText from "../../../components/TextAreas/LoadingText/LoadingText";

const EditClientEventPage = () => {
    const {eventId} = useParams();
    const queryClient = useQueryClient();
    const [errors, setErrors] = useState<Record<string, string>>({})
    const navigate = useNavigate();

    const {data: event, isLoading} = useQuery({
        queryKey: ["event", eventId],
        queryFn: () => getEvent(eventId!),
        staleTime: 5 * 60 *1000,
    })

    const handleSubmit = async (formData: ClientEvent) => {
        const result = EventInputSchema.safeParse(formData);
        if(result.success) {
            mutate(formData);
        } else {
            setErrors(mapZodErrors(result.error));

        }
    }
    const updateEvent = async (data: ClientEvent) => {
        try {
            const response = await apiService.put<{data: Event}>(`event/${eventId}`, data);
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }
    const {mutate} = useMutation({
        mutationFn: updateEvent,
        onSuccess: (updatedEvent) => {
            toast.success("Event successfully updated", {autoClose: 1500, position: "top-right"});
            queryClient.setQueryData(["event", updatedEvent.id], updatedEvent);
            navigate(-1);
        },
        onError: (error: any) => {
            if(error.errors) {
                setErrors(error.errors);
            }
        }
    })

    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-100">
            <PageCard title="Edit Client Event" size="md-lg" className="py-4 px-3" >
                {event &&
                    <>
                        <div className="text-center font-semibold font-body mb-3">
                            <div>Client ID: {event.client.id}</div>
                            <div>Name: {event.client.legalName}</div>
                            <div>Date of Birth: {formatDate(event.client.dateOfBirth)}</div>
                        </div>
                        <ClientEventForm errors={errors} submitButtonText="Update Event" onSubmit={handleSubmit} initialData={convertToEventForm(event)} />
                    </>
            }
                {isLoading && <LoadingText />}
            </PageCard>
        </div>
    );
}

export default EditClientEventPage