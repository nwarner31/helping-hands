import {useAuth} from "../../../context/AuthContext";
import {Client} from "../../../models/Client";
import ViewClientsItem from "./ViewClientsItem";
import PageCard from "../../../components/Cards/PageCard/PageCard";
import List from "../../../components/List/List";
import ListItem from "../../../components/List/ListItem";
import LinkButton from "../../../components/Buttons/LinkButton/LinkButton";
import {useEffect} from "react";
import {useGet} from "../../../hooks/getHook/get.hook";


const ViewClientsListPage = () => {
    const {employee} = useAuth();
    const {data: clients, get} = useGet<Client[]>("client", []);
    useEffect(() => {
        get();
    }, []);

    return (
        <div className="flex justify-center items-center bg-slate-100 min-h-screen">
            <PageCard size="md-lg" title="Clients" className="py-4" >
                <div >
                    <div className="flex mx-4 gap-x-2 mb-3">
                        {employee?.position === "ADMIN" && <LinkButton to="/add-client" className=" grow basis-0">Add Client</LinkButton>}
                        <LinkButton to="/dashboard" variant="secondary" className="font-header font-bold grow basis-0">Back to Dashboard</LinkButton>
                    </div>
                    <List inset="medium">
                        {clients.map((client, index) => (
                            <ListItem id={client.id} key={client.id}>
                                <ViewClientsItem client={client} isOddRow={index % 2 === 0} />
                            </ListItem> ))}
                    </List>
                    {clients.length === 0 && <div>Loading...</div>}

                </div>
            </PageCard>
        </div>
    );
}

export default ViewClientsListPage;

