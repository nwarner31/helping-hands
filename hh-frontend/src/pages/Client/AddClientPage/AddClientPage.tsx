import PageCard from "../../../components/Cards/PageCard/PageCard";
import ClientForm from "../../../components/Forms/ClientForm/ClientForm";
import {useNavigate} from "react-router-dom";
import {ClientInputSchema} from "../../../utility/validation/client.validation";
import {Client} from "../../../models/Client";
import {toast} from "react-toastify";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import apiService from "../../../utility/ApiService";
import {useState} from "react";
import {mapZodErrors} from "../../../utility/validation/utility.validation";


const AddClientPage = () => {
    const navigate = useNavigate();
    const [errors, setErrors] = useState<Record<string, string>>({})
    const queryClient = useQueryClient();

    const handleSubmit = async (formData: Client) => {
        const result = ClientInputSchema.safeParse(formData);
        if (result.success) {
            mutate(formData);
        } else {
            setErrors(mapZodErrors(result.error));
        }
    }
    const createClient = async (data: Client) => {
        try {
            const response = await apiService.post<{ data: Client }>(`client`, data);
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }
    const {mutate} = useMutation<Client, Error, Client>({
        mutationFn: createClient,
        onSuccess: (newClient) => {
            toast.success("Client successfully added", {autoClose: 1500, position: "top-right"});
            // istanbul ignore next
            queryClient.setQueryData(["clients"],
                (prev: Client[] | undefined) => prev ? [...prev, newClient] : [newClient]);
            navigate("/view-clients");
        },
        onError: (errors: any) => {
            if(errors.errors)    {
                setErrors(errors.errors);
            }
        }
    });

    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-100">
            <PageCard title="Add Client" size="md-lg" className="py-4 px-3" >
                <ClientForm submitButtonText="Add Client" errors={errors} onSubmit={handleSubmit} />
            </PageCard>
        </div>
    );
}

export default AddClientPage;