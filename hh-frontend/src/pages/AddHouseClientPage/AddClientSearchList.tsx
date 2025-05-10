import React, {useState, useMemo, useEffect} from "react";
import {Client} from "../../models/Client";
import Button from "../../components/Button/Button";
import styles from "./AddClientSearchList.module.css";
import {formatDate} from "../../utility/formatting";
import apiService from "../../utility/ApiService";
import {House} from "../../models/House";
import Toast from "../../components/Toast/Toast";
import {useNavigate} from "react-router-dom";


type Props = {
    clients: Client[];
    houseId: string;
};

const AddClientSearchList: React.FC<Props> = ({ clients, houseId }) => {
    const [search, setSearch] = useState("");
    const [sexFilter, setSexFilter] = useState<"Both" | "Male" | "Female">("Both");
    const [toastInfo, setToastInfo] = useState<{showToast: boolean, toastType: "info"|"success"|"error", toastMessage: string}>({showToast: false,toastType: "info", toastMessage: ""});
    const navigate = useNavigate();
    const filteredClients = useMemo(() => {
        return clients.filter(client => {
            const matchesSearch = client.legalName.toLowerCase().includes(search.toLowerCase());
            const matchesSex = sexFilter === "Both" || client.sex === sexFilter;
            return matchesSearch && matchesSex;
        });
    }, [clients, search, sexFilter]);
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 420px)');

        const handleChange = (e: MediaQueryListEvent) => {
            setIsMobile(e.matches);
        };

        // Set initial state
        setIsMobile(mediaQuery.matches);

        // Add event listener
        mediaQuery.addEventListener('change', handleChange);

        // Clean up
        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    const addClientHandler = async (clientId: string) => {
        const response = await apiService.patch<{message: string, house?: House}>(`house/${houseId}/clients`, {clientId: clientId});
        if(response.message === "client added to house" && response.house) {
            setToastInfo({showToast: true, toastType: "success", toastMessage: "Client added to house successfully"});
            setTimeout(() => {navigate("/view-houses")}, 1500);
        }
    }
    return (
        <div style={{ padding: "3px" }}>
            <div style={{ marginBottom: "1rem", gap: "1rem", display: "flex", justifyContent: "center" }}>
                <input
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

            <table className={styles.table}>
                <thead>
                <tr>
                    <th style={{ borderBottom: "1px solid #ccc" }}>Client ID</th>
                    <th style={{ borderBottom: "1px solid #ccc" }}>Legal Name</th>
                    <th style={{ borderBottom: "1px solid #ccc" }}>Date of Birth</th>
                    <th style={{ borderBottom: "1px solid #ccc" }}>Sex</th>
                    <th style={{ borderBottom: "1px solid #ccc" }}></th>
                </tr>
                </thead>
                <tbody>
                {filteredClients.map(client => (
                    <tr key={client.clientId}>
                        <td>{client.clientId}</td>
                        <td>{client.legalName}</td>
                        <td>{formatDate(client.dateOfBirth)}</td>
                        <td>{client.sex}</td>
                        <td>
                            <Button onClick={() => addClientHandler(client.clientId)}>{isMobile ? "+" : "Add"}</Button>
                        </td>
                    </tr>
                ))}
                {filteredClients.length === 0 && (
                    <tr>
                        <td colSpan={5} style={{ textAlign: "center", padding: "1rem" }}>
                            No clients found.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
            {toastInfo.showToast && <Toast type={toastInfo.toastType} >{toastInfo.toastMessage}</Toast>}

        </div>
    );
};

export default AddClientSearchList;
