import Card from "../../components/Card/Card";
import apiService from "../../utility/ApiService";
import {LoaderFunctionArgs, useLoaderData, useLocation, useParams} from "react-router-dom";
import {Employee} from "../../models/Employee";
import AddManagerListItem from "./AddManagerListItem";
import {useEffect, useState} from "react";
import {House} from "../../models/House";
import Button from "../../components/Buttons/Button/Button";

export const AddHouseManagerPage = () => {
    const {managers} = useLoaderData<{managers: Employee[]}>();
    const { houseId } = useParams();
    const location = useLocation();
    const [houseData, setHouseData] = useState(location.state?.house);
    useEffect(() => {
        const fetchHouse = async () => {
            const {house} = await apiService.get<{house: House}>(`house/${houseId}`);
            setHouseData(house);
        }
        if(!houseData) {
            fetchHouse();
        }
    }, []);
    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-100 font-body">
            <Card className="py-3 flex flex-col items-center gap-y-4 max-w-123">
                <h1 className="text-2xl font-header font-bold text-accent mb-2">Add House Manager</h1>
                {houseData &&
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-center mb-3 mx-auto w-50">
                        <div className="font-semibold">House ID</div>
                        <div className="font-semibold">House Name</div>
                        <div>{houseData.id}</div>
                        <div>{houseData.name}</div>
                    </div>
                }
                <div className="px-3 w-full">
                    <Button className="w-full" variant="secondary" >Cancel</Button>
                </div>

                {managers.map((manager, index) => <AddManagerListItem key={manager.id} employee={manager} houseId={houseId!} isOdd={index % 2 === 0} />)}
            </Card>
        </div>
    );
}

export default AddHouseManagerPage;


export const loader = async ({params}: LoaderFunctionArgs) => apiService.get(`house/${params.houseId}/available-managers`);