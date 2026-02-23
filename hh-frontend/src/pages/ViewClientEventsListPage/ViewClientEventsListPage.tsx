import Select from "../../components/Inputs/Select/Select";
import React, {ChangeEvent, useEffect, useState} from "react";
import clsx from "clsx";
import StaticLabelInput from "../../components/Inputs/StaticLabelInput/StaticLabelInput";
import Button from "../../components/Buttons/Button/Button";
import {useParams, useNavigate} from "react-router-dom";
import apiService from "../../utility/ApiService";
import ViewClientEventItem from "./ViewClientEventItem";
import {Event} from "../../models/Event/Event";
import Toast from "../../components/Toast/Toast";
import {validateDate, validateMonth} from "../../utility/validation/dateTime.validation";
import PageCard from "../../components/Cards/PageCard/PageCard";

const ViewClientEventsListPage = () => {
    const { clientId } = useParams();
    const [searchBy, setSearchBy] = useState("month");
    const [month, setMonth] = useState("");
    const [dateSearch, setDateSearch] = useState<{fromDate: string, toDate: string}>({fromDate: "", toDate: ""});
    const [events, setEvents] = useState<Event[]>([]);
    const [toastInfo, setToastInfo] = useState<{showToast: boolean, toastType: "info"|"success"|"error", toastMessage: string}>({showToast: false,toastType: "info", toastMessage: ""});
    const [errors, setErrors] = useState<{from?: string, to?: string, month?: string}>({from: "", to: "", month: ""});
    const [state, setState] = useState<"loading"|"error"|"success">("loading");
    const navigate = useNavigate();
    function updateDateSearch(event: ChangeEvent<HTMLInputElement>) {
        setDateSearch(prevState => ({...prevState, [event.target.name]: event.target.value}));
    }

    async function displayToast (type: "info"|"success"|"error", message: string) {
        return new Promise<void>((resolve) => {
            setToastInfo({ showToast: true, toastType: type, toastMessage: message });
            setTimeout(() => {
                setToastInfo({ showToast: false, toastType: "info", toastMessage: "" });
                resolve();
            }, 1500);
        });
    }

    useEffect(() => {
        async function getCurrentMonth () {
            setState("loading");
            const response = await apiService.get< {success:boolean, message: string, events?: Event[], errors?: {month?: string, fromDate?: string, toDate?: string}}>(`client/${clientId}/event`);
            if (response.message === "Events found" && response.events) {
                setEvents(response.events);
                setState("success");
            } else if(response.message === "Client not found") {
                await displayToast("error", "Client was not found.");
                navigate("/view-clients");
            } else {
                await displayToast("error", "Unable to get current month events.");
                setState("error");
            }
        }
        getCurrentMonth();

    }, [clientId]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setState("loading");
        setEvents([]);
        let url = "";
        if (searchBy === "month") {
            setErrors(prevState => ({...prevState, month: ""}));
            const monthError = validateMonth(month, "Month");
            if(monthError) {
                setErrors(prevState => ({...prevState, month: monthError}));
                setState("success");
                return;
            }
            url = `client/${clientId}/event?month=${month}`;
        } else if (searchBy === "dates") {
            setErrors(prevState => ({...prevState, from: "", to: ""}));
            const fromError = validateDate(dateSearch.fromDate, "From");
            const toError = validateDate(dateSearch.toDate, "To");
            if(fromError || toError) {
                setErrors(prevState => ({...prevState, from: fromError, to: toError}));
                setState("success");
                return;
            }
            url = `client/${clientId}/event?from=${dateSearch.fromDate}&to=${dateSearch.toDate}`;
            // The else block is a fallback but should never execute within normal usage
            /* istanbul ignore next */
        } else {
            await displayToast("error", "Invalid search type");
            setState("error");
            return;
        }
        const response = await apiService.get< {success:boolean, message: string, events?: Event[], errors?: {month?: string, fromDate?: string, toDate?: string}}>(url);
        if(response.message === "Events found" && response.events) {
            setEvents(response.events);
            setState("success");
        } else if(response.message === "Client not found") {
            await displayToast("error", "Client was not found.");
            navigate("/view-clients");
        } else if(response.errors) {
            const {month, fromDate, toDate} = response.errors;
            setErrors(prevState => ({
                ...prevState,
                ...(month && {month}),
                ...(fromDate && {from: fromDate}),
                ...(toDate && {to: toDate}),
            }));
            // Update empty-events text to show error
            setState("error");
        } else if (!response.success) {
            await displayToast("error", "Unknown error occurred.");
            setState("error"); // unknown fetch error
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-100">
           <PageCard title="View Client Events" size="sm" className="py-4 px-1" >
                <form onSubmit={handleSubmit} className="flex flex-col items-center gap-y-3 w-full">
                        <Select containerClass="w-40" className="border-1 rounded-md" name="searchBy" value={searchBy} onChange={(e) => setSearchBy(e.target.value)} label="Search by" options={[{label: "Month", value: "month"}, {label: "Dates", value: "dates"}]} />
                    <div className={clsx(searchBy === "month" ? "block" : "hidden")}>
                        <StaticLabelInput name="month" label="Month" type="month" onChange={(e) => setMonth(e.target.value)} error={errors.month} errorOnBaseline={false} />
                    </div>
                    <div className={clsx("flex gap-x-3", searchBy === "dates" ? "block" : "hidden")}>
                        <StaticLabelInput label="From" name="fromDate" type="date" value={dateSearch.fromDate} onChange={updateDateSearch} error={errors.from} errorOnBaseline={false} />
                        <StaticLabelInput label="To" name="toDate" type="date" value={dateSearch.toDate} onChange={updateDateSearch} error={errors.to} errorOnBaseline={false} />
                    </div>
                    <div className="px-3 w-full">
                        <Button className="w-full" disabled={state === "loading"}>{state === "loading" ? "Loading..." : "Search"}</Button>
                    </div>

                </form>
                <div className="w-full">
                    {events.length === 0 &&
                        <div className="text-center text-xl font-semibold">
                            {state === "loading" && "Fetching Events..."}
                            {state === "error" && "Unable to fetch events."}
                            {state === "success" && "No Events Found."}
                        </div>}
                    {events.map((event: Event) => (<ViewClientEventItem event={event} key={event.id} />))}
                </div>
            </PageCard>
            {toastInfo.showToast && <Toast type={toastInfo.toastType} >{toastInfo.toastMessage}</Toast>}
        </div>
    );
}


export default ViewClientEventsListPage;