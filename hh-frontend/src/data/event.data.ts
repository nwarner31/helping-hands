import apiService from "../utility/ApiService";
import {Event} from "../models/Event/Event";

export const getEvent = async (eventId: string) => {
    const response = await apiService.get<{data: Event}>(`/event/${eventId}`);
    return response.data;
}