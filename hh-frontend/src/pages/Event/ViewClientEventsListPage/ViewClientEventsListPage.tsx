import Select from "../../../components/Inputs/Select/Select";
import React, {ChangeEvent, useEffect, useState} from "react";
import clsx from "clsx";
import StaticLabelInput from "../../../components/Inputs/StaticLabelInput/StaticLabelInput";
import Button from "../../../components/Buttons/Button/Button";
import {useParams, useNavigate} from "react-router-dom";
import ViewClientEventItem from "./ViewClientEventItem";
import {Event} from "../../../models/Event/Event";
import {validateDate, validateMonth} from "../../../utility/validation/dateTime.validation";
import PageCard from "../../../components/Cards/PageCard/PageCard";
import List from "../../../components/List/List";
import ListItem from "../../../components/List/ListItem";
import NavButtons from "../../../components/Buttons/NavButtons/NavButtons";
import {toast} from "react-toastify";
import PaginationButtons from "../../../components/Buttons/PaginationButtons/PaginationButtons";
import {useQuery} from "@tanstack/react-query";
import apiService from "../../../utility/ApiService";
import LoadingText from "../../../components/TextAreas/LoadingText/LoadingText";

const ViewClientEventsListPage = () => {
    const pageSize = 7;
    const { clientId } = useParams();
    const [searchBy, setSearchBy] = useState("month");
    const [month, setMonth] = useState("");
    const [page, setPage] = useState(1);
    const [numPages, setNumPages] = useState(1);
    const [dateSearch, setDateSearch] = useState<{fromDate: string, toDate: string}>({fromDate: "", toDate: ""});
    const [errors, setErrors] = useState<{from?: string, to?: string, month?: string}>({from: "", to: "", month: ""});
    //const [state, setState] = useState<"loading"|"error"|"success">("loading");
    const [paginateEvents, setPaginateEvents] = useState<Event[]>([])
    const navigate = useNavigate();
    function updateDateSearch(event: ChangeEvent<HTMLInputElement>) {
        setDateSearch(prevState => ({...prevState, [event.target.name]: event.target.value}));
    }
    const [searchTerms, setSearchTerms] = useState<{to?: string, from?: string, month?: string}>({})

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        // The else block is a fallback but should never execute within normal usage
        /* istanbul ignore else */
        setErrors({});
        if (searchBy === "month") {
            const monthError = validateMonth(month, "Month");
            if(monthError) {
                setErrors(prevState => ({...prevState, month: monthError}));
                return;
            }
            setSearchTerms({month});
        } else if (searchBy === "dates") {
            setErrors(prevState => ({...prevState, from: "", to: ""}));
            const fromError = validateDate(dateSearch.fromDate, "From");
            const toError = validateDate(dateSearch.toDate, "To");
            if(fromError || toError) {
                setErrors(prevState => ({...prevState, from: fromError, to: toError}));
                return;
            }
            setSearchTerms({from: dateSearch.fromDate, to: dateSearch.toDate});
        } else {
            toast.error("Invalid search type", {autoClose: 1500, position: "top-right"});
            return;
        }
    }

    const getEvents = async (search: {month?: string, to?: string, from?: string}) => {
        try {
            const response = await apiService.get<{data: Event[]}>(`client/${clientId}/event`, {params: search});
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }
    const {data: events, error, isLoading} = useQuery<Event[], {message: string, errors: { toDate?: string, fromDate?: string, month?: string}}>({
        queryKey: ["client-events", clientId, {searchTerms}],
        queryFn: () => getEvents(searchTerms),
        staleTime: 45 * 1000,
        retry: false
    })

    useEffect(() => {
        if(events) {
            setPage(1);
            setNumPages(Math.ceil(events.length / pageSize));
            setPaginateEvents(events.slice(0, pageSize));
        }
    }, [events]);
    useEffect(() => {
        setPaginateEvents(events ? events.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize) : []);
    }, [page]);
    useEffect(() => {
        if(error) {
            if(error.message === "Client not found") navigate("/view-clients");
            if(error.errors) {
                const errorMap = {to: error.errors.toDate, from: error.errors.fromDate, month: error.errors.month};
                setErrors(errorMap);
            } else {

            }

        }
    }, [error]);

    function paginate (pageNumber: number) {
        setPage(pageNumber);
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-100">
           <PageCard title="View Client Events" size="sm" className="py-4 px-1" >
               <NavButtons showBackButton={true} className="mx-3" />
                <form onSubmit={handleSubmit} className="flex flex-col items-center gap-y-3 w-full mb-2">
                        <Select containerClass="w-40" className="border-1 rounded-md" name="searchBy" value={searchBy} onChange={(e) => setSearchBy(e.target.value)} label="Search by" options={[{label: "Month", value: "month"}, {label: "Dates", value: "dates"}]} />
                    <div className={clsx(searchBy === "month" ? "block" : "hidden")}>
                        <StaticLabelInput name="month" label="Month" type="month" onChange={(e) => setMonth(e.target.value)} error={errors.month} errorOnBaseline={false} />
                    </div>
                    <div className={clsx("flex gap-x-3", searchBy === "dates" ? "block" : "hidden")}>
                        <StaticLabelInput label="From" name="fromDate" type="date" value={dateSearch.fromDate} onChange={updateDateSearch} error={errors.from} errorOnBaseline={false} />
                        <StaticLabelInput label="To" name="toDate" type="date" value={dateSearch.toDate} onChange={updateDateSearch} error={errors.to} errorOnBaseline={false} />
                    </div>
                    <div className="px-3 w-full">
                        <Button className="w-full" disabled={isLoading} >{isLoading ? "Loading..." : "Search"}</Button>
                    </div>

                </form>
                <div className="w-full">
                    {isLoading && <LoadingText />}
                    {!isLoading && !error && paginateEvents.length === 0 &&
                        <div className="text-center text-xl font-semibold">No Events Found </div>}
                    {error &&  <div className="text-center text-xl font-semibold">Unable to fetch events</div>}

                    <List inset="small" borderVariant="secondary">
                        {paginateEvents.map((event: Event) => (<ListItem id={event.id} key={event.id} ><ViewClientEventItem event={event}  /></ListItem>))}
                    </List>
                    {numPages > 1 && <PaginationButtons page={page} numPages={numPages} onPageChange={paginate} />}
                </div>
            </PageCard>
        </div>
    );
}


export default ViewClientEventsListPage;