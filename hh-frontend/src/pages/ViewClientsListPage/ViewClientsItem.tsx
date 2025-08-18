import {Client} from "../../models/Client";
import Button from "../../components/Button/Button";
import {Link} from "react-router-dom";
import {formatDate} from "../../utility/formatting";
import clsx from "clsx";


const ViewClientsItem = ({client, isAdmin, isOddRow}: {client: Client, isAdmin: boolean, isOddRow: boolean}) => {

    return(
            <div
                className={clsx(
                    "items-center gap-2 p-2 font-body grid grid-rows-2",

                    isAdmin ? "grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_1fr_auto] md:grid-cols-[auto_1fr_1fr_1fr_auto] sm:grid-cols" : "grid-cols-[auto_1fr_1fr] md:grid-cols-[auto_1fr_1fr_1fr]",
                    isOddRow && "bg-primary text-white"
                )}
                data-testid="view-clients-item"
            >
                {/* ID Button: spans both rows */}
                <Link to={`/view-client/${client.id}`} state={{client: client}} className="row-span-2" ><Button variant={isOddRow ? "accent": "secondary"}>
                    {client.id}
                </Button></Link>
                <div className={clsx("font-semibold", isAdmin && "hidden sm:block")}>Legal Name</div>
                <div className={clsx("font-semibold", isAdmin && "hidden sm:block")}>Date of Birth</div>
                <div className="font-semibold hidden md:block" >Nickname</div>
                {/* Legal Name */}
                <div className="font-medium truncate sm:flex-1"><span className={clsx(isAdmin ? "sm:hidden font-semibold": "hidden")}>Legal name:</span> {client.legalName}</div>

                {/* Edit button: only for admins */}
                {isAdmin && (
                    <Button className="row-span-2 row-start-1 col-3 sm:col-4 md:col-5 sm:col-end-last" variant={isOddRow ? "accent": "secondary"}>
                        Edit
                    </Button>
                )}

                {/* Date of Birth */}
                <div className="text-sm"><span className={clsx(isAdmin ? "sm:hidden font-semibold": "hidden")}>Date of Birth:</span> {formatDate(client.dateOfBirth)}</div>

                {/* Nickname */}
                    <div className="hidden md:block text-sm">
                        {client.name ? client.name : "None"}
                    </div>

            </div>

    );
}

export default ViewClientsItem;