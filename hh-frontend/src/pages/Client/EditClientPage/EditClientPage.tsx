import PageCard from "../../../components/Cards/PageCard/PageCard";
import {useNavigate, useParams} from "react-router-dom";
import {ClientInputSchema} from "../../../utility/validation/client.validation";
import {useState} from "react";
import ClientForm from "../../../components/Forms/ClientForm/ClientForm";
import {Client} from "../../../models/Client";
import {toast} from "react-toastify";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getClient} from "../../../data/client.data";
import {mapZodErrors} from "../../../utility/validation/utility.validation";
import apiService from "../../../utility/ApiService";


const EditClientPage = () => {
    const {clientId} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const {data: client} = useQuery({
        queryKey: ["client", clientId],
        queryFn: () => getClient(clientId!),
        staleTime: 5 * 60 * 1000,
    })

    const handleSubmit = async (data: Client) => {

        const result = ClientInputSchema.safeParse(data);
        if(result.success) {
            mutate(data);
        } else {
            setErrors(mapZodErrors(result.error));
        }
    }
    const updateClient = async (data: Client) => {
        try  {
            const response = await apiService.put<{data: Client}>(`client/${clientId}`, data);
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }

    const {mutate} = useMutation<Client, {errors: Record<string, string>}, Client>({
        mutationFn: updateClient,
        onSuccess: (updatedClient) => {
            toast.success("Client successfully updated", {autoClose: 1500, position: "top-right"});
            // istanbul ignore next
            queryClient.setQueryData(["clients"], (prev: Client[] | undefined) =>
            prev ? prev.map(client => (client.id === updatedClient.id) ? {...updatedClient} : client): []);
            navigate(-1);
        },
        onError: (error) => {
            if(error.errors) {
                setErrors(error.errors);
            }
        }
    })

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