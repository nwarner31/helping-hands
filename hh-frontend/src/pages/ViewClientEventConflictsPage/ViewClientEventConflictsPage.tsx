import PageCard from "../../components/Cards/PageCard/PageCard";
import StaticLabelInput from "../../components/Inputs/StaticLabelInput/StaticLabelInput";
import Button from "../../components/Buttons/Button/Button";
import React, {useEffect, useState} from "react";
import {EventConflict} from "../../models/Event/Event";
import List from "../../components/List/List";
import ListItem from "../../components/List/ListItem";
import {useGet} from "../../hooks/get.hook";
import {useParams} from "react-router-dom";
import ViewClientEventConflictsItem from "./ViewClientEventConflictsItem";


const ViewClientEventConflictsPage = () => {
    const { clientId } = useParams();
    // const [eventConflicts, setEventConflicts] = useState<EventConflict[]>([]);
    const [searchDates, setSearchDates] = useState<{beginDate: string, endDate: string}>({beginDate: "", endDate: ""});
    const {get, data, status} = useGet<EventConflict[]>(`client/${clientId}/event/get-conflicts`, []);
    useEffect(() => {
        getEventConflicts();
    }, [clientId]);

    const getEventConflicts = async (e?: React.FormEvent<HTMLFormElement>) => {
        if(e) e.preventDefault();
        await get(searchDates);
    }

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSearchDates(prevState => ({ ...prevState, [name]: value }));
    }

    return (
        <div className="flex justify-center items-center bg-slate-100 min-h-screen">
            <PageCard title="View Event Conflicts" size="md-lg" >
                <form className="px-4 mb-4" onSubmit={getEventConflicts}>
                    <div className="flex gap-x-3 justify-center mb-3">
                        <StaticLabelInput label="Begin Date" name="beginDate" type="date" value={searchDates.beginDate} onChange={handleDateChange} />
                        <StaticLabelInput label="End Date" name="endDate" type="date" value={searchDates.endDate} onChange={handleDateChange} />
                    </div>
                    <Button className="w-full">Search</Button>
                </form>
                {status === "loading" && <h2 className="text-center text-xl font-header font-bold">Loading...</h2>}
                {data.length > 0 &&
                <List>
                    {data.map(ec =>
                    <ListItem id={ec.event.id} key={ec.event.id} >
                        <ViewClientEventConflictsItem conflict={ec} />
                    </ListItem>)}
                </List>}
            </PageCard>
        </div>
    );
}


export default ViewClientEventConflictsPage;