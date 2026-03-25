import React, {useState, useMemo } from "react";
import {Client} from "../../../models/Client";
import Button from "../../../components/Buttons/Button/Button";
import {formatDate} from "../../../utility/formatting";
import {useNavigate} from "react-router-dom";
import List from "../../../components/List/List";
import ListItem from "../../../components/List/ListItem";
import {clsx} from "clsx";
import {z} from "zod";
import {toast} from "react-toastify";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import apiService from "../../../utility/ApiService";
import {House} from "../../../models/House";

type Props = {
    clients: Client[];
    houseId: string;
};

const AddClientSearchList: React.FC<Props> = ({ clients, houseId }) => {
    const [search, setSearch] = useState("");
    const [sexFilter, setSexFilter] = useState<"Both" | "Male" | "Female">("Both");
    const navigate = useNavigate();
    const filteredClients = useMemo(() => {
        return clients.filter(client => {
            const matchesSearch = client.legalName.toLowerCase().includes(search.toLowerCase());
            const matchesSex = sexFilter === "Both" || client.sex === sexFilter;
            return matchesSearch && matchesSex;
        });
    }, [clients, search, sexFilter]);

    const queryClient = useQueryClient();
    const handleAddClick = (clientId: string) => {
        const result = z.object({clientId: z.string()}).safeParse({clientId});
        if(result.success) {
            addHandler(clientId);
        }
    }
    const addClient = async (clientId: string) => {
        const res = await apiService.patch<{data: House}>(`house/${houseId}/clients`, {clientId});
        return res.data;
    }
    const {mutate: addHandler} = useMutation<House, Error, string>({
        mutationFn: addClient,
        onSuccess: (updatedHouse, variable) => {
            // istanbul ignore next
            queryClient.setQueryData(["clients", "no-house"], (prev: Client[] | undefined) =>
            prev ? prev.filter(client => client.id !== variable) : prev);
            // istanbul ignore next
            queryClient.setQueryData(["houses"], (prev: House[] | undefined) =>
                prev ? prev.map(house => (house.id === updatedHouse.id ? {...updatedHouse} : house)): []);
            queryClient.setQueryData(["house", updatedHouse.id], updatedHouse);
            toast.success("Client added to house successfully", {autoClose: 1500, position: "top-right"});
            navigate("/view-houses");
        }
    })
    const gridCols = "grid items-center grid-cols-[2fr_3fr_1fr_1fr] sm:grid-cols-[2fr_3fr_2fr_1fr_2fr]";
    const gridCells = "text-center font-body";
    return (
        <div style={{ padding: "3px" }}>
            <div style={{ marginBottom: "1rem", gap: "1rem", display: "flex", justifyContent: "center" }}>
                <input
                    className="border-b"
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select value={sexFilter} onChange={e => setSexFilter(e.target.value as any)}>
                    <option value="Both">Both</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                </select>
            </div>

            <div className={clsx("border-b-1 border-secondary font-semibold mt-5", gridCols)}>
                <div className={gridCells}>Client ID</div>
                <div className={gridCells}>Legal Name</div>
                <div className={clsx("hidden sm:block", gridCells)}>Date of Birth</div>
                <div className={gridCells}>Sex</div>
                <div></div>
            </div>
            <List inset="small" borderVariant="secondary">
                {filteredClients.map((client, index) => (
                    <ListItem id={client.id} key={client.id}>
                        <div className={clsx("py-1", gridCols)}>
                            <div className={gridCells}>{client.id}</div>
                            <div className={gridCells}>{client.legalName}</div>
                            <div className={clsx("hidden sm:block", gridCells)}>{formatDate(client.dateOfBirth)}</div>
                            <div className={gridCells}>{client.sex}</div>
                            <Button variant={index % 2 === 0 ? "primary" : "accent"} onClick={() => handleAddClick(client.id)}><div className="hidden sm:block">Add</div><div className="sm:hidden">+</div></Button>
                        </div>
                    </ListItem>
                ))}
            </List>
                {filteredClients.length === 0 && (
                    <div className="text-center font-semibold mt-3 text-xl">
                        No clients found.
                    </div>
                )}

        </div>
    );
};

export default AddClientSearchList;