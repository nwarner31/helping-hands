import PageCard from "../../../components/Cards/PageCard/PageCard";
import {useCallback, useEffect, useState} from "react";
import {useDebounce} from "../../../hooks/dounceHook/debounce.hook";
import apiService from "../../../utility/ApiService";
import {Employee} from "../../../models/Employee";
import {useQuery} from "@tanstack/react-query";
import List from "../../../components/List/List";
import ListItem from "../../../components/List/ListItem";
import LoadingText from "../../../components/TextAreas/LoadingText/LoadingText";
import Input from "../../../components/Inputs/Input/Input";
import Select from "../../../components/Inputs/Select/Select";
import LinkButton from "../../../components/Buttons/LinkButton/LinkButton";
import PaginationButtons from "../../../components/Buttons/PaginationButtons/PaginationButtons";
import ViewEmployeesItem from "./ViewEmployeesItem";


const ViewEmployeesListPage = () => {
    const pageSize = 8;
    const sexes = [{label: "Both", value: "Both"}, {label: "Male", value: "M"}, {label: "Female", value: "F"}];
    const [sexFilter, setSexFilter] = useState<"Both"|"Male"|"Female">("Both");
    const positions = [{label: "All", value: "ALL"}, {label: "Associate", value: "ASSOCIATE"}, {label: "Manager", value: "MANAGER"}, {label: "Director", value: "DIRECTOR"}, {label: "Admin", value: "ADMIN"}];
    const [positionFilter, setPositionFilter] = useState<"ALL"|"ASSOCIATE"|"MANAGER"|"DIRECTOR"|"ADMIN">("ALL");
    const [nameText, setNameText] = useState("");
    const nameFilter = useDebounce(nameText, 500);
    const [page, setPage] = useState(0);
    const [numPages, setNumPages] = useState(1);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [paginatedEmployees, setPaginatedEmployees] = useState<Employee[]>([]);
    const getEmployees = useCallback(async () => {
        const res = await apiService.get<{data: Employee[]}>(`employee`);
        return res.data;
    }, []);
    const {data: employees = [], isLoading} = useQuery({
        queryKey: ["employees"],
        queryFn: getEmployees,
        staleTime: 5 * 60 * 1000,
    });
    const updateNameText = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNameText(e.target.value);
    }
    const updateSex = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSexFilter(e.target.value as any)
    }
    const updatePosition = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPositionFilter(e.target.value as any)
    }
    const changePage = (pageNumber: number) => {
        setPage(pageNumber);
    }

    useEffect(() => {
        if(employees.length > 0) {
            setFilteredEmployees(employees);
        }
    }, [employees]);
    useEffect(() => {
        if(employees.length > 0) {
            const filtered = employees.filter(employee => {
                return (employee.name.toLowerCase().includes(nameFilter.toLowerCase()) && (sexFilter === "Both" || employee.sex === sexFilter) && (positionFilter === "ALL" || employee.position === positionFilter));
            });
            setFilteredEmployees(filtered);
        }
    }, [nameFilter, sexFilter, positionFilter]);
    useEffect(() => {
            setPage(1);
            setNumPages(Math.ceil(filteredEmployees.length / pageSize));
            setPaginatedEmployees(filteredEmployees.slice(0, pageSize));
    }, [filteredEmployees]);
    useEffect(() => {
        setPaginatedEmployees(filteredEmployees.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize));
    }, [page]);
    return (
        <div className="flex justify-center items-center bg-slate-100 min-h-screen">
            <PageCard title="Employees" className="py-4 flex flex-col max-h-screen" size={"lg"}>
                <div className="mx-3 mb-4">
                    <LinkButton to="/dashboard" variant="secondary">Dashboard</LinkButton>
                </div>
                <div className="flex gap-x-2 mb-5 justify-center items-end">
                    <Input label="Search Name" name="nameFilter" value={nameText} onChange={updateNameText} containerClassName="shrink-1" />
                    <Select name="sexFilter" label="Sex" options={sexes} value={sexFilter} onChange={updateSex} className="!px-0 xs:!px-2" />
                    <Select name="positionFilter" label="Position" options={positions} value={positionFilter} onChange={updatePosition} className="!px-0 xs:!px-2" />
                </div>
                {paginatedEmployees.length > 0 &&
                <div>
                    <List borderVariant="secondary" inset="small" >
                        {paginatedEmployees.map(employee =>
                            (<ListItem id={employee.id} key={employee.id}>
                                <ViewEmployeesItem employee={employee} />
                            </ListItem>))}
                    </List>
                </div>
                }
                {numPages > 1 && <PaginationButtons page={page} numPages={numPages} onPageChange={changePage} />}
                {isLoading &&
                    <div className="grow overflow-y-auto">
                    <List borderVariant="secondary" inset="small" >
                        {[1,2,3,4,5,6].map(n =>
                        <ListItem id={`loading-${n}`} key={`loading-${n}`}>
                            <LoadingText className="h-15 m-2" bgColorType="primary" />
                        </ListItem>)}
                    </List>
                    </div>
                    }
            </PageCard>
        </div>
    );
}

export default ViewEmployeesListPage