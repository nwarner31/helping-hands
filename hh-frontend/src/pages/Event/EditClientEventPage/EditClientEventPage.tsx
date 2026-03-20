import PageCard from "../../../components/Cards/PageCard/PageCard";
import { useNavigate, useParams} from "react-router-dom";
import {convertToEventForm, Event} from "../../../models/Event/Event";
import ClientEventForm, {ClientEvent} from "../../../components/Forms/ClientEventForm/ClientEventForm";
import {useMutate} from "../../../hooks/mutateHook/mutate.hook";
import {EventInputSchema} from "../../../utility/validation/event.validation";
import {toast} from "react-toastify";
import {formatDate} from "../../../utility/formatting";
import {usePrefetchData} from "../../../hooks/prefetchData/prefetchData.hook";
import {useEffect} from "react";

const EditClientEventPage = () => {
    const {eventId} = useParams();
    const {data: event, fetchData} = usePrefetchData<Event>("event", `event/${eventId}`);
    const {errors, mutate} = useMutate<ClientEvent>(`event/${eventId}`, "PUT", EventInputSchema);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (formData: ClientEvent) => {
        const success = await mutate(formData);
        if(success) {
            toast.success("Event successfully updated", {autoClose: 1500, position: "top-right"});
            navigate(-1);
        }
    }

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
            </PageCard>
        </div>
    );
}

export default EditClientEventPage