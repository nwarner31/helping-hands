import { useNavigate, useParams} from "react-router-dom";
import {Employee} from "../../../models/Employee";
import AddManagerListItem from "./AddManagerListItem";
import {useCallback} from "react";
import {House} from "../../../models/House";
import Button from "../../../components/Buttons/Button/Button";
import PageCard from "../../../components/Cards/PageCard/PageCard";
import List from "../../../components/List/List";
import ListItem from "../../../components/List/ListItem";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import LoadingText from "../../../components/TextAreas/LoadingText/LoadingText";
import {getHouse} from "../../../data/house.data";
import apiService from "../../../utility/ApiService";

export const AddHouseManagerPage = () => {
    const { houseId } = useParams();
    const navigate = useNavigate();

    useQueryClient();
    const {data: house, isLoading: isLoadingHouse} = useQuery<House>({
        queryKey: ["house", houseId],
        queryFn: () => getHouse(houseId!),
        staleTime: 5 * 60 * 1000
    });
    const getManagers = useCallback(async () => {
        const res = await apiService.get<{data: Employee[]}>(`house/${houseId}/available-managers`);
        return res.data;
    }, [houseId]);
    const {data: managers = []} = useQuery<Employee[]>({
        queryKey: ["house", houseId, "available-managers"],
        queryFn: getManagers
    });
    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-100 font-body">
            <PageCard title="Add House Manager" size="sm" className="py-4" >
                {house &&
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-center mb-3 mx-auto w-50">
                        <div className="font-semibold">House ID</div>
                        <div className="font-semibold">House Name</div>
                        <div>{house.id}</div>
                        <div>{house.name}</div>
                    </div>
                }
                {isLoadingHouse && <LoadingText />}
                <div className="px-3 w-full mb-4">
                    <Button className="w-full" variant="secondary" onClick={() => navigate(-1)} >Cancel</Button>
                </div>

                <List>
                    {managers.map((manager, index) =>
                        <ListItem id={manager.id} key={manager.id}>
                        <AddManagerListItem employee={manager} houseId={houseId!} isOdd={index % 2 === 0} />
                        </ListItem>)}
                </List>

            </PageCard>
        </div>
    );
}

export default AddHouseManagerPage;