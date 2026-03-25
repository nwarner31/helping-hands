import PageCard from "../../../components/Cards/PageCard/PageCard";
import StaticLabelInput from "../../../components/Inputs/StaticLabelInput/StaticLabelInput";
import Button from "../../../components/Buttons/Button/Button";
import React, {useEffect, useState} from "react";
import {EventConflict} from "../../../models/Event/Event";
import List from "../../../components/List/List";
import ListItem from "../../../components/List/ListItem";
import {useParams} from "react-router-dom";
import ViewClientEventConflictsItem from "./ViewClientEventConflictsItem";
import NavButtons from "../../../components/Buttons/NavButtons/NavButtons";
import apiService from "../../../utility/ApiService";
import {useQuery} from "@tanstack/react-query";
import LoadingText from "../../../components/TextAreas/LoadingText/LoadingText";
import PaginationButtons from "../../../components/Buttons/PaginationButtons/PaginationButtons";


const ViewClientEventConflictsPage = () => {
    const pageSize = 8;
    const { clientId } = useParams();
    const [searchDates, setSearchDates] = useState<{beginDate: string, endDate: string}>({beginDate: "", endDate: ""});
    const [searchTerms, setSearchTerms] = useState<{beginDate?:string, endDate?: string}>({})
    const [page, setPage] = useState(1);
    const [numPages, setNumPages] = useState(1);
    const [paginateConflicts, setPaginateConflicts] = useState<EventConflict[]>([])

    const getEventConflicts = async (e?: React.FormEvent<HTMLFormElement>) => {
        if(e) e.preventDefault();
        let search = {};
        if(searchDates.beginDate.trim() !== "") {
            search = {beginDate: searchDates.beginDate};
        }
        if(searchDates.endDate.trim() !== "") {
            search = {...search, endDate: searchDates.endDate};
        }
        setSearchTerms(search);
    }

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSearchDates(prevState => ({ ...prevState, [name]: value }));
    }

    const getConflicts = async (search: {beginDate?: string, endDate?: string})=> {
        try {
            const response = await apiService.get<{data: EventConflict[]}>(`client/${clientId}/event/get-conflicts`, {params: search});
            return response.data;
        } catch (error: any) {

        }
    }
    const {data: eventConflicts, isLoading} = useQuery({
        queryKey: ["event-conflicts", clientId, searchTerms],
        queryFn: () => getConflicts(searchTerms),
        staleTime: 45 * 1000,
        retry: false
    });
    useEffect(() => {
        if (eventConflicts) {
            setPaginateConflicts(eventConflicts.slice((page - 1) * pageSize, page * pageSize));
            setPage(1);
            setNumPages(Math.ceil(eventConflicts.length / pageSize));
        }
    }, [eventConflicts]);
    useEffect(() => {
        setPaginateConflicts(eventConflicts ? eventConflicts.slice((page - 1) * pageSize, page * pageSize) : []);
    }, [page]);
    const changePage = (pageNumber: number) => {
        setPage(pageNumber);
    }

    return (
        <div className="flex justify-center items-center bg-slate-100 min-h-screen">
            <PageCard title="View Event Conflicts" size="md-lg" className="py-4" >
                <NavButtons showBackButton={true} className="mx-3" />
                <form className="px-4 mb-4" onSubmit={getEventConflicts}>
                    <div className="flex gap-x-3 justify-center mb-3">
                        <StaticLabelInput label="Begin Date" name="beginDate" type="date" value={searchDates.beginDate} onChange={handleDateChange} />
                        <StaticLabelInput label="End Date" name="endDate" type="date" value={searchDates.endDate} onChange={handleDateChange} />
                    </div>
                    <Button className="w-full">Search</Button>
                </form>
                {isLoading && <LoadingText />}
                {paginateConflicts.length > 0 &&
                <List>
                    {paginateConflicts.map(ec =>
                    <ListItem id={ec.event.id} key={ec.event.id} >
                        <ViewClientEventConflictsItem conflict={ec} />
                    </ListItem>)}
                </List>}
                {numPages > 1 && <PaginationButtons page={page} numPages={numPages} onPageChange={changePage} />}
            </PageCard>
        </div>
    );
}


export default ViewClientEventConflictsPage;