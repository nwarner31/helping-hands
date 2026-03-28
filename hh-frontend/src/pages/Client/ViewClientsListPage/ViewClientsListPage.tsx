import {useAuth} from "../../../context/AuthContext";
import {Client} from "../../../models/Client";
import ViewClientsItem from "./ViewClientsItem";
import PageCard from "../../../components/Cards/PageCard/PageCard";
import List from "../../../components/List/List";
import ListItem from "../../../components/List/ListItem";
import LinkButton from "../../../components/Buttons/LinkButton/LinkButton";
import {useCallback, useEffect, useState} from "react";
import apiService from "../../../utility/ApiService";
import {useQuery} from "@tanstack/react-query";
import LoadingText from "../../../components/TextAreas/LoadingText/LoadingText";
import {useDebounce} from "../../../hooks/dounceHook/debounce.hook";
import Input from "../../../components/Inputs/Input/Input";
import Select from "../../../components/Inputs/Select/Select";
import PaginationButtons from "../../../components/Buttons/PaginationButtons/PaginationButtons";


const ViewClientsListPage = () => {
    const pageSize = 10;
    const sexes = [{label: "Both", value: "Both"}, {label: "Male", value: "M"}, {label: "Female", value: "F"}];
    const [sexFilter, setSexFilter] = useState<"Both"|"Male"|"Female">("Both");
    const [nameText, setNameText] = useState("");
    const nameFilter = useDebounce(nameText, 500);
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const [paginatedClients, setPaginatedClients] = useState<Client[]>([]);
    const [page, setPage] = useState(0);
    const [numPages, setNumPages] = useState(1);
    const {employee} = useAuth();

    useEffect(() => {
        if(clients.length > 0) {
            const filtered = clients.filter(client => {
                return (client.legalName.toLowerCase().includes(nameFilter.toLowerCase()) && (sexFilter === "Both" || client.sex === sexFilter));
        });
            setFilteredClients(filtered);
        }
    }, [nameFilter, sexFilter]);
    const getClients = useCallback(async () => {
        const res = await apiService.get<{data: Client[]}>(`client`);
        return res.data;
    }, []);
    const {data: clients = [], isLoading} = useQuery<Client[]>({
        queryKey: ["clients"],
        queryFn: getClients,
        staleTime: 5 * 60 * 1000
    });
    useEffect(() => {
        if(clients.length > 0) {
            setFilteredClients(clients);
        }
    }, [clients]);
    useEffect(() => {
        setPaginatedClients(filteredClients.slice(0, pageSize));
        setPage(1);
        setNumPages(Math.ceil(filteredClients.length / pageSize));
    }, [filteredClients]);
    useEffect(() => {
        setPaginatedClients(filteredClients.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize));
    }, [page]);
    const updateNameText = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNameText(e.target.value);
    }
    const updateSex = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSexFilter(e.target.value as any)
    }
    const changePage = (newPage: number) => {
        setPage(newPage);
    }


    return (
        <div className="flex justify-center items-center bg-slate-100 min-h-screen">
            <PageCard size="lg" title="Clients" className="py-4 flex flex-col max-h-screen" >

                    <div className="flex mx-4 gap-x-2 mb-3">
                        {employee?.position === "ADMIN" && <LinkButton to="/add-client" className=" grow basis-0">Add Client</LinkButton>}
                        <LinkButton to="/dashboard" variant="secondary" className="font-header font-bold grow basis-0">Dashboard</LinkButton>
                    </div>
                    <div className="flex gap-x-4 mb-5 justify-center items-end">
                        <Input label="Search Name" name="nameFilter" value={nameText} onChange={updateNameText} />
                        <Select name="sexFilter" label="Sex" options={sexes} value={sexFilter} onChange={updateSex} />
                    </div>
                    {paginatedClients.length > 0 &&
                    <div className="grow overflow-y-auto">
                         <List inset="small" borderVariant="secondary">
                            {paginatedClients.map((client) => (
                                <ListItem id={client.id} key={client.id}>
                                    <ViewClientsItem client={client} />
                                </ListItem> ))}
                        </List>
                    </div>}
                    {numPages > 1 && <PaginationButtons page={page} numPages={numPages} onPageChange={changePage} />}
                    {isLoading &&
                        <div className="grow overflow-y-auto">
                        <List inset="small" borderVariant="secondary">
                            {[1,2,3,4,5,6].map(num => (
                            <ListItem id={`loading-${num}`} key={num}>
                                <LoadingText className="h-16 m-2" bgColorType="primary"  />
                            </ListItem>))}

                        </List></div>}


            </PageCard>
        </div>
    );
}

export default ViewClientsListPage;

