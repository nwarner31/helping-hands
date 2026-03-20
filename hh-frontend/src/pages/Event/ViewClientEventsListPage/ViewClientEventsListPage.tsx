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
import {useGet} from "../../../hooks/getHook/get.hook";
import {toast} from "react-toastify";

const ViewClientEventsListPage = () => {
    const { clientId } = useParams();
    const [searchBy, setSearchBy] = useState("month");
    const [month, setMonth] = useState("");
    const [dateSearch, setDateSearch] = useState<{fromDate: string, toDate: string}>({fromDate: "", toDate: ""});
    const [errors, setErrors] = useState<{from?: string, to?: string, month?: string}>({from: "", to: "", month: ""});
    const [state, setState] = useState<"loading"|"error"|"success">("loading");
    const navigate = useNavigate();
    function updateDateSearch(event: ChangeEvent<HTMLInputElement>) {
        setDateSearch(prevState => ({...prevState, [event.target.name]: event.target.value}));
    }

    const {data: eventsData, get: getEvents, errors: apiErrors, status: apiStatus} = useGet<{events: []}>(`client/${clientId}/event`, {events: []});

    useEffect(() => {
        getEvents();
    }, [clientId]);

    useEffect(() => {
        if(apiErrors && apiErrors.message === "Client not found") {
            toast.error("Client not found", {autoClose: 1500, position: "top-right"});
            navigate("/view-clients");
        } else if(apiErrors && apiErrors.errors) {
            setErrors({month: apiErrors?.errors?.month ?? undefined, to: apiErrors?.errors?.toDate ?? undefined, from: apiErrors?.errors?.fromDate ?? undefined});
        } else if(apiErrors) {
            toast.error("Unknown error occurred", {autoClose: 1500, position: "top-right"});

        }
    }, [apiErrors]);
    useEffect(() => {
        if(apiStatus !== "idle")
            if (apiStatus!== "failed" && apiStatus !== "not_found") setState(apiStatus);
            else setState("error");
    }, [apiStatus]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        let body = {};
        // The else block is a fallback but should never execute within normal usage
        /* istanbul ignore else */
        if (searchBy === "month") {
            const monthError = validateMonth(month, "Month");
            if(monthError) {
                setErrors(prevState => ({...prevState, month: monthError}));
                setState("success");
                return;
            }
            body = {month}
        } else if (searchBy === "dates") {
            setErrors(prevState => ({...prevState, from: "", to: ""}));
            const fromError = validateDate(dateSearch.fromDate, "From");
            const toError = validateDate(dateSearch.toDate, "To");
            if(fromError || toError) {
                setErrors(prevState => ({...prevState, from: fromError, to: toError}));
                setState("success");
                return;
            }
            body = {from: dateSearch.fromDate, to: dateSearch.toDate};
        } else {
            toast.error("Invalid search type", {autoClose: 1500, position: "top-right"});
            setState("error");
            return;
        }
        getEvents(body);
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
                        <Button className="w-full" disabled={state === "loading"} >{state === "loading" ? "Loading..." : "Search"}</Button>
                    </div>

                </form>
                <div className="w-full">
                    {eventsData.events.length === 0 &&
                        <div className="text-center text-xl font-semibold">
                            {state === "loading" && "Fetching Events..."}
                            {state === "error" && "Unable to fetch events."}
                            {state === "success" && "No Events Found."}
                        </div>}
                    <List inset="small" borderVariant="secondary">
                        {eventsData.events.map((event: Event) => (<ListItem id={event.id} key={event.id} ><ViewClientEventItem event={event}  /></ListItem>))}
                    </List>

                </div>
            </PageCard>
        </div>
    );
}


export default ViewClientEventsListPage;