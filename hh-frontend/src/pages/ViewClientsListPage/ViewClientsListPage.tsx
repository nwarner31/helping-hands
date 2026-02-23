import {useAuth} from "../../context/AuthContext";
import {Link, useLoaderData} from "react-router-dom";
import Button from "../../components/Buttons/Button/Button";
import apiService from "../../utility/ApiService";
import {Client} from "../../models/Client";
import ViewClientsItem from "./ViewClientsItem";
import PageCard from "../../components/Cards/PageCard/PageCard";


const ViewClientsListPage = () => {
    const {employee} = useAuth();
    const {clients} = useLoaderData() as {clients: Client[], message: string};

    return (
        <div className="flex justify-center items-center bg-slate-100 min-h-screen">
            <PageCard size="md-lg" title="Clients" className="py-4" >
                <div >
                    <div>
                        {employee?.position === "ADMIN" && <Link to="/add-client" ><Button className="w-full mb-3 font-header font-semibold xs:w-[95%] xs:mx-[2.5%]">Add Client</Button></Link>}
                    </div>
                            {clients.map((client, index) => (<ViewClientsItem key={client.id} client={client} isAdmin={employee?.position === "ADMIN"} isOddRow={index % 2 === 0} /> ))}
                </div>
            </PageCard>
        </div>
    );
}

export default ViewClientsListPage;

export const loader = async () => apiService.get("client");