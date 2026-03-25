import apiService from "../utility/ApiService";
import {House} from "../models/House";


export const getHouse = async (houseId: string) => {
    const res = await apiService.get<{data: House}>(`house/${houseId}`);
    return res.data;
}