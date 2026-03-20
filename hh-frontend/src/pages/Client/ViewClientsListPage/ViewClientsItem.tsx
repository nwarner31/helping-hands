import {Client} from "../../../models/Client";
import {formatDate} from "../../../utility/formatting";
import clsx from "clsx";
import LinkButton from "../../../components/Buttons/LinkButton/LinkButton";


const ViewClientsItem = ({client, isOddRow}: {client: Client, isOddRow: boolean}) => {

    return(
            <div
                className={clsx(
                    "items-center gap-2 p-2 font-body grid grid-rows-2",
                     "grid-cols-[auto_1fr_1fr] md:grid-cols-[auto_1fr_1fr_1fr]",
                )}
                data-testid="view-clients-item"
            >
                {/* ID Button: spans both rows */}
                <LinkButton to={`/view-client/${client.id}`} state={{client: client}} className="row-span-2" variant={isOddRow ? "accent": "secondary"}>
                    {client.id}
                </LinkButton>
                <div className={clsx("font-semibold")}>Legal Name</div>
                <div className={clsx("font-semibold")}>Date of Birth</div>
                <div className="font-semibold hidden md:block" >Nickname</div>
                {/* Legal Name */}
                <div className="font-medium truncate sm:flex-1"> {client.legalName}</div>
                {/* Date of Birth */}
                <div className="text-sm"> {formatDate(client.dateOfBirth)}</div>
                {/* Nickname */}
                    <div className="hidden md:block text-sm">
                        {client.name ? client.name : "None"}
                    </div>

            </div>

    );
}

export default ViewClientsItem;