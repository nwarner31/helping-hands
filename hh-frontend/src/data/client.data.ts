import apiService from "../utility/ApiService";
import {Client} from "../models/Client";


export const getClient = async (clientId: string) => {
    const res = await apiService.get<{data: Client}>(`/client/${clientId}`);
    return res.data;
}